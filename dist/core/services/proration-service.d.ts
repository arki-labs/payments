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
/** All in the plans' currency. Plans in two currencies are refused with `PlanCurrencyMismatch`. */
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
    /**
     * What moving the subscription to `newPlanId` at `options.effectiveDate` (default now) credits and
     * charges. Returns the calculation, or a failure: `ReferenceNotFound` (subscription or plan),
     * `PlanInactive`, `PlanCurrencyMismatch`, or `EffectiveDateOutsidePeriod`.
     */
    calculateProration(subscriptionId: SubscriptionId, newPlanId: PlanId, options: ProrationOptions): Promise<import("@arki/failure").Failure<"payments.effective_date_outside_period", {
        subscriptionId: string;
        effectiveDate: string;
        periodStart: string;
        periodEnd: string;
    }> | import("@arki/failure").Failure<"payments.plan_currency_mismatch", {
        currentPlanId: string;
        newPlanId: string;
        currentCurrency: string;
        newCurrency: string;
    }> | import("@arki/failure").Failure<"payments.plan_inactive", {
        planId: string;
    }> | import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | ProrationCalculation>;
    /** The preview of a move to `newPlanId`, or a failure of `calculateProration`. */
    previewSubscriptionChange(subscriptionId: SubscriptionId, newPlanId: PlanId, options?: ProrationOptions): Promise<import("@arki/failure").Failure<"payments.effective_date_outside_period", {
        subscriptionId: string;
        effectiveDate: string;
        periodStart: string;
        periodEnd: string;
    }> | import("@arki/failure").Failure<"payments.plan_currency_mismatch", {
        currentPlanId: string;
        newPlanId: string;
        currentCurrency: string;
        newCurrency: string;
    }> | import("@arki/failure").Failure<"payments.plan_inactive", {
        planId: string;
    }> | import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | {
        planId: `plan${string}`;
        proration: {
            immediateTotal: {
                amount: string;
                currency: string;
            };
            nextInvoiceTotal: {
                amount: string;
                currency: string;
            };
            creditApplied: {
                amount: string;
                currency: string;
            };
        };
        trialEnd?: import("temporal-spec").Temporal.Instant | undefined;
        nextBillingDate: import("temporal-spec").Temporal.Instant;
    }>;
    /**
     * A preview per plan. A plan whose preview is refused (inactive, another currency, unknown) is
     * left out and logged at WARN with its failure code.
     */
    previewMultiplePlanChanges(subscriptionId: SubscriptionId, planIds: PlanId[], options?: ProrationOptions): Promise<Record<string, SubscriptionPreview>>;
    /** Whether to change now or at the next billing cycle, or a failure of `calculateProration`. */
    getOptimalChangeTimings(subscriptionId: SubscriptionId, newPlanId: PlanId): Promise<import("@arki/failure").Failure<"payments.effective_date_outside_period", {
        subscriptionId: string;
        effectiveDate: string;
        periodStart: string;
        periodEnd: string;
    }> | import("@arki/failure").Failure<"payments.plan_currency_mismatch", {
        currentPlanId: string;
        newPlanId: string;
        currentCurrency: string;
        newCurrency: string;
    }> | import("@arki/failure").Failure<"payments.plan_inactive", {
        planId: string;
    }> | import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | {
        immediate: ProrationCalculation;
        nextBillingCycle: ProrationCalculation;
        recommendations: {
            bestOption: 'immediate' | 'next_cycle';
            reason: string;
            savings?: Money;
        };
    }>;
    /** What is left of the period at `effectiveDate`, or `EffectiveDateOutsidePeriod`. */
    private calculateRemainingTime;
    /**
     * The part of `price` for the time left, split by `allocate`: the part left
     * and the part used always add up to the price exactly, so a credit never
     * gives back a cent more or less than was paid for the period.
     */
    private remainingShare;
    private calculateProrationCosts;
    private calculateNextBillingDate;
    /** A plain-language summary of a move to `newPlanId`, or a failure of `calculateProration`. */
    generateProrationSummary(subscriptionId: SubscriptionId, newPlanId: PlanId, options: ProrationOptions): Promise<import("@arki/failure").Failure<"payments.effective_date_outside_period", {
        subscriptionId: string;
        effectiveDate: string;
        periodStart: string;
        periodEnd: string;
    }> | import("@arki/failure").Failure<"payments.plan_currency_mismatch", {
        currentPlanId: string;
        newPlanId: string;
        currentCurrency: string;
        newCurrency: string;
    }> | import("@arki/failure").Failure<"payments.plan_inactive", {
        planId: string;
    }> | import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | {
        title: string;
        description: string;
        breakdown: {
            label: string;
            amount: Money;
            description?: string;
        }[];
        totalChange: Money<string>;
        effectiveDate: string;
    }>;
}
export declare function createProrationService(paymentRepository: ProrationReads): ProrationService;
export {};
//# sourceMappingURL=proration-service.d.ts.map