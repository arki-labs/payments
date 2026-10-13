export type TaxConfigId = `txc_${string}`;
export type TaxJurisdictionId = `txj_${string}`;
export type TaxExemptionId = `txe_${string}`;
export declare const createTaxConfigId: () => `txc_${string}`;
export declare const createTaxJurisdictionId: () => `txj_${string}`;
export declare const createTaxExemptionId: () => `txe_${string}`;
export declare const taxConfigIdSchema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`txc_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `txc_${string}`, "out">, import("zod").ZodTransform<`txc_${string}`, string & import("zod").$brand<`txc_${string}`>>>;
export declare const taxJurisdictionIdSchema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`txj_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `txj_${string}`, "out">, import("zod").ZodTransform<`txj_${string}`, string & import("zod").$brand<`txj_${string}`>>>;
export declare const taxExemptionIdSchema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`txe_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `txe_${string}`, "out">, import("zod").ZodTransform<`txe_${string}`, string & import("zod").$brand<`txe_${string}`>>>;
export declare const taxConfigIdFactory: {
    create: () => `txc_${string}`;
    make: () => `txc_${string}`;
    new: () => `txc_${string}`;
    schema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`txc_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `txc_${string}`, "out">, import("zod").ZodTransform<`txc_${string}`, string & import("zod").$brand<`txc_${string}`>>>;
    primaryColumn: (name?: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `txc_${string}`>>;
    optionalColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txc_${string}` | null>>;
    requiredColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `txc_${string}`>>;
    reference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `txc_${string}`>;
    optionalReference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txc_${string}`>;
    foreignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `txc_${string}`>;
    optionalForeignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txc_${string}`>;
    createForeignKeyFactory: (referenceFn: () => import("drizzle-orm/pg-core").PgColumn) => {
        required: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `txc_${string}`>;
        optional: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txc_${string}`>;
    };
};
export declare const taxJurisdictionIdFactory: {
    create: () => `txj_${string}`;
    make: () => `txj_${string}`;
    new: () => `txj_${string}`;
    schema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`txj_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `txj_${string}`, "out">, import("zod").ZodTransform<`txj_${string}`, string & import("zod").$brand<`txj_${string}`>>>;
    primaryColumn: (name?: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `txj_${string}`>>;
    optionalColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txj_${string}` | null>>;
    requiredColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `txj_${string}`>>;
    reference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `txj_${string}`>;
    optionalReference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txj_${string}`>;
    foreignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `txj_${string}`>;
    optionalForeignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txj_${string}`>;
    createForeignKeyFactory: (referenceFn: () => import("drizzle-orm/pg-core").PgColumn) => {
        required: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `txj_${string}`>;
        optional: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txj_${string}`>;
    };
};
export declare const taxExemptionIdFactory: {
    create: () => `txe_${string}`;
    make: () => `txe_${string}`;
    new: () => `txe_${string}`;
    schema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`txe_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `txe_${string}`, "out">, import("zod").ZodTransform<`txe_${string}`, string & import("zod").$brand<`txe_${string}`>>>;
    primaryColumn: (name?: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `txe_${string}`>>;
    optionalColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txe_${string}` | null>>;
    requiredColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `txe_${string}`>>;
    reference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `txe_${string}`>;
    optionalReference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txe_${string}`>;
    foreignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `txe_${string}`>;
    optionalForeignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txe_${string}`>;
    createForeignKeyFactory: (referenceFn: () => import("drizzle-orm/pg-core").PgColumn) => {
        required: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `txe_${string}`>;
        optional: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txe_${string}`>;
    };
};
export declare const taxConfigStatusValues: readonly ['active', 'inactive', 'pending'];
export declare const taxCalculationModeValues: readonly ['automatic', 'manual', 'disabled'];
export declare const taxBusinessTypeValues: readonly ['saas', 'digital_goods', 'physical_goods', 'services', 'mixed'];
export declare const jurisdictionTypeValues: readonly ['country', 'state', 'province', 'city', 'county', 'district'];
export declare const exemptionTypeValues: readonly ['customer', 'product', 'jurisdiction', 'threshold'];
export declare const exemptionStatusValues: readonly ['active', 'expired', 'revoked', 'pending_review'];
export type TaxConfigStatus = (typeof taxConfigStatusValues)[number];
export type TaxCalculationMode = (typeof taxCalculationModeValues)[number];
export type TaxBusinessType = (typeof taxBusinessTypeValues)[number];
export type JurisdictionType = (typeof jurisdictionTypeValues)[number];
export type ExemptionType = (typeof exemptionTypeValues)[number];
export type ExemptionStatus = (typeof exemptionStatusValues)[number];
//# sourceMappingURL=primitives.d.ts.map