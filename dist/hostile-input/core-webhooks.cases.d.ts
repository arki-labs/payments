import type { PGlite } from '@electric-sql/pglite';
import type { Server } from 'node:http';
import type { CoreWrites } from '../core/journal.js';
import type { NotificationMail } from '../core/notifications/service.js';
import type { AppDb } from '../test-support.js';
import { EmailNotificationService, MultiChannelNotificationService, SlackNotificationService } from '../core/notifications/service.js';
import { PaymentRepository } from '../core/repository.js';
import { WebhookAnalyticsService } from '../core/services/webhook-analytics-service.js';
import { WebhookHandler } from '../core/services/webhook-handler.js';
import { WebhookSecurityService } from '../core/services/webhook-security.js';
type Ctx = {
    db: AppDb;
    client: PGlite;
    repo: PaymentRepository;
    writes: CoreWrites;
    security: WebhookSecurityService;
    handler: WebhookHandler;
    /** The analytics service the last `arrange` built. */
    analytics: WebhookAnalyticsService;
    /** The provider event id the last `retryFailedWebhooks` arrangement stored. */
    retryEventId: string;
    slackServer: Server;
    slackUrl: string;
    slackBodies: unknown[];
    mails: NotificationMail[];
    email: EmailNotificationService;
    slack: SlackNotificationService;
    multi: MultiChannelNotificationService;
};
export declare const coreWebhooksArea: import("./engine.js").HostileArea<Ctx>;
export {};
//# sourceMappingURL=core-webhooks.cases.d.ts.map