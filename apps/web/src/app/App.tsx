import { AppDialogProvider, WorkbenchApp } from '@ffcodec/workbench'
import { PlatformProvider } from '@ffcodec/platform-api'
import { webPlatform } from '../web-platform'
import { VisitCounter } from '../features/analytics/VisitCounter'

export default function App() {
  return (
    <PlatformProvider adapter={webPlatform}>
      <AppDialogProvider>
        <div className="app-shell">
          <WorkbenchApp footerItems={<VisitCounter todayLabel="今日访问" totalLabel="总计访问" />} />
        </div>
      </AppDialogProvider>
    </PlatformProvider>
  )
}
