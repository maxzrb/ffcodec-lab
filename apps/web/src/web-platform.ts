// ============================================================
// Web platform adapter — provides localStorage-based storage
// and zero native capabilities for the browser environment.
// ============================================================

import type { PlatformAdapter, StorageAdapter } from '@ffcodec/platform-api'

/** localStorage-backed storage adapter for web. */
export class WebStorageAdapter implements StorageAdapter {
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

/** Full web platform adapter — all capabilities, storage via localStorage. */
export const webPlatform: PlatformAdapter = {
  capabilities: {
    desktop: false,
    nativeFileDialog: false,
    localFFmpegExecution: false,
    revealInFolder: false,
    persistentEncodingHistory: false,
  },
  storage: new WebStorageAdapter(),
}
