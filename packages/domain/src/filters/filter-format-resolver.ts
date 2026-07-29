import type { ProjectConfig, VideoFilterProcessingConfig } from '../config/project-config'
import type { VideoFilterSpec } from './video-filter-builder'

export interface FilterPrecisionIssue {
  filter: string
  reason: string
  alternatives: string[]
}

export interface FilterFormatPlan {
  chain: VideoFilterSpec[]
  workingFormats: string[]
  issues: FilterPrecisionIssue[]
  usesHardwareDownload: boolean
  finalPixelFormat?: string
}

export interface FilterFormatCapability {
  integerDepths: readonly number[]
  float32: boolean
  preservesColorFamily: boolean
  note?: string
}

/** 以 PATH FFmpeg 8.1.2 为首要基线、项目随附构建为交叉验证的受控滤镜能力快照。 */
export const FILTER_FORMAT_CAPABILITIES: Readonly<Record<string, FilterFormatCapability>> = {
  yadif: { integerDepths: [8, 10, 12, 16], float32: false, preservesColorFamily: false },
  crop: { integerDepths: [8, 10, 12, 16], float32: true, preservesColorFamily: true },
  scale: { integerDepths: [8, 10, 12, 16], float32: true, preservesColorFamily: true },
  transpose: { integerDepths: [8, 10, 12, 16], float32: true, preservesColorFamily: false },
  hflip: { integerDepths: [8, 10, 12, 16], float32: true, preservesColorFamily: true },
  vflip: { integerDepths: [8, 10, 12, 16], float32: true, preservesColorFamily: true },
  hqdn3d: { integerDepths: [8, 10, 12, 16], float32: false, preservesColorFamily: false },
  nlmeans: { integerDepths: [8], float32: false, preservesColorFamily: false, note: '仅协商到 8-bit。' },
  atadenoise: { integerDepths: [8, 10, 12, 16], float32: false, preservesColorFamily: false },
  bm3d: { integerDepths: [8, 10, 12, 16], float32: false, preservesColorFamily: false },
  deband: { integerDepths: [8, 10, 12, 16], float32: false, preservesColorFamily: false },
  gradfun: { integerDepths: [8], float32: false, preservesColorFamily: false, note: '仅协商到 8-bit。' },
  eq: { integerDepths: [8], float32: false, preservesColorFamily: false, note: '高精度模式改用 lutyuv。' },
  'lutyuv-adjustment': { integerDepths: [8, 10, 12, 16], float32: false, preservesColorFamily: false },
  unsharp: { integerDepths: [8, 10, 12, 16], float32: false, preservesColorFamily: false },
  fps: { integerDepths: [8, 10, 12, 16], float32: true, preservesColorFamily: true },
  subtitles: { integerDepths: [8, 10, 12, 16], float32: false, preservesColorFamily: false },
  ass: { integerDepths: [8, 10, 12, 16], float32: false, preservesColorFamily: false },
  color: { integerDepths: [8, 10, 12, 16], float32: true, preservesColorFamily: false },
}

const FORMAT_FAMILIES = {
  '8': {
    yuv: ['yuv420p', 'yuv422p', 'yuv444p', 'yuva420p', 'yuva422p', 'yuva444p', 'gray'],
    rgb: ['gbrp', 'gbrap'],
  },
  '10': {
    yuv: ['yuv420p10le', 'yuv422p10le', 'yuv444p10le', 'yuva420p10le', 'yuva422p10le', 'yuva444p10le', 'gray10le'],
    rgb: ['gbrp10le', 'gbrap10le'],
  },
  '12': {
    yuv: ['yuv420p12le', 'yuv422p12le', 'yuv444p12le', 'yuva422p12le', 'yuva444p12le', 'gray12le'],
    rgb: ['gbrp12le', 'gbrap12le'],
  },
  '16': {
    yuv: ['yuv420p16le', 'yuv422p16le', 'yuv444p16le', 'yuva420p16le', 'yuva422p16le', 'yuva444p16le', 'gray16le'],
    rgb: ['gbrp16le', 'gbrap16le'],
  },
  float: {
    yuv: [],
    rgb: ['gbrpf32le', 'gbrapf32le'],
  },
} as const

