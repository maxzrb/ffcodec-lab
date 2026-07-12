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

function advancedText(
  encoderId: string,
  key: string,
  label: string,
  argName: string,
  phase: 'VIDEO_CODEC' | 'VIDEO_RATE_CONTROL' = 'VIDEO_CODEC',
): ControlDefinition {
  return {
    id: `${encoderId}.advanced.${key}`,
    label,
    control: 'text',
    optional: true,
    configBinding: { path: videoSpecialParamPath(key) },
    commandBinding: { argName, prefix: argName, phase },
    uiPlacement: { panelId: 'quality', groupId: 'advanced-quality', tier: 'advanced' },
    sourceRefs: [ffmpegFreeUiQualitySource],
    explanationId: `expl.advanced.${key}`,
  }
}

function advancedSwitch(
  encoderId: string,
  key: string,
  label: string,
  argName: string,
  phase: 'VIDEO_CODEC' | 'VIDEO_RATE_CONTROL' = 'VIDEO_RATE_CONTROL',
): ControlDefinition {
  return {
    id: `${encoderId}.advanced.${key}`,
    label,
    control: 'switch',
    optional: true,
    configBinding: { path: videoSpecialParamPath(key) },
    commandBinding: { argName, prefix: argName, phase },
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

  if (encoder.id === 'libx264') {
    controls.push(
      advancedNumber(encoder.id, 'rcLookahead', '前向参考帧数 (-rc-lookahead)', '-rc-lookahead', { min: 0, max: 250, step: 1 }),
      advancedNumber(encoder.id, 'aqStrength', '自适应量化强度 (-aq-strength)', '-aq-strength', { min: 0, max: 3, step: 0.1 }),
      advancedNumber(encoder.id, 'sceneThreshold', '场景切换阈值 (-sc_threshold)', '-sc_threshold', { min: 0, max: 100, step: 1 }, 'VIDEO_CODEC'),
    )
  }

  if (encoder.id === 'libx264' || encoder.id === 'libx265') {
    controls.push(advancedNumber(encoder.id, 'refs', '参考帧数 (-refs)', '-refs', { min: 1, max: 16, step: 1 }, 'VIDEO_CODEC'))
  }

  if (['libx264', 'libvvenc', 'h264_nvenc', 'hevc_nvenc', 'h264_amf', 'hevc_amf'].includes(encoder.id)) {
    controls.push(advancedText(encoder.id, 'level', '编码级别 (-level)', '-level'))
  }

  if (encoder.id === 'h264_nvenc' || encoder.id === 'hevc_nvenc') {
    controls.push(
      advancedNumber(encoder.id, 'aqStrength', '空间 AQ 强度 (-aq-strength)', '-aq-strength', { min: 1, max: 15, step: 1 }),
      advancedNumber(encoder.id, 'lookaheadLevel', '前瞻等级 (-lookahead_level)', '-lookahead_level', { min: 0, max: 15, step: 1 }),
    )
  }

  if (encoder.id === 'h264_qsv' || encoder.id === 'hevc_qsv') {
    controls.push(advancedSwitch(encoder.id, 'extbrc', '扩展码率控制 (-extbrc)', '-extbrc'))
  }

  if (encoder.id === 'h264_amf' || encoder.id === 'hevc_amf') {
    controls.push(advancedNumber(
      encoder.id,
      'qvbrQualityLevel',
      'QVBR 质量级别 (-qvbr_quality_level)',
      '-qvbr_quality_level',
      { min: 0, max: 51, step: 1 },
    ))
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
