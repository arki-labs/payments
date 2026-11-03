import { z } from '@arki/contracts';
import { fromDate, now, toDate } from '@arki/date';
import { isFailure, unreachable, UnexpectedFailure } from '@arki/failure';
import { getLogger } from '@arki/log';
import { parse } from '@arki/schema';
import { PaymentsConfigurationInvalid } from '../../core/failures.js';
import { observePayments } from '../../core/telemetry.js';
import { NotificationChannelUnavailable, NotificationProviderRejected, NotificationProviderResponseInvalid, NotificationProviderTimeout, NotificationWebhookHostNotAllowed, tickFault, } from '../failures.js';
import { createDunningCommunicationRepository } from '../repository.js';
const logger = getLogger('arki:payments:dunning');
/** How long a provider call may take before it returns `NotificationProviderTimeout`. */
const DEFAULT_PROVIDER_TIMEOUT_MS = 30_000;
/** The most of a provider's body that is read. A documented Resend or Twilio answer is far smaller; the rest is cancelled. */
export const MAX_PROVIDER_BODY_BYTES = 64 * 1024;
/** The body's first {@link MAX_PROVIDER_BODY_BYTES} bytes as text. A longer body is cut there and the rest is cancelled. */
async function readCappedBody(response) {
    const stream = response.body;
    if (!stream)
        return '';
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let text = '';
    let bytes = 0;
    try {
        while (bytes < MAX_PROVIDER_BODY_BYTES) {
            const { done, value } = await reader.read();
            if (done)
                return text + decoder.decode();
            const room = MAX_PROVIDER_BODY_BYTES - bytes;
            const chunk = value.byteLength > room ? value.subarray(0, room) : value;
            bytes += chunk.byteLength;
            text += decoder.decode(chunk, { stream: true });
        }
        await reader.cancel();
        return text + decoder.decode();
    }
    finally {
        reader.releaseLock();
    }
}
/** Text that must be JSON; the value is then checked by the schema it is piped into. */
const jsonTextSchema = z.string().transform((text, context) => {
    try {
        const value = JSON.parse(text);
        return value;
    }
    catch {
        context.addIssue({ code: 'custom', message: 'The body is not JSON' });
        return z.NEVER;
    }
});
/** The error body Resend and Twilio both send: a `message`, among other fields. */
const providerErrorBodySchema = jsonTextSchema.pipe(z.looseObject({ message: z.string() }));
/** A date the provider sends as text; text that is not a date is refused. */
const providerDateSchema = z.string().pipe(z.coerce.date());
/**
 * One HTTP call to a provider under `timeoutMs`. With `body: 'read'` the body's first
 * {@link MAX_PROVIDER_BODY_BYTES} bytes are read; with `body: 'discard'` it is cancelled unread and
 * `body` is `''`. A call that does not finish in time returns `NotificationProviderTimeout`; a
 * provider that cannot be reached at all throws, with the network error as its cause.
 */
async function callProvider(target, url, init, timeoutMs, body = 'read') {
    const timeout = AbortSignal.timeout(timeoutMs);
    try {
        const response = await fetch(url, { ...init, signal: timeout });
        let text = '';
        if (body === 'read')
            text = await readCappedBody(response);
        else
            await response.body?.cancel();
        const reply = { status: response.status, ok: response.ok, body: text };
        return reply;
    }
    catch (error) {
        if (timeout.aborted)
            return NotificationProviderTimeout({ ...target, timeoutMs }, { cause: error });
        throw new Error(`The ${target.provider} request failed`, { cause: error });
    }
}
/** The provider's error status as `NotificationProviderRejected`, with its own error text when the body has one. */
function rejected(target, reply) {
    const detail = providerErrorBodySchema.safeParse(reply.body);
    return NotificationProviderRejected({
        ...target,
        upstreamStatus: reply.status,
        upstreamMessage: detail.success ? detail.data.message : null,
    });
}
/** A success body that is not the provider's documented shape; `cause` is the schema failure. */
function invalidBody(target, reply, cause) {
    return NotificationProviderResponseInvalid({ ...target, upstreamStatus: reply.status }, { cause });
}
/** Replaces each `{{key}}` with its personalization. */
function applyPersonalizations(template, personalizations) {
    let processed = template;
    for (const [key, value] of Object.entries(personalizations)) {
        processed = processed.replaceAll(`{{${key}}}`, value);
    }
    return processed;
}
/** The Resend send answer: the email id. */
const resendSentSchema = jsonTextSchema.pipe(z.looseObject({ id: z.string() }));
/** The Resend email record `getDeliveryStatus` reads. */
const resendEmailSchema = jsonTextSchema.pipe(z.looseObject({ last_event: z.string().nullish(), created_at: providerDateSchema }));
/**
 * Email communication provider with Resend integration. Each send runs in a
 * `payments.notification.send` span (channel and provider only).
 */
