// ============================================================
// Electron Main Process — FFCodec Lab Desktop
// Phase 9: app lifecycle — clean shutdown of active FFmpeg jobs.
// ============================================================

import { app, BrowserWindow } from 'electron'
import { createMainWindow, getMainWindow } from './create-window'
import { registerIpcHandlers } from './ipc-handlers'
import { setMainWindow, hasActiveJob, shutdownActiveJob } from './ffmpeg/job-manager'
import { getHardwareMonitorState, stopHardwareMonitor } from './hardware-monitor/process-manager'

// 仅允许单实例
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
}

app.on('second-instance', () => {
  const win = getMainWindow()
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.whenReady().then(() => {
  registerIpcHandlers()
  const win = createMainWindow()

  // Register window for IPC event dispatch (Phase 9: job progress)
  if (win) setMainWindow(win)

  // macOS: 点击 dock 图标时如果无窗口则重建
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const newWin = createMainWindow()
      if (newWin) setMainWindow(newWin)
    }
  })
})

// 所有窗口关闭时退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Phase 9: Clean up active FFmpeg job before quitting
let shutdownStarted = false
app.on('before-quit', async (event) => {
  if (!shutdownStarted && (hasActiveJob() || getHardwareMonitorState().status !== 'idle')) {
    event.preventDefault()
    shutdownStarted = true
    await shutdownActiveJob()
    await stopHardwareMonitor()
    app.quit()
  }
})
