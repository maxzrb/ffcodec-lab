import type { ControlDefinition, EncoderDefinition, SourceRef } from '../../../domain/catalog/catalog-types'
import { videoSpecialParamPath } from '../../../domain/config/config-path'

const ffmpegFreeUiQualitySource: SourceRef = {
  repository: 'Lake1059/FFmpegFreeUI',
  branch: 'main',
  snapshotDate: '2026-07-12',
  file: 'FFmpegFreeUI/界面 v6 参数面板/Form_v6_参数面板_质量.vb',
  symbol: '初始化预制条目菜单',
  sourceType: 'ffmpegfreeui',
}

function advancedNumber(
  encoderId: string,
  key: string,
  label: string,
  argName: string,
  range: { min: number; max: number; step?: number },
  phase: 'VIDEO_CODEC' | 'VIDEO_RATE_CONTROL' = 'VIDEO_RATE_CONTROL',
): ControlDefinition {
  return {
    id: `${encoderId}.advanced.${key}`,
    label,
    control: 'number',
    optional: true,
    configBinding: { path: videoSpecialParamPath(key) },
    commandBinding: { argName, prefix: argName, phase },
    range,
    uiPlacement: { panelId: 'quality', groupId: 'advanced-quality', tier: 'advanced' },
    sourceRefs: [ffmpegFreeUiQualitySource],
    explanationId: `expl.advanced.${key}`,
  }
}

/** 将 FFmpegFreeUI 的进阶质量预制项映射到当前编码器目录。 */
export function withAdvancedQualityControls(encoder: EncoderDefinition): EncoderDefinition {
  const controls: ControlDefinition[] = [
    advancedNumber(encoder.id, 'gopSize', '关键帧间隔 (-g)', '-g', { min: 1, max: 1000, step: 1 }, 'VIDEO_CODEC'),
    advancedNumber(encoder.id, 'bFrames', '最大 B 帧数 (-bf)', '-bf', { min: 0, max: 32, step: 1 }, 'VIDEO_CODEC'),
  ]

  if (encoder.id === 'libx264' || encoder.id === 'libx265') {
    controls.push(advancedNumber(
      encoder.id,
      'keyintMin',
      '最小关键帧间隔 (-keyint_min)',
      '-keyint_min',
      { min: 1, max: 1000, step: 1 },
      'VIDEO_CODEC',
    ))
  }

  if (['libx264', 'libx265', 'libsvtav1', 'libaom-av1'].includes(encoder.id)) {
    controls.push(
      advancedNumber(encoder.id, 'qmin', '量化最小值 (-qmin)', '-qmin', { min: 0, max: 69, step: 1 }),
      advancedNumber(encoder.id, 'qmax', '量化最大值 (-qmax)', '-qmax', { min: 0, max: 69, step: 1 }),
      advancedNumber(encoder.id, 'qcomp', '量化曲线压缩 (-qcomp)', '-qcomp', { min: 0, max: 1, step: 0.01 }),
    )
  }

  const existingArgs = new Set(encoder.specialParameters.map((item) => item.commandBinding?.argName))
  return {
    ...encoder,
    specialParameters: [
      ...encoder.specialParameters,
      ...controls.filter((item) => !existingArgs.has(item.commandBinding?.argName)),
    ],
  }
}
