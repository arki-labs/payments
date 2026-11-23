import { EventEmitter } from 'node:events';
import type { SchemaInput } from '@arki/schema';
import { z } from '@arki/contracts';
import type { RefundWorkflow } from '../../refunds/workflow.js';
import type { CoreWrites } from '../journal.js';
import type { PaymentRepository } from '../repository.js';
import type { PaymentProviderType, WebhookEventType, WebhookId } from '../types.js';
import type { WebhookSecurityService } from './webhook-security.js';
export * from './webhook-failures.js';
/** The storage the handler needs: the event claims, and the two lookups by provider id. A `PaymentRepository` satisfies it. */
export type WebhookEventStore = Pick<PaymentRepository, 'claimWebhookEvent' | 'reclaimWebhookEvent' | 'markWebhookEventAsProcessed' | 'findUnprocessedWebhookEvents' | 'updateWebhookEvent' | 'findSubscriptionByProviderSubscriptionId' | 'findPaymentByProviderPaymentId'>;
/** The validation the handler needs. A `WebhookSecurityService` satisfies it. */
export type WebhookValidator = Pick<WebhookSecurityService, 'validateWebhook'>;
/** The journal writes the handler makes. A `CoreWrites` satisfies it. */
export type WebhookWrites = Pick<CoreWrites, 'syncSubscription' | 'completePayment' | 'failPayment' | 'markPaymentRequiresAction' | 'recordPaymentRefund' | 'recordPaymentDispute'>;
/** The `stripe.refund.settled` signal of the refund workflow. */
type RefundSettled = ReturnType<RefundWorkflow['signal']>;
/**
 * How the handler tells a refund's workflow run that Stripe settled the refund: the app runs
 * `refundWorkflow.signal('stripe.refund.settled')` with its journal. Apps without the refunds module leave it out.
 */
