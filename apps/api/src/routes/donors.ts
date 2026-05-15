import { zValidator } from '@hono/zod-validator';
import { drizzleDb as db, donors, donorContacts, newId } from '@bids/db';
import { eq, like, and, or, count, sql, asc, desc } from 'drizzle-orm';
import { z } from 'zod';
import { createRouter } from '../core/http/router';
import { jsonOk, jsonError } from '../core/http/errors';
import { requireAuth, requireRole } from '../core/auth/middleware';

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
router.get('/', async (c) => {
  const { status, bloodType, search, sortBy, source, page, limit } = c.req.query();

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

  const pageNum  = Math.max(1, parseInt(page  ?? '1',  10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? '50', 10)));
  const offset   = (pageNum - 1) * limitNum;

  const [totalRes, rows] = await Promise.all([
    db(c).select({ total: count() }).from(donors).where(whereClause),
    db(c).select().from(donors).where(whereClause).orderBy(orderByCol).limit(limitNum).offset(offset),
  ]);

  return jsonOk(c, {
    items: rows,
    meta: { total: totalRes[0]?.total ?? 0, page: pageNum, limit: limitNum },
  });
});

// ── GET /donors/:id ───────────────────────────────────────────────────────────
router.get('/:id', async (c) => {
  const row = await db(c)
    .select()
    .from(donors)
    .where(eq(donors.id, c.req.param('id')))
    .limit(1)
    .then((r) => r[0] ?? null);

  if (!row) return jsonError(c, 404, 'Donor not found');
  return jsonOk(c, row);
});

// ── GET /donors/lookup/by-phone ───────────────────────────────────────────────
router.get('/lookup/by-phone', async (c) => {
  const { phone } = c.req.query();
  if (!phone) return jsonError(c, 400, 'phone query param required');

  const row = await db(c)
    .select({ id: donors.id, name: donors.name, phone: donors.phone })
    .from(donors)
    .where(eq(donors.phone, phone.trim()))
    .limit(1)
    .then((r) => r[0] ?? null);

  return jsonOk(c, row ?? null);
});

// ── POST /donors ──────────────────────────────────────────────────────────────
const createSchema = z.object({
  name:              z.string().min(1),
  bloodType:         z.enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']),
  phone:             z.string().min(1),
  location:          z.string().min(1),
  lastDonation:      z.string().optional(),
  lastContacted:     z.string().optional(),
  // v3: rating is mandatory (DR-004); no default — caller must supply
  rating:            z.number().min(0).max(5),
  donationCount:     z.number().int().min(0).default(0),
  // v3: status vocabulary — available/unavailable removed
  status:            z.enum(['active', 'pledged', 'blacklisted', 'dormant', 'do_not_call']).default('active'),
  blacklistReason:   z.string().optional(),
  communicationType: z.enum(['phone_call', 'sms']).default('phone_call'),
  notes:             z.string().optional(),
  source:            z.enum(['direct', 'pledged', 'event', 'walk_in']).default('direct'),
  category:          z.enum(['active', 'pledged', 'event']).default('active'),
});

router.post('/', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json');
  const id = newId();

  // Auto-capitalize name (GR-006)
  const name = capitalize(body.name);

  // Auto-blacklist if dormant or do_not_call (DR-003)
  const effectiveStatus =
    body.status === 'dormant' || body.status === 'do_not_call' ? 'blacklisted' : body.status;
  const blacklistReason =
    effectiveStatus === 'blacklisted'
      ? (body.blacklistReason ?? body.status)
      : null;

  // If lastDonation is provided, auto-increment donation count (DR-007)
  const donationCount =
    body.lastDonation && body.donationCount === 0 ? 1 : body.donationCount;

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
    communicationType: body.communicationType,
    notes: body.notes ?? null,
    source: body.source,
    category: body.category,
  });

  const created = await db(c)
    .select()
    .from(donors)
    .where(eq(donors.id, id))
    .limit(1)
    .then((r) => r[0]!);
  return jsonOk(c, created, 'Donor registered', 201);
});

