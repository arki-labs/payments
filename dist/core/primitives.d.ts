export type PaymentProviderId = `pprov_${string}`;
export type SubscriptionId = `sub_${string}`;
export type PaymentId = `pay_${string}`;
export type PlanId = `plan_${string}`;
export type CustomerId = `cust_${string}`;
export type WebhookId = `wh_${string}`;
export declare const createPlanId: () => `plan_${string}`;
export declare const createSubscriptionId: () => `sub_${string}`;
export declare const createPaymentId: () => `pay_${string}`;
export declare const createCustomerId: () => `cust_${string}`;
export declare const createWebhookId: () => `wh_${string}`;
export declare const planIdSchema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`plan_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `plan_${string}`, "out">, import("zod").ZodTransform<`plan_${string}`, string & import("zod").$brand<`plan_${string}`>>>;
export declare const subscriptionIdSchema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`sub_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `sub_${string}`, "out">, import("zod").ZodTransform<`sub_${string}`, string & import("zod").$brand<`sub_${string}`>>>;
export declare const paymentIdSchema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`pay_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `pay_${string}`, "out">, import("zod").ZodTransform<`pay_${string}`, string & import("zod").$brand<`pay_${string}`>>>;
export declare const customerIdSchema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`cust_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `cust_${string}`, "out">, import("zod").ZodTransform<`cust_${string}`, string & import("zod").$brand<`cust_${string}`>>>;
export declare const webhookIdSchema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`wh_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `wh_${string}`, "out">, import("zod").ZodTransform<`wh_${string}`, string & import("zod").$brand<`wh_${string}`>>>;
export declare const planIdFactory: {
    create: () => `plan_${string}`;
    make: () => `plan_${string}`;
    new: () => `plan_${string}`;
    schema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`plan_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `plan_${string}`, "out">, import("zod").ZodTransform<`plan_${string}`, string & import("zod").$brand<`plan_${string}`>>>;
    primaryColumn: (name?: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `plan_${string}`>>;
    optionalColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `plan_${string}` | null>>;
    requiredColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `plan_${string}`>>;
    reference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `plan_${string}`>;
    optionalReference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `plan_${string}`>;
    foreignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `plan_${string}`>;
    optionalForeignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `plan_${string}`>;
    createForeignKeyFactory: (referenceFn: () => import("drizzle-orm/pg-core").PgColumn) => {
        required: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `plan_${string}`>;
        optional: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `plan_${string}`>;
    };
};
export declare const subscriptionIdFactory: {
    create: () => `sub_${string}`;
    make: () => `sub_${string}`;
    new: () => `sub_${string}`;
    schema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`sub_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `sub_${string}`, "out">, import("zod").ZodTransform<`sub_${string}`, string & import("zod").$brand<`sub_${string}`>>>;
    primaryColumn: (name?: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `sub_${string}`>>;
    optionalColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `sub_${string}` | null>>;
    requiredColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `sub_${string}`>>;
    reference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `sub_${string}`>;
    optionalReference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `sub_${string}`>;
    foreignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `sub_${string}`>;
    optionalForeignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `sub_${string}`>;
    createForeignKeyFactory: (referenceFn: () => import("drizzle-orm/pg-core").PgColumn) => {
        required: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `sub_${string}`>;
        optional: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `sub_${string}`>;
    };
};
export declare const paymentIdFactory: {
    create: () => `pay_${string}`;
    make: () => `pay_${string}`;
    new: () => `pay_${string}`;
    schema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`pay_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `pay_${string}`, "out">, import("zod").ZodTransform<`pay_${string}`, string & import("zod").$brand<`pay_${string}`>>>;
    primaryColumn: (name?: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `pay_${string}`>>;
    optionalColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `pay_${string}` | null>>;
    requiredColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `pay_${string}`>>;
    reference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `pay_${string}`>;
    optionalReference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `pay_${string}`>;
    foreignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `pay_${string}`>;
    optionalForeignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `pay_${string}`>;
    createForeignKeyFactory: (referenceFn: () => import("drizzle-orm/pg-core").PgColumn) => {
        required: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `pay_${string}`>;
        optional: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `pay_${string}`>;
    };
};
export declare const customerIdFactory: {
    create: () => `cust_${string}`;
    make: () => `cust_${string}`;
    new: () => `cust_${string}`;
    schema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`cust_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `cust_${string}`, "out">, import("zod").ZodTransform<`cust_${string}`, string & import("zod").$brand<`cust_${string}`>>>;
    primaryColumn: (name?: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `cust_${string}`>>;
    optionalColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `cust_${string}` | null>>;
    requiredColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>>;
    reference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>;
    optionalReference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `cust_${string}`>;
    foreignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>;
    optionalForeignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `cust_${string}`>;
    createForeignKeyFactory: (referenceFn: () => import("drizzle-orm/pg-core").PgColumn) => {
        required: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>;
        optional: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `cust_${string}`>;
    };
};
export declare const webhookIdFactory: {
    create: () => `wh_${string}`;
    make: () => `wh_${string}`;
    new: () => `wh_${string}`;
    schema: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<`wh_${string}`, string>> | import("zod").ZodPipe<import("zod/v4/core").$ZodBranded<import("zod").ZodString, `wh_${string}`, "out">, import("zod").ZodTransform<`wh_${string}`, string & import("zod").$brand<`wh_${string}`>>>;
    primaryColumn: (name?: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `wh_${string}`>>;
    optionalColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `wh_${string}` | null>>;
    requiredColumn: (name: string) => import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `wh_${string}`>>;
    reference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `wh_${string}`>;
    optionalReference: (name: string) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `wh_${string}`>;
    foreignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `wh_${string}`>;
    optionalForeignKey: (name: string, referenceFn: () => import("drizzle-orm/pg-core").PgColumn, options?: {
        onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
    }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `wh_${string}`>;
    createForeignKeyFactory: (referenceFn: () => import("drizzle-orm/pg-core").PgColumn) => {
        required: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `wh_${string}`>;
        optional: (name: string, options?: {
            onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
        }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `wh_${string}`>;
    };
};
export declare const paymentProviderValues: readonly ['stripe', 'paypal', 'square', 'razorpay', 'revenuecat'];
export declare const subscriptionStatusValues: readonly ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid'];
export declare const paymentStatusValues: readonly ['pending', 'processing', 'succeeded', 'failed', 'canceled', 'requires_action'];
export declare const billingIntervalValues: readonly ['monthly', 'yearly', 'weekly', 'daily'];
export declare const planTierValues: readonly ['basic', 'premium', 'pro', 'enterprise'];
export declare const paymentMethodTypeValues: readonly ['card', 'bank_account', 'paypal', 'apple_pay', 'google_pay'];
export type PaymentProviderType = (typeof paymentProviderValues)[number];
export type SubscriptionStatus = (typeof subscriptionStatusValues)[number];
export type PaymentStatus = (typeof paymentStatusValues)[number];
export type BillingInterval = (typeof billingIntervalValues)[number];
export type PlanTier = (typeof planTierValues)[number];
export type PaymentMethodType = (typeof paymentMethodTypeValues)[number];
export declare const webhookEventTypeValues: readonly ['subscription.created', 'subscription.updated', 'subscription.canceled', 'subscription.trial_will_end', 'payment.succeeded', 'payment.failed', 'payment.requires_action', 'customer.created', 'customer.updated', 'customer.deleted', 'invoice.created', 'invoice.finalized', 'invoice.paid', 'invoice.payment_failed'];
export type WebhookEventType = (typeof webhookEventTypeValues)[number];
//# sourceMappingURL=primitives.d.ts.map