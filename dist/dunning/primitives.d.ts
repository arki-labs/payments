export type DunningCampaignId = `dc_${string}`;
export type DunningTemplateId = `dt_${string}`;
export type DunningExecutionId = `de_${string}`;
export type DunningCommunicationId = `dcm_${string}`;
export type CustomerSegmentId = `cs_${string}`;
export type CustomerRiskProfileId = `crp_${string}`;
export declare const createDunningCampaignId: () => `dc_${string}`;
export declare const createDunningTemplateId: () => `dt_${string}`;
export declare const createDunningExecutionId: () => `de_${string}`;
export declare const createDunningCommunicationId: () => `dcm_${string}`;
export declare const createCustomerSegmentId: () => `cs_${string}`;
export declare const createCustomerRiskProfileId: () => `crp_${string}`;
export declare const dunningCampaignIdSchema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`dc_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `dc_${string}`, "out">, import("zod").ZodTransform<`dc_${string}`, string & import("zod").$brand<`dc_${string}`>>>;
export declare const dunningTemplateIdSchema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`dt_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `dt_${string}`, "out">, import("zod").ZodTransform<`dt_${string}`, string & import("zod").$brand<`dt_${string}`>>>;
export declare const dunningExecutionIdSchema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`de_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `de_${string}`, "out">, import("zod").ZodTransform<`de_${string}`, string & import("zod").$brand<`de_${string}`>>>;
export declare const dunningCommunicationIdSchema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`dcm_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `dcm_${string}`, "out">, import("zod").ZodTransform<`dcm_${string}`, string & import("zod").$brand<`dcm_${string}`>>>;
export declare const customerSegmentIdSchema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`cs_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `cs_${string}`, "out">, import("zod").ZodTransform<`cs_${string}`, string & import("zod").$brand<`cs_${string}`>>>;
export declare const customerRiskProfileIdSchema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`crp_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `crp_${string}`, "out">, import("zod").ZodTransform<`crp_${string}`, string & import("zod").$brand<`crp_${string}`>>>;
export declare const dunningCampaignIdFactory: {
    create: () => `dc_${string}`;
    make: () => `dc_${string}`;
    new: () => `dc_${string}`;
    schema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`dc_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `dc_${string}`, "out">, import("zod").ZodTransform<`dc_${string}`, string & import("zod").$brand<`dc_${string}`>>>;
    primaryColumn: (name?: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `dc_${string}`>>;
    optionalColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `dc_${string}` | null>>;
    requiredColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dc_${string}`>>;
    reference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dc_${string}`>;
    optionalReference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `dc_${string}`>;
    foreignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dc_${string}`>;
    optionalForeignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `dc_${string}`>;
    createForeignKeyFactory: (referenceFn: () => import("drizzle-orm/pg-core").PgColumn) => {
        required: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dc_${string}`>;
        optional: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `dc_${string}`>;
    };
};
export declare const dunningTemplateIdFactory: {
    create: () => `dt_${string}`;
    make: () => `dt_${string}`;
    new: () => `dt_${string}`;
    schema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`dt_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `dt_${string}`, "out">, import("zod").ZodTransform<`dt_${string}`, string & import("zod").$brand<`dt_${string}`>>>;
    primaryColumn: (name?: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `dt_${string}`>>;
    optionalColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `dt_${string}` | null>>;
    requiredColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dt_${string}`>>;
    reference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dt_${string}`>;
    optionalReference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `dt_${string}`>;
    foreignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dt_${string}`>;
    optionalForeignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `dt_${string}`>;
    createForeignKeyFactory: (referenceFn: () => import("drizzle-orm/pg-core").PgColumn) => {
        required: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dt_${string}`>;
        optional: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `dt_${string}`>;
    };
};
export declare const dunningExecutionIdFactory: {
    create: () => `de_${string}`;
    make: () => `de_${string}`;
    new: () => `de_${string}`;
    schema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`de_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `de_${string}`, "out">, import("zod").ZodTransform<`de_${string}`, string & import("zod").$brand<`de_${string}`>>>;
    primaryColumn: (name?: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `de_${string}`>>;
    optionalColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `de_${string}` | null>>;
    requiredColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `de_${string}`>>;
    reference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `de_${string}`>;
    optionalReference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `de_${string}`>;
    foreignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `de_${string}`>;
    optionalForeignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `de_${string}`>;
    createForeignKeyFactory: (referenceFn: () => import("drizzle-orm/pg-core").PgColumn) => {
        required: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `de_${string}`>;
        optional: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `de_${string}`>;
    };
};
export declare const dunningCommunicationIdFactory: {
    create: () => `dcm_${string}`;
    make: () => `dcm_${string}`;
    new: () => `dcm_${string}`;
    schema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`dcm_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `dcm_${string}`, "out">, import("zod").ZodTransform<`dcm_${string}`, string & import("zod").$brand<`dcm_${string}`>>>;
    primaryColumn: (name?: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `dcm_${string}`>>;
    optionalColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `dcm_${string}` | null>>;
    requiredColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dcm_${string}`>>;
    reference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dcm_${string}`>;
    optionalReference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `dcm_${string}`>;
    foreignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dcm_${string}`>;
    optionalForeignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `dcm_${string}`>;
    createForeignKeyFactory: (referenceFn: () => import("drizzle-orm/pg-core").PgColumn) => {
        required: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dcm_${string}`>;
        optional: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `dcm_${string}`>;
    };
};
export declare const customerSegmentIdFactory: {
    create: () => `cs_${string}`;
    make: () => `cs_${string}`;
    new: () => `cs_${string}`;
    schema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`cs_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `cs_${string}`, "out">, import("zod").ZodTransform<`cs_${string}`, string & import("zod").$brand<`cs_${string}`>>>;
    primaryColumn: (name?: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `cs_${string}`>>;
    optionalColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `cs_${string}` | null>>;
    requiredColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cs_${string}`>>;
    reference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cs_${string}`>;
    optionalReference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `cs_${string}`>;
    foreignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cs_${string}`>;
    optionalForeignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `cs_${string}`>;
    createForeignKeyFactory: (referenceFn: () => import("drizzle-orm/pg-core").PgColumn) => {
        required: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cs_${string}`>;
        optional: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `cs_${string}`>;
    };
};
export declare const customerRiskProfileIdFactory: {
    create: () => `crp_${string}`;
    make: () => `crp_${string}`;
    new: () => `crp_${string}`;
    schema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`crp_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `crp_${string}`, "out">, import("zod").ZodTransform<`crp_${string}`, string & import("zod").$brand<`crp_${string}`>>>;
    primaryColumn: (name?: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `crp_${string}`>>;
    optionalColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `crp_${string}` | null>>;
    requiredColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `crp_${string}`>>;
    reference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `crp_${string}`>;
    optionalReference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `crp_${string}`>;
    foreignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `crp_${string}`>;
    optionalForeignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `crp_${string}`>;
    createForeignKeyFactory: (referenceFn: () => import("drizzle-orm/pg-core").PgColumn) => {
        required: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `crp_${string}`>;
        optional: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `crp_${string}`>;
    };
};
export declare const dunningCampaignTypeValues: readonly ['payment_failed', 'subscription_past_due', 'trial_ending', 'renewal_reminder'];
export declare const dunningCampaignStatusValues: readonly ['active', 'paused', 'archived', 'draft'];
export declare const communicationChannelValues: readonly ['email', 'sms', 'in_app', 'webhook'];
export declare const communicationStatusValues: readonly ['pending', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced'];
export declare const executionStatusValues: readonly ['scheduled', 'running', 'completed', 'failed', 'cancelled'];
export declare const customerSegmentTypeValues: readonly ['value_based', 'behavior_based', 'demographic', 'risk_based', 'custom'];
export declare const riskCategoryValues: readonly ['low', 'medium', 'high', 'critical'];
export type DunningCampaignType = (typeof dunningCampaignTypeValues)[number];
export type DunningCampaignStatus = (typeof dunningCampaignStatusValues)[number];
export type CommunicationChannel = (typeof communicationChannelValues)[number];
export type CommunicationStatus = (typeof communicationStatusValues)[number];
export type ExecutionStatus = (typeof executionStatusValues)[number];
export type CustomerSegmentType = (typeof customerSegmentTypeValues)[number];
export type RiskCategory = (typeof riskCategoryValues)[number];
//# sourceMappingURL=primitives.d.ts.map