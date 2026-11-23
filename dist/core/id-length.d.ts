import { z } from '@arki/contracts';
/**
 * The most characters an id column holds. It is read from the column `idColumns` builds, so the
 * limit has one source: every payments id column (`id`, references, foreign keys) comes from it.
 */
export declare const ID_COLUMN_LENGTH: number;
/**
 * Whether an id fits an id column. Postgres counts characters (code points) in a `varchar(n)`, so
 * 200 emoji fit a 256 column although they take 400 UTF-16 units.
 */
export declare function fitsIdColumn(id: string): boolean;
/** An id schema that also refuses an id its column cannot hold, as `schema.invalid_input` (else the write fails with SQLSTATE 22001). */
export declare function boundedIdSchema<S extends z.ZodType<string>>(schema: S): S;
//# sourceMappingURL=id-length.d.ts.map