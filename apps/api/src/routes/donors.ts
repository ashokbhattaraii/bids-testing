import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createRouter } from '../core/http/router';
import { jsonOk, jsonError } from '../core/http/errors';
import { db, newId } from '../core/db/client';
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

// ── Shared type ───────────────────────────────────────────────────────────────
type DonorRow = {
  id: string;
  name: string;
  blood_type: string;
  phone: string;
  location: string;
  last_donation: string | null;
  last_contacted: string | null;
  rating: number;
  donation_count: number;
  status: string;                 // active | pledged | blacklisted | dormant | do_not_call
  blacklist_reason: string | null;
  communication_type: string;     // phone_call | sms
  notes: string | null;           // merged remarks + feedback
  source: string;                 // direct | pledged | event | walk_in
  category: string;               // active | pledged | event
  created_at: string;
  updated_at: string;
};

// ── GET /donors ───────────────────────────────────────────────────────────────
router.get('/', async (c) => {
  const { status, bloodType, search, sortBy, source, page, limit } = c.req.query();

  const conditions: string[] = [];
  const binds: (string | number)[] = [];
  let i = 1;

  if (status && status !== 'all') {
    conditions.push(`status = ?${i++}`);
    binds.push(status);
  }
  if (bloodType && bloodType !== 'all') {
    conditions.push(`blood_type = ?${i++}`);
    binds.push(bloodType);
  }
  if (source && source !== 'all') {
    conditions.push(`source = ?${i++}`);
    binds.push(source);
  }
  if (search) {
    // Typo-tolerant: collapse extra spaces to wildcards
    const term = `%${search.trim().replace(/\s+/g, '%')}%`;
    conditions.push(
      `(name LIKE ?${i} OR phone LIKE ?${i} OR location LIKE ?${i} OR blood_type LIKE ?${i})`
    );
    binds.push(term);
    i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Sorting: default newest first; support rating, last_contacted, donation_count
  const allowedSort: Record<string, string> = {
    rating:         'rating DESC',
    last_contacted: 'last_contacted DESC NULLS LAST',
    donations:      'donation_count DESC',
    name:           'name ASC',
    recent:         'created_at DESC',
  };
  const orderBy = allowedSort[sortBy ?? ''] ?? 'created_at DESC';

  const pageNum  = Math.max(1, parseInt(page  ?? '1',  10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? '50', 10)));
  const offset   = (pageNum - 1) * limitNum;

  const [totalRes, rowsRes] = await Promise.all([
    db(c).prepare(`SELECT COUNT(*) as total FROM donors ${where}`).bind(...binds).first<{ total: number }>(),
    db(c)
      .prepare(`SELECT * FROM donors ${where} ORDER BY ${orderBy} LIMIT ?${i} OFFSET ?${i + 1}`)
      .bind(...binds, limitNum, offset)
      .all<DonorRow>(),
  ]);

  return jsonOk(c, {
    items: rowsRes.results ?? [],
    meta: { total: totalRes?.total ?? 0, page: pageNum, limit: limitNum },
  });
});

// ── GET /donors/:id ───────────────────────────────────────────────────────────
router.get('/:id', async (c) => {
  const row = await db(c)
    .prepare('SELECT * FROM donors WHERE id = ?1')
    .bind(c.req.param('id'))
    .first<DonorRow>();

  if (!row) return jsonError(c, 404, 'Donor not found');
  return jsonOk(c, row);
});

