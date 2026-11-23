/**
 * No tax configuration, jurisdiction or exemption has this id. Nothing was written.
 *
 * @fix Check the id. Read the row first if it may have been deleted.
 * @verify bun run test -- src/tax
 */
export declare const TaxReferenceNotFound: import("@arki/failure").FailureDefinition<"payments.tax_reference_not_found", import("@standard-schema/spec").StandardSchemaV1<{
    kind: "configuration" | "exemption" | "jurisdiction";
    id: string;
}, {
    kind: "configuration" | "exemption" | "jurisdiction";
    id: string;
}>>;
/**
 * A tax line is in another currency than the transaction it belongs to. Nothing was recorded and
 * the provider was not called.
 *
 * @fix Pass the breakdown that `calculateTax` returned for this transaction, in its currency.
 * @verify bun run test -- src/tax
 */
export declare const TaxCurrencyMismatch: import("@arki/failure").FailureDefinition<"payments.tax_currency_mismatch", import("@standard-schema/spec").StandardSchemaV1<{
    reference: string;
    jurisdiction: string;
    taxCurrency: string;
    transactionCurrency: string;
}, {
    reference: string;
    jurisdiction: string;
    taxCurrency: string;
    transactionCurrency: string;
}>>;
/**
 * A line item is in another currency than the sale or refund it belongs to. Nothing was read or
 * recorded, and the provider was not called.
 *
 * @fix Price every line item in the transaction's `currency`.
 * @verify bun run test -- src/tax
 */
export declare const TaxLineCurrencyMismatch: import("@arki/failure").FailureDefinition<"payments.tax_line_currency_mismatch", import("@standard-schema/spec").StandardSchemaV1<{
    lineReference: string;
    lineCurrency: string;
    transactionCurrency: string;
}, {
    lineReference: string;
    lineCurrency: string;
    transactionCurrency: string;
}>>;
/**
 * A tax jurisdiction cannot be deleted while another row points at it: a child jurisdiction
 * (`usedBy: 'jurisdiction'`) or an exemption (`usedBy: 'exemption'`). Nothing was deleted.
 *
 * @fix Delete or move the row named by `usedById` first, or deactivate the jurisdiction (`isActive: false`).
 * @verify bun run test -- src/tax
 */
export declare const TaxJurisdictionInUse: import("@arki/failure").FailureDefinition<"payments.tax_jurisdiction_in_use", import("@standard-schema/spec").StandardSchemaV1<{
    id: string;
    usedBy: "exemption" | "jurisdiction";
    usedById: string;
}, {
    id: string;
    usedBy: "exemption" | "jurisdiction";
    usedById: string;
}>>;
/**
 * A new tax row was given an `id` that another row already has. Nothing was written.
 *
 * @fix Leave `id` out, so the repository makes a new one.
 * @verify bun run test -- src/tax
 */
export declare const TaxRowExists: import("@arki/failure").FailureDefinition<"payments.tax_row_exists", import("@standard-schema/spec").StandardSchemaV1<{
    kind: "audit_entry" | "configuration" | "exemption" | "jurisdiction";
    id: string;
}, {
    kind: "audit_entry" | "configuration" | "exemption" | "jurisdiction";
    id: string;
}>>;
/**
 * A tax refund names no recorded sale to reverse: `originalReference` is missing (`null` here), or
 * no sale was recorded under it. Nothing was recorded and the provider was not called.
 *
 * @fix Record the sale first, and pass its `reference` as `originalReference`.
 * @verify bun run test -- src/tax
 */
export declare const TaxRefundSaleNotFound: import("@arki/failure").FailureDefinition<"payments.tax_refund_sale_not_found", import("@standard-schema/spec").StandardSchemaV1<{
    reference: string;
    originalReference: string | null;
}, {
    reference: string;
    originalReference: string | null;
}>>;
/**
 * The tax stored for a payment cannot be added up: its `taxAmount` metadata is not `Money` JSON
 * (`problem: 'not_money'`), or that metadata or a tax record under its id is in another currency
 * than the payment (`'other_currency'`). A wrong total must not pass, so the report stops here.
 *
 * @fix Correct the payment's `metadata.taxAmount` to `Money` JSON in the payment's currency, or the
 * tax records under its id (`tax_records.payment_id`) to the payment's currency.
 * @verify bun run test -- src/tax
 */
export declare const StoredTaxInvalid: import("@arki/failure").FailureDefinition<"payments.stored_tax_invalid", import("@standard-schema/spec").StandardSchemaV1<{
    paymentId: string;
    problem: "not_money" | "other_currency";
    paymentCurrency: string;
    taxCurrency: string | null;
}, {
    paymentId: string;
    problem: "not_money" | "other_currency";
    paymentCurrency: string;
    taxCurrency: string | null;
}>>;
//# sourceMappingURL=failures.d.ts.map