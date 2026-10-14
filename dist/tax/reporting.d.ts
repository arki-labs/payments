import type { Instant } from '@arki/date';
import { Money } from '@arki/money';
import type { PaymentRepository } from '../core/repository.js';
import type { CustomerId } from '../core/types.js';
import type { ExemptionType } from './primitives.js';
import type { TaxAuditRepository, TaxConfigurationRepository, TaxExemptionRepository, TaxJurisdictionRepository, TaxRecordRepository } from './repository.js';
/**
 * Tax compliance and reporting periods
 */
export type ReportingPeriod = {
    year: number;
    quarter?: number;
    month?: number;
    startDate: Instant;
    endDate: Instant;
};
/**
 * Tax compliance report data
 */
export type TaxComplianceReport = {
    id: string;
    reportType: 'sales_and_use_tax' | 'vat' | 'gst';
    period: ReportingPeriod;
    jurisdiction: string;
    /** What succeeded payments of the period brought in, one total per currency, ordered by currency code */
    totalSales: Money[];
    /** Tax collected on sales less tax given back on refunds, per currency */
    totalTaxCollected: Money[];
    /** Sales to customers with a blanket exemption in force, per currency */
    exemptSales: Money[];
    transactions: number;
    generatedAt: Instant;
    summary: {
        taxableTransactions: number;
        exemptTransactions: number;
        /** Mean, over taxable payments, of tax as a share of the sale before tax (0.19 is 19%). A ratio, not an amount. */
        averageTaxRate: number;
        /** One row per category and currency, ordered by category then currency */
        topTaxCategories: {
            category: string;
            sales: Money;
            tax: Money;
        }[];
    };
};
/**
 * Customer tax summary for compliance
 *
 * Built from the customer's succeeded payments of the calendar year (UTC). A payment's tax is the
 * `taxAmount` its metadata records at checkout; a payment without one carried no recorded tax and
 * counts zero. Totals are one amount per currency: currencies are never added.
 */
export type CustomerTaxSummary = {
    customerId: string;
    year: number;
    /** One total per currency, ordered by currency code. */
    totalPaid: Money[];
    totalTax: Money[];
    transactions: {
        id: string;
        date: Instant;
        amount: Money;
        tax: Money;
        type: 'subscription' | 'one_time';
        description: string;
    }[];
    /** Exemptions that were in force at some point in the year. */
    exemptions: {
        type: ExemptionType;
        reason: string;
        certificateNumber: string | null;
        validFrom: Instant;
        validTo: Instant | null;
    }[];
};
/** What the reports read. The repositories of `createTaxRepositories` and a `PaymentRepository` fit. */
export type TaxReportReads = {
    payments: Pick<PaymentRepository, 'findPayments'>;
    exemptions: Pick<TaxExemptionRepository, 'findCustomerExemptionsInRange' | 'findExemptionsInRange' | 'findExpiringExemptions'>;
    records: Pick<TaxRecordRepository, 'totalsByJurisdiction' | 'totalsByPayment'>;
    audit: Pick<TaxAuditRepository, 'record' | 'findByEntity'>;
    configurations: Pick<TaxConfigurationRepository, 'findDefaultConfiguration'>;
    jurisdictions: Pick<TaxJurisdictionRepository, 'findActiveJurisdictions'>;
};
/**
 * Tax audit trail entry
 */
export type TaxAuditEntry = {
    id: string;
    timestamp: Instant;
    action: 'calculate' | 'apply' | 'refund' | 'exempt' | 'report';
    entity: 'payment' | 'subscription' | 'customer' | 'exemption';
    entityId: string;
    details: {
        before?: unknown;
        after?: unknown;
        reason?: string;
        userId?: string;
        metadata?: Record<string, unknown>;
    };
};
/** One succeeded payment of the period, with the tax recorded for it. */
export type TaxExportRow = {
    id: string;
    date: Instant;
    customerId: string | null;
    type: 'subscription' | 'one_time';
    amount: Money;
    tax: Money;
    /** Zero tax because the customer held a blanket exemption at the time */
    exempt: boolean;
    description: string;
};
/**
 * Tax Reporting and Compliance Service
 *
 * Provides comprehensive tax reporting, compliance tracking,
 * and audit trail functionality for tax operations.
 */
