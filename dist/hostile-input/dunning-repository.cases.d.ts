import type { PGlite } from '@electric-sql/pglite';
import type { AppDb } from '../test-support.js';
import { createDunningRepository } from '../dunning/repository.js';
type Ctx = {
    db: AppDb;
    client: PGlite;
    repos: ReturnType<typeof createDunningRepository>;
};
export declare const dunningRepositoryArea: import("./engine.js").HostileArea<Ctx>;
export {};
//# sourceMappingURL=dunning-repository.cases.d.ts.map