import { createIdFactory } from '@arki/db/id-factory';
export { userIdSchema } from '@arki/contracts';
/**
 * Builds the user columns of this package's tables. Its foreign-key columns carry the column
 * schema tag that makes `createInsertSchema(table)` validate `userId` as a `usr_*` value.
 */
export const userIdFactory = createIdFactory('usr_');
//# sourceMappingURL=user-id.js.map