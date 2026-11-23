import { and, desc, eq, gt, gte, inArray, isNull, lte, ne, or, sql } from 'drizzle-orm';
import { now } from '@arki/date';
import { invariant, isFailure } from '@arki/failure';
import { is, parse } from '@arki/schema';
import { isPgInstant, pgTextSchema } from '../core/pg-values.js';
import { exemptionPeriodSchema, exemptionTargetSchema, getExpiringExemptionsInputSchema, taxAuditRowSchema, taxConfigurationRowSchema, taxExemptionRowSchema, taxJurisdictionRowSchema, taxRecordRowSchema, taxRecordRowsSchema, } from './contracts.js';
import { TaxJurisdictionInUse, TaxReferenceNotFound, TaxRowExists } from './failures.js';
/**
 * False when a text holds U+0000. No stored row can hold one, so a read for it finds nothing, and
 * Postgres would refuse it as a parameter (SQLSTATE 22021). Typed ids count: `txj_${string}` can hold one.
 */
function findable(...texts) {
    return texts.every(text => text === undefined || is(text, pgTextSchema));
}
/**
 * A time a read compares with an `instant` column must fall in the years 1 to 9999 (`isPgInstant`):
 * Postgres refuses any other as a parameter. A typed `Instant` outside them is a bug in the caller,
 * and throws `FailureError` (`invariant`) before the query.
 */
function requirePgInstants(method, ...instants) {
    invariant(instants.every(instant => isPgInstant(instant)), () => `${method} needs times in the years 1 to 9999 (UTC)`);
}
/**
 * `TaxReferenceNotFound` (kind `jurisdiction`) when `id` names no jurisdiction. Otherwise the row is
 * locked until the transaction ends, so a write that points at it cannot meet a deleted row (a raw
 * Postgres 23503). `null` and `undefined` name nothing to check.
 */
async function lockJurisdiction(tx, taxJurisdictions, id) {
    if (id === undefined || id === null)
        return undefined;
    if (!findable(id))
        return TaxReferenceNotFound({ kind: 'jurisdiction', id });
    const [found] = await tx
        .select({ id: taxJurisdictions.id })
        .from(taxJurisdictions)
        .where(eq(taxJurisdictions.id, id))
        .for('key share');
    return found ? undefined : TaxReferenceNotFound({ kind: 'jurisdiction', id });
}
/**
 * Tax Configuration Repository
 * Manages global tax settings and configurations
 */
