import type { Refund } from '../../refunds/types.js';
/**
 * Notification Service Interface
 * Defines the contract for sending notifications related to refunds
 */
export type NotificationService = {
    sendRefundApprovalRequest?(refund: Refund): Promise<void>;
    sendRefundStatusUpdate?(refund: Refund, status: string): Promise<void>;
    sendRefundFailureAlert?(refund: Refund, error: unknown): Promise<void>;
};
/**
 * Email-based Notification Service Implementation
 * Simple implementation that would typically integrate with an email service
 */
export declare class EmailNotificationService implements NotificationService {
    private readonly emailConfig;
    constructor(emailConfig: EmailNotificationConfig);
    sendRefundApprovalRequest(refund: Refund): Promise<void>;
    sendRefundStatusUpdate(refund: Refund, status: string): Promise<void>;
    sendRefundFailureAlert(refund: Refund, error: unknown): Promise<void>;
}
/**
 * Slack-based Notification Service Implementation
 * Alternative implementation for Slack notifications
 */
export type SlackNotificationConfig = {
    webhookUrl: string;
    adminChannel: string;
    supportChannel: string;
    /** Base URL of the admin app; used to build action button links. */
    adminUrl: string;
};
export declare class SlackNotificationService implements NotificationService {
    private readonly slackConfig;
    constructor(slackConfig: SlackNotificationConfig);
    sendRefundApprovalRequest(refund: Refund): Promise<void>;
    sendRefundStatusUpdate(refund: Refund, status: string): Promise<void>;
    sendRefundFailureAlert(refund: Refund, error: unknown): Promise<void>;
}
/**
 * Multi-channel Notification Service
 * Combines multiple notification channels for comprehensive coverage
 */
export declare class MultiChannelNotificationService implements NotificationService {
    private readonly services;
    constructor(services: NotificationService[]);
    sendRefundApprovalRequest(refund: Refund): Promise<void>;
    sendRefundStatusUpdate(refund: Refund, status: string): Promise<void>;
    sendRefundFailureAlert(refund: Refund, error: unknown): Promise<void>;
}
/**
 * Factory function to create notification service based on configuration
 */
export type EmailNotificationConfig = {
    fromEmail: string;
    supportEmail: string;
    adminEmails: string[];
};
export type NotificationServiceConfig = {
    type: 'email' | 'slack' | 'multi';
    email?: EmailNotificationConfig;
    slack?: SlackNotificationConfig;
};
export declare function createNotificationService(config: NotificationServiceConfig): NotificationService;
/**
 * Payment Notification Service Module
 *
 * This module provides comprehensive notification capabilities for the payment system,
 * specifically designed to handle refund-related communications.
 *
 * ## Key Features:
 *
 * ### Multiple Channels
 * - **Email**: Traditional email notifications for customers and admins
 * - **Slack**: Real-time team notifications with interactive elements
 * - **Multi-channel**: Combine multiple services for redundancy
 *
 * ### Notification Types
 * - **Approval Requests**: Notify admins when refunds need manual approval
 * - **Status Updates**: Inform customers about refund status changes
 * - **Failure Alerts**: Alert support team about processing failures
 *
 * ### Integration Points
 * - Seamlessly integrates with RefundService for automatic notifications
 * - Configurable notification rules and templates
 * - Support for custom notification channels via interface
 *
 * ## Usage Example:
 *
 * ```typescript
 * import { createNotificationService } from '@/features/payments/notifications';
 *
 * const notificationService = createNotificationService({
 *   type: 'multi',
 *   email: {
 *     fromEmail: 'noreply@example.com',
 *     supportEmail: 'support@example.com',
 *     adminEmails: ['admin@example.com'],
 *   },
 *   slack: {
 *     webhookUrl: process.env.SLACK_WEBHOOK_URL,
 *     adminChannel: '#refund-approvals',
 *     supportChannel: '#support-alerts',
 *   },
 * });
 *
 * // Use with RefundService
 * const refundService = createRefundService(
 *   db,
 *   paymentProvider,
 *   paymentRepository,
 *   notificationService
 * );
 * ```
 *
 * ## Configuration:
 * The service supports environment-based configuration for easy deployment
 * across different environments (development, staging, production).
 */ 
//# sourceMappingURL=service.d.ts.map