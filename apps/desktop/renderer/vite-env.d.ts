/// <reference types="vite/client" />

/**
 * Types shared between preload and renderer for the desktop platform.
 * ALL types below must stay in sync with electron/preload/index.ts.
 *
 * NOTE: Types used by renderer .ts/.tsx files MUST be inside `declare global`
 * so they are available without explicit imports across the project.
 */

declare global {
  interface FFmpegJobStartRequest {
    executionPlan: {
      args: string[]
      inputPaths: string[]
      outputPaths: string[]
      expectedDurationMs?: number
      expectedTotalFrames?: number
    }
    customFfmpegPath?: string
    overwriteMode: 'replace' | 'fail'
  }

  interface FFmpegJobSnapshot {
    jobId: string
    phase: 'created' | 'starting' | 'running' | 'cancelling' | 'completed' | 'failed' | 'cancelled'
    createdAt: number
    startedAt: number | null
    endedAt: number | null
    inputPaths: string[]
    outputPaths: string[]
    frame: number | null
    totalFrames: number | null
    fps: number | null
    bitrate: string | null
    speed: number | null
    outTimeMs: number | null
    expectedDurationMs: number | null
    percent: number | null
    estimatedRemainingMs: number | null
    totalSize: number | null
    exitCode: number | null
    signal: string | null
    errorSummary: string | null
    logPath: string
  }

  type JobStartResult = { ok: true; snapshot: FFmpegJobSnapshot } | { ok: false; error: string }

  type CancelResult = { ok: boolean; error?: string }

  interface EncodingLogEvent {
    id: string
    timestamp: number
    kind: 'user-start' | 'ffmpeg-start' | 'user-cancel' | 'user-end' | 'ffmpeg-error'
    level: 'info' | 'action' | 'success' | 'warning' | 'error'
    message: string
    detail?: string
  }

  interface EncodingHistoryItem {
    historyId: string
    jobId: string
    createdAt: number
    updatedAt: number
    status: FFmpegJobSnapshot['phase']
    inputPaths: string[]
    outputPaths: string[]
    startedAt: number | null
    endedAt: number | null
    durationMs: number | null
    exitCode: number | null
    logPath: string
    errorSummary: string | null
    events: EncodingLogEvent[]
    snapshot: FFmpegJobSnapshot
  }

  interface FFmpegInfo {
    found: boolean
    version?: string
    fullVersion?: string
    path: string
    source: 'custom' | 'bundled' | 'path' | 'none'
    error?: string
  }

  interface Window {
    electronAPI?: {
      platform: 'win32' | 'darwin' | 'linux'
      versions: {
        node: string
        chrome: string
        electron: string
      }
      showOpenDialog: (opts: {
        kind: 'file' | 'files' | 'save' | 'directory'
        defaultPath?: string
      }) => Promise<{ canceled: boolean; filePath?: string; filePaths?: string[] }>
      detectFFmpeg: (customPath?: string) => Promise<FFmpegInfo>

      // Phase 9: FFmpeg job execution
      startFFmpegJob: (request: FFmpegJobStartRequest) => Promise<JobStartResult>
      cancelFFmpegJob: () => Promise<CancelResult>
      getActiveFFmpegJob: () => Promise<FFmpegJobSnapshot | null>
      getFFmpegJob: (jobId: string) => Promise<FFmpegJobSnapshot | null>
      onFFmpegJobUpdated: (callback: (snapshot: FFmpegJobSnapshot) => void) => () => void

      // Phase 11：编码历史与日志
      listEncodingHistory: () => Promise<EncodingHistoryItem[]>
      readEncodingLog: (historyId: string) => Promise<{ ok: true; content: string } | { ok: false; error: string }>
      openEncodingLog: (historyId: string) => Promise<{ ok: boolean; error?: string }>
      revealEncodingOutput: (historyId: string) => Promise<{ ok: boolean; error?: string }>
      deleteEncodingHistory: (historyId: string) => Promise<{ ok: boolean; error?: string }>
      clearEncodingHistory: () => Promise<{ ok: true; count: number }>
      onEncodingHistoryChanged: (callback: () => void) => () => void

      revealInFolder: (path: string) => Promise<string>
      openExternal: (url: string) => Promise<void>
    }
  }
}

export {}
