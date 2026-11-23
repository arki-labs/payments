import type { AnyRelations } from 'drizzle-orm';
import type { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type { Instant } from '@arki/date';
import type { FailureOf, SchemaFailure } from '@arki/failure';
import type { TaxConfigId, TaxExemptionId, TaxJurisdictionId, TaxRecordType } from './primitives.js';
import type { TaxTables } from './tables.js';
import type { NewTaxConfig, NewTaxExemption, NewTaxAuditRow, NewTaxJurisdiction, NewTaxRecord, TaxAuditRow, TaxConfig, TaxExemption, TaxJurisdiction, TaxRecord } from './types.js';
import { TaxJurisdictionInUse, TaxReferenceNotFound, TaxRowExists } from './failures.js';
type NotFound = FailureOf<typeof TaxReferenceNotFound>;
type Exists = FailureOf<typeof TaxRowExists>;
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
    /**
     * The new row. A value a column cannot store returns `InvalidInput` (`taxConfigurationRowSchema`),
     * and an `id` another configuration has returns `TaxRowExists`; nothing is written then.
     */
    createConfiguration(data: NewTaxConfig): Promise<TaxConfig | SchemaFailure | Exists>;
    /** Null too for an id no row can hold (U+0000), without a query. */
    findConfigurationById(id: TaxConfigId): Promise<TaxConfig | null>;
    findDefaultConfiguration(): Promise<TaxConfig | null>;
    findActiveConfigurations(): Promise<TaxConfig[]>;
    /**
     * The updated row, or `TaxReferenceNotFound` when no configuration has `id`. A value a column cannot
     * store returns `InvalidInput` (`taxConfigurationRowSchema`) and nothing is written.
     */
    updateConfiguration(id: TaxConfigId, data: UpdateTaxConfiguration): Promise<TaxConfig | NotFound | SchemaFailure>;
    /**
     * Makes `id` the one default configuration. An unknown `id` returns `TaxReferenceNotFound` and
     * leaves the current default as it is: the new default is set before the old one is cleared.
     */
    setDefaultConfiguration(id: TaxConfigId): Promise<TaxConfig | NotFound>;
    /** An unknown id, or one no row can hold (U+0000), deletes nothing. */
    deleteConfiguration(id: TaxConfigId): Promise<void>;
}
/**
 * Tax Jurisdiction Repository
 * Manages tax jurisdictions and their rates
 */
export declare class TaxJurisdictionRepository {
    private readonly db;
    private readonly taxJurisdictions;
    private readonly taxExemptions;
    /** `taxExemptions` is read by `deleteJurisdiction`: a jurisdiction an exemption names is kept. */
    constructor(db: TaxDatabase, tables: Pick<TaxTables, 'taxJurisdictions' | 'taxExemptions'>);
    /**
     * The new row, or `TaxReferenceNotFound` (kind `jurisdiction`) when `parentId` names no
     * jurisdiction. The parent is locked until the insert, so it cannot be deleted in between. A value
     * a column cannot store returns `InvalidInput` (`taxJurisdictionRowSchema`), and an `id` another
     * jurisdiction has returns `TaxRowExists`; nothing is written then.
     */
    createJurisdiction(data: NewTaxJurisdiction): Promise<TaxJurisdiction | NotFound | SchemaFailure | Exists>;
    /** Null too for an id no row can hold (U+0000), without a query. */
    findJurisdictionById(id: TaxJurisdictionId): Promise<TaxJurisdiction | null>;
    findJurisdictionByCode(code: string, countryCode: string): Promise<TaxJurisdiction | null>;
    findJurisdictionsByCountry(countryCode: string): Promise<TaxJurisdiction[]>;
    findActiveJurisdictions(): Promise<TaxJurisdiction[]>;
    findJurisdictionHierarchy(id: TaxJurisdictionId): Promise<TaxJurisdiction[]>;
    /**
     * The updated row, or `TaxReferenceNotFound` (kind `jurisdiction`) when no jurisdiction has `id`,
     * or when the new `parentId` names none. The new parent is locked until the update. A value a
     * column cannot store returns `InvalidInput` (`taxJurisdictionRowSchema`) and nothing is written.
     */
    updateJurisdiction(id: TaxJurisdictionId, data: UpdateTaxJurisdiction): Promise<TaxJurisdiction | NotFound | SchemaFailure>;
    /**
     * Deletes the jurisdiction. One that a child jurisdiction or an exemption still names returns
     * `TaxJurisdictionInUse` and is kept. The row is locked first, so a write that would point at it
     * waits, and then finds it gone (`TaxReferenceNotFound`). An unknown id, or one no row can hold
     * (U+0000), deletes nothing.
     */
    deleteJurisdiction(id: TaxJurisdictionId): Promise<FailureOf<typeof TaxJurisdictionInUse> | undefined>;
}
/**
 * Tax Exemption Repository
 * Manages tax exemptions for customers, products, and jurisdictions
 */
