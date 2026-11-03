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
import type { CommandRunner, EventDef, JournalDefinitions, RootDb, TransactionSource } from '@arki/journal';
import type { SchemaOutput, StandardSchemaV1 } from '@arki/schema';
import { z } from '@arki/contracts';
import { CommandInvalid, CommandNotFound } from '@arki/journal';
import { Money } from '@arki/money';
import type { CoreTables } from '../core/tables.js';
import type { RefundsTables } from './tables.js';
import type { Refund } from './types.js';
import type { JournalWriteFailure } from '../core/journal/support.js';
import { RefundCurrencyMismatch } from './failures.js';
export declare const requestRefundInputSchema: z.ZodObject<{
    refundId: z.ZodOptional<z.ZodTemplateLiteral<`rfnd${string}`>>;
    paymentId: z.ZodTemplateLiteral<`pay${string}`>;
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
    refundId: z.ZodTemplateLiteral<`rfnd${string}`>;
    approvedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const rejectRefundInputSchema: z.ZodObject<{
    refundId: z.ZodTemplateLiteral<`rfnd${string}`>;
    rejectedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    rejectionReason: z.ZodString;
}, z.core.$strip>;
export declare const processRefundInputSchema: z.ZodObject<{
    refundId: z.ZodTemplateLiteral<`rfnd${string}`>;
}, z.core.$strip>;
export declare const completeRefundInputSchema: z.ZodObject<{
    refundId: z.ZodTemplateLiteral<`rfnd${string}`>;
    providerRefundId: z.ZodString;
    providerResponse: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const failRefundInputSchema: z.ZodObject<{
    refundId: z.ZodTemplateLiteral<`rfnd${string}`>;
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
 * command and returns the row after the write, or the command's canonical
 * schema, rule or transaction failure. An uncertain commit may already be durable.
 */
export type RefundWrites = {
    requestRefund: (input: RequestRefundInput) => Promise<Refund | JournalWriteFailure | CommandNotFound | CommandInvalid | ReturnType<typeof RefundCurrencyMismatch>>;
    approveRefund: (input: ApproveRefundInput) => Promise<Refund | JournalWriteFailure | CommandNotFound>;
    rejectRefund: (input: RejectRefundInput) => Promise<Refund | JournalWriteFailure | CommandNotFound>;
    processRefund: (input: ProcessRefundInput) => Promise<Refund | JournalWriteFailure | CommandNotFound>;
    completeRefund: (input: CompleteRefundInput) => Promise<Refund | JournalWriteFailure | CommandNotFound>;
    failRefund: (input: FailRefundInput) => Promise<Refund | JournalWriteFailure | CommandNotFound>;
};
declare const refundRequestedSchema: z.ZodObject<{
    paymentId: z.ZodTemplateLiteral<`pay${string}`>;
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
}, z.core.$strip>;
declare const refundRequestedV2Schema: z.ZodObject<{
    paymentId: z.ZodTemplateLiteral<`pay${string}`>;
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
}, z.core.$strip>;
declare const refundApprovedSchema: z.ZodObject<{
    approvedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
declare const refundRejectedSchema: z.ZodObject<{
    rejectedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    rejectionReason: z.ZodString;
}, z.core.$strip>;
declare const refundProcessedSchema: z.ZodObject<{}, z.core.$strip>;
declare const refundCompletedSchema: z.ZodObject<{
    providerRefundId: z.ZodString;
    providerResponse: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const refundFailedSchema: z.ZodObject<{
    errorMessage: z.ZodString;
}, z.core.$strip>;
/** Before minor units: a refund was asked for, its amounts JS numbers of major units. Replay only. */
export interface RefundRequestedEvent extends EventDef<'RefundRequested', typeof refundRequestedSchema> {
}
/** A refund was asked for. It is `pending`. Both amounts are exact `Money` JSON in the refund's currency. */
export interface RefundRequestedV2Event extends EventDef<'RefundRequestedV2', typeof refundRequestedV2Schema> {
}
/** A person approved the refund. `notes` is optional: refunds approved before approval notes existed have events without it. */
export interface RefundApprovedEvent extends EventDef<'RefundApproved', typeof refundApprovedSchema> {
}
/** A person rejected the refund. */
export interface RefundRejectedEvent extends EventDef<'RefundRejected', typeof refundRejectedSchema> {
}
/** The refund was handed to the provider. The provider's refund id is not known yet. */
export interface RefundProcessedEvent extends EventDef<'RefundProcessed', typeof refundProcessedSchema> {
}
/** The provider refunded the money. */
export interface RefundCompletedEvent extends EventDef<'RefundCompleted', typeof refundCompletedSchema> {
}
/** The provider could not refund the money. */
export interface RefundFailedEvent extends EventDef<'RefundFailed', typeof refundFailedSchema> {
}
export declare function createRefundsJournal<Meta extends StandardSchemaV1<unknown, Record<string, unknown>>, Tx extends TransactionSource<Tx>, AppDb extends RootDb>(j: JournalDefinitions<Meta, Tx, AppDb>, tables: Pick<RefundsTables, 'refunds'> & Pick<CoreTables, 'payments'>): {
    entities: {
        refund: import("@arki/journal").OnOnlyEntityBuilder<"refund", import("./tables.js").RefundsTable, RefundApprovedEvent | RefundCompletedEvent | RefundFailedEvent | RefundProcessedEvent | RefundRejectedEvent | RefundRequestedEvent | RefundRequestedV2Event, SchemaOutput<Meta>, "id", {
            paymentId: `pay${string}`;
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
        RefundRequested: RefundRequestedEvent;
        RefundRequestedV2: RefundRequestedV2Event;
        RefundApproved: RefundApprovedEvent;
        RefundRejected: RefundRejectedEvent;
        RefundProcessed: RefundProcessedEvent;
        RefundCompleted: RefundCompletedEvent;
        RefundFailed: RefundFailedEvent;
    };
    commands: {
        requestRefund: import("@arki/journal").Command<z.ZodObject<{
            refundId: z.ZodOptional<z.ZodTemplateLiteral<`rfnd${string}`>>;
            paymentId: z.ZodTemplateLiteral<`pay${string}`>;
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
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.invalid", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/failure").Failure<"payments.refund_currency_mismatch", {
            paymentId: string;
            refundCurrency: string;
            paymentCurrency: string;
        }> | import("@arki/journal").WriteResult<import("./tables.js").RefundsTable, RefundApprovedEvent | RefundCompletedEvent | RefundFailedEvent | RefundProcessedEvent | RefundRejectedEvent | RefundRequestedEvent | RefundRequestedV2Event, SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, SchemaOutput<Meta>, Tx, readonly [RefundRequestedV2Event], undefined>;
        approveRefund: import("@arki/journal").Command<z.ZodObject<{
            refundId: z.ZodTemplateLiteral<`rfnd${string}`>;
            approvedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("./tables.js").RefundsTable, RefundApprovedEvent | RefundCompletedEvent | RefundFailedEvent | RefundProcessedEvent | RefundRejectedEvent | RefundRequestedEvent | RefundRequestedV2Event, SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, SchemaOutput<Meta>, Tx, readonly [RefundApprovedEvent], undefined>;
        rejectRefund: import("@arki/journal").Command<z.ZodObject<{
            refundId: z.ZodTemplateLiteral<`rfnd${string}`>;
            rejectedBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            rejectionReason: z.ZodString;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("./tables.js").RefundsTable, RefundApprovedEvent | RefundCompletedEvent | RefundFailedEvent | RefundProcessedEvent | RefundRejectedEvent | RefundRequestedEvent | RefundRequestedV2Event, SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, SchemaOutput<Meta>, Tx, readonly [RefundRejectedEvent], undefined>;
        processRefund: import("@arki/journal").Command<z.ZodObject<{
            refundId: z.ZodTemplateLiteral<`rfnd${string}`>;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("./tables.js").RefundsTable, RefundApprovedEvent | RefundCompletedEvent | RefundFailedEvent | RefundProcessedEvent | RefundRejectedEvent | RefundRequestedEvent | RefundRequestedV2Event, SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, SchemaOutput<Meta>, Tx, readonly [RefundProcessedEvent], undefined>;
        completeRefund: import("@arki/journal").Command<z.ZodObject<{
            refundId: z.ZodTemplateLiteral<`rfnd${string}`>;
            providerRefundId: z.ZodString;
            providerResponse: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("./tables.js").RefundsTable, RefundApprovedEvent | RefundCompletedEvent | RefundFailedEvent | RefundProcessedEvent | RefundRejectedEvent | RefundRequestedEvent | RefundRequestedV2Event, SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, SchemaOutput<Meta>, Tx, readonly [RefundCompletedEvent], undefined>;
        failRefund: import("@arki/journal").Command<z.ZodObject<{
            refundId: z.ZodTemplateLiteral<`rfnd${string}`>;
            errorMessage: z.ZodString;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("./tables.js").RefundsTable, RefundApprovedEvent | RefundCompletedEvent | RefundFailedEvent | RefundProcessedEvent | RefundRejectedEvent | RefundRequestedEvent | RefundRequestedV2Event, SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, SchemaOutput<Meta>, Tx, readonly [RefundFailedEvent], undefined>;
    };
    /** `run` is the app's command runner: `context.runCommand` in a request, `ctx.run` inside a command. */
    writes: (run: CommandRunner<SchemaOutput<Meta>, Tx>) => RefundWrites;
};
export {};
//# sourceMappingURL=journal.d.ts.map