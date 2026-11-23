import type { FailureOf, SchemaFailure } from '@arki/failure';
import type { MoneyFailure } from '@arki/money';
import type { CoreTables } from '../../core/tables.js';
import type { Customer, CustomerId } from '../../core/types.js';
import type { UserId } from '../../core/user-id.js';
import type { CreateCustomerSegmentInput, ListCustomerSegmentsQuery, UpdateCustomerSegmentInput } from '../contracts.js';
import type { CustomerSegmentId, RiskCategory } from '../primitives.js';
import type { DunningDatabase } from '../repository.js';
import type { DunningTables } from '../tables.js';
import type { CustomerRiskProfile, CustomerSegment, RiskScore, SegmentCriteria } from '../types.js';
import { ReferenceNotFound } from '../../core/providers/provider-error.js';
import type { DunningTickReport } from '../failures.js';
import { CustomerSegmentNotFound } from '../failures.js';
/** The customer columns a segment listing returns. */
export type SegmentCustomer = Pick<Customer, 'id' | 'userId' | 'email' | 'name' | 'createdAt'>;
/**
 * Service for customer segmentation and risk scoring
 * Handles segment management, customer classification, and risk assessment
 */
export type SegmentationCoreTables = Pick<CoreTables, 'customers' | 'payments' | 'subscriptions' | 'plans'>;
export type SegmentationDunningTables = Pick<DunningTables, 'customerSegments' | 'customerRiskProfiles'>;
export declare class CustomerSegmentationService {
    private readonly db;
    private segmentRepo;
    private riskProfileRepo;
    private readonly customers;
    private readonly payments;
    private readonly subscriptions;
    private readonly plans;
    constructor(db: DunningDatabase, coreTables: SegmentationCoreTables, dunningTables: SegmentationDunningTables);
    /**
     * Create a new customer segment. The criteria are checked first: criteria `segmentCriteriaSchema`
     * refuses, or an actor id, text or JSON Postgres cannot store, return `schema.invalid_input`, and a spend
     * range that is not valid money returns its `MoneyFailure`; nothing is written then. After a good write, the count can only fail with a
     * database error, which throws (this service holds no transaction, so the saved row stays).
     */
    createSegment(input: CreateCustomerSegmentInput, createdBy: UserId): Promise<CustomerSegment | MoneyFailure | FailureOf<typeof CustomerSegmentNotFound> | SchemaFailure>;
    /**
     * Update an existing segment. As in `createSegment`, new criteria the schema refuses, or text, JSON or an
     * update frequency Postgres cannot store, return `schema.invalid_input`, and a spend range that is not
     * valid money returns its `MoneyFailure`, before anything is written. `null` for an unknown segment.
     */
    updateSegment(segmentId: CustomerSegmentId, input: UpdateCustomerSegmentInput): Promise<CustomerSegment | null | MoneyFailure | FailureOf<typeof CustomerSegmentNotFound> | SchemaFailure>;
    /**
     * Get segment by ID
     */
    getSegment(segmentId: CustomerSegmentId): Promise<CustomerSegment | null>;
    /**
     * List segments with filtering and pagination. `limit` and `offset` are whole numbers of 0 or more (a
     * precondition: anything else throws an invariant failure); a `search` holding U+0000 matches nothing. A
     * `type` or `sortBy` outside its list returns `schema.invalid_input`.
     */
    listSegments(query: ListCustomerSegmentsQuery): Promise<CustomerSegment[] | SchemaFailure>;
    /**
     * Delete a segment
     */
    deleteSegment(segmentId: CustomerSegmentId): Promise<void>;
    /**
     * Calculate and update customer count for a segment, and return the new count. An unknown segment returns
     * `CustomerSegmentNotFound`; a stored spend range that is not valid money returns its `MoneyFailure`.
     */
    updateSegmentCustomerCount(segmentId: CustomerSegmentId): Promise<number | import("@arki/failure").Failure<"payments.customer_segment_not_found", {
        segmentId: string;
    }> | MoneyFailure | SchemaFailure>;
    /**
     * Calculate customer count for segment criteria
     */
    private calculateSegmentCustomerCount;
    /**
     * Get customers matching segment criteria. An unknown segment returns `CustomerSegmentNotFound`.
     * `limit` is a whole number of 0 or more (a precondition: anything else throws an invariant failure
     * before any query).
     */
    getCustomersInSegment(segmentId: CustomerSegmentId, limit?: number): Promise<SegmentCustomer[] | import("@arki/failure").Failure<"payments.customer_segment_not_found", {
        segmentId: string;
    }> | MoneyFailure | SchemaFailure>;
    /**
     * Get customers matching specific criteria. Criteria the stored-criteria schema refuses (a plan tier
     * no plan has, a span or count outside its range, NaN) return `schema.invalid_input`, and a spend
     * range money refuses its `MoneyFailure`, before any query. `limit` is a whole number of 0 or more (a
     * precondition: anything else throws an invariant failure).
     */
    getCustomersMatchingCriteria(criteria: SegmentCriteria, limit?: number): Promise<SegmentCustomer[] | MoneyFailure | SchemaFailure>;
    /**
     * Build SQL conditions from segment criteria. The spend range comes from a stored jsonb column, so
     * an amount `@arki/money` refuses, one finer than the currency's minor unit or one past 2^53 - 1 minor
     * units is returned as its `MoneyFailure` (`spendBoundMinor`), never thrown or turned into a wrong filter.
     */
    private buildSegmentConditions;
    /**
     * Calculate the risk score of a customer from their payments and subscriptions. An unknown customer
     * returns `ReferenceNotFound` (`kind: 'customer'`): there is nobody to score. An id no row can hold
     * (U+0000) is unknown too, answered without a query.
     */
    calculateCustomerRiskScore(customerId: CustomerId): Promise<RiskScore | FailureOf<typeof ReferenceNotFound>>;
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
     * Update or create the customer risk profile. An unknown customer (also an id no row can hold) returns
     * `ReferenceNotFound` (`kind: 'customer'`) and writes nothing. A stored segment whose spend range is not
     * valid money returns its `MoneyFailure` (see `getCustomerSegments`). The repository's
     * `schema.invalid_input` for JSON Postgres cannot store is passed on; the profile is built from rows
     * Postgres already stored, so it is not expected here.
     */
    updateCustomerRiskProfile(customerId: CustomerId): Promise<CustomerRiskProfile | MoneyFailure | FailureOf<typeof ReferenceNotFound> | SchemaFailure>;
    /**
     * The active segments the customer belongs to. An unknown customer (also an id no row can hold, without a
     * query) belongs to none: `[]`. A stored segment whose spend range is not valid money returns its
     * `MoneyFailure` (`money.unknown_currency`, `money.rounding_necessary`, `money.out_of_range`, …).
     */
    getCustomerSegments(customerId: CustomerId): Promise<CustomerSegmentId[] | MoneyFailure>;
    /** Whether a customer row has this id. An id no row can hold (U+0000) has none, answered without a query. */
    private customerExists;
    /**
     * Validate and sanitize risk calculation results
     */
    private validateRiskCalculation;
    /**
     * Recalculate the risk profile of up to `limit` customers. Returns how many were tried and each
     * customer whose profile was not updated (a stored range money refuses, or a thrown error). `limit` is
     * a whole number of 0 or more (a precondition: anything else throws an invariant failure before any query).
     */
    bulkUpdateRiskProfiles(limit?: number): Promise<DunningTickReport>;
    /** Recount the auto-update segments. Returns how many were tried and each segment that was not counted. */
    processAutoUpdateSegments(): Promise<DunningTickReport>;
    /** The customer's risk profile, or `null` when there is none (also for an id no row can hold, without a query). */
    getCustomerRiskProfile(customerId: CustomerId): Promise<CustomerRiskProfile | null>;
    /**
     * Get customers by risk category. `limit` is a whole number of 0 or more (a precondition: anything else
     * throws an invariant failure before any query). A category no profile has returns `schema.invalid_input`.
     */
    getCustomersByRiskCategory(category: RiskCategory, limit?: number): Promise<CustomerRiskProfile[] | SchemaFailure>;
}
/**
 * Factory function to create CustomerSegmentationService
 */
export declare function createCustomerSegmentationService(db: DunningDatabase, coreTables: SegmentationCoreTables, dunningTables: SegmentationDunningTables): CustomerSegmentationService;
//# sourceMappingURL=segmentation-service.d.ts.map