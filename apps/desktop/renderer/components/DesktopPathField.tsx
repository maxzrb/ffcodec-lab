// ============================================================
// DesktopPathField — Text input + Browse button for the desktop app.
// Phase 5: Browse button is a visual placeholder.
// Phase 7+: Browse button triggers native file dialog via IPC.
// ============================================================

import type { PathFieldRenderer } from '@ffcodec/platform-api'
import { useI18n } from '@ffcodec/workbench'

const PATH_KIND_LABELS: Record<string, { zh: string; en: string }> = {
  'open-file': { zh: '浏览输入文件', en: 'Browse input file' },
  'open-files': { zh: '浏览多个文件', en: 'Browse files' },
  'save-file': { zh: '浏览保存位置', en: 'Browse save location' },
  'directory': { zh: '浏览文件夹', en: 'Browse folder' },
}

export const DesktopPathField: PathFieldRenderer = ({ fieldId, value, kind, onChange }) => {
  const { locale } = useI18n()
  const isZh = locale === 'zh-CN'
  const label = PATH_KIND_LABELS[kind]?.[isZh ? 'zh' : 'en'] ?? 'Browse'

  const handleBrowse = () => {
    // Phase 5: placeholder — does nothing for now.
    // Phase 7+: window.electronAPI?.showOpenDialog({ kind, value })
    //   .then((result) => { if (result) onChange(result) })
    console.log(`[DesktopPathField] Browse clicked for ${fieldId} (${kind}), current: ${value}`)
  }

  return (
    <div className="desktop-path-field">
      <input
        id={`control-${fieldId.replace(/[^a-zA-Z0-9_-]/g, '-')}`}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={false}
      />
      <button
        type="button"
        className="button-ghost"
        onClick={handleBrowse}
        aria-label={label}
      >
        {isZh ? '浏览...' : 'Browse...'}
      </button>
    </div>
  )
}
