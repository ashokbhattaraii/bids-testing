import { zValidator } from '@hono/zod-validator';
import { db } from '@bids/db';
import { z } from 'zod';
import { createRouter } from '../core/http/router';
import { jsonOk, jsonError } from '../core/http/errors';
import { requireAuth, requireRole } from '../core/auth/middleware';

const router = createRouter();

router.use('*', requireAuth);

// ── GET /settings ─────────────────────────────────────────────────────────────
router.get('/', requireRole('admin'), async (c) => {
  const rows = await db(c).prepare('SELECT key, value FROM settings').all<{ key: string; value: string }>();

  const settings: Record<string, string> = {};
  for (const row of rows.results ?? []) {
    settings[row.key] = row.value;
  }

  return jsonOk(c, settings);
});

// ── PUT /settings ─────────────────────────────────────────────────────────────
const updateSchema = z.record(z.string());

router.put('/', requireRole('admin'), zValidator('json', updateSchema), async (c) => {
  const body = c.req.valid('json');

  const stmts = Object.entries(body).map(([key, value]) =>
    db(c)
      .prepare(
        `INSERT INTO settings (key, value, updated_at) VALUES (?1, ?2, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = ?2, updated_at = datetime('now')`
      )
      .bind(key, value)
      .run()
  );

  await Promise.all(stmts);

  const rows = await db(c).prepare('SELECT key, value FROM settings').all<{ key: string; value: string }>();
  const settings: Record<string, string> = {};
  for (const row of rows.results ?? []) settings[row.key] = row.value;

  return jsonOk(c, settings, 'Settings saved');
});

export default router;
