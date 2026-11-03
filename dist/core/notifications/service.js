import { z } from '@arki/contracts';
import { now } from '@arki/date';
import { isFailure } from '@arki/failure';
import { refundAmountOf } from '../../refunds/repository.js';
import { misconfigured, NotificationFailed } from '../failures.js';
import { ReferenceNotFound } from '../providers/provider-error.js';
import { observePayments } from '../telemetry.js';
const emailConfigSchema = z.object({
    adminEmails: z.array(z.email()).min(1),
    supportEmail: z.email(),
    send: z.custom(value => typeof value === 'function', 'send must be a function'),
    reads: z.object({
        findPaymentById: z.custom(value => typeof value === 'function', 'reads.findPaymentById must be a function'),
        findCustomerById: z.custom(value => typeof value === 'function', 'reads.findCustomerById must be a function'),
    }),
});
/** Throws `payments.configuration_invalid` for `setting` when `config` does not match `schema`; the problem lists each bad field. */
function checkNotificationConfig(config, schema, setting) {
    const checked = schema.safeParse(config);
    if (checked.success)
        return;
    throw misconfigured(setting, checked.error.issues.map(issue => `${issue.path.join('.') || '(config)'}: ${issue.message}`).join('; '));
}
/** Refund notifications by mail, sent through the transport the app passes in. */
export class EmailNotificationService {
    config;
    /** Throws `payments.configuration_invalid` for a config without a transport, reads, an admin address or a valid support address. */
    constructor(config) {
        checkNotificationConfig(config, emailConfigSchema, 'notifications.email');
        this.config = config;
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
        const payment = await this.config.reads.findPaymentById(refund.paymentId);
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
    webhookUrl: z.url({ protocol: /^https?$/ }),
    adminChannel: z.string().min(1),
    supportChannel: z.string().min(1),
    adminUrl: z.url(),
    timeoutMs: z.number().int().positive().optional(),
});
/** Refund notifications posted to a Slack incoming webhook. */
export class SlackNotificationService {
    config;
    /** Throws `payments.configuration_invalid` for a config without a valid webhook URL, channels or admin URL. */
    constructor(config) {
        checkNotificationConfig(config, slackConfigSchema, 'notifications.slack');
        this.config = config;
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
            }
            catch (error) {
                // Unreachable host, refused connection or the timeout: the message did not go out
                return NotificationFailed({ channel: 'slack', notification }, { cause: error });
            }
            // Free the connection; Slack answers a short `ok` we do not need
            await response.body?.cancel();
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
 * Builds the notification service a config names. Throws `payments.configuration_invalid` at boot for a config that
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
            return new EmailNotificationService(config.email);
        }
        case 'slack': {
            return new SlackNotificationService(config.slack);
        }
        case 'multi': {
            checkNotificationConfig(config, multiConfigSchema, 'notifications.multi');
            const services = [];
            if (config.email)
                services.push(new EmailNotificationService(config.email));
            if (config.slack)
                services.push(new SlackNotificationService(config.slack));
            return new MultiChannelNotificationService(services);
        }
    }
}
//# sourceMappingURL=service.js.map