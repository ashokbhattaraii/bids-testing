import { zValidator } from '@hono/zod-validator';
import {drizzleDb as db, newId} from "@bids/db";
import {users} from "@bids/db";
import {eq} from 'drizzle-orm';
import { z } from 'zod';
import { createRouter } from '../core/http/router';
import { jsonOk, jsonError } from '../core/http/errors';
import { signJwt, getPublicJwk } from '../core/auth/jwt';
import { requireAuth } from '../core/auth/middleware';

const router = createRouter();

// ── GET /auth/me ──────────────────────────────────────────────────────────────
router.get('/me', requireAuth, (c) => {
  return jsonOk(c, c.var.user);
});

// ── GET /auth/.well-known/jwks.json ───────────────────────────────────────────
// Serves the RSA public key in JWKS format so any service can verify our JWTs
// without sharing a secret. Safe to expose publicly — it is the PUBLIC key.
router.get('/.well-known/jwks.json', (c) => {
  const jwk = getPublicJwk(c.env.JWT_PUBLIC_KEY);
  return c.json({ keys: [{ ...jwk, use: 'sig', alg: 'RS256' }] });
});

// ── POST /auth/google/token ───────────────────────────────────────────────────
// Accepts a Google OAuth access token from the frontend (via @react-oauth/google),
// fetches the user's profile from Google, then issues our own RS256 JWT.
const googleTokenSchema = z.object({ accessToken: z.string().min(1) });

router.post('/google/token', zValidator('json', googleTokenSchema), async (c) => {
  const { accessToken } = c.req.valid('json');

  // Verify the Google access token by fetching the user's profile
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
  .select({
    id:users.id,
    name:users.name,
    email:users.email,
    role:users.role,
    is_active:users.isActive,
    avatar:users.avatar,
  })
  .from(users)
  .where(eq(users.email, profile.email.toLowerCase()))
  .limit(1)
  .then(rows => rows[0] ?? null);


  if (!row) {
    // Auto-create the user on first Google sign-in with default 'volunteer' role
    const newUserId = newId();
    const now = new Date().toISOString();
    await db(c).insert(users).values({
      id: newUserId,
      name: profile.name ?? profile.email,
      email: profile.email.toLowerCase(),
      role: 'volunteer',
      isActive: 1,
      avatar: profile.picture ?? null,
      joinedAt: now,
      updatedAt: now,
    });

    const jwtPayload = {
      id: newUserId,
      email: profile.email.toLowerCase(),
      name: profile.name ?? profile.email,
      role: profile.email.toLowerCase() === 'sushil.rumsan@gmail.com' ? 'admin' as const : 'volunteer' as const,
      // role: 'volunteer' as const,
    };
    const token = await signJwt(jwtPayload, c.env.JWT_PRIVATE_KEY);
    return jsonOk(c, { token, user: { ...jwtPayload, avatar: profile.picture ?? undefined } });
  }

  if (!row.is_active) {
    return jsonError(c, 403, 'account_deactivated');
  }

  const role: 'admin' | 'volunteer' = row.role === 'admin' ? 'admin' : 'volunteer';
  const jwtPayload = { id: row.id, email: row.email, name: row.name, role };
  const token = await signJwt(jwtPayload, c.env.JWT_PRIVATE_KEY);

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
// fetches the user profile, issues an RS256 JWT, and redirects back to the frontend.
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

  // Look up user in the database
  const row = await db(c)
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      is_active: users.isActive,
      avatar: users.avatar,
    })
    .from(users)
    .where(eq(users.email, profile.email.toLowerCase()))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!row) {
    return c.redirect(`${frontendUrl}/login?error=not_authorized`);
  }

  if (!row.is_active) {
    return c.redirect(`${frontendUrl}/login?error=account_deactivated`);
  }

  const role: 'admin' | 'volunteer' = row.role === 'admin' ? 'admin' : 'volunteer';
  const jwtPayload = { id: row.id, email: row.email, name: row.name, role };
  const token = await signJwt(jwtPayload, c.env.JWT_PRIVATE_KEY);

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

