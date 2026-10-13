export type RefundId = `rfnd_${string}`;
export declare const createRefundId: () => `rfnd_${string}`;
export declare const refundIdSchema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`rfnd_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `rfnd_${string}`, "out">, import("zod").ZodTransform<`rfnd_${string}`, string & import("zod").$brand<`rfnd_${string}`>>>;
export declare const refundIdFactory: {
    create: () => `rfnd_${string}`;
    make: () => `rfnd_${string}`;
    new: () => `rfnd_${string}`;
    schema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`rfnd_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `rfnd_${string}`, "out">, import("zod").ZodTransform<`rfnd_${string}`, string & import("zod").$brand<`rfnd_${string}`>>>;
    primaryColumn: (name?: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `rfnd_${string}`>>;
    optionalColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `rfnd_${string}` | null>>;
    requiredColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `rfnd_${string}`>>;
    reference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `rfnd_${string}`>;
    optionalReference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `rfnd_${string}`>;
    foreignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `rfnd_${string}`>;
    optionalForeignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `rfnd_${string}`>;
    createForeignKeyFactory: (referenceFn: () => import("drizzle-orm/pg-core").PgColumn) => {
        required: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `rfnd_${string}`>;
        optional: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `rfnd_${string}`>;
    };
};
export declare const refundReasonValues: readonly ['customer_request', 'duplicate_charge', 'fraudulent_transaction', 'service_not_delivered', 'billing_error', 'technical_issue', 'goodwill_gesture', 'chargeback_prevention', 'other'];
export declare const refundStatusValues: readonly ['pending', 'approved', 'processing', 'completed', 'failed', 'rejected', 'canceled'];
export type RefundReason = (typeof refundReasonValues)[number];
export type RefundStatus = (typeof refundStatusValues)[number];
//# sourceMappingURL=primitives.d.ts.map