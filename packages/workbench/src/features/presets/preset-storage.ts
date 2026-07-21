// ============================================================
// Storage adapter — abstract interface for config persistence.
// Currently only localStorage; can be swapped for IndexedDB
// or server-side storage later.
// ============================================================

// Re-export the canonical StorageAdapter from platform-api
import type { StorageAdapter } from '@ffcodec/platform-api'

export type { StorageAdapter }

export class LocalStorageAdapter implements StorageAdapter {
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

/** Prefix for preset keys in storage */
export const PRESET_KEY_PREFIX = 'ffcodec:preset:'
export const ACTIVE_CONFIG_KEY = 'ffcodec:active-config'

export function makePresetKey(id: string): string {
  return `${PRESET_KEY_PREFIX}${id}`
}

export function parsePresetKey(key: string): string | null {
  if (key.startsWith(PRESET_KEY_PREFIX)) {
    return key.slice(PRESET_KEY_PREFIX.length)
  }
  return null
}
