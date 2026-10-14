/**
 * Tax ID format checks
 *
 * A format check says whether a value has the shape a country's registry gives out. It cannot say
 * the number is registered: that takes the registry (VIES, HMRC, the IRS). Types are Stripe's tax
 * ID types (`eu_vat`, `us_ein`, ...), the same names `customerDetails.taxIds` carries.
 */
export type TaxIdFormat = {
    /** `unknown` when no format is known for the type, or for the country under `eu_vat`: nothing was checked. */
    format: 'valid' | 'invalid' | 'unknown';
};
/** What `checkTaxIdFormat` takes. `country` is the ISO 3166-1 alpha-2 code the ID was issued in. */
export type TaxIdInput = {
    type: string;
    value: string;
    country: string;
};
/**
 * Check a tax ID against the format of its type and country.
 * - `valid`: the value has the registry's shape.
 * - `invalid`: it does not.
 * - `unknown`: no format is known for this type (or this country, for `eu_vat`), so the value was not checked.
 */
export declare function checkTaxIdFormat(taxId: TaxIdInput): TaxIdFormat;
//# sourceMappingURL=tax-id.d.ts.map