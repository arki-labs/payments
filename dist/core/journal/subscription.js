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
import { eq } from 'drizzle-orm';
import { userIdSchema } from '../user-id.js';
import { z } from '@arki/contracts';
import { fromDate } from '@arki/date';
import { instantSchema } from '@arki/date/zod';
import { isFailure } from '@arki/failure';
import { CommandConflict, CommandNotFound } from '@arki/journal';
import { createSubscriptionId, customerIdSchema, planIdSchema, subscriptionIdSchema, subscriptionStatusValues, } from '../primitives.js';
import { sameJson, toInstant, toIso, toNullableInstant } from './support.js';
const statusSchema = z.enum(subscriptionStatusValues);
const isoSchema = z.iso.datetime();
const metadataSchema = z.record(z.string(), z.unknown());
/** What the provider says about a subscription, plus who owns it and which plan it is on. */
const snapshotShape = {
    userId: userIdSchema,
    planId: planIdSchema,
    customerId: customerIdSchema,
    status: statusSchema,
    currentPeriodStart: isoSchema,
    currentPeriodEnd: isoSchema,
    trialStart: isoSchema.nullable(),
    trialEnd: isoSchema.nullable(),
    canceledAt: isoSchema.nullable(),
    cancelAtPeriodEnd: z.boolean(),
    metadata: metadataSchema.nullable(),
};
const subscriptionCreatedSchema = z.object({ providerSubscriptionId: z.string(), ...snapshotShape });
const subscriptionSyncedSchema = z.object(snapshotShape);
const subscriptionActivatedSchema = z.object({});
const subscriptionCanceledSchema = z.object({
    status: statusSchema,
    canceledAt: isoSchema.nullable(),
    cancelAtPeriodEnd: z.boolean(),
});
const subscriptionReactivatedSchema = z.object({ status: statusSchema });
const subscriptionPausedSchema = z.object({ status: statusSchema });
const subscriptionResumedSchema = z.object({ status: statusSchema });
const subscriptionPlanChangedSchema = z.object({ planId: planIdSchema });
const subscriptionCancelAtPeriodEndSetSchema = z.object({ cancelAtPeriodEnd: z.boolean() });
const subscriptionPastDueSchema = z.object({});
/**
 * A field left `undefined` means "the caller did not say": a new row gets the
 * empty value and an existing row keeps what it has. `null` clears the field.
 */
