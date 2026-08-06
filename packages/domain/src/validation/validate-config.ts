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
import { buildVideoFilterChain } from '../filters/video-filter-builder'
import {
  getSelectedProbePixelFormats,
  inspectFilterPrecisionIssues,
  resolveHardwareFrameDownloadFormat,
} from '../filters/filter-format-resolver'
import {
  projectConfigForVideoStream,
  resolveEffectiveVideoStreamPlans,
} from '../streams'

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
  const filterProcessingMessages = validateFilterProcessing(config)
  const streamSnapshotMessages = validateStreamSnapshots(config)
  const multiVideoTwoPassMessages = validateMultiVideoTwoPass(config, catalog)

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
    ...filterProcessingMessages,
    ...streamSnapshotMessages,
    ...multiVideoTwoPassMessages,
  ]
}

function validateStreamSnapshots(config: ProjectConfig): Diagnostic[] {
  const snapshots = resolveEffectiveVideoStreamPlans(config).filter(
    (plan) => plan.codecMode === 'encode' && plan.source === 'snapshot',
  )
  if (snapshots.length === 0) return []
  const messages: Diagnostic[] = []
  for (const plan of snapshots) {
    const originId = `streams.video.${plan.inputIndex}.snapshot`
    if (plan.video.rateControl?.mode === 'twoPass') {
      messages.push({
        code: 'error.stream.snapshot.twopass',
        severity: 'error',
        category: 'configuration',
        message: 'Traditional passlog two-pass encoding is not supported inside a per-stream snapshot.',
        originIds: [originId],
        context: { inputIndex: plan.inputIndex },
      })
    }
    const streamConfig = projectConfigForVideoStream(config, plan)
    const processing = streamConfig.frame.filters?.processing
    for (const issue of inspectFilterPrecisionIssues(streamConfig, buildVideoFilterChain(streamConfig))) {
      messages.push({
        code: processing?.incompatiblePolicy === 'warn'
          ? 'warn.stream.snapshot.filter.precision'
          : 'error.stream.snapshot.filter.precision',
        severity: processing?.incompatiblePolicy === 'warn' ? 'warning' : 'error',
        category: 'compatibility',
        message: `${issue.filter}: ${issue.reason}`,
        originIds: [originId],
        context: { inputIndex: plan.inputIndex, filter: issue.filter },
      })
    }
  }
  if (config.tools.targetSize.enabled) {
    messages.push({
      code: 'warn.stream.snapshot.targetSize',
      severity: 'warning',
      category: 'configuration',
      message: 'Target-size bitrate allocation does not override frozen video stream snapshots.',
      originIds: ['tools.targetSize.targetMiB', ...snapshots.map((plan) => `streams.video.${plan.inputIndex}.snapshot`)],
      context: { snapshotCount: snapshots.length },
    })
  }
  return messages
}

function validateFilterProcessing(config: ProjectConfig): Diagnostic[] {
  const processing = config.frame.filters?.processing
  if (!processing || processing.mode === 'compatible' || config.video.mode !== 'encode') return []
  const issues = inspectFilterPrecisionIssues(config, buildVideoFilterChain(config))
  const messages: Diagnostic[] = issues.map((issue) => ({
    code: processing.incompatiblePolicy === 'block'
      ? 'error.filter.processing.precision'
      : 'warn.filter.processing.precision',
    severity: processing.incompatiblePolicy === 'block' ? 'error' : 'warning',
    category: 'compatibility',
    message: `${issue.filter}: ${issue.reason}`,
    originIds: [
      'frame.filters.processing.mode',
      'frame.filters.processing.incompatiblePolicy',
    ],
    context: {
      filter: issue.filter,
      reason: issue.reason,
      alternatives: issue.alternatives,
    },
  }))
  if (
    buildVideoFilterChain(config).length > 0
    && isAbsoluteLocalPath(config.input.path)
    && getSelectedProbePixelFormats(config).length === 0
  ) {
    messages.push({
      code: 'warn.filter.processing.probeRecommended',
      severity: 'warning',
      category: 'configuration',
      message: 'High-precision filter format negotiation has no matching ffprobe pixel-format information, so the command must use a generic fallback candidate list.',
      originIds: ['input.path', 'frame.filters.processing.mode'],
      context: { inputPath: config.input.path },
    })
  }
  if (
    config.video.encoderId
    && /_(?:vaapi|vulkan|d3d12)$/.test(config.video.encoderId)
    && buildVideoFilterChain(config).length > 0
  ) {
    messages.push({
      code: 'error.filter.processing.hardwareUpload',
      severity: 'error',
      category: 'compatibility',
      message: 'The selected encoder requires API-specific hardware frames, but the resolved high-precision pipeline ends in software frames and no safe upload device is configured.',
      originIds: ['frame.filters.processing.mode', 'video.encoderId'],
      context: { encoderId: config.video.encoderId },
    })
  }
  return messages
}

