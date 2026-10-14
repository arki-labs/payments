import { z } from '@arki/contracts';
export declare const paymentProviderSchema: z.ZodEnum<{
    paypal: "paypal";
    razorpay: "razorpay";
    revenuecat: "revenuecat";
    square: "square";
    stripe: "stripe";
}>;
export declare const subscriptionStatusSchema: z.ZodEnum<{
    active: "active";
    canceled: "canceled";
    incomplete: "incomplete";
    incomplete_expired: "incomplete_expired";
    past_due: "past_due";
    paused: "paused";
    trialing: "trialing";
    unpaid: "unpaid";
}>;
export declare const paymentStatusSchema: z.ZodEnum<{
    canceled: "canceled";
    failed: "failed";
    pending: "pending";
    processing: "processing";
    requires_action: "requires_action";
    succeeded: "succeeded";
}>;
export declare const billingIntervalSchema: z.ZodEnum<{
    daily: "daily";
    monthly: "monthly";
    weekly: "weekly";
    yearly: "yearly";
}>;
export declare const planTierSchema: z.ZodEnum<{
    basic: "basic";
    enterprise: "enterprise";
    premium: "premium";
    pro: "pro";
}>;
export declare const paymentMethodTypeSchema: z.ZodEnum<{
    apple_pay: "apple_pay";
    bank_account: "bank_account";
    card: "card";
    google_pay: "google_pay";
    paypal: "paypal";
}>;
export declare const webhookEventTypeSchema: z.ZodEnum<{
    "customer.created": "customer.created";
    "customer.deleted": "customer.deleted";
    "customer.updated": "customer.updated";
    "invoice.created": "invoice.created";
    "invoice.finalized": "invoice.finalized";
    "invoice.paid": "invoice.paid";
    "invoice.payment_failed": "invoice.payment_failed";
    "payment.dispute_created": "payment.dispute_created";
    "payment.failed": "payment.failed";
    "payment.refunded": "payment.refunded";
    "payment.requires_action": "payment.requires_action";
    "payment.succeeded": "payment.succeeded";
    "refund.updated": "refund.updated";
    "subscription.canceled": "subscription.canceled";
    "subscription.created": "subscription.created";
    "subscription.trial_will_end": "subscription.trial_will_end";
    "subscription.updated": "subscription.updated";
}>;
export declare const createPlanInputSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    tier: z.ZodEnum<{
        basic: "basic";
        enterprise: "enterprise";
        premium: "premium";
        pro: "pro";
    }>;
    price: z.ZodPipe<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
        amount: string;
        currency: string;
    }>>;
    interval: z.ZodEnum<{
        daily: "daily";
        monthly: "monthly";
        weekly: "weekly";
        yearly: "yearly";
    }>;
    intervalCount: z.ZodDefault<z.ZodNumber>;
    features: z.ZodDefault<z.ZodArray<z.ZodString>>;
    trialPeriodDays: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const updatePlanInputSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    price: z.ZodOptional<z.ZodPipe<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
        amount: string;
        currency: string;
    }>>>;
    interval: z.ZodOptional<z.ZodEnum<{
        daily: "daily";
        monthly: "monthly";
        weekly: "weekly";
        yearly: "yearly";
    }>>;
    intervalCount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    features: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString>>>;
    trialPeriodDays: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    metadata: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
