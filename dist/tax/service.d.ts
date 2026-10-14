import type { Instant } from '@arki/date';
import { Money } from '@arki/money';
import type { StripeProvider } from '../core/providers/stripe-provider.js';
import type { CustomerId, PaymentId, SubscriptionId } from '../core/types.js';
import type { TaxExemptionId } from './primitives.js';
import type { TaxExemptionRepository, TaxJurisdictionRepository, TaxRecordRepository } from './repository.js';
import type { TaxJurisdiction } from './types.js';
/** What `TaxService` reads. A `TaxExemptionRepository` and a `TaxJurisdictionRepository` fit. */
export type TaxServiceReads = {
    exemptions: Pick<TaxExemptionRepository, 'findApplicableExemptions'>;
    jurisdictions: Pick<TaxJurisdictionRepository, 'findJurisdictionById'>;
    records: Pick<TaxRecordRepository, 'findByReference' | 'recordMany' | 'totalsByJurisdiction' | 'countSaleTransactions'>;
};
type TaxBreakdownLine = Awaited<ReturnType<StripeProvider['calculateTax']>>['taxBreakdown'][number];
/**
 * True when Stripe's tax line is the tax of our jurisdiction. The display name alone cannot say:
 * Georgia is a US state and a country. The line must be in the same country, at the same level, and
 * in the same state. Stripe gives no code below the state, so a city, county or district must also
 * carry the same name. A jurisdiction that cannot be placed this way matches nothing: tax is charged
 * rather than wrongly waived.
 */
export declare function jurisdictionOwnsLine(jurisdiction: TaxJurisdiction, line: TaxBreakdownLine): boolean;
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
    /** The customer's tax IDs whose format is valid for their type and country. */
    applicableTaxIds: string[];
    /** The exemptions that kept tax off this sale, in whole or in part. */
    appliedExemptionIds: TaxExemptionId[];
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
    /** The tax in each jurisdiction, as recorded. They add up to `taxAmount`. */
    breakdown: {
        jurisdiction: string;
        taxAmount: Money;
    }[];
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
    private readonly reads;
    constructor(stripeProvider: StripeProvider, reads: TaxServiceReads);
    /**
     * Calculate tax for a potential purchase
     * This is used for price previews and checkout calculations
     *
     * Exemptions in force are applied. An active exemption keeps tax off a line when it is the
     * customer's own, or open to every customer but then tied to a product that is the line's tax
     * code or plan (a global exemption with no product would zero everyone's tax, so it never applies); one tied to a jurisdiction removes that jurisdiction's tax from the
     * breakdown, unless the tax is inclusive (it is part of the price then, and stays). A line that is
     * wholly exempt is not sent to Stripe. An exemption needs what its type says it is for (a customer, a product or a
     * jurisdiction): one without would exempt every sale, so it is never applied.
     */
    calculateTax(input: TaxCalculationInput): Promise<TaxCalculationResult>;
    /**
     * Create a tax transaction for compliance tracking
     * Called when a payment is successful or a refund is processed
     *
     * `breakdown` is the tax the checkout's `calculateTax` returned for this sale. It is stored, one
     * record per jurisdiction and rate, and is what `getCustomerTaxSummary` and the compliance report
     * add up. Recording a `reference` twice (for the same `type`) returns the first record and does
     * not call the provider again. A failure is the caller's to handle, as in `calculateTax`.
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
        /** The tax by jurisdiction, from `calculateTax`; every amount is in `currency` */
        breakdown: TaxCalculationResult['breakdown'];
        /** When the sale or refund happened. Defaults to now. */
        occurredAt?: Instant;
        /** For a `refund`: the `reference` of the recorded sale it reverses. Required there, ignored for a sale. */
        originalReference?: string;
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
     * Check the format of a customer's tax ID. The format only: whether the number is registered
     * takes the registry (VIES, HMRC, the IRS). `format: 'unknown'` means no format is known for
     * the type (or for the country under `eu_vat`); the ID is then not `valid`.
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
     *
     * Built from the tax records of the calendar year (UTC): what each jurisdiction collected on the
     * customer's sales, less what it gave back on refunds. Totals are one `Money` per currency
     * (never added across currencies), ordered by currency code; `breakdown` has one row per
     * jurisdiction and currency. `totalTransactions` counts the sales that carried tax.
     */
    getCustomerTaxSummary(params: {
        customerId: CustomerId;
        year: number;
    }): Promise<{
        totalTaxPaid: Money[];
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
export declare function createTaxService(stripeProvider: StripeProvider, reads: TaxServiceReads): TaxService;
export {};
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