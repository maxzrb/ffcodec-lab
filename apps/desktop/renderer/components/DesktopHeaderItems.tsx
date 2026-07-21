// ============================================================
// DesktopHeaderItems — FFmpeg status indicator for the header.
// Phase 5: always shows "FFmpeg: checking..." placeholder.
// Phase 9+: displays real FFmpeg version/status after IPC check.
// ============================================================

import type { ReactNode } from 'react'
import { useI18n } from '@ffcodec/workbench'

export function DesktopHeaderItems(): ReactNode {
  const { locale } = useI18n()
  return (
    <span className="desktop-status-pill">
      {locale === 'zh-CN' ? 'FFmpeg: 未检测' : 'FFmpeg: checking...'}
    </span>
  )
}
