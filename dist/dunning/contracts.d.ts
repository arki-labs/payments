import { z } from '@arki/contracts';
import type { SpendRange } from './types.js';
export declare const dunningCampaignTypeSchema: z.ZodEnum<{
    payment_failed: "payment_failed";
    renewal_reminder: "renewal_reminder";
    subscription_past_due: "subscription_past_due";
    trial_ending: "trial_ending";
}>;
export declare const dunningCampaignStatusSchema: z.ZodEnum<{
    active: "active";
    archived: "archived";
    draft: "draft";
    paused: "paused";
}>;
export declare const communicationChannelSchema: z.ZodEnum<{
    email: "email";
    in_app: "in_app";
    sms: "sms";
    webhook: "webhook";
}>;
export declare const communicationStatusSchema: z.ZodEnum<{
    bounced: "bounced";
    clicked: "clicked";
    delivered: "delivered";
    failed: "failed";
    opened: "opened";
    pending: "pending";
    sent: "sent";
}>;
export declare const executionStatusSchema: z.ZodEnum<{
    cancelled: "cancelled";
    completed: "completed";
    failed: "failed";
    running: "running";
    scheduled: "scheduled";
}>;
export declare const customerSegmentTypeSchema: z.ZodEnum<{
    behavior_based: "behavior_based";
    custom: "custom";
    demographic: "demographic";
    risk_based: "risk_based";
    value_based: "value_based";
}>;
export declare const riskCategorySchema: z.ZodEnum<{
    critical: "critical";
    high: "high";
    low: "low";
    medium: "medium";
}>;
export declare const campaignTriggerSchema: z.ZodObject<{
    type: z.ZodEnum<{
        manual: "manual";
        payment_failure: "payment_failure";
        subscription_status: "subscription_status";
        time_based: "time_based";
    }>;
    conditions: z.ZodObject<{
        paymentFailureCount: z.ZodOptional<z.ZodNumber>;
        subscriptionStatus: z.ZodOptional<z.ZodArray<z.ZodString>>;
        daysSinceLastPayment: z.ZodOptional<z.ZodNumber>;
        daysSinceFailure: z.ZodOptional<z.ZodNumber>;
        trialEndingDays: z.ZodOptional<z.ZodNumber>;
        renewalReminderDays: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    filters: z.ZodOptional<z.ZodObject<{
        customerSegments: z.ZodOptional<z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`cs_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cs_${string}`, "out">, z.ZodTransform<`cs_${string}`, string & z.$brand<`cs_${string}`>>>>>;
        planTiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
        subscriptionAge: z.ZodOptional<z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        totalSpent: z.ZodOptional<z.ZodPipe<z.ZodObject<{
            min: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                amount: string;
                currency: string;
            }>>>;
            max: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                amount: string;
                currency: string;
            }>>>;
        }, z.core.$strip>, z.ZodTransform<SpendRange, {
            min?: import("@arki/money").Money<string> | undefined;
            max?: import("@arki/money").Money<string> | undefined;
        }>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const campaignSettingsSchema: z.ZodObject<{
    enabled: z.ZodBoolean;
    priority: z.ZodNumber;
    cooldownPeriod: z.ZodNumber;
    maxExecutionsPerCustomer: z.ZodNumber;
    stopOnPaymentSuccess: z.ZodBoolean;
    respectUnsubscribe: z.ZodBoolean;
    businessHoursOnly: z.ZodBoolean;
    timezone: z.ZodOptional<z.ZodString>;
    allowedDays: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    abTestVariant: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const communicationTemplateSchema: z.ZodObject<{
    channel: z.ZodEnum<{
        email: "email";
        in_app: "in_app";
        sms: "sms";
        webhook: "webhook";
    }>;
    subject: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
    variables: z.ZodArray<z.ZodString>;
    design: z.ZodOptional<z.ZodObject<{
        theme: z.ZodOptional<z.ZodString>;
        brandColors: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        logoUrl: z.ZodOptional<z.ZodURL>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const segmentCriteriaSchema: z.ZodObject<{
    totalSpent: z.ZodOptional<z.ZodPipe<z.ZodObject<{
        min: z.ZodOptional<z.ZodPipe<z.ZodObject<{
            amount: z.ZodString;
            currency: z.ZodString;
        }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
            amount: string;
            currency: string;
        }>>>;
        max: z.ZodOptional<z.ZodPipe<z.ZodObject<{
            amount: z.ZodString;
            currency: z.ZodString;
        }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
            amount: string;
            currency: string;
        }>>>;
    }, z.core.$strip>, z.ZodTransform<SpendRange, {
        min?: import("@arki/money").Money<string> | undefined;
        max?: import("@arki/money").Money<string> | undefined;
    }>>>;
    subscriptionDuration: z.ZodOptional<z.ZodObject<{
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    paymentFailureHistory: z.ZodOptional<z.ZodObject<{
        count: z.ZodNumber;
        timeframe: z.ZodNumber;
    }, z.core.$strip>>;
    planTier: z.ZodOptional<z.ZodArray<z.ZodString>>;
    lastPaymentDate: z.ZodOptional<z.ZodObject<{
        daysAgo: z.ZodNumber;
    }, z.core.$strip>>;
    lifetimeValue: z.ZodOptional<z.ZodObject<{
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    churnRisk: z.ZodOptional<z.ZodEnum<{
        high: "high";
        low: "low";
        medium: "medium";
    }>>;
    engagementScore: z.ZodOptional<z.ZodObject<{
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    customAttributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const riskScoreSchema: z.ZodObject<{
    overall: z.ZodNumber;
    factors: z.ZodRecord<z.ZodString, z.ZodNumber>;
    category: z.ZodEnum<{
        critical: "critical";
        high: "high";
        low: "low";
        medium: "medium";
    }>;
    lastCalculated: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    trends: z.ZodObject<{
        direction: z.ZodEnum<{
            declining: "declining";
            improving: "improving";
            stable: "stable";
        }>;
        changePercent: z.ZodNumber;
        timeframe: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
/** One step of a campaign, as create and update accept it. */
export declare const dunningCampaignTemplateInputSchema: z.ZodObject<{
    name: z.ZodString;
    stepNumber: z.ZodNumber;
    delayHours: z.ZodNumber;
    communication: z.ZodObject<{
        channel: z.ZodEnum<{
            email: "email";
            in_app: "in_app";
            sms: "sms";
            webhook: "webhook";
        }>;
        subject: z.ZodOptional<z.ZodString>;
        content: z.ZodString;
        variables: z.ZodArray<z.ZodString>;
        design: z.ZodOptional<z.ZodObject<{
            theme: z.ZodOptional<z.ZodString>;
            brandColors: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            logoUrl: z.ZodOptional<z.ZodURL>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
/** The full set of steps of a campaign. Step numbers are unique: update matches steps by number. */
export declare const dunningCampaignTemplatesSchema: z.ZodArray<z.ZodObject<{
    name: z.ZodString;
    stepNumber: z.ZodNumber;
    delayHours: z.ZodNumber;
    communication: z.ZodObject<{
        channel: z.ZodEnum<{
            email: "email";
            in_app: "in_app";
            sms: "sms";
            webhook: "webhook";
        }>;
        subject: z.ZodOptional<z.ZodString>;
        content: z.ZodString;
        variables: z.ZodArray<z.ZodString>;
        design: z.ZodOptional<z.ZodObject<{
            theme: z.ZodOptional<z.ZodString>;
            brandColors: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            logoUrl: z.ZodOptional<z.ZodURL>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>>;
export declare const createDunningCampaignInputSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        payment_failed: "payment_failed";
        renewal_reminder: "renewal_reminder";
        subscription_past_due: "subscription_past_due";
        trial_ending: "trial_ending";
    }>;
    trigger: z.ZodObject<{
        type: z.ZodEnum<{
            manual: "manual";
            payment_failure: "payment_failure";
            subscription_status: "subscription_status";
            time_based: "time_based";
        }>;
        conditions: z.ZodObject<{
            paymentFailureCount: z.ZodOptional<z.ZodNumber>;
            subscriptionStatus: z.ZodOptional<z.ZodArray<z.ZodString>>;
            daysSinceLastPayment: z.ZodOptional<z.ZodNumber>;
            daysSinceFailure: z.ZodOptional<z.ZodNumber>;
            trialEndingDays: z.ZodOptional<z.ZodNumber>;
            renewalReminderDays: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        filters: z.ZodOptional<z.ZodObject<{
            customerSegments: z.ZodOptional<z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`cs_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cs_${string}`, "out">, z.ZodTransform<`cs_${string}`, string & z.$brand<`cs_${string}`>>>>>;
            planTiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
            subscriptionAge: z.ZodOptional<z.ZodObject<{
                min: z.ZodOptional<z.ZodNumber>;
                max: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            totalSpent: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                min: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                    amount: z.ZodString;
                    currency: z.ZodString;
                }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                    amount: string;
                    currency: string;
                }>>>;
                max: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                    amount: z.ZodString;
                    currency: z.ZodString;
                }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                    amount: string;
                    currency: string;
                }>>>;
            }, z.core.$strip>, z.ZodTransform<SpendRange, {
                min?: import("@arki/money").Money<string> | undefined;
                max?: import("@arki/money").Money<string> | undefined;
            }>>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    settings: z.ZodObject<{
        enabled: z.ZodBoolean;
        priority: z.ZodNumber;
        cooldownPeriod: z.ZodNumber;
        maxExecutionsPerCustomer: z.ZodNumber;
        stopOnPaymentSuccess: z.ZodBoolean;
        respectUnsubscribe: z.ZodBoolean;
        businessHoursOnly: z.ZodBoolean;
        timezone: z.ZodOptional<z.ZodString>;
        allowedDays: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
        abTestVariant: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    targetSegments: z.ZodDefault<z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`cs_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cs_${string}`, "out">, z.ZodTransform<`cs_${string}`, string & z.$brand<`cs_${string}`>>>>>;
    templates: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        stepNumber: z.ZodNumber;
        delayHours: z.ZodNumber;
        communication: z.ZodObject<{
            channel: z.ZodEnum<{
                email: "email";
                in_app: "in_app";
                sms: "sms";
                webhook: "webhook";
            }>;
            subject: z.ZodOptional<z.ZodString>;
            content: z.ZodString;
            variables: z.ZodArray<z.ZodString>;
            design: z.ZodOptional<z.ZodObject<{
                theme: z.ZodOptional<z.ZodString>;
                brandColors: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                logoUrl: z.ZodOptional<z.ZodURL>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const updateDunningCampaignInputSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        payment_failed: "payment_failed";
        renewal_reminder: "renewal_reminder";
        subscription_past_due: "subscription_past_due";
        trial_ending: "trial_ending";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        archived: "archived";
        draft: "draft";
        paused: "paused";
    }>>;
    trigger: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<{
            manual: "manual";
            payment_failure: "payment_failure";
            subscription_status: "subscription_status";
            time_based: "time_based";
        }>;
        conditions: z.ZodObject<{
            paymentFailureCount: z.ZodOptional<z.ZodNumber>;
            subscriptionStatus: z.ZodOptional<z.ZodArray<z.ZodString>>;
            daysSinceLastPayment: z.ZodOptional<z.ZodNumber>;
            daysSinceFailure: z.ZodOptional<z.ZodNumber>;
            trialEndingDays: z.ZodOptional<z.ZodNumber>;
            renewalReminderDays: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        filters: z.ZodOptional<z.ZodObject<{
            customerSegments: z.ZodOptional<z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`cs_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cs_${string}`, "out">, z.ZodTransform<`cs_${string}`, string & z.$brand<`cs_${string}`>>>>>;
            planTiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
            subscriptionAge: z.ZodOptional<z.ZodObject<{
                min: z.ZodOptional<z.ZodNumber>;
                max: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            totalSpent: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                min: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                    amount: z.ZodString;
                    currency: z.ZodString;
                }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                    amount: string;
                    currency: string;
                }>>>;
                max: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                    amount: z.ZodString;
                    currency: z.ZodString;
                }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                    amount: string;
                    currency: string;
                }>>>;
            }, z.core.$strip>, z.ZodTransform<SpendRange, {
                min?: import("@arki/money").Money<string> | undefined;
                max?: import("@arki/money").Money<string> | undefined;
            }>>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    settings: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodBoolean;
        priority: z.ZodNumber;
        cooldownPeriod: z.ZodNumber;
        maxExecutionsPerCustomer: z.ZodNumber;
        stopOnPaymentSuccess: z.ZodBoolean;
        respectUnsubscribe: z.ZodBoolean;
        businessHoursOnly: z.ZodBoolean;
        timezone: z.ZodOptional<z.ZodString>;
        allowedDays: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
        abTestVariant: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    targetSegments: z.ZodOptional<z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`cs_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cs_${string}`, "out">, z.ZodTransform<`cs_${string}`, string & z.$brand<`cs_${string}`>>>>>;
    templates: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        stepNumber: z.ZodNumber;
        delayHours: z.ZodNumber;
        communication: z.ZodObject<{
            channel: z.ZodEnum<{
                email: "email";
                in_app: "in_app";
                sms: "sms";
                webhook: "webhook";
            }>;
            subject: z.ZodOptional<z.ZodString>;
            content: z.ZodString;
            variables: z.ZodArray<z.ZodString>;
            design: z.ZodOptional<z.ZodObject<{
                theme: z.ZodOptional<z.ZodString>;
                brandColors: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                logoUrl: z.ZodOptional<z.ZodURL>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const createDunningTemplateInputSchema: z.ZodObject<{
    campaignId: z.ZodPipe<z.ZodString, z.ZodTransform<`dc_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `dc_${string}`, "out">, z.ZodTransform<`dc_${string}`, string & z.$brand<`dc_${string}`>>>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    stepNumber: z.ZodNumber;
    delayHours: z.ZodNumber;
    communication: z.ZodObject<{
        channel: z.ZodEnum<{
            email: "email";
            in_app: "in_app";
            sms: "sms";
            webhook: "webhook";
        }>;
        subject: z.ZodOptional<z.ZodString>;
        content: z.ZodString;
        variables: z.ZodArray<z.ZodString>;
        design: z.ZodOptional<z.ZodObject<{
            theme: z.ZodOptional<z.ZodString>;
            brandColors: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            logoUrl: z.ZodOptional<z.ZodURL>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    abTestVariant: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateDunningTemplateInputSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    stepNumber: z.ZodOptional<z.ZodNumber>;
    delayHours: z.ZodOptional<z.ZodNumber>;
    communication: z.ZodOptional<z.ZodObject<{
        channel: z.ZodEnum<{
            email: "email";
            in_app: "in_app";
            sms: "sms";
            webhook: "webhook";
        }>;
        subject: z.ZodOptional<z.ZodString>;
        content: z.ZodString;
        variables: z.ZodArray<z.ZodString>;
        design: z.ZodOptional<z.ZodObject<{
            theme: z.ZodOptional<z.ZodString>;
            brandColors: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            logoUrl: z.ZodOptional<z.ZodURL>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    abTestVariant: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createCustomerSegmentInputSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        behavior_based: "behavior_based";
        custom: "custom";
        demographic: "demographic";
        risk_based: "risk_based";
        value_based: "value_based";
    }>;
    criteria: z.ZodObject<{
        totalSpent: z.ZodOptional<z.ZodPipe<z.ZodObject<{
            min: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                amount: string;
                currency: string;
            }>>>;
            max: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                amount: string;
                currency: string;
            }>>>;
        }, z.core.$strip>, z.ZodTransform<SpendRange, {
            min?: import("@arki/money").Money<string> | undefined;
            max?: import("@arki/money").Money<string> | undefined;
        }>>>;
        subscriptionDuration: z.ZodOptional<z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        paymentFailureHistory: z.ZodOptional<z.ZodObject<{
            count: z.ZodNumber;
            timeframe: z.ZodNumber;
        }, z.core.$strip>>;
        planTier: z.ZodOptional<z.ZodArray<z.ZodString>>;
        lastPaymentDate: z.ZodOptional<z.ZodObject<{
            daysAgo: z.ZodNumber;
        }, z.core.$strip>>;
        lifetimeValue: z.ZodOptional<z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        churnRisk: z.ZodOptional<z.ZodEnum<{
            high: "high";
            low: "low";
            medium: "medium";
        }>>;
        engagementScore: z.ZodOptional<z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        customAttributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>;
    autoUpdate: z.ZodDefault<z.ZodBoolean>;
    updateFrequency: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateCustomerSegmentInputSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        behavior_based: "behavior_based";
        custom: "custom";
        demographic: "demographic";
        risk_based: "risk_based";
        value_based: "value_based";
    }>>;
    criteria: z.ZodOptional<z.ZodObject<{
        totalSpent: z.ZodOptional<z.ZodPipe<z.ZodObject<{
            min: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                amount: string;
                currency: string;
            }>>>;
            max: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                amount: string;
                currency: string;
            }>>>;
        }, z.core.$strip>, z.ZodTransform<SpendRange, {
            min?: import("@arki/money").Money<string> | undefined;
            max?: import("@arki/money").Money<string> | undefined;
        }>>>;
        subscriptionDuration: z.ZodOptional<z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        paymentFailureHistory: z.ZodOptional<z.ZodObject<{
            count: z.ZodNumber;
            timeframe: z.ZodNumber;
        }, z.core.$strip>>;
        planTier: z.ZodOptional<z.ZodArray<z.ZodString>>;
        lastPaymentDate: z.ZodOptional<z.ZodObject<{
            daysAgo: z.ZodNumber;
        }, z.core.$strip>>;
        lifetimeValue: z.ZodOptional<z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        churnRisk: z.ZodOptional<z.ZodEnum<{
            high: "high";
            low: "low";
            medium: "medium";
        }>>;
        engagementScore: z.ZodOptional<z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        customAttributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    autoUpdate: z.ZodOptional<z.ZodBoolean>;
    updateFrequency: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const executeCampaignInputSchema: z.ZodObject<{
    campaignId: z.ZodPipe<z.ZodString, z.ZodTransform<`dc_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `dc_${string}`, "out">, z.ZodTransform<`dc_${string}`, string & z.$brand<`dc_${string}`>>>;
    dryRun: z.ZodDefault<z.ZodBoolean>;
    customFilters: z.ZodOptional<z.ZodObject<{
        customerIds: z.ZodOptional<z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>>>;
        excludeCustomerIds: z.ZodOptional<z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>>>;
        testMode: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const campaignAnalyticsInputSchema: z.ZodObject<{
    campaignId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`dc_${string}`, string>>>;
    period: z.ZodObject<{
        start: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        end: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    }, z.core.$strip>;
    granularity: z.ZodDefault<z.ZodEnum<{
        day: "day";
        hour: "hour";
        month: "month";
        week: "week";
    }>>;
    metrics: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const updateExecutionStatusInputSchema: z.ZodObject<{
    executionId: z.ZodPipe<z.ZodString, z.ZodTransform<`de_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `de_${string}`, "out">, z.ZodTransform<`de_${string}`, string & z.$brand<`de_${string}`>>>;
    status: z.ZodEnum<{
        cancelled: "cancelled";
        completed: "completed";
        failed: "failed";
        running: "running";
        scheduled: "scheduled";
    }>;
    errorMessage: z.ZodOptional<z.ZodString>;
    result: z.ZodOptional<z.ZodObject<{
        customersProcessed: z.ZodNumber;
        communicationsSent: z.ZodNumber;
        errors: z.ZodArray<z.ZodObject<{
            customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
            error: z.ZodString;
            timestamp: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        }, z.core.$strip>>;
        performance: z.ZodObject<{
            processingTime: z.ZodNumber;
            successRate: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const updateCommunicationStatusInputSchema: z.ZodObject<{
    communicationId: z.ZodPipe<z.ZodString, z.ZodTransform<`dcm_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `dcm_${string}`, "out">, z.ZodTransform<`dcm_${string}`, string & z.$brand<`dcm_${string}`>>>;
    status: z.ZodEnum<{
        bounced: "bounced";
        clicked: "clicked";
        delivered: "delivered";
        failed: "failed";
        opened: "opened";
        pending: "pending";
        sent: "sent";
    }>;
    sentAt: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    deliveredAt: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    openedAt: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    clickedAt: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    failureReason: z.ZodOptional<z.ZodString>;
    providerMessageId: z.ZodOptional<z.ZodString>;
    providerResponse: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    trackingData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const communicationWebhookSchema: z.ZodObject<{
    communicationId: z.ZodPipe<z.ZodString, z.ZodTransform<`dcm_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `dcm_${string}`, "out">, z.ZodTransform<`dcm_${string}`, string & z.$brand<`dcm_${string}`>>>;
    event: z.ZodEnum<{
        bounced: "bounced";
        clicked: "clicked";
        complained: "complained";
        delivered: "delivered";
        opened: "opened";
        sent: "sent";
    }>;
    timestamp: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    providerData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const bulkExecuteCampaignInputSchema: z.ZodObject<{
    campaignIds: z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`dc_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `dc_${string}`, "out">, z.ZodTransform<`dc_${string}`, string & z.$brand<`dc_${string}`>>>>;
    dryRun: z.ZodDefault<z.ZodBoolean>;
    customFilters: z.ZodOptional<z.ZodObject<{
        customerIds: z.ZodOptional<z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>>>;
        excludeCustomerIds: z.ZodOptional<z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>>>;
        testMode: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const customerRiskProfileInputSchema: z.ZodObject<{
    customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
    segmentIds: z.ZodDefault<z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`cs_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cs_${string}`, "out">, z.ZodTransform<`cs_${string}`, string & z.$brand<`cs_${string}`>>>>>;
    paymentHistory: z.ZodObject<{
        totalPayments: z.ZodNumber;
        successfulPayments: z.ZodNumber;
        failedPayments: z.ZodNumber;
        averageAmount: z.ZodNumber;
        currency: z.ZodOptional<z.ZodString>;
        lastPaymentDate: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        streakDays: z.ZodNumber;
    }, z.core.$strip>;
    subscriptionHistory: z.ZodObject<{
        totalSubscriptions: z.ZodNumber;
        activeSubscriptions: z.ZodNumber;
        canceledSubscriptions: z.ZodNumber;
        averageDuration: z.ZodNumber;
        currentStatus: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    engagementMetrics: z.ZodObject<{
        score: z.ZodNumber;
        lastActivity: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        activityFrequency: z.ZodNumber;
        featureUsage: z.ZodRecord<z.ZodString, z.ZodNumber>;
    }, z.core.$strip>;
    communicationPreferences: z.ZodObject<{
        preferredChannel: z.ZodOptional<z.ZodEnum<{
            email: "email";
            in_app: "in_app";
            sms: "sms";
            webhook: "webhook";
        }>>;
        unsubscribed: z.ZodBoolean;
        unsubscribedChannels: z.ZodArray<z.ZodEnum<{
            email: "email";
            in_app: "in_app";
            sms: "sms";
            webhook: "webhook";
        }>>;
        timezone: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const listDunningCampaignsQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    type: z.ZodOptional<z.ZodEnum<{
        payment_failed: "payment_failed";
        renewal_reminder: "renewal_reminder";
        subscription_past_due: "subscription_past_due";
        trial_ending: "trial_ending";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        archived: "archived";
        draft: "draft";
        paused: "paused";
    }>>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<{
        createdAt: "createdAt";
        name: "name";
        status: "status";
        type: "type";
        updatedAt: "updatedAt";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export declare const listCustomerSegmentsQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    type: z.ZodOptional<z.ZodEnum<{
        behavior_based: "behavior_based";
        custom: "custom";
        demographic: "demographic";
        risk_based: "risk_based";
        value_based: "value_based";
    }>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<{
        createdAt: "createdAt";
        customerCount: "customerCount";
        name: "name";
        type: "type";
        updatedAt: "updatedAt";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export declare const listExecutionsQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    campaignId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`dc_${string}`, string>>>;
    customerId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>>>;
    status: z.ZodOptional<z.ZodEnum<{
        cancelled: "cancelled";
        completed: "completed";
        failed: "failed";
        running: "running";
        scheduled: "scheduled";
    }>>;
    scheduledAfter: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    scheduledBefore: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    sortBy: z.ZodDefault<z.ZodEnum<{
        completedAt: "completedAt";
        createdAt: "createdAt";
        scheduledAt: "scheduledAt";
        startedAt: "startedAt";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export declare const listCommunicationsQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    executionId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`de_${string}`, string>>>;
    customerId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>>>;
    channel: z.ZodOptional<z.ZodEnum<{
        email: "email";
        in_app: "in_app";
        sms: "sms";
        webhook: "webhook";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        bounced: "bounced";
        clicked: "clicked";
        delivered: "delivered";
        failed: "failed";
        opened: "opened";
        pending: "pending";
        sent: "sent";
    }>>;
    sentAfter: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    sentBefore: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    sortBy: z.ZodDefault<z.ZodEnum<{
        createdAt: "createdAt";
        deliveredAt: "deliveredAt";
        sentAt: "sentAt";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export declare const dunningCampaignResponseSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`dc_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `dc_${string}`, "out">, z.ZodTransform<`dc_${string}`, string & z.$brand<`dc_${string}`>>>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        payment_failed: "payment_failed";
        renewal_reminder: "renewal_reminder";
        subscription_past_due: "subscription_past_due";
        trial_ending: "trial_ending";
    }>;
    status: z.ZodEnum<{
        active: "active";
        archived: "archived";
        draft: "draft";
        paused: "paused";
    }>;
    trigger: z.ZodObject<{
        type: z.ZodEnum<{
            manual: "manual";
            payment_failure: "payment_failure";
            subscription_status: "subscription_status";
            time_based: "time_based";
        }>;
        conditions: z.ZodObject<{
            paymentFailureCount: z.ZodOptional<z.ZodNumber>;
            subscriptionStatus: z.ZodOptional<z.ZodArray<z.ZodString>>;
            daysSinceLastPayment: z.ZodOptional<z.ZodNumber>;
            daysSinceFailure: z.ZodOptional<z.ZodNumber>;
            trialEndingDays: z.ZodOptional<z.ZodNumber>;
            renewalReminderDays: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        filters: z.ZodOptional<z.ZodObject<{
            customerSegments: z.ZodOptional<z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`cs_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cs_${string}`, "out">, z.ZodTransform<`cs_${string}`, string & z.$brand<`cs_${string}`>>>>>;
            planTiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
            subscriptionAge: z.ZodOptional<z.ZodObject<{
                min: z.ZodOptional<z.ZodNumber>;
                max: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            totalSpent: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                min: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                    amount: z.ZodString;
                    currency: z.ZodString;
                }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                    amount: string;
                    currency: string;
                }>>>;
                max: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                    amount: z.ZodString;
                    currency: z.ZodString;
                }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                    amount: string;
                    currency: string;
                }>>>;
            }, z.core.$strip>, z.ZodTransform<SpendRange, {
                min?: import("@arki/money").Money<string> | undefined;
                max?: import("@arki/money").Money<string> | undefined;
            }>>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    settings: z.ZodObject<{
        enabled: z.ZodBoolean;
        priority: z.ZodNumber;
        cooldownPeriod: z.ZodNumber;
        maxExecutionsPerCustomer: z.ZodNumber;
        stopOnPaymentSuccess: z.ZodBoolean;
        respectUnsubscribe: z.ZodBoolean;
        businessHoursOnly: z.ZodBoolean;
        timezone: z.ZodOptional<z.ZodString>;
        allowedDays: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
        abTestVariant: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    targetSegments: z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`cs_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cs_${string}`, "out">, z.ZodTransform<`cs_${string}`, string & z.$brand<`cs_${string}`>>>>;
    createdBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    updatedBy: z.ZodOptional<z.ZodCustom<`usr_${string}`, `usr_${string}`>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
}, z.core.$strip>;
export declare const customerSegmentResponseSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`cs_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cs_${string}`, "out">, z.ZodTransform<`cs_${string}`, string & z.$brand<`cs_${string}`>>>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        behavior_based: "behavior_based";
        custom: "custom";
        demographic: "demographic";
        risk_based: "risk_based";
        value_based: "value_based";
    }>;
    criteria: z.ZodObject<{
        totalSpent: z.ZodOptional<z.ZodPipe<z.ZodObject<{
            min: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                amount: string;
                currency: string;
            }>>>;
            max: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                amount: string;
                currency: string;
            }>>>;
        }, z.core.$strip>, z.ZodTransform<SpendRange, {
            min?: import("@arki/money").Money<string> | undefined;
            max?: import("@arki/money").Money<string> | undefined;
        }>>>;
        subscriptionDuration: z.ZodOptional<z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        paymentFailureHistory: z.ZodOptional<z.ZodObject<{
            count: z.ZodNumber;
            timeframe: z.ZodNumber;
        }, z.core.$strip>>;
        planTier: z.ZodOptional<z.ZodArray<z.ZodString>>;
        lastPaymentDate: z.ZodOptional<z.ZodObject<{
            daysAgo: z.ZodNumber;
        }, z.core.$strip>>;
        lifetimeValue: z.ZodOptional<z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        churnRisk: z.ZodOptional<z.ZodEnum<{
            high: "high";
            low: "low";
            medium: "medium";
        }>>;
        engagementScore: z.ZodOptional<z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        customAttributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>;
    isActive: z.ZodBoolean;
    customerCount: z.ZodOptional<z.ZodNumber>;
    lastCalculated: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    autoUpdate: z.ZodBoolean;
    updateFrequency: z.ZodOptional<z.ZodNumber>;
    createdBy: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
}, z.core.$strip>;
export type CreateDunningCampaignInput = z.infer<typeof createDunningCampaignInputSchema>;
export type UpdateDunningCampaignInput = z.infer<typeof updateDunningCampaignInputSchema>;
export type CreateDunningTemplateInput = z.infer<typeof createDunningTemplateInputSchema>;
export type UpdateDunningTemplateInput = z.infer<typeof updateDunningTemplateInputSchema>;
export type CreateCustomerSegmentInput = z.infer<typeof createCustomerSegmentInputSchema>;
export type UpdateCustomerSegmentInput = z.infer<typeof updateCustomerSegmentInputSchema>;
export type ExecuteCampaignInput = z.infer<typeof executeCampaignInputSchema>;
export type CampaignAnalyticsInput = z.infer<typeof campaignAnalyticsInputSchema>;
export type UpdateExecutionStatusInput = z.infer<typeof updateExecutionStatusInputSchema>;
export type UpdateCommunicationStatusInput = z.infer<typeof updateCommunicationStatusInputSchema>;
export type CommunicationWebhookInput = z.infer<typeof communicationWebhookSchema>;
export type BulkExecuteCampaignInput = z.infer<typeof bulkExecuteCampaignInputSchema>;
export type CustomerRiskProfileInput = z.infer<typeof customerRiskProfileInputSchema>;
export type ListDunningCampaignsQuery = z.infer<typeof listDunningCampaignsQuerySchema>;
export type ListCustomerSegmentsQuery = z.infer<typeof listCustomerSegmentsQuerySchema>;
export type ListExecutionsQuery = z.infer<typeof listExecutionsQuerySchema>;
export type ListCommunicationsQuery = z.infer<typeof listCommunicationsQuerySchema>;
export type DunningCampaignResponse = z.infer<typeof dunningCampaignResponseSchema>;
export type CustomerSegmentResponse = z.infer<typeof customerSegmentResponseSchema>;
export declare const getCampaignInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`dc_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `dc_${string}`, "out">, z.ZodTransform<`dc_${string}`, string & z.$brand<`dc_${string}`>>>;
}, z.core.$strip>;
export declare const updateCampaignWrapperInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`dc_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `dc_${string}`, "out">, z.ZodTransform<`dc_${string}`, string & z.$brand<`dc_${string}`>>>;
    data: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<{
            payment_failed: "payment_failed";
            renewal_reminder: "renewal_reminder";
            subscription_past_due: "subscription_past_due";
            trial_ending: "trial_ending";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            active: "active";
            archived: "archived";
            draft: "draft";
            paused: "paused";
        }>>;
        trigger: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<{
                manual: "manual";
                payment_failure: "payment_failure";
                subscription_status: "subscription_status";
                time_based: "time_based";
            }>;
            conditions: z.ZodObject<{
                paymentFailureCount: z.ZodOptional<z.ZodNumber>;
                subscriptionStatus: z.ZodOptional<z.ZodArray<z.ZodString>>;
                daysSinceLastPayment: z.ZodOptional<z.ZodNumber>;
                daysSinceFailure: z.ZodOptional<z.ZodNumber>;
                trialEndingDays: z.ZodOptional<z.ZodNumber>;
                renewalReminderDays: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            filters: z.ZodOptional<z.ZodObject<{
                customerSegments: z.ZodOptional<z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`cs_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cs_${string}`, "out">, z.ZodTransform<`cs_${string}`, string & z.$brand<`cs_${string}`>>>>>;
                planTiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                subscriptionAge: z.ZodOptional<z.ZodObject<{
                    min: z.ZodOptional<z.ZodNumber>;
                    max: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>>;
                totalSpent: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                    min: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                        amount: z.ZodString;
                        currency: z.ZodString;
                    }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                        amount: string;
                        currency: string;
                    }>>>;
                    max: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                        amount: z.ZodString;
                        currency: z.ZodString;
                    }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                        amount: string;
                        currency: string;
                    }>>>;
                }, z.core.$strip>, z.ZodTransform<SpendRange, {
                    min?: import("@arki/money").Money<string> | undefined;
                    max?: import("@arki/money").Money<string> | undefined;
                }>>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        settings: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodBoolean;
            priority: z.ZodNumber;
            cooldownPeriod: z.ZodNumber;
            maxExecutionsPerCustomer: z.ZodNumber;
            stopOnPaymentSuccess: z.ZodBoolean;
            respectUnsubscribe: z.ZodBoolean;
            businessHoursOnly: z.ZodBoolean;
            timezone: z.ZodOptional<z.ZodString>;
            allowedDays: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
            abTestVariant: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        targetSegments: z.ZodOptional<z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`cs_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cs_${string}`, "out">, z.ZodTransform<`cs_${string}`, string & z.$brand<`cs_${string}`>>>>>;
        templates: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            stepNumber: z.ZodNumber;
            delayHours: z.ZodNumber;
            communication: z.ZodObject<{
                channel: z.ZodEnum<{
                    email: "email";
                    in_app: "in_app";
                    sms: "sms";
                    webhook: "webhook";
                }>;
                subject: z.ZodOptional<z.ZodString>;
                content: z.ZodString;
                variables: z.ZodArray<z.ZodString>;
                design: z.ZodOptional<z.ZodObject<{
                    theme: z.ZodOptional<z.ZodString>;
                    brandColors: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                    logoUrl: z.ZodOptional<z.ZodURL>;
                }, z.core.$strip>>;
            }, z.core.$strip>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const deleteCampaignInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`dc_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `dc_${string}`, "out">, z.ZodTransform<`dc_${string}`, string & z.$brand<`dc_${string}`>>>;
}, z.core.$strip>;
export declare const updateCampaignStatusInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`dc_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `dc_${string}`, "out">, z.ZodTransform<`dc_${string}`, string & z.$brand<`dc_${string}`>>>;
    status: z.ZodEnum<{
        active: "active";
        archived: "archived";
        draft: "draft";
        paused: "paused";
    }>;
}, z.core.$strip>;
export declare const getCampaignAnalyticsInputSchema: z.ZodObject<{
    campaignId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`dc_${string}`, string>>>;
    days: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const getSegmentInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`cs_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cs_${string}`, "out">, z.ZodTransform<`cs_${string}`, string & z.$brand<`cs_${string}`>>>;
}, z.core.$strip>;
export declare const updateSegmentWrapperInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`cs_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cs_${string}`, "out">, z.ZodTransform<`cs_${string}`, string & z.$brand<`cs_${string}`>>>;
    data: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<{
            behavior_based: "behavior_based";
            custom: "custom";
            demographic: "demographic";
            risk_based: "risk_based";
            value_based: "value_based";
        }>>;
        criteria: z.ZodOptional<z.ZodObject<{
            totalSpent: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                min: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                    amount: z.ZodString;
                    currency: z.ZodString;
                }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                    amount: string;
                    currency: string;
                }>>>;
                max: z.ZodOptional<z.ZodPipe<z.ZodObject<{
                    amount: z.ZodString;
                    currency: z.ZodString;
                }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
                    amount: string;
                    currency: string;
                }>>>;
            }, z.core.$strip>, z.ZodTransform<SpendRange, {
                min?: import("@arki/money").Money<string> | undefined;
                max?: import("@arki/money").Money<string> | undefined;
            }>>>;
            subscriptionDuration: z.ZodOptional<z.ZodObject<{
                min: z.ZodOptional<z.ZodNumber>;
                max: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            paymentFailureHistory: z.ZodOptional<z.ZodObject<{
                count: z.ZodNumber;
                timeframe: z.ZodNumber;
            }, z.core.$strip>>;
            planTier: z.ZodOptional<z.ZodArray<z.ZodString>>;
            lastPaymentDate: z.ZodOptional<z.ZodObject<{
                daysAgo: z.ZodNumber;
            }, z.core.$strip>>;
            lifetimeValue: z.ZodOptional<z.ZodObject<{
                min: z.ZodOptional<z.ZodNumber>;
                max: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            churnRisk: z.ZodOptional<z.ZodEnum<{
                high: "high";
                low: "low";
                medium: "medium";
            }>>;
            engagementScore: z.ZodOptional<z.ZodObject<{
                min: z.ZodOptional<z.ZodNumber>;
                max: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>>;
            customAttributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        isActive: z.ZodOptional<z.ZodBoolean>;
        autoUpdate: z.ZodOptional<z.ZodBoolean>;
        updateFrequency: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const deleteSegmentInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`cs_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cs_${string}`, "out">, z.ZodTransform<`cs_${string}`, string & z.$brand<`cs_${string}`>>>;
}, z.core.$strip>;
export declare const getSegmentCustomersInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`cs_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cs_${string}`, "out">, z.ZodTransform<`cs_${string}`, string & z.$brand<`cs_${string}`>>>;
    limit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateSegmentCustomerCountInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`cs_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cs_${string}`, "out">, z.ZodTransform<`cs_${string}`, string & z.$brand<`cs_${string}`>>>;
}, z.core.$strip>;
export declare const getRiskProfileByCustomerInputSchema: z.ZodObject<{
    customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
}, z.core.$strip>;
export declare const updateRiskProfileForCustomerInputSchema: z.ZodObject<{
    customerId: z.ZodPipe<z.ZodString, z.ZodTransform<`cust_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `cust_${string}`, "out">, z.ZodTransform<`cust_${string}`, string & z.$brand<`cust_${string}`>>>;
}, z.core.$strip>;
export declare const getRiskProfilesByCategoryInputSchema: z.ZodObject<{
    category: z.ZodEnum<{
        critical: "critical";
        high: "high";
        low: "low";
        medium: "medium";
    }>;
    limit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const bulkUpdateExecutionsInputSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const processScheduledExecutionsInputSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const retryFailedExecutionsInputSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const getExecutionMetricsInputSchema: z.ZodObject<{
    executionId: z.ZodPipe<z.ZodString, z.ZodTransform<`de_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `de_${string}`, "out">, z.ZodTransform<`de_${string}`, string & z.$brand<`de_${string}`>>>;
}, z.core.$strip>;
export declare const getCommunicationInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`dcm_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `dcm_${string}`, "out">, z.ZodTransform<`dcm_${string}`, string & z.$brand<`dcm_${string}`>>>;
}, z.core.$strip>;
export declare const processPendingCommunicationsInputSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const retryFailedCommunicationsInputSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const getDashboardMetricsInputSchema: z.ZodObject<{
    days: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export { communicationChannelValues, communicationStatusValues, customerSegmentTypeValues, dunningCampaignStatusValues, dunningCampaignTypeValues, executionStatusValues, riskCategoryValues, } from './primitives.js';
//# sourceMappingURL=contracts.d.ts.map