import { zValidator } from '@hono/zod-validator';
import { drizzleDb, hospitals, newId } from '@bids/db';
import { eq, like, or, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { createRouter } from '../core/http/router';
import { jsonOk, jsonError } from '../core/http/errors';
import { buildPaginationMeta, parsePagination } from '../core/http/pagination';
import { requireAuth } from '../core/auth/middleware';

const router = createRouter();

router.use('*', requireAuth);

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const;

type HospitalRow = {
  id: string;
  name: string;
  location: string;
  valley: string;            // inside_valley | outside_valley
  contact_person: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

type InventoryRow = {
  blood_type: string;
  units: number;
};

// /** Attach blood inventory to a hospital row */
// async function withInventory(c: { env: { DB: D1Database } }, hospital: HospitalRow) {
//   const inv = await db(c)
//     .prepare('SELECT blood_type, units FROM hospital_inventory WHERE hospital_id = ?1')
//     .bind(hospital.id)
//     .all<InventoryRow>();

//   const bloodInventory: Record<string, number> = {};
//   for (const bt of BLOOD_TYPES) bloodInventory[bt] = 0;
//   for (const row of inv.results ?? []) bloodInventory[row.blood_type] = row.units;

//   return { ...hospital, bloodInventory };
// }

// // ── GET /hospitals ────────────────────────────────────────────────────────────
// router.get('/', async (c) => {
//   const { search, valley } = c.req.query();

//   const conditions: string[] = [];
//   const binds: string[] = [];
//   let i = 1;

//   if (search) {
//     conditions.push(`(name LIKE ?${i} OR location LIKE ?${i} OR address LIKE ?${i})`);
//     binds.push(`%${search}%`);
//     i++;
//   }
//   // Segmentation: inside_valley | outside_valley (BBIR-001)
//   if (valley && (valley === 'inside_valley' || valley === 'outside_valley')) {
//     conditions.push(`valley = ?${i++}`);
//     binds.push(valley);
//   }

//   const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
//   const rowsRes = await db(c)
//     .prepare(`SELECT * FROM hospitals ${where} ORDER BY name ASC`)
//     .bind(...binds)
//     .all<HospitalRow>();
//   const hospitals = rowsRes.results ?? [];

//   const withInventories = await Promise.all(hospitals.map((h) => withInventory(c, h)));

//   return jsonOk(c, withInventories);
// });

router.get('/', async (c) => {
  const { search, valley, page, limit } = c.req.query();
  const { page: pageNumber, limit: pageSize, offset } = parsePagination({ page, limit });

  const orm = drizzleDb(c);
  const whereClauses: any[] = [];

  if (valley && (valley === 'inside_valley' || valley === 'outside_valley')) {
    whereClauses.push(eq(hospitals.valley, valley));
  }

  if (search?.trim()) {
    // Allow multi-token searches like requests: collapse spaces to % for flexible matching
    const term = `%${search.trim().replace(/\s+/g, '%')}%`;
    whereClauses.push(
      or(
        like(hospitals.name, term),
        like(hospitals.location, term),
        like(hospitals.contactPerson, term),
        like(hospitals.phone, term)
      )
    );
  }

  const baseQuery = orm
    .select({
      id: hospitals.id,
      name: hospitals.name,
      location: hospitals.location,
      contactPerson: hospitals.contactPerson,
      phone: hospitals.phone,
    })
    .from(hospitals);

  const totalQuery = orm.select({ total: sql<number>`count(*)` }).from(hospitals);

  const [rows, totalResult] = await Promise.all([
    (whereClauses.length ? baseQuery.where(and(...whereClauses)) : baseQuery)
      .orderBy(hospitals.name)
      .limit(pageSize)
      .offset(offset),
    whereClauses.length ? totalQuery.where(and(...whereClauses)) : totalQuery,
  ]);

  const total = Number(totalResult[0]?.total ?? 0);
  const meta = buildPaginationMeta(total, pageNumber, pageSize);

  return jsonOk(c, { items: rows, meta });
});

const createSchema = z.object({
  name: z.string().trim().min(1),
  location: z.string().trim().min(1),
  contactPerson: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
  valley: z.enum(['inside_valley', 'outside_valley']).optional(),
});

router.post('/', requireAuth, zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json');
  const id = newId();
  const now = new Date().toISOString();

  await drizzleDb(c).insert(hospitals).values({
    id,
    name: body.name,
    location: body.location,
    valley: body.valley ?? 'inside_valley',
    contactPerson: body.contactPerson ?? null,
    phone: body.phone ?? null,
    createdAt: now,
    updatedAt: now,
  });

  const createdHospital = await drizzleDb(c)
    .select({
      id: hospitals.id,
      name: hospitals.name,
      location: hospitals.location,
      contactPerson: hospitals.contactPerson,
      phone: hospitals.phone,
    })
    .from(hospitals)
    .where(eq(hospitals.id, id))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!createdHospital) {
    return jsonError(c, 500, 'Failed to create hospital');
  }

  return jsonOk(c, createdHospital, 'Hospital added', 201);
});

