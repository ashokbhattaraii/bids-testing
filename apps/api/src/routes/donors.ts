import { drizzleDb as db, donors, donorContacts, newId } from '@bids/db';
import { eq, like, and, or, count, sql, asc, desc } from 'drizzle-orm';
import { createRouter } from '../core/http/router';
import { jsonOk, jsonError } from '../core/http/errors';
import { requireAuth } from '../core/auth/middleware';
import {
  listDonorsRoute,
  getDonorByIdRoute,
  lookupDonorByPhoneRoute,
  createDonorRoute,
  updateDonorRoute,
  deleteDonorRoute,
  blacklistDonorRoute,
  unblacklistDonorRoute,
  listBlacklistedDonorsRoute,
  importDonorsRoute,
  logDonorContactRoute,
} from '../schemas/donors';

const router = createRouter();

router.use('*', requireAuth);

// ── Utility ───────────────────────────────────────────────────────────────────
function capitalize(str: string): string {
  return str
    .split(' ')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ');
}

function nowSqlite(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

// ── GET /donors ───────────────────────────────────────────────────────────────
// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(listDonorsRoute, async (c) => {
  const { status, bloodType, search, sortBy, source, page } = c.req.valid('query');

  const term = search ? `%${search.trim().replace(/\s+/g, '%')}%` : undefined;

  const whereClause = and(
    status && status !== 'all' ? eq(donors.status, status) : undefined,
    bloodType && bloodType !== 'all' ? eq(donors.bloodType, bloodType) : undefined,
    source && source !== 'all' ? eq(donors.source, source) : undefined,
    term
      ? or(
          like(donors.name, term),
          like(donors.phone, term),
          like(donors.location, term),
          like(donors.bloodType, term),
        )
      : undefined,
  );

  const orderMap = {
    rating:    desc(donors.rating),
    donations: desc(donors.donationCount),
    name:      asc(donors.name),
    recent:    desc(donors.createdAt),
  } as const;
  const orderByCol =
    sortBy === 'last_contacted'
      ? sql`${donors.lastContacted} DESC NULLS LAST`
      : (orderMap[sortBy as keyof typeof orderMap] ?? desc(donors.createdAt));

  const pageNum  = Math.max(1, parseInt(page ?? '1', 10));
  const offset   = (pageNum - 1);

  const [totalRes, rows] = await Promise.all([
    db(c).select({ total: count() }).from(donors).where(whereClause),
    db(c).select().from(donors).where(whereClause).orderBy(orderByCol).offset(offset),
  ]);

  return jsonOk(c, {
    items: rows,
    meta: { total: totalRes[0]?.total ?? 0, page: pageNum },
  });
});

// ── GET /donors/lookup/by-phone ───────────────────────────────────────────────
// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(lookupDonorByPhoneRoute, async (c) => {
  const { phone } = c.req.valid('query');
  if (!phone) return jsonError(c, 400, 'phone query param required');

  const row = await db(c)
    .select({ id: donors.id, name: donors.name, phone: donors.phone })
    .from(donors)
    .where(eq(donors.phone, phone.trim()))
    .limit(1)
    .then((r) => r[0] ?? null);

  return jsonOk(c, row ?? null);
});

// ── GET /donors/blacklisted ───────────────────────────────────────────────────
// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(listBlacklistedDonorsRoute, async (c) => {
  const blacklistedDonors = await db(c)
    .select()
    .from(donors)
    .where(eq(donors.status, 'blacklisted'));

  return jsonOk(c, blacklistedDonors, 'Blacklisted donors fetched successfully');
});

// ── GET /donors/:id ───────────────────────────────────────────────────────────
// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(getDonorByIdRoute, async (c) => {
  const { id } = c.req.valid('param');
  const row = await db(c)
    .select()
    .from(donors)
    .where(eq(donors.id, id))
    .limit(1)
    .then((r) => r[0] ?? null);

  if (!row) return jsonError(c, 404, 'Donor not found');
  return jsonOk(c, row);
});

