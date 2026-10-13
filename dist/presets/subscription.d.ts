import type Stripe from 'stripe';
import type { UserId } from '../core/user-id.js';
import type { Instant } from '@arki/date';
import type { CoreWrites } from '../core/journal.js';
import type { StripeProvider } from '../core/providers/stripe-provider.js';
import type { PaymentRepository } from '../core/repository.js';
import type { PlanId, SubscriptionStatus } from '../core/types.js';
/** The one journal write a webhook preset makes. A `CoreWrites` fits. */
type SubscriptionSync = Pick<CoreWrites, 'syncSubscription'>;
/**
 * Project a Stripe Subscription object onto our `subscriptions` table.
 *
 * This is the "webhook in" half of the subscription preset: Stripe Checkout creates the
 * subscription on Stripe's side, then `customer.subscription.{created,updated,deleted}` webhooks
 * carry the truth back here. We resolve our local customer row (created at checkout) by the Stripe
 * customer id, map the Stripe fields to a provider snapshot, and hand it to the journal command
 * `syncSubscription`. The command **upserts by `providerSubscriptionId`**, so repeated or
 * out-of-order webhook deliveries converge to one row, and a delivery that changes nothing
 * writes no event.
 *
 * Cancellation needs no special case: a deleted/canceled subscription arrives with
 * `status: 'canceled'`, which the status map carries straight through.
 */
export declare function projectStripeSubscription(params: {
    repo: Pick<PaymentRepository, 'findCustomerByProviderCustomerId'>;
    /** The app's journal writes: `paymentsJournal.writes(run)`. */
    writes: SubscriptionSync;
    subscription: Stripe.Subscription;
    /** Our plan-row id for the price this subscription is on (resolved from the preset config). */
    planId: PlanId;
    /** Provider status → our `SubscriptionStatus` (pass `provider.mapSubscriptionStatus`). */
    mapStatus: (providerStatus: string) => SubscriptionStatus;
}): Promise<void>;
/** What the app asks for: is this user Pro, and if so, the period/trial/cancel facts behind it. */
export type Entitlement = {
    tier: 'free';
} | {
    tier: 'pro';
    status: SubscriptionStatus;
    /** End of the current paid-or-trial period — when Pro renews or lapses. */
    renews: Instant;
    /** Canceled but retains Pro until `renews`. */
    cancelAtPeriodEnd: boolean;
    /** Trial end if this subscription has/had a trial; null otherwise. */
    trialEnd: Instant | null;
};
/**
 * Read a user's current entitlement straight from our own `subscriptions` table — the single
 * source of truth. Both rails (web Stripe webhooks, native RevenueCat webhooks) project into this
 * table, so this one read answers "is Pro?" regardless of where the purchase happened.
 */
export declare function getEntitlement(repo: Pick<PaymentRepository, 'findSubscriptionsByUserId'>, userId: UserId): Promise<Entitlement>;
/** A Stripe price wired to the local plan row it represents (monthly + yearly can share a plan). */
export type PriceToPlan = {
    priceId: string;
    planId: PlanId;
};
export type SubscriptionBillingConfig = {
    provider: StripeProvider;
    /** Reads, and the customer row made at checkout. A `PaymentRepository` fits. */
    repo: Pick<PaymentRepository, 'findCustomerByUserId' | 'createCustomer' | 'findCustomerByProviderCustomerId' | 'findSubscriptionsByUserId'>;
    /** Every change of a `subscriptions` row goes through the journal: `paymentsJournal.writes(run)`. */
    writes: SubscriptionSync;
    /** Every price the app sells, each mapped to its local plan row. */
    prices: readonly PriceToPlan[];
    /** Where Checkout sends the browser back to. */
    urls: {
        success: string;
        cancel: string;
    };
    /** Free-trial length applied to new subscriptions; omit for no trial. */
    trialDays?: number;
    /** Enable Stripe Tax at checkout (EU VAT). Requires Stripe Tax configured on the account. */
    automaticTax?: boolean;
};
export type SubscriptionBilling = {
    /** Start a hosted Checkout subscribe flow; returns the URL to redirect the browser to. */
    createCheckoutSession(params: {
        userId: UserId;
        email: string;
        priceId: string;
    }): Promise<{
        url: string;
        sessionId: string;
    }>;
    /** Verify + project a Stripe webhook. Throws on a bad signature (map to HTTP 400). */
    handleWebhook(payload: string | Buffer, signature: string): Promise<{
        handled: boolean;
        type: string;
    }>;
    /** Current Pro/free entitlement for a user, read from our table. */
    getEntitlement(userId: UserId): Promise<Entitlement>;
};
/**
 * The high-level subscription-billing preset: the whole web Stripe flow — checkout, webhook
 * projection, entitlement — behind three methods, so a consuming app wires routes instead of
 * re-implementing the Stripe dance.
 *
 * Customers are found-or-created at checkout: the `subscriptions` table's `customerId`/`planId`
 * are NOT NULL, so a local customer row must exist *before* the subscription webhook arrives (the
 * projection resolves the owning user via the Stripe customer id).
 */
export declare function createSubscriptionBilling(config: SubscriptionBillingConfig): SubscriptionBilling;
export {};
//# sourceMappingURL=subscription.d.ts.map