const INCOMPATIBLE_FILTERS: Record<string, Omit<FilterPrecisionIssue, 'filter'>> = {
  nlmeans: {
    reason: '当前 FFmpeg 8.1.2 的 CPU nlmeans 只协商到 8-bit 软件格式。',
    alternatives: ['bm3d', 'hqdn3d', 'atadenoise'],
  },
  gradfun: {
    reason: '当前 FFmpeg 8.1.2 的 gradfun 会把高位深输入降到 8-bit。',
    alternatives: ['deband'],
  },
}

/** 返回已知会破坏高精度链的受控滤镜；自定义字幕表达式按未知能力处理。 */
export function inspectFilterPrecisionIssues(
  config: ProjectConfig,
  chain: readonly VideoFilterSpec[],
): FilterPrecisionIssue[] {
  const processing = config.frame.filters?.processing
  if (!processing || processing.mode === 'compatible') return []
  const issues: FilterPrecisionIssue[] = []
  for (const spec of chain) {
    const name = getSpecFilterName(spec)
    const known = name ? INCOMPATIBLE_FILTERS[name] : undefined
    if (known && !issues.some((issue) => issue.filter === name)) {
      issues.push({ filter: name!, ...known })
    }
    if (
      (spec.type === 'subtitles' || spec.type === 'ass')
      && Boolean(config.subtitle.burn.customFilter)
    ) {
      issues.push({
        filter: 'custom-subtitle-filter',
        reason: '完全自定义字幕滤镜的像素格式能力无法静态证明。',
        alternatives: ['关闭完全自定义表达式', '将不兼容策略改为警告并用短样片验证'],
      })
    }
  }
  if (
    processing.mode === 'custom'
    && processing.bitDepth === 'float'
    && chain.some((spec) => !supportsFloat(spec))
  ) {
    const incompatible = chain
      .filter((spec) => !supportsFloat(spec))
      .map((spec) => getSpecFilterName(spec) ?? spec.type)
    issues.push({
      filter: 'float32-pipeline',
      reason: `以下滤镜不能保持 32-bit 浮点工作格式：${[...new Set(incompatible)].join(', ')}。`,
      alternatives: ['改用 16-bit 整数工作位深', '关闭或更换不支持浮点的滤镜', '改用支持相应操作的 libplacebo GPU 路径'],
    })
  }
  const preFormat = config.video.color?.preFormat
  const preFormatDepth = preFormat ? pixelFormatDepth(preFormat) : undefined
  const requestedDepth = processing.mode === 'high-precision'
    ? 10
    : processing.bitDepth === 'float'
      ? 32
      : processing.bitDepth === 'preserve'
        ? undefined
        : Number(processing.bitDepth)
  if (
    preFormat
    && preFormatDepth !== undefined
    && requestedDepth !== undefined
    && preFormatDepth < requestedDepth
  ) {
    issues.push({
      filter: 'color-pre-format',
      reason: `色彩转换前像素格式 ${preFormat} 只有 ${preFormatDepth}-bit，低于滤镜工作位深 ${requestedDepth}-bit。`,
      alternatives: ['清空转换前像素格式并让高精度解析器协商', `改用至少 ${requestedDepth}-bit 的同采样格式`],
    })
  }
  return issues
}

