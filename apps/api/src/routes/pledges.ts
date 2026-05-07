import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createRouter } from '../core/http/router';
import { jsonOk, jsonError } from '../core/http/errors';
import { db, newId } from '../core/db/client';
import { requireAuth, requireRole } from '../core/auth/middleware';

const router = createRouter();

router.use('*', requireAuth);

type PledgeRow = {
  id: string;
  name: string;
  blood_type: string;
  phone: string;
  address: string | null;
  pledge_date: string;
  hotline_agent: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// ── GET /pledges ──────────────────────────────────────────────────────────────
router.get('/', async (c) => {
  const { status, bloodType, search, page, limit } = c.req.query();

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
  if (search) {
    conditions.push(`(name LIKE ?${i} OR phone LIKE ?${i} OR blood_type LIKE ?${i})`);
    binds.push(`%${search}%`);
    i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const pageNum = Math.max(1, parseInt(page ?? '1', 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? '50', 10)));
  const offset = (pageNum - 1) * limitNum;

  const [totalRes, rowsRes] = await Promise.all([
    db(c).prepare(`SELECT COUNT(*) as total FROM pledges ${where}`).bind(...binds).first<{ total: number }>(),
    db(c)
      .prepare(`SELECT * FROM pledges ${where} ORDER BY pledge_date DESC LIMIT ?${i} OFFSET ?${i + 1}`)
      .bind(...binds, limitNum, offset)
      .all<PledgeRow>(),
  ]);

  return jsonOk(c, {
    items: rowsRes.results ?? [],
    meta: { total: totalRes?.total ?? 0, page: pageNum, limit: limitNum },
  });
});

// ── GET /pledges/:id ──────────────────────────────────────────────────────────
router.get('/:id', async (c) => {
  const row = await db(c)
    .prepare('SELECT * FROM pledges WHERE id = ?1')
    .bind(c.req.param('id'))
    .first<PledgeRow>();

  if (!row) return jsonError(c, 404, 'Pledge not found');
  return jsonOk(c, row);
});

// ── POST /pledges ─────────────────────────────────────────────────────────────
const createSchema = z.object({
  name: z.string().min(1),
  bloodType: z.enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']),
  phone: z.string().min(1),
  address: z.string().optional(),
  hotlineAgent: z.string().optional(),
  status: z.enum(['new', 'contacted', 'converted']).default('new'),
  notes: z.string().optional(),
});

router.post('/', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json');
  const id = newId();

  await db(c)
    .prepare(
      `INSERT INTO pledges (id, name, blood_type, phone, address, hotline_agent, status, notes)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8)`
    )
    .bind(id, body.name, body.bloodType, body.phone, body.address ?? null, body.hotlineAgent ?? null, body.status, body.notes ?? null)
    .run();

  const created = await db(c).prepare('SELECT * FROM pledges WHERE id = ?1').bind(id).first<PledgeRow>();
  return jsonOk(c, created!, 'Pledge recorded', 201);
});

// ── PUT /pledges/:id ──────────────────────────────────────────────────────────
const updateSchema = createSchema.partial();

router.put('/:id', zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const existing = await db(c).prepare('SELECT id FROM pledges WHERE id = ?1').bind(id).first<{ id: string }>();
  if (!existing) return jsonError(c, 404, 'Pledge not found');

  const sets: string[] = [];
  const binds: unknown[] = [];
  let i = 1;

  const fieldMap: Record<string, string> = {
    name: 'name',
    bloodType: 'blood_type',
    phone: 'phone',
    address: 'address',
    hotlineAgent: 'hotline_agent',
    status: 'status',
    notes: 'notes',
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (key in body) {
      sets.push(`${col} = ?${i++}`);
      binds.push((body as Record<string, unknown>)[key] ?? null);
    }
  }

  if (sets.length === 0) return jsonError(c, 400, 'No fields to update');

  sets.push(`updated_at = datetime('now')`);
  binds.push(id);

  await db(c).prepare(`UPDATE pledges SET ${sets.join(', ')} WHERE id = ?${i}`).bind(...binds).run();

  const updated = await db(c).prepare('SELECT * FROM pledges WHERE id = ?1').bind(id).first<PledgeRow>();
  return jsonOk(c, updated!, 'Pledge updated');
});

// ── POST /pledges/:id/convert ─────────────────────────────────────────────────
// Convert a pledge into a verified donor record
router.post('/:id/convert', requireRole('admin'), async (c) => {
  const id = c.req.param('id');

  const pledge = await db(c).prepare('SELECT * FROM pledges WHERE id = ?1').bind(id).first<PledgeRow>();
  if (!pledge) return jsonError(c, 404, 'Pledge not found');

  const donorId = newId();

  // Create donor from pledge data
  await db(c)
    .prepare(
      `INSERT INTO donors (id, name, blood_type, phone, location, donation_count, status)
       VALUES (?1,?2,?3,?4,?5,0,'available')`
    )
    .bind(donorId, pledge.name, pledge.blood_type, pledge.phone, pledge.address ?? 'Unknown')
    .run();

  // Update pledge status
  await db(c)
    .prepare(`UPDATE pledges SET status = 'converted', updated_at = datetime('now') WHERE id = ?1`)
    .bind(id)
    .run();

  return jsonOk(c, { donorId }, 'Pledge converted to verified donor', 201);
});

export default router;
