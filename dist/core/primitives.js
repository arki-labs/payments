import { defineId } from '@arki/contracts';
const planId = defineId('plan');
const subscriptionId = defineId('sub');
const paymentId = defineId('pay');
const customerId = defineId('cust');
const webhookId = defineId('wh');
export const createPlanId = planId.create;
export const createSubscriptionId = subscriptionId.create;
export const createPaymentId = paymentId.create;
export const createCustomerId = customerId.create;
export const createWebhookId = webhookId.create;
export const planIdSchema = planId.schema;
export const subscriptionIdSchema = subscriptionId.schema;
export const paymentIdSchema = paymentId.schema;
export const customerIdSchema = customerId.schema;
export const webhookIdSchema = webhookId.schema;
export const planIdFactory = planId;
export const subscriptionIdFactory = subscriptionId;
export const paymentIdFactory = paymentId;
export const customerIdFactory = customerId;
export const webhookIdFactory = webhookId;
export const paymentProviderValues = ['stripe', 'paypal', 'square', 'razorpay', 'revenuecat'];
export const subscriptionStatusValues = [
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'paused',
    'trialing',
    'unpaid',
];
export const paymentStatusValues = [
    'pending',
    'processing',
    'succeeded',
    'failed',
    'canceled',
    'requires_action',
];
export const billingIntervalValues = ['monthly', 'yearly', 'weekly', 'daily'];
export const planTierValues = ['basic', 'premium', 'pro', 'enterprise'];
export const paymentMethodTypeValues = ['card', 'bank_account', 'paypal', 'apple_pay', 'google_pay'];
export const webhookEventTypeValues = [
    'subscription.created',
    'subscription.updated',
    'subscription.canceled',
    'subscription.trial_will_end',
    'payment.succeeded',
    'payment.failed',
    'payment.requires_action',
    'payment.refunded',
    'payment.dispute_created',
    'refund.updated',
    'customer.created',
    'customer.updated',
    'customer.deleted',
    'invoice.created',
    'invoice.finalized',
    'invoice.paid',
    'invoice.payment_failed',
];
//# sourceMappingURL=primitives.js.map