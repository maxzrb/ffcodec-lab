// ============================================================
// Desktop Platform Adapter — Electron implementation.
// Phase 4: localStorage-based storage (same as web for now).
// Phase 5: extensions for desktop-specific UI (path fields, etc.).
// Later phases: electron-store for persistent settings.
// ============================================================

import type { PlatformAdapter, StorageAdapter, WorkbenchExtensions } from '@ffcodec/platform-api'
import { DesktopPathField } from './components/DesktopPathField'
import { desktopCommandActions } from './components/DesktopCommandActions'
import { desktopSettingsSections } from './components/DesktopSettingsSection'

/** localStorage-backed storage for Electron renderer (temporary). */
class ElectronStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch (e) {
      console.warn('Failed to write to localStorage:', e)
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch {
      // Silently ignore
    }
  }

  keys(): string[] {
    try {
      const result: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) result.push(key)
      }
      return result
    } catch {
      return []
    }
  }
}

const desktopExtensions: WorkbenchExtensions = {
  pathFieldRenderer: DesktopPathField,
  commandActions: desktopCommandActions,
  settingsSections: desktopSettingsSections,
}

/** Full desktop platform adapter. Capabilities declare what desktop can do. */
export const desktopPlatform: PlatformAdapter = {
  capabilities: {
    desktop: true,
    nativeFileDialog: true,          // Phase 6 ✅
    ffmpegDetect: true,              // Phase 6 ✅
    localFFmpegExecution: true,      // Phase 9 ✅
    revealInFolder: true,            // Phase 6 ✅
    persistentEncodingHistory: true,  // Phase 11 ✅
  },
  storage: new ElectronStorageAdapter(),
  extensions: desktopExtensions,
}
