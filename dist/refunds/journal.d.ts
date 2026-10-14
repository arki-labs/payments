/**
 * Refunds on `@arki/journal`
 *
 * `createRefundsJournal(j, { refunds })` takes the app's journal definitions
 * and the app's `refunds` table. It returns the entity, the events, the
 * commands, and `writes(run)`: plain async functions for `RefundService`.
 *
 * A refund goes: requested (`pending`) → approved or rejected → processing →
 * completed or failed. Every step is one command and one event.
 *
 * Who approved, rejected or requested is command input, not journal metadata:
 * the metadata belongs to the app, and these are columns of the row anyway.
 *
 * Event data is plain JSON. Times come from `e.recordedAt`. Commands take
 * amounts as `Money` JSON (`{ amount: '25.50', currency: 'EUR' }`) and check
 * them exactly. `RefundRequestedV2` keeps them in that form; the row holds
 * whole minor units (`*_amount_minor`) beside `currency`.
 *
 * `RefundRequested` is the event written while the amounts were
 * `decimal(10,2)` columns: JS numbers of major units. No command writes it any
 * more; it stays declared so stored refunds still replay. Its reducer rebuilds
 * what the column migration wrote: the two-decimal text the column held,
 * rounded half-even to the currency's minor units.
 */
import type { CommandRunner, JournalDefinitions, RootDb, TransactionSource } from '@arki/journal';
import { z } from '@arki/contracts';
import { Money } from '@arki/money';
import type { CoreTables } from '../core/tables.js';
import type { RefundsTables } from './tables.js';
import type { Refund } from './types.js';
export declare const requestRefundInputSchema: z.ZodObject<{
    refundId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`rfnd_${string}`, string>>>;
    paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
    originalAmount: z.ZodPipe<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>, z.ZodTransform<Money<string>, {
        amount: string;
        currency: string;
    }>>;
    refundAmount: z.ZodPipe<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>, z.ZodTransform<Money<string>, {
        amount: string;
        currency: string;
    }>>;
    reason: z.ZodEnum<{
        billing_error: "billing_error";
        chargeback_prevention: "chargeback_prevention";
        customer_request: "customer_request";
        duplicate_charge: "duplicate_charge";
        fraudulent_transaction: "fraudulent_transaction";
        goodwill_gesture: "goodwill_gesture";
        other: "other";
        service_not_delivered: "service_not_delivered";
        technical_issue: "technical_issue";
    }>;
    customerNote: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    internalNotes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const approveRefundInputSchema: z.ZodObject<{
    refundId: z.ZodPipe<z.ZodString, z.ZodTransform<`rfnd_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `rfnd_${string}`, "out">, z.ZodTransform<`rfnd_${string}`, string & z.$brand<`rfnd_${string}`>>>;
    approvedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const rejectRefundInputSchema: z.ZodObject<{
    refundId: z.ZodPipe<z.ZodString, z.ZodTransform<`rfnd_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `rfnd_${string}`, "out">, z.ZodTransform<`rfnd_${string}`, string & z.$brand<`rfnd_${string}`>>>;
    rejectedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    rejectionReason: z.ZodString;
}, z.core.$strip>;
export declare const processRefundInputSchema: z.ZodObject<{
    refundId: z.ZodPipe<z.ZodString, z.ZodTransform<`rfnd_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `rfnd_${string}`, "out">, z.ZodTransform<`rfnd_${string}`, string & z.$brand<`rfnd_${string}`>>>;
}, z.core.$strip>;
export declare const completeRefundInputSchema: z.ZodObject<{
    refundId: z.ZodPipe<z.ZodString, z.ZodTransform<`rfnd_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `rfnd_${string}`, "out">, z.ZodTransform<`rfnd_${string}`, string & z.$brand<`rfnd_${string}`>>>;
    providerRefundId: z.ZodString;
    providerResponse: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const failRefundInputSchema: z.ZodObject<{
    refundId: z.ZodPipe<z.ZodString, z.ZodTransform<`rfnd_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `rfnd_${string}`, "out">, z.ZodTransform<`rfnd_${string}`, string & z.$brand<`rfnd_${string}`>>>;
    errorMessage: z.ZodString;
}, z.core.$strip>;
export type RequestRefundInput = z.input<typeof requestRefundInputSchema>;
export type ApproveRefundInput = z.input<typeof approveRefundInputSchema>;
export type RejectRefundInput = z.input<typeof rejectRefundInputSchema>;
export type ProcessRefundInput = z.input<typeof processRefundInputSchema>;
export type CompleteRefundInput = z.input<typeof completeRefundInputSchema>;
export type FailRefundInput = z.input<typeof failRefundInputSchema>;
/**
 * What `RefundService` calls to change a refund. Each function runs one
 * command and returns the row as it is after the write.
 */
export type RefundWrites = {
    requestRefund(input: RequestRefundInput): Promise<Refund>;
    approveRefund(input: ApproveRefundInput): Promise<Refund>;
    rejectRefund(input: RejectRefundInput): Promise<Refund>;
    processRefund(input: ProcessRefundInput): Promise<Refund>;
    completeRefund(input: CompleteRefundInput): Promise<Refund>;
    failRefund(input: FailRefundInput): Promise<Refund>;
};
export declare function createRefundsJournal<Meta extends z.ZodObject, Tx extends TransactionSource<Tx>, AppDb extends RootDb>(j: JournalDefinitions<Meta, Tx, AppDb>, tables: Pick<RefundsTables, 'refunds'> & Pick<CoreTables, 'payments'>): {
    entities: {
        refund: import("@arki/journal").OnOnlyEntityBuilder<"refund", import("drizzle-orm/pg-core").PgTableWithColumns<{
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
                approvalNotes: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
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
        }>, import("@arki/journal").EventDef<"RefundApproved", z.ZodObject<{
            approvedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundCompleted", z.ZodObject<{
            providerRefundId: z.ZodString;
            providerResponse: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundFailed", z.ZodObject<{
            errorMessage: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundProcessed", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRejected", z.ZodObject<{
            rejectedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            rejectionReason: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRequested", z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodNullable<z.ZodString>;
            internalNotes: z.ZodNullable<z.ZodString>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodNullable<z.ZodString>;
            originalAmount: z.ZodNumber;
            refundAmount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRequestedV2", z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodNullable<z.ZodString>;
            internalNotes: z.ZodNullable<z.ZodString>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodNullable<z.ZodString>;
            originalAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
            refundAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>, z.infer<Meta>, "id", {
            paymentId: `pay_${string}`;
            originalAmountMinor: number;
            refundAmountMinor: number;
            currency: string;
            reason: "billing_error" | "chargeback_prevention" | "customer_request" | "duplicate_charge" | "fraudulent_transaction" | "goodwill_gesture" | "other" | "service_not_delivered" | "technical_issue";
            status: 'pending';
            providerRefundId: null;
            providerResponse: null;
            requestedBy: `usr_${string}`;
            approvedBy: null;
            rejectedBy: null;
            rejectionReason: null;
            approvalNotes: null;
            requestedAt: import("temporal-spec").Temporal.Instant;
            approvedAt: null;
            processedAt: null;
            completedAt: null;
            internalNotes: string | null;
            customerNote: string | null;
            metadata: string | null;
            createdAt: import("temporal-spec").Temporal.Instant;
            updatedAt: import("temporal-spec").Temporal.Instant;
        }>;
    };
    events: {
        RefundRequested: import("@arki/journal").EventDef<"RefundRequested", z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodNullable<z.ZodString>;
            internalNotes: z.ZodNullable<z.ZodString>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodNullable<z.ZodString>;
            originalAmount: z.ZodNumber;
            refundAmount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>>;
        RefundRequestedV2: import("@arki/journal").EventDef<"RefundRequestedV2", z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodNullable<z.ZodString>;
            internalNotes: z.ZodNullable<z.ZodString>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodNullable<z.ZodString>;
            originalAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
            refundAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        RefundApproved: import("@arki/journal").EventDef<"RefundApproved", z.ZodObject<{
            approvedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>;
        RefundRejected: import("@arki/journal").EventDef<"RefundRejected", z.ZodObject<{
            rejectedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            rejectionReason: z.ZodString;
        }, z.core.$strip>>;
        RefundProcessed: import("@arki/journal").EventDef<"RefundProcessed", z.ZodObject<{}, z.core.$strip>>;
        RefundCompleted: import("@arki/journal").EventDef<"RefundCompleted", z.ZodObject<{
            providerRefundId: z.ZodString;
            providerResponse: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        RefundFailed: import("@arki/journal").EventDef<"RefundFailed", z.ZodObject<{
            errorMessage: z.ZodString;
        }, z.core.$strip>>;
    };
    commands: {
        requestRefund: import("@arki/journal").Command<z.ZodObject<{
            refundId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`rfnd_${string}`, string>>>;
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            originalAmount: z.ZodPipe<z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>, z.ZodTransform<Money<string>, {
                amount: string;
                currency: string;
            }>>;
            refundAmount: z.ZodPipe<z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>, z.ZodTransform<Money<string>, {
                amount: string;
                currency: string;
            }>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            internalNotes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
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
                approvalNotes: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
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
        }>, import("@arki/journal").EventDef<"RefundApproved", z.ZodObject<{
            approvedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundCompleted", z.ZodObject<{
            providerRefundId: z.ZodString;
            providerResponse: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundFailed", z.ZodObject<{
            errorMessage: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundProcessed", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRejected", z.ZodObject<{
            rejectedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            rejectionReason: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRequested", z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodNullable<z.ZodString>;
            internalNotes: z.ZodNullable<z.ZodString>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodNullable<z.ZodString>;
            originalAmount: z.ZodNumber;
            refundAmount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRequestedV2", z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodNullable<z.ZodString>;
            internalNotes: z.ZodNullable<z.ZodString>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodNullable<z.ZodString>;
            originalAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
            refundAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        approveRefund: import("@arki/journal").Command<z.ZodObject<{
            refundId: z.ZodPipe<z.ZodString, z.ZodTransform<`rfnd_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `rfnd_${string}`, "out">, z.ZodTransform<`rfnd_${string}`, string & z.$brand<`rfnd_${string}`>>>;
            approvedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
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
                approvalNotes: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
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
        }>, import("@arki/journal").EventDef<"RefundApproved", z.ZodObject<{
            approvedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundCompleted", z.ZodObject<{
            providerRefundId: z.ZodString;
            providerResponse: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundFailed", z.ZodObject<{
            errorMessage: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundProcessed", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRejected", z.ZodObject<{
            rejectedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            rejectionReason: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRequested", z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodNullable<z.ZodString>;
            internalNotes: z.ZodNullable<z.ZodString>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodNullable<z.ZodString>;
            originalAmount: z.ZodNumber;
            refundAmount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRequestedV2", z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodNullable<z.ZodString>;
            internalNotes: z.ZodNullable<z.ZodString>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodNullable<z.ZodString>;
            originalAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
            refundAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        rejectRefund: import("@arki/journal").Command<z.ZodObject<{
            refundId: z.ZodPipe<z.ZodString, z.ZodTransform<`rfnd_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `rfnd_${string}`, "out">, z.ZodTransform<`rfnd_${string}`, string & z.$brand<`rfnd_${string}`>>>;
            rejectedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            rejectionReason: z.ZodString;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
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
                approvalNotes: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
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
        }>, import("@arki/journal").EventDef<"RefundApproved", z.ZodObject<{
            approvedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundCompleted", z.ZodObject<{
            providerRefundId: z.ZodString;
            providerResponse: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundFailed", z.ZodObject<{
            errorMessage: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundProcessed", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRejected", z.ZodObject<{
            rejectedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            rejectionReason: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRequested", z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodNullable<z.ZodString>;
            internalNotes: z.ZodNullable<z.ZodString>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodNullable<z.ZodString>;
            originalAmount: z.ZodNumber;
            refundAmount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRequestedV2", z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodNullable<z.ZodString>;
            internalNotes: z.ZodNullable<z.ZodString>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodNullable<z.ZodString>;
            originalAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
            refundAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        processRefund: import("@arki/journal").Command<z.ZodObject<{
            refundId: z.ZodPipe<z.ZodString, z.ZodTransform<`rfnd_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `rfnd_${string}`, "out">, z.ZodTransform<`rfnd_${string}`, string & z.$brand<`rfnd_${string}`>>>;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
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
                approvalNotes: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
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
        }>, import("@arki/journal").EventDef<"RefundApproved", z.ZodObject<{
            approvedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundCompleted", z.ZodObject<{
            providerRefundId: z.ZodString;
            providerResponse: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundFailed", z.ZodObject<{
            errorMessage: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundProcessed", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRejected", z.ZodObject<{
            rejectedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            rejectionReason: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRequested", z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodNullable<z.ZodString>;
            internalNotes: z.ZodNullable<z.ZodString>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodNullable<z.ZodString>;
            originalAmount: z.ZodNumber;
            refundAmount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRequestedV2", z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodNullable<z.ZodString>;
            internalNotes: z.ZodNullable<z.ZodString>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodNullable<z.ZodString>;
            originalAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
            refundAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        completeRefund: import("@arki/journal").Command<z.ZodObject<{
            refundId: z.ZodPipe<z.ZodString, z.ZodTransform<`rfnd_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `rfnd_${string}`, "out">, z.ZodTransform<`rfnd_${string}`, string & z.$brand<`rfnd_${string}`>>>;
            providerRefundId: z.ZodString;
            providerResponse: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
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
                approvalNotes: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
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
        }>, import("@arki/journal").EventDef<"RefundApproved", z.ZodObject<{
            approvedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundCompleted", z.ZodObject<{
            providerRefundId: z.ZodString;
            providerResponse: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundFailed", z.ZodObject<{
            errorMessage: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundProcessed", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRejected", z.ZodObject<{
            rejectedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            rejectionReason: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRequested", z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodNullable<z.ZodString>;
            internalNotes: z.ZodNullable<z.ZodString>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodNullable<z.ZodString>;
            originalAmount: z.ZodNumber;
            refundAmount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRequestedV2", z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodNullable<z.ZodString>;
            internalNotes: z.ZodNullable<z.ZodString>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodNullable<z.ZodString>;
            originalAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
            refundAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
        failRefund: import("@arki/journal").Command<z.ZodObject<{
            refundId: z.ZodPipe<z.ZodString, z.ZodTransform<`rfnd_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `rfnd_${string}`, "out">, z.ZodTransform<`rfnd_${string}`, string & z.$brand<`rfnd_${string}`>>>;
            errorMessage: z.ZodString;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("drizzle-orm/pg-core").PgTableWithColumns<{
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
                approvalNotes: import("drizzle-orm/pg-core").PgBuildColumn<"refunds", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
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
        }>, import("@arki/journal").EventDef<"RefundApproved", z.ZodObject<{
            approvedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundCompleted", z.ZodObject<{
            providerRefundId: z.ZodString;
            providerResponse: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundFailed", z.ZodObject<{
            errorMessage: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundProcessed", z.ZodObject<{}, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRejected", z.ZodObject<{
            rejectedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            rejectionReason: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRequested", z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodNullable<z.ZodString>;
            internalNotes: z.ZodNullable<z.ZodString>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodNullable<z.ZodString>;
            originalAmount: z.ZodNumber;
            refundAmount: z.ZodNumber;
            currency: z.ZodString;
        }, z.core.$strip>> | import("@arki/journal").EventDef<"RefundRequestedV2", z.ZodObject<{
            paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
            reason: z.ZodEnum<{
                billing_error: "billing_error";
                chargeback_prevention: "chargeback_prevention";
                customer_request: "customer_request";
                duplicate_charge: "duplicate_charge";
                fraudulent_transaction: "fraudulent_transaction";
                goodwill_gesture: "goodwill_gesture";
                other: "other";
                service_not_delivered: "service_not_delivered";
                technical_issue: "technical_issue";
            }>;
            customerNote: z.ZodNullable<z.ZodString>;
            internalNotes: z.ZodNullable<z.ZodString>;
            requestedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            metadata: z.ZodNullable<z.ZodString>;
            originalAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
            refundAmount: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>, z.infer<Meta>, "id">>, z.infer<Meta>, Tx>;
    };
    /** `run` is the app's command runner: `context.runCommand` in a request, `ctx.run` inside a command. */
    writes: (run: CommandRunner<z.output<Meta>, Tx>) => RefundWrites;
};
//# sourceMappingURL=journal.d.ts.map