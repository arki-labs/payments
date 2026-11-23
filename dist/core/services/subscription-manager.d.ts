import type { UserId } from '../user-id.js';
import type { Instant } from '@arki/date';
import type { IdGenerationFailure } from '@arki/contracts';
import type { FailureOf, Result, SchemaFailure } from '@arki/failure';
import type { CommandNotFound } from '@arki/journal';
import type { MoneyFailure } from '@arki/money';
import type { PaymentsConfigurationInvalid } from '../failures.js';
import type { CoreWrites } from '../journal.js';
import type { JournalWriteFailure } from '../journal/support.js';
import type { CardDeclined, IdempotencyConflict } from '../providers/provider-error.js';
import type { BasePaymentProvider } from '../providers/base-provider.js';
import type { PaymentRepository } from '../repository.js';
import type { PlanId, Subscription, SubscriptionId, SubscriptionPreview, SubscriptionStatus } from '../types.js';
import { PlanInactive, SubscriptionAlreadyActive, SubscriptionInvalidState } from '../failures.js';
import { ReferenceNotFound } from '../providers/provider-error.js';
type NotFound = FailureOf<typeof ReferenceNotFound>;
type InvalidState = FailureOf<typeof SubscriptionInvalidState>;
type Inactive = FailureOf<typeof PlanInactive>;
type AlreadyActive = FailureOf<typeof SubscriptionAlreadyActive>;
type Declined = FailureOf<typeof CardDeclined>;
type Conflict = FailureOf<typeof IdempotencyConflict>;
/** The provider was built without what the call needs, such as Stripe's `references` (`payments.configuration_invalid`). */
type NotConfigured = FailureOf<typeof PaymentsConfigurationInvalid>;
/** What a `writes.*` call here returns besides the row: a journal failure, or no row to change. */
type StoreFailure = JournalWriteFailure | CommandNotFound;
export type SubscriptionChangeOptions = {
    prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
    immediateChange?: boolean;
    effectiveDate?: Instant;
};
/** A plan change that went through: the provider's subscription, and the preview it was made from. */
export type SubscriptionChange = {
    subscription: Subscription;
    preview: SubscriptionPreview;
};
export type SubscriptionCreationOptions = {
    trialPeriodDays?: number;
    paymentMethodId?: string;
    metadata?: Record<string, unknown>;
    automaticTax?: boolean;
};
export type SubscriptionCancellationOptions = {
    immediately?: boolean;
    reason?: string;
    provideFeedback?: boolean;
    effectiveDate?: Instant;
};
export type SubscriptionAnalytics = {
    totalSubscriptions: number;
    activeSubscriptions: number;
    churnRate: number;
    averageRevenuePerUser: number;
    monthlyRecurringRevenue: number;
    annualRecurringRevenue: number;
    subscriptionsByTier: Record<string, number>;
    subscriptionsByStatus: Record<SubscriptionStatus, number>;
};
/** The provider calls the manager makes. A `BasePaymentProvider` fits. */
type SubscriptionProvider = Pick<BasePaymentProvider, 'createSubscription' | 'updateSubscription' | 'cancelSubscription' | 'reactivateSubscription' | 'pauseSubscription' | 'resumeSubscription' | 'getSubscription' | 'previewSubscriptionChange'>;
/** The repository reads the manager makes. A `PaymentRepository` fits. */
type SubscriptionReads = Pick<PaymentRepository, 'findCustomerByUserId' | 'findPlanById' | 'findActiveSubscriptionByUserId' | 'findSubscriptionById' | 'findSubscriptionsByUserId' | 'findSubscriptionsEndingInRange' | 'findSubscriptionsByStatus' | 'getSubscriptionStats' | 'getPaymentStats'>;
/**
 * Reads come from the repository. Every change of a `subscriptions` row goes
 * through `writes`: one journal command each, so each change leaves an event.
 */
