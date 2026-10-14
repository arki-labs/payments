import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { Instant } from '@arki/date';
import type { MoneyJSON } from '@arki/money';
import type { MoneyBag } from '@arki/money/bag';
import type { CustomerId, PaymentId, SubscriptionId } from '../core/primitives.js';
import type { CommunicationChannel, CommunicationStatus, CustomerSegmentId, DunningCampaignId, DunningCampaignStatus, DunningCampaignType, DunningTemplateId, ExecutionStatus } from './primitives.js';
import type { DunningTables } from './tables.js';
export type CampaignTrigger = {
    type: 'payment_failure' | 'subscription_status' | 'time_based' | 'manual';
    conditions: {
        paymentFailureCount?: number;
        subscriptionStatus?: string[];
        daysSinceLastPayment?: number;
        daysSinceFailure?: number;
        trialEndingDays?: number;
        renewalReminderDays?: number;
    };
    filters?: {
        customerSegments?: CustomerSegmentId[];
        planTiers?: string[];
        subscriptionAge?: {
            min?: number;
            max?: number;
        };
        totalSpent?: SpendRange;
    };
};
export type CampaignSettings = {
    enabled: boolean;
    priority: number;
    cooldownPeriod: number;
    maxExecutionsPerCustomer: number;
    stopOnPaymentSuccess: boolean;
    respectUnsubscribe: boolean;
    businessHoursOnly: boolean;
    timezone?: string;
    allowedDays?: number[];
    abTestVariant?: string;
};
export type CommunicationTemplate = {
    channel: CommunicationChannel;
    subject?: string;
    content: string;
    variables: string[];
    design?: {
        theme?: string;
        brandColors?: Record<string, string>;
        logoUrl?: string;
    };
};
/**
 * A range of money spent, kept as JSON because criteria live in a jsonb
 * column. Both bounds share one currency; only payments in it count.
 */
