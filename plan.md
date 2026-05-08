# Rahat-style Plugin Architecture — Serverless (Cloudflare Workers + Hono) — Implementation Plan (Option A)

> Scope: Introduce a shared plugin SDK/contract and align backend plugins to it. This is the foundation required before implementing frontend plugin registries/routing.
> Constraint: **Do not write code yet** in this plan.

> Note: Your requested frontend plugin scope is currently **BIDS + Donor** (not Admin + GDrive). The plan below reflects that naming/intent in the affected sections (metadata + registry + adapters migration phases).

---

## 0) Objectives

1. **Create a shared contract (SDK)** used by both:
   - the Cloudflare Worker host (`apps/api`) and
   - all serverless plugin packages under `plugins/*`.
2. **Unify the backend plugin contract** so the host can register plugins consistently.
3. **Add plugin metadata/descriptor capability** so later frontend menu/PluginGate can be built without hardcoding.
4. **Introduce a backend plugin registry foundation** (even if still using static registration initially).

---

## 1) Analysis Summary (what we observed in the repo)

### 1.1 Backend (Cloudflare Worker + Hono)
- `apps/api/src/index.ts` currently hardcodes route registration:
  - `app.route('/auth', authRouter)`
  - `app.route('/requests', requestsRouter)`
  - etc.
- There is already a concept of plugin contract:
  - `apps/api/src/core/plugin.ts` defines `Plugin` with `{ name, basePath, register }`.
- Plugins exist already as workspace packages:
  - examples: `plugins/admin`, `plugins/gdrive`, etc.
  - each appears to have `src/index.ts`, `src/routes.ts`, `src/service.ts`, `src/repo.ts`, `src/schema.ts`, plus `migrations/`.

### 1.2 Frontend (Next.js)
- Sidebar navigation is currently hardcoded in:
  - `apps/web/components/app-shell.tsx`
- Frontend communicates with backend through:
  - `apps/web/lib/api-client.ts`

### 1.3 Rahat reference (plugin-first architecture)
- Rahat defines multiple plugin types and contracts.
- For this plan (Option A), we focus only on **SDK/contract** and **backend integration foundation**.
- Frontend registries/routing/PluginGate are intentionally out-of-scope for Option A.

---

## 2) Deliverables (what will exist after completing this plan)

1. **`packages/plugin-sdk`** (or equivalent shared package if already present):
   - defines backend plugin interfaces and optional metadata/descriptor types.
2. Backend host plugin integration updated to consume the shared contract:
   - `apps/api/src/core/plugin.ts` becomes a thin compatibility layer or fully replaced.
3. Backend plugin registry loader is introduced:
   - a centralized place to import/register plugins.
4. Each plugin package conforms to the new shared contract and exports metadata.

---

## 3) Step-by-step Plan

### Step 1 — Create/extend shared SDK contract (Option A focus)
**Goal:** Define a single source of truth for plugin contracts.

**Actions:**
1. Create a new package if it doesn’t exist:
   - `packages/plugin-sdk/src/index.ts`
2. Define backend host/plugin contracts tailored to serverless Hono:
   - A plugin should be a *pure module* that registers routes onto a Hono app.
3. Include typed metadata for later use by frontend:
   - plugin `id`, `label`, `icon`, `routeGroup`/`webGroup`/`requiredRole` etc.
4. Define a standard error/response shape expectations (optional but recommended):
   - Align with existing frontend `api-client.ts` which expects `{ success, data, message }`.

**Acceptance criteria:**
- All plugin packages can type-check against the shared SDK types.
- Backend can compile with the SDK types.

---

### Step 2 — Align `apps/api` plugin contract with SDK
**Goal:** Remove duplication and ensure host and plugins use the same contract.

**Actions:**
1. Inspect `apps/api/src/core/plugin.ts`.
2. Decide one of:
   - (A) replace its exported types with re-exports from `packages/plugin-sdk`, or
   - (B) refactor it to become a compatibility adapter that wraps the SDK contract.
3. Ensure there is exactly one canonical set of types.

**Acceptance criteria:**
- `apps/api` no longer defines the canonical plugin type shape.

---

### Step 3 — Add plugin descriptor/metadata to each backend plugin package
**Goal:** Make plugins self-describing.

