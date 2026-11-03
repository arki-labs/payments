/**
 * Refund effects: what happens after a refund write commits
 *
 * `createRefundEffects(j, refundsJournal)` returns the refund effects, to list in the app's `compose({ effects })`.
 * There is one today:
 *
 * - `refund-approval-request` mails the approvers about a refund that waits for a person. It runs on
 *   `RefundRequestedV2`, after the request committed: a request that rolled back sends nothing, and a retried
 *   request sends nothing more, because its receipt replays and records no event. A refund the auto-approval
 *   approved in the same request is no longer `pending` when the job runs, so it gets no mail; neither does one a
 *   person decided before the job ran.
 *
 * It needs `notifications`, given once in the app's `services`. A worker runs it. The mailer takes no key, so a
 * crash between the send and the ack sends the mail a second time.
 */
import type { JournalDefinitions, RootDb, TransactionSource } from '@arki/journal';
import type { StandardSchemaV1 } from '@arki/schema';
import type { NotificationService } from '../core/notifications/service.js';
import type { createRefundsJournal } from './journal.js';
export declare function createRefundEffects<Meta extends StandardSchemaV1<unknown, Record<string, unknown>>, Tx extends TransactionSource<Tx>, AppDb extends RootDb>(j: JournalDefinitions<Meta, Tx, AppDb>, refundsJournal: ReturnType<typeof createRefundsJournal<Meta, Tx, AppDb>>): readonly [import("@arki/journal").Effect<import("@arki/schema").SchemaOutput<Meta>, AppDb, {
    notifications: import("@arki/journal").Need<NotificationService>;
}>];
//# sourceMappingURL=effects.d.ts.map