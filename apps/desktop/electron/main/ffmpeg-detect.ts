// ============================================================
// FFmpeg Detection — priority search for ffmpeg executable.
// Phase 6: custom path > bundled > system PATH > not found.
// 支持两级子目录搜索和多版本检测。
// ============================================================

import { execFile } from 'child_process'
import { app } from 'electron'
import { access, readdir, stat } from 'fs/promises'
import { constants } from 'fs'
import path from 'path'

// ---- Types ----

export interface FFmpegInfo {
  found: boolean
  version?: string
  fullVersion?: string
  path: string
  source: 'custom' | 'bundled' | 'path' | 'none'
  error?: string
}

export interface FFmpegToolsInfo {
  ffmpeg: boolean
  ffprobe: boolean
  ffplay: boolean
  /** 三个 exe 所在的目录路径。 */
  baseDir: string
}

export interface AudioEncoderCapabilities {
  encoders: string[]
  aacOptions: string[]
}

// ---- Constants ----

/** Timeout for ffmpeg -version (ms). */
const VERSION_TIMEOUT = 10_000

/** Base-level subdirectories to search directly. */
const BUNDLED_SUBDIRS = ['', 'ffmpeg', 'bin', 'tools', 'resources/ffmpeg']

// ---- Version parsing ----

function parseVersion(stdout: string): { version: string; fullVersion: string } {
  const firstLine = stdout.split('\n')[0] ?? ''
  const fullVersion = firstLine.trim()
  const match = firstLine.match(/ffmpeg\s+version\s+(\S+)/i)
  const version = match?.[1] ?? 'unknown'
  return { version, fullVersion }
}

// ---- Single path validation ----

export async function tryFFmpegPath(ffmpegPath: string, source: FFmpegInfo['source']): Promise<FFmpegInfo> {
  try {
    await access(ffmpegPath, constants.X_OK)
  } catch {
    return { found: false, path: ffmpegPath, source, error: 'File not found or not executable' }
  }

  try {
    const { stdout } = await runExecFile(ffmpegPath, ['-version'])
    const { version, fullVersion } = parseVersion(stdout)
    return { found: true, version, fullVersion, path: ffmpegPath, source }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { found: false, path: ffmpegPath, source, error: `Failed to execute: ${message}` }
  }
}

// ---- child_process wrapper ----

function runExecFile(file: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(file, args, { timeout: VERSION_TIMEOUT, windowsHide: true }, (error, stdout, stderr) => {
      if (error) return reject(error)
      const output = stdout + stderr
      resolve({ stdout: output, stderr })
    })
  })
}

// ---- Bundled search paths (two-level) ----

/**
 * 获取 baseDir 下两级子目录内所有可能的 ffmpeg/ffprobe 路径。
 * 第一级：自身 + 已知 BUNDLED_SUBDIRS
 * 第二级：第一级每个目录的子目录（如 resources/ffmpeg-7.1/ 等）
 */
async function getBundledSearchDirsDeep(): Promise<string[]> {
  const ext = process.platform === 'win32' ? '.exe' : ''
  const baseDir = app.isPackaged
    ? path.dirname(app.getPath('exe'))
    : process.cwd()

  const paths: string[] = []

  // Level 1: base dir and known subdirs
  const level1Dirs = BUNDLED_SUBDIRS.map((s) => s ? path.join(baseDir, s) : baseDir)
  // 去重
  const seen = new Set<string>()
  for (const dir of level1Dirs) {
    if (seen.has(dir)) continue
    seen.add(dir)
    paths.push(path.join(dir, `ffmpeg${ext}`), path.join(dir, `ffprobe${ext}`))

    // Level 2: subdirectories of this dir
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (!entry.isDirectory()) continue
        const sub = path.join(dir, entry.name)
        if (seen.has(sub)) continue
        seen.add(sub)
        paths.push(path.join(sub, `ffmpeg${ext}`), path.join(sub, `ffprobe${ext}`))
      }
    } catch {
      // dir doesn't exist — skip
    }
  }

  return paths
}

// ---- System PATH search ----

async function findInSystemPath(): Promise<FFmpegInfo> {
  const isWin = process.platform === 'win32'
  const command = isWin ? 'where' : 'which'
  const target = isWin ? 'ffmpeg.exe' : 'ffmpeg'

  try {
    const { stdout } = await runExecFile(command, [target])
    const firstPath = stdout.split('\n')[0]?.trim()
    if (!firstPath) {
      return { found: false, path: '', source: 'none', error: 'ffmpeg not found in system PATH' }
    }
    return tryFFmpegPath(firstPath, 'path')
  } catch {
    return { found: false, path: '', source: 'none', error: 'ffmpeg not found in system PATH' }
  }
}

// ---- FFmpeg tools availability ----

export async function checkFFmpegTools(ffmpegPath: string): Promise<FFmpegToolsInfo> {
  const ext = process.platform === 'win32' ? '.exe' : ''
  const baseDir = path.isAbsolute(ffmpegPath) ? path.dirname(ffmpegPath) : ''
  const siblings = baseDir
    ? [
        { key: 'ffprobe' as const, file: path.join(baseDir, `ffprobe${ext}`) },
        { key: 'ffplay' as const, file: path.join(baseDir, `ffplay${ext}`) },
      ]
    : []
  const result: FFmpegToolsInfo = { ffmpeg: true, ffprobe: false, ffplay: false, baseDir }
  for (const { key, file } of siblings) {
    try {
      await access(file, constants.X_OK)
      result[key] = true
    } catch { /* not available */ }
  }
  return result
}

