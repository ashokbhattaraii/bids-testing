import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../../env';
import { verifyJwt } from './jwt';
import { jsonError } from '../http/errors';

// ──────────────────────────────────────────────────────────────────────────────
// Auth middleware for Hono
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Extracts the Bearer token from the Authorization header, verifies it, and
 * sets `c.var.user`. Returns 401 if the token is missing or invalid.
 */
export const requireAuth = createMiddleware<{ Bindings: Env; Variables: Variables }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonError(c, 401, 'Missing or malformed Authorization header');
    }

    const token = authHeader.slice(7);
    const user = await verifyJwt(token, c.env.JWT_SECRET);
    if (!user) {
      return jsonError(c, 401, 'Token is invalid or expired');
    }

    c.set('user', user);
    return next();
  },
);

/**
 * Factory that returns a middleware enforcing one or more allowed roles.
 * Must be used AFTER `requireAuth` (relies on `c.var.user` being set).
 *
 * @example
 *   app.use('/admin/*', requireAuth, requireRole('admin'))
 */
export function requireRole(...roles: Array<'admin' | 'call_operator' | 'volunteer'>) {
  return createMiddleware<{ Bindings: Env; Variables: Variables }>(async (c, next) => {
    const user = c.var.user;
    if (!user || !roles.includes(user.role)) {
      return jsonError(c, 403, 'You do not have permission to access this resource');
    }
    return next();
  });
}
