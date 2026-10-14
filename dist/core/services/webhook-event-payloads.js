/**
 * Reads the two Stripe objects the webhook handler writes state from
 *
 * `event` is the whole Stripe event, `{ id, type, data: { object } }`, as the
 * signature check hands it over. A subscription event carries a Subscription
 * object, a payment event a PaymentIntent. Only the fields the handler needs
 * are checked; any other field is ignored.
 */
import { z } from '@arki/contracts';
import { fromUnix } from '@arki/date';
import { subscriptionStatusValues } from '../primitives.js';
const stripeSubscriptionEvent = z.object({
    data: z.object({
        object: z.object({
            id: z.string().min(1),
            status: z.enum(subscriptionStatusValues),
            cancel_at_period_end: z.boolean(),
            canceled_at: z.number().int().nullable(),
            trial_start: z.number().int().nullable(),
            trial_end: z.number().int().nullable(),
            items: z.object({
                data: z.array(z.object({ current_period_start: z.number().int(), current_period_end: z.number().int() })),
            }),
        }),
    }),
});
const stripePaymentIntentEvent = z.object({
    data: z.object({
        object: z.object({
            id: z.string().min(1),
            last_payment_error: z.object({ message: z.string().optional(), code: z.string().optional() }).nullish(),
        }),
    }),
});
const stripeChargeEvent = z.object({
    data: z.object({
        object: z.object({
            id: z.string().min(1),
            payment_intent: z.string().min(1).nullish(),
            amount_refunded: z.number().int().min(0),
            currency: z.string().length(3),
            /** Only on API versions that still list refunds on the charge. */
            refunds: z
                .object({
                data: z.array(z.object({
                    id: z.string().min(1),
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
            id: z.string().min(1),
            status: z.string().nullish(),
            metadata: z.record(z.string(), z.string()).nullish(),
        }),
    }),
});
const stripeDisputeEvent = z.object({
    data: z.object({
        object: z.object({
            id: z.string().min(1),
            payment_intent: z.string().min(1).nullish(),
            status: z.string().min(1),
            reason: z.string().nullish(),
        }),
    }),
});
function invalid(error) {
    return new Error(`Invalid webhook payload: ${error.message}`);
}
function instantOrNull(seconds) {
    return seconds === null ? null : fromUnix(seconds);
}
/** Stripe keeps the billing period on the first subscription item. */
export function parseStripeSubscription(event) {
    const result = stripeSubscriptionEvent.safeParse(event);
    if (!result.success) {
        throw invalid(result.error);
    }
    const sub = result.data.data.object;
    const item = sub.items.data[0];
    if (!item) {
        throw new Error(`Invalid webhook payload: subscription ${sub.id} has no items`);
    }
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
    const result = stripePaymentIntentEvent.safeParse(event);
    if (!result.success) {
        throw invalid(result.error);
    }
    const intent = result.data.data.object;
    return {
        providerPaymentId: intent.id,
        failureReason: intent.last_payment_error?.message ?? intent.last_payment_error?.code ?? null,
    };
}
export function parseStripeCharge(event) {
    const result = stripeChargeEvent.safeParse(event);
    if (!result.success) {
        throw invalid(result.error);
    }
    const charge = result.data.data.object;
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
    const result = stripeRefundEvent.safeParse(event);
    if (!result.success) {
        throw invalid(result.error);
    }
    const refund = result.data.data.object;
    return {
        providerRefundId: refund.id,
        status: refund.status ?? null,
        refundId: refund.metadata?.['refundId'] ?? null,
    };
}
export function parseStripeDispute(event) {
    const result = stripeDisputeEvent.safeParse(event);
    if (!result.success) {
        throw invalid(result.error);
    }
    const dispute = result.data.data.object;
    return {
        providerPaymentId: dispute.payment_intent ?? null,
        disputeId: dispute.id,
        status: dispute.status,
        reason: dispute.reason ?? null,
    };
}
//# sourceMappingURL=webhook-event-payloads.js.map