import { metrics, SpanStatusCode, trace } from '@opentelemetry/api';
import { isFailure, isFault } from '@arki/failure';
const INSTRUMENTATION = '@arki/payments';
/**
 * Runs one payments operation inside a `payments.<operation>` span and counts it in
 * `payments.operations` by `operation` and `outcome` (`success`, `failure` for a returned
 * `@arki/failure` value, `error` for a throw). A returned failure also sets `failure.code`. Its span status
 * is error only when it is a fault (`isFault`, status 500 or higher, such as a provider outage); a 4xx
 * such as a declined card is an answer, not a fault, so its status stays unset. A throw sets error.
 */
export async function observePayments(operation, attributes, execute) {
    const span = trace.getTracer(INSTRUMENTATION).startSpan(`payments.${operation}`, { attributes });
    let outcome = 'success';
    try {
        const result = await execute();
        // `T` is not known to be awaited, and `isFailure` refuses a promise type; the value here is settled.
        const settled = result;
        if (isFailure(settled)) {
            outcome = 'failure';
            span.setAttribute('failure.code', settled.code);
            if (isFault(settled))
                span.setStatus({ code: SpanStatusCode.ERROR });
        }
        return result;
    }
    catch (error) {
        outcome = 'error';
        span.recordException(error instanceof Error ? error : new Error(String(error)));
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw error;
    }
    finally {
        metrics.getMeter(INSTRUMENTATION).createCounter('payments.operations').add(1, { operation, outcome });
        span.end();
    }
}
//# sourceMappingURL=telemetry.js.map