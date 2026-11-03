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
import type { EventDef, JournalDefinitions, RootDb, TransactionSource } from '@arki/journal';
import type { StandardSchemaV1 } from '@arki/schema';
import { z } from '@arki/contracts';
import { Money } from '@arki/money';
import type { CoreTables } from '../tables.js';
export declare const initiatePaymentInputSchema: z.ZodObject<{
    paymentId: z.ZodOptional<z.ZodTemplateLiteral<`pay${string}`>>;
    subscriptionId: z.ZodOptional<z.ZodNullable<z.ZodTemplateLiteral<`sub${string}`>>>;
    userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    customerId: z.ZodTemplateLiteral<`cust${string}`>;
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
    paymentId: z.ZodTemplateLiteral<`pay${string}`>;
    receiptUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const failPaymentInputSchema: z.ZodObject<{
    paymentId: z.ZodTemplateLiteral<`pay${string}`>;
    failureReason: z.ZodString;
}, z.core.$strip>;
export declare const cancelPaymentInputSchema: z.ZodObject<{
    paymentId: z.ZodTemplateLiteral<`pay${string}`>;
}, z.core.$strip>;
export declare const markPaymentRequiresActionInputSchema: z.ZodObject<{
    paymentId: z.ZodTemplateLiteral<`pay${string}`>;
}, z.core.$strip>;
/** `refundedAmount` is the total refunded so far, not this refund alone: a resent report writes nothing. */
export declare const recordPaymentRefundInputSchema: z.ZodObject<{
    paymentId: z.ZodTemplateLiteral<`pay${string}`>;
    refundedAmount: z.ZodPipe<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>, z.ZodTransform<Money<string>, {
        amount: string;
        currency: string;
    }>>;
}, z.core.$strip>;
export declare const recordPaymentDisputeInputSchema: z.ZodObject<{
    paymentId: z.ZodTemplateLiteral<`pay${string}`>;
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
declare const paymentInitiatedSchema: z.ZodObject<{
    subscriptionId: z.ZodNullable<z.ZodTemplateLiteral<`sub${string}`>>;
    userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    customerId: z.ZodTemplateLiteral<`cust${string}`>;
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
}, z.core.$strip>;
declare const paymentInitiatedV2Schema: z.ZodObject<{
    subscriptionId: z.ZodNullable<z.ZodTemplateLiteral<`sub${string}`>>;
    userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    customerId: z.ZodTemplateLiteral<`cust${string}`>;
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
}, z.core.$strip>;
declare const paymentCompletedSchema: z.ZodObject<{
    receiptUrl: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const paymentFailedSchema: z.ZodObject<{
    failureReason: z.ZodString;
}, z.core.$strip>;
declare const paymentCanceledSchema: z.ZodObject<{}, z.core.$strip>;
declare const paymentRequiresActionSchema: z.ZodObject<{}, z.core.$strip>;
declare const paymentRefundRecordedSchema: z.ZodObject<{
    refundedAmount: z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const paymentDisputeRecordedSchema: z.ZodObject<{
    disputeId: z.ZodString;
    status: z.ZodString;
    reason: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
/** Before minor units: a payment was started, its amount a JS number of major units. Replay only. */
export interface PaymentInitiatedEvent extends EventDef<'PaymentInitiated', typeof paymentInitiatedSchema> {
}
/** A payment was started with the provider. It is `pending`. The amount is exact `Money` JSON. */
export interface PaymentInitiatedV2Event extends EventDef<'PaymentInitiatedV2', typeof paymentInitiatedV2Schema> {
}
/** The provider collected the money. */
export interface PaymentCompletedEvent extends EventDef<'PaymentCompleted', typeof paymentCompletedSchema> {
}
/** The provider could not collect the money. */
export interface PaymentFailedEvent extends EventDef<'PaymentFailed', typeof paymentFailedSchema> {
}
/** The payment was canceled before it finished. */
export interface PaymentCanceledEvent extends EventDef<'PaymentCanceled', typeof paymentCanceledSchema> {
}
/** The provider needs the customer to act (for example 3-D Secure) before the payment can finish. */
export interface PaymentRequiresActionEvent extends EventDef<'PaymentRequiresAction', typeof paymentRequiresActionSchema> {
}
/** The provider refunded part or all of the payment. `refundedAmount` is the exact total refunded so far, as `Money` JSON. */
export interface PaymentRefundRecordedEvent extends EventDef<'PaymentRefundRecorded', typeof paymentRefundRecordedSchema> {
}
/** The customer's bank opened a dispute on the payment, or the dispute changed status. */
export interface PaymentDisputeRecordedEvent extends EventDef<'PaymentDisputeRecorded', typeof paymentDisputeRecordedSchema> {
}
export declare function createPaymentJournal<Meta extends StandardSchemaV1<unknown, Record<string, unknown>>, Tx extends TransactionSource<Tx>, AppDb extends RootDb>(j: JournalDefinitions<Meta, Tx, AppDb>, payments: CoreTables['payments']): {
    payment: import("@arki/journal").OnOnlyEntityBuilder<"payment", import("../tables.js").PaymentsTable, PaymentCanceledEvent | PaymentCompletedEvent | PaymentDisputeRecordedEvent | PaymentFailedEvent | PaymentInitiatedEvent | PaymentInitiatedV2Event | PaymentRefundRecordedEvent | PaymentRequiresActionEvent, import("@arki/schema").SchemaOutput<Meta>, "id", {
        subscriptionId: `sub${string}` | null;
        userId: `usr_${string}`;
        customerId: `cust${string}`;
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
        PaymentRefundRecorded: PaymentRefundRecordedEvent;
        PaymentDisputeRecorded: PaymentDisputeRecordedEvent;
        PaymentInitiated: PaymentInitiatedEvent;
        PaymentInitiatedV2: PaymentInitiatedV2Event;
        PaymentCompleted: PaymentCompletedEvent;
        PaymentFailed: PaymentFailedEvent;
        PaymentCanceled: PaymentCanceledEvent;
        PaymentRequiresAction: PaymentRequiresActionEvent;
    };
    commands: {
        initiatePayment: import("@arki/journal").Command<z.ZodObject<{
            paymentId: z.ZodOptional<z.ZodTemplateLiteral<`pay${string}`>>;
            subscriptionId: z.ZodOptional<z.ZodNullable<z.ZodTemplateLiteral<`sub${string}`>>>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            customerId: z.ZodTemplateLiteral<`cust${string}`>;
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
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("../tables.js").PaymentsTable, PaymentCanceledEvent | PaymentCompletedEvent | PaymentDisputeRecordedEvent | PaymentFailedEvent | PaymentInitiatedEvent | PaymentInitiatedV2Event | PaymentRefundRecordedEvent | PaymentRequiresActionEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure> | import("@arki/contracts").IdGenerationFailure, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [PaymentInitiatedV2Event], undefined>;
        completePayment: import("@arki/journal").Command<z.ZodObject<{
            paymentId: z.ZodTemplateLiteral<`pay${string}`>;
            receiptUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("../tables.js").PaymentsTable, PaymentCanceledEvent | PaymentCompletedEvent | PaymentDisputeRecordedEvent | PaymentFailedEvent | PaymentInitiatedEvent | PaymentInitiatedV2Event | PaymentRefundRecordedEvent | PaymentRequiresActionEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [PaymentCompletedEvent], undefined>;
        failPayment: import("@arki/journal").Command<z.ZodObject<{
            paymentId: z.ZodTemplateLiteral<`pay${string}`>;
            failureReason: z.ZodString;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("../tables.js").PaymentsTable, PaymentCanceledEvent | PaymentCompletedEvent | PaymentDisputeRecordedEvent | PaymentFailedEvent | PaymentInitiatedEvent | PaymentInitiatedV2Event | PaymentRefundRecordedEvent | PaymentRequiresActionEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [PaymentFailedEvent], undefined>;
        cancelPayment: import("@arki/journal").Command<z.ZodObject<{
            paymentId: z.ZodTemplateLiteral<`pay${string}`>;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("../tables.js").PaymentsTable, PaymentCanceledEvent | PaymentCompletedEvent | PaymentDisputeRecordedEvent | PaymentFailedEvent | PaymentInitiatedEvent | PaymentInitiatedV2Event | PaymentRefundRecordedEvent | PaymentRequiresActionEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [PaymentCanceledEvent], undefined>;
        markPaymentRequiresAction: import("@arki/journal").Command<z.ZodObject<{
            paymentId: z.ZodTemplateLiteral<`pay${string}`>;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("../tables.js").PaymentsTable, PaymentCanceledEvent | PaymentCompletedEvent | PaymentDisputeRecordedEvent | PaymentFailedEvent | PaymentInitiatedEvent | PaymentInitiatedV2Event | PaymentRefundRecordedEvent | PaymentRequiresActionEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [PaymentRequiresActionEvent], undefined>;
        recordPaymentRefund: import("@arki/journal").Command<z.ZodObject<{
            paymentId: z.ZodTemplateLiteral<`pay${string}`>;
            refundedAmount: z.ZodPipe<z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>, z.ZodTransform<Money<string>, {
                amount: string;
                currency: string;
            }>>;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.invalid", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("../tables.js").PaymentsTable, PaymentCanceledEvent | PaymentCompletedEvent | PaymentDisputeRecordedEvent | PaymentFailedEvent | PaymentInitiatedEvent | PaymentInitiatedV2Event | PaymentRefundRecordedEvent | PaymentRequiresActionEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [PaymentRefundRecordedEvent], undefined>;
        recordPaymentDispute: import("@arki/journal").Command<z.ZodObject<{
            paymentId: z.ZodTemplateLiteral<`pay${string}`>;
            disputeId: z.ZodString;
            status: z.ZodString;
            reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("../tables.js").PaymentsTable, PaymentCanceledEvent | PaymentCompletedEvent | PaymentDisputeRecordedEvent | PaymentFailedEvent | PaymentInitiatedEvent | PaymentInitiatedV2Event | PaymentRefundRecordedEvent | PaymentRequiresActionEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [PaymentDisputeRecordedEvent], undefined>;
    };
};
/** What `createPaymentJournal` returns for one app's journal definitions. */
export type PaymentJournal<Meta extends StandardSchemaV1<unknown, Record<string, unknown>>, Tx extends TransactionSource<Tx>, AppDb extends RootDb> = ReturnType<typeof createPaymentJournal<Meta, Tx, AppDb>>;
export {};
//# sourceMappingURL=payment.d.ts.map