# BIDS — Architecture & Codebase Guide

This document explains the project layout, the technology choices, and the migration from the previous NestJS-based setup to the current Cloudflare Workers + plugin architecture.

---

## 1. What this project is

**BIDS** is a monorepo containing:

- A **web app** (Next.js) — the user-facing dashboard.
- An **API** running on Cloudflare's serverless edge platform.
- A **plugin system** so domain features (admin, gdrive, etc.) live as independent, swappable modules instead of being baked into the API.
- A **shared database layer** (Drizzle ORM on Cloudflare D1) used by both the API and its plugins.
- **Shared packages** (UI, validators, SDK) consumed by the web app and the API.

The whole repo is managed with **pnpm workspaces** and **Turborepo**.

---

## 2. Top-level folder structure

```
bids/
├── apps/                 Deployable applications
│   ├── api/              Cloudflare Worker (the backend)
│   ├── web/              Next.js dashboard
│   └── docs/             Project documentation (this file lives here)
│
├── packages/             Shared libraries, imported by apps and plugins
│   ├── db/               Drizzle schema + migrations for D1
│   ├── sdk/              Typed API client used by the web app
│   ├── ui/               Shared React component library
│   └── validators/       Zod schemas shared by API and web
│
├── plugins/              Self-contained feature modules (workspace packages)
│   ├── admin/
│   └── gdrive/
│
├── tooling/              Dev-only configs (not shipped to production)
│   └── config/           Shared ESLint + tsconfig presets
│
├── pnpm-workspace.yaml   Tells pnpm which globs are workspace packages
├── turbo.json            Task graph + caching rules
└── package.json          Root scripts
```

---

## 3. The apps

### `apps/api` — Cloudflare Worker

The API is a **single Worker** that boots, registers plugins, and dispatches requests. It is intentionally thin — most domain code lives in `plugins/`.

```
apps/api/
├── wrangler.toml         Worker config: D1 bindings, secrets, compatibility flags
├── package.json
├── tsconfig.json
├── migrations/           Aggregated D1 SQL migrations (applied via wrangler)
└── src/
    ├── index.ts          Worker entry: `export default { fetch }`
    ├── env.ts            Typed bindings (DB, JWT_SECRET, etc.)
    └── core/
        ├── plugin.ts     Plugin contract + loader
        ├── auth/         JWT verify/sign (in-memory, stateless)
        ├── db/           D1 client wrappers
        └── http/         Router, error handling
```

Key points:
- **Stateless.** No long-running process. Every request boots an isolate, runs, returns.
- **Token verification is in-memory.** JWTs are verified per-request using `jose` against the `JWT_SECRET` binding. No session table, no Redis.
- **D1 access** is via the `DB` binding declared in `wrangler.toml`.

### `apps/web` — Next.js dashboard

Unchanged from before. Talks to the API through `packages/sdk` and validates forms with `packages/validators`.

### `apps/docs`

Project documentation. This file.

---

## 4. The plugin system

Each plugin is its **own workspace package** with its own `package.json`. The API's `core/plugin.ts` defines a contract:

```ts
type Plugin = {
  name: string
  basePath: string
  register: (app: Hono<AppEnv>) => void
}
```

A plugin folder looks like:

```
plugins/admin/
├── package.json          name: "@bids/plugin-admin"
├── tsconfig.json
├── migrations/           Plugin-owned SQL migrations
└── src/
    ├── index.ts          Exports the Plugin object
    ├── routes.ts         HTTP handlers
    ├── service.ts        Business logic
    ├── repo.ts           D1 queries
    └── schema.ts         Zod input/output schemas
```

The Worker imports plugins and registers them at boot:

```ts
import adminPlugin from "@bids/plugin-admin"
import gdrivePlugin from "@bids/plugin-gdrive"

registerPlugins(app, [adminPlugin, gdrivePlugin])
```

**Why this shape:**
- Adding a feature = drop a folder in `plugins/`, list it in `pnpm-workspace.yaml`, register it in `index.ts`.
- Removing a feature = delete the folder, remove the import.
- Plugins can be developed, tested, and reasoned about in isolation.
- The core Worker knows nothing about plugin internals — it only knows the `Plugin` contract.

This is the same pattern used by **Fastify**, **Backstage**, **Strapi**, and **Payload CMS**.

---

## 5. Shared packages

| Package | Purpose | Notes |
|---|---|---|
| `@bids/db` | Drizzle ORM schema, types, and migrations for D1 | Single source of truth for DB shape. Plugins import their tables from here. |
| `@bids/validators` | Zod schemas | Used by API for input validation and by web for form validation — same source. |
| `@bids/sdk` | Typed API client | What `apps/web` calls. Built on top of route types from the API. |
| `@bids/ui` | React component library | Shared between web and (future) admin UIs. |

`packages/db/drizzle.config.ts` configures `drizzle-kit` to generate SQL migrations from the TypeScript schema definitions.

---

## 6. Tooling

`tooling/config/` holds shared **ESLint** rules and **tsconfig** base files. Other packages do `"extends": "../../tooling/config/tsconfig/base.json"` so configs don't drift between packages. Nothing in `tooling/` is shipped — it's dev-only.

---

## 7. How a request flows

```
Client request
   │
   ▼
Cloudflare edge (Worker isolate boots)
   │
   ▼
apps/api/src/index.ts          ── default fetch handler
   │
   ▼
core/auth                      ── JWT verified in-memory (jose)
   │
   ▼
core/plugin (router)           ── matches path → plugin
   │
   ▼
plugins/<name>/src/routes.ts   ── handler
   │
   ▼
service.ts → repo.ts           ── domain logic + D1 queries
   │
   ▼
@bids/db (Drizzle)             ── typed queries against env.DB
   │
   ▼
Cloudflare D1 (SQLite)
   │
   ▼
Response
```

