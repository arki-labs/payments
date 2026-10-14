import type { AnyRelations } from 'drizzle-orm';
import type { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type { Instant } from '@arki/date';
import type { TaxConfigId, TaxExemptionId, TaxJurisdictionId, TaxRecordType } from './primitives.js';
import type { TaxTables } from './tables.js';
import type { NewTaxConfig, NewTaxExemption, NewTaxAuditRow, NewTaxJurisdiction, NewTaxRecord, TaxAuditRow, TaxConfig, TaxExemption, TaxJurisdiction, TaxRecord } from './types.js';
/**
 * Structural database type for the tax repositories. The tax repositories
 * only use `db.select / insert / update / delete` (no relational query
 * builder), so `AnyRelations` is sufficient — no host-side relations
 * contract is required beyond having the tax tables in the schema.
 */
export type TaxDatabase = NodePgDatabase<AnyRelations> | NodePgTransaction<AnyRelations> | PgliteDatabase<AnyRelations>;
export type UpdateTaxConfiguration = Partial<Omit<NewTaxConfig, 'id'>>;
export type UpdateTaxJurisdiction = Partial<Omit<NewTaxJurisdiction, 'id'>>;
export type UpdateTaxExemption = Partial<Omit<NewTaxExemption, 'id'>>;
/**
 * Tax Configuration Repository
 * Manages global tax settings and configurations
 */
export declare class TaxConfigurationRepository {
    private readonly db;
    private readonly taxConfigurations;
    constructor(db: TaxDatabase, tables: Pick<TaxTables, 'taxConfigurations'>);
    createConfiguration(data: NewTaxConfig): Promise<TaxConfig>;
    findConfigurationById(id: TaxConfigId): Promise<TaxConfig | null>;
    findDefaultConfiguration(): Promise<TaxConfig | null>;
    findActiveConfigurations(): Promise<TaxConfig[]>;
    updateConfiguration(id: TaxConfigId, data: UpdateTaxConfiguration): Promise<TaxConfig>;
    setDefaultConfiguration(id: TaxConfigId): Promise<TaxConfig>;
    deleteConfiguration(id: TaxConfigId): Promise<void>;
}
/**
 * Tax Jurisdiction Repository
 * Manages tax jurisdictions and their rates
 */
export declare class TaxJurisdictionRepository {
    private readonly db;
    private readonly taxJurisdictions;
    constructor(db: TaxDatabase, tables: Pick<TaxTables, 'taxJurisdictions'>);
    createJurisdiction(data: NewTaxJurisdiction): Promise<TaxJurisdiction>;
    findJurisdictionById(id: TaxJurisdictionId): Promise<TaxJurisdiction | null>;
    findJurisdictionByCode(code: string, countryCode: string): Promise<TaxJurisdiction | null>;
    findJurisdictionsByCountry(countryCode: string): Promise<TaxJurisdiction[]>;
    findActiveJurisdictions(): Promise<TaxJurisdiction[]>;
    findJurisdictionHierarchy(id: TaxJurisdictionId): Promise<TaxJurisdiction[]>;
    updateJurisdiction(id: TaxJurisdictionId, data: UpdateTaxJurisdiction): Promise<TaxJurisdiction>;
    deleteJurisdiction(id: TaxJurisdictionId): Promise<void>;
}
/**
 * Tax Exemption Repository
 * Manages tax exemptions for customers, products, and jurisdictions
 */
export declare class TaxExemptionRepository {
    private readonly db;
    private readonly taxExemptions;
    constructor(db: TaxDatabase, tables: Pick<TaxTables, 'taxExemptions'>);
    createExemption(data: NewTaxExemption): Promise<TaxExemption>;
    findExemptionById(id: TaxExemptionId): Promise<TaxExemption | null>;
    findCustomerExemptions(customerId: string): Promise<TaxExemption[]>;
    /**
     * The customer's exemptions that were in force at some point between `start` and `end`,
     * both inclusive. Pending and revoked exemptions never applied, so they are left out.
     */
    findCustomerExemptionsInRange(customerId: string, start: Instant, end: Instant): Promise<TaxExemption[]>;
    /**
     * The exemptions that can keep tax off a sale to `customerId` at `at`: active, in force, and
     * either the customer's own or open to every customer (no `customerId`). Pending, revoked and
     * expired ones never apply. `threshold` exemptions are left out: nothing stores a threshold
     * amount to test a sale against. The caller narrows by product and jurisdiction.
     */
    findApplicableExemptions(customerId: string, at?: Instant): Promise<TaxExemption[]>;
    /** Every customer's exemptions that were in force at some point between `start` and `end`, both inclusive. Pending and revoked ones never applied. */
    findExemptionsInRange(start: Instant, end: Instant): Promise<TaxExemption[]>;
    findProductExemptions(productCode: string): Promise<TaxExemption[]>;
    findJurisdictionExemptions(jurisdictionId: TaxJurisdictionId): Promise<TaxExemption[]>;
    findExpiringExemptions(days?: number): Promise<TaxExemption[]>;
    updateExemption(id: TaxExemptionId, data: UpdateTaxExemption): Promise<TaxExemption>;
    approveExemption(id: TaxExemptionId, approvedBy: string): Promise<TaxExemption>;
    revokeExemption(id: TaxExemptionId): Promise<TaxExemption>;
    deleteExemption(id: TaxExemptionId): Promise<void>;
    getExemptionStats(): Promise<{
        totalActive: number;
        totalPendingReview: number;
        totalExpired: number;
        totalRevoked: number;
        expiringNext30Days: number;
    }>;
}
/**
 * Tax Audit Repository
 * The append-only trail of tax actions
 */
export declare class TaxAuditRepository {
    private readonly db;
    private readonly taxAuditEntries;
    constructor(db: TaxDatabase, tables: Pick<TaxTables, 'taxAuditEntries'>);
    record(entry: NewTaxAuditRow): Promise<TaxAuditRow>;
    /** The entries about one entity, oldest first. */
    findByEntity(entity: TaxAuditRow['entity'], entityId: string): Promise<TaxAuditRow[]>;
}
/** The tax in one jurisdiction and one currency over a period: collected on sales, given back on refunds. */
export type TaxRecordTotal = {
    jurisdiction: string;
    currency: string;
    saleTaxMinor: number;
    refundTaxMinor: number;
    /** Distinct sale transactions that carried tax here */
    saleCount: number;
    /** Distinct refund transactions that carried tax here */
    refundCount: number;
};
/**
 * Tax Record Repository
 * The per-jurisdiction tax of each recorded sale and refund
 */
export declare class TaxRecordRepository {
    private readonly db;
    private readonly taxRecords;
    constructor(db: TaxDatabase, tables: Pick<TaxTables, 'taxRecords'>);
    /** Write the rows. A row already recorded (same type, reference, jurisdiction and rate) is left as it was. */
    recordMany(rows: NewTaxRecord[]): Promise<void>;
    findByReference(type: TaxRecordType, reference: string): Promise<TaxRecord[]>;
    /** How many distinct sales carried tax between `start` and `end`, both inclusive (a sale taxed in two jurisdictions counts once). */
    countSaleTransactions(period: {
        start: Instant;
        end: Instant;
        customerId?: string;
        jurisdiction?: string;
    }): Promise<number>;
    /**
     * The tax each payment carried, for the records that happened between `start` and `end`, both
     * inclusive. Records with no payment id are left out. `jurisdiction` limits it to one (any case).
     */
    totalsByPayment(period: {
        start: Instant;
        end: Instant;
        jurisdiction?: string;
    }): Promise<TaxRecordPaymentTotal[]>;
    /**
     * Tax per jurisdiction and currency for the records that happened between `start` and `end`,
     * both inclusive, ordered by jurisdiction then currency. `customerId` limits it to one customer.
     */
    totalsByJurisdiction(period: {
        start: Instant;
        end: Instant;
        customerId?: string;
        jurisdiction?: string;
    }): Promise<TaxRecordTotal[]>;
}
/** The tax one payment carried, over the records that happened in a period. */
export type TaxRecordPaymentTotal = {
    paymentId: string;
    currency: string;
    saleTaxMinor: number;
    refundTaxMinor: number;
};
export type TaxRepositoryTables = Pick<TaxTables, 'taxConfigurations' | 'taxJurisdictions' | 'taxExemptions' | 'taxRecords' | 'taxAuditEntries'>;
/**
 * Aggregate Tax Repository Factory
 * Creates and manages all tax-related repositories
 */
export declare function createTaxRepositories(db: TaxDatabase, tables: TaxRepositoryTables): {
    configurations: TaxConfigurationRepository;
    jurisdictions: TaxJurisdictionRepository;
    exemptions: TaxExemptionRepository;
    records: TaxRecordRepository;
    audit: TaxAuditRepository;
};
export type TaxRepositories = ReturnType<typeof createTaxRepositories>;
//# sourceMappingURL=repository.d.ts.map