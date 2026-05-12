# HLB Plugin Architecture — Setup Guide

This guide explains how to refactor the **Hamro Life Bank (HLB)** project into a plugin-based architecture,
where `donor` and `bids` are separate, independent plugins that each contribute their own navigation and pages.

---

## Project Structure (Target)

```
hlb/
├── apps/
│   └── web/                          ← Next.js App Router
│       ├── app/
│       │   ├── layout.tsx            ← imports + boots all plugins
│       │   ├── donors/               ← donor pages (unchanged)
│       │   ├── hospitals/            ← bids pages (unchanged)
│       │   ├── requests/
│       │   ├── reports/
│       │   └── feedback/
│       ├── components/
│       │   └── app-shell.tsx         ← sidebar driven by plugins
│       └── lib/
│           └── plugins/
│               ├── index.ts          ← single wiring point (register all)
│               └── registry.ts       ← in-memory plugin store
├── packages/
│   └── sdk/
│       └── src/
│           └── index.ts              ← shared types (HlbPlugin, NavItem)
├── plugins/
│   ├── donor/                        ← Donor plugin package
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── index.ts
│   └── bids/                         ← BIDS plugin package
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts
├── pnpm-workspace.yaml
└── package.json
```

---

## Step 1 — Add Plugin Types to the SDK

**File:** `packages/sdk/src/index.ts`

Add the following types. This is the **contract** every plugin must follow.

```ts
export interface NavItem {
  label: string       // Display name in the sidebar
  href: string        // Next.js route path
  icon?: string       // Lucide icon name (string), e.g. 'Users', 'Heart'
}

export interface HlbPlugin {
  id: string          // Unique plugin key, e.g. 'donor', 'bids'
  label: string       // Group heading in the sidebar
  description?: string
  group: string       // Used for grouping nav sections
  navItems: NavItem[] // Navigation links this plugin contributes
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
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@hlb/sdk": "workspace:*"
  }
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

```ts
import type { HlbPlugin } from '@hlb/sdk'

