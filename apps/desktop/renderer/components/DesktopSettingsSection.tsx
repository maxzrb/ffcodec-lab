// ============================================================
// DesktopSettingsSection — FFmpeg path configuration.
// Phase 6: persisted via localStorage + detect button.
// ============================================================

import { useCallback, useState } from 'react'
import type { SettingsSectionExtension } from '@ffcodec/platform-api'
import { useI18n } from '@ffcodec/workbench'

const STORAGE_KEY = 'ffcodec-desktop-ffmpeg-path'

type DetectResult =
  | { kind: 'idle' }
  | { kind: 'detecting' }
  | { kind: 'found'; info: FFmpegInfo }
  | { kind: 'error'; message: string }

function FFmpegPathSetting() {
  const { locale } = useI18n()
  const isZh = locale === 'zh-CN'
  const [pathValue, setPathValue] = useState(() =>
    (localStorage.getItem(STORAGE_KEY) ?? window.electronAPI?.storageGetItem(STORAGE_KEY)) ?? '',
  )
  const [detectResult, setDetectResult] = useState<DetectResult>({ kind: 'idle' })

  const handlePathChange = useCallback((value: string) => {
    setPathValue(value)
    const trimmed = value.trim()
    const api = window.electronAPI
    if (trimmed) {
      if (api) void api.storageSetItem(STORAGE_KEY, trimmed)
      try { localStorage.setItem(STORAGE_KEY, trimmed) } catch { /* ignore */ }
    } else {
      if (api) void api.storageRemoveItem(STORAGE_KEY)
      try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    }
    // Notify other components by dispatching a storage event (same-tab workaround)
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: trimmed || null }))
  }, [])

  const handleDetect = useCallback(async () => {
    const api = window.electronAPI
    if (!api) return

    setDetectResult({ kind: 'detecting' })
    try {
      const customPath = pathValue.trim() || undefined
      const info = await api.detectFFmpeg(customPath)
      if (info.found) {
        setDetectResult({ kind: 'found', info })
      } else {
        setDetectResult({ kind: 'error', message: info.error ?? (isZh ? '未找到 FFmpeg' : 'FFmpeg not found') })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setDetectResult({ kind: 'error', message })
    }
  }, [pathValue, isZh])

  const handleGetFFmpeg = () => {
    window.electronAPI?.openExternal('https://ffmpeg.org/download.html')
  }

  return (
    <div className="desktop-settings-section">
      <label className="desktop-settings-section__label">
        {isZh ? 'FFmpeg 可执行文件路径' : 'FFmpeg executable path'}
      </label>
      <p className="desktop-settings-section__hint">
        {isZh
          ? '设置本地 ffmpeg 可执行文件的完整路径。留空则使用系统 PATH 中的 ffmpeg。'
          : 'Set the full path to the local ffmpeg executable. Leave blank to use ffmpeg from the system PATH.'}
      </p>
      <div className="desktop-settings-section__row">
        <input
          type="text"
          className="desktop-settings-section__input"
          placeholder={isZh ? '例如: C:\\ffmpeg\\bin\\ffmpeg.exe' : 'e.g. /usr/local/bin/ffmpeg'}
          value={pathValue}
          onChange={(e) => handlePathChange(e.target.value)}
        />
        <button
          type="button"
          className="button-ghost"
          onClick={handleDetect}
          disabled={detectResult.kind === 'detecting'}
        >
          {detectResult.kind === 'detecting'
            ? '…'
            : (isZh ? '检测' : 'Detect')}
        </button>
      </div>

      {detectResult.kind === 'found' && (
        <p className="desktop-settings-section__result desktop-settings-section__result--ok">
          ✅ FFmpeg {detectResult.info.version} — {detectResult.info.path}
        </p>
      )}
      {detectResult.kind === 'error' && (
        <p className="desktop-settings-section__result desktop-settings-section__result--error">
          ❌ {detectResult.message}
          {' '}
          <button type="button" className="button-ghost" onClick={handleGetFFmpeg}>
            {isZh ? '获取 FFmpeg →' : 'Get FFmpeg →'}
          </button>
        </p>
      )}
    </div>
  )
}

export const desktopSettingsSections: SettingsSectionExtension[] = [
  {
    id: 'desktop-ffmpeg-path',
    title: 'FFmpeg',
    render: () => <FFmpegPathSetting />,
  },
]
