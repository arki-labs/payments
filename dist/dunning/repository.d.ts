import type { AnyRelations } from 'drizzle-orm';
import type { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type { Instant } from '@arki/date';
import type { CustomerId } from '../core/primitives.js';
import type { CreateCustomerSegmentInput, CreateDunningCampaignInput, CreateDunningTemplateInput, ListCommunicationsQuery, ListCustomerSegmentsQuery, ListDunningCampaignsQuery, ListExecutionsQuery, UpdateCustomerSegmentInput, UpdateDunningCampaignInput, UpdateDunningTemplateInput } from './contracts.js';
import type { CustomerSegmentId, DunningCampaignId, DunningCampaignType, DunningCommunicationId, DunningExecutionId, DunningTemplateId, ExecutionStatus } from './primitives.js';
import type { DunningTables } from './tables.js';
import type { CustomerRiskProfile, DunningCampaign, DunningCommunication, DunningExecution, DunningTemplate, ExecutionResultDb, NewDunningCommunication, NewDunningExecution } from './types.js';
/**
 * Structural database type accepted by the dunning repositories. See the
 * `PaymentDatabase` doc in `../core/repository` — same contract: the host's
 * relations graph MUST register the dunning tables (`dunningCampaigns`,
 * `dunningTemplates`, `dunningExecutions`, `dunningCommunications`,
 * `customerSegments`, `customerRiskProfiles`) for the relational query
 * builder calls below to work at runtime. PGlite is accepted so the package
 * can run these queries in its own tests.
 */
export type DunningDatabase = NodePgDatabase<AnyRelations> | NodePgTransaction<AnyRelations> | PgliteDatabase<AnyRelations>;
type CampaignTables = Pick<DunningTables, 'dunningCampaigns' | 'dunningCampaignAnalytics'>;
export declare class DunningCampaignRepository {
    private readonly db;
    private readonly q;
    private readonly dunningCampaigns;
    private readonly dunningCampaignAnalytics;
    constructor(db: DunningDatabase, tables: CampaignTables);
    findById(id: DunningCampaignId): Promise<DunningCampaign | null>;
    findMany(query: ListDunningCampaignsQuery): Promise<DunningCampaign[]>;
    create(input: CreateDunningCampaignInput & {
        createdBy: string;
    }): Promise<DunningCampaign>;
    update(id: DunningCampaignId, input: UpdateDunningCampaignInput & {
        updatedBy: string;
    }): Promise<DunningCampaign | null>;
    delete(id: DunningCampaignId): Promise<void>;
    findByType(type: DunningCampaignType): Promise<DunningCampaign[]>;
    findActiveForTrigger(triggerType: string, customerSegmentIds?: string[]): Promise<DunningCampaign[]>;
    updateStatus(id: DunningCampaignId, status: 'active' | 'draft' | 'archived' | 'paused', updatedBy: string): Promise<DunningCampaign | undefined>;
    getAnalyticsSummary(campaignId?: DunningCampaignId, days?: number): Promise<{
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
     * by count, not money, because campaigns recover in different currencies.
     */
    findTopPerformer(since: Instant): Promise<{
        campaignId: DunningCampaignId;
        paymentsRecovered: number;
        conversionRate: number;
    } | null>;
    /** The analytics rows from `since` on, summed. Money stays one balance per currency. */
    getAnalyticsSince(since: Instant, campaignId?: DunningCampaignId): Promise<{
        executions: number;
        customersReached: number;
        communicationsSent: number;
        paymentsRecovered: number;
        conversionRate: number;
        roi: number;
        revenueRecovered: import("@arki/money/bag").MoneyBag;
    }>;
}
export declare class DunningTemplateRepository {
    private readonly db;
    private readonly q;
    private readonly dunningTemplates;
    constructor(db: DunningDatabase, tables: Pick<DunningTables, 'dunningTemplates'>);
    findById(id: DunningTemplateId): Promise<DunningTemplate | null>;
    findByCampaignId(campaignId: DunningCampaignId): Promise<DunningTemplate[]>;
    create(input: CreateDunningTemplateInput): Promise<DunningTemplate>;
    update(id: DunningTemplateId, input: UpdateDunningTemplateInput): Promise<DunningTemplate | null>;
    delete(id: DunningTemplateId): Promise<void>;
    findActiveTemplates(campaignId: DunningCampaignId): Promise<DunningTemplate[]>;
    updateStatus(id: DunningTemplateId, isActive: boolean): Promise<DunningTemplate | undefined>;
}
export declare class DunningExecutionRepository {
    private readonly db;
    private readonly q;
    private readonly dunningExecutions;
    constructor(db: DunningDatabase, tables: Pick<DunningTables, 'dunningExecutions'>);
    findById(id: DunningExecutionId): Promise<DunningExecution | null>;
    findMany(query: ListExecutionsQuery): Promise<DunningExecution[]>;
    create(input: Omit<NewDunningExecution, 'id' | 'createdAt' | 'updatedAt'>): Promise<DunningExecution>;
    updateStatus(id: DunningExecutionId, status: ExecutionStatus, result?: ExecutionResultDb, errorMessage?: string, customScheduledAt?: Instant): Promise<DunningExecution | undefined>;
    findScheduledExecutions(limit?: number): Promise<DunningExecution[]>;
    findRetryableExecutions(limit?: number): Promise<DunningExecution[]>;
    incrementRetryCount(id: DunningExecutionId, nextRetryAt?: Instant): Promise<DunningExecution | undefined>;
    findRecentForCustomer(customerId: CustomerId, campaignId: DunningCampaignId, hours?: number): Promise<DunningExecution[]>;
}
export declare class DunningCommunicationRepository {
    private readonly db;
    private readonly q;
    private readonly dunningCommunications;
    constructor(db: DunningDatabase, tables: Pick<DunningTables, 'dunningCommunications'>);
    findById(id: DunningCommunicationId): Promise<DunningCommunication | null>;
    findMany(query: ListCommunicationsQuery): Promise<DunningCommunication[]>;
    create(input: Omit<NewDunningCommunication, 'id' | 'createdAt' | 'updatedAt'>): Promise<DunningCommunication>;
    updateStatus(id: DunningCommunicationId, status: DunningCommunication['status'], updates?: {
        sentAt?: Instant;
        deliveredAt?: Instant;
        openedAt?: Instant;
        clickedAt?: Instant;
        failureReason?: string;
        providerMessageId?: string;
        providerResponse?: Record<string, unknown>;
        trackingData?: Record<string, unknown>;
    }): Promise<DunningCommunication | null>;
    findPendingCommunications(limit?: number): Promise<DunningCommunication[]>;
    findByProviderMessageId(providerMessageId: string): Promise<DunningCommunication | undefined>;
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
    private readonly q;
    private readonly customerSegments;
    constructor(db: DunningDatabase, tables: Pick<DunningTables, 'customerSegments'>);
    findById(id: CustomerSegmentId): Promise<CustomerSegmentRow | undefined>;
    findMany(query: ListCustomerSegmentsQuery): Promise<CustomerSegmentRow[]>;
    create(input: CreateCustomerSegmentInput & {
        createdBy: string;
    }): Promise<CustomerSegmentRow | undefined>;
    update(id: CustomerSegmentId, input: UpdateCustomerSegmentInput): Promise<CustomerSegmentRow | undefined>;
    delete(id: CustomerSegmentId): Promise<void>;
    updateCustomerCount(id: CustomerSegmentId, count: number): Promise<CustomerSegmentRow | undefined>;
    findSegmentsForAutoUpdate(): Promise<CustomerSegmentRow[]>;
}
export declare class CustomerRiskProfileRepository {
    private readonly db;
    private readonly q;
    private readonly customerRiskProfiles;
    constructor(db: DunningDatabase, tables: Pick<DunningTables, 'customerRiskProfiles'>);
    findByCustomerId(customerId: CustomerId): Promise<CustomerRiskProfile | undefined>;
    create(input: Omit<CustomerRiskProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomerRiskProfile | undefined>;
    update(customerId: CustomerId, input: Partial<Omit<CustomerRiskProfile, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>>): Promise<CustomerRiskProfile | undefined>;
    upsert(input: Omit<CustomerRiskProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomerRiskProfile | undefined>;
    findByRiskCategory(category: string, limit?: number): Promise<CustomerRiskProfile[]>;
    findBySegmentId(segmentId: CustomerSegmentId, limit?: number): Promise<CustomerRiskProfile[]>;
    updateSegments(customerId: CustomerId, segmentIds: CustomerSegmentId[]): Promise<CustomerRiskProfile | undefined>;
}
export type DunningRepositoryTables = Pick<DunningTables, 'dunningCampaigns' | 'dunningCampaignAnalytics' | 'dunningTemplates' | 'dunningExecutions' | 'dunningCommunications' | 'customerSegments' | 'customerRiskProfiles'>;
export declare function createDunningCampaignRepository(db: DunningDatabase, tables: CampaignTables): DunningCampaignRepository;
export declare function createDunningTemplateRepository(db: DunningDatabase, tables: Pick<DunningTables, 'dunningTemplates'>): DunningTemplateRepository;
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