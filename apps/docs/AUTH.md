# Authentication Architecture

This document explains how authentication works in this project end-to-end — from clicking "Sign in with Google" to every subsequent API request being validated without a database lookup.

---

## Overview

| Property | Value |
|---|---|
| Auth method | Google OAuth only (no passwords) |
| Token format | JWT (JSON Web Token) |
| Signing algorithm | RS256 (RSA + SHA-256) |
| Token expiry | 8 hours |
| Verification | In-memory, pure cryptographic math — no database, no network |
| Runtime | Cloudflare Workers (Web Crypto API built-in) |

---

## How RSA Keys Work

There are two keys — a keypair. They are mathematically linked but different.

```
PRIVATE KEY  →  used to SIGN tokens   (kept secret, server only)
PUBLIC KEY   →  used to VERIFY tokens (safe to share, cached in Worker memory)
```

- The **private key** lives only in your Cloudflare Worker environment (`JWT_PRIVATE_KEY` secret). It signs a token once at login.
- The **public key** is stored as `JWT_PUBLIC_KEY`. Any code that holds it can verify tokens but **cannot forge new ones**. That is the security guarantee of asymmetric cryptography.

Keys are generated once using:

```bash
cd apps/api
node scripts/generate-keys.mjs
# → writes JWT_PRIVATE_KEY and JWT_PUBLIC_KEY into .dev.vars automatically
```

For production, push them as Cloudflare secrets:

```bash
npx wrangler secret put JWT_PRIVATE_KEY
npx wrangler secret put JWT_PUBLIC_KEY
```

---

## Relevant Files

```
apps/api/src/
├── env.ts                      # Env bindings: JWT_PRIVATE_KEY, JWT_PUBLIC_KEY
├── core/
│   └── auth/
│       ├── jwt.ts              # signJwt(), verifyJwt(), key cache
│       └── middleware.ts       # requireAuth, requireRole
└── routes/
    └── auth.ts                 # POST /auth/google/token, GET /auth/google, GET /auth/google/callback

apps/api/scripts/
└── generate-keys.mjs           # One-time keypair generator
```

---

## Flow A — First Sign In (and every login)

### What triggers it

The frontend uses `@react-oauth/google`. When the user clicks the button, Google shows a popup, the user picks their account, and Google returns an **access token** to the frontend. The frontend immediately POSTs it to the API.

```
Browser                          API Worker                        Google
  │                                  │                                │
  │── POST /auth/google/token ───────▶│                                │
  │   { accessToken: "ya29.a0..." }  │                                │
  │                                  │── GET /oauth2/v2/userinfo ────▶│
  │                                  │   Authorization: Bearer ya29.. │
  │                                  │◀── { email, name, picture } ───│
  │                                  │                                │
  │                                  │── DB: SELECT user by email     │
  │                                  │                                │
  │                                  │  (new user?) INSERT into DB    │
  │                                  │  (existing?) check is_active   │
  │                                  │                                │
  │                                  │── signJwt() with PRIVATE KEY   │
  │                                  │                                │
  │◀── { token, user } ─────────────│                                │
```

### Step-by-step code trace

**Step 1 — Receive access token** (`routes/auth.ts`)

```typescript
router.post('/google/token', zValidator('json', googleTokenSchema), async (c) => {
  const { accessToken } = c.req.valid('json');
})
```

**Step 2 — Verify with Google** (`routes/auth.ts`)

```typescript
const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
  headers: { Authorization: `Bearer ${accessToken}` },
});
// If Google rejects it → 401 "Invalid Google access token"
// profile = { email, verified_email, name, picture }
```

This is the only external network call during login. Google confirms the token is real and returns the user's profile.

**Step 3 — DB lookup** (`routes/auth.ts`)

```typescript
const row = await db(c)
  .prepare('SELECT id, name, email, role, is_active, avatar FROM users WHERE email = ?1 LIMIT 1')
  .bind(profile.email.toLowerCase())
  .first();
```

Two outcomes:

- **User not found** → auto-create with role `volunteer`, `is_active = 1`. No password stored — ever.
- **User found** → check `is_active`. If `0`, return `403 account_deactivated`.

