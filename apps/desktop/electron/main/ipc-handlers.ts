// ============================================================
// IPC Handlers — registers all main-process ipcMain.handle().
// Phase 6: file dialogs + FFmpeg detection + shell helpers.
// Phase 9: FFmpeg job execution (start/cancel/query).
// ============================================================

import { ipcMain, dialog, shell, BrowserWindow, net, app } from 'electron'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { detectAllFFmpegVersions, detectAudioEncoderCapabilities, detectFFmpeg, detectFFmpegTools, detectFilterCapabilities } from './ffmpeg-detect'
import {
  initStore,
  getItem as storageGetItem,
  setItem as storageSetItem,
  removeItem as storageRemoveItem,
  keys as storageKeys,
  getMode as storageGetMode,
  getIniPath as storageGetIniPath,
  switchMode as storageSwitchMode,
  importFromMap as storageImportFromMap,
} from './storage/ini-store'
import {
  launchJob,
  cancelActiveJob,
  getActiveJobSnapshot,
  getJobSnapshot,
  emitHistoryChanged,
} from './ffmpeg/job-manager'
import { probeMedia } from './ffmpeg/probe-media'
import type { FFmpegJobStartRequest } from './ffmpeg/types'
import {
  clearEncodingHistory,
  deleteEncodingHistoryItem,
  getEncodingHistoryItem,
  isManagedLogPath,
  listEncodingHistory,
  readEncodingLog,
} from './history-store'
import { LOCKED_WINDOW_MINIMUM, UNLOCKED_WINDOW_MINIMUM } from './create-window'
import {
  getHardwareMonitorState,
  getLatestHardwareSnapshot,
  installPawnIo,
  requestHardwareSnapshot,
  setHardwareMonitorInterval,
  startHardwareMonitor,
  stopHardwareMonitor,
} from './hardware-monitor/process-manager'

// ---- Media file filters for open/save dialogs ----

const VIDEO_FILTERS: Electron.FileFilter[] = [
  {
    name: 'Media Files',
    extensions: [
      'mp4', 'mkv', 'mov', 'avi', 'webm', 'ts', 'flv',
      'm4v', 'wmv', 'mpg', 'mpeg', 'ogv', '3gp', '3g2',
      'm2ts', 'mts', 'vob', 'divx', 'asf', 'rm', 'rmvb',
    ],
  },
  {
    name: 'All Files',
    extensions: ['*'],
  },
]

// ---- Helpers ----

function getFocusedWin(): BrowserWindow | null {
  return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0] ?? null
}

// ---- Dialog IPC handlers ----

function registerDialogHandlers(): void {
  ipcMain.handle('dialog:openFile', async (_event, opts: { defaultPath?: string }) => {
    const win = getFocusedWin()
    const result = await dialog.showOpenDialog(win!, {
      title: 'Select a media file',
      defaultPath: opts.defaultPath,
      properties: ['openFile'],
      filters: VIDEO_FILTERS,
    })
    return {
      canceled: result.canceled,
      filePath: result.filePaths[0] ?? undefined,
    }
  })

  ipcMain.handle('dialog:openFiles', async (_event, opts: { defaultPath?: string }) => {
    const win = getFocusedWin()
    const result = await dialog.showOpenDialog(win!, {
      title: 'Select media files',
      defaultPath: opts.defaultPath,
      properties: ['openFile', 'multiSelections'],
      filters: VIDEO_FILTERS,
    })
    return {
      canceled: result.canceled,
      filePaths: result.filePaths.length > 0 ? result.filePaths : undefined,
    }
  })

  ipcMain.handle('dialog:saveFile', async (_event, opts: { defaultPath?: string }) => {
    const win = getFocusedWin()
    const result = await dialog.showSaveDialog(win!, {
      title: 'Save output as',
      defaultPath: opts.defaultPath,
      filters: VIDEO_FILTERS,
    })
    return {
      canceled: result.canceled,
      filePath: result.filePath ?? undefined,
    }
  })

  ipcMain.handle('dialog:openDirectory', async (_event, opts: { defaultPath?: string }) => {
    const win = getFocusedWin()
    const result = await dialog.showOpenDialog(win!, {
      title: 'Select a folder',
      defaultPath: opts.defaultPath,
      properties: ['openDirectory'],
    })
    return {
      canceled: result.canceled,
      filePath: result.filePaths[0] ?? undefined,
    }
  })
}

