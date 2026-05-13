# HLB Plugin Architecture — Setup Guide

This guide explains how to refactor the **Hamro Life Bank (HLB)** project into a plugin-based architecture,
where `donor` and `bids` are separate, independent plugins that each contribute their own navigation and pages.

---

## What Changes vs What Stays the Same

This is the most important section. Read it before doing anything else.

### NOTHING inside `components/` changes

Every file below is **left exactly as-is**. You do not touch them.

```
apps/web/components/
├── ui/                          ✅ NO CHANGE — shared shadcn/ui components
├── theme-provider.tsx           ✅ NO CHANGE
├── auth-guard.tsx               ✅ NO CHANGE
├── dashboard/
│   ├── dashboard-content.tsx    ✅ NO CHANGE
│   ├── blood-inventory-chart.tsx ✅ NO CHANGE
│   ├── follow-up-panel.tsx      ✅ NO CHANGE
│   ├── kpi-cards.tsx            ✅ NO CHANGE
│   ├── quick-actions.tsx        ✅ NO CHANGE
│   └── recent-requests.tsx      ✅ NO CHANGE
├── donors/
│   ├── donors-content.tsx       ✅ NO CHANGE
│   ├── blocked-donors-content.tsx ✅ NO CHANGE
│   ├── unverified-donors-content.tsx ✅ NO CHANGE
│   ├── pledges-content.tsx      ✅ NO CHANGE
│   ├── donor-filters.tsx        ✅ NO CHANGE
│   ├── donor-grid.tsx           ✅ NO CHANGE
│   └── new-donor-dialog.tsx     ✅ NO CHANGE
├── hospitals/
│   └── hospitals-content.tsx    ✅ NO CHANGE
├── requests/
│   ├── requests-content.tsx     ✅ NO CHANGE
│   ├── request-card.tsx         ✅ NO CHANGE
│   ├── request-filters.tsx      ✅ NO CHANGE
│   ├── new-request-dialog.tsx   ✅ NO CHANGE
│   └── intelligence-panel.tsx   ✅ NO CHANGE
├── feedback/
│   └── feedback-content.tsx     ✅ NO CHANGE
├── reports/
│   └── reports-content.tsx      ✅ NO CHANGE
├── admin/
│   ├── admin-content.tsx        ✅ NO CHANGE
│   ├── roles-content.tsx        ✅ NO CHANGE
│   └── settings-content.tsx     ✅ NO CHANGE
│
│   ── NEW files added (do not modify the above, just add these):
├── app-shell.tsx                ⚠️  MODIFIED — 3 small additions (see Step 8)
├── plugin-manager-panel.tsx     🆕 NEW FILE
└── plugin-disabled-message.tsx  🆕 NEW FILE
```

### NOTHING inside `app/` page files changes their content

Every page file keeps its existing content (the `<AuthGuard>` + `<AppShell>` + `<XxxContent />` pattern).
**Only one small guard is added at the very top** of plugin-owned pages (4 lines, see Step 9).

```
apps/web/app/
├── globals.css                  ✅ NO CHANGE
├── layout.tsx                   ⚠️  MODIFIED — add PluginStoreProvider wrapper (see Step 10)
├── page.tsx                     ✅ NO CHANGE — Dashboard, not owned by any plugin
├── login/
│   └── page.tsx                 ✅ NO CHANGE — auth page, not owned by any plugin
├── admin/
│   ├── page.tsx                 ✅ NO CHANGE — Administration, not owned by any plugin
│   ├── roles/page.tsx           ✅ NO CHANGE
│   └── settings/page.tsx        ✅ NO CHANGE
│
│   ── Plugin-owned pages (add 4-line guard at top only):
├── donors/
│   ├── page.tsx                 ⚠️  +4 lines at top — guard for 'donor' plugin
│   ├── blocked/page.tsx         ⚠️  +4 lines at top — guard for 'donor' plugin
│   ├── unverified/page.tsx      ⚠️  +4 lines at top — guard for 'donor' plugin
│   └── pledges/page.tsx         ⚠️  +4 lines at top — guard for 'donor' plugin
├── hospitals/
│   └── page.tsx                 ⚠️  +4 lines at top — guard for 'bids' plugin
├── requests/
│   └── page.tsx                 ⚠️  +4 lines at top — guard for 'bids' plugin
├── reports/
│   └── page.tsx                 ⚠️  +4 lines at top — guard for 'bids' plugin
└── feedback/
    └── page.tsx                 ⚠️  +4 lines at top — guard for 'bids' plugin
```

