// ============================================================
// DesktopApp — 承载共享工作台的 Electron 桌面壳层。
// 桌面状态栏独立于移植网页，固定作为工作台下方的壳层区域。
// ============================================================

import { WorkbenchApp } from '@ffcodec/workbench'
import { PlatformProvider } from '@ffcodec/platform-api'
import { desktopPlatform } from './desktop-platform'
import { FFmpegStatusBar } from './components/FFmpegStatusBar'

export function DesktopApp() {
  return (
    <PlatformProvider adapter={desktopPlatform}>
      <div className="app-shell desktop-shell">
        <main className="desktop-shell__content">
          <WorkbenchApp />
        </main>
        <FFmpegStatusBar />
      </div>
    </PlatformProvider>
  )
}
