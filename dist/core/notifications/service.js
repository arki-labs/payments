import { z } from '@arki/contracts';
import { now } from '@arki/date';
import { isFailure } from '@arki/failure';
import { is } from '@arki/schema';
import { refundAmountOf } from '../../refunds/repository.js';
import { NotificationFailed, PaymentsConfigurationInvalid } from '../failures.js';
import { fetchUrlSchema } from '../fetch-url.js';
import { MAX_BATCH_ITEMS, pgTextSchema } from '../pg-values.js';
import { ReferenceNotFound } from '../providers/provider-error.js';
import { observePayments } from '../telemetry.js';
const emailConfigSchema = z.object({
    adminEmails: z.array(z.email()).min(1).max(MAX_BATCH_ITEMS),
    supportEmail: z.email(),
    send: z.custom(value => typeof value === 'function', 'send must be a function'),
    reads: z.object({
        findPaymentById: z.custom(value => typeof value === 'function', 'reads.findPaymentById must be a function'),
        findCustomerById: z.custom(value => typeof value === 'function', 'reads.findCustomerById must be a function'),
    }),
});
/** `payments.configuration_invalid` for `setting` when `config` does not match `schema` (the problem lists each bad field), else `undefined`. */
function notificationConfigProblem(config, schema, setting) {
    const checked = schema.safeParse(config);
    if (checked.success)
        return;
    return PaymentsConfigurationInvalid({
        setting,
        problem: checked.error.issues.map(issue => `${issue.path.join('.') || '(config)'}: ${issue.message}`).join('; '),
    });
}
/** Refund notifications by mail, sent through the transport the app passes in. */
export class EmailNotificationService {
    config;
    constructor(config) {
        this.config = config;
    }
    /** Builds the service. Returns `payments.configuration_invalid` for a config without a transport, reads, an admin address or a valid support address. */
    static create(config) {
        const problem = notificationConfigProblem(config, emailConfigSchema, 'notifications.email');
        return problem ?? new EmailNotificationService(config);
    }
    async sendRefundApprovalRequest(refund) {
        return this.mail('refund_approval_request', {
            to: this.config.adminEmails,
            subject: `Refund Request Pending Approval - ${refund.id}`,
            text: [
                `Refund ${refund.id} is waiting for approval.`,
                `Amount: ${refundAmountOf(refund).toString()}`,
                `Reason: ${refund.reason}`,
                `Customer note: ${refund.customerNote || 'None'}`,
            ].join('\n'),
        });
    }
    /** Mails the customer of the refund's payment. `ReferenceNotFound` when the payment or its customer is gone. */
    async sendRefundStatusUpdate(refund, status) {
        // No stored row holds an id with U+0000, and Postgres refuses it as a parameter (SQLSTATE 22021): not found, without a query
        const payment = is(refund.paymentId, pgTextSchema)
            ? await this.config.reads.findPaymentById(refund.paymentId)
            : null;
        if (!payment)
            return ReferenceNotFound({ kind: 'payment', id: refund.paymentId, missing: 'row' });
        const customer = await this.config.reads.findCustomerById(payment.customerId);
        if (!customer)
            return ReferenceNotFound({ kind: 'customer', id: payment.customerId, missing: 'row' });
        return this.mail('refund_status_update', {
            to: [customer.email],
            subject: `Refund ${status.toUpperCase()} - ${refund.id}`,
            text: [`Your refund ${refund.id} is ${status}.`, `Amount: ${refundAmountOf(refund).toString()}`].join('\n'),
        });
    }
    async sendRefundFailureAlert(refund, error) {
        return this.mail('refund_failure_alert', {
            to: [this.config.supportEmail],
            subject: `URGENT: Refund Processing Failed - ${refund.id}`,
            text: [
                `Refund ${refund.id} failed.`,
                `Amount: ${refundAmountOf(refund).toString()}`,
                `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                `Failed at: ${now().toString()}`,
            ].join('\n'),
        });
    }
    async mail(notification, mail) {
        return observePayments('notification', { 'payments.channel': 'email', 'payments.notification': notification }, async () => {
            const sent = await this.config.send(mail);
            if (isFailure(sent))
                return NotificationFailed({ channel: 'email', notification }, { cause: sent });
            return;
        });
    }
}
const slackConfigSchema = z.object({
    webhookUrl: fetchUrlSchema,
    adminChannel: z.string().min(1),
    supportChannel: z.string().min(1),
    adminUrl: z.url(),
    timeoutMs: z.number().int().positive().optional(),
});
/** Refund notifications posted to a Slack incoming webhook. */
export class SlackNotificationService {
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Builds the service. Returns `payments.configuration_invalid` for a config without a valid webhook
     * URL (an http(s) URL with no user name or password, on a port the Fetch standard does not block),
     * channels or admin URL.
     */
    static create(config) {
        const problem = notificationConfigProblem(config, slackConfigSchema, 'notifications.slack');
        return problem ?? new SlackNotificationService(config);
    }
    async sendRefundApprovalRequest(refund) {
        return this.post('refund_approval_request', {
            channel: this.config.adminChannel,
            text: `🔄 New refund request requires approval`,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Refund ID:* ${refund.id}\n*Amount:* ${refundAmountOf(refund).toString()}\n*Reason:* ${refund.reason}\n*Customer Note:* ${refund.customerNote || 'None'}`,
                    },
                },
                {
                    type: 'actions',
                    elements: [
                        {
                            type: 'button',
                            text: { type: 'plain_text', text: 'Approve' },
                            style: 'primary',
                            url: `${this.config.adminUrl}/refunds/${refund.id}/approve`,
                        },
                        {
                            type: 'button',
                            text: { type: 'plain_text', text: 'Reject' },
                            style: 'danger',
                            url: `${this.config.adminUrl}/refunds/${refund.id}/reject`,
                        },
                    ],
                },
            ],
        });
    }
    /** Posts the new status to the admin channel. */
    async sendRefundStatusUpdate(refund, status) {
        const emoji = status === 'completed' ? '✅' : status === 'rejected' ? '❌' : '⏳';
        return this.post('refund_status_update', {
            channel: this.config.adminChannel,
            text: `${emoji} Refund ${refund.id} ${status}`,
        });
    }
    async sendRefundFailureAlert(refund, error) {
        return this.post('refund_failure_alert', {
            channel: this.config.supportChannel,
            text: `🚨 URGENT: Refund processing failed`,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Refund ID:* ${refund.id}\n*Amount:* ${refundAmountOf(refund).toString()}\n*Error:* ${error instanceof Error ? error.message : 'Unknown error'}\n*Failed At:* ${now().toString()}`,
                    },
                },
            ],
        });
    }
    /** POSTs `message` as JSON. A non-2xx answer, a network error or the timeout returns `NotificationFailed`. */
    async post(notification, message) {
        return observePayments('notification', { 'payments.channel': 'slack', 'payments.notification': notification }, async () => {
            let response;
            try {
                response = await fetch(this.config.webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(message),
                    signal: AbortSignal.timeout(this.config.timeoutMs ?? 10_000),
                });
                // Free the connection; Slack answers a short `ok` we do not need. A body that already
                // errored (a reset, or the timeout firing after the headers) rejects here: the same failure.
                await response.body?.cancel();
            }
            catch (error) {
                // Unreachable host, refused connection or the timeout: the message did not go out
                return NotificationFailed({ channel: 'slack', notification }, { cause: error });
            }
            if (!response.ok)
                return NotificationFailed({ channel: 'slack', notification, status: response.status });
            return;
        });
    }
}
/**
 * Sends every notification on each channel. Every channel is tried; the first failure is returned.
 */
export class MultiChannelNotificationService {
    services;
    constructor(services) {
        this.services = services;
    }
    async sendRefundApprovalRequest(refund) {
        const results = await Promise.all(this.services.map(async (service) => service.sendRefundApprovalRequest?.(refund)));
        return results.find(result => isFailure(result));
    }
    async sendRefundStatusUpdate(refund, status) {
        const results = await Promise.all(this.services.map(async (service) => service.sendRefundStatusUpdate?.(refund, status)));
        return results.find(result => isFailure(result));
    }
    async sendRefundFailureAlert(refund, error) {
        const results = await Promise.all(this.services.map(async (service) => service.sendRefundFailureAlert?.(refund, error)));
        return results.find(result => isFailure(result));
    }
}
const multiConfigSchema = z
    .object({ email: z.unknown().optional(), slack: z.unknown().optional() })
    .refine(config => config.email !== undefined || config.slack !== undefined, 'multi needs email, slack or both');
/**
 * Builds the notification service a config names. Returns `payments.configuration_invalid` for a config that
 * cannot send: no transport, no webhook URL, a bad address, or a `multi` with no channel.
 *
 * @example
 * const notifications = createNotificationService({
 *   type: 'email',
 *   email: {
 *     adminEmails: ['admin@example.com'],
 *     supportEmail: 'support@example.com',
 *     send: mail => mailer.sendRaw(mail),
 *     reads: paymentRepository,
 *   },
 * });
 */
export function createNotificationService(config) {
    switch (config.type) {
        case 'email': {
            return EmailNotificationService.create(config.email);
        }
        case 'slack': {
            return SlackNotificationService.create(config.slack);
        }
        case 'multi': {
            const problem = notificationConfigProblem(config, multiConfigSchema, 'notifications.multi');
            if (problem)
                return problem;
            const services = [];
            if (config.email) {
                const email = EmailNotificationService.create(config.email);
                if (isFailure(email))
                    return email;
                services.push(email);
            }
            if (config.slack) {
                const slack = SlackNotificationService.create(config.slack);
                if (isFailure(slack))
                    return slack;
                services.push(slack);
            }
            return new MultiChannelNotificationService(services);
        }
    }
}
//# sourceMappingURL=service.js.map