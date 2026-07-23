// ============================================================
// resolve-section — groups ResolvedFields into logical sections
// for the builder page layout.
// ============================================================

import type { ProjectConfig } from '../config/project-config'
import { createDefaultAdvancedVideoFilters } from '../config/defaults'
import type { Catalog, ControlDefinition, SourceRef } from '../catalog/catalog-types'
import { CODEC_CATEGORIES, FALLBACK_CATEGORY_ID } from '../catalog/catalog-types'
import type { FieldState } from '../rules/rule-types'
import type { ResolvedField, ResolvedSection } from './resolved-field'
import { CONFIG_PATHS } from '../config/config-path'
import {
  resolveControlField,
  resolveParameterField,
  resolveTextField,
  resolveSwitchField,
  resolveSectionLabel,
} from './resolve-field'
import { calculateTargetSize } from '../tools/target-size'
import {
  isRawParameterDictionary,
  resolveRawParameterDictionaryValue,
  resolveStructuredDictionaryValue,
} from '../catalog/parameter-dictionary'
import { isControlActive } from '../catalog/control-condition'

// -- generic codec arg classification ---------------------------

/** FFmpeg libavcodec 层通用编码选项的 argName 集合。
 * 这些参数不是编码器私有参数，大多数编码器都支持。
 * 它们在各编码器的 specialParameters 中可能以编码器自定义默认值出现（通过 advanced-quality.ts 去重），
 * 但参数语义始终是通用语义。 */
const GENERIC_CODEC_ARG_NAMES = new Set([
  '-g',              // GOP 大小 / 关键帧间隔
  '-bf',             // 最大 B 帧数
  '-keyint_min',     // 最小关键帧间隔
  '-qmin',           // 量化最小值
  '-qmax',           // 量化最大值
  '-qcomp',          // 量化曲线压缩系数
  '-refs',           // 参考帧数
  '-level',          // 编码级别
  '-rc-lookahead',   // 码率控制前瞻帧数
  '-aq-strength',    // 自适应量化强度
  '-sc_threshold',   // 场景切换检测阈值
  '-threads',        // 编码线程数
])

// -- section builders -------------------------------------------

export function resolveInputSection(
  config: ProjectConfig,
  fieldStates: Record<string, FieldState>,
): ResolvedSection {
  const streamIndexOptions = Array.from({ length: 16 }, (_, index) => ({
    value: index,
    label: String(index),
  }))

  const videoIndices = config.streams.videoStreams.map((e) => e.index)
  const audioIndices = config.streams.audioStreams.map((e) => e.index)
  const subtitleIndices = config.streams.subtitleStreams.map((e) => e.index)

  const videoActive = config.video.mode !== 'disabled'
  const audioActive = config.audio.mode !== 'disabled'
  const videoEncMode = config.video.mode === 'encode'
  const audioEncMode = config.audio.mode === 'encode'

  const preserveAllVideo = config.streams.preserveAllVideoStreams !== false // default true
  const preserveAllAudio = config.streams.preserveAllAudioStreams !== false
  const preserveAllSubtitle = config.streams.preserveAllSubtitleStreams !== false

  const fields: ResolvedField[] = [
    resolveTextField('input.path', '输入文件路径', config.input.path, fieldStates, undefined, [
      {
        repository: 'manual-note',
        snapshotDate: '2026-07-10',
        file: 'docs/Codex_FFmpeg命令生成器_项目指令集.md',
        sourceType: 'manual-note',
      },
    ], { path: CONFIG_PATHS.input.path }, 'open-file'),
    resolveTextField(
      'output.path',
      '输出文件路径',
      config.output.path,
      fieldStates,
      undefined,
      [
        {
          repository: 'manual-note',
          snapshotDate: '2026-07-10',
          file: 'docs/Codex_FFmpeg命令生成器_项目指令集.md',
          sourceType: 'manual-note',
        },
      ],
      { path: CONFIG_PATHS.output.path },
      'save-file',
    ),
    resolveSwitchField(
      'output.overwrite',
      '覆盖已有文件 (-y)',
      config.output.overwrite,
      fieldStates,
    ),
    // -- 保留全部视频流开关 ------------------------------------------------
    resolveSwitchField(
      'streams.preserveAllVideoStreams',
      '保留全部视频流 (-map 0:v?)',
      preserveAllVideo,
      fieldStates,
      undefined,
      [],
      { path: CONFIG_PATHS.streams.preserveAllVideoStreams },
    ),
    {
      id: 'streams.videoStreams', label: '视频流', controlType: 'multiselect',
      description: videoEncMode ? '勾选的视频流参与输出。默认编码，可在右侧逐项切换为复制。' : '视频流将原样复制（-c:v copy）。',
      value: videoIndices,
      options: streamIndexOptions,
      visible: videoActive && !preserveAllVideo, disabled: false,
      sourceRefs: [], verificationLevel: 'project-derived', needsCrossVerification: false,
      commandOrigins: ['streams.videoStreams'], diagnostics: [],
    },
    ...(!preserveAllVideo ? config.streams.videoStreams.map((entry, i) => ({
      id: `streams.videoStreams.${i}.codecMode`,
      label: `视频流 ${entry.index}`,
      controlType: 'switch' as const,
      value: entry.codecMode === 'encode',
      visible: videoEncMode, disabled: false,
      sourceRefs: [], verificationLevel: 'project-derived' as const, needsCrossVerification: false,
      commandOrigins: [], diagnostics: [],
    })) : []),
    // -- 保留全部音频流开关 ------------------------------------------------
    resolveSwitchField(
      'streams.preserveAllAudioStreams',
      '保留全部音频流 (-map 0:a?)',
      preserveAllAudio,
      fieldStates,
      undefined,
      [],
      { path: CONFIG_PATHS.streams.preserveAllAudioStreams },
    ),
    {
      id: 'streams.audioStreams', label: '音频流', controlType: 'multiselect',
      description: audioEncMode ? '勾选的音频流参与输出。默认编码，可在右侧逐项切换为复制。' : '音频流将原样复制（-c:a copy）。',
      value: audioIndices,
      options: streamIndexOptions,
      visible: audioActive && !preserveAllAudio, disabled: false,
      sourceRefs: [], verificationLevel: 'project-derived', needsCrossVerification: false,
      commandOrigins: ['streams.audioStreams'], diagnostics: [],
    },
    ...(!preserveAllAudio ? config.streams.audioStreams.map((entry, i) => ({
      id: `streams.audioStreams.${i}.codecMode`,
      label: `音频流 ${entry.index}`,
      controlType: 'switch' as const,
      value: entry.codecMode === 'encode',
      visible: audioEncMode, disabled: false,
      sourceRefs: [], verificationLevel: 'project-derived' as const, needsCrossVerification: false,
      commandOrigins: [], diagnostics: [],
    })) : []),
    // -- 保留全部字幕流开关 ------------------------------------------------
    resolveSwitchField(
      'streams.preserveAllSubtitleStreams',
      '保留全部字幕流 (-map 0:s?)',
      preserveAllSubtitle,
      fieldStates,
      undefined,
      [],
      { path: CONFIG_PATHS.streams.preserveAllSubtitleStreams },
    ),
    {
      id: 'streams.subtitleStreams', label: '字幕流', controlType: 'multiselect',
      description: '勾选的字幕流参与输出。默认编码，可在右侧逐项切换为复制。',
      value: subtitleIndices,
      options: streamIndexOptions,
      visible: !preserveAllSubtitle, disabled: false,
      sourceRefs: [], verificationLevel: 'project-derived', needsCrossVerification: false,
      commandOrigins: ['streams.subtitleStreams'], diagnostics: [],
    },
    ...(!preserveAllSubtitle ? config.streams.subtitleStreams.map((entry, i) => ({
      id: `streams.subtitleStreams.${i}.codecMode`,
      label: `字幕流 ${entry.index}`,
      controlType: 'switch' as const,
      value: entry.codecMode === 'encode',
      visible: true, disabled: false,
      sourceRefs: [], verificationLevel: 'project-derived' as const, needsCrossVerification: false,
      commandOrigins: [], diagnostics: [],
    })) : []),
  ]

  return { id: 'section.input', label: '输入与输出', fields }
}

