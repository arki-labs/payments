import { EventEmitter } from 'node:events';
import type { CoreWrites } from '../journal.js';
import type { RefundWrites } from '../../refunds/journal.js';
import type { RefundRepository } from '../../refunds/repository.js';
import type { PaymentRepository } from '../repository.js';
import type { PaymentProviderType, WebhookEventType, WebhookId } from '../types.js';
import type { WebhookSecurityService } from './webhook-security.js';
/** The storage the handler needs: the event claims, and the two lookups by provider id. A `PaymentRepository` satisfies it. */
export type WebhookEventStore = Pick<PaymentRepository, 'claimWebhookEvent' | 'reclaimWebhookEvent' | 'markWebhookEventAsProcessed' | 'findUnprocessedWebhookEvents' | 'updateWebhookEvent' | 'findSubscriptionByProviderSubscriptionId' | 'findPaymentByProviderPaymentId'>;
/** The validation the handler needs. A `WebhookSecurityService` satisfies it. */
export type WebhookValidator = Pick<WebhookSecurityService, 'validateWebhook'>;
/** The journal writes the handler makes. A `CoreWrites` satisfies it. */
export type WebhookWrites = Pick<CoreWrites, 'syncSubscription' | 'completePayment' | 'failPayment' | 'markPaymentRequiresAction' | 'recordPaymentRefund' | 'recordPaymentDispute'>;
/**
 * What the handler needs to line a provider refund up with a `refunds` row. A `RefundRepository`
 * and `refundsJournal.writes(run)` satisfy it. Apps without the refunds module leave it out.
 */
export type WebhookRefunds = {
    reads: Pick<RefundRepository, 'findById' | 'findByProviderRefundId'>;
    writes: Pick<RefundWrites, 'completeRefund'>;
};
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
    /** Attempts after which an unprocessed event is given up on, and the provider told to stop resending. */
    maxRetries: number;
    retryDelayMs: number;
    /**
     * Answer before the event is processed. Off by default: the provider's
     * resends are the retry mechanism, and they only happen when the answer
     * says the event failed. An early answer turns every processing failure
     * into a lost event.
     */
    enableAsync: boolean;
    enableEventEmitter: boolean;
    /**
     * How long an attempt may run before another delivery may take the event
     * over. An attempt older than this with no recorded error is treated as
     * crashed.
     */
    processingLeaseMs: number;
    /** Skip the source-address check. For routes with no real client address; the signature check still runs. */
    skipIpValidation: boolean;
};
export declare class WebhookHandler extends EventEmitter {
    private readonly paymentRepository;
    private readonly webhookSecurity;
    /** Every change of a `payments` or `subscriptions` row goes through the journal: `paymentsJournal.writes(run)`. */
    private readonly writes;
    private readonly refunds?;
    private readonly config;
    private readonly eventHandlers;
    constructor(paymentRepository: WebhookEventStore, webhookSecurity: WebhookValidator, 
    /** Every change of a `payments` or `subscriptions` row goes through the journal: `paymentsJournal.writes(run)`. */
    writes: WebhookWrites, config?: Partial<WebhookHandlerConfig>, refunds?: WebhookRefunds | undefined);
    processWebhook(provider: PaymentProviderType, payload: string | Buffer, signature: string, timestamp: string, sourceIp: string, webhookSecret: string): Promise<WebhookProcessingResult>;
    /**
     * Re-run failed or crashed events without waiting for a resend. Optional:
     * provider resends already do this. Uses the same takeover as a resend, so
     * it never runs an event whose attempt is still inside its lease.
     */
    retryFailedWebhooks(): Promise<void>;
    private processEventAsync;
    /** The moment before which an attempt with no recorded error counts as crashed. */
    private leaseCutoff;
    /**
     * Run an event this caller has claimed. On failure, record the error on the
     * row, so the next resend may take the event over, and rethrow.
     */
    private runClaimed;
    private processEvent;
    private parseEventData;
    private setupEventHandlers;
    /**
     * Bring the local subscription in line with Stripe. The row must exist: a
     * subscription made outside the app has no owner here, so the event fails
     * and is retried (open item D4). `planId` and `metadata` stay as they are.
     * A delivery that changes nothing writes no event.
     */
    private applySubscriptionEvent;
    /**
     * Move the local payment to what Stripe reports, following
     * `paymentMovesFrom`. A payment already where the event would put it, or
     * settled past it, is left alone and the event counts as done.
     */
    private applyPaymentEvent;
    /**
     * Stripe reports the total refunded so far on the charge, so a resent or out-of-order event
     * cannot double or lower the amount. A charge made outside a PaymentIntent has no local payment.
     */
    private handlePaymentRefunded;
    /**
     * Lines each refund Stripe lists on the charge up with our `refunds` row:
     * - one we hold by its Stripe id is already linked, nothing to do (a resent event lands here);
     * - one `RefundService` made (its `metadata.refundId`) that is still `processing` is completed
     *   with Stripe's id: the service asked Stripe but died before it stored the answer;
     * - one made at Stripe, outside the service, has no row, and none is invented for it.
     * Refunds Stripe has not succeeded yet are left for the next event.
     */
    private reconcileRefunds;
    /**
     * A refund on its own, for Stripe API versions that do not list refunds on the charge.
     * It lines up with our `refunds` row the same way as a refund listed on a charge.
     */
    private handleRefundUpdated;
    private handlePaymentDisputeCreated;
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
export declare function createWebhookHandler(paymentRepository: WebhookEventStore, webhookSecurity: WebhookValidator, writes: WebhookWrites, config?: Partial<WebhookHandlerConfig>, refunds?: WebhookRefunds): WebhookHandler;
//# sourceMappingURL=webhook-handler.d.ts.map