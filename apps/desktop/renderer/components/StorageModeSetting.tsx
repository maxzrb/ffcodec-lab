// ============================================================
// StorageModeSetting — toggle between portable and user-mode
// preference storage. User mode uses %APPDATA%; portable mode
// stores the INI alongside the executable.
// ============================================================

import { useCallback, useEffect, useState } from 'react'
import { useAppDialog, useI18n } from '@ffcodec/workbench'

interface ModeInfo {
  mode: 'portable' | 'user'
  path: string
}

export function StorageModeSetting() {
  const { locale } = useI18n()
  const isZh = locale === 'zh-CN'
  const dialog = useAppDialog()
  const [modeInfo, setModeInfo] = useState<ModeInfo | null>(null)

  const refresh = useCallback(async () => {
    const result = await window.electronAPI?.storageGetMode()
    if (result) setModeInfo(result)
  }, [])

  useEffect(() => {
    refresh()
    return window.electronAPI?.onStorageModeChanged((result) => {
      setModeInfo(result)
    })
  }, [refresh])

  const handleToggle = useCallback(async () => {
    if (!modeInfo) return
    const newMode: 'portable' | 'user' = modeInfo.mode === 'user' ? 'portable' : 'user'
    const api = window.electronAPI
    if (!api) return

    const modeLabel = (m: string) => m === 'user'
      ? (isZh ? '用户目录' : 'User (AppData)')
      : (isZh ? '便携目录' : 'Portable (app dir)')

    const confirmed = await dialog.confirm({
      title: isZh ? '切换偏好存储位置？' : 'Switch preference storage?',
      message: isZh
        ? `从「${modeLabel(modeInfo.mode)}」→「${modeLabel(newMode)}」\n当前：${modeInfo.path}\n切换后数据会自动迁移，旧文件保留 .old 备份。`
        : `From "${modeLabel(modeInfo.mode)}" → "${modeLabel(newMode)}"\nCurrent: ${modeInfo.path}\nData will be migrated; the old file is kept as .old backup.`,
      confirmLabel: isZh ? '确认切换' : 'Switch',
      cancelLabel: isZh ? '取消' : 'Cancel',
      tone: 'warning',
    })
    if (!confirmed) return

    const result = await api.storageSetMode(newMode)
    if (!result.ok && result.error) {
      await dialog.alert({
        title: isZh ? '切换失败' : 'Switch failed',
        message: result.error,
        confirmLabel: isZh ? '确定' : 'OK',
        tone: 'danger',
      })
    } else {
      await refresh()
    }
  }, [modeInfo, isZh, refresh, dialog])

  const isPortable = modeInfo?.mode === 'portable'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p className="parameter-section__description">
        {isZh
          ? `当前：${isPortable ? '便携（程序目录）' : '用户（AppData）'}。切换将自动迁移现有配置。`
          : `Current: ${isPortable ? 'Portable (app dir)' : 'User (AppData)'}. Switching migrates all existing settings.`}
      </p>
      {modeInfo && (
        <p className="parameter-section__description" style={{ wordBreak: 'break-all', fontSize: '11px', opacity: 0.65 }} title={modeInfo.path}>
          {modeInfo.path}
        </p>
      )}
      <label className="switch-control">
        <input
          type="checkbox"
          checked={isPortable}
          onChange={() => void handleToggle()}
        />
        <span className="switch-control__track" aria-hidden="true" />
        <span style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
          {isZh
            ? (isPortable ? '便携模式' : '用户模式')
            : (isPortable ? 'Portable' : 'User')}
        </span>
      </label>
    </div>
  )
}