export const DonorPlugin: HlbPlugin = {
  id: 'donor',
  label: 'Donor Management',
  description: 'Manage blood donors, pledges, and verifications',
  group: 'donor',
  navItems: [
    { label: 'Donors',     href: '/donors',            icon: 'Users'     },
    { label: 'Pledges',    href: '/donors/pledges',    icon: 'Heart'     },
    { label: 'Unverified', href: '/donors/unverified', icon: 'UserCheck' },
    { label: 'Blocked',    href: '/donors/blocked',    icon: 'UserX'     },
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
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@hlb/sdk": "workspace:*"
  }
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

```ts
import type { HlbPlugin } from '@hlb/sdk'

export const BidsPlugin: HlbPlugin = {
  id: 'bids',
  label: 'BIDS Management',
  description: 'Hospitals, blood requests, blood banks, and more',
  group: 'bids',
  navItems: [
    { label: 'Hospitals',      href: '/hospitals', icon: 'Building2'     },
    { label: 'Blood Requests', href: '/requests',  icon: 'Droplets'      },
    { label: 'Reports',        href: '/reports',   icon: 'BarChart3'     },
    { label: 'Feedback',       href: '/feedback',  icon: 'MessageSquare' },
  ],
}
```

---

## Step 4 — Create the Plugin Registry in the Web App

### `apps/web/lib/plugins/registry.ts`

An in-memory store for all registered plugins.

```ts
import type { HlbPlugin } from '@hlb/sdk'

const plugins: HlbPlugin[] = []

export function registerPlugin(plugin: HlbPlugin): void {
  // Prevent duplicate registration on hot-reload
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

### `apps/web/lib/plugins/index.ts`

This is the **single file** where you import and register all plugins.
Adding a new plugin in the future only requires changes here.

```ts
// 1. Import each plugin (this loads the module)
import { DonorPlugin } from '@hlb/plugin-donor'
import { BidsPlugin }  from '@hlb/plugin-bids'

// 2. Register them into the registry
import { registerPlugin } from './registry'

registerPlugin(DonorPlugin)
registerPlugin(BidsPlugin)

// 3. Re-export helpers so the rest of the app can use them
export { getRegisteredPlugins, getPlugin } from './registry'
```

---

## Step 5 — Update pnpm Workspace

**File:** `pnpm-workspace.yaml` (root)

Make sure `plugins/*` is included:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'plugins/*'
```

---

## Step 6 — Add Plugin Dependencies to Web App

**File:** `apps/web/package.json`

```json
{
  "dependencies": {
    "@hlb/plugin-donor": "workspace:*",
    "@hlb/plugin-bids":  "workspace:*"
  }
}
```

Then install:

```bash
pnpm install
```

---

## Step 7 — Boot Plugins in the Root Layout

**File:** `apps/web/app/layout.tsx`

Import the plugins file at the top. This triggers registration before any page renders.

```tsx
import '@/lib/plugins'                          // ← boots all plugins
import { getRegisteredPlugins } from '@/lib/plugins'
import { AppShell } from '@/components/app-shell'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const plugins = getRegisteredPlugins()         // ← [DonorPlugin, BidsPlugin]

  return (
    <html lang="en">
      <body>
        <AppShell plugins={plugins}>
          {children}
        </AppShell>
      </body>
    </html>
  )
}
```

---

## Step 8 — Update the Sidebar to Render Plugin Nav

**File:** `apps/web/components/app-shell.tsx`

Replace the hardcoded sidebar links with dynamic plugin-driven nav:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Icons from 'lucide-react'
import type { HlbPlugin } from '@hlb/sdk'

interface AppShellProps {
  plugins: HlbPlugin[]
  children: React.ReactNode
}

export function AppShell({ plugins, children }: AppShellProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-56 border-r bg-white flex flex-col gap-6 p-4">
        {plugins.map((plugin) => (
          <div key={plugin.id}>
            {/* Group heading */}
            <p className="text-xs font-semibold uppercase text-gray-400 mb-1">
              {plugin.label}
            </p>

            {/* Nav links from the plugin */}
            <nav className="flex flex-col gap-0.5">
              {plugin.navItems.map((item) => {
                const Icon = item.icon
                  ? (Icons[item.icon as keyof typeof Icons] as React.ElementType)
                  : null
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors
                      ${isActive
                        ? 'bg-red-50 text-red-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {Icon && <Icon size={16} />}
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </aside>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
```

---

## How It All Connects (Data Flow)

```
App boot
 └── app/layout.tsx
      ├── import '@/lib/plugins'
      │    └── lib/plugins/index.ts
      │         ├── import DonorPlugin  ← plugins/donor/src/index.ts
      │         ├── import BidsPlugin   ← plugins/bids/src/index.ts
      │         ├── registerPlugin(DonorPlugin)  → added to registry array
      │         └── registerPlugin(BidsPlugin)   → added to registry array
      │
      └── getRegisteredPlugins() → [DonorPlugin, BidsPlugin]
           └── <AppShell plugins={[DonorPlugin, BidsPlugin]}>
                └── sidebar renders navItems from each plugin
                     ├── DONOR group:  Donors / Pledges / Unverified / Blocked
                     └── BIDS group:   Hospitals / Blood Requests / Reports / Feedback
```

Your actual page files in `app/donors/`, `app/hospitals/`, etc. **do not change**.
The plugins only control **what appears in the sidebar navigation**.

---

## Adding a New Plugin Later

Only 3 steps needed:

**1. Create the plugin:**
```
plugins/admin/
  ├── package.json   (name: @hlb/plugin-admin)
  ├── tsconfig.json
  └── src/index.ts   (export AdminPlugin: HlbPlugin)
```

**2. Add to web dependencies** (`apps/web/package.json`):
```json
"@hlb/plugin-admin": "workspace:*"
```

**3. Register in** `apps/web/lib/plugins/index.ts`:
```ts
import { AdminPlugin } from '@hlb/plugin-admin'
registerPlugin(AdminPlugin)
```

The sidebar updates automatically. No other files need to be touched.

---

## Key Concepts Summary

| Concept | File | Purpose |
|---|---|---|
| Plugin contract (types) | `packages/sdk/src/index.ts` | `HlbPlugin` and `NavItem` interfaces |
| Donor plugin definition | `plugins/donor/src/index.ts` | Declares donor nav items |
| BIDS plugin definition | `plugins/bids/src/index.ts` | Declares bids nav items |
| In-memory registry | `apps/web/lib/plugins/registry.ts` | Stores registered plugins |
| Wiring point | `apps/web/lib/plugins/index.ts` | Single file that registers everything |
| Bootstrap | `apps/web/app/layout.tsx` | Triggers registration at app startup |
| Dynamic sidebar | `apps/web/components/app-shell.tsx` | Reads plugins and renders nav |
