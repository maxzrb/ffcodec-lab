import { useState } from 'react'
import { useI18n } from '@ffcodec/workbench'
import {
  getAudioCapabilityOverride,
  setAudioCapabilityOverride,
} from '../audio-capability-override'

export function AudioCapabilityUnlockButton() {
  const { locale } = useI18n()
  const [enabled, setEnabled] = useState(getAudioCapabilityOverride)
  const warning = locale === 'zh-CN'
    ? '忽略当前 FFmpeg 版本和构建能力检测。解锁后可选择本机未报告的编码器与 NMR，但生成的命令可能执行失败。'
    : 'Ignore the current FFmpeg version and build capability checks. Unavailable encoders and NMR will be selectable, but generated commands may fail.'

  const toggle = () => {
    const next = !enabled
    setEnabled(next)
    setAudioCapabilityOverride(next)
  }

  return (
    <button
      type="button"
      className={`button header-unlock-button${enabled ? ' header-unlock-button--active' : ''}`}
      aria-pressed={enabled}
      aria-label={locale === 'zh-CN' ? '解锁隐藏音频选项' : 'Unlock hidden audio options'}
      title={warning}
      onClick={toggle}
    >
      {enabled ? '🔓 ' : '🔒 '}
      {locale === 'zh-CN' ? '隐藏选项' : 'Hidden options'}
    </button>
  )
}
