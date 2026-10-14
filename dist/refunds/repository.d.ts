import type { AnyRelations } from 'drizzle-orm';
import type { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type { UserId } from '../core/user-id.js';
import type { Instant } from '@arki/date';
import type { Money } from '@arki/money';
import { MoneyBag } from '@arki/money/bag';
import type { PaymentId } from '../core/primitives.js';
import type { RefundId, RefundReason, RefundStatus } from './primitives.js';
import type { RefundsTables } from './tables.js';
import type { Refund } from './types.js';
/**
 * Structural database type for the refunds repository. Only uses
 * `db.select / insert / update / delete`, so `AnyRelations` suffices —
 * the host needs to register the `refunds` table in its schema but no
 * specific relations graph is required.
 */
/** A refund row's amount: whole minor units and a currency that defaults to USD, as the column does. */
export declare function refundAmountOf(refund: Pick<Refund, 'refundAmountMinor' | 'currency'>): Money;
export type RefundsDatabase = NodePgDatabase<AnyRelations> | NodePgTransaction<AnyRelations> | PgliteDatabase<AnyRelations>;
export declare class RefundRepository {
    private readonly db;
    private readonly refunds;
    constructor(db: RefundsDatabase, tables: Pick<RefundsTables, 'refunds'>);
    findById(refundId: RefundId): Promise<Refund | null>;
    /** The refund the provider knows by `providerRefundId`: the link between a webhook and our row. */
    findByProviderRefundId(providerRefundId: string): Promise<Refund | null>;
    findByPaymentId(paymentId: PaymentId): Promise<Refund[]>;
    findByStatus(status: RefundStatus): Promise<Refund[]>;
    findPending(): Promise<Refund[]>;
    findByUser(userId: UserId): Promise<Refund[]>;
    /** Completed refunds of a payment, in the payment's currency. */
    getTotalRefundedAmount(paymentId: PaymentId, currency: string): Promise<Money>;
    getRefundMetrics(startDate?: Instant, endDate?: Instant): Promise<{
        totalCount: number;
        /** One exact total per currency: refunds in USD and EUR do not add up to one number */
        totalAmount: MoneyBag;
        byStatus: Record<string, number>;
        byReason: Record<string, number>;
    }>;
    getAverageProcessingTime(): Promise<number>;
    searchRefunds(filters: {
        status?: RefundStatus;
        reason?: RefundReason;
        userId?: UserId;
        startDate?: Instant;
        endDate?: Instant;
        /** Bounds also select their currency: refunds in another currency are left out */
        minAmount?: Money;
        maxAmount?: Money;
    }): Promise<Refund[]>;
}
export declare function createRefundRepository(db: RefundsDatabase, tables: Pick<RefundsTables, 'refunds'>): RefundRepository;
//# sourceMappingURL=repository.d.ts.map