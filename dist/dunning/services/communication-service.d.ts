import type { Instant } from '@arki/date';
import type { ListCommunicationsQuery, UpdateCommunicationStatusInput } from '../contracts.js';
import type { DunningTickReport, NotificationProviderFailure } from '../failures.js';
import type { CommunicationStatus as CommStatus, CommunicationChannel, DunningCommunicationId, DunningExecutionId } from '../primitives.js';
import type { DunningDatabase } from '../repository.js';
import type { DunningTables } from '../tables.js';
import type { CommunicationTemplate, CustomerData, DunningCommunication, DunningExecution, DunningTemplate } from '../types.js';
/**
 * Interface for communication providers (email, SMS, etc.). `send` and `getDeliveryStatus` return a
 * `NotificationProviderFailure` for an answer the caller must handle (a refusal, a timeout, a body
 * that is not the documented shape, a recipient that is not valid for the channel) and throw only
 * when the provider cannot be reached at all.
 */
export type CommunicationProvider = {
    readonly channel: CommunicationChannel;
    send(communication: CommunicationRequest): Promise<CommunicationSent | NotificationProviderFailure>;
    validateConfiguration(): Promise<boolean>;
    getDeliveryStatus?(messageId: string): Promise<CommunicationDeliveryStatus | NotificationProviderFailure>;
};
export type CommunicationRequest = {
    recipient: string;
    subject?: string;
    content: string;
    template: CommunicationTemplate;
    personalizations: Record<string, string>;
    trackingData?: Record<string, unknown>;
};
/** A message the provider accepted: its id at the provider and what the provider answered. */
export type CommunicationSent = {
    messageId: string;
    providerResponse: Record<string, unknown>;
};
export type CommunicationDeliveryStatus = {
    status: CommStatus;
    timestamp: Instant;
    metadata?: Record<string, unknown>;
};
/** The most of a provider's body that is read. A documented Resend or Twilio answer is far smaller; the rest is cancelled. */
export declare const MAX_PROVIDER_BODY_BYTES: number;
/**
 * Email communication provider with Resend integration. Each send runs in a
 * `payments.notification.send` span (channel and provider only).
 */
export declare class EmailProvider implements CommunicationProvider {
    private config;
    readonly channel: 'email';
    private readonly target;
    constructor(config: {
        apiKey: string;
        fromEmail: string;
        fromName: string;
        /** How long one Resend call may take. Default 30 000 ms. */
        timeoutMs?: number;
        /** The Resend API origin. Default `https://api.resend.com`. */
        apiBaseUrl?: string;
    });
    private get baseUrl();
    private get timeoutMs();
    send(request: CommunicationRequest): Promise<CommunicationSent | import("@arki/failure").Failure<"payments.notification_provider_rejected", {
        channel: "email" | "in_app" | "sms" | "webhook";
        provider: string;
        upstreamStatus: number;
        upstreamMessage: string | null;
    }> | import("@arki/failure").Failure<"payments.notification_provider_response_invalid", {
        channel: "email" | "in_app" | "sms" | "webhook";
        provider: string;
        upstreamStatus: number;
    }> | import("@arki/failure").Failure<"payments.notification_provider_timeout", {
        channel: "email" | "in_app" | "sms" | "webhook";
        provider: string;
        timeoutMs: number;
    }>>;
    validateConfiguration(): Promise<boolean>;
    getDeliveryStatus(messageId: string): Promise<CommunicationDeliveryStatus | import("@arki/failure").Failure<"payments.notification_provider_rejected", {
        channel: "email" | "in_app" | "sms" | "webhook";
        provider: string;
        upstreamStatus: number;
        upstreamMessage: string | null;
    }> | import("@arki/failure").Failure<"payments.notification_provider_response_invalid", {
        channel: "email" | "in_app" | "sms" | "webhook";
        provider: string;
        upstreamStatus: number;
    }> | import("@arki/failure").Failure<"payments.notification_provider_timeout", {
        channel: "email" | "in_app" | "sms" | "webhook";
        provider: string;
        timeoutMs: number;
    }>>;
}
/**
 * SMS communication provider with Twilio integration. Each send runs in a
 * `payments.notification.send` span (channel and provider only).
 */