export async function detectFFmpegTools(customPath?: string): Promise<FFmpegToolsInfo | null> {
  const info = await detectFFmpeg(customPath)
  if (!info.found || !info.path) return null
  return checkFFmpegTools(info.path)
}

// ---- Directory-based custom path helper ----

async function resolveCustomFFmpegPath(customPath: string): Promise<string | null> {
  const ext = process.platform === 'win32' ? '.exe' : ''
  // If already a file path, use directly (backward compat)
  try {
    const info = await stat(customPath)
    if (info.isFile()) return customPath
  } catch { /* stat failed */ }
  // If it's a directory, look for ffmpeg.exe inside
  const candidate = path.join(customPath, `ffmpeg${ext}`)
  try {
    await access(candidate, constants.X_OK)
    return candidate
  } catch { /* not found */ }
  return null
}

// ---- Main detection entry ----

/**
 * Detect FFmpeg with priority:
 *   1. User-configured custom path (file or directory containing ffmpeg)
 *   2. Bundled with app (same dir, subdirs, two levels deep)
 *   3. System PATH
 *   4. Not found — guidance fallback
 */
export async function detectFFmpeg(customPath?: string): Promise<FFmpegInfo> {
  // Priority 1: User custom path
  if (customPath) {
    const resolved = await resolveCustomFFmpegPath(customPath)
    if (resolved) {
      const result = await tryFFmpegPath(resolved, 'custom')
      if (result.found) return result
    }
  }

  // Priority 2: Bundled with app (two-level deep)
  const bundledPaths = await getBundledSearchDirsDeep()
  for (const bundledPath of bundledPaths) {
    const result = await tryFFmpegPath(bundledPath, 'bundled')
    if (result.found) return result
  }

  // Priority 3: System PATH
  const pathResult = await findInSystemPath()
  if (pathResult.found) return pathResult

  // Priority 4: Not found
  return {
    found: false,
    path: '',
    source: 'none',
    error: 'FFmpeg not found. Please install FFmpeg or configure the path in settings.',
  }
}

// ---- Multi-version detection ----

/**
 * 按优先级扫描所有可用的 ffmpeg 版本：
 *   1. 自定义路径
 *   2. 同目录及子目录（两级深）
 *   3. 系统 PATH
 * 返回自定义排最前、其余按版本降序的列表。
 */
export async function detectAllFFmpegVersions(customPath?: string): Promise<FFmpegInfo[]> {
  const results: FFmpegInfo[] = []

  const add = (info: FFmpegInfo) => {
    if (!info.found) return
    // 如果路径已存在但来源不同，保留最高优先级的来源（custom > bundled > path）
    const existing = results.find((r) => r.path === info.path)
    if (existing) {
      if (info.source === 'custom') existing.source = 'custom'
      return
    }
    results.push(info)
  }

  // Priority 1: Custom path
  if (customPath) {
    const resolved = await resolveCustomFFmpegPath(customPath)
    if (resolved) add(await tryFFmpegPath(resolved, 'custom'))
  }

  // Priority 2: Bundled (two-level deep from app dir)
  const bundledPaths = await getBundledSearchDirsDeep()
  for (const bp of bundledPaths) {
    add(await tryFFmpegPath(bp, 'bundled'))
  }

  // Priority 3: System PATH
  const command = process.platform === 'win32' ? 'where' : 'which'
  const target = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'
  try {
    const { stdout } = await runExecFile(command, [target])
    for (const line of stdout.split('\n')) {
      const p = line.trim()
      if (!p) continue
      add(await tryFFmpegPath(p, 'path'))
    }
  } catch { /* ignore */ }

  // Custom stays first; rest sorted by version descending
  const custom = results.find((r) => r.source === 'custom')
  const rest = results.filter((r) => r.source !== 'custom')
  rest.sort((a, b) => (b.version ?? '').localeCompare(a.version ?? '', undefined, { numeric: true }))
  return custom ? [custom, ...rest] : rest
}

/** 读取当前 FFmpeg 实际提供的音频 encoder，并单独探测 AAC 新旧算法选项。 */
export async function detectAudioEncoderCapabilities(customPath?: string): Promise<AudioEncoderCapabilities | null> {
  const info = await detectFFmpeg(customPath)
  if (!info.found || !info.path) return null

  try {
    const [{ stdout: encoderOutput }, { stdout: aacHelp }] = await Promise.all([
      runExecFile(info.path, ['-hide_banner', '-encoders']),
      runExecFile(info.path, ['-hide_banner', '-h', 'encoder=aac']),
    ])
    const encoders = encoderOutput
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*A[.A-Z]{5}\s+(\S+)/)?.[1])
      .filter((name): name is string => Boolean(name))
    const aacOptions = ['twoloop', 'fast', 'nmr']
      .filter((option) => new RegExp(`^\\s+${option}\\s+`, 'm').test(aacHelp))
    return { encoders, aacOptions }
  } catch {
    return null
  }
}
