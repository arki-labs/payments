/**
 * Shared pieces of the service tests
 *
 * A service reads through a repository and writes through the journal. The
 * real repositories read with node-postgres and the app's relations. The
 * package tests run on PGlite, so `coreReads` and `refundReads` read the same
 * tables with plain selects. Nothing here writes a table directly: seeds go
 * through the same commands the services use.
 */
import { and, eq, gte, lte } from 'drizzle-orm';
import { instant } from '@arki/date';
import { orThrow } from '@arki/failure';
import { RefundService } from './refunds/service.js';
import { core, customerId, meta, planId, refundsTables, typed, userId } from './test-support.js';
const { customers, payments, plans, subscriptions } = core;
const { refunds } = refundsTables;
/** The app's command runner, as a service gets it: here it runs on the test database. */
export function runnerOn(db) {
    return (command, input) => typed.journal.run(db, command, input, meta);
}
/** The reads of the payments repository that the services use. */
export function coreReads(db) {
    async function withPlan(row) {
        if (!row) {
            return null;
        }
        const [plan] = await db.select().from(plans).where(eq(plans.id, row.planId));
        if (!plan) {
            throw new Error(`plan ${row.planId} is missing`);
        }
        return { ...row, plan };
    }
    return {
        async findPlanById(id) {
            const [plan] = await db.select().from(plans).where(eq(plans.id, id));
            return plan ?? null;
        },
        async findCustomerByUserId(ownerId) {
            const [customer] = await db.select().from(customers).where(eq(customers.userId, ownerId));
            return customer ?? null;
        },
        async findCustomerById(id) {
            const [customer] = await db.select().from(customers).where(eq(customers.id, id));
            return customer ?? null;
        },
        async findSubscriptionById(id) {
            const [row] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
            return withPlan(row);
        },
        async findActiveSubscriptionByUserId(ownerId) {
            const [row] = await db
                .select()
                .from(subscriptions)
                .where(and(eq(subscriptions.userId, ownerId), eq(subscriptions.status, 'active')));
            return withPlan(row);
        },
        async findSubscriptionsByUserId(ownerId) {
            return db.select().from(subscriptions).where(eq(subscriptions.userId, ownerId));
        },
        async findSubscriptionsByStatus(status) {
            return db.select().from(subscriptions).where(eq(subscriptions.status, status));
        },
        async findSubscriptionsEndingInRange(startDate, endDate) {
            return db
                .select()
                .from(subscriptions)
                .where(and(gte(subscriptions.currentPeriodEnd, startDate), lte(subscriptions.currentPeriodEnd, endDate)));
        },
        async getSubscriptionStats() {
            return db.select().from(subscriptions);
        },
        async getPaymentStats() {
            return db.select().from(payments);
        },
        async findPaymentById(id) {
            const [row] = await db.select().from(payments).where(eq(payments.id, id));
            return row ?? null;
        },
    };
}
function notCovered(name) {
    return () => Promise.reject(new Error(`${name} is not covered by the service tests`));
}
/** The refund reads `RefundService` uses to decide. Its report queries are not part of these tests. */
export function refundReads(db) {
    return {
        async findById(refundId) {
            const [row] = await db.select().from(refunds).where(eq(refunds.id, refundId));
            return row ?? null;
        },
        async findByProviderRefundId(providerRefundId) {
            const [row] = await db.select().from(refunds).where(eq(refunds.providerRefundId, providerRefundId));
            return row ?? null;
        },
        async findByPaymentId(paymentId) {
            return db.select().from(refunds).where(eq(refunds.paymentId, paymentId));
        },
        getRefundMetrics: notCovered('getRefundMetrics'),
        getAverageProcessingTime: notCovered('getAverageProcessingTime'),
        searchRefunds: notCovered('searchRefunds'),
    };
}
/** A provider method the test does not expect the service to call. */
export function unexpectedCall(name) {
    return () => Promise.reject(new Error(`unexpected provider call: ${name}`));
}
let next = 0;
/** A stored subscription in the given status, written by the `createSubscription` command. */
export function seedSubscription(writes, status) {
    next += 1;
    return orThrow(writes.createSubscription({
        userId,
        planId,
        customerId,
        providerSubscriptionId: `psub_service_${next}`,
        status,
        currentPeriodStart: instant('2026-01-01T00:00:00.000Z'),
        currentPeriodEnd: instant('2026-02-01T00:00:00.000Z'),
        canceledAt: status === 'canceled' ? instant('2026-01-15T00:00:00.000Z') : null,
    }));
}
/** A stored `pending` payment, written by the `initiatePayment` command. */
export function seedPayment(writes, subscriptionId, amount = '25', currency = 'USD') {
    next += 1;
    return orThrow(writes.initiatePayment({
        subscriptionId,
        userId,
        customerId,
        providerPaymentId: `pi_service_${next}`,
        amount: { amount, currency },
    }));
}
export async function subscriptionRow(db, subscriptionId) {
    const [row] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId));
    return row;
}
export async function refundRow(db, refundId) {
    const [row] = await db.select().from(refunds).where(eq(refunds.id, refundId));
    return row;
}
/** A `RefundService` for a test: `RefundService.create` with a config failure thrown, since a test builds it with good settings. */
export function refundServiceOf(...args) {
    return orThrow(RefundService.create(...args));
}
//# sourceMappingURL=service-test-support.js.map