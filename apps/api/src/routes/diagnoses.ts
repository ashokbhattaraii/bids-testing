import { drizzleDb, diagnoses, newId } from '@bids/db';
import { asc, eq } from 'drizzle-orm';
import { createRouter } from '../core/http/router';
import { jsonError, jsonOk } from '../core/http/errors';
import { requireAuth } from '../core/auth/middleware';
import { listDiagnosesRoute, createDiagnosisRoute } from '../schemas/diagnoses';

const router = createRouter();

const seedDiagnoses = [
  'Accident/Trauma',
  'Surgery',
  'Anemia',
  'Cancer Treatment',
  'Blood Disorder',
  'Pregnancy Complication',
  'Kidney Disease',
  'Liver Disease',
  'Heart Surgery',
  'Burn Treatment',
  'Dengue',
  'Thalassemia',
  'Hemophilia',
  'Other',
];

async function ensureDiagnosesTable(c: any) {
  const db = c.env.DB;

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS diagnoses (
        id text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        created_at text NOT NULL,
        updated_at text NOT NULL
      )`
    )
    .run();

  await db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS diagnoses_name_unique ON diagnoses (name)').run();

  for (const name of seedDiagnoses) {
    const id = `diagnosis-seed-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    await db
      .prepare(
        `INSERT OR IGNORE INTO diagnoses (id, name, created_at, updated_at)
         VALUES (?1, ?2, datetime('now'), datetime('now'))`
      )
      .bind(id, name)
      .run();
  }
}

router.use('*', requireAuth);

// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(listDiagnosesRoute, async (c) => {
  await ensureDiagnosesTable(c);
  const orm = drizzleDb(c);
  const rows = await orm
    .select({ id: diagnoses.id, name: diagnoses.name })
    .from(diagnoses)
    .orderBy(asc(diagnoses.name));

  return jsonOk(c, rows);
});

// @ts-expect-error - response helpers don't match strict openapi return types
router.openapi(createDiagnosisRoute, async (c) => {
  const { name } = c.req.valid('json');
  await ensureDiagnosesTable(c);
  const orm = drizzleDb(c);
  const normalizedName = name.trim();

  const existing = await orm
    .select({ id: diagnoses.id, name: diagnoses.name })
    .from(diagnoses)
    .where(eq(diagnoses.name, normalizedName))
    .limit(1);

  if (existing[0]) {
    return jsonOk(c, existing[0], 'Disease already exists');
  }

  const id = newId();
  const now = new Date().toISOString();

  await orm.insert(diagnoses).values({
    id,
    name: normalizedName,
    createdAt: now,
    updatedAt: now,
  });

  return jsonOk(c, { id, name: normalizedName }, 'Disease added', 201);
});

export default router;