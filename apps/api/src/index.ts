import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createRoute, z } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { createRouter } from './core/http/router';

import authRouter from './routes/auth';
import requestsRouter from './routes/requests';
import donorsRouter from './routes/donors';
import pledgesRouter from './routes/pledges';
import hospitalsRouter from './routes/hospitals';
import feedbackRouter from './routes/feedback';
import usersRouter from './routes/users';
import unverifiedDonorsRouter from './routes/unverified-donors';
import dashboardRouter from './routes/dashboard';
import settingsRouter from './routes/settings';
import requestDonorsRouter from './routes/request-donors';
import diagnosesRouter from './routes/diagnoses';
import { requireAuth } from './core/auth/middleware';


const app = createRouter();

// ── Global middleware ─────────────────────────────────────────────────────────
app.use('*', logger());

app.use(
  '*',
  cors({
    origin: (origin) => origin ?? '*',  // reflect request origin; tighten in production
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  }),
);

// OpenAPI doc and Swagger UI will be registered after routes so
// generated doc merges route-level components correctly.

// ── Health check (no auth required) ──────────────────────────────────────────
const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: 'Health check',
  security: [],
  responses: {
    200: {
      description: 'Service is healthy',
      content: {
        'application/json': {
          schema: z.object({
            ok: z.boolean(),
            service: z.string(),
            ts: z.number(),
          }),
        },
      },
    },
  },
});

app.openapi(healthRoute, (c) =>
  c.json({ ok: true as const, service: 'Hamro Life Bank API', ts: Date.now() })
);

app.use('/requests', requireAuth);
app.use('/requests/*', requireAuth);

// ── Routes ────────────────────────────────────────────────────────────────────
app.route('/auth', authRouter);
app.route('/hospitals', hospitalsRouter);
app.route('/requests', requestsRouter);
app.route('/donors', donorsRouter);
app.route('/pledges', pledgesRouter);
app.route('/feedback', feedbackRouter);
app.route('/users', usersRouter);
app.route('/unverified-donors', unverifiedDonorsRouter);
app.route('/dashboard', dashboardRouter);
app.route('/settings', settingsRouter);
app.route('/request-donors', requestDonorsRouter);
app.route('/diagnoses', diagnosesRouter);

// Register OpenAPI document (raw) after all routes are registered
// We register the raw generated spec at `/_raw_openapi.json` then expose
// `/openapi.json` which injects the bearer security scheme. This ensures
// Swagger UI always sees `components.securitySchemes` even if the generator
// omits it.
app.doc('/_raw_openapi.json',{
  openapi: '3.0.0',
  info: {
    title: 'Hamro Life Bank API',
    version: '1.0.0',
    description: 'API documentation for Hamro Life Bank',
  },
  tags: [
    { name: 'Health', description: 'Service health checks' },
    { name: 'Hospitals', description: 'Hospital directory and creation' },
    { name: 'Requests', description: 'Blood request intake and management' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
} as any);

app.get('/openapi.json', async (c) => {
  // fetch the raw generated spec
  try {
    const rawUrl = new URL('/_raw_openapi.json', c.req.url);
    const rawRes = await fetch(rawUrl.toString());
    const spec = (await rawRes.json()) as Record<string, any>;
    spec.components = spec.components || {};
    spec.components.securitySchemes = spec.components.securitySchemes || {};
    if (!spec.components.securitySchemes.bearerAuth) {
      spec.components.securitySchemes.bearerAuth = {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      };
    }
    // Ensure top-level security exists
    spec.security = spec.security ?? [{ bearerAuth: [] }];
    return c.json(spec);
  } catch (err) {
    console.error('Failed to build merged OpenAPI spec', err);
    return c.json({ error: 'failed to build openapi' }, 500);
  }
});

app.get('/docs', swaggerUI({url: '/openapi.json'}));

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ success: false, message: 'Route not found' }, 404));

// ── Error handler ─────────────────────────────────────────────────────────────
app.onError((err, c) => {
  console.error('[API Error]', err.message, err.stack);
  return c.json({ success: false, message: err.message || 'Internal server error' }, 500);
});

export default app;
