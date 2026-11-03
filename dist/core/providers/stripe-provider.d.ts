import type { IdGenerationFailure } from '@arki/contracts';
import Stripe from 'stripe';
import type { UserId } from '../user-id.js';
import type { FailureOf, Result } from '@arki/failure';
import type { MoneyFailure } from '@arki/money';
import { Money } from '@arki/money';
import { fromStripeAmount } from '@arki/money/stripe';
import type { RefundId } from '../../refunds/primitives.js';
import type { BillingInterval, Customer, CustomerId, Payment, PaymentId, PaymentMethodInfo, Plan, PlanId, PlanTier, Subscription, SubscriptionId, SubscriptionPreview, WebhookValidationResult } from '../types.js';
import type { PaymentProviderConfig, ProviderRefundResult } from './base-provider.js';
import type { CardDeclined, IdempotencyConflict } from './provider-error.js';
import { BasePaymentProvider } from './base-provider.js';
import { PlanPriceNotFlat, ReferenceNotFound, TaxAddressIncomplete } from './provider-error.js';
/**
 * The rows the provider reads to turn our ids into Stripe ids. A `PaymentRepository` fits.
 * Without it, the calls that take a customer, plan, subscription or payment id throw `not_configured`.
 * An id with no row, or a row with no Stripe id, is returned as `ReferenceNotFound` before any request.
 */
export type StripeReferenceReads = {
    findCustomerById(id: CustomerId): Promise<Customer | null>;
    findPlanById(id: PlanId): Promise<Plan | null>;
    findPaymentById(id: PaymentId): Promise<Payment | null>;
    findSubscriptionById(id: SubscriptionId): Promise<Subscription | null>;
};
export type StripeProviderOptions = {
    references?: StripeReferenceReads;
    /** Replaces Stripe's HTTP layer. Tests pass one that never leaves the process. */
    httpClient?: Stripe.HttpClient;
    /** Retries of network failures and 5xx answers. Stripe's default is 1. */
    maxNetworkRetries?: number;
};
/**
 * Stripe's units for an amount we send: `10.99 USD` is `1099`, `500 JPY` is `500`. Whether Stripe
 * can take an amount depends on Stripe's per-currency rules, which a caller cannot check from the
 * `Money` type, so an amount it cannot take is returned, with the `@arki/money` error as `cause`:
 * `ProviderAmount` for a negative amount, a custom currency, a currency Stripe has no rule for
 * (3 or 4 ISO decimals) or a fraction Stripe does not accept (`10.50 MGA`); `AmountOutOfRange` past 2^53 units.
 */
