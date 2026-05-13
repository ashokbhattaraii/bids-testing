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
