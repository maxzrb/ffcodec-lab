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

export interface FilterCapabilities {
  filters: string[]
}

/** 当前 FFmpeg 二进制实际注册的基础能力。 */
export interface FFmpegRuntimeCapabilities {
  encoders: string[]
  filters: string[]
}

/** 指定编码器实际公开的 AVOption 名称。 */
export interface FFmpegEncoderCapabilities {
  encoder: string
  /** 编码器私有帮助页公开的选项。 */
  options: string[]
  /** AVCodecContext 公开的通用视频编码选项。 */
  videoCodecOptions: string[]
}

// ---- Constants ----

/** Timeout for ffmpeg -version (ms). */
const VERSION_TIMEOUT = 10_000

/** `-h full` 在完整构建中通常超过 Node 默认的 1 MiB 输出上限。 */
const HELP_MAX_BUFFER = 4 * 1024 * 1024

/** Base-level subdirectories to search directly. */
const BUNDLED_SUBDIRS = ['', 'ffmpeg', 'bin', 'tools', 'resources/ffmpeg']

const runtimeCapabilitiesCache = new Map<string, FFmpegRuntimeCapabilities>()
const encoderCapabilitiesCache = new Map<string, FFmpegEncoderCapabilities>()
const videoCodecOptionsCache = new Map<string, Promise<string[]>>()

// ---- Version parsing ----

function parseVersion(stdout: string): { version?: string; fullVersion: string } {
  const firstLine = stdout.trimStart().split(/\r?\n/)[0] ?? ''
  const fullVersion = firstLine.trim()
  const match = fullVersion.match(/^ffmpeg\s+version\s+(\S+)/i)
  const version = match?.[1]
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
    if (!version) {
      return {
        found: false,
        path: ffmpegPath,
        source,
        error: 'Executable did not identify itself as FFmpeg',
      }
    }
    return { found: true, version, fullVersion, path: ffmpegPath, source }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { found: false, path: ffmpegPath, source, error: `Failed to execute: ${message}` }
  }
}

// ---- child_process wrapper ----

function runExecFile(file: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(file, args, {
      timeout: VERSION_TIMEOUT,
      windowsHide: true,
      maxBuffer: HELP_MAX_BUFFER,
    }, (error, stdout, stderr) => {
      if (error) return reject(error)
      const output = stdout + stderr
      resolve({ stdout: output, stderr })
    })
  })
}

// ---- Bundled search paths (two-level) ----

/**
 * 获取 baseDir 下两级子目录内所有可能的 ffmpeg 路径。
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
    paths.push(path.join(dir, `ffmpeg${ext}`))

    // Level 2: subdirectories of this dir
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (!entry.isDirectory()) continue
        const sub = path.join(dir, entry.name)
        if (seen.has(sub)) continue
        seen.add(sub)
        paths.push(path.join(sub, `ffmpeg${ext}`))
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
    const encoders = uniqueMatches(
      encoderOutput,
      /^\s*A[.A-Z]{5}\s+([A-Za-z0-9][A-Za-z0-9_.-]*)/,
    )
    const aacOptions = ['twoloop', 'fast', 'nmr']
      .filter((option) => new RegExp(`^\\s+${option}\\s+`, 'm').test(aacHelp))
    return { encoders, aacOptions }
  } catch {
    return null
  }
}

/** 读取当前 FFmpeg 已注册的滤镜名称；不从 configure 文本推断实际可用性。 */
export async function detectFilterCapabilities(customPath?: string): Promise<FilterCapabilities | null> {
  const capabilities = await detectFFmpegRuntimeCapabilities(customPath)
  return capabilities ? { filters: capabilities.filters } : null
}

/**
 * 读取当前 FFmpeg 实际注册的编码器和滤镜。
 * 缓存键包含可执行文件路径与自报版本，切换二进制后不会复用旧能力。
 */
export async function detectFFmpegRuntimeCapabilities(
  customPath?: string,
): Promise<FFmpegRuntimeCapabilities | null> {
  const info = await detectFFmpeg(customPath)
  if (!info.found || !info.path) return null

  const cacheKey = `${info.path}\u0000${info.fullVersion ?? info.version ?? ''}`
  const cached = runtimeCapabilitiesCache.get(cacheKey)
  if (cached) return cached

  try {
    const [{ stdout: encoderOutput }, { stdout: filterOutput }] = await Promise.all([
      runExecFile(info.path, ['-hide_banner', '-encoders']),
      runExecFile(info.path, ['-hide_banner', '-filters']),
    ])
    const capabilities = {
      encoders: parseEncoderNames(encoderOutput),
      filters: parseFilterNames(filterOutput),
    }
    runtimeCapabilitiesCache.set(cacheKey, capabilities)
    return capabilities
  } catch {
    return null
  }
}