**Actions:**
1. For every plugin package under `plugins/*`:
   - Update `src/index.ts` (or equivalent export entry) to include:
     - `descriptor` (typed) containing `id`, `label`, and optional UI-relevant metadata.
2. Keep business logic separate:
   - No routing/UI logic is implemented here—metadata only.
3. Ensure plugin id is stable:
   - The `descriptor.id` should be the same across versions.

**Acceptance criteria:**
- Each plugin exports a descriptor that matches SDK definitions.
- Descriptor is optional if you want incremental adoption (but types should support it).

---

### Step 4 — Introduce backend plugin registry loader
**Goal:** Centralize plugin imports and registration.

**Actions:**
1. Create a new module in `apps/api` (planned structure):
   - `apps/api/src/core/plugins.ts`
2. In this module:
   - import all plugin packages (static imports)
   - expose `registerAllPlugins(app)`.
3. Update `apps/api/src/index.ts` to use the registry loader:
   - remove hardcoded plugin route registration from the host where possible
   - migrate them behind plugin adapters in early phases.

**Acceptance criteria:**
- Adding/removing a backend plugin becomes a single change in registry loader.

---

### Step 5 — Migrate existing built-in routes to plugin adapters (incremental)
**Goal:** Avoid a “big bang” rewrite.

**Actions:**
1. For each existing route module under `apps/api/src/routes/*` (auth, dashboard, donors, etc.):
   - define a plugin adapter (or move that route into a plugin package progressively)
2. Decide migration strategy:
   - Phase 5.1: create adapter plugins inside `apps/api` first (temporary)
   - Phase 5.2: move those adapters into proper `plugins/*` packages later

**Acceptance criteria:**
- The host registration uses the registry loader.
- The external API behavior (endpoints) remains unchanged.

---

### Step 6 — Standardize payload/typing boundaries for plugin routes
**Goal:** Make plugins compatible by construction.

**Actions:**
1. Confirm the frontend expects `ApiResponse` shape:
   - `success: true/false`, `data`, `message`
2. Ensure plugin routes return consistently shaped responses.
3. If using Zod/validators already:
   - standardize how plugins attach/validate request schemas.
4. Make sure SDK contract defines the expected request/response boundary types.

**Acceptance criteria:**
- Web client integration remains stable.
- Plugin authors can rely on shared schema and response conventions.

---

### Step 7 — Workspace + tooling updates (preparation for later frontend work)
**Goal:** Ensure TS project references/builds work.

**Actions:**
1. Add new SDK package dependencies to relevant packages:
   - `apps/api` depends on `packages/plugin-sdk`
   - each plugin package depends on `packages/plugin-sdk`
2. Ensure tsconfig paths/exports are consistent:
   - update any TS path config needed
3. Ensure lint/typecheck in CI (or local) includes the new package.

**Acceptance criteria:**
- `pnpm` workspace builds complete.

---

## 4) Dependent Files to edit (by this Option A plan)

### Create
- `packages/plugin-sdk/src/index.ts` (new shared contract package)
- `apps/api/src/core/plugins.ts` (backend registry loader)

### Edit
- `apps/api/src/core/plugin.ts` (convert to re-export/adapter to SDK)
- `apps/api/src/index.ts` (use `registerAllPlugins`)
- `plugins/*/src/index.ts` for each plugin (export descriptor + conform to SDK)

### Potentially update later (still Option A)
- If response shaping is inconsistent, update plugin route handlers to match the shared response contract.

---

## 5) Milestones / Suggested Execution Order

1. SDK contract introduced (`packages/plugin-sdk`).
2. `apps/api` consumes SDK types.
3. Plugin packages conform and export metadata.
4. Registry loader added.
5. Host stops hardcoding plugin routes (migrate via adapters incrementally).
6. Standardize response/error boundaries.
7. Validate workspace compilation.

---

## 6) Follow-up Steps (after code is written per this plan)

1. Run type checking for the entire monorepo.
2. Run local Worker dev server and confirm endpoints still work:
   - verify `GET/POST` for known routes
3. Run Next.js dev build to confirm `api-client` still parses responses.

---

## 7) Out of Scope (explicitly for Option A)

- Implementing Rahat-style frontend registries (`apps/web/src/plugins/*`)
- PluginGate component integration
- Frontend routing becoming plugin-driven
- Plugin enable/disable persistence UI

Those come in later options once the shared contract is stable.