// ── GET /donors/lookup/by-phone ───────────────────────────────────────────────
// Auto-fill requester name from phone number (BRR-009 / B.II.2)
router.get('/lookup/by-phone', async (c) => {
  const { phone } = c.req.query();
  if (!phone) return jsonError(c, 400, 'phone query param required');

  const row = await db(c)
    .prepare('SELECT id, name, phone FROM donors WHERE phone = ?1 LIMIT 1')
    .bind(phone.trim())
    .first<{ id: string; name: string; phone: string }>();

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

  await db(c)
    .prepare(
      `INSERT INTO donors
        (id, name, blood_type, phone, location, last_donation, last_contacted,
         rating, donation_count, status, blacklist_reason, communication_type, notes, source, category)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15)`
    )
    .bind(
      id,
      name,
      body.bloodType,
      body.phone,
      body.location,
      body.lastDonation ?? null,
      body.lastContacted ?? null,
      body.rating,
      donationCount,
      effectiveStatus,
      blacklistReason,
      body.communicationType,
      body.notes ?? null,
      body.source,
      body.category,
    )
    .run();

  const created = await db(c).prepare('SELECT * FROM donors WHERE id = ?1').bind(id).first<DonorRow>();
  return jsonOk(c, created!, 'Donor registered', 201);
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
    .prepare('SELECT id, donation_count, last_donation FROM donors WHERE id = ?1')
    .bind(id)
    .first<{ id: string; donation_count: number; last_donation: string | null }>();
  if (!existing) return jsonError(c, 404, 'Donor not found');

  const sets: string[] = [];
  const binds: unknown[] = [];
  let i = 1;

  const fieldMap: Record<string, string> = {
    bloodType:         'blood_type',
    phone:             'phone',
    location:          'location',
    lastDonation:      'last_donation',
    lastContacted:     'last_contacted',
    rating:            'rating',
    donationCount:     'donation_count',
    blacklistReason:   'blacklist_reason',
    communicationType: 'communication_type',
    notes:             'notes',
    source:            'source',
    category:          'category',
  };

  if ('name' in body && body.name) {
    sets.push(`name = ?${i++}`);
    binds.push(capitalize(body.name));
  }

  for (const [key, col] of Object.entries(fieldMap)) {
    if (key in body) {
      sets.push(`${col} = ?${i++}`);
      binds.push((body as Record<string, unknown>)[key] ?? null);
    }
  }

  // Auto-blacklist if dormant or do_not_call (DR-003)
  if ('status' in body && body.status) {
    const effectiveStatus =
      body.status === 'dormant' || body.status === 'do_not_call' ? 'blacklisted' : body.status;
    sets.push(`status = ?${i++}`);
    binds.push(effectiveStatus);
    if (effectiveStatus === 'blacklisted' && !('blacklistReason' in body)) {
      sets.push(`blacklist_reason = ?${i++}`);
      binds.push(body.status); // use original status as reason
    }
  }

  // DR-007: if a new lastDonation is provided, auto-increment donation count
  if ('lastDonation' in body && body.lastDonation && body.lastDonation !== existing.last_donation) {
    if (!('donationCount' in body)) {
      sets.push(`donation_count = ?${i++}`);
      binds.push((existing.donation_count ?? 0) + 1);
    }
  }

  if (sets.length === 0) return jsonError(c, 400, 'No fields to update');

  sets.push(`updated_at = datetime('now')`);
  binds.push(id);

  await db(c).prepare(`UPDATE donors SET ${sets.join(', ')} WHERE id = ?${i}`).bind(...binds).run();

  const updated = await db(c).prepare('SELECT * FROM donors WHERE id = ?1').bind(id).first<DonorRow>();
  return jsonOk(c, updated!, 'Donor updated');
});

// ── DELETE /donors/:id ────────────────────────────────────────────────────────
// Admins can permanently delete a donor (C.4 — delete garna milne)
router.delete('/:id', requireRole('admin'), async (c) => {
  const id = c.req.param('id');
  const existing = await db(c)
    .prepare('SELECT id FROM donors WHERE id = ?1')
    .bind(id)
    .first<{ id: string }>();
  if (!existing) return jsonError(c, 404, 'Donor not found');

  await db(c).prepare('DELETE FROM donors WHERE id = ?1').bind(id).run();
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
      .prepare('SELECT id FROM donors WHERE id = ?1')
      .bind(id)
      .first<{ id: string }>();
    if (!existing) return jsonError(c, 404, 'Donor not found');

    await db(c)
      .prepare(
        `UPDATE donors SET status = 'blacklisted', blacklist_reason = ?1, updated_at = datetime('now') WHERE id = ?2`
      )
      .bind(reason, id)
      .run();

    return jsonOk(c, null, 'Donor blacklisted');
  }
);

// ── POST /donors/:id/unblacklist ──────────────────────────────────────────────
router.post('/:id/unblacklist', requireRole('admin'), async (c) => {
  const id = c.req.param('id');
  const existing = await db(c)
    .prepare('SELECT id FROM donors WHERE id = ?1')
    .bind(id)
    .first<{ id: string }>();
  if (!existing) return jsonError(c, 404, 'Donor not found');

  await db(c)
    .prepare(
      `UPDATE donors SET status = 'active', blacklist_reason = NULL, updated_at = datetime('now') WHERE id = ?1`
    )
    .bind(id)
    .run();

  return jsonOk(c, null, 'Donor removed from blacklist');
});

// ── POST /donors/:id/contact ──────────────────────────────────────────────────
// Log a contact event and update last_contacted (DR-005)
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
      .prepare('SELECT id FROM donors WHERE id = ?1')
      .bind(donorId)
      .first<{ id: string }>();
    if (!existing) return jsonError(c, 404, 'Donor not found');

    const contactId = newId();
    await db(c)
      .prepare(
        `INSERT INTO donor_contacts (id, donor_id, request_id, contacted_by, communication_type, notes)
         VALUES (?1,?2,?3,?4,?5,?6)`
      )
      .bind(
        contactId,
        donorId,
        body.requestId ?? null,
        c.var.user.id,
        body.communicationType,
        body.notes ?? null,
      )
      .run();

    // Update last_contacted timestamp on the donor
    await db(c)
      .prepare(`UPDATE donors SET last_contacted = datetime('now'), updated_at = datetime('now') WHERE id = ?1`)
      .bind(donorId)
      .run();

    return jsonOk(c, null, 'Contact logged');
  }
);

export default router;
