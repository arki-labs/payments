/**
 * The expected ways a dunning operation is refused, each defined once. The dunning services and
 * the notification providers return them, never throw them: a correct caller must branch on them.
 * Bugs and network faults (a provider that cannot be reached at all) are still thrown.
 */
import type { FailureOf, SchemaFailure } from '@arki/failure';
/**
 * No dunning campaign has this id.
 *
 * @fix Check the campaign id; list the campaigns to find it.
 * @verify bun run test -- src/dunning/campaign-service.test.ts
 */
export declare const DunningCampaignNotFound: import("@arki/failure").FailureDefinition<"payments.dunning_campaign_not_found", import("@standard-schema/spec").StandardSchemaV1<{
    campaignId: string;
}, {
    campaignId: string;
}>>;
/**
 * No dunning step (template) has this id. Nothing was written.
 *
 * @fix Check the step id; read the campaign to list its steps.
 * @verify bun run test -- src/dunning/campaign-service.test.ts
 */
export declare const DunningTemplateNotFound: import("@arki/failure").FailureDefinition<"payments.dunning_template_not_found", import("@standard-schema/spec").StandardSchemaV1<{
    templateId: string;
}, {
    templateId: string;
}>>;
/**
 * No dunning execution has this id. Nothing was written.
 *
 * @fix Check the execution id; list the campaign's executions to find it.
 * @verify bun run test -- src/dunning/campaign-service.test.ts
 */
export declare const DunningExecutionNotFound: import("@arki/failure").FailureDefinition<"payments.dunning_execution_not_found", import("@standard-schema/spec").StandardSchemaV1<{
    executionId: string;
}, {
    executionId: string;
}>>;
/**
 * The customer already has a risk profile, so `CustomerRiskProfileRepository.create` wrote nothing.
 *
 * @fix Use `upsert` to replace the stored profile, or `update` to change it.
 * @verify bun run test -- src/dunning/customer-risk-profile.test.ts
 */
export declare const CustomerRiskProfileExists: import("@arki/failure").FailureDefinition<"payments.customer_risk_profile_exists", import("@standard-schema/spec").StandardSchemaV1<{
    customerId: string;
}, {
    customerId: string;
}>>;
/**
 * A delivery callback names a provider message id that no dunning communication has. Nothing was written.
 *
 * @fix Check that the callback comes from the provider that sent the message; a message sent before its id was stored has none.
 * @verify bun run test -- src/dunning/communication-service.test.ts
 */
export declare const DunningCommunicationNotFound: import("@arki/failure").FailureDefinition<"payments.dunning_communication_not_found", import("@standard-schema/spec").StandardSchemaV1<{
    providerMessageId: string;
}, {
    providerMessageId: string;
}>>;
/**
 * The campaign exists but is not active, so it cannot run. Nothing was written.
 *
 * @fix Set the campaign status to `active` first.
 * @verify bun run test -- src/dunning/campaign-service.test.ts
 */
export declare const DunningCampaignNotActive: import("@arki/failure").FailureDefinition<"payments.dunning_campaign_not_active", import("@standard-schema/spec").StandardSchemaV1<{
    campaignId: string;
    status: "active" | "archived" | "draft" | "paused";
}, {
    campaignId: string;
    status: "active" | "archived" | "draft" | "paused";
}>>;
/**
 * The campaign is active but has no active step (template) to send. Nothing was written.
 *
 * @fix Add a step to the campaign, or activate one of its steps.
 * @verify bun run test -- src/dunning/campaign-service.test.ts
 */
export declare const DunningCampaignWithoutSteps: import("@arki/failure").FailureDefinition<"payments.dunning_campaign_without_steps", import("@standard-schema/spec").StandardSchemaV1<{
    campaignId: string;
}, {
    campaignId: string;
}>>;
/**
 * No customer segment has this id.
 *
 * @fix Check the segment id; list the segments to find it.
 * @verify bun run test -- src/dunning/segmentation-service.test.ts
 */
export declare const CustomerSegmentNotFound: import("@arki/failure").FailureDefinition<"payments.customer_segment_not_found", import("@standard-schema/spec").StandardSchemaV1<{
    segmentId: string;
}, {
    segmentId: string;
}>>;
/**
 * A campaign update removes a step that already sent a communication, or `deleteCampaign` deletes
 * a campaign with such a step. The sent message keeps its step (its history points at it), so the
 * update or delete was refused and nothing changed.
 *
 * @fix Keep the step in `templates` (change its content or delay instead), or deactivate (archive) the campaign instead of deleting it.
 * @verify bun run test -- src/dunning/campaign-service.test.ts
 */
export declare const DunningTemplateInUse: import("@arki/failure").FailureDefinition<"payments.dunning_template_in_use", import("@standard-schema/spec").StandardSchemaV1<{
    templateId: string;
    stepNumber: number;
}, {
    templateId: string;
    stepNumber: number;
}>>;
/**
 * A dunning step uses a channel that has no provider registered in this app. The communication
 * was not written.
 *
 * @fix Configure the channel in `createCommunicationOrchestrationService` (or `registerProvider`), or change the step's channel.
 * @verify bun run test -- src/dunning/communication-service.test.ts
 */
