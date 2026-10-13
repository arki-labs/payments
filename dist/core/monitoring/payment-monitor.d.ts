import type { Instant } from '@arki/date';
import type { KV } from '@arki/kv';
import type { Money } from '@arki/money';
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
        activeSubscriptions: number;
    };
    webhooks: {
        avgProcessingTime: number;
        successRate: number;
    };
    providers: Record<string, boolean>;
    lastUpdated: Instant;
};
export declare class PaymentMonitoringService {
    private kv;
    private alertingService?;
    private metrics;
    private alertThresholds;
    private metricsCollectionInterval?;
    constructor(kv: KV, alertingService?: AlertingService | undefined);
    private initializeThresholds;
    private startMetricsCollection;
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
    private getHourlyVolume;
    private getHistoricalAverageVolume;
    private getActiveSubscriptionCount;
    private cleanupOldMetrics;
    destroy(): void;
}
export declare function createPaymentMonitoringService(kv: KV, alertingService?: AlertingService): PaymentMonitoringService;
export {};
//# sourceMappingURL=payment-monitor.d.ts.map