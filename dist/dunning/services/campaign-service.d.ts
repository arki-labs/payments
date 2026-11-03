import type { FailureOf } from '@arki/failure';
import type { CoreTables } from '../../core/tables.js';
import type { PaymentRetryService } from '../../core/services/payment-retry-service.js';
import type { CreateDunningCampaignInput, ExecuteCampaignInput, ListDunningCampaignsQuery, ListExecutionsQuery, UpdateDunningCampaignInput } from '../contracts.js';
import type { DunningCampaignId, DunningCampaignStatus } from '../primitives.js';
import type { DunningDatabase } from '../repository.js';
import type { DunningTables } from '../tables.js';
import type { DunningCampaign, DunningCampaignWithSteps, DunningDashboardStats, DunningExecution } from '../types.js';
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
     * Create a new dunning campaign with templates
     */
    createCampaign(input: CreateDunningCampaignInput, createdBy: string): Promise<DunningCampaignWithSteps>;
    /**
     * Update an existing campaign.
     *
     * When `input.templates` is given it is the complete new set of steps (replace semantics, like create).
     * Steps are matched by `stepNumber`: a matching step is updated in place (its id, and so the history
     * that points at it, survives), a new number is inserted, and a number that is gone is deleted.
     * A step that already sent a communication cannot be deleted: the update returns
     * `DunningTemplateInUse` and nothing changes. Returns `null` for an unknown campaign.
     * Omit `templates` to leave the steps alone.
     */
    updateCampaign(campaignId: DunningCampaignId, input: UpdateDunningCampaignInput, updatedBy: string): Promise<DunningCampaignWithSteps | null | FailureOf<typeof DunningTemplateInUse>>;
    /**
     * Get campaign by ID with templates
     */
    getCampaign(campaignId: DunningCampaignId): Promise<DunningCampaignWithSteps | null>;
    /**
     * List campaigns with filtering and pagination
     */
    listCampaigns(query: ListDunningCampaignsQuery): Promise<DunningCampaign[]>;
    /**
     * Delete a campaign and all related data
     */
    deleteCampaign(campaignId: DunningCampaignId): Promise<void>;
    /**
     * Activate or deactivate a campaign
     */
    updateCampaignStatus(campaignId: DunningCampaignId, status: DunningCampaignStatus, updatedBy: string): Promise<DunningCampaign | undefined>;
    /**
     * Execute a campaign manually or through automation: one scheduled execution per active step for
     * each eligible customer. An unknown campaign returns `DunningCampaignNotFound`, a campaign that is
     * not active `DunningCampaignNotActive`, one with no active step `DunningCampaignWithoutSteps`;
     * each writes nothing.
     */
    executeCampaign(input: ExecuteCampaignInput, _executedBy: string): Promise<DunningExecution[] | FailureOf<typeof DunningCampaignNotFound> | FailureOf<typeof DunningCampaignNotActive> | FailureOf<typeof DunningCampaignWithoutSteps>>;
    /**
     * Find customers eligible for a campaign based on trigger conditions
     */
    private findEligibleCustomers;
    private findCustomersWithPaymentFailures;
    private findCustomersWithSubscriptionStatus;
    private findCustomersWithEndingTrials;
    /**
     * Run the scheduled executions that are due. Returns how many ran and each one that threw (it is
     * marked `failed`); a fault that stops the whole tick is thrown.
     */
    processScheduledExecutions(limit?: number): Promise<DunningTickReport>;
    /**
     * Execute a single scheduled execution. Returns the `MoneyFailure` of a stored payment the stop
     * check could not read; the execution itself is then complete and nothing was cancelled.
     */
    private executeIndividualExecution;
    /**
     * Execute communication for an execution
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
     */
    private checkAndStopOnPaymentSuccess;
    /**
     * Update campaign analytics with new metrics
     */
    private updateCampaignAnalytics;
    /**
     * Get campaign analytics and performance metrics
     */
    getCampaignAnalytics(campaignId?: DunningCampaignId, days?: number): Promise<{
        executions: number;
        customersReached: number;
        communicationsSent: number;
        paymentsRecovered: number;
        conversionRate: number;
        roi: number;
        revenueRecovered: import("@arki/money/bag").MoneyBag;
    }>;
    /** One page of executions, filtered and sorted as `query` says. */
    listExecutions(query: ListExecutionsQuery): Promise<DunningExecution[]>;
    /**
     * The numbers on the dunning dashboard, all read from the tables: campaign counts, what ran
     * today (since 00:00 UTC), what was recovered today and this month, the conversion rate and
     * the top campaign over the last 30 days, and the latest executions.
     */
    getDashboardStats(): Promise<DunningDashboardStats>;
    /**
     * Retry failed executions with exponential backoff
     * This method finds executions that are ready to retry (nextRetryAt is in the past)
     * and attempts to execute them again. If they fail again, it schedules the next retry
     * with exponential backoff. Returns how many were retried and each retry that threw again.
     */
    retryFailedExecutions(limit?: number): Promise<DunningTickReport>;
    /**
     * Find active campaigns for a specific trigger
     */
    findActiveCampaignsForTrigger(triggerType: string, customerSegmentIds?: string[]): Promise<DunningCampaign[]>;
}
export type DunningCampaignServiceTables = Pick<DunningTables, 'dunningCampaigns' | 'dunningCampaignAnalytics' | 'dunningTemplates' | 'dunningExecutions' | 'dunningCommunications' | 'customerRiskProfiles'> & Pick<CoreTables, 'customers' | 'payments' | 'subscriptions'>;
/**
 * Factory function to create DunningCampaignService.
 */
export declare function createDunningCampaignService(db: DunningDatabase, tables: DunningCampaignServiceTables, communicationServiceFactory: () => CommunicationOrchestrationService, paymentRetryService?: PaymentRetryService): DunningCampaignService;
//# sourceMappingURL=campaign-service.d.ts.map