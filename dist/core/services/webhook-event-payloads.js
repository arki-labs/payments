/**
 * Reads the two Stripe objects the webhook handler writes state from
 *
 * `event` is the whole Stripe event, `{ id, type, data: { object } }`, as the
 * signature check hands it over. A subscription event carries a Subscription
 * object, a payment event a PaymentIntent. Only the fields the handler needs
 * are checked; any other field is ignored.
 *
 * Each parser is a door for outside data: a body that does not match returns the schema's
 * `InvalidInput` (from `parse` in `@arki/schema`), never a throw.
 */
import { z } from '@arki/contracts';
import { fromUnix } from '@arki/date';
import { isFailure } from '@arki/failure';
import { parse } from '@arki/schema';
import { pgVarcharSchema } from '../pg-values.js';
import { subscriptionStatusValues } from '../primitives.js';
/** A Stripe object id as the `provider_*_id` columns hold it: 1 to 255 characters, no U+0000. */
const stripeIdSchema = pgVarcharSchema(255).min(1);
/**
 * Unix seconds an `instant` column can store: 0001-01-01T00:00:00Z to the last second of 9999 UTC
 * (the range of `isPgInstant` in core/pg-values.ts). Postgres refuses an earlier or later time with
 * SQLSTATE 22008 or 22009, and `fromUnix` throws past the Temporal range, so the parser refuses both.
 */
const unixSeconds = z.number().int().min(-62_135_596_800).max(253_402_300_799);
const subscriptionItem = z.object({ current_period_start: unixSeconds, current_period_end: unixSeconds });
const stripeSubscriptionEvent = z.object({
    data: z.object({
        object: z.object({
            id: stripeIdSchema,
            status: z.enum(subscriptionStatusValues),
            cancel_at_period_end: z.boolean(),
            canceled_at: unixSeconds.nullable(),
            trial_start: unixSeconds.nullable(),
            trial_end: unixSeconds.nullable(),
            /** Stripe keeps the billing period on the first item, so a subscription with no items is refused. */
            items: z.object({ data: z.tuple([subscriptionItem], subscriptionItem) }),
        }),
    }),
});
const stripePaymentIntentEvent = z.object({
    data: z.object({
        object: z.object({
            id: stripeIdSchema,
            last_payment_error: z.object({ message: z.string().optional(), code: z.string().optional() }).nullish(),
        }),
    }),
});
const stripeChargeEvent = z.object({
    data: z.object({
        object: z.object({
            id: stripeIdSchema,
            payment_intent: stripeIdSchema.nullish(),
            amount_refunded: z.number().int().min(0),
            currency: z.string().length(3),
            /** Only on API versions that still list refunds on the charge. */
            refunds: z
                .object({
                data: z.array(z.object({
                    id: stripeIdSchema,
                    status: z.string().nullish(),
                    metadata: z.record(z.string(), z.string()).nullish(),
                })),
            })
                .nullish(),
        }),
    }),
});
const stripeRefundEvent = z.object({
    data: z.object({
        object: z.object({
            id: stripeIdSchema,
            status: z.string().nullish(),
            metadata: z.record(z.string(), z.string()).nullish(),
        }),
    }),
});
const stripeDisputeEvent = z.object({
    data: z.object({
        object: z.object({
            id: stripeIdSchema,
            payment_intent: stripeIdSchema.nullish(),
            status: z.string().min(1),
            reason: z.string().nullish(),
        }),
    }),
});
function instantOrNull(seconds) {
    return seconds === null ? null : fromUnix(seconds);
}
/** Stripe keeps the billing period on the first subscription item. */
export function parseStripeSubscription(event) {
    const result = parse(stripeSubscriptionEvent, event);
    if (isFailure(result))
        return result;
    const sub = result.data.object;
    const [item] = sub.items.data;
    return {
        providerSubscriptionId: sub.id,
        status: sub.status,
        currentPeriodStart: fromUnix(item.current_period_start),
        currentPeriodEnd: fromUnix(item.current_period_end),
        trialStart: instantOrNull(sub.trial_start),
        trialEnd: instantOrNull(sub.trial_end),
        canceledAt: instantOrNull(sub.canceled_at),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
}
export function parseStripePaymentIntent(event) {
    const result = parse(stripePaymentIntentEvent, event);
    if (isFailure(result))
        return result;
    const intent = result.data.object;
    return {
        providerPaymentId: intent.id,
        failureReason: intent.last_payment_error?.message ?? intent.last_payment_error?.code ?? null,
    };
}
export function parseStripeCharge(event) {
    const result = parse(stripeChargeEvent, event);
    if (isFailure(result))
        return result;
    const charge = result.data.object;
    return {
        providerPaymentId: charge.payment_intent ?? null,
        amountRefunded: charge.amount_refunded,
        currency: charge.currency,
        refunds: (charge.refunds?.data ?? []).map(refund => ({
            providerRefundId: refund.id,
            status: refund.status ?? null,
            refundId: refund.metadata?.['refundId'] ?? null,
        })),
    };
}
/** A refund as `refund.created` and `refund.updated` carry it. */
export function parseStripeRefund(event) {
    const result = parse(stripeRefundEvent, event);
    if (isFailure(result))
        return result;
    const refund = result.data.object;
    return {
        providerRefundId: refund.id,
        status: refund.status ?? null,
        refundId: refund.metadata?.['refundId'] ?? null,
    };
}
export function parseStripeDispute(event) {
    const result = parse(stripeDisputeEvent, event);
    if (isFailure(result))
        return result;
    const dispute = result.data.object;
    return {
        providerPaymentId: dispute.payment_intent ?? null,
        disputeId: dispute.id,
        status: dispute.status,
        reason: dispute.reason ?? null,
    };
}
//# sourceMappingURL=webhook-event-payloads.js.map