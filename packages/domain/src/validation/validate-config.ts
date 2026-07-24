import type { ProjectConfig } from '../config/project-config'
import type { Catalog } from '../catalog/catalog-types'
import { CODEC_CATEGORIES } from '../catalog/catalog-types'
import type { EvaluationResult, Diagnostic } from '../rules/rule-types'
import { validateCompatibility } from './compatibility-validator'
import { RuleIndex } from '@ffcodec/catalog/rule-index'
import { evaluateRules } from '../rules/rule-evaluator'
import { calculateTargetSize } from '../tools/target-size'
import {
  findInvalidExplicitResolutionDimensions,
  findOddExplicitResolutionDimensions,
  repairOddExplicitResolution,
} from '../config/resolution-repair'

/**
 * Full validation pipeline — rules + compatibility.
 * Called after normalization produces a clean config.
 */
export function validateConfig(
  config: ProjectConfig,
  catalog: Catalog,
  ruleIndex: RuleIndex
): Diagnostic[] {
  const ctx = { config, catalog }

  const ruleResult: EvaluationResult = evaluateRules(ruleIndex.getAll(), ctx)
  const compatMessages = validateCompatibility(config, catalog)
  const subtitleMessages = validateSubtitleTracks(config)
  const colorMessages = validateColorProcessing(config)
  const decodeMessages = validateDecodeSettings(config)
  const resolutionMessages = validateResolution(config)
  const targetSizeMessages = calculateTargetSize(config, catalog).diagnostics

  const placeholderMessages = validatePlaceholderCategory(config)

  return [
    ...ruleResult.messages,
    ...compatMessages,
    ...subtitleMessages,
    ...colorMessages,
    ...decodeMessages,
    ...resolutionMessages,
    ...placeholderMessages,
    ...targetSizeMessages,
  ]
}

function validateDecodeSettings(config: ProjectConfig): Diagnostic[] {
  if (config.video.mode !== 'encode') return []
  const decode = config.input.decode
  const messages: Diagnostic[] = []
  const hasDeviceParameter = Boolean(decode.device?.parameter)
  const hasDeviceValue = Boolean(decode.device?.value?.trim())

  if (decode.hwaccel) {
    messages.push({
      code: 'warn.decode.hwaccel.environment', severity: 'warning', category: 'availability',
      message: 'Hardware decoding depends on the FFmpeg build, operating system, GPU, driver, and source codec.',
      originIds: ['input.decode.hwaccel'], context: { hwaccel: decode.hwaccel },
    })
  }

  if (decode.outputFormat && !decode.hwaccel) {
    messages.push({
      code: 'warn.decode.outputFormat.without.hwaccel', severity: 'warning', category: 'configuration',
      message: 'A hardware-decoder output format is set without selecting a hardware acceleration method.',
      originIds: ['input.decode.outputFormat', 'input.decode.hwaccel'],
      context: { outputFormat: decode.outputFormat },
    })
  }

  if (decode.outputFormat === 'd3d11') {
    messages.push({
      code: 'warn.decode.outputFormat.hardwareFrames', severity: 'warning', category: 'compatibility',
      message: 'D3D11 hardware frames may be incompatible with CPU filters or software encoders without an explicit download step.',
      originIds: ['input.decode.outputFormat'], context: { outputFormat: 'd3d11' },
    })
  }

  if (decode.threads !== undefined && decode.hwaccel) {
    messages.push({
      code: 'info.decode.threads.hwaccel', severity: 'info', category: 'configuration',
      message: 'Decoder thread limits may have little or no effect when hardware decoding is active.',
      originIds: ['input.decode.threads', 'input.decode.hwaccel'],
      context: { threads: decode.threads, hwaccel: decode.hwaccel },
    })
  }

  if (hasDeviceParameter !== hasDeviceValue) {
    messages.push({
      code: 'warn.decode.device.incomplete', severity: 'warning', category: 'configuration',
      message: 'The hardware device parameter name and value must both be set before they are emitted.',
      originIds: ['input.decode.device.parameter', 'input.decode.device.value'],
      context: { parameter: decode.device?.parameter, hasValue: hasDeviceValue },
    })
  }

  if (decode.device?.parameter === 'qsv_device' && decode.hwaccel && decode.hwaccel !== 'qsv') {
    messages.push({
      code: 'warn.decode.device.qsvMismatch', severity: 'warning', category: 'configuration',
      message: 'qsv_device is selected while the hardware acceleration method is not QSV.',
      originIds: ['input.decode.device.parameter', 'input.decode.hwaccel'],
      context: { hwaccel: decode.hwaccel },
    })
  }

  return messages
}