export class EmailProvider {
    config;
    channel = 'email';
    target = { channel: 'email', provider: 'resend' };
    constructor(config) {
        this.config = config;
    }
    get baseUrl() {
        return this.config.apiBaseUrl ?? 'https://api.resend.com';
    }
    get timeoutMs() {
        return this.config.timeoutMs ?? DEFAULT_PROVIDER_TIMEOUT_MS;
    }
    async send(request) {
        return observePayments('notification.send', this.target, async () => {
            const processedContent = applyPersonalizations(request.content, request.personalizations);
            const processedSubject = request.subject
                ? applyPersonalizations(request.subject, request.personalizations)
                : 'Payment Notice';
            const reply = await callProvider(this.target, `${this.baseUrl}/emails`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: `${this.config.fromName} <${this.config.fromEmail}>`,
                    to: [request.recipient],
                    subject: processedSubject,
                    html: processedContent,
                    tags: [
                        { name: 'category', value: 'dunning' },
                        { name: 'campaign_id', value: request.trackingData?.['campaignId']?.toString() || '' },
                    ],
                }),
            }, this.timeoutMs);
            if (isFailure(reply))
                return reply;
            if (!reply.ok)
                return rejected(this.target, reply);
            const data = parse(resendSentSchema, reply.body);
            if (isFailure(data))
                return invalidBody(this.target, reply, data);
            const sent = {
                messageId: data.id,
                providerResponse: {
                    provider: 'resend',
                    timestamp: now().toString(),
                    recipient: request.recipient,
                    resendId: data.id,
                },
            };
            return sent;
        });
    }
    async validateConfiguration() {
        try {
            // Test API key by making a test call to Resend
            const response = await fetch(`${this.baseUrl}/domains`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${this.config.apiKey}` },
                signal: AbortSignal.timeout(this.timeoutMs),
            });
            return response.ok && !!this.config.fromEmail;
        }
        catch {
            return false;
        }
    }
    async getDeliveryStatus(messageId) {
        return observePayments('notification.delivery_status', this.target, async () => {
            const reply = await callProvider(this.target, `${this.baseUrl}/emails/${encodeURIComponent(messageId)}`, { headers: { Authorization: `Bearer ${this.config.apiKey}` } }, this.timeoutMs);
            if (isFailure(reply))
                return reply;
            if (!reply.ok)
                return rejected(this.target, reply);
            const data = parse(resendEmailSchema, reply.body);
            if (isFailure(data))
                return invalidBody(this.target, reply, data);
            const status = {
                status: data.last_event === 'delivered' ? 'delivered' : 'sent',
                timestamp: fromDate(data.created_at),
                metadata: { ...data, created_at: data.created_at.toISOString() },
            };
            return status;
        });
    }
}
/** The Twilio message answer: its sid, and status and uri when Twilio sends them. */
const twilioMessageSchema = jsonTextSchema.pipe(z.looseObject({
    sid: z.string(),
    status: z.string().nullish(),
    uri: z.string().nullish(),
    date_created: providerDateSchema.nullish(),
    date_updated: providerDateSchema.nullish(),
    error_code: z.union([z.number(), z.string()]).nullish(),
    error_message: z.string().nullish(),
}));
/**
 * SMS communication provider with Twilio integration. Each send runs in a
 * `payments.notification.send` span (channel and provider only).
 */
export class SMSProvider {
    config;
    channel = 'sms';
    target = { channel: 'sms', provider: 'twilio' };
    constructor(config) {
        this.config = config;
    }
    get accountUrl() {
        return `${this.config.apiBaseUrl ?? 'https://api.twilio.com'}/2010-04-01/Accounts/${this.config.accountSid}`;
    }
    get timeoutMs() {
        return this.config.timeoutMs ?? DEFAULT_PROVIDER_TIMEOUT_MS;
    }
    get authorization() {
        return `Basic ${btoa(`${this.config.accountSid}:${this.config.authToken}`)}`;
    }
    async send(request) {
        return observePayments('notification.send', this.target, async () => {
            const processedContent = applyPersonalizations(request.content, request.personalizations);
            // Truncate SMS content to 160 characters for standard SMS
            const smsContent = processedContent.length > 160 ? processedContent.slice(0, 157) + '...' : processedContent;
            const reply = await callProvider(this.target, `${this.accountUrl}/Messages.json`, {
                method: 'POST',
                headers: {
                    Authorization: this.authorization,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    From: this.config.fromNumber,
                    To: request.recipient,
                    Body: smsContent,
                    StatusCallback: '', // Would be webhook URL for status updates
                }),
            }, this.timeoutMs);
            if (isFailure(reply))
                return reply;
            if (!reply.ok)
                return rejected(this.target, reply);
            const data = parse(twilioMessageSchema, reply.body);
            if (isFailure(data))
                return invalidBody(this.target, reply, data);
            const sent = {
                messageId: data.sid,
                providerResponse: {
                    provider: 'twilio',
                    timestamp: now().toString(),
                    recipient: request.recipient,
                    twilioSid: data.sid,
                    status: data.status,
                    uri: data.uri,
                },
            };
            return sent;
        });
    }
    async validateConfiguration() {
        try {
            // Test Twilio credentials by fetching account info
            const response = await fetch(`${this.accountUrl}.json`, {
                method: 'GET',
                headers: { Authorization: this.authorization },
                signal: AbortSignal.timeout(this.timeoutMs),
            });
            return response.ok && !!this.config.fromNumber;
        }
        catch {
            return false;
        }
    }
    async getDeliveryStatus(messageId) {
        return observePayments('notification.delivery_status', this.target, async () => {
            const reply = await callProvider(this.target, `${this.accountUrl}/Messages/${encodeURIComponent(messageId)}.json`, { headers: { Authorization: this.authorization } }, this.timeoutMs);
            if (isFailure(reply))
                return reply;
            if (!reply.ok)
                return rejected(this.target, reply);
            const data = parse(twilioMessageSchema, reply.body);
            if (isFailure(data))
                return invalidBody(this.target, reply, data);
            // Map Twilio status to our status
            let status = 'sent';
            if (data.status === 'delivered')
                status = 'delivered';
            else if (data.status === 'failed' || data.status === 'undelivered')
                status = 'failed';
            const delivery = {
                status,
                timestamp: fromDate(data.date_updated ?? data.date_created ?? new Date()),
                metadata: {
                    twilioStatus: data.status,
                    errorCode: data.error_code,
                    errorMessage: data.error_message,
                },
            };
            return delivery;
        });
    }
}
/** In-app notifications, stored through the app's {@link InAppNotificationStore}. */
export class InAppProvider {
    config;
    channel = 'in_app';
    target = { channel: 'in_app', provider: 'in_app' };
    constructor(config) {
        this.config = config;
    }
    async send(request) {
        const title = request.subject
            ? applyPersonalizations(request.subject, request.personalizations)
            : 'Payment Notice';
        const stored = await this.config.store.save({
            recipient: request.recipient,
            title,
            content: applyPersonalizations(request.content, request.personalizations),
            trackingData: request.trackingData ?? {},
        });
        return {
            messageId: stored.id,
            providerResponse: {
                provider: 'in_app',
                timestamp: stored.createdAt.toString(),
                notificationId: stored.id,
                appUrl: `${this.config.appUrl}/notifications/${stored.id}`,
            },
        };
    }
    async validateConfiguration() {
        return URL.canParse(this.config.appUrl);
    }
    /**
     * What the store holds: `opened` once the customer read it, else `delivered` (stored is shown).
     * A notification the store does not have is `NotificationProviderRejected` with status 404.
     */
    async getDeliveryStatus(messageId) {
        const stored = await this.config.store.find(messageId);
        if (!stored) {
            return NotificationProviderRejected({ ...this.target, upstreamStatus: 404, upstreamMessage: null });
        }
        const status = {
            status: stored.readAt ? 'opened' : 'delivered',
            timestamp: stored.readAt ?? stored.createdAt,
            metadata: { messageId, readAt: stored.readAt?.toString() ?? null },
        };
        return status;
    }
}
/** A webhook recipient: an http or https URL. */
const webhookUrlSchema = z.url({ protocol: /^https?$/ });
/** The JSON object a webhook step's content may hold; other content is sent as `{ message }`. */
const webhookPayloadSchema = jsonTextSchema.pipe(z.record(z.string(), z.unknown()));
/** A metadata object inside a webhook payload; anything else is replaced. */
const payloadMetadataSchema = z.record(z.string(), z.unknown());
/** An `allowedHosts` entry: a bare hostname, the way URL parsing writes it (no scheme, port or path). */
const allowedHostSchema = z
    .string()
    .refine(host => URL.canParse(`http://${host}`) && new URL(`http://${host}`).hostname === host.toLowerCase(), {
    message: 'must be a bare hostname such as hooks.example.com',
});
/**
 * Webhook communication provider for external integrations. The URL comes from customer metadata,
 * so a send reaches only a host on the operator's `allowedHosts` list, and the reply's body is
 * never read or kept: only its HTTP status. Each send runs in a `payments.notification.send` span
 * (channel and provider only, never the URL).
 */
export class WebhookProvider {
    config;
    channel = 'webhook';
    target = { channel: 'webhook', provider: 'webhook' };
    allowedHosts;
    /** Throws `payments.configuration_invalid` for an empty `allowedHosts` or an entry that is not a bare hostname. */
    constructor(config) {
        this.config = config;
        if (config.allowedHosts.length === 0) {
            throw new UnexpectedFailure(PaymentsConfigurationInvalid({
                setting: 'webhook.allowedHosts',
                problem: 'the webhook channel is enabled with no allowed hosts',
            }));
        }
        for (const host of config.allowedHosts) {
            if (!allowedHostSchema.safeParse(host).success) {
                throw new UnexpectedFailure(PaymentsConfigurationInvalid({
                    setting: 'webhook.allowedHosts',
                    problem: `${JSON.stringify(host)} is not a bare hostname`,
                }));
            }
        }
        this.allowedHosts = new Set(config.allowedHosts.map(host => host.toLowerCase()));
    }
    async send(request) {
        return observePayments('notification.send', this.target, async () => {
            // For webhook communications, the recipient is the webhook URL (stored customer metadata)
            const webhookUrl = parse(webhookUrlSchema, request.recipient);
            if (isFailure(webhookUrl))
                return webhookUrl;
            const host = new URL(webhookUrl).hostname.toLowerCase();
            if (!this.allowedHosts.has(host))
                return NotificationWebhookHostNotAllowed({ host });
            // Process template variables in content (webhook payload)
            const processedContent = applyPersonalizations(request.content, request.personalizations);
            // Content that is a JSON object is the payload; any other content is sent as text
            const parsed = webhookPayloadSchema.safeParse(processedContent);
            const payload = parsed.success ? parsed.data : { message: processedContent };
            const metadata = payloadMetadataSchema.safeParse(payload['metadata']);
            // Add metadata to payload
            payload['metadata'] = {
                ...(metadata.success ? metadata.data : {}),
                ...request.trackingData,
                timestamp: now().toString(),
            };
            const messageId = `webhook_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
            const reply = await callProvider(this.target, webhookUrl, {
                method: 'POST',
                // A redirect is answered as it is, never followed: an allowed host must not lead to one that is not
                redirect: 'manual',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Strophie-Dunning/1.0',
                    ...this.config.defaultHeaders,
                },
                body: JSON.stringify(payload),
            }, this.config.timeoutMs, 
            // The receiver is not a provider we know: its reply body is never read or kept, only its status
            'discard');
            if (isFailure(reply))
                return reply;
            if (!reply.ok) {
                return NotificationProviderRejected({ ...this.target, upstreamStatus: reply.status, upstreamMessage: null });
            }
            const sent = {
                messageId,
                providerResponse: {
                    provider: 'webhook',
                    timestamp: now().toString(),
                    recipient: webhookUrl,
                    status: reply.status,
                },
            };
            return sent;
        });
    }
    async validateConfiguration() {
        // The allowed hosts were checked when the provider was built; each URL is checked per request
        return this.config.timeoutMs > 0;
    }
}
/**
 * Main communication orchestration service
 * Manages multiple communication providers and handles delivery orchestration
 */
export class CommunicationOrchestrationService {
    providers = new Map();
    communicationRepo;
    constructor(db, tables) {
        this.communicationRepo = createDunningCommunicationRepository(db, tables);
    }
    /**
     * Register a communication provider
     */
    registerProvider(provider) {
        this.providers.set(provider.channel, provider);
    }
    /**
     * Send communication for a dunning execution. Returns the communication row marked `sent`, or the
     * provider's failure (refused, timed out, unreadable answer, invalid recipient) after the row is
     * marked `failed` with that failure's message. A channel with no provider registered returns
     * `NotificationChannelUnavailable` and writes nothing. A provider that cannot be reached throws,
     * after the row is marked `failed`.
     */
    async sendCommunication(execution, template, customer, personalizations = {}) {
        const provider = this.providers.get(template.communication.channel);
        if (!provider) {
            return NotificationChannelUnavailable({ channel: template.communication.channel });
        }
        // Determine recipient based on channel
        const recipient = this.getRecipient(customer, template.communication.channel);
        // Create communication record
        const communication = await this.communicationRepo.create({
            executionId: execution.id,
            customerId: execution.customerId,
            templateId: template.id,
            channel: template.communication.channel,
            recipient,
            subject: template.communication.subject ?? null,
            content: template.communication.content,
            status: 'pending',
        });
        try {
            // Send the communication
            const result = await provider.send({
                recipient,
                subject: template.communication.subject,
                content: template.communication.content,
                template: template.communication,
                personalizations: {
                    ...this.getDefaultPersonalizations(customer),
                    ...personalizations,
                },
                trackingData: {
                    executionId: execution.id,
                    campaignId: execution.campaignId,
                    customerId: execution.customerId,
                },
            });
            if (isFailure(result)) {
                await this.communicationRepo.updateStatus(communication.id, 'failed', { failureReason: result.message });
                return result;
            }
            const sent = await this.communicationRepo.updateStatus(communication.id, 'sent', {
                sentAt: now(),
                providerMessageId: result.messageId,
                providerResponse: result.providerResponse,
            });
            return sent ?? communication;
        }
        catch (error) {
            // Update communication status on error
            await this.communicationRepo.updateStatus(communication.id, 'failed', {
                failureReason: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    /**
     * Get recipient address based on customer and channel
     */
    getRecipient(customer, channel) {
        switch (channel) {
            case 'email': {
                return customer.email || '';
            }
            case 'sms': {
                return customer.phone || metadataText(customer.metadata?.['phone']);
            }
            case 'in_app': {
                return customer.id;
            } // Use customer ID instead of userId which doesn't exist
            case 'webhook': {
                return metadataText(customer.metadata?.['webhookUrl']);
            }
            default: {
                // The channel type is closed; a value outside it is a caller bug
                return unreachable(channel);
            }
        }
    }
    /**
     * Get default personalizations for a customer
     */
    getDefaultPersonalizations(customer) {
        return {
            customer_name: customer.name || 'Valued Customer',
            customer_email: customer.email || '',
            customer_id: customer.id,
            current_date: toDate(now()).toLocaleDateString(),
            company_name: 'Your Company', // Would come from configuration
        };
    }
    /**
     * Send the pending communications. Returns how many were handled and each one that was not sent:
     * a channel with no provider, a provider failure (the row is marked `failed`), or a thrown error.
     */
    async processPendingCommunications(limit = 100) {
        const pendingCommunications = await this.communicationRepo.findPendingCommunications(limit);
        const report = { processed: pendingCommunications.length, failed: [] };
        for (const communication of pendingCommunications) {
            try {
                const provider = this.providers.get(communication.channel);
                if (!provider) {
                    logger.error('No provider configured for channel', { channel: communication.channel });
                    report.failed.push(tickFault(communication.id, NotificationChannelUnavailable({ channel: communication.channel })));
                    continue;
                }
                // For pending communications, we need to get the customer and execution data
                // This is a simplified version - in practice you'd join with customer data
                const result = await provider.send({
                    recipient: communication.recipient,
                    subject: communication.subject ?? undefined,
                    content: communication.content,
                    template: {
                        channel: communication.channel,
                        content: communication.content,
                        subject: communication.subject ?? undefined,
                        variables: [],
                    },
                    personalizations: {}, // Would be filled from customer data
                });
                if (isFailure(result)) {
                    logger.warn('Communication {communicationId} was not sent: {code}', {
                        communicationId: communication.id,
                        code: result.code,
                    });
                    report.failed.push(tickFault(communication.id, result));
                    await this.communicationRepo.updateStatus(communication.id, 'failed', { failureReason: result.message });
                }
                else {
                    await this.communicationRepo.updateStatus(communication.id, 'sent', {
                        sentAt: now(),
                        providerMessageId: result.messageId,
                        providerResponse: result.providerResponse,
                    });
                }
            }
            catch (error) {
                logger.error('Failed to process communication', {
                    communicationId: communication.id,
                    error: error instanceof Error ? error.message : String(error),
                });
                report.failed.push(tickFault(communication.id, error));
                await this.communicationRepo.updateStatus(communication.id, 'failed', {
                    failureReason: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        return report;
    }
    /**
     * Handle communication status webhooks
     */
    async handleCommunicationWebhook(data) {
        const communication = await this.communicationRepo.findByProviderMessageId(data.providerMessageId);
        if (!communication) {
            logger.warn('Communication not found for provider message ID', { providerMessageId: data.providerMessageId });
            return;
        }
        const updates = {
            trackingData: {
                ...communication.trackingData,
                [data.event]: data.timestamp,
                ...(data.metadata && { metadata: data.metadata }),
            },
            updatedAt: now(),
        };
        switch (data.event) {
            case 'delivered': {
                updates.deliveredAt = data.timestamp;
                break;
            }
            case 'opened': {
                updates.openedAt = data.timestamp;
                break;
            }
            case 'clicked': {
                updates.clickedAt = data.timestamp;
                break;
            }
            case 'bounced': {
                updates.failureReason = 'Email bounced';
                break;
            }
        }
        await this.communicationRepo.updateStatus(communication.id, data.event === 'bounced' ? 'bounced' : communication.status, updates);
    }
    /**
     * Get communication by ID
     */
    async getCommunication(communicationId) {
        return this.communicationRepo.findById(communicationId);
    }
    /**
     * List communications with filtering
     */
    async listCommunications(query) {
        return this.communicationRepo.findMany(query);
    }
    /**
     * Update communication status manually
     */
    async updateCommunicationStatus(input) {
        const updates = { updatedAt: now() };
        if (input.sentAt)
            updates.sentAt = input.sentAt;
        if (input.deliveredAt)
            updates.deliveredAt = input.deliveredAt;
        if (input.openedAt)
            updates.openedAt = input.openedAt;
        if (input.clickedAt)
            updates.clickedAt = input.clickedAt;
        if (input.failureReason)
            updates.failureReason = input.failureReason;
        if (input.providerMessageId)
            updates.providerMessageId = input.providerMessageId;
        if (input.providerResponse)
            updates.providerResponse = input.providerResponse;
        if (input.trackingData)
            updates.trackingData = input.trackingData;
        return this.communicationRepo.updateStatus(input.communicationId, input.status, updates);
    }
    /**
     * Get communication metrics for an execution
     */
    async getCommunicationMetrics(executionId) {
        return this.communicationRepo.getMetricsForExecution(executionId);
    }
    /**
     * Validate all registered providers
     */
    async validateProviders() {
        // Only the channels with a registered provider have an entry
        const results = {};
        for (const [channel, provider] of this.providers) {
            try {
                results[channel] = await provider.validateConfiguration();
            }
            catch (error) {
                logger.error('Provider validation failed', {
                    channel,
                    error: error instanceof Error ? error.message : String(error),
                });
                results[channel] = false;
            }
        }
        return results;
    }
    /**
     * Get delivery status for a communication: `null` when the communication, its provider message id,
     * or a provider that reports status is missing; the provider's failure when it refuses, times out
     * or answers in another shape. A provider that cannot be reached throws.
     */
    async getDeliveryStatus(communicationId) {
        const communication = await this.communicationRepo.findById(communicationId);
        if (!communication || !communication.providerMessageId) {
            return null;
        }
        const provider = this.providers.get(communication.channel);
        if (!provider || !provider.getDeliveryStatus) {
            return null;
        }
        return provider.getDeliveryStatus(communication.providerMessageId);
    }
    /** Put the failed communications back to pending and send them again: the report of that send. */
    async retryFailedCommunications(limit = 50) {
        const failedCommunications = await this.communicationRepo.findMany({
            limit,
            offset: 0,
            status: 'failed',
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
        const resetFaults = [];
        for (const communication of failedCommunications) {
            try {
                // Reset status to pending for retry
                await this.communicationRepo.updateStatus(communication.id, 'pending');
            }
            catch (error) {
                logger.error('Failed to retry communication', {
                    communicationId: communication.id,
                    error: error instanceof Error ? error.message : String(error),
                });
                resetFaults.push(tickFault(communication.id, error));
            }
        }
        // Process the retried communications
        const sent = await this.processPendingCommunications(limit);
        return { processed: sent.processed, failed: [...resetFaults, ...sent.failed] };
    }
}
/** Text stored in customer metadata, or `''` when the key holds no text. */
function metadataText(value) {
    const text = z.string().safeParse(value);
    return text.success ? text.data : '';
}
/**
 * Factory function to create CommunicationOrchestrationService.
 *
 * Apps inject channel-provider config rather than the package reading
 * `env` directly — preserves the @arki/payments package as
 * config-injectable and env-agnostic.
 */
export function createCommunicationOrchestrationService(db, tables, config = {}) {
    const service = new CommunicationOrchestrationService(db, tables);
    if (config.email) {
        service.registerProvider(new EmailProvider({
            apiKey: config.email.apiKey,
            fromEmail: config.email.fromEmail,
            fromName: config.email.fromName ?? 'Payments',
            timeoutMs: config.email.timeoutMs,
        }));
    }
    if (config.sms) {
        service.registerProvider(new SMSProvider({
            accountSid: config.sms.accountSid,
            authToken: config.sms.authToken,
            fromNumber: config.sms.fromNumber,
            timeoutMs: config.sms.timeoutMs,
        }));
    }
    if (config.inApp) {
        service.registerProvider(new InAppProvider({ appUrl: config.inApp.appUrl, store: config.inApp.store }));
    }
    if (config.webhook) {
        service.registerProvider(new WebhookProvider({
            allowedHosts: config.webhook.allowedHosts,
            defaultHeaders: config.webhook.defaultHeaders ?? {
                'X-Source': config.webhook.sourceHeader ?? 'dunning-system',
            },
            timeoutMs: config.webhook.timeoutMs ?? DEFAULT_PROVIDER_TIMEOUT_MS,
        }));
    }
    return service;
}
//# sourceMappingURL=communication-service.js.map