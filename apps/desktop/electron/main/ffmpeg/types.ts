// ============================================================
// FFmpeg Job Types — Phase 9 execution engine.
//
// NOTE: ExecutionPlan is defined locally (not imported from
// @ffcodec/command-plan) because the Electron main process
// runs in CJS context and cannot load ESM workspace packages
// at runtime via externalizeDepsPlugin.
// ============================================================

/**
 * Structured execution plan — one per CommandInvocation.
 * Mirrors the type in @ffcodec/command-plan but avoids a
 * cross-package runtime dependency in the CJS main process.
 */
export interface ExecutionPlan {
  args: string[]
  inputPaths: string[]
  outputPaths: string[]
  expectedDurationMs?: number
  expectedTotalFrames?: number
}

// ---- Job lifecycle ----

export type FFmpegJobPhase =
  | 'created'
  | 'starting'
  | 'running'
  | 'cancelling'
  | 'completed'
  | 'failed'
  | 'cancelled'

// ---- Progress snapshot (sent to renderer via IPC events) ----

export interface FFmpegJobSnapshot {
  jobId: string
  commandSource?: 'generated' | 'custom'
  phase: FFmpegJobPhase
  createdAt: number
  startedAt: number | null
  endedAt: number | null
  inputPaths: string[]
  outputPaths: string[]
  /** Frame count from `-progress pipe:1`. */
  frame: number | null
  /** Total video frame count from ffprobe, exact or duration-based estimate. */
  totalFrames: number | null
  /** Current FPS. */
  fps: number | null
  /** Bitrate string (e.g. "1234.5kbits/s"). */
  bitrate: string | null
  /** Speed multiplier (e.g. 1.5 = 1.5× realtime). */
  speed: number | null
  /** Output time in microseconds from `out_time_us`. */
  outTimeUs: number | null
  /** Output time in milliseconds (derived). */
  outTimeMs: number | null
  /** Expected total duration in ms (from ffprobe or caller). */
  expectedDurationMs: number | null
  /** Progress percentage (0-100), or null if unknown. */
  percent: number | null
  /** Estimated remaining time in ms. */
  estimatedRemainingMs: number | null
  /** Total output size in bytes. */
  totalSize: number | null
  /** Process exit code (null while running). */
  exitCode: number | null
  /** Termination signal (e.g. 'SIGTERM'), or null. */
  signal: string | null
  /** Human-readable error summary for failed jobs. */
  errorSummary: string | null
  /** Path to the stderr log file on disk. */
  logPath: string
}

// ---- Request from renderer → main process ----

export interface FFmpegJobStartRequest {
  /** Structured args — ready for spawn(). */
  executionPlan: ExecutionPlan
  /** Optional ordered plans for a single logical task, such as two-pass encoding. */
  executionPlans?: ExecutionPlan[]
  /** User-configured FFmpeg path (validated by main process before use). */
  customFfmpegPath?: string
  /** Overwrite policy. */
  overwriteMode: 'replace' | 'fail'
  /** Distinguishes structured workbench jobs from freely edited commands. */
  commandSource?: 'generated' | 'custom'
}

// ---- Internal job state (not sent to renderer) ----

export interface FFmpegJobState {
  snapshot: FFmpegJobSnapshot
  process: import('child_process').ChildProcess | null
  cancelRequested: boolean
  cancelTimeoutId: ReturnType<typeof setTimeout> | null
}
