import { SignJWT, jwtVerify } from 'jose';
import type { JwtUser } from '../../env';

// ──────────────────────────────────────────────────────────────────────────────
// JWT helpers (uses `jose` — fully compatible with Cloudflare Workers)
// ──────────────────────────────────────────────────────────────────────────────

const ALGORITHM = 'HS256';
const EXPIRY = '8h';

function secretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

/** Sign a new JWT for the given user payload */
export async function signJwt(user: JwtUser, secret: string): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secretKey(secret));
}

/** Verify a JWT and return the decoded payload, or null if invalid/expired */
export async function verifyJwt(token: string, secret: string): Promise<JwtUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(secret), {
      algorithms: [ALGORITHM],
    });
    return payload as unknown as JwtUser;
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Password hashing — PBKDF2-SHA256 via Web Crypto API (no external deps)
// ──────────────────────────────────────────────────────────────────────────────

const PBKDF2_ITERATIONS = 100_000;
const HASH_BYTES = 32; // 256 bits

/** Hash a plaintext password. Returns "saltHex:hashHex" */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );

  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS },
    keyMaterial,
    HASH_BYTES * 8,
  );

  const toHex = (buf: ArrayBuffer) =>
    Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  return `${toHex(salt.buffer)}:${toHex(bits)}`;
}

/** Constant-time comparison of a plaintext password against a stored hash */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, expectedHex] = stored.split(':');
  if (!saltHex || !expectedHex) return false;

  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );

  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS },
    keyMaterial,
    HASH_BYTES * 8,
  );

  const actualHex = Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time string comparison to prevent timing attacks
  if (actualHex.length !== expectedHex.length) return false;
  let diff = 0;
  for (let i = 0; i < actualHex.length; i++) {
    diff |= actualHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }
  return diff === 0;
}
