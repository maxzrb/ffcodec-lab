import type {
  Catalog,
  ControlDefinition,
  EncoderDefinition,
} from '../catalog/catalog-types'
import { isControlActive } from '../catalog/control-condition'
import type { ProjectConfig } from '../config/project-config'
import { getByPath } from '../utils/object-path'
import {
  projectConfigForAudioStream,
  projectConfigForVideoStream,
  resolveEffectiveAudioStreamPlans,
  resolveEffectiveVideoStreamPlans,
} from '../streams'

export interface RequiredVideoEncoder {
  encoderId: string
  ffmpegName: string
  originId: string
}

export interface VideoEncoderOptionRequirement {
  option: string
  originId: string
}

export interface VideoEncoderOptionGroup {
  encoderId: string
  ffmpegName: string
  requirements: VideoEncoderOptionRequirement[]
}

export type AudioEncoderOptionGroup = VideoEncoderOptionGroup

/** 将 -profile:v:0 等命令写法归一化为 encoder AVOptions 中汇报的 -profile。 */
export function normalizeEncoderOptionName(argName: string): string {
  const trimmed = argName.trim()
  const match = /^(-[^:]+)(?::[vas](?::\d+)?)?$/.exec(trimmed)
  return match?.[1] ?? trimmed
}

/** 收集当前配置可能实际使用的全部视频编码器，包括逐流覆写。 */
export function collectRequiredVideoEncoders(
  config: ProjectConfig,
  catalog: Catalog,
): RequiredVideoEncoder[] {
  if (config.video.mode !== 'encode') return []

  const result = new Map<string, RequiredVideoEncoder>()
  const add = (encoderId: string | undefined, originId: string) => {
    if (!encoderId) return
    const encoder = catalog.encoders.video[encoderId]
    if (!encoder) return
    result.set(encoder.ffmpegName, { encoderId, ffmpegName: encoder.ffmpegName, originId })
  }

  if (config.streams.preserveAllVideoStreams) {
    add(config.video.encoderId, 'param.video.encoder')
  } else {
    for (const plan of resolveEffectiveVideoStreamPlans(config)) {
      if (plan.codecMode === 'encode') add(plan.video.encoderId, `streams.video.${plan.inputIndex}.encoder`)
    }
  }
  return [...result.values()]
}

/** 收集全局或逐流快照实际使用的音频编码器。 */
export function collectRequiredAudioEncoders(
  config: ProjectConfig,
  catalog: Catalog,
): RequiredVideoEncoder[] {
  if (config.audio.mode !== 'encode') return []
  const result = new Map<string, RequiredVideoEncoder>()
  const add = (encoderId: string | undefined, originId: string) => {
    if (!encoderId) return
    const encoder = catalog.encoders.audio[encoderId]
    if (encoder) result.set(encoder.ffmpegName, { encoderId, ffmpegName: encoder.ffmpegName, originId })
  }
  if (config.streams.preserveAllAudioStreams) {
    add(config.audio.encoderId, 'param.audio.encoder')
  } else {
    for (const plan of resolveEffectiveAudioStreamPlans(config)) {
      if (plan.codecMode === 'encode') add(plan.audio.encoderId, `streams.audio.${plan.inputIndex}.encoder`)
    }
  }
  return [...result.values()]
}

/**
 * 返回编码器所有可按 AVOption 探测的控件。像素格式属于通用 FFmpeg 选项，
 * 不应拿 encoder 私有帮助页来判定。
 */
export function collectVideoEncoderControlOptions(
  encoder: EncoderDefinition,
  config: ProjectConfig,
): VideoEncoderOptionRequirement[] {
  const result = new Map<string, VideoEncoderOptionRequirement>()
  const addControl = (control: ControlDefinition | undefined) => {
    if (!control?.commandBinding || !isControlActive(control, config)) return
    const option = normalizeEncoderOptionName(control.commandBinding.prefix ?? control.commandBinding.argName)
    if (GENERIC_VIDEO_OPTIONS.has(option)) return
    result.set(control.id, { option, originId: control.id })
  }

  addControl(encoder.preset)
  addControl(encoder.profile)
  addControl(encoder.tune)
  const mode = encoder.qualityModes.find((candidate) => candidate.id === config.video.rateControl?.mode)
  mode?.controls.forEach(addControl)
  encoder.specialParameters.forEach(addControl)
  return [...result.values()]
}

