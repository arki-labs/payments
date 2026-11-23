import type { Instant } from '@arki/date';
import type { KV } from '@arki/kv';
import type { Money } from '@arki/money';
import type { PaymentRepository } from '../repository.js';
type AlertingService = {
    sendCriticalAlert(alert: unknown): Promise<void>;
    sendWarningAlert(alert: unknown): Promise<void>;
};
/** A KV write that did not go through: `kv.unavailable` on an outage or timeout, `kv.cancelled`. */
type KvWriteFailure = Exclude<Awaited<ReturnType<KV['set']>>, boolean>;
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
    /**
     * `outcome` (`success` or `failure`) is what the success and refund rates count; `status` is the payment's own.
     * `result.processingTime` is a finite number of milliseconds, 0 or more (a precondition: anything else
     * throws an invariant failure before anything is recorded).
     */
    recordPaymentAttempt(result: PaymentResult): Promise<KvWriteFailure | undefined>;
    /**
     * `duration` is a finite number of milliseconds, 0 or more (a precondition: anything else throws an
     * invariant failure before anything is recorded).
     */
    recordWebhookProcessing(duration: number, success: boolean): Promise<KvWriteFailure | undefined>;
    recordSubscriptionEvent(event: 'created' | 'canceled' | 'upgraded' | 'downgraded'): Promise<KvWriteFailure | undefined>;
    recordRefund(amount: Money, reason: string): Promise<KvWriteFailure | undefined>;
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