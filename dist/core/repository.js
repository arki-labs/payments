import { eq } from 'drizzle-orm';
import { now } from '@arki/date';
export class PaymentRepository {
    db;
    q;
    plans;
    customers;
    subscriptions;
    webhookEvents;
    constructor(db, tables) {
        this.db = db;
        // Single boundary cast: drizzle's RQB types are parameterised by the
        // host's full relations graph (unknown at package level). The host
        // contract guarantees the listed tables are registered with their
        // relations — see `PaymentDatabase` doc.
        this.q = db.query;
        this.plans = tables.plans;
        this.customers = tables.customers;
        this.subscriptions = tables.subscriptions;
        this.webhookEvents = tables.webhookEvents;
    }
    // Plan methods
    async createPlan(data) {
        const result = await this.db.insert(this.plans).values(data).returning();
        const row = result[0];
        if (!row) {
            throw new Error('Failed to create plan');
        }
        return row;
    }
    async findPlanById(id) {
        const plan = await this.q.plans.findFirst({ where: { id } });
        return plan ?? null;
    }
    async findPlansByTier(tier) {
        return this.q.plans.findMany({
            where: { tier, isActive: true },
            orderBy: (t) => [t.priceMinor],
        });
    }
    async findActivePlans() {
        return this.q.plans.findMany({
            where: { isActive: true },
            orderBy: (t) => [t.tier, t.priceMinor],
        });
    }
    async updatePlan(id, data) {
        const result = await this.db
            .update(this.plans)
            .set({ ...data, updatedAt: now() })
            .where(eq(this.plans.id, id))
            .returning();
        const row = result[0];
        if (!row) {
            throw new Error('Failed to update plan or plan not found');
        }
        return row;
    }
    async deactivatePlan(id) {
        const result = await this.db
            .update(this.plans)
            .set({ isActive: false, updatedAt: now() })
            .where(eq(this.plans.id, id))
            .returning();
        const row = result[0];
        if (!row) {
            throw new Error('Failed to deactivate plan or plan not found');
        }
        return row;
    }
    async getPlan(id) {
        return this.findPlanById(id);
    }
    // Customer methods
    async createCustomer(data) {
        const result = await this.db.insert(this.customers).values(data).returning();
        const row = result[0];
        if (!row) {
            throw new Error('Failed to create customer');
        }
        return row;
    }
    async findCustomerById(id) {
        const customer = await this.q.customers.findFirst({ where: { id } });
        return customer ?? null;
    }
    async findCustomerByUserId(userId) {
        const customer = await this.q.customers.findFirst({ where: { userId } });
        return customer ?? null;
    }
    async findCustomerByProviderCustomerId(providerCustomerId, provider) {
        const customer = await this.q.customers.findFirst({
            where: { providerCustomerId, provider },
        });
        return customer ?? null;
    }
    async updateCustomer(id, data) {
        const result = await this.db
            .update(this.customers)
            .set({ ...data, updatedAt: now() })
            .where(eq(this.customers.id, id))
            .returning();
        const row = result[0];
        if (!row) {
            throw new Error('Failed to update customer or customer not found');
        }
        return row;
    }
    async deleteCustomer(id) {
        await this.db.delete(this.customers).where(eq(this.customers.id, id));
    }
    // Subscription methods
    async findSubscriptionById(id) {
        const subscription = await this.q.subscriptions.findFirst({
            where: { id },
            with: { plan: true, customer: true },
        });
        if (!subscription)
            return null;
        const row = subscription;
        return { ...row, plan: row.plan, customer: row.customer };
    }
    async findSubscriptionsByUserId(userId) {
        return this.q.subscriptions.findMany({
            where: { userId },
            with: { plan: true, customer: true },
            orderBy: (t, { desc }) => [desc(t.createdAt)],
        });
    }
    async findActiveSubscriptionByUserId(userId) {
        const subscription = await this.q.subscriptions.findFirst({
            where: { userId, status: 'active' },
            with: { plan: true, customer: true },
        });
        if (!subscription)
            return null;
        const row = subscription;
        return { ...row, plan: row.plan, customer: row.customer };
    }
    async findSubscriptionByProviderSubscriptionId(providerSubscriptionId) {
        const subscription = await this.q.subscriptions.findFirst({
            where: { providerSubscriptionId },
            with: { plan: true, customer: true },
        });
        return subscription ?? null;
    }
    async findSubscriptionsByStatus(status) {
        return this.q.subscriptions.findMany({
            where: { status },
            with: { plan: true, customer: true },
            orderBy: (t, { desc }) => [desc(t.createdAt)],
        });
    }
    async findSubscriptionsEndingInRange(startDate, endDate) {
        return this.q.subscriptions.findMany({
            where: {
                currentPeriodEnd: { gte: startDate, lte: endDate },
                status: 'active',
            },
            with: { plan: true, customer: true },
            orderBy: (t) => [t.currentPeriodEnd],
        });
    }
    async getSubscription(id) {
        return this.findSubscriptionById(id);
    }
    // Payment methods
    async findPaymentById(id) {
        const payment = await this.q.payments.findFirst({
            where: { id },
            with: {
                subscription: { with: { plan: true } },
                customer: true,
            },
        });
        return payment ?? null;
    }
    async findPaymentsByUserId(userId, limit = 50) {
        return this.q.payments.findMany({
            where: { userId },
            with: {
                subscription: { with: { plan: true } },
                customer: true,
            },
            orderBy: (t, { desc }) => [desc(t.createdAt)],
            limit,
        });
    }
    async findPaymentsBySubscriptionId(subscriptionId) {
        return this.q.payments.findMany({
            where: { subscriptionId },
            with: {
                subscription: { with: { plan: true } },
                customer: true,
            },
            orderBy: (t, { desc }) => [desc(t.createdAt)],
        });
    }
    async findPaymentByProviderPaymentId(providerPaymentId) {
        const payment = await this.q.payments.findFirst({
            where: { providerPaymentId },
            with: {
                subscription: { with: { plan: true } },
                customer: true,
            },
        });
        return payment ?? null;
    }
    async findPaymentsByStatus(status) {
        return this.q.payments.findMany({
            where: { status },
            with: {
                subscription: { with: { plan: true } },
                customer: true,
            },
            orderBy: (t, { desc }) => [desc(t.createdAt)],
        });
    }
    // Webhook event methods
    async createWebhookEvent(data) {
        const result = await this.db.insert(this.webhookEvents).values(data).returning();
        const row = result[0];
        if (!row) {
            throw new Error('Failed to create webhook event');
        }
        return row;
    }
    async findWebhookEventById(id) {
        const webhookEvent = await this.q.webhookEvents.findFirst({ where: { id } });
        return webhookEvent ?? null;
    }
    async findWebhookEventByProviderEventId(providerEventId, provider) {
        const webhookEvent = await this.q.webhookEvents.findFirst({
            where: { providerEventId, provider },
        });
        return webhookEvent ?? null;
    }
    async findUnprocessedWebhookEvents(limit = 100) {
        return this.q.webhookEvents.findMany({
            where: { processed: false },
            orderBy: (t) => [t.createdAt],
            limit,
        });
    }
    async findWebhookEventsByType(eventType) {
        return this.q.webhookEvents.findMany({
            where: { eventType },
            orderBy: (t, { desc }) => [desc(t.createdAt)],
        });
    }
    async updateWebhookEvent(id, data) {
        const result = await this.db
            .update(this.webhookEvents)
            .set({ ...data, updatedAt: now() })
            .where(eq(this.webhookEvents.id, id))
            .returning();
        const row = result[0];
        if (!row) {
            throw new Error('Failed to update webhook event or webhook event not found');
        }
        return row;
    }
    async markWebhookEventAsProcessed(id) {
        const result = await this.db
            .update(this.webhookEvents)
            .set({
            processed: true,
            processedAt: now(),
            updatedAt: now(),
        })
            .where(eq(this.webhookEvents.id, id))
            .returning();
        const row = result[0];
        if (!row) {
            throw new Error('Failed to mark webhook event as processed or webhook event not found');
        }
        return row;
    }
    async incrementWebhookEventAttempts(id, errorMessage) {
        const currentEvent = await this.findWebhookEventById(id);
        if (!currentEvent) {
            throw new Error('Webhook event not found');
        }
        const result = await this.db
            .update(this.webhookEvents)
            .set({
            attempts: currentEvent.attempts + 1,
            lastAttemptAt: now(),
            errorMessage,
            updatedAt: now(),
        })
            .where(eq(this.webhookEvents.id, id))
            .returning();
        const row = result[0];
        if (!row) {
            throw new Error('Failed to increment webhook event attempts');
        }
        return row;
    }
    // Analytics and reporting methods
    async getSubscriptionStats(startDate, endDate) {
        const createdAt = startDate || endDate
            ? { ...(startDate && { gte: startDate }), ...(endDate && { lte: endDate }) }
            : undefined;
        return this.q.subscriptions.findMany({
            where: createdAt ? { createdAt } : undefined,
            with: { plan: true },
        });
    }
    async getPaymentStats(startDate, endDate) {
        const createdAt = startDate || endDate
            ? { ...(startDate && { gte: startDate }), ...(endDate && { lte: endDate }) }
            : undefined;
        return this.q.payments.findMany({
            where: createdAt ? { createdAt } : undefined,
            with: { subscription: true },
        });
    }
    async getCustomerCount() {
        const result = await this.db.select({ count: this.customers.id }).from(this.customers);
        return result.length;
    }
    async getActiveSubscriptionCount() {
        const result = await this.db
            .select({ count: this.subscriptions.id })
            .from(this.subscriptions)
            .where(eq(this.subscriptions.status, 'active'));
        return result.length;
    }
}
export function createPaymentRepository(db, { tables }) {
    return new PaymentRepository(db, tables);
}
//# sourceMappingURL=repository.js.map