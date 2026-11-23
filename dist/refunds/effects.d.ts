import type { JournalDefinitions, RootDb, TransactionSource } from '@arki/journal';
import type { StandardSchemaV1 } from '@arki/schema';
import type { NotificationService } from '../core/notifications/service.js';
import type { createRefundsJournal } from './journal.js';
/**
 * Refund effects: what happens after a refund write commits
 *
 * `createRefundEffects(j, refundsJournal)` returns the refund effects, to list in the app's `compose({ effects })`:
 *
 * - `refund-approval-request` mails the approvers about a refund that waits for a person. It runs on
 *   `RefundRequestedV2`, after the request committed: a request that rolled back sends nothing, and a retried
 *   request sends nothing more, because its receipt replays and records no event. A refund the auto-approval
 *   approved in the same request is no longer `pending` when the job runs, so it gets no mail; neither does one a
 *   person decided before the job ran.
 * - `refund-rejection-notice` tells the customer their refund was rejected (`sendRefundStatusUpdate(row,
 *   'rejected')`). It runs on `RefundRejected`, after the rejection committed.
 *
 * Both need `notifications`, given once in the app's `services`. A worker runs them. A mail that did not go out is
 * returned, never dropped. `payments.notification_failed` (the transport or Slack was down, so nothing was sent) is
 * retried with the journal's default backoff (8 tries, 1 s up to 5 minutes), like a throw; any other returned
 * failure makes the job dead at once. A dead job keeps the failure as its `lastError`, and
 * `journal.jobs(db, { status: 'dead' })` lists it; an operator retries it with `journal.retry`. The mailer takes no
 * key, so a crash between the send and the ack sends the mail a second time.
 */
/**
 * The retry of both mail effects: the journal default (8 tries, 1 s doubling up to 5 minutes), for a throw and for a
 * returned `payments.notification_failed`. Another returned failure is final.
 */
export declare const refundMailRetry: import("@arki/journal").Backoff;
export declare function createRefundEffects<Meta extends StandardSchemaV1<unknown, Record<string, unknown>>, Tx extends TransactionSource<Tx>, AppDb extends RootDb>(j: JournalDefinitions<Meta, Tx, AppDb>, refundsJournal: ReturnType<typeof createRefundsJournal<Meta, Tx, AppDb>>): readonly [import("@arki/journal").Effect<import("@arki/schema").SchemaOutput<Meta>, AppDb, {
    notifications: import("@arki/journal").Need<NotificationService>;
}>, import("@arki/journal").Effect<import("@arki/schema").SchemaOutput<Meta>, AppDb, {
    notifications: import("@arki/journal").Need<NotificationService>;
}>];
//# sourceMappingURL=effects.d.ts.map