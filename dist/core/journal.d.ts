/**
 * Payments core on `@arki/journal`
 *
 * `createCoreJournal(j, { payments, subscriptions })` takes the app's journal
 * definitions and the app's two tables. It returns the entities, the events,
 * the commands, and `writes(run)`: plain async functions for the services.
 *
 * The package owns no database, no composed journal and no worker. The app
 * lists the tables in its schema and runs the commands through its own
 * command runner:
 *
 *   export const paymentsJournal = createCoreJournal(j, { payments, subscriptions });
 *   new SubscriptionManager(provider, repo, paymentsJournal.writes(context.runCommand));
 *
 * Every write of `payments` and `subscriptions` goes through one of these
 * commands. A rejected rule throws the `CommandError` of `@arki/journal`.
 */
import type { z } from '@arki/contracts';
import type { CommandRunner, JournalDefinitions, RootDb, TransactionSource } from '@arki/journal';
import type { CancelPaymentInput, CompletePaymentInput, FailPaymentInput, InitiatePaymentInput } from './journal/payment.js';
import type { ActivateSubscriptionInput, CancelSubscriptionInput, CreateSubscriptionInput, MarkSubscriptionPastDueInput, PauseSubscriptionInput, ReactivateSubscriptionInput, ResumeSubscriptionInput, SyncSubscriptionInput } from './journal/subscription.js';
import type { CoreTables } from './tables.js';
import type { Payment, Subscription } from './types.js';
export { cancelPaymentInputSchema, completePaymentInputSchema, failPaymentInputSchema, initiatePaymentInputSchema, } from './journal/payment.js';
export { activateSubscriptionInputSchema, cancelSubscriptionInputSchema, createSubscriptionInputSchema, markSubscriptionPastDueInputSchema, pauseSubscriptionInputSchema, reactivateSubscriptionInputSchema, resumeSubscriptionInputSchema, syncSubscriptionInputSchema, } from './journal/subscription.js';
export type { CancelPaymentInput, CompletePaymentInput, FailPaymentInput, InitiatePaymentInput, } from './journal/payment.js';
export type { ActivateSubscriptionInput, CancelSubscriptionInput, CreateSubscriptionInput, MarkSubscriptionPastDueInput, PauseSubscriptionInput, ReactivateSubscriptionInput, ResumeSubscriptionInput, SyncSubscriptionInput, } from './journal/subscription.js';
/**
 * What the services call to change a payment or a subscription. Each function
 * runs one command and returns the row as it is after the write.
 */
