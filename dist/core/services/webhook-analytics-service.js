import { isSameOrAfter, isSameOrBefore, now, sub, toMillis } from '@arki/date';
export class WebhookAnalyticsService {
    paymentRepository;
    alertThresholds;
    alerts = new Map();
    processingTimes = [];
    constructor(paymentRepository, alertThresholds = {
        errorRate: 5, // Percentage
        slowProcessing: 5000, // Milliseconds
        maxAlerts: 100,
    }) {
        this.paymentRepository = paymentRepository;
        this.alertThresholds = alertThresholds;
    }
    /**
     * Get comprehensive webhook metrics
     */
    async getWebhookMetrics(startDate, endDate) {
        try {
            const events = await this.getWebhookEventsInRange(startDate, endDate);
            const totalEvents = events.length;
            const processedEvents = events.filter(e => e.processed).length;
            const failedEvents = events.filter(e => !e.processed && e.attempts > 0).length;
            const processingRate = totalEvents > 0 ? (processedEvents / totalEvents) * 100 : 100;
            // Calculate average processing time
            const processedEventsWithTime = events.filter(e => e.processed && e.processedAt && e.createdAt);
            const averageProcessingTime = processedEventsWithTime.length > 0
                ? processedEventsWithTime.reduce((sum, event) => {
                    const processingTime = toMillis(event.processedAt) - toMillis(event.createdAt);
                    return sum + processingTime;
                }, 0) / processedEventsWithTime.length
                : 0;
            // Group events by type
            const eventsByType = {};
            for (const event of events) {
                eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
            }
            // Group events by provider
            const eventsByProvider = {};
            for (const event of events) {
                eventsByProvider[event.provider] = (eventsByProvider[event.provider] || 0) + 1;
            }
            // Group errors by type
            const errorsByType = {};
            for (const event of events.filter(e => e.errorMessage)) {
                const errorType = this.categorizeError(event.errorMessage);
                errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
            }
            // Get recent errors (last 10)
            const recentErrors = events
                .filter(e => e.errorMessage)
                .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
                .slice(0, 10)
                .map(event => ({
                webhookId: event.id,
                eventType: event.eventType,
                provider: event.provider,
                error: event.errorMessage,
                timestamp: event.createdAt,
            }));
            return {
                totalEvents,
                processedEvents,
                failedEvents,
                processingRate: Math.round(processingRate * 100) / 100,
                averageProcessingTime: Math.round(averageProcessingTime),
                eventsByType,
                eventsByProvider,
                errorsByType,
                recentErrors,
            };
        }
        catch (error) {
            console.error('Error getting webhook metrics:', error);
            throw error;
        }
    }
    /**
     * Assess webhook system health
     */
    async getWebhookHealth(startDate) {
        const metrics = await this.getWebhookMetrics(startDate);
        const issues = [];
        const recommendations = [];
        let score = 100;
        // Check processing rate
        if (metrics.processingRate < 95) {
            const severity = metrics.processingRate < 80 ? 'high' : 'medium';
            issues.push({
                severity,
                type: 'low_processing_rate',
                message: `Processing rate is ${metrics.processingRate.toFixed(1)}%`,
            });
            score -= severity === 'high' ? 20 : 10;
            recommendations.push('Review failed webhook events and improve error handling');
        }
        // Check average processing time
        if (metrics.averageProcessingTime > 5000) {
            const severity = metrics.averageProcessingTime > 15_000 ? 'high' : 'medium';
            issues.push({
                severity,
                type: 'slow_processing',
                message: `Average processing time is ${(metrics.averageProcessingTime / 1000).toFixed(1)}s`,
            });
            score -= severity === 'high' ? 15 : 8;
            recommendations.push('Optimize webhook processing logic to reduce latency');
        }
        // Check for high error rates by type
        const totalErrors = Object.values(metrics.errorsByType).reduce((sum, count) => sum + count, 0);
        if (totalErrors > metrics.totalEvents * 0.05) { // More than 5% errors
            issues.push({
                severity: 'medium',
                type: 'high_error_rate',
                message: `High error rate: ${totalErrors} errors out of ${metrics.totalEvents} events`,
                count: totalErrors,
            });
            score -= 12;
            recommendations.push('Investigate common error patterns and improve webhook validation');
        }
        // Check for missing expected events (simplified heuristic)
        const expectedEventRatio = this.calculateExpectedEventRatio(metrics);
        if (expectedEventRatio < 0.8) {
            issues.push({
                severity: 'medium',
                type: 'missing_events',
                message: 'Some expected webhook events may be missing',
            });
            score -= 10;
            recommendations.push('Verify webhook endpoint configuration with payment providers');
        }
        // Determine overall status
        let status = 'healthy';
        if (score < 60) {
            status = 'critical';
        }
        else if (score < 80) {
            status = 'warning';
        }
        return {
            status,
            score: Math.max(0, score),
            issues,
            recommendations,
        };
    }
    /**
     * Get webhook performance metrics
     */
    async getWebhookPerformance(startDate, endDate) {
        const events = await this.getWebhookEventsInRange(startDate, endDate);
        // Calculate processing times for percentiles
        const processingTimes = events
            .filter(e => e.processed && e.processedAt && e.createdAt)
            .map(e => toMillis(e.processedAt) - toMillis(e.createdAt))
            .sort((a, b) => a - b);
        const averageProcessingTime = processingTimes.length > 0
            ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
            : 0;
        const p50ProcessingTime = this.calculatePercentile(processingTimes, 50);
        const p95ProcessingTime = this.calculatePercentile(processingTimes, 95);
        const p99ProcessingTime = this.calculatePercentile(processingTimes, 99);
        // Calculate throughput
        const timeRange = this.getTimeRangeHours(startDate, endDate);
        const throughput = {
            eventsPerMinute: timeRange > 0 ? (events.length / (timeRange * 60)) : 0,
            eventsPerHour: timeRange > 0 ? (events.length / timeRange) : 0,
            eventsPerDay: timeRange > 0 ? (events.length / timeRange) * 24 : 0,
        };
        // Calculate error and retry rates
        const failedEvents = events.filter(e => !e.processed && e.attempts > 0).length;
        const retriedEvents = events.filter(e => e.attempts > 1).length;
        const errorRate = events.length > 0 ? (failedEvents / events.length) * 100 : 0;
        const retryRate = events.length > 0 ? (retriedEvents / events.length) * 100 : 0;
        return {
            averageProcessingTime: Math.round(averageProcessingTime),
            p50ProcessingTime: Math.round(p50ProcessingTime),
            p95ProcessingTime: Math.round(p95ProcessingTime),
            p99ProcessingTime: Math.round(p99ProcessingTime),
            throughput: {
                eventsPerMinute: Math.round(throughput.eventsPerMinute * 100) / 100,
                eventsPerHour: Math.round(throughput.eventsPerHour * 100) / 100,
                eventsPerDay: Math.round(throughput.eventsPerDay * 100) / 100,
            },
            errorRate: Math.round(errorRate * 100) / 100,
            retryRate: Math.round(retryRate * 100) / 100,
        };
    }
    /**
     * Record processing time for real-time monitoring
     */
    recordProcessingTime(processingTime) {
        this.processingTimes.push(processingTime);
        // Keep only recent times (last 1000)
        if (this.processingTimes.length > 1000) {
            this.processingTimes = this.processingTimes.slice(-1000);
        }
        // Check for alerts
        this.checkProcessingTimeAlert(processingTime);
    }
    /**
     * Create webhook alert
     */
    createAlert(type, severity, message, data = {}) {
        // Avoid duplicate alerts of the same type
        const existingAlert = [...this.alerts.values()]
            .find(alert => alert.type === type && !alert.resolved);
        if (existingAlert) {
            return; // Don't create duplicate
        }
        const alert = {
            id: `alert_${type}_${Date.now()}`,
            type,
            severity,
            message,
            data,
            triggeredAt: now(),
            resolved: false,
        };
        this.alerts.set(alert.id, alert);
        // Limit number of stored alerts
        if (this.alerts.size > this.alertThresholds.maxAlerts) {
            const oldestAlert = [...this.alerts.entries()]
                .sort(([, a], [, b]) => toMillis(a.triggeredAt) - toMillis(b.triggeredAt))[0];
            if (oldestAlert) {
                this.alerts.delete(oldestAlert[0]);
            }
        }
        console.warn(`Webhook Alert [${severity.toUpperCase()}]: ${message}`, data);
    }
    /**
     * Resolve webhook alert
     */
    resolveAlert(alertId) {
        const alert = this.alerts.get(alertId);
        if (alert && !alert.resolved) {
            alert.resolved = true;
            alert.resolvedAt = now();
        }
    }
    /**
     * Get active alerts
     */
    getActiveAlerts() {
        return [...this.alerts.values()]
            .filter(alert => !alert.resolved)
            .sort((a, b) => toMillis(b.triggeredAt) - toMillis(a.triggeredAt));
    }
    /**
     * Get all alerts (including resolved)
     */
    getAllAlerts() {
        return [...this.alerts.values()]
            .sort((a, b) => toMillis(b.triggeredAt) - toMillis(a.triggeredAt));
    }
    /**
     * Generate webhook monitoring report
     */
    async generateMonitoringReport(startDate, endDate) {
        const actualStartDate = startDate || sub(now(), { hours: 24 }); // Last 24 hours
        const actualEndDate = endDate || now();
        const [metrics, health, performance] = await Promise.all([
            this.getWebhookMetrics(actualStartDate, actualEndDate),
            this.getWebhookHealth(actualStartDate),
            this.getWebhookPerformance(actualStartDate, actualEndDate),
        ]);
        const activeAlerts = this.getActiveAlerts();
        const recentAlerts = [...this.alerts.values()]
            .filter(alert => isSameOrAfter(alert.triggeredAt, actualStartDate))
            .sort((a, b) => toMillis(b.triggeredAt) - toMillis(a.triggeredAt));
        // Combine recommendations from health check and performance analysis
        const recommendations = [
            ...health.recommendations,
            ...this.generatePerformanceRecommendations(performance),
        ];
        return {
            period: {
                startDate: actualStartDate,
                endDate: actualEndDate,
            },
            metrics,
            health,
            performance,
            alerts: {
                active: activeAlerts,
                recent: recentAlerts,
            },
            recommendations: [...new Set(recommendations)], // Remove duplicates
        };
    }
    /**
     * Helper method to get webhook events in date range
     */
    async getWebhookEventsInRange(startDate, endDate) {
        // This would typically call a repository method to get filtered events
        // For now, we'll simulate with a basic approach
        // In a real implementation, you'd add date filtering to the repository
        const allEvents = await this.paymentRepository.findUnprocessedWebhookEvents(1000); // Get recent events
        if (!startDate && !endDate) {
            return allEvents;
        }
        return allEvents.filter(event => {
            const eventDate = event.createdAt;
            return (!startDate || isSameOrAfter(eventDate, startDate)) && (!endDate || isSameOrBefore(eventDate, endDate));
        });
    }
    /**
     * Categorize error messages into types
     */
    categorizeError(errorMessage) {
        const message = errorMessage.toLowerCase();
        if (message.includes('timeout') || message.includes('connection')) {
            return 'connection_error';
        }
        if (message.includes('signature') || message.includes('invalid')) {
            return 'validation_error';
        }
        if (message.includes('parsing') || message.includes('json')) {
            return 'parsing_error';
        }
        if (message.includes('database') || message.includes('sql')) {
            return 'database_error';
        }
        return 'other_error';
    }
    /**
     * Calculate expected event ratio (simplified heuristic)
     */
    calculateExpectedEventRatio(metrics) {
        // Simple heuristic: expect certain ratios between event types
        const paymentSucceeded = metrics.eventsByType['payment.succeeded'] || 0;
        const paymentFailed = metrics.eventsByType['payment.failed'] || 0;
        const subscriptionCreated = metrics.eventsByType['subscription.created'] || 0;
        // If we have payments, we should have some subscription events
        if (paymentSucceeded + paymentFailed > 0 && subscriptionCreated === 0) {
            return 0.5; // Low ratio indicates missing events
        }
        return 1; // Simplified - assume everything is fine
    }
    /**
     * Calculate percentile from sorted array
     */
    calculatePercentile(sortedArray, percentile) {
        if (sortedArray.length === 0)
            return 0;
        const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
        const safeIndex = Math.max(0, Math.min(index, sortedArray.length - 1));
        return sortedArray[safeIndex] ?? 0;
    }
    /**
     * Get time range in hours between dates
     */
    getTimeRangeHours(startDate, endDate) {
        const start = startDate || sub(now(), { hours: 24 });
        const end = endDate || now();
        return (toMillis(end) - toMillis(start)) / (1000 * 60 * 60);
    }
    /**
     * Check if processing time should trigger an alert
     */
    checkProcessingTimeAlert(processingTime) {
        if (processingTime > this.alertThresholds.slowProcessing) {
            this.createAlert('slow_processing', processingTime > 15_000 ? 'high' : 'medium', `Slow webhook processing detected: ${processingTime}ms`, { processingTime });
        }
    }
    /**
     * Generate performance-based recommendations
     */
    generatePerformanceRecommendations(performance) {
        const recommendations = [];
        if (performance.averageProcessingTime > 5000) {
            recommendations.push('Consider optimizing webhook processing logic to reduce latency');
        }
        if (performance.errorRate > 5) {
            recommendations.push('High error rate detected - review webhook error handling');
        }
        if (performance.retryRate > 10) {
            recommendations.push('High retry rate - investigate root causes of webhook failures');
        }
        if (performance.throughput.eventsPerHour < 1 && performance.throughput.eventsPerHour > 0) {
            recommendations.push('Low webhook volume - verify provider configuration');
        }
        return recommendations;
    }
}
export function createWebhookAnalyticsService(paymentRepository, alertThresholds) {
    return new WebhookAnalyticsService(paymentRepository, alertThresholds);
}
//# sourceMappingURL=webhook-analytics-service.js.map