export type SpendRange = {
    min?: MoneyJSON;
    max?: MoneyJSON;
};
export type SegmentCriteria = {
    totalSpent?: SpendRange;
    subscriptionDuration?: {
        min?: number;
        max?: number;
    };
    paymentFailureHistory?: {
        count: number;
        timeframe: number;
    };
    planTier?: string[];
    lastPaymentDate?: {
        daysAgo: number;
    };
    lifetimeValue?: {
        min?: number;
        max?: number;
    };
    churnRisk?: 'low' | 'medium' | 'high';
    engagementScore?: {
        min?: number;
        max?: number;
    };
    customAttributes?: Record<string, unknown>;
};
export type RiskFactor = {
    name: string;
    weight: number;
    calculation: 'payment_history' | 'engagement' | 'demographic' | 'custom';
    parameters: Record<string, unknown>;
};
export type RiskScore = {
    overall: number;
    factors: Record<string, number>;
    category: 'low' | 'medium' | 'high' | 'critical';
    lastCalculated: Instant;
    trends: {
        direction: 'improving' | 'stable' | 'declining';
        changePercent: number;
        timeframe: number;
    };
};
export type ExecutionResultDb = {
    customersProcessed: number;
    communicationsSent: number;
    errors: {
        customerId: string;
        error: string;
        timestamp: Instant;
    }[];
    performance: {
        processingTime: number;
        successRate: number;
    };
};
export type ExecutionResult = {
    customersProcessed: number;
    communicationsSent: number;
    errors: {
        customerId: CustomerId;
        error: string;
        timestamp: Instant;
    }[];
    performance: {
        processingTime: number;
        successRate: number;
    };
};
export type CampaignMetrics = {
    period: {
        start: Instant;
        end: Instant;
    };
    executions: number;
    customersReached: number;
    communicationsSent: number;
    openRate?: number;
    clickRate?: number;
    responseRate: number;
    paymentsRecovered: {
        count: number;
        totalAmount: number;
    };
    conversionRate: number;
    unsubscribeRate: number;
    complaintRate: number;
    costs: {
        communicationCosts: number;
        processingCosts: number;
        total: number;
    };
    roi: number;
};
export type DunningCampaign = InferSelectModel<DunningTables['dunningCampaigns']>;
export type NewDunningCampaign = InferInsertModel<DunningTables['dunningCampaigns']>;
export type DunningTemplate = InferSelectModel<DunningTables['dunningTemplates']>;
export type NewDunningTemplate = InferInsertModel<DunningTables['dunningTemplates']>;
export type DunningExecution = InferSelectModel<DunningTables['dunningExecutions']>;
export type NewDunningExecution = InferInsertModel<DunningTables['dunningExecutions']>;
export type DunningCommunication = InferSelectModel<DunningTables['dunningCommunications']>;
export type NewDunningCommunication = InferInsertModel<DunningTables['dunningCommunications']>;
export type CustomerSegment = InferSelectModel<DunningTables['customerSegments']>;
export type NewCustomerSegment = InferInsertModel<DunningTables['customerSegments']>;
export type CustomerRiskProfile = InferSelectModel<DunningTables['customerRiskProfiles']>;
export type NewCustomerRiskProfile = InferInsertModel<DunningTables['customerRiskProfiles']>;
export type DunningCampaignWithTemplates = DunningCampaign & {
    templates?: DunningTemplate[];
};
export type DunningCampaignSummary = {
    id: DunningCampaignId;
    name: string;
    type: DunningCampaignType;
    status: DunningCampaignStatus;
    executions: number;
    customersReached: number;
    conversionRate: number;
    revenueRecovered: number;
    lastExecuted?: Instant;
    createdAt: Instant;
};
export type CustomerData = {
    id: CustomerId;
    name?: string;
    email?: string;
    phone?: string;
    communicationPreferences?: {
        unsubscribed?: boolean;
        unsubscribedChannels?: string[];
        preferredChannel?: string;
    };
    metadata?: Record<string, unknown>;
};
export type PaymentHistoryData = {
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    averageAmount: number;
    lastPaymentDate?: Instant;
    streakDays: number;
    payments: PaymentRecord[];
};
export type PaymentRecord = {
    id: PaymentId;
    amount: number;
    status: 'succeeded' | 'failed' | 'pending' | 'canceled';
    createdAt: Instant;
    failureReason?: string;
};
export type SubscriptionHistoryData = {
    totalSubscriptions: number;
    activeSubscriptions: number;
    canceledSubscriptions: number;
    averageDuration: number;
    currentStatus?: string;
    subscriptions: SubscriptionRecord[];
};
export type SubscriptionRecord = {
    id: SubscriptionId;
    status: string;
    planTier?: string;
    createdAt: Instant;
    updatedAt: Instant;
    canceledAt?: Instant;
};
export type EngagementMetricsData = {
    score: number;
    lastActivity?: Instant;
    activityFrequency: number;
    featureUsage: Record<string, number>;
};
export type DatabaseQueryResult<T = Record<string, unknown>> = {
    rows: T[];
};
export type CampaignQueryRow = {
    id: string;
    name: string;
    type: DunningCampaignType;
    status: DunningCampaignStatus;
    settings: CampaignSettings;
    trigger: CampaignTrigger;
    target_segments: string[];
    created_by: string;
    created_at: Instant;
    updated_at: Instant;
};
export type CustomerQueryRow = {
    customer_id: string;
    subscription_id?: string;
    payment_id?: string;
    trigger_data: Record<string, unknown>;
};
export type SegmentCondition = {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in';
    value: unknown;
};
export type CampaignEvaluationContext = {
    customerId: CustomerId;
    subscriptionId?: SubscriptionId;
    paymentId?: PaymentId;
    eventData: Record<string, unknown>;
};
export type TrialEndingEventData = {
    customerId: CustomerId;
    subscriptionId: SubscriptionId;
    daysUntilEnd: number;
    trialEndDate: Instant;
};
export type PaymentFailureEventData = {
    customerId: CustomerId;
    paymentId: PaymentId;
    subscriptionId?: SubscriptionId;
    failureReason: string;
    amount: number;
    attemptCount: number;
};
export type TemplateData = {
    id: DunningTemplateId;
    name: string;
    stepNumber: number;
    delayHours: number;
    communication: CommunicationTemplate;
    isActive: boolean;
    abTestVariant?: string;
};
export type RiskFactors = {
    paymentFailureRate: number;
    subscriptionChurnRisk: number;
    engagementRisk: number;
    recencyRisk: number;
    volatilityRisk: number;
    customerLifetimeValueRisk: number;
};
export type RiskWeights = {
    paymentFailureRate: number;
    subscriptionChurnRisk: number;
    engagementRisk: number;
    recencyRisk: number;
    volatilityRisk: number;
    customerLifetimeValueRisk: number;
};
export type CommunicationUpdateData = {
    status?: CommunicationStatus;
    sentAt?: Instant;
    deliveredAt?: Instant;
    openedAt?: Instant;
    clickedAt?: Instant;
    failureReason?: string;
    providerMessageId?: string;
    providerResponse?: Record<string, unknown>;
    trackingData?: Record<string, unknown>;
    updatedAt: Instant;
};
export type ExecutionUpdateData = {
    status?: ExecutionStatus;
    startedAt?: Instant;
    completedAt?: Instant;
    result?: ExecutionResultDb;
    errorMessage?: string;
    retryCount?: number;
    nextRetryAt?: Instant;
    updatedAt: Instant;
};
export type PaymentFailureConditions = {
    paymentFailureCount?: number;
    daysSinceFailure?: number;
    daysSinceLastPayment?: number;
};
export type SubscriptionStatusConditions = {
    subscriptionStatus?: string[];
};
export type TimeBasedConditions = {
    trialEndingDays?: number;
    renewalReminderDays?: number;
};
export type CampaignExecutionFilters = {
    customerIds?: CustomerId[];
    excludeCustomerIds?: CustomerId[];
    testMode?: boolean;
};
export type CampaignWithTrigger = {
    id: DunningCampaignId;
    name: string;
    status: DunningCampaignStatus;
    trigger: {
        type: 'payment_failure' | 'subscription_status' | 'time_based' | 'manual';
        conditions: {
            paymentFailureCount?: number;
            subscriptionStatus?: string[];
            daysSinceLastPayment?: number;
            daysSinceFailure?: number;
            trialEndingDays?: number;
            renewalReminderDays?: number;
        };
        filters?: {
            customerSegments?: string[];
            planTiers?: string[];
            subscriptionAge?: {
                min?: number;
                max?: number;
            };
            totalSpent?: SpendRange;
        };
    };
};
export type PaymentFailureEvent = {
    type: 'payment_failure';
    customerId: CustomerId;
    paymentId: PaymentId;
    subscriptionId?: SubscriptionId;
    failureCount: number;
    amount: number;
    failureReason: string;
    timestamp: Instant;
};
export type TrialEndingEvent = {
    type: 'trial_ending';
    customerId: CustomerId;
    subscriptionId: SubscriptionId;
    daysUntilEnd: number;
    trialEndDate: Instant;
    timestamp: Instant;
};
export type DunningEvent = PaymentFailureEvent | TrialEndingEvent;
export type EngagementMetrics = {
    lastLoginDate?: Instant;
    lastActivity?: Instant;
    sessionCount: number;
    pageViews: number;
    featureUsage: Record<string, number>;
    supportTickets: number;
    loginFrequency: number;
    averageSessionDuration: number;
    score: number;
};
/** What the dunning dashboard shows. Money is a balance per currency: currencies are never added. */
export type DunningDashboardStats = {
    totalCampaigns: number;
    activeCampaigns: number;
    /** Counted since 00:00 UTC. */
    executionsToday: number;
    customersReachedToday: number;
    revenueRecoveredToday: MoneyBag;
    /** Since the first of the month, 00:00 UTC. */
    revenueRecoveredThisMonth: MoneyBag;
    /** Mean conversion rate over the last 30 days. */
    averageConversionRate: number;
    /** Most payments recovered in the last 30 days; null when none recovered any. */
    topPerformingCampaign: {
        id: DunningCampaignId;
        name: string;
        paymentsRecovered: number;
        conversionRate: number;
        revenueRecovered: MoneyBag;
    } | null;
    /** The ten newest, newest first. */
    recentExecutions: DunningExecution[];
};
//# sourceMappingURL=types.d.ts.map