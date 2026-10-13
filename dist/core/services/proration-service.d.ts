import type { Instant } from '@arki/date';
import { Money } from '@arki/money';
import type { PaymentRepository } from '../repository.js';
import type { Plan, PlanId, Subscription, SubscriptionId, SubscriptionPreview } from '../types.js';
export type ProrationCalculation = {
    currentPlan: Plan;
    newPlan: Plan;
    subscription: Subscription;
    remainingTime: RemainingTime;
    costs: ProrationCosts;
    effectiveDate: Instant;
};
/** What is left of the current period. `percentage` is for display; costs use the exact milliseconds. */
type RemainingTime = {
    days: number;
    percentage: number;
    remainingMs: number;
    totalPeriodMs: number;
};
/** All in the plans' currency. Plans in two currencies throw `CurrencyMismatchError`. */
export type ProrationCosts = {
    unusedCredit: Money;
    newPlanProrated: Money;
    immediateCharge: Money;
    nextInvoiceTotal: Money;
};
export type ProrationOptions = {
    effectiveDate?: Instant;
    prorationBehavior: 'create_prorations' | 'none' | 'always_invoice';
    previewOnly?: boolean;
};
/** The reads the service makes. A `PaymentRepository` fits. */
type ProrationReads = Pick<PaymentRepository, 'findSubscriptionById' | 'findPlanById'>;
export declare class ProrationService {
    private readonly paymentRepository;
    constructor(paymentRepository: ProrationReads);
    calculateProration(subscriptionId: SubscriptionId, newPlanId: PlanId, options: ProrationOptions): Promise<ProrationCalculation>;
    previewSubscriptionChange(subscriptionId: SubscriptionId, newPlanId: PlanId, options?: ProrationOptions): Promise<SubscriptionPreview>;
    previewMultiplePlanChanges(subscriptionId: SubscriptionId, planIds: PlanId[], options?: ProrationOptions): Promise<Record<string, SubscriptionPreview>>;
    getOptimalChangeTimings(subscriptionId: SubscriptionId, newPlanId: PlanId): Promise<{
        immediate: ProrationCalculation;
        nextBillingCycle: ProrationCalculation;
        recommendations: {
            bestOption: 'immediate' | 'next_cycle';
            reason: string;
            savings?: Money;
        };
    }>;
    private calculateRemainingTime;
    /**
     * The part of `price` for the time left, split by `allocate`: the part left
     * and the part used always add up to the price exactly, so a credit never
     * gives back a cent more or less than was paid for the period.
     */
    private remainingShare;
    private calculateProrationCosts;
    private calculateNextBillingDate;
    generateProrationSummary(subscriptionId: SubscriptionId, newPlanId: PlanId, options: ProrationOptions): Promise<{
        title: string;
        description: string;
        breakdown: {
            label: string;
            amount: Money;
            description?: string;
        }[];
        totalChange: Money;
        effectiveDate: string;
    }>;
}
export declare function createProrationService(paymentRepository: ProrationReads): ProrationService;
export {};
//# sourceMappingURL=proration-service.d.ts.map