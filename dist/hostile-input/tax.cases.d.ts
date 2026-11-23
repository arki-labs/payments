import type { PGlite } from '@electric-sql/pglite';
import type { AppDb } from '../test-support.js';
import { TaxReportingService } from '../tax/reporting.js';
import { createTaxRepositories } from '../tax/repository.js';
import { TaxService } from '../tax/service.js';
import { typed } from '../test-support.js';
type Ctx = {
    db: AppDb;
    client: PGlite;
    repos: ReturnType<typeof createTaxRepositories>;
    service: TaxService;
    reporting: TaxReportingService;
    writes: ReturnType<typeof typed.core.writes>;
};
export declare const taxArea: import("./engine.js").HostileArea<Ctx>;
export {};
//# sourceMappingURL=tax.cases.d.ts.map