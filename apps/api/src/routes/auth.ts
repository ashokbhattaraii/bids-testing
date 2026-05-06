import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createRouter } from '../core/http/router';
import { jsonOk, jsonError } from '../core/http/errors';
import { db, newId } from '../core/db/client';
import { signJwt, hashPassword, verifyPassword } from '../core/auth/jwt';
import { requireAuth } from '../core/auth/middleware';

const router = createRouter();

// ── POST /auth/login ──────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  const row = await db(c)
    .prepare('SELECT id, name, email, password_hash, role, is_active, avatar FROM users WHERE email = ?1 LIMIT 1')
    .bind(email.toLowerCase())
    .first<{
      id: string;
      name: string;
      email: string;
      password_hash: string | null;
      role: 'admin' | 'call_operator' | 'volunteer';
      is_active: number;
      avatar: string | null;
    }>();

  if (!row) {
    return jsonError(c, 401, 'Invalid email or password');
  }

  if (!row.is_active) {
    return jsonError(c, 401, 'This account has been deactivated');
  }

  if (!row.password_hash) {
    return jsonError(c, 401, 'This account uses Google Sign-In. Please use Google to log in.');
  }

  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) {
    return jsonError(c, 401, 'Invalid email or password');
  }

  const user = { id: row.id, email: row.email, name: row.name, role: row.role };
  const token = await signJwt(user, c.env.JWT_SECRET);

  return jsonOk(c, {
    token,
    user: { ...user, avatar: row.avatar ?? undefined },
  });
});

// ── GET /auth/me ──────────────────────────────────────────────────────────────
router.get('/me', requireAuth, (c) => {
  return jsonOk(c, c.var.user);
});

// ── POST /auth/seed ───────────────────────────────────────────────────────────
// One-time endpoint: set the seeded admin user's password so they can log in.
// Call this once after migration: POST /auth/seed { password: "yourPassword" }
// It is a no-op if the admin already has a password hash.
const seedSchema = z.object({ password: z.string().min(8) });

router.post('/seed', zValidator('json', seedSchema), async (c) => {
  const { password } = c.req.valid('json');

  const existing = await db(c)
    .prepare('SELECT password_hash FROM users WHERE id = ?1')
    .bind('usr_seed_admin_001')
    .first<{ password_hash: string | null }>();

  if (!existing) {
    return jsonError(c, 404, 'Seed admin user not found. Run migrations first.');
  }

  if (existing.password_hash) {
    return jsonError(c, 409, 'Admin password is already set. Use change-password instead.');
  }

  const hash = await hashPassword(password);
  await db(c)
    .prepare('UPDATE users SET password_hash = ?1, updated_at = datetime(\'now\') WHERE id = ?2')
    .bind(hash, 'usr_seed_admin_001')
    .run();

  return jsonOk(c, null, 'Admin password set successfully. You can now log in.');
});

// ── POST /auth/change-password ────────────────────────────────────────────────
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

router.post('/change-password', requireAuth, zValidator('json', changePasswordSchema), async (c) => {
  const { currentPassword, newPassword } = c.req.valid('json');
  const { id } = c.var.user;

  const row = await db(c)
    .prepare('SELECT password_hash FROM users WHERE id = ?1')
    .bind(id)
    .first<{ password_hash: string | null }>();

  if (!row?.password_hash) {
    return jsonError(c, 400, 'No password set for this account');
  }

  const valid = await verifyPassword(currentPassword, row.password_hash);
  if (!valid) {
    return jsonError(c, 401, 'Current password is incorrect');
  }

  const hash = await hashPassword(newPassword);
  await db(c)
    .prepare('UPDATE users SET password_hash = ?1, updated_at = datetime(\'now\') WHERE id = ?2')
    .bind(hash, id)
    .run();

  return jsonOk(c, null, 'Password changed successfully');
});

export default router;