/** 返回当前配置确实会发射的编码器私有 AVOptions，用于运行前阻塞。 */
export function collectConfiguredVideoEncoderOptions(
  config: ProjectConfig,
  catalog: Catalog,
): VideoEncoderOptionRequirement[] {
  const encoderId = config.video.encoderId
  if (config.video.mode !== 'encode' || !encoderId) return []
  const encoder = catalog.encoders.video[encoderId]
  if (!encoder) return []

  const result = new Map<string, VideoEncoderOptionRequirement>()
  const addOption = (argName: string, originId: string) => {
    const option = normalizeEncoderOptionName(argName)
    if (!GENERIC_VIDEO_OPTIONS.has(option)) result.set(`${option}\u0000${originId}`, { option, originId })
  }
  const addConfiguredControl = (control: ControlDefinition | undefined, useDefault = false) => {
    if (!control?.commandBinding || !isControlActive(control, config)) return
    const storedValue = control.configBinding?.path ? getByPath(config, control.configBinding.path) : undefined
    const value = storedValue ?? (useDefault ? control.defaultValue : undefined)
    if (value === undefined || value === null || value === '') return
    addOption(control.commandBinding.prefix ?? control.commandBinding.argName, control.id)
  }

  addConfiguredControl(encoder.preset)
  addConfiguredControl(encoder.profile)
  addConfiguredControl(encoder.tune)

  const mode = encoder.qualityModes.find((candidate) => candidate.id === config.video.rateControl?.mode)
  for (const argument of mode?.modeArguments ?? []) addOption(argument.argName, `param.video.rateMode.${mode!.id}`)
  mode?.controls.forEach((control) => addConfiguredControl(control, true))
  encoder.specialParameters.forEach((control) => addConfiguredControl(control))
  return [...result.values()]
}

/**
 * 按实际输出流使用的编码器分组收集私有选项，供批处理逐项复检。
 * 逐流覆写可能同时使用多个编码器，不能只检查全局 encoderId。
 */
