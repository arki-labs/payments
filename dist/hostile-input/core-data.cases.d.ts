import type { PGlite } from '@electric-sql/pglite';
import type { CoreWrites } from '../core/journal.js';
import type { AppDb } from '../test-support.js';
import { PaymentRepository } from '../core/repository.js';
type Ctx = {
    db: AppDb;
    client: PGlite;
    repo: PaymentRepository;
    writes: CoreWrites;
};
export declare const coreDataArea: import("./engine.js").HostileArea<Ctx>;
export {};
//# sourceMappingURL=core-data.cases.d.ts.map