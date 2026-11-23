import type { IdGenerationFailure } from '@arki/contracts';
import type { FailureOf, SchemaFailure } from '@arki/failure';
import type Stripe from 'stripe';
import type { UserId } from '../core/user-id.js';
import type { Instant } from '@arki/date';
import type { CoreWrites } from '../core/journal.js';
import type { CustomerConflict } from '../core/failures.js';
import type { InvalidWebhookSignature, ReferenceNotFound } from '../core/providers/provider-error.js';
import type { StripeProvider } from '../core/providers/stripe-provider.js';
import type { PaymentRepository } from '../core/repository.js';
import type { PlanId, SubscriptionStatus } from '../core/types.js';
import { PaymentsConfigurationInvalid } from '../core/failures.js';
import { PriceNotConfigured, SubscriptionWithoutItems, UnknownProviderCustomer, UnknownSubscriptionStatus } from './failures.js';
/** The one journal write a webhook preset makes. A `CoreWrites` fits. */
type SubscriptionSync = Pick<CoreWrites, 'syncSubscription'>;
/** Why `projectStripeSubscription` stored nothing. */
type ProjectionFailure = FailureOf<typeof UnknownProviderCustomer> | FailureOf<typeof SubscriptionWithoutItems> | FailureOf<typeof UnknownSubscriptionStatus> | SchemaFailure | FailureOf<SubscriptionSync['syncSubscription']>;
/**
 * Project a Stripe Subscription object onto our `subscriptions` table.
 *
 * This is the "webhook in" half of the subscription preset: Stripe Checkout creates the
 * subscription on Stripe's side, then `customer.subscription.{created,updated,deleted}` webhooks
 * carry the truth back here. We resolve our local customer row (created at checkout) by the Stripe
 * customer id, map the Stripe fields to a provider snapshot, and hand it to the journal command
 * `syncSubscription`. The command **upserts by `providerSubscriptionId`**, so repeated or
 * out-of-order webhook deliveries converge to one row, and a delivery that changes nothing
 * writes no event. A refused write is returned unchanged; the webhook route must reject it.
 *
 * Cancellation needs no special case: a deleted/canceled subscription arrives with
 * `status: 'canceled'`, which is stored as it is.
 *
 * The event is outside data, so what cannot be stored is returned before anything is written:
 * `UnknownProviderCustomer` (no local customer row, such as a subscription made in the Stripe
 * dashboard: never invent an owner), `SubscriptionWithoutItems` (no billing period to read),
 * `UnknownSubscriptionStatus` (a status Stripe added later: never guessed) and `InvalidInput`
 * (`schema.invalid_input`: a subscription body missing a field the projection reads, an id that
 * does not fit its column, or a period, trial or cancel time that is not whole Unix seconds up to
 * year 9999). The sync's own failures come back unchanged, `ReferenceNotFound` for a plan with no row among them.
 */
export declare function projectStripeSubscription(params: {
    repo: Pick<PaymentRepository, 'findCustomerByProviderCustomerId'>;
    /** The app's journal writes: `paymentsJournal.writes(run)`. */
    writes: SubscriptionSync;
    subscription: Stripe.Subscription;
    /** Our plan-row id for the price this subscription is on (resolved from the preset config). */
    planId: PlanId;
}): Promise<undefined | ProjectionFailure>;
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
 * A `userId` holding U+0000 names no user (no row can hold it), so it is `{ tier: 'free' }`.
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
    /**
     * Free-trial length applied to new subscriptions; omit for no trial. A whole number of days from 1 to
     * 730 (Stripe's range): anything else makes `createSubscriptionBilling` return `payments.configuration_invalid`.
     */
    trialDays?: number;
    /** Enable Stripe Tax at checkout (EU VAT). Requires Stripe Tax configured on the account. */
    automaticTax?: boolean;
};
export type SubscriptionBilling = ReturnType<typeof buildSubscriptionBilling>;
/** The three Stripe events `handleWebhook` projects onto the `subscriptions` table. */
type SubscriptionEventType = 'customer.subscription.created' | 'customer.subscription.updated' | 'customer.subscription.deleted';
/** What `handleWebhook` returns for a verified event: whether it changed a subscription, and the event's type. */
export type StripeWebhookOutcome = {
    handled: boolean;
    type: SubscriptionEventType;
} | {
    handled: boolean;
    type: Exclude<Stripe.Event['type'], SubscriptionEventType>;
};
/**
 * The high-level subscription-billing preset: the whole web Stripe flow — checkout, webhook
 * projection, entitlement — behind three methods, so a consuming app wires routes instead of
 * re-implementing the Stripe dance.
 *
 * Customers are found-or-created at checkout: the `subscriptions` table's `customerId`/`planId`
 * are NOT NULL, so a local customer row must exist *before* the subscription webhook arrives (the
 * projection resolves the owning user via the Stripe customer id).
 *
 * A `trialDays` Stripe cannot take is a configuration fault: it returns `PaymentsConfigurationInvalid`
 * (`payments.configuration_invalid`) here, at boot, instead of failing every checkout.
 */
export declare function createSubscriptionBilling(config: SubscriptionBillingConfig): SubscriptionBilling | FailureOf<typeof PaymentsConfigurationInvalid>;
declare function buildSubscriptionBilling(config: SubscriptionBillingConfig): {
    /**
     * Start a hosted Checkout subscribe flow; returns the URL to redirect the browser to.
     * A price that is not in `prices` returns `PriceNotConfigured`, and a `userId` that holds U+0000 or a
     * lone surrogate, or an email the customer row cannot hold (not an address, or over 255 characters),
     * returns `InvalidInput`, all before any provider request, so no Stripe customer is left without a local row.
     */
    createCheckoutSession({ userId, email, priceId, }: {
        userId: UserId;
        email: string;
        priceId: string;
    }): Promise<Awaited<ReturnType<StripeProvider['createCheckoutSession']>> | IdGenerationFailure | FailureOf<typeof PriceNotConfigured> | FailureOf<typeof CustomerConflict> | FailureOf<typeof ReferenceNotFound> | SchemaFailure>;
    /**
     * Verify + project a Stripe webhook. Returns `InvalidWebhookSignature` for a bad signature (answer
     * it with HTTP 400), `SubscriptionWithoutItems` or `PriceNotConfigured` for a subscription it cannot
     * map to a plan, the failures of `projectStripeSubscription` (`InvalidInput` for a time that is not Unix seconds), and the journal's refused writes.
     * Nothing is written for any of them; a webhook route must not acknowledge them.
     */
    handleWebhook(payload: string | Buffer, signature: string): Promise<StripeWebhookOutcome | FailureOf<typeof InvalidWebhookSignature> | FailureOf<typeof SubscriptionWithoutItems> | FailureOf<typeof PriceNotConfigured> | ProjectionFailure>;
    /** Current Pro/free entitlement for a user, read from our table. */
    getEntitlement(userId: UserId): Promise<Entitlement>;
};
export {};
//# sourceMappingURL=subscription.d.ts.map