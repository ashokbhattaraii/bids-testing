import type { Context } from 'hono';

// ──────────────────────────────────────────────────────────────────────────────
// Standardised JSON error response helper
// ──────────────────────────────────────────────────────────────────────────────

/** Emit a JSON error response matching the BaseResponse<never> shape used by
 *  the frontend (`{ success: false, message: string }`) */
export function jsonError(
  c: Context,
  status: 400 | 401 | 403 | 404 | 409 | 422 | 500,
  message: string,
) {
  return c.json({ success: false, message }, status);
}

/** Emit a JSON success response matching `{ success: true, data: T, message? }` */
export function jsonOk<T>(c: Context, data: T, message?: string, status: 200 | 201 = 200) {
  return c.json({ success: true, data, ...(message ? { message } : {}) }, status);
}
