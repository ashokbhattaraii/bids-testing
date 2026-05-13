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