function isAbsoluteLocalPath(path: string): boolean {
  return /^(?:[A-Za-z]:[\\/]|\\\\|\/)/.test(path.trim())
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

  if (decode.outputFormat === 'd3d11' || decode.outputFormat === 'cuda') {
    const resolvedFilterChain = buildVideoFilterChain(config)
    const downloadsHardwareFrames = resolvedFilterChain.some((spec) => spec.type === 'hwdownload')
    const hasControlledCpuFilterWithoutDownload = !downloadsHardwareFrames
      && resolvedFilterChain.some((spec) => spec.type !== 'custom')
    const hardwareDownloadFormat = resolveHardwareFrameDownloadFormat(config)
    if (downloadsHardwareFrames && !hardwareDownloadFormat) {
      messages.push({
        code: 'error.decode.outputFormat.hardwareDownloadFormatUnknown',
        severity: 'error',
        category: 'compatibility',
        message: 'The hardware-frame download format cannot be derived safely from the selected probed video streams.',
        originIds: ['input.decode.outputFormat', 'input.path'],
        context: { outputFormat: decode.outputFormat },
      })
    } else {
      messages.push({
        code: downloadsHardwareFrames
          ? 'info.decode.outputFormat.hardwareFramesDownloaded'
          : 'warn.decode.outputFormat.hardwareFrames',
        severity: downloadsHardwareFrames ? 'info' : 'warning',
        category: 'compatibility',
        message: downloadsHardwareFrames
          ? 'Hardware frames are explicitly downloaded in their probed software format before the CPU high-precision filter pipeline.'
          : 'Hardware frames may be incompatible with CPU filters or software encoders without an explicit download step.',
        originIds: ['input.decode.outputFormat'],
        context: { outputFormat: decode.outputFormat, hardwareDownloadFormat },
      })
    }

    if (!downloadsHardwareFrames && config.video.pixelFormat && config.video.pixelFormat !== 'auto') {
      messages.push({
        code: 'error.decode.outputFormat.hardwareFramesExplicitPixelFormat',
        severity: 'error',
        category: 'compatibility',
        message: 'An explicit software pixel format cannot be forced while the filter chain still outputs hardware frames.',
        originIds: ['input.decode.outputFormat', 'video.pixelFormat'],
        context: { outputFormat: decode.outputFormat, pixelFormat: config.video.pixelFormat },
      })
    }

    if (hasControlledCpuFilterWithoutDownload) {
      messages.push({
        code: 'error.decode.outputFormat.hardwareFramesCpuFilter',
        severity: 'error',
        category: 'compatibility',
        message: 'Controlled CPU filters cannot consume hardware frames without an explicit download boundary.',
        originIds: ['input.decode.outputFormat', 'frame.filters.processing.mode'],
        context: { outputFormat: decode.outputFormat },
      })
    }
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
  if ((color.filter ?? 'zscale') === 'zscale') {
    const probe = config.input.probe?.inputPath === config.input.path ? config.input.probe : undefined
    const selectedIndexes = config.streams.preserveAllVideoStreams
      ? undefined
      : new Set(config.streams.videoStreams.filter((stream) => stream.codecMode === 'encode').map((stream) => stream.index))
    const selectedStreams = probe?.videoStreams.filter(
      (stream) => selectedIndexes === undefined || selectedIndexes.has(stream.index),
    ) ?? []
    const missingFields = new Set<string>()
    for (const stream of selectedStreams) {
      if (color.space && !stream.colorSpace) missingFields.add('color_space')
      if (color.primaries && !stream.colorPrimaries) missingFields.add('color_primaries')
      if ((color.transfer || (color.toneMap && color.toneMap !== 'none')) && !stream.colorTransfer) missingFields.add('color_transfer')
      if (color.range && !stream.colorRange) missingFields.add('color_range')
    }
    if (probe && selectedStreams.length > 0 && missingFields.size > 0) {
      messages.push({
        code: 'error.color.zscale.sourceMetadata',
        severity: 'error',
        category: 'compatibility',
        message: `zscale color conversion requires source color metadata, but ffprobe did not report: ${[...missingFields].join(', ')}.`,
        originIds: ['input.probe', 'video.color.filter', 'video.color.operation'],
        context: { missingFields: [...missingFields] },
      })
    } else if (!probe && isAbsoluteLocalPath(config.input.path)) {
      messages.push({
        code: 'warn.color.zscale.sourceMetadataUnknown',
        severity: 'warning',
        category: 'configuration',
        message: 'zscale source color metadata has not been probed; untagged input may fail color conversion. Probe the input or use libplacebo.',
        originIds: ['input.path', 'video.color.filter', 'video.color.operation'],
        context: { inputPath: config.input.path },
      })
    }
  }
  return messages
}

function validateSubtitleTracks(config: ProjectConfig): Diagnostic[] {
  const unknownCopyTracks = config.subtitle.tracks.filter(
    (track) => track.codecMode === 'copy' && !track.sourceCodecKnown,
  )
  const messages: Diagnostic[] = []
  if (unknownCopyTracks.length > 0) {
    messages.push({
      code: 'warn.subtitle.copy.unknown.sourcecodec',
      severity: 'warning',
      category: 'compatibility',
      message: 'Subtitle stream copy compatibility cannot be confirmed because the source codec is unknown.',
      originIds: unknownCopyTracks.map((track) => `subtitle.tracks.${track.id}.codecMode`),
      context: {
        trackIds: unknownCopyTracks.map((track) => track.id),
        containerId: config.output.containerId,
      },
    })
  }

  const bitmapCodecs = new Set(['hdmv_pgs_subtitle', 'dvd_subtitle', 'dvb_subtitle', 'xsub'])
  const textCodecs = new Set(['mov_text', 'srt', 'subrip', 'ass', 'ssa', 'webvtt', 'text'])
  const invalidTranscodes = config.subtitle.tracks.filter((track) => (
    track.codecMode === 'transcode'
    && track.sourceCodecKnown
    && bitmapCodecs.has(track.sourceCodec ?? '')
    && textCodecs.has(track.codec ?? '')
  ))
  if (invalidTranscodes.length > 0) {
    messages.push({
      code: 'error.subtitle.transcode.mediaType',
      severity: 'error',
      category: 'compatibility',
      message: 'FFmpeg cannot transcode bitmap subtitles such as PGS into a text subtitle codec.',
      originIds: invalidTranscodes.map((track) => `subtitle.tracks.${track.id}.codec`),
      context: {
        trackIds: invalidTranscodes.map((track) => track.id),
        sourceCodecs: invalidTranscodes.map((track) => track.sourceCodec),
        targetCodecs: invalidTranscodes.map((track) => track.codec),
      },
    })
  }
  const externalWithPreserveAll = config.streams.preserveAllSubtitleStreams
    ? config.subtitle.tracks.filter((track) => track.source === 'external')
    : []
  if (externalWithPreserveAll.length > 0) {
    messages.push({
      code: 'error.subtitle.preserveAll.externalIndex',
      severity: 'error',
      category: 'configuration',
      message: 'External subtitle tracks require explicit subtitle mapping so their output stream indices remain deterministic.',
      originIds: externalWithPreserveAll.map((track) => `subtitle.tracks.${track.id}.source`),
      context: { trackIds: externalWithPreserveAll.map((track) => track.id) },
    })
  }
  return messages
}

function validateMultiVideoTwoPass(config: ProjectConfig, catalog: Catalog): Diagnostic[] {
  if (config.video.mode !== 'encode') return []
  const targetSize = calculateTargetSize(config, catalog)
  const usesTwoPass = config.video.rateControl?.mode === 'twoPass'
    || (targetSize.enabled && targetSize.videoBitrateKbps !== undefined)
  if (!usesTwoPass) return []

  const encodeCount = config.streams.preserveAllVideoStreams
    ? config.input.probe?.inputPath === config.input.path
      ? config.input.probe.videoStreams.length
      : 1
    : config.streams.videoStreams.filter((stream) => stream.codecMode === 'encode').length
  if (encodeCount <= 1) return []
  return [{
    code: 'error.twopass.multipleVideoStreams',
    severity: 'error',
    category: 'configuration',
    message: 'Traditional passlog two-pass encoding currently supports only one encoded video stream per task.',
    originIds: ['video.rateControl.mode', 'streams.videoStreams'],
    context: { encodeCount },
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
