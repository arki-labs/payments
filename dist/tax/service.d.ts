import type { Instant } from '@arki/date';
import { Money } from '@arki/money';
import type { StripeProvider } from '../core/providers/stripe-provider.js';
import type { CustomerId, PaymentId, SubscriptionId } from '../core/types.js';
/**
 * Tax calculation input for subscriptions and one-time payments
 */
export type TaxCalculationInput = {
    customerId: CustomerId;
    /** Every line item is in `currency` */
    lineItems: {
        amount: Money;
        description: string;
        reference: string;
        taxCode?: string;
        planId?: string;
    }[];
    currency: string;
    customerDetails?: {
        address?: {
            line1?: string;
            line2?: string;
            city?: string;
            state?: string;
            postalCode?: string;
            country?: string;
        };
        taxIds?: {
            type: string;
            value: string;
        }[];
    };
};
/**
 * Tax calculation result with detailed breakdown.
 * Stripe Tax computes and rounds the tax; the amounts here are its, exactly.
 */
export type TaxCalculationResult = {
    subtotal: Money;
    taxAmount: Money;
    total: Money;
    taxInclusive: boolean;
    breakdown: {
        jurisdiction: string;
        rate: number;
        amount: Money;
        taxCode?: string;
    }[];
    applicableTaxIds: string[];
};
/**
 * Tax transaction for compliance tracking
 */
export type TaxTransaction = {
    id: string;
    reference: string;
    type: 'sale' | 'refund';
    amount: Money;
    taxAmount: Money;
    customerId?: CustomerId;
    paymentId?: PaymentId;
    subscriptionId?: SubscriptionId;
    createdAt: Instant;
    jurisdiction: string;
    taxCode?: string;
};
/**
 * Tax Service for managing tax calculations, compliance, and reporting
 *
 * This service provides a high-level interface for tax operations,
 * integrating with Stripe Tax for calculations while maintaining
 * audit trails and business logic.
 */
export declare class TaxService {
    private readonly stripeProvider;
    constructor(stripeProvider: StripeProvider);
    /**
     * Calculate tax for a potential purchase
     * This is used for price previews and checkout calculations
     */
    calculateTax(input: TaxCalculationInput): Promise<TaxCalculationResult>;
    /**
     * Create a tax transaction for compliance tracking
     * Called when a payment is successful or a refund is processed
     */
    createTaxTransaction(params: {
        reference: string;
        type: 'sale' | 'refund';
        customerId?: CustomerId;
        paymentId?: PaymentId;
        subscriptionId?: SubscriptionId;
        /** Every line item is in `currency` */
        lineItems: {
            amount: Money;
            description: string;
            reference: string;
            taxCode?: string;
        }[];
        currency: string;
        customerDetails?: TaxCalculationInput['customerDetails'];
    }): Promise<TaxTransaction>;
    /**
     * Get tax settings and configuration
     * Useful for displaying tax information to customers
     */
    getTaxSettings(): Promise<{
        defaultTaxCode: string;
        headOfficeLocation?: {
            address: {
                country: string;
                state?: string;
                city?: string;
                line1?: string;
                postalCode?: string;
            };
        };
        taxRegistrations: {
            country: string;
            type: string;
            status: string;
        }[];
    }>;
    /**
     * Calculate tax for subscription plans
     * Special handling for recurring billing scenarios
     */
    calculateSubscriptionTax(params: {
        customerId: CustomerId;
        planAmount: Money;
        planInterval: 'monthly' | 'yearly' | 'weekly' | 'daily';
        taxCode?: string;
        customerDetails?: TaxCalculationInput['customerDetails'];
    }): Promise<TaxCalculationResult>;
    /**
     * Calculate tax for one-time payments (tips, donations)
     * Special handling for non-recurring transactions
     */
    calculateOneTimeTax(params: {
        customerId: CustomerId;
        amount: Money;
        description: string;
        taxCode?: string;
        customerDetails?: TaxCalculationInput['customerDetails'];
    }): Promise<TaxCalculationResult>;
    /**
     * Get tax compliance report
     * For generating tax reports for filing purposes
     */
    generateTaxReport(params: {
        reportType: 'sales_and_use_tax' | 'vat' | 'gst';
        startDate: Instant;
        endDate: Instant;
        jurisdiction?: string;
    }): Promise<{
        id: string;
        status: 'pending' | 'succeeded' | 'failed';
        downloadUrl?: string;
    }>;
    /**
     * Validate tax ID for a customer
     * Helps ensure compliance and accurate tax calculation
     */
    validateTaxId(taxId: {
        type: string;
        value: string;
        country: string;
    }): Promise<{
        valid: boolean;
        format: 'valid' | 'invalid' | 'unknown';
        country?: string;
        type?: string;
    }>;
    /**
     * Get tax summary for a customer
     * Useful for customer portals and tax reporting
     */
    getCustomerTaxSummary(_params: {
        customerId: CustomerId;
        year: number;
    }): Promise<{
        totalTaxPaid: Money;
        totalTransactions: number;
        breakdown: {
            jurisdiction: string;
            taxAmount: Money;
            transactionCount: number;
        }[];
    }>;
}
/**
 * Factory function to create TaxService
 */
export declare function createTaxService(stripeProvider: StripeProvider): TaxService;
/**
 * Tax Service Module
 *
 * This module provides comprehensive tax calculation and compliance capabilities
 * for the payment system, leveraging Stripe Tax for accurate calculations while
 * maintaining business logic and audit trails.
 *
 * ## Key Features:
 *
 * ### Tax Calculation
 * - **Real-time Calculations**: Accurate tax rates based on customer location
 * - **Multi-jurisdiction Support**: Handles VAT, GST, sales tax, and more
 * - **Product-specific Tax Codes**: Different rates for SaaS vs. digital goods
 *
 * ### Compliance Tracking
 * - **Transaction Recording**: Complete audit trail for tax purposes
 * - **Tax ID Validation**: Verify customer tax IDs for accuracy
 * - **Compliance Reporting**: Generate reports for tax filing
 *
 * ### Integration Points
 * - Subscription tax calculation for recurring billing
 * - One-time payment tax for tips and donations
 * - Refund tax handling for compliance
 * - Customer portal tax summaries
 *
 * ## Common Tax Codes:
 * - `txcd_10000000`: General - tangible personal property
 * - `txcd_10103000`: Software as a Service (SaaS)
 * - `txcd_10501000`: Digital products
 * - `txcd_99999999`: Nontaxable
 *
 * ## Usage Example:
 *
 * ```typescript
 * import { createTaxService } from '@/features/payments/tax';
 *
 * const taxService = createTaxService(db, stripeProvider);
 *
 * // Calculate tax for a subscription
 * const taxResult = await taxService.calculateSubscriptionTax({
 *   customerId: 'cus_123',
 *   planAmount: money('29.99', 'USD'),
 *   planInterval: 'monthly',
 *   customerDetails: {
 *     address: {
 *       country: 'US',
 *       state: 'CA',
 *       postalCode: '94105',
 *     },
 *   },
 * });
 *
 * formatMoney(taxResult.subtotal); // '$29.99'
 * formatMoney(taxResult.taxAmount);
 * formatMoney(taxResult.total);
 * ```
 */
//# sourceMappingURL=service.d.ts.map