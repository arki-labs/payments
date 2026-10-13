import { EventEmitter } from 'node:events';
import { now } from '@arki/date';
import { createWebhookId } from '../primitives.js';
export class WebhookHandler extends EventEmitter {
    paymentRepository;
    webhookSecurity;
    config;
    eventHandlers = new Map();
    constructor(paymentRepository, webhookSecurity, config = {}) {
        super();
        this.paymentRepository = paymentRepository;
        this.webhookSecurity = webhookSecurity;
        this.config = {
            maxRetries: 3,
            retryDelayMs: 1000,
            enableAsync: true,
            enableEventEmitter: true,
            ...config,
        };
        this.setupEventHandlers();
    }
    async processWebhook(provider, payload, signature, timestamp, sourceIp, webhookSecret) {
        try {
            // 1. Validate webhook security
            const validation = await this.webhookSecurity.validateWebhook(provider, payload, signature, timestamp, sourceIp, webhookSecret);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.error || 'Webhook validation failed',
                    retryable: false,
                };
            }
            // 2. Parse event data
            const eventData = this.parseEventData(payload);
            if (!eventData.type || !eventData.id) {
                return {
                    success: false,
                    error: 'Invalid webhook payload: missing type or id',
                    retryable: false,
                };
            }
            // 3. Check for duplicate events
            const existingEvent = await this.paymentRepository.findWebhookEventByProviderEventId(eventData.id, provider);
            if (existingEvent?.processed) {
                return {
                    success: true,
                    webhookId: existingEvent.id,
                    error: 'Event already processed',
                };
            }
            // 4. Store webhook event
            let webhookId;
            if (existingEvent) {
                webhookId = existingEvent.id;
                await this.paymentRepository.incrementWebhookEventAttempts(webhookId);
            }
            else {
                const webhookEvent = await this.paymentRepository.createWebhookEvent({
                    id: createWebhookId(),
                    provider,
                    eventType: validation.eventType,
                    providerEventId: eventData.id,
                    data: validation.data || {},
                    processed: false,
                    attempts: 1,
                    lastAttemptAt: now(),
                    sourceIp,
                    createdAt: now(),
                    updatedAt: now(),
                });
                webhookId = webhookEvent.id;
            }
            // 5. Process the event
            if (this.config.enableAsync) {
                // Process asynchronously
                this.processEventAsync(webhookId, validation.eventType, provider, validation.data || {});
                return { success: true, webhookId };
            }
            else {
                // Process synchronously
                await this.processEvent(webhookId, validation.eventType, provider, validation.data || {});
                return { success: true, webhookId };
            }
        }
        catch (error) {
            return {
                success: false,
                error: `Webhook processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                retryable: true,
            };
        }
    }
    async retryFailedWebhooks() {
        try {
            const unprocessedEvents = await this.paymentRepository.findUnprocessedWebhookEvents();
            for (const event of unprocessedEvents) {
                if (event.attempts < this.config.maxRetries) {
                    await this.processEventAsync(event.id, event.eventType, event.provider, event.data);
                }
                else {
                    // Mark as failed after max retries
                    await this.paymentRepository.updateWebhookEvent(event.id, {
                        errorMessage: 'Max retry attempts exceeded',
                    });
                    this.emit('webhook:failed', {
                        webhookId: event.id,
                        eventType: event.eventType,
                        provider: event.provider,
                        error: 'Max retry attempts exceeded',
                    });
                }
            }
        }
        catch (error) {
            this.emit('webhook:retry_error', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async processEventAsync(webhookId, eventType, provider, data) {
        // Process in background
        setImmediate(async () => {
            try {
                await this.processEvent(webhookId, eventType, provider, data);
            }
            catch (error) {
                await this.paymentRepository.incrementWebhookEventAttempts(webhookId, error instanceof Error ? error.message : 'Unknown error');
                this.emit('webhook:processing_error', {
                    webhookId,
                    eventType,
                    provider,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
    }
    async processEvent(webhookId, eventType, provider, data) {
        try {
            const eventData = {
                type: eventType,
                provider,
                data,
                webhookId,
            };
            // Execute specific event handler
            const handler = this.eventHandlers.get(eventType);
            if (handler) {
                await handler(eventData);
            }
            else {
                console.warn(`No handler found for webhook event type: ${eventType}`);
            }
            // Mark as processed
            await this.paymentRepository.markWebhookEventAsProcessed(webhookId);
            // Emit success event
            if (this.config.enableEventEmitter) {
                this.emit('webhook:processed', eventData);
                this.emit(`webhook:${eventType}`, eventData);
            }
        }
        catch (error) {
            throw error;
        }
    }
    parseEventData(payload) {
        try {
            const payloadStr = typeof payload === 'string' ? payload : payload.toString();
            return JSON.parse(payloadStr);
        }
        catch {
            return { type: '', id: '', data: {} };
        }
    }
    setupEventHandlers() {
        // Subscription events
        this.eventHandlers.set('subscription.created', async (data) => {
            await this.handleSubscriptionCreated(data);
        });
        this.eventHandlers.set('subscription.updated', async (data) => {
            await this.handleSubscriptionUpdated(data);
        });
        this.eventHandlers.set('subscription.canceled', async (data) => {
            await this.handleSubscriptionCanceled(data);
        });
        this.eventHandlers.set('subscription.trial_will_end', async (data) => {
            await this.handleSubscriptionTrialWillEnd(data);
        });
        // Payment events
        this.eventHandlers.set('payment.succeeded', async (data) => {
            await this.handlePaymentSucceeded(data);
        });
        this.eventHandlers.set('payment.failed', async (data) => {
            await this.handlePaymentFailed(data);
        });
        this.eventHandlers.set('payment.requires_action', async (data) => {
            await this.handlePaymentRequiresAction(data);
        });
        // Customer events
        this.eventHandlers.set('customer.created', async (data) => {
            await this.handleCustomerCreated(data);
        });
        this.eventHandlers.set('customer.updated', async (data) => {
            await this.handleCustomerUpdated(data);
        });
        this.eventHandlers.set('customer.deleted', async (data) => {
            await this.handleCustomerDeleted(data);
        });
        // Invoice events
        this.eventHandlers.set('invoice.created', async (data) => {
            await this.handleInvoiceCreated(data);
        });
        this.eventHandlers.set('invoice.finalized', async (data) => {
            await this.handleInvoiceFinalized(data);
        });
        this.eventHandlers.set('invoice.paid', async (data) => {
            await this.handleInvoicePaid(data);
        });
        this.eventHandlers.set('invoice.payment_failed', async (data) => {
            await this.handleInvoicePaymentFailed(data);
        });
    }
    // Event handler implementations
    async handleSubscriptionCreated(data) {
        try {
            // Extract subscription data from webhook
            const subscriptionData = data.data;
            console.log('Subscription created:', subscriptionData);
            // Update local database if needed
            // This would typically sync with the provider data
            this.emit('subscription:created', { subscriptionData, webhookId: data.webhookId });
        }
        catch (error) {
            throw new Error(`Failed to handle subscription created: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleSubscriptionUpdated(data) {
        try {
            const subscriptionData = data.data;
            console.log('Subscription updated:', subscriptionData);
            // Sync subscription status and details with local database
            this.emit('subscription:updated', { subscriptionData, webhookId: data.webhookId });
        }
        catch (error) {
            throw new Error(`Failed to handle subscription updated: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleSubscriptionCanceled(data) {
        try {
            const subscriptionData = data.data;
            console.log('Subscription canceled:', subscriptionData);
            // Update subscription status in local database
            // Trigger any cancellation workflows (access revocation, notifications, etc.)
            this.emit('subscription:canceled', { subscriptionData, webhookId: data.webhookId });
        }
        catch (error) {
            throw new Error(`Failed to handle subscription canceled: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleSubscriptionTrialWillEnd(data) {
        try {
            const subscriptionData = data.data;
            console.log('Subscription trial will end:', subscriptionData);
            // Send trial ending notifications
            // Update user about upcoming charges
            this.emit('subscription:trial_ending', { subscriptionData, webhookId: data.webhookId });
        }
        catch (error) {
            throw new Error(`Failed to handle trial will end: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handlePaymentSucceeded(data) {
        try {
            const paymentData = data.data;
            console.log('Payment succeeded:', paymentData);
            // Update payment status in local database
            // Send payment confirmation
            // Update user access/features
            this.emit('payment:succeeded', { paymentData, webhookId: data.webhookId });
        }
        catch (error) {
            throw new Error(`Failed to handle payment succeeded: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handlePaymentFailed(data) {
        try {
            const paymentData = data.data;
            console.log('Payment failed:', paymentData);
            // Update payment status in local database
            // Send payment failure notification
            // Implement retry logic or access restrictions
            this.emit('payment:failed', { paymentData, webhookId: data.webhookId });
        }
        catch (error) {
            throw new Error(`Failed to handle payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handlePaymentRequiresAction(data) {
        try {
            const paymentData = data.data;
            console.log('Payment requires action:', paymentData);
            // Notify user that action is required (e.g., 3D Secure authentication)
            this.emit('payment:requires_action', { paymentData, webhookId: data.webhookId });
        }
        catch (error) {
            throw new Error(`Failed to handle payment requires action: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleCustomerCreated(data) {
        try {
            const customerData = data.data;
            console.log('Customer created:', customerData);
            this.emit('customer:created', { customerData, webhookId: data.webhookId });
        }
        catch (error) {
            throw new Error(`Failed to handle customer created: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleCustomerUpdated(data) {
        try {
            const customerData = data.data;
            console.log('Customer updated:', customerData);
            this.emit('customer:updated', { customerData, webhookId: data.webhookId });
        }
        catch (error) {
            throw new Error(`Failed to handle customer updated: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleCustomerDeleted(data) {
        try {
            const customerData = data.data;
            console.log('Customer deleted:', customerData);
            // Clean up customer data and subscriptions
            this.emit('customer:deleted', { customerData, webhookId: data.webhookId });
        }
        catch (error) {
            throw new Error(`Failed to handle customer deleted: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleInvoiceCreated(data) {
        try {
            const invoiceData = data.data;
            console.log('Invoice created:', invoiceData);
            this.emit('invoice:created', { invoiceData, webhookId: data.webhookId });
        }
        catch (error) {
            throw new Error(`Failed to handle invoice created: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleInvoiceFinalized(data) {
        try {
            const invoiceData = data.data;
            console.log('Invoice finalized:', invoiceData);
            this.emit('invoice:finalized', { invoiceData, webhookId: data.webhookId });
        }
        catch (error) {
            throw new Error(`Failed to handle invoice finalized: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleInvoicePaid(data) {
        try {
            const invoiceData = data.data;
            console.log('Invoice paid:', invoiceData);
            this.emit('invoice:paid', { invoiceData, webhookId: data.webhookId });
        }
        catch (error) {
            throw new Error(`Failed to handle invoice paid: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleInvoicePaymentFailed(data) {
        try {
            const invoiceData = data.data;
            console.log('Invoice payment failed:', invoiceData);
            this.emit('invoice:payment_failed', { invoiceData, webhookId: data.webhookId });
        }
        catch (error) {
            throw new Error(`Failed to handle invoice payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Public utility methods
    registerEventHandler(eventType, handler) {
        this.eventHandlers.set(eventType, handler);
    }
    removeEventHandler(eventType) {
        this.eventHandlers.delete(eventType);
    }
    getProcessingStats() {
        return {
            totalHandlers: this.eventHandlers.size,
            supportedEventTypes: [...this.eventHandlers.keys()],
        };
    }
}
export function createWebhookHandler(paymentRepository, webhookSecurity, config) {
    return new WebhookHandler(paymentRepository, webhookSecurity, config);
}
//# sourceMappingURL=webhook-handler.js.map