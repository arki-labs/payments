/**
 * A Stripe price id that is not one of the subscription preset's `prices`. Returned by
 * `createCheckoutSession` before any provider request, and by `handleWebhook` for a subscription
 * on a price the app does not sell, so no plan nobody configured is granted.
 *
 * @fix Add the price to `prices` with the plan row it sells, or check the price id the client sent.
 * @verify bun run test -- src/presets
 */
export declare const PriceNotConfigured: import("@arki/failure").FailureDefinition<"payments.price_not_configured", import("@standard-schema/spec").StandardSchemaV1<{
    priceId: string;
}, {
    priceId: string;
}>>;
/**
 * A provider subscription event names a provider customer with no local customer row, so no user
 * owns it. The row is made at checkout; a subscription made outside checkout (in the Stripe
 * dashboard) has none. Returned by `projectStripeSubscription` before anything is written.
 *
 * @fix Start subscriptions through `createCheckoutSession`, or create the customer row for the provider customer first.
 * @verify bun run test -- src/presets
 */
export declare const UnknownProviderCustomer: import("@arki/failure").FailureDefinition<"payments.unknown_provider_customer", import("@standard-schema/spec").StandardSchemaV1<{
    providerCustomerId: string;
}, {
    providerCustomerId: string;
}>>;
/**
 * A provider subscription event has no subscription items, so it has no price and no billing
 * period to store. Returned by `handleWebhook` and `projectStripeSubscription` before anything is written.
 *
 * @fix Check the subscription in the provider dashboard: a Stripe subscription always has at least one item.
 * @verify bun run test -- src/presets
 */
export declare const SubscriptionWithoutItems: import("@arki/failure").FailureDefinition<"payments.subscription_without_items", import("@standard-schema/spec").StandardSchemaV1<{
    providerSubscriptionId: string;
}, {
    providerSubscriptionId: string;
}>>;
/**
 * A provider subscription status this package does not model, such as one Stripe added after this
 * release. Returned by `projectStripeSubscription` instead of guessing a status.
 *
 * @fix Upgrade `@arki/payments`, or add the status to `subscriptionStatusValues`.
 * @verify bun run test -- src/presets
 */
export declare const UnknownSubscriptionStatus: import("@arki/failure").FailureDefinition<"payments.unknown_subscription_status", import("@standard-schema/spec").StandardSchemaV1<{
    status: string;
}, {
    status: string;
}>>;
//# sourceMappingURL=failures.d.ts.map