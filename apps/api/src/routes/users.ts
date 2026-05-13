import { zValidator } from '@hono/zod-validator';
import { db, newId } from '@bids/db';
import { z } from 'zod';
import { createRouter } from '../core/http/router';
import { jsonOk, jsonError } from '../core/http/errors';
import { requireAuth, requireRole } from '../core/auth/middleware';

const router = createRouter();

router.use('*', requireAuth, requireRole('admin'));

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: number;
  avatar: string | null;
  joined_at: string;
  updated_at: string;
};

function sanitize(row: UserRow) {
  const { ...safe } = row;
  return { ...safe, isActive: !!safe.is_active };
}

// ── GET /users ────────────────────────────────────────────────────────────────
router.get('/', async (c) => {
  const { search, role, isActive } = c.req.query();

  const conditions: string[] = [];
  const binds: (string | number)[] = [];
  let i = 1;

  if (role) {
    conditions.push(`role = ?${i++}`);
    binds.push(role);
  }
  if (isActive !== undefined) {
    conditions.push(`is_active = ?${i++}`);
    binds.push(isActive === 'true' ? 1 : 0);
  }
  if (search) {
    conditions.push(`(name LIKE ?${i} OR email LIKE ?${i})`);
    binds.push(`%${search}%`);
    i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await db(c)
    .prepare(`SELECT id, name, email, role, is_active, avatar, joined_at, updated_at FROM users ${where} ORDER BY joined_at DESC`)
    .bind(...binds)
    .all<UserRow>();

  return jsonOk(c, (rows.results ?? []).map(sanitize));
});

// ── GET /users/:id ────────────────────────────────────────────────────────────
router.get('/:id', async (c) => {
  const row = await db(c)
    .prepare('SELECT id, name, email, role, is_active, avatar, joined_at, updated_at FROM users WHERE id = ?1')
    .bind(c.req.param('id'))
    .first<UserRow>();

  if (!row) return jsonError(c, 404, 'User not found');
  return jsonOk(c, sanitize(row));
});

// ── POST /users ───────────────────────────────────────────────────────────────
const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'volunteer']).default('volunteer'),
  isActive: z.boolean().default(true),
});

router.post('/', zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json');

  const exists = await db(c)
    .prepare('SELECT id FROM users WHERE email = ?1')
    .bind(body.email.toLowerCase())
    .first<{ id: string }>();

  if (exists) return jsonError(c, 409, 'A user with this email already exists');

  const id = newId();

  await db(c)
    .prepare(
      `INSERT INTO users (id, name, email, role, is_active)
       VALUES (?1,?2,?3,?4,?5)`
    )
    .bind(id, body.name, body.email.toLowerCase(), body.role, body.isActive ? 1 : 0)
    .run();

  const created = await db(c)
    .prepare('SELECT id, name, email, role, is_active, avatar, joined_at, updated_at FROM users WHERE id = ?1')
    .bind(id)
    .first<UserRow>();

  return jsonOk(c, sanitize(created!), 'User created', 201);
});

// ── PUT /users/:id ────────────────────────────────────────────────────────────
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['admin', 'volunteer']).optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().optional(),
});

router.put('/:id', zValidator('json', updateSchema), async (c) => {
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const existing = await db(c)
    .prepare('SELECT id FROM users WHERE id = ?1')
    .bind(id)
    .first<{ id: string }>();

  if (!existing) return jsonError(c, 404, 'User not found');

  const sets: string[] = [];
  const binds: unknown[] = [];
  let i = 1;

  if (body.name !== undefined) { sets.push(`name = ?${i++}`); binds.push(body.name); }
  if (body.role !== undefined) { sets.push(`role = ?${i++}`); binds.push(body.role); }
  if (body.isActive !== undefined) { sets.push(`is_active = ?${i++}`); binds.push(body.isActive ? 1 : 0); }
  if (body.avatar !== undefined) { sets.push(`avatar = ?${i++}`); binds.push(body.avatar); }

  if (sets.length === 0) return jsonError(c, 400, 'No fields to update');

  sets.push(`updated_at = datetime('now')`);
  binds.push(id);

  await db(c).prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?${i}`).bind(...binds).run();

  const updated = await db(c)
    .prepare('SELECT id, name, email, role, is_active, avatar, joined_at, updated_at FROM users WHERE id = ?1')
    .bind(id)
    .first<UserRow>();

  return jsonOk(c, sanitize(updated!), 'User updated');
});

// ── DELETE /users/:id ─────────────────────────────────────────────────────────
router.delete('/:id', async (c) => {
  const id = c.req.param('id');

  // Prevent deleting yourself
  if (id === c.var.user.id) {
    return jsonError(c, 400, 'You cannot delete your own account');
  }

  const existing = await db(c).prepare('SELECT id FROM users WHERE id = ?1').bind(id).first<{ id: string }>();
  if (!existing) return jsonError(c, 404, 'User not found');

  await db(c).prepare('DELETE FROM users WHERE id = ?1').bind(id).run();
  return jsonOk(c, null, 'User deleted');
});

export default router;