// ── POST /donors ──────────────────────────────────────────────────────────────
// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(createDonorRoute, async (c) => {
  const body = c.req.valid('json');

  // Check for duplicate phone number
  const existing = await db(c)
    .select({ id: donors.id })
    .from(donors)
    .where(eq(donors.phone, body.phone.trim()))
    .limit(1)
    .then((r) => r[0] ?? null);
  if (existing) return jsonError(c, 409, 'Donor already exists with this contact number');

  const id = newId();

  // Auto-capitalize name (GR-006)
  const name = capitalize(body.name);

  // Ensure defaults are always present, even if validator does not populate them.
  const donationCount = body.lastDonation
    ? body.donationCount === 0
      ? 1
      : body.donationCount ?? 1
    : body.donationCount ?? 0;
  const status = body.status ?? 'unverified';
  const effectiveStatus =
    status === 'dormant' || status === 'do_not_call' ? 'blacklisted' : status;
  const blacklistReason =
    effectiveStatus === 'blacklisted'
      ? (body.blacklistReason ?? status)
      : null;
  const communicationType = body.communicationType ?? 'phone_call';
  const source = body.source ?? 'direct';
  const category = body.category ?? 'active';

  try {
    await db(c).insert(donors).values({
      id,
      name,
      bloodType: body.bloodType,
      phone: body.phone,
      location: body.location,
      lastDonation: body.lastDonation ?? null,
      lastContacted: body.lastContacted ?? null,
      rating: body.rating,
      donationCount,
      status: effectiveStatus,
      blacklistReason,
      communicationType,
      notes: body.notes ?? null,
      source,
      category,
    });

    const created = await db(c)
      .select()
      .from(donors)
      .where(eq(donors.id, id))
      .limit(1)
      .then((r) => r[0]!);
    return jsonOk(c, created, 'Donor registered', 201);
  } catch (err) {
    console.error('[Donor Create Error]', err);
    return jsonError(c, 500, 'Failed to create donor');
  }
});

// ── PUT /donors/:id ───────────────────────────────────────────────────────────
// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(updateDonorRoute, async (c) => {
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');

  const existing = await db(c)
    .select({ id: donors.id, donationCount: donors.donationCount, lastDonation: donors.lastDonation })
    .from(donors)
    .where(eq(donors.id, id))
    .limit(1)
    .then((r) => r[0] ?? null);
  if (!existing) return jsonError(c, 404, 'Donor not found');

  const fieldUpdates: Partial<typeof donors.$inferInsert> = {};

  if ('name' in body && body.name)       fieldUpdates.name = capitalize(body.name);
  if ('bloodType' in body && body.bloodType) fieldUpdates.bloodType = body.bloodType;
  if ('phone' in body && body.phone)     fieldUpdates.phone = body.phone;
  if ('location' in body && body.location) fieldUpdates.location = body.location;
  if ('lastDonation' in body)            fieldUpdates.lastDonation = body.lastDonation ?? null;
  if ('lastContacted' in body)           fieldUpdates.lastContacted = body.lastContacted ?? null;
  if ('rating' in body && body.rating !== undefined) fieldUpdates.rating = body.rating;
  if ('donationCount' in body && body.donationCount !== undefined) fieldUpdates.donationCount = body.donationCount;
  if ('blacklistReason' in body)         fieldUpdates.blacklistReason = body.blacklistReason ?? null;
  if ('communicationType' in body && body.communicationType) fieldUpdates.communicationType = body.communicationType;
  if ('notes' in body)                   fieldUpdates.notes = body.notes ?? null;
  if ('source' in body && body.source)   fieldUpdates.source = body.source;
  if ('category' in body && body.category) fieldUpdates.category = body.category;

  // Auto-blacklist if dormant or do_not_call (DR-003)
  if ('status' in body && body.status) {
    const effectiveStatus =
      body.status === 'dormant' || body.status === 'do_not_call' ? 'blacklisted' : body.status;
    fieldUpdates.status = effectiveStatus;
    if (effectiveStatus === 'blacklisted' && !('blacklistReason' in body)) {
      fieldUpdates.blacklistReason = body.status;
    }
  }

  // DR-007: if a new lastDonation is provided, auto-increment donation count
  if ('lastDonation' in body && body.lastDonation && body.lastDonation !== existing.lastDonation) {
    if (!('donationCount' in body)) {
      fieldUpdates.donationCount = (existing.donationCount ?? 0) + 1;
    }
  }

  if (Object.keys(fieldUpdates).length === 0) return jsonError(c, 400, 'No fields to update');

  fieldUpdates.updatedAt = nowSqlite();

  await db(c).update(donors).set(fieldUpdates).where(eq(donors.id, id));

  const updated = await db(c)
    .select()
    .from(donors)
    .where(eq(donors.id, id))
    .limit(1)
    .then((r) => r[0]!);
  return jsonOk(c, updated, 'Donor updated');
});

// ── DELETE /donors/:id ────────────────────────────────────────────────────────
// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(deleteDonorRoute, async (c) => {
  const user = c.var.user;
  if (!user || user.role !== 'admin') {
    return jsonError(c, 403, 'You do not have permission to access this resource');
  }

  const { id } = c.req.valid('param');
  const existing = await db(c)
    .select({ id: donors.id })
    .from(donors)
    .where(eq(donors.id, id))
    .limit(1)
    .then((r) => r[0] ?? null);
  if (!existing) return jsonError(c, 404, 'Donor not found');

  await db(c).delete(donors).where(eq(donors.id, id));
  return jsonOk(c, null, 'Donor deleted');
});

