import { z } from '@arki/contracts';
import type { CoreTables } from './tables.js';
/** Builds the schemas. `createCoreDerivedSchemas` returns them under the name declared below. */
declare function buildCoreDerivedSchemas({ plans, customers, subscriptions, payments, webhookEvents, }: Pick<CoreTables, 'plans' | 'customers' | 'subscriptions' | 'payments' | 'webhookEvents'>): {
    planSelectSchema: z.ZodObject<{
        id: z.ZodTemplateLiteral<`plan${string}`>;
        name: z.ZodCoercedString<unknown>;
        description: z.ZodNullable<z.ZodCoercedString<unknown>>;
        tier: z.ZodEnum<{
            basic: "basic";
            enterprise: "enterprise";
            premium: "premium";
            pro: "pro";
        }>;
        priceMinor: z.ZodCoercedNumber<unknown>;
        currency: z.ZodCoercedString<unknown>;
        interval: z.ZodEnum<{
            daily: "daily";
            monthly: "monthly";
            weekly: "weekly";
            yearly: "yearly";
        }>;
        intervalCount: z.ZodCoercedNumber<unknown>;
        features: z.ZodArray<z.ZodString>;
        isActive: z.ZodCoercedBoolean<unknown>;
        trialPeriodDays: z.ZodNullable<z.ZodCoercedNumber<unknown>>;
        metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
        createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    }, z.core.$strip>;
    planInsertSchema: z.ZodObject<{
        id: z.ZodOptional<z.ZodTemplateLiteral<`plan${string}`>>;
        name: z.ZodCoercedString<unknown>;
        description: z.ZodOptional<z.ZodNullable<z.ZodCoercedString<unknown>>>;
        tier: z.ZodOptional<z.ZodEnum<{
            basic: "basic";
            enterprise: "enterprise";
            premium: "premium";
            pro: "pro";
        }>>;
        priceMinor: z.ZodNumber;
        currency: z.ZodString;
        interval: z.ZodOptional<z.ZodEnum<{
            daily: "daily";
            monthly: "monthly";
            weekly: "weekly";
            yearly: "yearly";
        }>>;
        intervalCount: z.ZodNumber;
        features: z.ZodDefault<z.ZodArray<z.ZodString>>;
        isActive: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        trialPeriodDays: z.ZodOptional<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>>;
        createdAt: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        updatedAt: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    }, z.core.$strip>;
    planUpdateSchema: z.ZodObject<{
        name: z.ZodOptional<z.ZodCoercedString<unknown>>;
        description: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodCoercedString<unknown>>>>;
        tier: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
            basic: "basic";
            enterprise: "enterprise";
            premium: "premium";
            pro: "pro";
        }>>>;
        priceMinor: z.ZodOptional<z.ZodNumber>;
        currency: z.ZodOptional<z.ZodString>;
        interval: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
            daily: "daily";
            monthly: "monthly";
            weekly: "weekly";
            yearly: "yearly";
        }>>>;
        intervalCount: z.ZodOptional<z.ZodNumber>;
        features: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString>>>;
        isActive: z.ZodOptional<z.ZodOptional<z.ZodCoercedBoolean<unknown>>>;
        trialPeriodDays: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        metadata: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>>>;
        createdAt: z.ZodOptional<z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
        updatedAt: z.ZodOptional<z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    }, z.core.$strip>;
    customerSelectSchema: z.ZodObject<{
        id: z.ZodTemplateLiteral<`cust${string}`>;
        userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
        providerCustomerId: z.ZodCoercedString<unknown>;
        provider: z.ZodCoercedString<unknown>;
        email: z.ZodCoercedString<unknown>;
        name: z.ZodNullable<z.ZodCoercedString<unknown>>;
        defaultPaymentMethodId: z.ZodNullable<z.ZodCoercedString<unknown>>;
        metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
        createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    }, z.core.$strip>;
    customerInsertSchema: z.ZodObject<{
        id: z.ZodOptional<z.ZodTemplateLiteral<`cust${string}`>>;
        userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
        providerCustomerId: z.ZodCoercedString<unknown>;
        provider: z.ZodOptional<z.ZodCoercedString<unknown>>;
        email: z.ZodEmail;
        name: z.ZodOptional<z.ZodString>;
        defaultPaymentMethodId: z.ZodOptional<z.ZodNullable<z.ZodCoercedString<unknown>>>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>>;
        createdAt: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        updatedAt: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    }, z.core.$strip>;
    customerUpdateSchema: z.ZodObject<{
        providerCustomerId: z.ZodOptional<z.ZodCoercedString<unknown>>;
        provider: z.ZodOptional<z.ZodOptional<z.ZodCoercedString<unknown>>>;
        email: z.ZodOptional<z.ZodEmail>;
        name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        defaultPaymentMethodId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodCoercedString<unknown>>>>;
        metadata: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>>>;
        createdAt: z.ZodOptional<z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
        updatedAt: z.ZodOptional<z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    }, z.core.$strip>;
    subscriptionSelectSchema: z.ZodObject<{
        id: z.ZodTemplateLiteral<`sub${string}`>;
        userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
        planId: z.ZodTemplateLiteral<`plan${string}`>;
        customerId: z.ZodTemplateLiteral<`cust${string}`>;
        providerSubscriptionId: z.ZodCoercedString<unknown>;
        status: z.ZodEnum<{
            active: "active";
            canceled: "canceled";
            incomplete: "incomplete";
            incomplete_expired: "incomplete_expired";
            past_due: "past_due";
            paused: "paused";
            trialing: "trialing";
            unpaid: "unpaid";
        }>;
        currentPeriodStart: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        currentPeriodEnd: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        trialStart: z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        trialEnd: z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        canceledAt: z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        cancelAtPeriodEnd: z.ZodCoercedBoolean<unknown>;
        metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
        createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    }, z.core.$strip>;
    subscriptionInsertSchema: z.ZodObject<{
        id: z.ZodOptional<z.ZodTemplateLiteral<`sub${string}`>>;
        userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
        planId: z.ZodTemplateLiteral<`plan${string}`>;
        customerId: z.ZodTemplateLiteral<`cust${string}`>;
        providerSubscriptionId: z.ZodCoercedString<unknown>;
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
        currentPeriodStart: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        currentPeriodEnd: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        trialStart: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        trialEnd: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        canceledAt: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        cancelAtPeriodEnd: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>>;
        createdAt: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        updatedAt: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    }, z.core.$strip>;
    subscriptionUpdateSchema: z.ZodObject<{
        planId: z.ZodOptional<z.ZodTemplateLiteral<`plan${string}`>>;
        customerId: z.ZodOptional<z.ZodTemplateLiteral<`cust${string}`>>;
        providerSubscriptionId: z.ZodOptional<z.ZodCoercedString<unknown>>;
        status: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
            active: "active";
            canceled: "canceled";
            incomplete: "incomplete";
            incomplete_expired: "incomplete_expired";
            past_due: "past_due";
            paused: "paused";
            trialing: "trialing";
            unpaid: "unpaid";
        }>>>;
        currentPeriodStart: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        currentPeriodEnd: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        trialStart: z.ZodOptional<z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
        trialEnd: z.ZodOptional<z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
        canceledAt: z.ZodOptional<z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
        cancelAtPeriodEnd: z.ZodOptional<z.ZodOptional<z.ZodCoercedBoolean<unknown>>>;
        metadata: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>>>;
        createdAt: z.ZodOptional<z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
        updatedAt: z.ZodOptional<z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    }, z.core.$strip>;
    paymentSelectSchema: z.ZodObject<{
        id: z.ZodTemplateLiteral<`pay${string}`>;
        subscriptionId: z.ZodNullable<z.ZodTemplateLiteral<`sub${string}`>>;
        userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
        customerId: z.ZodTemplateLiteral<`cust${string}`>;
        providerPaymentId: z.ZodCoercedString<unknown>;
        amountMinor: z.ZodCoercedNumber<unknown>;
        currency: z.ZodCoercedString<unknown>;
        status: z.ZodEnum<{
            canceled: "canceled";
            failed: "failed";
            pending: "pending";
            processing: "processing";
            requires_action: "requires_action";
            succeeded: "succeeded";
        }>;
        paymentMethod: z.ZodEnum<{
            apple_pay: "apple_pay";
            bank_account: "bank_account";
            card: "card";
            google_pay: "google_pay";
            paypal: "paypal";
        }>;
        description: z.ZodNullable<z.ZodCoercedString<unknown>>;
        failureReason: z.ZodNullable<z.ZodCoercedString<unknown>>;
        receiptUrl: z.ZodNullable<z.ZodCoercedString<unknown>>;
        refunded: z.ZodCoercedBoolean<unknown>;
        refundedAmountMinor: z.ZodCoercedNumber<unknown>;
        disputeId: z.ZodNullable<z.ZodCoercedString<unknown>>;
        disputeStatus: z.ZodNullable<z.ZodCoercedString<unknown>>;
        metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
        createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    }, z.core.$strip>;
    paymentInsertSchema: z.ZodObject<{
        id: z.ZodOptional<z.ZodTemplateLiteral<`pay${string}`>>;
        subscriptionId: z.ZodOptional<z.ZodNullable<z.ZodTemplateLiteral<`sub${string}`>>>;
        userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
        customerId: z.ZodTemplateLiteral<`cust${string}`>;
        providerPaymentId: z.ZodCoercedString<unknown>;
        amountMinor: z.ZodNumber;
        currency: z.ZodString;
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
        description: z.ZodOptional<z.ZodString>;
        failureReason: z.ZodOptional<z.ZodString>;
        receiptUrl: z.ZodOptional<z.ZodURL>;
        refunded: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        refundedAmountMinor: z.ZodDefault<z.ZodNumber>;
        disputeId: z.ZodOptional<z.ZodNullable<z.ZodCoercedString<unknown>>>;
        disputeStatus: z.ZodOptional<z.ZodNullable<z.ZodCoercedString<unknown>>>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>>;
        createdAt: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        updatedAt: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    }, z.core.$strip>;
    paymentUpdateSchema: z.ZodObject<{
        subscriptionId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodTemplateLiteral<`sub${string}`>>>>;
        customerId: z.ZodOptional<z.ZodTemplateLiteral<`cust${string}`>>;
        providerPaymentId: z.ZodOptional<z.ZodCoercedString<unknown>>;
        amountMinor: z.ZodOptional<z.ZodNumber>;
        currency: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
            canceled: "canceled";
            failed: "failed";
            pending: "pending";
            processing: "processing";
            requires_action: "requires_action";
            succeeded: "succeeded";
        }>>>;
        paymentMethod: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
            apple_pay: "apple_pay";
            bank_account: "bank_account";
            card: "card";
            google_pay: "google_pay";
            paypal: "paypal";
        }>>>;
        description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        failureReason: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        receiptUrl: z.ZodOptional<z.ZodOptional<z.ZodURL>>;
        refunded: z.ZodOptional<z.ZodOptional<z.ZodCoercedBoolean<unknown>>>;
        refundedAmountMinor: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        disputeId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodCoercedString<unknown>>>>;
        disputeStatus: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodCoercedString<unknown>>>>;
        metadata: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>>>;
        createdAt: z.ZodOptional<z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
        updatedAt: z.ZodOptional<z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    }, z.core.$strip>;
    webhookEventSelectSchema: z.ZodObject<{
        id: z.ZodTemplateLiteral<`wh${string}`>;
        provider: z.ZodCoercedString<unknown>;
        eventType: z.ZodCoercedString<unknown>;
        providerEventId: z.ZodCoercedString<unknown>;
        data: z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>;
        processed: z.ZodCoercedBoolean<unknown>;
        processedAt: z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        attempts: z.ZodCoercedNumber<unknown>;
        lastAttemptAt: z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        errorMessage: z.ZodNullable<z.ZodCoercedString<unknown>>;
        sourceIp: z.ZodNullable<z.ZodCoercedString<unknown>>;
        createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    }, z.core.$strip>;
    webhookEventInsertSchema: z.ZodObject<{
        id: z.ZodOptional<z.ZodTemplateLiteral<`wh${string}`>>;
        provider: z.ZodCoercedString<unknown>;
        eventType: z.ZodCoercedString<unknown>;
        providerEventId: z.ZodString;
        data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        processed: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        processedAt: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
        attempts: z.ZodDefault<z.ZodNumber>;
        lastAttemptAt: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
        errorMessage: z.ZodOptional<z.ZodString>;
        sourceIp: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        updatedAt: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    }, z.core.$strip>;
    webhookEventUpdateSchema: z.ZodObject<{
        provider: z.ZodOptional<z.ZodCoercedString<unknown>>;
        eventType: z.ZodOptional<z.ZodCoercedString<unknown>>;
        providerEventId: z.ZodOptional<z.ZodString>;
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        processed: z.ZodOptional<z.ZodOptional<z.ZodCoercedBoolean<unknown>>>;
        processedAt: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>>;
        attempts: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        lastAttemptAt: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>>;
        errorMessage: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        sourceIp: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        createdAt: z.ZodOptional<z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
        updatedAt: z.ZodOptional<z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    }, z.core.$strip>;
    planResponseSchema: z.ZodObject<{
        id: z.ZodTemplateLiteral<`plan${string}`>;
        name: z.ZodCoercedString<unknown>;
        description: z.ZodNullable<z.ZodCoercedString<unknown>>;
        tier: z.ZodEnum<{
            basic: "basic";
            enterprise: "enterprise";
            premium: "premium";
            pro: "pro";
        }>;
        priceMinor: z.ZodCoercedNumber<unknown>;
        currency: z.ZodCoercedString<unknown>;
        interval: z.ZodEnum<{
            daily: "daily";
            monthly: "monthly";
            weekly: "weekly";
            yearly: "yearly";
        }>;
        intervalCount: z.ZodCoercedNumber<unknown>;
        features: z.ZodArray<z.ZodString>;
        isActive: z.ZodCoercedBoolean<unknown>;
        trialPeriodDays: z.ZodNullable<z.ZodCoercedNumber<unknown>>;
        metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
        createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    }, z.core.$strip>;
    customerResponseSchema: z.ZodObject<{
        id: z.ZodTemplateLiteral<`cust${string}`>;
        userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
        providerCustomerId: z.ZodCoercedString<unknown>;
        provider: z.ZodCoercedString<unknown>;
        email: z.ZodCoercedString<unknown>;
        name: z.ZodNullable<z.ZodCoercedString<unknown>>;
        defaultPaymentMethodId: z.ZodNullable<z.ZodCoercedString<unknown>>;
        metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
        createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    }, z.core.$strip>;
    subscriptionResponseSchema: z.ZodObject<{
        id: z.ZodTemplateLiteral<`sub${string}`>;
        userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
        planId: z.ZodTemplateLiteral<`plan${string}`>;
        customerId: z.ZodTemplateLiteral<`cust${string}`>;
        providerSubscriptionId: z.ZodCoercedString<unknown>;
        status: z.ZodEnum<{
            active: "active";
            canceled: "canceled";
            incomplete: "incomplete";
            incomplete_expired: "incomplete_expired";
            past_due: "past_due";
            paused: "paused";
            trialing: "trialing";
            unpaid: "unpaid";
        }>;
        currentPeriodStart: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        currentPeriodEnd: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        trialStart: z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        trialEnd: z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        canceledAt: z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
        cancelAtPeriodEnd: z.ZodCoercedBoolean<unknown>;
        metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
        createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        plan: z.ZodOptional<z.ZodObject<{
            id: z.ZodTemplateLiteral<`plan${string}`>;
            name: z.ZodCoercedString<unknown>;
            description: z.ZodNullable<z.ZodCoercedString<unknown>>;
            tier: z.ZodEnum<{
                basic: "basic";
                enterprise: "enterprise";
                premium: "premium";
                pro: "pro";
            }>;
            priceMinor: z.ZodCoercedNumber<unknown>;
            currency: z.ZodCoercedString<unknown>;
            interval: z.ZodEnum<{
                daily: "daily";
                monthly: "monthly";
                weekly: "weekly";
                yearly: "yearly";
            }>;
            intervalCount: z.ZodCoercedNumber<unknown>;
            features: z.ZodArray<z.ZodString>;
            isActive: z.ZodCoercedBoolean<unknown>;
            trialPeriodDays: z.ZodNullable<z.ZodCoercedNumber<unknown>>;
            metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
            createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        }, z.core.$strip>>;
        customer: z.ZodOptional<z.ZodObject<{
            id: z.ZodTemplateLiteral<`cust${string}`>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            providerCustomerId: z.ZodCoercedString<unknown>;
            provider: z.ZodCoercedString<unknown>;
            email: z.ZodCoercedString<unknown>;
            name: z.ZodNullable<z.ZodCoercedString<unknown>>;
            defaultPaymentMethodId: z.ZodNullable<z.ZodCoercedString<unknown>>;
            metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
            createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    paymentResponseSchema: z.ZodObject<{
        id: z.ZodTemplateLiteral<`pay${string}`>;
        subscriptionId: z.ZodNullable<z.ZodTemplateLiteral<`sub${string}`>>;
        userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
        customerId: z.ZodTemplateLiteral<`cust${string}`>;
        providerPaymentId: z.ZodCoercedString<unknown>;
        amountMinor: z.ZodCoercedNumber<unknown>;
        currency: z.ZodCoercedString<unknown>;
        status: z.ZodEnum<{
            canceled: "canceled";
            failed: "failed";
            pending: "pending";
            processing: "processing";
            requires_action: "requires_action";
            succeeded: "succeeded";
        }>;
        paymentMethod: z.ZodEnum<{
            apple_pay: "apple_pay";
            bank_account: "bank_account";
            card: "card";
            google_pay: "google_pay";
            paypal: "paypal";
        }>;
        description: z.ZodNullable<z.ZodCoercedString<unknown>>;
        failureReason: z.ZodNullable<z.ZodCoercedString<unknown>>;
        receiptUrl: z.ZodNullable<z.ZodCoercedString<unknown>>;
        refunded: z.ZodCoercedBoolean<unknown>;
        refundedAmountMinor: z.ZodCoercedNumber<unknown>;
        disputeId: z.ZodNullable<z.ZodCoercedString<unknown>>;
        disputeStatus: z.ZodNullable<z.ZodCoercedString<unknown>>;
        metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
        createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        subscription: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodTemplateLiteral<`sub${string}`>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodTemplateLiteral<`plan${string}`>;
            customerId: z.ZodTemplateLiteral<`cust${string}`>;
            providerSubscriptionId: z.ZodCoercedString<unknown>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            currentPeriodEnd: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            trialStart: z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
            trialEnd: z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
            canceledAt: z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
            cancelAtPeriodEnd: z.ZodCoercedBoolean<unknown>;
            metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
            createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            plan: z.ZodOptional<z.ZodObject<{
                id: z.ZodTemplateLiteral<`plan${string}`>;
                name: z.ZodCoercedString<unknown>;
                description: z.ZodNullable<z.ZodCoercedString<unknown>>;
                tier: z.ZodEnum<{
                    basic: "basic";
                    enterprise: "enterprise";
                    premium: "premium";
                    pro: "pro";
                }>;
                priceMinor: z.ZodCoercedNumber<unknown>;
                currency: z.ZodCoercedString<unknown>;
                interval: z.ZodEnum<{
                    daily: "daily";
                    monthly: "monthly";
                    weekly: "weekly";
                    yearly: "yearly";
                }>;
                intervalCount: z.ZodCoercedNumber<unknown>;
                features: z.ZodArray<z.ZodString>;
                isActive: z.ZodCoercedBoolean<unknown>;
                trialPeriodDays: z.ZodNullable<z.ZodCoercedNumber<unknown>>;
                metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
                createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
                updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            }, z.core.$strip>>;
            customer: z.ZodOptional<z.ZodObject<{
                id: z.ZodTemplateLiteral<`cust${string}`>;
                userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
                providerCustomerId: z.ZodCoercedString<unknown>;
                provider: z.ZodCoercedString<unknown>;
                email: z.ZodCoercedString<unknown>;
                name: z.ZodNullable<z.ZodCoercedString<unknown>>;
                defaultPaymentMethodId: z.ZodNullable<z.ZodCoercedString<unknown>>;
                metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
                createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
                updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>>;
        customer: z.ZodOptional<z.ZodObject<{
            id: z.ZodTemplateLiteral<`cust${string}`>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            providerCustomerId: z.ZodCoercedString<unknown>;
            provider: z.ZodCoercedString<unknown>;
            email: z.ZodCoercedString<unknown>;
            name: z.ZodNullable<z.ZodCoercedString<unknown>>;
            defaultPaymentMethodId: z.ZodNullable<z.ZodCoercedString<unknown>>;
            metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
            createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    subscriptionAccessResponseSchema: z.ZodObject<{
        hasAccess: z.ZodBoolean;
        subscription: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            id: z.ZodTemplateLiteral<`sub${string}`>;
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodTemplateLiteral<`plan${string}`>;
            customerId: z.ZodTemplateLiteral<`cust${string}`>;
            providerSubscriptionId: z.ZodCoercedString<unknown>;
            status: z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>;
            currentPeriodStart: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            currentPeriodEnd: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            trialStart: z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
            trialEnd: z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
            canceledAt: z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
            cancelAtPeriodEnd: z.ZodCoercedBoolean<unknown>;
            metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
            createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            plan: z.ZodOptional<z.ZodObject<{
                id: z.ZodTemplateLiteral<`plan${string}`>;
                name: z.ZodCoercedString<unknown>;
                description: z.ZodNullable<z.ZodCoercedString<unknown>>;
                tier: z.ZodEnum<{
                    basic: "basic";
                    enterprise: "enterprise";
                    premium: "premium";
                    pro: "pro";
                }>;
                priceMinor: z.ZodCoercedNumber<unknown>;
                currency: z.ZodCoercedString<unknown>;
                interval: z.ZodEnum<{
                    daily: "daily";
                    monthly: "monthly";
                    weekly: "weekly";
                    yearly: "yearly";
                }>;
                intervalCount: z.ZodCoercedNumber<unknown>;
                features: z.ZodArray<z.ZodString>;
                isActive: z.ZodCoercedBoolean<unknown>;
                trialPeriodDays: z.ZodNullable<z.ZodCoercedNumber<unknown>>;
                metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
                createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
                updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            }, z.core.$strip>>;
            customer: z.ZodOptional<z.ZodObject<{
                id: z.ZodTemplateLiteral<`cust${string}`>;
                userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
                providerCustomerId: z.ZodCoercedString<unknown>;
                provider: z.ZodCoercedString<unknown>;
                email: z.ZodCoercedString<unknown>;
                name: z.ZodNullable<z.ZodCoercedString<unknown>>;
                defaultPaymentMethodId: z.ZodNullable<z.ZodCoercedString<unknown>>;
                metadata: z.ZodNullable<z.ZodType<import("drizzle-orm").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-orm").Json, unknown>>>;
                createdAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
                updatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
            }, z.core.$strip>>;
        }, z.core.$strip>>>;
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
type BuiltCoreDerivedSchemas = ReturnType<typeof buildCoreDerivedSchemas>;
/** What `createCoreDerivedSchemas` returns: the select, insert, update and response schemas of the core tables. */
export interface CoreDerivedSchemas extends BuiltCoreDerivedSchemas {
}
/**
 * Factory for the Drizzle-table-derived Zod schemas. The host app calls this
 * with its `createCoreTables(...)` output so we can wire `createSelectSchema`
 * / `createInsertSchema` to the concrete table objects.
 *
 * Pure schemas (enums, input shapes, query schemas) live alongside in
 * `./contracts` and are imported directly — only the table-coupled ones are
 * factoried.
 */
export declare function createCoreDerivedSchemas(tables: Pick<CoreTables, 'plans' | 'customers' | 'subscriptions' | 'payments' | 'webhookEvents'>): CoreDerivedSchemas;
export {};
//# sourceMappingURL=derived-schemas.d.ts.map