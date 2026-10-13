import type { CustomerRiskProfile } from './types.js';
/**
 * Give a `customer_risk_profiles` row the types its columns claim.
 *
 * `riskScore`, `paymentHistory` and `engagementMetrics` are jsonb, so Postgres
 * returns their dates as ISO text although the column types say `Instant`.
 * Every read of the table passes through here. A write needs nothing: an
 * `Instant` serializes to the ISO text that this reads back.
 */
export declare function readCustomerRiskProfile(row: CustomerRiskProfile): CustomerRiskProfile;
//# sourceMappingURL=stored-risk-profile.d.ts.map