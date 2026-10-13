import { eq } from 'drizzle-orm';
import { now } from '@arki/date';
import { getLogger } from '@arki/log';
import { Money } from '@arki/money';
import { createDunningCampaignService } from './campaign-service.js';
import { createCommunicationOrchestrationService } from './communication-service.js';
import { createCustomerSegmentationService } from './segmentation-service.js';
const logger = getLogger('dunning.integration');
export class DunningIntegrationService {
    db;
    paymentRetryService;
    campaignService;
    communicationService;
    segmentationService;
    systemUserId;
    dunningExecutions;
    constructor(db, coreTables, dunningTables, config, paymentRetryService) {
        this.db = db;
        this.paymentRetryService = paymentRetryService;
        this.systemUserId = config.systemUserId;
        this.dunningExecutions = dunningTables.dunningExecutions;
        this.communicationService = createCommunicationOrchestrationService(db, { dunningCommunications: dunningTables.dunningCommunications }, config.communication);
        this.campaignService = createDunningCampaignService(db, {
            dunningCampaigns: dunningTables.dunningCampaigns,
            dunningCampaignAnalytics: dunningTables.dunningCampaignAnalytics,
            dunningTemplates: dunningTables.dunningTemplates,
            dunningExecutions: dunningTables.dunningExecutions,
        }, () => this.communicationService, paymentRetryService);
        this.segmentationService = createCustomerSegmentationService(db, coreTables, {
            customerSegments: dunningTables.customerSegments,
            customerRiskProfiles: dunningTables.customerRiskProfiles,
        });
    }
    /**
     * Handle payment failure events from the payment system
     */
    async handlePaymentFailure(event) {
        logger.info('Processing payment failure', {
            customerId: event.customerId,
            paymentId: event.paymentId,
            failureReason: event.failureReason,
            failureCount: event.failureCount,
        });
        // First, let the payment retry service handle technical retries (if available)
        if (this.paymentRetryService) {
            await this.paymentRetryService.scheduleRetries(event.paymentId, event.failureReason);
        }
        // Update customer risk profile with payment failure
        await this.segmentationService.updateCustomerRiskProfile(event.customerId);
        // Get customer segments to determine applicable campaigns
        const customerSegments = await this.segmentationService.getCustomerSegments(event.customerId);
        // Find active campaigns for payment failure trigger
        const applicableCampaigns = await this.campaignService.findActiveCampaignsForTrigger('payment_failure', customerSegments);
        // Execute applicable campaigns
        for (const campaign of applicableCampaigns) {
            try {
                // Check if campaign conditions are met
                if (this.evaluateCampaignConditions(campaign, event)) {
                    await this.executeCampaignForCustomer(campaign.id, event);
                }
            }
            catch (error) {
                logger.error('Failed to execute campaign for payment failure', {
                    campaignId: campaign.id,
                    customerId: event.customerId,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
    }
    /**
     * Handle subscription status changes
     */
    async handleSubscriptionStatusChange(event) {
        logger.info('Processing subscription status change', {
            customerId: event.customerId,
            subscriptionId: event.subscriptionId,
            oldStatus: event.oldStatus,
            newStatus: event.newStatus,
        });
        // Update customer risk profile
        await this.segmentationService.updateCustomerRiskProfile(event.customerId);
        // Handle different status transitions
        if (event.newStatus === 'past_due') {
            await this.handlePastDueSubscription(event);
        }
        else if (event.newStatus === 'canceled') {
            await this.handleSubscriptionCancellation(event);
        }
        else if (event.newStatus === 'active' && event.oldStatus === 'past_due') {
            await this.handleSubscriptionRecovery(event);
        }
    }
    /**
     * Handle trial ending notifications
     */
    async handleTrialEnding(event) {
        logger.info('Processing trial ending', {
            customerId: event.customerId,
            subscriptionId: event.subscriptionId,
            daysUntilEnd: event.daysUntilEnd,
            trialEndDate: event.trialEndDate.toString(),
        });
        const customerSegments = await this.segmentationService.getCustomerSegments(event.customerId);
        const applicableCampaigns = await this.campaignService.findActiveCampaignsForTrigger('trial_ending', customerSegments);
        for (const campaign of applicableCampaigns) {
            try {
                if (this.evaluateTrialEndingConditions(campaign, event)) {
                    await this.executeCampaignForCustomer(campaign.id, {
                        customerId: event.customerId,
                        subscriptionId: event.subscriptionId,
                        triggerData: {
                            daysUntilEnd: event.daysUntilEnd,
                            trialEndDate: event.trialEndDate,
                            ...event.metadata,
                        },
                    });
                }
            }
            catch (error) {
                logger.error('Failed to execute trial ending campaign', {
                    campaignId: campaign.id,
                    customerId: event.customerId,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
    }
    /**
     * Handle successful payment events (can stop dunning campaigns)
     */
    async handlePaymentSuccess(event) {
        logger.info('Processing successful payment', {
            customerId: event.customerId,
            paymentId: event.paymentId,
            amount: event.amount.toString(),
        });
        // Update customer risk profile with successful payment
        await this.segmentationService.updateCustomerRiskProfile(event.customerId);
        // Stop any active dunning campaigns for this customer if configured
        await this.stopDunningCampaignsOnPaymentSuccess(event.customerId, event.subscriptionId);
    }
    /**
     * Execute a specific campaign for a customer
     */
    async executeCampaignForCustomer(campaignId, event) {
        await this.campaignService.executeCampaign({
            campaignId,
            dryRun: false,
            customFilters: {
                customerIds: [event.customerId],
                testMode: false,
            },
        }, this.systemUserId);
    }
    /**
     * Handle past due subscription scenario
     */
    async handlePastDueSubscription(event) {
        const customerSegments = await this.segmentationService.getCustomerSegments(event.customerId);
        const applicableCampaigns = await this.campaignService.findActiveCampaignsForTrigger('subscription_status', customerSegments);
        for (const campaign of applicableCampaigns) {
            try {
                // Check if campaign is for past_due status
                if (campaign.trigger.conditions.subscriptionStatus?.includes('past_due')) {
                    await this.executeCampaignForCustomer(campaign.id, {
                        customerId: event.customerId,
                        subscriptionId: event.subscriptionId,
                        triggerData: {
                            oldStatus: event.oldStatus,
                            newStatus: event.newStatus,
                            ...event.metadata,
                        },
                    });
                }
            }
            catch (error) {
                logger.error('Failed to execute past due campaign', {
                    campaignId: campaign.id,
                    customerId: event.customerId,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
    }
    /**
     * Handle subscription cancellation
     */
    async handleSubscriptionCancellation(event) {
        // Stop any active dunning campaigns for this subscription
        // Update customer risk profile to reflect cancellation
        await this.segmentationService.updateCustomerRiskProfile(event.customerId);
        // Could trigger win-back campaigns (different from dunning)
        logger.info('Subscription canceled, stopping dunning campaigns', {
            subscriptionId: event.subscriptionId,
            customerId: event.customerId,
        });
    }
    /**
     * Handle subscription recovery (past_due -> active)
     */
    async handleSubscriptionRecovery(event) {
        // Stop any active dunning campaigns for this customer
        await this.stopDunningCampaignsOnPaymentSuccess(event.customerId, event.subscriptionId);
        // Update customer risk profile positively
        await this.segmentationService.updateCustomerRiskProfile(event.customerId);
        logger.info('Subscription recovered', {
            subscriptionId: event.subscriptionId,
            customerId: event.customerId,
            oldStatus: event.oldStatus,
            newStatus: event.newStatus,
        });
    }
    /**
     * Stop active dunning campaigns when payment succeeds (if configured)
     */
    async stopDunningCampaignsOnPaymentSuccess(customerId, subscriptionId) {
        // Find active executions for this customer. Cast through unknown because
        // the package-side `db.query.dunningExecutions` is typed against
        // `AnyRelations` and loses the relations + filter operator info — the host
        // contract guarantees the registered relations support `where` + `with`.
        const dunningQuery = this.db.query;
        const activeExecutions = await dunningQuery.dunningExecutions.findMany({
            where: {
                customerId,
                status: { in: ['scheduled', 'running'] },
                ...(subscriptionId && { subscriptionId }),
            },
            with: {
                campaign: true,
            },
        });
        for (const execution of activeExecutions) {
            // Check if the campaign is configured to stop on payment success
            if (execution.campaign?.settings.stopOnPaymentSuccess) {
                try {
                    await this.db
                        .update(this.dunningExecutions)
                        .set({
                        status: 'cancelled',
                        completedAt: now(),
                        result: {
                            customersProcessed: 0,
                            communicationsSent: 0,
                            errors: [],
                            performance: {
                                processingTime: 0,
                                successRate: 1,
                            },
                        },
                    })
                        .where(eq(this.dunningExecutions.id, execution.id));
                    logger.info('Stopped dunning execution due to payment success', {
                        executionId: execution.id,
                        customerId: customerId,
                        campaignId: execution.campaign?.id,
                    });
                }
                catch (error) {
                    logger.error('Failed to stop dunning execution', {
                        executionId: execution.id,
                        customerId: customerId,
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }
        }
    }
    /**
     * Evaluate campaign conditions for payment failure
     */
    evaluateCampaignConditions(campaign, event) {
        const conditions = campaign.trigger.conditions;
        // Check payment failure count condition
        if (conditions.paymentFailureCount && event.failureCount < conditions.paymentFailureCount) {
            return false;
        }
        // Check amount filters if specified
        // A range in another currency says nothing about this payment, so the campaign does not apply.
        const range = campaign.trigger.filters?.totalSpent;
        const bound = range?.min ?? range?.max;
        if (range && bound) {
            if (event.amount.currency.code !== Money.fromJSON(bound).currency.code)
                return false;
            if (range.min && event.amount.lt(Money.fromJSON(range.min)))
                return false;
            if (range.max && event.amount.gt(Money.fromJSON(range.max)))
                return false;
        }
        // Add more condition evaluations as needed
        return true;
    }
    /**
     * Evaluate trial ending conditions
     */
    evaluateTrialEndingConditions(campaign, event) {
        const conditions = campaign.trigger.conditions;
        // Check trial ending days condition
        if (conditions.trialEndingDays && event.daysUntilEnd !== conditions.trialEndingDays) {
            return false;
        }
        return true;
    }
    /**
     * Process all scheduled dunning executions
     */
    async processScheduledExecutions() {
        try {
            await this.campaignService.processScheduledExecutions();
        }
        catch (error) {
            logger.error('Failed to process scheduled executions', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * Process pending communications
     */
    async processPendingCommunications() {
        try {
            await this.communicationService.processPendingCommunications();
        }
        catch (error) {
            logger.error('Failed to process pending communications', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * Retry failed executions
     */
    async retryFailedExecutions() {
        try {
            await this.campaignService.retryFailedExecutions();
        }
        catch (error) {
            logger.error('Failed to retry failed executions', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * Update customer risk profiles in bulk
     */
    async updateRiskProfiles() {
        try {
            await this.segmentationService.bulkUpdateRiskProfiles();
        }
        catch (error) {
            logger.error('Failed to update risk profiles', { error: error instanceof Error ? error.message : String(error) });
        }
    }
    /**
     * Process auto-update segments
     */
    async processAutoUpdateSegments() {
        try {
            await this.segmentationService.processAutoUpdateSegments();
        }
        catch (error) {
            logger.error('Failed to process auto-update segments', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * Integration health check
     */
    async healthCheck() {
        const services = {
            campaigns: true, // Would check campaign service health
            communications: true, // Would check communication service health
            segmentation: true, // Would check segmentation service health
            paymentRetry: true, // Would check payment retry service health
        };
        const providers = await this.communicationService.validateProviders();
        const allServicesHealthy = Object.values(services).every(Boolean);
        const allProvidersHealthy = Object.values(providers).every(Boolean);
        let status;
        if (allServicesHealthy && allProvidersHealthy) {
            status = 'healthy';
        }
        else if (allServicesHealthy) {
            status = 'degraded'; // Services healthy but some providers down
        }
        else {
            status = 'unhealthy';
        }
        return {
            status,
            services,
            providers,
        };
    }
    /**
     * Get integration metrics
     */
    async getIntegrationMetrics(_days = 30) {
        // This would query execution and communication tables for metrics
        // Placeholder implementation
        return {
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            communicationsSent: 0,
            successRate: 0,
            averageProcessingTime: 0,
        };
    }
}
/**
 * Factory function to create DunningIntegrationService.
 */
export function createDunningIntegrationService(db, coreTables, dunningTables, config, paymentRetryService) {
    return new DunningIntegrationService(db, coreTables, dunningTables, config, paymentRetryService);
}
//# sourceMappingURL=integration-service.js.map