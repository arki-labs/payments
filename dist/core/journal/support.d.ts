/**
 * Shared pieces of the payments journal
 *
 * Used by the payment, subscription and refund entities and their commands.
 * Plain TypeScript only: this file runs on Node, Bun, Deno, browsers and Hermes.
 */
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { Instant } from '@arki/date';
import type { IdGenerationFailure } from '@arki/contracts';
import type { Failure, SchemaFailure } from '@arki/failure';
import type { CommandFailure, DbHandle } from '@arki/journal';
import { z } from '@arki/contracts';
/**
 * Text a journal event carries. Event data is stored in a jsonb column, which refuses U+0000
 * (SQLSTATE 22P05) and a lone surrogate such as `'\ud800'` (22P02); a `text` column refuses only
 * U+0000. A command input schema builds its text fields and stream ids from this, so such a value is
 * `schema.invalid_input` before any write.
 */
export declare const eventTextSchema: z.ZodString;
/** Event text with at most `max` characters, for a value that also fills a `varchar(max)` column. */
export declare function eventVarcharSchema(max: number): z.ZodString;
/** Event data is stored as JSON, so a time travels as an ISO string. */
export declare function toIso(value: Instant): string;
/**
 * The `Instant` an `instant` column stores, from a time in event data. Reducers call it on fields the
 * event schema already checked (`z.iso.datetime()`), so the precondition is: `iso` is an ISO 8601
 * timestamp with `Z` or an offset. Anything else is a caller bug and throws an invariant failure
 * (`ARKI_FAILURE_E008`), never a raw `RangeError`.
 */
export declare function toInstant(iso: string): Instant;
/**
 * `toInstant` for a nullable field: `null` stays `null`. Same precondition: a string is an ISO 8601
 * timestamp with `Z` or an offset, as the subscription event schemas guarantee; anything else throws
 * an invariant failure (`ARKI_FAILURE_E008`).
 */
export declare function toNullableInstant(iso: string | null): Instant | null;
/**
 * The number a `real` column gives back for `value`.
 *
 * A `real` is a 4-byte float. Postgres rounds the value to the nearest 4-byte
 * float and prints the shortest decimal that names that float. A reducer must
 * return this number, not the one it was given, or the journal rejects the
 * write with `VALUE_MISMATCH`. Example: 19.99 stays 19.99, but 1234567.89
 * comes back as 1234567.9, because a 4-byte float keeps about 7 digits.
 */
export declare function storedReal(value: number): number;
/**
 * Deep equality for JSON values. Key order does not matter: a `jsonb` column
 * returns object keys in its own order. A key holding `undefined` equals a
 * missing key, as in JSON.
 */
export declare function sameJson(left: unknown, right: unknown): boolean;
/**
 * What a write function returns besides the row and its command's own refusals: the
 * command runner's failures (`CommandFailure`), a failed id and a schema failure.
 */
export type JournalWriteFailure = CommandFailure | IdGenerationFailure | SchemaFailure;
/**
 * The row a command hands back to a service, or the failure the command
 * returned when a rule said no. `version` is a storage detail of the journal,
 * so it never leaves the package's write functions.
 */
export declare function writtenRow<Row extends {
    version: number;
}>(result: Promise<{
    readonly row: Row | null;
}>, what: string): Promise<Omit<Row, 'version'>>;
export declare function writtenRow<Row extends {
    version: number;
}, Refusal extends Failure>(result: Promise<{
    readonly row: Row | null;
} | Refusal>, what: string): Promise<Omit<Row, 'version'> | Refusal>;
/** One foreign key a write sets: its column, the value written there, and the failure when no row has that value. */
export type RowReference<Missing> = {
    readonly column: PgColumn;
    readonly value: string | null | undefined;
    readonly missing: () => Missing;
};
/**
 * Looks up the row each reference points at, in the table the column's foreign key names, and locks
 * it (`FOR KEY SHARE`) until the transaction ends, so the write that follows cannot meet a missing or
 * just-deleted row (a raw Postgres 23503). Returns the first `missing()` for a value no row holds, or
 * `undefined` when every row is there. A value Postgres cannot store (U+0000) is held by no row, so it
 * returns its `missing()` without a query (the lookup would fail with a raw 22021); so does a value with a
 * lone surrogate, which no row holds as given (the driver writes U+FFFD in its place). A `null` or
 * `undefined` value names nothing to check. Run it in the transaction that writes.
 *
 * Precondition: at most `MAX_BATCH_ITEMS` (1,000) references; more breaks an `invariant`
 * (`ARKI_FAILURE_E008`) before any query. Callers pass a fixed handful (one per foreign key they write).
 */
export declare function lockReferences<Missing>(db: Pick<DbHandle, 'select'>, table: PgTable, references: readonly RowReference<Missing>[]): Promise<Missing | undefined>;
//# sourceMappingURL=support.d.ts.map