**Step 4 — Sign a JWT** (`core/auth/jwt.ts → signJwt()`)

```typescript
const token = await signJwt(jwtPayload, c.env.JWT_PRIVATE_KEY);
```

Inside `signJwt()`:

```
1. header  = base64url({ alg: "RS256", typ: "JWT" })
2. payload = base64url({ id, email, name, role, iat: <now>, exp: <now + 28800> })
3. signingInput = header + "." + payload
4. importPrivateKey(JWT_PRIVATE_KEY)
   └─ first call: parses JWK → CryptoKey, stored in module-level _cachedPrivateKey
   └─ later calls: returns _cachedPrivateKey immediately
5. signature = crypto.subtle.sign(RSASSA-PKCS1-v1_5, privateKey, signingInput)
6. return signingInput + "." + base64url(signature)
```

The resulting token looks like:

```
eyJhbGciOiJSUzI1NiJ9.eyJpZCI6InVzcl8uLi4iLCJyb2xlIjoidm9sdW50ZWVyIn0.RSASIGNATURE
└──── header ────────┘└───────────── payload ──────────────────────────────┘└─ sig ─┘
```

**Step 5 — Return to frontend**

```json
{
  "token": "eyJ...",
  "user": { "id": "usr_...", "email": "user@gmail.com", "name": "John", "role": "volunteer", "avatar": "https://..." }
}
```

The frontend stores the token. Login is complete.

---

## Flow B — Every Authenticated Request (no DB, no network)

After login, the frontend attaches the token to every API request.

```
Browser                          API Worker
  │                                  │
  │── GET /donors ───────────────────▶│
  │   Authorization: Bearer eyJ...   │
  │                                  │── requireAuth middleware
  │                                  │   └─ verifyJwt(token, JWT_PUBLIC_KEY)
  │                                  │       ├─ importPublicKey() [cached]
  │                                  │       ├─ crypto.subtle.verify() ← CPU math only
  │                                  │       └─ check exp ← arithmetic only
  │                                  │
  │                                  │── c.var.user = { id, email, name, role }
  │                                  │── route handler runs
  │◀── response ─────────────────────│
```

### Step-by-step code trace

**Step 1 — Middleware intercepts** (`core/auth/middleware.ts`)

```typescript
export const requireAuth = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  // Must be: "Bearer eyJ..."
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonError(c, 401, 'Missing or malformed Authorization header');
  }

  const token = authHeader.slice(7); // strip "Bearer "
  const user = await verifyJwt(token, c.env.JWT_PUBLIC_KEY);
  if (!user) {
    return jsonError(c, 401, 'Token is invalid or expired');
  }

  c.set('user', user); // available as c.var.user in all handlers
  return next();
});
```

**Step 2 — verifyJwt() runs** (`core/auth/jwt.ts`)

```typescript
export async function verifyJwt(token: string, publicKeyJwk: string): Promise<JwtUser | null> {
  const [headerB64, payloadB64, signatureB64] = token.split('.');

  // 1. Import public key — cached after first request in this isolate
  const publicKey = await importPublicKey(publicKeyJwk);

  // 2. Re-run the RSA math
  const isValid = await crypto.subtle.verify(
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    publicKey,
    b64urlDecode(signatureB64),          // signature from the token
    new TextEncoder().encode(`${headerB64}.${payloadB64}`) // what was originally signed
  );
  if (!isValid) return null; // token was tampered with

  // 3. Decode payload and check expiry — pure arithmetic, no I/O
  const payload = JSON.parse(decode(payloadB64));
  if (payload.exp * 1000 < Date.now()) return null; // token expired

  return payload; // { id, email, name, role }
}
```

**Why no database?**

The RSA signature already proves two things:
1. The payload (`id`, `email`, `role`) was not modified after it was signed.
2. It was signed by the server that holds the private key.

No lookup is needed. The math is the proof.

**Step 3 — Key cache** (`core/auth/jwt.ts`)

