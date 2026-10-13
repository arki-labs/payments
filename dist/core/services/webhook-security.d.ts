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
export declare class WebhookSecurityService {
    private processedEvents;
    private readonly config;
    constructor(config: WebhookSecurityConfig);
    validateWebhook(provider: PaymentProviderType, payload: string | Buffer, signature: string, timestamp: string, sourceIp: string, webhookSecret: string, options?: WebhookValidationOptions): Promise<WebhookValidationResult>;
    private isIpAllowed;
    private isIpInCidrRange;
    private ipToInt;
    private validateTimestamp;
    private generateEventId;
    private isEventProcessed;
    private markEventAsProcessed;
    private cleanupOldEvents;
    private validateSignature;
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