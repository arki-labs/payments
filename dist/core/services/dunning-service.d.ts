import type { Instant } from '@arki/date';
import type { Failure } from '@arki/failure';
import type { CoreWrites } from '../journal.js';
import type { BasePaymentProvider } from '../providers/base-provider.js';
import type { PaymentRepository } from '../repository.js';
import type { PaymentId, SubscriptionId } from '../types.js';
export type DunningRule = {
    id: string;
    name: string;
    enabled: boolean;
    trigger: {
        event: 'payment_failed' | 'invoice_payment_failed' | 'subscription_past_due';
        delayDays: number;
    };
    action: {
        type: 'email' | 'retry_payment' | 'pause_subscription' | 'cancel_subscription' | 'webhook';
        config: Record<string, unknown>;
    };
    retryCount?: number;
    maxRetries?: number;
};
export type DunningConfiguration = {
    gracePeriodDays: number;
    maxRetryAttempts: number;
    retrySchedule: number[];
    emailTemplates: {
        paymentFailed: string;
        trialEnding: string;
        subscriptionPaused: string;
        finalNotice: string;
    };
    rules: DunningRule[];
};
export type DunningEvent = {
    id: string;
    subscriptionId: SubscriptionId;
    paymentId?: PaymentId;
    userId: string;
    eventType: 'payment_failed' | 'retry_scheduled' | 'grace_period_ended' | 'subscription_recovered';
    /** The rule step a scheduled event runs. A recovery event has none. */
    action?: DunningRule['action'];
    data: Record<string, unknown>;
    scheduledFor?: Instant;
    processedAt?: Instant;
    createdAt: Instant;
};
export type DunningStats = {
    totalFailedPayments: number;
    recoveredPayments: number;
    recoveryRate: number;
    subscriptionsInDunning: number;
    revenueAtRisk: number;
};
/** The email an `email` step sends: the customer's address, the step's template, and what it is about. */
export type DunningEmail = {
    to: string;
    template: string;
    subscriptionId: SubscriptionId;
    paymentId: PaymentId | undefined;
    userId: string;
};
/** The call a `webhook` step makes: the step's own config, and the subscription, payment and user it is about. */
export type DunningWebhookCall = {
    eventId: string;
    subscriptionId: SubscriptionId;
    paymentId: PaymentId | undefined;
    userId: string;
    config: Record<string, unknown>;
};
/**
 * How the app delivers the steps the package cannot send itself. Each returns `undefined` once
 * delivered, or a failure when the transport refused (logged, and the step counts as done); a
 * thrown error leaves the step scheduled for the next run. A rule whose step needs a sender that is
 * missing fails when the service is built.
 */
export type DunningSenders = {
    sendEmail?: (email: DunningEmail) => Promise<Failure | undefined>;
    sendWebhook?: (call: DunningWebhookCall) => Promise<Failure | undefined>;
};
/** The provider calls dunning makes. A `BasePaymentProvider` fits. */
type DunningProvider = Pick<BasePaymentProvider, 'confirmPayment' | 'pauseSubscription' | 'cancelSubscription'>;
/** The repository reads dunning makes. A `PaymentRepository` fits. */
type DunningReads = Pick<PaymentRepository, 'findPaymentById' | 'findSubscriptionById' | 'findCustomerById' | 'getPaymentStats' | 'getSubscriptionStats'>;
/**
 * The schedule of dunning steps lives in memory. Every change of a
 * `subscriptions` row goes through `writes`: one journal command each.
 */
