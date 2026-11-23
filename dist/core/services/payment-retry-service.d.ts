import type { Instant } from '@arki/date';
import { z } from '@arki/contracts';
import type { FailureOf } from '@arki/failure';
import { MoneyBag } from '@arki/money/bag';
import type { CoreWrites } from '../journal.js';
import type { BasePaymentProvider } from '../providers/base-provider.js';
import type { PaymentRepository } from '../repository.js';
import type { Payment, PaymentId, SubscriptionId } from '../types.js';
import { PaymentsConfigurationInvalid, RetryStrategyNotFound } from '../failures.js';
/**
 * A retry strategy. At most 10 attempts, so even an exponential backoff (the first delay doubled per
 * attempt) stays inside the dates `@arki/date` can hold; each delay is whole minutes, at most a year.
 * Each list holds at most `MAX_BATCH_ITEMS` (1,000) items.
 */
declare const retryStrategySchema: z.ZodObject<{
    name: z.ZodString;
    maxAttempts: z.ZodNumber;
    backoffStrategy: z.ZodEnum<{
        custom: "custom";
        exponential: "exponential";
        linear: "linear";
    }>;
    delayMinutes: z.ZodArray<z.ZodNumber>;
    conditions: z.ZodObject<{
        paymentMethods: z.ZodArray<z.ZodString>;
        failureReasons: z.ZodArray<z.ZodString>;
        subscriptionStatuses: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type RetryStrategy = z.output<typeof retryStrategySchema>;
type ConfigurationInvalid = FailureOf<typeof PaymentsConfigurationInvalid>;
type RetryStrategyMissing = FailureOf<typeof RetryStrategyNotFound>;
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
    /** Use `PaymentRetryService.create`: it checks the strategies first. */
    private constructor();
    /**
     * Build the service. Returns it, or `payments.configuration_invalid` when a strategy has more than
     * 10 attempts or a delay that is not whole minutes from 0 to a year. `strategies` default to the
     * built-in ones; it holds at most `MAX_BATCH_ITEMS` (1,000) strategies.
     */
    static create(paymentProvider: RetryProvider, paymentRepository: RetryReads, writes: CoreWrites, strategies?: RetryStrategy[]): PaymentRetryService | ConfigurationInvalid;
    /**
     * Schedule the retries of a failed subscription payment by the first strategy that fits it.
     * Returns the scheduled attempts (none when no strategy fits), or a failure:
     * `ReferenceNotFound` (payment or subscription) or `PaymentWithoutSubscription`.
     */
    scheduleRetries(paymentId: PaymentId, failureReason: string): Promise<RetryAttempt[] | import("@arki/failure").Failure<"payments.payment_without_subscription", {
        paymentId: string;
    }> | import("@arki/failure").Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription" | "user";
        id: string;
        missing: "provider_id" | "row";
    }>>;
    /**
     * Run the retry attempts that are due, oldest first, and report what each did, in that order:
     *
     * - `succeeded`: the provider took the payment. A past due subscription is active again, and the
     *   payment's other pending attempts are cancelled.
     * - `failed`: the payment was not recovered. `failure` is the declined card (`payments.card_declined`),
     *   or `payment` is the provider's answer when it is not `succeeded` (its `failureReason` says why).
     *   The last attempt of a payment then marks the subscription past due.
     * - `cancelled`: nothing was charged: the subscription is no longer active or past due, the payment
     *   is gone or already succeeded, or an earlier attempt of this run recovered it.
     * - `refused`: the package returned a failure, in `failure`. The provider refused the call (such as
     *   `payments.configuration_invalid` from a `StripeProvider` built without `references`, or
     *   `payments.reference_not_found`), or the journal refused the write after it: the money came in
     *   but the subscription is still past due, or the last failed attempt could not mark it past due.
     * - `thrown`: the attempt threw (a fault), in `error`.
     *
     * The attempt itself says `failed` for `refused` and `thrown`, with the failure's message. One broken
     * attempt never stops the others.
     */
    processRetries(): Promise<({
        attemptId: string;
        status: 'thrown';
        error: unknown;
    } | {
        attemptId: string;
        status: 'cancelled';
        failure?: undefined;
        payment?: undefined;
    } | {
        attemptId: string;
        status: 'refused';
        failure: import("@arki/failure").Failure<"payments.configuration_invalid", {
            setting: string;
            problem: string;
        }> | import("@arki/failure").Failure<"payments.reference_not_found", {
            kind: "customer" | "payment" | "plan" | "subscription" | "user";
            id: string;
            missing: "provider_id" | "row";
        }> | import("@arki/money").MoneyFailure;
        payment?: undefined;
    } | {
        attemptId: string;
        status: 'refused';
        failure: import("@arki/failure").Failure<"contracts.random_source_unavailable", undefined> | import("@arki/failure").Failure<"db.transaction_cancelled", undefined> | import("@arki/failure").Failure<"db.transaction_commit_uncertain", undefined> | import("@arki/failure").Failure<"db.transaction_conflict", {
            attempts: number;
            sqlState: "40001" | "40P01";
        }> | import("@arki/failure").Failure<"db.transaction_defect", undefined> | import("@arki/failure").Failure<"db.transaction_rejected", {
            sqlState: string;
        }> | import("@arki/failure").Failure<"db.transaction_unavailable", undefined> | import("@arki/failure").Failure<"failure.unexpected_defect", undefined> | import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/failure").Failure<"schema.async_required", undefined> | import("@arki/failure").Failure<"schema.invalid_input", {
            issues: readonly import("@standard-schema/spec").StandardSchemaV1.Issue[];
        }> | import("@arki/failure").Failure<"schema.validator_defect", undefined>;
        payment?: undefined;
    } | {
        attemptId: string;
        status: 'failed';
        failure: import("@arki/failure").Failure<"payments.card_declined", {
            providerCode?: string | undefined;
            declineCode?: string | undefined;
        }>;
        payment?: undefined;
    } | {
        failure?: undefined;
        attemptId: string;
        status: 'succeeded';
        payment?: undefined;
    } | {
        failure?: undefined;
        attemptId: string;
        status: 'failed';
        payment: Payment;
    })[]>;
    /** One due attempt, run and reported (see `processRetries`). */
    private runRetry;
    /** Run one attempt and report it (see `processRetries`); `attempt` says what happened, with the failure's message. */
    private executeRetry;
    /**
     * After a failed attempt: when it was the payment's last, mark the subscription past due. Nothing,
     * or the failure of that write (then also the attempt's `failureReason`).
     */
    private endDunningAfterLast;
    private selectRetryStrategy;
    private calculateDelay;
    private isLastAttempt;
    /** Nothing, or the failure of the write: a subscription that is not there. */
    private handleFinalFailure;
    cancelRetries(paymentId: PaymentId, excludeId?: string): Promise<void>;
    getRetryAttempts(paymentId: PaymentId): RetryAttempt[];
    getRetryAnalytics(startDate?: Instant, endDate?: Instant): Promise<RetryAnalytics>;
    private extractFailureReason;
    /**
     * Add a strategy, or replace the one with its name. Returns nothing, or `payments.configuration_invalid`
     * (and changes nothing) for a strategy with more than 10 attempts or a delay that is not whole minutes from 0 to a year.
     */
    addRetryStrategy(strategy: RetryStrategy): ConfigurationInvalid | undefined;
    getRetryStrategies(): RetryStrategy[];
    /**
     * Change the named strategy. Returns nothing, `payments.retry_strategy_not_found` when no strategy has this name,
     * or `payments.configuration_invalid` when the result breaks the rules of `addRetryStrategy`. A failure changes nothing.
     */
    updateRetryStrategy(name: string, updates: Partial<RetryStrategy>): ConfigurationInvalid | RetryStrategyMissing | undefined;
}
export declare function createPaymentRetryService(paymentProvider: BasePaymentProvider, paymentRepository: PaymentRepository, writes: CoreWrites, strategies?: RetryStrategy[]): PaymentRetryService | ConfigurationInvalid;
export {};
//# sourceMappingURL=payment-retry-service.d.ts.map