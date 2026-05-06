import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createRouter } from '../core/http/router';
import { jsonOk, jsonError } from '../core/http/errors';
import { db, newId } from '../core/db/client';
import { requireAuth, requireRole } from '../core/auth/middleware';

const router = createRouter();

router.use('*', requireAuth);

type FeedbackRow = {
  id: string;
  type: string;            // patient | donor
  name: string;
  message: string;
  rating: number;
  status: string;          // new | reviewed | resolved
  request_id: string | null;
  donated: number;         // 1=yes, 0=no  (donor feedback only)
  created_at: string;
  updated_at: string;
};

// ── GET /feedback ─────────────────────────────────────────────────────────────
router.get('/', async (c) => {
  const { type, status, page, limit } = c.req.query();

  const conditions: string[] = [];
  const binds: (string | number)[] = [];
  let i = 1;

  if (type && type !== 'all') {
    conditions.push(`type = ?${i++}`);
    binds.push(type);
  }
  if (status && status !== 'all') {
    conditions.push(`status = ?${i++}`);
    binds.push(status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const pageNum = Math.max(1, parseInt(page ?? '1', 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? '50', 10)));
  const offset = (pageNum - 1) * limitNum;

  const [totalRes, rowsRes] = await Promise.all([
    db(c).prepare(`SELECT COUNT(*) as total FROM feedback ${where}`).bind(...binds).first<{ total: number }>(),
    db(c)
      .prepare(`SELECT * FROM feedback ${where} ORDER BY created_at DESC LIMIT ?${i} OFFSET ?${i + 1}`)
      .bind(...binds, limitNum, offset)
      .all<FeedbackRow>(),
  ]);

  return jsonOk(c, {
    items: rowsRes.results ?? [],
    meta: { total: totalRes?.total ?? 0, page: pageNum, limit: limitNum },
  });
});

// ── POST /feedback ────────────────────────────────────────────────────────────
// Any authenticated user can submit feedback
const createSchema = z.object({
  type:      z.enum(['patient', 'donor']),
  name:      z.string().min(1),
  message:   z.string().min(1),
  rating:    z.number().int().min(1).max(5).default(5),
  // Donor feedback: link to request and track whether the donor actually donated (FR-003)
  requestId: z.string().optional(),
  donated:   z.boolean().default(true),
});

router.post('/', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json');
  const id = newId();

  await db(c)
    .prepare(
      `INSERT INTO feedback (id, type, name, message, rating, status, request_id, donated)
       VALUES (?1,?2,?3,?4,?5,'new',?6,?7)`
    )
    .bind(id, body.type, body.name, body.message, body.rating, body.requestId ?? null, body.donated ? 1 : 0)
    .run();

  const created = await db(c).prepare('SELECT * FROM feedback WHERE id = ?1').bind(id).first<FeedbackRow>();
  return jsonOk(c, created!, 'Feedback submitted', 201);
});

// ── PUT /feedback/:id ─────────────────────────────────────────────────────────
// Update status (admin / call_operator)
const updateSchema = z.object({
  status: z.enum(['new', 'reviewed', 'resolved']),
});

router.put('/:id', requireRole('admin', 'call_operator'), zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id');
  const { status } = c.req.valid('json');

  const existing = await db(c).prepare('SELECT id FROM feedback WHERE id = ?1').bind(id).first<{ id: string }>();
  if (!existing) return jsonError(c, 404, 'Feedback not found');

  await db(c)
    .prepare(`UPDATE feedback SET status = ?1, updated_at = datetime('now') WHERE id = ?2`)
    .bind(status, id)
    .run();

  const updated = await db(c).prepare('SELECT * FROM feedback WHERE id = ?1').bind(id).first<FeedbackRow>();
  return jsonOk(c, updated!, 'Feedback updated');
});

// ── DELETE /feedback/:id ──────────────────────────────────────────────────────
router.delete('/:id', requireRole('admin'), async (c) => {
  const id = c.req.param('id');
  const existing = await db(c).prepare('SELECT id FROM feedback WHERE id = ?1').bind(id).first<{ id: string }>();
  if (!existing) return jsonError(c, 404, 'Feedback not found');

  await db(c).prepare('DELETE FROM feedback WHERE id = ?1').bind(id).run();
  return jsonOk(c, null, 'Feedback deleted');
});

export default router;
