import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { fromDate, now, sub } from '@arki/date';
import { sumMinorByCurrency } from './analytics-money.js';
import { readCustomerRiskProfile } from './stored-risk-profile.js';
export class DunningCampaignRepository {
    db;
    q;
    dunningCampaigns;
    dunningCampaignAnalytics;
    constructor(db, tables) {
        this.db = db;
        this.q = db.query;
        this.dunningCampaigns = tables.dunningCampaigns;
        this.dunningCampaignAnalytics = tables.dunningCampaignAnalytics;
    }
    async findById(id) {
        const result = await this.q.dunningCampaigns.findFirst({ where: { id } });
        return result ?? null;
    }
    async findMany(query) {
        const { limit, offset, type, status, search, sortBy, sortOrder } = query;
        return this.q.dunningCampaigns.findMany({
            where: {
                ...(type && { type }),
                ...(status && { status }),
                ...(search && { name: { ilike: `%${search}%` } }),
            },
            orderBy: (table, { asc, desc }) => (sortOrder === 'asc' ? asc(table[sortBy]) : desc(table[sortBy])),
            limit,
            offset,
        });
    }
    async create(input) {
        const [campaign] = await this.db
            .insert(this.dunningCampaigns)
            .values({
            name: input.name,
            description: input.description,
            type: input.type,
            trigger: input.trigger,
            settings: input.settings,
            targetSegments: input.targetSegments,
            createdBy: input.createdBy,
        })
            .returning();
        if (!campaign) {
            throw new Error('Failed to create dunning campaign');
        }
        return campaign;
    }
    async update(id, input) {
        const [campaign] = await this.db
            .update(this.dunningCampaigns)
            .set({ ...input, updatedAt: now() })
            .where(eq(this.dunningCampaigns.id, id))
            .returning();
        return (campaign) ?? null;
    }
    async delete(id) {
        await this.db.delete(this.dunningCampaigns).where(eq(this.dunningCampaigns.id, id));
    }
    async findByType(type) {
        return this.q.dunningCampaigns.findMany({ where: { type, status: 'active' } });
    }
    async findActiveForTrigger(triggerType, customerSegmentIds) {
        // The trigger-type lookup hits a JSONB field (`trigger->>'type'`) and the
        // segment intersection uses a JSONB EXISTS subquery — both have no
        // structured-filter equivalent and stay as RAW.
        const hasSegments = customerSegmentIds && customerSegmentIds.length > 0;
        return this.q.dunningCampaigns.findMany({
            where: {
                status: 'active',
                RAW: table => {
                    const triggerTypePredicate = sql `${table.trigger}->>'type' = ${triggerType}`;
                    return hasSegments
                        ? and(triggerTypePredicate, sql `EXISTS (SELECT 1 FROM jsonb_array_elements_text(${table.targetSegments}) AS segment WHERE segment IN ${customerSegmentIds})`)
                        : triggerTypePredicate;
                },
            },
            orderBy: table => desc(sql `${table.settings}->>'priority'`),
        });
    }
    async updateStatus(id, status, updatedBy) {
        const [campaign] = await this.db
            .update(this.dunningCampaigns)
            .set({ status, updatedBy, updatedAt: now() })
            .where(eq(this.dunningCampaigns.id, id))
            .returning();
        return campaign;
    }
    async getAnalyticsSummary(campaignId, days = 30) {
        // Local-time calendar days, as before: the working value stays a `Date` until the query.
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        return this.getAnalyticsSince(fromDate(startDate), campaignId);
    }
    /** How many campaigns exist, and how many of them are `active`. */
    async countCampaigns() {
        const rows = await this.db
            .select({
            status: this.dunningCampaigns.status,
            total: sql `count(*)::int`.mapWith(Number),
        })
            .from(this.dunningCampaigns)
            .groupBy(this.dunningCampaigns.status);
        return {
            total: rows.reduce((sum, row) => sum + row.total, 0),
            active: rows.find((row) => row.status === 'active')?.total ?? 0,
        };
    }
    /**
     * The campaign that recovered the most payments since `since`, its conversion rate the
     * tie-break. Null when no campaign recovered a payment: there is no top to name. Ranked
     * by count, not money, because campaigns recover in different currencies.
     */
    async findTopPerformer(since) {
        const analytics = this.dunningCampaignAnalytics;
        const recovered = sql `COALESCE(SUM(${analytics.paymentsRecovered}), 0)::int`.mapWith(Number);
        const conversion = sql `COALESCE(AVG(${analytics.conversionRate}), 0)`.mapWith(Number);
        const [top] = await this.db
            .select({ campaignId: analytics.campaignId, paymentsRecovered: recovered, conversionRate: conversion })
            .from(analytics)
            .where(gte(analytics.date, since))
            .groupBy(analytics.campaignId)
            .having(sql `SUM(${analytics.paymentsRecovered}) > 0`)
            .orderBy(desc(recovered), desc(conversion), analytics.campaignId)
            .limit(1);
        return top ?? null;
    }
    /** The analytics rows from `since` on, summed. Money stays one balance per currency. */
    async getAnalyticsSince(since, campaignId) {
        const inRange = and(gte(this.dunningCampaignAnalytics.date, since), campaignId ? eq(this.dunningCampaignAnalytics.campaignId, campaignId) : undefined);
        const [counters] = await this.db
            .select({
            executions: sql `COALESCE(SUM(${this.dunningCampaignAnalytics.executions}), 0)`.mapWith(Number),
            customersReached: sql `COALESCE(SUM(${this.dunningCampaignAnalytics.customersReached}), 0)`.mapWith(Number),
            communicationsSent: sql `COALESCE(SUM(${this.dunningCampaignAnalytics.communicationsSent}), 0)`.mapWith(Number),
            paymentsRecovered: sql `COALESCE(SUM(${this.dunningCampaignAnalytics.paymentsRecovered}), 0)`.mapWith(Number),
            conversionRate: sql `COALESCE(AVG(${this.dunningCampaignAnalytics.conversionRate}), 0)`.mapWith(Number),
            roi: sql `COALESCE(AVG(${this.dunningCampaignAnalytics.roi}), 0)`.mapWith(Number),
        })
            .from(this.dunningCampaignAnalytics)
            .where(inRange);
        // An aggregate without GROUP BY always answers one row
        if (!counters) {
            throw new Error('Campaign analytics aggregate returned no row');
        }
        // Money is summed per currency: rows of different currencies never add up.
        const recovered = await this.db
            .select({
            currency: this.dunningCampaignAnalytics.currency,
            units: sql `COALESCE(SUM(${this.dunningCampaignAnalytics.revenueRecoveredMinor}), 0)::text`,
        })
            .from(this.dunningCampaignAnalytics)
            .where(inRange)
            .groupBy(this.dunningCampaignAnalytics.currency);
        return { ...counters, revenueRecovered: sumMinorByCurrency(recovered) };
    }
}
export class DunningTemplateRepository {
    db;
    q;
    dunningTemplates;
    constructor(db, tables) {
        this.db = db;
        this.q = db.query;
        this.dunningTemplates = tables.dunningTemplates;
    }
    async findById(id) {
        const result = await this.q.dunningTemplates.findFirst({ where: { id } });
        return result ?? null;
    }
    async findByCampaignId(campaignId) {
        return this.q.dunningTemplates.findMany({
            where: { campaignId },
            orderBy: (t) => t.stepNumber,
        });
    }
    async create(input) {
        const [template] = await this.db
            .insert(this.dunningTemplates)
            .values({
            campaignId: input.campaignId,
            name: input.name,
            description: input.description,
            stepNumber: input.stepNumber,
            delayHours: input.delayHours,
            communication: input.communication,
            abTestVariant: input.abTestVariant,
        })
            .returning();
        if (!template) {
            throw new Error('Failed to create dunning template');
        }
        return template;
    }
    async update(id, input) {
        const [template] = await this.db
            .update(this.dunningTemplates)
            .set({ ...input, updatedAt: now() })
            .where(eq(this.dunningTemplates.id, id))
            .returning();
        return (template) ?? null;
    }
    async delete(id) {
        await this.db.delete(this.dunningTemplates).where(eq(this.dunningTemplates.id, id));
    }
    async findActiveTemplates(campaignId) {
        return this.q.dunningTemplates.findMany({
            where: { campaignId, isActive: true },
            orderBy: (t) => t.stepNumber,
        });
    }
    async updateStatus(id, isActive) {
        const [template] = await this.db
            .update(this.dunningTemplates)
            .set({ isActive, updatedAt: now() })
            .where(eq(this.dunningTemplates.id, id))
            .returning();
        return template;
    }
}
export class DunningExecutionRepository {
    db;
    q;
    dunningExecutions;
    constructor(db, tables) {
        this.db = db;
        this.q = db.query;
        this.dunningExecutions = tables.dunningExecutions;
    }
    async findById(id) {
        const result = await this.q.dunningExecutions.findFirst({ where: { id } });
        return result ?? null;
    }
    async findMany(query) {
        const { limit, offset, campaignId, customerId, status, scheduledAfter, scheduledBefore, sortBy, sortOrder } = query;
        const scheduledAt = scheduledAfter || scheduledBefore
            ? {
                ...(scheduledAfter && { gte: scheduledAfter }),
                ...(scheduledBefore && { lte: scheduledBefore }),
            }
            : undefined;
        return this.q.dunningExecutions.findMany({
            where: {
                ...(campaignId && { campaignId }),
                ...(customerId && { customerId }),
                ...(status && { status }),
                ...(scheduledAt && { scheduledAt }),
            },
            orderBy: (table, { asc, desc }) => (sortOrder === 'asc' ? asc(table[sortBy]) : desc(table[sortBy])),
            limit,
            offset,
        });
    }
    async create(input) {
        const [execution] = await this.db
            .insert(this.dunningExecutions)
            .values({
            campaignId: input.campaignId,
            templateId: input.templateId,
            customerId: input.customerId,
            subscriptionId: input.subscriptionId,
            paymentId: input.paymentId,
            triggerType: input.triggerType,
            triggerData: input.triggerData,
            status: input.status,
            scheduledAt: input.scheduledAt,
            startedAt: input.startedAt,
            completedAt: input.completedAt,
            result: input.result,
            errorMessage: input.errorMessage,
            retryCount: input.retryCount,
            nextRetryAt: input.nextRetryAt,
            metadata: input.metadata,
        })
            .returning();
        if (!execution) {
            throw new Error('Failed to create dunning execution');
        }
        return execution;
    }
    async updateStatus(id, status, result, errorMessage, customScheduledAt) {
        const updateData = {
            status,
            updatedAt: now(),
        };
        if (status === 'running' && !result) {
            updateData.startedAt = now();
        }
        else
            switch (status) {
                case 'completed':
                case 'failed': {
                    updateData.completedAt = now();
                    break;
                }
                case 'cancelled': {
                    updateData.completedAt = now();
                    break;
                }
                case 'scheduled': {
                    updateData.scheduledAt = customScheduledAt || now();
                    break;
                }
                // No default
            }
        if (result) {
            updateData.result = result;
        }
        if (errorMessage) {
            updateData.errorMessage = errorMessage;
        }
        const [execution] = await this.db
            .update(this.dunningExecutions)
            .set(updateData)
            .where(eq(this.dunningExecutions.id, id))
            .returning();
        return execution;
    }
    async findScheduledExecutions(limit = 100) {
        return this.q.dunningExecutions.findMany({
            where: {
                status: 'scheduled',
                scheduledAt: { lte: now() },
            },
            orderBy: (t) => t.scheduledAt,
            limit,
        });
    }
    async findRetryableExecutions(limit = 50) {
        return this.q.dunningExecutions.findMany({
            where: {
                status: 'failed',
                nextRetryAt: { lte: now() },
            },
            orderBy: (t) => t.nextRetryAt,
            limit,
        });
    }
    async incrementRetryCount(id, nextRetryAt) {
        const [execution] = await this.db
            .update(this.dunningExecutions)
            .set({
            retryCount: sql `${this.dunningExecutions.retryCount} + 1`,
            nextRetryAt,
            updatedAt: now(),
        })
            .where(eq(this.dunningExecutions.id, id))
            .returning();
        return execution;
    }
    async findRecentForCustomer(customerId, campaignId, hours = 24) {
        const since = sub(now(), { hours });
        return this.q.dunningExecutions.findMany({
            where: {
                customerId,
                campaignId,
                createdAt: { gte: since },
            },
            orderBy: (t, helpers) => helpers.desc(t.createdAt),
        });
    }
}
export class DunningCommunicationRepository {
    db;
    q;
    dunningCommunications;
    constructor(db, tables) {
        this.db = db;
        this.q = db.query;
        this.dunningCommunications = tables.dunningCommunications;
    }
    async findById(id) {
        const result = await this.q.dunningCommunications.findFirst({ where: { id } });
        return result ?? null;
    }
    async findMany(query) {
        const { limit, offset, executionId, customerId, channel, status, sentAfter, sentBefore, sortBy, sortOrder } = query;
        const sentAt = sentAfter || sentBefore
            ? {
                ...(sentAfter && { gte: sentAfter }),
                ...(sentBefore && { lte: sentBefore }),
            }
            : undefined;
        return this.q.dunningCommunications.findMany({
            where: {
                ...(executionId && { executionId }),
                ...(customerId && { customerId }),
                ...(channel && { channel }),
                ...(status && { status }),
                ...(sentAt && { sentAt }),
            },
            orderBy: (table, { asc, desc }) => (sortOrder === 'asc' ? asc(table[sortBy]) : desc(table[sortBy])),
            limit,
            offset,
        });
    }
    async create(input) {
        const [communication] = await this.db
            .insert(this.dunningCommunications)
            .values({
            executionId: input.executionId,
            customerId: input.customerId,
            templateId: input.templateId,
            channel: input.channel,
            recipient: input.recipient,
            subject: input.subject,
            content: input.content,
            status: input.status,
            sentAt: input.sentAt,
            deliveredAt: input.deliveredAt,
            openedAt: input.openedAt,
            clickedAt: input.clickedAt,
            failureReason: input.failureReason,
            providerMessageId: input.providerMessageId,
            providerResponse: input.providerResponse,
            trackingData: input.trackingData,
            metadata: input.metadata,
        })
            .returning();
        if (!communication) {
            throw new Error('Failed to create dunning communication');
        }
        return communication;
    }
    async updateStatus(id, status, updates = {}) {
        const [communication] = await this.db
            .update(this.dunningCommunications)
            .set({
            status,
            ...updates,
            updatedAt: now(),
        })
            .where(eq(this.dunningCommunications.id, id))
            .returning();
        return (communication) ?? null;
    }
    async findPendingCommunications(limit = 100) {
        return this.q.dunningCommunications.findMany({
            where: { status: 'pending' },
            orderBy: (t) => t.createdAt,
            limit,
        });
    }
    async findByProviderMessageId(providerMessageId) {
        return this.q.dunningCommunications.findFirst({ where: { providerMessageId } });
    }
    async getMetricsForExecution(executionId) {
        const [result] = await this.db
            .select({
            total: sql `COUNT(*)`.mapWith(Number),
            sent: sql `COUNT(CASE WHEN ${this.dunningCommunications.status} = 'sent' THEN 1 END)`.mapWith(Number),
            delivered: sql `COUNT(CASE WHEN ${this.dunningCommunications.status} = 'delivered' THEN 1 END)`.mapWith(Number),
            opened: sql `COUNT(CASE WHEN ${this.dunningCommunications.openedAt} IS NOT NULL THEN 1 END)`.mapWith(Number),
            clicked: sql `COUNT(CASE WHEN ${this.dunningCommunications.clickedAt} IS NOT NULL THEN 1 END)`.mapWith(Number),
            failed: sql `COUNT(CASE WHEN ${this.dunningCommunications.status} = 'failed' THEN 1 END)`.mapWith(Number),
        })
            .from(this.dunningCommunications)
            .where(eq(this.dunningCommunications.executionId, executionId));
        return result;
    }
}
export class CustomerSegmentRepository {
    db;
    q;
    customerSegments;
    constructor(db, tables) {
        this.db = db;
        this.q = db.query;
        this.customerSegments = tables.customerSegments;
    }
    async findById(id) {
        return this.q.customerSegments.findFirst({ where: { id } });
    }
    async findMany(query) {
        const { limit, offset, type, isActive, search, sortBy, sortOrder } = query;
        return this.q.customerSegments.findMany({
            where: {
                ...(type && { type }),
                ...(isActive !== undefined && { isActive }),
                ...(search && { name: { ilike: `%${search}%` } }),
            },
            orderBy: (table, { asc, desc }) => (sortOrder === 'asc' ? asc(table[sortBy]) : desc(table[sortBy])),
            limit,
            offset,
        });
    }
    async create(input) {
        const [segment] = await this.db
            .insert(this.customerSegments)
            .values({
            name: input.name,
            description: input.description,
            type: input.type,
            criteria: input.criteria,
            autoUpdate: input.autoUpdate,
            updateFrequency: input.updateFrequency,
            createdBy: input.createdBy,
        })
            .returning();
        return segment;
    }
    async update(id, input) {
        const [segment] = await this.db
            .update(this.customerSegments)
            .set({ ...input, updatedAt: now() })
            .where(eq(this.customerSegments.id, id))
            .returning();
        return segment;
    }
    async delete(id) {
        await this.db.delete(this.customerSegments).where(eq(this.customerSegments.id, id));
    }
    async updateCustomerCount(id, count) {
        const [segment] = await this.db
            .update(this.customerSegments)
            .set({
            customerCount: count,
            lastCalculated: now(),
            updatedAt: now(),
        })
            .where(eq(this.customerSegments.id, id))
            .returning();
        return segment;
    }
    async findSegmentsForAutoUpdate() {
        // The interval-arithmetic comparison
        // (`lastCalculated + INTERVAL '1 hour' * updateFrequency <= now`)
        // has no structured equivalent — keep it as RAW alongside the structured
        // boolean filters.
        // A raw `sql` parameter bypasses the column codec, so it stays a `Date`.
        const current = new Date();
        return this.q.customerSegments.findMany({
            where: {
                isActive: true,
                autoUpdate: true,
                RAW: table => sql `${table.lastCalculated} IS NULL OR ${table.lastCalculated} + INTERVAL '1 hour' * ${table.updateFrequency} <= ${current}`,
            },
        });
    }
}
export class CustomerRiskProfileRepository {
    db;
    q;
    customerRiskProfiles;
    constructor(db, tables) {
        this.db = db;
        this.q = db.query;
        this.customerRiskProfiles = tables.customerRiskProfiles;
    }
    async findByCustomerId(customerId) {
        const profile = await this.q.customerRiskProfiles.findFirst({ where: { customerId } });
        return profile && readCustomerRiskProfile(profile);
    }
    async create(input) {
        const [profile] = await this.db
            .insert(this.customerRiskProfiles)
            .values({
            customerId: input.customerId,
            segmentIds: input.segmentIds,
            riskScore: input.riskScore,
            paymentHistory: input.paymentHistory,
            subscriptionHistory: input.subscriptionHistory,
            engagementMetrics: input.engagementMetrics,
            communicationPreferences: input.communicationPreferences,
            metadata: input.metadata,
        })
            .returning();
        return profile && readCustomerRiskProfile(profile);
    }
    async update(customerId, input) {
        const [profile] = await this.db
            .update(this.customerRiskProfiles)
            .set({ ...input, updatedAt: now() })
            .where(eq(this.customerRiskProfiles.customerId, customerId))
            .returning();
        return profile && readCustomerRiskProfile(profile);
    }
    async upsert(input) {
        const existing = await this.findByCustomerId(input.customerId);
        if (existing) {
            return this.update(input.customerId, input);
        }
        else {
            return this.create(input);
        }
    }
    async findByRiskCategory(category, limit = 100) {
        const profiles = await this.q.customerRiskProfiles.findMany({
            where: { RAW: table => sql `${table.riskScore}->>'category' = ${category}` },
            orderBy: table => desc(sql `(${table.riskScore}->>'overall')::numeric`),
            limit,
        });
        return profiles.map(profile => readCustomerRiskProfile(profile));
    }
    async findBySegmentId(segmentId, limit = 100) {
        const profiles = await this.q.customerRiskProfiles.findMany({
            where: {
                RAW: table => sql `${table.segmentIds} @> ${JSON.stringify([segmentId])}`,
            },
            limit,
        });
        return profiles.map(profile => readCustomerRiskProfile(profile));
    }
    async updateSegments(customerId, segmentIds) {
        const [profile] = await this.db
            .update(this.customerRiskProfiles)
            .set({ segmentIds, updatedAt: now() })
            .where(eq(this.customerRiskProfiles.customerId, customerId))
            .returning();
        return profile && readCustomerRiskProfile(profile);
    }
}
export function createDunningCampaignRepository(db, tables) {
    return new DunningCampaignRepository(db, tables);
}
export function createDunningTemplateRepository(db, tables) {
    return new DunningTemplateRepository(db, tables);
}
export function createDunningExecutionRepository(db, tables) {
    return new DunningExecutionRepository(db, tables);
}
export function createDunningCommunicationRepository(db, tables) {
    return new DunningCommunicationRepository(db, tables);
}
export function createCustomerSegmentRepository(db, tables) {
    return new CustomerSegmentRepository(db, tables);
}
export function createCustomerRiskProfileRepository(db, tables) {
    return new CustomerRiskProfileRepository(db, tables);
}
/**
 * Aggregate factory for all dunning repositories.
 */
export function createDunningRepository(db, tables) {
    return {
        campaigns: createDunningCampaignRepository(db, tables),
        templates: createDunningTemplateRepository(db, tables),
        executions: createDunningExecutionRepository(db, tables),
        communications: createDunningCommunicationRepository(db, tables),
        customerSegments: createCustomerSegmentRepository(db, tables),
        customerRiskProfiles: createCustomerRiskProfileRepository(db, tables),
    };
}
//# sourceMappingURL=repository.js.map