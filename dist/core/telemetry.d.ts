/**
 * Spans and a counter for the payments boundaries: provider calls, webhook processing and
 * outbound notifications. Safe without an OpenTelemetry SDK: the API then does nothing, and
 * telemetry never changes a result or hides a failure.
 *
 * Attributes are bounded and safe: an operation name, a provider name, an event type and a
 * failure code. Never amounts, card data, customer ids, payloads or secrets.
 */
import type { Attributes } from '@opentelemetry/api';
/**
 * Runs one payments operation inside a `payments.<operation>` span and counts it in
 * `payments.operations` by `operation` and `outcome` (`success`, `failure` for a returned
 * `@arki/failure` value, `error` for a throw). A returned failure also sets `failure.code`. Its span status
 * is error only when it is a fault (`isFault`, status 500 or higher, such as a provider outage); a 4xx
 * such as a declined card is an answer, not a fault, so its status stays unset. A throw sets error.
 */
export declare function observePayments<T>(operation: string, attributes: Attributes, execute: () => Promise<T>): Promise<T>;
//# sourceMappingURL=telemetry.d.ts.map