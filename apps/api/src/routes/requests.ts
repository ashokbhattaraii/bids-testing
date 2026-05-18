import { zValidator } from '@hono/zod-validator';
import { drizzleDb, newId, hospitals, requests } from '@bids/db';
import { and, desc, eq, gte, like, lte, or, sql, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import { createRouter } from '../core/http/router';
import { jsonOk, jsonError } from '../core/http/errors';
import { buildPaginationMeta, parsePagination } from '../core/http/pagination';
import { requireAuth, requireRole } from '../core/auth/middleware';

const router = createRouter();

// All request routes require authentication
router.use('*', requireAuth);

// // ── Utility ───────────────────────────────────────────────────────────────────
// function capitalize(str: string): string {
//   return str
//     .split(' ')
//     .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
//     .join(' ');
// }

// // ── Shared types ──────────────────────────────────────────────────────────────
// type BloodRequestRow = {
//   id: string;
//   patient_name: string;
//   hospital_id: string | null;
//   hospital_name: string;
//   blood_type: string;
//   quantity: number;
//   urgency: string;
//   status: string;
//   diagnosis: string | null;
//   blood_components: string | null;
//   blood_required_on: string | null;
//   needed_by: string | null;
//   notes: string | null;
//   requester_name: string | null;
//   requester_phone: string | null;
//   contact_person: string;
//   phone: string;
//   location: string;
//   transportation_required: number;
//   managed_at: string | null;
//   created_by: string;
//   requested_at: string;
//   updated_at: string;
// };

// function parseRow(row: BloodRequestRow) {
//   return {
//     ...row,
//     transportation_required: !!row.transportation_required,
//     blood_components: row.blood_components ? JSON.parse(row.blood_components) : [],
//   };
// }

// // ── GET /requests ─────────────────────────────────────────────────────────────
// // Supports filtering by status, urgency, bloodType, location, date range,
// // and smart search (typo-tolerant) across patient, requester, or donor names.
// router.get('/', async (c) => {
//   const {
//     status, urgency, bloodType, location,
//     search, searchBy,
//     from, to, page, limit,
//   } = c.req.query();

//   const conditions: string[] = [];
//   const binds: (string | number)[] = [];
//   let i = 1;

//   if (status && status !== 'all') {
//     conditions.push(`r.status = ?${i++}`);
//     binds.push(status);
//   }
//   if (urgency && urgency !== 'all') {
//     conditions.push(`r.urgency = ?${i++}`);
//     binds.push(urgency);
//   }
//   if (bloodType && bloodType !== 'all') {
//     conditions.push(`r.blood_type = ?${i++}`);
//     binds.push(bloodType);
//   }
//   if (location && location !== 'all') {
//     conditions.push(`r.location = ?${i++}`);
//     binds.push(location);
//   }
//   if (from) {
//     conditions.push(`date(r.requested_at) >= date(?${i++})`);
//     binds.push(from);
//   }
//   if (to) {
//     conditions.push(`date(r.requested_at) <= date(?${i++})`);
//     binds.push(to);
//   }

//   if (search) {
//     // Typo-tolerant: trim + collapse spaces → wildcard tokens
//     const term = `%${search.trim().replace(/\s+/g, '%')}%`;
//     const by = searchBy ?? 'all';
//     if (by === 'requester') {
//       conditions.push(`(r.requester_name LIKE ?${i} OR r.requester_phone LIKE ?${i})`);
//     } else if (by === 'patient') {
//       conditions.push(`r.patient_name LIKE ?${i}`);
//     } else if (by === 'donor') {
//       conditions.push(
//         `r.id IN (SELECT rd.request_id FROM request_donors rd JOIN donors d ON rd.donor_id = d.id WHERE d.name LIKE ?${i})`
//       );
//     } else {
//       conditions.push(
//         `(r.patient_name LIKE ?${i} OR r.requester_name LIKE ?${i} OR r.hospital_name LIKE ?${i} OR r.blood_type LIKE ?${i})`
//       );
//     }
//     binds.push(term);
//     i++;
//   }

//   const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

//   const pageNum = Math.max(1, parseInt(page ?? '1', 10));
//   const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? '20', 10)));
//   const offset = (pageNum - 1) * limitNum;

//   const [totalRes, rowsRes] = await Promise.all([
//     db(c)
//       .prepare(`SELECT COUNT(*) as total FROM blood_requests r ${where}`)
//       .bind(...binds)
//       .first<{ total: number }>(),
//     db(c)
//       .prepare(
//         `SELECT r.* FROM blood_requests r ${where} ORDER BY r.requested_at DESC LIMIT ?${i} OFFSET ?${i + 1}`
//       )
//       .bind(...binds, limitNum, offset)
//       .all<BloodRequestRow>(),
//   ]);

//   return jsonOk(c, {
//     items: (rowsRes.results ?? []).map(parseRow),
//     meta: { total: totalRes?.total ?? 0, page: pageNum, limit: limitNum },
//   });
// });

// // ── GET /requests/:id ─────────────────────────────────────────────────────────
// router.get('/:id', async (c) => {
//   const row = await db(c)
//     .prepare('SELECT * FROM blood_requests WHERE id = ?1')
//     .bind(c.req.param('id'))
//     .first<BloodRequestRow>();

//   if (!row) return jsonError(c, 404, 'Request not found');

//   // Attach assigned donors
//   const donorsRes = await db(c)
//     .prepare(
//       `SELECT rd.id as assignment_id, rd.status as assignment_status,
//               rd.notes as assignment_notes, rd.assigned_at,
//               d.id, d.name, d.phone, d.blood_type, d.location
//        FROM request_donors rd
//        JOIN donors d ON rd.donor_id = d.id
//        WHERE rd.request_id = ?1`
//     )
//     .bind(c.req.param('id'))
//     .all<Record<string, unknown>>();

//   return jsonOk(c, { ...parseRow(row), assignedDonors: donorsRes.results ?? [] });
// });

// // ── PUT /requests/:id ─────────────────────────────────────────────────────────
// const updateSchema = z.object({
//   patientName:            z.string().min(1).optional(),
//   hospitalId:             z.string().optional(),
//   hospitalName:           z.string().min(1).optional(),
//   bloodType:              z.enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']).optional(),
//   quantity:               z.number().int().min(1).optional(),
//   urgency:                z.enum(['critical', 'urgent', 'moderate', 'low']).optional(),
//   status:                 z.enum(['in_progress', 'managed', 'managed_and_verified', 'unmanaged']).optional(),
//   diagnosis:              z.string().optional(),
//   bloodComponents:        z.array(z.object({ id: z.string(), label: z.string(), qty: z.number() })).optional(),
//   bloodRequiredOn:        z.string().optional(),
//   neededBy:               z.string().optional(),
//   notes:                  z.string().optional(),
//   requesterName:          z.string().min(1).optional(),
//   requesterPhone:         z.string().optional(),
//   contactPerson:          z.string().optional(),
//   phone:                  z.string().optional(),
//   location:               z.enum(['inside_valley', 'outside_valley']).optional(),
//   transportationRequired: z.boolean().optional(),
// });

// router.put('/:id', zValidator('json', updateSchema), async (c) => {
//   const id = c.req.param('id');
//   const body = c.req.valid('json');

//   const existing = await db(c)
//     .prepare('SELECT id, status FROM blood_requests WHERE id = ?1')
//     .bind(id)
//     .first<{ id: string; status: string }>();

//   if (!existing) return jsonError(c, 404, 'Request not found');

//   const sets: string[] = [];
//   const binds: unknown[] = [];
//   let i = 1;

//   const fieldMap: Record<string, string> = {
//     patientName:     'patient_name',
//     hospitalId:      'hospital_id',
//     hospitalName:    'hospital_name',
//     bloodType:       'blood_type',
//     quantity:        'quantity',
//     urgency:         'urgency',
//     diagnosis:       'diagnosis',
//     bloodRequiredOn: 'blood_required_on',
//     neededBy:        'needed_by',
//     notes:           'notes',
//     requesterName:   'requester_name',
//     requesterPhone:  'requester_phone',
//     contactPerson:   'contact_person',
//     phone:           'phone',
//     location:        'location',
//   };

//   for (const [key, col] of Object.entries(fieldMap)) {
//     if (key in body) {
//       const val = (body as Record<string, unknown>)[key];
//       sets.push(`${col} = ?${i++}`);
//       // Auto-capitalize string fields (GR-006)
//       binds.push(val != null && typeof val === 'string' ? capitalize(val) : (val ?? null));
//     }
//   }

//   if ('transportationRequired' in body) {
//     sets.push(`transportation_required = ?${i++}`);
//     binds.push(body.transportationRequired ? 1 : 0);
//   }

//   if ('bloodComponents' in body) {
//     sets.push(`blood_components = ?${i++}`);
//     binds.push(body.bloodComponents ? JSON.stringify(body.bloodComponents) : null);
//   }

//   // When status transitions to 'managed', stamp managed_at and create follow-up reminder
//   if ('status' in body && body.status) {
//     sets.push(`status = ?${i++}`);
//     binds.push(body.status);

//     if (body.status === 'managed' && existing.status !== 'managed') {
//       sets.push(`managed_at = datetime('now')`);
//       const reminderId = newId();
//       await db(c)
//         .prepare(
//           `INSERT INTO follow_up_reminders (id, request_id, due_at)
//            VALUES (?1, ?2, datetime('now', '+1 hour'))`
//         )
//         .bind(reminderId, id)
//         .run();
//     }
//   }

//   if (sets.length === 0) return jsonError(c, 400, 'No fields to update');

//   sets.push(`updated_at = datetime('now')`);
//   binds.push(id);

//   await db(c)
//     .prepare(`UPDATE blood_requests SET ${sets.join(', ')} WHERE id = ?${i}`)
//     .bind(...binds)
//     .run();

//   const updated = await db(c)
//     .prepare('SELECT * FROM blood_requests WHERE id = ?1')
//     .bind(id)
//     .first<BloodRequestRow>();

//   return jsonOk(c, parseRow(updated!), 'Request updated');
// });

// // ── DELETE /requests/:id ──────────────────────────────────────────────────────
// router.delete('/:id', requireRole('admin'), async (c) => {
//   const id = c.req.param('id');

//   const existing = await db(c)
//     .prepare('SELECT id FROM blood_requests WHERE id = ?1')
//     .bind(id)
//     .first<{ id: string }>();

//   if (!existing) return jsonError(c, 404, 'Request not found');

//   await db(c).prepare('DELETE FROM blood_requests WHERE id = ?1').bind(id).run();
//   return jsonOk(c, null, 'Request deleted');
// });

// // ── GET /requests/reminders/pending ──────────────────────────────────────────
// // Returns all overdue unresolved follow-up reminders for dashboard display
// router.get('/reminders/pending', async (c) => {
//   const rows = await db(c)
//     .prepare(
//       `SELECT fr.*, br.patient_name, br.blood_type, br.hospital_name, br.status AS request_status
//        FROM follow_up_reminders fr
//        JOIN blood_requests br ON fr.request_id = br.id
//        WHERE fr.resolved = 0 AND fr.due_at <= datetime('now')
//        ORDER BY fr.due_at ASC`
//     )
//     .all<Record<string, unknown>>();

//   return jsonOk(c, rows.results ?? []);
// });

// // ── GET /requests/:id/follow-up ───────────────────────────────────────────────
// // Returns the pending follow-up reminder for a specific request
// router.get('/:id/follow-up', async (c) => {
//   const row = await db(c)
//     .prepare(
//       `SELECT * FROM follow_up_reminders WHERE request_id = ?1 AND resolved = 0
//        ORDER BY due_at ASC LIMIT 1`
//     )
//     .bind(c.req.param('id'))
//     .first<Record<string, unknown>>();

//   return jsonOk(c, row ?? null);
// });

// // ── POST /requests/:id/follow-up/resolve ─────────────────────────────────────
// // Operator resolves the 1-hour post-managed follow-up
// const resolveFollowUpSchema = z.object({
//   resolution: z.enum(['collected', 'managed_elsewhere']),
// });

// router.post(
//   '/:id/follow-up/resolve',
//   requireRole('admin'),
//   zValidator('json', resolveFollowUpSchema),
//   async (c) => {
//     const requestId = c.req.param('id');
//     const { resolution } = c.req.valid('json');

//     const reminder = await db(c)
//       .prepare(
//         'SELECT id FROM follow_up_reminders WHERE request_id = ?1 AND resolved = 0 LIMIT 1'
//       )
//       .bind(requestId)
//       .first<{ id: string }>();

//     if (!reminder) return jsonError(c, 404, 'No pending follow-up reminder found');

//     await db(c)
//       .prepare(
//         `UPDATE follow_up_reminders
//          SET resolved = 1, resolution = ?1, resolved_by = ?2, resolved_at = datetime('now')
//          WHERE id = ?3`
//       )
//       .bind(resolution, c.var.user.id, reminder.id)
//       .run();

//     return jsonOk(c, null, 'Follow-up reminder resolved');
//   }
// );

// ── GET /requests ────────────────────────────────────────────────────────────
router.get('/', async (c) => {
	const { status, urgency, bloodType, location, search, from, to, page, limit } = c.req.query();
	const { page: pageNumber, limit: pageSize, offset } = parsePagination({ page, limit });

	const whereClauses: SQL[] = [];

	if (status && status !== 'all') {
		whereClauses.push(eq(requests.status, status));
	}

	if (urgency && urgency !== 'all') {
		whereClauses.push(eq(requests.urgency, urgency));
	}

	if (bloodType && bloodType !== 'all') {
		whereClauses.push(eq(requests.bloodType, bloodType));
	}

	if (location && location !== 'all') {
		whereClauses.push(eq(requests.location, location));
	}

	if (from) {
		whereClauses.push(gte(requests.neededBy, from));
	}

	if (to) {
		whereClauses.push(lte(requests.neededBy, to));
	}

	if (search?.trim()) {
		const term = `%${search.trim()}%`;
		whereClauses.push(
			or(
				like(requests.id, term),
				like(requests.patientName, term),
				like(requests.hospital, term),
				like(requests.bloodType, term),
				like(requests.contactPerson, term)
			)!
		);
	}

	const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

	const orm = drizzleDb(c);
	const requestQuery = orm
		.select({
			id: requests.id,
			patientName: requests.patientName,
			hospital: requests.hospital,
			bloodType: requests.bloodType,
			quantity: requests.quantity,
			urgency: requests.urgency,
			status: requests.status,
			requestedAt: requests.requestedAt,
			neededBy: requests.neededBy,
			notes: requests.notes,
			contactPerson: requests.contactPerson,
			phone: requests.phone,
			location: requests.location,
		})
		.from(requests);

	const totalQuery = orm
		.select({ total: sql<number>`count(*)` })
		.from(requests);

	const [requestList, totalResult] = await Promise.all([
		(where ? requestQuery.where(where) : requestQuery)
			.orderBy(desc(requests.requestedAt))
			.limit(pageSize)
			.offset(offset),
		where ? totalQuery.where(where) : totalQuery,
	]);

	const total = Number(totalResult[0]?.total ?? 0);
	const meta = buildPaginationMeta(total, pageNumber, pageSize);

	return jsonOk(c, { items: requestList, meta });
});

// ── POST /requests ────────────────────────────────────────────────────────────
const createSchema = z.object({
	patientName: z.string().min(1),
	requesterName: z.string().optional(),
	requesterPhone: z.string().optional(),
	diagnosis: z.string().optional(),
	hospitalId: z.string().optional(),
	hospital: z.string().min(1),
	bloodType: z.enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']),
	totalPints: z.preprocess((value) => (typeof value === 'string' ? Number(value) : value), z.number().int().min(1).optional()),
	urgency: z.enum(['critical', 'high', 'moderate', 'low']).default('high'),
	status: z.enum(['pending', 'in_progress', 'fulfilled', 'cancelled']).default('pending'),
	bloodRequiredOn: z.string().optional(),
	neededBy: z.string().optional(),
	additionalNotes: z.string().optional(),
	location: z.enum(['inside_valley', 'outside_valley']).default('inside_valley'),
	transportationRequired: z.enum(['yes', 'no', 'maybe']).optional(),
	requestedAt: z.string().optional(),
	selectedComponents: z.array(z.string()).optional(),
	componentQuantities: z.record(z.union([z.string(), z.number()])).optional(),
	images: z.array(z.object({ name: z.string().optional(), preview: z.string().optional() })).optional(),
});

router.post('/', zValidator('json', createSchema), async (c) => {
	const body = c.req.valid('json');
	const id = newId();
	const orm = drizzleDb(c);

	const createdAt = new Date().toISOString();
	const requestedAt = body.requestedAt ?? createdAt;
	const neededBy = body.bloodRequiredOn ?? body.neededBy ?? null;
	const componentQuantityTotal = Object.values(body.componentQuantities ?? {}).reduce<number>((sum, value) => {
		const parsed = typeof value === 'number' ? value : Number(value);
		return sum + (Number.isFinite(parsed) ? parsed : 0);
	}, 0);
	const quantity = body.totalPints ?? (componentQuantityTotal > 0 ? componentQuantityTotal : 1);

	let hospitalId = body.hospitalId ?? null;
	let hospitalName = body.hospital ?? null;

	if (hospitalId) {
		const hospitalExists = await orm
			.select({ id: hospitals.id, name: hospitals.name })
			.from(hospitals)
			.where(eq(hospitals.id, hospitalId))
			.limit(1);

		if (!hospitalExists[0]) {
			return jsonError(c, 400, 'Selected hospital does not exist');
		}

		hospitalName = hospitalExists[0].name;
	} else if (hospitalName) {
		const normalizedHospitalName = hospitalName.replace(/\s+—\s+.*$/, '').trim();
		const matchedHospital = await orm
			.select({ id: hospitals.id, name: hospitals.name })
			.from(hospitals)
			.where(eq(hospitals.name, normalizedHospitalName))
			.limit(1);

		if (!matchedHospital[0]) {
			return jsonError(c, 400, 'Selected hospital does not exist');
		}

		hospitalId = matchedHospital[0].id;
		hospitalName = matchedHospital[0].name;
	} else {
		return jsonError(c, 400, 'Hospital is required');
	}

	const selectedComponents = body.selectedComponents ? JSON.stringify(body.selectedComponents) : null;
	const componentQuantities = body.componentQuantities ? JSON.stringify(body.componentQuantities) : null;
	const images = body.images ? JSON.stringify(body.images) : null;

	await orm.insert(requests).values({
		id,
		patientName: body.patientName,
		requesterName: body.requesterName ?? undefined,
		requesterPhone: body.requesterPhone ?? undefined,
		diagnosis: body.diagnosis ?? undefined,
		hospital: hospitalName,
		hospitalId,
		bloodType: body.bloodType,
		quantity,
		urgency: body.urgency,
		status: body.status,
		transportationRequired: body.transportationRequired ?? 'no',
		requestedAt,
		neededBy: neededBy ?? undefined,
		notes: body.additionalNotes ?? undefined,
		contactPerson: body.requesterName ?? undefined,
		phone: body.requesterPhone ?? undefined,
		location: body.location,
		selectedComponents: selectedComponents ?? undefined,
		componentQuantities: componentQuantities ?? undefined,
		images: images ?? undefined,
		createdAt,
		updatedAt: createdAt,
	});

	const created = await orm.select().from(requests).where(eq(requests.id, id)).limit(1);

	if (!created[0]) return jsonError(c, 500, 'Request created but could not be loaded');

	return jsonOk(c, created[0], 'Request created', 201);
});

export default router;
