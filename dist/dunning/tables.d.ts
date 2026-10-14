import type { PgColumn, PgSchema } from 'drizzle-orm/pg-core';
import type { Instant } from '@arki/date';
import type { SpendRange } from './types.js';
export type CreateDunningTablesDeps = {
    schema: PgSchema;
    /** `() => customers.id` from the host app's payments-core tables. */
    customerIdRef: () => PgColumn;
    /** `() => payments.id` from the host app's payments-core tables. */
    paymentIdRef: () => PgColumn;
    /** `() => subscriptions.id` from the host app's payments-core tables. */
    subscriptionIdRef: () => PgColumn;
};
/**
 * The host app keeps the `result` JSON column free-form because the domain
 * shape (`ExecutionResultDb`) lives in `types.ts` which couples back to
 * tables for `InferSelectModel`. We type the column as `Record<string, unknown>`
 * here; the host can re-tag via `$type<ExecutionResultDb>()` after assembly
 * if it needs stricter typing in queries.
 */
type ExecutionResultJson = Record<string, unknown>;
export declare function createDunningTables({ schema, customerIdRef, paymentIdRef, subscriptionIdRef, }: CreateDunningTablesDeps): {
    enums: {
        dunningCampaignTypeEnum: import("drizzle-orm/pg-core").PgEnum<["payment_failed", "subscription_past_due", "trial_ending", "renewal_reminder"]>;
        dunningCampaignStatusEnum: import("drizzle-orm/pg-core").PgEnum<["active", "paused", "archived", "draft"]>;
        communicationChannelEnum: import("drizzle-orm/pg-core").PgEnum<["email", "sms", "in_app", "webhook"]>;
        communicationStatusEnum: import("drizzle-orm/pg-core").PgEnum<["pending", "sent", "delivered", "opened", "clicked", "failed", "bounced"]>;
        executionStatusEnum: import("drizzle-orm/pg-core").PgEnum<["scheduled", "running", "completed", "failed", "cancelled"]>;
        customerSegmentTypeEnum: import("drizzle-orm/pg-core").PgEnum<["value_based", "behavior_based", "demographic", "risk_based", "custom"]>;
        riskCategoryEnum: import("drizzle-orm/pg-core").PgEnum<["low", "medium", "high", "critical"]>;
    };
    dunningCampaigns: import("drizzle-orm/pg-core").PgTableWithColumns<{
        name: "dunning_campaigns";
        schema: string;
        columns: {
            id: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaigns", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `dc_${string}`>>, {
                name: string;
                tableName: "dunning_campaigns";
                dataType: "string";
                data: `dc_${string}`;
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
            name: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaigns", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "dunning_campaigns";
                dataType: "string";
                data: string;
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
            description: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaigns", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "dunning_campaigns";
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
            type: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaigns", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["payment_failed", "subscription_past_due", "trial_ending", "renewal_reminder"]>, "payment_failed" | "renewal_reminder" | "subscription_past_due" | "trial_ending">>, {
                name: string;
                tableName: "dunning_campaigns";
                dataType: "string enum";
                data: "payment_failed" | "renewal_reminder" | "subscription_past_due" | "trial_ending";
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["payment_failed", "subscription_past_due", "trial_ending", "renewal_reminder"];
                identity: undefined;
                generated: undefined;
            }>;
            status: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaigns", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["active", "paused", "archived", "draft"]>, "active" | "archived" | "draft" | "paused">>>, {
                name: string;
                tableName: "dunning_campaigns";
                dataType: "string enum";
                data: "active" | "archived" | "draft" | "paused";
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["active", "paused", "archived", "draft"];
                identity: undefined;
                generated: undefined;
            }>;
            trigger: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaigns", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, {
                type: 'payment_failure' | 'subscription_status' | 'time_based' | 'manual';
                conditions: {
                    paymentFailureCount?: number;
                    subscriptionStatus?: string[];
                    daysSinceLastPayment?: number;
                    daysSinceFailure?: number;
                    trialEndingDays?: number;
                    renewalReminderDays?: number;
                };
                filters?: {
                    customerSegments?: string[];
                    planTiers?: string[];
                    subscriptionAge?: {
                        min?: number;
                        max?: number;
                    };
                    totalSpent?: SpendRange;
                };
            }>>, {
                name: string;
                tableName: "dunning_campaigns";
                dataType: "object json";
                data: {
                    type: 'payment_failure' | 'subscription_status' | 'time_based' | 'manual';
                    conditions: {
                        paymentFailureCount?: number;
                        subscriptionStatus?: string[];
                        daysSinceLastPayment?: number;
                        daysSinceFailure?: number;
                        trialEndingDays?: number;
                        renewalReminderDays?: number;
                    };
                    filters?: {
                        customerSegments?: string[];
                        planTiers?: string[];
                        subscriptionAge?: {
                            min?: number;
                            max?: number;
                        };
                        totalSpent?: SpendRange;
                    };
                };
                driverParam: unknown;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            settings: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaigns", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, {
                enabled: boolean;
                priority: number;
                cooldownPeriod: number;
                maxExecutionsPerCustomer: number;
                stopOnPaymentSuccess: boolean;
                respectUnsubscribe: boolean;
                businessHoursOnly: boolean;
                timezone?: string;
                allowedDays?: number[];
                abTestVariant?: string;
            }>>, {
                name: string;
                tableName: "dunning_campaigns";
                dataType: "object json";
                data: {
                    enabled: boolean;
                    priority: number;
                    cooldownPeriod: number;
                    maxExecutionsPerCustomer: number;
                    stopOnPaymentSuccess: boolean;
                    respectUnsubscribe: boolean;
                    businessHoursOnly: boolean;
                    timezone?: string;
                    allowedDays?: number[];
                    abTestVariant?: string;
                };
                driverParam: unknown;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            targetSegments: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaigns", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, string[]>>>, {
                name: string;
                tableName: "dunning_campaigns";
                dataType: "object json";
                data: string[];
                driverParam: unknown;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            createdBy: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaigns", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "dunning_campaigns";
                dataType: "string";
                data: string;
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
            updatedBy: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaigns", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "dunning_campaigns";
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
            metadata: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaigns", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                name: string;
                tableName: "dunning_campaigns";
                dataType: "object json";
                data: Record<string, unknown>;
                driverParam: unknown;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaigns", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "dunning_campaigns";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
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
            updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaigns", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "dunning_campaigns";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
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
        };
        dialect: 'pg';
    }>;
    dunningTemplates: import("drizzle-orm/pg-core").PgTableWithColumns<{
        name: "dunning_templates";
        schema: string;
        columns: {
            id: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_templates", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `dt_${string}`>>, {
                name: string;
                tableName: "dunning_templates";
                dataType: "string";
                data: `dt_${string}`;
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
            campaignId: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_templates", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dc_${string}`>, {
                name: string;
                tableName: "dunning_templates";
                dataType: "string";
                data: `dc_${string}`;
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
            name: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_templates", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "dunning_templates";
                dataType: "string";
                data: string;
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
            description: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_templates", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "dunning_templates";
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
            stepNumber: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_templates", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>, {
                name: string;
                tableName: "dunning_templates";
                dataType: "number int32";
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
            delayHours: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_templates", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                name: string;
                tableName: "dunning_templates";
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
            communication: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_templates", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, {
                channel: 'email' | 'sms' | 'in_app' | 'webhook';
                subject?: string;
                content: string;
                variables: string[];
                design?: {
                    theme?: string;
                    brandColors?: Record<string, string>;
                    logoUrl?: string;
                };
            }>>, {
                name: string;
                tableName: "dunning_templates";
                dataType: "object json";
                data: {
                    channel: 'email' | 'sms' | 'in_app' | 'webhook';
                    subject?: string;
                    content: string;
                    variables: string[];
                    design?: {
                        theme?: string;
                        brandColors?: Record<string, string>;
                        logoUrl?: string;
                    };
                };
                driverParam: unknown;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            isActive: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_templates", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                name: string;
                tableName: "dunning_templates";
                dataType: "boolean";
                data: boolean;
                driverParam: boolean;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            abTestVariant: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_templates", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "dunning_templates";
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
            metadata: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_templates", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                name: string;
                tableName: "dunning_templates";
                dataType: "object json";
                data: Record<string, unknown>;
                driverParam: unknown;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_templates", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "dunning_templates";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
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
            updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_templates", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "dunning_templates";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
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
        };
        dialect: 'pg';
    }>;
    dunningExecutions: import("drizzle-orm/pg-core").PgTableWithColumns<{
        name: "dunning_executions";
        schema: string;
        columns: {
            id: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `de_${string}`>>, {
                name: string;
                tableName: "dunning_executions";
                dataType: "string";
                data: `de_${string}`;
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
            campaignId: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dc_${string}`>, {
                name: string;
                tableName: "dunning_executions";
                dataType: "string";
                data: `dc_${string}`;
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
            templateId: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `dt_${string}`>, {
                name: string;
                tableName: "dunning_executions";
                dataType: "string";
                data: `dt_${string}`;
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
            customerId: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                name: string;
                tableName: "dunning_executions";
                dataType: "string";
                data: `cust_${string}`;
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
            subscriptionId: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `sub_${string}`>, {
                name: string;
                tableName: "dunning_executions";
                dataType: "string";
                data: `sub_${string}`;
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
            paymentId: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `pay_${string}`>, {
                name: string;
                tableName: "dunning_executions";
                dataType: "string";
                data: `pay_${string}`;
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
            triggerType: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "dunning_executions";
                dataType: "string";
                data: string;
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
            triggerData: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>>, {
                name: string;
                tableName: "dunning_executions";
                dataType: "object json";
                data: Record<string, unknown>;
                driverParam: unknown;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            status: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["scheduled", "running", "completed", "failed", "cancelled"]>, "cancelled" | "completed" | "failed" | "running" | "scheduled">>>, {
                name: string;
                tableName: "dunning_executions";
                dataType: "string enum";
                data: "cancelled" | "completed" | "failed" | "running" | "scheduled";
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["scheduled", "running", "completed", "failed", "cancelled"];
                identity: undefined;
                generated: undefined;
            }>;
            scheduledAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>, {
                name: string;
                tableName: "dunning_executions";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
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
            startedAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "dunning_executions";
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
            completedAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "dunning_executions";
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
            result: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, ExecutionResultJson>, {
                name: string;
                tableName: "dunning_executions";
                dataType: "object json";
                data: ExecutionResultJson;
                driverParam: unknown;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            errorMessage: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "dunning_executions";
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
            retryCount: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                name: string;
                tableName: "dunning_executions";
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
            nextRetryAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "dunning_executions";
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
            metadata: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                name: string;
                tableName: "dunning_executions";
                dataType: "object json";
                data: Record<string, unknown>;
                driverParam: unknown;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "dunning_executions";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
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
            updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_executions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "dunning_executions";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
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
        };
        dialect: 'pg';
    }>;
    dunningCommunications: import("drizzle-orm/pg-core").PgTableWithColumns<{
        name: "dunning_communications";
        schema: string;
        columns: {
            id: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `dcm_${string}`>>, {
                name: string;
                tableName: "dunning_communications";
                dataType: "string";
                data: `dcm_${string}`;
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
            executionId: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `de_${string}`>, {
                name: string;
                tableName: "dunning_communications";
                dataType: "string";
                data: `de_${string}`;
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
            customerId: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                name: string;
                tableName: "dunning_communications";
                dataType: "string";
                data: `cust_${string}`;
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
            templateId: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dt_${string}`>, {
                name: string;
                tableName: "dunning_communications";
                dataType: "string";
                data: `dt_${string}`;
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
            channel: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["email", "sms", "in_app", "webhook"]>, "email" | "in_app" | "sms" | "webhook">>, {
                name: string;
                tableName: "dunning_communications";
                dataType: "string enum";
                data: "email" | "in_app" | "sms" | "webhook";
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["email", "sms", "in_app", "webhook"];
                identity: undefined;
                generated: undefined;
            }>;
            recipient: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "dunning_communications";
                dataType: "string";
                data: string;
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
            subject: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "dunning_communications";
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
            content: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "dunning_communications";
                dataType: "string";
                data: string;
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
            status: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["pending", "sent", "delivered", "opened", "clicked", "failed", "bounced"]>, "bounced" | "clicked" | "delivered" | "failed" | "opened" | "pending" | "sent">>>, {
                name: string;
                tableName: "dunning_communications";
                dataType: "string enum";
                data: "bounced" | "clicked" | "delivered" | "failed" | "opened" | "pending" | "sent";
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["pending", "sent", "delivered", "opened", "clicked", "failed", "bounced"];
                identity: undefined;
                generated: undefined;
            }>;
            sentAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "dunning_communications";
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
            deliveredAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "dunning_communications";
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
            openedAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "dunning_communications";
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
            clickedAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "dunning_communications";
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
            failureReason: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "dunning_communications";
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
            providerMessageId: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "dunning_communications";
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
            providerResponse: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                name: string;
                tableName: "dunning_communications";
                dataType: "object json";
                data: Record<string, unknown>;
                driverParam: unknown;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            trackingData: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                name: string;
                tableName: "dunning_communications";
                dataType: "object json";
                data: Record<string, unknown>;
                driverParam: unknown;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            metadata: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                name: string;
                tableName: "dunning_communications";
                dataType: "object json";
                data: Record<string, unknown>;
                driverParam: unknown;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "dunning_communications";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
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
            updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_communications", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "dunning_communications";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
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
        };
        dialect: 'pg';
    }>;
    customerSegments: import("drizzle-orm/pg-core").PgTableWithColumns<{
        name: "customer_segments";
        schema: string;
        columns: {
            id: import("drizzle-orm/pg-core").PgBuildColumn<"customer_segments", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `cs_${string}`>>, {
                name: string;
                tableName: "customer_segments";
                dataType: "string";
                data: `cs_${string}`;
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
            name: import("drizzle-orm/pg-core").PgBuildColumn<"customer_segments", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "customer_segments";
                dataType: "string";
                data: string;
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
            description: import("drizzle-orm/pg-core").PgBuildColumn<"customer_segments", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "customer_segments";
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
            type: import("drizzle-orm/pg-core").PgBuildColumn<"customer_segments", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["value_based", "behavior_based", "demographic", "risk_based", "custom"]>, "behavior_based" | "custom" | "demographic" | "risk_based" | "value_based">>, {
                name: string;
                tableName: "customer_segments";
                dataType: "string enum";
                data: "behavior_based" | "custom" | "demographic" | "risk_based" | "value_based";
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["value_based", "behavior_based", "demographic", "risk_based", "custom"];
                identity: undefined;
                generated: undefined;
            }>;
            criteria: import("drizzle-orm/pg-core").PgBuildColumn<"customer_segments", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, {
                totalSpent?: SpendRange;
                subscriptionDuration?: {
                    min?: number;
                    max?: number;
                };
                paymentFailureHistory?: {
                    count: number;
                    timeframe: number;
                };
                planTier?: string[];
                lastPaymentDate?: {
                    daysAgo: number;
                };
                lifetimeValue?: {
                    min?: number;
                    max?: number;
                };
                churnRisk?: 'low' | 'medium' | 'high';
                engagementScore?: {
                    min?: number;
                    max?: number;
                };
                customAttributes?: Record<string, unknown>;
            }>>, {
                name: string;
                tableName: "customer_segments";
                dataType: "object json";
                data: {
                    totalSpent?: SpendRange;
                    subscriptionDuration?: {
                        min?: number;
                        max?: number;
                    };
                    paymentFailureHistory?: {
                        count: number;
                        timeframe: number;
                    };
                    planTier?: string[];
                    lastPaymentDate?: {
                        daysAgo: number;
                    };
                    lifetimeValue?: {
                        min?: number;
                        max?: number;
                    };
                    churnRisk?: 'low' | 'medium' | 'high';
                    engagementScore?: {
                        min?: number;
                        max?: number;
                    };
                    customAttributes?: Record<string, unknown>;
                };
                driverParam: unknown;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            isActive: import("drizzle-orm/pg-core").PgBuildColumn<"customer_segments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                name: string;
                tableName: "customer_segments";
                dataType: "boolean";
                data: boolean;
                driverParam: boolean;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            customerCount: import("drizzle-orm/pg-core").PgBuildColumn<"customer_segments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").PgIntegerBuilder>, {
                name: string;
                tableName: "customer_segments";
                dataType: "number int32";
                data: number;
                driverParam: string | number;
                notNull: false;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            lastCalculated: import("drizzle-orm/pg-core").PgBuildColumn<"customer_segments", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "customer_segments";
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
            autoUpdate: import("drizzle-orm/pg-core").PgBuildColumn<"customer_segments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                name: string;
                tableName: "customer_segments";
                dataType: "boolean";
                data: boolean;
                driverParam: boolean;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            updateFrequency: import("drizzle-orm/pg-core").PgBuildColumn<"customer_segments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").PgIntegerBuilder>, {
                name: string;
                tableName: "customer_segments";
                dataType: "number int32";
                data: number;
                driverParam: string | number;
                notNull: false;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            createdBy: import("drizzle-orm/pg-core").PgBuildColumn<"customer_segments", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "customer_segments";
                dataType: "string";
                data: string;
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
            metadata: import("drizzle-orm/pg-core").PgBuildColumn<"customer_segments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                name: string;
                tableName: "customer_segments";
                dataType: "object json";
                data: Record<string, unknown>;
                driverParam: unknown;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"customer_segments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "customer_segments";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
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
            updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"customer_segments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "customer_segments";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
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
        };
        dialect: 'pg';
    }>;
    customerRiskProfiles: import("drizzle-orm/pg-core").PgTableWithColumns<{
        name: "customer_risk_profiles";
        schema: string;
        columns: {
            id: import("drizzle-orm/pg-core").PgBuildColumn<"customer_risk_profiles", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `crp_${string}`>>, {
                name: string;
                tableName: "customer_risk_profiles";
                dataType: "string";
                data: `crp_${string}`;
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
            customerId: import("drizzle-orm/pg-core").PgBuildColumn<"customer_risk_profiles", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                name: string;
                tableName: "customer_risk_profiles";
                dataType: "string";
                data: `cust_${string}`;
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
            segmentIds: import("drizzle-orm/pg-core").PgBuildColumn<"customer_risk_profiles", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, string[]>>>, {
                name: string;
                tableName: "customer_risk_profiles";
                dataType: "object json";
                data: string[];
                driverParam: unknown;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            riskScore: import("drizzle-orm/pg-core").PgBuildColumn<"customer_risk_profiles", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, {
                overall: number;
                factors: Record<string, number>;
                category: 'low' | 'medium' | 'high' | 'critical';
                lastCalculated: Instant;
                trends: {
                    direction: 'improving' | 'stable' | 'declining';
                    changePercent: number;
                    timeframe: number;
                };
            }>>, {
                name: string;
                tableName: "customer_risk_profiles";
                dataType: "object json";
                data: {
                    overall: number;
                    factors: Record<string, number>;
                    category: 'low' | 'medium' | 'high' | 'critical';
                    lastCalculated: Instant;
                    trends: {
                        direction: 'improving' | 'stable' | 'declining';
                        changePercent: number;
                        timeframe: number;
                    };
                };
                driverParam: unknown;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            paymentHistory: import("drizzle-orm/pg-core").PgBuildColumn<"customer_risk_profiles", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, {
                totalPayments: number;
                successfulPayments: number;
                failedPayments: number;
                averageAmount: number;
                /** ISO currency code `averageAmount` is in; absent when the customer has no payments. */
                currency?: string;
                lastPaymentDate?: Instant;
                streakDays: number;
            }>>, {
                name: string;
                tableName: "customer_risk_profiles";
                dataType: "object json";
                data: {
                    totalPayments: number;
                    successfulPayments: number;
                    failedPayments: number;
                    averageAmount: number;
                    /** ISO currency code `averageAmount` is in; absent when the customer has no payments. */
                    currency?: string;
                    lastPaymentDate?: Instant;
                    streakDays: number;
                };
                driverParam: unknown;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            subscriptionHistory: import("drizzle-orm/pg-core").PgBuildColumn<"customer_risk_profiles", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, {
                totalSubscriptions: number;
                activeSubscriptions: number;
                canceledSubscriptions: number;
                averageDuration: number;
                currentStatus?: string;
            }>>, {
                name: string;
                tableName: "customer_risk_profiles";
                dataType: "object json";
                data: {
                    totalSubscriptions: number;
                    activeSubscriptions: number;
                    canceledSubscriptions: number;
                    averageDuration: number;
                    currentStatus?: string;
                };
                driverParam: unknown;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            engagementMetrics: import("drizzle-orm/pg-core").PgBuildColumn<"customer_risk_profiles", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, {
                score: number;
                lastActivity?: Instant;
                activityFrequency: number;
                featureUsage: Record<string, number>;
            }>>, {
                name: string;
                tableName: "customer_risk_profiles";
                dataType: "object json";
                data: {
                    score: number;
                    lastActivity?: Instant;
                    activityFrequency: number;
                    featureUsage: Record<string, number>;
                };
                driverParam: unknown;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            communicationPreferences: import("drizzle-orm/pg-core").PgBuildColumn<"customer_risk_profiles", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, {
                preferredChannel?: 'email' | 'sms' | 'in_app' | 'webhook';
                unsubscribed: boolean;
                unsubscribedChannels: ('email' | 'sms' | 'in_app' | 'webhook')[];
                timezone?: string;
                language?: string;
            }>>, {
                name: string;
                tableName: "customer_risk_profiles";
                dataType: "object json";
                data: {
                    preferredChannel?: 'email' | 'sms' | 'in_app' | 'webhook';
                    unsubscribed: boolean;
                    unsubscribedChannels: ('email' | 'sms' | 'in_app' | 'webhook')[];
                    timezone?: string;
                    language?: string;
                };
                driverParam: unknown;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            metadata: import("drizzle-orm/pg-core").PgBuildColumn<"customer_risk_profiles", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                name: string;
                tableName: "customer_risk_profiles";
                dataType: "object json";
                data: Record<string, unknown>;
                driverParam: unknown;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"customer_risk_profiles", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "customer_risk_profiles";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
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
            updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"customer_risk_profiles", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "customer_risk_profiles";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
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
        };
        dialect: 'pg';
    }>;
    dunningCampaignAnalytics: import("drizzle-orm/pg-core").PgTableWithColumns<{
        name: "dunning_campaign_analytics";
        schema: string;
        columns: {
            id: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
                dataType: "string";
                data: string;
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
            campaignId: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dc_${string}`>, {
                name: string;
                tableName: "dunning_campaign_analytics";
                dataType: "string";
                data: `dc_${string}`;
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
            date: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
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
            executions: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
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
            customersReached: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
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
            communicationsSent: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
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
            emailsSent: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
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
            emailsOpened: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
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
            emailsClicked: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
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
            smsSent: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
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
            smsDelivered: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
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
            paymentsRecovered: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
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
            currency: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
                dataType: "string";
                data: string;
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
            revenueRecoveredMinor: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBigInt53Builder>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
                dataType: "number int53";
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
            unsubscribes: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
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
            complaints: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
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
            communicationCostsMinor: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBigInt53Builder>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
                dataType: "number int53";
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
            processingCostsMinor: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBigInt53Builder>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
                dataType: "number int53";
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
            conversionRate: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgRealBuilder>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
                dataType: "number float";
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
            roi: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgRealBuilder>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
                dataType: "number float";
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
            metadata: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
                dataType: "object json";
                data: Record<string, unknown>;
                driverParam: unknown;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
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
            updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"dunning_campaign_analytics", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "dunning_campaign_analytics";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
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
        };
        dialect: 'pg';
    }>;
    foreignKeys: {
        dunningCampaignForeignKeys: {
            required: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dc_${string}`>;
            optional: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `dc_${string}`>;
        };
        dunningTemplateForeignKeys: {
            required: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dt_${string}`>;
            optional: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `dt_${string}`>;
        };
        dunningExecutionForeignKeys: {
            required: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `de_${string}`>;
            optional: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `de_${string}`>;
        };
        dunningCommunicationForeignKeys: {
            required: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `dcm_${string}`>;
            optional: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `dcm_${string}`>;
        };
        customerSegmentForeignKeys: {
            required: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cs_${string}`>;
            optional: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `cs_${string}`>;
        };
        customerRiskProfileForeignKeys: {
            required: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `crp_${string}`>;
            optional: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `crp_${string}`>;
        };
    };
};
export type DunningTables = ReturnType<typeof createDunningTables>;
export {};
//# sourceMappingURL=tables.d.ts.map