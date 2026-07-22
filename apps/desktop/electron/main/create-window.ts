// ============================================================
// BrowserWindow factory — enforces security policy.
// ============================================================

import { BrowserWindow, shell, app } from 'electron'
import { join } from 'path'

let mainWindow: BrowserWindow | null = null

export const LOCKED_WINDOW_MINIMUM = { width: 1280, height: 720 } as const
export const UNLOCKED_WINDOW_MINIMUM = { width: 640, height: 480 } as const

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

export function createMainWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: LOCKED_WINDOW_MINIMUM.width,
    minHeight: LOCKED_WINDOW_MINIMUM.height,
    frame: false,
    titleBarStyle: 'hidden',
    show: false, // ready-to-show 后再显示，避免白屏闪烁
    title: 'FFCodec Lab',
    // 显式指定窗口图标，避免便携运行时依赖 Windows 对 EXE 图标的缓存结果。
    icon: join(__dirname, '../renderer/assets/ffcodec-lab-avatar.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  })

  // 窗口准备好后再显示
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // 外部链接在默认浏览器打开，防止 Electron 内导航到外部站点
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url).catch(() => {
        // 静默忽略打开失败
      })
    }
    return { action: 'deny' }
  })

  // 阻止任意导航（只允许加载本地渲染器）
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowed =
      !app.isPackaged ||
      url.startsWith('file://') ||
      url.startsWith('http://localhost')
    if (!allowed) {
      event.preventDefault()
    }
  })

  // 禁止创建额外窗口
  app.on('web-contents-created', (_event, contents) => {
    contents.on('will-attach-webview', (e) => {
      e.preventDefault()
    })
    contents.setWindowOpenHandler(() => ({ action: 'deny' }))
  })

  // 加载渲染器
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}
