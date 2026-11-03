import type { AnyRelations } from 'drizzle-orm';
import type { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type { UserId } from './user-id.js';
import type { Instant } from '@arki/date';
import type { FailureOf } from '@arki/failure';
import type { PaymentQuery, PlanQuery, SubscriptionQuery } from './contracts.js';
import type { CoreTables } from './tables.js';
import type { Customer, CustomerId, NewCustomer, NewPlan, NewWebhookEvent, Payment, PaymentId, PaymentProviderType, PaymentStatus, PaymentWithRelations, Plan, PlanId, PlanTier, Subscription, SubscriptionId, SubscriptionStatus, SubscriptionWithPlan, SubscriptionWithRelations, UpdateCustomer, UpdatePlan, UpdateWebhookEvent, WebhookEvent, WebhookEventType, WebhookId } from './types.js';
import { CustomerConflict, WebhookEventNotFound } from './failures.js';
import { ReferenceNotFound } from './providers/provider-error.js';
import { claimWebhookEvent } from './webhook-claims.js';
type NotFound = FailureOf<typeof ReferenceNotFound>;
type EventNotFound = FailureOf<typeof WebhookEventNotFound>;
/**
 * Structural database type accepted by the payments repositories.
 *
 * Mirrors drizzle's public surface: a `NodePgDatabase`, an in-flight `NodePgTransaction` or a
 * PGlite database. The repositories only use `select / insert / update / delete`, so no
 * relations graph is needed: a plain `drizzle({ client })` works.
 */
export type PaymentDatabase = NodePgDatabase<AnyRelations> | NodePgTransaction<AnyRelations> | PgliteDatabase<AnyRelations>;
export declare class PaymentRepository {
    private readonly db;
    private readonly plans;
    private readonly customers;
    private readonly subscriptions;
    private readonly payments;
    private readonly webhookEvents;
    constructor(db: PaymentDatabase, tables: Pick<CoreTables, 'plans' | 'customers' | 'subscriptions' | 'payments' | 'webhookEvents'>);
    createPlan(data: NewPlan): Promise<Plan>;
    findPlanById(id: PlanId): Promise<Plan | null>;
    findPlansByTier(tier: PlanTier): Promise<Plan[]>;
    /** Plans matching the filters left in `query`, cheapest first within a tier, one page. */
    findPlans(query: PlanQuery): Promise<Plan[]>;
    findActivePlans(): Promise<Plan[]>;
    /** The updated plan, or `ReferenceNotFound` when no plan has this id. */
    updatePlan(id: PlanId, data: UpdatePlan): Promise<Plan | NotFound>;
    /** The deactivated plan, or `ReferenceNotFound` when no plan has this id. */
    deactivatePlan(id: PlanId): Promise<Plan | NotFound>;
    getPlan(id: PlanId): Promise<Plan | null>;
    /**
     * A user has one customer, and a provider customer is one row. Two checkouts that race to
     * create the same customer both succeed: the second gets the row the first wrote. A customer
     * that clashes with a different one (another provider id for the user, or the provider id
     * of another user) is returned as `CustomerConflict`, never a silent pick of either row.
     */
    createCustomer(data: NewCustomer): Promise<Customer | FailureOf<typeof CustomerConflict>>;
    findCustomerById(id: CustomerId): Promise<Customer | null>;
    findCustomerByUserId(userId: UserId): Promise<Customer | null>;
    findCustomerByProviderCustomerId(providerCustomerId: string, provider: PaymentProviderType): Promise<Customer | null>;
    /** The updated customer, or `ReferenceNotFound` when no customer has this id. */
    updateCustomer(id: CustomerId, data: UpdateCustomer): Promise<Customer | NotFound>;
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
    /**
     * Subscriptions with their plan and customer. Both foreign keys are required, so both joins
     * are inner joins. `limit`, `offset` and `orderBy` are optional parts of one query.
     */
    private readSubscriptions;
    /**
     * Payments with their customer and, when the payment has a subscription, that subscription
     * with its plan. A payment without a subscription has no `subscription` field.
     */
    private readPayments;
    createWebhookEvent(data: NewWebhookEvent): Promise<WebhookEvent>;
    /** Insert the event, or return the row that holds its id. See `claimWebhookEvent` in `webhook-claims.ts`. */
    claimWebhookEvent(data: NewWebhookEvent): ReturnType<typeof claimWebhookEvent>;
    /** Take over a failed or stale unprocessed event. See `reclaimWebhookEvent` in `webhook-claims.ts`. */
    reclaimWebhookEvent(id: WebhookId, seenAttempts: number, leaseCutoff: Instant): Promise<boolean>;
    findWebhookEventById(id: WebhookId): Promise<WebhookEvent | null>;
    findWebhookEventByProviderEventId(providerEventId: string, provider: PaymentProviderType): Promise<WebhookEvent | null>;
    findUnprocessedWebhookEvents(limit?: number): Promise<WebhookEvent[]>;
    findWebhookEventsByType(eventType: WebhookEventType): Promise<WebhookEvent[]>;
    /** The updated event, or `WebhookEventNotFound` when no event has this id. */
    updateWebhookEvent(id: WebhookId, data: UpdateWebhookEvent): Promise<WebhookEvent | EventNotFound>;
    /** The processed event, or `WebhookEventNotFound` when no event has this id. */
    markWebhookEventAsProcessed(id: WebhookId): Promise<WebhookEvent | EventNotFound>;
    /** The event with one more attempt, or `WebhookEventNotFound` when no event has this id. */
    incrementWebhookEventAttempts(id: WebhookId, errorMessage?: string): Promise<WebhookEvent | EventNotFound>;
    getSubscriptionStats(startDate?: Instant, endDate?: Instant): Promise<SubscriptionWithRelations[]>;
    getPaymentStats(startDate?: Instant, endDate?: Instant): Promise<PaymentWithRelations[]>;
    getCustomerCount(): Promise<number>;
    getActiveSubscriptionCount(): Promise<number>;
    /** How many payments were created from `start` (included) to `end` (excluded). */
    countPaymentsCreatedBetween(start: Instant, end: Instant): Promise<number>;
}
export type CreatePaymentRepositoryDeps = {
    tables: Pick<CoreTables, 'plans' | 'customers' | 'subscriptions' | 'payments' | 'webhookEvents'>;
};
export declare function createPaymentRepository(db: PaymentDatabase, { tables }: CreatePaymentRepositoryDeps): PaymentRepository;
export {};
//# sourceMappingURL=repository.d.ts.map