/** 把用户策略解析为确定的格式节点；旧兼容模式完全不改变滤镜链。 */
export function resolveFilterFormatPlan(
  config: ProjectConfig,
  sourceChain: readonly VideoFilterSpec[],
): FilterFormatPlan {
  const processing = config.frame.filters?.processing
  if (!processing || processing.mode === 'compatible' || sourceChain.length === 0) {
    return {
      chain: [...sourceChain],
      workingFormats: [],
      issues: [],
      usesHardwareDownload: false,
    }
  }

  const workingFormats = buildWorkingFormats(
    processing,
    sourceChain.every((spec) => supportsFloat(spec)),
    getSelectedProbePixelFormats(config),
  )
  const issues = inspectFilterPrecisionIssues(config, sourceChain)
  const chain: VideoFilterSpec[] = []
  const usesHardwareDownload = config.input.decode.outputFormat === 'd3d11'

  if (usesHardwareDownload) chain.push({ type: 'hwdownload' })
  if (workingFormats.length > 0) chain.push({ type: 'format', pixelFormats: workingFormats })

  for (const spec of sourceChain) {
    if (spec.type === 'eq') {
      chain.push({
        type: 'lutyuv-adjustment',
        brightness: spec.brightness,
        contrast: spec.contrast,
        saturation: spec.saturation,
        gamma: spec.gamma,
      })
    } else {
      chain.push(spec)
    }
    const name = getSpecFilterName(spec)
    if (name && INCOMPATIBLE_FILTERS[name] && processing.incompatiblePolicy === 'warn') {
      chain.push({ type: 'format', pixelFormats: workingFormats })
    }
  }

  const outputFormat = config.video.pixelFormat
  const toneMapOwnsOutputFormat = config.video.color?.toneMap
    && config.video.color.toneMap !== 'none'
    && (config.video.color.operation ?? 'metadata-only') !== 'metadata-only'
    && (config.video.color.filter ?? 'zscale') === 'zscale'
  if (outputFormat && outputFormat !== 'auto' && !toneMapOwnsOutputFormat) {
    if (shouldDither(processing, outputFormat)) {
      const algorithm = processing.dither === 'auto'
        ? 'error_diffusion'
        : processing.dither as 'ordered' | 'random' | 'error_diffusion'
      chain.push({
        type: 'zscale-dither',
        algorithm,
      })
    }
    chain.push({ type: 'format', pixelFormats: [outputFormat] })
  }

  return {
    chain,
    workingFormats,
    issues,
    usesHardwareDownload,
    finalPixelFormat: outputFormat && outputFormat !== 'auto' ? outputFormat : undefined,
  }
}

export function buildWorkingFormats(
  processing: VideoFilterProcessingConfig,
  allowFloat = true,
  sourcePixelFormats: readonly string[] = [],
): string[] {
  const probedFormats = sourcePixelFormats
    .map((format) => resolveProbedWorkingFormat(format, processing, allowFloat))
    .filter((format): format is string => Boolean(format))
  if (probedFormats.length > 0) return [...new Set(probedFormats)]

  const depths = processing.mode === 'high-precision'
    ? allowFloat ? ['10', '12', '16', 'float'] : ['10', '12', '16']
    : processing.bitDepth === 'preserve'
      ? ['8', '10', '12', '16']
      : [processing.bitDepth]
  const families = processing.colorFamily === 'preserve'
    ? ['yuv', 'rgb'] as const
    : [processing.colorFamily] as const

  const formats: string[] = []
  for (const depth of depths) {
    const group = FORMAT_FAMILIES[depth as keyof typeof FORMAT_FAMILIES]
    for (const family of families) {
      for (const format of group[family]) {
        if (!processing.preserveAlpha && hasAlpha(format)) continue
        if (family === 'yuv' && processing.chroma !== 'preserve' && !matchesChroma(format, processing.chroma)) continue
        formats.push(format)
      }
    }
  }
  return formats
}

/** 仅采用与当前输入路径匹配、且会参与编码的视频流探测结果。 */
export function getSelectedProbePixelFormats(config: ProjectConfig): string[] {
  const probe = config.input.probe
  if (!probe || probe.inputPath !== config.input.path) return []
  const selectedIndexes = config.streams.preserveAllVideoStreams
    ? undefined
    : new Set(
      config.streams.videoStreams
        .filter((stream) => stream.codecMode === 'encode')
        .map((stream) => stream.index),
    )
  return probe.videoStreams
    .filter((stream) => selectedIndexes === undefined || selectedIndexes.has(stream.index))
    .map((stream) => stream.pixFmt)
    .filter((format): format is string => Boolean(format))
}

