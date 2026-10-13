/**
 * Subscription on the journal: its events, the entity and the commands
 *
 * One `subscriptions` row is the current state of a subscription, keyed by its
 * id. Each reducer says which columns an event changes.
 *
 * The payment provider owns the status. Events carry the status the provider
 * reported; the package never invents one. `SubscriptionSynced` carries the
 * whole provider snapshot, so a webhook delivery is one event.
 *
 * Event data is plain JSON: times are ISO strings and reducers build the
 * `Instant`. `updatedAt` is `e.recordedAt`. Command inputs take `Instant` values,
 * because inputs are not stored.
 */
import type { JournalDefinitions, RootDb, TransactionSource } from '@arki/journal';
import { z } from '@arki/contracts';
import type { CoreTables } from '../tables.js';
/**
 * A field left `undefined` means "the caller did not say": a new row gets the
 * empty value and an existing row keeps what it has. `null` clears the field.
 */
export declare const syncSubscriptionInputSchema: z.ZodObject<{
    userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
    customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
    providerSubscriptionId: z.ZodString;
    status: z.ZodEnum<{
        active: "active";
        canceled: "canceled";
        incomplete: "incomplete";
        incomplete_expired: "incomplete_expired";
        past_due: "past_due";
        paused: "paused";
        trialing: "trialing";
        unpaid: "unpaid";
    }>;
    currentPeriodStart: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    currentPeriodEnd: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    trialStart: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    trialEnd: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    canceledAt: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
export declare const createSubscriptionInputSchema: z.ZodObject<{
    userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
    customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
    providerSubscriptionId: z.ZodString;
    status: z.ZodEnum<{
        active: "active";
        canceled: "canceled";
        incomplete: "incomplete";
        incomplete_expired: "incomplete_expired";
        past_due: "past_due";
        paused: "paused";
        trialing: "trialing";
        unpaid: "unpaid";
    }>;
    currentPeriodStart: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    currentPeriodEnd: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    trialStart: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    trialEnd: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    canceledAt: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    subscriptionId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>;
}, z.core.$strip>;
export declare const cancelSubscriptionInputSchema: z.ZodObject<{
    subscriptionId: z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `sub_${string}`, "out">, z.ZodTransform<`sub_${string}`, string & z.$brand<`sub_${string}`>>>;
    status: z.ZodDefault<z.ZodEnum<{
        active: "active";
        canceled: "canceled";
        incomplete: "incomplete";
        incomplete_expired: "incomplete_expired";
        past_due: "past_due";
        paused: "paused";
        trialing: "trialing";
        unpaid: "unpaid";
    }>>;
    canceledAt: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const reactivateSubscriptionInputSchema: z.ZodObject<{
    subscriptionId: z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `sub_${string}`, "out">, z.ZodTransform<`sub_${string}`, string & z.$brand<`sub_${string}`>>>;
    status: z.ZodDefault<z.ZodEnum<{
        active: "active";
        canceled: "canceled";
        incomplete: "incomplete";
        incomplete_expired: "incomplete_expired";
        past_due: "past_due";
        paused: "paused";
        trialing: "trialing";
        unpaid: "unpaid";
    }>>;
}, z.core.$strip>;
export declare const pauseSubscriptionInputSchema: z.ZodObject<{
    subscriptionId: z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `sub_${string}`, "out">, z.ZodTransform<`sub_${string}`, string & z.$brand<`sub_${string}`>>>;
    status: z.ZodDefault<z.ZodEnum<{
        active: "active";
        canceled: "canceled";
        incomplete: "incomplete";
        incomplete_expired: "incomplete_expired";
        past_due: "past_due";
        paused: "paused";
        trialing: "trialing";
        unpaid: "unpaid";
    }>>;
}, z.core.$strip>;
export declare const resumeSubscriptionInputSchema: z.ZodObject<{
    subscriptionId: z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `sub_${string}`, "out">, z.ZodTransform<`sub_${string}`, string & z.$brand<`sub_${string}`>>>;
    status: z.ZodDefault<z.ZodEnum<{
        active: "active";
        canceled: "canceled";
        incomplete: "incomplete";
        incomplete_expired: "incomplete_expired";
        past_due: "past_due";
        paused: "paused";
        trialing: "trialing";
        unpaid: "unpaid";
    }>>;
}, z.core.$strip>;
export declare const markSubscriptionPastDueInputSchema: z.ZodObject<{
    subscriptionId: z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `sub_${string}`, "out">, z.ZodTransform<`sub_${string}`, string & z.$brand<`sub_${string}`>>>;
}, z.core.$strip>;
export declare const activateSubscriptionInputSchema: z.ZodObject<{
    subscriptionId: z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `sub_${string}`, "out">, z.ZodTransform<`sub_${string}`, string & z.$brand<`sub_${string}`>>>;
}, z.core.$strip>;
export type SyncSubscriptionInput = z.input<typeof syncSubscriptionInputSchema>;
export type CreateSubscriptionInput = z.input<typeof createSubscriptionInputSchema>;
export type CancelSubscriptionInput = z.input<typeof cancelSubscriptionInputSchema>;
export type ReactivateSubscriptionInput = z.input<typeof reactivateSubscriptionInputSchema>;
export type PauseSubscriptionInput = z.input<typeof pauseSubscriptionInputSchema>;
export type ResumeSubscriptionInput = z.input<typeof resumeSubscriptionInputSchema>;
export type MarkSubscriptionPastDueInput = z.input<typeof markSubscriptionPastDueInputSchema>;
export type ActivateSubscriptionInput = z.input<typeof activateSubscriptionInputSchema>;
export declare function createSubscriptionJournal<Meta extends z.ZodObject, Tx extends TransactionSource<Tx>, AppDb extends RootDb>(j: JournalDefinitions<Meta, Tx, AppDb>, subscriptions: CoreTables['subscriptions']): {
    subscription: import("@arki/journal").OnOnlyEntityBuilder<"subscription", import("drizzle-orm/pg-core").PgTableWithColumns<{
        name: "subscriptions";
        schema: string;
        columns: {
            id: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `sub_${string}`>>, {
                name: string;
                tableName: "subscriptions";
                dataType: "string";
                data: `sub_${string}`;
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
            userId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>, {
                name: string;
                tableName: "subscriptions";
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
            planId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `plan_${string}`>, {
                name: string;
                tableName: "subscriptions";
                dataType: "string";
                data: `plan_${string}`;
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
            customerId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                name: string;
                tableName: "subscriptions";
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
            providerSubscriptionId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "subscriptions";
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
            status: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"]>, "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid">>>, {
                name: string;
                tableName: "subscriptions";
                dataType: "string enum";
                data: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid";
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"];
                identity: undefined;
                generated: undefined;
            }>;
            currentPeriodStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>, {
                name: string;
                tableName: "subscriptions";
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
            currentPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>, {
                name: string;
                tableName: "subscriptions";
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
            trialStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "subscriptions";
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
            trialEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "subscriptions";
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
            canceledAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "subscriptions";
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
            cancelAtPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                name: string;
                tableName: "subscriptions";
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
            metadata: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                name: string;
                tableName: "subscriptions";
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
            createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "subscriptions";
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
            updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "subscriptions";
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
            version: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                name: string;
                tableName: "subscriptions";
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
    }>, import("@arki/journal").EventDef<"SubscriptionActivated", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCanceled", z.ZodObject<{
        status: z.ZodEnum<{
            active: "active";
            canceled: "canceled";
            incomplete: "incomplete";
            incomplete_expired: "incomplete_expired";
            past_due: "past_due";
            paused: "paused";
            trialing: "trialing";
            unpaid: "unpaid";
        }>;
        canceledAt: z.ZodNullable<z.ZodISODateTime>;
        cancelAtPeriodEnd: z.ZodBoolean;
    }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCreated", z.ZodObject<{
        userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
        planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
        customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
        status: z.ZodEnum<{
            active: "active";
            canceled: "canceled";
            incomplete: "incomplete";
            incomplete_expired: "incomplete_expired";
            past_due: "past_due";
            paused: "paused";
            trialing: "trialing";
            unpaid: "unpaid";
        }>;
        currentPeriodStart: z.ZodISODateTime;
        currentPeriodEnd: z.ZodISODateTime;
        trialStart: z.ZodNullable<z.ZodISODateTime>;
        trialEnd: z.ZodNullable<z.ZodISODateTime>;
        canceledAt: z.ZodNullable<z.ZodISODateTime>;
        cancelAtPeriodEnd: z.ZodBoolean;
        metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        providerSubscriptionId: z.ZodString;
    }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPastDue", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPaused", z.ZodObject<{
        status: z.ZodEnum<{
            active: "active";
            canceled: "canceled";
            incomplete: "incomplete";
            incomplete_expired: "incomplete_expired";
            past_due: "past_due";
            paused: "paused";
            trialing: "trialing";
            unpaid: "unpaid";
        }>;
    }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionReactivated", z.ZodObject<{
        status: z.ZodEnum<{
            active: "active";
            canceled: "canceled";
            incomplete: "incomplete";
            incomplete_expired: "incomplete_expired";
            past_due: "past_due";
            paused: "paused";
            trialing: "trialing";
            unpaid: "unpaid";
        }>;
    }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionResumed", z.ZodObject<{
        status: z.ZodEnum<{
            active: "active";
            canceled: "canceled";
            incomplete: "incomplete";
            incomplete_expired: "incomplete_expired";
            past_due: "past_due";
            paused: "paused";
            trialing: "trialing";
            unpaid: "unpaid";
        }>;
    }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionSynced", z.ZodObject<{
        userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
        planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
        customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
        status: z.ZodEnum<{
            active: "active";
            canceled: "canceled";
            incomplete: "incomplete";
            incomplete_expired: "incomplete_expired";
            past_due: "past_due";
            paused: "paused";
            trialing: "trialing";
            unpaid: "unpaid";
        }>;
        currentPeriodStart: z.ZodISODateTime;
        currentPeriodEnd: z.ZodISODateTime;
        trialStart: z.ZodNullable<z.ZodISODateTime>;
        trialEnd: z.ZodNullable<z.ZodISODateTime>;
        canceledAt: z.ZodNullable<z.ZodISODateTime>;
        cancelAtPeriodEnd: z.ZodBoolean;
        metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>>, z.infer<Meta>, "id", {
        userId: `usr_${string}`;
        planId: `plan_${string}`;
        customerId: `cust_${string}`;
        providerSubscriptionId: string;
        status: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid";
        currentPeriodStart: import("temporal-spec").Temporal.Instant;
        currentPeriodEnd: import("temporal-spec").Temporal.Instant;
        trialStart: import("temporal-spec").Temporal.Instant | null;
        trialEnd: import("temporal-spec").Temporal.Instant | null;
        canceledAt: import("temporal-spec").Temporal.Instant | null;
        cancelAtPeriodEnd: boolean;
        metadata: Record<string, unknown> | null;
        createdAt: import("temporal-spec").Temporal.Instant;
        updatedAt: import("temporal-spec").Temporal.Instant;
    }>;
    events: {
        SubscriptionCreated: import("@arki/journal").EventDef<"SubscriptionCreated", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            providerSubscriptionId: z.ZodString;
        }, z.core.$strip>>;
        SubscriptionSynced: import("@arki/journal").EventDef<"SubscriptionSynced", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        SubscriptionActivated: import("@arki/journal").EventDef<"SubscriptionActivated", z.ZodObject<{}, z.core.$strip>>;
        SubscriptionCanceled: import("@arki/journal").EventDef<"SubscriptionCanceled", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
        }, z.core.$strip>>;
        SubscriptionReactivated: import("@arki/journal").EventDef<"SubscriptionReactivated", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>>;
        SubscriptionPaused: import("@arki/journal").EventDef<"SubscriptionPaused", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>>;
        SubscriptionResumed: import("@arki/journal").EventDef<"SubscriptionResumed", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>>;
        SubscriptionPastDue: import("@arki/journal").EventDef<"SubscriptionPastDue", z.ZodObject<{}, z.core.$strip>>;
    };
    commands: {
        createSubscription: import("@arki/journal").Command<z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            providerSubscriptionId: z.ZodString;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            currentPeriodEnd: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            trialStart: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
            trialEnd: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
            canceledAt: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
            cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            subscriptionId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
            name: "subscriptions";
            schema: string;
            columns: {
                id: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `sub_${string}`>>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string";
                    data: `sub_${string}`;
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
                userId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
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
                planId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `plan_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string";
                    data: `plan_${string}`;
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
                customerId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
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
                providerSubscriptionId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                    name: string;
                    tableName: "subscriptions";
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
                status: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"]>, "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid">>>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string enum";
                    data: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"];
                    identity: undefined;
                    generated: undefined;
                }>;
                currentPeriodStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>, {
                    name: string;
                    tableName: "subscriptions";
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
                currentPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>, {
                    name: string;
                    tableName: "subscriptions";
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
                trialStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                trialEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                canceledAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                cancelAtPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                    name: string;
                    tableName: "subscriptions";
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
                metadata: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                    name: string;
                    tableName: "subscriptions";
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
                createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "subscriptions";
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
                updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "subscriptions";
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
                version: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                    name: string;
                    tableName: "subscriptions";
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
        }>, import("@arki/journal").EventDef<"SubscriptionActivated", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCanceled", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCreated", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            providerSubscriptionId: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPastDue", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPaused", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionReactivated", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionResumed", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionSynced", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        syncSubscription: import("@arki/journal").Command<z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            providerSubscriptionId: z.ZodString;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            currentPeriodEnd: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            trialStart: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
            trialEnd: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
            canceledAt: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
            cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
            name: "subscriptions";
            schema: string;
            columns: {
                id: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `sub_${string}`>>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string";
                    data: `sub_${string}`;
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
                userId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
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
                planId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `plan_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string";
                    data: `plan_${string}`;
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
                customerId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
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
                providerSubscriptionId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                    name: string;
                    tableName: "subscriptions";
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
                status: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"]>, "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid">>>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string enum";
                    data: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"];
                    identity: undefined;
                    generated: undefined;
                }>;
                currentPeriodStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>, {
                    name: string;
                    tableName: "subscriptions";
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
                currentPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>, {
                    name: string;
                    tableName: "subscriptions";
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
                trialStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                trialEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                canceledAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                cancelAtPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                    name: string;
                    tableName: "subscriptions";
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
                metadata: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                    name: string;
                    tableName: "subscriptions";
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
                createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "subscriptions";
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
                updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "subscriptions";
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
                version: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                    name: string;
                    tableName: "subscriptions";
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
        }>, import("@arki/journal").EventDef<"SubscriptionActivated", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCanceled", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCreated", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            providerSubscriptionId: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPastDue", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPaused", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionReactivated", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionResumed", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionSynced", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        cancelSubscription: import("@arki/journal").Command<z.ZodObject<{
            subscriptionId: z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `sub_${string}`, "out">, z.ZodTransform<`sub_${string}`, string & z.$brand<`sub_${string}`>>>;
            status: z.ZodDefault<z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>>;
            canceledAt: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
            cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
            name: "subscriptions";
            schema: string;
            columns: {
                id: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `sub_${string}`>>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string";
                    data: `sub_${string}`;
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
                userId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
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
                planId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `plan_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string";
                    data: `plan_${string}`;
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
                customerId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
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
                providerSubscriptionId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                    name: string;
                    tableName: "subscriptions";
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
                status: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"]>, "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid">>>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string enum";
                    data: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"];
                    identity: undefined;
                    generated: undefined;
                }>;
                currentPeriodStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>, {
                    name: string;
                    tableName: "subscriptions";
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
                currentPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>, {
                    name: string;
                    tableName: "subscriptions";
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
                trialStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                trialEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                canceledAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                cancelAtPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                    name: string;
                    tableName: "subscriptions";
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
                metadata: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                    name: string;
                    tableName: "subscriptions";
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
                createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "subscriptions";
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
                updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "subscriptions";
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
                version: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                    name: string;
                    tableName: "subscriptions";
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
        }>, import("@arki/journal").EventDef<"SubscriptionActivated", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCanceled", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCreated", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            providerSubscriptionId: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPastDue", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPaused", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionReactivated", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionResumed", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionSynced", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        reactivateSubscription: import("@arki/journal").Command<z.ZodObject<{
            subscriptionId: z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `sub_${string}`, "out">, z.ZodTransform<`sub_${string}`, string & z.$brand<`sub_${string}`>>>;
            status: z.ZodDefault<z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>>;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
            name: "subscriptions";
            schema: string;
            columns: {
                id: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `sub_${string}`>>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string";
                    data: `sub_${string}`;
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
                userId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
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
                planId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `plan_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string";
                    data: `plan_${string}`;
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
                customerId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
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
                providerSubscriptionId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                    name: string;
                    tableName: "subscriptions";
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
                status: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"]>, "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid">>>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string enum";
                    data: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"];
                    identity: undefined;
                    generated: undefined;
                }>;
                currentPeriodStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>, {
                    name: string;
                    tableName: "subscriptions";
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
                currentPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>, {
                    name: string;
                    tableName: "subscriptions";
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
                trialStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                trialEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                canceledAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                cancelAtPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                    name: string;
                    tableName: "subscriptions";
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
                metadata: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                    name: string;
                    tableName: "subscriptions";
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
                createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "subscriptions";
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
                updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "subscriptions";
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
                version: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                    name: string;
                    tableName: "subscriptions";
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
        }>, import("@arki/journal").EventDef<"SubscriptionActivated", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCanceled", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCreated", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            providerSubscriptionId: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPastDue", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPaused", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionReactivated", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionResumed", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionSynced", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        pauseSubscription: import("@arki/journal").Command<z.ZodObject<{
            subscriptionId: z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `sub_${string}`, "out">, z.ZodTransform<`sub_${string}`, string & z.$brand<`sub_${string}`>>>;
            status: z.ZodDefault<z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>>;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
            name: "subscriptions";
            schema: string;
            columns: {
                id: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `sub_${string}`>>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string";
                    data: `sub_${string}`;
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
                userId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
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
                planId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `plan_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string";
                    data: `plan_${string}`;
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
                customerId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
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
                providerSubscriptionId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                    name: string;
                    tableName: "subscriptions";
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
                status: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"]>, "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid">>>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string enum";
                    data: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"];
                    identity: undefined;
                    generated: undefined;
                }>;
                currentPeriodStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>, {
                    name: string;
                    tableName: "subscriptions";
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
                currentPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>, {
                    name: string;
                    tableName: "subscriptions";
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
                trialStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                trialEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                canceledAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                cancelAtPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                    name: string;
                    tableName: "subscriptions";
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
                metadata: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                    name: string;
                    tableName: "subscriptions";
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
                createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "subscriptions";
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
                updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "subscriptions";
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
                version: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                    name: string;
                    tableName: "subscriptions";
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
        }>, import("@arki/journal").EventDef<"SubscriptionActivated", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCanceled", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCreated", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            providerSubscriptionId: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPastDue", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPaused", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionReactivated", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionResumed", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionSynced", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        resumeSubscription: import("@arki/journal").Command<z.ZodObject<{
            subscriptionId: z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `sub_${string}`, "out">, z.ZodTransform<`sub_${string}`, string & z.$brand<`sub_${string}`>>>;
            status: z.ZodDefault<z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>>;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
            name: "subscriptions";
            schema: string;
            columns: {
                id: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `sub_${string}`>>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string";
                    data: `sub_${string}`;
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
                userId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
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
                planId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `plan_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string";
                    data: `plan_${string}`;
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
                customerId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
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
                providerSubscriptionId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                    name: string;
                    tableName: "subscriptions";
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
                status: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"]>, "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid">>>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string enum";
                    data: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"];
                    identity: undefined;
                    generated: undefined;
                }>;
                currentPeriodStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>, {
                    name: string;
                    tableName: "subscriptions";
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
                currentPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>, {
                    name: string;
                    tableName: "subscriptions";
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
                trialStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                trialEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                canceledAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                cancelAtPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                    name: string;
                    tableName: "subscriptions";
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
                metadata: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                    name: string;
                    tableName: "subscriptions";
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
                createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "subscriptions";
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
                updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "subscriptions";
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
                version: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                    name: string;
                    tableName: "subscriptions";
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
        }>, import("@arki/journal").EventDef<"SubscriptionActivated", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCanceled", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCreated", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            providerSubscriptionId: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPastDue", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPaused", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionReactivated", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionResumed", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionSynced", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        markSubscriptionPastDue: import("@arki/journal").Command<z.ZodObject<{
            subscriptionId: z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `sub_${string}`, "out">, z.ZodTransform<`sub_${string}`, string & z.$brand<`sub_${string}`>>>;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
            name: "subscriptions";
            schema: string;
            columns: {
                id: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `sub_${string}`>>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string";
                    data: `sub_${string}`;
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
                userId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
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
                planId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `plan_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string";
                    data: `plan_${string}`;
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
                customerId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
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
                providerSubscriptionId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                    name: string;
                    tableName: "subscriptions";
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
                status: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"]>, "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid">>>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string enum";
                    data: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"];
                    identity: undefined;
                    generated: undefined;
                }>;
                currentPeriodStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>, {
                    name: string;
                    tableName: "subscriptions";
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
                currentPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>, {
                    name: string;
                    tableName: "subscriptions";
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
                trialStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                trialEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                canceledAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                cancelAtPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                    name: string;
                    tableName: "subscriptions";
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
                metadata: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                    name: string;
                    tableName: "subscriptions";
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
                createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "subscriptions";
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
                updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "subscriptions";
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
                version: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                    name: string;
                    tableName: "subscriptions";
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
        }>, import("@arki/journal").EventDef<"SubscriptionActivated", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCanceled", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCreated", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            providerSubscriptionId: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPastDue", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPaused", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionReactivated", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionResumed", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionSynced", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        activateSubscription: import("@arki/journal").Command<z.ZodObject<{
            subscriptionId: z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `sub_${string}`, "out">, z.ZodTransform<`sub_${string}`, string & z.$brand<`sub_${string}`>>>;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
            name: "subscriptions";
            schema: string;
            columns: {
                id: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `sub_${string}`>>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string";
                    data: `sub_${string}`;
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
                userId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
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
                planId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `plan_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string";
                    data: `plan_${string}`;
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
                customerId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                    name: string;
                    tableName: "subscriptions";
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
                providerSubscriptionId: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                    name: string;
                    tableName: "subscriptions";
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
                status: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"]>, "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid">>>, {
                    name: string;
                    tableName: "subscriptions";
                    dataType: "string enum";
                    data: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["active", "canceled", "incomplete", "incomplete_expired", "past_due", "paused", "trialing", "unpaid"];
                    identity: undefined;
                    generated: undefined;
                }>;
                currentPeriodStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>, {
                    name: string;
                    tableName: "subscriptions";
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
                currentPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>, {
                    name: string;
                    tableName: "subscriptions";
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
                trialStart: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                trialEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                canceledAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>, {
                    name: string;
                    tableName: "subscriptions";
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
                cancelAtPeriodEnd: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                    name: string;
                    tableName: "subscriptions";
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
                metadata: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                    name: string;
                    tableName: "subscriptions";
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
                createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "subscriptions";
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
                updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "subscriptions";
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
                version: import("drizzle-orm/pg-core").PgBuildColumn<"subscriptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                    name: string;
                    tableName: "subscriptions";
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
        }>, import("@arki/journal").EventDef<"SubscriptionActivated", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCanceled", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionCreated", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            providerSubscriptionId: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPastDue", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionPaused", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionReactivated", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionResumed", z.ZodObject<{
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"SubscriptionSynced", z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodISODateTime;
            currentPeriodEnd: z.ZodISODateTime;
            trialStart: z.ZodNullable<z.ZodISODateTime>;
            trialEnd: z.ZodNullable<z.ZodISODateTime>;
            canceledAt: z.ZodNullable<z.ZodISODateTime>;
            cancelAtPeriodEnd: z.ZodBoolean;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
    };
};
//# sourceMappingURL=subscription.d.ts.map