import type { Instant } from '@arki/date';
import type { KV } from '@arki/kv';
import type { Money } from '@arki/money';
import type { PaymentRepository } from '../repository.js';
type AlertingService = {
    sendCriticalAlert(alert: unknown): Promise<void>;
    sendWarningAlert(alert: unknown): Promise<void>;
};
type PaymentResult = {
    success: boolean;
    status: string;
    processingTime: number;
    amount?: Money;
    provider?: string;
    errorCode?: string;
};
type PaymentAnomaly = {
    type: string;
    severity: 'warning' | 'critical';
    description: string;
    detectedAt: Instant;
    metadata?: Record<string, unknown>;
};
type PaymentSystemHealth = {
    overall: number;
    payments: {
        successRate: number;
        avgProcessingTime: number;
        /** Subscriptions whose stored status is `active`. */
        activeSubscriptions: number;
    };
    webhooks: {
        avgProcessingTime: number;
        successRate: number;
    };
    lastUpdated: Instant;
};
/** The stored counts the monitor reads. A `PaymentRepository` fits. */
type MonitorReads = Pick<PaymentRepository, 'getActiveSubscriptionCount' | 'countPaymentsCreatedBetween'>;
/**
 * Counts payment, webhook, subscription and refund outcomes in memory (the last hour) and in KV,
 * and raises an alert when a rate crosses its threshold. It starts no timer: old metrics are
 * dropped when a new one is recorded, so a monitor built per request leaves nothing running.
 */
export declare class PaymentMonitoringService {
    private kv;
    private reads;
    private alertingService?;
    private metrics;
    private alertThresholds;
    constructor(kv: KV, reads: MonitorReads, alertingService?: AlertingService | undefined);
    private initializeThresholds;
    recordPaymentAttempt(result: PaymentResult): Promise<void>;
    recordWebhookProcessing(duration: number, success: boolean): Promise<void>;
    recordSubscriptionEvent(event: 'created' | 'canceled' | 'upgraded' | 'downgraded'): Promise<void>;
    recordRefund(amount: Money, reason: string): Promise<void>;
    private recordMetric;
    private getMetricValues;
    private checkFailureRate;
    private checkWebhookPerformance;
    private checkChurnRate;
    private checkRefundRate;
    detectAnomalies(): Promise<PaymentAnomaly[]>;
    getSystemHealth(): Promise<PaymentSystemHealth>;
    private triggerAlert;
    private calculateSuccessRate;
    private getAverageMetric;
    private calculateOverallHealth;
    private cleanupOldMetrics;
}
export declare function createPaymentMonitoringService(kv: KV, reads: MonitorReads, alertingService?: AlertingService): PaymentMonitoringService;
export {};
//# sourceMappingURL=payment-monitor.d.ts.map