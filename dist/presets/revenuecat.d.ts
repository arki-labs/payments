import type { UserId } from '../core/user-id.js';
import { z } from '@arki/contracts';
import type { CoreWrites } from '../core/journal.js';
import type { CustomerId, PlanId } from '../core/types.js';
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
 * Project a RevenueCat event, parsed with `revenueCatWebhookSchema`, onto our `subscriptions` table through the journal command
 * `syncSubscription`, which upserts by `original_transaction_id`. `customer` and `planId` are
 * resolved by the consuming app (the customer find-or-created from its user table, the plan mapped
 * from `product_id`).
 *
 * A repeated delivery writes no event. RevenueCat sends no cancel time, so `canceledAt` is "now" on
 * every `EXPIRATION`; the command keeps the time of the first one once the row is canceled.
 *
 * A refused write is returned unchanged; the webhook route must reject it. An event not parsed by
 * the schema can carry a time `fromMillis` refuses (a fraction, or past year 9999), which throws.
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
}): Promise<import("@arki/failure").Failure<"contracts.random_source_unavailable", undefined> | import("@arki/failure").Failure<"db.transaction_cancelled", undefined> | import("@arki/failure").Failure<"db.transaction_commit_uncertain", undefined> | import("@arki/failure").Failure<"db.transaction_conflict", {
    attempts: number;
    sqlState: "40001" | "40P01";
}> | import("@arki/failure").Failure<"db.transaction_defect", undefined> | import("@arki/failure").Failure<"db.transaction_rejected", {
    sqlState: string;
}> | import("@arki/failure").Failure<"db.transaction_unavailable", undefined> | import("@arki/failure").Failure<"failure.unexpected_defect", undefined> | import("@arki/failure").Failure<"journal.conflict", {
    detail: string;
}> | import("@arki/failure").Failure<"schema.async_required", undefined> | import("@arki/failure").Failure<"schema.invalid_input", {
    issues: readonly import("@standard-schema/spec").StandardSchemaV1.Issue[];
}> | import("@arki/failure").Failure<"schema.validator_defect", undefined> | {
    handled: boolean;
}>;
//# sourceMappingURL=revenuecat.d.ts.map