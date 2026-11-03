export type { UserId } from '@arki/contracts';
export { userIdSchema } from '@arki/contracts';
/**
 * Builds the user columns of this package's tables. Its foreign-key columns carry the column
 * schema tag that makes `createInsertSchema(table)` validate `userId` as a `usr_*` value.
 */
export declare const userIdFactory: import("@arki/contracts").IdDeclaration<"usr_">;
//# sourceMappingURL=user-id.d.ts.map