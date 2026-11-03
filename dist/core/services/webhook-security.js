import { createHash } from 'node:crypto';
import { isBefore, now, sub } from '@arki/date';
import { isFailure } from '@arki/failure';
import { WebhookMalformed, WebhookStale, stripe } from '@arki/http/webhooks';
import { is, recordSchema } from '@arki/schema';
import { mapStripeEventType } from '../providers/stripe-event-types.js';
/** A whole number of seconds since the epoch, as Stripe writes `t=`. */
const UNIX_SECONDS = /^\d+$/;
/** The messages this service has always returned, by `@arki/http/webhooks` code. */
function stripeFailure(code) {
    switch (code) {
        case WebhookMalformed.code: {
            return 'Invalid signature format';
        }
        case WebhookStale.code: {
            return 'Signature timestamp is outside the allowed window';
        }
        default: {
            return 'Signature verification failed';
        }
    }
}
/** How often, at most, deliveries older than twice the replay window are pruned from the replay set. */
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
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
export class WebhookSecurityService {
    processedEvents = new Map();
    config;
    lastCleanupAt = now();
    constructor(config) {
        this.config = config;
    }
    async validateWebhook(provider, payload, signature, timestamp, sourceIp, webhookSecret, options = {}) {
        try {
            // 1. IP Address validation
            if (!options.skipIpValidation && !this.isIpAllowed(sourceIp, provider)) {
                return {
                    isValid: false,
                    provider,
                    error: `Webhook from unauthorized IP address: ${sourceIp}`,
                };
            }
            // 2. Timestamp validation (prevent replay attacks). Stripe signs its own
            //    timestamp, which the signature check verifies; the caller's value is not trusted.
            if (!options.skipTimestampValidation && provider !== 'stripe') {
                const timestampValidation = this.validateTimestamp(timestamp);
                if (!timestampValidation.isValid) {
                    return {
                        isValid: false,
                        provider,
                        error: timestampValidation.error,
                    };
                }
            }
            // 3. Replay attack prevention
            this.cleanupIfDue();
            const eventId = this.generateEventId(payload, signature, timestamp);
            if (this.isEventProcessed(eventId)) {
                return {
                    isValid: false,
                    provider,
                    error: 'Webhook event has already been processed (replay attack detected)',
                };
            }
            // 4. Signature verification
            if (!options.skipSignatureValidation) {
                const signatureValidation = await this.validateSignature(provider, payload, signature, webhookSecret);
                if (!signatureValidation.isValid) {
                    return signatureValidation;
                }
            }
            // 5. Payload sanitization
            const sanitizedPayload = this.sanitizePayload(payload);
            // Mark event as processed
            this.markEventAsProcessed(eventId);
            const eventType = provider === 'stripe' && typeof sanitizedPayload['type'] === 'string'
                ? (mapStripeEventType(sanitizedPayload['type']) ?? undefined)
                : undefined;
            return {
                isValid: true,
                provider,
                eventType,
                data: sanitizedPayload,
            };
        }
        catch (error) {
            return {
                isValid: false,
                provider,
                error: `Webhook validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }
    isIpAllowed(sourceIp, provider) {
        // Provider-specific IP allowlists
        const providerIpRanges = {
            stripe: [
                '54.187.174.169',
                '54.187.205.235',
                '54.187.216.72',
                '54.241.31.99',
                '54.241.31.102',
                '54.241.34.107',
                // Add more Stripe IPs as needed
            ],
            paypal: ['173.0.80.0/20', '173.0.96.0/20', '173.0.112.0/20'],
            square: ['52.21.213.172', '35.174.233.25'],
            razorpay: [],
            // RevenueCat authenticates webhooks via the Authorization header secret, not an IP allowlist.
            revenuecat: [],
        };
        const allowedIps = [...this.config.allowedIps, ...(providerIpRanges[provider] || [])];
        return allowedIps.some((allowedIp) => {
            if (allowedIp.includes('/')) {
                return this.isIpInCidrRange(sourceIp, allowedIp);
            }
            return sourceIp === allowedIp;
        });
    }
    isIpInCidrRange(ip, cidr) {
        // Simplified CIDR check - in production use a proper networking library
        try {
            const [network, prefixLength] = cidr.split('/');
            if (!network || !prefixLength) {
                return false;
            }
            const mask = (0xFF_FF_FF_FF << (32 - Number.parseInt(prefixLength, 10))) >>> 0;
            const ipInt = this.ipToInt(ip);
            const networkInt = this.ipToInt(network);
            return (ipInt & mask) === (networkInt & mask);
        }
        catch {
            return false;
        }
    }
    ipToInt(ip) {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + Number.parseInt(octet, 10), 0) >>> 0;
    }
    validateTimestamp(timestamp) {
        try {
            if (!UNIX_SECONDS.test(timestamp)) {
                return { isValid: false, error: 'Invalid timestamp format' };
            }
            const webhookTime = Number(timestamp) * 1000;
            const currentTime = Date.now();
            const timeDifference = Math.abs(currentTime - webhookTime);
            if (timeDifference > this.config.replayWindowSeconds * 1000) {
                return {
                    isValid: false,
                    error: `Webhook timestamp is outside acceptable window (${this.config.replayWindowSeconds}s)`,
                };
            }
            return { isValid: true };
        }
        catch {
            return {
                isValid: false,
                error: 'Invalid timestamp format',
            };
        }
    }
    generateEventId(payload, signature, timestamp) {
        const payloadStr = typeof payload === 'string' ? payload : payload.toString();
        const data = `${payloadStr}:${signature}:${timestamp}`;
        return createHash('sha256').update(data).digest('hex');
    }
    isEventProcessed(eventId) {
        return this.processedEvents.has(eventId);
    }
    markEventAsProcessed(eventId) {
        this.processedEvents.set(eventId, now());
    }
    cleanupIfDue() {
        if (isBefore(this.lastCleanupAt, sub(now(), { milliseconds: CLEANUP_INTERVAL_MS }))) {
            this.cleanupOldEvents();
        }
    }
    cleanupOldEvents() {
        this.lastCleanupAt = now();
        const cutoffTime = sub(now(), { seconds: this.config.replayWindowSeconds * 2 });
        for (const [eventId, processedAt] of this.processedEvents) {
            if (isBefore(processedAt, cutoffTime)) {
                this.processedEvents.delete(eventId);
            }
        }
    }
    async validateSignature(provider, payload, signature, webhookSecret) {
        // An HMAC keyed with an empty secret can be computed by anyone.
        if (!webhookSecret) {
            return { isValid: false, provider, error: 'Webhook secret is not configured' };
        }
        try {
            switch (provider) {
                case 'stripe': {
                    return await this.validateStripeSignature(payload, signature, webhookSecret);
                }
                case 'paypal': {
                    return this.validatePayPalSignature(payload, signature, webhookSecret);
                }
                case 'square': {
                    return this.validateSquareSignature(payload, signature, webhookSecret);
                }
                default: {
                    return {
                        isValid: false,
                        provider,
                        error: `Unsupported provider for signature validation: ${provider}`,
                    };
                }
            }
        }
        catch (error) {
            return {
                isValid: false,
                provider,
                error: `Signature validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }
    /** Stripe signs its own timestamp (`t=`), so the window is checked on that, not on the caller's value. */
    async validateStripeSignature(payload, signature, secret) {
        const body = typeof payload === 'string' ? new TextEncoder().encode(payload) : new Uint8Array(payload);
        const result = await stripe({ secrets: [secret] }).verify({ headers: new Headers({ 'stripe-signature': signature }), body }, { tolerance: this.config.replayWindowSeconds });
        if (isFailure(result)) {
            return { isValid: false, provider: 'stripe', error: stripeFailure(result.code) };
        }
        return { isValid: true, provider: 'stripe' };
    }
    validatePayPalSignature(_payload, _signature, _secret) {
        // PayPal verifies through its API with transmission headers this method does not receive.
        return { isValid: false, provider: 'paypal', error: 'PayPal signature verification is not implemented' };
    }
    validateSquareSignature(_payload, _signature, _secret) {
        // Square signs the notification URL plus the body, and this method does not receive the URL.
        return { isValid: false, provider: 'square', error: 'Square signature verification is not implemented' };
    }
    sanitizePayload(payload) {
        try {
            const payloadStr = typeof payload === 'string' ? payload : payload.toString();
            const parsed = JSON.parse(payloadStr);
            const sanitized = this.deepSanitize(parsed);
            return is(sanitized, recordSchema) ? sanitized : {};
        }
        catch {
            return {};
        }
    }
    deepSanitize(value) {
        if (value === null || typeof value !== 'object') {
            return value;
        }
        if (Array.isArray(value)) {
            return value.map((item) => this.deepSanitize(item));
        }
        const sanitized = {};
        const dangerousKeys = new Set(['__proto__', 'constructor', 'prototype']);
        for (const [key, v] of Object.entries(value)) {
            if (!dangerousKeys.has(key)) {
                sanitized[key] = this.deepSanitize(v);
            }
        }
        return sanitized;
    }
    // Public utility methods
    getProcessedEventCount() {
        return this.processedEvents.size;
    }
    clearProcessedEvents() {
        this.processedEvents.clear();
    }
    isHealthy() {
        try {
            this.cleanupOldEvents();
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=webhook-security.js.map