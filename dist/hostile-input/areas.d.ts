export declare const areas: readonly [import("./engine.js").HostileArea<{
    db: import("../test-support.js").AppDb;
    client: import("@electric-sql/pglite").PGlite;
    repo: import("../core/repository.js").PaymentRepository;
    writes: import("../core/journal.js").CoreWrites;
}>, import("./engine.js").HostileArea<{
    db: import("../test-support.js").AppDb;
    client: import("@electric-sql/pglite").PGlite;
    reads: ReturnType<typeof import("../service-test-support.js").coreReads>;
    writes: import("../core/journal.js").CoreWrites;
    repository: import("../core/repository.js").PaymentRepository;
    kv: import("@arki/kv").KV;
}>, import("./engine.js").HostileArea<{
    db: import("../test-support.js").AppDb;
    client: import("@electric-sql/pglite").PGlite;
    repo: import("../core/repository.js").PaymentRepository;
    writes: import("../core/journal.js").CoreWrites;
    security: import("../core/services/webhook-security.js").WebhookSecurityService;
    handler: import("../core/services/webhook-handler.js").WebhookHandler;
    analytics: import("../core/services/webhook-analytics-service.js").WebhookAnalyticsService;
    retryEventId: string;
    slackServer: import("node:http").Server;
    slackUrl: string;
    slackBodies: unknown[];
    mails: import("../core/notifications/service.js").NotificationMail[];
    email: import("../core/notifications/service.js").EmailNotificationService;
    slack: import("../core/notifications/service.js").SlackNotificationService;
    multi: import("../core/notifications/service.js").MultiChannelNotificationService;
}>, import("./engine.js").HostileArea<{
    db: import("../test-support.js").AppDb;
    client: import("@electric-sql/pglite").PGlite;
    world: {
        customers: Map<string, import("../core/types.js").Customer>;
        plans: Map<string, import("../core/types.js").Plan>;
        payments: Map<string, import("../core/types.js").Payment>;
        subscriptions: Map<string, import("../core/types.js").Subscription>;
        refundIdOnStripe: string;
        planIdOnStripe: string;
    };
    stripe: import("../core/providers/stripe-provider.js").StripeProvider;
    sdk: import("stripe").Stripe;
    billing: import("../presets/subscription.js").SubscriptionBilling;
}>, import("./engine.js").HostileArea<{
    db: import("../test-support.js").AppDb;
    client: import("@electric-sql/pglite").PGlite;
    repos: ReturnType<typeof import("../dunning/repository.js").createDunningRepository>;
}>, import("./engine.js").HostileArea<{
    db: import("../test-support.js").AppDb;
    client: import("@electric-sql/pglite").PGlite;
    server: import("node:http").Server;
    origin: string;
    store: import("../dunning/services/communication-service.js").InAppNotificationStore;
    email: import("../dunning/services/communication-service.js").EmailProvider;
    sms: import("../dunning/services/communication-service.js").SMSProvider;
    inApp: import("../dunning/services/communication-service.js").InAppProvider;
    webhook: import("../dunning/services/communication-service.js").WebhookProvider;
    communications: import("../dunning/services/communication-service.js").CommunicationOrchestrationService;
    campaigns: import("../dunning/services/campaign-service.js").DunningCampaignService;
    segments: import("../dunning/services/segmentation-service.js").CustomerSegmentationService;
    integration: import("../dunning/services/integration-service.js").DunningIntegrationService;
    executions: ReturnType<typeof import("../dunning/repository.js").createDunningExecutionRepository>;
    communicationRows: ReturnType<typeof import("../dunning/repository.js").createDunningCommunicationRepository>;
    templates: ReturnType<typeof import("../dunning/repository.js").createDunningTemplateRepository>;
    campaignRows: ReturnType<typeof import("../dunning/repository.js").createDunningCampaignRepository>;
}>, import("./engine.js").HostileArea<{
    db: import("../test-support.js").AppDb;
    client: import("@electric-sql/pglite").PGlite;
    repos: ReturnType<typeof import("../tax/repository.js").createTaxRepositories>;
    service: import("../tax/service.js").TaxService;
    reporting: import("../tax/reporting.js").TaxReportingService;
    writes: ReturnType<(run: import("@arki/journal").CommandRunner<{
        actorId: string;
    }, import("drizzle-orm/pg-core").PgAsyncTransaction<import("drizzle-orm/pglite").PgliteQueryResultHKT, import("drizzle-orm").EmptyRelations>>) => import("../core/journal.js").CoreWrites>;
}>, import("./engine.js").HostileArea<{
    db: import("../test-support.js").AppDb;
    client: import("@electric-sql/pglite").PGlite;
    coreWrites: import("../core/journal.js").CoreWrites;
    writes: import("../refunds/journal.js").RefundWrites;
    repo: import("../refunds/repository.js").RefundRepository;
    service: import("../refunds/service.js").RefundService;
    last: {
        refundId: import("../refunds/primitives.js").RefundId;
        paymentId: import("../index.js").PaymentId;
    };
}>];
//# sourceMappingURL=areas.d.ts.map