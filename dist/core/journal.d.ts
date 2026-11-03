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
 * commands. A rejected rule returns a failure of `@arki/journal`
 * (`CommandNotFound`, `CommandConflict`, `CommandInvalid`): nothing is written.
 */
import type { CommandInvalid, CommandNotFound, CommandRunner, JournalDefinitions, RootDb, TransactionSource } from '@arki/journal';
import type { SchemaOutput, StandardSchemaV1 } from '@arki/schema';
import type { CancelPaymentInput, CompletePaymentInput, FailPaymentInput, InitiatePaymentInput, MarkPaymentRequiresActionInput, RecordPaymentDisputeInput, RecordPaymentRefundInput } from './journal/payment.js';
import type { ActivateSubscriptionInput, CancelSubscriptionInput, ChangeSubscriptionPlanInput, CreateSubscriptionInput, MarkSubscriptionPastDueInput, PauseSubscriptionInput, ReactivateSubscriptionInput, ResumeSubscriptionInput, SetSubscriptionCancelAtPeriodEndInput, SyncSubscriptionInput } from './journal/subscription.js';
import type { CoreTables } from './tables.js';
import type { Payment, Subscription } from './types.js';
import type { PaymentJournal } from './journal/payment.js';
import type { SubscriptionJournal } from './journal/subscription.js';
import type { JournalWriteFailure } from './journal/support.js';
export { cancelPaymentInputSchema, completePaymentInputSchema, failPaymentInputSchema, initiatePaymentInputSchema, markPaymentRequiresActionInputSchema, recordPaymentDisputeInputSchema, recordPaymentRefundInputSchema, } from './journal/payment.js';
export { activateSubscriptionInputSchema, cancelSubscriptionInputSchema, changeSubscriptionPlanInputSchema, createSubscriptionInputSchema, markSubscriptionPastDueInputSchema, pauseSubscriptionInputSchema, reactivateSubscriptionInputSchema, resumeSubscriptionInputSchema, setSubscriptionCancelAtPeriodEndInputSchema, syncSubscriptionInputSchema, } from './journal/subscription.js';
export type { CancelPaymentInput, CompletePaymentInput, FailPaymentInput, InitiatePaymentInput, MarkPaymentRequiresActionInput, RecordPaymentDisputeInput, RecordPaymentRefundInput, } from './journal/payment.js';
export type { ActivateSubscriptionInput, CancelSubscriptionInput, CreateSubscriptionInput, MarkSubscriptionPastDueInput, PauseSubscriptionInput, ReactivateSubscriptionInput, ResumeSubscriptionInput, SyncSubscriptionInput, } from './journal/subscription.js';
/**
 * What the services call to change a payment or a subscription. Each function
 * runs one command and returns the row as it is after the write, or the
 * failure the command returned when a rule said no (nothing was written).
 */
export type CoreWrites = {
    initiatePayment: (input: InitiatePaymentInput) => Promise<Payment | JournalWriteFailure>;
    completePayment: (input: CompletePaymentInput) => Promise<Payment | JournalWriteFailure | CommandNotFound>;
    failPayment: (input: FailPaymentInput) => Promise<Payment | JournalWriteFailure | CommandNotFound>;
    cancelPayment: (input: CancelPaymentInput) => Promise<Payment | JournalWriteFailure | CommandNotFound>;
    /** The customer must act (for example 3-D Secure). An already waiting payment stays as it is. */
    markPaymentRequiresAction: (input: MarkPaymentRequiresActionInput) => Promise<Payment | JournalWriteFailure | CommandNotFound>;
    /** The provider refunded the payment. A total that is not higher writes nothing. */
    recordPaymentRefund: (input: RecordPaymentRefundInput) => Promise<Payment | JournalWriteFailure | CommandNotFound | CommandInvalid>;
    /** The same dispute and status again writes nothing. */
    recordPaymentDispute: (input: RecordPaymentDisputeInput) => Promise<Payment | JournalWriteFailure | CommandNotFound>;
    createSubscription: (input: CreateSubscriptionInput) => Promise<Subscription | JournalWriteFailure>;
    /** Create or update by provider subscription id. An unchanged delivery writes no event. */
    syncSubscription: (input: SyncSubscriptionInput) => Promise<Subscription | JournalWriteFailure>;
    cancelSubscription: (input: CancelSubscriptionInput) => Promise<Subscription | JournalWriteFailure | CommandNotFound>;
    reactivateSubscription: (input: ReactivateSubscriptionInput) => Promise<Subscription | JournalWriteFailure | CommandNotFound>;
    pauseSubscription: (input: PauseSubscriptionInput) => Promise<Subscription | JournalWriteFailure | CommandNotFound>;
    resumeSubscription: (input: ResumeSubscriptionInput) => Promise<Subscription | JournalWriteFailure | CommandNotFound>;
    /** The same provider plan again writes nothing. */
    changeSubscriptionPlan: (input: ChangeSubscriptionPlanInput) => Promise<Subscription | JournalWriteFailure | CommandNotFound>;
    /** Set or clear ends at period end without changing the status. */
    setSubscriptionCancelAtPeriodEnd: (input: SetSubscriptionCancelAtPeriodEndInput) => Promise<Subscription | JournalWriteFailure | CommandNotFound>;
    markSubscriptionPastDue: (input: MarkSubscriptionPastDueInput) => Promise<Subscription | JournalWriteFailure | CommandNotFound>;
    activateSubscription: (input: ActivateSubscriptionInput) => Promise<Subscription | JournalWriteFailure | CommandNotFound>;
};
/** What `createCoreJournal` returns: the payment and subscription journals as one, and `writes`. */
export type CoreJournal<Meta extends StandardSchemaV1<unknown, Record<string, unknown>>, Tx extends TransactionSource<Tx>, AppDb extends RootDb> = {
    entities: {
        payment: PaymentJournal<Meta, Tx, AppDb>['payment'];
        subscription: SubscriptionJournal<Meta, Tx, AppDb>['subscription'];
    };
    events: PaymentJournal<Meta, Tx, AppDb>['events'] & SubscriptionJournal<Meta, Tx, AppDb>['events'];
    commands: PaymentJournal<Meta, Tx, AppDb>['commands'] & SubscriptionJournal<Meta, Tx, AppDb>['commands'];
    /** `run` is the app's command runner: `context.runCommand` in a request, `ctx.run` inside a command. */
    writes: (run: CommandRunner<SchemaOutput<Meta>, Tx>) => CoreWrites;
};
export declare function createCoreJournal<Meta extends StandardSchemaV1<unknown, Record<string, unknown>>, Tx extends TransactionSource<Tx>, AppDb extends RootDb>(j: JournalDefinitions<Meta, Tx, AppDb>, tables: Pick<CoreTables, 'payments' | 'subscriptions'>): CoreJournal<Meta, Tx, AppDb>;
//# sourceMappingURL=journal.d.ts.map