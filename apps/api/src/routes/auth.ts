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

// ── POST /auth/google/token ───────────────────────────────────────────────────
// Accepts a Google OAuth access token from the frontend (via @react-oauth/google),
// fetches the user's profile from Google, then issues our own JWT.
const googleTokenSchema = z.object({ accessToken: z.string().min(1) });

router.post('/google/token', zValidator('json', googleTokenSchema), async (c) => {
  const { accessToken } = c.req.valid('json');

  // Fetch the user profile using the access token
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileRes.ok) {
    return jsonError(c, 401, 'Invalid Google access token');
  }

  const profile = await profileRes.json<{
    email?: string;
    verified_email?: boolean;
    name?: string;
    picture?: string;
  }>();

  if (!profile.email) {
    return jsonError(c, 400, 'no_email');
  }

  if (!profile.verified_email) {
    return jsonError(c, 401, 'Google email is not verified');
  }

  const row = await db(c)
    .prepare(
      'SELECT id, name, email, role, is_active, avatar FROM users WHERE email = ?1 LIMIT 1',
    )
    .bind(profile.email.toLowerCase())
    .first<{
      id: string;
      name: string;
      email: string;
      role: 'admin' | 'call_operator' | 'volunteer';
      is_active: number;
      avatar: string | null;
    }>();

  if (!row) {
    // Auto-create the user on first Google sign-in with default 'volunteer' role
    const newUserId = newId();
    await db(c)
      .prepare(
        `INSERT INTO users (id, name, email, role, is_active, avatar, joined_at, updated_at)
         VALUES (?1, ?2, ?3, 'volunteer', 1, ?4, datetime('now'), datetime('now'))`,
      )
      .bind(
        newUserId,
        profile.name ?? profile.email,
        profile.email.toLowerCase(),
        profile.picture ?? null,
      )
      .run();

    const jwtPayload = {
      id: newUserId,
      email: profile.email.toLowerCase(),
      name: profile.name ?? profile.email,
      role: 'volunteer' as const,
    };
    const token = await signJwt(jwtPayload, c.env.JWT_SECRET);
    return jsonOk(c, { token, user: { ...jwtPayload, avatar: profile.picture ?? undefined } });
  }

  if (!row.is_active) {
    return jsonError(c, 403, 'account_deactivated');
  }

  const jwtPayload = { id: row.id, email: row.email, name: row.name, role: row.role };
  const token = await signJwt(jwtPayload, c.env.JWT_SECRET);

  return jsonOk(c, { token, user: { ...jwtPayload, avatar: row.avatar ?? undefined } });
});

// ── GET /auth/google ──────────────────────────────────────────────────────────
// Redirects the browser to Google's OAuth consent screen.
router.get('/google', (c) => {
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: c.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl,
      'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`,
    },
  });
});

// ── GET /auth/google/callback ─────────────────────────────────────────────────
// Google redirects here after the user consents. Exchanges the code for tokens,
// fetches the user profile, issues a JWT, and redirects back to the frontend.
router.get('/google/callback', async (c) => {
  const frontendUrl = c.env.FRONTEND_URL;
  const { code, state, error: oauthError } = c.req.query();

  if (oauthError) {
    return c.redirect(`${frontendUrl}/login?error=oauth_denied`);
  }

  // CSRF check — compare state with the cookie
  const rawCookie = c.req.header('Cookie') ?? '';
  const cookieState = rawCookie
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith('oauth_state='))
    ?.split('=')[1];

  if (!state || !cookieState || state !== cookieState) {
    return c.redirect(`${frontendUrl}/login?error=invalid_state`);
  }

  // Exchange authorization code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: c.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }).toString(),
  });

  const tokens = await tokenRes.json<{ access_token?: string }>();
  if (!tokens.access_token) {
    return c.redirect(`${frontendUrl}/login?error=token_exchange_failed`);
  }

  // Fetch the user's Google profile
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = await profileRes.json<{ email?: string; name?: string; picture?: string }>();

  if (!profile.email) {
    return c.redirect(`${frontendUrl}/login?error=no_email`);
  }

  // Look up user in the database (only pre-existing users are allowed in)
  const row = await db(c)
    .prepare(
      'SELECT id, name, email, role, is_active, avatar FROM users WHERE email = ?1 LIMIT 1',
    )
    .bind(profile.email.toLowerCase())
    .first<{
      id: string;
      name: string;
      email: string;
      role: 'admin' | 'call_operator' | 'volunteer';
      is_active: number;
      avatar: string | null;
    }>();

  if (!row) {
    return c.redirect(`${frontendUrl}/login?error=not_authorized`);
  }

  if (!row.is_active) {
    return c.redirect(`${frontendUrl}/login?error=account_deactivated`);
  }

  const jwtPayload = { id: row.id, email: row.email, name: row.name, role: row.role };
  const token = await signJwt(jwtPayload, c.env.JWT_SECRET);

  // Clear the state cookie and redirect to the frontend with the token
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${frontendUrl}/login?token=${token}`,
      'Set-Cookie': 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/',
    },
  });
});

export default router;
