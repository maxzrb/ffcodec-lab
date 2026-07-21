// ============================================================
// Electron Main Process — FFCodec Lab Desktop
// ============================================================

import { app, BrowserWindow } from 'electron'
import { createMainWindow, getMainWindow } from './create-window'

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
  createMainWindow()

  // macOS: 点击 dock 图标时如果无窗口则重建
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

// 所有窗口关闭时退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
