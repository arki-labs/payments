import { createIdFactory } from '@arki/db/id-factory';
const refundIdFactoryInstance = createIdFactory('rfnd');
export const createRefundId = refundIdFactoryInstance.create;
export const refundIdSchema = refundIdFactoryInstance.schema;
export const refundIdFactory = refundIdFactoryInstance;
export const refundReasonValues = [
    'customer_request',
    'duplicate_charge',
    'fraudulent_transaction',
    'service_not_delivered',
    'billing_error',
    'technical_issue',
    'goodwill_gesture',
    'chargeback_prevention',
    'other',
];
export const refundStatusValues = [
    'pending',
    'approved',
    'processing',
    'completed',
    'failed',
    'rejected',
    'canceled',
];
//# sourceMappingURL=primitives.js.map