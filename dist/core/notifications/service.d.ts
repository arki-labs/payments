/**
 * Refund notifications: an approval request to the admins, a status mail to the customer, and a
 * failure alert to support. Email goes through a transport the app passes in (payments sends no
 * mail of its own); Slack posts to an incoming-webhook URL. A send that did not go out returns
 * `NotificationFailed`; a misconfigured service throws when it is built, never on the first send.
 */
import type { Failure } from '@arki/failure';
import type { Refund } from '../../refunds/types.js';
import type { PaymentRepository } from '../repository.js';
/**
 * Sends refund notifications. Each method resolves with nothing when the notification went out,
 * or with an `@arki/failure` value when it did not. The refund itself never depends on it.
 */
export type NotificationService = {
    sendRefundApprovalRequest?(refund: Refund): Promise<void | Failure>;
    sendRefundStatusUpdate?(refund: Refund, status: string): Promise<void | Failure>;
    sendRefundFailureAlert?(refund: Refund, error: unknown): Promise<void | Failure>;
};
/** One plain-text mail. */
export type NotificationMail = {
    to: readonly string[];
    subject: string;
    text: string;
};
/**
 * Sends one mail through the app's own transport, such as `mailer.sendRaw` from `@arki/mail`.
 * Resolve with an `@arki/failure` value when the mail was not sent; any other value means sent.
 */
export type SendNotificationMail = (mail: NotificationMail) => Promise<unknown>;
export type EmailNotificationConfig = {
    /** Who gets the approval requests. At least one address. */
    adminEmails: readonly string[];
    /** Who gets the failure alerts. */
    supportEmail: string;
    /** The app's mail transport. Payments builds no mailer of its own. */
    send: SendNotificationMail;
    /** Finds the customer of a refund's payment, whose address gets the status mail. A `PaymentRepository` fits. */
    reads: Pick<PaymentRepository, 'findPaymentById' | 'findCustomerById'>;
};
/** Refund notifications by mail, sent through the transport the app passes in. */
export declare class EmailNotificationService implements NotificationService {
    private readonly config;
    /** Throws `payments.configuration_invalid` for a config without a transport, reads, an admin address or a valid support address. */
    constructor(config: EmailNotificationConfig);
    sendRefundApprovalRequest(refund: Refund): Promise<Failure<"payments.notification_failed", {
        channel: "email" | "slack";
        notification: "refund_approval_request" | "refund_failure_alert" | "refund_status_update";
        status?: number | undefined;
    }> | undefined>;
    /** Mails the customer of the refund's payment. `ReferenceNotFound` when the payment or its customer is gone. */
    sendRefundStatusUpdate(refund: Refund, status: string): Promise<Failure<"payments.notification_failed", {
        channel: "email" | "slack";
        notification: "refund_approval_request" | "refund_failure_alert" | "refund_status_update";
        status?: number | undefined;
    }> | Failure<"payments.reference_not_found", {
        kind: "customer" | "payment" | "plan" | "subscription";
        id: string;
        missing: "provider_id" | "row";
    }> | undefined>;
    sendRefundFailureAlert(refund: Refund, error: unknown): Promise<Failure<"payments.notification_failed", {
        channel: "email" | "slack";
        notification: "refund_approval_request" | "refund_failure_alert" | "refund_status_update";
        status?: number | undefined;
    }> | undefined>;
    private mail;
}
export type SlackNotificationConfig = {
    /** The Slack incoming-webhook URL. It is a secret: it is never logged. */
    webhookUrl: string;
    adminChannel: string;
    supportChannel: string;
    /** Base URL of the admin app; used to build action button links. */
    adminUrl: string;
    /** How long one post may take before it counts as failed. Default 10 seconds. */
    timeoutMs?: number;
};
/** Refund notifications posted to a Slack incoming webhook. */
export declare class SlackNotificationService implements NotificationService {
    private readonly config;
    /** Throws `payments.configuration_invalid` for a config without a valid webhook URL, channels or admin URL. */
    constructor(config: SlackNotificationConfig);
    sendRefundApprovalRequest(refund: Refund): Promise<Failure<"payments.notification_failed", {
        channel: "email" | "slack";
        notification: "refund_approval_request" | "refund_failure_alert" | "refund_status_update";
        status?: number | undefined;
    }> | undefined>;
    /** Posts the new status to the admin channel. */
    sendRefundStatusUpdate(refund: Refund, status: string): Promise<Failure<"payments.notification_failed", {
        channel: "email" | "slack";
        notification: "refund_approval_request" | "refund_failure_alert" | "refund_status_update";
        status?: number | undefined;
    }> | undefined>;
    sendRefundFailureAlert(refund: Refund, error: unknown): Promise<Failure<"payments.notification_failed", {
        channel: "email" | "slack";
        notification: "refund_approval_request" | "refund_failure_alert" | "refund_status_update";
        status?: number | undefined;
    }> | undefined>;
    /** POSTs `message` as JSON. A non-2xx answer, a network error or the timeout returns `NotificationFailed`. */
    private post;
}
/**
 * Sends every notification on each channel. Every channel is tried; the first failure is returned.
 */
export declare class MultiChannelNotificationService implements NotificationService {
    private readonly services;
    constructor(services: readonly NotificationService[]);
    sendRefundApprovalRequest(refund: Refund): Promise<Failure | undefined>;
    sendRefundStatusUpdate(refund: Refund, status: string): Promise<Failure | undefined>;
    sendRefundFailureAlert(refund: Refund, error: unknown): Promise<Failure | undefined>;
}
export type NotificationServiceConfig = {
    type: 'email';
    email: EmailNotificationConfig;
} | {
    type: 'slack';
    slack: SlackNotificationConfig;
} | {
    type: 'multi';
    email?: EmailNotificationConfig;
    slack?: SlackNotificationConfig;
};
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
export declare function createNotificationService(config: NotificationServiceConfig): NotificationService;
//# sourceMappingURL=service.d.ts.map