export class TaxConfigurationRepository {
    db;
    taxConfigurations;
    constructor(db, tables) {
        this.db = db;
        this.taxConfigurations = tables.taxConfigurations;
    }
    /**
     * The new row. A value a column cannot store returns `InvalidInput` (`taxConfigurationRowSchema`),
     * and an `id` another configuration has returns `TaxRowExists`; nothing is written then.
     */
    async createConfiguration(data) {
        const row = parse(taxConfigurationRowSchema, data);
        if (isFailure(row))
            return row;
        const [created] = await this.db
            .insert(this.taxConfigurations)
            .values(data)
            .onConflictDoNothing({ target: this.taxConfigurations.id })
            .returning();
        if (created)
            return created;
        invariant(data.id !== undefined, 'the tax configuration insert returned no row');
        return TaxRowExists({ kind: 'configuration', id: data.id });
    }
    /** Null too for an id no row can hold (U+0000), without a query. */
    async findConfigurationById(id) {
        if (!findable(id))
            return null;
        const results = await this.db
            .select()
            .from(this.taxConfigurations)
            .where(eq(this.taxConfigurations.id, id))
            .limit(1);
        return results[0] ?? null;
    }
    async findDefaultConfiguration() {
        const results = await this.db
            .select()
            .from(this.taxConfigurations)
            .where(and(eq(this.taxConfigurations.isDefault, true), eq(this.taxConfigurations.status, 'active')))
            .limit(1);
        return results[0] ?? null;
    }
    async findActiveConfigurations() {
        return this.db
            .select()
            .from(this.taxConfigurations)
            .where(eq(this.taxConfigurations.status, 'active'))
            .orderBy(desc(this.taxConfigurations.isDefault), this.taxConfigurations.name);
    }
    /**
     * The updated row, or `TaxReferenceNotFound` when no configuration has `id`. A value a column cannot
     * store returns `InvalidInput` (`taxConfigurationRowSchema`) and nothing is written.
     */
    async updateConfiguration(id, data) {
        const row = parse(taxConfigurationRowSchema.partial(), data);
        if (isFailure(row))
            return row;
        if (!findable(id))
            return TaxReferenceNotFound({ kind: 'configuration', id });
        const [updated] = await this.db
            .update(this.taxConfigurations)
            .set({ ...data, updatedAt: now() })
            .where(eq(this.taxConfigurations.id, id))
            .returning();
        return updated ?? TaxReferenceNotFound({ kind: 'configuration', id });
    }
    /**
     * Makes `id` the one default configuration. An unknown `id` returns `TaxReferenceNotFound` and
     * leaves the current default as it is: the new default is set before the old one is cleared.
     */
    async setDefaultConfiguration(id) {
        if (!findable(id))
            return TaxReferenceNotFound({ kind: 'configuration', id });
        const [updated] = await this.db
            .update(this.taxConfigurations)
            .set({ isDefault: true, updatedAt: now() })
            .where(eq(this.taxConfigurations.id, id))
            .returning();
        if (!updated) {
            return TaxReferenceNotFound({ kind: 'configuration', id });
        }
        await this.db
            .update(this.taxConfigurations)
            .set({ isDefault: false, updatedAt: now() })
            .where(and(eq(this.taxConfigurations.isDefault, true), ne(this.taxConfigurations.id, id)));
        return updated;
    }
    /** An unknown id, or one no row can hold (U+0000), deletes nothing. */
    async deleteConfiguration(id) {
        if (!findable(id))
            return;
        await this.db.delete(this.taxConfigurations).where(eq(this.taxConfigurations.id, id));
    }
}
/**
 * Tax Jurisdiction Repository
 * Manages tax jurisdictions and their rates
 */
