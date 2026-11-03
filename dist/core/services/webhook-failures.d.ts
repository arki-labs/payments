/**
 * The webhook validator refused the delivery: a bad or missing signature, a source address that is
 * not allowed, a timestamp outside the window, a replayed delivery, or no webhook secret. `reason`
 * is the validator's own text, for logs only; branch on the code. Nothing was stored.
 *
 * @fix Check the webhook secret and the provider's signing setup. A resend of the same delivery is refused again.
 * @verify bun run test -- src/core/services/webhook-handler.test.ts
 */
export declare const WebhookRejected: import("@arki/failure").FailureDefinition<"payments.webhook_rejected", import("@standard-schema/spec").StandardSchemaV1<{
    reason: string;
    retryable: false;
}, {
    reason: string;
    retryable: false;
}>>;
/**
 * The event body does not have the fields the handler reads: no `id` or `type`, or a
 * `data.object` that does not match the event type (a Stripe subscription with no items, a
 * PaymentIntent with no id). `cause` holds the schema's `InvalidInput` when a schema refused it.
 *
 * @fix Nothing to do per event; a resend carries the same body. Check the provider's API version if it repeats.
 * @verify bun run test -- src/core/services/webhook-handler.test.ts
 */
export declare const WebhookPayloadInvalid: import("@arki/failure").FailureDefinition<"payments.webhook_payload_invalid", import("@standard-schema/spec").StandardSchemaV1<{
    retryable: false;
}, {
    retryable: false;
}>>;
/**
 * The event has been attempted `maxRetries` times and every attempt failed. The handler gives up,
 * so the provider is told to stop resending.
 *
 * @fix Read the stored `errorMessage` of the webhook event, fix its cause, then replay the event by hand.
 * @verify bun run test -- src/core/services/webhook-handler.test.ts
 */
export declare const WebhookRetriesExhausted: import("@arki/failure").FailureDefinition<"payments.webhook_retries_exhausted", import("@standard-schema/spec").StandardSchemaV1<{
    webhookId: `wh${string}`;
    attempts: number;
    retryable: false;
}, {
    webhookId: `wh${string}`;
    attempts: number;
    retryable: false;
}>>;
/**
 * Another delivery of the same event is running it now, inside its lease. This copy did not run it.
 * Not a success: if the running attempt crashes, only a resend processes the event.
 *
 * @fix Nothing; answer non-2xx so the provider resends later.
 * @verify bun run test -- src/core/services/webhook-handler.test.ts
 */
export declare const WebhookInProgress: import("@arki/failure").FailureDefinition<"payments.webhook_in_progress", import("@standard-schema/spec").StandardSchemaV1<{
    webhookId: `wh${string}`;
    retryable: true;
}, {
    webhookId: `wh${string}`;
    retryable: true;
}>>;
/**
 * The event is about a payment or subscription with no local row for its provider id. Retryable on
 * purpose: the provider can send the webhook before the app's own insert of that row commits, and a
 * later resend then finds it. A subscription made outside the app keeps failing until `maxRetries`
 * gives it up (`WebhookRetriesExhausted`); no owner is invented.
 *
 * @fix Nothing for a row about to commit. For a payment or subscription made outside the app, create it locally first.
 * @verify bun run test -- src/core/services/webhook-handler.test.ts
 */
export declare const WebhookTargetNotFound: import("@arki/failure").FailureDefinition<"payments.webhook_target_not_found", import("@standard-schema/spec").StandardSchemaV1<{
    kind: "payment" | "subscription";
    providerId: string;
    retryable: true;
}, {
    kind: "payment" | "subscription";
    providerId: string;
    retryable: true;
}>>;
/**
 * The claim insert conflicted, yet no row holds the event's provider id: the new webhook id collided
 * with another row's, or the winning row was deleted between the two queries. Nothing was processed.
 *
 * @fix Nothing; a resend claims the event again with a new webhook id.
 * @verify bun run test -- src/core/services/webhook-handler.test.ts
 */
export declare const WebhookClaimConflict: import("@arki/failure").FailureDefinition<"payments.webhook_claim_conflict", import("@standard-schema/spec").StandardSchemaV1<{
    providerEventId: string;
    retryable: true;
}, {
    providerEventId: string;
    retryable: true;
}>>;
/** Every failure `processWebhook` defines for itself. */
export declare const WEBHOOK_FAILURES: readonly [import("@arki/failure").FailureDefinition<"payments.webhook_rejected", import("@standard-schema/spec").StandardSchemaV1<{
    reason: string;
    retryable: false;
}, {
    reason: string;
    retryable: false;
}>>, import("@arki/failure").FailureDefinition<"payments.webhook_payload_invalid", import("@standard-schema/spec").StandardSchemaV1<{
    retryable: false;
}, {
    retryable: false;
}>>, import("@arki/failure").FailureDefinition<"payments.webhook_retries_exhausted", import("@standard-schema/spec").StandardSchemaV1<{
    webhookId: `wh${string}`;
    attempts: number;
    retryable: false;
}, {
    webhookId: `wh${string}`;
    attempts: number;
    retryable: false;
}>>, import("@arki/failure").FailureDefinition<"payments.webhook_in_progress", import("@standard-schema/spec").StandardSchemaV1<{
    webhookId: `wh${string}`;
    retryable: true;
}, {
    webhookId: `wh${string}`;
    retryable: true;
}>>, import("@arki/failure").FailureDefinition<"payments.webhook_target_not_found", import("@standard-schema/spec").StandardSchemaV1<{
    kind: "payment" | "subscription";
    providerId: string;
    retryable: true;
}, {
    kind: "payment" | "subscription";
    providerId: string;
    retryable: true;
}>>, import("@arki/failure").FailureDefinition<"payments.webhook_claim_conflict", import("@standard-schema/spec").StandardSchemaV1<{
    providerEventId: string;
    retryable: true;
}, {
    providerEventId: string;
    retryable: true;
}>>];
/** One of `WEBHOOK_FAILURES`. Read `data.retryable` to choose the answer. */
export type WebhookFailure = ReturnType<(typeof WEBHOOK_FAILURES)[number]>;
/** True for a failure from `WEBHOOK_FAILURES`, by its code. */
export declare function isWebhookFailure(value: unknown): value is WebhookFailure;
//# sourceMappingURL=webhook-failures.d.ts.map