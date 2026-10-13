import type { UserId } from '../core/user-id.js';
import { z } from '@arki/contracts';
import type { CoreWrites } from '../core/journal.js';
import type { CustomerId, PlanId } from '../core/types.js';
/**
 * RevenueCat → our `subscriptions` table — the "native in" half of the cross-platform entitlement
 * hub. A native StoreKit/Play purchase is made on-device via the RevenueCat SDK; RevenueCat then
 * POSTs a webhook here, which we project into the SAME `subscriptions` table the web Stripe rail
 * writes to, so `getEntitlement` stays one source of truth regardless of where the purchase happened.
 *
 * Two things differ from Stripe and shape this API:
 *  1. **No server checkout** creates a customer first, so the *consuming app's webhook route* must
 *     find-or-create the customer (it knows its own user table + email) and hand the resolved
 *     `{ customerId, userId }` here — this projector does not look it up.
 *  2. **No single subscription id** — RevenueCat identifies a subscription by `original_transaction_id`
 *     (stable across renewals), which we upsert on so renewals converge to one row.
 */
/** Minimal validated shape of a RevenueCat webhook body (unknown keys are stripped). */
export declare const revenueCatWebhookSchema: z.ZodObject<{
    api_version: z.ZodOptional<z.ZodString>;
    event: z.ZodObject<{
        type: z.ZodString;
        id: z.ZodOptional<z.ZodString>;
        app_user_id: z.ZodString;
        original_app_user_id: z.ZodOptional<z.ZodString>;
        product_id: z.ZodOptional<z.ZodString>;
        period_type: z.ZodOptional<z.ZodString>;
        purchased_at_ms: z.ZodOptional<z.ZodNumber>;
        expiration_at_ms: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        store: z.ZodOptional<z.ZodString>;
        environment: z.ZodOptional<z.ZodString>;
        transaction_id: z.ZodOptional<z.ZodString>;
        original_transaction_id: z.ZodOptional<z.ZodString>;
        cancel_reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type RevenueCatWebhook = z.infer<typeof revenueCatWebhookSchema>;
export type RevenueCatEvent = RevenueCatWebhook['event'];
/**
 * Verify a RevenueCat webhook. RevenueCat sends the exact `Authorization` header value you configure
 * on the webhook in its dashboard — so this is a shared-secret comparison (there is no HMAC signature
 * like Stripe's). Uses a constant-time compare so the secret can't be recovered via response timing.
 * Returns false on any mismatch or when no secret is configured.
 */
export declare function verifyRevenueCatAuth(authHeader: string | null, expectedSecret: string): boolean;
/**
 * Project a (validated) RevenueCat event onto our `subscriptions` table through the journal command
 * `syncSubscription`, which upserts by `original_transaction_id`. `customer` and `planId` are
 * resolved by the consuming app (the customer find-or-created from its user table, the plan mapped
 * from `product_id`).
 *
 * A repeated delivery writes no event. RevenueCat sends no cancel time, so `canceledAt` is "now" on
 * every `EXPIRATION`; the command keeps the time of the first one once the row is canceled.
 *
 * Returns `{ handled: false }` for event types that aren't a subscription-state change.
 */
export declare function projectRevenueCatEvent(params: {
    /** The app's journal writes: `paymentsJournal.writes(run)`. */
    writes: Pick<CoreWrites, 'syncSubscription'>;
    event: RevenueCatEvent;
    customer: {
        id: CustomerId;
        userId: UserId;
    };
    planId: PlanId;
}): Promise<{
    handled: boolean;
}>;
//# sourceMappingURL=revenuecat.d.ts.map