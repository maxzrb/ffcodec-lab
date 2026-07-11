// ============================================================
// resolve-section — groups ResolvedFields into logical sections
// for the builder page layout.
// ============================================================

import type { ProjectConfig } from '../config/project-config'
import type { Catalog } from '../catalog/catalog-types'
import type { FieldState } from '../rules/rule-types'
import type { ResolvedField, ResolvedSection } from './resolved-field'
import {
  resolveControlField,
  resolveParameterField,
  resolveTextField,
  resolveSwitchField,
  resolveSectionLabel,
} from './resolve-field'

// -- section builders -------------------------------------------

export function resolveInputSection(
  config: ProjectConfig,
  fieldStates: Record<string, FieldState>,
): ResolvedSection {
  const fields: ResolvedField[] = [
    resolveTextField('input.path', '输入文件路径', config.input.path, fieldStates, undefined, [
      {
        repository: 'manual-note',
        snapshotDate: '2026-07-10',
        file: 'docs/Codex_FFmpeg命令生成器_项目指令集.md',
        sourceType: 'manual-note',
      },
    ]),
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
    ),
    resolveSwitchField(
      'output.overwrite',
      '覆盖已有文件 (-y)',
      config.output.overwrite,
      fieldStates,
    ),
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
    const encField = resolveParameterField(videoEncoderParam, config, 'video.encoderId', fieldStates)
    // Populate with actual encoder list from catalog, grouped by family
    encField.options = Object.values(catalog.encoders.video).map((enc) => ({
      value: enc.id,
      label: enc.label,
      group: enc.family,
      badge: enc.implementation === 'nvidia' ? 'NVIDIA' : '软件',
      description: enc.availabilityNote?.slice(0, 80),
    }))
    fields.push(encField)
  }

  // Encoder-specific controls
  const encoder = config.video.encoderId
    ? catalog.encoders.video[config.video.encoderId]
    : undefined

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
      fields.push(
        resolveControlField(encoder.pixelFormat, config, 'video.pixelFormat', fieldStates, encoder),
      )
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
      disabled: false,
      options: qualityModes.map((qm) => ({ value: qm.id, label: qm.label })),
      sourceRefs: encoder.sourceRefs,
      verificationLevel: encoder.verificationLevel,
      needsCrossVerification: encoder.needsCrossVerification,
      commandOrigins: [],
      diagnostics: [],
    })

    // Quality mode specific controls
    const activeMode = qualityModes.find((qm) => qm.id === rcMode)
    if (activeMode) {
      for (const ctrl of activeMode.controls) {
        const configPath = resolveQualityControlConfigPath(ctrl, rcMode)
        fields.push(resolveControlField(ctrl, config, configPath, fieldStates, encoder))
      }
    }

    // Two-pass bitrate (only when mode is twoPass)
    if (rcMode === 'twoPass') {
      const twoPassMode = qualityModes.find((qm) => qm.id === 'twoPass')
      if (twoPassMode) {
        for (const ctrl of twoPassMode.controls) {
          fields.push(resolveControlField(ctrl, config, 'video.rateControl.bitrate', fieldStates, encoder))
        }
      }
    }

    // Special parameters
    for (const sp of encoder.specialParameters) {
      const configPath = sp.configBinding?.path ?? `video.specialParameters.${sp.id}`
      fields.push(resolveControlField(sp, config, configPath, fieldStates, encoder))
    }
  }

  return { id: 'section.video', label: '视频编码', fields }
}

/**
 * Resolve the config path for a quality control using its configBinding.
 * Uses the control's explicit configBinding if present; falls back to
 * pattern matching (for backwards compatibility with any remaining
 * controls that haven't been migrated).
 */
function resolveQualityControlConfigPath(ctrl: { id: string; configBinding?: { path: string } }, _mode: string): string {
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
      // Populate with actual encoder list from catalog
      encField.options = Object.values(catalog.encoders.audio).map((enc) => ({
        value: enc.id,
        label: enc.label,
        badge: enc.family === 'flac' ? '无损' : undefined,
      }))
      fields.push(encField)
    }

    const audioEncoder = config.audio.encoderId
      ? catalog.encoders.audio[config.audio.encoderId]
      : undefined

    if (audioEncoder) {
      // Bitrate — only for encoders with quality modes (not lossless like FLAC)
      if (audioEncoder.qualityModes.length > 0) {
        fields.push(
          resolveTextField('audio.bitrate', '音频码率 (-b:a)', config.audio.bitrate, fieldStates),
        )
      }

      // Channel layout
      fields.push(
        resolveTextField(
          'audio.channelLayout',
          '声道布局',
          config.audio.channelLayout,
          fieldStates,
        ),
      )

      // Sample rate
      fields.push({
        id: 'audio.sampleRate',
        label: '采样率 (Hz)',
        controlType: 'select',
        value: config.audio.sampleRate,
        options: [
          { value: 44100, label: '44100 Hz' },
          { value: 48000, label: '48000 Hz' },
          { value: 96000, label: '96000 Hz' },
        ],
        visible: fieldStates['section.audio.samplerate']?.visible !== false,
        disabled: !(fieldStates['section.audio.samplerate']?.enabled !== false),
        sourceRefs: [],
        verificationLevel: 'project-derived',
        needsCrossVerification: false,
        commandOrigins: [],
        diagnostics: [],
      })

      // Encoder-specific special parameters
      for (const sp of audioEncoder.specialParameters) {
        const configPath = sp.configBinding?.path ?? `audio.qualityValues.${sp.id}`
        fields.push(resolveControlField(sp, config, configPath, fieldStates, audioEncoder))
      }
    }
  }

  return { id: 'section.audio', label: '音频参数', fields }
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
    controlType: 'text',
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
      `字幕: ${track.id}`,
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
      ))
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
    field.options = Object.values(catalog.containers).map((c) => ({
      value: c.id,
      label: c.label,
    }))
    fields.push(field)
  }

  return { id: 'section.container', label: '封装设置', fields }
}
