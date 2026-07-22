// ============================================================
// DesktopApp — 承载共享工作台的 Electron 桌面壳层。
// 桌面状态栏独立于移植网页，固定作为工作台下方的壳层区域。
// ============================================================

import { useEffect } from 'react'
import { AppDialogProvider, WorkbenchApp } from '@ffcodec/workbench'
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
      <AppDialogProvider>
        <HardwareMonitorProvider>
          <DesktopShell />
        </HardwareMonitorProvider>
      </AppDialogProvider>
    </PlatformProvider>
  )
}

/** One-time: seed the INI store from localStorage so it has existing values. */
function useSeedIniStore() {
  useEffect(() => {
    const api = window.electronAPI
    if (!api) return

    // If INI already has data, skip
    const existing = api.storageGetItem('ffcodec-locale')
    if (existing) return

    // Seed INI from localStorage (keep localStorage as primary source)
    const entries: [string, string][] = []
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('ffcodec')) {
          const value = localStorage.getItem(key)
          if (value) entries.push([key, value])
        }
      }
    } catch { /* ignore */ }

    if (entries.length > 0) void api.storageImport(entries)
  }, [])
}

function DesktopShell() {
  useSeedIniStore()
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
