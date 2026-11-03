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
 * A payment's stored `taxAmount` metadata cannot be added up: it is not `Money` JSON
 * (`problem: 'not_money'`), or it is in another currency than the payment (`'other_currency'`).
 * A wrong total must not pass, so the report stops here.
 *
 * @fix Correct the payment's `metadata.taxAmount` to `Money` JSON in the payment's currency.
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