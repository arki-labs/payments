/**
 * Subscription on the journal: its events, the entity and the commands
 *
 * One `subscriptions` row is the current state of a subscription, keyed by its
 * id. Each reducer says which columns an event changes.
 *
 * The payment provider owns the status. Events carry the status the provider
 * reported; the package never invents one. `SubscriptionSynced` carries the
 * whole provider snapshot, so a webhook delivery is one event.
 *
 * Event data is plain JSON: times are ISO strings and reducers build the
 * `Instant`. `updatedAt` is `e.recordedAt`. Command inputs take `Instant` values,
 * because inputs are not stored.
 */
import type { EventDef, JournalDefinitions, RootDb, TransactionSource } from '@arki/journal';
import type { StandardSchemaV1 } from '@arki/schema';
import { z } from '@arki/contracts';
import type { CoreTables } from '../tables.js';
declare const subscriptionCreatedSchema: z.ZodObject<{
    userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    planId: z.ZodTemplateLiteral<`plan${string}`>;
    customerId: z.ZodTemplateLiteral<`cust${string}`>;
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
    currentPeriodStart: z.ZodISODateTime;
    currentPeriodEnd: z.ZodISODateTime;
    trialStart: z.ZodNullable<z.ZodISODateTime>;
    trialEnd: z.ZodNullable<z.ZodISODateTime>;
    canceledAt: z.ZodNullable<z.ZodISODateTime>;
    cancelAtPeriodEnd: z.ZodBoolean;
    metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    providerSubscriptionId: z.ZodString;
}, z.core.$strip>;
declare const subscriptionSyncedSchema: z.ZodObject<{
    userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    planId: z.ZodTemplateLiteral<`plan${string}`>;
    customerId: z.ZodTemplateLiteral<`cust${string}`>;
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
    currentPeriodStart: z.ZodISODateTime;
    currentPeriodEnd: z.ZodISODateTime;
    trialStart: z.ZodNullable<z.ZodISODateTime>;
    trialEnd: z.ZodNullable<z.ZodISODateTime>;
    canceledAt: z.ZodNullable<z.ZodISODateTime>;
    cancelAtPeriodEnd: z.ZodBoolean;
    metadata: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
declare const subscriptionActivatedSchema: z.ZodObject<{}, z.core.$strip>;
declare const subscriptionCanceledSchema: z.ZodObject<{
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
    canceledAt: z.ZodNullable<z.ZodISODateTime>;
    cancelAtPeriodEnd: z.ZodBoolean;
}, z.core.$strip>;
declare const subscriptionReactivatedSchema: z.ZodObject<{
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
}, z.core.$strip>;
declare const subscriptionPausedSchema: z.ZodObject<{
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
}, z.core.$strip>;
declare const subscriptionResumedSchema: z.ZodObject<{
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
}, z.core.$strip>;
declare const subscriptionPlanChangedSchema: z.ZodObject<{
    planId: z.ZodTemplateLiteral<`plan${string}`>;
}, z.core.$strip>;
declare const subscriptionCancelAtPeriodEndSetSchema: z.ZodObject<{
    cancelAtPeriodEnd: z.ZodBoolean;
}, z.core.$strip>;
declare const subscriptionPastDueSchema: z.ZodObject<{}, z.core.$strip>;
/** A subscription was stored for the first time, with the state the provider reported. */
export interface SubscriptionCreatedEvent extends EventDef<'SubscriptionCreated', typeof subscriptionCreatedSchema> {
}
/** The provider's state differs from the row: a webhook delivery or a manual sync. */
export interface SubscriptionSyncedEvent extends EventDef<'SubscriptionSynced', typeof subscriptionSyncedSchema> {
}
/** A payment went through: the subscription is `active`. */
export interface SubscriptionActivatedEvent extends EventDef<'SubscriptionActivated', typeof subscriptionActivatedSchema> {
}
/** The subscription was canceled, now or at the end of the paid period. */
export interface SubscriptionCanceledEvent extends EventDef<'SubscriptionCanceled', typeof subscriptionCanceledSchema> {
}
/** A canceled or past-due subscription was turned back on. */
export interface SubscriptionReactivatedEvent extends EventDef<'SubscriptionReactivated', typeof subscriptionReactivatedSchema> {
}
/** The subscription was paused. */
export interface SubscriptionPausedEvent extends EventDef<'SubscriptionPaused', typeof subscriptionPausedSchema> {
}
/** A paused subscription was resumed. */
export interface SubscriptionResumedEvent extends EventDef<'SubscriptionResumed', typeof subscriptionResumedSchema> {
}
/** The provider moved the subscription to another plan. */
export interface SubscriptionPlanChangedEvent extends EventDef<'SubscriptionPlanChanged', typeof subscriptionPlanChangedSchema> {
}
/** The subscription will (or will no longer) end when the paid period ends. The status does not change. */
export interface SubscriptionCancelAtPeriodEndSetEvent extends EventDef<'SubscriptionCancelAtPeriodEndSet', typeof subscriptionCancelAtPeriodEndSetSchema> {
}
/** A payment failed for good: the subscription is `past_due`. */
export interface SubscriptionPastDueEvent extends EventDef<'SubscriptionPastDue', typeof subscriptionPastDueSchema> {
}
/**
 * A field left `undefined` means "the caller did not say": a new row gets the
 * empty value and an existing row keeps what it has. `null` clears the field.
 */
export declare const syncSubscriptionInputSchema: z.ZodObject<{
    userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    planId: z.ZodTemplateLiteral<`plan${string}`>;
    customerId: z.ZodTemplateLiteral<`cust${string}`>;
    providerSubscriptionId: z.ZodString;
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
    trialStart: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    trialEnd: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    canceledAt: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
export declare const createSubscriptionInputSchema: z.ZodObject<{
    userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
    planId: z.ZodTemplateLiteral<`plan${string}`>;
    customerId: z.ZodTemplateLiteral<`cust${string}`>;
    providerSubscriptionId: z.ZodString;
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
    trialStart: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    trialEnd: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    canceledAt: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    subscriptionId: z.ZodOptional<z.ZodTemplateLiteral<`sub${string}`>>;
}, z.core.$strip>;
export declare const cancelSubscriptionInputSchema: z.ZodObject<{
    subscriptionId: z.ZodTemplateLiteral<`sub${string}`>;
    status: z.ZodDefault<z.ZodEnum<{
        active: "active";
        canceled: "canceled";
        incomplete: "incomplete";
        incomplete_expired: "incomplete_expired";
        past_due: "past_due";
        paused: "paused";
        trialing: "trialing";
        unpaid: "unpaid";
    }>>;
    canceledAt: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
    cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const reactivateSubscriptionInputSchema: z.ZodObject<{
    subscriptionId: z.ZodTemplateLiteral<`sub${string}`>;
    status: z.ZodDefault<z.ZodEnum<{
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
export declare const pauseSubscriptionInputSchema: z.ZodObject<{
    subscriptionId: z.ZodTemplateLiteral<`sub${string}`>;
    status: z.ZodDefault<z.ZodEnum<{
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
export declare const resumeSubscriptionInputSchema: z.ZodObject<{
    subscriptionId: z.ZodTemplateLiteral<`sub${string}`>;
    status: z.ZodDefault<z.ZodEnum<{
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
export declare const changeSubscriptionPlanInputSchema: z.ZodObject<{
    subscriptionId: z.ZodTemplateLiteral<`sub${string}`>;
    planId: z.ZodTemplateLiteral<`plan${string}`>;
}, z.core.$strip>;
export declare const setSubscriptionCancelAtPeriodEndInputSchema: z.ZodObject<{
    subscriptionId: z.ZodTemplateLiteral<`sub${string}`>;
    cancelAtPeriodEnd: z.ZodBoolean;
}, z.core.$strip>;
export declare const markSubscriptionPastDueInputSchema: z.ZodObject<{
    subscriptionId: z.ZodTemplateLiteral<`sub${string}`>;
}, z.core.$strip>;
export declare const activateSubscriptionInputSchema: z.ZodObject<{
    subscriptionId: z.ZodTemplateLiteral<`sub${string}`>;
}, z.core.$strip>;
export type SyncSubscriptionInput = z.input<typeof syncSubscriptionInputSchema>;
export type CreateSubscriptionInput = z.input<typeof createSubscriptionInputSchema>;
export type CancelSubscriptionInput = z.input<typeof cancelSubscriptionInputSchema>;
export type ReactivateSubscriptionInput = z.input<typeof reactivateSubscriptionInputSchema>;
export type PauseSubscriptionInput = z.input<typeof pauseSubscriptionInputSchema>;
export type ResumeSubscriptionInput = z.input<typeof resumeSubscriptionInputSchema>;
export type ChangeSubscriptionPlanInput = z.input<typeof changeSubscriptionPlanInputSchema>;
export type SetSubscriptionCancelAtPeriodEndInput = z.input<typeof setSubscriptionCancelAtPeriodEndInputSchema>;
export type MarkSubscriptionPastDueInput = z.input<typeof markSubscriptionPastDueInputSchema>;
export type ActivateSubscriptionInput = z.input<typeof activateSubscriptionInputSchema>;
export declare function createSubscriptionJournal<Meta extends StandardSchemaV1<unknown, Record<string, unknown>>, Tx extends TransactionSource<Tx>, AppDb extends RootDb>(j: JournalDefinitions<Meta, Tx, AppDb>, subscriptions: CoreTables['subscriptions']): {
    subscription: import("@arki/journal").OnOnlyEntityBuilder<"subscription", import("../tables.js").SubscriptionsTable, SubscriptionActivatedEvent | SubscriptionCancelAtPeriodEndSetEvent | SubscriptionCanceledEvent | SubscriptionCreatedEvent | SubscriptionPastDueEvent | SubscriptionPausedEvent | SubscriptionPlanChangedEvent | SubscriptionReactivatedEvent | SubscriptionResumedEvent | SubscriptionSyncedEvent, import("@arki/schema").SchemaOutput<Meta>, "id", {
        userId: `usr_${string}`;
        planId: `plan${string}`;
        customerId: `cust${string}`;
        providerSubscriptionId: string;
        status: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid";
        currentPeriodStart: import("temporal-spec").Temporal.Instant;
        currentPeriodEnd: import("temporal-spec").Temporal.Instant;
        trialStart: import("temporal-spec").Temporal.Instant | null;
        trialEnd: import("temporal-spec").Temporal.Instant | null;
        canceledAt: import("temporal-spec").Temporal.Instant | null;
        cancelAtPeriodEnd: boolean;
        metadata: Record<string, unknown> | null;
        createdAt: import("temporal-spec").Temporal.Instant;
        updatedAt: import("temporal-spec").Temporal.Instant;
    }>;
    events: {
        SubscriptionCreated: SubscriptionCreatedEvent;
        SubscriptionSynced: SubscriptionSyncedEvent;
        SubscriptionActivated: SubscriptionActivatedEvent;
        SubscriptionCanceled: SubscriptionCanceledEvent;
        SubscriptionReactivated: SubscriptionReactivatedEvent;
        SubscriptionPaused: SubscriptionPausedEvent;
        SubscriptionResumed: SubscriptionResumedEvent;
        SubscriptionPlanChanged: SubscriptionPlanChangedEvent;
        SubscriptionCancelAtPeriodEndSet: SubscriptionCancelAtPeriodEndSetEvent;
        SubscriptionPastDue: SubscriptionPastDueEvent;
    };
    commands: {
        createSubscription: import("@arki/journal").Command<z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodTemplateLiteral<`plan${string}`>;
            customerId: z.ZodTemplateLiteral<`cust${string}`>;
            providerSubscriptionId: z.ZodString;
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
            trialStart: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
            trialEnd: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
            canceledAt: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
            cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            subscriptionId: z.ZodOptional<z.ZodTemplateLiteral<`sub${string}`>>;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("../tables.js").SubscriptionsTable, SubscriptionActivatedEvent | SubscriptionCancelAtPeriodEndSetEvent | SubscriptionCanceledEvent | SubscriptionCreatedEvent | SubscriptionPastDueEvent | SubscriptionPausedEvent | SubscriptionPlanChangedEvent | SubscriptionReactivatedEvent | SubscriptionResumedEvent | SubscriptionSyncedEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure> | import("@arki/contracts").IdGenerationFailure, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [SubscriptionCreatedEvent], undefined>;
        syncSubscription: import("@arki/journal").Command<z.ZodObject<{
            userId: z.ZodCustom<`usr_${string}`, `usr_${string}`>;
            planId: z.ZodTemplateLiteral<`plan${string}`>;
            customerId: z.ZodTemplateLiteral<`cust${string}`>;
            providerSubscriptionId: z.ZodString;
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
            trialStart: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
            trialEnd: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
            canceledAt: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
            cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>, Promise<import("@arki/journal").WriteResult<import("../tables.js").SubscriptionsTable, SubscriptionActivatedEvent | SubscriptionCancelAtPeriodEndSetEvent | SubscriptionCanceledEvent | SubscriptionCreatedEvent | SubscriptionPastDueEvent | SubscriptionPausedEvent | SubscriptionPlanChangedEvent | SubscriptionReactivatedEvent | SubscriptionResumedEvent | SubscriptionSyncedEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [SubscriptionCreatedEvent, SubscriptionSyncedEvent], undefined>;
        cancelSubscription: import("@arki/journal").Command<z.ZodObject<{
            subscriptionId: z.ZodTemplateLiteral<`sub${string}`>;
            status: z.ZodDefault<z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>>;
            canceledAt: z.ZodOptional<z.ZodNullable<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>>;
            cancelAtPeriodEnd: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("../tables.js").SubscriptionsTable, SubscriptionActivatedEvent | SubscriptionCancelAtPeriodEndSetEvent | SubscriptionCanceledEvent | SubscriptionCreatedEvent | SubscriptionPastDueEvent | SubscriptionPausedEvent | SubscriptionPlanChangedEvent | SubscriptionReactivatedEvent | SubscriptionResumedEvent | SubscriptionSyncedEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [SubscriptionCanceledEvent], undefined>;
        reactivateSubscription: import("@arki/journal").Command<z.ZodObject<{
            subscriptionId: z.ZodTemplateLiteral<`sub${string}`>;
            status: z.ZodDefault<z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>>;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("../tables.js").SubscriptionsTable, SubscriptionActivatedEvent | SubscriptionCancelAtPeriodEndSetEvent | SubscriptionCanceledEvent | SubscriptionCreatedEvent | SubscriptionPastDueEvent | SubscriptionPausedEvent | SubscriptionPlanChangedEvent | SubscriptionReactivatedEvent | SubscriptionResumedEvent | SubscriptionSyncedEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [SubscriptionReactivatedEvent], undefined>;
        pauseSubscription: import("@arki/journal").Command<z.ZodObject<{
            subscriptionId: z.ZodTemplateLiteral<`sub${string}`>;
            status: z.ZodDefault<z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>>;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("../tables.js").SubscriptionsTable, SubscriptionActivatedEvent | SubscriptionCancelAtPeriodEndSetEvent | SubscriptionCanceledEvent | SubscriptionCreatedEvent | SubscriptionPastDueEvent | SubscriptionPausedEvent | SubscriptionPlanChangedEvent | SubscriptionReactivatedEvent | SubscriptionResumedEvent | SubscriptionSyncedEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [SubscriptionPausedEvent], undefined>;
        resumeSubscription: import("@arki/journal").Command<z.ZodObject<{
            subscriptionId: z.ZodTemplateLiteral<`sub${string}`>;
            status: z.ZodDefault<z.ZodEnum<{
                active: "active";
                canceled: "canceled";
                incomplete: "incomplete";
                incomplete_expired: "incomplete_expired";
                past_due: "past_due";
                paused: "paused";
                trialing: "trialing";
                unpaid: "unpaid";
            }>>;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("../tables.js").SubscriptionsTable, SubscriptionActivatedEvent | SubscriptionCancelAtPeriodEndSetEvent | SubscriptionCanceledEvent | SubscriptionCreatedEvent | SubscriptionPastDueEvent | SubscriptionPausedEvent | SubscriptionPlanChangedEvent | SubscriptionReactivatedEvent | SubscriptionResumedEvent | SubscriptionSyncedEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [SubscriptionResumedEvent], undefined>;
        changeSubscriptionPlan: import("@arki/journal").Command<z.ZodObject<{
            subscriptionId: z.ZodTemplateLiteral<`sub${string}`>;
            planId: z.ZodTemplateLiteral<`plan${string}`>;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("../tables.js").SubscriptionsTable, SubscriptionActivatedEvent | SubscriptionCancelAtPeriodEndSetEvent | SubscriptionCanceledEvent | SubscriptionCreatedEvent | SubscriptionPastDueEvent | SubscriptionPausedEvent | SubscriptionPlanChangedEvent | SubscriptionReactivatedEvent | SubscriptionResumedEvent | SubscriptionSyncedEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [SubscriptionPlanChangedEvent], undefined>;
        setSubscriptionCancelAtPeriodEnd: import("@arki/journal").Command<z.ZodObject<{
            subscriptionId: z.ZodTemplateLiteral<`sub${string}`>;
            cancelAtPeriodEnd: z.ZodBoolean;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("../tables.js").SubscriptionsTable, SubscriptionActivatedEvent | SubscriptionCancelAtPeriodEndSetEvent | SubscriptionCanceledEvent | SubscriptionCreatedEvent | SubscriptionPastDueEvent | SubscriptionPausedEvent | SubscriptionPlanChangedEvent | SubscriptionReactivatedEvent | SubscriptionResumedEvent | SubscriptionSyncedEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [SubscriptionCancelAtPeriodEndSetEvent], undefined>;
        markSubscriptionPastDue: import("@arki/journal").Command<z.ZodObject<{
            subscriptionId: z.ZodTemplateLiteral<`sub${string}`>;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("../tables.js").SubscriptionsTable, SubscriptionActivatedEvent | SubscriptionCancelAtPeriodEndSetEvent | SubscriptionCanceledEvent | SubscriptionCreatedEvent | SubscriptionPastDueEvent | SubscriptionPausedEvent | SubscriptionPlanChangedEvent | SubscriptionReactivatedEvent | SubscriptionResumedEvent | SubscriptionSyncedEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [SubscriptionPastDueEvent], undefined>;
        activateSubscription: import("@arki/journal").Command<z.ZodObject<{
            subscriptionId: z.ZodTemplateLiteral<`sub${string}`>;
        }, z.core.$strip>, Promise<import("@arki/failure").Failure<"journal.conflict", {
            detail: string;
        }> | import("@arki/failure").Failure<"journal.not_found", {
            detail: string;
        }> | import("@arki/journal").WriteResult<import("../tables.js").SubscriptionsTable, SubscriptionActivatedEvent | SubscriptionCancelAtPeriodEndSetEvent | SubscriptionCanceledEvent | SubscriptionCreatedEvent | SubscriptionPastDueEvent | SubscriptionPausedEvent | SubscriptionPlanChangedEvent | SubscriptionReactivatedEvent | SubscriptionResumedEvent | SubscriptionSyncedEvent, import("@arki/schema").SchemaOutput<Meta>, "id"> | import("@arki/contracts").IdGenerationFailure | import("@arki/failure").SchemaFailure>, import("@arki/schema").SchemaOutput<Meta>, Tx, readonly [SubscriptionActivatedEvent], undefined>;
    };
};
/** What `createSubscriptionJournal` returns for one app's journal definitions. */
export type SubscriptionJournal<Meta extends StandardSchemaV1<unknown, Record<string, unknown>>, Tx extends TransactionSource<Tx>, AppDb extends RootDb> = ReturnType<typeof createSubscriptionJournal<Meta, Tx, AppDb>>;
export {};
//# sourceMappingURL=subscription.d.ts.map