export declare const NotificationChannelUnavailable: import("@arki/failure").FailureDefinition<"payments.notification_channel_unavailable", import("@standard-schema/spec").StandardSchemaV1<{
    channel: "email" | "in_app" | "sms" | "webhook";
}, {
    channel: "email" | "in_app" | "sms" | "webhook";
}>>;
/**
 * The notification provider answered with an error status (4xx or 5xx). The message was not
 * sent. `upstreamMessage` is the provider's own error text when its body had one.
 *
 * @fix Read `upstreamStatus` and `upstreamMessage`: a 4xx is our request (recipient, sender, key); a 5xx is the provider's fault and a later retry can work.
 * @verify bun run test -- src/dunning/communication-service.test.ts
 */
export declare const NotificationProviderRejected: import("@arki/failure").FailureDefinition<"payments.notification_provider_rejected", import("@standard-schema/spec").StandardSchemaV1<{
    channel: "email" | "in_app" | "sms" | "webhook";
    provider: string;
    upstreamStatus: number;
    upstreamMessage: string | null;
}, {
    channel: "email" | "in_app" | "sms" | "webhook";
    provider: string;
    upstreamStatus: number;
    upstreamMessage: string | null;
}>>;
/**
 * The notification provider did not answer within the provider's `timeoutMs`. The message may or
 * may not have been sent.
 *
 * @fix Retry later, or raise `timeoutMs` in the provider config.
 * @verify bun run test -- src/dunning/communication-service.test.ts
 */
export declare const NotificationProviderTimeout: import("@arki/failure").FailureDefinition<"payments.notification_provider_timeout", import("@standard-schema/spec").StandardSchemaV1<{
    channel: "email" | "in_app" | "sms" | "webhook";
    provider: string;
    timeoutMs: number;
}, {
    channel: "email" | "in_app" | "sms" | "webhook";
    provider: string;
    timeoutMs: number;
}>>;
/**
 * The notification provider answered with a success status, but the body is not the shape its API
 * documents. The message may have been sent. `cause` holds the schema failure.
 *
 * @fix Check the provider's API version and its status page; read `cause` for the field that did not match.
 * @verify bun run test -- src/dunning/communication-service.test.ts
 */
export declare const NotificationProviderResponseInvalid: import("@arki/failure").FailureDefinition<"payments.notification_provider_response_invalid", import("@standard-schema/spec").StandardSchemaV1<{
    channel: "email" | "in_app" | "sms" | "webhook";
    provider: string;
    upstreamStatus: number;
}, {
    channel: "email" | "in_app" | "sms" | "webhook";
    provider: string;
    upstreamStatus: number;
}>>;
/**
 * A webhook recipient URL names a host that is not on the operator's `allowedHosts` list. Nothing
 * was sent. The URL comes from customer metadata, so only hosts the operator listed may be reached.
 *
 * @fix Add the host to `webhook.allowedHosts` if the operator trusts it, or correct the customer's `webhookUrl`.
 * @verify bun run test -- src/dunning/communication-service.test.ts
 */
export declare const NotificationWebhookHostNotAllowed: import("@arki/failure").FailureDefinition<"payments.notification_webhook_host_not_allowed", import("@standard-schema/spec").StandardSchemaV1<{
    host: string;
}, {
    host: string;
}>>;
/**
 * What a notification provider call can return instead of its result. A recipient that is not a
 * valid address for the channel (a webhook URL that is not http or https) is a `SchemaFailure`.
 */
export type NotificationProviderFailure = FailureOf<typeof NotificationProviderRejected> | FailureOf<typeof NotificationProviderTimeout> | FailureOf<typeof NotificationProviderResponseInvalid> | FailureOf<typeof NotificationWebhookHostNotAllowed> | SchemaFailure;
/**
 * One item a scheduled tick could not handle, made by `tickFault`: `refused` with the `failure` the
 * package returned, or `thrown` with the `error` (a fault).
 */
export type DunningTickFault = ReturnType<typeof tickFault>;
/**
 * What one scheduled tick did: how many items it handled, and each item it could not handle. A tick
 * logs every fault too; the report is what the scheduler sees. A fault that stops the whole tick
 * (the database is down) is thrown, not listed.
 */
export type DunningTickReport = {
    processed: number;
    failed: DunningTickFault[];
};
/** The tick fault for one item: a returned failure is `refused` and keeps the failure, anything else is `thrown` and keeps the error. */
export declare function tickFault(id: string, fault: unknown): {
    id: string;
    status: 'refused';
    failure: import("@arki/failure").Failure<string, unknown>;
    error?: undefined;
} | {
    failure?: undefined;
    id: string;
    status: 'thrown';
    error: unknown;
};
//# sourceMappingURL=failures.d.ts.map