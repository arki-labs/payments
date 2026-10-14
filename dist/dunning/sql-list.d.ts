import type { SQL } from 'drizzle-orm';
/**
 * `(a, b, c)` with one bound parameter per value, for `column IN ${valueList(...)}`.
 * An array bound as one parameter does not reach Postgres as an array on every driver.
 * An empty list matches nothing.
 */
export declare function valueList(values: readonly string[]): SQL;
//# sourceMappingURL=sql-list.d.ts.map