export declare const createCustomerInputSchema: z.ZodObject<{
    userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    email: z.ZodEmail;
    name: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const updateCustomerInputSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodEmail>;
    name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    defaultPaymentMethodId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createSubscriptionInputSchema: z.ZodObject<{
    userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
    paymentMethodId: z.ZodOptional<z.ZodString>;
    trialPeriodDays: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    customerDetails: z.ZodOptional<z.ZodObject<{
        address: z.ZodOptional<z.ZodObject<{
            line1: z.ZodOptional<z.ZodString>;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        taxIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            value: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const updateSubscriptionInputSchema: z.ZodObject<{
    planId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>>>;
    paymentMethodId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const cancelSubscriptionInputSchema: z.ZodObject<{
    immediately: z.ZodDefault<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
    provideFeedback: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const createPaymentInputSchema: z.ZodObject<{
    subscriptionId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>;
    userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    amount: z.ZodPipe<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
        amount: string;
        currency: string;
    }>>;
    paymentMethodId: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const refundPaymentInputSchema: z.ZodObject<{
    amount: z.ZodOptional<z.ZodPipe<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
        amount: string;
        currency: string;
    }>>>;
    reason: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const createPaymentIntentInputSchema: z.ZodObject<{
    amount: z.ZodPipe<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
        amount: string;
        currency: string;
    }>>;
    paymentMethodId: z.ZodOptional<z.ZodString>;
    automatic: z.ZodDefault<z.ZodBoolean>;
    description: z.ZodOptional<z.ZodString>;
    taxCode: z.ZodOptional<z.ZodString>;
    customerDetails: z.ZodOptional<z.ZodObject<{
        address: z.ZodOptional<z.ZodObject<{
            line1: z.ZodOptional<z.ZodString>;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        taxIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            value: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const webhookInputSchema: z.ZodObject<{
    provider: z.ZodEnum<{
        paypal: "paypal";
        razorpay: "razorpay";
        revenuecat: "revenuecat";
        square: "square";
        stripe: "stripe";
    }>;
    signature: z.ZodString;
    timestamp: z.ZodString;
    payload: z.ZodString;
}, z.core.$strip>;
export declare const paginationSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const subscriptionQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        canceled: "canceled";
        incomplete: "incomplete";
        incomplete_expired: "incomplete_expired";
        past_due: "past_due";
        paused: "paused";
        trialing: "trialing";
        unpaid: "unpaid";
    }>>;
    planId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>>>;
    userId: z.ZodOptional<z.ZodCustom<`usr_${string}`, `usr_${string}`>>;
}, z.core.$strip>;
export declare const paymentQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<{
        canceled: "canceled";
        failed: "failed";
        pending: "pending";
        processing: "processing";
        requires_action: "requires_action";
        succeeded: "succeeded";
    }>>;
    subscriptionId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>>>;
    customerId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>>>;
    userId: z.ZodOptional<z.ZodCustom<`usr_${string}`, `usr_${string}`>>;
    startDate: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    endDate: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
}, z.core.$strip>;
export declare const planQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    tier: z.ZodOptional<z.ZodEnum<{
        basic: "basic";
        enterprise: "enterprise";
        premium: "premium";
        pro: "pro";
    }>>;
    interval: z.ZodOptional<z.ZodEnum<{
        daily: "daily";
        monthly: "monthly";
        weekly: "weekly";
        yearly: "yearly";
    }>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const customerQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    provider: z.ZodOptional<z.ZodEnum<{
        paypal: "paypal";
        razorpay: "razorpay";
        revenuecat: "revenuecat";
        square: "square";
        stripe: "stripe";
    }>>;
    email: z.ZodOptional<z.ZodEmail>;
}, z.core.$strip>;
export declare const webhookEventQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    provider: z.ZodOptional<z.ZodEnum<{
        paypal: "paypal";
        razorpay: "razorpay";
        revenuecat: "revenuecat";
        square: "square";
        stripe: "stripe";
    }>>;
    eventType: z.ZodOptional<z.ZodEnum<{
        "customer.created": "customer.created";
        "customer.deleted": "customer.deleted";
        "customer.updated": "customer.updated";
        "invoice.created": "invoice.created";
        "invoice.finalized": "invoice.finalized";
        "invoice.paid": "invoice.paid";
        "invoice.payment_failed": "invoice.payment_failed";
        "payment.dispute_created": "payment.dispute_created";
        "payment.failed": "payment.failed";
        "payment.refunded": "payment.refunded";
        "payment.requires_action": "payment.requires_action";
        "payment.succeeded": "payment.succeeded";
        "refund.updated": "refund.updated";
        "subscription.canceled": "subscription.canceled";
        "subscription.created": "subscription.created";
        "subscription.trial_will_end": "subscription.trial_will_end";
        "subscription.updated": "subscription.updated";
    }>>;
    processed: z.ZodOptional<z.ZodBoolean>;
    startDate: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    endDate: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
}, z.core.$strip>;
export declare const analyticsQuerySchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    endDate: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    groupBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        day: "day";
        month: "month";
        week: "week";
        year: "year";
    }>>>;
    metrics: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<{
        arr: "arr";
        churn: "churn";
        mrr: "mrr";
        revenue: "revenue";
        subscriptions: "subscriptions";
    }>>>>;
}, z.core.$strip>;
export declare const subscriptionAnalyticsSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    endDate: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    groupBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        day: "day";
        month: "month";
        week: "week";
        year: "year";
    }>>>;
    metrics: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<{
        arr: "arr";
        churn: "churn";
        mrr: "mrr";
        revenue: "revenue";
        subscriptions: "subscriptions";
    }>>>>;
    tier: z.ZodOptional<z.ZodEnum<{
        basic: "basic";
        enterprise: "enterprise";
        premium: "premium";
        pro: "pro";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        canceled: "canceled";
        incomplete: "incomplete";
        incomplete_expired: "incomplete_expired";
        past_due: "past_due";
        paused: "paused";
        trialing: "trialing";
        unpaid: "unpaid";
    }>>;
}, z.core.$strip>;
export declare const paymentAnalyticsSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    endDate: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    groupBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        day: "day";
        month: "month";
        week: "week";
        year: "year";
    }>>>;
    metrics: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<{
        arr: "arr";
        churn: "churn";
        mrr: "mrr";
        revenue: "revenue";
        subscriptions: "subscriptions";
    }>>>>;
    status: z.ZodOptional<z.ZodEnum<{
        canceled: "canceled";
        failed: "failed";
        pending: "pending";
        processing: "processing";
        requires_action: "requires_action";
        succeeded: "succeeded";
    }>>;
    paymentMethod: z.ZodOptional<z.ZodEnum<{
        apple_pay: "apple_pay";
        bank_account: "bank_account";
        card: "card";
        google_pay: "google_pay";
        paypal: "paypal";
    }>>;
}, z.core.$strip>;
export declare const subscriptionPreviewSchema: z.ZodObject<{
    planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
    proration: z.ZodObject<{
        immediateTotal: z.ZodObject<{
            amount: z.ZodString;
            currency: z.ZodString;
        }, z.core.$strip>;
        nextInvoiceTotal: z.ZodObject<{
            amount: z.ZodString;
            currency: z.ZodString;
        }, z.core.$strip>;
        creditApplied: z.ZodObject<{
            amount: z.ZodString;
            currency: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
    trialEnd: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    nextBillingDate: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
}, z.core.$strip>;
export declare const subscriptionAnalyticsResponseSchema: z.ZodObject<{
    totalSubscriptions: z.ZodNumber;
    activeSubscriptions: z.ZodNumber;
    churnRate: z.ZodNumber;
    averageRevenuePerUser: z.ZodNumber;
    monthlyRecurringRevenue: z.ZodNumber;
    annualRecurringRevenue: z.ZodNumber;
    subscriptionsByTier: z.ZodRecord<z.ZodString, z.ZodNumber>;
    subscriptionsByStatus: z.ZodRecord<z.ZodEnum<{
        active: "active";
        canceled: "canceled";
        incomplete: "incomplete";
        incomplete_expired: "incomplete_expired";
        past_due: "past_due";
        paused: "paused";
        trialing: "trialing";
        unpaid: "unpaid";
    }>, z.ZodNumber>;
}, z.core.$strip>;
export declare const paymentMethodInfoSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<{
        apple_pay: "apple_pay";
        bank_account: "bank_account";
        card: "card";
        google_pay: "google_pay";
        paypal: "paypal";
    }>;
    brand: z.ZodOptional<z.ZodString>;
    last4: z.ZodOptional<z.ZodString>;
    expiryMonth: z.ZodOptional<z.ZodNumber>;
    expiryYear: z.ZodOptional<z.ZodNumber>;
    isDefault: z.ZodBoolean;
}, z.core.$strip>;
export declare const setupIntentResponseSchema: z.ZodObject<{
    clientSecret: z.ZodString;
    setupIntentId: z.ZodString;
}, z.core.$strip>;
export declare const paymentIntentResponseSchema: z.ZodObject<{
    clientSecret: z.ZodString;
    paymentIntentId: z.ZodString;
}, z.core.$strip>;
export declare const webhookProcessingResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    webhookId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`wh_${string}`, string>>>;
    error: z.ZodOptional<z.ZodString>;
    retryable: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const healthCheckSchema: z.ZodObject<{
    status: z.ZodEnum<{
        degraded: "degraded";
        healthy: "healthy";
        unhealthy: "unhealthy";
    }>;
    details: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const subscriptionAccessSchema: z.ZodObject<{
    requiredTiers: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<{
        basic: "basic";
        enterprise: "enterprise";
        premium: "premium";
        pro: "pro";
    }>>>>;
}, z.core.$strip>;
export declare const getPlanInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
}, z.core.$strip>;
export declare const updatePlanWrapperInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
    data: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        price: z.ZodOptional<z.ZodPipe<z.ZodObject<{
            amount: z.ZodString;
            currency: z.ZodString;
        }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
            amount: string;
            currency: string;
        }>>>;
        interval: z.ZodOptional<z.ZodEnum<{
            daily: "daily";
            monthly: "monthly";
            weekly: "weekly";
            yearly: "yearly";
        }>>;
        intervalCount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        features: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString>>>;
        trialPeriodDays: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        metadata: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const deactivatePlanInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
}, z.core.$strip>;
export declare const subscriptionPreviewTaxInputSchema: z.ZodObject<{
    planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
    customerDetails: z.ZodObject<{
        address: z.ZodOptional<z.ZodObject<{
            line1: z.ZodOptional<z.ZodString>;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        taxIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            value: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateSubscriptionWrapperInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `sub_${string}`, "out">, z.ZodTransform<`sub_${string}`, string & z.$brand<`sub_${string}`>>>;
    data: z.ZodObject<{
        planId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>>>;
        paymentMethodId: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const cancelSubscriptionWrapperInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `sub_${string}`, "out">, z.ZodTransform<`sub_${string}`, string & z.$brand<`sub_${string}`>>>;
    options: z.ZodOptional<z.ZodObject<{
        immediately: z.ZodDefault<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
        provideFeedback: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const paymentPreviewInputSchema: z.ZodObject<{
    subscriptionId: z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `sub_${string}`, "out">, z.ZodTransform<`sub_${string}`, string & z.$brand<`sub_${string}`>>>;
    planId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
}, z.core.$strip>;
export declare const paymentPreviewTaxInputSchema: z.ZodObject<{
    amount: z.ZodPipe<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
        amount: string;
        currency: string;
    }>>;
    description: z.ZodOptional<z.ZodString>;
    taxCode: z.ZodOptional<z.ZodString>;
    customerDetails: z.ZodOptional<z.ZodObject<{
        address: z.ZodOptional<z.ZodObject<{
            line1: z.ZodOptional<z.ZodString>;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        taxIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            value: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const requestRefundInputSchema: z.ZodObject<{
    paymentId: z.ZodPipe<z.ZodString, z.ZodTransform<`pay_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `pay_${string}`, "out">, z.ZodTransform<`pay_${string}`, string & z.$brand<`pay_${string}`>>>;
    amount: z.ZodPipe<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
        amount: string;
        currency: string;
    }>>;
    reason: z.ZodEnum<{
        billing_error: "billing_error";
        chargeback_prevention: "chargeback_prevention";
        customer_request: "customer_request";
        duplicate_charge: "duplicate_charge";
        fraudulent_transaction: "fraudulent_transaction";
        goodwill_gesture: "goodwill_gesture";
        other: "other";
        service_not_delivered: "service_not_delivered";
        technical_issue: "technical_issue";
    }>;
    customerNote: z.ZodOptional<z.ZodString>;
    internalNotes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const listRefundsInputSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<{
        approved: "approved";
        canceled: "canceled";
        completed: "completed";
        failed: "failed";
        pending: "pending";
        processing: "processing";
        rejected: "rejected";
    }>>;
}, z.core.$strip>;
export declare const getRefundInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`rfnd_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `rfnd_${string}`, "out">, z.ZodTransform<`rfnd_${string}`, string & z.$brand<`rfnd_${string}`>>>;
}, z.core.$strip>;
export declare const approveRefundInputSchema: z.ZodObject<{
    refundId: z.ZodPipe<z.ZodString, z.ZodTransform<`rfnd_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `rfnd_${string}`, "out">, z.ZodTransform<`rfnd_${string}`, string & z.$brand<`rfnd_${string}`>>>;
    approvedBy: z.ZodOptional<z.ZodCustom<`usr_${string}`, `usr_${string}`>>;
}, z.core.$strip>;
export declare const rejectRefundInputSchema: z.ZodObject<{
    refundId: z.ZodPipe<z.ZodString, z.ZodTransform<`rfnd_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `rfnd_${string}`, "out">, z.ZodTransform<`rfnd_${string}`, string & z.$brand<`rfnd_${string}`>>>;
    rejectedBy: z.ZodOptional<z.ZodCustom<`usr_${string}`, `usr_${string}`>>;
    reason: z.ZodString;
}, z.core.$strip>;
export declare const getAnalyticsMetricsInputSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    endDate: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
}, z.core.$strip>;
export declare const prorationPreviewInputSchema: z.ZodObject<{
    subscriptionId: z.ZodPipe<z.ZodString, z.ZodTransform<`sub_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `sub_${string}`, "out">, z.ZodTransform<`sub_${string}`, string & z.$brand<`sub_${string}`>>>;
    newPlanId: z.ZodPipe<z.ZodString, z.ZodTransform<`plan_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `plan_${string}`, "out">, z.ZodTransform<`plan_${string}`, string & z.$brand<`plan_${string}`>>>;
    changeDate: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    prorationMode: z.ZodDefault<z.ZodEnum<{
        immediate: "immediate";
        next_cycle: "next_cycle";
    }>>;
}, z.core.$strip>;
export type CreatePlanInput = z.infer<typeof createPlanInputSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanInputSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerInputSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerInputSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionInputSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionInputSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionInputSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentInputSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentInputSchema>;
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentInputSchema>;
export type WebhookInput = z.infer<typeof webhookInputSchema>;
export type SubscriptionQuery = z.infer<typeof subscriptionQuerySchema>;
export type PaymentQuery = z.infer<typeof paymentQuerySchema>;
export type PlanQuery = z.infer<typeof planQuerySchema>;
export type CustomerQuery = z.infer<typeof customerQuerySchema>;
export type WebhookEventQuery = z.infer<typeof webhookEventQuerySchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type SubscriptionAnalytics = z.infer<typeof subscriptionAnalyticsSchema>;
export type PaymentAnalytics = z.infer<typeof paymentAnalyticsSchema>;
export type SubscriptionPreview = z.infer<typeof subscriptionPreviewSchema>;
export type SubscriptionAnalyticsResponse = z.infer<typeof subscriptionAnalyticsResponseSchema>;
export type PaymentMethodInfo = z.infer<typeof paymentMethodInfoSchema>;
export type SetupIntentResponse = z.infer<typeof setupIntentResponseSchema>;
export type PaymentIntentResponse = z.infer<typeof paymentIntentResponseSchema>;
export type WebhookProcessingResult = z.infer<typeof webhookProcessingResultSchema>;
export type HealthCheck = z.infer<typeof healthCheckSchema>;
export type SubscriptionAccess = z.infer<typeof subscriptionAccessSchema>;
//# sourceMappingURL=contracts.d.ts.map