export function resolveVideoSection(
  config: ProjectConfig,
  catalog: Catalog,
  fieldStates: Record<string, FieldState>,
): ResolvedSection {
  const fields: ResolvedField[] = []

  // Video mode
  const videoModeParam = catalog.parameters['param.video.mode']
  if (videoModeParam) {
    fields.push(resolveParameterField(videoModeParam, config, 'video.mode', fieldStates))
  }

  // Video encoder selector (only when mode=encode)
  const videoEncoderParam = catalog.parameters['param.video.encoder']
  if (videoEncoderParam) {
    const implementationLabels: Record<string, string> = {
      software: 'CPU',
      nvidia: 'NVIDIA',
      intel: 'Intel',
      amd: 'AMD',
      apple: 'Apple',
      other: '其他',
    }

    // 从当前编码器推导所属类别（或使用已保存的类别选择）
    const currentEncoder = config.video.encoderId
      ? catalog.encoders.video[config.video.encoderId]
      : undefined
    const derivedCategoryId = currentEncoder
      ? (CODEC_CATEGORIES.find((c) => c.families.includes(currentEncoder.family))?.id ?? config.video.codecCategory ?? FALLBACK_CATEGORY_ID)
      : (config.video.codecCategory ?? FALLBACK_CATEGORY_ID)

    const selectedCategoryId = derivedCategoryId
    const selectedCategory = CODEC_CATEGORIES.find((c) => c.id === selectedCategoryId)

    // -- 一级：编解码类别选择 ----------------------------------------
    fields.push({
      id: 'video.codecCategory',
      label: '编解码标准',
      controlType: 'select',
      value: selectedCategoryId,
      visible: true,
      disabled: false,
      options: CODEC_CATEGORIES.map((cat) => ({
        value: cat.id,
        label: cat.label + (cat.placeholder ? ' (暂无编码器)' : ''),
      })),
      sourceRefs: [],
      verificationLevel: 'project-derived',
      needsCrossVerification: false,
      commandOrigins: [],
      diagnostics: [],
      configBinding: { path: CONFIG_PATHS.video.codecCategory },
    })

    // -- 二级：编码器选择（按类别过滤）-------------------------------
    const categoryFamilies = selectedCategory?.families ?? []
    const filteredEncoders = Object.values(catalog.encoders.video).filter((enc) =>
      categoryFamilies.includes(enc.family),
    )

    // 如果当前编码器不在过滤后的列表中，自动选择第一个可用编码器
    let effectiveEncoderId = config.video.encoderId
    if (!effectiveEncoderId || !filteredEncoders.some((e) => e.id === effectiveEncoderId)) {
      effectiveEncoderId = filteredEncoders[0]?.id
      // 标记为需要自动切换（实际切换在 applyFieldChange 中处理）
    }

    const encField = resolveParameterField(videoEncoderParam, config, 'video.encoderId', fieldStates)
    encField.description = selectedCategory?.placeholder
      ? (selectedCategory.placeholderNote ?? '此编解码标准尚无可用编码器')
      : undefined

    encField.options = filteredEncoders.map((enc) => ({
      value: enc.id,
      label: enc.label,
      group: enc.family,
      badge: implementationLabels[enc.implementation] ?? enc.implementation,
      description: enc.availabilityNote?.slice(0, 80),
    }))
    encField.disabled = filteredEncoders.length === 0
    encField.disabledReason = filteredEncoders.length === 0
      ? (selectedCategory?.placeholderNote ?? '截至 FFmpeg 8.1.2 发行版，此编解码标准暂无编码器实现')
      : undefined
    fields.push(encField)

    // 占位分类 — 选中后显示提示信息
    if (filteredEncoders.length === 0) {
      fields.push({
        id: 'video.codecCategory.emptyHint',
        label: selectedCategory?.label ?? '当前分类',
        controlType: 'section',
        value: selectedCategory?.placeholderNote ?? '截至 FFmpeg 8.1.2 发行版，此编解码标准暂无编码器实现。',
        visible: true,
        disabled: false,
        sourceRefs: [],
        verificationLevel: 'project-derived',
        needsCrossVerification: false,
        commandOrigins: [],
        diagnostics: [],
      })
    }
  }

  // Encoder-specific controls
  const encoder = config.video.encoderId
    ? catalog.encoders.video[config.video.encoderId]
    : undefined
  const targetSizeEnabled = config.tools?.targetSize.enabled ?? false

  // 占位分类：无编码器时显示质量控制不可用提示
  if (!encoder && config.video.mode === 'encode') {
    const selCat = CODEC_CATEGORIES.find((c) => c.id === config.video.codecCategory)
    const note = selCat?.placeholderNote ?? '截至 FFmpeg 8.1.2 发行版，此编解码标准暂无编码器实现。'
    fields.push({
      id: 'video.rateControl.mode',
      label: '质量控制模式',
      controlType: 'select',
      value: '',
      visible: true,
      disabled: true,
      disabledReason: note,
      options: [],
      sourceRefs: [],
      verificationLevel: 'project-derived',
      needsCrossVerification: false,
      commandOrigins: [],
      diagnostics: [],
      panelId: 'quality',
      groupId: 'rate-control',
      tier: 'basic',
    })
  }

  if (encoder && config.video.mode === 'encode') {
    // Preset
    if (encoder.preset) {
      fields.push(resolveControlField(encoder.preset, config, 'video.preset', fieldStates, encoder))
    }
    // Profile
    if (encoder.profile) {
      fields.push(resolveControlField(encoder.profile, config, 'video.profile', fieldStates, encoder))
    }
    // Tune
    if (encoder.tune) {
      fields.push(resolveControlField(encoder.tune, config, 'video.tune', fieldStates, encoder))
    }
    // Pixel format
    if (encoder.pixelFormat) {
      const pixelFormat = resolveControlField(encoder.pixelFormat, config, 'video.pixelFormat', fieldStates, encoder)
      pixelFormat.panelId = 'color'
      pixelFormat.groupId = 'pixel-format'
      fields.push(pixelFormat)
    }

    // Rate control mode
    const rcMode = config.video.rateControl?.mode ?? 'crf'
    const qualityModes = encoder.qualityModes

    // Quality mode selector
    fields.push({
      id: 'video.rateControl.mode',
      label: '质量控制模式',
      controlType: 'select',
      value: rcMode,
      visible: true,
      disabled: targetSizeEnabled,
      disabledReason: targetSizeEnabled ? '目标文件大小工具正在接管视频码率和双遍编码。' : undefined,
      options: qualityModes.map((qm) => ({ value: qm.id, label: qm.label })),
      sourceRefs: encoder.sourceRefs,
      verificationLevel: encoder.verificationLevel,
      needsCrossVerification: encoder.needsCrossVerification,
      commandOrigins: [],
      diagnostics: [],
      panelId: 'quality',
      groupId: 'rate-control',
      tier: 'basic',
    })

    // Quality mode specific controls
    const activeMode = qualityModes.find((qm) => qm.id === rcMode)
    if (activeMode) {
      for (const ctrl of activeMode.controls) {
        const configPath = resolveQualityControlConfigPath(ctrl)
        const field = resolveControlField(ctrl, config, configPath, fieldStates, encoder)
        field.panelId = 'quality'
        field.groupId = 'rate-control'
        if (targetSizeEnabled) {
          field.disabled = true
          field.disabledReason = '目标文件大小工具正在接管视频码率和双遍编码。'
        }
        fields.push(field)
      }
    }

    // 自由附加参数固定放在质量控制栏底部，并显示与结构化字典控件同步后的内容。
    for (const control of encoder.specialParameters.filter(isRawParameterDictionary)) {
      const optionalControl = { ...control, optional: true }
      const configPath = control.configBinding?.path ?? `video.specialParameters.${control.id}`
      const field = resolveControlField(optionalControl, config, configPath, fieldStates, encoder)
      field.value = resolveRawParameterDictionaryValue(encoder, control, config.video.specialParameters, true)
      field.panelId = 'quality'
      field.groupId = 'encoder-additional-parameters'
      field.tier = 'advanced'
      fields.push(field)
    }

  }

  return { id: 'section.video', label: '视频编码', fields }
}

/** 通用 FFmpeg 编码选项（libavcodec 层选项，大多数编码器都支持）。
 *  从当前编码器的 specialParameters 中筛选通用 argName，已通过
 *  advanced-quality.ts 去重逻辑处理了各编码器自定义默认值的情况。 */
export function resolveGenericCodecSection(
  config: ProjectConfig,
  catalog: Catalog,
  fieldStates: Record<string, FieldState>,
): ResolvedSection {
  const encoder = config.video.mode === 'encode' && config.video.encoderId
    ? catalog.encoders.video[config.video.encoderId]
    : undefined
  if (!encoder) return { id: 'section.generic-codec', label: '通用编码选项', fields: [] }

  const fields = encoder.specialParameters
    .filter((control) => !isRawParameterDictionary(control))
    .filter((control) => GENERIC_CODEC_ARG_NAMES.has(control.commandBinding?.argName ?? ''))
    .map((control) => {
      const optionalControl = { ...control, optional: true }
      const configPath = control.configBinding?.path ?? `video.specialParameters.${control.id}`
      const field = resolveControlField(optionalControl, config, configPath, fieldStates, encoder)
      if (control.commandBinding?.dictionary?.key) {
        field.value = resolveStructuredDictionaryValue(encoder, control, config.video.specialParameters)
      }
      field.panelId = 'quality'
      field.groupId = 'generic-codec'
      field.tier = 'advanced'
      return field
    })

  return {
    id: 'section.generic-codec',
    label: '通用编码选项',
    description: 'FFmpeg libavcodec 层通用选项，适用于大多数编码器。每项默认不设置，留空时使用编码器内建值。',
    fields,
  }
}

