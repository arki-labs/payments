import type { PgColumn, PgSchema } from 'drizzle-orm/pg-core';
export type CreateRefundsTablesDeps = {
    schema: PgSchema;
    /** `() => payments.id` from the host app's payments-core tables. */
    paymentIdRef: () => PgColumn;
    /** `() => User.id` from the host app's auth tables. */
    userIdRef: () => PgColumn;
};
export declare function createRefundsTables({ schema, paymentIdRef, userIdRef }: CreateRefundsTablesDeps): {
    enums: {
        refundReasonEnum: import("drizzle-orm/pg-core").PgEnum<["customer_request", "duplicate_charge", "fraudulent_transaction", "service_not_delivered", "billing_error", "technical_issue", "goodwill_gesture", "chargeback_prevention", "other"]>;
        refundStatusEnum: import("drizzle-orm/pg-core").PgEnum<["pending", "approved", "processing", "completed", "failed", "rejected", "canceled"]>;
    };
    refunds: import("drizzle-orm/pg-core").PgTableWithColumns<{
        name: "refunds";
        schema: string;
        columns: {
            id: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `rfnd_${string}`>>, {
                name: string;
                tableName: "refunds";
                dataType: "string";
                data: `rfnd_${string}`;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            paymentId: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `pay_${string}`>, {
                name: string;
                tableName: "refunds";
                dataType: "string";
                data: `pay_${string}`;
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            originalAmountMinor: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBigInt53Builder>, {
                name: string;
                tableName: "refunds";
                dataType: "number int53";
                data: number;
                driverParam: string | number;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            refundAmountMinor: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBigInt53Builder>, {
                name: string;
                tableName: "refunds";
                dataType: "number int53";
                data: number;
                driverParam: string | number;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            currency: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "refunds";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            reason: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["customer_request", "duplicate_charge", "fraudulent_transaction", "service_not_delivered", "billing_error", "technical_issue", "goodwill_gesture", "chargeback_prevention", "other"]>, "billing_error" | "chargeback_prevention" | "customer_request" | "duplicate_charge" | "fraudulent_transaction" | "goodwill_gesture" | "other" | "service_not_delivered" | "technical_issue">>, {
                name: string;
                tableName: "refunds";
                dataType: "string enum";
                data: "billing_error" | "chargeback_prevention" | "customer_request" | "duplicate_charge" | "fraudulent_transaction" | "goodwill_gesture" | "other" | "service_not_delivered" | "technical_issue";
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["customer_request", "duplicate_charge", "fraudulent_transaction", "service_not_delivered", "billing_error", "technical_issue", "goodwill_gesture", "chargeback_prevention", "other"];
                identity: undefined;
                generated: undefined;
            }>;
            status: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["pending", "approved", "processing", "completed", "failed", "rejected", "canceled"]>, "approved" | "canceled" | "completed" | "failed" | "pending" | "processing" | "rejected">>, {
                name: string;
                tableName: "refunds";
                dataType: "string enum";
                data: "approved" | "canceled" | "completed" | "failed" | "pending" | "processing" | "rejected";
                driverParam: string;
                notNull: false;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["pending", "approved", "processing", "completed", "failed", "rejected", "canceled"];
                identity: undefined;
                generated: undefined;
            }>;
            providerRefundId: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "refunds";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            providerResponse: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "refunds";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            requestedBy: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>, {
                name: string;
                tableName: "refunds";
                dataType: "string";
                data: `usr_${string}`;
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            approvedBy: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `usr_${string}`>, {
                name: string;
                tableName: "refunds";
                dataType: "string";
                data: `usr_${string}`;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            rejectedBy: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `usr_${string}`>, {
                name: string;
                tableName: "refunds";
                dataType: "string";
                data: `usr_${string}`;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            rejectionReason: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "refunds";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            requestedAt: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>, {
                name: string;
                tableName: "refunds";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: false;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            approvedAt: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "refunds";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            processedAt: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "refunds";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            completedAt: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "refunds";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            internalNotes: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "refunds";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            customerNote: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "refunds";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            metadata: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "refunds";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>, {
                name: string;
                tableName: "refunds";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: false;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>, {
                name: string;
                tableName: "refunds";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: false;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            version: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                name: string;
                tableName: "refunds";
                dataType: "number int32";
                data: number;
                driverParam: string | number;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
        };
        dialect: 'pg';
    }>;
    foreignKeys: {
        refundForeignKeys: {
            required: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `rfnd_${string}`>;
            optional: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `rfnd_${string}`>;
        };
    };
};
export type RefundsTables = ReturnType<typeof createRefundsTables>;
//# sourceMappingURL=tables.d.ts.map