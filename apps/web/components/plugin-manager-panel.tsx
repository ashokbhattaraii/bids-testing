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
          &ldquo;Plugin disabled&rdquo; message instead of content.
        </p>
      </SheetContent>
    </Sheet>
  )
}
