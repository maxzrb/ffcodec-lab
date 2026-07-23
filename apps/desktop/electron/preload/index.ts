// ============================================================
// Preload script — exposes limited API via contextBridge.
// Phase 6: typed file dialog, FFmpeg detection, shell helpers.
// Phase 9: FFmpeg job execution with progress callbacks.
// ============================================================

import { contextBridge, ipcRenderer } from 'electron'
import type { HardwareMonitorStartResult, HardwareMonitorState, HardwareSnapshot, PawnIoInstallResult } from '../../shared/hardware-monitor-types'

// ---- Shared types (keep in sync with main process) ----

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

  /** 检测 ffmpeg 目录中 ffprobe / ffplay 的存在性。 */
  getFFmpegToolsInfo: (customPath?: string) =>
    ipcRenderer.invoke('ffmpeg:toolsInfo', customPath) as Promise<{
      ffmpeg: boolean
      ffprobe: boolean
      ffplay: boolean
      baseDir: string
    } | null>,

  /** 使用 ffprobe 完整探测媒体文件（返回所有流和格式信息）。 */
  probeMedia: (ffmpegPath: string, inputPath: string) =>
    ipcRenderer.invoke('ffmpeg:probe', ffmpegPath, inputPath),

  /** 列出所有检测到的 ffmpeg 版本。 */
  listFFmpegVersions: (customPath?: string) =>
    ipcRenderer.invoke('ffmpeg:listVersions', customPath) as Promise<FFmpegInfo[]>,

  getAudioEncoderCapabilities: (customPath?: string) =>
    ipcRenderer.invoke('ffmpeg:audioCapabilities', customPath) as Promise<{
      encoders: string[]
      aacOptions: string[]
    } | null>,

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

  // 自定义标题栏与窗口尺寸锁
  getWindowState: () => ipcRenderer.invoke('window:getState') as Promise<{ maximized: boolean; sizeUnlocked: boolean }>,
  setWindowSizeUnlocked: (unlocked: boolean) => ipcRenderer.invoke('window:setSizeUnlocked', unlocked) as Promise<{ maximized: boolean; sizeUnlocked: boolean }>,
  minimizeWindow: () => ipcRenderer.invoke('window:minimize') as Promise<void>,
  toggleMaximizeWindow: () => ipcRenderer.invoke('window:toggleMaximize') as Promise<{ maximized: boolean; sizeUnlocked: boolean }>,
  closeWindow: () => ipcRenderer.invoke('window:close') as Promise<void>,

  // Desktop 使用统计：只读查询，离线时返回 null。
  getUsageStats: () =>
    ipcRenderer.invoke('usage:getStats') as Promise<{ total: number; today: number } | null>,

  // LibreHardwareMonitor 只读性能监控
  getHardwareMonitorState: () =>
    ipcRenderer.invoke('hardware-monitor:getState') as Promise<HardwareMonitorState>,
  startHardwareMonitor: (intervalMs?: number) =>
    ipcRenderer.invoke('hardware-monitor:start', intervalMs) as Promise<HardwareMonitorStartResult>,
  stopHardwareMonitor: () =>
    ipcRenderer.invoke('hardware-monitor:stop') as Promise<HardwareMonitorState>,
  getHardwareSnapshot: () =>
    ipcRenderer.invoke('hardware-monitor:getSnapshot') as Promise<HardwareSnapshot | null>,
  installPawnIo: () =>
    ipcRenderer.invoke('hardware-monitor:installPawnIo') as Promise<PawnIoInstallResult>,
  requestHardwareSnapshot: () => ipcRenderer.invoke('hardware-monitor:requestSnapshot') as Promise<void>,
  setHardwareMonitorInterval: (intervalMs: number) =>
    ipcRenderer.invoke('hardware-monitor:setInterval', intervalMs) as Promise<HardwareMonitorState>,
  onHardwareSnapshot: (callback: (snapshot: HardwareSnapshot) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, snapshot: HardwareSnapshot) => callback(snapshot)
    ipcRenderer.on('hardware-monitor:snapshot', handler)
    return () => ipcRenderer.removeListener('hardware-monitor:snapshot', handler)
  },
  onHardwareMonitorStateChanged: (callback: (state: HardwareMonitorState) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: HardwareMonitorState) => callback(state)
    ipcRenderer.on('hardware-monitor:state', handler)
    return () => ipcRenderer.removeListener('hardware-monitor:state', handler)
  },

  // Shell helpers
  revealInFolder: (targetPath: string) =>
    ipcRenderer.invoke('shell:revealInFolder', targetPath) as Promise<void>,

  openExternal: (url: string) =>
    ipcRenderer.invoke('shell:openExternal', url) as Promise<void>,

  // User preference storage (INI-backed, sync reads + async writes)
  storageGetItem: (key: string): string | null =>
    ipcRenderer.sendSync('storage:getItem', key) as string | null,

  storageKeys: (): string[] =>
    ipcRenderer.sendSync('storage:keys') as string[],

  storageSetItem: (key: string, value: string): Promise<void> =>
    ipcRenderer.invoke('storage:setItem', key, value) as Promise<void>,

  storageRemoveItem: (key: string): Promise<void> =>
    ipcRenderer.invoke('storage:removeItem', key) as Promise<void>,

  storageGetMode: () =>
    ipcRenderer.invoke('storage:getMode') as Promise<{ mode: 'portable' | 'user'; path: string }>,

  storageSetMode: (mode: string) =>
    ipcRenderer.invoke('storage:setMode', mode) as Promise<{ ok: boolean; error?: string }>,

  storageImport: (entries: [string, string][]) =>
    ipcRenderer.invoke('storage:import', entries) as Promise<void>,

  onStorageModeChanged: (callback: (result: { mode: 'portable' | 'user'; path: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, result: { mode: 'portable' | 'user'; path: string }) => {
      callback(result)
    }
    ipcRenderer.on('storage:mode-changed', handler)
    return () => {
      ipcRenderer.removeListener('storage:mode-changed', handler)
    }
  },
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
      getWindowState: () => Promise<{ maximized: boolean; sizeUnlocked: boolean }>
      setWindowSizeUnlocked: (unlocked: boolean) => Promise<{ maximized: boolean; sizeUnlocked: boolean }>
      minimizeWindow: () => Promise<void>
      toggleMaximizeWindow: () => Promise<{ maximized: boolean; sizeUnlocked: boolean }>
      closeWindow: () => Promise<void>
      showOpenDialog: (opts: { kind: 'file' | 'files' | 'save' | 'directory'; defaultPath?: string }) =>
        Promise<{ canceled: boolean; filePath?: string; filePaths?: string[] }>
      detectFFmpeg: (customPath?: string) => Promise<FFmpegInfo>
      getFFmpegToolsInfo: (customPath?: string) => Promise<{ ffmpeg: boolean; ffprobe: boolean; ffplay: boolean; baseDir: string } | null>
      probeMedia: (ffmpegPath: string, inputPath: string) => Promise<Record<string, unknown> | null>
      listFFmpegVersions: (customPath?: string) => Promise<FFmpegInfo[]>
      getAudioEncoderCapabilities: (customPath?: string) => Promise<{ encoders: string[]; aacOptions: string[] } | null>

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
      storageGetMode: () => Promise<{ mode: 'portable' | 'user'; path: string }>
      storageSetMode: (mode: string) => Promise<{ ok: boolean; error?: string }>
      storageImport: (entries: [string, string][]) => Promise<void>
      onStorageModeChanged: (callback: (result: { mode: 'portable' | 'user'; path: string }) => void) => () => void
    }
  }
}
