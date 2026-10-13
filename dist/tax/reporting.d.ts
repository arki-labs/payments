import type { Instant } from '@arki/date';
import type { Money } from '@arki/money';
import type { StripeProvider } from '../core/providers/stripe-provider.js';
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
    totalSales: Money;
    totalTaxCollected: Money;
    exemptSales: Money;
    transactions: number;
    generatedAt: Instant;
    status: 'pending' | 'completed' | 'failed';
    downloadUrl?: string;
    summary: {
        taxableTransactions: number;
        exemptTransactions: number;
        averageTaxRate: number;
        topTaxCategories: {
            category: string;
            sales: Money;
            tax: Money;
        }[];
    };
};
/**
 * Customer tax summary for compliance
 */
export type CustomerTaxSummary = {
    customerId: string;
    year: number;
    totalPaid: Money;
    totalTax: Money;
    transactions: {
        id: string;
        date: Instant;
        amount: Money;
        tax: Money;
        type: 'subscription' | 'one_time';
        description: string;
    }[];
    exemptions: {
        type: string;
        amount: Money;
        reason: string;
    }[];
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
/**
 * Tax Reporting and Compliance Service
 *
 * Provides comprehensive tax reporting, compliance tracking,
 * and audit trail functionality for tax operations.
 */
export declare class TaxReportingService {
    private readonly stripeProvider;
    constructor(stripeProvider: StripeProvider);
    /**
     * Generate comprehensive tax compliance report
     */
    generateComplianceReport(params: {
        reportType: 'sales_and_use_tax' | 'vat' | 'gst';
        period: ReportingPeriod;
        jurisdiction?: string;
    }): Promise<TaxComplianceReport>;
    /**
     * Get customer tax summary for a specific year
     */
    getCustomerTaxSummary(customerId: string, year: number): Promise<CustomerTaxSummary>;
    /**
     * Create audit trail entry for tax-related actions
     */
    createAuditEntry(entry: Omit<TaxAuditEntry, 'id' | 'timestamp'>): Promise<TaxAuditEntry>;
    /**
     * Get upcoming tax filing deadlines
     */
    getUpcomingDeadlines(): Promise<{
        jurisdiction: string;
        type: string;
        deadline: Instant;
        description: string;
        priority: 'high' | 'medium' | 'low';
    }[]>;
    /**
     * Validate tax compliance status
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
     * Export tax data for external systems
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
    private aggregateLocalTransactions;
    private getCustomerTransactions;
    private getCustomerExemptions;
    private formatAsCSV;
    private formatAsXML;
}
/**
 * Factory function to create TaxReportingService
 */
export declare function createTaxReportingService(stripeProvider: StripeProvider): TaxReportingService;
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
 * const reportingService = createTaxReportingService(db, stripeProvider);
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