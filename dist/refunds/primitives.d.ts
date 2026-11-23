import type { IdOf } from '@arki/contracts';
export type RefundId = IdOf<typeof refundIdFactoryInstance>;
declare const refundIdFactoryInstance: import("@arki/contracts").IdDeclaration<"rfnd">;
export declare const createRefundId: () => `rfnd${string}` | import("@arki/contracts").IdGenerationFailure;
/**
 * A refund id a command can store. Beyond the `rfnd` prefix it holds no U+0000 (the `refunds` row refuses it with
 * SQLSTATE 22021), no more characters than an id column holds, and no lone surrogate (the journal refuses an unpaired one in an entity id), so such an id is
 * `schema.invalid_input` before any query.
 */
export declare const refundIdSchema: import("@arki/contracts").ZodTemplateLiteral<`rfnd${string}`>;
export declare const refundIdFactory: import("@arki/contracts").IdDeclaration<"rfnd">;
export declare const refundReasonValues: readonly ['customer_request', 'duplicate_charge', 'fraudulent_transaction', 'service_not_delivered', 'billing_error', 'technical_issue', 'goodwill_gesture', 'chargeback_prevention', 'other'];
export declare const refundStatusValues: readonly ['pending', 'approved', 'processing', 'completed', 'failed', 'rejected', 'canceled'];
export type RefundReason = (typeof refundReasonValues)[number];
export type RefundStatus = (typeof refundStatusValues)[number];
export {};
//# sourceMappingURL=primitives.d.ts.map