export declare class SMSProvider implements CommunicationProvider {
    private config;
    readonly channel: 'sms';
    private readonly target;
    constructor(config: {
        accountSid: string;
        authToken: string;
        fromNumber: string;
        /** How long one Twilio call may take. Default 30 000 ms. */
        timeoutMs?: number;
        /** The Twilio API origin. Default `https://api.twilio.com`. */
        apiBaseUrl?: string;
    });
    private get accountUrl();
    private get timeoutMs();
    private get authorization();
    send(request: CommunicationRequest): Promise<CommunicationSent | import("@arki/failure").Failure<"payments.notification_provider_rejected", {
        channel: "email" | "in_app" | "sms" | "webhook";
        provider: string;
        upstreamStatus: number;
        upstreamMessage: string | null;
    }> | import("@arki/failure").Failure<"payments.notification_provider_response_invalid", {
        channel: "email" | "in_app" | "sms" | "webhook";
        provider: string;
        upstreamStatus: number;
    }> | import("@arki/failure").Failure<"payments.notification_provider_timeout", {
        channel: "email" | "in_app" | "sms" | "webhook";
        provider: string;
        timeoutMs: number;
    }>>;
    validateConfiguration(): Promise<boolean>;
    getDeliveryStatus(messageId: string): Promise<CommunicationDeliveryStatus | import("@arki/failure").Failure<"payments.notification_provider_rejected", {
        channel: "email" | "in_app" | "sms" | "webhook";
        provider: string;
        upstreamStatus: number;
        upstreamMessage: string | null;
    }> | import("@arki/failure").Failure<"payments.notification_provider_response_invalid", {
        channel: "email" | "in_app" | "sms" | "webhook";
        provider: string;
        upstreamStatus: number;
    }> | import("@arki/failure").Failure<"payments.notification_provider_timeout", {
        channel: "email" | "in_app" | "sms" | "webhook";
        provider: string;
        timeoutMs: number;
    }>>;
}
/** One in-app notification, as the in-app channel hands it to the app's store. */
export type InAppNotification = {
    /** The customer id the notification is for. */
    recipient: string;
    title: string;
    content: string;
    /** The execution, campaign and customer the notification belongs to. */
    trackingData: Record<string, unknown>;
};
/** What the app's store holds about one in-app notification: when it was stored, and when the customer read it. */
export type StoredInAppNotification = {
    id: string;
    createdAt: Instant;
    readAt: Instant | null;
};
/**
 * Where the app keeps in-app notifications. The package has no notifications table: the app owns it
 * and shows the notifications in its UI. `save` stores one and returns its row; `find` reads one back
 * (or `null` when the app has no notification with that id).
 */
export type InAppNotificationStore = {
    save(notification: InAppNotification): Promise<StoredInAppNotification>;
    find(id: string): Promise<StoredInAppNotification | null>;
};
/** In-app notifications, stored through the app's {@link InAppNotificationStore}. */
export declare class InAppProvider implements CommunicationProvider {
    private config;
    readonly channel: 'in_app';
    private readonly target;
    constructor(config: {
        appUrl: string;
        store: InAppNotificationStore;
    });
    send(request: CommunicationRequest): Promise<CommunicationSent>;
    validateConfiguration(): Promise<boolean>;
    /**
     * What the store holds: `opened` once the customer read it, else `delivered` (stored is shown).
     * A notification the store does not have is `NotificationProviderRejected` with status 404.
     */
    getDeliveryStatus(messageId: string): Promise<CommunicationDeliveryStatus | import("@arki/failure").Failure<"payments.notification_provider_rejected", {
        channel: "email" | "in_app" | "sms" | "webhook";
        provider: string;
        upstreamStatus: number;
        upstreamMessage: string | null;
    }>>;
}
/**
 * Webhook communication provider for external integrations. The URL comes from customer metadata,
 * so a send reaches only a host on the operator's `allowedHosts` list, and the reply's body is
 * never read or kept: only its HTTP status. Each send runs in a `payments.notification.send` span
 * (channel and provider only, never the URL).
 */
