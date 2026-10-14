import Stripe from 'stripe';
import type { UserId } from '../user-id.js';
import { Money } from '@arki/money';
import type { BillingInterval, Customer, CustomerId, Payment, PaymentId, PaymentMethodInfo, Plan, PlanId, PlanTier, Subscription, SubscriptionId, SubscriptionPreview, WebhookValidationResult } from '../types.js';
import type { PaymentProviderConfig, ProviderRefundResult } from './base-provider.js';
import { BasePaymentProvider } from './base-provider.js';
/**
 * The rows the provider reads to turn our ids into Stripe ids. A `PaymentRepository` fits.
 * Without it, the calls that take a customer, plan, subscription or payment id throw `not_configured`.
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
    /** Runs a Stripe call and turns a Stripe error into a `PaymentProviderError`. */
    private call;
    private requireReferences;
    private customerRef;
    private planRef;
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
    }): Promise<Customer>;
    /** Our customer row, refreshed with what Stripe holds now. */
    private toCustomer;
    getCustomer(customerId: CustomerId): Promise<Customer | null>;
    updateCustomer(customerId: CustomerId, params: {
        email?: string;
        name?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Customer>;
    deleteCustomer(customerId: CustomerId): Promise<void>;
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
    }): Promise<Plan>;
    getPlan(planId: PlanId): Promise<Plan | null>;
    updatePlan(planId: PlanId, params: {
        name?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Plan>;
    /** Stripe prices cannot be deleted, so a deleted plan is archived: the price and its product stop being sold. */
    deletePlan(planId: PlanId): Promise<void>;
    /**
     * The active plans Stripe sells that this package created: prices carrying our `planId` in their
     * metadata, whose row still exists. Prices made in the Stripe dashboard have no row here and are left out.
     */
    listPlans(): Promise<Plan[]>;
    createSubscription(params: {
        customerId: CustomerId;
        planId: PlanId;
        paymentMethodId?: string;
        trialPeriodDays?: number;
        metadata?: Record<string, unknown>;
        idempotencyKey?: string;
    }): Promise<Subscription>;
    getSubscription(subscriptionId: SubscriptionId): Promise<Subscription | null>;
    updateSubscription(subscriptionId: SubscriptionId, params: {
        planId?: PlanId;
        paymentMethodId?: string;
        metadata?: Record<string, unknown>;
        cancelAtPeriodEnd?: boolean;
        prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
        idempotencyKey?: string;
    }): Promise<Subscription>;
    cancelSubscription(subscriptionId: SubscriptionId, options: {
        immediately?: boolean;
        reason?: string;
        idempotencyKey?: string;
    }): Promise<Subscription>;
    /** Updates the Stripe subscription and returns our subscription row as Stripe now has it. */
    private updateStripeSubscription;
    /** Undoes a cancellation that is set to happen at the end of the paid period. */
    reactivateSubscription(subscriptionId: SubscriptionId): Promise<Subscription>;
    /** Stops charging and keeps the subscription: invoices are voided until `resumeSubscription`. */
    pauseSubscription(subscriptionId: SubscriptionId): Promise<Subscription>;
    resumeSubscription(subscriptionId: SubscriptionId): Promise<Subscription>;
    /**
     * What changing to `planId` would charge, from a Stripe upcoming-invoice preview (nothing is created).
     * `immediateTotal` is the net of the proration lines (a credit larger than the charge is zero),
     * `creditApplied` the unused time credited back, `nextInvoiceTotal` the lines of the new plan itself.
     */
    previewSubscriptionChange(params: {
        subscriptionId: SubscriptionId;
        planId: PlanId;
        prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
    }): Promise<SubscriptionPreview>;
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
    }): Promise<Payment>;
    getPayment(paymentId: PaymentId): Promise<Payment | null>;
    /** Confirms the payment intent: also how a failed payment is tried again. */
    confirmPayment(paymentId: PaymentId): Promise<Payment>;
    cancelPayment(paymentId: PaymentId): Promise<Payment>;
    /**
     * Refunds the payment's Stripe charge. `paymentId` is our payment id; the Stripe payment intent comes
     * from its row. The answer holds the Stripe refund id and the payment with what Stripe now reports as
     * refunded in total (earlier refunds included). A refund Stripe fails or cancels throws.
     */
    refundPayment(paymentId: PaymentId, params: {
        amount?: Money;
        reason?: string;
        metadata?: Record<string, unknown>;
    }): Promise<ProviderRefundResult>;
    private toPaymentMethodInfo;
    /** The id of the customer's default payment method in Stripe, or null. */
    private defaultPaymentMethodOf;
    attachPaymentMethod(params: {
        customerId: CustomerId;
        paymentMethodId: string;
    }): Promise<PaymentMethodInfo>;
    detachPaymentMethod(paymentMethodId: string): Promise<void>;
    listPaymentMethods(customerId: CustomerId): Promise<PaymentMethodInfo[]>;
    setDefaultPaymentMethod(params: {
        customerId: CustomerId;
        paymentMethodId: string;
    }): Promise<void>;
    validateWebhook(payload: string | Buffer, signature: string, _timestamp: string, _sourceIp: string): Promise<WebhookValidationResult>;
    /**
     * Verify a webhook signature and return the **typed** Stripe event.
     *
     * `validateWebhook` (the provider-agnostic interface method) erases the event payload to
     * `Record<string, unknown>`. The subscription billing preset instead needs the discriminated
     * `Stripe.Event` so it can narrow on `event.type` and read `event.data.object` as a
     * `Stripe.Subscription` with no unsafe cast. Throws `StripeSignatureVerificationError` on a bad
     * signature — a webhook route should map that to HTTP 400.
     */
    constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event;
    createSetupIntent(customerId: CustomerId, options?: {
        idempotencyKey?: string;
    }): Promise<{
        clientSecret: string;
        setupIntentId: string;
    }>;
    createPaymentIntent(params: {
        customerId: CustomerId;
        amount: Money;
        paymentMethodId?: string;
        automatic: boolean;
        idempotencyKey?: string;
    }): Promise<{
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
    }>;
    /**
     * Records a sale or a refund with Stripe Tax, for tax reporting.
     *
     * - `sale`: calculates the tax of the line items, then records that calculation as a transaction.
     * - `refund`: reverses `originalTransactionId`, a transaction recorded earlier. Without `lineItems`
     *   the whole transaction is reversed. With them, the refunded total (tax included) is reversed.
     *
     * The totals are read from the line items of the recorded transaction: negative for a refund.
     */
    createTaxTransaction(params: {
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
    }): Promise<{
        id: string;
        amountTotal: Money;
        taxAmountExclusive: Money;
        taxAmountInclusive: Money;
    }>;
    private recordTaxSale;
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
    private mapStripeEventType;
    private mapRefundReasonToStripe;
}
export {};
//# sourceMappingURL=stripe-provider.d.ts.map