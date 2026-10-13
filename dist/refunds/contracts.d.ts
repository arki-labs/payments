import { z } from '@arki/contracts';
export declare const refundReasonSchema: z.ZodEnum<{
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
export declare const refundStatusSchema: z.ZodEnum<{
    approved: "approved";
    canceled: "canceled";
    completed: "completed";
    failed: "failed";
    pending: "pending";
    processing: "processing";
    rejected: "rejected";
}>;
export { refundReasonValues, refundStatusValues } from './primitives.js';
//# sourceMappingURL=contracts.d.ts.map