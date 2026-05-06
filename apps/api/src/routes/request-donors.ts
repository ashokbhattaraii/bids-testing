import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createRouter } from '../core/http/router';
import { jsonOk, jsonError } from '../core/http/errors';
import { db, newId } from '../core/db/client';
import { requireAuth, requireRole } from '../core/auth/middleware';

const router = createRouter();

router.use('*', requireAuth);

// ── Shared types ──────────────────────────────────────────────────────────────
type AssignmentRow = {
  id: string;
  request_id: string;
  donor_id: string;
  assigned_by: string;
  assigned_at: string;
  status: string;   // assigned | donated | declined | no_show
  notes: string | null;
};

// ── GET /request-donors?requestId= ───────────────────────────────────────────
// List donors assigned to a specific request
router.get('/', async (c) => {
  const { requestId } = c.req.query();
  if (!requestId) return jsonError(c, 400, 'requestId query param required');

  const rows = await db(c)
    .prepare(
      `SELECT rd.id as assignment_id, rd.status as assignment_status,
              rd.notes as assignment_notes, rd.assigned_at,
              d.id, d.name, d.phone, d.blood_type, d.location, d.rating
       FROM request_donors rd
       JOIN donors d ON rd.donor_id = d.id
       WHERE rd.request_id = ?1
       ORDER BY rd.assigned_at DESC`
    )
    .bind(requestId)
    .all<Record<string, unknown>>();

  return jsonOk(c, rows.results ?? []);
});

// ── POST /request-donors ──────────────────────────────────────────────────────
// Assign a donor to a request — ONLY via this external (+) endpoint (B.II.5 / B.II.12)
const assignSchema = z.object({
  requestId: z.string().min(1),
  donorId:   z.string().min(1),
  notes:     z.string().optional(),
});

router.post(
  '/',
  requireRole('admin', 'call_operator'),
  zValidator('json', assignSchema),
  async (c) => {
    const body = c.req.valid('json');

    // Verify request exists
    const request = await db(c)
      .prepare('SELECT id FROM blood_requests WHERE id = ?1')
      .bind(body.requestId)
      .first<{ id: string }>();
    if (!request) return jsonError(c, 404, 'Blood request not found');

    // Verify donor exists
    const donor = await db(c)
      .prepare('SELECT id FROM donors WHERE id = ?1')
      .bind(body.donorId)
      .first<{ id: string }>();
    if (!donor) return jsonError(c, 404, 'Donor not found');

    // Prevent duplicate assignment (B.II.5 — prevent duplicate actions)
    const duplicate = await db(c)
      .prepare('SELECT id FROM request_donors WHERE request_id = ?1 AND donor_id = ?2')
      .bind(body.requestId, body.donorId)
      .first<{ id: string }>();
    if (duplicate) return jsonError(c, 409, 'Donor is already assigned to this request');

    const id = newId();
    await db(c)
      .prepare(
        `INSERT INTO request_donors (id, request_id, donor_id, assigned_by, notes)
         VALUES (?1,?2,?3,?4,?5)`
      )
      .bind(id, body.requestId, body.donorId, c.var.user.id, body.notes ?? null)
      .run();

    const created = await db(c)
      .prepare('SELECT * FROM request_donors WHERE id = ?1')
      .bind(id)
      .first<AssignmentRow>();

    return jsonOk(c, created!, 'Donor assigned to request', 201);
  }
);

// ── PUT /request-donors/:id ───────────────────────────────────────────────────
// Update assignment status (donated, declined, no_show)
const updateSchema = z.object({
  status: z.enum(['assigned', 'donated', 'declined', 'no_show']),
  notes:  z.string().optional(),
});

router.put(
  '/:id',
  requireRole('admin', 'call_operator'),
  zValidator('json', updateSchema),
  async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');

    const existing = await db(c)
      .prepare('SELECT id FROM request_donors WHERE id = ?1')
      .bind(id)
      .first<{ id: string }>();
    if (!existing) return jsonError(c, 404, 'Assignment not found');

    const sets: string[] = [`status = ?1`];
    const binds: unknown[] = [body.status];

    if ('notes' in body) {
      sets.push(`notes = ?2`);
      binds.push(body.notes ?? null);
      binds.push(id);
      await db(c)
        .prepare(`UPDATE request_donors SET ${sets.join(', ')} WHERE id = ?3`)
        .bind(...binds)
        .run();
    } else {
      binds.push(id);
      await db(c)
        .prepare(`UPDATE request_donors SET status = ?1 WHERE id = ?2`)
        .bind(...binds)
        .run();
    }

    const updated = await db(c)
      .prepare('SELECT * FROM request_donors WHERE id = ?1')
      .bind(id)
      .first<AssignmentRow>();

    return jsonOk(c, updated!, 'Assignment updated');
  }
);

// ── DELETE /request-donors/:id ────────────────────────────────────────────────
// Remove a donor assignment
router.delete(
  '/:id',
  requireRole('admin', 'call_operator'),
  async (c) => {
    const id = c.req.param('id');

    const existing = await db(c)
      .prepare('SELECT id FROM request_donors WHERE id = ?1')
      .bind(id)
      .first<{ id: string }>();
    if (!existing) return jsonError(c, 404, 'Assignment not found');

    await db(c).prepare('DELETE FROM request_donors WHERE id = ?1').bind(id).run();
    return jsonOk(c, null, 'Assignment removed');
  }
);

export default router;
