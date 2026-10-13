import Stripe from 'stripe';
import { fromUnix, now } from '@arki/date';
import { Money, sum } from '@arki/money';
import { fromStripeAmount, toStripeAmount } from '@arki/money/stripe';
import { toMinorColumn } from '../money.js';
import { createCustomerId, createPlanId } from '../primitives.js';
import { BasePaymentProvider } from './base-provider.js';
export class StripeProvider extends BasePaymentProvider {
    providerType = 'stripe';
    stripe;
    // Declare provider features supported by Stripe
    features = {
        customerPortal: true,
        automatedInvoicing: true,
        automatedDunning: true,
        taxCalculation: true,
        taxCompliance: true,
        taxReporting: true,
    };
    constructor(config) {
        super(config);
        this.stripe = new Stripe(config.apiKey, {
            apiVersion: '2026-09-30.endive',
            typescript: true,
        });
    }
    async createCustomer(params) {
        const stripeCustomer = await this.stripe.customers.create({
            email: params.email,
            name: params.name,
            metadata: {
                userId: params.userId,
                ...params.metadata,
            },
        });
        return {
            id: createCustomerId(),
            userId: params.userId,
            providerCustomerId: stripeCustomer.id,
            provider: 'stripe',
            email: params.email,
            name: params.name ?? null,
            defaultPaymentMethodId: null,
            metadata: params.metadata ?? null,
            createdAt: fromUnix(stripeCustomer.created),
            updatedAt: now(),
        };
    }
    async getCustomer(_customerId) {
        try {
            // This would typically retrieve from our database first
            // For now, implementing the provider interface
            throw new Error('Method should retrieve from database, not implement directly');
        }
        catch {
            return null;
        }
    }
    async updateCustomer(_customerId, _params) {
        // Implementation would update both Stripe and our database
        throw new Error('Not implemented - requires database integration');
    }
    async deleteCustomer(_customerId) {
        // Implementation would delete from both Stripe and our database
        throw new Error('Not implemented - requires database integration');
    }
    async createPlan(params) {
        const stripeProduct = await this.stripe.products.create({
            name: params.name,
            metadata: params.metadata,
        });
        const stripePrice = await this.stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: toStripeAmount(params.amount),
            currency: params.amount.currency.code,
            recurring: {
                interval: this.mapBillingIntervalToStripe(params.interval),
                interval_count: params.intervalCount || 1,
            },
            metadata: params.metadata,
        });
        return {
            id: createPlanId(),
            name: params.name,
            description: '',
            tier: 'basic', // Would be determined by business logic
            priceMinor: toMinorColumn(params.amount),
            currency: params.amount.currency.code,
            interval: params.interval,
            intervalCount: params.intervalCount || 1,
            features: [], // Would be populated from metadata or separate config
            isActive: true,
            trialPeriodDays: params.trialPeriodDays ?? null,
            metadata: { stripeProductId: stripeProduct.id, stripePriceId: stripePrice.id, ...params.metadata },
            createdAt: now(),
            updatedAt: now(),
        };
    }
    async getPlan(_planId) {
        // Implementation would retrieve from our database
        throw new Error('Not implemented - requires database integration');
    }
    async updatePlan(_planId, _params) {
        // Implementation would update both Stripe and our database
        throw new Error('Not implemented - requires database integration');
    }
    async deletePlan(_planId) {
        // Implementation would archive in both Stripe and our database
        throw new Error('Not implemented - requires database integration');
    }
    async listPlans() {
        // Implementation would retrieve from our database
        throw new Error('Not implemented - requires database integration');
    }
    async createSubscription(_params) {
        // This would require database lookups to get Stripe IDs
        // Simplified implementation showing the pattern
        throw new Error('Not implemented - requires database integration for customer/plan lookups');
    }
    async getSubscription(_subscriptionId) {
        // Implementation would retrieve from our database
        throw new Error('Not implemented - requires database integration');
    }
    async updateSubscription(_subscriptionId, _params) {
        // Implementation would update both Stripe and our database
        throw new Error('Not implemented - requires database integration');
    }
    async cancelSubscription(_subscriptionId, _options) {
        // Implementation would cancel in both Stripe and our database
        throw new Error('Not implemented - requires database integration');
    }
    async reactivateSubscription(_subscriptionId) {
        // Implementation would reactivate in both Stripe and our database
        throw new Error('Not implemented - requires database integration');
    }
    async pauseSubscription(_subscriptionId) {
        // Stripe-specific pause logic
        throw new Error('Not implemented - requires database integration');
    }
    async resumeSubscription(_subscriptionId) {
        // Stripe-specific resume logic
        throw new Error('Not implemented - requires database integration');
    }
    async previewSubscriptionChange(_params) {
        // Stripe-specific proration preview
        throw new Error('Not implemented - requires database integration');
    }
    async createPayment(_params) {
        // Implementation would create payment intent in Stripe
        throw new Error('Not implemented - requires database integration');
    }
    async getPayment(_paymentId) {
        // Implementation would retrieve from our database
        throw new Error('Not implemented - requires database integration');
    }
    async confirmPayment(_paymentId) {
        // Implementation would confirm payment intent in Stripe
        throw new Error('Not implemented - requires database integration');
    }
    async cancelPayment(_paymentId) {
        // Implementation would cancel payment intent in Stripe
        throw new Error('Not implemented - requires database integration');
    }
    async refundPayment(paymentId, params) {
        // For the refund service, we need to refund using the Stripe payment intent ID
        // This assumes paymentId is the Stripe payment intent ID
        const refund = await this.stripe.refunds.create({
            payment_intent: paymentId,
            // Stripe's own units: JPY is sent as yen, not yen × 100
            amount: params.amount === undefined ? undefined : toStripeAmount(params.amount),
            reason: this.mapRefundReasonToStripe(params.reason),
            metadata: params.metadata,
        });
        const refunded = fromStripeAmount(refund.amount, refund.currency);
        // Return a simplified Payment object for the refund
        // In a real implementation, this would create a proper Payment record
        return {
            id: refund.id,
            userId: 'usr_placeholder', // Would be retrieved from the original payment
            customerId: 'cust_placeholder',
            subscriptionId: null,
            providerPaymentId: refund.id,
            amountMinor: toMinorColumn(refunded),
            currency: refunded.currency.code,
            status: refund.status === 'succeeded' ? 'succeeded' : 'failed',
            paymentMethod: 'card', // Default
            description: `Refund for ${paymentId}`,
            failureReason: null,
            receiptUrl: null,
            refunded: true,
            refundedAmountMinor: toMinorColumn(refunded),
            metadata: refund.metadata ? Object.fromEntries(Object.entries(refund.metadata).map(([k, v]) => [k, v ?? null])) : null,
            createdAt: fromUnix(refund.created),
            updatedAt: now(),
        };
    }
    async attachPaymentMethod(_params) {
        // Implementation would attach payment method to customer in Stripe
        throw new Error('Not implemented - requires database integration');
    }
    async detachPaymentMethod(paymentMethodId) {
        await this.stripe.paymentMethods.detach(paymentMethodId);
    }
    async listPaymentMethods(_customerId) {
        // Implementation would list payment methods for customer
        throw new Error('Not implemented - requires database integration');
    }
    async setDefaultPaymentMethod(_params) {
        // Implementation would set default payment method for customer
        throw new Error('Not implemented - requires database integration');
    }
    async validateWebhook(payload, signature, _timestamp, _sourceIp) {
        try {
            // Validate Stripe webhook signature
            const event = this.stripe.webhooks.constructEvent(payload, signature, this.config.webhookSecret);
            return {
                isValid: true,
                provider: 'stripe',
                eventType: this.mapStripeEventType(event.type),
                data: event.data.object,
            };
        }
        catch (error) {
            return {
                isValid: false,
                provider: 'stripe',
                error: error instanceof Error ? error.message : 'Invalid webhook signature',
            };
        }
    }
    /**
     * Verify a webhook signature and return the **typed** Stripe event.
     *
     * `validateWebhook` (the provider-agnostic interface method) erases the event payload to
     * `Record<string, unknown>`. The subscription billing preset instead needs the discriminated
     * `Stripe.Event` so it can narrow on `event.type` and read `event.data.object` as a
     * `Stripe.Subscription` with no unsafe cast. Throws `StripeSignatureVerificationError` on a bad
     * signature — a webhook route should map that to HTTP 400.
     */
    constructWebhookEvent(payload, signature) {
        return this.stripe.webhooks.constructEvent(payload, signature, this.config.webhookSecret);
    }
    async createSetupIntent(_customerId) {
        // Implementation would create setup intent for customer
        throw new Error('Not implemented - requires database integration');
    }
    async createPaymentIntent(_params) {
        // Implementation would create payment intent
        throw new Error('Not implemented - requires database integration');
    }
    async createCustomerPortalSession(providerCustomerId, returnUrl) {
        const session = await this.stripe.billingPortal.sessions.create({
            customer: providerCustomerId,
            return_url: returnUrl,
        });
        return { url: session.url };
    }
    /**
     * Create a Stripe Checkout Session for a subscription — the modern hosted subscribe flow.
     *
     * This is the path that actually starts a paid subscription: Stripe hosts the payment page and
     * handles card entry, SCA/3DS, the free trial, tax, and promo codes, then emits
     * `customer.subscription.*` webhooks that the billing preset projects into the `subscriptions`
     * table. We deliberately use Checkout rather than the raw `subscriptions.create` API so we never
     * touch card data (no PCI scope) and get trials + Stripe Tax for free.
     */
    async createCheckoutSession(params) {
        const session = await this.stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{ price: params.priceId, quantity: 1 }],
            // `customer` and `customer_email` are mutually exclusive in Checkout.
            customer: params.providerCustomerId,
            customer_email: params.providerCustomerId ? undefined : params.customerEmail,
            client_reference_id: params.clientReferenceId,
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            allow_promotion_codes: true,
            ...(params.automaticTax ? { automatic_tax: { enabled: true } } : {}),
            subscription_data: {
                ...(params.trialPeriodDays ? { trial_period_days: params.trialPeriodDays } : {}),
                ...(params.metadata ? { metadata: params.metadata } : {}),
            },
            metadata: params.metadata,
        });
        if (!session.url) {
            throw new Error('Stripe Checkout did not return a session URL');
        }
        return { url: session.url, sessionId: session.id };
    }
    // Tax-related methods
    async calculateTax(params) {
        const calculation = await this.stripe.tax.calculations.create({
            currency: params.currency,
            line_items: params.lineItems.map(item => ({
                // Throws CurrencyMismatchError for a line item in another currency
                amount: toStripeAmount(Money.of(item.amount, params.currency.toUpperCase())),
                reference: item.reference,
                tax_code: item.taxCode || 'txcd_10000000', // General tax code
            })),
            customer_details: params.customerDetails ? {
                address: params.customerDetails.address ? {
                    ...params.customerDetails.address,
                    country: params.customerDetails.address.country || 'US',
                } : undefined,
                address_source: 'billing',
                tax_ids: params.customerDetails.taxIds?.map(taxId => ({
                    type: taxId.type,
                    value: taxId.value,
                })),
            } : undefined,
            expand: ['line_items.data.tax_breakdown'],
        });
        return {
            amountTotal: fromStripeAmount(calculation.amount_total, calculation.currency),
            taxAmountExclusive: fromStripeAmount(calculation.tax_amount_exclusive, calculation.currency),
            taxAmountInclusive: fromStripeAmount(calculation.tax_amount_inclusive, calculation.currency),
            taxBreakdown: calculation.line_items?.data?.flatMap((item) => item.tax_breakdown?.map((breakdown) => ({
                amount: fromStripeAmount(breakdown.amount, calculation.currency),
                rate: typeof breakdown.tax_rate_details?.percentage_decimal === 'number'
                    ? breakdown.tax_rate_details.percentage_decimal
                    : Number.parseFloat(String(breakdown.tax_rate_details?.percentage_decimal || 0)),
                jurisdiction: breakdown.jurisdiction?.display_name || '',
                taxCode: breakdown.jurisdiction?.level || undefined,
            })) || []) || [],
        };
    }
    async createTaxTransaction(params) {
        // For now, we'll simulate a tax transaction since Stripe's Tax API
        // may have different endpoints for transaction recording
        // In production, this would integrate with Stripe's actual tax recording API
        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        // A whole quantity times an amount is exact: no rounding mode needed
        const totalAmount = sum(params.lineItems.map(item => Money.of(item.amount, params.currency.toUpperCase()).times(item.quantity || 1)), params.currency.toUpperCase());
        // This would typically call Stripe's tax transaction API
        // await this.stripe.tax.transactions.createFromCalculation(...)
        return {
            id: transactionId,
            amountTotal: totalAmount,
            taxAmountExclusive: Money.zero(params.currency.toUpperCase()), // Would be calculated by Stripe
            taxAmountInclusive: Money.zero(params.currency.toUpperCase()), // Would be calculated by Stripe
        };
    }
    async getTaxSettings() {
        const settings = await this.stripe.tax.settings.retrieve({
            expand: ['head_office', 'status_details'],
        });
        return {
            defaultTaxCode: settings.defaults?.tax_code || 'txcd_10000000',
            headOfficeLocation: settings.head_office ? {
                address: {
                    country: settings.head_office.address.country || 'US',
                    state: settings.head_office.address.state || undefined,
                    city: settings.head_office.address.city || undefined,
                    line1: settings.head_office.address.line1 || undefined,
                    postalCode: settings.head_office.address.postal_code || undefined,
                },
            } : undefined,
            taxRegistrations: [], // Simplified for now - would parse actual status details
        };
    }
    async getTaxReport(params) {
        // Create a tax report (this is a placeholder for the actual implementation)
        // Stripe's tax reporting might use different endpoints based on jurisdiction
        // For now, we'll simulate a tax report creation
        const reportId = `tax_report_${Date.now()}_${params.reportType}`;
        // In a real implementation, this would:
        // 1. Create a report via Stripe's tax API for the specified date range
        // 2. Poll for completion
        // 3. Return download URLs
        console.log(`Creating tax report: ${params.reportType} from ${params.startDate.toString()} to ${params.endDate.toString()}`);
        return {
            id: reportId,
            status: 'pending',
            url: `https://dashboard.stripe.com/tax/reports/${reportId}`,
        };
    }
    async healthCheck() {
        try {
            // Simple health check - list recent events
            await this.stripe.events.list({ limit: 1 });
            return { status: 'healthy' };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                details: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    // Stripe-specific helper methods
    mapBillingIntervalToStripe(interval) {
        switch (interval) {
            case 'daily': {
                return 'day';
            }
            case 'weekly': {
                return 'week';
            }
            case 'monthly': {
                return 'month';
            }
            case 'yearly': {
                return 'year';
            }
            default: {
                return 'month';
            }
        }
    }
    mapStripeEventType(stripeEventType) {
        // Map Stripe event types to our webhook event types
        const eventTypeMap = {
            'customer.subscription.created': 'subscription.created',
            'customer.subscription.updated': 'subscription.updated',
            'customer.subscription.deleted': 'subscription.canceled',
            'customer.subscription.trial_will_end': 'subscription.trial_will_end',
            'payment_intent.succeeded': 'payment.succeeded',
            'payment_intent.payment_failed': 'payment.failed',
            'payment_intent.requires_action': 'payment.requires_action',
            'customer.created': 'customer.created',
            'customer.updated': 'customer.updated',
            'customer.deleted': 'customer.deleted',
            'invoice.created': 'invoice.created',
            'invoice.finalized': 'invoice.finalized',
            'invoice.payment_succeeded': 'invoice.paid',
            'invoice.payment_failed': 'invoice.payment_failed',
        };
        return eventTypeMap[stripeEventType] || stripeEventType;
    }
    mapRefundReasonToStripe(reason) {
        if (!reason)
            return undefined;
        const reasonMap = {
            'customer_request': 'requested_by_customer',
            'duplicate_charge': 'duplicate',
            'fraudulent_transaction': 'fraudulent',
            'service_not_delivered': 'requested_by_customer',
            'billing_error': 'requested_by_customer',
            'technical_issue': 'requested_by_customer',
            'goodwill_gesture': 'requested_by_customer',
            'chargeback_prevention': 'requested_by_customer',
            'other': 'requested_by_customer',
        };
        return reasonMap[reason] || 'requested_by_customer';
    }
}
//# sourceMappingURL=stripe-provider.js.map