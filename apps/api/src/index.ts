import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env, Variables } from './env';

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

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

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

// ── Health check (no auth required) ──────────────────────────────────────────
app.get('/health', (c) =>
  c.json({ ok: true, service: 'Hamro Life Bank API', ts: Date.now() })
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.route('/auth', authRouter);
app.route('/requests', requestsRouter);
app.route('/donors', donorsRouter);
app.route('/pledges', pledgesRouter);
app.route('/hospitals', hospitalsRouter);
app.route('/feedback', feedbackRouter);
app.route('/users', usersRouter);
app.route('/unverified-donors', unverifiedDonorsRouter);
app.route('/dashboard', dashboardRouter);
app.route('/settings', settingsRouter);
app.route('/request-donors', requestDonorsRouter);
app.route('/diagnoses', diagnosesRouter);

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ success: false, message: 'Route not found' }, 404));

// ── Error handler ─────────────────────────────────────────────────────────────
app.onError((err, c) => {
  console.error('[API Error]', err);
  return c.json({ success: false, message: 'Internal server error' }, 500);
});

export default app;