export class TaxJurisdictionRepository {
    db;
    taxJurisdictions;
    taxExemptions;
    /** `taxExemptions` is read by `deleteJurisdiction`: a jurisdiction an exemption names is kept. */
    constructor(db, tables) {
        this.db = db;
        this.taxJurisdictions = tables.taxJurisdictions;
        this.taxExemptions = tables.taxExemptions;
    }
    /**
     * The new row, or `TaxReferenceNotFound` (kind `jurisdiction`) when `parentId` names no
     * jurisdiction. The parent is locked until the insert, so it cannot be deleted in between. A value
     * a column cannot store returns `InvalidInput` (`taxJurisdictionRowSchema`), and an `id` another
     * jurisdiction has returns `TaxRowExists`; nothing is written then.
     */
    async createJurisdiction(data) {
        const row = parse(taxJurisdictionRowSchema, data);
        if (isFailure(row))
            return row;
        return this.db.transaction(async (tx) => {
            const missing = await lockJurisdiction(tx, this.taxJurisdictions, data.parentId);
            if (missing)
                return missing;
            const [created] = await tx
                .insert(this.taxJurisdictions)
                .values(data)
                .onConflictDoNothing({ target: this.taxJurisdictions.id })
                .returning();
            if (created)
                return created;
            invariant(data.id !== undefined, 'the tax jurisdiction insert returned no row');
            return TaxRowExists({ kind: 'jurisdiction', id: data.id });
        });
    }
    /** Null too for an id no row can hold (U+0000), without a query. */
    async findJurisdictionById(id) {
        if (!findable(id))
            return null;
        const results = await this.db
            .select()
            .from(this.taxJurisdictions)
            .where(eq(this.taxJurisdictions.id, id))
            .limit(1);
        return results[0] ?? null;
    }
    async findJurisdictionByCode(code, countryCode) {
        if (!findable(code, countryCode))
            return null;
        const results = await this.db
            .select()
            .from(this.taxJurisdictions)
            .where(and(eq(this.taxJurisdictions.code, code), eq(this.taxJurisdictions.countryCode, countryCode)))
            .limit(1);
        return results[0] ?? null;
    }
    async findJurisdictionsByCountry(countryCode) {
        if (!findable(countryCode))
            return [];
        return this.db
            .select()
            .from(this.taxJurisdictions)
            .where(and(eq(this.taxJurisdictions.countryCode, countryCode), eq(this.taxJurisdictions.isActive, true)))
            .orderBy(this.taxJurisdictions.type, this.taxJurisdictions.name);
    }
    async findActiveJurisdictions() {
        return this.db
            .select()
            .from(this.taxJurisdictions)
            .where(eq(this.taxJurisdictions.isActive, true))
            .orderBy(this.taxJurisdictions.countryCode, this.taxJurisdictions.type, this.taxJurisdictions.name);
    }
    async findJurisdictionHierarchy(id) {
        // Get the jurisdiction and its parents
        const jurisdiction = await this.findJurisdictionById(id);
        if (!jurisdiction)
            return [];
        const hierarchy = [jurisdiction];
        // `parentId` is stored data an update can point anywhere: a chain that comes back to itself stops there
        const seen = new Set([jurisdiction.id]);
        // Walk up the parent chain
        let current = jurisdiction;
        while (current.parentId !== null && !seen.has(current.parentId)) {
            const parent = await this.findJurisdictionById(current.parentId);
            if (!parent)
                break;
            seen.add(parent.id);
            hierarchy.unshift(parent); // Add to beginning
            current = parent;
        }
        return hierarchy;
    }
    /**
     * The updated row, or `TaxReferenceNotFound` (kind `jurisdiction`) when no jurisdiction has `id`,
     * or when the new `parentId` names none. The new parent is locked until the update. A value a
     * column cannot store returns `InvalidInput` (`taxJurisdictionRowSchema`) and nothing is written.
     */
    async updateJurisdiction(id, data) {
        const row = parse(taxJurisdictionRowSchema.partial(), data);
        if (isFailure(row))
            return row;
        if (!findable(id))
            return TaxReferenceNotFound({ kind: 'jurisdiction', id });
        return this.db.transaction(async (tx) => {
            const missing = await lockJurisdiction(tx, this.taxJurisdictions, data.parentId);
            if (missing)
                return missing;
            const [updated] = await tx
                .update(this.taxJurisdictions)
                .set({ ...data, updatedAt: now() })
                .where(eq(this.taxJurisdictions.id, id))
                .returning();
            return updated ?? TaxReferenceNotFound({ kind: 'jurisdiction', id });
        });
    }
    /**
     * Deletes the jurisdiction. One that a child jurisdiction or an exemption still names returns
     * `TaxJurisdictionInUse` and is kept. The row is locked first, so a write that would point at it
     * waits, and then finds it gone (`TaxReferenceNotFound`). An unknown id, or one no row can hold
     * (U+0000), deletes nothing.
     */
    async deleteJurisdiction(id) {
        if (!findable(id))
            return;
        return this.db.transaction(async (tx) => {
            const [found] = await tx
                .select({ id: this.taxJurisdictions.id })
                .from(this.taxJurisdictions)
                .where(eq(this.taxJurisdictions.id, id))
                .for('update');
            if (!found)
                return;
            // A row whose parent is itself (an update can store that) does not keep itself
            const [child] = await tx
                .select({ id: this.taxJurisdictions.id })
                .from(this.taxJurisdictions)
                .where(and(eq(this.taxJurisdictions.parentId, id), ne(this.taxJurisdictions.id, id)))
                .limit(1);
            if (child)
                return TaxJurisdictionInUse({ id, usedBy: 'jurisdiction', usedById: child.id });
            const [exemption] = await tx
                .select({ id: this.taxExemptions.id })
                .from(this.taxExemptions)
                .where(eq(this.taxExemptions.jurisdictionId, id))
                .limit(1);
            if (exemption)
                return TaxJurisdictionInUse({ id, usedBy: 'exemption', usedById: exemption.id });
            await tx.delete(this.taxJurisdictions).where(eq(this.taxJurisdictions.id, id));
            return;
        });
    }
}
/**
 * Tax Exemption Repository
 * Manages tax exemptions for customers, products, and jurisdictions
 */
