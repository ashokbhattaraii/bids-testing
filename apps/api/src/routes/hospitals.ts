import { drizzleDb, hospitals, newId } from '@bids/db';
import { eq, like, or, and, sql, type SQL } from 'drizzle-orm';
import { createRouter } from '../core/http/router';
import { jsonOk, jsonError } from '../core/http/errors';
import { buildPaginationMeta, parsePagination } from '../core/http/pagination';
import { requireAuth } from '../core/auth/middleware';
import { listHospitalRoute, createHospitalRouteDefinition } from '../schemas/hospitals';

const router = createRouter();

router.use('*', requireAuth);

// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(listHospitalRoute, async (c) => {
  const { search, valley, page, limit } = c.req.valid('query');
  const { page: pageNumber, limit: pageSize, offset } = parsePagination({ page, limit });
  const normalizedSearch = search.trim();

  const orm = drizzleDb(c);
  const whereClauses: SQL[] = [];

  if (valley && (valley === 'inside_valley' || valley === 'outside_valley')) {
    whereClauses.push(eq(hospitals.valley, valley));
  }

  if (normalizedSearch) {
    // Allow multi-token searches like requests: collapse spaces to % for flexible matching
    const term = `%${normalizedSearch.replace(/\s+/g, '%')}%`;
    whereClauses.push(
      or(
        like(hospitals.name, term),
        like(hospitals.location, term),
        like(hospitals.contactPerson, term),
        like(hospitals.phone, term)
      )!
    );
  }

  const baseQuery = orm
    .select({
      id: hospitals.id,
      name: hospitals.name,
      location: hospitals.location,
      valley: hospitals.valley,
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

// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(createHospitalRouteDefinition, async (c) => {
  const contentType = c.req.header('content-type') ?? '';
  const body = contentType.startsWith('application/x-www-form-urlencoded')
    ? c.req.valid('form')
    : c.req.valid('json');
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
      valley: hospitals.valley,
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

export default router;
