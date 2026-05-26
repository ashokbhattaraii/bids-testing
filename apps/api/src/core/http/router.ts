import { OpenAPIHono } from '@hono/zod-openapi';
import type { Env, Variables } from '../../env';

export type AppEnv = { Bindings: Env; Variables: Variables };

export function createRouter() {
  return new OpenAPIHono<AppEnv>({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json({ success: false, message: result.error.issues[0]?.message ?? 'Validation failed', errors: result.error.flatten() }, 400);
      }
    },
  });
}
