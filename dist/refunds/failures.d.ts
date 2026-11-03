/**
 * No refund has this id.
 *
 * @fix Check the refund id.
 * @verify bun run test -- src/refunds
 */
export declare const RefundNotFound: import("@arki/failure").FailureDefinition<"payments.refund_not_found", import("@standard-schema/spec").StandardSchemaV1<{
    refundId: string;
}, {
    refundId: string;
}>>;
/**
 * The payment to refund does not exist. Nothing was written.
 *
 * @fix Check the payment id.
 * @verify bun run test -- src/refunds
 */
export declare const TransactionNotFound: import("@arki/failure").FailureDefinition<"payments.transaction_not_found", import("@standard-schema/spec").StandardSchemaV1<{
    paymentId: string;
}, {
    paymentId: string;
}>>;
/**
 * The payment already has a refund waiting for a decision. Nothing was written.
 *
 * @fix Approve or reject the pending refund first.
 * @verify bun run test -- src/refunds
 */
export declare const DuplicatePendingRefund: import("@arki/failure").FailureDefinition<"payments.duplicate_pending_refund", import("@standard-schema/spec").StandardSchemaV1<{
    paymentId: string;
}, {
    paymentId: string;
}>>;
/**
 * The refund was already decided, so it can no longer be approved or rejected. Nothing was written.
 *
 * @fix Read the refund again to see its decision. Only a pending refund can be approved or rejected.
 * @verify bun run test -- src/refunds
 */
export declare const RefundInvalidState: import("@arki/failure").FailureDefinition<"payments.refund_invalid_state", import("@standard-schema/spec").StandardSchemaV1<{
    refundId: string;
    status: string | null;
}, {
    refundId: string;
    status: string | null;
}>>;
/**
 * The refund and what the payment already gives back add up to more than was paid. Amounts are
 * decimal text in `currency`, such as `'12.50'`. Nothing was written.
 *
 * @fix Ask for at most the refundable amount.
 * @verify bun run test -- src/refunds
 */
export declare const RefundAmountExceeded: import("@arki/failure").FailureDefinition<"payments.refund_amount_exceeded", import("@standard-schema/spec").StandardSchemaV1<{
    paymentId: string;
    requested: string;
    refundable: string;
    currency: string;
}, {
    paymentId: string;
    requested: string;
    refundable: string;
    currency: string;
}>>;
/**
 * The payment is older than the refund window. Nothing was written.
 *
 * @fix Refund it outside this workflow, or not at all. The default window is 90 days (`refundWindowMs`).
 * @verify bun run test -- src/refunds
 */
export declare const RefundWindowExceeded: import("@arki/failure").FailureDefinition<"payments.refund_window_exceeded", import("@standard-schema/spec").StandardSchemaV1<{
    paymentId: string;
}, {
    paymentId: string;
}>>;
/**
 * The refund is in another currency than the payment. A refund pays back the payment's own money,
 * so it must be in the payment's currency. Nothing was written.
 *
 * @fix Ask for the refund in `paymentCurrency`.
 * @verify bun run test -- src/refunds
 */
export declare const RefundCurrencyMismatch: import("@arki/failure").FailureDefinition<"payments.refund_currency_mismatch", import("@standard-schema/spec").StandardSchemaV1<{
    paymentId: string;
    refundCurrency: string;
    paymentCurrency: string;
}, {
    paymentId: string;
    refundCurrency: string;
    paymentCurrency: string;
}>>;
//# sourceMappingURL=failures.d.ts.map