### Summary of all file changes

| File | Action | Why |
|---|---|---|
| `components/app-shell.tsx` | Modify (3 additions) | Read enabled plugins, inject nav, add Plugins footer button |
| `app/layout.tsx` | Modify (wrap with provider) | Supply toggle state to the whole app |
| `app/donors/page.tsx` + 3 sub-pages | Modify (add 4-line guard) | Show "Plugin disabled" when donor plugin is off |
| `app/hospitals/page.tsx` | Modify (add 4-line guard) | Show "Plugin disabled" when bids plugin is off |
| `app/requests/page.tsx` | Modify (add 4-line guard) | Show "Plugin disabled" when bids plugin is off |
| `app/reports/page.tsx` | Modify (add 4-line guard) | Show "Plugin disabled" when bids plugin is off |
| `app/feedback/page.tsx` | Modify (add 4-line guard) | Show "Plugin disabled" when bids plugin is off |
| `components/plugin-manager-panel.tsx` | **Create new** | Toggle switch UI panel |
| `components/plugin-disabled-message.tsx` | **Create new** | "Plugin off" placeholder |
| `lib/plugins/registry.ts` | **Create new** | In-memory plugin store |
| `lib/plugins/index.ts` | **Create new** | Register all plugins |
| `lib/plugins/plugin-store.tsx` | **Create new** | React context + localStorage |
| `plugins/donor/src/index.ts` | **Create new** | Donor plugin definition |
| `plugins/bids/src/index.ts` | **Create new** | BIDS plugin definition |
| `packages/sdk/src/index.ts` | Modify (add types) | Add HlbPlugin + NavItem types |
| `pnpm-workspace.yaml` | Modify (add line) | Include plugins/* packages |
| `apps/web/package.json` | Modify (add deps) | Depend on plugin packages |

Everything else — all component files, all UI files, all hooks, queries, services, types, utils — **untouched**.

---

## Project Structure (Target)

```
hlb/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── layout.tsx                  ← add PluginStoreProvider wrapper
│       │   ├── page.tsx                    ← NO CHANGE (Dashboard)
│       │   ├── login/page.tsx              ← NO CHANGE
│       │   ├── admin/                      ← NO CHANGE (Administration)
│       │   ├── donors/                     ← +4-line guard per page
│       │   ├── hospitals/page.tsx          ← +4-line guard
│       │   ├── requests/page.tsx           ← +4-line guard
│       │   ├── reports/page.tsx            ← +4-line guard
│       │   └── feedback/page.tsx           ← +4-line guard
│       ├── components/
│       │   ├── app-shell.tsx               ← 3 small additions
│       │   ├── plugin-manager-panel.tsx    ← NEW
│       │   ├── plugin-disabled-message.tsx ← NEW
│       │   ├── dashboard/                  ← NO CHANGE
│       │   ├── donors/                     ← NO CHANGE
│       │   ├── hospitals/                  ← NO CHANGE
│       │   ├── requests/                   ← NO CHANGE
│       │   ├── reports/                    ← NO CHANGE
│       │   ├── feedback/                   ← NO CHANGE
│       │   ├── admin/                      ← NO CHANGE
│       │   └── ui/                         ← NO CHANGE
│       └── lib/
│           └── plugins/
│               ├── index.ts                ← NEW — single wiring point
│               ├── registry.ts             ← NEW — in-memory store
│               └── plugin-store.tsx        ← NEW — React context + localStorage
├── packages/
│   └── sdk/
│       └── src/
│           └── index.ts                    ← add HlbPlugin + NavItem types
├── plugins/
│   ├── donor/                              ← NEW package
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/index.ts
│   └── bids/                               ← NEW package
│       ├── package.json
│       ├── tsconfig.json
│       └── src/index.ts
├── pnpm-workspace.yaml                     ← add plugins/* line
└── package.json
```

---

## Step 1 — Add Plugin Types to the SDK

**File:** `packages/sdk/src/index.ts` — **add** these types (keep anything already there)

```ts
export interface NavItem {
  label: string        // Display name in the sidebar
  href: string         // Next.js route path
  icon?: string        // Lucide icon name as a string, e.g. 'Users', 'Building2'
  badge?: number       // Optional badge count (like the existing badge: 5 on Requests)
  children?: {         // Nested nav items — maps to existing Collapsible groups
    label: string
    href: string
    icon?: string
  }[]
}

export interface HlbPlugin {
  id: string           // Unique key, e.g. 'donor', 'bids'
  label: string        // Shown as group heading and in Plugin Manager panel
  description?: string // Short description in Plugin Manager panel
  icon?: string        // Lucide icon name for the Plugin Manager panel row
  group: string        // Nav grouping key
  navItems: NavItem[]  // Navigation items this plugin contributes to the sidebar
}
```

---

## Step 2 — Create the Donor Plugin

### `plugins/donor/package.json`

```json
{
  "name": "@hlb/plugin-donor",
  "version": "0.1.0",
  "private": true,
  "exports": { ".": "./src/index.ts" },
  "dependencies": { "@hlb/sdk": "workspace:*" }
}
```

### `plugins/donor/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "react-jsx",
    "esModuleInterop": true
  }
}
```

### `plugins/donor/src/index.ts`

This exactly mirrors the **Donors List** and **Unverified Donors** collapsible groups
that already exist in `app-shell.tsx`.

```ts
import type { HlbPlugin } from '@hlb/sdk'

export const DonorPlugin: HlbPlugin = {
  id: 'donor',
  label: 'Donor Management',
  description: 'Manage blood donors, pledges, and verifications',
  icon: 'Users',
  group: 'donor',
  navItems: [
    {
      label: 'Donors List',
      href: '/donors',
      icon: 'Users',
      children: [
        { label: 'Active Donors',  href: '/donors',         icon: 'Users' },
        { label: 'Blocked Donors', href: '/donors/blocked', icon: 'Ban'   },
      ],
    },
    {
      label: 'Unverified Donors',
      href: '/donors/unverified',
      icon: 'PlusCircle',
      children: [
        { label: 'Unverified Donors List', href: '/donors/unverified', icon: 'Users' },
        { label: 'Pledges From Hotline',   href: '/donors/pledges',   icon: 'Globe' },
      ],
    },
  ],
}
```

---

## Step 3 — Create the BIDS Plugin

### `plugins/bids/package.json`

```json
{
  "name": "@hlb/plugin-bids",
  "version": "0.1.0",
  "private": true,
  "exports": { ".": "./src/index.ts" },
  "dependencies": { "@hlb/sdk": "workspace:*" }
}
```

### `plugins/bids/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "react-jsx",
    "esModuleInterop": true
  }
}
```

### `plugins/bids/src/index.ts`

This exactly mirrors the **Request**, **Hospitals**, **Reports**, and **Patient Feedback List**
items that already exist in `app-shell.tsx`.

```ts
import type { HlbPlugin } from '@hlb/sdk'

export const BidsPlugin: HlbPlugin = {
  id: 'bids',
  label: 'BIDS Management',
  description: 'Hospitals, blood requests, reports, and patient feedback',
  icon: 'Building2',
  group: 'bids',
  navItems: [
    { label: 'Request',               href: '/requests',  icon: 'FileText',     badge: 5 },
    { label: 'Hospitals',             href: '/hospitals', icon: 'Building2'               },
    { label: 'Reports',               href: '/reports',   icon: 'BarChart3'               },
    { label: 'Patient Feedback List', href: '/feedback',  icon: 'MessageSquare'           },
  ],
}
```

---

## Step 4 — Create the Plugin Registry

### `apps/web/lib/plugins/registry.ts` — NEW FILE

```ts
import type { HlbPlugin } from '@hlb/sdk'

const plugins: HlbPlugin[] = []

export function registerPlugin(plugin: HlbPlugin): void {
  if (plugins.find((p) => p.id === plugin.id)) return
  plugins.push(plugin)
}

export function getRegisteredPlugins(): HlbPlugin[] {
  return plugins
}

export function getPlugin(id: string): HlbPlugin | undefined {
  return plugins.find((p) => p.id === id)
}
```

### `apps/web/lib/plugins/index.ts` — NEW FILE

Adding a new plugin in the future only requires a change here.

```ts
import { DonorPlugin } from '@hlb/plugin-donor'
import { BidsPlugin }  from '@hlb/plugin-bids'
import { registerPlugin } from './registry'

registerPlugin(DonorPlugin)
registerPlugin(BidsPlugin)

export { getRegisteredPlugins, getPlugin } from './registry'
```

---

## Step 5 — Plugin Enable/Disable State

### `apps/web/lib/plugins/plugin-store.tsx` — NEW FILE

Stores which plugins are enabled. Default: all on. Persisted to `localStorage`.

```tsx
'use client'

import {
  createContext, useContext, useState, useEffect, type ReactNode,
} from 'react'

const STORAGE_KEY = 'hlb:plugins:enabled'

interface PluginStoreContextValue {
  enabledPlugins: string[]
  togglePlugin: (id: string) => void
  isEnabled: (id: string) => boolean
}

const PluginStoreContext = createContext<PluginStoreContextValue | null>(null)

export function PluginStoreProvider({
  allPluginIds,
  children,
}: {
  allPluginIds: string[]
  children: ReactNode
}) {
  const [enabledPlugins, setEnabledPlugins] = useState<string[]>(allPluginIds)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setEnabledPlugins(JSON.parse(stored))
    } catch {
      // ignore corrupt storage
    }
  }, [])

  const togglePlugin = (id: string) => {
    setEnabledPlugins((prev) => {
      const next = prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const isEnabled = (id: string) => enabledPlugins.includes(id)

  return (
    <PluginStoreContext.Provider value={{ enabledPlugins, togglePlugin, isEnabled }}>
      {children}
    </PluginStoreContext.Provider>
  )
}

export function usePluginStore() {
  const ctx = useContext(PluginStoreContext)
  if (!ctx) throw new Error('usePluginStore must be used inside PluginStoreProvider')
  return ctx
}
```

---

## Step 6 — Plugin Manager Panel

### `apps/web/components/plugin-manager-panel.tsx` — NEW FILE

A slide-over `Sheet` opened from a **Puzzle** icon at the bottom of the sidebar.
Each plugin row has a `Switch` toggle.

```tsx
'use client'

import { Puzzle } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import { usePluginStore } from '@/lib/plugins/plugin-store'
import type { HlbPlugin } from '@hlb/sdk'

interface Props {
  plugins: HlbPlugin[]
}

export function PluginManagerPanel({ plugins }: Props) {
  const { isEnabled, togglePlugin } = usePluginStore()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                     text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                     transition-all duration-200"
          title="Manage Plugins"
        >
          <Puzzle className="h-5 w-5" />
          Plugins
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Puzzle className="h-5 w-5" />
            Plugin Manager
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {plugins.map((plugin) => {
            const PluginIcon = plugin.icon
              ? (Icons[plugin.icon as keyof typeof Icons] as React.ElementType)
              : Puzzle
            const enabled = isEnabled(plugin.id)

            return (
              <div
                key={plugin.id}
                className="flex items-start justify-between gap-4 rounded-lg border p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-muted p-1.5">
                    <PluginIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{plugin.label}</p>
                    {plugin.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {plugin.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {plugin.navItems.length} nav item{plugin.navItems.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={() => togglePlugin(plugin.id)}
                  aria-label={`Toggle ${plugin.label}`}
                />
              </div>
            )
          })}
        </div>

        <p className="mt-6 text-xs text-muted-foreground px-1">
          Disabling a plugin hides its sidebar navigation. Its pages show a
          "Plugin disabled" message instead of content.
        </p>
      </SheetContent>
    </Sheet>
  )
}
```

---

## Step 7 — Plugin Disabled Message Component

### `apps/web/components/plugin-disabled-message.tsx` — NEW FILE

```tsx
import { Puzzle } from 'lucide-react'

interface Props {
  pluginLabel: string
  pluginId: string
}

export function PluginDisabledMessage({ pluginLabel }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-muted-foreground">
      <Puzzle className="h-12 w-12 opacity-30" />
      <div className="text-center">
        <p className="text-lg font-medium">Plugin Disabled</p>
        <p className="text-sm mt-1">
          The <strong>{pluginLabel}</strong> plugin is currently disabled.
        </p>
        <p className="text-xs mt-1">
          Enable it from the{' '}
          <span className="font-medium text-foreground">Plugins</span> panel in the sidebar.
        </p>
      </div>
    </div>
  )
}
```

---

## Step 8 — Modify App Shell (3 additions only)

**File:** `apps/web/components/app-shell.tsx`

The existing component keeps everything — the `NavItemComponent`, collapsibles,
badges, active states, header, mobile sheet, notifications dropdown, user menu.
**Three additions only:**

### Addition A — New imports (add near the top with other imports)

```tsx
import { usePluginStore } from '@/lib/plugins/plugin-store'
import { PluginManagerPanel } from '@/components/plugin-manager-panel'
import type { HlbPlugin } from '@hlb/sdk'
import * as Icons from 'lucide-react'
```

### Addition B — Update the component signature to accept `plugins` prop

Change:
```tsx
export function AppShell({ children }: { children: React.ReactNode }) {
```

To:
```tsx
export function AppShell({
  children,
  plugins = [],
}: {
  children: React.ReactNode
  plugins?: HlbPlugin[]
}) {
```

Then inside the component body, add this block right after the existing hooks (after `usePathname`, `useRouter`, `useAuth`, etc.):

```tsx
const { isEnabled } = usePluginStore()

// Helper: resolve Lucide icon name string → component
function resolveIcon(name?: string): React.ComponentType<{ className?: string }> {
  if (!name) return Users  // fallback
  return (Icons as Record<string, unknown>)[name] as React.ComponentType<{ className?: string }> ?? Users
}

// Build plugin nav items in the same NavItem shape the existing component already uses
const pluginNavItems: NavItem[] = plugins
  .filter((p) => isEnabled(p.id))
  .flatMap((p) =>
    p.navItems.map((item) => ({
      name: item.label,
      href: item.href,
      icon: resolveIcon(item.icon),
      badge: item.badge,
      adminOnly: false,
      children: item.children?.map((c) => ({
        name: c.label,
        href: c.href,
        icon: resolveIcon(c.icon),
      })),
    }))
  )

// Merge: Dashboard first, then plugin items, then Administration last
// (Split the existing 'navigation' array: first item = Dashboard, last = Administration)
const baseStart = navigation.slice(0, 1)      // [Dashboard]
const baseEnd   = navigation.slice(-1)         // [Administration]
const finalNav  = [...baseStart, ...pluginNavItems, ...baseEnd]
```

Replace the `navigation.map(...)` in the sidebar JSX with `finalNav.map(...)`.
Do the same inside the mobile `<Sheet>` sidebar if it also maps over `navigation`.

### Addition C — Add Plugins button in sidebar footer

Find the closing of the sidebar `<div>` (just before the `</aside>` or the closing sidebar wrapper),
and add this block:

```tsx
{/* Sidebar footer — Plugin Manager trigger */}
<div className="mt-auto border-t border-sidebar-border pt-3">
  <PluginManagerPanel plugins={plugins} />
