/**
 * The card or payment method was refused. Ask for another one. Returned, not thrown, by the
 * provider calls that charge or check a card. `providerCode` is the provider's own code, such as
 * Stripe's `card_declined` or `expired_card`; `declineCode` is the bank's reason when it gave one.
 *
 * @fix Ask the customer for another card or payment method. The same one is likely refused again.
 * @verify bun run test -- src/core/providers
 */
export declare const CardDeclined: import("@arki/failure").FailureDefinition<"payments.card_declined", import("@standard-schema/spec").StandardSchemaV1<{
    providerCode?: string | undefined;
    declineCode?: string | undefined;
}, {
    providerCode?: string | undefined;
    declineCode?: string | undefined;
}>>;
/**
 * The same idempotency key was used with different parameters. Returned by the calls that take an `idempotencyKey`.
 *
 * @fix Use a new idempotency key for a different request, or resend the first request unchanged.
 * @verify bun run test -- src/core/providers
 */
export declare const IdempotencyConflict: import("@arki/failure").FailureDefinition<"payments.idempotency_conflict", undefined>;
/**
 * A customer, plan, payment or subscription id has no row (`missing: 'row'`), or the row has no
 * provider id (`missing: 'provider_id'`, such as a plan without a Stripe price). Returned before any
 * provider request is made.
 *
 * @fix Check the id, or create the row with the provider first.
 * @verify bun run test -- src/core/providers
 */
export declare const ReferenceNotFound: import("@arki/failure").FailureDefinition<"payments.reference_not_found", import("@standard-schema/spec").StandardSchemaV1<{
    kind: "customer" | "payment" | "plan" | "subscription";
    id: string;
    missing: "provider_id" | "row";
}, {
    kind: "customer" | "payment" | "plan" | "subscription";
    id: string;
    missing: "provider_id" | "row";
}>>;
/**
 * The provider price a plan row points at is not a flat recurring price (a tiered, metered or
 * one-time price), so it has no single amount and interval to read a plan from. The price comes
 * from the provider, so this is outside data, not a bug. Returned by `getPlan`, `updatePlan` and `listPlans`.
 *
 * @fix Point the plan at a flat recurring price in the provider dashboard, or remove the price's `planId` metadata.
 * @verify bun run test -- src/core/providers
 */
export declare const PlanPriceNotFlat: import("@arki/failure").FailureDefinition<"payments.plan_price_not_flat", import("@standard-schema/spec").StandardSchemaV1<{
    priceId: string;
}, {
    priceId: string;
}>>;
/**
 * A webhook delivery's signature does not match the body and the webhook secret: it was not sent
 * by the provider, the body changed after signing, the signature header is missing or malformed, or
 * the signature timestamp is outside the tolerance. Returned by `StripeProvider.constructWebhookEvent`.
 *
 * @fix Answer the delivery with HTTP 400. Check the webhook secret, and pass the raw request body, not re-serialized JSON.
 * @verify bun run test -- src/core/providers src/presets
 */
export declare const InvalidWebhookSignature: import("@arki/failure").FailureDefinition<"payments.invalid_signature", undefined>;
/**
 * An automatic payment (`automatic: true`, charged with the customer absent) was asked for without
 * a `paymentMethodId`. Returned by `createPaymentIntent` before any provider request.
 *
 * @fix Pass the saved payment method to charge, or use `automatic: false` and let the customer finish in the client.
 * @verify bun run test -- src/core/providers
 */
export declare const PaymentMethodRequired: import("@arki/failure").FailureDefinition<"payments.payment_method_required", undefined>;
/**
 * A customer address given for a tax calculation has no country, so no tax jurisdiction can be found.
 * Returned by `calculateTax` and `createTaxTransaction` before any provider request.
 *
 * @fix Ask for the customer's country, or leave the address out to use the one the provider holds.
 * @verify bun run test -- src/core/providers
 */
export declare const TaxAddressIncomplete: import("@arki/failure").FailureDefinition<"payments.tax_address_incomplete", undefined>;
/**
 * Why a payment provider call failed, when it is a fault the caller cannot branch on. Expected
 * answers (`CardDeclined`, `IdempotencyConflict`, `ReferenceNotFound`) are returned instead.
 *
 * - `invalid_request`: the provider rejected the request itself. Retrying the same call fails again.
 * - `authentication`: the API key is wrong or lacks permission.
 * - `rate_limited` / `unavailable`: a later retry can work.
 * - `not_configured`: the provider was built without what the call needs.
 * - `unknown`: anything else. `cause` holds the original error.
 */
export type PaymentProviderErrorCode = 'invalid_request' | 'authentication' | 'rate_limited' | 'unavailable' | 'not_configured' | 'unknown';
export declare class PaymentProviderError extends Error {
    readonly code: PaymentProviderErrorCode;
    /** The provider's own error code, such as Stripe's `resource_missing`, when it sent one. */
    readonly providerCode: string | undefined;
    constructor(code: PaymentProviderErrorCode, message: string, options?: {
        cause?: unknown;
        providerCode?: string;
    });
    /** True when the same call can succeed later without changes. */
    get retryable(): boolean;
}
/** A Stripe card error as `CardDeclined`. Any other error gives `undefined`. */
export declare function cardDeclinedOf(error: unknown): import("@arki/failure").Failure<"payments.card_declined", {
    providerCode?: string | undefined;
    declineCode?: string | undefined;
}> | undefined;
/** A Stripe idempotency error as `IdempotencyConflict`. Any other error gives `undefined`. */
export declare function idempotencyConflictOf(error: unknown): import("@arki/failure").Failure<"payments.idempotency_conflict", undefined> | undefined;
/**
 * A Stripe SDK error as a `PaymentProviderError`, to throw. Errors that are not Stripe's pass through unchanged.
 * A card or idempotency error reaches here only from a call that cannot return `CardDeclined` or
 * `IdempotencyConflict`; it is an `invalid_request` there, since the same call fails again.
 */
export declare function mapStripeError(error: unknown): unknown;
//# sourceMappingURL=provider-error.d.ts.map