// ──────────────────────────────────────────────────────────────────────────────
// D1 database helper — thin wrapper around the native D1 binding
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Convenience accessor.  Route handlers receive the D1 binding as `c.env.DB`;
 * this file re-exports a typed alias so callers can write `db(c)` without
 * repeating the binding name everywhere.
 *
 * Usage:
 *   import { db } from '../core/db/client'
 *   const rows = await db(c).prepare('SELECT * FROM users').all()
 */
export function db(c: { env: { DB: D1Database } }): D1Database {
  return c.env.DB;
}

/** Generate a random ID for new rows (uses Web Crypto — available in Workers) */
export function newId(): string {
  return crypto.randomUUID();
}
