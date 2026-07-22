// ============================================================
// Preload script — exposes limited API via contextBridge.
// Phase 6: typed file dialog, FFmpeg detection, shell helpers.
// Phase 9: FFmpeg job execution with progress callbacks.
// ============================================================

import { contextBridge, ipcRenderer } from 'electron'

// ---- Shared types (keep in sync with main process) ----

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

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform as 'win32' | 'darwin' | 'linux',
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },

  // File dialogs (kind maps to IPC channel)
  showOpenDialog: (opts: { kind: 'file' | 'files' | 'save' | 'directory'; defaultPath?: string }) => {
    const channelMap: Record<string, string> = {
      file: 'dialog:openFile',
      files: 'dialog:openFiles',
      save: 'dialog:saveFile',
      directory: 'dialog:openDirectory',
    }
    const channel = channelMap[opts.kind] ?? 'dialog:openFile'
    return ipcRenderer.invoke(channel, { defaultPath: opts.defaultPath }) as Promise<{
      canceled: boolean
      filePath?: string
      filePaths?: string[]
    }>
  },

  // FFmpeg detection
  detectFFmpeg: (customPath?: string) =>
    ipcRenderer.invoke('ffmpeg:detect', customPath),

  // FFmpeg job execution (Phase 9)
  startFFmpegJob: (request: FFmpegJobStartRequest) =>
    ipcRenderer.invoke('ffmpeg:startJob', request) as Promise<JobStartResult>,

  cancelFFmpegJob: () =>
    ipcRenderer.invoke('ffmpeg:cancelJob') as Promise<CancelResult>,

  getActiveFFmpegJob: () =>
    ipcRenderer.invoke('ffmpeg:getActiveJob') as Promise<FFmpegJobSnapshot | null>,

  getFFmpegJob: (jobId: string) =>
    ipcRenderer.invoke('ffmpeg:getJob', jobId) as Promise<FFmpegJobSnapshot | null>,

  /** Subscribe to job progress updates. Returns an unsubscribe function. */
  onFFmpegJobUpdated: (callback: (snapshot: FFmpegJobSnapshot) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, snapshot: FFmpegJobSnapshot) => {
      callback(snapshot)
    }
    ipcRenderer.on('ffmpeg:job-updated', handler)
    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener('ffmpeg:job-updated', handler)
    }
  },

  // Phase 11：编码历史与日志
  listEncodingHistory: () =>
    ipcRenderer.invoke('history:list') as Promise<EncodingHistoryItem[]>,

  readEncodingLog: (historyId: string) =>
    ipcRenderer.invoke('history:readLog', historyId) as Promise<{ ok: true; content: string } | { ok: false; error: string }>,

  openEncodingLog: (historyId: string) =>
    ipcRenderer.invoke('history:openLog', historyId) as Promise<{ ok: boolean; error?: string }>,

  revealEncodingOutput: (historyId: string) =>
    ipcRenderer.invoke('history:revealOutput', historyId) as Promise<{ ok: boolean; error?: string }>,

  deleteEncodingHistory: (historyId: string) =>
    ipcRenderer.invoke('history:delete', historyId) as Promise<{ ok: boolean; error?: string }>,

  clearEncodingHistory: () =>
    ipcRenderer.invoke('history:clear') as Promise<{ ok: true; count: number }>,

  onEncodingHistoryChanged: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('history:changed', handler)
    return () => ipcRenderer.removeListener('history:changed', handler)
  },

  // Shell helpers
  revealInFolder: (targetPath: string) =>
    ipcRenderer.invoke('shell:openPath', targetPath) as Promise<string>,

  openExternal: (url: string) =>
    ipcRenderer.invoke('shell:openExternal', url) as Promise<void>,
})

// Type declaration for the renderer — keep in sync with apps/desktop/renderer/vite-env.d.ts
declare global {
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
      showOpenDialog: (opts: { kind: 'file' | 'files' | 'save' | 'directory'; defaultPath?: string }) =>
        Promise<{ canceled: boolean; filePath?: string; filePaths?: string[] }>
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
