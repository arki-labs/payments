import { sql } from 'drizzle-orm';
import { bigint, boolean, check, index, jsonb, numeric, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { instant } from '@arki/db/temporal';
import { exemptionStatusValues, exemptionTypeValues, jurisdictionTypeValues, taxBusinessTypeValues, taxCalculationModeValues, taxConfigIdFactory, taxAuditEntryIdFactory, taxConfigStatusValues, taxExemptionIdFactory, taxJurisdictionIdFactory, taxRecordIdFactory, taxRecordTypeValues, } from './primitives.js';
export function createTaxTables({ schema }) {
    const taxConfigStatusEnum = schema.enum('tax_config_status', taxConfigStatusValues);
    const taxCalculationModeEnum = schema.enum('tax_calculation_mode', taxCalculationModeValues);
    const taxBusinessTypeEnum = schema.enum('tax_business_type', taxBusinessTypeValues);
    const jurisdictionTypeEnum = schema.enum('jurisdiction_type', jurisdictionTypeValues);
    const exemptionTypeEnum = schema.enum('exemption_type', exemptionTypeValues);
    const exemptionStatusEnum = schema.enum('exemption_status', exemptionStatusValues);
    const taxRecordTypeEnum = schema.enum('tax_record_type', taxRecordTypeValues);
    const taxConfigurations = schema.table('tax_configurations', {
        id: taxConfigIdFactory.primaryColumn(),
        name: varchar('name', { length: 255 }).notNull(),
        description: text('description'),
        status: taxConfigStatusEnum('status').$type().notNull().default('active'),
        calculationMode: taxCalculationModeEnum('calculation_mode')
            .$type()
            .notNull()
            .default('automatic'),
        businessType: taxBusinessTypeEnum('business_type').$type().notNull().default('saas'),
        defaultTaxCode: varchar('default_tax_code', { length: 50 }).notNull().default('txcd_10103000'),
        provider: varchar('provider', { length: 50 }).notNull().default('stripe'),
        providerSettings: jsonb('provider_settings').$type(),
        businessDetails: jsonb('business_details').$type(),
        taxRules: jsonb('tax_rules').$type(),
        features: jsonb('features').$type(),
        isDefault: boolean('is_default').notNull().default(false),
        createdAt: instant('created_at')
            .notNull()
            .default(sql `now()`),
        updatedAt: instant('updated_at')
            .notNull()
            .default(sql `now()`),
        createdBy: varchar('created_by', { length: 255 }),
        updatedBy: varchar('updated_by', { length: 255 }),
    });
    const taxJurisdictions = schema.table('tax_jurisdictions', {
        id: taxJurisdictionIdFactory.primaryColumn(),
        name: varchar('name', { length: 255 }).notNull(),
        code: varchar('code', { length: 20 }).notNull(),
        type: jurisdictionTypeEnum('type').$type().notNull(),
        parentId: taxJurisdictionIdFactory.optionalForeignKey('parent_id', () => taxJurisdictions.id),
        countryCode: varchar('country_code', { length: 2 }).notNull(),
        stateCode: varchar('state_code', { length: 10 }),
        standardRate: varchar('standard_rate', { length: 10 }),
        reducedRates: jsonb('reduced_rates').$type(),
        taxIdRequired: boolean('tax_id_required').notNull().default(false),
        registrationRequired: boolean('registration_required').notNull().default(false),
        filingFrequency: varchar('filing_frequency', { length: 50 }),
        isActive: boolean('is_active').notNull().default(true),
        effectiveFrom: instant('effective_from'),
        effectiveTo: instant('effective_to'),
        createdAt: instant('created_at')
            .notNull()
            .default(sql `now()`),
        updatedAt: instant('updated_at')
            .notNull()
            .default(sql `now()`),
    });
    const taxExemptions = schema.table('tax_exemptions', {
        id: taxExemptionIdFactory.primaryColumn(),
        type: exemptionTypeEnum('type').$type().notNull(),
        /** New exemptions wait for review: only `approveExemption` makes one `active`, and only an `active` one is applied to a sale. */
        status: exemptionStatusEnum('status').$type().notNull().default('pending_review'),
        customerId: varchar('customer_id', { length: 255 }),
        productCode: varchar('product_code', { length: 100 }),
        jurisdictionId: taxJurisdictionIdFactory.optionalForeignKey('jurisdiction_id', () => taxJurisdictions.id),
        exemptionCode: varchar('exemption_code', { length: 50 }).notNull(),
        reason: text('reason').notNull(),
        certificateNumber: varchar('certificate_number', { length: 100 }),
        validFrom: instant('valid_from').notNull(),
        validTo: instant('valid_to'),
        documents: jsonb('documents').$type(),
        createdAt: instant('created_at')
            .notNull()
            .default(sql `now()`),
        updatedAt: instant('updated_at')
            .notNull()
            .default(sql `now()`),
        createdBy: varchar('created_by', { length: 255 }),
        approvedBy: varchar('approved_by', { length: 255 }),
        approvedAt: instant('approved_at'),
    }, (_table) => [
        check('tax_exemptions_has_scope', sql `"customer_id" IS NOT NULL OR "product_code" IS NOT NULL OR "jurisdiction_id" IS NOT NULL`),
        check('tax_exemptions_valid_to_not_before_valid_from', sql `"valid_to" IS NULL OR "valid_to" >= "valid_from"`),
    ]);
    /**
     * The tax a sale or a refund carried in one jurisdiction, written when the transaction is
     * recorded. One row per (type, reference, jurisdiction, rate). The customer's tax summary and the
     * compliance report add these up; nothing else stores per-jurisdiction tax.
     */
    const taxRecords = schema.table('tax_records', {
        id: taxRecordIdFactory.primaryColumn(),
        /** The caller's id for the transaction. Recording the same one again changes nothing. */
        reference: varchar('reference', { length: 255 }).notNull(),
        type: taxRecordTypeEnum('type').$type().notNull(),
        /** The jurisdiction as the tax calculation named it, such as `California`. */
        jurisdiction: varchar('jurisdiction', { length: 255 }).notNull(),
        /** Percent, such as `19.0000`. */
        rate: numeric('rate', { precision: 8, scale: 4, mode: 'string' }).notNull(),
        /** Whole minor units of `currency`, always positive: `type` says whether it was collected or given back. */
        taxAmountMinor: bigint('tax_amount_minor', { mode: 'number' }).notNull(),
        currency: varchar('currency', { length: 3 }).notNull(),
        taxCode: varchar('tax_code', { length: 50 }),
        customerId: varchar('customer_id', { length: 255 }),
        paymentId: varchar('payment_id', { length: 255 }),
        subscriptionId: varchar('subscription_id', { length: 255 }),
        providerTransactionId: varchar('provider_transaction_id', { length: 255 }),
        occurredAt: instant('occurred_at')
            .notNull()
            .default(sql `now()`),
    }, table => [
        uniqueIndex('tax_records_transaction_jurisdiction_rate_unique').on(table.type, table.reference, table.jurisdiction, table.rate),
        index('tax_records_customer_occurred_idx').on(table.customerId, table.occurredAt),
        index('tax_records_occurred_idx').on(table.occurredAt),
        check('tax_records_tax_amount_minor_not_negative', sql `"tax_amount_minor" >= 0`),
    ]);
    /** Every tax action that was audited (a calculation, an exemption, a report), append-only. */
    const taxAuditEntries = schema.table('tax_audit_entries', {
        id: taxAuditEntryIdFactory.primaryColumn(),
        action: varchar('action', { length: 20 }).$type().notNull(),
        entity: varchar('entity', { length: 20 }).$type().notNull(),
        entityId: varchar('entity_id', { length: 255 }).notNull(),
        details: jsonb('details')
            .$type()
            .notNull(),
        occurredAt: instant('occurred_at')
            .notNull()
            .default(sql `now()`),
    }, table => [index('tax_audit_entries_entity_idx').on(table.entity, table.entityId, table.occurredAt)]);
    const taxConfigForeignKeys = taxConfigIdFactory.createForeignKeyFactory(() => taxConfigurations.id);
    const taxJurisdictionForeignKeys = taxJurisdictionIdFactory.createForeignKeyFactory(() => taxJurisdictions.id);
    const taxExemptionForeignKeys = taxExemptionIdFactory.createForeignKeyFactory(() => taxExemptions.id);
    return {
        enums: {
            taxConfigStatusEnum,
            taxCalculationModeEnum,
            taxBusinessTypeEnum,
            jurisdictionTypeEnum,
            exemptionTypeEnum,
            exemptionStatusEnum,
            taxRecordTypeEnum,
        },
        taxConfigurations,
        taxJurisdictions,
        taxExemptions,
        taxRecords,
        taxAuditEntries,
        foreignKeys: {
            taxConfigForeignKeys,
            taxJurisdictionForeignKeys,
            taxExemptionForeignKeys,
        },
    };
}
//# sourceMappingURL=tables.js.map