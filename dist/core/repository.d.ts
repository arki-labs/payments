import type { AnyRelations } from 'drizzle-orm';
import type { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type { UserId } from './user-id.js';
import type { Instant } from '@arki/date';
import type { FailureOf, SchemaFailure } from '@arki/failure';
import type { PaymentQuery, PlanQuery, SubscriptionQuery } from './contracts.js';
import type { CoreTables } from './tables.js';
import type { Customer, CustomerId, NewCustomer, NewPlan, NewWebhookEvent, Payment, PaymentId, PaymentProviderType, PaymentStatus, PaymentWithRelations, Plan, PlanId, PlanTier, Subscription, SubscriptionId, SubscriptionStatus, SubscriptionWithPlan, SubscriptionWithRelations, UpdateCustomer, UpdatePlan, UpdateWebhookEvent, WebhookEvent, WebhookEventType, WebhookId } from './types.js';
import { CounterExhausted, CustomerConflict, CustomerInUse, PlanAlreadyExists, WebhookEventExists, WebhookEventNotFound } from './failures.js';
import { ReferenceNotFound } from './providers/provider-error.js';
import { claimWebhookEvent } from './webhook-claims.js';
type NotFound = FailureOf<typeof ReferenceNotFound>;
type EventNotFound = FailureOf<typeof WebhookEventNotFound>;
type Conflict = FailureOf<typeof CustomerConflict>;
type EventExists = FailureOf<typeof WebhookEventExists>;
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
    private readonly writeSchemas;
    constructor(db: PaymentDatabase, tables: Pick<CoreTables, 'plans' | 'customers' | 'subscriptions' | 'payments' | 'webhookEvents'>);
    /**
     * The new plan. `InvalidInput` when a value does not fit its column (a negative or fractional
     * price, a currency outside ISO 4217, text with U+0000 or past its length, an interval count or
     * trial past 365 days); `PlanAlreadyExists` when a plan has `data.id`. Nothing is written then.
     */
    createPlan(data: NewPlan): Promise<Plan | SchemaFailure | FailureOf<typeof PlanAlreadyExists>>;
    /** Null too for an id no row can hold (U+0000, or longer than an id column), with no query. */
    findPlanById(id: PlanId): Promise<Plan | null>;
    /** Empty for a tier outside `planTierValues`, with no query. */
    findPlansByTier(tier: PlanTier): Promise<Plan[]>;
    /**
     * Plans matching the filters left in `query`, cheapest first within a tier, one page. `query` is a
     * value `planQuerySchema` accepts (a precondition: anything else, such as a fractional `limit`, throws
     * an invariant failure before any query).
     */
    findPlans(query: PlanQuery): Promise<Plan[]>;
    findActivePlans(): Promise<Plan[]>;
    /**
     * The updated plan, `ReferenceNotFound` when no plan has this id, or `InvalidInput` when a value
     * does not fit its column (the rules of `createPlan`).
     */
    updatePlan(id: PlanId, data: UpdatePlan): Promise<Plan | NotFound | SchemaFailure>;
    /** The deactivated plan, or `ReferenceNotFound` when no plan has this id (or it holds U+0000: no query then). */
    deactivatePlan(id: PlanId): Promise<Plan | NotFound>;
    getPlan(id: PlanId): Promise<Plan | null>;
    /**
     * A user has one customer, and a provider customer is one row. Two checkouts that race to
     * create the same customer both succeed: the second gets the row the first wrote. A customer
     * that clashes with a different one (another provider id for the user, or the provider id
     * of another user) is returned as `CustomerConflict`, never a silent pick of either row.
     *
     * `ReferenceNotFound` (kind `user`) when no user has `data.userId`, and `InvalidInput` when a value
     * does not fit its column (an email that is not an address or past 255 characters, text with
     * U+0000). Nothing is written then.
     */
    createCustomer(data: NewCustomer): Promise<Customer | Conflict | NotFound | SchemaFailure>;
    /** Null too for an id no row can hold (U+0000, or longer than an id column), with no query. */
    findCustomerById(id: CustomerId): Promise<Customer | null>;
    /** Null too for a user id no row can hold (U+0000, or longer than an id column), with no query. */
    findCustomerByUserId(userId: UserId): Promise<Customer | null>;
    /** Null too for an id no row can hold (U+0000, or past 255 characters), or a provider outside `paymentProviderValues`. */
    findCustomerByProviderCustomerId(providerCustomerId: string, provider: PaymentProviderType): Promise<Customer | null>;
    /**
     * The updated customer. `ReferenceNotFound` when no customer has this id (kind `customer`) or no
     * user has `data.userId` (kind `user`); `CustomerConflict` when the new `userId` already has
     * another customer, or the new provider customer id belongs to another customer; `InvalidInput`
     * when a value does not fit its column. Nothing is written then.
     */
    updateCustomer(id: CustomerId, data: UpdateCustomer): Promise<Customer | NotFound | Conflict | SchemaFailure>;
    /**
     * Deletes the customer, with its subscriptions and payments (their foreign keys cascade). An
     * unknown id deletes nothing. `CustomerInUse` when a row that does not cascade still points at the
     * customer or one of its payments (a refund): nothing is deleted then.
     */
    deleteCustomer(id: CustomerId): Promise<undefined | FailureOf<typeof CustomerInUse>>;
    /** Null too for an id no row can hold (U+0000, or longer than an id column), with no query. */
    findSubscriptionById(id: SubscriptionId): Promise<SubscriptionWithPlan | null>;
    /** Empty too for a user id no row can hold (U+0000, or longer than an id column), with no query. */
    findSubscriptionsByUserId(userId: UserId): Promise<Subscription[]>;
    /**
     * Subscriptions matching the filters left in `query`, newest first, one page. Empty for an id no row
     * can hold (U+0000, or longer than an id column), with no query. Otherwise `query` is a value `subscriptionQuerySchema` accepts (a
     * precondition: anything else, such as a fractional `limit`, throws an invariant failure before any query).
     */
    findSubscriptions(query: SubscriptionQuery): Promise<Subscription[]>;
    /** Null too for a user id no row can hold (U+0000, or longer than an id column), with no query. */
    findActiveSubscriptionByUserId(userId: UserId): Promise<SubscriptionWithPlan | null>;
    /** Null too for an id no row can hold (U+0000, or past 255 characters). */
    findSubscriptionByProviderSubscriptionId(providerSubscriptionId: string): Promise<Subscription | null>;
    /** Empty for a status outside `subscriptionStatusValues`, with no query. */
    findSubscriptionsByStatus(status: SubscriptionStatus): Promise<Subscription[]>;
    /**
     * Subscriptions in `status` (`active` when left out) whose current period ends between the two
     * times, both included. Empty for a status outside `subscriptionStatusValues`, with no query. Both times must fall in the years 1 to 9999 (a precondition: anything
     * else throws).
     */
    findSubscriptionsEndingInRange(startDate: Instant, endDate: Instant, status?: SubscriptionStatus): Promise<Subscription[]>;
    getSubscription(id: SubscriptionId): Promise<Subscription | null>;
    /** Null too for an id no row can hold (U+0000, or longer than an id column), with no query. */
    findPaymentById(id: PaymentId): Promise<Payment | null>;
    /**
     * The newest `limit` payments of the user; empty for a user id no row can hold (U+0000, or longer than an id column). `limit` is a
     * whole number of 0 or more (a precondition: anything else throws).
     */
    findPaymentsByUserId(userId: UserId, limit?: number): Promise<Payment[]>;
    /**
     * Payments matching the filters left in `query`, newest first, one page. `startDate` and `endDate` bound
     * `createdAt`, both inclusive. Empty for an id no row can hold (U+0000, or longer than an id column), with no query. Otherwise
     * `query` is a value `paymentQuerySchema` accepts (a precondition: anything else, such as a fractional
     * `limit` or a time outside the years 1 to 9999, throws an invariant failure before any query).
     */
    findPayments(query: PaymentQuery): Promise<Payment[]>;
    /** Empty too for an id no row can hold (U+0000, or longer than an id column), with no query. */
    findPaymentsBySubscriptionId(subscriptionId: SubscriptionId): Promise<Payment[]>;
    /** Null too for an id no row can hold (U+0000, or past 255 characters). */
    findPaymentByProviderPaymentId(providerPaymentId: string): Promise<Payment | null>;
    /** Empty for a status outside `paymentStatusValues`, with no query. */
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
    /**
     * The new event. `WebhookEventExists` when another event holds its provider event id or its id,
     * and `InvalidInput` when a value does not fit its column (an id past 255 characters, U+0000 in
     * text or in `data`, a `sourceIp` past 45 characters). Nothing is written then. A delivery handler
     * uses `claimWebhookEvent` instead, which hands back the stored copy.
     */
    createWebhookEvent(data: NewWebhookEvent): Promise<WebhookEvent | EventExists | SchemaFailure>;
    /**
     * Insert the event, or return the row that holds its id. See `claimWebhookEvent` in `webhook-claims.ts`,
     * which also returns `InvalidInput` when a value does not fit its column.
     */
    claimWebhookEvent(data: NewWebhookEvent): ReturnType<typeof claimWebhookEvent>;
    /**
     * Take over a failed or stale unprocessed event. See `reclaimWebhookEvent` in `webhook-claims.ts`:
     * `seenAttempts` is the whole `attempts` value read from the row, and `leaseCutoff` falls in the
     * years 1 to 9999 (preconditions: anything else throws).
     */
    reclaimWebhookEvent(id: WebhookId, seenAttempts: number, leaseCutoff: Instant): Promise<boolean | import("@arki/failure").Failure<"payments.counter_exhausted", {
        counter: "attempts" | "communicationsSent" | "customersReached" | "executions" | "paymentsRecovered" | "retryCount";
        id: string;
    }>>;
    /** Null too for an id no row can hold (U+0000, or longer than an id column), with no query. */
    findWebhookEventById(id: WebhookId): Promise<WebhookEvent | null>;
    /** Null too for an id no row can hold (U+0000, or past 255 characters), or a provider outside `paymentProviderValues`. */
    findWebhookEventByProviderEventId(providerEventId: string, provider: PaymentProviderType): Promise<WebhookEvent | null>;
    /**
     * The oldest `limit` unprocessed events; with `belowAttempts`, only those with fewer attempts.
     * Both are whole numbers of 0 or more (a precondition: anything else throws). A `belowAttempts` past
     * the 32-bit integer range matches every event, as the `attempts` column cannot hold more.
     */
    findUnprocessedWebhookEvents(limit?: number, belowAttempts?: number): Promise<WebhookEvent[]>;
    /**
     * The newest `limit` events, processed or not, created between the two times (both included, each
     * optional). A time given falls in the years 1 to 9999, and `limit` is a whole number of 0 or more
     * (preconditions: anything else throws).
     */
    findWebhookEventsCreatedBetween(startDate?: Instant, endDate?: Instant, limit?: number): Promise<WebhookEvent[]>;
    /** Empty for a type outside `webhookEventTypeValues`, with no query. */
    findWebhookEventsByType(eventType: WebhookEventType): Promise<WebhookEvent[]>;
    /**
     * The updated event. `WebhookEventNotFound` when no event has this id, `WebhookEventExists` when
     * another event holds the new provider event id, and `InvalidInput` when a value does not fit its
     * column (the rules of `createWebhookEvent`). Nothing is written then.
     */
    updateWebhookEvent(id: WebhookId, data: UpdateWebhookEvent): Promise<WebhookEvent | EventNotFound | EventExists | SchemaFailure>;
    /** The processed event, or `WebhookEventNotFound` when no event has this id. */
    markWebhookEventAsProcessed(id: WebhookId): Promise<WebhookEvent | EventNotFound>;
    /**
     * The event with one more attempt, `WebhookEventNotFound` when no event has this id,
     * `CounterExhausted` (`payments.counter_exhausted`) when its `attempts` already holds `INT4_MAX`, or
     * `InvalidInput` when `errorMessage` holds U+0000 (nothing is written for either failure).
     */
    incrementWebhookEventAttempts(id: WebhookId, errorMessage?: string): Promise<WebhookEvent | EventNotFound | FailureOf<typeof CounterExhausted> | SchemaFailure>;
    /** Subscriptions created between the two times, both included. A time given falls in the years 1 to 9999 (a precondition: anything else throws). */
    getSubscriptionStats(startDate?: Instant, endDate?: Instant): Promise<SubscriptionWithRelations[]>;
    /** Payments created between the two times, both included. A time given falls in the years 1 to 9999 (a precondition: anything else throws). */
    getPaymentStats(startDate?: Instant, endDate?: Instant): Promise<PaymentWithRelations[]>;
    getCustomerCount(): Promise<number>;
    getActiveSubscriptionCount(): Promise<number>;
    /** How many payments were created from `start` (included) to `end` (excluded). Both fall in the years 1 to 9999 (a precondition: anything else throws). */
    countPaymentsCreatedBetween(start: Instant, end: Instant): Promise<number>;
}
export type CreatePaymentRepositoryDeps = {
    tables: Pick<CoreTables, 'plans' | 'customers' | 'subscriptions' | 'payments' | 'webhookEvents'>;
};
export declare function createPaymentRepository(db: PaymentDatabase, { tables }: CreatePaymentRepositoryDeps): PaymentRepository;
export {};
//# sourceMappingURL=repository.d.ts.map