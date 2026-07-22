// ============================================================
// FFmpeg Job Manager — singleton managing one active job.
// Phase 9 v1 restriction: only one concurrent encoding job.
// ============================================================

import { app } from 'electron'
import type { BrowserWindow } from 'electron'
import path from 'node:path'
import crypto from 'node:crypto'
import { detectFFmpeg, tryFFmpegPath } from '../ffmpeg-detect'
import { startJob } from './executor'
import { validateBeforeExecution } from './validation'
import { probeMediaProgress } from './probe-media'
import {
  createEncodingHistory,
  finishEncodingHistory,
  listEncodingHistory,
  recordUserCancel,
} from '../history-store'
import type {
  FFmpegJobSnapshot,
  FFmpegJobStartRequest,
  FFmpegJobPhase,
  FFmpegJobState,
} from './types'

// ---- Internal state type ----

interface InternalJobState extends FFmpegJobState {
  _cancelFn?: () => void
}

// ---- Singleton state ----

let activeJob: InternalJobState | null = null
let mainWindow: BrowserWindow | null = null

// ---- Public API ----

/**
 * Sets the BrowserWindow reference used for IPC event dispatch.
 * Must be called once after the main window is created.
 */
export function setMainWindow(win: BrowserWindow): void {
  mainWindow = win
}

/**
 * Launches a new FFmpeg encoding job.
 * Returns the initial snapshot or an error description.
 */
export async function launchJob(
  request: FFmpegJobStartRequest,
): Promise<{ ok: true; snapshot: FFmpegJobSnapshot } | { ok: false; error: string }> {
  // ---- Concurrency check ----
  if (activeJob !== null) {
    return {
      ok: false,
      error: 'Another encoding job is already running. Cancel it before starting a new one.',
    }
  }

  // ---- Resolve FFmpeg path ----
  let ffmpegPath: string

  if (request.customFfmpegPath) {
    const info = await tryFFmpegPath(request.customFfmpegPath, 'custom')
    if (!info.found) {
      return {
        ok: false,
        error: `Custom FFmpeg path is not valid: ${info.error ?? 'unknown error'}`,
      }
    }
    ffmpegPath = info.path
  } else {
    const info = await detectFFmpeg()
    if (!info.found) {
      return {
        ok: false,
        error: 'FFmpeg not found. Please install FFmpeg or set a custom path in Settings.',
      }
    }
    ffmpegPath = info.path
  }

  // ---- Pre-execution validation ----
  const { executionPlan: plan, overwriteMode } = request

  const validation = validateBeforeExecution(plan, overwriteMode)
  if (!validation.ok) {
    return {
      ok: false,
      error: validation.errors.join('\n'),
    }
  }

  // 总帧优先由 ffprobe 提供，无法探测时不阻止编码。
  const progressBasis = await probeMediaProgress(ffmpegPath, plan.inputPaths[0])
  const enrichedRequest: FFmpegJobStartRequest = {
    ...request,
    executionPlan: {
      ...plan,
      expectedDurationMs: plan.expectedDurationMs ?? progressBasis.durationMs ?? undefined,
      expectedTotalFrames: progressBasis.totalFrames ?? undefined,
    },
  }

  // ---- Create job ----
  const jobId = crypto.randomUUID()
  const createdAt = Date.now()
  const logDir = path.join(app.getPath('userData'), 'logs')

  const { snapshot, cancel } = startJob(
    enrichedRequest,
    ffmpegPath,
    logDir,
    jobId,
    createdAt,
    {
      onProgress: (snap) => {
        activeJob!.snapshot = snap
        emitProgress(snap)
      },
      onFinish: (snap) => {
        activeJob!.snapshot = snap
        finishEncodingHistory(snap)
        emitProgress(snap)
        emitHistoryChanged()
        activeJob = null
      },
    },
  )

  // Store active job
  activeJob = {
    snapshot,
    process: null, // executor manages the process internally
    cancelRequested: false,
    cancelTimeoutId: null,
  }

  // Attach cancel to the stored state
  activeJob._cancelFn = cancel

  // Phase 11：只在关键状态写入历史，实时进度不会触发持久化。
  createEncodingHistory(snapshot)
  emitHistoryChanged()

  emitProgress(snapshot)

  return { ok: true, snapshot: { ...snapshot } }
}

/**
 * Cancels the currently active job (if any).
 */
export function cancelActiveJob(): { ok: boolean; error?: string } {
  if (!activeJob) {
    return { ok: false, error: 'No active job to cancel.' }
  }

  const phase = activeJob.snapshot.phase
  if (phase === 'completed' || phase === 'failed' || phase === 'cancelled') {
    return { ok: false, error: `Job is already ${phase}.` }
  }

  if (activeJob._cancelFn) {
    recordUserCancel(activeJob.snapshot.jobId)
    activeJob._cancelFn()
    activeJob.cancelRequested = true
    emitHistoryChanged()
  }

  return { ok: true }
}

/**
 * Returns the snapshot of the active job, or null if no job is running.
 */
export function getActiveJobSnapshot(): FFmpegJobSnapshot | null {
  return activeJob ? { ...activeJob.snapshot } : null
}

/**
 * Returns the snapshot for a specific jobId, or null.
 */
export function getJobSnapshot(jobId: string): FFmpegJobSnapshot | null {
  if (activeJob && activeJob.snapshot.jobId === jobId) {
    return { ...activeJob.snapshot }
  }
  const history = listEncodingHistory().find((item) => item.jobId === jobId)
  return history ? { ...history.snapshot } : null
}

/**
 * Checks whether there is an active (non-terminal) job.
 */
export function hasActiveJob(): boolean {
  if (!activeJob) return false
  const terminal: FFmpegJobPhase[] = ['completed', 'failed', 'cancelled']
  return !terminal.includes(activeJob.snapshot.phase)
}

/**
 * Force-cancels any active job. Called during app shutdown.
 * Returns a Promise that resolves when cleanup is done.
 */
export async function shutdownActiveJob(): Promise<void> {
  if (!activeJob) return

  const phase = activeJob.snapshot.phase
  if (phase === 'completed' || phase === 'failed' || phase === 'cancelled') {
    activeJob = null
    return
  }

  // Initiate cancel
  if (activeJob._cancelFn) {
    activeJob._cancelFn()
    activeJob.cancelRequested = true
  }

  // Wait up to 3 seconds for graceful shutdown
  const deadline = Date.now() + 3000
  while (Date.now() < deadline) {
    if (!activeJob || ['completed', 'failed', 'cancelled'].includes(activeJob.snapshot.phase)) {
      break
    }
    await new Promise((r) => setTimeout(r, 100))
  }

  activeJob = null
}

// ---- Internal helpers ----

function emitProgress(snapshot: FFmpegJobSnapshot): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('ffmpeg:job-updated', snapshot)
  }
}

export function emitHistoryChanged(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('history:changed')
  }
}
