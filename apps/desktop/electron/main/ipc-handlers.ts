// ============================================================
// IPC Handlers — registers all main-process ipcMain.handle().
// Phase 6: file dialogs + FFmpeg detection + shell helpers.
// Phase 9: FFmpeg job execution (start/cancel/query).
// ============================================================

import { ipcMain, dialog, shell, BrowserWindow, net } from 'electron'
import { detectAudioEncoderCapabilities, detectFFmpeg } from './ffmpeg-detect'
import {
  launchJob,
  cancelActiveJob,
  getActiveJobSnapshot,
  getJobSnapshot,
  emitHistoryChanged,
} from './ffmpeg/job-manager'
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
}

// ---- Shell helpers ----

function registerShellHandlers(): void {
  ipcMain.handle('shell:openPath', async (_event, targetPath: string) => {
    const error = await shell.openPath(targetPath)
    return error // empty string on success, error message on failure
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

// ---- Desktop 使用统计（只读、失败不影响功能） ----

function registerUsageStatsHandler(): void {
  ipcMain.handle('usage:getStats', async () => {
    try {
      const response = await net.fetch('https://fflab.loliland.cn/api/visits?count=false', {
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

      return { total: payload.total, today: payload.today }
    } catch {
      return null
    }
  })
  ipcMain.handle('ffmpeg:audioCapabilities', async (_event, customPath?: string) => {
    return detectAudioEncoderCapabilities(customPath)
  })
}

// ---- Register all ----

export function registerIpcHandlers(): void {
  registerWindowHandlers()
  registerDialogHandlers()
  registerFFmpegHandlers()
  registerShellHandlers()
  registerFFmpegJobHandlers()
  registerHistoryHandlers()
  registerUsageStatsHandler()
}
