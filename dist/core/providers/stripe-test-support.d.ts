import Stripe from 'stripe';
import { StripeProvider } from './stripe-provider.js';
/** One request the Stripe SDK sent, as Stripe would have received it. */
export type RecordedStripeRequest = {
    method: string;
    /** Path after the host, such as `/v1/subscriptions/sub_1`. */
    path: string;
    /** The form body, with Stripe's bracket keys such as `items[0][price]`. */
    form: Record<string, string>;
    headers: Record<string, string>;
};
type FakeAnswer = {
    status?: number;
    body: unknown;
};
/**
 * A Stripe HTTP layer that never opens a socket. Every request is recorded and answered by `respond`.
 * Pass `client` as `httpClient` to `StripeProvider` (or `new Stripe`).
 */
export declare function createFakeStripeHttp(respond: (request: RecordedStripeRequest) => FakeAnswer): {
    client: Stripe.HttpClient;
    requests: RecordedStripeRequest[];
};
/**
 * A `StripeProvider` for a test: `StripeProvider.create` with the config failure thrown, since a test
 * that builds a provider with a good setting must get one.
 */
export declare function stripeProviderOf(...args: Parameters<typeof StripeProvider.create>): StripeProvider;
/**
 * Amounts Stripe can send that are not a `Money`, each with the exact `@arki/money` code a read returns:
 * `[code, what, Stripe currency, Stripe amount]`. Stripe's JSON types an amount as an integer, but the SDK
 * passes on whatever the JSON holds, so text is in the list too. `money.rounding_necessary`,
 * `money.invalid_shape`, `money.unsupported_locale` and `money.invalid_rate` cannot come from a read.
 */
export declare const STRIPE_READ_AMOUNT_CASES: readonly [readonly ['money.unknown_currency', 'a currency outside ISO 4217', 'zzz', 1500], readonly ['money.provider_amount', 'a currency Stripe has no amount rule for (KWD: 3 decimals)', 'kwd', 1000], readonly ['money.provider_amount', 'units off the Stripe rule (ISK: whole kronur in two decimals)', 'isk', 150], readonly ['money.out_of_range', 'a fraction of a Stripe unit (5.5 JPY)', 'jpy', 5.5], readonly ['money.out_of_range', 'past 2^53 Stripe units', 'usd', 1e+21], readonly ['money.invalid_text', 'text that is not a whole number', 'usd', 'ten'], readonly ['money.input_too_large', 'text longer than 1,000 characters', 'usd', string]];
/**
 * The read cases, plus one only a read that fills a minor-unit column has: a Stripe amount within 2^53 that is
 * past 2^53 - 1 of our minor units (MGA is whole ariary at Stripe and 2 decimals in ISO 4217).
 */
export declare const STRIPE_STORED_AMOUNT_CASES: readonly [readonly ["money.unknown_currency", "a currency outside ISO 4217", "zzz", 1500], readonly ["money.provider_amount", "a currency Stripe has no amount rule for (KWD: 3 decimals)", "kwd", 1000], readonly ["money.provider_amount", "units off the Stripe rule (ISK: whole kronur in two decimals)", "isk", 150], readonly ["money.out_of_range", "a fraction of a Stripe unit (5.5 JPY)", "jpy", 5.5], readonly ["money.out_of_range", "past 2^53 Stripe units", "usd", 1e+21], readonly ["money.invalid_text", "text that is not a whole number", "usd", "ten"], readonly ["money.input_too_large", "text longer than 1,000 characters", "usd", string], readonly ["money.out_of_range", "past 2^53 - 1 minor units (MGA: one Stripe unit is 100 of ours)", "mga", number]];
export {};
//# sourceMappingURL=stripe-test-support.d.ts.map