/** 当前视频编码器的私有参数。不包括通用编码选项和附加参数字典文本框。 */
export function resolveVideoAdvancedSection(
  config: ProjectConfig,
  catalog: Catalog,
  fieldStates: Record<string, FieldState>,
): ResolvedSection {
  const encoder = config.video.mode === 'encode' && config.video.encoderId
    ? catalog.encoders.video[config.video.encoderId]
    : undefined
  if (!encoder) return { id: 'section.encoder-private', label: '编码器私有参数', fields: [] }

  const fields = encoder.specialParameters
    .filter((control) => !isRawParameterDictionary(control))
    .filter((control) => !GENERIC_CODEC_ARG_NAMES.has(control.commandBinding?.argName ?? ''))
    .map((control) => {
      // EncoderDefinition.specialParameters 中的默认值只描述编码器行为，
      // 不代表项目应主动发射；界面必须允许保持空值。
      const optionalControl = { ...control, optional: true }
      const configPath = control.configBinding?.path ?? `video.specialParameters.${control.id}`
      const field = resolveControlField(optionalControl, config, configPath, fieldStates, encoder)
      if (control.commandBinding?.dictionary?.key) {
        field.value = resolveStructuredDictionaryValue(encoder, control, config.video.specialParameters)
      }
      field.panelId = 'quality'
      field.groupId = 'encoder-private'
      field.tier = 'advanced'
      return field
    })

  return {
    id: 'section.encoder-private',
    label: '编码器私有参数',
    description: '仅当前编码器支持的专有选项；全部默认不设置，留空时使用编码器内建值。',
    fields,
  }
}

export function resolveColorSection(
  config: ProjectConfig,
  fieldStates: Record<string, FieldState>,
): ResolvedSection {
  const sourceRefs: SourceRef[] = [{
    repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-12',
    file: 'FFmpegFreeUI/界面 v6 参数面板/Form_v6_参数面板_色彩管理.vb',
    symbol: 'Form_v6_参数面板_色彩管理_Load', sourceType: 'ffmpegfreeui',
  }, {
    repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-12',
    file: 'FFmpegFreeUI/功能/预设系统/预设命令行滤镜_v6.vb',
    symbol: '构造色彩转换滤镜', sourceType: 'ffmpegfreeui',
  }]
  const state = fieldStates['section.color']
  const makeSelect = (
    id: string,
    label: string,
    value: unknown,
    options: Array<{ value: string; label: string }>,
    path: NonNullable<ResolvedField['configBinding']>['path'],
    visible = true,
    groupId = 'color-metadata',
    tier: 'basic' | 'advanced' = 'advanced',
    explanationId?: string,
  ): ResolvedField => ({
    id, label, controlType: 'select', value: value ?? '',
    options: [{ value: '', label: '不设置（保留输入或编码器默认）' }, ...options],
    visible: visible && state?.visible !== false,
    disabled: state?.enabled === false,
    disabledReason: state?.reason,
    sourceRefs,
    verificationLevel: 'project-derived', needsCrossVerification: true,
    commandOrigins: [id, 'filter.chain'], diagnostics: [], panelId: 'color', groupId,
    tier, optional: true, explanationId,
    configBinding: { path },
  })

  const color = config.video.color ?? {}
  const operation = color.operation ?? 'metadata-only'
  const conversionEnabled = operation !== 'metadata-only'
  const filter = color.filter ?? 'zscale'
  const toneMap = color.toneMap ?? 'none'
  const toneMappingEnabled = conversionEnabled && toneMap !== 'none'
  const processingFields: ResolvedField[] = [
    makeSelect('video.color.operation', '色彩空间操作方式', operation, [
      { value: 'metadata-only', label: '仅写入元数据' },
      { value: 'convert-and-tag', label: '写入元数据并转换' },
      { value: 'convert-only', label: '仅转换' },
    ], CONFIG_PATHS.video.color.operation, true, 'color-processing', 'basic', 'expl.color.operation'),
    makeSelect('video.color.filter', '色彩转换滤镜', filter, [
      { value: 'zscale', label: 'zscale（CPU）' },
      { value: 'libplacebo', label: 'libplacebo（GPU）' },
    ], CONFIG_PATHS.video.color.filter, conversionEnabled, 'color-processing', 'basic', 'expl.color.filter'),
    makeSelect('video.color.preFormat', '转换前像素格式', color.preFormat, [
      'yuv420p', 'yuv420p10le', 'yuv422p', 'yuv422p10le', 'yuv444p', 'yuv444p10le', 'p010le',
    ].map((value) => ({ value, label: value })), CONFIG_PATHS.video.color.preFormat, conversionEnabled, 'color-processing', 'advanced', 'expl.color.preFormat'),
    makeSelect('video.color.toneMap', '色调映射算法', toneMap, (filter === 'zscale'
      ? ['none', 'clip', 'reinhard', 'mobius', 'hable', 'gamma', 'linear']
      : ['none', 'auto', 'clip', 'st2094-40', 'st2094-10', 'bt.2390', 'bt.2446a', 'spline', 'reinhard', 'mobius', 'hable', 'gamma', 'linear']
    ).map((value) => ({ value, label: value })), CONFIG_PATHS.video.color.toneMap, conversionEnabled, 'color-processing', 'basic', 'expl.color.toneMap'),
  ]

  if (filter === 'zscale' && toneMappingEnabled) {
    processingFields.push({
      id: 'video.color.nominalPeak', label: '标称峰值亮度 (npl)', controlType: 'number',
      value: color.nominalPeak ?? 100, min: 1, max: 10000, step: 1,
      visible: state?.visible !== false, disabled: state?.enabled === false, disabledReason: state?.reason,
      sourceRefs, verificationLevel: 'project-derived', needsCrossVerification: true,
      commandOrigins: ['filter.chain'], diagnostics: [], panelId: 'color', groupId: 'color-processing',
      tier: 'advanced', optional: true, explanationId: 'expl.color.nominalPeak',
      configBinding: { path: CONFIG_PATHS.video.color.nominalPeak },
    }, {
      id: 'video.color.desaturation', label: '色调映射去饱和强度', controlType: 'number',
      value: color.desaturation ?? 2, min: 0, max: 10, step: 0.1,
      visible: state?.visible !== false, disabled: state?.enabled === false, disabledReason: state?.reason,
      sourceRefs, verificationLevel: 'project-derived', needsCrossVerification: true,
      commandOrigins: ['filter.chain'], diagnostics: [], panelId: 'color', groupId: 'color-processing',
      tier: 'advanced', optional: true, explanationId: 'expl.color.desaturation',
      configBinding: { path: CONFIG_PATHS.video.color.desaturation },
    })
  }

  return {
    id: 'section.color',
    label: '色彩管理',
    description: operation === 'metadata-only'
      ? '仅写入输出流色彩标记，不改变像素数值。'
      : '色彩转换进入统一滤镜链；是否写入输出标记由操作方式决定。',
    fields: [
      ...processingFields,
      makeSelect('video.color.range', '色彩范围', color.range, [
        { value: 'tv', label: 'tv 有限范围' }, { value: 'pc', label: 'pc 全范围' },
      ], CONFIG_PATHS.video.color.range, true, 'color-metadata', 'advanced', 'expl.color.range'),
      makeSelect('video.color.space', '矩阵 / 色彩空间', color.space, [
        'bt709', 'bt2020nc', 'bt2020c', 'rgb', 'gbr', 'bt470bg', 'smpte170m', 'smpte240m', 'fcc', 'ictcp', 'ycgco', 'xyz',
      ].map((value) => ({ value, label: value })), CONFIG_PATHS.video.color.space, true, 'color-metadata', 'advanced', 'expl.color.space'),
      makeSelect('video.color.primaries', '色域 / 原色', color.primaries, [
        'bt709', 'bt2020', 'smpte428', 'smpte431', 'smpte432', 'film', 'bt470m', 'bt470bg', 'smpte170m', 'smpte240m', 'jedec-p22', 'ebu3213',
      ].map((value) => ({ value, label: value })), CONFIG_PATHS.video.color.primaries, true, 'color-metadata', 'advanced', 'expl.color.primaries'),
      makeSelect('video.color.transfer', '传输特性', color.transfer, [
        'bt709', 'bt2020-10', 'bt2020-12', 'smpte2084', 'bt470m', 'bt470bg', 'log', 'log_sqrt', 'linear', 'bt1361e', 'iec61966-2-1', 'iec61966-2-4', 'smpte170m', 'smpte240m', 'gamma22', 'gamma28', 'arib-std-b67',
      ].map((value) => ({ value, label: value })), CONFIG_PATHS.video.color.transfer, true, 'color-metadata', 'advanced', 'expl.color.transfer'),
    ],
  }
}

/**
 * Resolve the config path for a quality control using its configBinding.
 * Uses the control's explicit configBinding if present; falls back to
 * pattern matching (for backwards compatibility with any remaining
 * controls that haven't been migrated).
 */
function resolveQualityControlConfigPath(ctrl: { id: string; configBinding?: { path: string } }): string {
  // Use explicit configBinding path if present
  if (ctrl.configBinding?.path) {
    return ctrl.configBinding.path
  }
  // Fallback: pattern matching (for any unmigrated controls)
  if (ctrl.id.includes('crf.value') || ctrl.id.includes('cqp.value')) {
    return 'video.rateControl.qualityValue'
  }
  if (ctrl.id.includes('bitrate')) {
    return 'video.rateControl.bitrate'
  }
  if (ctrl.id.includes('maxrate')) {
    return 'video.rateControl.maxRate'
  }
  if (ctrl.id.includes('bufsize')) {
    return 'video.rateControl.bufferSize'
  }
  return `video.rateControl.additionalValues.${ctrl.id}`
}

