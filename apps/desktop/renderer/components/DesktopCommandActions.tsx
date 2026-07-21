// ============================================================
// DesktopCommandActions — Run button for the command toolbar.
// Phase 5: always disabled placeholder.
// Phase 9+: triggers FFmpeg execution via IPC.
// ============================================================

import type { CommandActionExtension } from '@ffcodec/platform-api'
import { useI18n } from '@ffcodec/workbench'

export const desktopCommandActions: CommandActionExtension[] = [
  {
    id: 'desktop-run',
    label: 'Run',
    render: () => {
      const { locale } = useI18n()
      return (
        <button
          type="button"
          className="button button--primary button--run"
          disabled
          title={locale === 'zh-CN'
            ? '本地运行 FFmpeg（即将推出）'
            : 'Run FFmpeg locally (coming soon)'}
        >
          {locale === 'zh-CN' ? '▶ 运行' : '▶ Run'}
        </button>
      )
    },
  },
]
