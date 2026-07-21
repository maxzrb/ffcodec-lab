// ============================================================
// DesktopApp — thin Electron host wrapping the shared WorkbenchApp.
// Phase 4: renders the same workbench as the web app.
// ============================================================

import { WorkbenchApp } from '@ffcodec/workbench'
import { PlatformProvider } from '@ffcodec/platform-api'
import { desktopPlatform } from './desktop-platform'

export function DesktopApp() {
  return (
    <PlatformProvider adapter={desktopPlatform}>
      <div className="app-shell">
        <WorkbenchApp />
      </div>
    </PlatformProvider>
  )
}
