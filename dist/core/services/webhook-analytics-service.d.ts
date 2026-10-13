import type { Instant } from '@arki/date';
import type { PaymentRepository } from '../repository.js';
import type { PaymentProviderType, WebhookEventType, WebhookId } from '../types.js';
export type WebhookMetrics = {
    totalEvents: number;
    processedEvents: number;
    failedEvents: number;
    processingRate: number;
    averageProcessingTime: number;
    eventsByType: Record<WebhookEventType, number>;
    eventsByProvider: Record<PaymentProviderType, number>;
    errorsByType: Record<string, number>;
    recentErrors: {
        webhookId: WebhookId;
        eventType: WebhookEventType;
        provider: PaymentProviderType;
        error: string;
        timestamp: Instant;
    }[];
};
export type WebhookHealth = {
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    issues: {
        severity: 'low' | 'medium' | 'high';
        type: string;
        message: string;
        count?: number;
    }[];
    recommendations: string[];
};
export type WebhookPerformance = {
    averageProcessingTime: number;
    p50ProcessingTime: number;
    p95ProcessingTime: number;
    p99ProcessingTime: number;
    throughput: {
        eventsPerMinute: number;
        eventsPerHour: number;
        eventsPerDay: number;
    };
    errorRate: number;
    retryRate: number;
};
export type WebhookAlert = {
    id: string;
    type: 'high_error_rate' | 'slow_processing' | 'missing_events' | 'provider_issues';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    data: Record<string, unknown>;
    triggeredAt: Instant;
    resolved?: boolean;
    resolvedAt?: Instant;
};
export declare class WebhookAnalyticsService {
    private readonly paymentRepository;
    private readonly alertThresholds;
    private alerts;
    private processingTimes;
    constructor(paymentRepository: PaymentRepository, alertThresholds?: {
        errorRate: number;
        slowProcessing: number;
        maxAlerts: number;
    });
    /**
     * Get comprehensive webhook metrics
     */
    getWebhookMetrics(startDate?: Instant, endDate?: Instant): Promise<WebhookMetrics>;
    /**
     * Assess webhook system health
     */
    getWebhookHealth(startDate?: Instant): Promise<WebhookHealth>;
    /**
     * Get webhook performance metrics
     */
    getWebhookPerformance(startDate?: Instant, endDate?: Instant): Promise<WebhookPerformance>;
    /**
     * Record processing time for real-time monitoring
     */
    recordProcessingTime(processingTime: number): void;
    /**
     * Create webhook alert
     */
    createAlert(type: WebhookAlert['type'], severity: WebhookAlert['severity'], message: string, data?: Record<string, unknown>): void;
    /**
     * Resolve webhook alert
     */
    resolveAlert(alertId: string): void;
    /**
     * Get active alerts
     */
    getActiveAlerts(): WebhookAlert[];
    /**
     * Get all alerts (including resolved)
     */
    getAllAlerts(): WebhookAlert[];
    /**
     * Generate webhook monitoring report
     */
    generateMonitoringReport(startDate?: Instant, endDate?: Instant): Promise<{
        period: {
            startDate: Instant;
            endDate: Instant;
        };
        metrics: WebhookMetrics;
        health: WebhookHealth;
        performance: WebhookPerformance;
        alerts: {
            active: WebhookAlert[];
            recent: WebhookAlert[];
        };
        recommendations: string[];
    }>;
    /**
     * Helper method to get webhook events in date range
     */
    private getWebhookEventsInRange;
    /**
     * Categorize error messages into types
     */
    private categorizeError;
    /**
     * Calculate expected event ratio (simplified heuristic)
     */
    private calculateExpectedEventRatio;
    /**
     * Calculate percentile from sorted array
     */
    private calculatePercentile;
    /**
     * Get time range in hours between dates
     */
    private getTimeRangeHours;
    /**
     * Check if processing time should trigger an alert
     */
    private checkProcessingTimeAlert;
    /**
     * Generate performance-based recommendations
     */
    private generatePerformanceRecommendations;
}
export declare function createWebhookAnalyticsService(paymentRepository: PaymentRepository, alertThresholds?: {
    errorRate: number;
    slowProcessing: number;
    maxAlerts: number;
}): WebhookAnalyticsService;
//# sourceMappingURL=webhook-analytics-service.d.ts.map