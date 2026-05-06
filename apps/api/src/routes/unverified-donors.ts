import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createRouter } from '../core/http/router';
import { jsonOk, jsonError } from '../core/http/errors';
import { db, newId } from '../core/db/client';
import { requireAuth, requireRole } from '../core/auth/middleware';

const router = createRouter();

router.use('*', requireAuth);

type UnverifiedRow = {
  id: string;
  name: string;
  blood_type: string;
  phone: string;
  address: string | null;
  registered_date: string;
  source: string;
  status: string;
  created_at: string;
};

// ── GET /unverified-donors ────────────────────────────────────────────────────
router.get('/', async (c) => {
  const { status, search, source } = c.req.query();

  const conditions: string[] = [];
  const binds: (string | number)[] = [];
  let i = 1;

  if (status && status !== 'all') {
    conditions.push(`status = ?${i++}`);
    binds.push(status);
  }
  if (source) {
    conditions.push(`source = ?${i++}`);
    binds.push(source);
  }
  if (search) {
    conditions.push(`(name LIKE ?${i} OR blood_type LIKE ?${i} OR source LIKE ?${i})`);
    binds.push(`%${search}%`);
    i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await db(c)
    .prepare(`SELECT * FROM unverified_donors ${where} ORDER BY registered_date DESC`)
    .bind(...binds)
    .all<UnverifiedRow>();

  return jsonOk(c, rows.results ?? []);
});

// ── POST /unverified-donors ───────────────────────────────────────────────────
const createSchema = z.object({
  name: z.string().min(1),
  bloodType: z.enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']),
  phone: z.string().min(1),
  address: z.string().optional(),
  source: z.enum(['Online Form', 'Walk-in', 'Referral', 'Campaign']).default('Online Form'),
});

router.post('/', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json');
  const id = newId();

  await db(c)
    .prepare(
      `INSERT INTO unverified_donors (id, name, blood_type, phone, address, source, status)
       VALUES (?1,?2,?3,?4,?5,?6,'pending')`
    )
    .bind(id, body.name, body.bloodType, body.phone, body.address ?? null, body.source)
    .run();

  const created = await db(c)
    .prepare('SELECT * FROM unverified_donors WHERE id = ?1')
    .bind(id)
    .first<UnverifiedRow>();

  return jsonOk(c, created!, 'Unverified donor registered', 201);
});

// ── PUT /unverified-donors/:id/status ─────────────────────────────────────────
const statusSchema = z.object({
  status: z.enum(['pending', 'contacted', 'verified', 'rejected']),
});

router.put(
  '/:id/status',
  requireRole('admin', 'call_operator'),
  zValidator('json', statusSchema),
  async (c) => {
    const id = c.req.param('id');
    const { status } = c.req.valid('json');

    const existing = await db(c)
      .prepare('SELECT * FROM unverified_donors WHERE id = ?1')
      .bind(id)
      .first<UnverifiedRow>();

    if (!existing) return jsonError(c, 404, 'Unverified donor not found');

    await db(c)
      .prepare('UPDATE unverified_donors SET status = ?1 WHERE id = ?2')
      .bind(status, id)
      .run();

    // If verified: create a verified donor record
    if (status === 'verified') {
      const donorId = newId();
      await db(c)
        .prepare(
          `INSERT INTO donors (id, name, blood_type, phone, location, donation_count, status)
           VALUES (?1,?2,?3,?4,?5,0,'available')`
        )
        .bind(donorId, existing.name, existing.blood_type, existing.phone, existing.address ?? 'Unknown')
        .run();
    }

    const updated = await db(c)
      .prepare('SELECT * FROM unverified_donors WHERE id = ?1')
      .bind(id)
      .first<UnverifiedRow>();

    return jsonOk(c, updated!, 'Status updated');
  },
);

export default router;