</div>
```

---

## Step 9 — Add Plugin Guard to Plugin-Owned Pages

This is the **only change** to the page files. Add 4 lines at the very top of the component,
before any existing return statement. The rest of each page file stays identical.

### Donor pages — guard with `'donor'`

```tsx
// Add at the top of the default export function in:
// app/donors/page.tsx
// app/donors/blocked/page.tsx
// app/donors/unverified/page.tsx
// app/donors/pledges/page.tsx

'use client'
import { usePluginStore } from '@/lib/plugins/plugin-store'
import { PluginDisabledMessage } from '@/components/plugin-disabled-message'

export default function DonorsPage() {        // (name differs per file)
  const { isEnabled } = usePluginStore()
  if (!isEnabled('donor')) {
    return <PluginDisabledMessage pluginId="donor" pluginLabel="Donor Management" />
  }

  // ↓ EVERYTHING BELOW THIS LINE IS UNCHANGED ↓
  return (
    <AuthGuard>
      <AppShell>
        <DonorsContent />
      </AppShell>
    </AuthGuard>
  )
}
```

### BIDS pages — guard with `'bids'`

```tsx
// Add at the top of the default export function in:
// app/hospitals/page.tsx
// app/requests/page.tsx
// app/reports/page.tsx
// app/feedback/page.tsx

  const { isEnabled } = usePluginStore()
  if (!isEnabled('bids')) {
    return <PluginDisabledMessage pluginId="bids" pluginLabel="BIDS Management" />
  }

  // ↓ EVERYTHING BELOW THIS LINE IS UNCHANGED ↓
