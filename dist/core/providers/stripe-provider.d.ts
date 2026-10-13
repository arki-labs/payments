import Stripe from 'stripe';
import type { UserId } from '../user-id.js';
import type { Instant } from '@arki/date';
import { Money } from '@arki/money';
import type { BillingInterval, Customer, CustomerId, Payment, PaymentId, PaymentMethodInfo, Plan, PlanId, Subscription, SubscriptionId, SubscriptionPreview, WebhookValidationResult } from '../types.js';
import type { PaymentProviderConfig } from './base-provider.js';
import { BasePaymentProvider } from './base-provider.js';
export declare class StripeProvider extends BasePaymentProvider {
    readonly providerType: 'stripe';
    private stripe;
    readonly features: {
        customerPortal: boolean;
        automatedInvoicing: boolean;
        automatedDunning: boolean;
        taxCalculation: boolean;
        taxCompliance: boolean;
        taxReporting: boolean;
    };
    constructor(config: PaymentProviderConfig);
    createCustomer(params: {
        userId: UserId;
        email: string;
        name?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Customer>;
    getCustomer(_customerId: CustomerId): Promise<Customer | null>;
    updateCustomer(_customerId: CustomerId, _params: {
        email?: string;
        name?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Customer>;
    deleteCustomer(_customerId: CustomerId): Promise<void>;
    createPlan(params: {
        name: string;
        amount: Money;
        interval: BillingInterval;
        intervalCount?: number;
        trialPeriodDays?: number;
        metadata?: Record<string, unknown>;
    }): Promise<Plan>;
    getPlan(_planId: PlanId): Promise<Plan | null>;
    updatePlan(_planId: PlanId, _params: {
        name?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Plan>;
    deletePlan(_planId: PlanId): Promise<void>;
    listPlans(): Promise<Plan[]>;
    createSubscription(_params: {
        customerId: CustomerId;
        planId: PlanId;
        paymentMethodId?: string;
        trialPeriodDays?: number;
        metadata?: Record<string, unknown>;
    }): Promise<Subscription>;
    getSubscription(_subscriptionId: SubscriptionId): Promise<Subscription | null>;
    updateSubscription(_subscriptionId: SubscriptionId, _params: {
        planId?: PlanId;
        paymentMethodId?: string;
        metadata?: Record<string, unknown>;
        cancelAtPeriodEnd?: boolean;
    }): Promise<Subscription>;
    cancelSubscription(_subscriptionId: SubscriptionId, _options: {
        immediately?: boolean;
        reason?: string;
    }): Promise<Subscription>;
    reactivateSubscription(_subscriptionId: SubscriptionId): Promise<Subscription>;
    pauseSubscription(_subscriptionId: SubscriptionId): Promise<Subscription>;
    resumeSubscription(_subscriptionId: SubscriptionId): Promise<Subscription>;
    previewSubscriptionChange(_params: {
        subscriptionId: SubscriptionId;
        planId: PlanId;
        prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
    }): Promise<SubscriptionPreview>;
    createPayment(_params: {
        customerId: CustomerId;
        amount: Money;
        paymentMethodId: string;
        description?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Payment>;
    getPayment(_paymentId: PaymentId): Promise<Payment | null>;
    confirmPayment(_paymentId: PaymentId): Promise<Payment>;
    cancelPayment(_paymentId: PaymentId): Promise<Payment>;
    refundPayment(paymentId: PaymentId, params: {
        amount?: Money;
        reason?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Payment>;
    attachPaymentMethod(_params: {
        customerId: CustomerId;
        paymentMethodId: string;
    }): Promise<PaymentMethodInfo>;
    detachPaymentMethod(paymentMethodId: string): Promise<void>;
    listPaymentMethods(_customerId: CustomerId): Promise<PaymentMethodInfo[]>;
    setDefaultPaymentMethod(_params: {
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
    createSetupIntent(_customerId: CustomerId): Promise<{
        clientSecret: string;
        setupIntentId: string;
    }>;
    createPaymentIntent(_params: {
        customerId: CustomerId;
        amount: Money;
        paymentMethodId?: string;
        automatic: boolean;
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
            jurisdiction: string;
            taxCode?: string;
        }[];
    }>;
    createTaxTransaction(params: {
        reference: string;
        type: 'sale' | 'refund';
        /** Every line item is in `currency`. */
        lineItems: {
            amount: Money;
            quantity?: number;
            reference: string;
            taxCode?: string;
        }[];
        currency: string;
        customerId?: CustomerId;
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
        id: string;
        amountTotal: Money;
        taxAmountExclusive: Money;
        taxAmountInclusive: Money;
    }>;
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
    getTaxReport(params: {
        reportType: 'sales_and_use_tax' | 'vat' | 'gst';
        startDate: Instant;
        endDate: Instant;
        jurisdiction?: string;
    }): Promise<{
        id: string;
        status: 'pending' | 'succeeded' | 'failed';
        url?: string;
        downloadUrl?: string;
    }>;
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details?: string;
    }>;
    private mapBillingIntervalToStripe;
    private mapStripeEventType;
    private mapRefundReasonToStripe;
}
//# sourceMappingURL=stripe-provider.d.ts.map