export function resolveFrameSection(
  config: ProjectConfig,
  fieldStates: Record<string, FieldState>,
): ResolvedSection {
  const fields: ResolvedField[] = []

  // Resolution mode
  fields.push({
    id: 'frame.resolution.mode',
    label: '分辨率',
    controlType: 'select',
    value: config.frame.resolution.mode,
    options: [
      { value: 'source', label: '保持原分辨率' },
      { value: 'width', label: '指定宽度' },
      { value: 'height', label: '指定高度' },
      { value: 'size', label: '指定宽高' },
    ],
    visible: fieldStates['section.frame']?.visible !== false,
    disabled: !(fieldStates['section.frame']?.enabled !== false),
    disabledReason: fieldStates['section.frame']?.reason,
    sourceRefs: [],
    verificationLevel: 'project-derived',
    needsCrossVerification: false,
    commandOrigins: [],
    diagnostics: [],
  })

  // Width (when mode is width or size)
  if (config.frame.resolution.mode === 'width' || config.frame.resolution.mode === 'size') {
    const w = config.frame.resolution.mode === 'size'
      ? (config.frame.resolution as { width: number }).width
      : (config.frame.resolution as { width: number }).width
    fields.push({
      id: 'frame.resolution.width',
      label: '宽度 (像素)',
      controlType: 'number',
      value: w,
      min: 2,
      max: 7680,
      step: 2,
      visible: fieldStates['section.frame']?.visible !== false,
      disabled: !(fieldStates['section.frame']?.enabled !== false),
      sourceRefs: [],
      verificationLevel: 'project-derived',
      needsCrossVerification: false,
      commandOrigins: [],
      diagnostics: [],
    })
  }

  // Height (when mode is height or size)
  if (config.frame.resolution.mode === 'height' || config.frame.resolution.mode === 'size') {
    const h = config.frame.resolution.mode === 'size'
      ? (config.frame.resolution as { height: number }).height
      : (config.frame.resolution as { height: number }).height
    fields.push({
      id: 'frame.resolution.height',
      label: '高度 (像素)',
      controlType: 'number',
      value: h,
      min: 2,
      max: 4320,
      step: 2,
      visible: fieldStates['section.frame']?.visible !== false,
      disabled: !(fieldStates['section.frame']?.enabled !== false),
      sourceRefs: [],
      verificationLevel: 'project-derived',
      needsCrossVerification: false,
      commandOrigins: [],
      diagnostics: [],
    })
  }

  // Frame rate mode
  fields.push({
    id: 'frame.frameRate.mode',
    label: '帧率',
    controlType: 'select',
    value: config.frame.frameRate.mode,
    options: [
      { value: 'source', label: '保持原帧率' },
      { value: 'value', label: '指定帧率' },
    ],
    visible: fieldStates['section.frame']?.visible !== false,
    disabled: !(fieldStates['section.frame']?.enabled !== false),
    sourceRefs: [],
    verificationLevel: 'project-derived',
    needsCrossVerification: false,
    commandOrigins: [],
    diagnostics: [],
  })

  // Frame rate value
  if (config.frame.frameRate.mode === 'value') {
    fields.push({
      id: 'frame.frameRate.value',
      label: '帧率 (fps)',
      controlType: 'number',
      value: (config.frame.frameRate as { value: number }).value,
      min: 1,
      max: 240,
      step: 1,
      visible: fieldStates['section.frame']?.visible !== false,
      disabled: !(fieldStates['section.frame']?.enabled !== false),
      sourceRefs: [],
      verificationLevel: 'project-derived',
      needsCrossVerification: false,
      commandOrigins: [],
      diagnostics: [],
    })
  }

  const filterState = fieldStates['section.frame']
  const filterSourceRefs: SourceRef[] = [{
    repository: 'FFmpeg/FFmpeg',
    branch: 'master',
    snapshotDate: '2026-07-11',
    file: 'doc/filters.texi',
    sourceType: 'ffmpeg-official',
    url: 'https://ffmpeg.org/ffmpeg-filters.html',
  }]
  const addFilterField = (
    id: string,
    label: string,
    controlType: ResolvedField['controlType'],
    value: unknown,
    options?: ResolvedField['options'],
    range?: { min?: number; max?: number; step?: number },
    extra?: { description?: string; explanationId?: string },
  ) => {
    fields.push({
      id,
      label,
      description: extra?.description,
      explanationId: extra?.explanationId,
      controlType,
      value,
      options,
      min: range?.min,
      max: range?.max,
      step: range?.step,
      visible: filterState?.visible !== false,
      disabled: filterState?.enabled === false,
      disabledReason: filterState?.reason,
      sourceRefs: filterSourceRefs,
      verificationLevel: 'official',
      needsCrossVerification: false,
      commandOrigins: ['filter.chain'],
      diagnostics: [],
    })
  }

  const filters = config.frame.filters ?? createDefaultAdvancedVideoFilters()
  addFilterField('frame.filters.crop.enabled', '启用裁剪', 'switch', filters.crop.enabled)
  if (filters.crop.enabled) {
    addFilterField('frame.filters.crop.width', '裁剪宽度', 'number', filters.crop.width, undefined, { min: 2, max: 7680, step: 2 }, { description: '裁剪后保留的画面宽度，单位像素。', explanationId: 'expl.filter.crop.width' })
    addFilterField('frame.filters.crop.height', '裁剪高度', 'number', filters.crop.height, undefined, { min: 2, max: 4320, step: 2 }, { description: '裁剪后保留的画面高度，单位像素。', explanationId: 'expl.filter.crop.height' })
    addFilterField('frame.filters.crop.x', '左侧偏移', 'number', filters.crop.x, undefined, { min: 0, max: 7680, step: 2 }, { description: '从画面左边缘往右跳过多少像素后开始保留。0 从最左边开始。', explanationId: 'expl.filter.crop.x' })
    addFilterField('frame.filters.crop.y', '顶部偏移', 'number', filters.crop.y, undefined, { min: 0, max: 4320, step: 2 }, { description: '从画面上边缘往下跳过多少像素后开始保留。0 从最顶部开始。', explanationId: 'expl.filter.crop.y' })
  }

  addFilterField(
    'frame.filters.transform.rotate',
    '旋转',
    'select',
    filters.transform.rotate,
    [
      { value: 'none', label: '不旋转' },
      { value: 'clockwise', label: '顺时针 90°' },
      { value: 'counterclockwise', label: '逆时针 90°' },
      { value: '180', label: '旋转 180°' },
    ],
  )
  addFilterField('frame.filters.transform.horizontalFlip', '水平镜像', 'switch', filters.transform.horizontalFlip)
  addFilterField('frame.filters.transform.verticalFlip', '垂直镜像', 'switch', filters.transform.verticalFlip)

  addFilterField('frame.filters.adjustment.enabled', '启用画面调整', 'switch', filters.adjustment.enabled)
  if (filters.adjustment.enabled) {
    addFilterField('frame.filters.adjustment.brightness', '亮度', 'number', filters.adjustment.brightness, undefined, { min: -1, max: 1, step: 0.05 })
    addFilterField('frame.filters.adjustment.contrast', '对比度', 'number', filters.adjustment.contrast, undefined, { min: -2, max: 2, step: 0.05 })
    addFilterField('frame.filters.adjustment.saturation', '饱和度', 'number', filters.adjustment.saturation, undefined, { min: 0, max: 3, step: 0.05 })
    addFilterField('frame.filters.adjustment.gamma', '伽马', 'number', filters.adjustment.gamma, undefined, { min: 0.1, max: 10, step: 0.1 })
  }

  addFilterField('frame.filters.deinterlace.enabled', '启用去隔行', 'switch', filters.deinterlace.enabled)
  if (filters.deinterlace.enabled) {
    addFilterField(
      'frame.filters.deinterlace.mode',
      '去隔行输出模式',
      'select',
      filters.deinterlace.mode,
      [
        { value: 'send_frame', label: '每帧输出一帧' },
        { value: 'send_field', label: '每场输出一帧（双帧率）' },
      ],
    )
    addFilterField(
      'frame.filters.deinterlace.parity',
      '场序',
      'select',
      filters.deinterlace.parity,
      [
        { value: 'auto', label: '自动检测' },
        { value: 'tff', label: '顶场优先' },
        { value: 'bff', label: '底场优先' },
      ],
    )
  }

  addFilterField('frame.filters.sharpen.enabled', '启用锐化', 'switch', filters.sharpen.enabled)
  if (filters.sharpen.enabled) {
    addFilterField('frame.filters.sharpen.amount', '锐化强度', 'number', filters.sharpen.amount, undefined, { min: -2, max: 5, step: 0.1 })
  }

  addFilterField('frame.filters.denoise.enabled', '启用降噪', 'switch', filters.denoise.enabled)
  if (filters.denoise.enabled) {
    addFilterField('frame.filters.denoise.algorithm', '降噪滤镜', 'select', filters.denoise.algorithm ?? '', [
      { value: '', label: '请选择滤镜' },
      { value: 'hqdn3d', label: 'hqdn3d（时空域）' },
      { value: 'nlmeans', label: 'nlmeans（高质量）' },
      { value: 'atadenoise', label: 'atadenoise（时间域）' },
      { value: 'bm3d', label: 'bm3d（高质量/高负载）' },
    ])
    const values = filters.denoise.values
    if (filters.denoise.algorithm === 'hqdn3d') {
      addFilterField('frame.filters.denoise.values.lumaSpatial', '亮度空间强度', 'number', values.lumaSpatial, undefined, { min: 0, max: 20, step: 0.1 })
      addFilterField('frame.filters.denoise.values.chromaSpatial', '色度空间强度', 'number', values.chromaSpatial, undefined, { min: 0, max: 20, step: 0.1 })
      addFilterField('frame.filters.denoise.values.lumaTemporal', '亮度时间强度', 'number', values.lumaTemporal, undefined, { min: 0, max: 20, step: 0.1 })
      addFilterField('frame.filters.denoise.values.chromaTemporal', '色度时间强度', 'number', values.chromaTemporal, undefined, { min: 0, max: 20, step: 0.1 })
    } else if (filters.denoise.algorithm === 'nlmeans') {
      addFilterField('frame.filters.denoise.values.strength', '降噪强度', 'number', values.strength, undefined, { min: 1, max: 30, step: 0.1 })
      addFilterField('frame.filters.denoise.values.patchSize', '参考像素块大小', 'number', values.patchSize, undefined, { min: 0, max: 99, step: 1 })
      addFilterField('frame.filters.denoise.values.chromaPatchSize', '色度像素块大小', 'number', values.chromaPatchSize, undefined, { min: 0, max: 99, step: 1 })
      addFilterField('frame.filters.denoise.values.researchSize', '搜索半径', 'number', values.researchSize, undefined, { min: 0, max: 99, step: 1 })
    } else if (filters.denoise.algorithm === 'atadenoise') {
      addFilterField('frame.filters.denoise.values.lumaStatic', '亮度静态帧加权', 'number', values.lumaStatic, undefined, { min: 0, max: 0.3, step: 0.01 })
      addFilterField('frame.filters.denoise.values.lumaDynamic', '亮度动态帧加权', 'number', values.lumaDynamic, undefined, { min: 0, max: 5, step: 0.01 })
      addFilterField('frame.filters.denoise.values.chromaStatic', '色度静态帧加权', 'number', values.chromaStatic, undefined, { min: 0, max: 0.3, step: 0.01 })
      addFilterField('frame.filters.denoise.values.chromaDynamic', '色度动态帧加权', 'number', values.chromaDynamic, undefined, { min: 0, max: 5, step: 0.01 })
    } else if (filters.denoise.algorithm === 'bm3d') {
      addFilterField('frame.filters.denoise.values.sigma', '噪声强度 sigma', 'number', values.sigma, undefined, { min: 0, max: 100, step: 0.1 })
      addFilterField('frame.filters.denoise.values.block', '块大小', 'number', values.block, undefined, { min: 8, max: 64, step: 1 })
      addFilterField('frame.filters.denoise.values.blockStep', '块步长', 'number', values.blockStep, undefined, { min: 1, max: 64, step: 1 })
      addFilterField('frame.filters.denoise.values.group', '相似块数量', 'number', values.group, undefined, { min: 1, max: 256, step: 1 })
    }
  }

  addFilterField('frame.filters.deband.enabled', '启用去色带', 'switch', filters.deband.enabled)
  if (filters.deband.enabled) {
    addFilterField('frame.filters.deband.algorithm', '去色带滤镜', 'select', filters.deband.algorithm ?? '', [
      { value: '', label: '请选择滤镜' },
      { value: 'deband', label: 'deband' },
      { value: 'gradfun', label: 'gradfun' },
    ])
    const values = filters.deband.values
    if (filters.deband.algorithm === 'deband') {
      addFilterField('frame.filters.deband.values.threshold', '阈值', 'number', values.threshold, undefined, { min: 0.00003, max: 0.5, step: 0.001 })
      addFilterField('frame.filters.deband.values.range', '采样范围', 'number', values.range, undefined, { min: 1, max: 256, step: 1 })
      addFilterField('frame.filters.deband.values.direction', '方向', 'number', values.direction, undefined, { min: -6.28, max: 6.28, step: 0.01 })
      addFilterField('frame.filters.deband.values.coupling', '平面耦合', 'switch', values.coupling ?? false)
    } else if (filters.deband.algorithm === 'gradfun') {
      addFilterField('frame.filters.deband.values.strength', '平滑强度', 'number', values.strength, undefined, { min: 0.51, max: 64, step: 0.01 })
      addFilterField('frame.filters.deband.values.radius', '渐变拟合半径', 'number', values.radius, undefined, { min: 4, max: 32, step: 1 })
    }
  }

  return { id: 'section.frame', label: '画面参数', fields }
}

