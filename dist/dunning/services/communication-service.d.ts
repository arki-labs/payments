import type { Instant } from '@arki/date';
import type { ListCommunicationsQuery, UpdateCommunicationStatusInput } from '../contracts.js';
import type { CommunicationStatus as CommStatus, CommunicationChannel, DunningCommunicationId, DunningExecutionId } from '../primitives.js';
import type { DunningDatabase } from '../repository.js';
import type { DunningTables } from '../tables.js';
import type { CommunicationTemplate, CustomerData, DunningCommunication, DunningExecution, DunningTemplate } from '../types.js';
/**
 * Interface for communication providers (email, SMS, etc.)
 */
export type CommunicationProvider = {
    readonly channel: CommunicationChannel;
    send(communication: CommunicationRequest): Promise<CommunicationResult>;
    validateConfiguration(): Promise<boolean>;
    getDeliveryStatus?(messageId: string): Promise<CommunicationDeliveryStatus>;
};
export type CommunicationRequest = {
    recipient: string;
    subject?: string;
    content: string;
    template: CommunicationTemplate;
    personalizations: Record<string, string>;
    trackingData?: Record<string, unknown>;
};
export type CommunicationResult = {
    success: boolean;
    messageId?: string;
    errorMessage?: string;
    providerResponse?: Record<string, unknown>;
};
export type CommunicationDeliveryStatus = {
    status: CommStatus;
    timestamp: Instant;
    metadata?: Record<string, unknown>;
};
/**
 * Email communication provider with Resend integration
 */
export declare class EmailProvider implements CommunicationProvider {
    private config;
    readonly channel: 'email';
    constructor(config: {
        apiKey: string;
        fromEmail: string;
        fromName: string;
    });
    send(request: CommunicationRequest): Promise<CommunicationResult>;
    validateConfiguration(): Promise<boolean>;
    getDeliveryStatus(messageId: string): Promise<CommunicationDeliveryStatus>;
    private processTemplate;
}
/**
 * SMS communication provider with Twilio integration
 */
export declare class SMSProvider implements CommunicationProvider {
    private config;
    readonly channel: 'sms';
    constructor(config: {
        accountSid: string;
        authToken: string;
        fromNumber: string;
    });
    send(request: CommunicationRequest): Promise<CommunicationResult>;
    validateConfiguration(): Promise<boolean>;
    getDeliveryStatus(messageId: string): Promise<CommunicationDeliveryStatus>;
    private processTemplate;
}
/**
 * In-app notification provider with database storage
 */
export declare class InAppProvider implements CommunicationProvider {
    private config;
    private db;
    readonly channel: 'in_app';
    constructor(config: {
        appUrl: string;
    }, db: DunningDatabase);
    send(request: CommunicationRequest): Promise<CommunicationResult>;
    validateConfiguration(): Promise<boolean>;
    getDeliveryStatus(messageId: string): Promise<CommunicationDeliveryStatus>;
    private processTemplate;
}
/**
 * Webhook communication provider for external integrations
 */
export declare class WebhookProvider implements CommunicationProvider {
    private config;
    readonly channel: 'webhook';
    constructor(config: {
        defaultHeaders: Record<string, string>;
        timeout: number;
    });
    send(request: CommunicationRequest): Promise<CommunicationResult>;
    validateConfiguration(): Promise<boolean>;
    private processTemplate;
}
/**
 * Main communication orchestration service
 * Manages multiple communication providers and handles delivery orchestration
 */
export declare class CommunicationOrchestrationService {
    private providers;
    private communicationRepo;
    constructor(db: DunningDatabase, tables: Pick<DunningTables, 'dunningCommunications'>);
    /**
     * Register a communication provider
     */
    registerProvider(provider: CommunicationProvider): void;
    /**
     * Send communication for a dunning execution
     */
    sendCommunication(execution: DunningExecution, template: DunningTemplate, customer: CustomerData, personalizations?: Record<string, string>): Promise<DunningCommunication>;
    /**
     * Get recipient address based on customer and channel
     */
    private getRecipient;
    /**
     * Get default personalizations for a customer
     */
    private getDefaultPersonalizations;
    /**
     * Process pending communications
     */
    processPendingCommunications(limit?: number): Promise<void>;
    /**
     * Handle communication status webhooks
     */
    handleCommunicationWebhook(data: {
        providerMessageId: string;
        event: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained';
        timestamp: Instant;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    /**
     * Get communication by ID
     */
    getCommunication(communicationId: DunningCommunicationId): Promise<DunningCommunication | null>;
    /**
     * List communications with filtering
     */
    listCommunications(query: ListCommunicationsQuery): Promise<DunningCommunication[]>;
    /**
     * Update communication status manually
     */
    updateCommunicationStatus(input: UpdateCommunicationStatusInput): Promise<DunningCommunication | null>;
    /**
     * Get communication metrics for an execution
     */
    getCommunicationMetrics(executionId: DunningExecutionId): Promise<{
        total: number;
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        failed: number;
    } | undefined>;
    /**
     * Validate all registered providers
     */
    validateProviders(): Promise<Record<CommunicationChannel, boolean>>;
    /**
     * Get delivery status for a communication
     */
    getDeliveryStatus(communicationId: DunningCommunicationId): Promise<CommunicationDeliveryStatus | null>;
    /**
     * Retry failed communications
     */
    retryFailedCommunications(limit?: number): Promise<void>;
}
export type CommunicationOrchestrationConfig = {
    email?: {
        apiKey: string;
        fromEmail: string;
        fromName?: string;
    };
    sms?: {
        accountSid: string;
        authToken: string;
        fromNumber: string;
    };
    inApp?: {
        appUrl: string;
    };
    webhook?: {
        defaultHeaders?: Record<string, string>;
        timeoutMs?: number;
        sourceHeader?: string;
    };
};
/**
 * Factory function to create CommunicationOrchestrationService.
 *
 * Apps inject channel-provider config rather than the package reading
 * `env` directly — preserves the @arki/payments package as
 * config-injectable and env-agnostic.
 */
export declare function createCommunicationOrchestrationService(db: DunningDatabase, tables: Pick<DunningTables, 'dunningCommunications'>, config?: CommunicationOrchestrationConfig): CommunicationOrchestrationService;
//# sourceMappingURL=communication-service.d.ts.map