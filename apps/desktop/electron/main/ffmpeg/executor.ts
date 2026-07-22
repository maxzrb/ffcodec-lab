// ============================================================
// FFmpeg Job Executor — spawns FFmpeg, parses progress,
// writes stderr log, and resolves/rejects on completion.
// ============================================================

import { spawn, type ChildProcess } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { createInterface } from 'node:readline'
import type { FFmpegJobStartRequest, FFmpegJobSnapshot } from './types'
import {
  parseProgressLine,
  progressFrameToSnapshot,
  computeProgress,
  type FFmpegProgressFrame,
} from './progress-parser'

// ---- Constants ----

/** Additional args automatically appended for progress reporting. */
const PROGRESS_ARGS = ['-progress', 'pipe:1', '-nostats', '-stats_period', '0.5']

/** Graceful shutdown timeout in ms (wait after writing 'q' before force-kill). */
const GRACEFUL_SHUTDOWN_MS = 5_000

// ---- Public API ----

export interface ExecutorCallbacks {
  /** Called each time a progress frame is parsed. Receives the updated snapshot. */
  onProgress: (snapshot: FFmpegJobSnapshot) => void
  /** Called when the job enters a terminal phase (completed/failed/cancelled). */
  onFinish: (snapshot: FFmpegJobSnapshot) => void
}

/**
 * Launches an FFmpeg encoding job.
 *
 * Returns the initial snapshot. Progress and completion are delivered
 * via the `callbacks` parameter. The returned `cancel` function
 * initiates graceful shutdown.
 */
export function startJob(
  request: FFmpegJobStartRequest,
  ffmpegPath: string,
  logDir: string,
  jobId: string,
  createdAt: number,
  callbacks: ExecutorCallbacks,
): { snapshot: FFmpegJobSnapshot; cancel: () => void } {
  const { executionPlan: plan, overwriteMode } = request

  // Ensure log directory exists
  fs.mkdirSync(logDir, { recursive: true })

  const logPath = path.join(logDir, `ffcodec-${jobId}.log`)
  const logStream = fs.createWriteStream(logPath, { flags: 'a' })

  // Build final args: add -y for replace mode, then progress args
  const finalArgs = buildFinalArgs(plan.args, overwriteMode)

  // Initial snapshot
  const snapshot: FFmpegJobSnapshot = {
    jobId,
    phase: 'starting',
    createdAt,
    startedAt: null,
    endedAt: null,
    inputPaths: plan.inputPaths,
    outputPaths: plan.outputPaths,
    frame: null,
    totalFrames: plan.expectedTotalFrames ?? null,
    fps: null,
    bitrate: null,
    speed: null,
    outTimeUs: null,
    outTimeMs: null,
    expectedDurationMs: plan.expectedDurationMs ?? null,
    percent: null,
    estimatedRemainingMs: null,
    totalSize: null,
    exitCode: null,
    signal: null,
    errorSummary: null,
    logPath,
  }

  // Log header
  logStream.write(`=== FFCodec Lab Job ${jobId} ===\n`)
  logStream.write(`Started: ${new Date(createdAt).toISOString()}\n`)
  logStream.write(`FFmpeg: ${ffmpegPath}\n`)
  logStream.write(`Args: ${finalArgs.join(' ')}\n`)
  logStream.write(`--- FFmpeg stderr ---\n\n`)

  const child: ChildProcess = spawn(ffmpegPath, finalArgs, {
    shell: false,
    windowsHide: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  let cancelled = false
  let forceKillTimeout: ReturnType<typeof setTimeout> | null = null

  // ---- Cancel function ----

  const cancel = () => {
    if (cancelled) return
    cancelled = true

    if (snapshot.phase === 'starting') {
      // Not yet running — directly cancel
      snapshot.phase = 'cancelled'
      snapshot.endedAt = Date.now()
      child.kill('SIGTERM')
      return
    }

    if (snapshot.phase === 'running') {
      snapshot.phase = 'cancelling'
      callbacks.onProgress({ ...snapshot })

      // Strategy 1: write 'q' to stdin for graceful shutdown
      if (child.stdin && !child.stdin.destroyed) {
        try {
          child.stdin.write('q\n')
        } catch {
          // stdin may already be closed
        }
      }

      // Strategy 2: force-kill after timeout
      forceKillTimeout = setTimeout(() => {
        if (child.exitCode === null && !child.killed) {
          logStream.write('\n--- Force killing FFmpeg (timeout) ---\n')
          // Windows: try process tree kill via taskkill
          if (process.platform === 'win32' && child.pid) {
            try {
              spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], {
                shell: false,
                windowsHide: true,
              })
            } catch {
              child.kill('SIGKILL')
            }
          } else {
            child.kill('SIGKILL')
          }
        }
      }, GRACEFUL_SHUTDOWN_MS)
    }
  }

  // ---- Start ----

  snapshot.startedAt = Date.now()
  snapshot.phase = 'running'
  logStream.write(`Started at: ${new Date(snapshot.startedAt).toISOString()}\n\n`)

  // ---- Parse stdout for progress ----

  let currentFrame: FFmpegProgressFrame = {}
  const rl = createInterface({ input: child.stdout! })

  rl.on('line', (line: string) => {
    currentFrame = parseProgressLine(currentFrame, line)

    if (currentFrame.progress === 'continue' || currentFrame.progress === 'end') {
      // Got a complete stanza — emit progress update
      const update = progressFrameToSnapshot(currentFrame)
      Object.assign(snapshot, update)

      const { percent, estimatedRemainingMs } = computeProgress(
        snapshot.outTimeMs,
        snapshot.expectedDurationMs,
        snapshot.speed,
      )
      if (snapshot.frame !== null && snapshot.totalFrames !== null && snapshot.totalFrames > 0) {
        snapshot.percent = Math.min(100, Math.round((snapshot.frame / snapshot.totalFrames) * 10_000) / 100)
        snapshot.estimatedRemainingMs = snapshot.fps !== null && snapshot.fps > 0
          ? Math.max(0, Math.round(((snapshot.totalFrames - snapshot.frame) / snapshot.fps) * 1000))
          : estimatedRemainingMs
      } else {
        snapshot.percent = percent
        snapshot.estimatedRemainingMs = estimatedRemainingMs
      }

      callbacks.onProgress({ ...snapshot })

      // If 'end' stanza and process is still running, it will exit soon
      if (currentFrame.progress === 'end' && !cancelled) {
        snapshot.phase = 'completed'
      }

      // Reset for next stanza
      currentFrame = {}
    }
  })

  // ---- Pipe stderr to log file ----

  child.stderr!.pipe(logStream)

  // ---- Handle exit ----

  child.on('exit', (code, signal) => {
    if (forceKillTimeout) {
      clearTimeout(forceKillTimeout)
      forceKillTimeout = null
    }

    snapshot.endedAt = Date.now()
    snapshot.exitCode = code
    snapshot.signal = signal

    // Determine final phase
    if (cancelled) {
      snapshot.phase = 'cancelled'
    } else if (code === 0 && snapshot.phase !== 'failed') {
      snapshot.phase = 'completed'
    } else {
      snapshot.phase = 'failed'
    }

    // Read last ~500 chars of log for error summary
    if (snapshot.phase === 'failed') {
      snapshot.errorSummary = extractErrorSummary(logPath)
    }

    logStream.write(`\n--- Job ${snapshot.phase} ---\n`)
    logStream.write(`Exit code: ${code}, Signal: ${signal ?? 'none'}\n`)
    logStream.write(`Ended: ${new Date(snapshot.endedAt).toISOString()}\n`)
    logStream.end()

    callbacks.onFinish({ ...snapshot })
  })

  // ---- Handle spawn error ----

  child.on('error', (err) => {
    snapshot.phase = 'failed'
    snapshot.endedAt = Date.now()
    snapshot.errorSummary = err.message
    snapshot.exitCode = -1
    logStream.write(`\n=== Spawn error: ${err.message} ===\n`)
    logStream.end()

    callbacks.onFinish({ ...snapshot })
  })

  return { snapshot: { ...snapshot }, cancel }
}

