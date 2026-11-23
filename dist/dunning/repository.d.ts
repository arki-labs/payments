import type { AnyRelations } from 'drizzle-orm';
import type { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type { FailureOf, SchemaFailure } from '@arki/failure';
import type { Instant } from '@arki/date';
import type { CustomerId } from '../core/primitives.js';
import type { UserId } from '../core/user-id.js';
import { CounterExhausted } from '../core/failures.js';
import { ReferenceNotFound } from '../core/providers/provider-error.js';
import type { CreateCustomerSegmentInput, CreateDunningCampaignInput, CreateDunningTemplateInput, ListCommunicationsQuery, ListCustomerSegmentsQuery, ListDunningCampaignsQuery, ListExecutionsQuery, UpdateCustomerSegmentInput, UpdateDunningCampaignInput, UpdateDunningTemplateInput } from './contracts.js';
import type { CustomerSegmentId, DunningCampaignId, DunningCampaignType, DunningCommunicationId, DunningExecutionId, DunningTemplateId, ExecutionStatus, RiskCategory } from './primitives.js';
import type { DunningTables } from './tables.js';
import type { CampaignTrigger, CustomerRiskProfile, DunningCampaign, DunningCommunication, DunningExecution, DunningTemplate, ExecutionResultDb, NewDunningCommunication, NewDunningExecution } from './types.js';
import { CustomerRiskProfileExists, DunningCampaignNotFound, DunningExecutionNotFound, DunningTemplateInUse, DunningTemplateNotFound } from './failures.js';
/**
 * Structural database type accepted by the dunning repositories. See the
 * `PaymentDatabase` doc in `../core/repository`: the repositories only use
 * `select / insert / update / delete`, so no relations graph is needed. PGlite
 * is accepted so the package can run these queries in its own tests.
 */
export type DunningDatabase = NodePgDatabase<AnyRelations> | NodePgTransaction<AnyRelations> | PgliteDatabase<AnyRelations>;
/** An execution write that points at a campaign, step, customer, subscription or payment with no row. */
export type ExecutionReferenceMissing = FailureOf<typeof DunningCampaignNotFound> | FailureOf<typeof DunningTemplateNotFound> | FailureOf<typeof ReferenceNotFound>;
/** A communication write that points at an execution, step or customer with no row. */
export type CommunicationReferenceMissing = FailureOf<typeof DunningExecutionNotFound> | FailureOf<typeof DunningTemplateNotFound> | FailureOf<typeof ReferenceNotFound>;
/** The tables the campaign repository reads: its steps and their communications decide whether a delete may run. */
type CampaignTables = Pick<DunningTables, 'dunningCampaigns' | 'dunningCampaignAnalytics' | 'dunningTemplates' | 'dunningCommunications'>;
export declare class DunningCampaignRepository {
    private readonly db;
    private readonly dunningCampaigns;
    private readonly dunningCampaignAnalytics;
    private readonly dunningTemplates;
    private readonly dunningCommunications;
    constructor(db: DunningDatabase, tables: CampaignTables);
    /** The campaign, or `null` for an unknown id (also one no row can hold, without a query). */
    findById(id: DunningCampaignId): Promise<DunningCampaign | null>;
    /**
     * One page of campaigns. Preconditions (anything else throws an invariant failure and runs no query):
     * `limit` and `offset` are whole numbers of 0 or more. A `search` holding U+0000 matches no campaign.
     */
    findMany(query: ListDunningCampaignsQuery): Promise<DunningCampaign[] | SchemaFailure>;
    /**
     * The new campaign. The input is parsed with its contract (`createDunningCampaignInputSchema`, steps
     * aside): a value it refuses (a name over 255 characters or holding U+0000, a setting or trigger day count
     * outside its range, NaN, a status or tier no row has, an invalid spend range), an actor id that is not a
     * `usr_` id Postgres can store, or JSON a jsonb column cannot store (a lone surrogate, a bigint) returns
     * `schema.invalid_input` and writes nothing.
     */
    create(input: CreateDunningCampaignInput & {
        createdBy: UserId;
    }): Promise<DunningCampaign | SchemaFailure>;
    /**
     * The updated campaign, `null` for an unknown id (also one no row can hold). A value
     * `updateDunningCampaignInputSchema` refuses, an actor id, or JSON Postgres cannot store returns
     * `schema.invalid_input` and writes nothing, as in `create`.
     */
    update(id: DunningCampaignId, input: UpdateDunningCampaignInput & {
        updatedBy: UserId;
    }): Promise<DunningCampaign | null | SchemaFailure>;
    /**
     * Deletes the campaign with its steps, executions and analytics. A campaign whose step already sent
     * a communication is kept (the sent message keeps its step): it returns `DunningTemplateInUse` and
     * nothing changes. An unknown id (also one no row can hold) deletes nothing.
     */
    delete(id: DunningCampaignId): Promise<FailureOf<typeof DunningTemplateInUse> | undefined>;
    /** The active campaigns of the type. A type no campaign has returns `schema.invalid_input`. */
    findByType(type: DunningCampaignType): Promise<DunningCampaign[] | SchemaFailure>;
    /**
     * The active campaigns of the trigger type, highest priority first. With segment ids, only the campaigns
     * that target one of them; a segment id no row can hold (U+0000) targets none, so a list of only such ids
     * answers `[]` without a query. A trigger type no campaign has, or more than `MAX_BATCH_ITEMS` (1,000)
     * segment ids, returns `schema.invalid_input`.
     */
    findActiveForTrigger(triggerType: CampaignTrigger['type'], customerSegmentIds?: CustomerSegmentId[]): Promise<DunningCampaign[] | SchemaFailure>;
    /**
     * Set the campaign's status. An actor id that is not a `usr_` id Postgres can store returns
     * `schema.invalid_input`, and so does a status no campaign has; an unknown id (also one no row can hold)
     * returns `undefined`. Nothing is written then.
     */
    updateStatus(id: DunningCampaignId, status: 'active' | 'draft' | 'archived' | 'paused', updatedBy: UserId): Promise<DunningCampaign | undefined | SchemaFailure>;
    /**
     * The analytics of the last `days` calendar days, summed, as `getAnalyticsSince` sums them (also its
     * `money.out_of_range`). Precondition (anything else throws an
     * invariant failure and runs no query): `days` is a whole number from 0 to `MAX_DUNNING_DAYS` (100 years).
     * A campaign id no row can hold sums no row: zero counts and no money.
     */
    getAnalyticsSummary(campaignId?: DunningCampaignId, days?: number): Promise<import("@arki/failure").Failure<"money.out_of_range", undefined> | {
        executions: number;
        customersReached: number;
        communicationsSent: number;
        paymentsRecovered: number;
        conversionRate: number;
        roi: number;
        revenueRecovered: import("@arki/money/bag").MoneyBag;
    }>;
    /** How many campaigns exist, and how many of them are `active`. */
    countCampaigns(): Promise<{
        total: number;
        active: number;
    }>;
    /**
     * The campaign that recovered the most payments since `since`, its conversion rate the
     * tie-break. Null when no campaign recovered a payment: there is no top to name. Ranked
     * by count, not money, because campaigns recover in different currencies. Precondition (anything else
     * throws an invariant failure and runs no query): `since` falls in the years 1 to 9999.
     */
    findTopPerformer(since: Instant): Promise<{
        campaignId: DunningCampaignId;
        paymentsRecovered: number;
        conversionRate: number;
    } | null>;
    /**
     * The analytics rows from `since` on, summed. Money stays one balance per currency. Returns
     * `AmountOutOfRange` (`money.out_of_range`) when the revenue of one currency sums past 2^53 - 1 minor
     * units: each row holds at most that much, but many rows can add up past it. Precondition
     * (anything else throws an invariant failure and runs no query): `since` falls in the years 1 to 9999.
     * A campaign id no row can hold (U+0000) sums no row: zero counts and no money, without a query.
     */
    getAnalyticsSince(since: Instant, campaignId?: DunningCampaignId): Promise<import("@arki/failure").Failure<"money.out_of_range", undefined> | {
        executions: number;
        customersReached: number;
        communicationsSent: number;
        paymentsRecovered: number;
        conversionRate: number;
        roi: number;
        revenueRecovered: import("@arki/money/bag").MoneyBag;
    }>;
}
/** The tables the step repository reads: a step's communications decide whether it may be deleted. */
type TemplateTables = Pick<DunningTables, 'dunningTemplates' | 'dunningCommunications'>;
export declare class DunningTemplateRepository {
    private readonly db;
    private readonly dunningTemplates;
    private readonly dunningCommunications;
    constructor(db: DunningDatabase, tables: TemplateTables);
    /** The step, or `null` for an unknown id (also one no row can hold, without a query). */
    findById(id: DunningTemplateId): Promise<DunningTemplate | null>;
    /** The campaign's steps in step order; `[]` for an unknown campaign (also an id no row can hold). */
    findByCampaignId(campaignId: DunningCampaignId): Promise<DunningTemplate[]>;
    /**
     * The new step. The input is parsed with `createDunningTemplateInputSchema` first: a value it refuses
     * (text over its length or holding U+0000, a step number or delay outside its range), or a message
     * its jsonb column cannot store (a lone surrogate), returns `schema.invalid_input`, and no campaign with
     * `input.campaignId` returns `DunningCampaignNotFound`; nothing is written then.
     */
    create(input: CreateDunningTemplateInput): Promise<DunningTemplate | FailureOf<typeof DunningCampaignNotFound> | SchemaFailure>;
    /**
     * The updated step, `null` for an unknown id (also one no row can hold). The input is parsed with
     * `updateDunningTemplateInputSchema` first: a value it refuses, or a message its jsonb column cannot
     * store, returns `schema.invalid_input` and writes nothing.
     */
    update(id: DunningTemplateId, input: UpdateDunningTemplateInput): Promise<DunningTemplate | null | SchemaFailure>;
    /**
     * Deletes the step. A step that already sent a communication is kept (the sent message keeps its
     * step): it returns `DunningTemplateInUse` and nothing changes. An unknown id (also one no row can hold)
     * deletes nothing.
     */
    delete(id: DunningTemplateId): Promise<FailureOf<typeof DunningTemplateInUse> | undefined>;
    /** The campaign's active steps in step order; `[]` for an unknown campaign (also an id no row can hold). */
    findActiveTemplates(campaignId: DunningCampaignId): Promise<DunningTemplate[]>;
    /** Turn the step on or off; `undefined` for an unknown id (also one no row can hold). */
    updateStatus(id: DunningTemplateId, isActive: boolean): Promise<DunningTemplate | undefined>;
}
export declare class DunningExecutionRepository {
    private readonly db;
    private readonly dunningExecutions;
    constructor(db: DunningDatabase, tables: Pick<DunningTables, 'dunningExecutions'>);
    /** The execution, or `null` for an unknown id (also one no row can hold, without a query). */
    findById(id: DunningExecutionId): Promise<DunningExecution | null>;
    /**
     * One page of executions. Preconditions (anything else throws an invariant failure and runs no query):
     * `limit` and `offset` are whole numbers of 0 or more; `scheduledAfter` and `scheduledBefore` fall in
     * the years 1 to 9999. A campaign or customer id no row can hold (U+0000) matches none: `[]`.
     */
    findMany(query: ListExecutionsQuery): Promise<DunningExecution[] | SchemaFailure>;
    /**
     * The new execution, or the failure that names the row it points at that does not exist:
     * `DunningCampaignNotFound`, `DunningTemplateNotFound`, or `ReferenceNotFound` for the customer,
     * subscription or payment (also for an id no row can hold). Text, JSON or a time its column cannot store
     * (a time outside the years 1 to 9999) returns `schema.invalid_input`. Nothing is written then.
     */
    create(input: Omit<NewDunningExecution, 'id' | 'createdAt' | 'updatedAt'>): Promise<DunningExecution | ExecutionReferenceMissing | SchemaFailure>;
    private insertExecution;
    /**
     * Set the execution's status, with its result or error message. A result, message or `customScheduledAt`
     * its column cannot store (a time outside the years 1 to 9999) returns `schema.invalid_input` and writes
     * nothing; an unknown id (also one no row can hold) returns `undefined`.
     */
    updateStatus(id: DunningExecutionId, status: ExecutionStatus, result?: ExecutionResultDb, errorMessage?: string, customScheduledAt?: Instant): Promise<DunningExecution | undefined | SchemaFailure>;
    /** The due scheduled executions, oldest first. `limit` is a whole number of 0 or more (a precondition: anything else throws an invariant failure). */
    findScheduledExecutions(limit?: number): Promise<DunningExecution[]>;
    /** The failed executions whose retry is due. `limit` is a whole number of 0 or more (a precondition: anything else throws an invariant failure). */
    findRetryableExecutions(limit?: number): Promise<DunningExecution[]>;
    /**
     * Start one retry of a failed execution, in one update: it is `running` again, its `retryCount`
     * goes up by one and it has no `nextRetryAt` until it fails again. Returns the updated row,
     * `undefined` for an unknown id (also one no row can hold), or `CounterExhausted`
     * (`payments.counter_exhausted`) when `retryCount` already holds `INT4_MAX` (nothing is written then).
     */
    startRetry(id: DunningExecutionId): Promise<DunningExecution | FailureOf<typeof CounterExhausted> | undefined>;
    /**
     * Record a run that threw, in one update: status `failed`, the error message and when to retry it.
     * `findRetryableExecutions` picks it again once `nextRetryAt` has passed; `null` means it is never
     * retried. Returns the updated row, or `undefined` for an unknown id (also one no row can hold).
     * Precondition (anything else throws an invariant failure and writes nothing): `nextRetryAt` is `null`
     * or falls in the years 1 to 9999.
     */
    recordFailure(id: DunningExecutionId, errorMessage: string, nextRetryAt: Instant | null): Promise<DunningExecution | undefined>;
    /**
     * The customer's executions of the campaign created in the last `hours` hours, newest first.
     * Precondition (anything else throws an invariant failure and runs no query): `hours` is a whole
     * number from 0 to `MAX_DUNNING_HOURS` (100 years). An id no row can hold (U+0000) matches none: `[]`.
     */
    findRecentForCustomer(customerId: CustomerId, campaignId: DunningCampaignId, hours?: number): Promise<DunningExecution[]>;
}
export declare class DunningCommunicationRepository {
    private readonly db;
    private readonly dunningCommunications;
    constructor(db: DunningDatabase, tables: Pick<DunningTables, 'dunningCommunications'>);
    /** The communication, or `null` for an unknown id (also one no row can hold, without a query). */
    findById(id: DunningCommunicationId): Promise<DunningCommunication | null>;
    /**
     * One page of communications. Preconditions (anything else throws an invariant failure and runs no
     * query): `limit` and `offset` are whole numbers of 0 or more; `sentAfter` and `sentBefore` fall in the
     * years 1 to 9999. An execution or customer id no row can hold (U+0000) matches none: `[]`.
     */
    findMany(query: ListCommunicationsQuery): Promise<DunningCommunication[] | SchemaFailure>;
    /**
     * The new communication, or the failure that names the row it points at that does not exist:
     * `DunningExecutionNotFound`, `DunningTemplateNotFound`, or `ReferenceNotFound` for the customer (also
     * for an id no row can hold). Text, JSON or a time its column cannot store (a recipient over 255
     * characters, U+0000, a lone surrogate in JSON, a time outside the years 1 to 9999) returns
     * `schema.invalid_input`. Nothing is written then.
     */
    create(input: Omit<NewDunningCommunication, 'id' | 'createdAt' | 'updatedAt'>): Promise<DunningCommunication | CommunicationReferenceMissing | SchemaFailure>;
    private insertCommunication;
    /**
     * Set the communication's status and the fields that go with it. Text, JSON or a time its column cannot
     * store (a time outside the years 1 to 9999) returns `schema.invalid_input` and writes nothing; `null` for
     * an unknown id (also one no row can hold).
     */
    updateStatus(id: DunningCommunicationId, status: DunningCommunication['status'], updates?: {
        sentAt?: Instant;
        deliveredAt?: Instant;
        openedAt?: Instant;
        clickedAt?: Instant;
        failureReason?: string;
        providerMessageId?: string;
        providerResponse?: Record<string, unknown>;
        trackingData?: Record<string, unknown>;
    }): Promise<DunningCommunication | null | SchemaFailure>;
    /** The pending communications, oldest first. `limit` is a whole number of 0 or more (a precondition: anything else throws an invariant failure). */
    findPendingCommunications(limit?: number): Promise<DunningCommunication[]>;
    /** The communication the provider knows by this id. An id the column cannot hold matches none. */
    findByProviderMessageId(providerMessageId: string): Promise<DunningCommunication | undefined>;
    /**
     * The execution's communications counted by outcome. An execution id no row can hold (U+0000) has none:
     * zero counts, without a query.
     */
    getMetricsForExecution(executionId: DunningExecutionId): Promise<{
        total: number;
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        failed: number;
    } | undefined>;
}
type CustomerSegmentRow = DunningTables['customerSegments']['$inferSelect'];
export declare class CustomerSegmentRepository {
    private readonly db;
    private readonly customerSegments;
    constructor(db: DunningDatabase, tables: Pick<DunningTables, 'customerSegments'>);
    /** The segment, or `undefined` for an unknown id (also one no row can hold, without a query). */
    findById(id: CustomerSegmentId): Promise<CustomerSegmentRow | undefined>;
    /**
     * One page of segments. Preconditions (anything else throws an invariant failure and runs no query):
     * `limit` and `offset` are whole numbers of 0 or more. A `search` holding U+0000 matches no segment.
     */
    findMany(query: ListCustomerSegmentsQuery): Promise<CustomerSegmentRow[] | SchemaFailure>;
    /**
     * The new segment. The input is parsed with `createCustomerSegmentInputSchema`: a value it refuses (a name
     * over 255 characters or holding U+0000, a frequency outside int4, criteria outside their bounds such as a
     * plan tier no plan has or an invalid spend range), an actor id that is not a `usr_` id Postgres can store,
     * or criteria JSON a jsonb column cannot store (a lone surrogate, a bigint) returns `schema.invalid_input`
     * and writes nothing.
     */
    create(input: CreateCustomerSegmentInput & {
        createdBy: UserId;
    }): Promise<CustomerSegmentRow | undefined | SchemaFailure>;
    /**
     * The updated segment, `undefined` for an unknown id (also one no row can hold). A value
     * `updateCustomerSegmentInputSchema` refuses, or criteria JSON Postgres cannot store, returns
     * `schema.invalid_input` and writes nothing, as in `create`.
     */
    update(id: CustomerSegmentId, input: UpdateCustomerSegmentInput): Promise<CustomerSegmentRow | undefined | SchemaFailure>;
    /** Delete the segment. An unknown id (also one no row can hold) deletes nothing. */
    delete(id: CustomerSegmentId): Promise<void>;
    /**
     * Store the segment's customer count. A count `customer_count` (int4) cannot hold returns
     * `schema.invalid_input`; an unknown id (also one no row can hold) returns `undefined`.
     */
    updateCustomerCount(id: CustomerSegmentId, count: number): Promise<CustomerSegmentRow | undefined | SchemaFailure>;
    findSegmentsForAutoUpdate(): Promise<CustomerSegmentRow[]>;
}
/** What a risk profile write takes: the stored row without its id and timestamps. */
type RiskProfileInput = Omit<CustomerRiskProfile, 'id' | 'createdAt' | 'updatedAt'>;
/** The risk profile write that names a customer with no row. */
type CustomerNotFound = FailureOf<typeof ReferenceNotFound>;
export declare class CustomerRiskProfileRepository {
    private readonly db;
    private readonly customerRiskProfiles;
    constructor(db: DunningDatabase, tables: Pick<DunningTables, 'customerRiskProfiles'>);
    /** The customer's profile, or `undefined` when there is none (also for an id no row can hold, without a query). */
    findByCustomerId(customerId: CustomerId): Promise<CustomerRiskProfile | undefined>;
    /**
     * The new profile, or `ReferenceNotFound` (`kind: 'customer'`) when no customer has
     * `input.customerId` (also for an id no row can hold); nothing is written then. A customer has one profile: a second `create` for it
     * returns `CustomerRiskProfileExists` and changes nothing, so use `upsert` to replace one. JSON its
     * columns cannot store returns `schema.invalid_input` and writes nothing.
     */
    create(input: RiskProfileInput): Promise<CustomerRiskProfile | CustomerNotFound | FailureOf<typeof CustomerRiskProfileExists> | SchemaFailure>;
    /**
     * The updated profile, or `undefined` when the customer has no profile (also for an id no row can hold).
     * JSON its columns cannot store returns `schema.invalid_input` and writes nothing.
     */
    update(customerId: CustomerId, input: Partial<Omit<CustomerRiskProfile, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>>): Promise<CustomerRiskProfile | undefined | SchemaFailure>;
    /**
     * Writes the customer's one profile: inserts it, or replaces the stored one in the same statement
     * (the unique index on `customer_id`), so two first upserts at once still leave one row. Returns
     * `ReferenceNotFound` (`kind: 'customer'`) when no customer has `input.customerId` (also for an id no
     * row can hold), and
     * `schema.invalid_input` for JSON its columns cannot store; nothing is written then.
     */
    upsert(input: RiskProfileInput): Promise<CustomerRiskProfile | CustomerNotFound | SchemaFailure>;
    /**
     * The profiles in the category, highest score first. `limit` is a whole number of 0 or more (a precondition:
     * anything else throws an invariant failure). A category no profile has returns `schema.invalid_input`.
     */
    findByRiskCategory(category: RiskCategory, limit?: number): Promise<CustomerRiskProfile[] | SchemaFailure>;
    /**
     * The profiles in the segment. `limit` is a whole number of 0 or more (a precondition: anything else throws
     * an invariant failure). The id is compared as jsonb: one jsonb cannot hold (U+0000, a lone surrogate)
     * is in no profile's list, so it answers `[]` without a query.
     */
    findBySegmentId(segmentId: CustomerSegmentId, limit?: number): Promise<CustomerRiskProfile[]>;
    /**
     * Replace the segments of the customer's profile. Segment ids the jsonb column cannot store (U+0000, a lone
     * surrogate) return `schema.invalid_input` and write nothing; `undefined` when the customer has no profile
     * (also for an id no row can hold).
     */
    updateSegments(customerId: CustomerId, segmentIds: CustomerSegmentId[]): Promise<CustomerRiskProfile | undefined | SchemaFailure>;
}
export type DunningRepositoryTables = Pick<DunningTables, 'dunningCampaigns' | 'dunningCampaignAnalytics' | 'dunningTemplates' | 'dunningExecutions' | 'dunningCommunications' | 'customerSegments' | 'customerRiskProfiles'>;
export declare function createDunningCampaignRepository(db: DunningDatabase, tables: CampaignTables): DunningCampaignRepository;
export declare function createDunningTemplateRepository(db: DunningDatabase, tables: TemplateTables): DunningTemplateRepository;
export declare function createDunningExecutionRepository(db: DunningDatabase, tables: Pick<DunningTables, 'dunningExecutions'>): DunningExecutionRepository;
export declare function createDunningCommunicationRepository(db: DunningDatabase, tables: Pick<DunningTables, 'dunningCommunications'>): DunningCommunicationRepository;
export declare function createCustomerSegmentRepository(db: DunningDatabase, tables: Pick<DunningTables, 'customerSegments'>): CustomerSegmentRepository;
export declare function createCustomerRiskProfileRepository(db: DunningDatabase, tables: Pick<DunningTables, 'customerRiskProfiles'>): CustomerRiskProfileRepository;
/**
 * Aggregate factory for all dunning repositories.
 */
export declare function createDunningRepository(db: DunningDatabase, tables: DunningRepositoryTables): {
    campaigns: DunningCampaignRepository;
    templates: DunningTemplateRepository;
    executions: DunningExecutionRepository;
    communications: DunningCommunicationRepository;
    customerSegments: CustomerSegmentRepository;
    customerRiskProfiles: CustomerRiskProfileRepository;
};
export {};
//# sourceMappingURL=repository.d.ts.map