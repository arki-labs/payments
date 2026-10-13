import { z } from '@arki/contracts';
import { toMillis } from '@arki/date';
import { sum } from '@arki/money';
import { currencyCodeSchema } from '@arki/money/zod';
import { nonNegativeMoneySchema, paymentAmount } from '../core/money.js';
import { createRefundRepository, refundAmountOf } from './repository.js';
/**
 * The largest refund approved without a person, per currency: `{ USD: '10.00', JPY: '1500' }`.
 * Each amount is exact text in its own currency, so 10 USD and 1500 JPY are both "small".
 * A currency missing here has no small-refund rule: its refunds wait for a person.
 * Parsed once when the service is built; a bad code or amount throws there, not on a refund.
 */
export const refundAutoApproveLimitsSchema = z.record(currencyCodeSchema, z.string()).transform((limits, ctx) => {
    const parsed = new Map();
    for (const [currency, amount] of Object.entries(limits)) {
        const limit = nonNegativeMoneySchema.safeParse({ amount, currency });
        if (limit.success) {
            parsed.set(currency, limit.data);
        }
        else {
            ctx.addIssue({ code: 'custom', path: [currency], message: `Not a ${currency} amount: ${amount}` });
        }
    }
    return parsed;
});
/** About ten dollars' worth where it is set; other currencies wait for a person. */
export const DEFAULT_REFUND_AUTO_APPROVE_LIMITS = {
    USD: '10.00',
    EUR: '10.00',
    JPY: '1500',
};
/**
 * Reads come from the repositories. Every change of a `refunds` row goes
 * through `writes`: one journal command per step, so each step leaves an event.
 */
