// ============================================================
// FFmpeg Detection — priority search for ffmpeg executable.
// Phase 6: custom path > bundled > system PATH > not found.
// ============================================================

import { execFile } from 'child_process'
import { app } from 'electron'
import { access } from 'fs/promises'
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

export interface AudioEncoderCapabilities {
  encoders: string[]
  aacOptions: string[]
}

// ---- Constants ----

/** Timeout for ffmpeg -version (ms). */
const VERSION_TIMEOUT = 10_000

/** Common subdirectories relative to the app directory to search. */
const BUNDLED_SUBDIRS = ['', 'ffmpeg', 'bin', 'tools']

// ---- Version parsing ----

function parseVersion(stdout: string): { version: string; fullVersion: string } {
  const firstLine = stdout.split('\n')[0] ?? ''
  const fullVersion = firstLine.trim()

  // Match "ffmpeg version X.Y.Z" or "ffmpeg version N"
  const match = firstLine.match(/ffmpeg\s+version\s+(\S+)/i)
  const version = match?.[1] ?? 'unknown'

  return { version, fullVersion }
}

// ---- Single path validation ----

export async function tryFFmpegPath(ffmpegPath: string, source: FFmpegInfo['source']): Promise<FFmpegInfo> {
  try {
    // Check file exists and is executable (X_OK on Unix; no-op on Windows)
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
      // ffmpeg writes version info to stderr, not stdout
      const output = stdout + stderr
      resolve({ stdout: output, stderr })
    })
  })
}

// ---- Bundled search paths ----

function getBundledSearchDirs(): string[] {
  const baseDir = app.isPackaged
    ? path.dirname(app.getPath('exe'))
    : process.cwd()

  const ext = process.platform === 'win32' ? '.exe' : ''

  return BUNDLED_SUBDIRS.flatMap((subdir) => {
    const dir = subdir ? path.join(baseDir, subdir) : baseDir
    return [
      path.join(dir, `ffmpeg${ext}`),
      path.join(dir, `ffprobe${ext}`),  // also detect ffprobe for future use
    ]
  })
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

// ---- Main detection entry ----

/**
 * Detect FFmpeg with priority:
 *   1. User-configured custom path
 *   2. Bundled with app (same directory / subdirectories)
 *   3. System PATH
 *   4. Not found — guidance fallback
 */
export async function detectFFmpeg(customPath?: string): Promise<FFmpegInfo> {
  // Priority 1: User custom path
  if (customPath) {
    const result = await tryFFmpegPath(customPath, 'custom')
    if (result.found) return result
    // Continue searching — custom path may be stale
  }

  // Priority 2: Bundled with app
  const bundledPaths = getBundledSearchDirs()
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
      .map((line) => line.match(/^\s*A[\.A-Z]{5}\s+(\S+)/)?.[1])
      .filter((name): name is string => Boolean(name))
    const aacOptions = ['twoloop', 'fast', 'nmr']
      .filter((option) => new RegExp(`^\\s+${option}\\s+`, 'm').test(aacHelp))
    return { encoders, aacOptions }
  } catch {
    return null
  }
}