export class TaxExemptionRepository {
    db;
    taxExemptions;
    taxJurisdictions;
    constructor(db, tables) {
        this.db = db;
        this.taxExemptions = tables.taxExemptions;
        this.taxJurisdictions = tables.taxJurisdictions;
    }
    /**
     * The new row. One that names no customer, product code or jurisdiction would exempt every sale:
     * `exemptionTargetSchema` refuses it with `InvalidInput`, and nothing is written. So does
     * `exemptionPeriodSchema` for one whose `validTo` is before its `validFrom`. A `jurisdictionId`
     * that names no jurisdiction returns `TaxReferenceNotFound` (kind `jurisdiction`); the
     * jurisdiction is locked until the insert, so it cannot be deleted in between. A value a column
     * cannot store returns `InvalidInput` (`taxExemptionRowSchema`), and an `id` another exemption has
     * returns `TaxRowExists`; nothing is written then.
     */
    async createExemption(data) {
        const row = parse(taxExemptionRowSchema, data);
        if (isFailure(row))
            return row;
        const target = parse(exemptionTargetSchema, data);
        if (isFailure(target))
            return target;
        const period = parse(exemptionPeriodSchema, data);
        if (isFailure(period))
            return period;
        return this.db.transaction(async (tx) => {
            const missing = await lockJurisdiction(tx, this.taxJurisdictions, data.jurisdictionId);
            if (missing)
                return missing;
            const [created] = await tx
                .insert(this.taxExemptions)
                .values(data)
                .onConflictDoNothing({ target: this.taxExemptions.id })
                .returning();
            if (created)
                return created;
            invariant(data.id !== undefined, 'the tax exemption insert returned no row');
            return TaxRowExists({ kind: 'exemption', id: data.id });
        });
    }
    /** Null too for an id no row can hold (U+0000), without a query. */
    async findExemptionById(id) {
        if (!findable(id))
            return null;
        const results = await this.db
            .select()
            .from(this.taxExemptions)
            .where(eq(this.taxExemptions.id, id))
            .limit(1);
        return results[0] ?? null;
    }
    async findCustomerExemptions(customerId) {
        if (!findable(customerId))
            return [];
        return this.db
            .select()
            .from(this.taxExemptions)
            .where(and(eq(this.taxExemptions.customerId, customerId), eq(this.taxExemptions.status, 'active'), 
        // Check that exemption is currently valid
        sql `${this.taxExemptions.validFrom} <= NOW()`, sql `(${this.taxExemptions.validTo} IS NULL OR ${this.taxExemptions.validTo} > NOW())`))
            .orderBy(this.taxExemptions.validFrom);
    }
    /**
     * The customer's exemptions that were in force at some point between `start` and `end`,
     * both inclusive. Pending and revoked exemptions never applied, so they are left out. The times
     * fall in the years 1 to 9999, or it throws `FailureError` (`invariant`).
     */
    async findCustomerExemptionsInRange(customerId, start, end) {
        requirePgInstants('findCustomerExemptionsInRange', start, end);
        if (!findable(customerId))
            return [];
        return this.db
            .select()
            .from(this.taxExemptions)
            .where(and(eq(this.taxExemptions.customerId, customerId), inArray(this.taxExemptions.status, ['active', 'expired']), lte(this.taxExemptions.validFrom, end), or(isNull(this.taxExemptions.validTo), gte(this.taxExemptions.validTo, start))))
            .orderBy(this.taxExemptions.validFrom);
    }
    /**
     * The exemptions that can keep tax off a sale to `customerId` at `at`: active, in force, and
     * either the customer's own or open to every customer (no `customerId`). Pending, revoked and
     * expired ones never apply. `threshold` exemptions are left out: nothing stores a threshold
     * amount to test a sale against. The caller narrows by product and jurisdiction. `at` falls in the
     * years 1 to 9999, or it throws `FailureError` (`invariant`).
     */
    async findApplicableExemptions(customerId, at = now()) {
        requirePgInstants('findApplicableExemptions', at);
        if (!findable(customerId))
            return [];
        return this.db
            .select()
            .from(this.taxExemptions)
            .where(and(or(eq(this.taxExemptions.customerId, customerId), isNull(this.taxExemptions.customerId)), eq(this.taxExemptions.status, 'active'), ne(this.taxExemptions.type, 'threshold'), lte(this.taxExemptions.validFrom, at), or(isNull(this.taxExemptions.validTo), gt(this.taxExemptions.validTo, at))))
            .orderBy(this.taxExemptions.validFrom, this.taxExemptions.id);
    }
    /**
     * Every customer's exemptions that were in force at some point between `start` and `end`, both
     * inclusive. Pending and revoked ones never applied. The times fall in the years 1 to 9999, or it
     * throws `FailureError` (`invariant`).
     */
    async findExemptionsInRange(start, end) {
        requirePgInstants('findExemptionsInRange', start, end);
        return this.db
            .select()
            .from(this.taxExemptions)
            .where(and(inArray(this.taxExemptions.status, ['active', 'expired']), lte(this.taxExemptions.validFrom, end), or(isNull(this.taxExemptions.validTo), gte(this.taxExemptions.validTo, start))))
            .orderBy(this.taxExemptions.validFrom, this.taxExemptions.id);
    }
    async findProductExemptions(productCode) {
        if (!findable(productCode))
            return [];
        return this.db
            .select()
            .from(this.taxExemptions)
            .where(and(eq(this.taxExemptions.productCode, productCode), eq(this.taxExemptions.status, 'active'), sql `${this.taxExemptions.validFrom} <= NOW()`, sql `(${this.taxExemptions.validTo} IS NULL OR ${this.taxExemptions.validTo} > NOW())`))
            .orderBy(this.taxExemptions.validFrom);
    }
    async findJurisdictionExemptions(jurisdictionId) {
        if (!findable(jurisdictionId))
            return [];
        return this.db
            .select()
            .from(this.taxExemptions)
            .where(and(eq(this.taxExemptions.jurisdictionId, jurisdictionId), eq(this.taxExemptions.status, 'active'), sql `${this.taxExemptions.validFrom} <= NOW()`, sql `(${this.taxExemptions.validTo} IS NULL OR ${this.taxExemptions.validTo} > NOW())`))
            .orderBy(this.taxExemptions.validFrom);
    }
    /**
     * Active exemptions that end within the next `days` days. `days` is from 1 to 365, as
     * `getExpiringExemptionsInputSchema` reads it from a request: anything else (NaN, a huge number)
     * is a bug in the caller, and throws `FailureError` (`invariant`) before the query.
     */
    async findExpiringExemptions(days = 30) {
        invariant(is(days, getExpiringExemptionsInputSchema.shape.days), () => `findExpiringExemptions needs days from 1 to 365, received ${String(days)}`);
        // Local-time calendar days, as before. The raw `sql` parameter below needs a string.
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        return this.db
            .select()
            .from(this.taxExemptions)
            .where(and(eq(this.taxExemptions.status, 'active'), sql `${this.taxExemptions.validTo} IS NOT NULL`, sql `${this.taxExemptions.validTo} <= ${futureDate.toISOString()}`, sql `${this.taxExemptions.validTo} > NOW()`))
            .orderBy(this.taxExemptions.validTo);
    }
    /**
     * The updated row, or `TaxReferenceNotFound` when no exemption has `id` (kind `exemption`) or the
     * new `jurisdictionId` names no jurisdiction (kind `jurisdiction`). The row as the update
     * leaves it must still name a customer, a product code or a jurisdiction (`exemptionTargetSchema`)
     * and must not end before it starts (`exemptionPeriodSchema`), and every value must fit its column
     * (`taxExemptionRowSchema`): otherwise it returns `InvalidInput` and nothing is written. A field left
     * `undefined` keeps its stored value; `null` clears it.
     */
    async updateExemption(id, data) {
        const row = parse(taxExemptionRowSchema.partial(), data);
        if (isFailure(row))
            return row;
        if (!findable(id))
            return TaxReferenceNotFound({ kind: 'exemption', id });
        return this.db.transaction(async (tx) => {
            // Lock the row, so the check and the write see the same stored values
            const [current] = await tx
                .select()
                .from(this.taxExemptions)
                .where(eq(this.taxExemptions.id, id))
                .for('update');
            if (!current)
                return TaxReferenceNotFound({ kind: 'exemption', id });
            const next = {
                customerId: data.customerId === undefined ? current.customerId : data.customerId,
                productCode: data.productCode === undefined ? current.productCode : data.productCode,
                jurisdictionId: data.jurisdictionId === undefined ? current.jurisdictionId : data.jurisdictionId,
                validFrom: data.validFrom ?? current.validFrom,
                validTo: data.validTo === undefined ? current.validTo : data.validTo,
            };
            const target = parse(exemptionTargetSchema, next);
            if (isFailure(target))
                return target;
            const period = parse(exemptionPeriodSchema, next);
            if (isFailure(period))
                return period;
            const missing = await lockJurisdiction(tx, this.taxJurisdictions, data.jurisdictionId);
            if (missing)
                return missing;
            const [updated] = await tx
                .update(this.taxExemptions)
                .set({ ...data, updatedAt: now() })
                .where(eq(this.taxExemptions.id, id))
                .returning();
            invariant(updated, 'the locked tax exemption update returned no row');
            return updated;
        });
    }
    /**
     * The approved row, or `TaxReferenceNotFound` when no exemption has `id`. An `approvedBy` the column
     * cannot store returns `InvalidInput` and nothing is written.
     */
    async approveExemption(id, approvedBy) {
        const approver = parse(taxExemptionRowSchema.shape.approvedBy, approvedBy);
        if (isFailure(approver))
            return approver;
        if (!findable(id))
            return TaxReferenceNotFound({ kind: 'exemption', id });
        const [approved] = await this.db
            .update(this.taxExemptions)
            .set({
            status: 'active',
            approvedBy,
            approvedAt: now(),
            updatedAt: now(),
        })
            .where(eq(this.taxExemptions.id, id))
            .returning();
        return approved ?? TaxReferenceNotFound({ kind: 'exemption', id });
    }
    /** The revoked row, or `TaxReferenceNotFound` when no exemption has `id`. */
    async revokeExemption(id) {
        if (!findable(id))
            return TaxReferenceNotFound({ kind: 'exemption', id });
        const [revoked] = await this.db
            .update(this.taxExemptions)
            .set({ status: 'revoked', updatedAt: now() })
            .where(eq(this.taxExemptions.id, id))
            .returning();
        return revoked ?? TaxReferenceNotFound({ kind: 'exemption', id });
    }
    /** An unknown id, or one no row can hold (U+0000), deletes nothing. */
    async deleteExemption(id) {
        if (!findable(id))
            return;
        await this.db.delete(this.taxExemptions).where(eq(this.taxExemptions.id, id));
    }
    // Analytics and reporting methods
    async getExemptionStats() {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const [activeCount] = await this.db
            .select({ count: sql `count(*)`.mapWith(Number) })
            .from(this.taxExemptions)
            .where(eq(this.taxExemptions.status, 'active'));
        const [pendingCount] = await this.db
            .select({ count: sql `count(*)`.mapWith(Number) })
            .from(this.taxExemptions)
            .where(eq(this.taxExemptions.status, 'pending_review'));
        const [expiredCount] = await this.db
            .select({ count: sql `count(*)`.mapWith(Number) })
            .from(this.taxExemptions)
            .where(eq(this.taxExemptions.status, 'expired'));
        const [revokedCount] = await this.db
            .select({ count: sql `count(*)`.mapWith(Number) })
            .from(this.taxExemptions)
            .where(eq(this.taxExemptions.status, 'revoked'));
        const [expiringCount] = await this.db
            .select({ count: sql `count(*)`.mapWith(Number) })
            .from(this.taxExemptions)
            .where(and(eq(this.taxExemptions.status, 'active'), sql `${this.taxExemptions.validTo} IS NOT NULL`, sql `${this.taxExemptions.validTo} <= ${futureDate.toISOString()}`, sql `${this.taxExemptions.validTo} > NOW()`));
        return {
            totalActive: activeCount?.count || 0,
            totalPendingReview: pendingCount?.count || 0,
            totalExpired: expiredCount?.count || 0,
            totalRevoked: revokedCount?.count || 0,
            expiringNext30Days: expiringCount?.count || 0,
        };
    }
}
/**
 * Tax Audit Repository
 * The append-only trail of tax actions
 */
