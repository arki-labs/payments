import { z } from '@arki/contracts';
import type { PaymentProviderType } from '../types.js';
/**
 * The verifier's settings. `allowedIps` holds addresses and CIDR ranges (`'203.0.113.10'`,
 * `'173.0.80.0/20'`, `'2001:db8::/32'`); a malformed entry is refused when the service is built, so
 * it can never let an address through. `replayWindowSeconds` is whole seconds from 1 to one day: it
 * is both the timestamp window and Stripe's signature tolerance. `maxRetries` is a whole number of 0 or more.
 * `allowedIps` holds at most `MAX_BATCH_ITEMS` (1,000) entries.
 */
declare const webhookSecurityConfigSchema: z.ZodObject<{
    allowedIps: z.ZodArray<z.ZodUnion<readonly [z.ZodIPv4, z.ZodIPv6, z.ZodCIDRv4, z.ZodCIDRv6]>>;
    replayWindowSeconds: z.ZodNumber;
    maxRetries: z.ZodNumber;
}, z.core.$strip>;
export type WebhookSecurityConfig = z.output<typeof webhookSecurityConfigSchema>;
export type WebhookValidationOptions = {
    skipIpValidation?: boolean;
    skipTimestampValidation?: boolean;
    skipSignatureValidation?: boolean;
};
/**
 * Checks a webhook delivery's source address, timestamp, replay and signature.
 *
 * `validateWebhook` returns `WebhookRejected` (`payments.webhook_rejected`) for every refusal, with
 * `check` naming the check that refused it: `source_ip`, `timestamp`, `replay` or `signature`. It
 * never throws for a delivery.
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
    private readonly allowLists;
    private lastCleanupAt;
    private constructor();
    /** Builds the verifier. Returns `payments.configuration_invalid` for a config that breaks `WebhookSecurityConfig`'s rules. */
    static create(config: WebhookSecurityConfig): import("@arki/failure").Failure<"payments.configuration_invalid", {
        setting: string;
        problem: string;
    }> | WebhookSecurityService;
    validateWebhook(provider: PaymentProviderType, payload: string | Buffer, signature: string, timestamp: string, sourceIp: string, webhookSecret: string, options?: WebhookValidationOptions): Promise<import("@arki/failure").Failure<"payments.webhook_rejected", {
        check: "replay" | "signature" | "source_ip" | "timestamp";
        reason: string;
        retryable: false;
    }> | {
        provider: "paypal" | "razorpay" | "revenuecat" | "square" | "stripe";
        eventType: "customer.created" | "customer.deleted" | "customer.updated" | "invoice.created" | "invoice.finalized" | "invoice.paid" | "invoice.payment_failed" | "payment.dispute_created" | "payment.failed" | "payment.refunded" | "payment.requires_action" | "payment.succeeded" | "refund.updated" | "subscription.canceled" | "subscription.created" | "subscription.trial_will_end" | "subscription.updated" | undefined;
        data: Record<string, unknown>;
    }>;
    /** Whether the source is an address on the provider's allow list. Text that is not an IP address is not. */
    private isIpAllowed;
    /** Why the caller's timestamp is refused, or `undefined` when it is inside the window. */
    private validateTimestamp;
    private generateEventId;
    private isEventProcessed;
    private markEventAsProcessed;
    private cleanupIfDue;
    private cleanupOldEvents;
    /** Why the signature is refused, or `undefined` when it matches. */
    private validateSignature;
    /** Stripe signs its own timestamp (`t=`), so the window is checked on that, not on the caller's value. */
    private validateStripeSignature;
    private sanitizePayload;
    private deepSanitize;
    getProcessedEventCount(): number;
    clearProcessedEvents(): void;
    isHealthy(): boolean;
}
export {};
//# sourceMappingURL=webhook-security.d.ts.map