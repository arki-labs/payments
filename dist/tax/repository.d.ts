import type { AnyRelations } from 'drizzle-orm';
import type { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import type { TaxConfigId, TaxExemptionId, TaxJurisdictionId } from './primitives.js';
import type { TaxTables } from './tables.js';
import type { NewTaxConfig, NewTaxExemption, NewTaxJurisdiction, TaxConfig, TaxExemption, TaxJurisdiction } from './types.js';
/**
 * Structural database type for the tax repositories. The tax repositories
 * only use `db.select / insert / update / delete` (no relational query
 * builder), so `AnyRelations` is sufficient — no host-side relations
 * contract is required beyond having the tax tables in the schema.
 */
export type TaxDatabase = NodePgDatabase<AnyRelations> | NodePgTransaction<AnyRelations>;
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
    findProductExemptions(productCode: string): Promise<TaxExemption[]>;
    findJurisdictionExemptions(jurisdictionId: TaxJurisdictionId): Promise<TaxExemption[]>;
    findExpiringExemptions(days?: number): Promise<TaxExemption[]>;
    updateExemption(id: TaxExemptionId, data: UpdateTaxExemption): Promise<TaxExemption>;
    approveExemption(id: TaxExemptionId, approvedBy: string): Promise<TaxExemption>;
    revokeExemption(id: TaxExemptionId): Promise<TaxExemption>;
    deleteExemption(id: TaxExemptionId): Promise<void>;
    getExemptionStats(): Promise<{
        totalActive: number;
        totalExpired: number;
        totalRevoked: number;
        expiringNext30Days: number;
    }>;
}
export type TaxRepositoryTables = Pick<TaxTables, 'taxConfigurations' | 'taxJurisdictions' | 'taxExemptions'>;
/**
 * Aggregate Tax Repository Factory
 * Creates and manages all tax-related repositories
 */
export declare function createTaxRepositories(db: TaxDatabase, tables: TaxRepositoryTables): {
    configurations: TaxConfigurationRepository;
    jurisdictions: TaxJurisdictionRepository;
    exemptions: TaxExemptionRepository;
};
export type TaxRepositories = ReturnType<typeof createTaxRepositories>;
//# sourceMappingURL=repository.d.ts.map