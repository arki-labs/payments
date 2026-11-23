import type { PGlite } from '@electric-sql/pglite';
import { KV } from '@arki/kv';
import type { CoreWrites } from '../core/journal.js';
import type { AppDb } from '../test-support.js';
import { PaymentRepository } from '../core/repository.js';
import { coreReads } from '../service-test-support.js';
type Ctx = {
    db: AppDb;
    client: PGlite;
    reads: ReturnType<typeof coreReads>;
    writes: CoreWrites;
    repository: PaymentRepository;
    kv: KV;
};
export declare const coreServicesArea: import("./engine.js").HostileArea<Ctx>;
export {};
//# sourceMappingURL=core-services.cases.d.ts.map