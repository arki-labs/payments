import type { CoreTables } from '../../core/tables.js';
import type { CustomerId } from '../../core/types.js';
import type { CreateCustomerSegmentInput, ListCustomerSegmentsQuery, UpdateCustomerSegmentInput } from '../contracts.js';
import type { CustomerSegmentId } from '../primitives.js';
import type { DunningDatabase } from '../repository.js';
import type { DunningTables } from '../tables.js';
import type { CustomerRiskProfile, CustomerSegment, RiskScore, SegmentCriteria } from '../types.js';
/**
 * Service for customer segmentation and risk scoring
 * Handles segment management, customer classification, and risk assessment
 */
export type SegmentationCoreTables = Pick<CoreTables, 'customers' | 'payments' | 'subscriptions'>;
export type SegmentationDunningTables = Pick<DunningTables, 'customerSegments' | 'customerRiskProfiles'>;
export declare class CustomerSegmentationService {
    private readonly db;
    private segmentRepo;
    private riskProfileRepo;
    private readonly customers;
    private readonly payments;
    private readonly subscriptions;
    constructor(db: DunningDatabase, coreTables: SegmentationCoreTables, dunningTables: SegmentationDunningTables);
    /**
     * Create a new customer segment
     */
    createSegment(input: CreateCustomerSegmentInput, createdBy: string): Promise<CustomerSegment>;
    /**
     * Update an existing segment
     */
    updateSegment(segmentId: CustomerSegmentId, input: UpdateCustomerSegmentInput): Promise<CustomerSegment | null>;
    /**
     * Get segment by ID
     */
    getSegment(segmentId: CustomerSegmentId): Promise<CustomerSegment | null>;
    /**
     * List segments with filtering and pagination
     */
    listSegments(query: ListCustomerSegmentsQuery): Promise<CustomerSegment[]>;
    /**
     * Delete a segment
     */
    deleteSegment(segmentId: CustomerSegmentId): Promise<void>;
    /**
     * Calculate and update customer count for a segment
     */
    updateSegmentCustomerCount(segmentId: CustomerSegmentId): Promise<void>;
    /**
     * Calculate customer count for segment criteria
     */
    private calculateSegmentCustomerCount;
    /**
     * Get customers matching segment criteria
     */
    getCustomersInSegment(segmentId: CustomerSegmentId, limit?: number): Promise<any[]>;
    /**
     * Get customers matching specific criteria
     */
    getCustomersMatchingCriteria(criteria: SegmentCriteria, limit?: number): Promise<any[]>;
    /**
     * Build SQL conditions from segment criteria
     */
    private buildSegmentConditions;
    /**
     * Calculate risk score for a customer
     */
    calculateCustomerRiskScore(customerId: CustomerId): Promise<RiskScore>;
    /**
     * Calculate dynamic weights based on data quality and customer profile
     */
    private calculateDynamicWeights;
    /**
     * Apply risk multipliers for critical scenarios
     */
    private applyRiskMultipliers;
    /**
     * Calculate volatility risk based on payment amount and frequency patterns
     */
    private calculateVolatilityRisk;
    /**
     * Calculate Customer Lifetime Value risk
     */
    private calculateCLVRisk;
    /**
     * Calculate trends with historical analysis
     */
    private calculateRiskTrends;
    /**
     * Calculate coefficient of variation for volatility analysis
     */
    private calculateCoefficientOfVariation;
    /**
     * Calculate payment failure risk (0-100)
     */
    private calculatePaymentFailureRisk;
    /**
     * Calculate subscription churn risk (0-100)
     */
    private calculateSubscriptionChurnRisk;
    /**
     * Calculate engagement risk (0-100)
     */
    private calculateEngagementRisk;
    /**
     * Calculate recency risk based on last payment (0-100)
     */
    private calculateRecencyRisk;
    /**
     * Categorize risk score into levels
     */
    private categorizeRiskScore;
    /**
     * Get customer payment history for risk calculation
     */
    private getCustomerPaymentHistory;
    /**
     * Get customer subscription history for risk calculation
     */
    private getCustomerSubscriptionHistory;
    /**
     * Get customer engagement metrics for risk calculation
     */
    private getCustomerEngagementMetrics;
    /**
     * Update or create customer risk profile
     */
    updateCustomerRiskProfile(customerId: CustomerId): Promise<CustomerRiskProfile>;
    /**
     * Get segments that a customer belongs to
     */
    getCustomerSegments(customerId: CustomerId): Promise<string[]>;
    /**
     * Validate and sanitize risk calculation results
     */
    private validateRiskCalculation;
    /**
     * Bulk update all customer risk profiles with enhanced error handling
     */
    bulkUpdateRiskProfiles(limit?: number): Promise<void>;
    /**
     * Process auto-update segments
     */
    processAutoUpdateSegments(): Promise<void>;
    /**
     * Get risk profile for a customer
     */
    getCustomerRiskProfile(customerId: CustomerId): Promise<CustomerRiskProfile | null>;
    /**
     * Get customers by risk category
     */
    getCustomersByRiskCategory(category: string, limit?: number): Promise<CustomerRiskProfile[]>;
}
/**
 * Factory function to create CustomerSegmentationService
 */
export declare function createCustomerSegmentationService(db: DunningDatabase, coreTables: SegmentationCoreTables, dunningTables: SegmentationDunningTables): CustomerSegmentationService;
//# sourceMappingURL=segmentation-service.d.ts.map