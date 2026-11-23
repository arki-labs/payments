import type { FailureOf, SchemaFailure } from '@arki/failure';
import type { CoreTables } from '../../core/tables.js';
import type { PaymentRetryService } from '../../core/services/payment-retry-service.js';
import type { UserId } from '../../core/user-id.js';
import type { CreateDunningCampaignInput, ExecuteCampaignInput, ListDunningCampaignsQuery, ListExecutionsQuery, UpdateDunningCampaignInput } from '../contracts.js';
import type { CustomerSegmentId, DunningCampaignId, DunningCampaignStatus } from '../primitives.js';
import type { DunningDatabase, ExecutionReferenceMissing } from '../repository.js';
import type { DunningTables } from '../tables.js';
import type { CampaignTrigger, DunningCampaign, DunningCampaignWithSteps, DunningDashboardStats, DunningExecution } from '../types.js';
import type { CommunicationOrchestrationService } from './communication-service.js';
import type { DunningTickReport } from '../failures.js';
import { DunningCampaignNotActive, DunningCampaignNotFound, DunningCampaignWithoutSteps, DunningTemplateInUse } from '../failures.js';
/**
 * Service for managing dunning campaigns
 * Handles campaign CRUD operations, template management, and execution orchestration
 */
export declare class DunningCampaignService {
    private readonly db;
    private readonly tables;
    private readonly communicationServiceFactory;
    private readonly _paymentRetryService?;
    private campaignRepo;
    private templateRepo;
    private executionRepo;
    constructor(db: DunningDatabase, tables: DunningCampaignServiceTables, communicationServiceFactory: () => CommunicationOrchestrationService, _paymentRetryService?: PaymentRetryService | undefined);
    private getCommunicationService;
    /**
     * Create a new dunning campaign with templates. The steps are parsed with `dunningCampaignTemplatesSchema`
     * and the campaign with `createDunningCampaignInputSchema` before any write; a value they refuse (a setting
     * or trigger count outside its range, NaN, a status no subscription has, an invalid spend range), or an
     * actor id or JSON Postgres cannot store, returns `schema.invalid_input` and writes nothing.
     */
    createCampaign(input: CreateDunningCampaignInput, createdBy: UserId): Promise<DunningCampaignWithSteps | SchemaFailure>;
    /**
     * Update an existing campaign.
     *
     * When `input.templates` is given it is the complete new set of steps (replace semantics, like create).
     * Steps are matched by `stepNumber`: a matching step is updated in place (its id, and so the history
     * that points at it, survives), a new number is inserted, and a number that is gone is deleted.
     * A step that already sent a communication cannot be deleted: the update returns
     * `DunningTemplateInUse` and nothing changes. Returns `null` for an unknown campaign (also an id no row
     * can hold), and `schema.invalid_input` for steps `dunningCampaignTemplatesSchema` refuses, campaign
     * fields `updateDunningCampaignInputSchema` refuses, or an actor id or JSON Postgres cannot store; nothing
     * is written then. Omit `templates` to leave the steps alone.
     */
    updateCampaign(campaignId: DunningCampaignId, input: UpdateDunningCampaignInput, updatedBy: UserId): Promise<DunningCampaignWithSteps | null | FailureOf<typeof DunningTemplateInUse> | SchemaFailure>;
    /**
     * Get campaign by ID with templates
     */
    getCampaign(campaignId: DunningCampaignId): Promise<DunningCampaignWithSteps | null>;
    /**
     * List campaigns with filtering and pagination. `limit` and `offset` are whole numbers of 0 or more (a
     * precondition: anything else throws an invariant failure); a `search` holding U+0000 matches nothing. A
     * `type`, `status` or `sortBy` outside its list returns `schema.invalid_input`.
     */
    listCampaigns(query: ListDunningCampaignsQuery): Promise<DunningCampaign[] | SchemaFailure>;
    /**
     * Delete a campaign with its steps, executions and analytics. A campaign whose step already sent a
     * communication cannot be deleted (the sent message keeps its step): it returns
     * `DunningTemplateInUse` and nothing changes; archive the campaign instead. An unknown id deletes
     * nothing.
     */
    deleteCampaign(campaignId: DunningCampaignId): Promise<FailureOf<typeof DunningTemplateInUse> | undefined>;
    /**
     * Activate or deactivate a campaign. A status or actor id Postgres cannot store returns `schema.invalid_input`.
     */
    updateCampaignStatus(campaignId: DunningCampaignId, status: DunningCampaignStatus, updatedBy: UserId): Promise<DunningCampaign | undefined | SchemaFailure>;
    /**
     * Execute a campaign manually or through automation: one scheduled execution per active step for
     * each eligible customer. An unknown campaign returns `DunningCampaignNotFound`, a campaign that is
     * not active `DunningCampaignNotActive`, one with no active step `DunningCampaignWithoutSteps`;
     * each writes nothing. A row deleted while the executions are written returns its not-found failure
     * (`ExecutionReferenceMissing`); the executions written before it stay. An input
     * `executeCampaignInputSchema` refuses (`customFilters.customerIds` or `excludeCustomerIds` with more than
     * `MAX_BATCH_ITEMS` (1,000) items) returns `schema.invalid_input` and runs nothing.
     */
    executeCampaign(input: ExecuteCampaignInput, _executedBy: string): Promise<DunningExecution[] | FailureOf<typeof DunningCampaignNotFound> | FailureOf<typeof DunningCampaignNotActive> | FailureOf<typeof DunningCampaignWithoutSteps> | ExecutionReferenceMissing | SchemaFailure>;
    /**
     * Find customers eligible for a campaign based on trigger conditions
     */
    private findEligibleCustomers;
    private findCustomersWithPaymentFailures;
    private findCustomersWithSubscriptionStatus;
    private findCustomersWithEndingTrials;
    /**
     * Run the scheduled executions that are due. Returns how many ran and each one that failed: one that
     * threw (a provider that cannot be reached, a database error) is marked `failed` with a `nextRetryAt`,
     * so `retryFailedExecutions` retries it; one whose message was refused is listed with the failure's
     * code and marked `failed` (with a `nextRetryAt` only for a 5xx refusal; a timeout is not retried, the
     * message may have gone out). One that ran but whose campaign analytics are full is complete and listed
     * with `payments.counter_exhausted` or `money.out_of_range`. A fault that stops
     * the whole tick is thrown. `limit` is a whole number of 0 or more (a precondition: anything else throws
     * an invariant failure before any query).
     */
    processScheduledExecutions(limit?: number): Promise<DunningTickReport>;
    /**
     * Execute a single scheduled execution. Returns the `SendFailure` of a message that did not go out:
     * the execution is then `failed`, with a `nextRetryAt` when a later try can work (a 5xx refusal,
     * within `MAX_EXECUTION_RETRIES`; `retryCount` is the retry this run counts as).
     * Returns the `MoneyFailure` of a stored payment the stop check could not read; the execution itself
     * is then complete and nothing was cancelled. Returns `CounterExhausted` (`payments.counter_exhausted`)
     * or `AmountOutOfRange` (`money.out_of_range`) when the campaign's analytics row cannot count what this
     * run did; the execution is complete and the stop check has run, only the analytics missed it.
     */
    private executeIndividualExecution;
    /**
     * Send the execution's message. Returns the result to store on the completed execution, or the
     * `SendFailure` when no message went out. A provider that cannot be reached, or a database error,
     * is thrown: the tick marks the execution failed and retries it.
     */
    private executeCommunication;
    /**
     * Check if current time is within business hours
     */
    private isBusinessHours;
    /**
     * Get next business hour in the specified timezone
     */
    private getNextBusinessHour;
    /**
     * Check if a given date falls on a business day
     */
    private isBusinessDay;
    /**
     * Check if payment was successful and stop subsequent executions. The payment row is read and
     * checked first, so a stored currency `@arki/money` refuses returns its `MoneyFailure` before any
     * execution is cancelled. A row of another shape than the query selects is a bug (`AssertError`).
     * Returns the failure of the analytics write (`payments.counter_exhausted`, `money.out_of_range`)
     * when the recovery cannot be counted; the executions are cancelled by then.
     */
    private checkAndStopOnPaymentSuccess;
    /**
     * Add the metrics to the campaign's analytics row of today and the currency, in one upsert. Returns
     * `CounterExhausted` (`payments.counter_exhausted`) when a counter would pass `INT4_MAX`, the most its
     * `integer` column holds, and `AmountOutOfRange` (`money.out_of_range`) when the recovered revenue
     * would pass 2^53 - 1 minor units, the most the column reads back exactly. Nothing is written then.
     */
    private updateCampaignAnalytics;
    /**
     * Campaign analytics of the last `days` days, or `AmountOutOfRange` (`money.out_of_range`) when the
     * revenue of one currency sums past 2^53 - 1 minor units. Precondition (anything else throws an invariant failure
     * and runs no query): `days` is a whole number from 0 to `MAX_DUNNING_DAYS` (100 years).
     */
    getCampaignAnalytics(campaignId?: DunningCampaignId, days?: number): Promise<import("@arki/failure").Failure<"money.out_of_range", undefined> | {
        executions: number;
        customersReached: number;
        communicationsSent: number;
        paymentsRecovered: number;
        conversionRate: number;
        roi: number;
        revenueRecovered: import("@arki/money/bag").MoneyBag;
    }>;
    /**
     * One page of executions, filtered and sorted as `query` says. `limit` and `offset` are whole numbers of
     * 0 or more and the times fall in the years 1 to 9999 (preconditions: anything else throws an invariant failure).
     * A `status` or `sortBy` outside its list returns `schema.invalid_input`.
     */
    listExecutions(query: ListExecutionsQuery): Promise<DunningExecution[] | SchemaFailure>;
    /**
     * The numbers on the dunning dashboard, all read from the tables: campaign counts, what ran
     * today (since 00:00 UTC), what was recovered today and this month, the conversion rate and
     * the top campaign over the last 30 days, and the latest executions. Returns `AmountOutOfRange`
     * (`money.out_of_range`) when a revenue total sums past 2^53 - 1 minor units (see `getAnalyticsSince`).
     */
    getDashboardStats(): Promise<DunningDashboardStats | import("@arki/failure").Failure<"money.out_of_range", undefined>>;
    /**
     * Retry the failed executions whose `nextRetryAt` has passed. Each retry counts once in
     * `retryCount` and runs the execution again. A retry that throws, or whose message is refused with
     * a 5xx, is `failed` again with the next
     * `nextRetryAt` (30 minutes, then 60, then 120), so a later call picks it again; after
     * `MAX_EXECUTION_RETRIES` (3) retries it stays failed with no `nextRetryAt`. An execution whose
     * `retryCount` is already full (`payments.counter_exhausted`) is not run: it is reported and stays
     * failed with no `nextRetryAt`. Returns how many were retried and each retry that threw again. `limit` is a whole number of 0 or more (a precondition:
     * anything else throws an invariant failure before any query).
     */
    retryFailedExecutions(limit?: number): Promise<DunningTickReport>;
    /**
     * Find active campaigns for a specific trigger. A trigger type or segment id Postgres cannot store returns
     * `schema.invalid_input`.
     */
    findActiveCampaignsForTrigger(triggerType: CampaignTrigger['type'], customerSegmentIds?: CustomerSegmentId[]): Promise<DunningCampaign[] | SchemaFailure>;
}
export type DunningCampaignServiceTables = Pick<DunningTables, 'dunningCampaigns' | 'dunningCampaignAnalytics' | 'dunningTemplates' | 'dunningExecutions' | 'dunningCommunications' | 'customerRiskProfiles'> & Pick<CoreTables, 'customers' | 'payments' | 'subscriptions'>;
/**
 * Factory function to create DunningCampaignService.
 */
export declare function createDunningCampaignService(db: DunningDatabase, tables: DunningCampaignServiceTables, communicationServiceFactory: () => CommunicationOrchestrationService, paymentRetryService?: PaymentRetryService): DunningCampaignService;
//# sourceMappingURL=campaign-service.d.ts.map