import { now, sub } from '@arki/date';
import { getLogger } from '@arki/log';
import { observePayments } from '../telemetry.js';
const logger = getLogger('arki:payments:monitor');
/** Metrics older than this are dropped from memory. */
const METRIC_RETENTION_MS = 60 * 60 * 1000;
/** How many past hours the payment volume of the last hour is compared with. */
const VOLUME_HISTORY_HOURS = 24;
/**
 * Counts payment, webhook, subscription and refund outcomes in memory (the last hour) and in KV,
 * and raises an alert when a rate crosses its threshold. It starts no timer: old metrics are
 * dropped when a new one is recorded, so a monitor built per request leaves nothing running.
 */
export class PaymentMonitoringService {
    kv;
    reads;
    alertingService;
    metrics = new Map();
    alertThresholds = new Map();
    constructor(kv, reads, alertingService) {
        this.kv = kv;
        this.reads = reads;
        this.alertingService = alertingService;
        this.initializeThresholds();
    }
    initializeThresholds() {
        this.alertThresholds.set('payment_failure_rate', {
            warning: 0.05, // 5% failure rate
            critical: 0.1, // 10% failure rate
            window: 5 * 60 * 1000, // 5-minute window
        });
        this.alertThresholds.set('webhook_processing_time', {
            warning: 2000, // 2 seconds
            critical: 5000, // 5 seconds
            window: 60 * 1000, // 1-minute window
        });
        this.alertThresholds.set('subscription_churn_rate', {
            warning: 0.15, // 15% monthly churn
            critical: 0.25, // 25% monthly churn
            window: 24 * 60 * 60 * 1000, // Daily check
        });
        this.alertThresholds.set('refund_rate', {
            warning: 0.1, // 10% refund rate
            critical: 0.2, // 20% refund rate
            window: 24 * 60 * 60 * 1000, // Daily window
        });
    }
    async recordPaymentAttempt(result) {
        // Record success/failure metrics
        await this.recordMetric('payment_attempts_total', 1, { status: result.status });
        await this.recordMetric('payment_processing_time', result.processingTime);
        if (!result.success) {
            await this.recordMetric('payment_failures_total', 1, {
                reason: result.errorCode ?? 'unknown',
                provider: result.provider ?? 'unknown',
            });
            // Check failure rate
            await this.checkFailureRate();
        }
        // Record revenue metrics
        // A metric is a float gauge per currency: the one place an amount is meant to become a number
        if (result.success && result.amount) {
            await this.recordMetric('revenue_processed', result.amount.toNumber(), {
                currency: result.amount.currency.code,
                provider: result.provider ?? 'unknown',
            });
        }
    }
    async recordWebhookProcessing(duration, success) {
        await this.recordMetric('webhook_processing_time', duration);
        await this.recordMetric('webhook_attempts_total', 1, {
            status: success ? 'success' : 'failure',
        });
        const threshold = this.alertThresholds.get('webhook_processing_time');
        if (threshold && duration > threshold.warning) {
            await this.checkWebhookPerformance();
        }
    }
    async recordSubscriptionEvent(event) {
        await this.recordMetric(`subscription_${event}_total`, 1);
        if (event === 'canceled') {
            await this.checkChurnRate();
        }
    }
    async recordRefund(amount, reason) {
        await this.recordMetric('refunds_total', 1, { reason });
        await this.recordMetric('refund_amount_total', amount.toNumber(), { currency: amount.currency.code });
        await this.checkRefundRate();
    }
    async recordMetric(name, value, labels) {
        const metric = {
            value,
            timestamp: Date.now(),
            labels,
        };
        // Store in memory, dropping what is older than the retention window
        this.cleanupOldMetrics();
        const values = this.metrics.get(name) ?? [];
        values.push(metric);
        this.metrics.set(name, values);
        // Also store in KV for persistence. A refused write keeps the in-memory metric: the
        // rates still work, only the persisted copy is missing, so it is a WARN and not a failure.
        const key = `metrics:${name}:${Date.now()}`;
        const stored = await this.kv.set(key, metric, 3600); // TTL 1 hour
        if (!stored) {
            logger.warn('Metric {name} was not stored in KV; it is kept in memory only', { name });
        }
    }
    async getMetricValues(name, since) {
        const values = this.metrics.get(name) || [];
        return values.filter(v => v.timestamp >= since);
    }
    async checkFailureRate() {
        const window = 5 * 60 * 1000; // 5 minutes
        const nowMs = Date.now();
        const cutoff = nowMs - window;
        // Get recent payment attempts
        const attempts = await this.getMetricValues('payment_attempts_total', cutoff);
        const failures = await this.getMetricValues('payment_failures_total', cutoff);
        const totalAttempts = attempts.reduce((sum, m) => sum + m.value, 0);
        const totalFailures = failures.reduce((sum, m) => sum + m.value, 0);
        if (totalAttempts > 10) {
            // Minimum sample size
            const failureRate = totalFailures / totalAttempts;
            const threshold = this.alertThresholds.get('payment_failure_rate');
            if (failureRate >= threshold.critical) {
                await this.triggerAlert('payment_failure_rate', 'critical', {
                    current: failureRate,
                    threshold: threshold.critical,
                    window: '5 minutes',
                    totalAttempts,
                    totalFailures,
                });
            }
            else if (failureRate >= threshold.warning) {
                await this.triggerAlert('payment_failure_rate', 'warning', {
                    current: failureRate,
                    threshold: threshold.warning,
                    window: '5 minutes',
                    totalAttempts,
                    totalFailures,
                });
            }
        }
    }
    async checkWebhookPerformance() {
        const window = 60 * 1000; // 1 minute
        const cutoff = Date.now() - window;
        const processingTimes = await this.getMetricValues('webhook_processing_time', cutoff);
        if (processingTimes.length === 0)
            return;
        const avgTime = processingTimes.reduce((sum, m) => sum + m.value, 0) / processingTimes.length;
        const threshold = this.alertThresholds.get('webhook_processing_time');
        if (avgTime >= threshold.critical) {
            await this.triggerAlert('webhook_processing_time', 'critical', {
                avgTime,
                threshold: threshold.critical,
                sampleSize: processingTimes.length,
            });
        }
        else if (avgTime >= threshold.warning) {
            await this.triggerAlert('webhook_processing_time', 'warning', {
                avgTime,
                threshold: threshold.warning,
                sampleSize: processingTimes.length,
            });
        }
    }
    async checkChurnRate() {
        const window = 24 * 60 * 60 * 1000; // 24 hours
        const cutoff = Date.now() - window;
        const created = await this.getMetricValues('subscription_created_total', cutoff);
        const canceled = await this.getMetricValues('subscription_canceled_total', cutoff);
        const totalCreated = created.reduce((sum, m) => sum + m.value, 0);
        const totalCanceled = canceled.reduce((sum, m) => sum + m.value, 0);
        const netActive = totalCreated - totalCanceled;
        if (netActive > 0) {
            const churnRate = totalCanceled / netActive;
            const threshold = this.alertThresholds.get('subscription_churn_rate');
            if (churnRate >= threshold.critical) {
                await this.triggerAlert('subscription_churn_rate', 'critical', {
                    churnRate,
                    threshold: threshold.critical,
                    totalCanceled,
                    netActive,
                });
            }
            else if (churnRate >= threshold.warning) {
                await this.triggerAlert('subscription_churn_rate', 'warning', {
                    churnRate,
                    threshold: threshold.warning,
                    totalCanceled,
                    netActive,
                });
            }
        }
    }
    async checkRefundRate() {
        const window = 24 * 60 * 60 * 1000; // 24 hours
        const cutoff = Date.now() - window;
        const payments = await this.getMetricValues('payment_attempts_total', cutoff);
        const refunds = await this.getMetricValues('refunds_total', cutoff);
        const successfulPayments = payments.filter(p => p.labels?.status === 'success');
        const totalPayments = successfulPayments.reduce((sum, m) => sum + m.value, 0);
        const totalRefunds = refunds.reduce((sum, m) => sum + m.value, 0);
        if (totalPayments > 10) {
            const refundRate = totalRefunds / totalPayments;
            const threshold = this.alertThresholds.get('refund_rate');
            if (refundRate >= threshold.critical) {
                await this.triggerAlert('refund_rate', 'critical', {
                    refundRate,
                    threshold: threshold.critical,
                    totalRefunds,
                    totalPayments,
                });
            }
            else if (refundRate >= threshold.warning) {
                await this.triggerAlert('refund_rate', 'warning', {
                    refundRate,
                    threshold: threshold.warning,
                    totalRefunds,
                    totalPayments,
                });
            }
        }
    }
    async detectAnomalies() {
        const anomalies = [];
        const nowMs = Date.now();
        const oneHour = 60 * 60 * 1000;
        // Detect unusual payment volumes: the payments stored in the last hour against the hourly average
        // of the hours before. With no history there is nothing to compare with.
        const current = now();
        const hourAgo = sub(current, { hours: 1 });
        const [currentHourVolume, historyVolume] = await Promise.all([
            this.reads.countPaymentsCreatedBetween(hourAgo, current),
            this.reads.countPaymentsCreatedBetween(sub(hourAgo, { hours: VOLUME_HISTORY_HOURS }), hourAgo),
        ]);
        const historicalAverage = historyVolume / VOLUME_HISTORY_HOURS;
        if (historicalAverage > 0 && currentHourVolume > historicalAverage * 3) {
            anomalies.push({
                type: 'unusual_volume',
                severity: 'warning',
                description: `Payment volume ${currentHourVolume} is 3x higher than average ${historicalAverage}`,
                detectedAt: now(),
                metadata: { current: currentHourVolume, average: historicalAverage },
            });
        }
        // Detect sudden spike in failed payments
        const recentFailures = await this.getMetricValues('payment_failures_total', nowMs - oneHour);
        const failureSpike = recentFailures.length > 20;
        if (failureSpike) {
            anomalies.push({
                type: 'failure_spike',
                severity: 'critical',
                description: `Sudden spike in payment failures: ${recentFailures.length} in last hour`,
                detectedAt: now(),
                metadata: { failureCount: recentFailures.length },
            });
        }
        return anomalies;
    }
    async getSystemHealth() {
        const nowMs = Date.now();
        const oneHour = 60 * 60 * 1000;
        const [paymentSuccessRate, webhookSuccessRate, avgPaymentProcessingTime, avgWebhookProcessingTime] = await Promise.all([
            this.calculateSuccessRate('payment_attempts_total', nowMs - oneHour, nowMs),
            this.calculateSuccessRate('webhook_attempts_total', nowMs - oneHour, nowMs),
            this.getAverageMetric('payment_processing_time', nowMs - oneHour, nowMs),
            this.getAverageMetric('webhook_processing_time', nowMs - oneHour, nowMs),
        ]);
        // Calculate overall health score (0-1)
        const overall = this.calculateOverallHealth([
            paymentSuccessRate,
            webhookSuccessRate >= 0.95 ? 1 : webhookSuccessRate,
            avgWebhookProcessingTime < 2000 ? 1 : 0.5,
            avgPaymentProcessingTime < 3000 ? 1 : 0.5,
        ]);
        return {
            overall,
            payments: {
                successRate: paymentSuccessRate,
                avgProcessingTime: avgPaymentProcessingTime,
                activeSubscriptions: await this.reads.getActiveSubscriptionCount(),
            },
            webhooks: {
                avgProcessingTime: avgWebhookProcessingTime,
                successRate: webhookSuccessRate,
            },
            lastUpdated: now(),
        };
    }
    async triggerAlert(metricName, severity, data) {
        const alert = {
            id: crypto.randomUUID(),
            metricName,
            severity,
            message: `Payment system alert: ${metricName} ${severity}`,
            data,
            triggeredAt: now(),
            status: 'active',
        };
        // Store alert. A refused write still sends and logs the alert: losing the stored copy must not hide it.
        const stored = await this.kv.set(`alert:${alert.id}`, alert, 86_400); // 24 hour TTL
        if (!stored) {
            logger.warn('Alert {alertId} ({metricName}) was not stored in KV', { alertId: alert.id, metricName });
        }
        // Send notifications based on severity
        const alertingService = this.alertingService;
        if (alertingService) {
            await observePayments('alert', { 'payments.alert': metricName, 'payments.severity': severity }, () => severity === 'critical' ? alertingService.sendCriticalAlert(alert) : alertingService.sendWarningAlert(alert));
        }
        // Log alert
        const line = 'Payment alert {severity}: {metricName}';
        if (severity === 'critical') {
            logger.error(line, { severity, metricName, data });
        }
        else {
            logger.warn(line, { severity, metricName, data });
        }
    }
    async calculateSuccessRate(metric, start, _end) {
        const values = await this.getMetricValues(metric, start);
        const successful = values.filter(v => v.labels?.status === 'success');
        const total = values.length;
        return total > 0 ? successful.length / total : 0;
    }
    async getAverageMetric(metric, start, _end) {
        const values = await this.getMetricValues(metric, start);
        if (values.length === 0)
            return 0;
        return values.reduce((sum, v) => sum + v.value, 0) / values.length;
    }
    calculateOverallHealth(factors) {
        return factors.reduce((sum, f) => sum + f, 0) / factors.length;
    }
    cleanupOldMetrics() {
        const cutoff = Date.now() - METRIC_RETENTION_MS;
        for (const [name, values] of this.metrics) {
            const filtered = values.filter(v => v.timestamp >= cutoff);
            this.metrics.set(name, filtered);
        }
    }
}
// Factory function
export function createPaymentMonitoringService(kv, reads, alertingService) {
    return new PaymentMonitoringService(kv, reads, alertingService);
}
//# sourceMappingURL=payment-monitor.js.map