function resolveProbedWorkingFormat(
  sourceFormat: string,
  processing: VideoFilterProcessingConfig,
  allowFloat: boolean,
): string | undefined {
  const sourceDepth = pixelFormatDepth(sourceFormat)
  if (sourceDepth === undefined) return undefined
  const targetDepth = processing.mode === 'high-precision'
    ? Math.max(10, allowFloat ? sourceDepth : Math.min(sourceDepth, 16))
    : processing.bitDepth === 'preserve'
      ? sourceDepth
      : processing.bitDepth === 'float'
        ? 32
        : Number(processing.bitDepth)
  if (targetDepth === 32 && !allowFloat) return undefined

  const sourceAlpha = hasAlpha(sourceFormat)
  const keepAlpha = processing.preserveAlpha && sourceAlpha
  const sourceFamily = /^(?:gbr|rgb|bgr)/.test(sourceFormat) ? 'rgb' : 'yuv'
  const family = processing.colorFamily === 'preserve' ? sourceFamily : processing.colorFamily
  if (family === 'rgb') {
    if (targetDepth === 32) return keepAlpha ? 'gbrapf32le' : 'gbrpf32le'
    if (![8, 10, 12, 16].includes(targetDepth)) return undefined
    if (targetDepth === 8) return keepAlpha ? 'gbrap' : 'gbrp'
    return `${keepAlpha ? 'gbrap' : 'gbrp'}${targetDepth}le`
  }

  if (targetDepth === 32) return undefined
  if (/^gray/.test(sourceFormat)) {
    return targetDepth === 8 ? 'gray' : `gray${targetDepth}le`
  }
  const sourceChroma = sourceFormat.match(/(?:yuvj?|yuva)(420|422|444)/)?.[1]
    ?? (/^(?:nv12|p010)/.test(sourceFormat) ? '420' : undefined)
  const chroma = processing.chroma === 'preserve' ? sourceChroma : processing.chroma
  if (!chroma) return undefined
  const prefix = keepAlpha ? 'yuva' : 'yuv'
  const availableChroma = keepAlpha && targetDepth === 12 && chroma === '420' ? '422' : chroma
  return targetDepth === 8 ? `${prefix}${availableChroma}p` : `${prefix}${availableChroma}p${targetDepth}le`
}

function supportsFloat(spec: VideoFilterSpec): boolean {
  if (spec.type === 'denoise' || spec.type === 'deband') {
    const name = getSpecFilterName(spec)
    return name ? FILTER_FORMAT_CAPABILITIES[name]?.float32 === true : false
  }
  if (spec.type === 'format' || spec.type === 'hwdownload' || spec.type === 'zscale-dither') return true
  return FILTER_FORMAT_CAPABILITIES[spec.type]?.float32 === true
}

function getSpecFilterName(spec: VideoFilterSpec): string | undefined {
  if (spec.type === 'denoise' || spec.type === 'deband') {
    return spec.filterString.match(/^\s*([A-Za-z0-9_]+)/)?.[1]
  }
  return spec.type
}

function hasAlpha(format: string): boolean {
  return format.startsWith('yuva') || format.startsWith('gbra')
}

function matchesChroma(format: string, chroma: '420' | '422' | '444'): boolean {
  if (format.startsWith('gray')) return true
  return format.includes(chroma)
}

function shouldDither(processing: VideoFilterProcessingConfig, outputFormat: string): boolean {
  if (processing.dither === 'none') return false
  const outputDepth = pixelFormatDepth(outputFormat)
  const workingDepth = processing.mode === 'high-precision'
    ? 32
    : processing.bitDepth === 'float'
      ? 32
      : processing.bitDepth === 'preserve'
        ? undefined
        : Number(processing.bitDepth)
  if (outputDepth === undefined) return false
  if (workingDepth === undefined) return true
  return outputDepth < workingDepth
}

export function pixelFormatDepth(format: string): number | undefined {
  if (format.includes('f32')) return 32
  const match = format.match(/(?:p|gray|rgb|bgr|gbrp)(10|12|14|16)(?:le|be)?/)
  if (match) return Number(match[1])
  if (/^(?:yuv|yuva|nv12|rgb|bgr|gbrp|gbrap|gray)/.test(format)) return 8
  if (/^p010/.test(format)) return 10
  return undefined
}