export function resolveAudioSection(
  config: ProjectConfig,
  catalog: Catalog,
  fieldStates: Record<string, FieldState>,
): ResolvedSection {
  const fields: ResolvedField[] = []

  // Audio mode
  const audioModeParam = catalog.parameters['param.audio.mode']
  if (audioModeParam) {
    fields.push(resolveParameterField(audioModeParam, config, 'audio.mode', fieldStates))
  }

  // Audio encoder selector (only when mode=encode)
  if (config.audio.mode === 'encode') {
    const audioEncoderParam = catalog.parameters['param.audio.encoder']
    if (audioEncoderParam) {
      const encField = resolveParameterField(audioEncoderParam, config, 'audio.encoderId', fieldStates)
      const categoryLabels = {
        aac: 'AAC 家族',
        'general-lossy': '通用有损',
        lossless: '无损编码',
        pcm: 'PCM / WAV',
        platform: '平台专属',
        voice: '语音编码',
        legacy: '旧格式',
        experimental: '实验性',
      }
      const recommendations: Record<string, string[]> = {
        webm: ['libopus', 'libvorbis'],
        mp4: ['aac', 'libfdk_aac', 'alac', 'libmp3lame'],
        mov: ['aac', 'alac', 'libfdk_aac', 'pcm_s16le'],
        m4a: ['aac', 'libfdk_aac', 'alac', 'libmp3lame'],
        mkv: ['libopus', 'aac', 'flac', 'ac3'],
      }
      const recommendedIds = recommendations[config.output.containerId]
        ?? ['aac', 'libopus', 'flac', 'libmp3lame']
      encField.description = '先从当前容器的常用推荐中选择，或搜索并浏览全部编码器。'
      encField.options = Object.values(catalog.encoders.audio).map((enc) => {
        const category = enc.audioCategory ?? 'legacy'
        const containerCompatibility = catalog.containers[config.output.containerId]?.audioCodecs[enc.id]
        const availabilityBadge = enc.availabilityClass === 'generally-available'
          ? '内置'
          : enc.availabilityClass === 'platform-dependent'
            ? '平台专属'
            : enc.availabilityClass === 'experimental'
              ? '实验性'
              : '需特定构建'
        return {
          value: enc.id,
          label: enc.label,
          description: enc.availabilityNote,
          group: categoryLabels[category],
          badge: enc.ffmpegName,
          badges: [
            enc.audioCategory === 'pcm' ? 'PCM' : enc.capabilities.supportsLossless ? '无损' : '有损',
            availabilityBadge,
          ],
          recommended: recommendedIds.includes(enc.id),
          compatibility: containerCompatibility === 'unsupported'
            ? 'unsupported'
            : containerCompatibility && containerCompatibility !== 'unknown'
              ? 'supported'
              : 'unknown',
          availabilityNote: enc.availabilityNote,
        } as const
      })
      fields.push(encField)
    }

    const audioEncoder = config.audio.encoderId
      ? catalog.encoders.audio[config.audio.encoderId]
      : undefined

    if (audioEncoder) {
      // Bitrate — only for encoders with quality modes (not lossless like FLAC)
      if (audioEncoder.qualityModes.length > 0) {
        const bitrateField = resolveTextField(
          'audio.bitrate',
          '音频码率 (-b:a)',
          config.audio.bitrate,
          fieldStates,
          audioEncoder.id === 'libopus' ? 'expl.libopus.bitrate' : 'expl.aac.bitrate',
        )
        bitrateField.controlType = 'bitrate'
        bitrateField.description = '填写数值后选择单位；例如 192 + kbps 会生成 192k。'
        fields.push(bitrateField)
      }

      const audioSourceRefs: SourceRef[] = [{
        repository: 'FFmpeg/FFmpeg',
        branch: 'master',
        snapshotDate: '2026-07-11',
        file: 'doc/ffmpeg.texi',
        sourceType: 'ffmpeg-official',
        url: 'https://ffmpeg.org/ffmpeg.html#Audio-Options',
      }]

      // 使用 FFmpeg 标准布局名称，避免用户猜测自由文本。
      fields.push({
        id: 'audio.channelLayout',
        label: '声道布局',
        description: '选择“跟随输入”时不生成声道布局参数。',
        controlType: 'select',
        value: config.audio.channelLayout ?? 'source',
        defaultValue: 'stereo',
        options: [
          { value: 'source', label: '跟随输入' },
          { value: 'mono', label: '单声道 (mono)' },
          { value: 'stereo', label: '立体声 (stereo)' },
          { value: '2.1', label: '2.1 声道' },
          { value: '3.0', label: '3.0 声道' },
          { value: 'quad', label: '4.0 声道 (quad)' },
          { value: '5.1', label: '5.1 声道' },
          { value: '5.1(side)', label: '5.1 侧环绕' },
          { value: '7.1', label: '7.1 声道' },
        ],
        visible: true,
        disabled: false,
        sourceRefs: audioSourceRefs,
        verificationLevel: 'official',
        needsCrossVerification: false,
        commandOrigins: ['audio.channelLayout'],
        diagnostics: [],
      })

      // Sample rate
      fields.push({
        id: 'audio.sampleRate',
        label: '采样率 (Hz)',
        controlType: 'select',
        value: config.audio.sampleRate,
        options: [
          { value: 0, label: '跟随输入' },
          { value: 8000, label: '8000 Hz（电话语音）' },
          { value: 11025, label: '11025 Hz' },
          { value: 12000, label: '12000 Hz' },
          { value: 16000, label: '16000 Hz（语音）' },
          { value: 22050, label: '22050 Hz' },
          { value: 24000, label: '24000 Hz' },
          { value: 32000, label: '32000 Hz' },
          { value: 44100, label: '44100 Hz' },
          { value: 48000, label: '48000 Hz' },
          { value: 88200, label: '88200 Hz' },
          { value: 96000, label: '96000 Hz' },
          { value: 176400, label: '176400 Hz' },
          { value: 192000, label: '192000 Hz' },
        ],
        visible: fieldStates['section.audio.samplerate']?.visible !== false,
        disabled: !(fieldStates['section.audio.samplerate']?.enabled !== false),
        sourceRefs: audioSourceRefs,
        verificationLevel: 'official',
        needsCrossVerification: false,
        commandOrigins: [],
        diagnostics: [],
      })

    }
  }

  return { id: 'section.audio', label: '音频参数', fields }
}