// ── POST /donors/:id/blacklist ────────────────────────────────────────────────
// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(blacklistDonorRoute, async (c) => {
  const user = c.var.user;
  if (!user || user.role !== 'admin') {
    return jsonError(c, 403, 'You do not have permission to access this resource');
  }

  const { id } = c.req.valid('param');
  const { reason } = c.req.valid('json');

  const existing = await db(c)
    .select({ id: donors.id })
    .from(donors)
    .where(eq(donors.id, id))
    .limit(1)
    .then((r) => r[0] ?? null);
  if (!existing) return jsonError(c, 404, 'Donor not found');

  await db(c)
    .update(donors)
    .set({ status: 'blacklisted', blacklistReason: reason, updatedAt: nowSqlite() })
    .where(eq(donors.id, id));

  return jsonOk(c, null, 'Donor blacklisted');
});

// ── POST /donors/:id/unblacklist ──────────────────────────────────────────────
// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(unblacklistDonorRoute, async (c) => {
  const user = c.var.user;
  if (!user || user.role !== 'admin') {
    return jsonError(c, 403, 'You do not have permission to access this resource');
  }

  const { id } = c.req.valid('param');
  const existing = await db(c)
    .select({ id: donors.id })
    .from(donors)
    .where(eq(donors.id, id))
    .limit(1)
    .then((r) => r[0] ?? null);
  if (!existing) return jsonError(c, 404, 'Donor not found');

  await db(c)
    .update(donors)
    .set({ status: 'unverified', blacklistReason: null, updatedAt: nowSqlite() })
    .where(eq(donors.id, id));

  return jsonOk(c, null, 'Donor removed from blacklist');
});