---

## 8. Migration: NestJS → Cloudflare Workers

### Previous setup

```
apps/api/                NestJS application
├── src/
│   ├── main.ts          NestFactory.create + app.listen(3006)
│   ├── app.module.ts    Root module
│   ├── app.controller.ts
│   └── app.service.ts
├── nest-cli.json
└── tsconfig.build.json

packages/
├── config/              ESLint + tsconfig (NestJS + Next presets)
├── types/               Shared TS types
├── utils/               Shared helpers
└── ui/                  React components
```

The old API was a **stateful Node.js server** running on a port. No serverless deployment, no edge presence, no built-in DB.

### What changed and why

| Concern | Before | Now | Why |
|---|---|---|---|
| **Runtime** | Node.js (long-running process) | Cloudflare Workers (V8 isolates, per-request) | Serverless, edge-distributed, near-zero cold start, no servers to manage. |
| **Framework** | NestJS | Hono | Nest depends on Node APIs and `reflect-metadata`; it can't run on Workers. Hono is built for V8 isolates and is ~14kb. |
| **Deployment** | `node dist/main` | `wrangler deploy` | One command pushes to Cloudflare's global edge network. |
| **Database** | None configured | Cloudflare D1 (serverless SQLite) | Serverless DB that lives next to the Worker. Bound directly into the runtime — no connection pool, no network hop to a separate DB host. |
| **ORM** | None | Drizzle | Prisma's Rust query engine binary doesn't run on Workers. Drizzle is pure TS with first-class D1 support. |
| **Auth** | Implicit (none built) | In-memory JWT verify with `jose` | Stateless, no session store needed. Fits the per-request isolate model. |
| **Module system** | Nest modules (DI container) | Plugin packages (workspace modules) | Nest's DI is heavy and Node-only. Workspace packages give the same isolation with no runtime cost and work across the whole monorepo (web can also import them). |
| **Folder layout** | All domain code under `apps/api/src/` | Domain code lives in top-level `plugins/` | Plugins become first-class workspace packages — independently versioned, testable, swappable. |
| **Config packages** | `packages/config` | `tooling/config` | Reflects intent: it's dev tooling, not a runtime dependency. |
| **Type sharing** | `packages/types` | `packages/validators` (zod) | Zod schemas give both runtime validation and inferred types — replaces hand-written types. |
| **Utils** | `packages/utils` | `packages/sdk` | Renamed and refocused: `sdk` is now specifically the typed API client used by web. |
| **New packages** | — | `packages/db` | Centralizes Drizzle schema + migrations as a shared library. |
| **New apps** | — | `apps/docs` | Dedicated home for project documentation. |

### Files removed in the transition

- `apps/api/src/main.ts`, `app.module.ts`, `app.controller.ts`, `app.service.ts` — Nest bootstrap.
- `apps/api/nest-cli.json`, `apps/api/tsconfig.build.json` — Nest build config.
- `@nestjs/*`, `reflect-metadata`, `rxjs` — Nest deps.

### Files added in the transition

- `apps/api/wrangler.toml` — Worker config.
- `apps/api/src/index.ts` — Worker entry (`export default { fetch }`).
- `apps/api/src/core/` — auth, db, http, plugin loader.
- `apps/api/src/env.ts` — typed bindings.
- `apps/api/migrations/` — D1 migrations directory.
- `plugins/` — top-level plugin packages.
- `packages/db/` — Drizzle schema + migrations.
- `tooling/` — relocated dev configs.

### Workspace config update

`pnpm-workspace.yaml` was extended:

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "plugins/*"     # NEW
  - "tooling/*"     # NEW
```

---

## 9. The stack at a glance

| Layer | Tool |
|---|---|
| Compute | Cloudflare Workers |
| HTTP framework | Hono |
| Database | Cloudflare D1 (SQLite) |
| ORM | Drizzle + drizzle-kit |
| Validation | Zod |
| Auth | JWT (jose), verified in-memory |
| Frontend | Next.js |
| Component library | React + (project's UI package) |
| Monorepo | pnpm workspaces + Turborepo |
| Deploy | Wrangler CLI |

---

## 10. Common workflows

```bash
# Install everything
pnpm install

# Run API locally (Worker on http://localhost:8787)
pnpm --filter api dev

# Run web locally
pnpm --filter web dev

# Run everything (turbo orchestrates)
pnpm dev

# Create the D1 database (one time)
pnpm --filter api wrangler d1 create bids
# → copy the printed database_id into apps/api/wrangler.toml

# Apply migrations locally
pnpm --filter api db:migrate

# Apply migrations to remote D1
pnpm --filter api db:migrate:remote

# Deploy the Worker
pnpm --filter api deploy

# Generate Drizzle migrations from schema changes
pnpm --filter @bids/db generate
```

---

## 11. Adding a new plugin

1. `mkdir -p plugins/<name>/src plugins/<name>/migrations`
2. Add `plugins/<name>/package.json` with `"name": "@bids/plugin-<name>"`.
3. Add `plugins/<name>/tsconfig.json` extending the shared base.
4. Implement `src/index.ts` exporting a `Plugin` object.
5. Add `"@bids/plugin-<name>": "workspace:*"` to `apps/api/package.json`.
6. Import and register it in `apps/api/src/index.ts`.
7. `pnpm install` to wire up the workspace symlink.
