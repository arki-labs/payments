import { metrics, SpanStatusCode, trace } from '@opentelemetry/api';
import { isFailure } from '@arki/failure';
const INSTRUMENTATION = '@arki/payments';
/**
 * Runs one payments operation inside a `payments.<operation>` span and counts it in
 * `payments.operations` by `operation` and `outcome` (`success`, `failure` for a returned
 * `@arki/failure` value, `error` for a throw). A returned failure also sets `payments.failure_code`.
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
            span.setAttribute('payments.failure_code', settled.code);
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