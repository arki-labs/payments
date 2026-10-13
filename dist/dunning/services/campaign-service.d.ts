import type { PaymentRetryService } from '../../core/services/payment-retry-service.js';
import type { CreateDunningCampaignInput, ExecuteCampaignInput, ListDunningCampaignsQuery, UpdateDunningCampaignInput } from '../contracts.js';
import type { DunningCampaignId, DunningCampaignStatus } from '../primitives.js';
import type { DunningDatabase } from '../repository.js';
import type { DunningTables } from '../tables.js';
import type { DunningCampaign, DunningExecution, DunningTemplate } from '../types.js';
import type { CommunicationOrchestrationService } from './communication-service.js';
/**
 * Service for managing dunning campaigns
 * Handles campaign CRUD operations, template management, and execution orchestration
 */
export declare class DunningCampaignService {
    private readonly db;
    private readonly communicationServiceFactory;
    private readonly _paymentRetryService?;
    private campaignRepo;
    private templateRepo;
    private executionRepo;
    constructor(db: DunningDatabase, tables: Pick<DunningTables, 'dunningCampaigns' | 'dunningCampaignAnalytics' | 'dunningTemplates' | 'dunningExecutions'>, communicationServiceFactory: () => CommunicationOrchestrationService, _paymentRetryService?: PaymentRetryService | undefined);
    private getCommunicationService;
    /**
     * Create a new dunning campaign with templates
     */
    createCampaign(input: CreateDunningCampaignInput, createdBy: string): Promise<DunningCampaign>;
    /**
     * Update an existing campaign
     */
    updateCampaign(campaignId: DunningCampaignId, input: UpdateDunningCampaignInput, updatedBy: string): Promise<(DunningCampaign & {
        templates: DunningTemplate[];
    }) | null>;
    /**
     * Get campaign by ID with templates
     */
    getCampaign(campaignId: DunningCampaignId): Promise<{
        templates: {
            abTestVariant: string | null;
            campaignId: `dc_${string}`;
            communication: {
                channel: 'email' | 'sms' | 'in_app' | 'webhook';
                subject?: string;
                content: string;
                variables: string[];
                design?: {
                    theme?: string;
                    brandColors?: Record<string, string>;
                    logoUrl?: string;
                };
            };
            createdAt: import("temporal-spec").Temporal.Instant;
            delayHours: number;
            description: string | null;
            id: `dt_${string}`;
            isActive: boolean;
            metadata: Record<string, unknown> | null;
            name: string;
            stepNumber: number;
            updatedAt: import("temporal-spec").Temporal.Instant;
        }[];
        createdAt: import("temporal-spec").Temporal.Instant;
        createdBy: string;
        description: string | null;
        id: `dc_${string}`;
        metadata: Record<string, unknown> | null;
        name: string;
        settings: {
            enabled: boolean;
            priority: number;
            cooldownPeriod: number;
            maxExecutionsPerCustomer: number;
            stopOnPaymentSuccess: boolean;
            respectUnsubscribe: boolean;
            businessHoursOnly: boolean;
            timezone?: string;
            allowedDays?: number[];
            abTestVariant?: string;
        };
        status: "active" | "archived" | "draft" | "paused";
        targetSegments: string[];
        trigger: {
            type: 'payment_failure' | 'subscription_status' | 'time_based' | 'manual';
            conditions: {
                paymentFailureCount?: number;
                subscriptionStatus?: string[];
                daysSinceLastPayment?: number;
                daysSinceFailure?: number;
                trialEndingDays?: number;
                renewalReminderDays?: number;
            };
            filters?: {
                customerSegments?: string[];
                planTiers?: string[];
                subscriptionAge?: {
                    min?: number;
                    max?: number;
                };
                totalSpent?: import("../types.js").SpendRange;
            };
        };
        type: "payment_failed" | "renewal_reminder" | "subscription_past_due" | "trial_ending";
        updatedAt: import("temporal-spec").Temporal.Instant;
        updatedBy: string | null;
    } | null>;
    /**
     * List campaigns with filtering and pagination
     */
    listCampaigns(query: ListDunningCampaignsQuery): Promise<{
        createdAt: import("temporal-spec").Temporal.Instant;
        createdBy: string;
        description: string | null;
        id: `dc_${string}`;
        metadata: Record<string, unknown> | null;
        name: string;
        settings: {
            enabled: boolean;
            priority: number;
            cooldownPeriod: number;
            maxExecutionsPerCustomer: number;
            stopOnPaymentSuccess: boolean;
            respectUnsubscribe: boolean;
            businessHoursOnly: boolean;
            timezone?: string;
            allowedDays?: number[];
            abTestVariant?: string;
        };
        status: "active" | "archived" | "draft" | "paused";
        targetSegments: string[];
        trigger: {
            type: 'payment_failure' | 'subscription_status' | 'time_based' | 'manual';
            conditions: {
                paymentFailureCount?: number;
                subscriptionStatus?: string[];
                daysSinceLastPayment?: number;
                daysSinceFailure?: number;
                trialEndingDays?: number;
                renewalReminderDays?: number;
            };
            filters?: {
                customerSegments?: string[];
                planTiers?: string[];
                subscriptionAge?: {
                    min?: number;
                    max?: number;
                };
                totalSpent?: import("../types.js").SpendRange;
            };
        };
        type: "payment_failed" | "renewal_reminder" | "subscription_past_due" | "trial_ending";
        updatedAt: import("temporal-spec").Temporal.Instant;
        updatedBy: string | null;
    }[]>;
    /**
     * Delete a campaign and all related data
     */
    deleteCampaign(campaignId: DunningCampaignId): Promise<void>;
    /**
     * Activate or deactivate a campaign
     */
    updateCampaignStatus(campaignId: DunningCampaignId, status: DunningCampaignStatus, updatedBy: string): Promise<{
        createdAt: import("temporal-spec").Temporal.Instant;
        createdBy: string;
        description: string | null;
        id: `dc_${string}`;
        metadata: Record<string, unknown> | null;
        name: string;
        settings: {
            enabled: boolean;
            priority: number;
            cooldownPeriod: number;
            maxExecutionsPerCustomer: number;
            stopOnPaymentSuccess: boolean;
            respectUnsubscribe: boolean;
            businessHoursOnly: boolean;
            timezone?: string;
            allowedDays?: number[];
            abTestVariant?: string;
        };
        status: "active" | "archived" | "draft" | "paused";
        targetSegments: string[];
        trigger: {
            type: 'payment_failure' | 'subscription_status' | 'time_based' | 'manual';
            conditions: {
                paymentFailureCount?: number;
                subscriptionStatus?: string[];
                daysSinceLastPayment?: number;
                daysSinceFailure?: number;
                trialEndingDays?: number;
                renewalReminderDays?: number;
            };
            filters?: {
                customerSegments?: string[];
                planTiers?: string[];
                subscriptionAge?: {
                    min?: number;
                    max?: number;
                };
                totalSpent?: import("../types.js").SpendRange;
            };
        };
        type: "payment_failed" | "renewal_reminder" | "subscription_past_due" | "trial_ending";
        updatedAt: import("temporal-spec").Temporal.Instant;
        updatedBy: string | null;
    } | undefined>;
    /**
     * Execute a campaign manually or through automation
     */
    executeCampaign(input: ExecuteCampaignInput, _executedBy: string): Promise<DunningExecution[]>;
    /**
     * Find customers eligible for a campaign based on trigger conditions
     */
    private findEligibleCustomers;
    private findCustomersWithPaymentFailures;
    private findCustomersWithSubscriptionStatus;
    private findCustomersWithEndingTrials;
    /**
     * Process scheduled executions
     */
    processScheduledExecutions(limit?: number): Promise<void>;
    /**
     * Execute a single scheduled execution
     */
    private executeIndividualExecution;
    /**
     * Execute communication for an execution
     */
    private executeCommunication;
    /**
     * Check if current time is within business hours
     */
    private isBusinessHours;
    /**
     * Get next business hour in the specified timezone
     */
    private getNextBusinessHour;
    /**
     * Check if a given date falls on a business day
     */
    private isBusinessDay;
    /**
     * Check if payment was successful and stop subsequent executions
     */
    private checkAndStopOnPaymentSuccess;
    /**
     * Update campaign analytics with new metrics
     */
    private updateCampaignAnalytics;
    /**
     * Get campaign analytics and performance metrics
     */
    getCampaignAnalytics(campaignId?: DunningCampaignId, days?: number): Promise<{
        executions?: number | undefined;
        customersReached?: number | undefined;
        communicationsSent?: number | undefined;
        paymentsRecovered?: number | undefined;
        conversionRate?: number | undefined;
        roi?: number | undefined;
        revenueRecovered: import("@arki/money/bag").MoneyBag;
    }>;
    /**
     * Retry failed executions with exponential backoff
     * This method finds executions that are ready to retry (nextRetryAt is in the past)
     * and attempts to execute them again. If they fail again, it schedules the next retry
     * with exponential backoff.
     */
    retryFailedExecutions(limit?: number): Promise<void>;
    /**
     * Find active campaigns for a specific trigger
     */
    findActiveCampaignsForTrigger(triggerType: string, customerSegmentIds?: string[]): Promise<{
        createdAt: import("temporal-spec").Temporal.Instant;
        createdBy: string;
        description: string | null;
        id: `dc_${string}`;
        metadata: Record<string, unknown> | null;
        name: string;
        settings: {
            enabled: boolean;
            priority: number;
            cooldownPeriod: number;
            maxExecutionsPerCustomer: number;
            stopOnPaymentSuccess: boolean;
            respectUnsubscribe: boolean;
            businessHoursOnly: boolean;
            timezone?: string;
            allowedDays?: number[];
            abTestVariant?: string;
        };
        status: "active" | "archived" | "draft" | "paused";
        targetSegments: string[];
        trigger: {
            type: 'payment_failure' | 'subscription_status' | 'time_based' | 'manual';
            conditions: {
                paymentFailureCount?: number;
                subscriptionStatus?: string[];
                daysSinceLastPayment?: number;
                daysSinceFailure?: number;
                trialEndingDays?: number;
                renewalReminderDays?: number;
            };
            filters?: {
                customerSegments?: string[];
                planTiers?: string[];
                subscriptionAge?: {
                    min?: number;
                    max?: number;
                };
                totalSpent?: import("../types.js").SpendRange;
            };
        };
        type: "payment_failed" | "renewal_reminder" | "subscription_past_due" | "trial_ending";
        updatedAt: import("temporal-spec").Temporal.Instant;
        updatedBy: string | null;
    }[]>;
}
export type DunningCampaignServiceTables = Pick<DunningTables, 'dunningCampaigns' | 'dunningCampaignAnalytics' | 'dunningTemplates' | 'dunningExecutions'>;
/**
 * Factory function to create DunningCampaignService.
 */
export declare function createDunningCampaignService(db: DunningDatabase, tables: DunningCampaignServiceTables, communicationServiceFactory: () => CommunicationOrchestrationService, paymentRetryService?: PaymentRetryService): DunningCampaignService;
//# sourceMappingURL=campaign-service.d.ts.map