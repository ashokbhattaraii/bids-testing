import { zValidator } from '@hono/zod-validator';
import { db, newId } from '@bids/db';
import { z } from 'zod';
import { createRouter } from '../core/http/router';
import { jsonOk, jsonError } from '../core/http/errors';
import { requireAuth, requireRole } from '../core/auth/middleware';

const router = createRouter();

// All request routes require authentication
router.use('*', requireAuth);

// ── Utility ───────────────────────────────────────────────────────────────────
function capitalize(str: string): string {
  return str
    .split(' ')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ');
}

// ── Shared types ──────────────────────────────────────────────────────────────
type BloodRequestRow = {
  id: string;
  patient_name: string;
  hospital_id: string | null;
  hospital_name: string;
  blood_type: string;
  quantity: number;
  urgency: string;
  status: string;
  diagnosis: string | null;
  blood_components: string | null;
  blood_required_on: string | null;
  needed_by: string | null;
  notes: string | null;
  requester_name: string | null;
  requester_phone: string | null;
  contact_person: string;
  phone: string;
  location: string;
  transportation_required: number;
  managed_at: string | null;
  created_by: string;
  requested_at: string;
  updated_at: string;
};

function parseRow(row: BloodRequestRow) {
  return {
    ...row,
    transportation_required: !!row.transportation_required,
    blood_components: row.blood_components ? JSON.parse(row.blood_components) : [],
  };
}

// ── GET /requests ─────────────────────────────────────────────────────────────
// Supports filtering by status, urgency, bloodType, location, date range,
// and smart search (typo-tolerant) across patient, requester, or donor names.
router.get('/', async (c) => {
  const {
    status, urgency, bloodType, location,
    search, searchBy,
    from, to, page, limit,
  } = c.req.query();

  const conditions: string[] = [];
  const binds: (string | number)[] = [];
  let i = 1;

  if (status && status !== 'all') {
    conditions.push(`r.status = ?${i++}`);
    binds.push(status);
  }
  if (urgency && urgency !== 'all') {
    conditions.push(`r.urgency = ?${i++}`);
    binds.push(urgency);
  }
  if (bloodType && bloodType !== 'all') {
    conditions.push(`r.blood_type = ?${i++}`);
    binds.push(bloodType);
  }
  if (location && location !== 'all') {
    conditions.push(`r.location = ?${i++}`);
    binds.push(location);
  }
  if (from) {
    conditions.push(`date(r.requested_at) >= date(?${i++})`);
    binds.push(from);
  }
  if (to) {
    conditions.push(`date(r.requested_at) <= date(?${i++})`);
    binds.push(to);
  }

  if (search) {
    // Typo-tolerant: trim + collapse spaces → wildcard tokens
    const term = `%${search.trim().replace(/\s+/g, '%')}%`;
    const by = searchBy ?? 'all';
    if (by === 'requester') {
      conditions.push(`(r.requester_name LIKE ?${i} OR r.requester_phone LIKE ?${i})`);
    } else if (by === 'patient') {
      conditions.push(`r.patient_name LIKE ?${i}`);
    } else if (by === 'donor') {
      conditions.push(
        `r.id IN (SELECT rd.request_id FROM request_donors rd JOIN donors d ON rd.donor_id = d.id WHERE d.name LIKE ?${i})`
      );
    } else {
      conditions.push(
        `(r.patient_name LIKE ?${i} OR r.requester_name LIKE ?${i} OR r.hospital_name LIKE ?${i} OR r.blood_type LIKE ?${i})`
      );
    }
    binds.push(term);
    i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const pageNum = Math.max(1, parseInt(page ?? '1', 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? '20', 10)));
  const offset = (pageNum - 1) * limitNum;

  const [totalRes, rowsRes] = await Promise.all([
    db(c)
      .prepare(`SELECT COUNT(*) as total FROM blood_requests r ${where}`)
      .bind(...binds)
      .first<{ total: number }>(),
    db(c)
      .prepare(
        `SELECT r.* FROM blood_requests r ${where} ORDER BY r.requested_at DESC LIMIT ?${i} OFFSET ?${i + 1}`
      )
      .bind(...binds, limitNum, offset)
      .all<BloodRequestRow>(),
  ]);

  return jsonOk(c, {
    items: (rowsRes.results ?? []).map(parseRow),
    meta: { total: totalRes?.total ?? 0, page: pageNum, limit: limitNum },
  });
});

// ── GET /requests/:id ─────────────────────────────────────────────────────────
router.get('/:id', async (c) => {
  const row = await db(c)
    .prepare('SELECT * FROM blood_requests WHERE id = ?1')
    .bind(c.req.param('id'))
    .first<BloodRequestRow>();

  if (!row) return jsonError(c, 404, 'Request not found');

  // Attach assigned donors
  const donorsRes = await db(c)
    .prepare(
      `SELECT rd.id as assignment_id, rd.status as assignment_status,
              rd.notes as assignment_notes, rd.assigned_at,
              d.id, d.name, d.phone, d.blood_type, d.location
       FROM request_donors rd
       JOIN donors d ON rd.donor_id = d.id
       WHERE rd.request_id = ?1`
    )
    .bind(c.req.param('id'))
    .all<Record<string, unknown>>();

  return jsonOk(c, { ...parseRow(row), assignedDonors: donorsRes.results ?? [] });
});

