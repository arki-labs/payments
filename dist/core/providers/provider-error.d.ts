/**
 * Why a payment provider call failed, in terms a caller can act on.
 *
 * - `card_declined`: the card or payment method was refused. Ask for another one.
 * - `invalid_request`: the provider rejected the request itself. Retrying the same call fails again.
 * - `authentication`: the API key is wrong or lacks permission.
 * - `rate_limited` / `unavailable`: a later retry can work.
 * - `idempotency_conflict`: the same idempotency key was used with different parameters.
 * - `reference_not_found`: a customer, plan or subscription id has no row, or the row has no provider id.
 * - `not_configured`: the provider was built without what the call needs.
 * - `unknown`: anything else. `cause` holds the original error.
 */
export type PaymentProviderErrorCode = 'card_declined' | 'invalid_request' | 'authentication' | 'rate_limited' | 'unavailable' | 'idempotency_conflict' | 'reference_not_found' | 'not_configured' | 'unknown';
export declare class PaymentProviderError extends Error {
    readonly code: PaymentProviderErrorCode;
    /** The provider's own error code, such as Stripe's `card_declined`, when it sent one. */
    readonly providerCode: string | undefined;
    constructor(code: PaymentProviderErrorCode, message: string, options?: {
        cause?: unknown;
        providerCode?: string;
    });
    /** True when the same call can succeed later without changes. */
    get retryable(): boolean;
}
/** A Stripe SDK error as a `PaymentProviderError`. Errors that are not Stripe's pass through unchanged. */
export declare function mapStripeError(error: unknown): unknown;
//# sourceMappingURL=provider-error.d.ts.map