export const syncSubscriptionInputSchema = z.object({
    userId: userIdSchema,
    planId: planIdSchema,
    customerId: customerIdSchema,
    providerSubscriptionId: z.string().min(1).max(255),
    /** The status the provider reports */
    status: statusSchema,
    currentPeriodStart: instantSchema(),
    currentPeriodEnd: instantSchema(),
    trialStart: instantSchema().nullable().optional(),
    trialEnd: instantSchema().nullable().optional(),
    canceledAt: instantSchema().nullable().optional(),
    cancelAtPeriodEnd: z.boolean().optional(),
    metadata: metadataSchema.nullable().optional(),
});
export const createSubscriptionInputSchema = syncSubscriptionInputSchema.extend({
    /** Left out: the command makes a new id */
    subscriptionId: subscriptionIdSchema.optional(),
});
export const cancelSubscriptionInputSchema = z.object({
    subscriptionId: subscriptionIdSchema,
    /** The status the provider reports. A cancel at the end of the period keeps the subscription `active`. */
    status: statusSchema.default('canceled'),
    canceledAt: instantSchema().nullable().optional(),
    cancelAtPeriodEnd: z.boolean().optional(),
});
export const reactivateSubscriptionInputSchema = z.object({
    subscriptionId: subscriptionIdSchema,
    status: statusSchema.default('active'),
});
export const pauseSubscriptionInputSchema = z.object({
    subscriptionId: subscriptionIdSchema,
    status: statusSchema.default('paused'),
});
export const resumeSubscriptionInputSchema = z.object({
    subscriptionId: subscriptionIdSchema,
    status: statusSchema.default('active'),
});
export const changeSubscriptionPlanInputSchema = z.object({
    subscriptionId: subscriptionIdSchema,
    /** The plan the provider moved the subscription to */
    planId: planIdSchema,
});
export const setSubscriptionCancelAtPeriodEndInputSchema = z.object({
    subscriptionId: subscriptionIdSchema,
    /** The flag the provider reports after the change */
    cancelAtPeriodEnd: z.boolean(),
});
export const markSubscriptionPastDueInputSchema = z.object({ subscriptionId: subscriptionIdSchema });
export const activateSubscriptionInputSchema = z.object({ subscriptionId: subscriptionIdSchema });
/** The time the caller gave, or the one the row holds when the caller did not say. */
function resolveTime(given, kept) {
    const time = given === undefined ? kept : given;
    return time === null ? null : toIso(time);
}
/** The snapshot the row holds now, in the shape events carry. */
function snapshotOfRow(row) {
    return {
        userId: row.userId,
        planId: row.planId,
        customerId: row.customerId,
        status: row.status,
        currentPeriodStart: toIso(row.currentPeriodStart),
        currentPeriodEnd: toIso(row.currentPeriodEnd),
        trialStart: resolveTime(undefined, row.trialStart),
        trialEnd: resolveTime(undefined, row.trialEnd),
        canceledAt: resolveTime(undefined, row.canceledAt),
        cancelAtPeriodEnd: row.cancelAtPeriodEnd,
        metadata: row.metadata,
    };
}
/** The snapshot a delivery leads to: what the provider sent, on top of what the row holds. */
function snapshotOfDelivery(input, row) {
    // A provider may stamp "now" on every delivery of the same cancellation (RevenueCat does).
    // The first time counts: a row that is already canceled keeps its `canceledAt`.
    const alreadyCanceled = row?.status === 'canceled' && row.canceledAt !== null && input.status === 'canceled';
    const canceledAt = alreadyCanceled && input.canceledAt ? row.canceledAt : input.canceledAt;
    return {
        userId: input.userId,
        planId: input.planId,
        customerId: input.customerId,
        status: input.status,
        currentPeriodStart: toIso(input.currentPeriodStart),
        currentPeriodEnd: toIso(input.currentPeriodEnd),
        trialStart: resolveTime(input.trialStart, row?.trialStart ?? null),
        trialEnd: resolveTime(input.trialEnd, row?.trialEnd ?? null),
        canceledAt: resolveTime(canceledAt, row?.canceledAt ?? null),
        cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? row?.cancelAtPeriodEnd ?? false,
        metadata: input.metadata === undefined ? (row?.metadata ?? null) : input.metadata,
    };
}
function requireSubscription(row, subscriptionId) {
    if (!row) {
        return CommandNotFound({ detail: `Subscription ${subscriptionId} not found` });
    }
    return row;
}
export function createSubscriptionJournal(j, subscriptions) {
    const SubscriptionCreated = j.event('SubscriptionCreated', subscriptionCreatedSchema);
    const SubscriptionSynced = j.event('SubscriptionSynced', subscriptionSyncedSchema);
    const SubscriptionActivated = j.event('SubscriptionActivated', subscriptionActivatedSchema);
    const SubscriptionCanceled = j.event('SubscriptionCanceled', subscriptionCanceledSchema);
    const SubscriptionReactivated = j.event('SubscriptionReactivated', subscriptionReactivatedSchema);
    const SubscriptionPaused = j.event('SubscriptionPaused', subscriptionPausedSchema);
    const SubscriptionResumed = j.event('SubscriptionResumed', subscriptionResumedSchema);
    const SubscriptionPlanChanged = j.event('SubscriptionPlanChanged', subscriptionPlanChangedSchema);
    const SubscriptionCancelAtPeriodEndSet = j.event('SubscriptionCancelAtPeriodEndSet', subscriptionCancelAtPeriodEndSetSchema);
    const SubscriptionPastDue = j.event('SubscriptionPastDue', subscriptionPastDueSchema);
    const subscription = j
        .entity('subscription', subscriptions)
        .create(SubscriptionCreated, e => ({
        userId: e.data.userId,
        planId: e.data.planId,
        customerId: e.data.customerId,
        providerSubscriptionId: e.data.providerSubscriptionId,
        status: e.data.status,
        currentPeriodStart: toInstant(e.data.currentPeriodStart),
        currentPeriodEnd: toInstant(e.data.currentPeriodEnd),
        trialStart: toNullableInstant(e.data.trialStart),
        trialEnd: toNullableInstant(e.data.trialEnd),
        canceledAt: toNullableInstant(e.data.canceledAt),
        cancelAtPeriodEnd: e.data.cancelAtPeriodEnd,
        metadata: e.data.metadata,
        createdAt: fromDate(e.recordedAt),
        updatedAt: fromDate(e.recordedAt),
    }))
        .on(SubscriptionSynced, (_row, e) => ({
        userId: e.data.userId,
        planId: e.data.planId,
        customerId: e.data.customerId,
        status: e.data.status,
        currentPeriodStart: toInstant(e.data.currentPeriodStart),
        currentPeriodEnd: toInstant(e.data.currentPeriodEnd),
        trialStart: toNullableInstant(e.data.trialStart),
        trialEnd: toNullableInstant(e.data.trialEnd),
        canceledAt: toNullableInstant(e.data.canceledAt),
        cancelAtPeriodEnd: e.data.cancelAtPeriodEnd,
        metadata: e.data.metadata,
        updatedAt: fromDate(e.recordedAt),
    }))
        .on(SubscriptionActivated, (_row, e) => ({ status: 'active', updatedAt: fromDate(e.recordedAt) }))
        .on(SubscriptionCanceled, (_row, e) => ({
        status: e.data.status,
        canceledAt: toNullableInstant(e.data.canceledAt),
        cancelAtPeriodEnd: e.data.cancelAtPeriodEnd,
        updatedAt: fromDate(e.recordedAt),
    }))
        .on(SubscriptionReactivated, (_row, e) => ({
        status: e.data.status,
        canceledAt: null,
        cancelAtPeriodEnd: false,
        updatedAt: fromDate(e.recordedAt),
    }))
        .on(SubscriptionPaused, (_row, e) => ({ status: e.data.status, updatedAt: fromDate(e.recordedAt) }))
        .on(SubscriptionResumed, (_row, e) => ({ status: e.data.status, updatedAt: fromDate(e.recordedAt) }))
        .on(SubscriptionPlanChanged, (_row, e) => ({ planId: e.data.planId, updatedAt: fromDate(e.recordedAt) }))
        .on(SubscriptionCancelAtPeriodEndSet, (_row, e) => ({
        cancelAtPeriodEnd: e.data.cancelAtPeriodEnd,
        updatedAt: fromDate(e.recordedAt),
    }))
        .on(SubscriptionPastDue, (_row, e) => ({ status: 'past_due', updatedAt: fromDate(e.recordedAt) }));
    /** Stores a subscription the provider just created, with the status the provider reported. */
    const createSubscription = j.command('createSubscription', createSubscriptionInputSchema, { writes: [SubscriptionCreated] }, (input, { write }) => {
        const subscriptionId = input.subscriptionId ?? createSubscriptionId();
        if (isFailure(subscriptionId))
            return subscriptionId;
        return write(subscription, subscriptionId, row => {
            if (row) {
                return CommandConflict({ detail: `Subscription ${subscriptionId} already exists` });
            }
            return [
                SubscriptionCreated({
                    providerSubscriptionId: input.providerSubscriptionId,
                    ...snapshotOfDelivery(input, null),
                }),
            ];
        });
    });
    /**
     * Brings the row in line with what the provider says. The row is found by the
     * provider's subscription id, inside this command's transaction. No row: the
     * subscription is created. A delivery that changes nothing writes no event, so
     * a repeated webhook is safe.
     */
    const syncSubscription = j.command('syncSubscription', syncSubscriptionInputSchema, { writes: [SubscriptionCreated, SubscriptionSynced] }, async (input, { tx, write }) => {
        const [existing] = await tx
            .select({ id: subscriptions.id })
            .from(subscriptions)
            .where(eq(subscriptions.providerSubscriptionId, input.providerSubscriptionId))
            .limit(1);
        const subscriptionId = existing?.id ?? createSubscriptionId();
        if (isFailure(subscriptionId))
            return subscriptionId;
        return write(subscription, subscriptionId, row => {
            const next = snapshotOfDelivery(input, row);
            if (!row) {
                return [SubscriptionCreated({ providerSubscriptionId: input.providerSubscriptionId, ...next })];
            }
            return sameJson(snapshotOfRow(row), next) ? [] : [SubscriptionSynced(next)];
        });
    });
    /** Records a cancellation with the status and the `cancelAtPeriodEnd` the provider reported. */
    const cancelSubscription = j.command('cancelSubscription', cancelSubscriptionInputSchema, { writes: [SubscriptionCanceled] }, (input, { write }) => write(subscription, input.subscriptionId, row => {
        const current = requireSubscription(row, input.subscriptionId);
        if (isFailure(current))
            return current;
        if (current.status === 'canceled') {
            return CommandConflict({ detail: `Subscription ${input.subscriptionId} is already canceled` });
        }
        return [
            SubscriptionCanceled({
                status: input.status,
                canceledAt: resolveTime(input.canceledAt, current.canceledAt),
                cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? current.cancelAtPeriodEnd,
            }),
        ];
    }));
    const reactivateSubscription = j.command('reactivateSubscription', reactivateSubscriptionInputSchema, { writes: [SubscriptionReactivated] }, (input, { write }) => write(subscription, input.subscriptionId, row => {
        const current = requireSubscription(row, input.subscriptionId);
        if (isFailure(current))
            return current;
        if (current.status !== 'canceled' && current.status !== 'past_due') {
            return CommandConflict({ detail: 'Only canceled or past due subscriptions can be reactivated' });
        }
        return [SubscriptionReactivated({ status: input.status })];
    }));
    /** A user pauses an active subscription; dunning pauses one that is past due. */
    const pauseSubscription = j.command('pauseSubscription', pauseSubscriptionInputSchema, { writes: [SubscriptionPaused] }, (input, { write }) => write(subscription, input.subscriptionId, row => {
        const current = requireSubscription(row, input.subscriptionId);
        if (isFailure(current))
            return current;
        if (current.status !== 'active' && current.status !== 'past_due') {
            return CommandConflict({ detail: 'Only active or past due subscriptions can be paused' });
        }
        return [SubscriptionPaused({ status: input.status })];
    }));
    const resumeSubscription = j.command('resumeSubscription', resumeSubscriptionInputSchema, { writes: [SubscriptionResumed] }, (input, { write }) => write(subscription, input.subscriptionId, row => {
        const current = requireSubscription(row, input.subscriptionId);
        if (isFailure(current))
            return current;
        if (current.status !== 'paused') {
            return CommandConflict({ detail: 'Only paused subscriptions can be resumed' });
        }
        return [SubscriptionResumed({ status: input.status })];
    }));
    /** Stores the plan the provider moved the subscription to. The same plan again writes nothing. */
    const changeSubscriptionPlan = j.command('changeSubscriptionPlan', changeSubscriptionPlanInputSchema, { writes: [SubscriptionPlanChanged] }, (input, { write }) => write(subscription, input.subscriptionId, row => {
        const current = requireSubscription(row, input.subscriptionId);
        if (isFailure(current))
            return current;
        return current.planId === input.planId ? [] : [SubscriptionPlanChanged({ planId: input.planId })];
    }));
    /** Stores the flag the provider reports. A subscription that is already canceled has no period end to wait for. */
    const setSubscriptionCancelAtPeriodEnd = j.command('setSubscriptionCancelAtPeriodEnd', setSubscriptionCancelAtPeriodEndInputSchema, { writes: [SubscriptionCancelAtPeriodEndSet] }, (input, { write }) => write(subscription, input.subscriptionId, row => {
        const current = requireSubscription(row, input.subscriptionId);
        if (isFailure(current))
            return current;
        if (current.status === 'canceled') {
            return CommandConflict({ detail: `Subscription ${input.subscriptionId} is already canceled` });
        }
        return current.cancelAtPeriodEnd === input.cancelAtPeriodEnd
            ? []
            : [SubscriptionCancelAtPeriodEndSet({ cancelAtPeriodEnd: input.cancelAtPeriodEnd })];
    }));
    /** A payment failed (dunning started, or every retry was used up). Already past due: nothing to write. */
    const markSubscriptionPastDue = j.command('markSubscriptionPastDue', markSubscriptionPastDueInputSchema, { writes: [SubscriptionPastDue] }, (input, { write }) => write(subscription, input.subscriptionId, row => {
        const current = requireSubscription(row, input.subscriptionId);
        if (isFailure(current))
            return current;
        return current.status === 'past_due' ? [] : [SubscriptionPastDue({})];
    }));
    /** A payment went through (a retry succeeded, or dunning recovered). Already active: nothing to write. */
    const activateSubscription = j.command('activateSubscription', activateSubscriptionInputSchema, { writes: [SubscriptionActivated] }, (input, { write }) => write(subscription, input.subscriptionId, row => {
        const current = requireSubscription(row, input.subscriptionId);
        if (isFailure(current))
            return current;
        if (current.status === 'canceled') {
            return CommandConflict({ detail: `Cannot activate canceled subscription ${input.subscriptionId}` });
        }
        return current.status === 'active' ? [] : [SubscriptionActivated({})];
    }));
    return {
        subscription,
        events: {
            SubscriptionCreated,
            SubscriptionSynced,
            SubscriptionActivated,
            SubscriptionCanceled,
            SubscriptionReactivated,
            SubscriptionPaused,
            SubscriptionResumed,
            SubscriptionPlanChanged,
            SubscriptionCancelAtPeriodEndSet,
            SubscriptionPastDue,
        },
        commands: {
            createSubscription,
            syncSubscription,
            cancelSubscription,
            reactivateSubscription,
            pauseSubscription,
            resumeSubscription,
            changeSubscriptionPlan,
            setSubscriptionCancelAtPeriodEnd,
            markSubscriptionPastDue,
            activateSubscription,
        },
    };
}
//# sourceMappingURL=subscription.js.map