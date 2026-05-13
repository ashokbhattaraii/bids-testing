/**
 * One-time key generation script.
 * Run: node scripts/generate-keys.mjs
 *
 * Writes JWT_PRIVATE_KEY and JWT_PUBLIC_KEY directly into .dev.vars as
 * single-line values — ready to use immediately with `wrangler dev`.
 *
 * For production, run once and push with wrangler secret put (see output).
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const devVarsPath = resolve(__dir, '../.dev.vars');

const { privateKey, publicKey } = await crypto.subtle.generateKey(
  {
    name: 'RSASSA-PKCS1-v1_5',
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256',
  },
  true,
  ['sign', 'verify'],
);

const privateJwk = JSON.stringify(await crypto.subtle.exportKey('jwk', privateKey));
const publicJwk  = JSON.stringify(await crypto.subtle.exportKey('jwk', publicKey));

// ── Update .dev.vars ──────────────────────────────────────────────────────────
let content = existsSync(devVarsPath) ? readFileSync(devVarsPath, 'utf8') : '';

// Remove any existing key lines
content = content
  .split('\n')
  .filter((l) => !l.startsWith('JWT_PRIVATE_KEY=') && !l.startsWith('JWT_PUBLIC_KEY='))
  .join('\n')
  .trimEnd();

content += `\nJWT_PRIVATE_KEY='${privateJwk}'\nJWT_PUBLIC_KEY='${publicJwk}'\n`;

writeFileSync(devVarsPath, content, 'utf8');
console.log('✓ .dev.vars updated with new JWT_PRIVATE_KEY and JWT_PUBLIC_KEY');

// ── Print production instructions ────────────────────────────────────────────
console.log(`
For production, run these two commands (paste each JSON when prompted):

  wrangler secret put JWT_PRIVATE_KEY
  ${privateJwk}

  wrangler secret put JWT_PUBLIC_KEY
  ${publicJwk}

NEVER commit the private key. The public key is safe to expose at /auth/.well-known/jwks.json
`);
