import { z } from '@arki/contracts';
import type { TaxComplianceReport } from './reporting.js';
import type { TaxCalculationResult, TaxService } from './service.js';
export declare const taxConfigStatusSchema: z.ZodEnum<{
    active: "active";
    inactive: "inactive";
    pending: "pending";
}>;
export declare const taxCalculationModeSchema: z.ZodEnum<{
    automatic: "automatic";
    disabled: "disabled";
    manual: "manual";
}>;
export declare const taxBusinessTypeSchema: z.ZodEnum<{
    digital_goods: "digital_goods";
    mixed: "mixed";
    physical_goods: "physical_goods";
    saas: "saas";
    services: "services";
}>;
export declare const jurisdictionTypeSchema: z.ZodEnum<{
    city: "city";
    country: "country";
    county: "county";
    district: "district";
    province: "province";
    state: "state";
}>;
export declare const exemptionTypeSchema: z.ZodEnum<{
    customer: "customer";
    jurisdiction: "jurisdiction";
    product: "product";
    threshold: "threshold";
}>;
export declare const exemptionStatusSchema: z.ZodEnum<{
    active: "active";
    expired: "expired";
    pending_review: "pending_review";
    revoked: "revoked";
}>;
export declare const createTaxConfigSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    calculationMode: z.ZodDefault<z.ZodEnum<{
        automatic: "automatic";
        disabled: "disabled";
        manual: "manual";
    }>>;
    businessType: z.ZodDefault<z.ZodEnum<{
        digital_goods: "digital_goods";
        mixed: "mixed";
        physical_goods: "physical_goods";
        saas: "saas";
        services: "services";
    }>>;
    defaultTaxCode: z.ZodDefault<z.ZodString>;
    provider: z.ZodDefault<z.ZodString>;
    providerSettings: z.ZodOptional<z.ZodObject<{
        stripeSettings: z.ZodOptional<z.ZodObject<{
            calculateTaxAutomatically: z.ZodDefault<z.ZodBoolean>;
            taxIdCollection: z.ZodDefault<z.ZodBoolean>;
            useStripeTax: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    businessDetails: z.ZodObject<{
        businessName: z.ZodString;
        taxId: z.ZodOptional<z.ZodString>;
        address: z.ZodObject<{
            line1: z.ZodString;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodString;
            state: z.ZodString;
            country: z.ZodString;
            postalCode: z.ZodString;
        }, z.core.$strip>;
        registrations: z.ZodOptional<z.ZodArray<z.ZodObject<{
            country: z.ZodString;
            type: z.ZodString;
            number: z.ZodString;
            status: z.ZodEnum<{
                active: "active";
                inactive: "inactive";
                pending: "pending";
            }>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    features: z.ZodOptional<z.ZodObject<{
        collectTaxIds: z.ZodDefault<z.ZodBoolean>;
        issueInvoices: z.ZodDefault<z.ZodBoolean>;
        trackExemptions: z.ZodDefault<z.ZodBoolean>;
        generateReports: z.ZodDefault<z.ZodBoolean>;
        reverseChargeHandling: z.ZodDefault<z.ZodBoolean>;
        crossBorderCompliance: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const updateTaxConfigSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    calculationMode: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        automatic: "automatic";
        disabled: "disabled";
        manual: "manual";
    }>>>;
    businessType: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        digital_goods: "digital_goods";
        mixed: "mixed";
        physical_goods: "physical_goods";
        saas: "saas";
        services: "services";
    }>>>;
    defaultTaxCode: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    provider: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    providerSettings: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        stripeSettings: z.ZodOptional<z.ZodObject<{
            calculateTaxAutomatically: z.ZodDefault<z.ZodBoolean>;
            taxIdCollection: z.ZodDefault<z.ZodBoolean>;
            useStripeTax: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>>;
    }, z.core.$strip>>>;
    businessDetails: z.ZodOptional<z.ZodObject<{
        businessName: z.ZodString;
        taxId: z.ZodOptional<z.ZodString>;
        address: z.ZodObject<{
            line1: z.ZodString;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodString;
            state: z.ZodString;
            country: z.ZodString;
            postalCode: z.ZodString;
        }, z.core.$strip>;
        registrations: z.ZodOptional<z.ZodArray<z.ZodObject<{
            country: z.ZodString;
            type: z.ZodString;
            number: z.ZodString;
            status: z.ZodEnum<{
                active: "active";
                inactive: "inactive";
                pending: "pending";
            }>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    features: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        collectTaxIds: z.ZodDefault<z.ZodBoolean>;
        issueInvoices: z.ZodDefault<z.ZodBoolean>;
        trackExemptions: z.ZodDefault<z.ZodBoolean>;
        generateReports: z.ZodDefault<z.ZodBoolean>;
        reverseChargeHandling: z.ZodDefault<z.ZodBoolean>;
        crossBorderCompliance: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateConfigurationInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`txc_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `txc_${string}`, "out">, z.ZodTransform<`txc_${string}`, string & z.$brand<`txc_${string}`>>>;
    data: z.ZodObject<{
        description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        calculationMode: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
            automatic: "automatic";
            disabled: "disabled";
            manual: "manual";
        }>>>;
        businessType: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
            digital_goods: "digital_goods";
            mixed: "mixed";
            physical_goods: "physical_goods";
            saas: "saas";
            services: "services";
        }>>>;
        defaultTaxCode: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        provider: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        providerSettings: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            stripeSettings: z.ZodOptional<z.ZodObject<{
                calculateTaxAutomatically: z.ZodDefault<z.ZodBoolean>;
                taxIdCollection: z.ZodDefault<z.ZodBoolean>;
                useStripeTax: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strip>>;
        }, z.core.$strip>>>;
        businessDetails: z.ZodOptional<z.ZodObject<{
            businessName: z.ZodString;
            taxId: z.ZodOptional<z.ZodString>;
            address: z.ZodObject<{
                line1: z.ZodString;
                line2: z.ZodOptional<z.ZodString>;
                city: z.ZodString;
                state: z.ZodString;
                country: z.ZodString;
                postalCode: z.ZodString;
            }, z.core.$strip>;
            registrations: z.ZodOptional<z.ZodArray<z.ZodObject<{
                country: z.ZodString;
                type: z.ZodString;
                number: z.ZodString;
                status: z.ZodEnum<{
                    active: "active";
                    inactive: "inactive";
                    pending: "pending";
                }>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        features: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            collectTaxIds: z.ZodDefault<z.ZodBoolean>;
            issueInvoices: z.ZodDefault<z.ZodBoolean>;
            trackExemptions: z.ZodDefault<z.ZodBoolean>;
            generateReports: z.ZodDefault<z.ZodBoolean>;
            reverseChargeHandling: z.ZodDefault<z.ZodBoolean>;
            crossBorderCompliance: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const setDefaultConfigurationInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`txc_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `txc_${string}`, "out">, z.ZodTransform<`txc_${string}`, string & z.$brand<`txc_${string}`>>>;
}, z.core.$strip>;
/** A tax rate in percent, as a decimal string: `'19'`, `'7.5'`. Never negative, never above 100. */
export declare const taxRateSchema: z.ZodString;
export declare const createJurisdictionSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    type: z.ZodEnum<{
        city: "city";
        country: "country";
        county: "county";
        district: "district";
        province: "province";
        state: "state";
    }>;
    parentId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`txj_${string}`, string>>>;
    countryCode: z.ZodString;
    stateCode: z.ZodOptional<z.ZodString>;
    standardRate: z.ZodOptional<z.ZodString>;
    reducedRates: z.ZodOptional<z.ZodArray<z.ZodObject<{
        rate: z.ZodString;
        description: z.ZodString;
        applicableTo: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>>;
    taxIdRequired: z.ZodDefault<z.ZodBoolean>;
    registrationRequired: z.ZodDefault<z.ZodBoolean>;
    filingFrequency: z.ZodOptional<z.ZodString>;
    effectiveFrom: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    effectiveTo: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
}, z.core.$strip>;
export declare const getJurisdictionsByCountryInputSchema: z.ZodObject<{
    countryCode: z.ZodString;
}, z.core.$strip>;
export declare const getJurisdictionHierarchyInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`txj_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `txj_${string}`, "out">, z.ZodTransform<`txj_${string}`, string & z.$brand<`txj_${string}`>>>;
}, z.core.$strip>;
export declare const createExemptionSchema: z.ZodObject<{
    type: z.ZodEnum<{
        customer: "customer";
        jurisdiction: "jurisdiction";
        product: "product";
        threshold: "threshold";
    }>;
    customerId: z.ZodOptional<z.ZodString>;
    productCode: z.ZodOptional<z.ZodString>;
    jurisdictionId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`txj_${string}`, string>>>;
    exemptionCode: z.ZodString;
    reason: z.ZodString;
    certificateNumber: z.ZodOptional<z.ZodString>;
    validFrom: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    validTo: z.ZodOptional<z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>>;
    documents: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        url: z.ZodURL;
        uploadedAt: z.ZodString;
        expiresAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const getCustomerExemptionsInputSchema: z.ZodObject<{
    customerId: z.ZodString;
}, z.core.$strip>;
export declare const getExpiringExemptionsInputSchema: z.ZodObject<{
    days: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const approveExemptionInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`txe_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `txe_${string}`, "out">, z.ZodTransform<`txe_${string}`, string & z.$brand<`txe_${string}`>>>;
}, z.core.$strip>;
export declare const revokeExemptionInputSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<`txe_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `txe_${string}`, "out">, z.ZodTransform<`txe_${string}`, string & z.$brand<`txe_${string}`>>>;
}, z.core.$strip>;
export declare const taxCalculationInputSchema: z.ZodObject<{
    customerId: z.ZodString;
    lineItems: z.ZodArray<z.ZodObject<{
        amount: z.ZodPipe<z.ZodObject<{
            amount: z.ZodString;
            currency: z.ZodString;
        }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
            amount: string;
            currency: string;
        }>>;
        description: z.ZodString;
        reference: z.ZodString;
        taxCode: z.ZodOptional<z.ZodString>;
        planId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    currency: z.ZodString;
    customerDetails: z.ZodOptional<z.ZodObject<{
        address: z.ZodOptional<z.ZodObject<{
            line1: z.ZodOptional<z.ZodString>;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        taxIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            value: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const calculateSubscriptionTaxInputSchema: z.ZodObject<{
    customerId: z.ZodString;
    planAmount: z.ZodPipe<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>, z.ZodTransform<import("@arki/money").Money<string>, {
        amount: string;
        currency: string;
    }>>;
    planInterval: z.ZodEnum<{
        monthly: "monthly";
        yearly: "yearly";
    }>;
    taxCode: z.ZodOptional<z.ZodString>;
    customerDetails: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        address: z.ZodOptional<z.ZodObject<{
            line1: z.ZodOptional<z.ZodString>;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        taxIds: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            value: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const taxIdValidationSchema: z.ZodObject<{
    type: z.ZodString;
    value: z.ZodString;
    country: z.ZodString;
}, z.core.$strip>;
export declare const getCustomerTaxSummaryInputSchema: z.ZodObject<{
    customerId: z.ZodString;
    year: z.ZodNumber;
}, z.core.$strip>;
export declare const generateComplianceReportInputSchema: z.ZodObject<{
    reportType: z.ZodEnum<{
        gst: "gst";
        sales_and_use_tax: "sales_and_use_tax";
        vat: "vat";
    }>;
    year: z.ZodNumber;
    quarter: z.ZodOptional<z.ZodNumber>;
    month: z.ZodOptional<z.ZodNumber>;
    jurisdiction: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const exportTaxDataInputSchema: z.ZodObject<{
    format: z.ZodEnum<{
        csv: "csv";
        json: "json";
        xml: "xml";
    }>;
    year: z.ZodNumber;
    quarter: z.ZodOptional<z.ZodNumber>;
    month: z.ZodOptional<z.ZodNumber>;
    includeExemptions: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const getCustomerAnnualSummaryInputSchema: z.ZodObject<{
    customerId: z.ZodString;
    year: z.ZodNumber;
}, z.core.$strip>;
/** What `calculateTax` and `calculateSubscriptionTax` answer. */
export declare const taxCalculationResultSchema: z.ZodObject<{
    subtotal: z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>;
    taxAmount: z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>;
    total: z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>;
    taxInclusive: z.ZodBoolean;
    breakdown: z.ZodArray<z.ZodObject<{
        jurisdiction: z.ZodString;
        rate: z.ZodNumber;
        amount: z.ZodObject<{
            amount: z.ZodString;
            currency: z.ZodString;
        }, z.core.$strip>;
        taxCode: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    applicableTaxIds: z.ZodArray<z.ZodString>;
    appliedExemptionIds: z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`txe_${string}`, string>> | z.ZodPipe<z.core.$ZodBranded<z.ZodString, `txe_${string}`, "out">, z.ZodTransform<`txe_${string}`, string & z.$brand<`txe_${string}`>>>>;
}, z.core.$strip>;
export declare function taxCalculationResultJson(result: TaxCalculationResult): z.input<typeof taxCalculationResultSchema>;
/** What `TaxService.getCustomerTaxSummary` answers. */
export declare const customerTaxSummarySchema: z.ZodObject<{
    totalTaxPaid: z.ZodArray<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>>;
    totalTransactions: z.ZodNumber;
    breakdown: z.ZodArray<z.ZodObject<{
        jurisdiction: z.ZodString;
        taxAmount: z.ZodObject<{
            amount: z.ZodString;
            currency: z.ZodString;
        }, z.core.$strip>;
        transactionCount: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare function customerTaxSummaryJson(summary: Awaited<ReturnType<TaxService['getCustomerTaxSummary']>>): z.input<typeof customerTaxSummarySchema>;
/** What `generateComplianceReport` answers. */
export declare const taxComplianceReportSchema: z.ZodObject<{
    id: z.ZodString;
    reportType: z.ZodEnum<{
        gst: "gst";
        sales_and_use_tax: "sales_and_use_tax";
        vat: "vat";
    }>;
    period: z.ZodObject<{
        year: z.ZodNumber;
        quarter: z.ZodOptional<z.ZodNumber>;
        month: z.ZodOptional<z.ZodNumber>;
        startDate: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
        endDate: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    }, z.core.$strip>;
    jurisdiction: z.ZodString;
    totalSales: z.ZodArray<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>>;
    totalTaxCollected: z.ZodArray<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>>;
    exemptSales: z.ZodArray<z.ZodObject<{
        amount: z.ZodString;
        currency: z.ZodString;
    }, z.core.$strip>>;
    transactions: z.ZodNumber;
    generatedAt: z.ZodType<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant, z.core.$ZodTypeInternals<import("temporal-spec").Temporal.Instant, string | Date | import("temporal-spec").Temporal.Instant>>;
    summary: z.ZodObject<{
        taxableTransactions: z.ZodNumber;
        exemptTransactions: z.ZodNumber;
        averageTaxRate: z.ZodNumber;
        topTaxCategories: z.ZodArray<z.ZodObject<{
            category: z.ZodString;
            sales: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
            tax: z.ZodObject<{
                amount: z.ZodString;
                currency: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare function taxComplianceReportJson(report: TaxComplianceReport): z.input<typeof taxComplianceReportSchema>;
export type CreateTaxConfig = z.infer<typeof createTaxConfigSchema>;
export type UpdateTaxConfig = z.infer<typeof updateTaxConfigSchema>;
export type UpdateConfigurationInput = z.infer<typeof updateConfigurationInputSchema>;
export type SetDefaultConfigurationInput = z.infer<typeof setDefaultConfigurationInputSchema>;
export type CreateJurisdiction = z.infer<typeof createJurisdictionSchema>;
export type GetJurisdictionsByCountryInput = z.infer<typeof getJurisdictionsByCountryInputSchema>;
export type GetJurisdictionHierarchyInput = z.infer<typeof getJurisdictionHierarchyInputSchema>;
export type CreateExemption = z.infer<typeof createExemptionSchema>;
export type GetCustomerExemptionsInput = z.infer<typeof getCustomerExemptionsInputSchema>;
export type GetExpiringExemptionsInput = z.infer<typeof getExpiringExemptionsInputSchema>;
export type ApproveExemptionInput = z.infer<typeof approveExemptionInputSchema>;
export type RevokeExemptionInput = z.infer<typeof revokeExemptionInputSchema>;
export type TaxCalculationInput = z.infer<typeof taxCalculationInputSchema>;
export type CalculateSubscriptionTaxInput = z.infer<typeof calculateSubscriptionTaxInputSchema>;
export type TaxIdValidation = z.infer<typeof taxIdValidationSchema>;
export type GetCustomerTaxSummaryInput = z.infer<typeof getCustomerTaxSummaryInputSchema>;
export type GenerateComplianceReportInput = z.infer<typeof generateComplianceReportInputSchema>;
export type ExportTaxDataInput = z.infer<typeof exportTaxDataInputSchema>;
export type GetCustomerAnnualSummaryInput = z.infer<typeof getCustomerAnnualSummaryInputSchema>;
//# sourceMappingURL=contracts.d.ts.map