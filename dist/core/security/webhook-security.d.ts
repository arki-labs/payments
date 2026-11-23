import type { WebhookSecurityConfig } from '../services/webhook-security.js';
import { WebhookSecurityService } from '../services/webhook-security.js';
/**
 * Older import path for the webhook verifier. It re-exports `core/services/webhook-security`, so
 * there is one implementation of signature, timestamp and replay checks.
 */
export * from '../services/webhook-security.js';
/** Builds a `WebhookSecurityService`: the same as `WebhookSecurityService.create`, which returns `payments.configuration_invalid` for a bad config. */
export declare function createWebhookSecurityService(config: WebhookSecurityConfig): import("@arki/failure").Failure<"payments.configuration_invalid", {
    setting: string;
    problem: string;
}> | WebhookSecurityService;
//# sourceMappingURL=webhook-security.d.ts.map