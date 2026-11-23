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
    /** Null too for an id no row can hold (U+0000), without a query. */
    findById(refundId: RefundId): Promise<Refund | null>;
    /** The refund the provider knows by `providerRefundId`: the link between a webhook and our row. */
    /** No row holds U+0000, so an id with one finds nothing (Postgres would refuse the parameter). */
    findByProviderRefundId(providerRefundId: string): Promise<Refund | null>;
    /** Empty too for an id no row can hold (U+0000), without a query. */
    findByPaymentId(paymentId: PaymentId): Promise<Refund[]>;
    /** Empty too for a text that is not a refund status, without a query. */
    findByStatus(status: RefundStatus): Promise<Refund[]>;
    findPending(): Promise<Refund[]>;
    /** Empty too for an id no row can hold (U+0000), without a query. */
    findByUser(userId: UserId): Promise<Refund[]>;
    /**
     * Completed refunds of a payment, in the payment's currency. A `paymentId` or `currency` no row can
     * hold (U+0000) has no refunds: zero, without a query. `currency` must be ISO 4217: another code
     * throws `UnknownCurrencyError` (the `@arki/money` builder), as for the zero.
     */
    getTotalRefundedAmount(paymentId: PaymentId, currency: string): Promise<Money>;
    /**
     * Refunds created in the range (both bounds optional): their count, one total per currency, and
     * counts by status and reason. The bounds fall in the years 1 to 9999, or it throws `FailureError` (`invariant`).
     */
    getRefundMetrics(startDate?: Instant, endDate?: Instant): Promise<{
        totalCount: number;
        /** One exact total per currency: refunds in USD and EUR do not add up to one number */
        totalAmount: MoneyBag;
        byStatus: Record<string, number>;
        byReason: Record<string, number>;
    }>;
    getAverageProcessingTime(): Promise<number>;
    /**
     * The refunds that match every filter given, newest first. `startDate` and `endDate` fall in the years
     * 1 to 9999, and `minAmount` and `maxAmount` are whole minor units of their currency, at most 2^53 - 1 of
     * them, as the amount column holds; anything else throws `FailureError` (`invariant`) before a query.
     * A `userId` no row can hold (U+0000), or a `status` or `reason` that is not a refund status or reason, matches none.
     */
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