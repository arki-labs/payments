import type { UserId } from '../core/user-id.js';
import type { Instant } from '@arki/date';
import type { Money } from '@arki/money';
import { z } from '@arki/contracts';
import type { FailureOf } from '@arki/failure';
import type { NotificationService } from '../core/notifications/service.js';
import type { PaymentRepository } from '../core/repository.js';
import type { RefundWrites } from './journal.js';
import type { RefundRepository, RefundsDatabase } from './repository.js';
import type { RefundsTables } from './tables.js';
import type { Refund, RefundApprovalData, RefundRejectionData, RefundRequestData } from './types.js';
import { DuplicatePendingRefund, RefundAmountExceeded, RefundInvalidState, RefundNotFound, RefundWindowExceeded, TransactionNotFound } from './failures.js';
/**
 * The largest refund approved without a person, per currency: `{ USD: '10.00', JPY: '1500' }`.
 * Each amount is exact text in its own currency, so 10 USD and 1500 JPY are both "small".
 * A currency missing here has no small-refund rule: its refunds wait for a person.
 * Parsed once when the service is built; a bad code or amount throws there, not on a refund.
 */
export declare const refundAutoApproveLimitsSchema: z.ZodPipe<z.ZodRecord<z.ZodString, z.ZodString>, z.ZodTransform<Map<string, Money<string>>, Record<string, string>>>;
export type RefundAutoApproveLimits = z.input<typeof refundAutoApproveLimitsSchema>;
/** About ten dollars' worth where it is set; other currencies wait for a person. */
export declare const DEFAULT_REFUND_AUTO_APPROVE_LIMITS: RefundAutoApproveLimits;
export type RefundServiceConfig = {
    /** User ID attributed for system-driven auto-approvals (e.g. small-amount refunds). */
    systemUserId: UserId;
    /** Refund window in milliseconds. Defaults to 90 days. */
    refundWindowMs?: number;
    /** Small refunds approved without a person. Defaults to `DEFAULT_REFUND_AUTO_APPROVE_LIMITS`. */
    autoApproveLimits?: RefundAutoApproveLimits;
};
/** The refund reads the service makes. A `RefundRepository` fits. */
type RefundReads = Pick<RefundRepository, 'findById' | 'findByPaymentId' | 'getRefundMetrics' | 'getAverageProcessingTime' | 'searchRefunds'>;
/** The payment read the service makes. A `PaymentRepository` fits. */
type PaymentReads = Pick<PaymentRepository, 'findPaymentById'>;
/**
 * Reads come from the repositories. Every change of a `refunds` row goes
 * through `writes`: one journal command per step, so each step leaves an event.
 *
 * The service never calls the provider. Approval records `RefundApproved`, and that event starts the
 * `payments.refund` workflow (`createRefundWorkflow`), which pays the money back after the request has answered.
 */
export declare class RefundService {
    private readonly refundRepository;
    private readonly writes;
    private readonly paymentRepository;
    /** Sends the customer's rejection mail only. The approvers' mail is an effect: `createRefundEffects`. */
    private readonly notificationService?;
    private readonly refundWindow;
    private readonly systemUserId;
    private readonly autoApproveLimits;
    constructor(refundRepository: RefundReads, writes: RefundWrites, paymentRepository: PaymentReads, config: RefundServiceConfig, 
    /** Sends the customer's rejection mail only. The approvers' mail is an effect: `createRefundEffects`. */
    notificationService?: NotificationService | undefined);
    requestRefund(data: RefundRequestData): Promise<Awaited<ReturnType<RefundWrites['requestRefund']>> | Awaited<ReturnType<RefundService['approveRefund']>> | FailureOf<typeof DuplicatePendingRefund> | FailureOf<typeof RefundAmountExceeded> | FailureOf<typeof RefundWindowExceeded> | FailureOf<typeof TransactionNotFound>>;
    approveRefund(data: RefundApprovalData): Promise<Awaited<ReturnType<RefundWrites['approveRefund']>> | FailureOf<typeof RefundNotFound> | FailureOf<typeof RefundInvalidState>>;
    /** A blank `reason` is refused with the schema's `InvalidInput` before anything is read or written. */
    rejectRefund(data: RefundRejectionData): Promise<Awaited<ReturnType<RefundWrites['rejectRefund']>> | FailureOf<typeof RefundNotFound> | FailureOf<typeof RefundInvalidState>>;
    /** A refund that can still be approved or rejected. A missing one and one past `pending` are different failures. */
    private requirePending;
    /** Nothing when the payment can give back `amount`, or the failure that says why not. */
    private validateRefundEligibility;
    /**
     * The per-currency limit is the only rule, whatever the reason: a billing
     * error or technical issue of any size used to skip the person, so a large
     * refund in any currency could go out unreviewed.
     */
    private shouldAutoApprove;
    private notifyCustomer;
    getRefundMetrics(startDate?: Instant, endDate?: Instant): Promise<{
        totalCount: number;
        totalAmount: import("@arki/money/bag").MoneyBag;
        byStatus: Record<string, number>;
        byReason: Record<string, number>;
    }>;
    getAverageProcessingTime(): Promise<number>;
    searchRefunds(filters: Parameters<RefundRepository['searchRefunds']>[0]): Promise<Refund[]>;
}
export declare function createRefundService(db: RefundsDatabase, tables: Pick<RefundsTables, 'refunds'>, writes: RefundWrites, paymentRepository: PaymentRepository, config: RefundServiceConfig, notificationService?: NotificationService): RefundService;
export {};
//# sourceMappingURL=service.d.ts.map