/** 当前音频编码器的私有参数，独立折叠以避免基础音频面板过长。 */
export function resolveAudioAdvancedSection(
  config: ProjectConfig,
  catalog: Catalog,
  fieldStates: Record<string, FieldState>,
): ResolvedSection {
  const encoder = config.audio.mode === 'encode' && config.audio.encoderId
    ? catalog.encoders.audio[config.audio.encoderId]
    : undefined
  if (!encoder) return { id: 'section.audio-advanced', label: '音频高级参数', fields: [] }

  const fields = encoder.specialParameters
    .filter((control) => isControlActive(control, config))
    .map((control) => {
      const configPath = control.configBinding?.path ?? `audio.qualityValues.${control.id}`
      const field = resolveControlField(control, config, configPath, fieldStates, encoder)
      field.tier = 'advanced'
      return field
    })

  return {
    id: 'section.audio-advanced',
    label: '音频高级参数',
    description: '仅当前音频编码器支持的专有选项；保持默认时使用 FFmpeg 内建行为。',
    fields,
  }
}

/** FFmpeg loudnorm 单遍动态响度标准化。 */
export function resolveAudioLoudnessSection(
  config: ProjectConfig,
  fieldStates: Record<string, FieldState>,
): ResolvedSection {
  if (config.audio.mode !== 'encode') {
    return { id: 'section.audio-loudness', label: '响度标准化', fields: [] }
  }

  const sourceRefs: SourceRef[] = [{
    repository: 'FFmpeg/FFmpeg',
    branch: 'master',
    snapshotDate: '2026-07-22',
    file: 'doc/filters.texi#loudnorm',
    sourceType: 'ffmpeg-official',
    url: 'https://ffmpeg.org/ffmpeg-filters.html#loudnorm',
  }]
  const controls = [
    {
      id: 'audio.loudnessNormalization.integratedLoudnessEnabled', label: '启用目标响度', control: 'switch',
      configBinding: { path: CONFIG_PATHS.audio.loudnessNormalization.integratedLoudnessEnabled },
      defaultValue: false, explanationId: 'expl.audio.loudnorm.I', sourceRefs,
    },
    {
      id: 'audio.loudnessNormalization.integratedLoudness', label: '目标响度 I (LUFS)', control: 'number',
      configBinding: { path: CONFIG_PATHS.audio.loudnessNormalization.integratedLoudness },
      range: { min: -70, max: -5, step: 1 }, defaultValue: -24,
      explanationId: 'expl.audio.loudnorm.I', sourceRefs,
    },
    {
      id: 'audio.loudnessNormalization.loudnessRangeEnabled', label: '启用动态范围', control: 'switch',
      configBinding: { path: CONFIG_PATHS.audio.loudnessNormalization.loudnessRangeEnabled },
      defaultValue: false, explanationId: 'expl.audio.loudnorm.LRA', sourceRefs,
    },
    {
      id: 'audio.loudnessNormalization.loudnessRange', label: '动态范围 LRA (LU)', control: 'number',
      configBinding: { path: CONFIG_PATHS.audio.loudnessNormalization.loudnessRange },
      range: { min: 1, max: 50, step: 1 }, defaultValue: 7,
      explanationId: 'expl.audio.loudnorm.LRA', sourceRefs,
    },
    {
      id: 'audio.loudnessNormalization.truePeakEnabled', label: '启用峰值电平', control: 'switch',
      configBinding: { path: CONFIG_PATHS.audio.loudnessNormalization.truePeakEnabled },
      defaultValue: false, explanationId: 'expl.audio.loudnorm.TP', sourceRefs,
    },
    {
      id: 'audio.loudnessNormalization.truePeak', label: '峰值电平 TP (dBTP)', control: 'number',
      configBinding: { path: CONFIG_PATHS.audio.loudnessNormalization.truePeak },
      range: { min: -9, max: 0, step: 0.1 }, defaultValue: -2,
      explanationId: 'expl.audio.loudnorm.TP', sourceRefs,
    },
    {
      id: 'audio.loudnessNormalization.dualMono', label: '单声道按立体声播放补偿', control: 'switch',
      configBinding: { path: CONFIG_PATHS.audio.loudnessNormalization.dualMono },
      defaultValue: false, explanationId: 'expl.audio.loudnorm.dualMono', sourceRefs,
    },
  ] satisfies ControlDefinition[]

  const loudness = config.audio.loudnessNormalization
  const anyTargetEnabled = loudness.integratedLoudnessEnabled
    || loudness.loudnessRangeEnabled
    || loudness.truePeakEnabled
  const enabledForValue: Record<string, boolean> = {
    'audio.loudnessNormalization.integratedLoudness': loudness.integratedLoudnessEnabled,
    'audio.loudnessNormalization.loudnessRange': loudness.loudnessRangeEnabled,
    'audio.loudnessNormalization.truePeak': loudness.truePeakEnabled,
    'audio.loudnessNormalization.dualMono': anyTargetEnabled,
  }
  const fields = controls.map((control) => {
    const field = resolveControlField(control, config, control.configBinding.path, fieldStates)
    field.tier = 'advanced'
    if (enabledForValue[control.id] === false) {
      field.disabled = true
      field.disabledReason = control.id.endsWith('dualMono')
        ? '请先启用至少一个响度目标。'
        : '请先开启此项目。'
    }
    return field
  })

  return {
    id: 'section.audio-loudness',
    label: '响度标准化',
    description: 'FFmpeg loudnorm 单遍动态模式；歌曲通常可用 -16 LUFS，影视/广播常用 -23 或 -24 LUFS。',
    fields,
  }
}