export class TaxAuditRepository {
    db;
    taxAuditEntries;
    constructor(db, tables) {
        this.db = db;
        this.taxAuditEntries = tables.taxAuditEntries;
    }
    /**
     * The stored entry. An `entityId` or `details` the columns cannot store returns `InvalidInput`
     * (`taxAuditRowSchema`), and an `id` another entry has returns `TaxRowExists`; nothing is written then.
     */
    async record(entry) {
        const checked = parse(taxAuditRowSchema, entry);
        if (isFailure(checked))
            return checked;
        const [row] = await this.db
            .insert(this.taxAuditEntries)
            .values(entry)
            .onConflictDoNothing({ target: this.taxAuditEntries.id })
            .returning();
        if (row)
            return row;
        invariant(entry.id !== undefined, 'the tax audit insert returned no row');
        return TaxRowExists({ kind: 'audit_entry', id: entry.id });
    }
    /** The entries about one entity, oldest first. */
    async findByEntity(entity, entityId) {
        // An entity or id no row can hold has no entries
        if (!is(entity, taxAuditRowSchema.shape.entity) || !findable(entityId))
            return [];
        return this.db
            .select()
            .from(this.taxAuditEntries)
            .where(and(eq(this.taxAuditEntries.entity, entity), eq(this.taxAuditEntries.entityId, entityId)))
            .orderBy(this.taxAuditEntries.occurredAt, this.taxAuditEntries.id);
    }
}
/**
 * Tax Record Repository
 * The per-jurisdiction tax of each recorded sale and refund
 */
