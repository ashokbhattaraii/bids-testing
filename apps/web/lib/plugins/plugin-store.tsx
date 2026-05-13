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
