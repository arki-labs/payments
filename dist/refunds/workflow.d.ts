/**
 * A refund paid back by a durable workflow
 *
 * `createRefundWorkflow(j, refundsJournal)` defines `payments.refund` v1 on the app's journal. Approving a refund
 * (`RefundApproved`, by a person or by the auto-approval rule) starts one run, id `refund:<refundId>`, from a job
 * written in the approval's transaction. The run then pays the money back through Stripe and survives restarts:
 *
 * 1. `begin`: reads the refund. `approved` becomes `processing`; `processing` goes on (a re-run); anything else stops.
 * 2. `payBack`: looks the Stripe refund up by our refund id, and creates it only when Stripe has none, with the step's
 *    key as the idempotency key. A refund Stripe already `succeeded` completes the row.
 * 3. `settled`: waits up to 3 days for the `stripe.refund.settled` signal the webhook sends. It is skipped when
 *    `payBack` already saw where the refund ends.
 * 4. `record`: completes or fails the row from what Stripe says. A refund still on its way throws, so the step's
 *    backoff asks Stripe again later. A refund Stripe fails after the row is `completed` stays completed: the run
 *    ends `completed` with `lateFailure`, the error is logged, and support is alerted.
 * 5. `notify`: tells the customer the refund is completed, or support that it failed. The mailer takes no key, so a
 *    crash after the send and before the checkpoint sends the mail a second time.
 *
 * Stripe's answers a caller must handle (`ReferenceNotFound`, `IdempotencyConflict`) are returned, so the step dies at
 * once: the run waits, stuck, for an operator (`journal.workflows.retryStep` or `resolveStep`). A throw is retried
 * with the same key, except a `PaymentProviderError` Stripe will refuse again (`retryable` false), which kills the
 * step at once.
 */
import type { JournalDefinitions, RootDb, TransactionSource } from '@arki/journal';
import type { StandardSchemaV1 } from '@arki/schema';
import { z } from '@arki/contracts';
import type { NotificationService } from '../core/notifications/service.js';
import type { StripeProvider } from '../core/providers/stripe-provider.js';
import type { createRefundsJournal } from './journal.js';
import type { RefundId } from './primitives.js';
/** The Stripe calls the workflow makes. A `StripeProvider` fits. */
export type RefundStripe = Pick<StripeProvider, 'refundPayment' | 'findRefund'>;
/** The workflow's type. `RefundWorkflow['signal']` is what a webhook calls. */
export type RefundWorkflow = ReturnType<typeof createRefundWorkflow>;
/** Where a Stripe refund ends. `pending` and `requires_action` are still on their way. */
export declare const REFUND_SETTLED_STATUSES: readonly ['succeeded', 'failed', 'canceled'];
/** The id of a refund's run: the approval starts it, the webhook signals it. */
export declare const refundRunId: (refundId: RefundId) => string;
export declare function createRefundWorkflow<Meta extends StandardSchemaV1<unknown, Record<string, unknown>>, Tx extends TransactionSource<Tx>, AppDb extends RootDb>(j: JournalDefinitions<Meta, Tx, AppDb>, refundsJournal: ReturnType<typeof createRefundsJournal<Meta, Tx, AppDb>>): import("@arki/journal").WorkflowDef<z.ZodObject<{
    refundId: z.ZodTemplateLiteral<`rfnd${string}`>;
}, z.core.$strip>, {
    providerRefundId: string;
    outcome: "completed" | "failed";
    lateFailure?: string | undefined;
}, {
    readonly "stripe.refund.settled": z.ZodObject<{
        providerRefundId: z.ZodString;
        status: z.ZodEnum<{
            canceled: "canceled";
            failed: "failed";
            succeeded: "succeeded";
        }>;
    }, z.core.$strip>;
}, {
    /** The provider is built on the database the step runs on. */
    stripe: import("@arki/journal").Need<(db: AppDb) => RefundStripe>;
    /** Every method is optional: `{}` sends nothing. */
    notifications: import("@arki/journal").Need<NotificationService>;
}, {
    providerRefundId: string;
    outcome: "completed" | "failed";
    lateFailure?: string | undefined;
}, {
    readonly begin?: {
        paymentId: `pay${string}`;
        amountMinor: number;
        currency: string;
        reason: "billing_error" | "chargeback_prevention" | "customer_request" | "duplicate_charge" | "fraudulent_transaction" | "goodwill_gesture" | "other" | "service_not_delivered" | "technical_issue";
    } | undefined;
    readonly notify?: unknown;
    readonly payBack?: {
        providerRefundId: string;
        status: string | null;
    } | undefined;
    readonly record?: unknown;
    readonly settled?: {
        providerRefundId: string;
        status: "canceled" | "failed" | "succeeded";
    } | null | undefined;
}> & import("@arki/journal").WorkflowStarter<Meta, Tx, z.ZodObject<{
    refundId: z.ZodTemplateLiteral<`rfnd${string}`>;
}, z.core.$strip>, {
    readonly "stripe.refund.settled": z.ZodObject<{
        providerRefundId: z.ZodString;
        status: z.ZodEnum<{
            canceled: "canceled";
            failed: "failed";
            succeeded: "succeeded";
        }>;
    }, z.core.$strip>;
}, {
    providerRefundId: string;
    outcome: "completed" | "failed";
    lateFailure?: string | undefined;
}, {
    readonly begin?: {
        paymentId: `pay${string}`;
        amountMinor: number;
        currency: string;
        reason: "billing_error" | "chargeback_prevention" | "customer_request" | "duplicate_charge" | "fraudulent_transaction" | "goodwill_gesture" | "other" | "service_not_delivered" | "technical_issue";
    } | undefined;
    readonly notify?: unknown;
    readonly payBack?: {
        providerRefundId: string;
        status: string | null;
    } | undefined;
    readonly record?: unknown;
    readonly settled?: {
        providerRefundId: string;
        status: "canceled" | "failed" | "succeeded";
    } | null | undefined;
}>;
//# sourceMappingURL=workflow.d.ts.map