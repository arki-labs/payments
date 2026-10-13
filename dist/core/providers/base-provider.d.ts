import type { Money } from '@arki/money';
import type { BillingInterval, Customer, CustomerId, Payment, PaymentId, PaymentMethodInfo, PaymentMethodType, PaymentProviderType, Plan, PlanId, Subscription, SubscriptionId, SubscriptionPreview, SubscriptionStatus, WebhookValidationResult } from '../types.js';
export type PaymentProviderConfig = {
    apiKey: string;
    webhookSecret: string;
    webhookEndpointSecret?: string;
    publicKey?: string;
    environment: 'sandbox' | 'production';
};
export declare abstract class BasePaymentProvider {
    protected config: PaymentProviderConfig;
    abstract readonly providerType: PaymentProviderType;
    constructor(config: PaymentProviderConfig);
    abstract createCustomer(params: {
        userId: string;
        email: string;
        name?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Customer>;
    abstract getCustomer(customerId: CustomerId): Promise<Customer | null>;
    abstract updateCustomer(customerId: CustomerId, params: {
        email?: string;
        name?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Customer>;
    abstract deleteCustomer(customerId: CustomerId): Promise<void>;
    abstract createPlan(params: {
        name: string;
        amount: Money;
        interval: BillingInterval;
        intervalCount?: number;
        trialPeriodDays?: number;
        metadata?: Record<string, unknown>;
    }): Promise<Plan>;
    abstract getPlan(planId: PlanId): Promise<Plan | null>;
    abstract updatePlan(planId: PlanId, params: {
        name?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Plan>;
    abstract deletePlan(planId: PlanId): Promise<void>;
    abstract listPlans(): Promise<Plan[]>;
    abstract createSubscription(params: {
        customerId: CustomerId;
        planId: PlanId;
        paymentMethodId?: string;
        trialPeriodDays?: number;
        metadata?: Record<string, unknown>;
    }): Promise<Subscription>;
    abstract getSubscription(subscriptionId: SubscriptionId): Promise<Subscription | null>;
    abstract updateSubscription(subscriptionId: SubscriptionId, params: {
        planId?: PlanId;
        paymentMethodId?: string;
        metadata?: Record<string, unknown>;
        cancelAtPeriodEnd?: boolean;
    }): Promise<Subscription>;
    abstract cancelSubscription(subscriptionId: SubscriptionId, options: {
        immediately?: boolean;
        reason?: string;
    }): Promise<Subscription>;
    abstract reactivateSubscription(subscriptionId: SubscriptionId): Promise<Subscription>;
    abstract pauseSubscription(subscriptionId: SubscriptionId): Promise<Subscription>;
    abstract resumeSubscription(subscriptionId: SubscriptionId): Promise<Subscription>;
    abstract previewSubscriptionChange(params: {
        subscriptionId: SubscriptionId;
        planId: PlanId;
        prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
    }): Promise<SubscriptionPreview>;
    abstract createPayment(params: {
        customerId: CustomerId;
        amount: Money;
        paymentMethodId: string;
        description?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Payment>;
    abstract getPayment(paymentId: PaymentId): Promise<Payment | null>;
    abstract confirmPayment(paymentId: PaymentId): Promise<Payment>;
    abstract cancelPayment(paymentId: PaymentId): Promise<Payment>;
    abstract refundPayment(paymentId: PaymentId, params: {
        /** Left out: the whole payment. */
        amount?: Money;
        reason?: string;
        metadata?: Record<string, unknown>;
    }): Promise<Payment>;
    abstract attachPaymentMethod(params: {
        customerId: CustomerId;
        paymentMethodId: string;
    }): Promise<PaymentMethodInfo>;
    abstract detachPaymentMethod(paymentMethodId: string): Promise<void>;
    abstract listPaymentMethods(customerId: CustomerId): Promise<PaymentMethodInfo[]>;
    abstract setDefaultPaymentMethod(params: {
        customerId: CustomerId;
        paymentMethodId: string;
    }): Promise<void>;
    abstract validateWebhook(payload: string | Buffer, signature: string, timestamp: string, sourceIp: string): Promise<WebhookValidationResult>;
    abstract createSetupIntent(customerId: CustomerId): Promise<{
        clientSecret: string;
        setupIntentId: string;
    }>;
    abstract createPaymentIntent(params: {
        customerId: CustomerId;
        amount: Money;
        paymentMethodId?: string;
        automatic: boolean;
    }): Promise<{
        clientSecret: string;
        paymentIntentId: string;
    }>;
    abstract healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details?: string;
    }>;
    protected mapSubscriptionStatus(providerStatus: string): SubscriptionStatus;
    protected mapPaymentMethodType(providerType: string): PaymentMethodType;
}
//# sourceMappingURL=base-provider.d.ts.map