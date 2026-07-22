// ============================================================
// INI-based user preference store.
// Supports two modes: "user" (default, %APPDATA%) and
// "portable" (alongside the exe).
// ============================================================

import { app, BrowserWindow } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

export type StorageMode = 'portable' | 'user'

const INI_FILENAME = 'ffcodec-config.ini'
const MODE_FILENAME = 'storage-mode.json'

// -----------------------------------------------------------
// Helpers
// -----------------------------------------------------------

function appDataDir(): string {
  return path.join(os.homedir(), 'AppData', 'Roaming', 'FFCodec Lab')
}

function portableDir(): string {
  // process.execPath points to the actual exe; for packaged Electron apps
  // on Windows this is the app executable location.
  return path.dirname(process.execPath)
}

// -----------------------------------------------------------
// INI parser / writer
// -----------------------------------------------------------

/** Simple INI read: lines of `key=value`. `;` comments and blank lines ignored.
 *  Values that start with `!b64!` are base64-decoded (for multi-line payloads). */
function parseIni(raw: string): Map<string, string> {
  const map = new Map<string, string>()
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    if (!key) continue
    map.set(key, decodeValue(value))
  }
  return map
}

function formatIni(map: Map<string, string>): string {
  const lines = ['; FFCodec Lab User Preferences']
  for (const [key, value] of map) {
    lines.push(`${key}=${encodeValue(value)}`)
  }
  return `${lines.join('\r\n')}\r\n`
}

function encodeValue(raw: string): string {
  if (raw.includes('\n') || raw.includes('\r')) {
    return `!b64!${Buffer.from(raw, 'utf8').toString('base64')}`
  }
  return raw
}

function decodeValue(encoded: string): string {
  if (encoded.startsWith('!b64!')) {
    return Buffer.from(encoded.slice(5), 'base64').toString('utf8')
  }
  return encoded
}

function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return null
  }
}

function writeFileAtomic(filePath: string, content: string): void {
  const dir = path.dirname(filePath)
  fs.mkdirSync(dir, { recursive: true })
  const tmp = `${filePath}.tmp`
  fs.writeFileSync(tmp, content, 'utf8')
  fs.renameSync(tmp, filePath)
}

// -----------------------------------------------------------
// Mode persistence
// -----------------------------------------------------------

function modeFilePath(): string {
  return path.join(app.getPath('userData'), MODE_FILENAME)
}

function readMode(): StorageMode {
  const raw = readFileSafe(modeFilePath())
  if (!raw) return 'user' // default
  try {
    const parsed = JSON.parse(raw) as { mode?: string }
    if (parsed.mode === 'portable') return 'portable'
  } catch { /* fall through */ }
  return 'user'
}

function writeMode(mode: StorageMode): void {
  writeFileAtomic(modeFilePath(), JSON.stringify({ mode }, null, 2))
}

// -----------------------------------------------------------
// Store state
// -----------------------------------------------------------

let cache: Map<string, string> = new Map()
let currentMode: StorageMode = readMode()

// -----------------------------------------------------------
// Public API
// -----------------------------------------------------------

export function getMode(): StorageMode {
  return currentMode
}

export function getIniPath(): string {
  return currentMode === 'portable'
    ? path.join(portableDir(), INI_FILENAME)
    : path.join(appDataDir(), INI_FILENAME)
}

export function getIniPathForMode(mode: StorageMode): string {
  return mode === 'portable'
    ? path.join(portableDir(), INI_FILENAME)
    : path.join(appDataDir(), INI_FILENAME)
}

export function getItem(key: string): string | null {
  return cache.get(key) ?? null
}

export function setItem(key: string, value: string): void {
  cache.set(key, value)
  persistCache()
}

export function removeItem(key: string): void {
  cache.delete(key)
  persistCache()
}

export function keys(): string[] {
  return Array.from(cache.keys())
}

/** Initialize: load INI from the current mode path. */
export function initStore(): void {
  currentMode = readMode()
  const iniPath = getIniPath()
  const raw = readFileSafe(iniPath)
  cache = raw ? parseIni(raw) : new Map()
}

/** Switch storage mode with data migration. Returns the new INI path. */
export function switchMode(newMode: StorageMode): { ok: true; path: string } | { ok: false; error: string } {
  if (newMode === currentMode) {
    return { ok: true, path: getIniPath() }
  }

  const oldPath = getIniPath()
  const newPath = getIniPathForMode(newMode)

  try {
    // Persist current cache to the new location
    writeFileAtomic(newPath, formatIni(cache))

    // Backup old INI
    if (readFileSafe(oldPath)) {
      fs.renameSync(oldPath, `${oldPath}.old`)
    }

    // Update mode
    currentMode = newMode
    writeMode(currentMode)

    // Broadcast to all renderers
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send('storage:mode-changed', { mode: currentMode, path: newPath })
      }
    }

    return { ok: true, path: newPath }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: message }
  }
}

/** Import data from localStorage dump into INI (one-time migration). */
export function importFromMap(entries: [string, string][]): void {
  for (const [k, v] of entries) {
    cache.set(k, v)
  }
  persistCache()
}

// -----------------------------------------------------------
// Internal
// -----------------------------------------------------------

function persistCache(): void {
  try {
    writeFileAtomic(getIniPath(), formatIni(cache))
  } catch {
    // Silently ignore — failures don't block the app
  }
}
