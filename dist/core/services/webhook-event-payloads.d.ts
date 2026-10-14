/**
 * Reads the two Stripe objects the webhook handler writes state from
 *
 * `event` is the whole Stripe event, `{ id, type, data: { object } }`, as the
 * signature check hands it over. A subscription event carries a Subscription
 * object, a payment event a PaymentIntent. Only the fields the handler needs
 * are checked; any other field is ignored.
 */
import type { Instant } from '@arki/date';
import type { SubscriptionStatus } from '../types.js';
/** What Stripe says a subscription looks like now, in the fields `syncSubscription` takes. */
export type StripeSubscriptionSnapshot = {
    providerSubscriptionId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Instant;
    currentPeriodEnd: Instant;
    trialStart: Instant | null;
    trialEnd: Instant | null;
    canceledAt: Instant | null;
    cancelAtPeriodEnd: boolean;
};
/** Which payment a PaymentIntent event is about, and why it failed when it did. */
export type StripePaymentIntentSnapshot = {
    providerPaymentId: string;
    failureReason: string | null;
};
/** Stripe keeps the billing period on the first subscription item. */
export declare function parseStripeSubscription(event: Record<string, unknown>): StripeSubscriptionSnapshot;
export declare function parseStripePaymentIntent(event: Record<string, unknown>): StripePaymentIntentSnapshot;
/** A refunded charge: which payment, and how much of it Stripe has refunded in total. */
export type StripeChargeSnapshot = {
    /** Null for a charge that was not made through a PaymentIntent: we hold no payment for it. */
    providerPaymentId: string | null;
    /** Total refunded so far, in Stripe's units of `currency`. */
    amountRefunded: number;
    currency: string;
    /** The refunds the charge lists. Empty when Stripe does not list them on the charge. */
    refunds: StripeChargeRefund[];
};
/** One refund of a charge, with the id our `RefundService` put in its metadata, if it made it. */
export type StripeChargeRefund = {
    providerRefundId: string;
    status: string | null;
    /** `metadata.refundId`: set when `RefundService` made the refund; null for a refund made at Stripe. */
    refundId: string | null;
};
/** A dispute: which payment, and where it stands. */
export type StripeDisputeSnapshot = {
    providerPaymentId: string | null;
    disputeId: string;
    status: string;
    reason: string | null;
};
export declare function parseStripeCharge(event: Record<string, unknown>): StripeChargeSnapshot;
/** A refund as `refund.created` and `refund.updated` carry it. */
export declare function parseStripeRefund(event: Record<string, unknown>): StripeChargeRefund;
export declare function parseStripeDispute(event: Record<string, unknown>): StripeDisputeSnapshot;
//# sourceMappingURL=webhook-event-payloads.d.ts.map