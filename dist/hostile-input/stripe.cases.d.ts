import type { PGlite } from '@electric-sql/pglite';
import Stripe from 'stripe';
import type { Customer, Payment, Plan, Subscription } from '../core/types.js';
import type { SubscriptionBilling } from '../presets/subscription.js';
import type { AppDb } from '../test-support.js';
import { StripeProvider } from '../core/providers/stripe-provider.js';
/** The in-memory rows `StripeProvider` reads through its `references`, and what the Stripe answers need to know. */
type World = {
    customers: Map<string, Customer>;
    plans: Map<string, Plan>;
    payments: Map<string, Payment>;
    subscriptions: Map<string, Subscription>;
    /** The refund id the next `refunds.list` answer carries in its metadata. */
    refundIdOnStripe: string;
    /** The plan id the next `prices.list` answer carries in its metadata. */
    planIdOnStripe: string;
};
type Ctx = {
    db: AppDb;
    client: PGlite;
    world: World;
    stripe: StripeProvider;
    /** A bare SDK over the same fake HTTP layer, to get real `Stripe.Subscription` objects. */
    sdk: Stripe;
    billing: SubscriptionBilling;
};
export declare const stripeArea: import("./engine.js").HostileArea<Ctx>;
export {};
//# sourceMappingURL=stripe.cases.d.ts.map