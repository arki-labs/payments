import type { UserId } from '../../core/user-id.js';
import type { Instant } from '@arki/date';
import { Money } from '@arki/money';
import type { PaymentRetryService } from '../../core/services/payment-retry-service.js';
import type { CoreTables } from '../../core/tables.js';
import type { CustomerId, PaymentId, SubscriptionId } from '../../core/types.js';
import type { DunningTables } from '../tables.js';
import type { CommunicationOrchestrationConfig } from './communication-service.js';
import { type DunningDatabase } from '../repository.js';
/**
 * Events that trigger dunning campaigns
 */
export type DunningTriggerEvent = {
    type: 'payment_failed' | 'subscription_past_due' | 'trial_ending' | 'payment_succeeded' | 'subscription_canceled';
    customerId: CustomerId;
    subscriptionId?: SubscriptionId;
    paymentId?: PaymentId;
    metadata: Record<string, unknown>;
    timestamp: Instant;
};
/**
 * Service that integrates dunning management with existing payment systems
 * Handles event-driven triggers and coordinates between payment retry and dunning
 */
export type DunningIntegrationConfig = {
    /** User ID used to attribute system-driven executions (e.g. dunning created automatically). */
    systemUserId: UserId | string;
    /** Channel-provider config forwarded to `createCommunicationOrchestrationService`. */
    communication?: CommunicationOrchestrationConfig;
};
export type DunningIntegrationCoreTables = Pick<CoreTables, 'customers' | 'payments' | 'subscriptions' | 'plans'>;
export type DunningIntegrationDunningTables = Pick<DunningTables, 'dunningCampaigns' | 'dunningCampaignAnalytics' | 'dunningTemplates' | 'dunningExecutions' | 'dunningCommunications' | 'customerSegments' | 'customerRiskProfiles'>;
export declare class DunningIntegrationService {
    private readonly db;
    private readonly paymentRetryService?;
    private campaignService;
    private communicationService;
    private segmentationService;
    private readonly systemUserId;
    private readonly dunningExecutions;
    constructor(db: DunningDatabase, coreTables: DunningIntegrationCoreTables, dunningTables: DunningIntegrationDunningTables, config: DunningIntegrationConfig, paymentRetryService?: PaymentRetryService | undefined);
    /**
     * Handle payment failure events from the payment system
     */
    handlePaymentFailure(event: {
        paymentId: PaymentId;
        customerId: CustomerId;
        subscriptionId?: SubscriptionId;
        failureReason: string;
        amount: Money;
        failureCount: number;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    /**
     * Handle subscription status changes
     */
    handleSubscriptionStatusChange(event: {
        subscriptionId: SubscriptionId;
        customerId: CustomerId;
        oldStatus: string;
        newStatus: string;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    /**
     * Handle trial ending notifications
     */
    handleTrialEnding(event: {
        subscriptionId: SubscriptionId;
        customerId: CustomerId;
        trialEndDate: Instant;
        daysUntilEnd: number;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    /**
     * Handle successful payment events (can stop dunning campaigns)
     */
    handlePaymentSuccess(event: {
        paymentId: PaymentId;
        customerId: CustomerId;
        subscriptionId?: SubscriptionId;
        amount: Money;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    /**
     * Execute a specific campaign for a customer
     */
    private executeCampaignForCustomer;
    /**
     * Handle past due subscription scenario
     */
    private handlePastDueSubscription;
    /**
     * Handle subscription cancellation
     */
    private handleSubscriptionCancellation;
    /**
     * Handle subscription recovery (past_due -> active)
     */
    private handleSubscriptionRecovery;
    /**
     * Stop active dunning campaigns when payment succeeds (if configured)
     */
    private stopDunningCampaignsOnPaymentSuccess;
    /**
     * Evaluate campaign conditions for payment failure
     */
    private evaluateCampaignConditions;
    /**
     * Evaluate trial ending conditions
     */
    private evaluateTrialEndingConditions;
    /**
     * Process all scheduled dunning executions
     */
    processScheduledExecutions(): Promise<void>;
    /**
     * Process pending communications
     */
    processPendingCommunications(): Promise<void>;
    /**
     * Retry failed executions
     */
    retryFailedExecutions(): Promise<void>;
    /**
     * Update customer risk profiles in bulk
     */
    updateRiskProfiles(): Promise<void>;
    /**
     * Process auto-update segments
     */
    processAutoUpdateSegments(): Promise<void>;
    /**
     * Integration health check
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        services: {
            campaigns: boolean;
            communications: boolean;
            segmentation: boolean;
            paymentRetry: boolean;
        };
        providers: Record<string, boolean>;
    }>;
    /**
     * Get integration metrics
     */
    getIntegrationMetrics(_days?: number): Promise<{
        totalExecutions: number;
        successfulExecutions: number;
        failedExecutions: number;
        communicationsSent: number;
        successRate: number;
        averageProcessingTime: number;
    }>;
}
/**
 * Factory function to create DunningIntegrationService.
 */
export declare function createDunningIntegrationService(db: DunningDatabase, coreTables: DunningIntegrationCoreTables, dunningTables: DunningIntegrationDunningTables, config: DunningIntegrationConfig, paymentRetryService?: PaymentRetryService): DunningIntegrationService;
//# sourceMappingURL=integration-service.d.ts.map