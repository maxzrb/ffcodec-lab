// ============================================================
// DesktopApp — 承载共享工作台的 Electron 桌面壳层。
// 桌面状态栏独立于移植网页，固定作为工作台下方的壳层区域。
// ============================================================

import { WorkbenchApp } from '@ffcodec/workbench'
import { PlatformProvider } from '@ffcodec/platform-api'
import { desktopPlatform } from './desktop-platform'
import { FFmpegStatusBar } from './components/FFmpegStatusBar'
import { DesktopVisitCounter } from './components/DesktopVisitCounter'
import { DesktopTitleBar } from './components/DesktopTitleBar'
import { HardwareMonitorProvider, useHardwareMonitor } from './hardware-monitor/HardwareMonitorContext'
import { PerformancePage } from './hardware-monitor/PerformancePage'
import { PerformanceSummary } from './hardware-monitor/PerformanceSummary'

export function DesktopApp() {
  return (
    <PlatformProvider adapter={desktopPlatform}>
      <HardwareMonitorProvider>
        <DesktopShell />
      </HardwareMonitorProvider>
    </PlatformProvider>
  )
}

function DesktopShell() {
  const { pageOpen } = useHardwareMonitor()
  return (
      <div className="app-shell desktop-shell">
        <DesktopTitleBar />
        <main className="desktop-shell__content">
          <WorkbenchApp footerItems={<DesktopVisitCounter />} commandInspectorFooter={<PerformanceSummary />} />
        </main>
        <FFmpegStatusBar />
        {pageOpen && <PerformancePage />}
      </div>
  )
}
