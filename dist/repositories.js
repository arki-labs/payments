import { createPaymentRepository } from './core/repository.js';
import { createDunningRepository } from './dunning/repository.js';
import { createRefundRepository } from './refunds/repository.js';
import { createTaxRepositories } from './tax/repository.js';
export function createPaymentRepositories(db, tables) {
    return {
        core: createPaymentRepository(db, { tables: tables.core }),
        dunning: createDunningRepository(db, tables.dunning),
        refunds: createRefundRepository(db, tables.refunds),
        tax: createTaxRepositories(db, tables.tax),
    };
}
//# sourceMappingURL=repositories.js.map