// ── POST /requests ────────────────────────────────────────────────────────────
const createSchema = z.object({
  patientName:            z.string().min(1),
  hospitalId:             z.string().optional(),
  hospitalName:           z.string().min(1),
  bloodType:              z.enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']),
  quantity:               z.number().int().min(1).default(1),
  // v3: urgency defaults to 'urgent'; 'high' removed
  urgency:                z.enum(['critical', 'urgent', 'moderate', 'low']).default('urgent'),
  // v3: status vocabulary — pending/fulfilled/cancelled removed
  status:                 z.enum(['in_progress', 'managed', 'managed_and_verified', 'unmanaged']).default('in_progress'),
  diagnosis:              z.string().optional(),
  bloodComponents:        z.array(z.object({ id: z.string(), label: z.string(), qty: z.number() })).optional(),
  // v3: blood_required_on defaults to today; backdated entry (BRR-004) via requestedAt
  bloodRequiredOn:        z.string().optional(),
  neededBy:               z.string().optional(),
  notes:                  z.string().optional(),
  requesterName:          z.string().min(1),
  requesterPhone:         z.string().min(1),
  contactPerson:          z.string().optional(),
  phone:                  z.string().optional(),
  location:               z.enum(['inside_valley', 'outside_valley']).default('inside_valley'),
  // v3: transportation defaults to false (No)
  transportationRequired: z.boolean().default(false),
  // v3: allow backdated request submission
  requestedAt:            z.string().optional(),
});

router.post('/', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json');
  const id = newId();
  const today = new Date().toISOString().slice(0, 10);

  // Auto-capitalize names (GR-006)
  const patientName   = capitalize(body.patientName);
  const hospitalName  = capitalize(body.hospitalName);
  const requesterName = capitalize(body.requesterName);

  await db(c)
    .prepare(
      `INSERT INTO blood_requests
        (id, patient_name, hospital_id, hospital_name, blood_type, quantity, urgency, status,
         diagnosis, blood_components, blood_required_on, needed_by, notes,
         requester_name, requester_phone, contact_person, phone, location,
         transportation_required, created_by, requested_at)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,
               COALESCE(?21, datetime('now')))`
    )
    .bind(
      id,
      patientName,
      body.hospitalId ?? null,
      hospitalName,
      body.bloodType,
      body.quantity,
      body.urgency,
      body.status,
      body.diagnosis ?? null,
      body.bloodComponents ? JSON.stringify(body.bloodComponents) : null,
      body.bloodRequiredOn ?? today,
      body.neededBy ?? null,
      body.notes ?? null,
      requesterName,
      body.requesterPhone,
      body.contactPerson ?? requesterName,
      body.phone ?? body.requesterPhone,
      body.location,
      body.transportationRequired ? 1 : 0,
      c.var.user.id,
      body.requestedAt ?? null,
    )
    .run();

  const created = await db(c)
    .prepare('SELECT * FROM blood_requests WHERE id = ?1')
    .bind(id)
    .first<BloodRequestRow>();

  return jsonOk(c, parseRow(created!), 'Blood request created', 201);
});

// ── PUT /requests/:id ─────────────────────────────────────────────────────────
const updateSchema = z.object({
  patientName:            z.string().min(1).optional(),
  hospitalId:             z.string().optional(),
  hospitalName:           z.string().min(1).optional(),
  bloodType:              z.enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']).optional(),
  quantity:               z.number().int().min(1).optional(),
  urgency:                z.enum(['critical', 'urgent', 'moderate', 'low']).optional(),
  status:                 z.enum(['in_progress', 'managed', 'managed_and_verified', 'unmanaged']).optional(),
  diagnosis:              z.string().optional(),
  bloodComponents:        z.array(z.object({ id: z.string(), label: z.string(), qty: z.number() })).optional(),
  bloodRequiredOn:        z.string().optional(),
  neededBy:               z.string().optional(),
  notes:                  z.string().optional(),
  requesterName:          z.string().min(1).optional(),
  requesterPhone:         z.string().optional(),
  contactPerson:          z.string().optional(),
  phone:                  z.string().optional(),
  location:               z.enum(['inside_valley', 'outside_valley']).optional(),
  transportationRequired: z.boolean().optional(),
});

