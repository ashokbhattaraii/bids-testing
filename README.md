# BIDS (HamroLifeBank) — D1 + Wrangler Deep-Dive

This repo is a Cloudflare Workers + D1 (SQLite-like) application.

You asked specifically:
- what **D1** database is,
- what **wrangler** is,
- where in the codebase they are used,
- which files contain the **D1 code** and **wrangler configuration**,
- and an end-to-end explanation of how the workflow works.

---

## 1) Big picture workflow (how a request flows)

### Runtime
- The backend is built as a **Cloudflare Worker**.
- The Worker exposes HTTP endpoints using **Hono**.
- Each request that hits protected routes must include a **Bearer JWT**.
- Protected handlers then use the **D1 binding** to query/update the database.

### Request path in the code
1. **Worker entry point**: `apps/api/src/index.ts`
   - Creates a `Hono` app.
   - Mounts route groups like `/auth`, `/requests`, `/donors`, etc.

2. **Auth middleware**: `apps/api/src/core/auth/middleware.ts`
   - Reads `Authorization: Bearer <token>`.
   - Verifies JWT signature + expiry using `apps/api/src/core/auth/jwt.ts`.
   - Puts decoded user info into `c.var.user`.

3. **D1 access in route handlers**:
   - Route handlers call `db(c)` from `apps/api/src/core/db/client.ts`.
   - That `db(c)` returns the D1 binding: `c.env.DB`.
   - Then the handler runs SQL like `db(c).prepare('SELECT ...').all()`.

---

## 2) What is D1?

**D1** is Cloudflare’s managed serverless relational database (SQLite-compatible) designed for Workers.

In this project:
- D1 stores the application data: users, donors, hospitals, blood requests, pledges, settings, reminders, etc.
- The Worker receives a D1 “binding” named **`DB`**.

### Where D1 is configured
**Wrangler config (D1 binding + migrations directory)**:
- `apps/api/wrangler.toml`

Key section:
```toml
[[d1_databases]]
binding = "DB"
database_name = "bids"
database_id = "010f88dd-c589-4e28-8c49-45b9343ddb12"
migrations_dir = "migrations"
```

Meaning:
- Worker binding name: `DB`
- Cloudflare D1 database name: `bids`
- The Worker will expose it as `c.env.DB`.
- Migrations are in `apps/api/migrations/`.

### Where D1 is accessed (D1 code in app)
**Typed helper around D1 binding**:
- `apps/api/src/core/db/client.ts`

Important functions:
- `db(c)` → returns `c.env.DB` (typed as `D1Database`).
- `newId()` → uses Worker Web Crypto `crypto.randomUUID()`.

Example usage in routes (pattern):
- `apps/api/src/routes/auth.ts`
- `apps/api/src/routes/donors.ts`
- `apps/api/src/routes/requests.ts`
- `apps/api/src/routes/dashboard.ts`

Example (from `apps/api/src/routes/donors.ts`):
```ts
const row = await db(c)
  .prepare('SELECT * FROM donors WHERE id = ?1')
  .bind(c.req.param('id'))
  .first<DonorRow>();
```

So: **D1 code lives in the route handlers’ usage of `db(c)`**, plus the small wrapper in `core/db/client.ts`.

---

## 3) What is wrangler?

**wrangler** is Cloudflare’s CLI tool used to:
- develop Workers locally (`wrangler dev`),
- deploy Workers (`wrangler deploy`),
- manage D1 databases and apply migrations (`wrangler d1 migrations ...`).

In this project it’s used primarily via:
- `apps/api/wrangler.toml` (configuration)
- `apps/api/package.json` (scripts)

### Wranglers D1 commands configured in package.json
File:
- `apps/api/package.json`

Relevant scripts:
```json
"db:migrate": "wrangler d1 migrations apply DB --local",
"db:migrate:remote": "wrangler d1 migrations apply DB --remote",
"db:reset": "rm -rf .wrangler/state && wrangler d1 migrations apply DB --local"
```

