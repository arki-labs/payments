import { EventEmitter } from 'node:events';
import type { PaymentRepository } from '../repository.js';
import type { PaymentProviderType, WebhookEventType, WebhookId } from '../types.js';
import type { WebhookSecurityService } from './webhook-security.js';
export type WebhookProcessingResult = {
    success: boolean;
    webhookId?: WebhookId;
    error?: string;
    retryable?: boolean;
};
export type WebhookEventData = {
    type: WebhookEventType;
    provider: PaymentProviderType;
    data: Record<string, unknown>;
    webhookId: WebhookId;
};
export type WebhookHandlerConfig = {
    maxRetries: number;
    retryDelayMs: number;
    enableAsync: boolean;
    enableEventEmitter: boolean;
};
export declare class WebhookHandler extends EventEmitter {
    private readonly paymentRepository;
    private readonly webhookSecurity;
    private readonly config;
    private readonly eventHandlers;
    constructor(paymentRepository: PaymentRepository, webhookSecurity: WebhookSecurityService, config?: Partial<WebhookHandlerConfig>);
    processWebhook(provider: PaymentProviderType, payload: string | Buffer, signature: string, timestamp: string, sourceIp: string, webhookSecret: string): Promise<WebhookProcessingResult>;
    retryFailedWebhooks(): Promise<void>;
    private processEventAsync;
    private processEvent;
    private parseEventData;
    private setupEventHandlers;
    private handleSubscriptionCreated;
    private handleSubscriptionUpdated;
    private handleSubscriptionCanceled;
    private handleSubscriptionTrialWillEnd;
    private handlePaymentSucceeded;
    private handlePaymentFailed;
    private handlePaymentRequiresAction;
    private handleCustomerCreated;
    private handleCustomerUpdated;
    private handleCustomerDeleted;
    private handleInvoiceCreated;
    private handleInvoiceFinalized;
    private handleInvoicePaid;
    private handleInvoicePaymentFailed;
    registerEventHandler(eventType: WebhookEventType, handler: (data: WebhookEventData) => Promise<void>): void;
    removeEventHandler(eventType: WebhookEventType): void;
    getProcessingStats(): {
        totalHandlers: number;
        supportedEventTypes: WebhookEventType[];
    };
}
export declare function createWebhookHandler(paymentRepository: PaymentRepository, webhookSecurity: WebhookSecurityService, config?: Partial<WebhookHandlerConfig>): WebhookHandler;
//# sourceMappingURL=webhook-handler.d.ts.map