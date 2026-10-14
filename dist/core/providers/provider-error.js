import Stripe from 'stripe';
export class PaymentProviderError extends Error {
    code;
    /** The provider's own error code, such as Stripe's `card_declined`, when it sent one. */
    providerCode;
    constructor(code, message, options = {}) {
        super(message, { cause: options.cause });
        this.name = 'PaymentProviderError';
        this.code = code;
        this.providerCode = options.providerCode;
    }
    /** True when the same call can succeed later without changes. */
    get retryable() {
        return this.code === 'rate_limited' || this.code === 'unavailable';
    }
}
/** A Stripe SDK error as a `PaymentProviderError`. Errors that are not Stripe's pass through unchanged. */
export function mapStripeError(error) {
    if (error instanceof PaymentProviderError)
        return error;
    if (!(error instanceof Stripe.errors.StripeError))
        return error;
    const options = { cause: error, providerCode: error.code };
    switch (error.type) {
        case 'StripeCardError': {
            return new PaymentProviderError('card_declined', error.message, options);
        }
        case 'StripeInvalidRequestError': {
            return new PaymentProviderError('invalid_request', error.message, options);
        }
        case 'StripeAuthenticationError':
        case 'StripePermissionError': {
            return new PaymentProviderError('authentication', error.message, options);
        }
        case 'StripeRateLimitError': {
            return new PaymentProviderError('rate_limited', error.message, options);
        }
        case 'StripeConnectionError':
        case 'StripeAPIError': {
            return new PaymentProviderError('unavailable', error.message, options);
        }
        case 'StripeIdempotencyError': {
            return new PaymentProviderError('idempotency_conflict', error.message, options);
        }
        default: {
            return new PaymentProviderError('unknown', error.message, options);
        }
    }
}
//# sourceMappingURL=provider-error.js.map