```

### Pages that do NOT get a guard (always visible)

| Page | Reason |
|---|---|
| `app/page.tsx` (Dashboard) | Not owned by any plugin |
| `app/login/page.tsx` | Auth page, never plugin-controlled |
| `app/admin/page.tsx` | Administration, not owned by any plugin |
| `app/admin/roles/page.tsx` | Same |
| `app/admin/settings/page.tsx` | Same |

---

## Step 10 — Modify Root Layout

**File:** `apps/web/app/layout.tsx`

The existing layout already has `GoogleOAuthProvider`, `AuthProvider`, `BloodBankProvider`.
Add two things:

1. Import the plugin bootstrap and `PluginStoreProvider`
2. Wrap children with `PluginStoreProvider`

```tsx
// Add these imports at the top:
import '@/lib/plugins'                              // boots plugin registration
import { getRegisteredPlugins } from '@/lib/plugins'
import { PluginStoreProvider } from '@/lib/plugins/plugin-store'

// In the RootLayout function, add before the return:
const plugins = getRegisteredPlugins()
const allPluginIds = plugins.map((p) => p.id)

// Wrap the existing providers — add PluginStoreProvider as the innermost wrapper
// (inside BloodBankProvider, wrapping {children}):

<BloodBankProvider>
  <PluginStoreProvider allPluginIds={allPluginIds}>
    {children}
    {process.env.NODE_ENV === 'production' && <Analytics />}
  </PluginStoreProvider>
