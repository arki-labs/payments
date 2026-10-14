/**
 * Payments core on `@arki/journal`
 *
 * `createCoreJournal(j, { payments, subscriptions })` takes the app's journal
 * definitions and the app's two tables. It returns the entities, the events,
 * the commands, and `writes(run)`: plain async functions for the services.
 *
 * The package owns no database, no composed journal and no worker. The app
 * lists the tables in its schema and runs the commands through its own
 * command runner:
 *
 *   export const paymentsJournal = createCoreJournal(j, { payments, subscriptions });
 *   new SubscriptionManager(provider, repo, paymentsJournal.writes(context.runCommand));
 *
 * Every write of `payments` and `subscriptions` goes through one of these
 * commands. A rejected rule throws the `CommandError` of `@arki/journal`.
 */
import { createPaymentJournal } from './journal/payment.js';
import { createSubscriptionJournal } from './journal/subscription.js';
import { writtenRow } from './journal/support.js';
export { cancelPaymentInputSchema, completePaymentInputSchema, failPaymentInputSchema, initiatePaymentInputSchema, markPaymentRequiresActionInputSchema, recordPaymentDisputeInputSchema, recordPaymentRefundInputSchema, } from './journal/payment.js';
export { activateSubscriptionInputSchema, cancelSubscriptionInputSchema, changeSubscriptionPlanInputSchema, createSubscriptionInputSchema, markSubscriptionPastDueInputSchema, pauseSubscriptionInputSchema, reactivateSubscriptionInputSchema, resumeSubscriptionInputSchema, setSubscriptionCancelAtPeriodEndInputSchema, syncSubscriptionInputSchema, } from './journal/subscription.js';
export function createCoreJournal(j, tables) {
    const payments = createPaymentJournal(j, tables.payments);
    const subscriptions = createSubscriptionJournal(j, tables.subscriptions);
    const commands = { ...payments.commands, ...subscriptions.commands };
    return {
        entities: { payment: payments.payment, subscription: subscriptions.subscription },
        events: { ...payments.events, ...subscriptions.events },
        commands,
        /** `run` is the app's command runner: `context.runCommand` in a request, `ctx.run` inside a command. */
        writes: (run) => ({
            initiatePayment: input => writtenRow(run(commands.initiatePayment, input), 'initiatePayment'),
            completePayment: input => writtenRow(run(commands.completePayment, input), 'completePayment'),
            failPayment: input => writtenRow(run(commands.failPayment, input), 'failPayment'),
            cancelPayment: input => writtenRow(run(commands.cancelPayment, input), 'cancelPayment'),
            markPaymentRequiresAction: input => writtenRow(run(commands.markPaymentRequiresAction, input), 'markPaymentRequiresAction'),
            recordPaymentRefund: input => writtenRow(run(commands.recordPaymentRefund, input), 'recordPaymentRefund'),
            recordPaymentDispute: input => writtenRow(run(commands.recordPaymentDispute, input), 'recordPaymentDispute'),
            createSubscription: input => writtenRow(run(commands.createSubscription, input), 'createSubscription'),
            syncSubscription: input => writtenRow(run(commands.syncSubscription, input), 'syncSubscription'),
            cancelSubscription: input => writtenRow(run(commands.cancelSubscription, input), 'cancelSubscription'),
            reactivateSubscription: input => writtenRow(run(commands.reactivateSubscription, input), 'reactivateSubscription'),
            pauseSubscription: input => writtenRow(run(commands.pauseSubscription, input), 'pauseSubscription'),
            resumeSubscription: input => writtenRow(run(commands.resumeSubscription, input), 'resumeSubscription'),
            changeSubscriptionPlan: input => writtenRow(run(commands.changeSubscriptionPlan, input), 'changeSubscriptionPlan'),
            setSubscriptionCancelAtPeriodEnd: input => writtenRow(run(commands.setSubscriptionCancelAtPeriodEnd, input), 'setSubscriptionCancelAtPeriodEnd'),
            markSubscriptionPastDue: input => writtenRow(run(commands.markSubscriptionPastDue, input), 'markSubscriptionPastDue'),
            activateSubscription: input => writtenRow(run(commands.activateSubscription, input), 'activateSubscription'),
        }),
    };
}
//# sourceMappingURL=journal.js.map