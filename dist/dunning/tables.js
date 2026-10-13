import { sql } from 'drizzle-orm';
import { bigint, boolean, check, integer, jsonb, real, text, varchar } from 'drizzle-orm/pg-core';
import { instant } from '@arki/db/temporal';
import { customerIdFactory, paymentIdFactory, subscriptionIdFactory } from '../core/primitives.js';
import { communicationChannelValues, communicationStatusValues, customerRiskProfileIdFactory, customerSegmentIdFactory, customerSegmentTypeValues, dunningCampaignIdFactory, dunningCampaignStatusValues, dunningCampaignTypeValues, dunningCommunicationIdFactory, dunningExecutionIdFactory, dunningTemplateIdFactory, executionStatusValues, riskCategoryValues, } from './primitives.js';
export function createDunningTables({ schema, customerIdRef, paymentIdRef, subscriptionIdRef, }) {
    const customerFk = customerIdFactory.createForeignKeyFactory(customerIdRef);
    const paymentFk = paymentIdFactory.createForeignKeyFactory(paymentIdRef);
    const subscriptionFk = subscriptionIdFactory.createForeignKeyFactory(subscriptionIdRef);
    const dunningCampaignTypeEnum = schema.enum('dunning_campaign_type', dunningCampaignTypeValues);
    const dunningCampaignStatusEnum = schema.enum('dunning_campaign_status', dunningCampaignStatusValues);
    const communicationChannelEnum = schema.enum('communication_channel', communicationChannelValues);
    const communicationStatusEnum = schema.enum('communication_status', communicationStatusValues);
    const executionStatusEnum = schema.enum('execution_status', executionStatusValues);
    const customerSegmentTypeEnum = schema.enum('customer_segment_type', customerSegmentTypeValues);
    const riskCategoryEnum = schema.enum('risk_category', riskCategoryValues);
    const dunningCampaigns = schema.table('dunning_campaigns', {
        id: dunningCampaignIdFactory.primaryColumn(),
        name: varchar('name', { length: 255 }).notNull(),
        description: text('description'),
        type: dunningCampaignTypeEnum('type').$type().notNull(),
        status: dunningCampaignStatusEnum('status').$type().notNull().default('draft'),
        trigger: jsonb('trigger')
            .$type()
            .notNull(),
        settings: jsonb('settings')
            .$type()
            .notNull(),
        targetSegments: jsonb('target_segments').$type().notNull().default([]),
        createdBy: text('created_by').notNull(),
        updatedBy: text('updated_by'),
        metadata: jsonb('metadata').$type(),
        createdAt: instant('created_at').notNull().default(sql `now()`),
        updatedAt: instant('updated_at').notNull().default(sql `now()`),
    });
    const dunningTemplates = schema.table('dunning_templates', {
        id: dunningTemplateIdFactory.primaryColumn(),
        campaignId: dunningCampaignIdFactory.foreignKey('campaign_id', () => dunningCampaigns.id, { onDelete: 'cascade' }),
        name: varchar('name', { length: 255 }).notNull(),
        description: text('description'),
        stepNumber: integer('step_number').notNull(),
        delayHours: integer('delay_hours').notNull().default(0),
        communication: jsonb('communication')
            .$type()
            .notNull(),
        isActive: boolean('is_active').notNull().default(true),
        abTestVariant: varchar('ab_test_variant', { length: 50 }),
        metadata: jsonb('metadata').$type(),
        createdAt: instant('created_at').notNull().default(sql `now()`),
        updatedAt: instant('updated_at').notNull().default(sql `now()`),
    });
    const dunningExecutions = schema.table('dunning_executions', {
        id: dunningExecutionIdFactory.primaryColumn(),
        campaignId: dunningCampaignIdFactory.foreignKey('campaign_id', () => dunningCampaigns.id, { onDelete: 'cascade' }),
        templateId: dunningTemplateIdFactory.optionalForeignKey('template_id', () => dunningTemplates.id, {
            onDelete: 'set null',
        }),
        customerId: customerFk.required('customer_id', { onDelete: 'cascade' }),
        subscriptionId: subscriptionFk.optional('subscription_id', { onDelete: 'set null' }),
        paymentId: paymentFk.optional('payment_id', { onDelete: 'set null' }),
        triggerType: varchar('trigger_type', { length: 100 }).notNull(),
        triggerData: jsonb('trigger_data').$type().notNull(),
        status: executionStatusEnum('status').$type().notNull().default('scheduled'),
        scheduledAt: instant('scheduled_at').notNull(),
        startedAt: instant('started_at'),
        completedAt: instant('completed_at'),
        result: jsonb('result').$type(),
        errorMessage: text('error_message'),
        retryCount: integer('retry_count').notNull().default(0),
        nextRetryAt: instant('next_retry_at'),
        metadata: jsonb('metadata').$type(),
        createdAt: instant('created_at').notNull().default(sql `now()`),
        updatedAt: instant('updated_at').notNull().default(sql `now()`),
    });
    const dunningCommunications = schema.table('dunning_communications', {
        id: dunningCommunicationIdFactory.primaryColumn(),
        executionId: dunningExecutionIdFactory.foreignKey('execution_id', () => dunningExecutions.id, {
            onDelete: 'cascade',
        }),
        customerId: customerFk.required('customer_id', { onDelete: 'cascade' }),
        templateId: dunningTemplateIdFactory.foreignKey('template_id', () => dunningTemplates.id, { onDelete: 'restrict' }),
        channel: communicationChannelEnum('channel').$type().notNull(),
        recipient: varchar('recipient', { length: 255 }).notNull(),
        subject: varchar('subject', { length: 500 }),
        content: text('content').notNull(),
        status: communicationStatusEnum('status').$type().notNull().default('pending'),
        sentAt: instant('sent_at'),
        deliveredAt: instant('delivered_at'),
        openedAt: instant('opened_at'),
        clickedAt: instant('clicked_at'),
        failureReason: text('failure_reason'),
        providerMessageId: varchar('provider_message_id', { length: 255 }),
        providerResponse: jsonb('provider_response').$type(),
        trackingData: jsonb('tracking_data').$type(),
        metadata: jsonb('metadata').$type(),
        createdAt: instant('created_at').notNull().default(sql `now()`),
        updatedAt: instant('updated_at').notNull().default(sql `now()`),
    });
    const customerSegments = schema.table('customer_segments', {
        id: customerSegmentIdFactory.primaryColumn(),
        name: varchar('name', { length: 255 }).notNull(),
        description: text('description'),
        type: customerSegmentTypeEnum('type').$type().notNull(),
        criteria: jsonb('criteria')
            .$type()
            .notNull(),
        isActive: boolean('is_active').notNull().default(true),
        customerCount: integer('customer_count').default(0),
        lastCalculated: instant('last_calculated'),
        autoUpdate: boolean('auto_update').notNull().default(true),
        updateFrequency: integer('update_frequency').default(24),
        createdBy: text('created_by').notNull(),
        metadata: jsonb('metadata').$type(),
        createdAt: instant('created_at').notNull().default(sql `now()`),
        updatedAt: instant('updated_at').notNull().default(sql `now()`),
    });
    const customerRiskProfiles = schema.table('customer_risk_profiles', {
        id: customerRiskProfileIdFactory.primaryColumn(),
        customerId: customerFk.required('customer_id', { onDelete: 'cascade' }),
        segmentIds: jsonb('segment_ids').$type().notNull().default([]),
        riskScore: jsonb('risk_score')
            .$type()
            .notNull(),
        paymentHistory: jsonb('payment_history')
            .$type()
            .notNull(),
        subscriptionHistory: jsonb('subscription_history')
            .$type()
            .notNull(),
        engagementMetrics: jsonb('engagement_metrics')
            .$type()
            .notNull(),
        communicationPreferences: jsonb('communication_preferences')
            .$type()
            .notNull(),
        metadata: jsonb('metadata').$type(),
        createdAt: instant('created_at').notNull().default(sql `now()`),
        updatedAt: instant('updated_at').notNull().default(sql `now()`),
    });
    const dunningCampaignAnalytics = schema.table('dunning_campaign_analytics', {
        id: varchar('id', { length: 255 }).primaryKey(),
        campaignId: dunningCampaignIdFactory.foreignKey('campaign_id', () => dunningCampaigns.id, { onDelete: 'cascade' }),
        date: instant('date').notNull(),
        executions: integer('executions').notNull().default(0),
        customersReached: integer('customers_reached').notNull().default(0),
        communicationsSent: integer('communications_sent').notNull().default(0),
        emailsSent: integer('emails_sent').notNull().default(0),
        emailsOpened: integer('emails_opened').notNull().default(0),
        emailsClicked: integer('emails_clicked').notNull().default(0),
        smsSent: integer('sms_sent').notNull().default(0),
        smsDelivered: integer('sms_delivered').notNull().default(0),
        paymentsRecovered: integer('payments_recovered').notNull().default(0),
        /** Money of one currency per row: `currency` names the unit of the three `*Minor` columns. Read and write through `core/money.ts`. */
        currency: varchar('currency', { length: 3 }).notNull().default('USD'),
        revenueRecoveredMinor: bigint('revenue_recovered_minor', { mode: 'number' }).notNull().default(0),
        unsubscribes: integer('unsubscribes').notNull().default(0),
        complaints: integer('complaints').notNull().default(0),
        communicationCostsMinor: bigint('communication_costs_minor', { mode: 'number' }).notNull().default(0),
        processingCostsMinor: bigint('processing_costs_minor', { mode: 'number' }).notNull().default(0),
        conversionRate: real('conversion_rate').notNull().default(0),
        roi: real('roi').notNull().default(0),
        metadata: jsonb('metadata').$type(),
        createdAt: instant('created_at').notNull().default(sql `now()`),
        updatedAt: instant('updated_at').notNull().default(sql `now()`),
    }, (_table) => [
        check('dunning_analytics_revenue_recovered_minor_not_negative', sql `"revenue_recovered_minor" >= 0`),
        check('dunning_analytics_communication_costs_minor_not_negative', sql `"communication_costs_minor" >= 0`),
        check('dunning_analytics_processing_costs_minor_not_negative', sql `"processing_costs_minor" >= 0`),
    ]);
    const dunningCampaignForeignKeys = dunningCampaignIdFactory.createForeignKeyFactory(() => dunningCampaigns.id);
    const dunningTemplateForeignKeys = dunningTemplateIdFactory.createForeignKeyFactory(() => dunningTemplates.id);
    const dunningExecutionForeignKeys = dunningExecutionIdFactory.createForeignKeyFactory(() => dunningExecutions.id);
    const dunningCommunicationForeignKeys = dunningCommunicationIdFactory.createForeignKeyFactory(() => dunningCommunications.id);
    const customerSegmentForeignKeys = customerSegmentIdFactory.createForeignKeyFactory(() => customerSegments.id);
    const customerRiskProfileForeignKeys = customerRiskProfileIdFactory.createForeignKeyFactory(() => customerRiskProfiles.id);
    return {
        enums: {
            dunningCampaignTypeEnum,
            dunningCampaignStatusEnum,
            communicationChannelEnum,
            communicationStatusEnum,
            executionStatusEnum,
            customerSegmentTypeEnum,
            riskCategoryEnum,
        },
        dunningCampaigns,
        dunningTemplates,
        dunningExecutions,
        dunningCommunications,
        customerSegments,
        customerRiskProfiles,
        dunningCampaignAnalytics,
        foreignKeys: {
            dunningCampaignForeignKeys,
            dunningTemplateForeignKeys,
            dunningExecutionForeignKeys,
            dunningCommunicationForeignKeys,
            customerSegmentForeignKeys,
            customerRiskProfileForeignKeys,
        },
    };
}
//# sourceMappingURL=tables.js.map