function validateResolution(config: ProjectConfig): Diagnostic[] {
  const invalidDimensions = findInvalidExplicitResolutionDimensions(config)
  if (invalidDimensions.length > 0) {
    return [{
      code: 'error.resolution.dimension.invalid',
      severity: 'error',
      category: 'configuration',
      message: `Explicit output dimensions must be positive integers: ${invalidDimensions.map(({ axis }) => axis).join(', ')}.`,
      originIds: invalidDimensions.map(({ axis }) => `frame.resolution.${axis}`),
      context: { dimensions: invalidDimensions },
    }]
  }

  const dimensions = findOddExplicitResolutionDimensions(config)
  if (dimensions.length === 0) return []

  return [{
    code: 'warn.resolution.dimension.odd',
    severity: 'warning',
    category: 'configuration',
    message: `Explicit output dimensions must be even: ${dimensions.map(({ axis, value }) => `${axis}=${value}`).join(', ')}.`,
    originIds: dimensions.map(({ axis }) => `frame.resolution.${axis}`),
    context: {
      dimensions,
      repairedResolution: repairOddExplicitResolution(config).frame.resolution,
    },
  }]
}

function validateColorProcessing(config: ProjectConfig): Diagnostic[] {
  const color = config.video.color
  const operation = color?.operation ?? 'metadata-only'
  if (!color || operation === 'metadata-only') return []

  const messages: Diagnostic[] = []
  const origins = ['video.color.operation', 'video.color.filter']
  if (config.video.mode !== 'encode') {
    messages.push({
      code: 'error.color.requires.encode', severity: 'error', category: 'configuration',
      message: 'Color conversion requires video encoding.', originIds: origins,
      context: { videoMode: config.video.mode },
    })
  }

  const hasTarget = Boolean(color.space || color.primaries || color.transfer || color.range || color.preFormat)
  if (!hasTarget) {
    messages.push({
      code: 'error.color.conversion.empty', severity: 'error', category: 'configuration',
      message: 'Color conversion has no target values.', originIds: origins,
      context: { filter: color.filter ?? 'zscale' },
    })
  }

  if (color.toneMap && color.toneMap !== 'none' && !color.transfer) {
    messages.push({
      code: 'error.color.tonemap.target', severity: 'error', category: 'configuration',
      message: 'Tone mapping requires an explicit target transfer characteristic.',
      originIds: ['video.color.toneMap', 'video.color.transfer'],
      context: { toneMap: color.toneMap },
    })
  }

  const cpuToneMaps = new Set(['none', 'clip', 'reinhard', 'mobius', 'hable', 'gamma', 'linear'])
  if ((color.filter ?? 'zscale') === 'zscale' && color.toneMap && !cpuToneMaps.has(color.toneMap)) {
    messages.push({
      code: 'error.color.tonemap.filter', severity: 'error', category: 'configuration',
      message: 'The selected tone-mapping algorithm requires libplacebo.',
      originIds: ['video.color.filter', 'video.color.toneMap'],
      context: { toneMap: color.toneMap },
    })
  }

  if (color.filter === 'libplacebo') {
    messages.push({
      code: 'info.color.libplacebo.build', severity: 'info', category: 'availability',
      message: 'libplacebo conversion depends on the user FFmpeg build and GPU runtime.',
      originIds: ['video.color.filter'], context: { filter: 'libplacebo' },
    })
  }
  return messages
}

function validateSubtitleTracks(config: ProjectConfig): Diagnostic[] {
  const unknownCopyTracks = config.subtitle.tracks.filter(
    (track) => track.codecMode === 'copy' && !track.sourceCodecKnown,
  )
  if (unknownCopyTracks.length === 0) return []

  return [{
    code: 'warn.subtitle.copy.unknown.sourcecodec',
    severity: 'warning',
    category: 'compatibility',
    message: 'Subtitle stream copy compatibility cannot be confirmed because the source codec is unknown.',
    originIds: unknownCopyTracks.map((track) => `subtitle.tracks.${track.id}.codecMode`),
    context: {
      trackIds: unknownCopyTracks.map((track) => track.id),
      containerId: config.output.containerId,
    },
  }]
}

function validatePlaceholderCategory(config: ProjectConfig): Diagnostic[] {
  if (config.video.mode !== 'encode' || !config.video.codecCategory) return []

  const category = CODEC_CATEGORIES.find((c) => c.id === config.video.codecCategory)
  if (!category?.placeholder) return []

  return [{
    code: 'info.category.placeholder',
    severity: 'info',
    category: 'availability',
    message: category.placeholderNote ?? `"${category.label}" 分类在当前 FFmpeg 发行版中暂无可用编码器。`,
    originIds: ['video.codecCategory', 'video.encoderId'],
    context: {
      codecCategory: config.video.codecCategory,
      placeholderNote: category.placeholderNote,
    },
  }]
}

export { validateCompatibility }
