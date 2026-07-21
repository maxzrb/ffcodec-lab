// ============================================================
// Preload script — exposes limited API via contextBridge.
// Phase 4: minimal exposure (platform + versions only).
// Phase 5-11: DesktopAPI will be added incrementally.
// ============================================================

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform as 'win32' | 'darwin' | 'linux',
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  // IPC placeholder — expanded in later phases
  invoke: (channel: string, ...args: unknown[]) =>
    ipcRenderer.invoke(channel, ...args),
})

// Type declaration for the renderer
declare global {
  interface Window {
    electronAPI?: {
      platform: 'win32' | 'darwin' | 'linux'
      versions: {
        node: string
        chrome: string
        electron: string
      }
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
    }
  }
}
