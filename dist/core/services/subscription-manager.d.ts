import type { UserId } from '../user-id.js';
import type { Instant } from '@arki/date';
import type { CoreWrites } from '../journal.js';
import type { BasePaymentProvider } from '../providers/base-provider.js';
import type { PaymentRepository } from '../repository.js';
import type { PlanId, Subscription, SubscriptionId, SubscriptionPreview, SubscriptionStatus } from '../types.js';
export type SubscriptionChangeOptions = {
    prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
    immediateChange?: boolean;
    effectiveDate?: Instant;
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
    createSubscription(userId: UserId, planId: PlanId, options?: SubscriptionCreationOptions): Promise<Subscription>;
    updateSubscription(subscriptionId: SubscriptionId, newPlanId: PlanId, options?: SubscriptionChangeOptions): Promise<{
        subscription: Subscription;
        preview: SubscriptionPreview;
    }>;
    /**
     * Set or clear "ends when the paid period ends". The provider changes the flag, then the row follows.
     * Unlike `cancelSubscription` it never cancels now, and `false` undoes an earlier `true`.
     */
    setCancelAtPeriodEnd(subscriptionId: SubscriptionId, cancelAtPeriodEnd: boolean): Promise<Subscription>;
    cancelSubscription(subscriptionId: SubscriptionId, options?: SubscriptionCancellationOptions): Promise<Subscription>;
    reactivateSubscription(subscriptionId: SubscriptionId): Promise<Subscription>;
    pauseSubscription(subscriptionId: SubscriptionId): Promise<Subscription>;
    resumeSubscription(subscriptionId: SubscriptionId): Promise<Subscription>;
    getSubscription(subscriptionId: SubscriptionId): Promise<Subscription | null>;
    getUserSubscriptions(userId: UserId): Promise<Subscription[]>;
    getActiveSubscription(userId: UserId): Promise<Subscription | null>;
    previewSubscriptionChange(subscriptionId: SubscriptionId, newPlanId: PlanId, options?: SubscriptionChangeOptions): Promise<SubscriptionPreview>;
    handleTrialEndingSoon(daysBeforeExpiration?: number): Promise<Subscription[]>;
    handlePastDueSubscriptions(): Promise<Subscription[]>;
    getSubscriptionAnalytics(startDate?: Instant, endDate?: Instant): Promise<SubscriptionAnalytics>;
    syncSubscriptionWithProvider(subscriptionId: SubscriptionId): Promise<Subscription>;
    validateSubscriptionAccess(userId: UserId, requiredTiers?: string[]): Promise<{
        hasAccess: boolean;
        subscription: Subscription | null;
        reason?: string;
    }>;
}
export declare function createSubscriptionManager(paymentProvider: BasePaymentProvider, paymentRepository: PaymentRepository, writes: CoreWrites): SubscriptionManager;
export {};
//# sourceMappingURL=subscription-manager.d.ts.map