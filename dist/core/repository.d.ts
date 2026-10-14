import type { AnyRelations } from 'drizzle-orm';
import type { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type { UserId } from './user-id.js';
import type { Instant } from '@arki/date';
import type { PaymentQuery, PlanQuery, SubscriptionQuery } from './contracts.js';
import type { CoreTables } from './tables.js';
import type { Customer, CustomerId, NewCustomer, NewPlan, NewWebhookEvent, Payment, PaymentId, PaymentProviderType, PaymentStatus, PaymentWithRelations, Plan, PlanId, PlanTier, Subscription, SubscriptionId, SubscriptionStatus, SubscriptionWithPlan, SubscriptionWithRelations, UpdateCustomer, UpdatePlan, UpdateWebhookEvent, WebhookEvent, WebhookEventType, WebhookId } from './types.js';
/**
 * Structural database type accepted by the payments repositories.
 *
 * Mirrors drizzle's public surface: a `NodePgDatabase<TRelations>` or an
 * in-flight `NodePgTransaction<TRelations>`. Apps supply their own concrete
 * relations type (parameterised over their full relations graph). The
 * contract: the relations graph MUST register the payment tables (`plans`,
 * `customers`, `subscriptions`, `payments`, `webhookEvents`) with the
 * relations required below — without those, `db.query.<table>.findFirst({
 * with: { ... } })` calls fail at runtime.
 *
 * `AnyRelations` is used as the upper bound because the precise relations
 * graph is unknown to the package — type fidelity is recovered inside the
 * repository via an internal precise view (see `PaymentDbInternal`).
 */
export type PaymentDatabase = NodePgDatabase<AnyRelations> | NodePgTransaction<AnyRelations> | PgliteDatabase<AnyRelations>;
export declare class PaymentRepository {
    private readonly db;
    private readonly q;
    private readonly plans;
    private readonly customers;
    private readonly subscriptions;
    private readonly webhookEvents;
    constructor(db: PaymentDatabase, tables: Pick<CoreTables, 'plans' | 'customers' | 'subscriptions' | 'payments' | 'webhookEvents'>);
    createPlan(data: NewPlan): Promise<Plan>;
    findPlanById(id: PlanId): Promise<Plan | null>;
    findPlansByTier(tier: PlanTier): Promise<Plan[]>;
    /** Plans matching the filters left in `query`, cheapest first within a tier, one page. */
    findPlans(query: PlanQuery): Promise<Plan[]>;
    findActivePlans(): Promise<Plan[]>;
    updatePlan(id: PlanId, data: UpdatePlan): Promise<Plan>;
    deactivatePlan(id: PlanId): Promise<Plan>;
    getPlan(id: PlanId): Promise<Plan | null>;
    /**
     * A user has one customer, and a provider customer is one row. Two checkouts that race to
     * create the same customer both succeed: the second gets the row the first wrote. A customer
     * that clashes with a different one (another provider id for the user, or the provider id
     * of another user) is an error, not a silent pick of either row.
     */
    createCustomer(data: NewCustomer): Promise<Customer>;
    findCustomerById(id: CustomerId): Promise<Customer | null>;
    findCustomerByUserId(userId: UserId): Promise<Customer | null>;
    findCustomerByProviderCustomerId(providerCustomerId: string, provider: PaymentProviderType): Promise<Customer | null>;
    updateCustomer(id: CustomerId, data: UpdateCustomer): Promise<Customer>;
    deleteCustomer(id: CustomerId): Promise<void>;
    findSubscriptionById(id: SubscriptionId): Promise<SubscriptionWithPlan | null>;
    findSubscriptionsByUserId(userId: UserId): Promise<Subscription[]>;
    /** Subscriptions matching the filters left in `query`, newest first, one page. */
    findSubscriptions(query: SubscriptionQuery): Promise<Subscription[]>;
    findActiveSubscriptionByUserId(userId: UserId): Promise<SubscriptionWithPlan | null>;
    findSubscriptionByProviderSubscriptionId(providerSubscriptionId: string): Promise<Subscription | null>;
    findSubscriptionsByStatus(status: SubscriptionStatus): Promise<Subscription[]>;
    findSubscriptionsEndingInRange(startDate: Instant, endDate: Instant): Promise<Subscription[]>;
    getSubscription(id: SubscriptionId): Promise<Subscription | null>;
    findPaymentById(id: PaymentId): Promise<Payment | null>;
    findPaymentsByUserId(userId: UserId, limit?: number): Promise<Payment[]>;
    /** Payments matching the filters left in `query`, newest first, one page. `startDate` and `endDate` bound `createdAt`, both inclusive. */
    findPayments(query: PaymentQuery): Promise<Payment[]>;
    findPaymentsBySubscriptionId(subscriptionId: SubscriptionId): Promise<Payment[]>;
    findPaymentByProviderPaymentId(providerPaymentId: string): Promise<Payment | null>;
    findPaymentsByStatus(status: PaymentStatus): Promise<Payment[]>;
    createWebhookEvent(data: NewWebhookEvent): Promise<WebhookEvent>;
    /** Insert the event, or return the row that holds its id. See `claimWebhookEvent` in `webhook-claims.ts`. */
    claimWebhookEvent(data: NewWebhookEvent): Promise<{
        event: WebhookEvent;
        created: boolean;
    }>;
    /** Take over a failed or stale unprocessed event. See `reclaimWebhookEvent` in `webhook-claims.ts`. */
    reclaimWebhookEvent(id: WebhookId, seenAttempts: number, leaseCutoff: Instant): Promise<boolean>;
    findWebhookEventById(id: WebhookId): Promise<WebhookEvent | null>;
    findWebhookEventByProviderEventId(providerEventId: string, provider: PaymentProviderType): Promise<WebhookEvent | null>;
    findUnprocessedWebhookEvents(limit?: number): Promise<WebhookEvent[]>;
    findWebhookEventsByType(eventType: WebhookEventType): Promise<WebhookEvent[]>;
    updateWebhookEvent(id: WebhookId, data: UpdateWebhookEvent): Promise<WebhookEvent>;
    markWebhookEventAsProcessed(id: WebhookId): Promise<WebhookEvent>;
    incrementWebhookEventAttempts(id: WebhookId, errorMessage?: string): Promise<WebhookEvent>;
    getSubscriptionStats(startDate?: Instant, endDate?: Instant): Promise<SubscriptionWithRelations[]>;
    getPaymentStats(startDate?: Instant, endDate?: Instant): Promise<PaymentWithRelations[]>;
    getCustomerCount(): Promise<number>;
    getActiveSubscriptionCount(): Promise<number>;
}
export type CreatePaymentRepositoryDeps = {
    tables: Pick<CoreTables, 'plans' | 'customers' | 'subscriptions' | 'payments' | 'webhookEvents'>;
};
export declare function createPaymentRepository(db: PaymentDatabase, { tables }: CreatePaymentRepositoryDeps): PaymentRepository;
//# sourceMappingURL=repository.d.ts.map