export type WebhookRefunds = {
    signal: (input: SchemaInput<RefundSettled['input']>) => Promise<Awaited<ReturnType<RefundSettled['handler']>>>;
};
export type WebhookEventData = {
    type: WebhookEventType;
    provider: PaymentProviderType;
    data: Record<string, unknown>;
    webhookId: WebhookId;
};
/** The handler's settings, checked when it is built. */
declare const webhookHandlerConfigSchema: z.ZodObject<{
    maxRetries: z.ZodNumber;
    retryDelayMs: z.ZodNumber;
    enableAsync: z.ZodBoolean;
    enableEventEmitter: z.ZodBoolean;
    processingLeaseMs: z.ZodNumber;
    skipIpValidation: z.ZodBoolean;
}, z.core.$strip>;
export type WebhookHandlerConfig = z.output<typeof webhookHandlerConfigSchema>;
export declare class WebhookHandler extends EventEmitter {
    private readonly paymentRepository;
    private readonly webhookSecurity;
    private readonly writes;
    private readonly refunds?;
    private readonly config;
    /** Handlers the app registered. One replaces the built-in handling of its event type. */
    private readonly customHandlers;
    private constructor();
    /**
     * Builds the handler. Returns `payments.configuration_invalid` (and builds nothing) for a count or
     * duration outside its range (see `WebhookHandlerConfig`): a bad setting fails here, not on the first delivery.
     *
     * @param writes Every change of a `payments` or `subscriptions` row goes through the journal: `paymentsJournal.writes(run)`.
     */
    static create(paymentRepository: WebhookEventStore, webhookSecurity: WebhookValidator, writes: WebhookWrites, config?: Partial<WebhookHandlerConfig>, refunds?: WebhookRefunds): import("@arki/failure").Failure<"payments.configuration_invalid", {
        setting: string;
        problem: string;
    }> | WebhookHandler;
    /**
     * Validate, claim and process one delivery, in a `payments.webhook.process` span.
     *
     * Returns a `WebhookProcessingResult` (`processed`, `queued`, `duplicate` or `ignored`) when the
     * route may answer 2xx. Otherwise a returned failure: one of `WEBHOOK_FAILURES`, whose
     * `data.retryable` says whether a resend can succeed; a refused journal write, a money failure
     * or a refund signal failure, all of which a resend may get past (answer non-2xx); or a webhook
     * id failure. A fault (the database, a registered handler) throws after it is recorded on the
     * event's row; answer non-2xx.
     */
    processWebhook(provider: PaymentProviderType, payload: string | Buffer, signature: string, timestamp: string, sourceIp: string, webhookSecret: string): Promise<import("@arki/failure").Failure<"contracts.random_source_unavailable", undefined> | import("@arki/failure").Failure<"db.transaction_cancelled", undefined> | import("@arki/failure").Failure<"db.transaction_commit_uncertain", undefined> | import("@arki/failure").Failure<"db.transaction_conflict", {
        attempts: number;
        sqlState: "40001" | "40P01";
    }> | import("@arki/failure").Failure<"db.transaction_defect", undefined> | import("@arki/failure").Failure<"db.transaction_rejected", {
        sqlState: string;
    }> | import("@arki/failure").Failure<"db.transaction_unavailable", undefined> | import("@arki/failure").Failure<"failure.unexpected_defect", undefined> | import("@arki/failure").Failure<"journal.conflict", {
        detail: string;
    }> | import("@arki/failure").Failure<"journal.invalid", {
        detail: string;
    }> | import("@arki/failure").Failure<"journal.not_found", {
        detail: string;
    }> | import("@arki/failure").Failure<"money.input_too_large", undefined> | import("@arki/failure").Failure<"money.invalid_text", undefined> | import("@arki/failure").Failure<"money.out_of_range", undefined> | import("@arki/failure").Failure<"money.provider_amount", undefined> | import("@arki/failure").Failure<"money.unknown_currency", undefined> | import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription" | "user";
        id: string;
        missing: "provider_id" | "row";
    }> | import("@arki/failure").Failure<"payments.webhook_claim_conflict", {
        providerEventId: string;
        retryable: true;
    }> | import("@arki/failure").Failure<"payments.webhook_event_not_found", {
        webhookId: string;
    }> | import("@arki/failure").Failure<"payments.webhook_in_progress", {
        webhookId: `wh${string}`;
        retryable: true;
    }> | import("@arki/failure").Failure<"payments.webhook_payload_invalid", {
        retryable: false;
    }> | import("@arki/failure").Failure<"payments.webhook_rejected", {
        check: "replay" | "signature" | "source_ip" | "timestamp";
        reason: string;
        retryable: false;
    }> | import("@arki/failure").Failure<"payments.webhook_retries_exhausted", {
        webhookId: `wh${string}`;
        attempts: number;
        retryable: false;
    }> | import("@arki/failure").Failure<"payments.webhook_target_not_found", {
        kind: "payment" | "subscription";
        providerId: string;
        retryable: true;
    }> | import("@arki/failure").Failure<"schema.async_required", undefined> | import("@arki/failure").Failure<"schema.invalid_input", {
        issues: readonly import("@standard-schema/spec").StandardSchemaV1.Issue[];
    }> | import("@arki/failure").Failure<"schema.validator_defect", undefined> | {
        status: "ignored";
        webhookId?: undefined;
    } | {
        status: "duplicate";
        webhookId: `wh${string}`;
    } | {
        status: "queued";
        webhookId: `wh${string}`;
    } | {
        status: "processed";
        webhookId: `wh${string}`;
    }>;
    private receive;
    /**
     * Re-run failed or crashed events without waiting for a resend. Optional:
     * provider resends already do this. Uses the same takeover as a resend, so
     * it never runs an event whose attempt is still inside its lease.
     *
     * Reads only events with attempts left (fewer than `maxRetries`), oldest first, so events given
     * up on never crowd out newer ones. A run whose attempt was the last one emits `webhook:failed`
     * once, next to `webhook:processing_error`; the row keeps the error that attempt recorded.
     *
     * Returns one report per event read, in that order:
     *
     * - `processed`: the event ran and is marked processed.
     * - `skipped`: another taker holds the event (its attempt is still inside its lease); nothing ran.
     * - `refused`: the event's handler or a journal write returned a failure, in `failure`. It is
     *   recorded on the row, and the event stays unprocessed for the next resend or retry.
     * - `thrown`: the run threw (a fault), in `error`; recorded on the row the same way.
     *
     * One broken event never stops the others. A fault that stops the whole run (the event read or a
     * takeover throws: the database is down) emits `webhook:retry_error` and is thrown.
     */
    retryFailedWebhooks(): Promise<({
        webhookId: `wh${string}`;
        status: 'refused';
        failure: import("@arki/failure").Failure<"payments.counter_exhausted", {
            counter: "attempts" | "communicationsSent" | "customersReached" | "executions" | "paymentsRecovered" | "retryCount";
            id: string;
        }>;
    } | {
        webhookId: `wh${string}`;
        status: 'skipped';
        failure?: undefined;
    } | {
        webhookId: `wh${string}`;
        status: 'refused';
        failure: import("@arki/failure").Failure<"contracts.random_source_unavailable", undefined> | import("@arki/failure").Failure<"db.transaction_cancelled", undefined> | import("@arki/failure").Failure<"db.transaction_commit_uncertain", undefined> | import("@arki/failure").Failure<"db.transaction_conflict", {
            attempts: number;
            sqlState: "40001" | "40P01";
        }> | import("@arki/failure").Failure<"db.transaction_defect", undefined> | import("@arki/failure").Failure<"db.transaction_rejected", {
            sqlState: string;
        }> | import("@arki/failure").Failure<"db.transaction_unavailable", undefined> | import("@arki/failure").Failure<"failure.unexpected_defect", undefined> | import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.invalid", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/failure").Failure<"money.input_too_large", undefined> | import("@arki/failure").Failure<"money.invalid_text", undefined> | import("@arki/failure").Failure<"money.out_of_range", undefined> | import("@arki/failure").Failure<"money.provider_amount", undefined> | import("@arki/failure").Failure<"money.unknown_currency", undefined> | import("@arki/failure").Failure<"payments.reference_not_found", {
            kind: "customer" | "payment" | "plan" | "subscription" | "user";
            id: string;
            missing: "provider_id" | "row";
        }> | import("@arki/failure").Failure<"payments.webhook_event_not_found", {
            webhookId: string;
        }> | import("@arki/failure").Failure<"payments.webhook_payload_invalid", {
            retryable: false;
        }> | import("@arki/failure").Failure<"payments.webhook_target_not_found", {
            kind: "payment" | "subscription";
            providerId: string;
            retryable: true;
        }> | import("@arki/failure").Failure<"schema.async_required", undefined> | import("@arki/failure").Failure<"schema.validator_defect", undefined>;
        error?: undefined;
    } | {
        failure?: undefined;
        webhookId: `wh${string}`;
        status: 'processed';
        error?: undefined;
    } | {
        failure?: undefined;
        webhookId: `wh${string}`;
        status: 'thrown';
        error: unknown;
    })[]>;
    /** Run one event `retryFailedWebhooks` took over, and report it (see there). */
    private runRetried;
    private processEventAsync;
    /** The moment before which an attempt with no recorded error counts as crashed. */
    private leaseCutoff;
    /** The event's `id` and `type` from the raw body, or `WebhookPayloadInvalid` when it has none. */
    private readEnvelope;
    /**
     * Run an event this caller has claimed, in a `payments.webhook.event` span. A returned failure is
     * recorded on the row as `<code>: <message>` and returned: the event is not marked processed, so
     * the next resend may take it over. A thrown error is recorded the same way and rethrown.
     */
    private runClaimed;
    /**
     * Store why the attempt failed, so the next resend may take the event over. A row deleted
     * meanwhile has nothing to take over: that is logged, and the attempt's own outcome still stands.
     */
    private recordError;
    private processEvent;
    /** The built-in handling of each event type. A failure is returned, never thrown. */
    private handleEvent;
    /**
     * Bring the local subscription in line with Stripe. The row must exist: a
     * subscription made outside the app has no owner here, so the event returns
     * `WebhookTargetNotFound` and is retried (open item D4). `planId` and
     * `metadata` stay as they are. A delivery that changes nothing writes no event.
     */
    private applySubscriptionEvent;
    /**
     * Move the local payment to what Stripe reports, following
     * `paymentMovesFrom`. A payment already where the event would put it, or
     * settled past it, is left alone and the event counts as done.
     *
     * A write the journal refuses is returned (AGENTS.md law 9): the event is
     * not processed, and the route answers non-2xx so the provider resends it.
     */
    private applyPaymentEvent;
    /**
     * Stripe reports the total refunded so far on the charge, so a resent or out-of-order event
     * cannot double or lower the amount. A charge made outside a PaymentIntent has no local payment.
     */
    private handlePaymentRefunded;
    /**
     * Tells the workflow run of each refund `RefundService` made (its `metadata.refundId`) where Stripe settled it.
     * The run completes or fails the row; the handler writes no refund itself.
     * - `deliveryId` is `<webhookId>:<Stripe refund id>`: a resend of this event is the same delivery, so the run
     *   reports it `duplicate` and changes nothing.
     * - A refund made at Stripe, outside the service, has no `refundId` and is not signalled.
     * - No run for the refund (`no-run`) or a finished one is still a 2xx: a failure would make Stripe resend forever.
     * - A failure the signal returns is returned, so the event is not processed and Stripe resends it.
     * Refunds Stripe has not settled yet (`pending`, `requires_action`) wait for a later event.
     */
    private reconcileRefunds;
    /**
     * A refund on its own, for Stripe API versions that do not list refunds on the charge.
     * It lines up with our `refunds` row the same way as a refund listed on a charge.
     */
    private handleRefundUpdated;
    private handlePaymentDisputeCreated;
    /** Replace the built-in handling of `eventType` with `handler`. A throw from it is a fault: recorded, then rethrown. */
    registerEventHandler(eventType: WebhookEventType, handler: (data: WebhookEventData) => Promise<void>): void;
    /** Remove a handler `registerEventHandler` set; the built-in handling of `eventType` applies again. */
    removeEventHandler(eventType: WebhookEventType): void;
    /** Every event type has built-in handling, so every type is supported. */
    getProcessingStats(): {
        totalHandlers: number;
        supportedEventTypes: WebhookEventType[];
    };
}
/** Builds a `WebhookHandler`: the same as `WebhookHandler.create`, which returns `payments.configuration_invalid` for a bad setting. */
export declare function createWebhookHandler(paymentRepository: WebhookEventStore, webhookSecurity: WebhookValidator, writes: WebhookWrites, config?: Partial<WebhookHandlerConfig>, refunds?: WebhookRefunds): import("@arki/failure").Failure<"payments.configuration_invalid", {
    setting: string;
    problem: string;
}> | WebhookHandler;
//# sourceMappingURL=webhook-handler.d.ts.map