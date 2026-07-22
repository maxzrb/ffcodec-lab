// ============================================================
// DesktopPathField — Text input + Browse button for the desktop app.
// Phase 6: Browse triggers native file dialog via IPC.
// ============================================================

import { useState } from 'react'
import type { PathFieldRenderer } from '@ffcodec/platform-api'
import { useI18n } from '@ffcodec/workbench'

const PATH_KIND_LABELS: Record<string, { zh: string; en: string }> = {
  'open-file': { zh: '浏览输入文件', en: 'Browse input file' },
  'open-files': { zh: '浏览多个文件', en: 'Browse files' },
  'save-file': { zh: '浏览保存位置', en: 'Browse save location' },
  'directory': { zh: '浏览文件夹', en: 'Browse folder' },
}

/** Maps domain pathKind to preload dialog kind. */
const KIND_MAP: Record<string, 'file' | 'files' | 'save' | 'directory'> = {
  'open-file': 'file',
  'open-files': 'files',
  'save-file': 'save',
  'directory': 'directory',
}

export const DesktopPathField: PathFieldRenderer = ({ fieldId, value, kind, onChange }) => {
  const { locale } = useI18n()
  const isZh = locale === 'zh-CN'
  const label = PATH_KIND_LABELS[kind]?.[isZh ? 'zh' : 'en'] ?? 'Browse'
  const [browsing, setBrowsing] = useState(false)

  const handleBrowse = async () => {
    const api = window.electronAPI
    if (!api) return

    setBrowsing(true)
    try {
      const dialogKind = KIND_MAP[kind] ?? 'file'
      const result = await api.showOpenDialog({
        kind: dialogKind,
        defaultPath: value || undefined,
      })

      if (result.canceled) return

      if (kind === 'open-files' && result.filePaths) {
        // Join multiple paths with space separator (FFmpeg concat protocol compatible)
        onChange(result.filePaths.join(' '))
      } else if (result.filePath) {
        onChange(result.filePath)
      }
    } catch (err) {
      console.error('[DesktopPathField] Browse failed:', err)
    } finally {
      setBrowsing(false)
    }
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
        disabled={browsing}
        aria-label={label}
      >
        {browsing ? '…' : (isZh ? '浏览...' : 'Browse...')}
      </button>
    </div>
  )
}