export type CoreWrites = {
    initiatePayment(input: InitiatePaymentInput): Promise<Payment>;
    completePayment(input: CompletePaymentInput): Promise<Payment>;
    failPayment(input: FailPaymentInput): Promise<Payment>;
    cancelPayment(input: CancelPaymentInput): Promise<Payment>;
    createSubscription(input: CreateSubscriptionInput): Promise<Subscription>;
    /** Create or update by the provider's subscription id. A delivery that changes nothing writes no event. */
    syncSubscription(input: SyncSubscriptionInput): Promise<Subscription>;
    cancelSubscription(input: CancelSubscriptionInput): Promise<Subscription>;
    reactivateSubscription(input: ReactivateSubscriptionInput): Promise<Subscription>;
    pauseSubscription(input: PauseSubscriptionInput): Promise<Subscription>;
    resumeSubscription(input: ResumeSubscriptionInput): Promise<Subscription>;
    markSubscriptionPastDue(input: MarkSubscriptionPastDueInput): Promise<Subscription>;
    activateSubscription(input: ActivateSubscriptionInput): Promise<Subscription>;
};
export declare function createCoreJournal<Meta extends z.ZodObject, Tx extends TransactionSource<Tx>, AppDb extends RootDb>(j: JournalDefinitions<Meta, Tx, AppDb>, tables: Pick<CoreTables, 'payments' | 'subscriptions'>): {
    entities: {
        payment: import("@arki/journal").OnOnlyEntityBuilder<"payment", import("drizzle-orm/pg-core").PgTableWithColumns<{
            name: "payments";
            schema: string;
            columns: {
                id: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `pay_${string}`>>, {
                    name: string;
                    tableName: "payments";
                    dataType: "string";
                    data: `pay_${string}`;
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
                subscriptionId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `sub_${string}`>, {
                    name: string;
                    tableName: "payments";
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
                userId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>, {
                    name: string;
                    tableName: "payments";
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
                customerId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                    name: string;
                    tableName: "payments";
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
                providerPaymentId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                    name: string;
                    tableName: "payments";
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
                amountMinor: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBigInt53Builder>, {
                    name: string;
                    tableName: "payments";
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
                currency: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, {
                    name: string;
                    tableName: "payments";
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
                status: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["pending", "processing", "succeeded", "failed", "canceled", "requires_action"]>, "canceled" | "failed" | "pending" | "processing" | "requires_action" | "succeeded">>>, {
                    name: string;
                    tableName: "payments";
                    dataType: "string enum";
                    data: "canceled" | "failed" | "pending" | "processing" | "requires_action" | "succeeded";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["pending", "processing", "succeeded", "failed", "canceled", "requires_action"];
                    identity: undefined;
                    generated: undefined;
                }>;
                paymentMethod: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["card", "bank_account", "paypal", "apple_pay", "google_pay"]>, "apple_pay" | "bank_account" | "card" | "google_pay" | "paypal">>>, {
                    name: string;
                    tableName: "payments";
                    dataType: "string enum";
                    data: "apple_pay" | "bank_account" | "card" | "google_pay" | "paypal";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["card", "bank_account", "paypal", "apple_pay", "google_pay"];
                    identity: undefined;
                    generated: undefined;
                }>;
                description: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                    name: string;
                    tableName: "payments";
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
                failureReason: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                    name: string;
                    tableName: "payments";
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
                receiptUrl: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                    name: string;
                    tableName: "payments";
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
                refunded: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                    name: string;
                    tableName: "payments";
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
                refundedAmountMinor: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBigInt53Builder>>, {
                    name: string;
                    tableName: "payments";
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
                metadata: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                    name: string;
                    tableName: "payments";
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
                createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "payments";
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
                updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "payments";
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
                version: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                    name: string;
                    tableName: "payments";
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
        }>, import("@arki/journal").EventDef<"PaymentCanceled", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentCompleted", z.ZodObject<{
            receiptUrl: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentFailed", z.ZodObject<{
            failureReason: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentInitiated", z.ZodObject<{
            subscriptionId: z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            providerPaymentId: z.ZodString;
            paymentMethod: z.ZodEnum<{
                apple_pay: "apple_pay";
                bank_account: "bank_account";
                card: "card";
                google_pay: "google_pay";
                paypal: "paypal";
            }>;
            description: z.ZodNullable<z.ZodString>;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            amount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentInitiatedV2", z.ZodObject<{
            subscriptionId: z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            providerPaymentId: z.ZodString;
            paymentMethod: z.ZodEnum<{
                apple_pay: "apple_pay";
                bank_account: "bank_account";
                card: "card";
                google_pay: "google_pay";
                paypal: "paypal";
            }>;
            description: z.ZodNullable<z.ZodString>;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            amount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>, z.infer<Meta>, "id", {
            subscriptionId: `sub_${string}` | null;
            userId: `usr_${string}`;
            customerId: `cust_${string}`;
            providerPaymentId: string;
            amountMinor: number;
            currency: string;
            status: 'pending';
            paymentMethod: "apple_pay" | "bank_account" | "card" | "google_pay" | "paypal";
            description: string | null;
            failureReason: null;
            receiptUrl: null;
            refunded: boolean;
            refundedAmountMinor: number;
            metadata: Record<string, unknown> | null;
            createdAt: import("temporal-spec").Temporal.Instant;
            updatedAt: import("temporal-spec").Temporal.Instant;
        }>;
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
    };
    events: {
        PaymentInitiated: import("@arki/journal").EventDef<"PaymentInitiated", z.ZodObject<{
            subscriptionId: z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            providerPaymentId: z.ZodString;
            paymentMethod: z.ZodEnum<{
                apple_pay: "apple_pay";
                bank_account: "bank_account";
                card: "card";
                google_pay: "google_pay";
                paypal: "paypal";
            }>;
            description: z.ZodNullable<z.ZodString>;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            amount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>>;
        PaymentInitiatedV2: import("@arki/journal").EventDef<"PaymentInitiatedV2", z.ZodObject<{
            subscriptionId: z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            providerPaymentId: z.ZodString;
            paymentMethod: z.ZodEnum<{
                apple_pay: "apple_pay";
                bank_account: "bank_account";
                card: "card";
                google_pay: "google_pay";
                paypal: "paypal";
            }>;
            description: z.ZodNullable<z.ZodString>;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            amount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        PaymentCompleted: import("@arki/journal").EventDef<"PaymentCompleted", z.ZodObject<{
            receiptUrl: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        PaymentFailed: import("@arki/journal").EventDef<"PaymentFailed", z.ZodObject<{
            failureReason: z.ZodString;
        }, z.core.$strip>>;
        PaymentCanceled: import("@arki/journal").EventDef<"PaymentCanceled", z.ZodObject<{}, z.core.$strip>>;
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
        initiatePayment: import("@arki/journal").Command<z.ZodObject<{
            paymentId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>>>;
            subscriptionId: z.ZodOptional<z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            providerPaymentId: z.ZodString;
            amount: z.ZodPipe<z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                amount: string;
                currency: string;
            }>>;
            paymentMethod: z.ZodDefault<z.ZodEnum<{
                apple_pay: "apple_pay";
                bank_account: "bank_account";
                card: "card";
                google_pay: "google_pay";
                paypal: "paypal";
            }>>;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
            name: "payments";
            schema: string;
            columns: {
                id: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `pay_${string}`>>, {
                    name: string;
                    tableName: "payments";
                    dataType: "string";
                    data: `pay_${string}`;
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
                subscriptionId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `sub_${string}`>, {
                    name: string;
                    tableName: "payments";
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
                userId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>, {
                    name: string;
                    tableName: "payments";
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
                customerId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                    name: string;
                    tableName: "payments";
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
                providerPaymentId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                    name: string;
                    tableName: "payments";
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
                amountMinor: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBigInt53Builder>, {
                    name: string;
                    tableName: "payments";
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
                currency: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, {
                    name: string;
                    tableName: "payments";
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
                status: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["pending", "processing", "succeeded", "failed", "canceled", "requires_action"]>, "canceled" | "failed" | "pending" | "processing" | "requires_action" | "succeeded">>>, {
                    name: string;
                    tableName: "payments";
                    dataType: "string enum";
                    data: "canceled" | "failed" | "pending" | "processing" | "requires_action" | "succeeded";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["pending", "processing", "succeeded", "failed", "canceled", "requires_action"];
                    identity: undefined;
                    generated: undefined;
                }>;
                paymentMethod: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["card", "bank_account", "paypal", "apple_pay", "google_pay"]>, "apple_pay" | "bank_account" | "card" | "google_pay" | "paypal">>>, {
                    name: string;
                    tableName: "payments";
                    dataType: "string enum";
                    data: "apple_pay" | "bank_account" | "card" | "google_pay" | "paypal";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["card", "bank_account", "paypal", "apple_pay", "google_pay"];
                    identity: undefined;
                    generated: undefined;
                }>;
                description: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                    name: string;
                    tableName: "payments";
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
                failureReason: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                    name: string;
                    tableName: "payments";
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
                receiptUrl: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                    name: string;
                    tableName: "payments";
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
                refunded: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                    name: string;
                    tableName: "payments";
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
                refundedAmountMinor: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBigInt53Builder>>, {
                    name: string;
                    tableName: "payments";
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
                metadata: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                    name: string;
                    tableName: "payments";
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
                createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "payments";
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
                updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "payments";
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
                version: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                    name: string;
                    tableName: "payments";
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
        }>, import("@arki/journal").EventDef<"PaymentCanceled", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentCompleted", z.ZodObject<{
            receiptUrl: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentFailed", z.ZodObject<{
            failureReason: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentInitiated", z.ZodObject<{
            subscriptionId: z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            providerPaymentId: z.ZodString;
            paymentMethod: z.ZodEnum<{
                apple_pay: "apple_pay";
                bank_account: "bank_account";
                card: "card";
                google_pay: "google_pay";
                paypal: "paypal";
            }>;
            description: z.ZodNullable<z.ZodString>;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            amount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentInitiatedV2", z.ZodObject<{
            subscriptionId: z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            providerPaymentId: z.ZodString;
            paymentMethod: z.ZodEnum<{
                apple_pay: "apple_pay";
                bank_account: "bank_account";
                card: "card";
                google_pay: "google_pay";
                paypal: "paypal";
            }>;
            description: z.ZodNullable<z.ZodString>;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            amount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        completePayment: import("@arki/journal").Command<z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            receiptUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
            name: "payments";
            schema: string;
            columns: {
                id: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `pay_${string}`>>, {
                    name: string;
                    tableName: "payments";
                    dataType: "string";
                    data: `pay_${string}`;
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
                subscriptionId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `sub_${string}`>, {
                    name: string;
                    tableName: "payments";
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
                userId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>, {
                    name: string;
                    tableName: "payments";
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
                customerId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                    name: string;
                    tableName: "payments";
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
                providerPaymentId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                    name: string;
                    tableName: "payments";
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
                amountMinor: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBigInt53Builder>, {
                    name: string;
                    tableName: "payments";
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
                currency: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, {
                    name: string;
                    tableName: "payments";
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
                status: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["pending", "processing", "succeeded", "failed", "canceled", "requires_action"]>, "canceled" | "failed" | "pending" | "processing" | "requires_action" | "succeeded">>>, {
                    name: string;
                    tableName: "payments";
                    dataType: "string enum";
                    data: "canceled" | "failed" | "pending" | "processing" | "requires_action" | "succeeded";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["pending", "processing", "succeeded", "failed", "canceled", "requires_action"];
                    identity: undefined;
                    generated: undefined;
                }>;
                paymentMethod: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["card", "bank_account", "paypal", "apple_pay", "google_pay"]>, "apple_pay" | "bank_account" | "card" | "google_pay" | "paypal">>>, {
                    name: string;
                    tableName: "payments";
                    dataType: "string enum";
                    data: "apple_pay" | "bank_account" | "card" | "google_pay" | "paypal";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["card", "bank_account", "paypal", "apple_pay", "google_pay"];
                    identity: undefined;
                    generated: undefined;
                }>;
                description: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                    name: string;
                    tableName: "payments";
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
                failureReason: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                    name: string;
                    tableName: "payments";
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
                receiptUrl: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                    name: string;
                    tableName: "payments";
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
                refunded: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                    name: string;
                    tableName: "payments";
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
                refundedAmountMinor: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBigInt53Builder>>, {
                    name: string;
                    tableName: "payments";
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
                metadata: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                    name: string;
                    tableName: "payments";
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
                createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "payments";
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
                updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "payments";
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
                version: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                    name: string;
                    tableName: "payments";
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
        }>, import("@arki/journal").EventDef<"PaymentCanceled", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentCompleted", z.ZodObject<{
            receiptUrl: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentFailed", z.ZodObject<{
            failureReason: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentInitiated", z.ZodObject<{
            subscriptionId: z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            providerPaymentId: z.ZodString;
            paymentMethod: z.ZodEnum<{
                apple_pay: "apple_pay";
                bank_account: "bank_account";
                card: "card";
                google_pay: "google_pay";
                paypal: "paypal";
            }>;
            description: z.ZodNullable<z.ZodString>;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            amount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentInitiatedV2", z.ZodObject<{
            subscriptionId: z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            providerPaymentId: z.ZodString;
            paymentMethod: z.ZodEnum<{
                apple_pay: "apple_pay";
                bank_account: "bank_account";
                card: "card";
                google_pay: "google_pay";
                paypal: "paypal";
            }>;
            description: z.ZodNullable<z.ZodString>;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            amount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        failPayment: import("@arki/journal").Command<z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            failureReason: z.ZodString;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
            name: "payments";
            schema: string;
            columns: {
                id: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `pay_${string}`>>, {
                    name: string;
                    tableName: "payments";
                    dataType: "string";
                    data: `pay_${string}`;
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
                subscriptionId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `sub_${string}`>, {
                    name: string;
                    tableName: "payments";
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
                userId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>, {
                    name: string;
                    tableName: "payments";
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
                customerId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                    name: string;
                    tableName: "payments";
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
                providerPaymentId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                    name: string;
                    tableName: "payments";
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
                amountMinor: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBigInt53Builder>, {
                    name: string;
                    tableName: "payments";
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
                currency: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, {
                    name: string;
                    tableName: "payments";
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
                status: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["pending", "processing", "succeeded", "failed", "canceled", "requires_action"]>, "canceled" | "failed" | "pending" | "processing" | "requires_action" | "succeeded">>>, {
                    name: string;
                    tableName: "payments";
                    dataType: "string enum";
                    data: "canceled" | "failed" | "pending" | "processing" | "requires_action" | "succeeded";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["pending", "processing", "succeeded", "failed", "canceled", "requires_action"];
                    identity: undefined;
                    generated: undefined;
                }>;
                paymentMethod: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["card", "bank_account", "paypal", "apple_pay", "google_pay"]>, "apple_pay" | "bank_account" | "card" | "google_pay" | "paypal">>>, {
                    name: string;
                    tableName: "payments";
                    dataType: "string enum";
                    data: "apple_pay" | "bank_account" | "card" | "google_pay" | "paypal";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["card", "bank_account", "paypal", "apple_pay", "google_pay"];
                    identity: undefined;
                    generated: undefined;
                }>;
                description: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                    name: string;
                    tableName: "payments";
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
                failureReason: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                    name: string;
                    tableName: "payments";
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
                receiptUrl: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                    name: string;
                    tableName: "payments";
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
                refunded: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                    name: string;
                    tableName: "payments";
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
                refundedAmountMinor: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBigInt53Builder>>, {
                    name: string;
                    tableName: "payments";
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
                metadata: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                    name: string;
                    tableName: "payments";
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
                createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "payments";
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
                updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "payments";
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
                version: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                    name: string;
                    tableName: "payments";
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
        }>, import("@arki/journal").EventDef<"PaymentCanceled", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentCompleted", z.ZodObject<{
            receiptUrl: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentFailed", z.ZodObject<{
            failureReason: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentInitiated", z.ZodObject<{
            subscriptionId: z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            providerPaymentId: z.ZodString;
            paymentMethod: z.ZodEnum<{
                apple_pay: "apple_pay";
                bank_account: "bank_account";
                card: "card";
                google_pay: "google_pay";
                paypal: "paypal";
            }>;
            description: z.ZodNullable<z.ZodString>;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            amount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentInitiatedV2", z.ZodObject<{
            subscriptionId: z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            providerPaymentId: z.ZodString;
            paymentMethod: z.ZodEnum<{
                apple_pay: "apple_pay";
                bank_account: "bank_account";
                card: "card";
                google_pay: "google_pay";
                paypal: "paypal";
            }>;
            description: z.ZodNullable<z.ZodString>;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            amount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        cancelPayment: import("@arki/journal").Command<z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
            name: "payments";
            schema: string;
            columns: {
                id: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `pay_${string}`>>, {
                    name: string;
                    tableName: "payments";
                    dataType: "string";
                    data: `pay_${string}`;
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
                subscriptionId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `sub_${string}`>, {
                    name: string;
                    tableName: "payments";
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
                userId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `usr_${string}`>, {
                    name: string;
                    tableName: "payments";
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
                customerId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `cust_${string}`>, {
                    name: string;
                    tableName: "payments";
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
                providerPaymentId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                    name: string;
                    tableName: "payments";
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
                amountMinor: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBigInt53Builder>, {
                    name: string;
                    tableName: "payments";
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
                currency: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, {
                    name: string;
                    tableName: "payments";
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
                status: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["pending", "processing", "succeeded", "failed", "canceled", "requires_action"]>, "canceled" | "failed" | "pending" | "processing" | "requires_action" | "succeeded">>>, {
                    name: string;
                    tableName: "payments";
                    dataType: "string enum";
                    data: "canceled" | "failed" | "pending" | "processing" | "requires_action" | "succeeded";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["pending", "processing", "succeeded", "failed", "canceled", "requires_action"];
                    identity: undefined;
                    generated: undefined;
                }>;
                paymentMethod: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["card", "bank_account", "paypal", "apple_pay", "google_pay"]>, "apple_pay" | "bank_account" | "card" | "google_pay" | "paypal">>>, {
                    name: string;
                    tableName: "payments";
                    dataType: "string enum";
                    data: "apple_pay" | "bank_account" | "card" | "google_pay" | "paypal";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["card", "bank_account", "paypal", "apple_pay", "google_pay"];
                    identity: undefined;
                    generated: undefined;
                }>;
                description: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                    name: string;
                    tableName: "payments";
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
                failureReason: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                    name: string;
                    tableName: "payments";
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
                receiptUrl: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                    name: string;
                    tableName: "payments";
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
                refunded: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                    name: string;
                    tableName: "payments";
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
                refundedAmountMinor: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBigInt53Builder>>, {
                    name: string;
                    tableName: "payments";
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
                metadata: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, Record<string, unknown>>, {
                    name: string;
                    tableName: "payments";
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
                createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "payments";
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
                updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                    dataType: 'custom';
                    data: import("temporal-spec").Temporal.Instant;
                    driverParam: string;
                }>>>, {
                    name: string;
                    tableName: "payments";
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
                version: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgIntegerBuilder>>, {
                    name: string;
                    tableName: "payments";
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
        }>, import("@arki/journal").EventDef<"PaymentCanceled", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentCompleted", z.ZodObject<{
            receiptUrl: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentFailed", z.ZodObject<{
            failureReason: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentInitiated", z.ZodObject<{
            subscriptionId: z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            providerPaymentId: z.ZodString;
            paymentMethod: z.ZodEnum<{
                apple_pay: "apple_pay";
                bank_account: "bank_account";
                card: "card";
                google_pay: "google_pay";
                paypal: "paypal";
            }>;
            description: z.ZodNullable<z.ZodString>;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            amount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentInitiatedV2", z.ZodObject<{
            subscriptionId: z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            providerPaymentId: z.ZodString;
            paymentMethod: z.ZodEnum<{
                apple_pay: "apple_pay";
                bank_account: "bank_account";
                card: "card";
                google_pay: "google_pay";
                paypal: "paypal";
            }>;
            description: z.ZodNullable<z.ZodString>;
            metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            amount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
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
    /** `run` is the app's command runner: `context.runCommand` in a request, `ctx.run` inside a command. */
    writes: (run: CommandRunner<z.output<Meta>, Tx>) => CoreWrites;
};
//# sourceMappingURL=journal.d.ts.map