export function resolveSubtitleSection(
  config: ProjectConfig,
  catalog: Catalog,
  fieldStates: Record<string, FieldState>,
): ResolvedSection {
  const container = catalog.containers[config.output.containerId]
  const fields: ResolvedField[] = []

  // -- Subtitle tracks (multi) -----------------------------------
  fields.push(resolveSectionLabel('section.subtitle.tracks', '字幕轨道 (混流)', fieldStates))

  // Track count + add button hint
  fields.push({
    id: 'subtitle.tracks.count',
    label: `字幕轨道 (${config.subtitle.tracks.length} 条)`,
    controlType: 'section',
    value: config.subtitle.tracks.length > 0
      ? config.subtitle.tracks.map((t) => `${t.id}: ${t.source}/${t.codecMode}`).join(', ')
      : '未添加字幕轨道',
    visible: true,
    disabled: false,
    sourceRefs: [],
    verificationLevel: 'project-derived',
    needsCrossVerification: false,
    commandOrigins: [],
    diagnostics: [],
  })

  // Per-track fields
  const subtitleCodecOptions = container
    ? Object.entries(container.subtitleCodecs)
        .filter(([, level]) => level === 'supported' || level === 'supported-with-caveat')
        .map(([codec]) => ({ value: codec, label: codec }))
    : []

  for (const track of config.subtitle.tracks) {
    fields.push(resolveSectionLabel(
      `section.subtitle.track.${track.id}`,
      `${track.id}${track.language ? ` · ${track.language}` : ''}`,
      fieldStates,
    ))

    // Source
    fields.push({
      id: `subtitle.tracks.${track.id}.source`,
      label: '来源',
      controlType: 'select',
      value: track.source,
      options: [
        { value: 'input', label: '输入文件中' },
        { value: 'external', label: '外挂字幕文件' },
      ],
      visible: true,
      disabled: false,
      sourceRefs: [],
      verificationLevel: 'project-derived',
      needsCrossVerification: false,
      commandOrigins: [],
      diagnostics: [],
    })

    if (track.source === 'input') {
      fields.push({
        id: `subtitle.tracks.${track.id}.mainStreamRelIndex`,
        label: '流索引 (0=s:0)',
        controlType: 'number',
        value: track.mainStreamRelIndex ?? 0,
        min: 0,
        max: 32,
        step: 1,
        visible: true,
        disabled: false,
        sourceRefs: [],
        verificationLevel: 'project-derived',
        needsCrossVerification: false,
        commandOrigins: [],
        diagnostics: [],
      })
    }

    if (track.source === 'external') {
      fields.push(resolveTextField(
        `subtitle.tracks.${track.id}.path`,
        '文件路径',
        track.path,
        fieldStates,
        undefined, undefined, undefined,
        'open-file',
      ))
      fields.push({
        id: `subtitle.tracks.${track.id}.externalStreamIndex`,
        label: '外挂文件内字幕流索引',
        controlType: 'number',
        value: track.externalStreamIndex ?? 0,
        min: 0,
        max: 32,
        step: 1,
        visible: true,
        disabled: false,
        sourceRefs: [],
        verificationLevel: 'project-derived',
        needsCrossVerification: false,
        commandOrigins: [],
        diagnostics: [],
      })
    }

    // Codec mode
    fields.push({
      id: `subtitle.tracks.${track.id}.codecMode`,
      label: '编码方式',
      controlType: 'select',
      value: track.codecMode,
      options: [
        { value: 'copy', label: '复制原始流' },
        { value: 'transcode', label: '转码' },
      ],
      visible: true,
      disabled: false,
      sourceRefs: [],
      verificationLevel: 'project-derived',
      needsCrossVerification: false,
      commandOrigins: [],
      diagnostics: [],
    })

    if (track.codecMode === 'transcode') {
      fields.push({
        id: `subtitle.tracks.${track.id}.codec`,
        label: '目标编码',
        controlType: 'select',
        value: track.codec ?? subtitleCodecOptions[0]?.value ?? 'mov_text',
        options: subtitleCodecOptions,
        visible: true,
        disabled: false,
        sourceRefs: [],
        verificationLevel: 'project-derived',
        needsCrossVerification: false,
        commandOrigins: [],
        diagnostics: [],
      })
    }

    // Language
    fields.push(resolveTextField(
      `subtitle.tracks.${track.id}.language`,
      '语言 (ISO 639-2)',
      track.language,
      fieldStates,
    ))

    // Title
    fields.push(resolveTextField(
      `subtitle.tracks.${track.id}.title`,
      '标题',
      track.title,
      fieldStates,
    ))

    // Disposition
    fields.push(resolveSwitchField(
      `subtitle.tracks.${track.id}.disposition.default`,
      '默认轨道',
      track.disposition.default ?? false,
      fieldStates,
    ))
    fields.push(resolveSwitchField(
      `subtitle.tracks.${track.id}.disposition.forced`,
      '强制字幕',
      track.disposition.forced ?? false,
      fieldStates,
    ))
    fields.push(resolveSwitchField(
      `subtitle.tracks.${track.id}.disposition.hearingImpaired`,
      '听障辅助字幕',
      track.disposition.hearingImpaired ?? false,
      fieldStates,
    ))
  }

  // -- Subtitle burn --------------------------------------------
  fields.push(resolveSectionLabel('section.subtitle.burn', '字幕烧录', fieldStates))

  fields.push(
    resolveSwitchField(
      'subtitle.burn.enabled',
      '启用字幕烧录',
      config.subtitle.burn.enabled,
      fieldStates,
      undefined,
      [],
    ),
  )

  if (config.subtitle.burn.enabled) {
    fields.push({
      id: 'subtitle.burn.filterKind',
      label: '烧录滤镜',
      controlType: 'select',
      value: config.subtitle.burn.filterKind,
      options: [
        { value: 'subtitles', label: 'subtitles（通用字幕）' },
        { value: 'ass', label: 'ass（ASS 字幕）' },
      ],
      visible: true,
      disabled: false,
      sourceRefs: [],
      verificationLevel: 'official',
      needsCrossVerification: false,
      commandOrigins: ['filter.chain'],
      diagnostics: [],
    })
    fields.push({
      id: 'subtitle.burn.source',
      label: '字幕来源',
      controlType: 'select',
      value: config.subtitle.burn.source,
      options: [
        { value: 'internal', label: '输入文件内字幕流' },
        { value: 'external', label: '外挂字幕文件' },
      ],
      visible: fieldStates['section.subtitle.burn']?.visible !== false,
      disabled: !(fieldStates['section.subtitle.burn']?.enabled !== false),
      sourceRefs: [],
      verificationLevel: 'project-derived',
      needsCrossVerification: false,
      commandOrigins: [],
      diagnostics: [],
    })

    if (config.subtitle.burn.source === 'external') {
      fields.push(
        resolveTextField(
          'subtitle.burn.externalPath',
          '字幕文件路径',
          config.subtitle.burn.externalPath,
          fieldStates,
          undefined, undefined, undefined,
          'open-file',
        ),
      )
    }

    if (config.subtitle.burn.source === 'internal') {
      fields.push({
        id: 'subtitle.burn.streamIndex',
        label: '字幕流索引',
        controlType: 'number',
        value: config.subtitle.burn.streamIndex ?? 0,
        min: 0,
        max: 32,
        step: 1,
        visible: fieldStates['section.subtitle.burn']?.visible !== false,
        disabled: !(fieldStates['section.subtitle.burn']?.enabled !== false),
        sourceRefs: [],
        verificationLevel: 'project-derived',
        needsCrossVerification: false,
        commandOrigins: [],
        diagnostics: [],
      })
    }

    // Burn style fields (collapsible, only show a few basics)
    fields.push({
      id: 'subtitle.burn.style.fontName',
      label: '字体名称',
      controlType: 'text',
      value: config.subtitle.burn.style.fontName ?? '',
      visible: fieldStates['section.subtitle.burn']?.visible !== false,
      disabled: false,
      sourceRefs: [],
      verificationLevel: 'project-derived',
      needsCrossVerification: false,
      commandOrigins: [],
      diagnostics: [],
    })

    fields.push({
      id: 'subtitle.burn.style.fontSize',
      label: '字号',
      controlType: 'number',
      value: config.subtitle.burn.style.fontSize ?? 24,
      min: 8,
      max: 200,
      step: 1,
      visible: fieldStates['section.subtitle.burn']?.visible !== false,
      disabled: false,
      sourceRefs: [],
      verificationLevel: 'project-derived',
      needsCrossVerification: false,
      commandOrigins: [],
      diagnostics: [],
    })

    fields.push(resolveSwitchField('subtitle.burn.style.bold', '粗体', config.subtitle.burn.style.bold ?? false, fieldStates))
    fields.push(resolveSwitchField('subtitle.burn.style.italic', '斜体', config.subtitle.burn.style.italic ?? false, fieldStates))
    fields.push(resolveSwitchField('subtitle.burn.style.underline', '下划线', config.subtitle.burn.style.underline ?? false, fieldStates))
    fields.push(resolveSwitchField('subtitle.burn.style.strikeOut', '删除线', config.subtitle.burn.style.strikeOut ?? false, fieldStates))

    for (const [key, label] of [
      ['primaryColor', '主要颜色（ASS ARGB）'],
      ['secondaryColor', '次要颜色（ASS ARGB）'],
      ['outlineColor', '描边颜色（ASS ARGB）'],
      ['backColor', '背景颜色（ASS ARGB）'],
    ] as const) {
      fields.push(resolveTextField(
        `subtitle.burn.style.${key}`,
        label,
        config.subtitle.burn.style[key] ?? '',
        fieldStates,
      ))
    }

    fields.push({
      id: 'subtitle.burn.style.borderStyle', label: '边框样式', controlType: 'select',
      value: config.subtitle.burn.style.borderStyle ?? 1,
      options: [{ value: 1, label: '描边与阴影' }, { value: 3, label: '不透明背景框' }],
      visible: true, disabled: false, sourceRefs: [], verificationLevel: 'official',
      needsCrossVerification: false, commandOrigins: ['filter.chain'], diagnostics: [],
    })
    fields.push({
      id: 'subtitle.burn.style.alignment', label: '字幕位置', controlType: 'select',
      value: config.subtitle.burn.style.alignment ?? 2,
      options: [
        { value: 1, label: '左下' }, { value: 2, label: '中下' }, { value: 3, label: '右下' },
        { value: 4, label: '左中' }, { value: 5, label: '居中' }, { value: 6, label: '右中' },
        { value: 7, label: '左上' }, { value: 8, label: '中上' }, { value: 9, label: '右上' },
      ],
      visible: true, disabled: false, sourceRefs: [], verificationLevel: 'official',
      needsCrossVerification: false, commandOrigins: ['filter.chain'], diagnostics: [],
    })

    const numericStyleFields: Array<[keyof ProjectConfig['subtitle']['burn']['style'], string, number, number, number]> = [
      ['outline', '描边宽度', 0, 20, 0.5],
      ['shadow', '阴影距离', 0, 20, 0.5],
      ['marginL', '左边距', 0, 2000, 1],
      ['marginR', '右边距', 0, 2000, 1],
      ['marginV', '垂直边距', 0, 2000, 1],
      ['spacing', '字距', -20, 100, 0.5],
    ]
    for (const [key, label, min, max, step] of numericStyleFields) {
      fields.push({
        id: `subtitle.burn.style.${key}`, label, controlType: 'number',
        value: config.subtitle.burn.style[key] ?? 0, min, max, step,
        visible: true, disabled: false, sourceRefs: [], verificationLevel: 'official',
        needsCrossVerification: false, commandOrigins: ['filter.chain'], diagnostics: [],
      })
    }

    fields.push(resolveTextField(
      'subtitle.burn.customForceStyle',
      '补充 force_style',
      config.subtitle.burn.customForceStyle ?? '',
      fieldStates,
    ))
    fields.push(resolveTextField(
      'subtitle.burn.customFilter',
      '完全自定义字幕滤镜（覆盖以上设置）',
      config.subtitle.burn.customFilter ?? '',
      fieldStates,
    ))
  }

  return { id: 'section.subtitle', label: '字幕', fields }
}