```typescript
let _cachedPublicKey: CryptoKey | null = null;

async function importPublicKey(jwkJson: string): Promise<CryptoKey> {
  if (_cachedPublicKey) return _cachedPublicKey; // ← instant return after first request
  const jwk = JSON.parse(jwkJson) as JsonWebKey;
  _cachedPublicKey = await crypto.subtle.importKey('jwk', jwk, ALG, false, ['verify']);
  return _cachedPublicKey;
}
```

Cloudflare Worker isolates are reused across many requests. The `CryptoKey` is parsed once from the JWK string and held in module memory. Every subsequent request skips the parse and goes straight to `crypto.subtle.verify()`.

**Step 4 — Role enforcement** (`core/auth/middleware.ts`)

Stacked on top of `requireAuth` for admin-only routes:

```typescript
export function requireRole(...roles: Array<'admin' | 'call_operator' | 'volunteer'>) {
  return createMiddleware(async (c, next) => {
    const user = c.var.user; // already set by requireAuth
    if (!user || !roles.includes(user.role)) {
      return jsonError(c, 403, 'You do not have permission to access this resource');
    }
    return next();
  });
}

// Usage in routes:
router.use('*', requireAuth, requireRole('admin'));
```

---

## Flow C — Server-side OAuth Redirect (alternative)

This is the `GET /auth/google` → `GET /auth/google/callback` flow for browser-redirect based OAuth (not used by the React frontend but available).

```
Browser → GET /auth/google
  └─ API builds Google consent URL with a random `state` UUID
  └─ Stores state in HttpOnly cookie (CSRF protection)
  └─ 302 redirect to Google

Browser → Google consent screen → user approves

Google → GET /auth/google/callback?code=...&state=...
  └─ CSRF check: state param must match cookie
  └─ Exchange code for access_token via POST to oauth2.googleapis.com/token
  └─ Fetch user profile
  └─ DB lookup (no auto-create here — unknown users get not_authorized)
  └─ signJwt() with PRIVATE KEY
  └─ 302 redirect to FRONTEND_URL/login?token=<jwt>
  └─ Clears oauth_state cookie
```

---

## JWT Payload Structure

```typescript
interface JwtUser {
  id: string;       // e.g. "usr_01j..."
  email: string;    // e.g. "user@gmail.com"
  name: string;     // e.g. "John Doe"
  role: 'admin' | 'call_operator' | 'volunteer';
  iat: number;      // issued at (Unix timestamp)
  exp: number;      // expires at (iat + 28800)
}
```

---

## Security Properties

| Property | How it is achieved |
|---|---|
| Token cannot be forged | RSA private key never leaves the server |
| Token cannot be tampered | Any change to payload breaks the signature |
| Token expires | `exp` claim checked on every request |
| Role cannot be escalated | Role is embedded in signed payload — changing it breaks signature |
| CSRF on redirect flow | Random `state` UUID stored in `HttpOnly; Secure; SameSite=Lax` cookie |
| No passwords stored | Google-only auth — no `password_hash` column used |
| Timing-safe key compare | `crypto.subtle.verify` is constant-time internally |

---

## What This Design Does NOT Provide

| Gap | Explanation | Solution if needed |
|---|---|---|
| Immediate revocation | A valid token remains valid until `exp` even if user is deactivated | Add a `revoked_tokens` KV store checked in `requireAuth` |
| Logout invalidation | Server has no record of issued tokens | Short expiry (15–60 min) + refresh token flow |
| Role change takes effect immediately | Old token still carries old role for up to 8 hours | Shorten expiry or add token revocation |

---

## Local Development Setup

1. Generate keys (once):
   ```bash
   cd apps/api
   node scripts/generate-keys.mjs
   # automatically writes JWT_PRIVATE_KEY and JWT_PUBLIC_KEY to .dev.vars
   ```

2. Verify `.dev.vars` has all required values:
   ```
   JWT_PRIVATE_KEY='{"kty":"RSA","n":"...","d":"...",...}'
   JWT_PUBLIC_KEY='{"kty":"RSA","n":"...","e":"AQAB",...}'
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   GOOGLE_REDIRECT_URI="http://localhost:3000/auth/google/callback"
   FRONTEND_URL="http://localhost:3000"
   ```

3. Start the Worker:
   ```bash
   pnpm dev
   ```

> **Never commit `.dev.vars`** — it contains the private key.
