import { WebhookSecurityService } from '../services/webhook-security.js';
/**
 * Older import path for the webhook verifier. It re-exports `core/services/webhook-security`, so
 * there is one implementation of signature, timestamp and replay checks.
 */
export * from '../services/webhook-security.js';
export function createWebhookSecurityService(config) {
    return new WebhookSecurityService(config);
}
//# sourceMappingURL=webhook-security.js.map