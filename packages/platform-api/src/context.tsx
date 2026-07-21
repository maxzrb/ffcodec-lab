// ============================================================
// PlatformProvider — React context that injects PlatformAdapter
// into the workbench component tree. Web and Desktop each
// provide their own adapter at the root.
// ============================================================

import { createContext, useContext, type ReactNode } from 'react'
import type { PlatformAdapter } from './types'

const PlatformContext = createContext<PlatformAdapter | null>(null)

export function PlatformProvider({
  adapter,
  children,
}: {
  adapter: PlatformAdapter
  children: ReactNode
}) {
  return <PlatformContext.Provider value={adapter}>{children}</PlatformContext.Provider>
}

/** Returns the platform adapter. Throws if the provider is missing. */
export function usePlatform(): PlatformAdapter {
  const adapter = useContext(PlatformContext)
  if (!adapter) {
    throw new Error('usePlatform() must be used inside a <PlatformProvider>')
  }
  return adapter
}
