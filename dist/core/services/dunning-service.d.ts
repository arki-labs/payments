import type { Instant } from '@arki/date';
import type { CoreWrites } from '../journal.js';
import type { BasePaymentProvider } from '../providers/base-provider.js';
import type { PaymentRepository } from '../repository.js';
import type { PaymentId, SubscriptionId } from '../types.js';
export type DunningRule = {
    id: string;
    name: string;
    enabled: boolean;
    trigger: {
        event: 'payment_failed' | 'invoice_payment_failed' | 'subscription_past_due';
        delayDays: number;
    };
    action: {
        type: 'email' | 'retry_payment' | 'pause_subscription' | 'cancel_subscription' | 'webhook';
        config: Record<string, unknown>;
    };
    retryCount?: number;
    maxRetries?: number;
};
export type DunningConfiguration = {
    gracePeriodDays: number;
    maxRetryAttempts: number;
    retrySchedule: number[];
    emailTemplates: {
        paymentFailed: string;
        trialEnding: string;
        subscriptionPaused: string;
        finalNotice: string;
    };
    rules: DunningRule[];
};
export type DunningEvent = {
    id: string;
    subscriptionId: SubscriptionId;
    paymentId?: PaymentId;
    userId: string;
    eventType: 'payment_failed' | 'retry_scheduled' | 'grace_period_ended' | 'subscription_recovered';
    data: Record<string, unknown>;
    scheduledFor?: Instant;
    processedAt?: Instant;
    createdAt: Instant;
};
export type DunningStats = {
    totalFailedPayments: number;
    recoveredPayments: number;
    recoveryRate: number;
    subscriptionsInDunning: number;
    averageRecoveryTime: number;
    revenueAtRisk: number;
    revenueRecovered: number;
};
/** The provider calls dunning makes. A `BasePaymentProvider` fits. */
type DunningProvider = Pick<BasePaymentProvider, 'confirmPayment' | 'pauseSubscription' | 'cancelSubscription'>;
/** The repository reads dunning makes. A `PaymentRepository` fits. */
type DunningReads = Pick<PaymentRepository, 'findPaymentById' | 'findSubscriptionById' | 'getPaymentStats' | 'getSubscriptionStats'>;
/**
 * The schedule of dunning steps lives in memory. Every change of a
 * `subscriptions` row goes through `writes`: one journal command each.
 */
export declare class DunningService {
    private readonly paymentProvider;
    private readonly paymentRepository;
    private readonly writes;
    private config;
    private dunningEvents;
    constructor(paymentProvider: DunningProvider, paymentRepository: DunningReads, writes: CoreWrites, config?: Partial<DunningConfiguration>);
    /**
     * Handle a payment failure and initiate dunning process
     */
    handlePaymentFailure(paymentId: PaymentId, subscriptionId: SubscriptionId, failureReason?: string): Promise<void>;
    /**
     * Process scheduled dunning events
     */
    processDunningEvents(): Promise<void>;
    /**
     * Process an individual dunning event
     */
    private processEvent;
    /**
     * Send dunning email to customer
     */
    private sendDunningEmail;
    /**
     * Retry failed payment
     */
    private retryPayment;
    /**
     * Pause subscription due to payment failure
     */
    private pauseSubscription;
    /**
     * Cancel subscription due to payment failure
     */
    private cancelSubscription;
    /**
     * Trigger external webhook for custom dunning logic
     */
    private triggerWebhook;
    /**
     * Cancel all pending dunning events for a subscription
     */
    private cancelDunningEventsForSubscription;
    /**
     * Handle subscription recovery (payment succeeded after failure)
     */
    handleSubscriptionRecovery(subscriptionId: SubscriptionId): Promise<void>;
    /**
     * Get dunning statistics for analytics
     */
    getDunningStats(startDate?: Instant, endDate?: Instant): Promise<DunningStats>;
    /**
     * Get pending dunning events for a subscription
     */
    getPendingEventsForSubscription(subscriptionId: SubscriptionId): DunningEvent[];
    /**
     * Update dunning configuration
     */
    updateConfiguration(config: Partial<DunningConfiguration>): void;
    /**
     * Get current dunning configuration
     */
    getConfiguration(): DunningConfiguration;
}
export declare function createDunningService(paymentProvider: BasePaymentProvider, paymentRepository: PaymentRepository, writes: CoreWrites, config?: Partial<DunningConfiguration>): DunningService;
export {};
//# sourceMappingURL=dunning-service.d.ts.map