export declare class TaxReportingService {
    private readonly reads;
    constructor(reads: TaxReportReads);
    /**
     * Generate the tax compliance report of a period, from what the package stored: the succeeded
     * payments, the tax records and the exemptions. Stripe Tax has no report endpoint, so nothing is
     * fetched from it. `reportType` names the report; the records do not tell VAT from sales tax.
     * `jurisdiction` (any case) limits the tax, and the payments to those it taxed.
     */
    generateComplianceReport(params: {
        reportType: 'sales_and_use_tax' | 'vat' | 'gst';
        period: ReportingPeriod;
        jurisdiction?: string;
    }): Promise<TaxComplianceReport>;
    /**
     * Get customer tax summary for a specific year (UTC): the customer's succeeded payments with the
     * tax recorded on each, and the exemptions in force during the year.
     */
    getCustomerTaxSummary(customerId: CustomerId, year: number): Promise<CustomerTaxSummary>;
    /**
     * Create audit trail entry for tax-related actions. The entry is stored; `id` and `timestamp` are the stored ones.
     */
    createAuditEntry(entry: Omit<TaxAuditEntry, 'id' | 'timestamp'>): Promise<TaxAuditEntry>;
    /** The audit entries about one entity, oldest first. */
    getAuditTrail(entity: TaxAuditEntry['entity'], entityId: string): Promise<TaxAuditEntry[]>;
    /**
     * The next filing deadline of each jurisdiction we are registered in. A jurisdiction is listed
     * when it requires registration, has a monthly, quarterly or annual `filingFrequency`, and the
     * default tax configuration holds an active registration for its country. The deadline is the
     * end (UTC) of the month after the filing period closes: the jurisdiction row stores no due day,
     * so this is the common rule, not a statute. Nearest first.
     */
    getUpcomingDeadlines(asOf?: Instant): Promise<{
        jurisdiction: string;
        type: string;
        deadline: Instant;
        description: string;
        priority: 'high' | 'medium' | 'low';
    }[]>;
    /**
     * Validate tax compliance status from what is stored: every active jurisdiction that requires
     * registration needs an active registration for its country in the default tax configuration
     * (none, or an inactive one, is critical; a pending one is a warning), and exemptions ending
     * within 30 days are a warning.
     */
    validateComplianceStatus(): Promise<{
        status: 'compliant' | 'warning' | 'non_compliant';
        issues: {
            type: 'missing_registration' | 'expired_exemption' | 'overdue_filing' | 'missing_documentation';
            jurisdiction: string;
            description: string;
            severity: 'critical' | 'warning' | 'info';
        }[];
    }>;
    /**
     * Export tax data for external systems: one row per succeeded payment of the period with the tax
     * recorded for it, and with `includeExemptions` one row per exemption in force in the period.
     * CSV values are quoted when they need it, and text that a spreadsheet would run as a formula is
     * prefixed with a quote. XML text is escaped, and characters XML 1.0 cannot hold are dropped.
     */
    exportTaxData(params: {
        format: 'csv' | 'json' | 'xml';
        period: ReportingPeriod;
        includeExemptions?: boolean;
    }): Promise<{
        format: string;
        data: string;
        filename: string;
    }>;
    /**
     * The succeeded payments of the period with their tax. Tax per payment is what the tax records
     * hold under its payment id (sales less refunds); a payment with none carried none. Collected
     * tax is every record of the period, so it includes tax recorded without a payment id.
     */
    private aggregateLocalTransactions;
}
/**
 * Factory function to create TaxReportingService
 */
export declare function createTaxReportingService(reads: TaxReportReads): TaxReportingService;
/**
 * Tax Reporting and Compliance Module
 *
 * This module provides comprehensive tax reporting and compliance capabilities,
 * including audit trails, compliance validation, and regulatory reporting.
 *
 * ## Key Features:
 *
 * ### Compliance Reporting
 * - Generate sales tax, VAT, and GST reports
 * - Multi-jurisdiction support
 * - Automated deadline tracking
 * - Compliance status validation
 *
 * ### Customer Tax Summaries
 * - Annual tax summaries for customers
 * - Transaction-level tax breakdown
 * - Exemption tracking and validation
 * - Multi-currency support
 *
 * ### Audit and Documentation
 * - Complete audit trail for all tax operations
 * - Export capabilities for external systems
 * - Documentation management for exemptions
 * - Regulatory compliance validation
 *
 * ## Usage Examples:
 *
 * ```typescript
 * const reportingService = createTaxReportingService({ payments, ...createTaxRepositories(db, tables) });
 *
 * // Generate quarterly sales tax report
 * const report = await reportingService.generateComplianceReport({
 *   reportType: 'sales_and_use_tax',
 *   period: {
 *     year: 2024,
 *     quarter: 3,
 *     startDate: new Date('2024-07-01'),
 *     endDate: new Date('2024-09-30'),
 *   },
 *   jurisdiction: 'US',
 * });
 *
 * // Get customer tax summary
 * const customerSummary = await reportingService.getCustomerTaxSummary('cus_123', 2024);
 *
 * // Validate compliance status
 * const compliance = await reportingService.validateComplianceStatus();
 * ```
 */ 
//# sourceMappingURL=reporting.d.ts.map