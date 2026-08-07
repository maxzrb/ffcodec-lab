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

/**
 * 模式标记文件跟随程序目录：便携包整体拷贝到其他电脑后，
 * 模式与预设/INI 都继续跟随程序目录（“真·全便携”）。
 * 旧版本标记文件存放在 AppData，读取时自动迁移一次。
 */
function modeFilePath(): string {
  return path.join(portableDir(), MODE_FILENAME)
}

/** 旧版本（标记存 AppData）的标记文件路径。 */
function legacyModeFilePath(): string {
  return path.join(app.getPath('userData'), MODE_FILENAME)
}

/** 读取标记文件内容并校验，非法/不存在返回 null。 */
function readModeFile(filePath: string): StorageMode | null {
  const raw = readFileSafe(filePath)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { mode?: string }
    if (parsed.mode === 'portable') return 'portable'
    if (parsed.mode === 'user') return 'user'
  } catch { /* fall through */ }
  return null
}

function readMode(): StorageMode {
  // 1. 程序目录标记优先
  const portable = readModeFile(modeFilePath())
  if (portable) return portable

  // 2. 旧版 AppData 标记一次性迁移到程序目录（程序目录不可写时保留原位置继续使用）
  const legacy = readModeFile(legacyModeFilePath())
  if (legacy) {
    try {
      writeMode(legacy)
    } catch {
      // 忽略：安装版程序目录可能不可写
    }
    return legacy
  }

  // 3. 程序目录已存在便携数据文件（如整体拷贝的便携包）→ 自动进入便携模式
  if (readFileSafe(path.join(portableDir(), INI_FILENAME)) !== null) {
    try {
      writeMode('portable')
    } catch {
      // 忽略：写入失败不阻断自动便携判定
    }
    return 'portable'
  }

  // 4. 默认用户模式
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

/** 预设 JSON 文件目录：位于偏好存储根目录下的 presets 子目录。 */
export function getPresetsDir(): string {
  return path.join(path.dirname(getIniPath()), 'presets')
}

export function getPresetsDirForMode(mode: StorageMode): string {
  return path.join(path.dirname(getIniPathForMode(mode)), 'presets')
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