declare function stripeAmountOf(amount: Money): number | import("@arki/failure").Failure<"money.out_of_range", undefined> | import("@arki/failure").Failure<"money.provider_amount", undefined>;
/** An amount of ours that Stripe cannot take: what `stripeAmountOf` returns instead of units. */
type SendAmountFailure = Exclude<ReturnType<typeof stripeAmountOf>, number>;
/** An amount Stripe sent that is not a valid `Money`: what `fromStripeAmount` returns instead. */
type ReadAmountFailure = Exclude<ReturnType<typeof fromStripeAmount>, Money>;
type NotFound = FailureOf<typeof ReferenceNotFound>;
type NotFlat = FailureOf<typeof PlanPriceNotFlat>;
type Declined = FailureOf<typeof CardDeclined>;
type Conflict = FailureOf<typeof IdempotencyConflict>;
type TaxCustomerDetails = {
    address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    taxIds?: {
        type: string;
        value: string;
    }[];
};
/** What `createTaxTransaction` takes. */
type TaxTransactionParams = {
    reference: string;
    type: 'sale' | 'refund';
    /** Every line item is in `currency`. A refund with no line items reverses the whole original transaction. */
    lineItems: {
        amount: Money;
        quantity?: number;
        reference: string;
        taxCode?: string;
    }[];
    currency: string;
    customerId?: CustomerId;
    /** The Stripe tax transaction a `refund` reverses (the `id` `createTaxTransaction` returned for the sale). */
    originalTransactionId?: string;
    customerDetails?: TaxCustomerDetails;
};
export declare class StripeProvider extends BasePaymentProvider {
    readonly providerType: 'stripe';
    private stripe;
    private readonly references;
    readonly features: {
        customerPortal: boolean;
        automatedInvoicing: boolean;
        automatedDunning: boolean;
        taxCalculation: boolean;
        taxCompliance: boolean;
        taxReporting: boolean;
    };
    constructor(config: PaymentProviderConfig, options?: StripeProviderOptions);
    /**
     * Runs one Stripe request in a `payments.<operation>` span, where `operation` names the Stripe
     * resource and method (`stripe.payment_intents.create`). `answer` turns the errors the call expects
     * (a declined card, a reused idempotency key) into returned failures, which the span records as
     * `payments.failure_code`; any other Stripe error is thrown as a `PaymentProviderError`.
     */
    private call;
    private requireReferences;
    private customerRef;
    private planRef;
    /** The plan's Stripe price id, from `metadata.stripePriceId`. */
    private priceIdOf;
    private priceRef;
    private paymentRef;
    private subscriptionRef;
    /** Our subscription shape from Stripe's. `base` carries what Stripe does not know: our ids. */
    private toSubscription;
    createCustomer(params: {
        userId: UserId;
        email: string;
        name?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Customer | IdGenerationFailure>;
    /** Our customer row, refreshed with what Stripe holds now. */
    private toCustomer;
    getCustomer(customerId: CustomerId): Promise<Customer | null>;
    updateCustomer(customerId: CustomerId, params: {
        email?: string;
        name?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Result<Customer, NotFound>>;
    deleteCustomer(customerId: CustomerId): Promise<import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | undefined>;
    /** Our plan row, refreshed with the price and product Stripe holds now. */
    private toPlan;
    private productIdOf;
    /** The product's name when the price was fetched with `expand: ['product']` and the product still exists. */
    private expandedProductName;
    createPlan(params: {
        name: string;
        description?: string;
        tier: PlanTier;
        /** What the plan includes, shown to customers. */
        features?: string[];
        amount: Money;
        interval: BillingInterval;
        intervalCount?: number;
        trialPeriodDays?: number;
        metadata?: Record<string, unknown>;
    }): Promise<Result<Plan, IdGenerationFailure | SendAmountFailure>>;
    /** `null` when the plan has no row; `ReferenceNotFound` when its row has no Stripe price. */
    getPlan(planId: PlanId): Promise<Result<Plan | null, NotFound | NotFlat | ReadAmountFailure>>;
    updatePlan(planId: PlanId, params: {
        name?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Result<Plan, NotFound | NotFlat | ReadAmountFailure>>;
    /** Stripe prices cannot be deleted, so a deleted plan is archived: the price and its product stop being sold. */
    deletePlan(planId: PlanId): Promise<import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | undefined>;
    /**
     * The active plans Stripe sells that this package created: prices carrying our `planId` in their
     * metadata, whose row still exists. Prices made in the Stripe dashboard have no row here and are left out.
     */
    listPlans(): Promise<Result<Plan[], NotFlat | ReadAmountFailure>>;
    createSubscription(params: {
        customerId: CustomerId;
        planId: PlanId;
        paymentMethodId?: string;
        trialPeriodDays?: number;
        metadata?: Record<string, unknown>;
        idempotencyKey?: string;
    }): Promise<import("@arki/failure").Failure<"payments.card_declined", {
        providerCode?: string | undefined;
        declineCode?: string | undefined;
    }> | import("@arki/failure").Failure<"payments.idempotency_conflict", undefined> | import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | Subscription | IdGenerationFailure>;
    getSubscription(subscriptionId: SubscriptionId): Promise<Subscription | null>;
    updateSubscription(subscriptionId: SubscriptionId, params: {
        planId?: PlanId;
        paymentMethodId?: string;
        metadata?: Record<string, unknown>;
        cancelAtPeriodEnd?: boolean;
        prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
        idempotencyKey?: string;
    }): Promise<import("@arki/failure").Failure<"payments.card_declined", {
        providerCode?: string | undefined;
        declineCode?: string | undefined;
    }> | import("@arki/failure").Failure<"payments.idempotency_conflict", undefined> | import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | Subscription>;
    cancelSubscription(subscriptionId: SubscriptionId, options: {
        immediately?: boolean;
        reason?: string;
        idempotencyKey?: string;
    }): Promise<import("@arki/failure").Failure<"payments.idempotency_conflict", undefined> | import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | Subscription>;
    /** Updates the Stripe subscription and returns our subscription row as Stripe now has it. */
    private updateStripeSubscription;
    /** Undoes a cancellation that is set to happen at the end of the paid period. */
    reactivateSubscription(subscriptionId: SubscriptionId): Promise<import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | Subscription>;
    /** Stops charging and keeps the subscription: invoices are voided until `resumeSubscription`. */
    pauseSubscription(subscriptionId: SubscriptionId): Promise<import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | Subscription>;
    resumeSubscription(subscriptionId: SubscriptionId): Promise<import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | Subscription>;
    /**
     * What changing to `planId` would charge, from a Stripe upcoming-invoice preview (nothing is created).
     * `immediateTotal` is the net of the proration lines (a credit larger than the charge is zero),
     * `creditApplied` the unused time credited back, `nextInvoiceTotal` the lines of the new plan itself.
     */
    previewSubscriptionChange(params: {
        subscriptionId: SubscriptionId;
        planId: PlanId;
        prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
    }): Promise<Result<SubscriptionPreview, NotFound | ReadAmountFailure>>;
    /** Our payment from a Stripe payment intent fetched with `expand: ['payment_method', 'latest_charge']`. */
    private toPayment;
    private mapPaymentIntentStatus;
    /** Charges the payment method now, with the customer present. */
    createPayment(params: {
        customerId: CustomerId;
        amount: Money;
        paymentMethodId: string;
        description?: string;
        metadata?: Record<string, unknown>;
    }): Promise<import("@arki/failure").Failure<"payments.card_declined", {
        providerCode?: string | undefined;
        declineCode?: string | undefined;
    }> | import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | Payment | IdGenerationFailure | MoneyFailure>;
    getPayment(paymentId: PaymentId): Promise<Payment | MoneyFailure | null>;
    /** Confirms the payment intent: also how a failed payment is tried again. */
    confirmPayment(paymentId: PaymentId): Promise<import("@arki/failure").Failure<"payments.card_declined", {
        providerCode?: string | undefined;
        declineCode?: string | undefined;
    }> | import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | Payment | MoneyFailure>;
    cancelPayment(paymentId: PaymentId): Promise<import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | Payment | MoneyFailure>;
    /**
     * Refunds the payment's Stripe charge. `paymentId` is our payment id; the Stripe payment intent comes
     * from its row. `idempotencyKey` goes to Stripe, so a retry with the same key gets the first refund back
     * instead of a second one. Stripe forgets a key after 24 hours: look the refund up with `findRefund` first.
     *
     * `refundId` is stored as `metadata.refundId`, over any `refundId` in `metadata`, so `findRefund` can match it.
     * The answer holds the Stripe refund id, its status and Stripe's `failure_reason`. A `pending`, `requires_action`, `failed` or
     * `canceled` refund is returned, not thrown. A key reused with different parameters returns
     * `IdempotencyConflict`; any other Stripe error throws a `PaymentProviderError`.
     */
    refundPayment(paymentId: PaymentId, params: {
        refundId: RefundId;
        idempotencyKey: string;
        amount?: Money;
        reason?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Result<ProviderRefundResult, NotFound | Conflict | SendAmountFailure>>;
    /**
     * The Stripe refund of our payment whose `metadata.refundId` is `refundId`, or null when Stripe has none.
     * Use it before `refundPayment` once its idempotency key may be older than Stripe's 24 hours, so a late
     * retry never refunds twice. Reads the payment intent's refunds page by page and stops at the match.
     */
    findRefund(paymentId: PaymentId, refundId: RefundId): Promise<import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | {
        providerRefundId: string;
        status: string | null;
        failureReason: string | null;
    } | null>;
    /** A Stripe refund as `refundPayment` and `findRefund` answer it. */
    private toRefundResult;
    private toPaymentMethodInfo;
    /** The id of the customer's default payment method in Stripe, or null. */
    private defaultPaymentMethodOf;
    attachPaymentMethod(params: {
        customerId: CustomerId;
        paymentMethodId: string;
    }): Promise<Result<PaymentMethodInfo, Declined | NotFound>>;
    detachPaymentMethod(paymentMethodId: string): Promise<void>;
    listPaymentMethods(customerId: CustomerId): Promise<{
        id: string;
        type: "apple_pay" | "bank_account" | "card" | "google_pay" | "paypal";
        brand?: string | undefined;
        last4?: string | undefined;
        expiryMonth?: number | undefined;
        expiryYear?: number | undefined;
        isDefault: boolean;
    }[] | import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }>>;
    setDefaultPaymentMethod(params: {
        customerId: CustomerId;
        paymentMethodId: string;
    }): Promise<import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | undefined>;
    validateWebhook(payload: string | Buffer, signature: string, _timestamp: string, _sourceIp: string): Promise<WebhookValidationResult>;
    /**
     * Verify a webhook signature and return the **typed** Stripe event.
     *
     * `validateWebhook` (the provider-agnostic interface method) erases the event payload to
     * `Record<string, unknown>`. The subscription billing preset instead needs the discriminated
     * `Stripe.Event` so it can narrow on `event.type` and read `event.data.object` as a
     * `Stripe.Subscription` with no unsafe cast. A bad, missing or stale signature returns
     * `InvalidWebhookSignature` (the Stripe error is its `cause`); a webhook route answers it with HTTP 400.
     */
    constructWebhookEvent(payload: string | Buffer, signature: string): import("@arki/failure").Failure<"payments.invalid_signature", undefined> | Stripe.Event;
    createSetupIntent(customerId: CustomerId, options?: {
        idempotencyKey?: string;
    }): Promise<import("@arki/failure").Failure<"payments.idempotency_conflict", undefined> | import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | {
        clientSecret: string;
        setupIntentId: string;
    }>;
    createPaymentIntent(params: {
        customerId: CustomerId;
        amount: Money;
        paymentMethodId?: string;
        automatic: boolean;
        idempotencyKey?: string;
    }): Promise<import("@arki/failure").Failure<"money.out_of_range", undefined> | import("@arki/failure").Failure<"money.provider_amount", undefined> | import("@arki/failure").Failure<"payments.card_declined", {
        providerCode?: string | undefined;
        declineCode?: string | undefined;
    }> | import("@arki/failure").Failure<"payments.idempotency_conflict", undefined> | import("@arki/failure").Failure<"payments.payment_method_required", undefined> | import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | {
        clientSecret: string;
        paymentIntentId: string;
    }>;
    createCustomerPortalSession(providerCustomerId: string, returnUrl: string): Promise<{
        url: string;
    }>;
    /**
     * Create a Stripe Checkout Session for a subscription — the modern hosted subscribe flow.
     *
     * This is the path that actually starts a paid subscription: Stripe hosts the payment page and
     * handles card entry, SCA/3DS, the free trial, tax, and promo codes, then emits
     * `customer.subscription.*` webhooks that the billing preset projects into the `subscriptions`
     * table. We deliberately use Checkout rather than the raw `subscriptions.create` API so we never
     * touch card data (no PCI scope) and get trials + Stripe Tax for free.
     */
    createCheckoutSession(params: {
        /** Stripe Price ID for the plan being subscribed to. */
        priceId: string;
        successUrl: string;
        cancelUrl: string;
        /** Free-trial length; omit for no trial. */
        trialPeriodDays?: number;
        /** Existing Stripe customer to attach the subscription to, if we already created one. */
        providerCustomerId?: string;
        /** Used only when no `providerCustomerId` — Stripe links/creates a customer by email. */
        customerEmail?: string;
        /** Our internal user id, echoed onto the session + subscription for webhook correlation. */
        clientReferenceId?: string;
        metadata?: Record<string, string>;
        /** Enable Stripe Tax (must be configured on the account) so EU VAT is calculated at checkout. */
        automaticTax?: boolean;
    }): Promise<{
        url: string;
        sessionId: string;
    }>;
    calculateTax(params: {
        customerId: CustomerId;
        /** Every line item is in `currency`: one calculation has one currency. */
        lineItems: {
            amount: Money;
            reference: string;
            taxCode?: string;
        }[];
        currency: string;
        customerDetails?: {
            address?: {
                line1?: string;
                line2?: string;
                city?: string;
                state?: string;
                postalCode?: string;
                country?: string;
            };
            taxIds?: {
                type: string;
                value: string;
            }[];
        };
    }): Promise<{
        amountTotal: Money;
        taxAmountExclusive: Money;
        taxAmountInclusive: Money;
        taxBreakdown: {
            amount: Money;
            rate: number;
            /** The jurisdiction's display name, such as `California`. Not unique: use `country`, `state` and `level` to tell places apart. */
            jurisdiction: string;
            /** Two-letter country code of the jurisdiction. */
            country: string;
            /** ISO 3166-2 subdivision code without the country prefix, such as `NY`. Absent for a country-level tax. */
            state?: string;
            /** `country`, `state`, `county`, `city` or `district` (Stripe may add more). */
            level: string;
            taxCode?: string;
        }[];
    } | MoneyFailure | FailureOf<typeof TaxAddressIncomplete>>;
    /**
     * Records a sale or a refund with Stripe Tax, for tax reporting.
     *
     * - `sale`: calculates the tax of the line items, then records that calculation as a transaction.
     * - `refund`: reverses `originalTransactionId`, a transaction recorded earlier. Without `lineItems`
     *   the whole transaction is reversed. With them, the refunded total (tax included) is reversed.
     *
     * The totals are read from the line items of the recorded transaction: negative for a refund.
     */
    createTaxTransaction(params: TaxTransactionParams): Promise<import("@arki/failure").Failure<"money.input_too_large", undefined> | import("@arki/failure").Failure<"money.invalid_text", undefined> | import("@arki/failure").Failure<"money.out_of_range", undefined> | import("@arki/failure").Failure<"money.provider_amount", undefined> | import("@arki/failure").Failure<"money.unknown_currency", undefined> | import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | import("@arki/failure").Failure<"payments.tax_address_incomplete", undefined> | {
        id: string;
        amountTotal: Money<string>;
        taxAmountExclusive: Money<string>;
        taxAmountInclusive: Money<string>;
    }>;
    private recordTaxSale;
    /**
     * A refund without `originalTransactionId` throws: it is the caller's own typed value, and
     * `TaxService.createTaxTransaction` finds the original sale before it calls this.
     */
    private reverseTaxTransaction;
    getTaxSettings(): Promise<{
        defaultTaxCode: string;
        headOfficeLocation?: {
            address: {
                country: string;
                state?: string;
                city?: string;
                line1?: string;
                postalCode?: string;
            };
        };
        taxRegistrations: {
            country: string;
            type: string;
            status: string;
        }[];
    }>;
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details?: string;
    }>;
    private mapBillingIntervalToStripe;
    private mapStripeIntervalToBilling;
    private mapRefundReasonToStripe;
}
export {};
//# sourceMappingURL=stripe-provider.d.ts.map