// ── PUT /donors/:id ───────────────────────────────────────────────────────────
const updateSchema = z.object({
  name:              z.string().min(1).optional(),
  bloodType:         z.enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']).optional(),
  phone:             z.string().min(1).optional(),
  location:          z.string().min(1).optional(),
  lastDonation:      z.string().optional(),
  lastContacted:     z.string().optional(),
  rating:            z.number().min(0).max(5).optional(),
  donationCount:     z.number().int().min(0).optional(),
  status:            z.enum(['active', 'pledged', 'blacklisted', 'dormant', 'do_not_call']).optional(),
  blacklistReason:   z.string().optional(),
  communicationType: z.enum(['phone_call', 'sms']).optional(),
  notes:             z.string().optional(),
  source:            z.enum(['direct', 'pledged', 'event', 'walk_in']).optional(),
  category:          z.enum(['active', 'pledged', 'event']).optional(),
});

router.put('/:id', zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id');
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
  if ('bloodType' in body)               fieldUpdates.bloodType = body.bloodType;
  if ('phone' in body)                   fieldUpdates.phone = body.phone;
  if ('location' in body)                fieldUpdates.location = body.location;
  if ('lastDonation' in body)            fieldUpdates.lastDonation = body.lastDonation ?? null;
  if ('lastContacted' in body)           fieldUpdates.lastContacted = body.lastContacted ?? null;
  if ('rating' in body)                  fieldUpdates.rating = body.rating;
  if ('donationCount' in body)           fieldUpdates.donationCount = body.donationCount;
  if ('blacklistReason' in body)         fieldUpdates.blacklistReason = body.blacklistReason ?? null;
  if ('communicationType' in body)       fieldUpdates.communicationType = body.communicationType;
  if ('notes' in body)                   fieldUpdates.notes = body.notes ?? null;
  if ('source' in body)                  fieldUpdates.source = body.source;
  if ('category' in body)                fieldUpdates.category = body.category;

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
router.delete('/:id', requireRole('admin'), async (c) => {
  const id = c.req.param('id');
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
const blacklistSchema = z.object({ reason: z.string().min(1) });

router.post(
  '/:id/blacklist',
  requireRole('admin'),
  zValidator('json', blacklistSchema),
  async (c) => {
    const id = c.req.param('id');
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
  }
);

// ── POST /donors/:id/unblacklist ──────────────────────────────────────────────
router.post('/:id/unblacklist', requireRole('admin'), async (c) => {
  const id = c.req.param('id');
  const existing = await db(c)
    .select({ id: donors.id })
    .from(donors)
    .where(eq(donors.id, id))
    .limit(1)
    .then((r) => r[0] ?? null);
  if (!existing) return jsonError(c, 404, 'Donor not found');

  await db(c)
    .update(donors)
    .set({ status: 'active', blacklistReason: null, updatedAt: nowSqlite() })
    .where(eq(donors.id, id));

  return jsonOk(c, null, 'Donor removed from blacklist');
});

// ── POST /donors/:id/contact ──────────────────────────────────────────────────
const contactSchema = z.object({
  communicationType: z.enum(['phone_call', 'sms']).default('phone_call'),
  requestId:         z.string().optional(),
  notes:             z.string().optional(),
});

router.post(
  '/:id/contact',
  requireRole('admin'),
  zValidator('json', contactSchema),
  async (c) => {
    const donorId = c.req.param('id');
    const body = c.req.valid('json');

    const existing = await db(c)
      .select({ id: donors.id })
      .from(donors)
      .where(eq(donors.id, donorId))
      .limit(1)
      .then((r) => r[0] ?? null);
    if (!existing) return jsonError(c, 404, 'Donor not found');

    const now = nowSqlite();

    await db(c).insert(donorContacts).values({
      id: newId(),
      donorId,
      requestId: body.requestId ?? null,
      contactedBy: c.var.user.id,
      communicationType: body.communicationType,
      notes: body.notes ?? null,
    });

    // Update last_contacted timestamp on the donor (DR-005)
    await db(c)
      .update(donors)
      .set({ lastContacted: now, updatedAt: now })
      .where(eq(donors.id, donorId));

    return jsonOk(c, null, 'Contact logged');
  }
);

export default router;
