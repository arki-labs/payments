import type { Instant } from '@arki/date';
import type { FailureOf, SchemaFailure } from '@arki/failure';
import type { MoneyFailure } from '@arki/money';
import { Money } from '@arki/money';
import type { PaymentRetryService } from '../../core/services/payment-retry-service.js';
import { ReferenceNotFound } from '../../core/providers/provider-error.js';
import type { CoreTables } from '../../core/tables.js';
import type { CustomerId, PaymentId, SubscriptionId } from '../../core/types.js';
import type { DunningTables } from '../tables.js';
import type { DunningTickReport } from '../failures.js';
import type { PaymentsConfigurationInvalid } from '../../core/failures.js';
import type { CommunicationOrchestrationConfig } from './communication-service.js';
import type { DunningDatabase } from '../repository.js';
/**
 * What an event handler that updates the risk profile can return: a stored amount money refuses, an unknown
 * customer, or the risk profile write's `schema.invalid_input`.
 */
type HandlerFailure = MoneyFailure | FailureOf<typeof ReferenceNotFound> | SchemaFailure;
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
    private constructor();
    /**
     * Builds the service, or returns `payments.configuration_invalid` for a channel setting in
     * `config.communication` that no provider can use (see `createCommunicationOrchestrationService`).
     */
    static create(db: DunningDatabase, coreTables: DunningIntegrationCoreTables, dunningTables: DunningIntegrationDunningTables, config: DunningIntegrationConfig, paymentRetryService?: PaymentRetryService): DunningIntegrationService | FailureOf<typeof PaymentsConfigurationInvalid>;
    /**
     * Handle payment failure events from the payment system.
     *
     * A campaign whose stored spend range is not valid money (`@arki/money` refuses it) is skipped, and the
     * first such failure is returned after the other campaigns have run, so one bad campaign stops no other.
     * A customer, payment or subscription the event names with no row returns `ReferenceNotFound` (a payment
     * with no subscription only has no retries). A campaign run that throws (a database error) is thrown,
     * never logged and dropped, so the caller can retry the event.
     */
    handlePaymentFailure(event: {
        paymentId: PaymentId;
        customerId: CustomerId;
        subscriptionId?: SubscriptionId;
        failureReason: string;
        amount: Money;
        failureCount: number;
        metadata?: Record<string, unknown>;
    }): Promise<void | HandlerFailure>;
    /**
     * Handle subscription status changes. An unknown customer returns `ReferenceNotFound` (`kind: 'customer'`)
     * from the risk profile update, before any campaign runs. The subscription id is not looked up: an
     * unknown one returns no failure (the campaigns pick customers from stored subscriptions). A row
     * deleted while a campaign schedules returns its `ReferenceNotFound`, and a stored segment range money
     * refuses its `MoneyFailure`. A campaign run that throws is thrown, so the caller can retry the event.
     */
    handleSubscriptionStatusChange(event: {
        subscriptionId: SubscriptionId;
        customerId: CustomerId;
        oldStatus: string;
        newStatus: string;
        metadata?: Record<string, unknown>;
    }): Promise<void | HandlerFailure>;
    /**
     * Handle trial ending notifications. The customer and subscription ids are not looked up: an unknown
     * one matches no stored trial, so no campaign runs and no failure is returned. A row deleted while a
     * campaign schedules returns its `ReferenceNotFound`, and a stored segment range money refuses its
     * `MoneyFailure`. A campaign run that throws is thrown, so the caller can retry the event.
     */
    handleTrialEnding(event: {
        subscriptionId: SubscriptionId;
        customerId: CustomerId;
        trialEndDate: Instant;
        daysUntilEnd: number;
        metadata?: Record<string, unknown>;
    }): Promise<void | HandlerFailure>;
    /**
     * Handle successful payment events (can stop dunning campaigns). An unknown customer returns
     * `ReferenceNotFound`; a database error while stopping the active executions is thrown, never logged
     * and dropped, so the caller can retry the event.
     */
    handlePaymentSuccess(event: {
        paymentId: PaymentId;
        customerId: CustomerId;
        subscriptionId?: SubscriptionId;
        amount: Money;
        metadata?: Record<string, unknown>;
    }): Promise<void | HandlerFailure>;
    /**
     * Execute a specific campaign for a customer. A customer, subscription or payment the event names
     * with no row returns its `ReferenceNotFound`. A campaign deleted, paused or emptied since it was
     * listed as active is skipped (the other campaigns still run).
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
     * Stop active dunning campaigns when payment succeeds (if configured). The executions are cancelled
     * in one statement: a database error is thrown, so a caller never sees success while dunning goes on.
     * An id no row can hold (U+0000) has no executions to stop, answered without a query.
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
     * processing time, in milliseconds, recorded on completed executions. Precondition (anything else
     * throws an invariant failure and runs no query): `days` is a whole number from 0 to `MAX_DUNNING_DAYS`
     * (100 years).
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
 * Factory function to create DunningIntegrationService: {@link DunningIntegrationService.create}.
 */
export declare function createDunningIntegrationService(db: DunningDatabase, coreTables: DunningIntegrationCoreTables, dunningTables: DunningIntegrationDunningTables, config: DunningIntegrationConfig, paymentRetryService?: PaymentRetryService): DunningIntegrationService | import("@arki/failure").Failure<"payments.configuration_invalid", {
    setting: string;
    problem: string;
}>;
export {};
//# sourceMappingURL=integration-service.d.ts.map