export declare class TaxExemptionRepository {
    private readonly db;
    private readonly taxExemptions;
    private readonly taxJurisdictions;
    constructor(db: TaxDatabase, tables: Pick<TaxTables, 'taxExemptions' | 'taxJurisdictions'>);
    /**
     * The new row. One that names no customer, product code or jurisdiction would exempt every sale:
     * `exemptionTargetSchema` refuses it with `InvalidInput`, and nothing is written. So does
     * `exemptionPeriodSchema` for one whose `validTo` is before its `validFrom`. A `jurisdictionId`
     * that names no jurisdiction returns `TaxReferenceNotFound` (kind `jurisdiction`); the
     * jurisdiction is locked until the insert, so it cannot be deleted in between. A value a column
     * cannot store returns `InvalidInput` (`taxExemptionRowSchema`), and an `id` another exemption has
     * returns `TaxRowExists`; nothing is written then.
     */
    createExemption(data: NewTaxExemption): Promise<TaxExemption | NotFound | SchemaFailure | Exists>;
    /** Null too for an id no row can hold (U+0000), without a query. */
    findExemptionById(id: TaxExemptionId): Promise<TaxExemption | null>;
    findCustomerExemptions(customerId: string): Promise<TaxExemption[]>;
    /**
     * The customer's exemptions that were in force at some point between `start` and `end`,
     * both inclusive. Pending and revoked exemptions never applied, so they are left out. The times
     * fall in the years 1 to 9999, or it throws `FailureError` (`invariant`).
     */
    findCustomerExemptionsInRange(customerId: string, start: Instant, end: Instant): Promise<TaxExemption[]>;
    /**
     * The exemptions that can keep tax off a sale to `customerId` at `at`: active, in force, and
     * either the customer's own or open to every customer (no `customerId`). Pending, revoked and
     * expired ones never apply. `threshold` exemptions are left out: nothing stores a threshold
     * amount to test a sale against. The caller narrows by product and jurisdiction. `at` falls in the
     * years 1 to 9999, or it throws `FailureError` (`invariant`).
     */
    findApplicableExemptions(customerId: string, at?: Instant): Promise<TaxExemption[]>;
    /**
     * Every customer's exemptions that were in force at some point between `start` and `end`, both
     * inclusive. Pending and revoked ones never applied. The times fall in the years 1 to 9999, or it
     * throws `FailureError` (`invariant`).
     */
    findExemptionsInRange(start: Instant, end: Instant): Promise<TaxExemption[]>;
    findProductExemptions(productCode: string): Promise<TaxExemption[]>;
    findJurisdictionExemptions(jurisdictionId: TaxJurisdictionId): Promise<TaxExemption[]>;
    /**
     * Active exemptions that end within the next `days` days. `days` is from 1 to 365, as
     * `getExpiringExemptionsInputSchema` reads it from a request: anything else (NaN, a huge number)
     * is a bug in the caller, and throws `FailureError` (`invariant`) before the query.
     */
    findExpiringExemptions(days?: number): Promise<TaxExemption[]>;
    /**
     * The updated row, or `TaxReferenceNotFound` when no exemption has `id` (kind `exemption`) or the
     * new `jurisdictionId` names no jurisdiction (kind `jurisdiction`). The row as the update
     * leaves it must still name a customer, a product code or a jurisdiction (`exemptionTargetSchema`)
     * and must not end before it starts (`exemptionPeriodSchema`), and every value must fit its column
     * (`taxExemptionRowSchema`): otherwise it returns `InvalidInput` and nothing is written. A field left
     * `undefined` keeps its stored value; `null` clears it.
     */
    updateExemption(id: TaxExemptionId, data: UpdateTaxExemption): Promise<TaxExemption | NotFound | SchemaFailure>;
    /**
     * The approved row, or `TaxReferenceNotFound` when no exemption has `id`. An `approvedBy` the column
     * cannot store returns `InvalidInput` and nothing is written.
     */
    approveExemption(id: TaxExemptionId, approvedBy: string): Promise<TaxExemption | NotFound | SchemaFailure>;
    /** The revoked row, or `TaxReferenceNotFound` when no exemption has `id`. */
    revokeExemption(id: TaxExemptionId): Promise<TaxExemption | NotFound>;
    /** An unknown id, or one no row can hold (U+0000), deletes nothing. */
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
    /**
     * The stored entry. An `entityId` or `details` the columns cannot store returns `InvalidInput`
     * (`taxAuditRowSchema`), and an `id` another entry has returns `TaxRowExists`; nothing is written then.
     */
    record(entry: NewTaxAuditRow): Promise<TaxAuditRow | SchemaFailure | Exists>;
    /** The entries about one entity, oldest first. */
    findByEntity(entity: TaxAuditRow['entity'], entityId: string): Promise<TaxAuditRow[]>;
}
/** The tax in one jurisdiction and one currency over a period: collected on sales, given back on refunds. */
export type TaxRecordTotal = {
    jurisdiction: string;
    currency: string;
    /** Whole minor units as decimal text, exact: a sum of many records can pass 2^53 (`Money.fromMinor` takes it) */
    saleTaxMinor: string;
    /** Whole minor units as decimal text, exact, as `saleTaxMinor` */
    refundTaxMinor: string;
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
    /**
     * Write at most `MAX_BATCH_ITEMS` (1,000) rows; more returns `InvalidInput`. A row already recorded
     * (same type, reference, jurisdiction and rate) is left as it was. A row with a value its column cannot store returns `InvalidInput` (`taxRecordRowSchema`), and
     * no row is written.
     */
    recordMany(rows: NewTaxRecord[]): Promise<SchemaFailure | undefined>;
    findByReference(type: TaxRecordType, reference: string): Promise<TaxRecord[]>;
    /**
     * How many distinct sales carried tax between `start` and `end`, both inclusive (a sale taxed in two
     * jurisdictions counts once). The times fall in the years 1 to 9999, or it throws `FailureError` (`invariant`).
     */
    countSaleTransactions(period: {
        start: Instant;
        end: Instant;
        customerId?: string;
        jurisdiction?: string;
    }): Promise<number>;
    /**
     * The tax each payment carried, for the records that happened between `start` and `end`, both
     * inclusive. Records with no payment id are left out. `jurisdiction` limits it to one (any case).
     * The times fall in the years 1 to 9999, or it throws `FailureError` (`invariant`).
     */
    totalsByPayment(period: {
        start: Instant;
        end: Instant;
        jurisdiction?: string;
    }): Promise<TaxRecordPaymentTotal[]>;
    /**
     * Tax per jurisdiction and currency for the records that happened between `start` and `end`,
     * both inclusive, ordered by jurisdiction then currency. `customerId` limits it to one customer.
     * The times fall in the years 1 to 9999, or it throws `FailureError` (`invariant`).
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
    /** Whole minor units as decimal text, exact: a sum can pass 2^53 */
    saleTaxMinor: string;
    /** Whole minor units as decimal text, exact */
    refundTaxMinor: string;
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
export {};
//# sourceMappingURL=repository.d.ts.map