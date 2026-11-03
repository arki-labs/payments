import { UnexpectedFailure } from '@arki/failure';
/**
 * The subscription's status does not allow the change: an update or a pause needs `active`, a
 * resume needs `paused`, a reactivation needs `canceled` or `past_due`, and a canceled
 * subscription cannot be canceled or flagged again. Nothing was sent to the provider or written.
 *
 * @fix Read the subscription again and ask only for a change its status allows.
 * @verify bun run test -- src/core/services/subscription-manager.test.ts
 */
export declare const SubscriptionInvalidState: import("@arki/failure").FailureDefinition<"payments.subscription_invalid_state", import("@standard-schema/spec").StandardSchemaV1<{
    subscriptionId: string;
    status: string;
    action: "cancel" | "pause" | "reactivate" | "resume" | "set_cancel_at_period_end" | "update";
}, {
    subscriptionId: string;
    status: string;
    action: "cancel" | "pause" | "reactivate" | "resume" | "set_cancel_at_period_end" | "update";
}>>;
/**
 * The user already has an active subscription, so a second one is not created. Nothing was sent to
 * the provider or written.
 *
 * @fix Change the plan of the existing subscription instead (`updateSubscription`).
 * @verify bun run test -- src/core/services/subscription-manager.test.ts
 */
export declare const SubscriptionAlreadyActive: import("@arki/failure").FailureDefinition<"payments.subscription_already_active", import("@standard-schema/spec").StandardSchemaV1<{
    userId: string;
    subscriptionId: string;
}, {
    userId: string;
    subscriptionId: string;
}>>;
/**
 * The plan exists but is no longer offered (`isActive` is false). Nothing was sent to the provider or written.
 *
 * @fix Pick an active plan (`findActivePlans`).
 * @verify bun run test -- src/core/services/subscription-manager.test.ts
 */
export declare const PlanInactive: import("@arki/failure").FailureDefinition<"payments.plan_inactive", import("@standard-schema/spec").StandardSchemaV1<{
    planId: string;
}, {
    planId: string;
}>>;
/**
 * The two plans of a plan change are priced in different currencies, so a credit on one cannot be
 * set against a charge on the other.
 *
 * @fix Move the subscription to a plan in the same currency, or cancel it and start a new one.
 * @verify bun run test -- src/core/services/proration-service.test.ts
 */
export declare const PlanCurrencyMismatch: import("@arki/failure").FailureDefinition<"payments.plan_currency_mismatch", import("@standard-schema/spec").StandardSchemaV1<{
    currentPlanId: string;
    newPlanId: string;
    currentCurrency: string;
    newCurrency: string;
}, {
    currentPlanId: string;
    newPlanId: string;
    currentCurrency: string;
    newCurrency: string;
}>>;
/**
 * A plan change was asked to take effect outside the subscription's current period. Times are ISO
 * instants.
 *
 * @fix Pick an effective date between `periodStart` and `periodEnd`, or leave it out to mean now.
 * @verify bun run test -- src/core/services/proration-service.test.ts
 */
export declare const EffectiveDateOutsidePeriod: import("@arki/failure").FailureDefinition<"payments.effective_date_outside_period", import("@standard-schema/spec").StandardSchemaV1<{
    subscriptionId: string;
    effectiveDate: string;
    periodStart: string;
    periodEnd: string;
}, {
    subscriptionId: string;
    effectiveDate: string;
    periodStart: string;
    periodEnd: string;
}>>;
/**
 * The payment belongs to no subscription, so there is no subscription to keep alive with retries.
 * Nothing was scheduled.
 *
 * @fix Retry a one-off payment by asking the customer to pay again.
 * @verify bun run test -- src/core/services/payment-retry-service.test.ts
 */
export declare const PaymentWithoutSubscription: import("@arki/failure").FailureDefinition<"payments.payment_without_subscription", import("@standard-schema/spec").StandardSchemaV1<{
    paymentId: string;
}, {
    paymentId: string;
}>>;
/**
 * A new customer clashes with a stored one: the user already has a customer with another provider
 * id (`existingCustomerId` is that customer), or the provider id belongs to another user's customer
 * (`existingCustomerId` is null). Nothing was written.
 *
 * @fix Use the user's stored customer (`findCustomerByUserId`), or check which user the provider customer belongs to.
 * @verify bun run test -- src/core/repository.customers.test.ts
 */
export declare const CustomerConflict: import("@arki/failure").FailureDefinition<"payments.customer_conflict", import("@standard-schema/spec").StandardSchemaV1<{
    userId: string;
    providerCustomerId: string;
    existingCustomerId: string | null;
}, {
    userId: string;
    providerCustomerId: string;
    existingCustomerId: string | null;
}>>;
/**
 * No webhook event has this id. Nothing was written.
 *
 * @fix Check the webhook event id. Ids come from `claimWebhookEvent` or `findWebhookEventByProviderEventId`.
 * @verify bun run test -- src/core/repository.customers.test.ts
 */
export declare const WebhookEventNotFound: import("@arki/failure").FailureDefinition<"payments.webhook_event_not_found", import("@standard-schema/spec").StandardSchemaV1<{
    webhookId: string;
}, {
    webhookId: string;
}>>;
/**
 * A notification was not delivered: the mail transport returned a failure (the `cause`), the Slack
 * webhook answered with a non-2xx `status`, or the request failed or timed out (the `cause`).
 *
 * @fix Check the transport or the Slack webhook URL and its status page, then send the notification again.
 * @verify bun run test -- src/core/notifications/service.test.ts
 */
export declare const NotificationFailed: import("@arki/failure").FailureDefinition<"payments.notification_failed", import("@standard-schema/spec").StandardSchemaV1<{
    channel: "email" | "slack";
    notification: "refund_approval_request" | "refund_failure_alert" | "refund_status_update";
    status?: number | undefined;
}, {
    channel: "email" | "slack";
    notification: "refund_approval_request" | "refund_failure_alert" | "refund_status_update";
    status?: number | undefined;
}>>;
/**
 * The host app's setup of a payments service cannot work: a capability a configured step needs was
 * not passed, or a setting is empty or malformed. Thrown when the service is built (at boot), never
 * returned later as a silent no-op.
 *
 * @fix Pass the capability or setting that `setting` names when the app builds the service.
 * @verify bun run test -- src/core/services/dunning-service.test.ts src/dunning/communication-service.test.ts
 */
export declare const PaymentsConfigurationInvalid: import("@arki/failure").FailureDefinition<"payments.configuration_invalid", import("@standard-schema/spec").StandardSchemaV1<{
    setting: string;
    problem: string;
}, {
    setting: string;
    problem: string;
}>>;
/**
 * The thrown form of `payments.configuration_invalid`, for a setting the app passed when it built a
 * service. Boot checks throw this; nothing at runtime does.
 */
export declare function misconfigured(setting: string, problem: string): UnexpectedFailure<import("@arki/failure").Failure<"payments.configuration_invalid", {
    setting: string;
    problem: string;
}>>;
//# sourceMappingURL=failures.d.ts.map