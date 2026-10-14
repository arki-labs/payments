/**
 * Webhook event claims
 *
 * The two queries that decide which delivery of a webhook event may process
 * it. They take any Drizzle Postgres database, so the package tests run the
 * same SQL on PGlite that `PaymentRepository` runs on node-postgres.
 */
import type { AnyRelations } from 'drizzle-orm';
import type { PgAsyncDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import type { Instant } from '@arki/date';
import type { CoreTables } from './tables.js';
import type { NewWebhookEvent, WebhookEvent, WebhookId } from './types.js';
/** The parts of a Drizzle Postgres database (or transaction) the claims use. */
export type WebhookClaimDb = Pick<PgAsyncDatabase<PgQueryResultHKT, AnyRelations>, 'insert' | 'select' | 'update'>;
/**
 * Insert the event, or return the row that already holds its `providerEventId`.
 * `created` is true only for the caller whose insert won, so exactly one
 * delivery processes a new event, even when copies arrive at the same time.
 *
 * `onConflictDoNothing()` takes no target on purpose: it covers the unique
 * index on `provider_event_id` and the primary key alike.
 */
export declare function claimWebhookEvent(db: WebhookClaimDb, table: CoreTables['webhookEvents'], data: NewWebhookEvent): Promise<{
    event: WebhookEvent;
    created: boolean;
}>;
/**
 * Take over an unprocessed event for one more attempt. True only for the one
 * caller whose update matched.
 *
 * An event can be taken over when its last attempt failed (`error_message` is
 * set) or when that attempt started before `leaseCutoff` and never finished (a
 * crashed process). An attempt still inside its lease is left alone.
 *
 * `seenAttempts` is the `attempts` value the caller read. It makes two callers
 * that read the same row race on one update: the first raises `attempts`, so
 * the second matches nothing. `attempts` is the token rather than
 * `last_attempt_at` because two attempts can start within one clock tick (or
 * on servers whose clocks disagree), and a counter cannot repeat.
 */
export declare function reclaimWebhookEvent(db: WebhookClaimDb, table: CoreTables['webhookEvents'], id: WebhookId, seenAttempts: number, leaseCutoff: Instant): Promise<boolean>;
//# sourceMappingURL=webhook-claims.d.ts.map