export declare class WebhookProvider implements CommunicationProvider {
    private config;
    readonly channel: 'webhook';
    private readonly target;
    private readonly allowedHosts;
    /** Throws `payments.configuration_invalid` for an empty `allowedHosts` or an entry that is not a bare hostname. */
    constructor(config: {
        /** The hostnames a webhook may reach, compared exactly (lowercased) with the URL's host. Never empty. */
        allowedHosts: readonly string[];
        defaultHeaders: Record<string, string>;
        /** How long one webhook call may take. */
        timeoutMs: number;
    });
    send(request: CommunicationRequest): Promise<CommunicationSent | import("@arki/failure").Failure<"payments.notification_provider_rejected", {
        channel: "email" | "in_app" | "sms" | "webhook";
        provider: string;
        upstreamStatus: number;
        upstreamMessage: string | null;
    }> | import("@arki/failure").Failure<"payments.notification_provider_timeout", {
        channel: "email" | "in_app" | "sms" | "webhook";
        provider: string;
        timeoutMs: number;
    }> | import("@arki/failure").Failure<"payments.notification_webhook_host_not_allowed", {
        host: string;
    }> | import("@arki/failure").Failure<"schema.async_required", undefined> | import("@arki/failure").Failure<"schema.invalid_input", {
        issues: readonly import("@standard-schema/spec").StandardSchemaV1.Issue[];
    }> | import("@arki/failure").Failure<"schema.validator_defect", undefined>>;
    validateConfiguration(): Promise<boolean>;
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
     * Send communication for a dunning execution. Returns the communication row marked `sent`, or the
     * provider's failure (refused, timed out, unreadable answer, invalid recipient) after the row is
     * marked `failed` with that failure's message. A channel with no provider registered returns
     * `NotificationChannelUnavailable` and writes nothing. A provider that cannot be reached throws,
     * after the row is marked `failed`.
     */
    sendCommunication(execution: DunningExecution, template: DunningTemplate, customer: CustomerData, personalizations?: Record<string, string>): Promise<import("@arki/failure").Failure<"payments.notification_channel_unavailable", {
        channel: "email" | "in_app" | "sms" | "webhook";
    }> | {
        channel: "email" | "in_app" | "sms" | "webhook";
        clickedAt: import("temporal-spec").Temporal.Instant | null;
        content: string;
        createdAt: import("temporal-spec").Temporal.Instant;
        customerId: `cust${string}`;
        deliveredAt: import("temporal-spec").Temporal.Instant | null;
        executionId: `de${string}`;
        failureReason: string | null;
        id: `dcm${string}`;
        metadata: Record<string, unknown> | null;
        openedAt: import("temporal-spec").Temporal.Instant | null;
        providerMessageId: string | null;
        providerResponse: Record<string, unknown> | null;
        recipient: string;
        sentAt: import("temporal-spec").Temporal.Instant | null;
        status: "bounced" | "clicked" | "delivered" | "failed" | "opened" | "pending" | "sent";
        subject: string | null;
        templateId: `dt${string}`;
        trackingData: Record<string, unknown> | null;
        updatedAt: import("temporal-spec").Temporal.Instant;
    } | NotificationProviderFailure>;
    /**
     * Get recipient address based on customer and channel
     */
    private getRecipient;
    /**
     * Get default personalizations for a customer
     */
    private getDefaultPersonalizations;
    /**
     * Send the pending communications. Returns how many were handled and each one that was not sent:
     * a channel with no provider, a provider failure (the row is marked `failed`), or a thrown error.
     */
    processPendingCommunications(limit?: number): Promise<DunningTickReport>;
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
    validateProviders(): Promise<Partial<Record<CommunicationChannel, boolean>>>;
    /**
     * Get delivery status for a communication: `null` when the communication, its provider message id,
     * or a provider that reports status is missing; the provider's failure when it refuses, times out
     * or answers in another shape. A provider that cannot be reached throws.
     */
    getDeliveryStatus(communicationId: DunningCommunicationId): Promise<CommunicationDeliveryStatus | NotificationProviderFailure | null>;
    /** Put the failed communications back to pending and send them again: the report of that send. */
    retryFailedCommunications(limit?: number): Promise<DunningTickReport>;
}
export type CommunicationOrchestrationConfig = {
    email?: {
        apiKey: string;
        fromEmail: string;
        fromName?: string;
        /** How long one Resend call may take. Default 30 000 ms. */
        timeoutMs?: number;
    };
    sms?: {
        accountSid: string;
        authToken: string;
        fromNumber: string;
        /** How long one Twilio call may take. Default 30 000 ms. */
        timeoutMs?: number;
    };
    inApp?: {
        appUrl: string;
        /** Where the app keeps in-app notifications: the channel stores through it and reads delivery status back. */
        store: InAppNotificationStore;
    };
    /** The webhook channel. Omit it to leave the channel off. */
    webhook?: {
        /** The hostnames a customer's `webhookUrl` may point at. Required and never empty: an empty list fails at boot. */
        allowedHosts: readonly string[];
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