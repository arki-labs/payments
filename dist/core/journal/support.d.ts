/**
 * Shared pieces of the payments journal
 *
 * Used by the payment, subscription and refund entities and their commands.
 * Plain TypeScript only: this file runs on Node, Bun, Deno, browsers and Hermes.
 */
import type { Instant } from '@arki/date';
/** Event data is stored as JSON, so a time travels as an ISO string. */
export declare function toIso(value: Instant): string;
/** Reducers build the `Instant` an `instant` column stores. */
export declare function toInstant(iso: string): Instant;
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
 * The row a command hands back to a service. `version` is a storage detail of
 * the journal, so it never leaves the package's write functions.
 */
export declare function writtenRow<Row extends {
    version: number;
}>(result: Promise<{
    readonly row: Row | null;
}>, what: string): Promise<Omit<Row, 'version'>>;
//# sourceMappingURL=support.d.ts.map