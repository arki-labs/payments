/**
 * What every payment provider implements. A call that takes `metadata` returns `SchemaFailure`
 * (`schema.invalid_input`) before any request for metadata a jsonb column cannot store (a `bigint`
 * anywhere, U+0000 in a key or a string). A call that takes an `idempotencyKey` returns it for a key
 * an HTTP header cannot carry unchanged (empty, over 255 characters, or not printable ASCII).
 */
export class BasePaymentProvider {
    config;
    constructor(config) {
        this.config = config;
    }
    // Helper Methods
    mapSubscriptionStatus(providerStatus) {
        // Default implementation - providers can override
        switch (providerStatus.toLowerCase()) {
            case 'active': {
                return 'active';
            }
            case 'canceled':
            case 'cancelled': {
                return 'canceled';
            }
            case 'incomplete': {
                return 'incomplete';
            }
            case 'incomplete_expired': {
                return 'incomplete_expired';
            }
            case 'past_due': {
                return 'past_due';
            }
            case 'paused': {
                return 'paused';
            }
            case 'trialing': {
                return 'trialing';
            }
            case 'unpaid': {
                return 'unpaid';
            }
            default: {
                return 'incomplete';
            }
        }
    }
    mapPaymentMethodType(providerType) {
        // Default implementation - providers can override
        switch (providerType.toLowerCase()) {
            case 'card': {
                return 'card';
            }
            case 'bank_account':
            case 'us_bank_account': {
                return 'bank_account';
            }
            case 'paypal': {
                return 'paypal';
            }
            case 'apple_pay': {
                return 'apple_pay';
            }
            case 'google_pay': {
                return 'google_pay';
            }
            default: {
                return 'card';
            }
        }
    }
}
//# sourceMappingURL=base-provider.js.map