// ---- FFmpeg detection IPC handler ----

function registerFFmpegHandlers(): void {
  ipcMain.handle('ffmpeg:detect', async (_event, customPath?: string) => {
    return detectFFmpeg(customPath)
  })

  /** 返回 ffmpeg 目录中三个必备工具的存在性。 */
  ipcMain.handle('ffmpeg:toolsInfo', async (_event, customPath?: string) => {
    return detectFFmpegTools(customPath)
  })

  /** ffprobe 完整探测媒体文件，返回所有流和格式信息。 */
  ipcMain.handle('ffmpeg:probe', async (_event, ffmpegPath: string, inputPath: string) => {
    if (typeof ffmpegPath !== 'string' || typeof inputPath !== 'string' || !ffmpegPath || !inputPath) {
      return null
    }
    return probeMedia(ffmpegPath, inputPath)
  })

  /** 列出所有检测到的 ffmpeg 版本（bundled + PATH，自定义排最前）。 */
  ipcMain.handle('ffmpeg:listVersions', async (_event, customPath?: string) => {
    return detectAllFFmpegVersions(customPath)
  })
}

// ---- Shell helpers ----

function registerShellHandlers(): void {
  ipcMain.handle('shell:openPath', async (_event, targetPath: string) => {
    const error = await shell.openPath(targetPath)
    return error // empty string on success, error message on failure
  })

  ipcMain.handle('shell:revealInFolder', (_event, targetPath: string) => {
    if (typeof targetPath !== 'string' || targetPath.trim() === '') return
    shell.showItemInFolder(targetPath)
  })

  ipcMain.handle('shell:openExternal', async (_event, url: string) => {
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return // deny non-http URLs
    }
    await shell.openExternal(url)
  })
}

// ---- FFmpeg job execution (Phase 9) ----

function registerFFmpegJobHandlers(): void {
  /** Start a new encoding job. */
  ipcMain.handle('ffmpeg:startJob', async (_event, request: FFmpegJobStartRequest) => {
    const result = await launchJob(request)
    return result
  })

  /** Cancel the active job. */
  ipcMain.handle('ffmpeg:cancelJob', async () => {
    return cancelActiveJob()
  })

  /** Get active job snapshot (for renderer on mount/reconnect). */
  ipcMain.handle('ffmpeg:getActiveJob', async () => {
    return getActiveJobSnapshot()
  })

  /** Get a specific job snapshot by ID. */
  ipcMain.handle('ffmpeg:getJob', async (_event, jobId: string) => {
    return getJobSnapshot(jobId)
  })
}

// ---- Phase 11：历史与日志 ----

function registerHistoryHandlers(): void {
  ipcMain.handle('history:list', async () => listEncodingHistory())

  ipcMain.handle('history:readLog', async (_event, historyId: string) => {
    if (typeof historyId !== 'string' || !historyId) {
      return { ok: false, error: 'Invalid history ID.' }
    }
    return readEncodingLog(historyId)
  })

  ipcMain.handle('history:openLog', async (_event, historyId: string) => {
    const item = getEncodingHistoryItem(historyId)
    if (!item) return { ok: false, error: 'History item not found.' }
    if (!isManagedLogPath(item.logPath)) return { ok: false, error: 'Invalid log path.' }
    const error = await shell.openPath(item.logPath)
    return error ? { ok: false, error } : { ok: true }
  })

  ipcMain.handle('history:revealOutput', async (_event, historyId: string) => {
    const item = getEncodingHistoryItem(historyId)
    const outputPath = item?.outputPaths[0]
    if (!outputPath) return { ok: false, error: 'Output path is unavailable.' }
    shell.showItemInFolder(outputPath)
    return { ok: true }
  })

  ipcMain.handle('history:delete', async (_event, historyId: string) => {
    const deleted = deleteEncodingHistoryItem(historyId)
    if (deleted) emitHistoryChanged()
    return { ok: deleted, error: deleted ? undefined : 'History item not found.' }
  })

  ipcMain.handle('history:clear', async () => {
    const count = clearEncodingHistory()
    emitHistoryChanged()
    return { ok: true, count }
  })
}