export declare class SubscriptionManager {
    private readonly paymentProvider;
    private readonly paymentRepository;
    private readonly writes;
    constructor(paymentProvider: SubscriptionProvider, paymentRepository: SubscriptionReads, writes: CoreWrites);
    /**
     * Start a subscription for a user who has a customer and no active subscription. Returns the
     * provider's subscription, or a failure: `ReferenceNotFound` (no customer for the user, or no
     * plan), `PlanInactive`, `SubscriptionAlreadyActive`, or what the provider returned (its
     * `InvalidInput` for `options.metadata` no column or provider can hold among them).
     * `options.trialPeriodDays`, when given, is a whole number from 1 to 365, as the contract says (a
     * precondition: anything else throws an invariant failure before any read).
     */
    createSubscription(userId: UserId, planId: PlanId, options?: SubscriptionCreationOptions): Promise<Result<Subscription, Declined | Conflict | NotFound | NotConfigured | IdGenerationFailure | Inactive | AlreadyActive | SchemaFailure>>;
    /**
     * Move an active subscription to another active plan. Returns the provider's subscription and
     * the preview, or a failure: `ReferenceNotFound`, `SubscriptionInvalidState`, `PlanInactive`,
     * what the provider returned, or the refusal of the journal write.
     */
    updateSubscription(subscriptionId: SubscriptionId, newPlanId: PlanId, options?: SubscriptionChangeOptions): Promise<SubscriptionChange | NotFound | InvalidState | Inactive | MoneyFailure | Declined | Conflict | NotConfigured | SchemaFailure | StoreFailure>;
    /**
     * Set or clear "ends when the paid period ends". The provider changes the flag, then the row follows.
     * Unlike `cancelSubscription` it never cancels now, and `false` undoes an earlier `true`.
     */
    setCancelAtPeriodEnd(subscriptionId: SubscriptionId, cancelAtPeriodEnd: boolean): Promise<Subscription | NotFound | NotConfigured | InvalidState | Declined | Conflict | SchemaFailure | StoreFailure>;
    cancelSubscription(subscriptionId: SubscriptionId, options?: SubscriptionCancellationOptions): Promise<Subscription | NotFound | NotConfigured | InvalidState | Conflict | StoreFailure>;
    reactivateSubscription(subscriptionId: SubscriptionId): Promise<Subscription | NotFound | NotConfigured | InvalidState | StoreFailure>;
    pauseSubscription(subscriptionId: SubscriptionId): Promise<Subscription | NotFound | NotConfigured | InvalidState | StoreFailure>;
    resumeSubscription(subscriptionId: SubscriptionId): Promise<Subscription | NotFound | NotConfigured | InvalidState | StoreFailure>;
    /** The stored subscription when its status is one of `allowed`, or the failure that refuses `action`. */
    private subscriptionIn;
    /** The stored subscription unless it is missing or already canceled. */
    private subscriptionNotCanceled;
    /** The plan when it exists and is offered, or `ReferenceNotFound` / `PlanInactive`. */
    private activePlan;
    getSubscription(subscriptionId: SubscriptionId): Promise<Subscription | null>;
    getUserSubscriptions(userId: UserId): Promise<Subscription[]>;
    getActiveSubscription(userId: UserId): Promise<Subscription | null>;
    /**
     * What a move to `newPlanId` would cost, from the provider. Returns the preview, or a failure:
     * `ReferenceNotFound`, `PlanInactive`, or what the provider returned (its `InvalidInput` among them).
     */
    previewSubscriptionChange(subscriptionId: SubscriptionId, newPlanId: PlanId, options?: SubscriptionChangeOptions): Promise<Result<SubscriptionPreview, NotFound | NotConfigured | Inactive | MoneyFailure | SchemaFailure>>;
    /**
     * Trialing subscriptions whose period (the trial) ends in the local calendar day
     * `daysBeforeExpiration` days from now. `daysBeforeExpiration` is a whole number from 0 to 365 (a
     * precondition: anything else throws).
     */
    handleTrialEndingSoon(daysBeforeExpiration?: number): Promise<Subscription[]>;
    /** Every past due subscription. */
    handlePastDueSubscriptions(): Promise<Subscription[]>;
    /** Subscription and revenue figures for the range. A time given falls in the years 1 to 9999 (a precondition: anything else throws an invariant failure). */
    getSubscriptionAnalytics(startDate?: Instant, endDate?: Instant): Promise<SubscriptionAnalytics>;
    /**
     * Store what the provider holds for the subscription. Returns the stored row, or a failure:
     * `ReferenceNotFound` (`missing: 'row'` when we hold no such subscription, `missing: 'provider_id'`
     * when the provider has none for it), the provider's `PaymentsConfigurationInvalid` (built without what
     * the read needs), or the refusal of the journal write.
     */
    syncSubscriptionWithProvider(subscriptionId: SubscriptionId): Promise<Subscription | NotFound | NotConfigured | JournalWriteFailure>;
    /**
     * Whether the user may use the product: an `active` or `trialing` subscription (newest first)
     * grants access, as `getEntitlement` does, and with `requiredTiers` its plan must be in one of
     * them. Without one, `subscription` is the user's newest subscription, if any, and `reason` says why.
     */
    validateSubscriptionAccess(userId: UserId, requiredTiers?: string[]): Promise<{
        hasAccess: boolean;
        subscription: Subscription | null;
        reason?: string;
    }>;
}
export declare function createSubscriptionManager(paymentProvider: BasePaymentProvider, paymentRepository: PaymentRepository, writes: CoreWrites): SubscriptionManager;
export {};
//# sourceMappingURL=subscription-manager.d.ts.map