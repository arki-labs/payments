/**
 * Shared pieces of the payments journal
 *
 * Used by the payment, subscription and refund entities and their commands.
 * Plain TypeScript only: this file runs on Node, Bun, Deno, browsers and Hermes.
 */
import { instant } from '@arki/date';
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
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
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
    if (isPlainObject(left) && isPlainObject(right)) {
        const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
        return [...keys].every(key => sameJson(left[key], right[key]));
    }
    return false;
}
/**
 * The row a command hands back to a service. `version` is a storage detail of
 * the journal, so it never leaves the package's write functions.
 */
export async function writtenRow(result, what) {
    const { row } = await result;
    if (!row) {
        throw new Error(`[@arki/payments] ${what}: the journal returned no row`);
    }
    const { version, ...rest } = row;
    void version;
    return rest;
}
//# sourceMappingURL=support.js.map