// ============================================================
// DesktopSettingsSection — FFmpeg path configuration.
// Phase 5: placeholder text input for ffmpeg binary path.
// Phase 9+: persists config via IPC.
// ============================================================

import type { SettingsSectionExtension } from '@ffcodec/platform-api'
import { useI18n } from '@ffcodec/workbench'

export const desktopSettingsSections: SettingsSectionExtension[] = [
  {
    id: 'desktop-ffmpeg-path',
    title: 'FFmpeg',
    render: () => {
      const { locale } = useI18n()
      const isZh = locale === 'zh-CN'
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
          <input
            type="text"
            className="desktop-settings-section__input"
            placeholder={isZh ? '例如: C:\\ffmpeg\\bin\\ffmpeg.exe' : 'e.g. /usr/local/bin/ffmpeg'}
            defaultValue=""
          />
        </div>
      )
    },
  },
]