export class TaxRecordRepository {
    db;
    taxRecords;
    constructor(db, tables) {
        this.db = db;
        this.taxRecords = tables.taxRecords;
    }
    /**
     * Write at most `MAX_BATCH_ITEMS` (1,000) rows; more returns `InvalidInput`. A row already recorded
     * (same type, reference, jurisdiction and rate) is left as it was. A row with a value its column cannot store returns `InvalidInput` (`taxRecordRowSchema`), and
     * no row is written.
     */
    async recordMany(rows) {
        const checked = parse(taxRecordRowsSchema, rows);
        if (isFailure(checked))
            return checked;
        if (rows.length === 0)
            return undefined;
        await this.db.insert(this.taxRecords).values(rows).onConflictDoNothing();
        return undefined;
    }
    async findByReference(type, reference) {
        // A type or reference no row can hold has no records
        if (!is(type, taxRecordRowSchema.shape.type) || !findable(reference))
            return [];
        return this.db
            .select()
            .from(this.taxRecords)
            .where(and(eq(this.taxRecords.type, type), eq(this.taxRecords.reference, reference)))
            .orderBy(this.taxRecords.jurisdiction, this.taxRecords.rate);
    }
    /**
     * How many distinct sales carried tax between `start` and `end`, both inclusive (a sale taxed in two
     * jurisdictions counts once). The times fall in the years 1 to 9999, or it throws `FailureError` (`invariant`).
     */
    async countSaleTransactions(period) {
        requirePgInstants('countSaleTransactions', period.start, period.end);
        if (!findable(period.customerId, period.jurisdiction))
            return 0;
        const [row] = await this.db
            .select({ count: sql `count(distinct ${this.taxRecords.reference})`.mapWith(Number) })
            .from(this.taxRecords)
            .where(and(eq(this.taxRecords.type, 'sale'), gte(this.taxRecords.occurredAt, period.start), lte(this.taxRecords.occurredAt, period.end), period.customerId === undefined ? undefined : eq(this.taxRecords.customerId, period.customerId), period.jurisdiction === undefined
            ? undefined
            : sql `lower(${this.taxRecords.jurisdiction}) = lower(${period.jurisdiction})`));
        return row?.count ?? 0;
    }
    /**
     * The tax each payment carried, for the records that happened between `start` and `end`, both
     * inclusive. Records with no payment id are left out. `jurisdiction` limits it to one (any case).
     * The times fall in the years 1 to 9999, or it throws `FailureError` (`invariant`).
     */
    async totalsByPayment(period) {
        requirePgInstants('totalsByPayment', period.start, period.end);
        if (!findable(period.jurisdiction))
            return [];
        const { type, taxAmountMinor } = this.taxRecords;
        return this.db
            .select({
            paymentId: sql `${this.taxRecords.paymentId}`,
            currency: this.taxRecords.currency,
            saleTaxMinor: sql `coalesce(sum(${taxAmountMinor}) filter (where ${type} = 'sale'), 0)::text`,
            refundTaxMinor: sql `coalesce(sum(${taxAmountMinor}) filter (where ${type} = 'refund'), 0)::text`,
        })
            .from(this.taxRecords)
            .where(and(sql `${this.taxRecords.paymentId} IS NOT NULL`, gte(this.taxRecords.occurredAt, period.start), lte(this.taxRecords.occurredAt, period.end), period.jurisdiction === undefined
            ? undefined
            : sql `lower(${this.taxRecords.jurisdiction}) = lower(${period.jurisdiction})`))
            .groupBy(this.taxRecords.paymentId, this.taxRecords.currency);
    }
    /**
     * Tax per jurisdiction and currency for the records that happened between `start` and `end`,
     * both inclusive, ordered by jurisdiction then currency. `customerId` limits it to one customer.
     * The times fall in the years 1 to 9999, or it throws `FailureError` (`invariant`).
     */
    async totalsByJurisdiction(period) {
        requirePgInstants('totalsByJurisdiction', period.start, period.end);
        if (!findable(period.customerId, period.jurisdiction))
            return [];
        const { type, taxAmountMinor, reference } = this.taxRecords;
        return this.db
            .select({
            jurisdiction: this.taxRecords.jurisdiction,
            currency: this.taxRecords.currency,
            saleTaxMinor: sql `coalesce(sum(${taxAmountMinor}) filter (where ${type} = 'sale'), 0)::text`,
            refundTaxMinor: sql `coalesce(sum(${taxAmountMinor}) filter (where ${type} = 'refund'), 0)::text`,
            saleCount: sql `count(distinct ${reference}) filter (where ${type} = 'sale')`.mapWith(Number),
            refundCount: sql `count(distinct ${reference}) filter (where ${type} = 'refund')`.mapWith(Number),
        })
            .from(this.taxRecords)
            .where(and(gte(this.taxRecords.occurredAt, period.start), lte(this.taxRecords.occurredAt, period.end), period.customerId === undefined ? undefined : eq(this.taxRecords.customerId, period.customerId), period.jurisdiction === undefined
            ? undefined
            : sql `lower(${this.taxRecords.jurisdiction}) = lower(${period.jurisdiction})`))
            .groupBy(this.taxRecords.jurisdiction, this.taxRecords.currency)
            .orderBy(this.taxRecords.jurisdiction, this.taxRecords.currency);
    }
}
/**
 * Aggregate Tax Repository Factory
 * Creates and manages all tax-related repositories
 */
export function createTaxRepositories(db, tables) {
    return {
        configurations: new TaxConfigurationRepository(db, { taxConfigurations: tables.taxConfigurations }),
        jurisdictions: new TaxJurisdictionRepository(db, {
            taxJurisdictions: tables.taxJurisdictions,
            taxExemptions: tables.taxExemptions,
        }),
        exemptions: new TaxExemptionRepository(db, {
            taxExemptions: tables.taxExemptions,
            taxJurisdictions: tables.taxJurisdictions,
        }),
        records: new TaxRecordRepository(db, { taxRecords: tables.taxRecords }),
        audit: new TaxAuditRepository(db, { taxAuditEntries: tables.taxAuditEntries }),
    };
}
//# sourceMappingURL=repository.js.map