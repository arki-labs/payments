import type { UserId } from '../core/user-id.js';
import type { Instant } from '@arki/date';
import type { Money } from '@arki/money';
import { z } from '@arki/contracts';
import type { NotificationService } from '../core/notifications/service.js';
import type { StripeProvider } from '../core/providers/stripe-provider.js';
import type { PaymentRepository } from '../core/repository.js';
import type { RefundWrites } from './journal.js';
import type { RefundRepository, RefundsDatabase } from './repository.js';
import type { RefundsTables } from './tables.js';
import type { Refund, RefundApprovalData, RefundRejectionData, RefundRequestData } from './types.js';
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
    systemUserId: UserId | string;
    /** Refund window in milliseconds. Defaults to 90 days. */
    refundWindowMs?: number;
    /** Small refunds approved without a person. Defaults to `DEFAULT_REFUND_AUTO_APPROVE_LIMITS`. */
    autoApproveLimits?: RefundAutoApproveLimits;
};
/** The refund reads the service makes. A `RefundRepository` fits. */
type RefundReads = Pick<RefundRepository, 'findById' | 'findByPaymentId' | 'getRefundMetrics' | 'getAverageProcessingTime' | 'searchRefunds'>;
/** The provider call the service makes. A `StripeProvider` fits. */
type RefundProvider = Pick<StripeProvider, 'refundPayment'>;
/** The payment read the service makes. A `PaymentRepository` fits. */
type PaymentReads = Pick<PaymentRepository, 'findPaymentById'>;
/**
 * Reads come from the repositories. Every change of a `refunds` row goes
 * through `writes`: one journal command per step, so each step leaves an event.
 */
export declare class RefundService {
    private readonly refundRepository;
    private readonly writes;
    private readonly paymentProvider;
    private readonly paymentRepository;
    private readonly notificationService?;
    private readonly refundWindow;
    private readonly systemUserId;
    private readonly autoApproveLimits;
    constructor(refundRepository: RefundReads, writes: RefundWrites, paymentProvider: RefundProvider, paymentRepository: PaymentReads, config: RefundServiceConfig, notificationService?: NotificationService | undefined);
    requestRefund(data: RefundRequestData): Promise<Refund>;
    approveRefund(data: RefundApprovalData): Promise<Refund>;
    rejectRefund(data: RefundRejectionData): Promise<Refund>;
    private processRefund;
    private validateRefundEligibility;
    /**
     * The per-currency limit is the only rule, whatever the reason: a billing
     * error or technical issue of any size used to skip the person, so a large
     * refund in any currency could go out unreviewed.
     */
    private shouldAutoApprove;
    private notifyApprovers;
    private notifyCustomer;
    private notifySupportTeam;
    getRefundMetrics(startDate?: Instant, endDate?: Instant): Promise<{
        totalCount: number;
        totalAmount: import("@arki/money/bag").MoneyBag;
        byStatus: Record<string, number>;
        byReason: Record<string, number>;
    }>;
    getAverageProcessingTime(): Promise<number>;
    searchRefunds(filters: Parameters<RefundRepository['searchRefunds']>[0]): Promise<Refund[]>;
}
export declare function createRefundService(db: RefundsDatabase, tables: Pick<RefundsTables, 'refunds'>, writes: RefundWrites, paymentProvider: StripeProvider, paymentRepository: PaymentRepository, config: RefundServiceConfig, notificationService?: NotificationService): RefundService;
export {};
//# sourceMappingURL=service.d.ts.map