Notes:
- `DB` here must match the **binding** name in `wrangler.toml`.
- `--local` runs against local dev D1.
- `--remote` applies to Cloudflare D1.

### Migrations (schema evolution)
Migrations are here:
- `apps/api/migrations/0001_init.sql`
- `apps/api/migrations/0002_v3_enhancements.sql`

Key tables created in `0001_init.sql`:
- `users`
- `hospitals`
- `hospital_inventory`
- `blood_requests`
- `donors`
- `pledges`
- `unverified_donors`
- `feedback`
- `settings`

Then `0002_v3_enhancements.sql` alters/adds:
- request status model changes
- `request_donors`
- `follow_up_reminders`
- `donor_contacts`
- and additional columns like `donors.communication_type`, etc.

---

## 4) Where is the JWT auth logic? (role relative to D1)

JWT is not D1 itself, but it controls *who can access D1-backed endpoints*.

Files:
- `apps/api/src/core/auth/jwt.ts`
  - Implements RS256 JWT signing and verification using Web Crypto.
  - Uses env vars `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY`.

- `apps/api/src/core/auth/middleware.ts`
  - `requireAuth` verifies the JWT and sets `c.var.user`.

- `apps/api/src/routes/auth.ts`
  - OAuth login and issuing JWT after DB lookup/creation.
  - Also exposes `/.well-known/jwks.json` which serves the public key.

Example: login uses D1 to look up/create the user:
- `apps/api/src/routes/auth.ts`
  - `SELECT ... FROM users WHERE email = ...`
  - `INSERT INTO users ...` if first time

---

## 5) Exact file mapping: “which file does what?”

### Wrangler configuration (wrangler code/config)
- **`apps/api/wrangler.toml`**
  - Declares the D1 database binding: `DB`
  - Declares `database_id`, `database_name`
  - Declares `migrations_dir = "migrations"`

### Worker entry + route wiring
- **`apps/api/src/index.ts`**
  - Creates Hono app
  - Mounts route modules
  - No D1 SQL directly here

### D1 binding wrapper (D1 helper code)
- **`apps/api/src/core/db/client.ts`**
  - `db(c)` returns `c.env.DB`
  - `newId()` generates IDs

### D1 usage (SQL queries/updates)
- **`apps/api/src/routes/auth.ts`**
  - Reads/writes `users`

- **`apps/api/src/routes/donors.ts`**
  - CRUD for `donors`
  - inserts into `donor_contacts`
  - updates status/blacklist fields

- **`apps/api/src/routes/requests.ts`**
  - CRUD for `blood_requests`
  - creates `follow_up_reminders`
  - reads `request_donors` assignments

- **`apps/api/src/routes/dashboard.ts`**
  - Aggregation queries from multiple tables

(There are more route files in `apps/api/src/routes/` not opened here, but they follow the same pattern: `db(c).prepare(...).bind(...).run()/all()/first()`.)

### DB schema/migrations (D1 schema)
- **`apps/api/migrations/0001_init.sql`**
- **`apps/api/migrations/0002_v3_enhancements.sql`**

---

## 6) Summary: roles of D1 vs Wrangler

- **Wrangler** = tool + configuration layer.
  - Tells Cloudflare how to run your Worker.
  - Connects Worker bindings (including D1) to specific databases.
  - Applies SQL migrations to create/alter tables.

- **D1** = the database.
  - The actual stored data.
  - Your Worker queries it with SQL.

---

## 7) Quick commands you can run

From `apps/api/`:
- Local dev worker:
  - `pnpm dev` (script in `apps/api/package.json` uses `wrangler dev`)

- Apply migrations locally:
  - `pnpm db:migrate`

- Apply migrations remotely:
  - `pnpm db:migrate:remote`

---

If you want, I can also generate an “index by table” section (e.g., where `donors` is read/written, where `blood_requests` status transitions happen, etc.) based on scanning all route files.
