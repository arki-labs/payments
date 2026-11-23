import type { PGlite } from '@electric-sql/pglite';
import type { CoreWrites } from '../core/journal.js';
import type { PaymentId } from '../core/types.js';
import type { RefundWrites } from '../refunds/journal.js';
import type { RefundId } from '../refunds/primitives.js';
import type { AppDb } from '../test-support.js';
import { RefundRepository } from '../refunds/repository.js';
import { RefundService } from '../refunds/service.js';
type Ctx = {
    db: AppDb;
    client: PGlite;
    coreWrites: CoreWrites;
    writes: RefundWrites;
    repo: RefundRepository;
    service: RefundService;
    /** The refund the latest `arrange` made, for `valid` to look for. */
    last: {
        refundId: RefundId;
        paymentId: PaymentId;
    };
};
export declare const refundsArea: import("./engine.js").HostileArea<Ctx>;
export {};
//# sourceMappingURL=refunds.cases.d.ts.map