export class RefundService {
    refundRepository;
    writes;
    paymentProvider;
    paymentRepository;
    notificationService;
    refundWindow;
    systemUserId;
    autoApproveLimits;
    constructor(refundRepository, writes, paymentProvider, paymentRepository, config, notificationService) {
        this.refundRepository = refundRepository;
        this.writes = writes;
        this.paymentProvider = paymentProvider;
        this.paymentRepository = paymentRepository;
        this.notificationService = notificationService;
        this.refundWindow = config.refundWindowMs ?? 90 * 24 * 60 * 60 * 1000;
        this.systemUserId = config.systemUserId;
        this.autoApproveLimits = refundAutoApproveLimitsSchema.parse(config.autoApproveLimits ?? DEFAULT_REFUND_AUTO_APPROVE_LIMITS);
    }
    async requestRefund(data) {
        await this.validateRefundEligibility(data.paymentId, data.amount);
        const refund = await this.writes.requestRefund({
            paymentId: data.paymentId,
            originalAmount: data.amount.toJSON(),
            refundAmount: data.amount.toJSON(),
            reason: data.reason,
            requestedBy: data.requestedBy,
            customerNote: data.customerNote,
            internalNotes: data.internalNotes,
            metadata: JSON.stringify({}),
        });
        if (await this.shouldAutoApprove(refund)) {
            return this.approveRefund({ refundId: refund.id, approvedBy: this.systemUserId });
        }
        if (this.notificationService) {
            await this.notifyApprovers(refund);
        }
        return refund;
    }
    async approveRefund(data) {
        const refund = await this.refundRepository.findById(data.refundId);
        if (!refund || refund.status !== 'pending') {
            throw new Error(`Invalid refund state for ${data.refundId}`);
        }
        const approvedRefund = await this.writes.approveRefund({ refundId: data.refundId, approvedBy: data.approvedBy });
        return this.processRefund(approvedRefund);
    }
    async rejectRefund(data) {
        const refund = await this.refundRepository.findById(data.refundId);
        if (!refund || refund.status !== 'pending') {
            throw new Error(`Invalid refund state for ${data.refundId}`);
        }
        const rejectedRefund = await this.writes.rejectRefund({
            refundId: data.refundId,
            rejectedBy: data.rejectedBy,
            rejectionReason: data.reason,
        });
        if (this.notificationService) {
            await this.notifyCustomer(rejectedRefund, 'rejected');
        }
        return rejectedRefund;
    }
    async processRefund(refund) {
        // Outside the `try`: a refund that could not start has nothing to mark as failed
        await this.writes.processRefund({ refundId: refund.id });
        try {
            const payment = await this.paymentRepository.findPaymentById(refund.paymentId);
            if (!payment) {
                throw new Error(`Payment ${refund.paymentId} not found`);
            }
            const providerPaymentId = payment.providerPaymentId || payment.id;
            const providerResult = await this.paymentProvider.refundPayment(providerPaymentId, {
                amount: refundAmountOf(refund),
                reason: refund.reason,
                metadata: {
                    refundId: refund.id,
                    internalReason: refund.reason,
                },
            });
            const completedRefund = await this.writes.completeRefund({
                refundId: refund.id,
                providerRefundId: providerResult.id,
                providerResponse: JSON.stringify(providerResult),
            });
            if (this.notificationService) {
                await this.notifyCustomer(completedRefund, 'completed');
            }
            return completedRefund;
        }
        catch (error) {
            await this.writes.failRefund({
                refundId: refund.id,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            });
            if (this.notificationService) {
                await this.notifySupportTeam(refund, error);
            }
            throw error;
        }
    }
    async validateRefundEligibility(paymentId, amount) {
        const payment = await this.paymentRepository.findPaymentById(paymentId);
        if (!payment) {
            throw new Error('Payment not found');
        }
        const paid = paymentAmount(payment);
        if (!amount.hasSameCurrency(paid)) {
            throw new Error(`Refund currency ${amount.currency.code} differs from the payment currency ${paid.currency.code}`);
        }
        if (payment.createdAt && Date.now() - toMillis(payment.createdAt) > this.refundWindow) {
            throw new Error('Refund window exceeded');
        }
        const existingRefunds = await this.refundRepository.findByPaymentId(paymentId);
        const totalRefunded = sum(existingRefunds.filter(r => r.status === 'completed').map(refund => refundAmountOf(refund)), paid.currency);
        if (totalRefunded.plus(amount).gt(paid)) {
            throw new Error('Refund amount exceeds payment amount');
        }
    }
    /**
     * The per-currency limit is the only rule, whatever the reason: a billing
     * error or technical issue of any size used to skip the person, so a large
     * refund in any currency could go out unreviewed.
     */
    async shouldAutoApprove(refund) {
        const amount = refundAmountOf(refund);
        const limit = this.autoApproveLimits.get(amount.currency.code);
        return limit !== undefined && amount.lte(limit);
    }
    async notifyApprovers(refund) {
        if (this.notificationService?.sendRefundApprovalRequest) {
            try {
                await this.notificationService.sendRefundApprovalRequest(refund);
            }
            catch (error) {
                console.error('Failed to send refund approval notification:', error);
            }
        }
    }
    async notifyCustomer(refund, event) {
        if (this.notificationService?.sendRefundStatusUpdate) {
            try {
                await this.notificationService.sendRefundStatusUpdate(refund, event);
            }
            catch (error) {
                console.error('Failed to send customer notification:', error);
            }
        }
    }
    async notifySupportTeam(refund, error) {
        if (this.notificationService?.sendRefundFailureAlert) {
            try {
                await this.notificationService.sendRefundFailureAlert(refund, error);
            }
            catch (error_) {
                console.error('Failed to send support team alert:', error_);
            }
        }
    }
    // Analytics methods
    async getRefundMetrics(startDate, endDate) {
        return this.refundRepository.getRefundMetrics(startDate, endDate);
    }
    async getAverageProcessingTime() {
        return this.refundRepository.getAverageProcessingTime();
    }
    async searchRefunds(filters) {
        return this.refundRepository.searchRefunds(filters);
    }
}
export function createRefundService(db, tables, writes, paymentProvider, paymentRepository, config, notificationService) {
    return new RefundService(createRefundRepository(db, tables), writes, paymentProvider, paymentRepository, config, notificationService);
}
//# sourceMappingURL=service.js.map