import type { UserId } from '../user-id.js';
import type { Instant } from '@arki/date';
import type { IdGenerationFailure } from '@arki/contracts';
import type { FailureOf, Result } from '@arki/failure';
import type { CommandNotFound } from '@arki/journal';
import type { MoneyFailure } from '@arki/money';
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
     * plan), `PlanInactive`, `SubscriptionAlreadyActive`, or what the provider returned.
     */
    createSubscription(userId: UserId, planId: PlanId, options?: SubscriptionCreationOptions): Promise<Result<Subscription, Declined | Conflict | NotFound | IdGenerationFailure | Inactive | AlreadyActive>>;
    /**
     * Move an active subscription to another active plan. Returns the provider's subscription and
     * the preview, or a failure: `ReferenceNotFound`, `SubscriptionInvalidState`, `PlanInactive`,
     * what the provider returned, or the refusal of the journal write.
     */
    updateSubscription(subscriptionId: SubscriptionId, newPlanId: PlanId, options?: SubscriptionChangeOptions): Promise<SubscriptionChange | NotFound | InvalidState | Inactive | MoneyFailure | Declined | Conflict | StoreFailure>;
    /**
     * Set or clear "ends when the paid period ends". The provider changes the flag, then the row follows.
     * Unlike `cancelSubscription` it never cancels now, and `false` undoes an earlier `true`.
     */
    setCancelAtPeriodEnd(subscriptionId: SubscriptionId, cancelAtPeriodEnd: boolean): Promise<Subscription | NotFound | InvalidState | Declined | Conflict | StoreFailure>;
    cancelSubscription(subscriptionId: SubscriptionId, options?: SubscriptionCancellationOptions): Promise<Subscription | NotFound | InvalidState | Conflict | StoreFailure>;
    reactivateSubscription(subscriptionId: SubscriptionId): Promise<Subscription | NotFound | InvalidState | StoreFailure>;
    pauseSubscription(subscriptionId: SubscriptionId): Promise<Subscription | NotFound | InvalidState | StoreFailure>;
    resumeSubscription(subscriptionId: SubscriptionId): Promise<Subscription | NotFound | InvalidState | StoreFailure>;
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
     * `ReferenceNotFound`, `PlanInactive`, or what the provider returned.
     */
    previewSubscriptionChange(subscriptionId: SubscriptionId, newPlanId: PlanId, options?: SubscriptionChangeOptions): Promise<Result<SubscriptionPreview, NotFound | Inactive | MoneyFailure>>;
    /** Trialing subscriptions whose period ends in the local calendar day `daysBeforeExpiration` days from now. */
    handleTrialEndingSoon(daysBeforeExpiration?: number): Promise<Subscription[]>;
    /** Every past due subscription. */
    handlePastDueSubscriptions(): Promise<Subscription[]>;
    getSubscriptionAnalytics(startDate?: Instant, endDate?: Instant): Promise<SubscriptionAnalytics>;
    /**
     * Store what the provider holds for the subscription. Returns the stored row, or a failure:
     * `ReferenceNotFound` (`missing: 'row'` when we hold no such subscription, `missing: 'provider_id'`
     * when the provider has none for it), or the refusal of the journal write.
     */
    syncSubscriptionWithProvider(subscriptionId: SubscriptionId): Promise<Subscription | NotFound | JournalWriteFailure>;
    validateSubscriptionAccess(userId: UserId, requiredTiers?: string[]): Promise<{
        hasAccess: boolean;
        subscription: Subscription | null;
        reason?: string;
    }>;
}
export declare function createSubscriptionManager(paymentProvider: BasePaymentProvider, paymentRepository: PaymentRepository, writes: CoreWrites): SubscriptionManager;
export {};
//# sourceMappingURL=subscription-manager.d.ts.map