function getSenderWindow(event: Electron.IpcMainInvokeEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender)
}

function windowState(win: BrowserWindow, sizeUnlocked: boolean) {
  return {
    maximized: win.isMaximized(),
    sizeUnlocked,
  }
}

// ---- 自定义标题栏与窗口尺寸锁 ----

function registerWindowHandlers(): void {
  let sizeUnlocked = false

  ipcMain.handle('window:getState', (event) => {
    const win = getSenderWindow(event)
    return win ? windowState(win, sizeUnlocked) : { maximized: false, sizeUnlocked }
  })

  ipcMain.handle('window:setSizeUnlocked', (event, unlocked: boolean) => {
    const win = getSenderWindow(event)
    if (!win) return { maximized: false, sizeUnlocked }

    sizeUnlocked = unlocked === true
    const minimum = sizeUnlocked ? UNLOCKED_WINDOW_MINIMUM : LOCKED_WINDOW_MINIMUM
    win.setMinimumSize(minimum.width, minimum.height)

    if (!sizeUnlocked && !win.isMaximized()) {
      const [width, height] = win.getSize()
      win.setSize(Math.max(width, minimum.width), Math.max(height, minimum.height), true)
    }
    return windowState(win, sizeUnlocked)
  })

  ipcMain.handle('window:minimize', (event) => getSenderWindow(event)?.minimize())
  ipcMain.handle('window:toggleMaximize', (event) => {
    const win = getSenderWindow(event)
    if (!win) return { maximized: false, sizeUnlocked }
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
    return windowState(win, sizeUnlocked)
  })
  ipcMain.handle('window:close', (event) => getSenderWindow(event)?.close())
}

// ---- Desktop 使用统计（单设备 4 小时最多计数一次，失败不影响功能） ----

const VISIT_THROTTLE_MS = 4 * 60 * 60 * 1_000
let lastVisitCountAt = 0
let usageStatsRequest: Promise<{ total: number; today: number } | null> | null = null

async function readVisitCountTime(): Promise<number> {
  try {
    const raw = await readFile(path.join(app.getPath('userData'), 'visit-count.json'), 'utf8')
    const parsed = JSON.parse(raw) as { countedAt?: unknown }
    return typeof parsed.countedAt === 'number' && Number.isFinite(parsed.countedAt) && parsed.countedAt > 0 && parsed.countedAt <= Date.now()
      ? parsed.countedAt
      : 0
  } catch {
    return 0
  }
}

async function saveVisitCountTime(countedAt: number): Promise<void> {
  try {
    const userData = app.getPath('userData')
    await mkdir(userData, { recursive: true })
    await writeFile(path.join(userData, 'visit-count.json'), JSON.stringify({ countedAt }), 'utf8')
  } catch {
    // 统计持久化失败不影响 Desktop 功能；进程内时间戳仍可避免重复上报。
  }
}

