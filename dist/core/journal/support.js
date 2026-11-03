/**
 * Shared pieces of the payments journal
 *
 * Used by the payment, subscription and refund entities and their commands.
 * Plain TypeScript only: this file runs on Node, Bun, Deno, browsers and Hermes.
 */
import { instant } from '@arki/date';
import { invariant, isFailure } from '@arki/failure';
import { is, recordSchema } from '@arki/schema';
/** Event data is stored as JSON, so a time travels as an ISO string. */
export function toIso(value) {
    return value.toString();
}
/** Reducers build the `Instant` an `instant` column stores. */
export function toInstant(iso) {
    return instant(iso);
}
export function toNullableInstant(iso) {
    return iso === null ? null : instant(iso);
}
/**
 * The number a `real` column gives back for `value`.
 *
 * A `real` is a 4-byte float. Postgres rounds the value to the nearest 4-byte
 * float and prints the shortest decimal that names that float. A reducer must
 * return this number, not the one it was given, or the journal rejects the
 * write with `VALUE_MISMATCH`. Example: 19.99 stays 19.99, but 1234567.89
 * comes back as 1234567.9, because a 4-byte float keeps about 7 digits.
 */
export function storedReal(value) {
    const stored = Math.fround(value);
    for (let digits = 1; digits <= 9; digits += 1) {
        const candidate = Number(stored.toPrecision(digits));
        if (Math.fround(candidate) === stored) {
            return candidate;
        }
    }
    return stored;
}
/**
 * Deep equality for JSON values. Key order does not matter: a `jsonb` column
 * returns object keys in its own order. A key holding `undefined` equals a
 * missing key, as in JSON.
 */
export function sameJson(left, right) {
    if (Object.is(left, right)) {
        return true;
    }
    if (Array.isArray(left) && Array.isArray(right)) {
        return left.length === right.length && left.every((item, index) => sameJson(item, right[index]));
    }
    if (is(left, recordSchema) && is(right, recordSchema)) {
        const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
        return [...keys].every(key => sameJson(left[key], right[key]));
    }
    return false;
}
export async function writtenRow(result, what) {
    const written = await result;
    if (isFailure(written))
        return written;
    const { row } = written;
    invariant(row, () => `[@arki/payments] ${what}: the journal returned no row`);
    const { version, ...rest } = row;
    void version;
    return rest;
}
//# sourceMappingURL=support.js.map