/**
 * 按需读取指定编码器可接受的 AVOption；包含编码器私有选项和
 * AVCodecContext 通用视频编码选项，不初始化 GPU 或实际编码。
 */
export async function detectFFmpegEncoderCapabilities(
  encoder: string,
  customPath?: string,
): Promise<FFmpegEncoderCapabilities | null> {
  if (!/^[A-Za-z0-9_.-]+$/.test(encoder)) return null
  const info = await detectFFmpeg(customPath)
  if (!info.found || !info.path) return null

  const binaryCacheKey = `${info.path}\u0000${info.fullVersion ?? info.version ?? ''}`
  const cacheKey = `${binaryCacheKey}\u0000${encoder}`
  const cached = encoderCapabilitiesCache.get(cacheKey)
  if (cached) return cached

  try {
    const [{ stdout }, videoCodecOptions] = await Promise.all([
      runExecFile(info.path, ['-hide_banner', '-h', `encoder=${encoder}`]),
      getVideoCodecOptions(info.path, binaryCacheKey),
    ])
    if (/is not recognized|Unknown encoder|Codec '.+?' is not recognized/i.test(stdout)) return null
    const capabilities = {
      encoder,
      options: parseEncoderOptionNames(stdout),
      videoCodecOptions,
    }
    encoderCapabilitiesCache.set(cacheKey, capabilities)
    return capabilities
  } catch {
    return null
  }
}

export function parseEncoderNames(output: string): string[] {
  return uniqueMatches(output, /^\s*[VAS][.A-Z]{5}\s+([A-Za-z0-9][A-Za-z0-9_.-]*)/)
}

export function parseFilterNames(output: string): string[] {
  return uniqueMatches(output, /^\s*[.A-Z]{2,3}\s+([A-Za-z0-9][A-Za-z0-9_.-]*)\s+/)
}

export function parseEncoderOptionNames(output: string): string[] {
  return uniqueMatches(output, /^\s+(-[A-Za-z0-9_:-]+)\s+/)
}

/**
 * 只解析 `-h full` 的 AVCodecContext 段，避免把其他编码器的私有同名选项
 * 错当成所有编码器都支持的通用能力。标记同时包含 E 和 V 才属于视频编码。
 */
export function parseVideoCodecOptionNames(output: string): string[] {
  const values: string[] = []
  const seen = new Set<string>()
  let inCodecContext = false

  for (const line of output.split(/\r?\n/)) {
    if (line.trim() === 'AVCodecContext AVOptions:') {
      inCodecContext = true
      continue
    }
    if (!inCodecContext) continue
    if (/^\S.*AVOptions:\s*$/.test(line)) break

    const match = line.match(/^\s+(-[A-Za-z0-9_:-]+)\s+.*?\s([A-Z.]{11})\s+/)
    const option = match?.[1]
    const flags = match?.[2]
    if (!option || !flags || flags[0] !== 'E' || flags[3] !== 'V' || seen.has(option)) continue
    seen.add(option)
    values.push(option)
  }

  return values
}

function getVideoCodecOptions(ffmpegPath: string, binaryCacheKey: string): Promise<string[]> {
  const cached = videoCodecOptionsCache.get(binaryCacheKey)
  if (cached) return cached

  const pending = runExecFile(ffmpegPath, ['-hide_banner', '-h', 'full'])
    .then(({ stdout }) => parseVideoCodecOptionNames(stdout))
    .catch((error: unknown) => {
      videoCodecOptionsCache.delete(binaryCacheKey)
      throw error
    })
  videoCodecOptionsCache.set(binaryCacheKey, pending)
  return pending
}

function uniqueMatches(output: string, pattern: RegExp): string[] {
  const values: string[] = []
  const seen = new Set<string>()
  for (const line of output.split(/\r?\n/)) {
    const value = line.match(pattern)?.[1]
    if (!value || seen.has(value)) continue
    seen.add(value)
    values.push(value)
  }
  return values
}