export declare class DunningService {
    private readonly paymentProvider;
    private readonly paymentRepository;
    private readonly writes;
    private readonly senders;
    private config;
    private dunningEvents;
    /** Throws `payments.configuration_invalid` when an enabled rule needs a sender that `senders` lacks. */
    constructor(paymentProvider: DunningProvider, paymentRepository: DunningReads, writes: CoreWrites, config?: Partial<DunningConfiguration>, senders?: DunningSenders);
    /**
     * Handle a payment failure and initiate dunning process. Returns nothing, or a failure:
     * `ReferenceNotFound` for an unknown payment or subscription (nothing is scheduled or written),
     * or the refusal of the journal write.
     */
    handlePaymentFailure(paymentId: PaymentId, subscriptionId: SubscriptionId, failureReason?: string): Promise<Failure<"contracts.random_source_unavailable", undefined> | Failure<"db.transaction_cancelled", undefined> | Failure<"db.transaction_commit_uncertain", undefined> | Failure<"db.transaction_conflict", {
        attempts: number;
        sqlState: "40001" | "40P01";
    }> | Failure<"db.transaction_defect", undefined> | Failure<"db.transaction_rejected", {
        sqlState: string;
    }> | Failure<"db.transaction_unavailable", undefined> | Failure<"failure.unexpected_defect", undefined> | Failure<"journal.conflict", {
        detail: string;
    }> | Failure<"journal.not_found", {
        detail: string;
    }> | Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | Failure<"schema.async_required", undefined> | Failure<"schema.invalid_input", {
        issues: readonly import("@standard-schema/spec").StandardSchemaV1.Issue[];
    }> | Failure<"schema.validator_defect", undefined> | undefined>;
    /**
     * Process scheduled dunning events
     */
    processDunningEvents(): Promise<void>;
    /** Process an individual dunning event. Nothing, or the failure that refused it. */
    private processEvent;
    /**
     * Send the step's email to the subscription's customer through the app's `sendEmail`. Nothing, the
     * sender's failure, or `ReferenceNotFound` when the subscription or its customer is gone.
     */
    private sendDunningEmail;
    /**
     * Retry failed payment. Nothing, or `ReferenceNotFound` when the event names no payment or an
     * unknown one. A refused retry or write is logged and ends the step.
     */
    private retryPayment;
    /**
     * Pause subscription due to payment failure
     */
    private pauseSubscription;
    /**
     * Cancel subscription due to payment failure
     */
    private cancelSubscription;
    /** Hand the step to the app's `sendWebhook`. Nothing, or the sender's failure. */
    private triggerWebhook;
    /**
     * Cancel all pending dunning events for a subscription
     */
    private cancelDunningEventsForSubscription;
    /**
     * Handle subscription recovery (payment succeeded after failure)
     */
    /** Nothing, or the failure of the write: a canceled subscription is not brought back. */
    handleSubscriptionRecovery(subscriptionId: SubscriptionId): Promise<Failure<"contracts.random_source_unavailable", undefined> | Failure<"db.transaction_cancelled", undefined> | Failure<"db.transaction_commit_uncertain", undefined> | Failure<"db.transaction_conflict", {
        attempts: number;
        sqlState: "40001" | "40P01";
    }> | Failure<"db.transaction_defect", undefined> | Failure<"db.transaction_rejected", {
        sqlState: string;
    }> | Failure<"db.transaction_unavailable", undefined> | Failure<"failure.unexpected_defect", undefined> | Failure<"journal.conflict", {
        detail: string;
    }> | Failure<"journal.not_found", {
        detail: string;
    }> | Failure<"schema.async_required", undefined> | Failure<"schema.invalid_input", {
        issues: readonly import("@standard-schema/spec").StandardSchemaV1.Issue[];
    }> | Failure<"schema.validator_defect", undefined> | undefined>;
    /**
     * Get dunning statistics for analytics
     */
    getDunningStats(startDate?: Instant, endDate?: Instant): Promise<DunningStats>;
    /**
     * Get pending dunning events for a subscription
     */
    getPendingEventsForSubscription(subscriptionId: SubscriptionId): DunningEvent[];
    /**
     * Update dunning configuration
     */
    /** Throws `payments.configuration_invalid`, and keeps the old rules, when a new rule needs a missing sender. */
    updateConfiguration(config: Partial<DunningConfiguration>): void;
    /**
     * Get current dunning configuration
     */
    getConfiguration(): DunningConfiguration;
}
export declare function createDunningService(paymentProvider: BasePaymentProvider, paymentRepository: PaymentRepository, writes: CoreWrites, config?: Partial<DunningConfiguration>, senders?: DunningSenders): DunningService;
export {};
//# sourceMappingURL=dunning-service.d.ts.map