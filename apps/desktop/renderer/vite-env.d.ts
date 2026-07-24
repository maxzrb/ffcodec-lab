/// <reference types="vite/client" />

import type { HardwareMonitorStartResult, HardwareMonitorState, HardwareSnapshot, PawnIoInstallResult } from '../shared/hardware-monitor-types'

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
    executionPlans?: Array<{
      args: string[]
      inputPaths: string[]
      outputPaths: string[]
      expectedDurationMs?: number
      expectedTotalFrames?: number
    }>
    customFfmpegPath?: string
    overwriteMode: 'replace' | 'fail'
    commandSource?: 'generated' | 'custom'
  }

  interface FFmpegJobSnapshot {
    jobId: string
    commandSource?: 'generated' | 'custom'
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

  interface StorageModeResult {
  mode: 'portable' | 'user'
  path: string
}

interface Window {
    electronAPI?: {
      platform: 'win32' | 'darwin' | 'linux'
      versions: {
        node: string
        chrome: string
        electron: string
      }
      getWindowState: () => Promise<{ maximized: boolean; sizeUnlocked: boolean }>
      setWindowSizeUnlocked: (unlocked: boolean) => Promise<{ maximized: boolean; sizeUnlocked: boolean }>
      minimizeWindow: () => Promise<void>
      toggleMaximizeWindow: () => Promise<{ maximized: boolean; sizeUnlocked: boolean }>
      closeWindow: () => Promise<void>
      showOpenDialog: (opts: {
        kind: 'file' | 'files' | 'save' | 'directory'
        defaultPath?: string
      }) => Promise<{ canceled: boolean; filePath?: string; filePaths?: string[] }>
      detectFFmpeg: (customPath?: string) => Promise<FFmpegInfo>
      getAudioEncoderCapabilities: (customPath?: string) => Promise<{ encoders: string[]; aacOptions: string[] } | null>
      getFilterCapabilities: (customPath?: string) => Promise<{ filters: string[] } | null>

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

      getUsageStats: () => Promise<{ total: number; today: number } | null>

      getHardwareMonitorState: () => Promise<HardwareMonitorState>
      startHardwareMonitor: (intervalMs?: number) => Promise<HardwareMonitorStartResult>
      stopHardwareMonitor: () => Promise<HardwareMonitorState>
      getHardwareSnapshot: () => Promise<HardwareSnapshot | null>
      installPawnIo: () => Promise<PawnIoInstallResult>
      requestHardwareSnapshot: () => Promise<void>
      setHardwareMonitorInterval: (intervalMs: number) => Promise<HardwareMonitorState>
      onHardwareSnapshot: (callback: (snapshot: HardwareSnapshot) => void) => () => void
      onHardwareMonitorStateChanged: (callback: (state: HardwareMonitorState) => void) => () => void

      revealInFolder: (path: string) => Promise<void>
      openExternal: (url: string) => Promise<void>

      // User preference storage (INI-backed)
      storageGetItem: (key: string) => string | null
      storageKeys: () => string[]
      storageSetItem: (key: string, value: string) => Promise<void>
      storageRemoveItem: (key: string) => Promise<void>
      storageGetMode: () => Promise<StorageModeResult>
      storageSetMode: (mode: string) => Promise<{ ok: boolean; error?: string }>
      storageImport: (entries: [string, string][]) => Promise<void>
      onStorageModeChanged: (callback: (result: StorageModeResult) => void) => () => void
    }
  }
}

export {}
