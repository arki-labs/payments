/**
 * Payment on the journal: its events, the entity and the commands
 *
 * One `payments` row is the current state of a payment, keyed by its id.
 * A payment starts `pending`, may wait in `requires_action` for the customer,
 * and ends `succeeded`, `failed` or `canceled`. A `failed` payment can still
 * succeed (the customer retried with the provider); a `succeeded` one never
 * fails.
 *
 * The command takes the amount as `Money` JSON (`{ amount: '19.99',
 * currency: 'USD' }`), and `PaymentInitiatedV2` keeps it in that form, exact.
 * The row holds it as whole minor units (`amount_minor`) beside `currency`.
 *
 * `PaymentInitiated` is the event written while `amount` was a `real` column:
 * a JS number of major units. No command writes it any more; it stays declared
 * so stored payments still replay. Its reducer rebuilds what the column
 * migration wrote: the `real` value (see `storedReal`), rounded half-even to
 * the currency's minor units.
 */
import type { JournalDefinitions, RootDb, TransactionSource } from '@arki/journal';
import { z } from '@arki/contracts';
import { Money } from '@arki/money';
import type { CoreTables } from '../tables.js';
export declare const initiatePaymentInputSchema: z.ZodObject<{
    paymentId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>>>;
    subscriptionId: z.ZodOptional<z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>>;
    userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
    providerPaymentId: z.ZodString;
    amount: z.ZodPipe<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>, z.ZodTransform<Money<string>, {
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
}, z.core.$strip>;
export declare const completePaymentInputSchema: z.ZodObject<{
    paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
    receiptUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const failPaymentInputSchema: z.ZodObject<{
    paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
    failureReason: z.ZodString;
}, z.core.$strip>;
export declare const cancelPaymentInputSchema: z.ZodObject<{
    paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
}, z.core.$strip>;
export declare const markPaymentRequiresActionInputSchema: z.ZodObject<{
    paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
}, z.core.$strip>;
/** `refundedAmount` is the total refunded so far, not this refund alone: a resent report writes nothing. */
export declare const recordPaymentRefundInputSchema: z.ZodObject<{
    paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
    refundedAmount: z.ZodPipe<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>, z.ZodTransform<Money<string>, {
        amount: string;
        currency: string;
    }>>;
}, z.core.$strip>;
export declare const recordPaymentDisputeInputSchema: z.ZodObject<{
    paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
    disputeId: z.ZodString;
    status: z.ZodString;
    reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type InitiatePaymentInput = z.input<typeof initiatePaymentInputSchema>;
export type CompletePaymentInput = z.input<typeof completePaymentInputSchema>;
export type FailPaymentInput = z.input<typeof failPaymentInputSchema>;
export type CancelPaymentInput = z.input<typeof cancelPaymentInputSchema>;
export type MarkPaymentRequiresActionInput = z.input<typeof markPaymentRequiresActionInputSchema>;
export type RecordPaymentRefundInput = z.input<typeof recordPaymentRefundInputSchema>;
export type RecordPaymentDisputeInput = z.input<typeof recordPaymentDisputeInputSchema>;
export declare function createPaymentJournal<Meta extends z.ZodObject, Tx extends TransactionSource<Tx>, AppDb extends RootDb>(j: JournalDefinitions<Meta, Tx, AppDb>, payments: CoreTables['payments']): {
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
            disputeId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
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
            disputeStatus: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
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
    }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentDisputeRecorded", z.ZodObject<{
        disputeId: z.ZodString;
        status: z.ZodString;
        reason: z.ZodNullable<z.ZodString>;
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
    }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentRefundRecorded", z.ZodObject<{
        refundedAmount: z.ZodObject<{
            amount: z.ZodString;
            currency: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentRequiresAction", z.ZodObject<{}, z.core.$strip>>, z.infer<Meta>, "id", {
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
        disputeId: null;
        disputeStatus: null;
        metadata: Record<string, unknown> | null;
        createdAt: import("temporal-spec").Temporal.Instant;
        updatedAt: import("temporal-spec").Temporal.Instant;
    }>;
    events: {
        PaymentRefundRecorded: import("@arki/journal").EventDef<"PaymentRefundRecorded", z.ZodObject<{
            refundedAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        PaymentDisputeRecorded: import("@arki/journal").EventDef<"PaymentDisputeRecorded", z.ZodObject<{
            disputeId: z.ZodString;
            status: z.ZodString;
            reason: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
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
        PaymentRequiresAction: import("@arki/journal").EventDef<"PaymentRequiresAction", z.ZodObject<{}, z.core.$strip>>;
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
            }, z.core.$strip>, z.ZodTransform<Money<string>, {
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
                disputeId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
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
                disputeStatus: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
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
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentDisputeRecorded", z.ZodObject<{
            disputeId: z.ZodString;
            status: z.ZodString;
            reason: z.ZodNullable<z.ZodString>;
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
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentRefundRecorded", z.ZodObject<{
            refundedAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentRequiresAction", z.ZodObject<{}, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
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
                disputeId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
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
                disputeStatus: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
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
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentDisputeRecorded", z.ZodObject<{
            disputeId: z.ZodString;
            status: z.ZodString;
            reason: z.ZodNullable<z.ZodString>;
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
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentRefundRecorded", z.ZodObject<{
            refundedAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentRequiresAction", z.ZodObject<{}, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
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
                disputeId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
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
                disputeStatus: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
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
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentDisputeRecorded", z.ZodObject<{
            disputeId: z.ZodString;
            status: z.ZodString;
            reason: z.ZodNullable<z.ZodString>;
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
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentRefundRecorded", z.ZodObject<{
            refundedAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentRequiresAction", z.ZodObject<{}, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
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
                disputeId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
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
                disputeStatus: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
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
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentDisputeRecorded", z.ZodObject<{
            disputeId: z.ZodString;
            status: z.ZodString;
            reason: z.ZodNullable<z.ZodString>;
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
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentRefundRecorded", z.ZodObject<{
            refundedAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentRequiresAction", z.ZodObject<{}, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        markPaymentRequiresAction: import("@arki/journal").Command<z.ZodObject<{
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
                disputeId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
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
                disputeStatus: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
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
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentDisputeRecorded", z.ZodObject<{
            disputeId: z.ZodString;
            status: z.ZodString;
            reason: z.ZodNullable<z.ZodString>;
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
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentRefundRecorded", z.ZodObject<{
            refundedAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentRequiresAction", z.ZodObject<{}, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        recordPaymentRefund: import("@arki/journal").Command<z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            refundedAmount: z.ZodPipe<z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>, z.ZodTransform<Money<string>, {
                amount: string;
                currency: string;
            }>>;
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
                disputeId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
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
                disputeStatus: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
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
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentDisputeRecorded", z.ZodObject<{
            disputeId: z.ZodString;
            status: z.ZodString;
            reason: z.ZodNullable<z.ZodString>;
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
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentRefundRecorded", z.ZodObject<{
            refundedAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentRequiresAction", z.ZodObject<{}, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        recordPaymentDispute: import("@arki/journal").Command<z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            disputeId: z.ZodString;
            status: z.ZodString;
            reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
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
                disputeId: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
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
                disputeStatus: import("drizzle-orm/pg-core").PgBuildColumn<"payments", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
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
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentDisputeRecorded", z.ZodObject<{
            disputeId: z.ZodString;
            status: z.ZodString;
            reason: z.ZodNullable<z.ZodString>;
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
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentRefundRecorded", z.ZodObject<{
            refundedAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"PaymentRequiresAction", z.ZodObject<{}, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
    };
};
//# sourceMappingURL=payment.d.ts.map