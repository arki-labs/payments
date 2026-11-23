import type { Instant } from '@arki/date';
import { z } from '@arki/contracts';
/**
 * Schemas for values Postgres can store. A contract builds its fields from these so that it refuses,
 * as `schema.invalid_input`, every value a column would refuse with a raw SQLSTATE error.
 */
/**
 * The deepest nesting a JSON value may have: a scalar is depth 0, and each object or array around
 * it adds 1. A deeper value is refused as `schema.invalid_input`. Without a cap, the checks below
 * (and `JSON.stringify` in the driver) recurse once per level and overflow the stack on a hostile body.
 */
export declare const MAX_JSON_DEPTH = 100;
/**
 * Whether the JSON `JSON.stringify` writes for this value nests objects or arrays deeper than
 * `MAX_JSON_DEPTH`. Like `JSON.stringify`, it measures what a value's `toJSON(key)` returns in place of
 * the value (a `Date`, a class with its own `toJSON`), so a shallow value whose `toJSON` returns a deep
 * tree is too deep. It walks with its own stack, not by recursion, and stops at the first value that is
 * too deep, so a 100,000-level body costs about 100 steps. A `toJSON` that throws throws here.
 */
export declare function exceedsJsonDepth(value: unknown): boolean;
/** Whether a key or a string anywhere in this JSON value holds U+0000. */
export declare function holdsNul(value: unknown): boolean;
/**
 * Whether a key or a string anywhere in this JSON value holds a lone surrogate (such as `'\ud800'`).
 * `JSON.stringify` writes it as a `\ud800` escape, and a jsonb column refuses that escape with SQLSTATE
 * 22P02. A `text` column takes it (the driver writes the UTF-8 replacement character), so only JSON checks it.
 */
export declare function holdsLoneSurrogate(value: unknown): boolean;
/**
 * Text Postgres can store. A `text`, `varchar` or `jsonb` value cannot hold U+0000: Postgres refuses
 * it (SQLSTATE 22021, or 22P05 in jsonb).
 */
export declare const pgTextSchema: z.ZodString;
/** Text for a `varchar(max)` column: no U+0000, and at most `max` characters (more is SQLSTATE 22001). */
export declare function pgVarcharSchema(max: number): z.ZodString;
/**
 * A JSON object stored in a jsonb column: no key or string anywhere in it may hold U+0000 (SQLSTATE
 * 22P05) or a lone surrogate (22P02), no value may be a `bigint` (the driver throws on one), and it
 * nests at most `MAX_JSON_DEPTH` (100) levels.
 * `holdsBigInt` is declared below; the refine runs at parse time.
 */
export declare const pgJsonRecordSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
/** Whether a `bigint` sits anywhere in this value: `JSON.stringify` throws on one, so no jsonb column can take it. */
export declare function holdsBigInt(value: unknown): boolean;
/**
 * Any value stored in a jsonb column (an object, an array, a string, a number, a boolean, null). No
 * `bigint` anywhere in it (the driver throws on one), at most `MAX_JSON_DEPTH` (100) levels of nesting, no U+0000 in any key or string (SQLSTATE 22P05),
 * and no lone surrogate in any key or string (22P02).
 */
export declare const pgJsonSchema: z.ZodUnknown;
/**
 * The most items one call takes in a batch argument (a list of records, ids or references). A bigger
 * batch is refused as `schema.invalid_input`; split it into calls of at most this many. Founder
 * decision 2026-11-09: a documented cap, not unbounded batches (one SQL statement holds at most
 * 65,535 parameters, and a long loop holds the event loop).
 */
export declare const MAX_BATCH_ITEMS = 1000;
/** The largest value of a Postgres `integer` (int4) column, 2^31 - 1. A larger one is refused with SQLSTATE 22003. */
export declare const INT4_MAX = 2147483647;
/**
 * Whether an `instant` column (`@arki/db/temporal`) can store this moment. The column sends the ISO
 * text of the `Instant`, and Postgres reads only the years 1 to 9999 there: an earlier year is
 * refused with SQLSTATE 22008, and a signed year (`-000001-…`, `+010000-…`) with 22009. `Instant`
 * itself reaches from year -271821 to 275760.
 */
export declare function isPgInstant(value: Instant): boolean;
/** An `Instant` an `instant` column can store or be compared with: years 1 to 9999 UTC (see `isPgInstant`). */
export declare function pgInstantSchema(): z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
//# sourceMappingURL=pg-values.d.ts.map