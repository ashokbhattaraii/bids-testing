import { Hono } from 'hono';
import type { Env, Variables } from '../../env';

// ──────────────────────────────────────────────────────────────────────────────
// Typed router factory
// ──────────────────────────────────────────────────────────────────────────────

/** Create a Hono sub-router typed with the project's Env + Variables */
export function createRouter() {
  return new Hono<{ Bindings: Env; Variables: Variables }>();
}
