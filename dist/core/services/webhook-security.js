import { createHash, timingSafeEqual } from 'node:crypto';
import { isBefore, now, sub } from '@arki/date';
export class WebhookSecurityService {
    processedEvents = new Map();
    config;
    constructor(config) {
        this.config = config;
        // Clean up old processed events every hour
        setInterval(() => {
            this.cleanupOldEvents();
        }, 60 * 60 * 1000);
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
            // 2. Timestamp validation (prevent replay attacks)
            if (!options.skipTimestampValidation) {
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
                const signatureValidation = this.validateSignature(provider, payload, signature, timestamp, webhookSecret);
                if (!signatureValidation.isValid) {
                    return signatureValidation;
                }
            }
            // 5. Payload sanitization
            const sanitizedPayload = this.sanitizePayload(payload);
            // Mark event as processed
            this.markEventAsProcessed(eventId);
            return {
                isValid: true,
                provider,
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
            const mask = (0xff_ff_ff_ff << (32 - Number.parseInt(prefixLength, 10))) >>> 0;
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
            const webhookTime = Number.parseInt(timestamp, 10) * 1000;
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
    cleanupOldEvents() {
        const cutoffTime = sub(now(), { seconds: this.config.replayWindowSeconds * 2 });
        for (const [eventId, processedAt] of this.processedEvents) {
            if (isBefore(processedAt, cutoffTime)) {
                this.processedEvents.delete(eventId);
            }
        }
    }
    validateSignature(provider, payload, signature, timestamp, webhookSecret) {
        try {
            switch (provider) {
                case 'stripe': {
                    return this.validateStripeSignature(payload, signature, timestamp, webhookSecret);
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
    validateStripeSignature(payload, signature, _timestamp, secret) {
        try {
            const elements = signature.split(',');
            const signatureMap = new Map();
            for (const element of elements) {
                const [key, value] = element.split('=');
                if (key && value) {
                    signatureMap.set(key, value);
                }
            }
            const expectedSignature = signatureMap.get('v1');
            const receivedTimestamp = signatureMap.get('t');
            if (!expectedSignature || !receivedTimestamp) {
                return {
                    isValid: false,
                    provider: 'stripe',
                    error: 'Invalid signature format',
                };
            }
            const payloadStr = typeof payload === 'string' ? payload : payload.toString();
            const signedPayload = `${receivedTimestamp}.${payloadStr}`;
            const computedSignature = createHash('sha256')
                .update(signedPayload, 'utf8')
                .update(secret, 'utf8')
                .digest('hex');
            const isValid = timingSafeEqual(Buffer.from(expectedSignature, 'hex'), Buffer.from(computedSignature, 'hex'));
            return {
                isValid,
                provider: 'stripe',
                error: isValid ? undefined : 'Signature verification failed',
            };
        }
        catch (error) {
            return {
                isValid: false,
                provider: 'stripe',
                error: `Stripe signature validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }
    validatePayPalSignature(payload, signature, secret) {
        try {
            const payloadStr = typeof payload === 'string' ? payload : payload.toString();
            const computedSignature = createHash('sha256').update(payloadStr + secret).digest('hex');
            const isValid = timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature));
            return {
                isValid,
                provider: 'paypal',
                error: isValid ? undefined : 'PayPal signature verification failed',
            };
        }
        catch (error) {
            return {
                isValid: false,
                provider: 'paypal',
                error: `PayPal signature validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }
    validateSquareSignature(payload, signature, secret) {
        try {
            const payloadStr = typeof payload === 'string' ? payload : payload.toString();
            const computedSignature = createHash('sha256').update(secret + payloadStr).digest('hex');
            const isValid = timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature));
            return {
                isValid,
                provider: 'square',
                error: isValid ? undefined : 'Square signature verification failed',
            };
        }
        catch (error) {
            return {
                isValid: false,
                provider: 'square',
                error: `Square signature validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }
    sanitizePayload(payload) {
        try {
            const payloadStr = typeof payload === 'string' ? payload : payload.toString();
            const parsed = JSON.parse(payloadStr);
            const sanitized = this.deepSanitize(parsed);
            return typeof sanitized === 'object' && sanitized !== null && !Array.isArray(sanitized)
                ? sanitized
                : {};
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