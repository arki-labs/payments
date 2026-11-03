import type { PaymentProviderType, WebhookValidationResult } from '../types.js';
export type WebhookSecurityConfig = {
    allowedIps: string[];
    replayWindowSeconds: number;
    maxRetries: number;
};
export type WebhookValidationOptions = {
    skipIpValidation?: boolean;
    skipTimestampValidation?: boolean;
    skipSignatureValidation?: boolean;
};
/**
 * Checks a webhook delivery's source address, timestamp, replay and signature.
 *
 * Limit: the replay set is in this process's memory only. It is empty after a restart and not shared
 * between instances, so it only catches a copy that reaches the same process within the window. The
 * webhook handler's database claim (`claimWebhookEvent`) is what keeps an event from running twice.
 *
 * It starts no timer: old entries are pruned during `validateWebhook`, at most once an hour, so the
 * service never keeps a process alive and needs no closing.
 */
export declare class WebhookSecurityService {
    private processedEvents;
    private readonly config;
    private lastCleanupAt;
    constructor(config: WebhookSecurityConfig);
    validateWebhook(provider: PaymentProviderType, payload: string | Buffer, signature: string, timestamp: string, sourceIp: string, webhookSecret: string, options?: WebhookValidationOptions): Promise<WebhookValidationResult>;
    private isIpAllowed;
    private isIpInCidrRange;
    private ipToInt;
    private validateTimestamp;
    private generateEventId;
    private isEventProcessed;
    private markEventAsProcessed;
    private cleanupIfDue;
    private cleanupOldEvents;
    private validateSignature;
    /** Stripe signs its own timestamp (`t=`), so the window is checked on that, not on the caller's value. */
    private validateStripeSignature;
    private validatePayPalSignature;
    private validateSquareSignature;
    private sanitizePayload;
    private deepSanitize;
    getProcessedEventCount(): number;
    clearProcessedEvents(): void;
    isHealthy(): boolean;
}
//# sourceMappingURL=webhook-security.d.ts.map