export function collectConfiguredVideoEncoderOptionGroups(
  config: ProjectConfig,
  catalog: Catalog,
): VideoEncoderOptionGroup[] {
  if (config.video.mode !== 'encode') return []
  if (config.streams.preserveAllVideoStreams) {
    const encoder = config.video.encoderId ? catalog.encoders.video[config.video.encoderId] : undefined
    return encoder ? [{
      encoderId: encoder.id,
      ffmpegName: encoder.ffmpegName,
      requirements: collectConfiguredVideoEncoderOptions(config, catalog),
    }] : []
  }

  const groups = new Map<string, VideoEncoderOptionGroup>()
  const add = (encoder: EncoderDefinition, argName: string, originId: string) => {
    const option = normalizeEncoderOptionName(argName)
    if (GENERIC_VIDEO_OPTIONS.has(option)) return
    const group = groups.get(encoder.ffmpegName) ?? {
      encoderId: encoder.id,
      ffmpegName: encoder.ffmpegName,
      requirements: [],
    }
    if (!group.requirements.some((entry) => entry.option === option && entry.originId === originId)) {
      group.requirements.push({ option, originId })
    }
    groups.set(encoder.ffmpegName, group)
  }
  const addControl = (
    encoder: EncoderDefinition,
    control: ControlDefinition | undefined,
    value: unknown,
    originId?: string,
  ) => {
    if (!control?.commandBinding || value === undefined || value === null || value === '' || value === 'auto') return
    add(encoder, control.commandBinding.prefix ?? control.commandBinding.argName, originId ?? control.id)
  }

  const plans = resolveEffectiveVideoStreamPlans(config)
  for (const plan of plans) {
    if (plan.codecMode !== 'encode') continue
    const streamConfig = projectConfigForVideoStream(config, plan)
    const encoderId = streamConfig.video.encoderId
    const encoder = encoderId ? catalog.encoders.video[encoderId] : undefined
    if (!encoder) continue
    const group = groups.get(encoder.ffmpegName) ?? {
      encoderId: encoder.id,
      ffmpegName: encoder.ffmpegName,
      requirements: [],
    }
    groups.set(encoder.ffmpegName, group)

    addControl(encoder, encoder.preset, streamConfig.video.preset, `streams.video.${plan.inputIndex}.preset`)
    addControl(encoder, encoder.profile, streamConfig.video.profile, `streams.video.${plan.inputIndex}.profile`)
    addControl(encoder, encoder.tune, streamConfig.video.tune, `streams.video.${plan.inputIndex}.tune`)

    const legacy = config.streams.videoStreams[plan.outputIndex]?.video
    if (legacy?.crf == null && !legacy?.bitrate && streamConfig.video.rateControl) {
      const mode = encoder.qualityModes.find((candidate) => candidate.id === streamConfig.video.rateControl?.mode)
      for (const argument of mode?.modeArguments ?? []) {
        add(encoder, argument.argName, `streams.video.${plan.inputIndex}.rateMode`)
      }
      for (const control of mode?.controls ?? []) {
        const value = control.configBinding?.path ? getByPath(streamConfig, control.configBinding.path) : undefined
        addControl(encoder, control, value ?? control.defaultValue)
      }
    }
    for (const control of encoder.specialParameters) {
      const value = control.configBinding?.path ? getByPath(streamConfig, control.configBinding.path) : undefined
      addControl(encoder, control, value, `streams.video.${plan.inputIndex}.${control.id}`)
    }
  }

  return [...groups.values()]
}

/** 按有效音频流方案分组收集实际会发射的私有 AVOptions。 */
export function collectConfiguredAudioEncoderOptionGroups(
  config: ProjectConfig,
  catalog: Catalog,
): AudioEncoderOptionGroup[] {
  if (config.audio.mode !== 'encode') return []
  const plans = resolveEffectiveAudioStreamPlans(config)
  const groups = new Map<string, AudioEncoderOptionGroup>()
  for (const plan of plans) {
    if (plan.codecMode !== 'encode') continue
    const streamConfig = projectConfigForAudioStream(config, plan)
    const encoderId = streamConfig.audio.encoderId
    const encoder = encoderId ? catalog.encoders.audio[encoderId] : undefined
    if (!encoder) continue
    const group = groups.get(encoder.ffmpegName) ?? {
      encoderId: encoder.id,
      ffmpegName: encoder.ffmpegName,
      requirements: [],
    }
    for (const control of encoder.specialParameters) {
      if (!control.commandBinding || !isControlActive(control, streamConfig)) continue
      const value = control.configBinding?.path ? getByPath(streamConfig, control.configBinding.path) : undefined
      const effectiveValue = value ?? (control.optional ? undefined : control.defaultValue)
      if (effectiveValue === undefined || effectiveValue === null || effectiveValue === '' || effectiveValue === 'auto') continue
      const option = normalizeEncoderOptionName(control.commandBinding.prefix ?? control.commandBinding.argName)
      if (!GENERIC_AUDIO_OPTIONS.has(option) && !group.requirements.some((entry) => entry.option === option)) {
        group.requirements.push({ option, originId: `streams.audio.${plan.inputIndex}.${control.id}` })
      }
    }
    groups.set(encoder.ffmpegName, group)
  }
  return [...groups.values()]
}

const GENERIC_VIDEO_OPTIONS = new Set([
  '-b', '-minrate', '-maxrate', '-bufsize', '-q', '-qscale', '-pix_fmt', '-threads',
])

const GENERIC_AUDIO_OPTIONS = new Set(['-b', '-ar', '-channel_layout', '-sample_fmt'])
