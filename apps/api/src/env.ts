// ──────────────────────────────────────────────────────────────────────────────
// Cloudflare Worker bindings and Hono context variable types
// ──────────────────────────────────────────────────────────────────────────────

/** Cloudflare Worker environment bindings (wrangler.toml + secrets) */
export interface Env {
  /** D1 SQLite database binding */
  DB: D1Database;
  /** HMAC-SHA256 secret for signing JWTs — set via `wrangler secret put JWT_SECRET` */
  JWT_SECRET: string;
}

/** Per-request Hono context variables set by middleware */
export interface Variables {
  /** Decoded JWT payload set by requireAuth middleware */
  user: JwtUser;
}

/** Shape of the JWT payload issued on login */
export interface JwtUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'call_operator' | 'volunteer';
}
