import { useBuilderStore, useI18n } from '@ffcodec/workbench'
import { getProbeDurationMinutes } from './media-probe-model'
import { requestMediaProbeFocus, useMediaProbeSnapshot } from './media-probe-store'

interface TargetDurationProbeActionProps {
  onOpenMediaProbe: () => void
}

export function TargetDurationProbeAction({ onOpenMediaProbe }: TargetDurationProbeActionProps) {
  const { locale } = useI18n()
  const config = useBuilderStore((state) => state.config)
  const setConfigValue = useBuilderStore((state) => state.setConfigValue)
  const probe = useMediaProbeSnapshot()
  const inputPath = config.input.path.trim()
  const result = probe.inputPath?.trim() === inputPath ? probe.result : null
  const durationMinutes = result ? getProbeDurationMinutes(result) : null
  const currentDuration = config.tools.targetSize.durationMinutes
  const alreadyApplied = durationMinutes !== null
    && Math.abs(currentDuration - durationMinutes) < 0.000_05
  const zh = locale === 'zh-CN'

  const openMediaProbe = () => {
    requestMediaProbeFocus()
    onOpenMediaProbe()
  }

  if (durationMinutes === null) {
    return (
      <button type="button" className="button target-duration-probe-action" onClick={openMediaProbe}>
        {zh ? '前往媒体探测' : 'Open Media Probe'}
      </button>
    )
  }

  const formattedDuration = formatMinutes(durationMinutes)
  return (
    <div className="target-duration-probe-action__group">
      <button
        type="button"
        className="button target-duration-probe-action"
        disabled={alreadyApplied}
        onClick={() => setConfigValue('tools.targetSize.durationMinutes', durationMinutes)}
      >
        {alreadyApplied
          ? (zh ? `已使用探测时长 ${formattedDuration} 分钟` : `Probe duration applied: ${formattedDuration} min`)
          : (zh ? `使用探测时长 ${formattedDuration} 分钟` : `Use probe duration: ${formattedDuration} min`)}
      </button>
      <button type="button" className="button-ghost target-duration-probe-action__open" onClick={openMediaProbe}>
        {zh ? '查看媒体信息' : 'View media info'}
      </button>
    </div>
  )
}

function formatMinutes(value: number): string {
  return value.toFixed(value < 10 ? 3 : 2).replace(/\.?0+$/, '')
}