async function requestUsageStats(): Promise<{ total: number; today: number } | null> {
  const persistedAt = await readVisitCountTime()
  const previousCountAt = Math.max(lastVisitCountAt, persistedAt)
  const shouldCount = Date.now() - previousCountAt >= VISIT_THROTTLE_MS
  try {
    const endpoint = shouldCount
      ? 'https://fflab.loliland.cn/api/visits'
      : 'https://fflab.loliland.cn/api/visits?count=false'
    const response = await net.fetch(endpoint, {
      headers: {
        Origin: 'https://fflab.loliland.cn',
        Referer: 'https://fflab.loliland.cn/',
      },
      signal: AbortSignal.timeout(5_000),
    })
    if (!response.ok) return null

    const payload = await response.json() as { total?: unknown; today?: unknown }
    if (
      typeof payload.total !== 'number' || !Number.isFinite(payload.total) ||
      typeof payload.today !== 'number' || !Number.isFinite(payload.today)
    ) return null

    if (shouldCount) {
      lastVisitCountAt = Date.now()
      await saveVisitCountTime(lastVisitCountAt)
    }
    return { total: payload.total, today: payload.today }
  } catch {
    return null
  }
}

function registerUsageStatsHandler(): void {
  ipcMain.handle('usage:getStats', () => {
    if (!usageStatsRequest) {
      usageStatsRequest = requestUsageStats().finally(() => { usageStatsRequest = null })
    }
    return usageStatsRequest
  })
  ipcMain.handle('ffmpeg:audioCapabilities', async (_event, customPath?: string) => {
    return detectAudioEncoderCapabilities(customPath)
  })
  ipcMain.handle('ffmpeg:filterCapabilities', async (_event, customPath?: string) => {
    return detectFilterCapabilities(customPath)
  })
}

// ---- 用户偏好持久化（INI store）----

function registerStorageIpcHandlers(): void {
  // Sync reads — fast, just lookups from the in-memory cache
  ipcMain.on('storage:getItem', (event, key: string) => {
    event.returnValue = storageGetItem(key)
  })
  ipcMain.on('storage:keys', (event) => {
    event.returnValue = storageKeys()
  })

  // Async writes
  ipcMain.handle('storage:setItem', (_event, key: string, value: string) => {
    storageSetItem(key, value)
  })
  ipcMain.handle('storage:removeItem', (_event, key: string) => {
    storageRemoveItem(key)
  })

  // Mode
  ipcMain.handle('storage:getMode', () => ({
    mode: storageGetMode(),
    path: storageGetIniPath(),
  }))
  ipcMain.handle('storage:setMode', (_event, newMode: string) => {
    if (newMode !== 'portable' && newMode !== 'user') {
      return { ok: false, error: `Unknown mode: ${newMode}` }
    }
    return storageSwitchMode(newMode)
  })

  // One-time import from localStorage
  ipcMain.handle('storage:import', (_event, entries: [string, string][]) => {
    storageImportFromMap(entries)
  })
}

// ---- LibreHardwareMonitor 性能采集 ----

function registerHardwareMonitorHandlers(): void {
  ipcMain.handle('hardware-monitor:getState', () => getHardwareMonitorState())
  ipcMain.handle('hardware-monitor:start', (_event, intervalMs?: number) =>
    startHardwareMonitor(typeof intervalMs === 'number' ? intervalMs : undefined))
  ipcMain.handle('hardware-monitor:stop', async () => {
    await stopHardwareMonitor()
    return getHardwareMonitorState()
  })
  ipcMain.handle('hardware-monitor:getSnapshot', () => getLatestHardwareSnapshot())
  ipcMain.handle('hardware-monitor:installPawnIo', () => installPawnIo())
  ipcMain.handle('hardware-monitor:requestSnapshot', () => requestHardwareSnapshot())
  ipcMain.handle('hardware-monitor:setInterval', (_event, intervalMs: number) =>
    setHardwareMonitorInterval(intervalMs))
}

// ---- Register all ----

export function registerIpcHandlers(): void {
  initStore()
  registerWindowHandlers()
  registerDialogHandlers()
  registerFFmpegHandlers()
  registerShellHandlers()
  registerFFmpegJobHandlers()
  registerHistoryHandlers()
  registerUsageStatsHandler()
  registerStorageIpcHandlers()
  registerHardwareMonitorHandlers()
}
