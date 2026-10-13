import type { PgSchema } from 'drizzle-orm/pg-core';
export type CreateTaxTablesDeps = {
    schema: PgSchema;
};
export declare function createTaxTables({ schema }: CreateTaxTablesDeps): {
    enums: {
        taxConfigStatusEnum: import("drizzle-orm/pg-core").PgEnum<["active", "inactive", "pending"]>;
        taxCalculationModeEnum: import("drizzle-orm/pg-core").PgEnum<["automatic", "manual", "disabled"]>;
        taxBusinessTypeEnum: import("drizzle-orm/pg-core").PgEnum<["saas", "digital_goods", "physical_goods", "services", "mixed"]>;
        jurisdictionTypeEnum: import("drizzle-orm/pg-core").PgEnum<["country", "state", "province", "city", "county", "district"]>;
        exemptionTypeEnum: import("drizzle-orm/pg-core").PgEnum<["customer", "product", "jurisdiction", "threshold"]>;
        exemptionStatusEnum: import("drizzle-orm/pg-core").PgEnum<["active", "expired", "revoked", "pending_review"]>;
    };
    taxConfigurations: import("drizzle-orm/pg-core").PgTableWithColumns<{
        name: "tax_configurations";
        schema: string;
        columns: {
            id: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `txc_${string}`>>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "string";
                data: `txc_${string}`;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            name: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            description: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            status: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["active", "inactive", "pending"]>, "active" | "inactive" | "pending">>>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "string enum";
                data: "active" | "inactive" | "pending";
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["active", "inactive", "pending"];
                identity: undefined;
                generated: undefined;
            }>;
            calculationMode: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["automatic", "manual", "disabled"]>, "automatic" | "disabled" | "manual">>>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "string enum";
                data: "automatic" | "disabled" | "manual";
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["automatic", "manual", "disabled"];
                identity: undefined;
                generated: undefined;
            }>;
            businessType: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["saas", "digital_goods", "physical_goods", "services", "mixed"]>, "digital_goods" | "mixed" | "physical_goods" | "saas" | "services">>>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "string enum";
                data: "digital_goods" | "mixed" | "physical_goods" | "saas" | "services";
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["saas", "digital_goods", "physical_goods", "services", "mixed"];
                identity: undefined;
                generated: undefined;
            }>;
            defaultTaxCode: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            provider: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            providerSettings: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, {
                stripeSettings?: {
                    calculateTaxAutomatically: boolean;
                    taxIdCollection: boolean;
                    useStripeTax: boolean;
                };
            }>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "object json";
                data: {
                    stripeSettings?: {
                        calculateTaxAutomatically: boolean;
                        taxIdCollection: boolean;
                        useStripeTax: boolean;
                    };
                };
                driverParam: unknown;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            businessDetails: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, {
                businessName: string;
                taxId?: string;
                address: {
                    line1: string;
                    line2?: string;
                    city: string;
                    state: string;
                    country: string;
                    postalCode: string;
                };
                registrations?: {
                    country: string;
                    type: string;
                    number: string;
                    status: 'active' | 'inactive' | 'pending';
                }[];
            }>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "object json";
                data: {
                    businessName: string;
                    taxId?: string;
                    address: {
                        line1: string;
                        line2?: string;
                        city: string;
                        state: string;
                        country: string;
                        postalCode: string;
                    };
                    registrations?: {
                        country: string;
                        type: string;
                        number: string;
                        status: 'active' | 'inactive' | 'pending';
                    }[];
                };
                driverParam: unknown;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            taxRules: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, {
                exemptions?: {
                    country: string;
                    reason: string;
                    taxCode?: string;
                }[];
                overrides?: {
                    country: string;
                    state?: string;
                    rate: number;
                    description: string;
                }[];
                thresholds?: {
                    country: string;
                    amount: number;
                    currency: string;
                    description: string;
                }[];
            }>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "object json";
                data: {
                    exemptions?: {
                        country: string;
                        reason: string;
                        taxCode?: string;
                    }[];
                    overrides?: {
                        country: string;
                        state?: string;
                        rate: number;
                        description: string;
                    }[];
                    thresholds?: {
                        country: string;
                        amount: number;
                        currency: string;
                        description: string;
                    }[];
                };
                driverParam: unknown;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            features: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, {
                collectTaxIds: boolean;
                issueInvoices: boolean;
                trackExemptions: boolean;
                generateReports: boolean;
                reverseChargeHandling: boolean;
                crossBorderCompliance: boolean;
            }>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "object json";
                data: {
                    collectTaxIds: boolean;
                    issueInvoices: boolean;
                    trackExemptions: boolean;
                    generateReports: boolean;
                    reverseChargeHandling: boolean;
                    crossBorderCompliance: boolean;
                };
                driverParam: unknown;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            isDefault: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "boolean";
                data: boolean;
                driverParam: boolean;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            createdBy: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            updatedBy: import("drizzle-orm/pg-core").PgBuildColumn<"tax_configurations", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "tax_configurations";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
        };
        dialect: 'pg';
    }>;
    taxJurisdictions: import("drizzle-orm/pg-core").PgTableWithColumns<{
        name: "tax_jurisdictions";
        schema: string;
        columns: {
            id: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `txj_${string}`>>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "string";
                data: `txj_${string}`;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            name: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            code: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            type: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["country", "state", "province", "city", "county", "district"]>, "city" | "country" | "county" | "district" | "province" | "state">>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "string enum";
                data: "city" | "country" | "county" | "district" | "province" | "state";
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["country", "state", "province", "city", "county", "district"];
                identity: undefined;
                generated: undefined;
            }>;
            parentId: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txj_${string}`>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "string";
                data: `txj_${string}`;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            countryCode: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            stateCode: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            standardRate: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            reducedRates: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, {
                rate: string;
                description: string;
                applicableTo: string[];
            }[]>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "object json";
                data: {
                    rate: string;
                    description: string;
                    applicableTo: string[];
                }[];
                driverParam: unknown;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            taxIdRequired: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "boolean";
                data: boolean;
                driverParam: boolean;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            registrationRequired: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "boolean";
                data: boolean;
                driverParam: boolean;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            filingFrequency: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            isActive: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgBooleanBuilder>>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "boolean";
                data: boolean;
                driverParam: boolean;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            effectiveFrom: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            effectiveTo: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"tax_jurisdictions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "tax_jurisdictions";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
        };
        dialect: 'pg';
    }>;
    taxExemptions: import("drizzle-orm/pg-core").PgTableWithColumns<{
        name: "tax_exemptions";
        schema: string;
        columns: {
            id: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>>, `txe_${string}`>>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "string";
                data: `txe_${string}`;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            type: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["customer", "product", "jurisdiction", "threshold"]>, "customer" | "jurisdiction" | "product" | "threshold">>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "string enum";
                data: "customer" | "jurisdiction" | "product" | "threshold";
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["customer", "product", "jurisdiction", "threshold"];
                identity: undefined;
                generated: undefined;
            }>;
            status: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgEnumColumnBuilder<["active", "expired", "revoked", "pending_review"]>, "active" | "expired" | "pending_review" | "revoked">>>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "string enum";
                data: "active" | "expired" | "pending_review" | "revoked";
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["active", "expired", "revoked", "pending_review"];
                identity: undefined;
                generated: undefined;
            }>;
            customerId: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            productCode: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            jurisdictionId: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txj_${string}`>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "string";
                data: `txj_${string}`;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            exemptionCode: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            reason: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgTextBuilder<[string, ...string[]]>>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            certificateNumber: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            validFrom: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            validTo: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            documents: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgJsonbBuilder, {
                type: string;
                url: string;
                uploadedAt: string;
                expiresAt?: string;
            }[]>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "object json";
                data: {
                    type: string;
                    url: string;
                    uploadedAt: string;
                    expiresAt?: string;
                }[];
                driverParam: unknown;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            createdAt: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            updatedAt: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>>>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            createdBy: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            approvedBy: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "string";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
            approvedAt: import("drizzle-orm/pg-core").PgBuildColumn<"tax_exemptions", import("drizzle-orm/pg-core").PgCustomColumnBuilder<{
                dataType: 'custom';
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
            }>, {
                name: string;
                tableName: "tax_exemptions";
                dataType: "custom";
                data: import("temporal-spec").Temporal.Instant;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                identity: undefined;
                generated: undefined;
            }>;
        };
        dialect: 'pg';
    }>;
    foreignKeys: {
        taxConfigForeignKeys: {
            required: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `txc_${string}`>;
            optional: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txc_${string}`>;
        };
        taxJurisdictionForeignKeys: {
            required: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `txj_${string}`>;
            optional: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txj_${string}`>;
        };
        taxExemptionForeignKeys: {
            required: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>>, `txe_${string}`>;
            optional: (name: string, options?: {
                onDelete?: 'cascade' | 'restrict' | 'no action' | 'set null' | 'set default';
            }) => import("drizzle-orm/pg-core").Set$Type<import("drizzle-orm/pg-core").PgVarcharBuilder<[string, ...string[]]>, `txe_${string}`>;
        };
    };
};
export type TaxTables = ReturnType<typeof createTaxTables>;
//# sourceMappingURL=tables.d.ts.map