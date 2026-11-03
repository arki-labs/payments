import type { Instant } from '@arki/date';
import type { MoneyFailure } from '@arki/money';
import { Money } from '@arki/money';
import type { PaymentRetryService } from '../../core/services/payment-retry-service.js';
import type { CoreTables } from '../../core/tables.js';
import type { CustomerId, PaymentId, SubscriptionId } from '../../core/types.js';
import type { DunningTables } from '../tables.js';
import type { DunningTickReport } from '../failures.js';
import type { CommunicationOrchestrationConfig } from './communication-service.js';
import type { DunningDatabase } from '../repository.js';
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
    /** User ID (any text, usually a `usr_...` id) used to attribute system-driven executions. */
    systemUserId: string;
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
    private readonly dunningCampaigns;
    private readonly dunningCommunications;
    private readonly customerSegments;
    constructor(db: DunningDatabase, coreTables: DunningIntegrationCoreTables, dunningTables: DunningIntegrationDunningTables, config: DunningIntegrationConfig, paymentRetryService?: PaymentRetryService | undefined);
    /**
     * Handle payment failure events from the payment system.
     *
     * A campaign whose stored spend range is not valid money (`@arki/money` refuses it) is skipped, and the
     * first such failure is returned after the other campaigns have run, so one bad campaign stops no other.
     */
    handlePaymentFailure(event: {
        paymentId: PaymentId;
        customerId: CustomerId;
        subscriptionId?: SubscriptionId;
        failureReason: string;
        amount: Money;
        failureCount: number;
        metadata?: Record<string, unknown>;
    }): Promise<void | MoneyFailure>;
    /**
     * Handle subscription status changes
     */
    handleSubscriptionStatusChange(event: {
        subscriptionId: SubscriptionId;
        customerId: CustomerId;
        oldStatus: string;
        newStatus: string;
        metadata?: Record<string, unknown>;
    }): Promise<void | MoneyFailure>;
    /**
     * Handle trial ending notifications
     */
    handleTrialEnding(event: {
        subscriptionId: SubscriptionId;
        customerId: CustomerId;
        trialEndDate: Instant;
        daysUntilEnd: number;
        metadata?: Record<string, unknown>;
    }): Promise<void | MoneyFailure>;
    /**
     * Handle successful payment events (can stop dunning campaigns)
     */
    handlePaymentSuccess(event: {
        paymentId: PaymentId;
        customerId: CustomerId;
        subscriptionId?: SubscriptionId;
        amount: Money;
        metadata?: Record<string, unknown>;
    }): Promise<void | MoneyFailure>;
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
     * Run the scheduled executions that are due. Returns the tick report: each execution that failed is
     * listed. A fault that stops the whole tick is logged and thrown.
     */
    processScheduledExecutions(): Promise<DunningTickReport>;
    /** Send the pending communications. Returns the tick report: each communication not sent is listed. */
    processPendingCommunications(): Promise<DunningTickReport>;
    /** Retry the failed executions that are due. Returns the tick report: each retry that failed again is listed. */
    retryFailedExecutions(): Promise<DunningTickReport>;
    /** Recalculate customer risk profiles. Returns the tick report: each customer not updated is listed. */
    updateRiskProfiles(): Promise<DunningTickReport>;
    /** Recount the auto-update segments. Returns the tick report: each segment not counted is listed. */
    processAutoUpdateSegments(): Promise<DunningTickReport>;
    /** Runs one scheduled tick: logs its item faults and a fault that stopped it, and hands both to the scheduler. */
    private tick;
    /**
     * Integration health check. Campaigns, communications and segmentation are healthy when their
     * tables answer a read; `paymentRetry` says whether a `PaymentRetryService` was passed (it is
     * optional, so it does not change `status`). `providers` is each registered channel's own check.
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
    /** True when one row (or none) can be read from the table; a failed read is logged and answers false. */
    private tableAnswers;
    /**
     * Execution and communication counts of the last `days` days, from the stored rows. `successRate`
     * is completed executions over all executions (0 to 1); `averageProcessingTime` is the mean
     * processing time, in milliseconds, recorded on completed executions.
     */
    getIntegrationMetrics(days?: number): Promise<{
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