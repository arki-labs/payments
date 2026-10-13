import type { Instant } from '@arki/date';
import type { PaymentProviderType } from '../types.js';
export type WebhookSecurityValidationResult = {
    isValid: boolean;
    sanitizedPayload?: unknown;
    provider: PaymentProviderType;
    timestamp: Instant;
};
export declare class WebhookSecurityError extends Error {
    code: WebhookSecurityErrorCode;
    details?: Record<string, unknown> | undefined;
    constructor(message: string, code: WebhookSecurityErrorCode, details?: Record<string, unknown> | undefined);
}
export type WebhookSecurityErrorCode = 'INVALID_IP' | 'TIMESTAMP_INVALID' | 'REPLAY_ATTACK' | 'INVALID_SIGNATURE' | 'INVALID_PAYLOAD';
export declare class WebhookSecurityService {
    private readonly allowedIpRanges;
    private readonly replayCache;
    private readonly maxTimestampAge;
    private signatureVerifiers;
    constructor();
    private initializeVerifiers;
    /**
     * Comprehensive webhook validation with multiple security layers
     */
    validateWebhook(provider: PaymentProviderType, payload: string | Buffer, signature: string, timestamp: string, sourceIp: string): Promise<WebhookSecurityValidationResult>;
    private validateSourceIp;
    private ipInRange;
    private ipToBinary;
    private validateTimestamp;
    private isReplayAttack;
    private generateRequestId;
    private sanitizePayload;
    private deepSanitize;
    private cleanupReplayCache;
    private startCleanupInterval;
    /**
     * Verify webhook event authenticity with provider
     */
    verifyWithProvider(provider: PaymentProviderType, _eventId: string): Promise<boolean>;
    /**
     * Rate limiting for webhook endpoints
     */
    checkRateLimit(sourceIp: string, provider: PaymentProviderType): Promise<boolean>;
    private rateLimitCounts;
    private getRateLimitCount;
    private incrementRateLimitCount;
    /**
     * Log security events for audit trail
     */
    logSecurityEvent(event: {
        type: WebhookSecurityErrorCode | 'SUCCESS';
        provider: PaymentProviderType;
        sourceIp: string;
        timestamp: Instant;
        details?: Record<string, unknown>;
    }): Promise<void>;
    /**
     * Get security metrics for monitoring
     */
    getSecurityMetrics(): {
        replayCacheSize: number;
        rateLimitedIps: number;
        activeProviders: number;
    };
}
export declare function createWebhookSecurityService(): WebhookSecurityService;
//# sourceMappingURL=webhook-security.d.ts.map