// // ── GET /hospitals/:id ────────────────────────────────────────────────────────
// router.get('/:id', async (c) => {
//   const row = await db(c)
//     .prepare('SELECT * FROM hospitals WHERE id = ?1')
//     .bind(c.req.param('id'))
//     .first<HospitalRow>();

//   if (!row) return jsonError(c, 404, 'Hospital not found');
//   return jsonOk(c, await withInventory(c, row));
// });

// // ── POST /hospitals ───────────────────────────────────────────────────────────
// const createSchema = z.object({
//   name:           z.string().min(1),
//   location:       z.string().min(1),
//   address:        z.string().optional(),
//   valley:         z.enum(['inside_valley', 'outside_valley']).default('inside_valley'),
//   contactPerson:  z.string().optional(),
//   phone:          z.string().optional(),
//   bloodInventory: z.record(z.number().int().min(0)).optional(),
// });

// router.post('/', requireRole('admin'), zValidator('json', createSchema), async (c) => {
//   const body = c.req.valid('json');
//   const id = newId();

//   await db(c)
//     .prepare('INSERT INTO hospitals (id, name, location, address, valley, contact_person, phone) VALUES (?1,?2,?3,?4,?5,?6,?7)')
//     .bind(id, body.name, body.location, body.address ?? null, body.valley, body.contactPerson ?? null, body.phone ?? null)
//     .run();

//   // Seed zero inventory for all blood types, then apply provided values
//   const inventory = body.bloodInventory ?? {};
//   const invInserts = BLOOD_TYPES.map((bt) =>
//     db(c)
//       .prepare(
//         `INSERT INTO hospital_inventory (id, hospital_id, blood_type, units) VALUES (?1,?2,?3,?4)
//          ON CONFLICT(hospital_id, blood_type) DO UPDATE SET units = ?4`
//       )
//       .bind(newId(), id, bt, inventory[bt] ?? 0)
//       .run()
//   );
//   await Promise.all(invInserts);

//   const created = await db(c).prepare('SELECT * FROM hospitals WHERE id = ?1').bind(id).first<HospitalRow>();
//   return jsonOk(c, await withInventory(c, created!), 'Hospital added', 201);
// });

// // ── PUT /hospitals/:id ────────────────────────────────────────────────────────
// const updateSchema = z.object({
//   name:           z.string().min(1).optional(),
//   location:       z.string().min(1).optional(),
//   address:        z.string().optional(),
//   valley:         z.enum(['inside_valley', 'outside_valley']).optional(),
//   contactPerson:  z.string().optional(),
//   phone:          z.string().optional(),
//   bloodInventory: z.record(z.number().int().min(0)).optional(),
// });

// router.put('/:id', requireRole('admin'), zValidator('json', updateSchema), async (c) => {
//   const id = c.req.param('id');
//   const body = c.req.valid('json');

//   const existing = await db(c)
//     .prepare('SELECT id FROM hospitals WHERE id = ?1')
//     .bind(id)
//     .first<{ id: string }>();

//   if (!existing) return jsonError(c, 404, 'Hospital not found');

//   // Update hospital fields
//   const sets: string[] = [];
//   const binds: unknown[] = [];
//   let i = 1;

//   if (body.name          !== undefined) { sets.push(`name = ?${i++}`);           binds.push(body.name); }
//   if (body.location      !== undefined) { sets.push(`location = ?${i++}`);       binds.push(body.location); }
//   if (body.address       !== undefined) { sets.push(`address = ?${i++}`);        binds.push(body.address ?? null); }
//   if (body.valley        !== undefined) { sets.push(`valley = ?${i++}`);         binds.push(body.valley); }
//   if (body.contactPerson !== undefined) { sets.push(`contact_person = ?${i++}`); binds.push(body.contactPerson); }
//   if (body.phone         !== undefined) { sets.push(`phone = ?${i++}`);          binds.push(body.phone); }

//   if (sets.length > 0) {
//     sets.push(`updated_at = datetime('now')`);
//     binds.push(id);
//     await db(c).prepare(`UPDATE hospitals SET ${sets.join(', ')} WHERE id = ?${i}`).bind(...binds).run();
//   }

//   // Update inventory if provided
//   if (body.bloodInventory) {
//     const invUpdates = Object.entries(body.bloodInventory)
//       .filter(([bt]) => BLOOD_TYPES.includes(bt as (typeof BLOOD_TYPES)[number]))
//       .map(([bt, units]) =>
//         db(c)
//           .prepare(
//             `INSERT INTO hospital_inventory (id, hospital_id, blood_type, units) VALUES (?1,?2,?3,?4)
//              ON CONFLICT(hospital_id, blood_type) DO UPDATE SET units = ?4, updated_at = datetime('now')`
//           )
//           .bind(newId(), id, bt, units)
//           .run()
//       );
//     await Promise.all(invUpdates);
//   }

//   const updated = await db(c).prepare('SELECT * FROM hospitals WHERE id = ?1').bind(id).first<HospitalRow>();
//   return jsonOk(c, await withInventory(c, updated!), 'Hospital updated');
// });

export default router;