// ── POST /donors/import ───────────────────────────────────────────────────────
const VALID_BLOOD_TYPES = new Set(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']);
const VALID_STATUSES    = new Set(['unverified', 'active', 'pledged', 'blacklisted', 'dormant', 'do_not_call']);

function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

// Normalise blood-group text to the canonical symbol (e.g. "O Positive" → "O+")
function normaliseBloodType(raw: string): string {
  const s = raw.trim();
  const upper = s.toUpperCase();
  if (VALID_BLOOD_TYPES.has(upper)) return upper;

  const textMap: Record<string, string> = {
    'O POSITIVE': 'O+',  'O NEGATIVE': 'O-',
    'A POSITIVE': 'A+',  'A NEGATIVE': 'A-',
    'B POSITIVE': 'B+',  'B NEGATIVE': 'B-',
    'AB POSITIVE': 'AB+','AB NEGATIVE': 'AB-',
    'O POS': 'O+', 'O NEG': 'O-',
    'A POS': 'A+', 'A NEG': 'A-',
    'B POS': 'B+', 'B NEG': 'B-',
    'AB POS': 'AB+','AB NEG': 'AB-',
  };
  return textMap[upper] ?? s;
}

// Normalise status text to DB enum values
function normaliseStatus(raw: string): string {
  const s = raw.trim().toLowerCase().replace(/[\s-]/g, '_');
  if (VALID_STATUSES.has(s)) return s;
  const aliasMap: Record<string, string> = {
    'do not call': 'do_not_call',
    'donotcall': 'do_not_call',
    'dnc': 'do_not_call',
    'inactive': 'dormant',
    'blocked': 'blacklisted',
    'banned': 'blacklisted',
    'verified': 'active',
  };
  return aliasMap[raw.trim().toLowerCase()] ?? '';
}

// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(importDonorsRoute, async (c) => {
  const user = c.var.user;
  if (!user || user.role !== 'admin') {
    return jsonError(c, 403, 'You do not have permission to access this resource');
  }

  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    return jsonError(c, 400, 'Expected multipart/form-data');
  }

  const fileEntry = formData.get('file');
  if (!fileEntry || typeof fileEntry === 'string') {
    return jsonError(c, 400, 'No file uploaded (field name must be "file")');
  }
  const file = fileEntry as File;
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return jsonError(c, 400, 'Only .csv files are accepted');
  }

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length < 2) {
    return jsonError(c, 400, 'CSV must contain a header row and at least one data row');
  }

  const headers = parseCsvRow(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, ''));

  const idx = (...names: string[]) => {
    for (const n of names) {
      const i = headers.indexOf(n);
      if (i !== -1) return i;
    }
    return -1;
  };

  const nameIdx    = idx('name');
  const phoneIdx   = idx('phonenumber', 'phone');
  const btIdx      = idx('bloodgroup', 'bloodtype', 'blood');
  const locIdx     = idx('address', 'location');
  const statusIdx  = idx('status');
  const lcIdx      = idx('lastcontacteddate', 'lastcontacted');
  const ldIdx      = idx('lastdonateddate', 'lastdonation', 'lastdonated');
  const countIdx   = idx('totaldonations', 'donationcount', 'donations');
  const ratingIdx  = idx('rating');
  const notesIdx   = idx('remarks', 'notes');

  if ([nameIdx, phoneIdx, btIdx].includes(-1)) {
    return jsonError(
      c, 400,
      'CSV must include columns: Name, Phone Number, Blood Group',
    );
  }

  const errors: string[] = [];
  let inserted = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = i + 1;
    const cols = parseCsvRow(lines[i]);

    const name  = cols[nameIdx]  ?? '';
    const phone = cols[phoneIdx] ?? '';
    const btRaw = cols[btIdx]    ?? '';

    if (!name || !phone || !btRaw) {
      errors.push(`Row ${row}: missing required field(s) — Name, Phone Number and Blood Group are required`);
      continue;
    }

    const bloodType = normaliseBloodType(btRaw);
    if (!VALID_BLOOD_TYPES.has(bloodType)) {
      errors.push(`Row ${row}: unrecognised Blood Group "${btRaw}" ─ accepted values: O+, O-, A+, A-, B+, B-, AB+, AB-`);
      continue;
    }

    const location = (locIdx !== -1 ? cols[locIdx] : '') ?? '';

    const rawStatus  = statusIdx !== -1 ? (cols[statusIdx] ?? '') : '';
    const normStatus = rawStatus ? normaliseStatus(rawStatus) : '';
    const status     = normStatus && VALID_STATUSES.has(normStatus) ? normStatus : 'unverified';

    const lastContacted = lcIdx !== -1 ? (cols[lcIdx] ?? null) || null : null;
    const lastDonation  = ldIdx !== -1 ? (cols[ldIdx] ?? null) || null : null;

    const countRaw    = countIdx  !== -1 ? (cols[countIdx]  ?? '') : '';
    const ratingRaw   = ratingIdx !== -1 ? (cols[ratingIdx] ?? '') : '';
    const notes       = notesIdx  !== -1 ? (cols[notesIdx]  ?? null) || null : null;

    const donationCount = countRaw  ? Math.max(0, parseInt(countRaw,  10) || 0) : (lastDonation ? 1 : 0);
    const rating        = ratingRaw ? Math.min(5, Math.max(0, parseFloat(ratingRaw) || 0)) : 0;

    const effectiveStatus = status === 'dormant' || status === 'do_not_call' ? 'blacklisted' : status;
    const blacklistReason = effectiveStatus === 'blacklisted'
      ? (status === 'blacklisted' ? null : status)
      : null;

    const phoneExists = await db(c)
      .select({ id: donors.id })
      .from(donors)
      .where(eq(donors.phone, phone.trim()))
      .limit(1)
      .then((r) => r[0] ?? null);
    if (phoneExists) {
      errors.push(`Row ${row}: skipped — donor with phone "${phone}" already exists`);
      continue;
    }

    try {
      await db(c).insert(donors).values({
        id: newId(),
        name: capitalize(name),
        bloodType,
        phone: phone.trim(),
        location: location.trim(),
        rating,
        donationCount,
        status: effectiveStatus,
        blacklistReason,
        communicationType: 'phone_call',
        notes,
        source: 'direct',
        category: 'active',
        lastDonation:  lastDonation  ?? null,
        lastContacted: lastContacted ?? null,
      });
      inserted++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Row ${row}: insert failed — ${msg}`);
    }
  }

  return jsonOk(c, { inserted, failed: errors.length, errors }, 'Import complete');
});

// ── POST /donors/:id/contact ──────────────────────────────────────────────────
// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(logDonorContactRoute, async (c) => {
  const user = c.var.user;
  if (!user || user.role !== 'admin') {
    return jsonError(c, 403, 'You do not have permission to access this resource');
  }

  const { id } = c.req.valid('param');
  const body = c.req.valid('json');

  const existing = await db(c)
    .select({ id: donors.id })
    .from(donors)
    .where(eq(donors.id, id))
    .limit(1)
    .then((r) => r[0] ?? null);
  if (!existing) return jsonError(c, 404, 'Donor not found');

  const now = nowSqlite();

  await db(c).insert(donorContacts).values({
    id: newId(),
    donorId: id,
    requestId: body.requestId ?? null,
    contactedBy: user.id,
    communicationType: body.communicationType,
    notes: body.notes ?? null,
  });

  // Update last_contacted timestamp on the donor (DR-005)
  await db(c)
    .update(donors)
    .set({ lastContacted: now, updatedAt: now })
    .where(eq(donors.id, id));

  return jsonOk(c, null, 'Contact logged');
});

export default router;