</BloodBankProvider>
```

---

## Step 11 — Update pnpm Workspace

**File:** `pnpm-workspace.yaml` — add `plugins/*`

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'plugins/*'
  - 'tooling/*'
```

---

## Step 12 — Add Plugin Dependencies to Web App

**File:** `apps/web/package.json` — add to `dependencies`

```json
{
  "dependencies": {
    "@hlb/plugin-donor": "workspace:*",
    "@hlb/plugin-bids":  "workspace:*"
  }
}
```

Then run:

```bash
pnpm install
```

---

## How It All Connects (Data Flow)

```
App boot
 └── app/layout.tsx
      ├── import '@/lib/plugins'
      │    └── registerPlugin(DonorPlugin) + registerPlugin(BidsPlugin)
      │
      ├── getRegisteredPlugins() → [DonorPlugin, BidsPlugin]
      │
      └── <PluginStoreProvider allPluginIds={['donor','bids']}>   ← NEW wrapper
           └── existing providers (GoogleOAuth, Auth, BloodBank) stay unchanged
                └── {children}  →  page files render as before
                     │
                     └── app/donors/page.tsx
                          ├── usePluginStore().isEnabled('donor')
                          │    ├── true  → renders <AuthGuard><AppShell><DonorsContent /></AppShell></AuthGuard>
                          │    └── false → renders <PluginDisabledMessage>
                          │
                          └── <AppShell plugins={[DonorPlugin, BidsPlugin]}>
                               ├── reads isEnabled('donor') + isEnabled('bids')
                               ├── sidebar = Dashboard + enabled plugin nav items + Administration
                               └── sidebar footer = <PluginManagerPanel> (Puzzle icon)
                                    └── Sheet with Switch per plugin
                                         └── toggle → updates localStorage + React state
                                              └── sidebar re-renders immediately
```

---

## UI Behaviour Summary

| User action | Result |
|---|---|
| App first loads | Both plugins ON; sidebar looks exactly like today |
| Click **Plugins** button in sidebar footer | Slide-over panel opens with Donor Management + BIDS Management rows |
| Toggle **Donor Management** OFF | Donors List + Unverified Donors collapsible groups disappear from sidebar |
| Visit `/donors` while donor OFF | Page shows "Plugin Disabled" message instead of donor list |
| Visit `/donors/blocked` while donor OFF | Same "Plugin Disabled" message |
| Toggle **Donor Management** back ON | Nav reappears; `/donors` shows donors again |
| Toggle **BIDS Management** OFF | Request, Hospitals, Reports, Feedback disappear from sidebar |
| Page refresh | Toggle state restored from `localStorage` — no flash |
| Dashboard, Login, Admin pages | Always visible — not affected by any plugin toggle |
| All `components/` files | Never touched — all UI components stay exactly the same |

---

## Adding a New Plugin Later

**4 steps only:**

**1.** Create `plugins/myplugin/src/index.ts` with an `HlbPlugin` export.

**2.** Add `"@hlb/plugin-myplugin": "workspace:*"` to `apps/web/package.json`.

**3.** Register in `apps/web/lib/plugins/index.ts`:
```ts
import { MyPlugin } from '@hlb/plugin-myplugin'
registerPlugin(MyPlugin)
```

**4.** Add the 4-line guard to any page the plugin owns.

Sidebar and Plugin Manager update automatically. No other files touched.

---

## Key Files Reference

| File | Status | Purpose |
|---|---|---|
| `packages/sdk/src/index.ts` | Modify | Add `HlbPlugin` + `NavItem` types |
| `plugins/donor/src/index.ts` | Create | Donor nav items (mirrors existing sidebar) |
| `plugins/bids/src/index.ts` | Create | BIDS nav items (mirrors existing sidebar) |
| `lib/plugins/registry.ts` | Create | In-memory plugin store |
| `lib/plugins/index.ts` | Create | Register all plugins |
| `lib/plugins/plugin-store.tsx` | Create | React context + localStorage for on/off state |
| `components/plugin-manager-panel.tsx` | Create | Puzzle icon → Sheet with toggle switches |
| `components/plugin-disabled-message.tsx` | Create | "Plugin off" placeholder page |
| `components/app-shell.tsx` | Modify (3 additions) | Accept plugins prop, inject nav, add footer button |
| `app/layout.tsx` | Modify (wrap) | Add `PluginStoreProvider` |
| `app/donors/` pages | Modify (+4 lines) | Guard for donor plugin |
| `app/hospitals|requests|reports|feedback/` pages | Modify (+4 lines) | Guard for bids plugin |
| `components/dashboard/` → `components/ui/` | **NO CHANGE** | All component files stay identical |
| `app/page.tsx`, `app/login/`, `app/admin/` | **NO CHANGE** | Not plugin-owned |