export function resolveContainerSection(
  config: ProjectConfig,
  catalog: Catalog,
  fieldStates: Record<string, FieldState>,
): ResolvedSection {
  const fields: ResolvedField[] = []

  // Container selector
  const containerParam = catalog.parameters['param.container']
  if (containerParam) {
    const field = resolveParameterField(containerParam, config, 'output.containerId', fieldStates)
    // Override with dynamic options from catalog
    field.options = Object.values(catalog.containers).map((c) => {
      const supportsVideo = Object.values(c.videoCodecs).some((level) => level !== 'unsupported')
      const supportsAudio = Object.values(c.audioCodecs).some((level) => level !== 'unsupported')
      return {
        value: c.id,
        label: c.label,
        badge: supportsVideo && supportsAudio ? '视频 / 音频' : supportsVideo ? '视频' : '音频',
      }
    })
    fields.push(field)
  }

  return { id: 'section.container', label: '封装设置', fields }
}

/** 左侧“实用工具”工作台。工具只声明约束，不直接保存派生视频码率。 */
export function resolveUtilityToolsSection(
  config: ProjectConfig,
  catalog: Catalog,
): ResolvedSection {
  const tool = config.tools.targetSize
  const calculation = calculateTargetSize(config, catalog)
  const sourceRefs: SourceRef[] = [{
    repository: 'FFmpeg/FFmpeg',
    branch: 'master',
    snapshotDate: '2026-07-19',
    file: 'doc/ffmpeg.texi',
    symbol: 'two-pass encoding',
    sourceType: 'ffmpeg-official',
    url: 'https://ffmpeg.org/ffmpeg.html',
    note: '目标大小通过双遍平均视频码率近似实现。',
  }]
  const common = {
    visible: true,
    disabled: false,
    sourceRefs,
    verificationLevel: 'project-derived' as const,
    needsCrossVerification: false,
    commandOrigins: [] as string[],
    diagnostics: [],
    panelId: 'tools',
    groupId: 'target-size',
    tier: 'basic' as const,
  }

  const fields: ResolvedField[] = [{
    ...common,
    id: 'tools.targetSize.enabled',
    label: '启用目标文件大小',
    description: '开启后使用双遍编码派生视频码率；关闭后恢复原质量控制设置。',
    controlType: 'switch',
    value: tool.enabled,
    configBinding: { path: CONFIG_PATHS.tools.targetSize.enabled },
  }]

  if (tool.enabled) {
    fields.push(
      {
        ...common,
        id: 'tools.targetSize.targetMiB',
        label: '目标文件大小 (MiB)',
        description: '1 MiB = 1024 × 1024 bytes；最终大小会受编码器和封装波动影响。',
        controlType: 'number',
        value: tool.targetMiB,
        min: 1,
        max: 1048576,
        step: 1,
        configBinding: { path: CONFIG_PATHS.tools.targetSize.targetMiB },
      },
      {
        ...common,
        id: 'tools.targetSize.durationMinutes',
        label: '完整视频时长（分钟）',
        description: '请填写完整输入时长；网页不会读取或上传媒体文件。',
        controlType: 'number',
        value: tool.durationMinutes,
        min: 0.01,
        max: 100000,
        step: 0.01,
        configBinding: { path: CONFIG_PATHS.tools.targetSize.durationMinutes },
      },
      {
        ...common,
        id: 'tools.targetSize.overheadPercent',
        label: '封装与波动预留 (%)',
        description: '为容器、字幕、元数据和码率波动预留空间，通常建议 2%–5%。',
        controlType: 'number',
        value: tool.overheadPercent,
        min: 0,
        max: 20,
        step: 0.1,
        configBinding: { path: CONFIG_PATHS.tools.targetSize.overheadPercent },
      },
      {
        ...common,
        id: 'tools.targetSize.manualAudioBitrateKbps',
        label: '手动音频总码率 (kbps，可选)',
        description: '音频复制、无损音频或保留全部音轨时必填；这是所有输出音轨的总和。',
        controlType: 'number',
        value: tool.manualAudioBitrateKbps,
        min: 1,
        max: 1000000,
        step: 1,
        optional: true,
        configBinding: { path: CONFIG_PATHS.tools.targetSize.manualAudioBitrateKbps },
      },
    )

    const result = calculation.videoBitrateKbps !== undefined
      ? `${calculation.videoBitrateKbps} kbps (video) · ${calculation.audioBitrateKbps ?? 0} kbps (audio)`
      : '—'
    fields.push({
      ...common,
      id: 'section.tools.targetSize.result',
      label: '计算结果',
      controlType: 'section',
      value: result,
      commandOrigins: calculation.videoBitrateKbps !== undefined
        ? ['tools.targetSize.targetMiB']
        : [],
    })
  }

  return {
    id: 'section.tools',
    label: '目标文件大小',
    description: '通过双遍平均码率尽量接近指定大小，不保证逐字节精确。',
    fields,
  }
}

export function resolveCustomArgsSection(config: ProjectConfig): ResolvedSection {
  const definitions: Array<[keyof ProjectConfig['customArgs'], string]> = [
    ['globalArgs', '全局参数'],
    ['preInputArgs', '输入前参数'],
    ['videoArgs', '视频参数'],
    ['audioArgs', '音频参数'],
    ['preOutputArgs', '输出前参数'],
    ['tailArgs', '命令末尾参数'],
  ]
  const fields: ResolvedField[] = definitions.map(([key, label]) => ({
    id: `customArgs.${key}`,
    label,
    description: '每行输入一个完整 token；系统仅负责 Shell 转义，不校验 FFmpeg 语义。',
    controlType: 'textarea',
    value: Array.isArray(config.customArgs[key])
      ? config.customArgs[key].join('\n')
      : String(config.customArgs[key] ?? ''),
    visible: true,
    disabled: false,
    sourceRefs: [],
    verificationLevel: 'project-derived',
    needsCrossVerification: false,
    commandOrigins: [`customArgs.${key}`],
    diagnostics: [],
  }))
  return { id: 'section.customArgs', label: '自定义参数（高级）', fields }
}

export function resolveMetadataSection(config: ProjectConfig): ResolvedSection {
  const metadata = config.output.metadata ?? { globalRaw: '', streamRaw: '' }
  const globalLines = metadata.globalRaw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  const streamLines = metadata.streamRaw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  const totalLines = globalLines.length + streamLines.length

  const fields: ResolvedField[] = [
    {
      id: 'output.metadata.globalRaw',
      label: '全局元数据',
      description: '每行一条 key=value，例如 title=我的视频 或 copyright=2026。生成 -metadata key=value。',
      controlType: 'textarea',
      value: metadata.globalRaw,
      visible: true, disabled: false,
      sourceRefs: [{
        repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12',
        file: 'doc/metadata.texi', sourceType: 'ffmpeg-official',
      }],
      verificationLevel: 'official', needsCrossVerification: false,
      commandOrigins: ['output.metadata.globalRaw'], diagnostics: [],
      tier: 'basic', optional: true,
      configBinding: { path: CONFIG_PATHS.output.metadataGlobalRaw },
      panelId: 'custom',
    },
    {
      id: 'output.metadata.streamRaw',
      label: '流级元数据',
      description: '每行一条 stream_type:index:key=value，例如 audio:0:language=jpn 或 video:0:title=主视频。生成 -metadata:s:a:0 language=jpn。',
      controlType: 'textarea',
      value: metadata.streamRaw,
      visible: true, disabled: false,
      sourceRefs: [{
        repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12',
        file: 'doc/metadata.texi', sourceType: 'ffmpeg-official',
      }],
      verificationLevel: 'official', needsCrossVerification: false,
      commandOrigins: ['output.metadata.streamRaw'], diagnostics: [],
      tier: 'basic', optional: true,
      configBinding: { path: CONFIG_PATHS.output.metadataStreamRaw },
      panelId: 'custom',
    },
  ]

  return {
    id: 'section.metadata',
    label: '自定义元数据',
    description: totalLines > 0
      ? `${globalLines.length} 条全局 + ${streamLines.length} 条流级，共 ${totalLines} 条`
      : '每行输入一条 key=value（全局）或 stream_type:index:key=value（流级）',
    fields,
  }
}
