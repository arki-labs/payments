import type { Instant } from '@arki/date';
import { MoneyBag } from '@arki/money/bag';
import type { CoreWrites } from '../journal.js';
import type { BasePaymentProvider } from '../providers/base-provider.js';
import type { PaymentRepository } from '../repository.js';
import type { PaymentId, SubscriptionId } from '../types.js';
export type RetryStrategy = {
    name: string;
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential' | 'custom';
    delayMinutes: number[];
    conditions: {
        paymentMethods: string[];
        failureReasons: string[];
        subscriptionStatuses: string[];
    };
};
export type RetryAttempt = {
    id: string;
    paymentId: PaymentId;
    subscriptionId: SubscriptionId;
    attemptNumber: number;
    scheduledFor: Instant;
    executedAt?: Instant;
    status: 'pending' | 'executing' | 'succeeded' | 'failed' | 'cancelled';
    failureReason?: string;
    strategyUsed: string;
    createdAt: Instant;
};
export type RetryAnalytics = {
    totalRetryAttempts: number;
    successfulRetries: number;
    failedRetries: number;
    retrySuccessRate: number;
    averageRetryTime: number;
    retrySuccessByAttempt: Record<number, number>;
    commonFailureReasons: Record<string, number>;
    /** The stored amounts of the payments a retry recovered, each payment once, one balance per currency. */
    revenueRecovered: MoneyBag;
};
/** The provider call a retry makes. A `BasePaymentProvider` fits. */
type RetryProvider = Pick<BasePaymentProvider, 'confirmPayment'>;
/** The repository reads a retry makes. A `PaymentRepository` fits. */
type RetryReads = Pick<PaymentRepository, 'findPaymentById' | 'findSubscriptionById'>;
/**
 * The retry schedule lives in memory. Every change of a `subscriptions` row
 * goes through `writes`: one journal command each.
 */
export declare class PaymentRetryService {
    private readonly paymentProvider;
    private readonly paymentRepository;
    private readonly writes;
    private retryAttempts;
    private strategies;
    constructor(paymentProvider: RetryProvider, paymentRepository: RetryReads, writes: CoreWrites, strategies?: RetryStrategy[]);
    /**
     * Schedule the retries of a failed subscription payment by the first strategy that fits it.
     * Returns the scheduled attempts (none when no strategy fits), or a failure:
     * `ReferenceNotFound` (payment or subscription) or `PaymentWithoutSubscription`.
     */
    scheduleRetries(paymentId: PaymentId, failureReason: string): Promise<RetryAttempt[] | import("@arki/failure").Failure<"payments.payment_without_subscription", {
        paymentId: string;
    }> | import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }>>;
    processRetries(): Promise<void>;
    /** Nothing, or the failure of a journal write; `attempt` then says `failed` with its message. */
    private executeRetry;
    private selectRetryStrategy;
    private calculateDelay;
    private isLastAttempt;
    /** Nothing, or the failure of the write: a subscription that is not there. */
    private handleFinalFailure;
    cancelRetries(paymentId: PaymentId, excludeId?: string): Promise<void>;
    getRetryAttempts(paymentId: PaymentId): RetryAttempt[];
    getRetryAnalytics(startDate?: Instant, endDate?: Instant): Promise<RetryAnalytics>;
    private extractFailureReason;
    addRetryStrategy(strategy: RetryStrategy): void;
    getRetryStrategies(): RetryStrategy[];
    updateRetryStrategy(name: string, updates: Partial<RetryStrategy>): void;
}
export declare function createPaymentRetryService(paymentProvider: BasePaymentProvider, paymentRepository: PaymentRepository, writes: CoreWrites, strategies?: RetryStrategy[]): PaymentRetryService;
export {};
//# sourceMappingURL=payment-retry-service.d.ts.map