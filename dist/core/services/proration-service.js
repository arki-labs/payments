import { fromDate, isAfter, isBefore, now, toDate, toMillis } from '@arki/date';
import { isFailure } from '@arki/failure';
import { getLogger } from '@arki/log';
import { max, Money } from '@arki/money';
import { formatMoney } from '@arki/money/format';
import { EffectiveDateOutsidePeriod, PlanCurrencyMismatch, PlanInactive } from '../failures.js';
import { planPrice } from '../money.js';
import { ReferenceNotFound } from '../providers/provider-error.js';
const logger = getLogger('arki:payments:proration');
/** A change charged and credited for the time left, starting now. */
const DEFAULT_PRORATION = { prorationBehavior: 'create_prorations' };
export class ProrationService {
    paymentRepository;
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }
    /**
     * What moving the subscription to `newPlanId` at `options.effectiveDate` (default now) credits and
     * charges. Returns the calculation, or a failure: `ReferenceNotFound` (subscription or plan),
     * `PlanInactive`, `PlanCurrencyMismatch`, or `EffectiveDateOutsidePeriod`.
     */
    async calculateProration(subscriptionId, newPlanId, options) {
        const subscriptionWithPlan = await this.paymentRepository.findSubscriptionById(subscriptionId);
        if (!subscriptionWithPlan)
            return ReferenceNotFound({ kind: 'subscription', id: subscriptionId, missing: 'row' });
        const newPlan = await this.paymentRepository.findPlanById(newPlanId);
        if (!newPlan)
            return ReferenceNotFound({ kind: 'plan', id: newPlanId, missing: 'row' });
        if (!newPlan.isActive)
            return PlanInactive({ planId: newPlanId });
        const { plan: currentPlan, ...subscription } = subscriptionWithPlan;
        if (currentPlan.currency !== newPlan.currency) {
            return PlanCurrencyMismatch({
                currentPlanId: currentPlan.id,
                newPlanId,
                currentCurrency: currentPlan.currency,
                newCurrency: newPlan.currency,
            });
        }
        const effectiveDate = options.effectiveDate || now();
        const remainingTime = this.calculateRemainingTime(subscription, effectiveDate);
        if (isFailure(remainingTime))
            return remainingTime;
        const costs = this.calculateProrationCosts(currentPlan, newPlan, remainingTime, options.prorationBehavior);
        const calculation = {
            currentPlan,
            newPlan,
            subscription,
            remainingTime,
            costs,
            effectiveDate,
        };
        return calculation;
    }
    /** The preview of a move to `newPlanId`, or a failure of `calculateProration`. */
    async previewSubscriptionChange(subscriptionId, newPlanId, options = DEFAULT_PRORATION) {
        const proration = await this.calculateProration(subscriptionId, newPlanId, options);
        if (isFailure(proration))
            return proration;
        const nextBillingDate = this.calculateNextBillingDate(proration.subscription, proration.currentPlan, proration.newPlan, proration.effectiveDate);
        const preview = {
            planId: newPlanId,
            proration: {
                immediateTotal: proration.costs.immediateCharge.toJSON(),
                nextInvoiceTotal: proration.costs.nextInvoiceTotal.toJSON(),
                creditApplied: proration.costs.unusedCredit.toJSON(),
            },
            trialEnd: proration.subscription.trialEnd ?? undefined,
            nextBillingDate,
        };
        return preview;
    }
    /**
     * A preview per plan. A plan whose preview is refused (inactive, another currency, unknown) is
     * left out and logged at WARN with its failure code.
     */
    async previewMultiplePlanChanges(subscriptionId, planIds, options = DEFAULT_PRORATION) {
        const previews = {};
        for (const planId of planIds) {
            const preview = await this.previewSubscriptionChange(subscriptionId, planId, options);
            if (isFailure(preview)) {
                logger.warn('No preview of plan {planId} for subscription {subscriptionId}: {code}', {
                    planId,
                    subscriptionId,
                    code: preview.code,
                    failure: preview,
                });
                continue;
            }
            previews[planId] = preview;
        }
        return previews;
    }
    /** Whether to change now or at the next billing cycle, or a failure of `calculateProration`. */
    async getOptimalChangeTimings(subscriptionId, newPlanId) {
        const immediate = await this.calculateProration(subscriptionId, newPlanId, {
            prorationBehavior: 'create_prorations',
            effectiveDate: now(),
        });
        if (isFailure(immediate))
            return immediate;
        const nextBillingCycle = await this.calculateProration(subscriptionId, newPlanId, {
            prorationBehavior: 'none',
            effectiveDate: immediate.subscription.currentPeriodEnd,
        });
        if (isFailure(nextBillingCycle))
            return nextBillingCycle;
        let bestOption = 'immediate';
        let reason = 'Immediate change provides better value';
        let savings;
        const immediateCost = immediate.costs.immediateCharge;
        const nextCycleCost = nextBillingCycle.costs.nextInvoiceTotal;
        const newPrice = planPrice(immediate.newPlan);
        const currentPrice = planPrice(immediate.currentPlan);
        if (nextCycleCost.lt(immediateCost)) {
            bestOption = 'next_cycle';
            reason = 'Waiting until next billing cycle saves money';
            savings = immediateCost.minus(nextCycleCost);
        }
        else if (newPrice.lt(currentPrice)) {
            bestOption = 'immediate';
            reason = 'Start saving immediately with lower-tier plan';
        }
        else if (newPrice.gt(currentPrice) && immediateCost.gt(newPrice)) {
            bestOption = 'next_cycle';
            reason = 'Avoid double-billing by waiting for next cycle';
            savings = immediateCost.minus(nextCycleCost);
        }
        const recommendations = {
            bestOption,
            reason,
            savings,
        };
        return { immediate, nextBillingCycle, recommendations };
    }
    /** What is left of the period at `effectiveDate`, or `EffectiveDateOutsidePeriod`. */
    calculateRemainingTime(subscription, effectiveDate) {
        const currentPeriodStart = subscription.currentPeriodStart;
        const currentPeriodEnd = subscription.currentPeriodEnd;
        const effective = effectiveDate;
        // An empty stored period (start == end) has no time to split, so no date is inside it
        if (!isBefore(currentPeriodStart, currentPeriodEnd) ||
            isBefore(effective, currentPeriodStart) ||
            isAfter(effective, currentPeriodEnd)) {
            return EffectiveDateOutsidePeriod({
                subscriptionId: subscription.id,
                effectiveDate: effective.toString(),
                periodStart: currentPeriodStart.toString(),
                periodEnd: currentPeriodEnd.toString(),
            });
        }
        const totalPeriodMs = toMillis(currentPeriodEnd) - toMillis(currentPeriodStart);
        const remainingMs = toMillis(currentPeriodEnd) - toMillis(effective);
        const days = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
        const percentage = (remainingMs / totalPeriodMs) * 100;
        const remaining = {
            days,
            percentage: Math.round(percentage * 100) / 100,
            remainingMs,
            totalPeriodMs,
        };
        return remaining;
    }
    /**
     * The part of `price` for the time left, split by `allocate`: the part left
     * and the part used always add up to the price exactly, so a credit never
     * gives back a cent more or less than was paid for the period.
     */
    remainingShare(price, remainingTime) {
        const [remaining] = price.allocate([
            remainingTime.remainingMs,
            remainingTime.totalPeriodMs - remainingTime.remainingMs,
        ]);
        if (!remaining) {
            throw new Error('allocate returned no parts');
        }
        return remaining;
    }
    calculateProrationCosts(currentPlan, newPlan, remainingTime, prorationBehavior) {
        const currentPrice = planPrice(currentPlan);
        const newPrice = planPrice(newPlan);
        // `calculateProration` refused plans in two currencies, so a credit always meets a charge in one currency
        const zero = Money.zero(newPrice.currency);
        const currentPlanProrated = this.remainingShare(currentPrice, remainingTime);
        const newPlanProrated = this.remainingShare(newPrice, remainingTime);
        let unusedCredit = zero;
        let immediateCharge = zero;
        const nextInvoiceTotal = newPrice;
        switch (prorationBehavior) {
            case 'create_prorations': {
                unusedCredit = currentPlanProrated;
                immediateCharge = max(zero, newPlanProrated.minus(unusedCredit));
                break;
            }
            case 'none': {
                break;
            }
            case 'always_invoice': {
                immediateCharge = newPlanProrated;
                break;
            }
        }
        return { unusedCredit, newPlanProrated, immediateCharge, nextInvoiceTotal };
    }
    calculateNextBillingDate(subscription, currentPlan, newPlan, effectiveDate) {
        if (newPlan.interval !== currentPlan.interval) {
            // Local-time calendar steps, as before: the working value stays a `Date` until it is returned.
            const nextBilling = toDate(effectiveDate);
            switch (newPlan.interval) {
                case 'monthly': {
                    nextBilling.setMonth(nextBilling.getMonth() + (newPlan.intervalCount || 1));
                    break;
                }
                case 'yearly': {
                    nextBilling.setFullYear(nextBilling.getFullYear() + (newPlan.intervalCount || 1));
                    break;
                }
                case 'weekly': {
                    nextBilling.setDate(nextBilling.getDate() + 7 * (newPlan.intervalCount || 1));
                    break;
                }
                case 'daily': {
                    nextBilling.setDate(nextBilling.getDate() + (newPlan.intervalCount || 1));
                    break;
                }
            }
            return fromDate(nextBilling);
        }
        return subscription.currentPeriodEnd;
    }
    /** A plain-language summary of a move to `newPlanId`, or a failure of `calculateProration`. */
    async generateProrationSummary(subscriptionId, newPlanId, options) {
        const proration = await this.calculateProration(subscriptionId, newPlanId, options);
        if (isFailure(proration))
            return proration;
        const newPrice = planPrice(proration.newPlan);
        const isUpgrade = newPrice.gt(planPrice(proration.currentPlan));
        const title = isUpgrade ? 'Plan Upgrade' : 'Plan Downgrade';
        const breakdown = [];
        if (proration.costs.unusedCredit.isPositive()) {
            breakdown.push({
                label: 'Unused credit from current plan',
                amount: proration.costs.unusedCredit.negated(),
                description: `${proration.remainingTime.days} days remaining on ${proration.currentPlan.name}`,
            });
        }
        if (proration.costs.newPlanProrated.isPositive()) {
            breakdown.push({
                label: `Prorated charge for ${proration.newPlan.name}`,
                amount: proration.costs.newPlanProrated,
                description: `${proration.remainingTime.days} days at ${formatMoney(newPrice)}/${proration.newPlan.interval}`,
            });
        }
        const totalChange = proration.costs.immediateCharge;
        let description = `Your plan will change from ${proration.currentPlan.name} to ${proration.newPlan.name}`;
        if (totalChange.isPositive()) {
            description += ` with an immediate charge of ${formatMoney(totalChange)}.`;
        }
        else if (totalChange.isNegative()) {
            description += ` with a credit of ${formatMoney(totalChange.abs())}.`;
        }
        else {
            description += ' with no immediate charge.';
        }
        return {
            title,
            description,
            breakdown,
            totalChange,
            effectiveDate: proration.effectiveDate.toString().split('T')[0],
        };
    }
}
export function createProrationService(paymentRepository) {
    return new ProrationService(paymentRepository);
}
//# sourceMappingURL=proration-service.js.map