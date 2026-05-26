// ──────────────────────────────────────────────────────────────────────────────
// Cloudflare Worker bindings and Hono context variable types
// ──────────────────────────────────────────────────────────────────────────────

/** Cloudflare Worker environment bindings (wrangler.toml + secrets) */
export interface Env {
  /** D1 SQLite database binding */
  DB: D1Database;
  /**
   * RSA private key as a JSON-stringified JWK.
   * Used only for signing new JWTs (at login time).
   * Set via: wrangler secret put JWT_PRIVATE_KEY
   */
  JWT_PRIVATE_KEY: string;
  /**
   * RSA public key as a JSON-stringified JWK.
   * Used for verifying JWTs on every protected request — in-memory, no DB.
   * Can be stored as a plain var in wrangler.toml (it is not secret).
   * Set via: wrangler secret put JWT_PUBLIC_KEY
   */
  JWT_PUBLIC_KEY: string;
  /** Google OAuth client ID — set via `wrangler secret put GOOGLE_CLIENT_ID` */
  GOOGLE_CLIENT_ID: string;
  /** Google OAuth client secret — set via `wrangler secret put GOOGLE_CLIENT_SECRET` */
  GOOGLE_CLIENT_SECRET: string;
  /** Full redirect URI registered in Google Cloud Console, e.g. https://api.example.com/auth/google/callback */
  GOOGLE_REDIRECT_URI: string;
  /** Frontend origin to redirect back to after OAuth, e.g. https://app.example.com */
  FRONTEND_URL: string;
  /** Comma-separated list of admin email addresses used by auth to assign roles. */
  ADMIN_ACCOUNT: string;
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
  role: 'admin' | 'volunteer';
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
  role: 'admin' | 'volunteer';
}