router.put('/:id', zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const existing = await db(c)
    .prepare('SELECT id, status FROM blood_requests WHERE id = ?1')
    .bind(id)
    .first<{ id: string; status: string }>();

  if (!existing) return jsonError(c, 404, 'Request not found');

  const sets: string[] = [];
  const binds: unknown[] = [];
  let i = 1;

  const fieldMap: Record<string, string> = {
    patientName:     'patient_name',
    hospitalId:      'hospital_id',
    hospitalName:    'hospital_name',
    bloodType:       'blood_type',
    quantity:        'quantity',
    urgency:         'urgency',
    diagnosis:       'diagnosis',
    bloodRequiredOn: 'blood_required_on',
    neededBy:        'needed_by',
    notes:           'notes',
    requesterName:   'requester_name',
    requesterPhone:  'requester_phone',
    contactPerson:   'contact_person',
    phone:           'phone',
    location:        'location',
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (key in body) {
      const val = (body as Record<string, unknown>)[key];
      sets.push(`${col} = ?${i++}`);
      // Auto-capitalize string fields (GR-006)
      binds.push(val != null && typeof val === 'string' ? capitalize(val) : (val ?? null));
    }
  }

  if ('transportationRequired' in body) {
    sets.push(`transportation_required = ?${i++}`);
    binds.push(body.transportationRequired ? 1 : 0);
  }

  if ('bloodComponents' in body) {
    sets.push(`blood_components = ?${i++}`);
    binds.push(body.bloodComponents ? JSON.stringify(body.bloodComponents) : null);
  }

  // When status transitions to 'managed', stamp managed_at and create follow-up reminder
  if ('status' in body && body.status) {
    sets.push(`status = ?${i++}`);
    binds.push(body.status);

    if (body.status === 'managed' && existing.status !== 'managed') {
      sets.push(`managed_at = datetime('now')`);
      const reminderId = newId();
      await db(c)
        .prepare(
          `INSERT INTO follow_up_reminders (id, request_id, due_at)
           VALUES (?1, ?2, datetime('now', '+1 hour'))`
        )
        .bind(reminderId, id)
        .run();
    }
  }

  if (sets.length === 0) return jsonError(c, 400, 'No fields to update');

  sets.push(`updated_at = datetime('now')`);
  binds.push(id);

  await db(c)
    .prepare(`UPDATE blood_requests SET ${sets.join(', ')} WHERE id = ?${i}`)
    .bind(...binds)
    .run();

  const updated = await db(c)
    .prepare('SELECT * FROM blood_requests WHERE id = ?1')
    .bind(id)
    .first<BloodRequestRow>();

  return jsonOk(c, parseRow(updated!), 'Request updated');
});

// ── DELETE /requests/:id ──────────────────────────────────────────────────────
router.delete('/:id', requireRole('admin'), async (c) => {
  const id = c.req.param('id');

  const existing = await db(c)
    .prepare('SELECT id FROM blood_requests WHERE id = ?1')
    .bind(id)
    .first<{ id: string }>();

  if (!existing) return jsonError(c, 404, 'Request not found');

  await db(c).prepare('DELETE FROM blood_requests WHERE id = ?1').bind(id).run();
  return jsonOk(c, null, 'Request deleted');
});

// ── GET /requests/reminders/pending ──────────────────────────────────────────
// Returns all overdue unresolved follow-up reminders for dashboard display
router.get('/reminders/pending', async (c) => {
  const rows = await db(c)
    .prepare(
      `SELECT fr.*, br.patient_name, br.blood_type, br.hospital_name, br.status AS request_status
       FROM follow_up_reminders fr
       JOIN blood_requests br ON fr.request_id = br.id
       WHERE fr.resolved = 0 AND fr.due_at <= datetime('now')
       ORDER BY fr.due_at ASC`
    )
    .all<Record<string, unknown>>();

  return jsonOk(c, rows.results ?? []);
});

// ── GET /requests/:id/follow-up ───────────────────────────────────────────────
// Returns the pending follow-up reminder for a specific request
router.get('/:id/follow-up', async (c) => {
  const row = await db(c)
    .prepare(
      `SELECT * FROM follow_up_reminders WHERE request_id = ?1 AND resolved = 0
       ORDER BY due_at ASC LIMIT 1`
    )
    .bind(c.req.param('id'))
    .first<Record<string, unknown>>();

  return jsonOk(c, row ?? null);
});

// ── POST /requests/:id/follow-up/resolve ─────────────────────────────────────
// Operator resolves the 1-hour post-managed follow-up
const resolveFollowUpSchema = z.object({
  resolution: z.enum(['collected', 'managed_elsewhere']),
});

router.post(
  '/:id/follow-up/resolve',
  requireRole('admin'),
  zValidator('json', resolveFollowUpSchema),
  async (c) => {
    const requestId = c.req.param('id');
    const { resolution } = c.req.valid('json');

    const reminder = await db(c)
      .prepare(
        'SELECT id FROM follow_up_reminders WHERE request_id = ?1 AND resolved = 0 LIMIT 1'
      )
      .bind(requestId)
      .first<{ id: string }>();

    if (!reminder) return jsonError(c, 404, 'No pending follow-up reminder found');

    await db(c)
      .prepare(
        `UPDATE follow_up_reminders
         SET resolved = 1, resolution = ?1, resolved_by = ?2, resolved_at = datetime('now')
         WHERE id = ?3`
      )
      .bind(resolution, c.var.user.id, reminder.id)
      .run();

    return jsonOk(c, null, 'Follow-up reminder resolved');
  }
);

export default router;
