# Rahat Plugin Architecture Guide

> **Purpose**: This guide is a complete reference for anyone who wants to understand, create, or extend the Rahat plugin system. Read it from top to bottom the first time, then use it as a reference later.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Plugin Types](#3-plugin-types)
4. [Plugin SDK — The Contract](#4-plugin-sdk--the-contract)
5. [Registries — How Plugins Are Stored](#5-registries--how-plugins-are-stored)
6. [Plugin State — Enable/Disable at Runtime](#6-plugin-state--enabledisable-at-runtime)
7. [Plugin Initialization — Wiring Everything Together](#7-plugin-initialization--wiring-everything-together)
8. [App Plugins (Core Modules)](#8-app-plugins-core-modules)
9. [Project Plugins](#9-project-plugins)
10. [Benefit Type Plugins](#10-benefit-type-plugins)
11. [Communication Type Plugins](#11-communication-type-plugins)
12. [Task Type Plugins](#12-task-type-plugins)
13. [Backend Plugins](#13-backend-plugins)
14. [How the Router Consumes Plugins](#14-how-the-router-consumes-plugins)
15. [The PluginGate Component](#15-the-plugingate-component)
16. [Step-by-Step: Creating a New Plugin](#16-step-by-step-creating-a-new-plugin)
17. [Package Naming Conventions](#17-package-naming-conventions)
18. [File Structure Reference](#18-file-structure-reference)
19. [Common Mistakes](#19-common-mistakes)

---

## 1. Overview

Rahat uses a **plugin-first architecture**. Every major feature — dashboards, fund management, forecast, project types, benefit categories, communication channels, and task types — is a plugin. The core app shell contains almost no business logic; it is a host that discovers, registers, and renders plugins.

### Why Plugins?

- **Deployability**: A humanitarian org only installs what they need. A CVA project does not need Anticipatory Action logic.
- **Isolation**: Plugins can be updated or replaced without touching the core.
- **Extensibility**: Third parties can create new project types, communication channels, or task types by following the same interfaces.

### Three Layers

```
┌──────────────────────────────────┐
│         Plugin SDK               │  ← shared TypeScript interfaces (the "contract")
├──────────────────────────────────┤
│     Plugin Implementations       │  ← concrete objects that satisfy the interfaces
│  (plugins/, projects/, packages) │
├──────────────────────────────────┤
│        Host App (apps/web)        │  ← registries, state management, routing, rendering
└──────────────────────────────────┘
```

---

## 2. Architecture Diagram

```
packages/plugin-sdk          ← defines ALL interfaces
        │
        ├── ProjectFrontendPlugin    used by → projects/cva, projects/aa, …
        ├── AppFrontendPlugin        used by → plugins/core-dashboard, plugins/core-forecast, …
        └── ProjectBackendPlugin     used by → projects/cva/backend, projects/aa/backend, …

plugins/                     ← feature implementations
        ├── core-*           (AppFrontendPlugin — sidebar nav items)
        ├── benefits-*       (BenefitFrontendPlugin — self-registers via registerBenefitType())
        ├── comms-*          (CommFrontendPlugin   — self-registers via registerCommType())
        └── task-*           (TaskFrontendPlugin   — self-registers via registerTaskType())

projects/                    ← project-type implementations
        ├── cva/frontend     → CvaFrontendPlugin   (ProjectFrontendPlugin)
        ├── aa/frontend      → AaFrontendPlugin
        └── …

packages/projects-shared/    ← sub-registries for benefit/comm/task types
        ├── benefits/benefit-types/registry.ts
        ├── communication/comm-types/registry.ts
        └── task-management/task-types/registry.ts

apps/web/src/plugins/        ← host-side wiring
        ├── registry.ts      (project plugin registry)
        ├── app-registry.ts  (app/core plugin registry)
        ├── plugin-state.ts  (localStorage enable/disable)
        └── index.ts         (imports + registers everything at startup)
```

---

## 3. Plugin Types

There are **five distinct plugin types** in Rahat:

| Plugin Type | Interface | Location | Purpose |
|---|---|---|---|
| **App Plugin** | `AppFrontendPlugin` | `plugins/core-*` | Top-level pages shown in the sidebar (Dashboard, Forecast, Fund Management, etc.) |
| **Project Plugin** | `ProjectFrontendPlugin` | `projects/*` | A project type (CVA, AA, Microloans, etc.) with its own setup page, dashboard, and nav menu |
| **Benefit Type Plugin** | `BenefitFrontendPlugin` | `plugins/benefits-*` | Adds a benefit category (Cash, Food, WASH, NFI, Service) to the benefit registry |
| **Comm Type Plugin** | `CommFrontendPlugin` | `plugins/comms-*` | Adds a communication channel (SMS, WhatsApp, IVR, Slack) to the comm registry |
| **Task Type Plugin** | `TaskFrontendPlugin` | `plugins/task-*` | Adds a task type (SMS, IVR, Benefit Distribution) to the task registry |

Additionally, every project has an optional:

| Plugin Type | Interface | Purpose |
|---|---|---|
| **Backend Plugin** | `ProjectBackendPlugin` | Registers a NestJS module for the project's server-side endpoints |

---

## 4. Plugin SDK — The Contract

**Location**: `packages/plugin-sdk/src/index.ts`

This is the single source of truth for every interface a plugin must implement. Never define these locally.

### 4.1 AppFrontendPlugin

Used by top-level core modules that appear as sidebar navigation items.

```typescript
export interface AppFrontendPlugin {
  id: string              // unique slug, e.g. 'dashboard', 'forecast'
  label: string           // human-readable name shown in UI
  description?: string    // tooltip / description text
  icon?: string           // Lucide icon name, e.g. 'LayoutDashboard'
  group: 'core'           // always 'core' for app plugins
  route: string           // TanStack Router path, e.g. '/', '/forecast'
  PageComponent: () => unknown  // the React page component
}
```

### 4.2 ProjectFrontendPlugin

Used by project-type implementations (CVA, AA, Microloans, etc.).

```typescript
export interface ProjectFrontendPlugin {
  projectType: string              // must match a PROJECT_TYPES value
  label: string                    // human-readable name
  description?: string
  icon?: string                    // Lucide icon name
  menuItems?: MenuItem[]           // project-specific nav links
  taskGroups?: string[]            // task group names for this project type
  triggerPhases?: string[]         // phases that can trigger actions
  taskLabel?: {                    // override the word "Task" (e.g. "Activity")
    singular: string
    plural: string
  }
  SetupPage: (props: SetupPageProps) => unknown   // required: new-project wizard step
  DashboardPage?: (props: DashboardPageProps) => unknown  // optional: project dashboard
}
```

**Menu item types:**

```typescript
export interface MenuLink {
  type: 'link'
  label: string
  icon?: string
  href: string
  requiredPluginGroup?: string  // hide if this plugin group is disabled
}

export interface MenuDropdown {
  type: 'dropdown'
  label: string
  icon?: string
  items: MenuLink[]
}

export type MenuItem = MenuLink | MenuDropdown
```

### 4.3 ProjectBackendPlugin

Used to register a NestJS module for a project type.

```typescript
export type Constructor<T = object> = new (...args: any[]) => T

export interface ProjectBackendPlugin {
  projectType: string    // must match a PROJECT_TYPES value
  module: Constructor    // the NestJS @Module() class
}
```

### 4.4 Shared Props

```typescript
export interface SetupPageProps {
  onSubmit: (data: { name: string } & Record<string, unknown>) => void
}

export interface ProjectSummary {
  id: string
  name: string
  status: string
  description: string
  type: string
  walletAddress: string
  baseUrl: string
  location: string
  beneficiaries: number
  budget: string
  image: string
  longitude?: number
  latitude?: number
  createdAt?: string
  updatedAt?: string
}

export interface DashboardPageProps {
  project: ProjectSummary
  onEdit?: () => void
  mapSlot?: import('react').ReactNode
}
```

### 4.5 Project Types Enum

```typescript
export const PROJECT_TYPES = {
  CVA: 'CVA',
  BENEFICIARY_MANAGEMENT: 'BENEFICIARY_MANAGEMENT',
  MICROLEARNING: 'MICROLEARNING',
  ANTICIPATORY_ACTION: 'ANTICIPATORY_ACTION',
  MICROLOANS: 'MICROLOANS',
} as const

export type ProjectType = (typeof PROJECT_TYPES)[keyof typeof PROJECT_TYPES]
```

> When adding a new project type, add it here first.

---

## 5. Registries — How Plugins Are Stored

There are **five registries** in total. Two live in `apps/web/src/plugins/`; three live inside `packages/projects-shared/`.

### 5.1 Project Plugin Registry

**File**: `apps/web/src/plugins/registry.ts`

```typescript
import type { ProjectFrontendPlugin } from '@rahataid/plugin-sdk'

const plugins: Array<ProjectFrontendPlugin> = []

export function registerPlugin(plugin: ProjectFrontendPlugin): void {
  plugins.push(plugin)
}

export function getRegisteredPlugins(): Array<ProjectFrontendPlugin> {
  return plugins
}

export function getPlugin(projectType: string): ProjectFrontendPlugin | undefined {
  return plugins.find((p) => p.projectType === projectType)
}
```

### 5.2 App Plugin Registry

**File**: `apps/web/src/plugins/app-registry.ts`

```typescript
import type { AppFrontendPlugin } from '@rahataid/plugin-sdk'

const appPlugins: Array<AppFrontendPlugin> = []

export function registerAppPlugin(plugin: AppFrontendPlugin): void {
  appPlugins.push(plugin)
}

export function getRegisteredAppPlugins(): Array<AppFrontendPlugin> {
  return appPlugins
}

export function getAppPlugin(id: string): AppFrontendPlugin | undefined {
  return appPlugins.find((p) => p.id === id)
}
```

### 5.3 Benefit Type Registry

**File**: `packages/projects-shared/src/benefits/benefit-types/registry.ts`

```typescript
export interface BenefitTypeDefinition {
  type: string
  label: string
  description?: string
  group: 'benefits'
  IconComponent?: React.ComponentType<{ className?: string; size?: number }>
  color: string   // Tailwind text class, e.g. 'text-green-600'
  bg: string      // Tailwind bg class, e.g. 'bg-green-100'
}

export type BenefitFrontendPlugin = BenefitTypeDefinition

const registry = new Map<string, BenefitTypeDefinition>()

export function registerBenefitType(def: BenefitTypeDefinition): void {
  registry.set(def.type, def)
}

export function getBenefitTypeDefinition(type: string): BenefitTypeDefinition | undefined {
  return registry.get(type)
}

export function getRegisteredBenefitTypes(): BenefitTypeDefinition[] {
  return Array.from(registry.values())
}
```

### 5.4 Communication Type Registry

**File**: `packages/projects-shared/src/communication/comm-types/registry.ts`

```typescript
export interface CommTypeDefinition {
  type: string
  label: string
  description?: string
  group: 'comms'
  IconComponent?: React.ComponentType<{ className?: string }>
  DetailsComponent?: React.ComponentType<CommDetailsProps>
  canAdvance?: (data: Record<string, unknown>) => boolean
}

export type CommFrontendPlugin = CommTypeDefinition

export function registerCommType(def: CommTypeDefinition): void { … }
export function getCommTypeDefinition(type: string): CommTypeDefinition | undefined { … }
export function getRegisteredCommTypes(): CommTypeDefinition[] { … }
```

### 5.5 Task Type Registry

**File**: `packages/projects-shared/src/task-management/task-types/registry.ts`

```typescript
export interface TaskTypeDefinition {
  type: string
  label: string
  description?: string
  icon?: string
  group: 'task'
  designerTabLabel?: string
  designer?: React.ComponentType<DesignerProps>
}

export type TaskFrontendPlugin = TaskTypeDefinition

export function registerTaskType(def: TaskTypeDefinition): void { … }
export function getTaskTypeDefinition(type: string): TaskTypeDefinition | undefined { … }
export function getRegisteredTaskTypes(): TaskTypeDefinition[] { … }
```

---

## 6. Plugin State — Enable/Disable at Runtime

**File**: `apps/web/src/plugins/plugin-state.ts`

Plugins can be toggled on/off by the user from the `/plugins` page. State is persisted in `localStorage` under the key `rahat:plugin-states`.

```typescript
const STORAGE_KEY = 'rahat:plugin-states'

// Returns all plugin states as a Record<pluginId, boolean>
function getAll(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

// Defaults to `true` (enabled) if the plugin has never been toggled
export function isPluginEnabled(id: string): boolean {
  const all = getAll()
  return id in all ? all[id] : true
}

// Persists the state and fires a custom event so components re-render
export function setPluginEnabled(id: string, enabled: boolean): void {
  const all = getAll()
  all[id] = enabled
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  window.dispatchEvent(new Event('rahat:plugin-state-change'))
}
```

The `rahat:plugin-state-change` custom event allows any component to react to state changes without a global state manager.

---

## 7. Plugin Initialization — Wiring Everything Together

**File**: `apps/web/src/plugins/index.ts`

This file is **the single place** where all plugins are imported and registered. It runs once at app startup (imported in the router entry point).

```typescript
// ── Project plugins ──────────────────────────────────────────────────────────
import { CvaFrontendPlugin }           from '@rahataid/plugin-project-cva/frontend'
import { BeneficiaryFrontendPlugin }   from '@rahataid/plugin-project-beneficiary/frontend'
import { AaFrontendPlugin }            from '@rahataid/plugin-project-aa/frontend'
import { MicrolearningFrontendPlugin } from '@rahataid/plugin-project-microlearning/frontend'
import { MicroloansFrontendPlugin }    from '@rahataid/plugin-project-microloans/frontend'

// ── App (core) plugins ───────────────────────────────────────────────────────
import { DashboardFrontendPlugin }      from '@rahataid/plugin-core-dashboard/frontend'
import { VendorsFrontendPlugin }        from '@rahataid/plugin-core-vendors/frontend'
import { FundManagementFrontendPlugin } from '@rahataid/plugin-core-fund-management/frontend'
import { ForecastFrontendPlugin }       from '@rahataid/plugin-core-forecast/frontend'
import { ReportsFrontendPlugin }        from '@rahataid/plugin-core-reports/frontend'

import { registerPlugin }    from './registry'
import { registerAppPlugin } from './app-registry'

// ── Self-registering plugins (side-effect imports) ───────────────────────────
// These call registerTaskType() / registerCommType() / registerBenefitType()
// immediately when the module is imported — no explicit call needed.

import '@rahataid/plugin-task-sms'
import '@rahataid/plugin-task-voice'
import '@rahataid/plugin-task-benefits'

import '@rahataid/plugin-comms-sms'
import '@rahataid/plugin-comms-whatsapp'
import '@rahataid/plugin-comms-voice'
import '@rahataid/plugin-comms-slack'

import '@rahataid/plugin-benefits-cash'
import '@rahataid/plugin-benefits-food'
import '@rahataid/plugin-benefits-wash'
import '@rahataid/plugin-benefits-nfi'
import '@rahataid/plugin-benefits-service'

// ── Explicit registrations ───────────────────────────────────────────────────
registerPlugin(CvaFrontendPlugin)
registerPlugin(BeneficiaryFrontendPlugin)
registerPlugin(AaFrontendPlugin)
registerPlugin(MicrolearningFrontendPlugin)
registerPlugin(MicroloansFrontendPlugin)

registerAppPlugin(DashboardFrontendPlugin)
registerAppPlugin(VendorsFrontendPlugin)
registerAppPlugin(FundManagementFrontendPlugin)
registerAppPlugin(ForecastFrontendPlugin)
registerAppPlugin(ReportsFrontendPlugin)

// ── Re-exports for convenience ───────────────────────────────────────────────
export { getRegisteredPlugins, getPlugin }    from './registry'
export { getRegisteredAppPlugins, getAppPlugin } from './app-registry'
```

> **Rule**: Never import a plugin anywhere else in `apps/web`. Always add it here.

---

## 8. App Plugins (Core Modules)

App plugins are top-level features that appear as icons in the icon sidebar. They implement `AppFrontendPlugin`.

### Location
```
plugins/
  core-dashboard/
    src/
      frontend/
        dashboard-page.tsx   ← the actual React page
        index.ts             ← exports the AppFrontendPlugin object
      index.ts               ← package entry (re-exports frontend/)
```

### Interface

```typescript
export interface AppFrontendPlugin {
  id: string              // e.g. 'dashboard'
  label: string           // e.g. 'Dashboard'
  description?: string
  icon?: string           // Lucide icon name
  group: 'core'           // always 'core'
  route: string           // path, e.g. '/' or '/forecast'
  PageComponent: () => unknown
}
```

### Example — Dashboard Plugin

```typescript
// plugins/core-dashboard/src/frontend/index.ts
import type { AppFrontendPlugin } from '@rahataid/plugin-sdk'
import { DashboardPage } from './dashboard-page.js'

export const DashboardFrontendPlugin: AppFrontendPlugin = {
  id: 'dashboard',
  label: 'Dashboard',
  description: 'Overview of key metrics, recent activity, and system health.',
  icon: 'LayoutDashboard',
  group: 'core',
  route: '/',
  PageComponent: DashboardPage,
}
```

### Available App Plugins

| Plugin ID | Route | Icon |
|---|---|---|
| `dashboard` | `/` | `LayoutDashboard` |
| `forecast` | `/forecast` | `CloudSun` |
| `fund-management` | `/funds` | `Wallet` |
| `vendors` | `/vendors` | `Building2` |
| `reports` | `/reports` | `BarChart3` |

### How the sidebar renders App Plugins

The `_app.tsx` route reads all registered app plugins and maps them to `SidebarNavItem` objects passed to `<IconSidebar>`:

```typescript
// apps/web/src/routes/_app.tsx (simplified)
import { getRegisteredAppPlugins, isPluginEnabled } from '../plugins'
import * as LucideIcons from 'lucide-react'

const appPlugins = getRegisteredAppPlugins()
const navItems = appPlugins
  .filter(p => isPluginEnabled(p.id))
  .map(p => ({
    icon: <LucideIcons[p.icon] size={20} />,
    to: p.route,
  }))
```

---

## 9. Project Plugins

Project plugins represent entire project types (CVA, AA, Microloans, etc.). They implement `ProjectFrontendPlugin` and live under `projects/`.

### Location

```
projects/
  cva/
    src/
      frontend/
        setup-page.tsx     ← wizard form for creating a new project
        dashboard.tsx      ← project dashboard page
        index.ts           ← exports CvaFrontendPlugin
      index.ts             ← backend plugin export (CvaBackendPlugin)
```

### Example — CVA Plugin

```typescript
// projects/cva/src/frontend/index.ts
import type { ProjectFrontendPlugin } from '@rahataid/plugin-sdk'
import { PROJECT_TYPES } from '@rahataid/plugin-sdk'
import { CvaSetupPage } from './setup-page.js'
import { CvaDashboardPage } from './dashboard.js'

export const CvaFrontendPlugin: ProjectFrontendPlugin = {
  projectType: PROJECT_TYPES.CVA,
  label: 'Cash Voucher Assistance',
  description: 'Distribute cash vouchers to beneficiaries',
  icon: 'Wallet',
  menuItems: [
    { type: 'link', label: 'Benefits',       href: '/projects/:projectId/benefits',      requiredPluginGroup: 'benefits' },
    { type: 'link', label: 'Tasks',          href: '/projects/:projectId/tasks' },
    { type: 'link', label: 'Funds',          href: '/projects/:projectId/funds' },
    { type: 'link', label: 'Communication',  href: '/projects/:projectId/communication' },
    { type: 'link', label: 'Reports',        href: '/projects/:projectId/reports' },
  ],
  SetupPage: CvaSetupPage,
  DashboardPage: CvaDashboardPage,
}
```

### Example — Anticipatory Action Plugin (with task labels & trigger phases)

```typescript
export const AaFrontendPlugin: ProjectFrontendPlugin = {
  projectType: PROJECT_TYPES.ANTICIPATORY_ACTION,
  label: 'Anticipatory Action',
  icon: 'Shield',
  taskGroups: ['General', 'Readiness', 'Preparedness', 'Activation'],
  triggerPhases: ['Preparedness', 'Activation'],
  taskLabel: { singular: 'Activity', plural: 'Activities' },
  menuItems: [
    { type: 'link', label: 'Benefits',      href: '/projects/:projectId/benefits', requiredPluginGroup: 'benefits' },
    { type: 'link', label: 'Activities',    href: '/projects/:projectId/tasks' },
    { type: 'link', label: 'Triggers',      href: '/projects/:projectId/triggers' },
    { type: 'link', label: 'Funds',         href: '/projects/:projectId/funds' },
    { type: 'link', label: 'Communication', href: '/projects/:projectId/communication' },
    { type: 'link', label: 'Reports',       href: '/projects/:projectId/reports' },
  ],
  SetupPage: AaSetupPage,
  DashboardPage: AaDashboardPage,
}
```

### How the Project Header Renders Menu Items

The `project-header.tsx` component reads the current project's type, looks up the plugin, and renders `menuItems`:

```typescript
import { getPlugin } from '../plugins'

const plugin = getPlugin(project.type)  // looks up by projectType
const menu = plugin?.menuItems ?? []
```

### The SetupPage Contract

`SetupPage` receives a single `onSubmit` prop. When the user completes the form, call it:

```typescript
function CvaSetupPage({ onSubmit }: SetupPageProps) {
  const form = useForm<CvaFormValues>({ … })

  return (
    <form onSubmit={form.handleSubmit((values) => onSubmit({ name: values.name, …values }))}>
      {/* form fields */}
    </form>
  )
}
```

### The DashboardPage Contract

`DashboardPage` receives `project`, `onEdit`, and an optional `mapSlot`:

```typescript
function CvaDashboardPage({ project, onEdit, mapSlot }: DashboardPageProps) {
  return (
    <div>
      <h1>{project.name}</h1>
      {mapSlot}  {/* map injected by the host */}
      <button onClick={onEdit}>Edit</button>
    </div>
  )
}
```

---

## 10. Benefit Type Plugins

Benefit type plugins add a category of aid (Cash, Food, WASH, NFI, Service) to the benefit registry. They implement `BenefitFrontendPlugin` (alias for `BenefitTypeDefinition`).

### Location

```
plugins/
  benefits-cash/
    src/
      index.ts   ← defines + self-registers the plugin
```

### Interface

```typescript
export interface BenefitTypeDefinition {
  type: string                            // unique key, e.g. 'Cash'
  label: string                           // display name
  description?: string
  group: 'benefits'                       // always 'benefits'
  IconComponent?: React.ComponentType<{ className?: string; size?: number }>
  color: string                           // Tailwind text class
  bg: string                              // Tailwind background class
}
```

### Example — Cash Benefits Plugin

```typescript
// plugins/benefits-cash/src/index.ts
import { Banknote } from 'lucide-react'
import { registerBenefitType } from '@rahataid/projects-shared/benefits'
import type { BenefitFrontendPlugin } from '@rahataid/projects-shared/benefits'

export const benefitsCashPlugin: BenefitFrontendPlugin = {
  type: 'Cash',
  label: 'Cash',
  description: 'Cash transfers and monetary vouchers',
  group: 'benefits',
  IconComponent: Banknote,
  color: 'text-green-600',
  bg: 'bg-green-100',
}

registerBenefitType(benefitsCashPlugin)
```

> **Notice**: There is no explicit `export default` needed. The `registerBenefitType()` call at the module's top level is the entire "installation". The side-effect import in `apps/web/src/plugins/index.ts` triggers it.

### Available Benefit Types

| Type | Label | Icon | Color |
|---|---|---|---|
| `Cash` | Cash | `Banknote` | `text-green-600` / `bg-green-100` |
| `Food` | Food | `Package` | `text-orange-500` / `bg-orange-100` |
| `WASH` | WASH | `Droplets` | `text-blue-500` / `bg-blue-100` |
| `NFI` | NFI | `Box` | `text-purple-500` / `bg-purple-100` |
| `Service` | Service | `Briefcase` | `text-rose-500` / `bg-rose-100` |

---

## 11. Communication Type Plugins

Communication plugins add a messaging channel to the campaign wizard. They implement `CommFrontendPlugin`.

### Location

```
plugins/
  comms-sms/
    src/
      sms-details.tsx   ← React form for SMS-specific config
      index.ts          ← defines + self-registers + attaches event listener
```

### Interface

```typescript
export interface CommTypeDefinition {
  type: string                   // unique key, e.g. 'sms', 'whatsapp', 'ivr', 'slack'
  label: string
  description?: string
  group: 'comms'
  IconComponent?: React.ComponentType<{ className?: string }>
  DetailsComponent?: React.ComponentType<CommDetailsProps>  // the config form
  canAdvance?: (data: Record<string, unknown>) => boolean   // validate before next step
}

export interface CommDetailsProps {
  data: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
}
```

### The Campaign Send Event

When a campaign is dispatched, the host fires the `rahat:campaign:send` custom event. Communication plugins listen for it and call their respective webhooks:

```typescript
export const CAMPAIGN_SEND_EVENT = 'rahat:campaign:send' as const

export interface CampaignSendEventDetail {
  campaign: Campaign
  beneficiaryIds: string[]
  beneficiaries: Beneficiary[]
  transmissionLogs: TransmissionLog[]
  projectId: string
}
```

### Example — SMS Plugin

```typescript
// plugins/comms-sms/src/index.ts
import { MessageSquare } from 'lucide-react'
import { registerCommType, CAMPAIGN_SEND_EVENT } from '@rahataid/projects-shared/communication'
import type { CommFrontendPlugin, CampaignSendEventDetail } from '@rahataid/projects-shared/communication'
import { SmsDetails as SmsDetailsComponent } from './sms-details.js'

// 1. Define the plugin
export const commsSmsPlugin: CommFrontendPlugin = {
  type: 'sms',
  label: 'SMS',
  description: 'Send text messages to beneficiaries',
  group: 'comms',
  IconComponent: MessageSquare,
  DetailsComponent: SmsDetailsComponent,
  canAdvance: (data) => typeof data.message === 'string' && data.message.trim().length > 0,
}

// 2. Register in the comm type registry
registerCommType(commsSmsPlugin)

// 3. Listen for campaign send events
if (typeof window !== 'undefined') {
  window.addEventListener(CAMPAIGN_SEND_EVENT, async (e: Event) => {
    const { campaign, beneficiaries, transmissionLogs } =
      (e as CustomEvent<CampaignSendEventDetail>).detail

    if (campaign.type !== 'sms') return  // ignore events for other channels

    // fetch service config, call webhook, update transmission log statuses …
  })
}
```

---

## 12. Task Type Plugins

Task type plugins extend the task designer with a new task category. They implement `TaskFrontendPlugin`.

### Location

```
plugins/
  task-sms/
    src/
      sms-designer.tsx   ← React component shown in the task designer tab
      index.ts           ← defines + self-registers the plugin
```

### Interface

```typescript
export interface TaskTypeDefinition {
  type: string                   // unique key, e.g. 'sms', 'ivr', 'benefit-distribution'
  label: string
  description?: string
  icon?: string                  // Lucide icon name
  group: 'task'
  designerTabLabel?: string      // label for the designer tab
  designer?: React.ComponentType<DesignerProps>
}

export interface DesignerProps {
  project: ProjectSummary
  task: ProjectTask
  onUpdate: (designerData: Record<string, unknown>) => void
}
```

### Example — SMS Task Plugin

```typescript
// plugins/task-sms/src/index.ts
import { registerTaskType } from '@rahataid/projects-shared/task-management'
import type { TaskFrontendPlugin } from '@rahataid/projects-shared/task-management'
import { SmsDesigner } from './sms-designer.js'

export const taskSmsPlugin: TaskFrontendPlugin = {
  type: 'sms',
  label: 'SMS Message',
  description: 'Send automated SMS notifications to beneficiaries.',
  icon: 'MessageSquare',
  group: 'task',
  designerTabLabel: 'SMS Message',
  designer: SmsDesigner,
}

registerTaskType(taskSmsPlugin)
```

---

## 13. Backend Plugins

Every project that needs server-side endpoints creates a `ProjectBackendPlugin`.

### Interface

```typescript
export interface ProjectBackendPlugin {
  projectType: string    // e.g. PROJECT_TYPES.CVA
  module: Constructor    // a NestJS @Module() class
}
```

### Example

```typescript
// projects/cva/src/index.ts  (backend entry)
import type { ProjectBackendPlugin } from '@rahataid/plugin-sdk'
import { PROJECT_TYPES } from '@rahataid/plugin-sdk'
import { CvaModule } from './backend/cva.module.js'

export { CvaModule }

export const CvaBackendPlugin: ProjectBackendPlugin = {
  projectType: PROJECT_TYPES.CVA,
  module: CvaModule,
}
```

The NestJS app (`apps/api`) imports all backend plugins and dynamically adds their modules to the root application module. This means adding a new project type to the backend requires only importing its `ProjectBackendPlugin` and calling the registration function — no changes to the core module.

---

## 14. How the Router Consumes Plugins

### App Plugin Route Pattern

Each core plugin has a corresponding route file. The route uses `getAppPlugin()` to look up the plugin and renders its `PageComponent` inside a `<PluginGate>`:

```typescript
// apps/web/src/routes/_app.index.tsx
import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { getAppPlugin } from '../plugins'
import { PluginGate } from '../components/plugin-gate'

export const Route = createFileRoute('/_app/')({
  component: () => {
    const plugin = getAppPlugin('dashboard')
    const Page = plugin?.PageComponent as React.ComponentType | undefined
    return (
      <PluginGate pluginId="dashboard">
        {Page ? <Page /> : null}
      </PluginGate>
    )
  },
})
```

### Project Route Pattern

Project routes use `getPlugin(project.type)` to find the plugin for the loaded project, then render the plugin's `DashboardPage`:

```typescript
// apps/web/src/routes/_app.projects.$id.index.tsx
import { getPlugin } from '../plugins'
import type { DashboardPageProps } from '@rahataid/plugin-sdk'

function ProjectDashboard() {
  const { id } = Route.useParams()
  const { project, plugin } = useProjectContext()  // context provides both project data + its plugin

  const DashboardPage = plugin?.DashboardPage as
    | ((props: DashboardPageProps) => React.ReactNode)
    | undefined

  if (!DashboardPage) return <div>No dashboard for this project type.</div>

  return (
    <DashboardPage
      project={project}
      onEdit={() => navigate({ to: '/projects/$id/edit', params: { id } })}
      mapSlot={<MapboxMap … />}
    />
  )
}
```

---

## 15. The PluginGate Component

**File**: `apps/web/src/components/plugin-gate.tsx`

`PluginGate` is a guard component. It checks `isPluginEnabled(pluginId)` and either renders its children (or `<Outlet />`) or shows a "Plugin not enabled" screen.

```typescript
export function PluginGate({
  pluginId,
  children,
}: {
  pluginId: string
  children?: React.ReactNode
}) {
  // Re-render when plugin state changes (localStorage event)
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0)

  React.useEffect(() => {
    const handler = () => forceUpdate()
    window.addEventListener('rahat:plugin-state-change', handler)
    return () => window.removeEventListener('rahat:plugin-state-change', handler)
  }, [])

  if (!isPluginEnabled(pluginId)) return <PluginDisabledScreen />

  return children != null ? <>{children}</> : <Outlet />
}
```

**Usage patterns:**

```typescript
// Pattern 1: wrap children
<PluginGate pluginId="forecast">
  <ForecastPage />
</PluginGate>

// Pattern 2: gate an outlet (for nested routes)
<PluginGate pluginId="fund-management" />
```

---

## 16. Step-by-Step: Creating a New Plugin

### 16.1 Creating a New App Plugin (Core Module)

**Goal**: Add a new top-level feature (e.g. "Analytics") that appears in the sidebar.

**Step 1** — Create the plugin package

```
plugins/
  core-analytics/
    package.json
    tsconfig.json
    src/
      frontend/
        analytics-page.tsx
        index.ts
      index.ts
```

**Step 2** — Write `package.json`

```json
{
  "name": "@rahataid/plugin-core-analytics",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    "./frontend": {
      "import": "./src/frontend/index.ts",
      "types": "./src/frontend/index.ts"
    }
  },
  "dependencies": {
    "@rahataid/plugin-sdk": "workspace:*"
  }
}
```

**Step 3** — Write the page component

```typescript
// plugins/core-analytics/src/frontend/analytics-page.tsx
import * as React from 'react'

export function AnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      {/* your UI here */}
    </div>
  )
}
```

**Step 4** — Define the plugin object

```typescript
// plugins/core-analytics/src/frontend/index.ts
import type { AppFrontendPlugin } from '@rahataid/plugin-sdk'
import { AnalyticsPage } from './analytics-page.js'

export const AnalyticsFrontendPlugin: AppFrontendPlugin = {
  id: 'analytics',
  label: 'Analytics',
  description: 'Detailed analytics and impact metrics.',
  icon: 'LineChart',        // any Lucide icon name
  group: 'core',
  route: '/analytics',
  PageComponent: AnalyticsPage,
}
```

**Step 5** — Create the route file

```typescript
// apps/web/src/routes/_app.analytics.tsx
import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { getAppPlugin } from '../plugins'
import { PluginGate } from '../components/plugin-gate'

export const Route = createFileRoute('/_app/analytics')({
  component: () => {
    const plugin = getAppPlugin('analytics')
    const Page = plugin?.PageComponent as React.ComponentType | undefined
    return (
      <PluginGate pluginId="analytics">
        {Page ? <Page /> : null}
      </PluginGate>
    )
  },
})
```

**Step 6** — Register the plugin

```typescript
// apps/web/src/plugins/index.ts — add these two lines:
import { AnalyticsFrontendPlugin } from '@rahataid/plugin-core-analytics/frontend'
// …
registerAppPlugin(AnalyticsFrontendPlugin)
```

**Step 7** — Add the package to `pnpm-workspace.yaml` (if not covered by glob)

Done. The sidebar will now show an Analytics icon that routes to `/analytics`, and users can toggle it on/off from the Plugins page.

---

### 16.2 Creating a New Project Plugin

**Goal**: Add a new project type (e.g. "Emergency Response").

**Step 1** — Add the project type to the SDK

```typescript
// packages/plugin-sdk/src/index.ts
export const PROJECT_TYPES = {
  // … existing types …
  EMERGENCY_RESPONSE: 'EMERGENCY_RESPONSE',
} as const
```

**Step 2** — Create the project package

```
projects/
  emergency-response/
    package.json
    tsconfig.json
    src/
      frontend/
        setup-page.tsx
        dashboard.tsx
        index.ts
      index.ts             ← backend plugin (if needed)
```

**Step 3** — Write `package.json`

```json
{
  "name": "@rahataid/plugin-project-emergency-response",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    "./frontend": {
      "import": "./src/frontend/index.ts",
      "types": "./src/frontend/index.ts"
    }
  },
  "dependencies": {
    "@rahataid/plugin-sdk": "workspace:*"
  }
}
```

**Step 4** — Write the setup page

```typescript
// projects/emergency-response/src/frontend/setup-page.tsx
import * as React from 'react'
import type { SetupPageProps } from '@rahataid/plugin-sdk'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  disasterType: z.string().min(1, 'Disaster type is required'),
})

type FormValues = z.infer<typeof schema>

export function EmergencyResponseSetupPage({ onSubmit }: SetupPageProps) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  return (
    <form onSubmit={form.handleSubmit((v) => onSubmit({ name: v.name, disasterType: v.disasterType }))}>
      <input {...form.register('name')} placeholder="Project name" />
      <input {...form.register('disasterType')} placeholder="Disaster type" />
      <button type="submit">Create Project</button>
    </form>
  )
}
```

**Step 5** — Write the dashboard

```typescript
// projects/emergency-response/src/frontend/dashboard.tsx
import * as React from 'react'
import type { DashboardPageProps } from '@rahataid/plugin-sdk'

export function EmergencyResponseDashboard({ project, onEdit, mapSlot }: DashboardPageProps) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <button onClick={onEdit}>Edit</button>
      </div>
      {mapSlot}
    </div>
  )
}
```

**Step 6** — Define the plugin object

```typescript
// projects/emergency-response/src/frontend/index.ts
import type { ProjectFrontendPlugin } from '@rahataid/plugin-sdk'
import { PROJECT_TYPES } from '@rahataid/plugin-sdk'
import { EmergencyResponseSetupPage } from './setup-page.js'
import { EmergencyResponseDashboard } from './dashboard.js'

export const EmergencyResponseFrontendPlugin: ProjectFrontendPlugin = {
  projectType: PROJECT_TYPES.EMERGENCY_RESPONSE,
  label: 'Emergency Response',
  description: 'Coordinate rapid emergency aid distribution',
  icon: 'AlertTriangle',
  menuItems: [
    { type: 'link', label: 'Beneficiaries', href: '/projects/:projectId/beneficiaries' },
    { type: 'link', label: 'Benefits',      href: '/projects/:projectId/benefits', requiredPluginGroup: 'benefits' },
    { type: 'link', label: 'Tasks',         href: '/projects/:projectId/tasks' },
    { type: 'link', label: 'Reports',       href: '/projects/:projectId/reports' },
  ],
  SetupPage: EmergencyResponseSetupPage,
  DashboardPage: EmergencyResponseDashboard,
}
```

**Step 7** — Register the plugin

```typescript
// apps/web/src/plugins/index.ts
import { EmergencyResponseFrontendPlugin } from '@rahataid/plugin-project-emergency-response/frontend'
// …
registerPlugin(EmergencyResponseFrontendPlugin)
```

---

### 16.3 Creating a New Benefit Type Plugin

**Goal**: Add a "Shelter" benefit type.

```
plugins/
  benefits-shelter/
    package.json
    tsconfig.json
    src/
      index.ts
```

```typescript
// plugins/benefits-shelter/src/index.ts
import { Home } from 'lucide-react'
import { registerBenefitType } from '@rahataid/projects-shared/benefits'
import type { BenefitFrontendPlugin } from '@rahataid/projects-shared/benefits'

const benefitsShelterPlugin: BenefitFrontendPlugin = {
  type: 'Shelter',
  label: 'Shelter',
  description: 'Emergency shelter kits and materials',
  group: 'benefits',
  IconComponent: Home,
  color: 'text-amber-600',
  bg: 'bg-amber-100',
}

registerBenefitType(benefitsShelterPlugin)
```

```typescript
// apps/web/src/plugins/index.ts — add:
import '@rahataid/plugin-benefits-shelter'
```

---

### 16.4 Creating a New Communication Type Plugin

**Goal**: Add an "Email" communication channel.

```
plugins/
  comms-email/
    src/
      email-details.tsx   ← config form
      index.ts
```

```typescript
// plugins/comms-email/src/email-details.tsx
import * as React from 'react'
import type { CommDetailsProps } from '@rahataid/projects-shared/communication'

export function EmailDetails({ data, onChange }: CommDetailsProps) {
  return (
    <div>
      <input
        value={typeof data.subject === 'string' ? data.subject : ''}
        onChange={(e) => onChange({ ...data, subject: e.target.value })}
        placeholder="Subject"
      />
      <textarea
        value={typeof data.body === 'string' ? data.body : ''}
        onChange={(e) => onChange({ ...data, body: e.target.value })}
        placeholder="Email body"
      />
    </div>
  )
}
```

```typescript
// plugins/comms-email/src/index.ts
import { Mail } from 'lucide-react'
import { registerCommType, CAMPAIGN_SEND_EVENT } from '@rahataid/projects-shared/communication'
import type { CommFrontendPlugin, CampaignSendEventDetail } from '@rahataid/projects-shared/communication'
import { EmailDetails } from './email-details.js'

const commsEmailPlugin: CommFrontendPlugin = {
  type: 'email',
  label: 'Email',
  description: 'Send email messages to beneficiaries',
  group: 'comms',
  IconComponent: Mail,
  DetailsComponent: EmailDetails,
  canAdvance: (data) =>
    typeof data.subject === 'string' && data.subject.trim().length > 0 &&
    typeof data.body === 'string' && data.body.trim().length > 0,
}

registerCommType(commsEmailPlugin)

// Handle the send event
if (typeof window !== 'undefined') {
  window.addEventListener(CAMPAIGN_SEND_EVENT, async (e: Event) => {
    const { campaign } = (e as CustomEvent<CampaignSendEventDetail>).detail
    if (campaign.type !== 'email') return
    // call your email API here …
  })
}
```

```typescript
// apps/web/src/plugins/index.ts — add:
import '@rahataid/plugin-comms-email'
```

---

### 16.5 Creating a New Task Type Plugin

**Goal**: Add a "Push Notification" task type.

```
plugins/
  task-push/
    src/
      push-designer.tsx
      index.ts
```

```typescript
// plugins/task-push/src/push-designer.tsx
import * as React from 'react'
import type { DesignerProps } from '@rahataid/projects-shared/task-management'

export function PushDesigner({ task, onUpdate }: DesignerProps) {
  const title = typeof task.designerData?.title === 'string' ? task.designerData.title : ''

  return (
    <div>
      <input
        value={title}
        onChange={(e) => onUpdate({ ...task.designerData, title: e.target.value })}
        placeholder="Notification title"
      />
    </div>
  )
}
```

```typescript
// plugins/task-push/src/index.ts
import { Bell } from 'lucide-react'
import { registerTaskType } from '@rahataid/projects-shared/task-management'
import type { TaskFrontendPlugin } from '@rahataid/projects-shared/task-management'
import { PushDesigner } from './push-designer.js'

const taskPushPlugin: TaskFrontendPlugin = {
  type: 'push-notification',
  label: 'Push Notification',
  description: 'Send push notifications to beneficiaries.',
  icon: 'Bell',
  group: 'task',
  designerTabLabel: 'Notification',
  designer: PushDesigner,
}

registerTaskType(taskPushPlugin)
```

```typescript
// apps/web/src/plugins/index.ts — add:
import '@rahataid/plugin-task-push'
```

---

## 17. Package Naming Conventions

| Plugin Type | Package Name Pattern | Example |
|---|---|---|
| App / Core plugin | `@rahataid/plugin-core-{name}` | `@rahataid/plugin-core-analytics` |
| Project plugin | `@rahataid/plugin-project-{type}` | `@rahataid/plugin-project-emergency-response` |
| Benefit type plugin | `@rahataid/plugin-benefits-{type}` | `@rahataid/plugin-benefits-shelter` |
| Comm type plugin | `@rahataid/plugin-comms-{channel}` | `@rahataid/plugin-comms-email` |
| Task type plugin | `@rahataid/plugin-task-{type}` | `@rahataid/plugin-task-push` |

---

## 18. File Structure Reference

### App Plugin (Core)

```
plugins/core-{name}/
├── package.json             ← name: @rahataid/plugin-core-{name}
├── tsconfig.json
└── src/
    ├── frontend/
    │   ├── {name}-page.tsx  ← React page component
    │   └── index.ts         ← exports AppFrontendPlugin object
    └── index.ts             ← re-exports frontend (optional)
```

### Project Plugin

```
projects/{type}/
├── package.json             ← name: @rahataid/plugin-project-{type}
├── tsconfig.json
└── src/
    ├── frontend/
    │   ├── setup-page.tsx   ← implements SetupPageProps
    │   ├── dashboard.tsx    ← implements DashboardPageProps
    │   └── index.ts         ← exports ProjectFrontendPlugin object
    └── index.ts             ← exports ProjectBackendPlugin (NestJS module)
```

### Benefit / Comm / Task Type Plugin

```
plugins/{category}-{type}/
├── package.json
├── tsconfig.json
└── src/
    ├── {type}-details.tsx   ← optional UI component (for comms/tasks)
    └── index.ts             ← defines + calls register*() immediately
```

### Host-Side Wiring

```
apps/web/src/plugins/
├── registry.ts       ← project plugin array + get/register functions
├── app-registry.ts   ← app plugin array + get/register functions
├── plugin-state.ts   ← localStorage enable/disable + custom event
└── index.ts          ← imports everything, calls register*()
```

---

## 19. Common Mistakes

| Mistake | Fix |
|---|---|
| Adding a new plugin but not importing it in `apps/web/src/plugins/index.ts` | Always add the import + registration call there |
| Adding a new project type string locally instead of in `packages/plugin-sdk/src/index.ts` | Add to `PROJECT_TYPES` in the SDK; it is the single source of truth |
| Using `export default` instead of a named export for plugin objects | Always use named exports: `export const MyPlugin = { … }` |
| Forgetting `.js` extensions in imports within packages | ESM packages require explicit `.js` extensions even for `.ts` source files |
| Calling `registerBenefitType()` / `registerCommType()` in the app instead of in the plugin | The plugin self-registers; the app only does a side-effect import |
| Creating a route file but not wrapping in `<PluginGate>` | All plugin routes must use `<PluginGate pluginId="…">` so users can disable them |
| Using `id` different from the route in `isPluginEnabled` check | The `id` in `AppFrontendPlugin` is the same `id` passed to `<PluginGate pluginId>` and to `setPluginEnabled` |
| Accessing `plugin?.DashboardPage` as a function without casting | Cast to `React.ComponentType<DashboardPageProps>` before calling as JSX |
| Accessing `b.pii.name` in project dashboard without null guard | Always use `b.pii?.name ?? ''` — `pii` can be null |
| Defining TypeScript types locally that already exist in `@rahataid/plugin-sdk` | Import from the SDK; never duplicate interface definitions |

---

*This document covers the complete Rahat frontend plugin architecture as of the `Components-Refactor` branch. For backend NestJS module integration details, see `apps/api/src/` and the individual project `src/index.ts` backend exports.*
