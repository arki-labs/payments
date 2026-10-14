import { type CreatePaymentRepositoryDeps, type PaymentDatabase } from './core/repository.js';
import { type DunningDatabase, type DunningRepositoryTables } from './dunning/repository.js';
import { type RefundsDatabase } from './refunds/repository.js';
import type { RefundsTables } from './refunds/tables.js';
import { type TaxDatabase, type TaxRepositoryTables } from './tax/repository.js';
export type PaymentRepositoriesTables = {
    core: CreatePaymentRepositoryDeps['tables'];
    dunning: DunningRepositoryTables;
    refunds: Pick<RefundsTables, 'refunds'>;
    tax: TaxRepositoryTables;
};
export type PaymentRepositoriesDatabase = PaymentDatabase & DunningDatabase & RefundsDatabase & TaxDatabase;
export declare function createPaymentRepositories(db: PaymentRepositoriesDatabase, tables: PaymentRepositoriesTables): {
    core: import("./core/repository.js").PaymentRepository;
    dunning: {
        campaigns: import("./dunning/repository.js").DunningCampaignRepository;
        templates: import("./dunning/repository.js").DunningTemplateRepository;
        executions: import("./dunning/repository.js").DunningExecutionRepository;
        communications: import("./dunning/repository.js").DunningCommunicationRepository;
        customerSegments: import("./dunning/repository.js").CustomerSegmentRepository;
        customerRiskProfiles: import("./dunning/repository.js").CustomerRiskProfileRepository;
    };
    refunds: import("./refunds/repository.js").RefundRepository;
    tax: {
        configurations: import("./tax/repository.js").TaxConfigurationRepository;
        jurisdictions: import("./tax/repository.js").TaxJurisdictionRepository;
        exemptions: import("./tax/repository.js").TaxExemptionRepository;
        records: import("./tax/repository.js").TaxRecordRepository;
        audit: import("./tax/repository.js").TaxAuditRepository;
    };
};
export type PaymentRepositories = ReturnType<typeof createPaymentRepositories>;
//# sourceMappingURL=repositories.d.ts.map