import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { toMillis } from '@arki/date';
import { MoneyBag } from '@arki/money/bag';
import { fromMinorColumn, toMinorColumn } from '../core/money.js';
import { isPgInstant, pgTextSchema } from '../core/pg-values.js';
import { refundReasonValues, refundStatusValues } from './primitives.js';
import { invariant } from '@arki/failure';
import { is } from '@arki/schema';
import { z } from '@arki/contracts';
/**
 * Structural database type for the refunds repository. Only uses
 * `db.select / insert / update / delete`, so `AnyRelations` suffices —
 * the host needs to register the `refunds` table in its schema but no
 * specific relations graph is required.
 */
/** A refund row's amount: whole minor units and a currency that defaults to USD, as the column does. */
export function refundAmountOf(refund) {
    return fromMinorColumn(refund.refundAmountMinor, refund.currency ?? 'USD');
}
/**
 * False when a text holds U+0000. No stored row can hold one, so a read for it finds nothing, and
 * Postgres would refuse it as a parameter (SQLSTATE 22021). Typed ids count: `rfnd${string}` can hold one.
 */
function findable(...texts) {
    return texts.every(text => text === undefined || is(text, pgTextSchema));
}
/** Whether an amount column holds `amount` exactly: no digits below the minor unit, at most 2^53 - 1 minor units either way. */
function fitsAmountColumn(amount) {
    const whole = amount.toScale(amount.currency.scale, 'halfEven');
    return whole.eq(amount) && whole.abs().toMinorBigInt() <= BigInt(Number.MAX_SAFE_INTEGER);
}
/** The refund statuses and reasons a row can hold: another text matches no row, and Postgres refuses it as an enum (SQLSTATE 22P02). */
const refundStatusSchema = z.enum(refundStatusValues);
const refundReasonSchema = z.enum(refundReasonValues);
export class RefundRepository {
    db;
    refunds;
    constructor(db, tables) {
        this.db = db;
        this.refunds = tables.refunds;
    }
    /** Null too for an id no row can hold (U+0000), without a query. */
    async findById(refundId) {
        if (!findable(refundId))
            return null;
        const [refund] = await this.db
            .select()
            .from(this.refunds)
            .where(eq(this.refunds.id, refundId))
            .limit(1);
        return refund ?? null;
    }
    /** The refund the provider knows by `providerRefundId`: the link between a webhook and our row. */
    /** No row holds U+0000, so an id with one finds nothing (Postgres would refuse the parameter). */
    async findByProviderRefundId(providerRefundId) {
        if (!findable(providerRefundId))
            return null;
        const [refund] = await this.db
            .select()
            .from(this.refunds)
            .where(eq(this.refunds.providerRefundId, providerRefundId))
            .limit(1);
        return refund ?? null;
    }
    /** Empty too for an id no row can hold (U+0000), without a query. */
    async findByPaymentId(paymentId) {
        if (!findable(paymentId))
            return [];
        return this.db
            .select()
            .from(this.refunds)
            .where(eq(this.refunds.paymentId, paymentId))
            .orderBy(desc(this.refunds.createdAt));
    }
    /** Empty too for a text that is not a refund status, without a query. */
    async findByStatus(status) {
        if (!is(status, refundStatusSchema))
            return [];
        return this.db
            .select()
            .from(this.refunds)
            .where(eq(this.refunds.status, status))
            .orderBy(desc(this.refunds.createdAt));
    }
    async findPending() {
        return this.findByStatus('pending');
    }
    /** Empty too for an id no row can hold (U+0000), without a query. */
    async findByUser(userId) {
        if (!findable(userId))
            return [];
        return this.db
            .select()
            .from(this.refunds)
            .where(eq(this.refunds.requestedBy, userId))
            .orderBy(desc(this.refunds.createdAt));
    }
    /**
     * Completed refunds of a payment, in the payment's currency. A `paymentId` or `currency` no row can
     * hold (U+0000) has no refunds: zero, without a query. `currency` must be ISO 4217: another code
     * throws `UnknownCurrencyError` (the `@arki/money` builder), as for the zero.
     */
    async getTotalRefundedAmount(paymentId, currency) {
        if (!findable(paymentId, currency))
            return fromMinorColumn('0', currency);
        const result = await this.db
            .select({
            // A `bigint` sum is `numeric`: Postgres sends it as text, exact
            total: sql `SUM(${this.refunds.refundAmountMinor})`,
        })
            .from(this.refunds)
            .where(and(eq(this.refunds.paymentId, paymentId), eq(this.refunds.status, 'completed'), eq(this.refunds.currency, currency.toUpperCase())));
        return fromMinorColumn(result[0]?.total ?? '0', currency);
    }
    /**
     * Refunds created in the range (both bounds optional): their count, one total per currency, and
     * counts by status and reason. The bounds fall in the years 1 to 9999, or it throws `FailureError` (`invariant`).
     */
    async getRefundMetrics(startDate, endDate) {
        // Postgres compares an `instant` only in the years 1 to 9999: another typed time is a bug in the caller
        invariant([startDate, endDate].every(time => time === undefined || isPgInstant(time)), 'getRefundMetrics needs times in the years 1 to 9999 (UTC)');
        const conditions = [];
        if (startDate) {
            conditions.push(gte(this.refunds.createdAt, startDate));
        }
        if (endDate) {
            conditions.push(lte(this.refunds.createdAt, endDate));
        }
        const baseQuery = conditions.length > 0
            ? this.db.select().from(this.refunds).where(and(...conditions))
            : this.db.select().from(this.refunds);
        const allRefunds = await baseQuery;
        const byStatus = {};
        const byReason = {};
        const metrics = {
            totalCount: allRefunds.length,
            // Folded one by one: spreading every refund as arguments overflows the call stack on Node past ~100k refunds
            totalAmount: allRefunds.reduce((bag, refund) => bag.plus(refundAmountOf(refund)), MoneyBag.empty()),
            byStatus,
            byReason,
        };
        for (const refund of allRefunds) {
            const status = String(refund.status);
            metrics.byStatus[status] = (metrics.byStatus[status] || 0) + 1;
            metrics.byReason[refund.reason] = (metrics.byReason[refund.reason] || 0) + 1;
        }
        return metrics;
    }
    async getAverageProcessingTime() {
        const completedRefunds = await this.db
            .select({
            requestedAt: this.refunds.requestedAt,
            completedAt: this.refunds.completedAt,
        })
            .from(this.refunds)
            .where(eq(this.refunds.status, 'completed'));
        if (completedRefunds.length === 0)
            return 0;
        const totalTime = completedRefunds.reduce((sum, refund) => {
            if (refund.completedAt && refund.requestedAt) {
                return sum + (toMillis(refund.completedAt) - toMillis(refund.requestedAt));
            }
            return sum;
        }, 0);
        return totalTime / completedRefunds.length;
    }
    /**
     * The refunds that match every filter given, newest first. `startDate` and `endDate` fall in the years
     * 1 to 9999, and `minAmount` and `maxAmount` are whole minor units of their currency, at most 2^53 - 1 of
     * them, as the amount column holds; anything else throws `FailureError` (`invariant`) before a query.
     * A `userId` no row can hold (U+0000), or a `status` or `reason` that is not a refund status or reason, matches none.
     */
    async searchRefunds(filters) {
        invariant([filters.startDate, filters.endDate].every(time => time === undefined || isPgInstant(time)), 'searchRefunds needs times in the years 1 to 9999 (UTC)');
        // A bound the column cannot hold made `toMinorColumn` throw a raw RoundingNecessaryError or NumericRangeError
        invariant([filters.minAmount, filters.maxAmount].every(amount => amount === undefined || fitsAmountColumn(amount)), 'searchRefunds needs amount bounds in whole minor units, at most 2^53 - 1 of them');
        if (!findable(filters.userId))
            return [];
        if (filters.status !== undefined && !is(filters.status, refundStatusSchema))
            return [];
        if (filters.reason !== undefined && !is(filters.reason, refundReasonSchema))
            return [];
        const conditions = [];
        if (filters.status) {
            conditions.push(eq(this.refunds.status, filters.status));
        }
        if (filters.reason) {
            conditions.push(eq(this.refunds.reason, filters.reason));
        }
        if (filters.userId) {
            conditions.push(eq(this.refunds.requestedBy, filters.userId));
        }
        if (filters.startDate) {
            conditions.push(gte(this.refunds.createdAt, filters.startDate));
        }
        if (filters.endDate) {
            conditions.push(lte(this.refunds.createdAt, filters.endDate));
        }
        if (filters.minAmount !== undefined) {
            conditions.push(eq(this.refunds.currency, filters.minAmount.currency.code), gte(this.refunds.refundAmountMinor, toMinorColumn(filters.minAmount)));
        }
        if (filters.maxAmount !== undefined) {
            conditions.push(eq(this.refunds.currency, filters.maxAmount.currency.code), lte(this.refunds.refundAmountMinor, toMinorColumn(filters.maxAmount)));
        }
        return this.db
            .select()
            .from(this.refunds)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(this.refunds.createdAt));
    }
}
export function createRefundRepository(db, tables) {
    return new RefundRepository(db, tables);
}
//# sourceMappingURL=repository.js.map