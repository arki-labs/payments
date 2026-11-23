import type { Instant } from '@arki/date';
import { z } from '@arki/contracts';
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
/** When the service raises an alert, and how many alerts it keeps. */
declare const alertThresholdsSchema: z.ZodObject<{
    errorRate: z.ZodNumber;
    slowProcessing: z.ZodNumber;
    maxAlerts: z.ZodNumber;
}, z.core.$strip>;
type WebhookAlertThresholds = z.output<typeof alertThresholdsSchema>;
export declare class WebhookAnalyticsService {
    private readonly paymentRepository;
    private readonly alertThresholds;
    private alerts;
    private processingTimes;
    private constructor();
    /**
     * Builds the service. Returns `payments.configuration_invalid` for thresholds that are not finite
     * numbers of 0 or more, or a `maxAlerts` that is not a whole number from 1 to 100,000.
     */
    static create(paymentRepository: PaymentRepository, alertThresholds?: WebhookAlertThresholds): import("@arki/failure").Failure<"payments.configuration_invalid", {
        setting: string;
        problem: string;
    }> | WebhookAnalyticsService;
    /**
     * Get comprehensive webhook metrics. A time given falls in the years 1 to 9999 (a precondition: anything else throws an invariant failure).
     */
    getWebhookMetrics(startDate?: Instant, endDate?: Instant): Promise<WebhookMetrics>;
    /**
     * Assess webhook system health. A time given falls in the years 1 to 9999 (a precondition: anything else throws an invariant failure).
     */
    getWebhookHealth(startDate?: Instant): Promise<WebhookHealth>;
    /**
     * Get webhook performance metrics. A time given falls in the years 1 to 9999 (a precondition: anything else throws an invariant failure).
     */
    getWebhookPerformance(startDate?: Instant, endDate?: Instant): Promise<WebhookPerformance>;
    /**
     * Record processing time for real-time monitoring. `processingTime` is a finite number of
     * milliseconds, 0 or more (a precondition: anything else throws an invariant failure, and nothing is recorded).
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
     * Generate webhook monitoring report. A time given falls in the years 1 to 9999 (a precondition: anything else throws an invariant failure).
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
    /** The newest 1000 webhook events, processed or not, created in the range (each end optional, both included). */
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
/** Builds a `WebhookAnalyticsService`: the same as `WebhookAnalyticsService.create`, which returns `payments.configuration_invalid` for bad thresholds. */
export declare function createWebhookAnalyticsService(paymentRepository: PaymentRepository, alertThresholds?: WebhookAlertThresholds): import("@arki/failure").Failure<"payments.configuration_invalid", {
    setting: string;
    problem: string;
}> | WebhookAnalyticsService;
export {};
//# sourceMappingURL=webhook-analytics-service.d.ts.map