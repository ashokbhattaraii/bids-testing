import type { JwtUser } from '../../env';

// ──────────────────────────────────────────────────────────────────────────────
// RS256 JWT — signed with RSA private key, verified with public key.
// Uses Web Crypto API built into the Cloudflare Workers runtime.
// Zero external dependencies. No database. Pure in-memory math.
// ──────────────────────────────────────────────────────────────────────────────

const ALG = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' } as const;
const EXPIRY_SECONDS = 8 * 60 * 60; // 8 hours

// ── Module-level key cache ────────────────────────────────────────────────────
// Cloudflare Worker isolates are reused across requests. Storing the imported
// CryptoKey here means key import (a one-time cost) only happens on the very
// first request. Every subsequent request goes straight to crypto.subtle.verify
// with no I/O, no network call, no DB lookup — just CPU math.
let _cachedPublicKey: CryptoKey | null = null;
let _cachedPrivateKey: CryptoKey | null = null;

// ── Base64url helpers (no external deps) ─────────────────────────────────────
function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function b64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

// ── Key importers (cached after first call) ───────────────────────────────────
async function importPrivateKey(jwkJson: string): Promise<CryptoKey> {
  if (_cachedPrivateKey) return _cachedPrivateKey;
  const jwk = JSON.parse(jwkJson) as JsonWebKey;
  _cachedPrivateKey = await crypto.subtle.importKey('jwk', jwk, ALG, false, ['sign']);
  return _cachedPrivateKey;
}

async function importPublicKey(jwkJson: string): Promise<CryptoKey> {
  if (_cachedPublicKey) return _cachedPublicKey;
  const jwk = JSON.parse(jwkJson) as JsonWebKey;
  _cachedPublicKey = await crypto.subtle.importKey('jwk', jwk, ALG, false, ['verify']);
  return _cachedPublicKey;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Sign a new RS256 JWT for the given user payload */
export async function signJwt(user: JwtUser, privateKeyJwk: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64urlEncode(
    new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })),
  );
  const payload = b64urlEncode(
    new TextEncoder().encode(
      JSON.stringify({ ...user, iat: now, exp: now + EXPIRY_SECONDS }),
    ),
  );
  const signingInput = `${header}.${payload}`;
  const privateKey = await importPrivateKey(privateKeyJwk);
  const signature = await crypto.subtle.sign(
    ALG,
    privateKey,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${b64urlEncode(signature)}`;
}

/**
 * Verify an RS256 JWT using the cached public key.
 * Steps: split → verify signature (Web Crypto, in-memory) → check exp.
 * Returns the decoded payload or null if invalid / expired.
 */
export async function verifyJwt(token: string, publicKeyJwk: string): Promise<JwtUser | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts as [string, string, string];

    // Step 1 — import public key (cached after the first request)
    const publicKey = await importPublicKey(publicKeyJwk);

    // Step 2 — re-run the math; if the signature doesn't match the token was tampered with
    const isValid = await crypto.subtle.verify(
      ALG,
      publicKey,
      b64urlDecode(signatureB64),
      new TextEncoder().encode(`${headerB64}.${payloadB64}`),
    );
    if (!isValid) return null;

    // Step 3 — decode payload and check expiry (pure arithmetic, no I/O)
    const payload = JSON.parse(
      new TextDecoder().decode(b64urlDecode(payloadB64)),
    ) as JwtUser & { exp: number };
    if (payload.exp * 1000 < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Returns the public key as a JWK object so it can be served from a
 * /.well-known/jwks.json endpoint — useful for other services to verify tokens.
 */
export function getPublicJwk(publicKeyJwk: string): JsonWebKey {
  return JSON.parse(publicKeyJwk) as JsonWebKey;
}
