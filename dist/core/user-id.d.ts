export type { UserId } from '@arki/contracts';
export { userIdSchema } from '@arki/contracts';
/**
 * Builds the user columns of this package's tables. Its foreign-key columns carry the column
 * schema tag that makes `createInsertSchema(table)` validate `userId` as a `usr_*` value.
 */
export declare const userIdFactory: {
    create: () => `usr_${string}`;
    make: () => `usr_${string}`;
    new: () => `usr_${string}`;
    schema: import("@arki/contracts").ZodPipe<import("@arki/contracts").ZodString, import("@arki/contracts").ZodTransform<`usr_${string}`, string>> | import("@arki/contracts").ZodPipe<import("zod/v4/core").$ZodBranded<import("@arki/contracts").ZodString, `usr_${string}`, "out">, import("@arki/contracts").ZodTransform<`usr_${string}`, string & import("@arki/contracts").$brand<`usr_${string}`>>>;
    primaryColumn: (name?: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `usr_${string}`>>;
    optionalColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `usr_${string}` | null>>;
    requiredColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>>;
    reference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>;
    optionalReference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `usr_${string}`>;
    foreignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>;
    optionalForeignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `usr_${string}`>;
    createForeignKeyFactory: (referenceFn: () => import("drizzle-orm/pg-core").PgColumn) => {
        required: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>;
        optional: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `usr_${string}`>;
    };
};
//# sourceMappingURL=user-id.d.ts.map