// ---- Helpers ----

/**
 * Builds the final argument list from user args + overwrite + progress flags.
 *
 * Inserts `-y` at the front if overwrite mode is 'replace' and not already present.
 * Appends progress-reporting args at the end (before the output path).
 */
function buildFinalArgs(userArgs: string[], overwriteMode: 'replace' | 'fail'): string[] {
  const args = [...userArgs]

  // Add -y for overwrite (if not already present)
  if (overwriteMode === 'replace' && !args.includes('-y')) {
    // Insert -y after the first global option or at position 0
    args.unshift('-y')
  }

  // Remove existing progress-related args (they will be re-added at the correct position)
  const filtered = filterExistingProgress(args)

  // Append progress args
  filtered.push(...PROGRESS_ARGS)

  return filtered
}

const PROGRESS_FLAGS = new Set([
  '-progress', '-nostats', '-stats_period',
])

function filterExistingProgress(args: string[]): string[] {
  const result: string[] = []
  for (let i = 0; i < args.length; i++) {
    if (PROGRESS_FLAGS.has(args[i])) {
      i++ // skip the value for -progress and -stats_period
      continue
    }
    result.push(args[i])
  }
  return result
}

function extractErrorSummary(logPath: string): string {
  try {
    const content = fs.readFileSync(logPath, 'utf-8')
    // Grab the last 5 non-empty lines as a summary
    const lines = content.split('\n').filter((l) => l.trim())
    return lines.slice(-5).join('\n') || '(empty log)'
  } catch {
    return '(unable to read log)'
  }
}
