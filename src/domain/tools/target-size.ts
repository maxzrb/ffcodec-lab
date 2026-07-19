import type { Catalog } from '../catalog/catalog-types'
import type { ProjectConfig } from '../config/project-config'
import type { Diagnostic } from '../rules/rule-types'

const BYTES_PER_MIB = 1024 * 1024
const BITS_PER_BYTE = 8
const SECONDS_PER_MINUTE = 60
const BITS_PER_KILOBIT = 1000

export interface TargetSizeCalculation {
  enabled: boolean
  videoBitrateKbps?: number
  audioBitrateKbps?: number
  audioStreamCount?: number
  diagnostics: Diagnostic[]
}

/**
 * 根据目标 MiB、完整时长和音频预算推导双遍视频平均码率。
 * 该函数不修改配置；目标大小是输入约束，码率只是派生结果。
 */
export function calculateTargetSize(
  config: ProjectConfig,
  catalog: Catalog,
): TargetSizeCalculation {
  const tool = config.tools?.targetSize
  if (!tool?.enabled) return { enabled: false, diagnostics: [] }

  const diagnostics: Diagnostic[] = []
  const origins = ['tools.targetSize.enabled', 'tools.targetSize.targetMiB']

  if (config.video.mode !== 'encode') {
    diagnostics.push(makeError(
      'error.targetSize.video.requiresEncode',
      'Target-size encoding requires video re-encoding.',
      ['tools.targetSize.enabled', 'video.mode'],
      { videoMode: config.video.mode },
    ))
  }

  const videoEncoder = config.video.encoderId
    ? catalog.encoders.video[config.video.encoderId]
    : undefined
  if (!videoEncoder?.capabilities.supportsTwoPass) {
    diagnostics.push(makeError(
      'error.targetSize.encoder.requiresTwoPass',
      'The selected video encoder does not support the verified two-pass workflow required by target-size encoding.',
      ['tools.targetSize.enabled', 'video.encoderId'],
      { encoderId: config.video.encoderId ?? null },
    ))
  }

  const videoStreamCount = getExplicitStreamCount(
    config.streams.videoStreamIndexes,
    config.streams.videoStreamIndex,
  )
  if (config.streams.preserveOtherVideoStreams || videoStreamCount !== 1) {
    diagnostics.push(makeError(
      'error.targetSize.video.singleStream',
      'Target-size encoding requires exactly one explicitly selected video stream.',
      ['tools.targetSize.enabled', 'streams.videoStreamIndexes', 'streams.preserveOtherVideoStreams'],
      { preserveAll: config.streams.preserveOtherVideoStreams, videoStreamCount },
    ))
  }

  if (!Number.isFinite(tool.targetMiB) || tool.targetMiB <= 0) {
    diagnostics.push(makeError(
      'error.targetSize.target.invalid',
      'Target file size must be greater than zero.',
      ['tools.targetSize.targetMiB'],
      { targetMiB: tool.targetMiB },
    ))
  }
  if (!Number.isFinite(tool.durationMinutes) || tool.durationMinutes <= 0) {
    diagnostics.push(makeError(
      'error.targetSize.duration.invalid',
      'Media duration must be greater than zero.',
      ['tools.targetSize.durationMinutes'],
      { durationMinutes: tool.durationMinutes },
    ))
  }
  if (!Number.isFinite(tool.overheadPercent) || tool.overheadPercent < 0 || tool.overheadPercent > 20) {
    diagnostics.push(makeError(
      'error.targetSize.overhead.invalid',
      'Container overhead reserve must be between 0% and 20%.',
      ['tools.targetSize.overheadPercent'],
      { overheadPercent: tool.overheadPercent },
    ))
  }

  const audioBudget = resolveAudioBudget(config, catalog)
  if (audioBudget.error) diagnostics.push(audioBudget.error)

  const customConflictOrigins = findCustomConflicts(config)
  if (customConflictOrigins.length > 0) {
    diagnostics.push(makeError(
      'error.targetSize.custom.conflict',
      'Custom codec, mapping, bitrate, or pass arguments conflict with target-size calculation.',
      ['tools.targetSize.enabled', ...customConflictOrigins],
      { conflictingGroups: customConflictOrigins },
    ))
  }

  if (diagnostics.some((diagnostic) => diagnostic.severity === 'error')) {
    return {
      enabled: true,
      audioBitrateKbps: audioBudget.totalKbps,
      audioStreamCount: audioBudget.streamCount,
      diagnostics,
    }
  }

  const durationSeconds = tool.durationMinutes * SECONDS_PER_MINUTE
  const payloadBits = tool.targetMiB
    * BYTES_PER_MIB
    * BITS_PER_BYTE
    * (1 - tool.overheadPercent / 100)
  const totalBudgetKbps = payloadBits / durationSeconds / BITS_PER_KILOBIT
  const videoBitrateKbps = Math.floor(totalBudgetKbps - (audioBudget.totalKbps ?? 0))

  if (!Number.isFinite(videoBitrateKbps) || videoBitrateKbps < 1) {
    diagnostics.push(makeError(
      'error.targetSize.budget.exhausted',
      'The target size is too small for the selected duration, overhead reserve, and audio budget.',
      [...origins, 'tools.targetSize.durationMinutes', 'tools.targetSize.manualAudioBitrateKbps'],
      {
        targetMiB: tool.targetMiB,
        durationMinutes: tool.durationMinutes,
        audioBitrateKbps: audioBudget.totalKbps ?? 0,
      },
    ))
    return {
      enabled: true,
      audioBitrateKbps: audioBudget.totalKbps,
      audioStreamCount: audioBudget.streamCount,
      diagnostics,
    }
  }

  if (videoBitrateKbps < 100) {
    diagnostics.push({
      code: 'warn.targetSize.videoBitrate.low',
      severity: 'warning',
      category: 'configuration',
      message: 'The calculated video bitrate is very low and may produce unusable quality.',
      originIds: ['tools.targetSize.targetMiB', 'tools.targetSize.durationMinutes'],
      context: { videoBitrateKbps },
    })
  }

  return {
    enabled: true,
    videoBitrateKbps,
    audioBitrateKbps: audioBudget.totalKbps,
    audioStreamCount: audioBudget.streamCount,
    diagnostics,
  }
}

interface AudioBudget {
  totalKbps?: number
  streamCount?: number
  error?: Diagnostic
}

function resolveAudioBudget(config: ProjectConfig, catalog: Catalog): AudioBudget {
  if (config.audio.mode === 'disabled') return { totalKbps: 0, streamCount: 0 }

  const manual = config.tools.targetSize.manualAudioBitrateKbps
  if (manual !== undefined && Number.isFinite(manual) && manual > 0) {
    return { totalKbps: manual }
  }

  if (config.audio.mode === 'copy') {
    return {
      error: makeError(
        'error.targetSize.audio.copyUnknown',
        'Audio stream copy has an unknown bitrate. Enter the total audio bitrate manually.',
        ['tools.targetSize.manualAudioBitrateKbps', 'audio.mode'],
        { audioMode: config.audio.mode },
      ),
    }
  }

  const audioEncoder = config.audio.encoderId
    ? catalog.encoders.audio[config.audio.encoderId]
    : undefined
  const bitrateKbps = parseBitrateKbps(config.audio.bitrate)
  if (!audioEncoder || audioEncoder.qualityModes.length === 0 || bitrateKbps === undefined) {
    return {
      error: makeError(
        'error.targetSize.audio.bitrateUnknown',
        'The selected audio encoder has no predictable bitrate. Enter the total audio bitrate manually.',
        ['tools.targetSize.manualAudioBitrateKbps', 'audio.encoderId', 'audio.bitrate'],
        { encoderId: config.audio.encoderId ?? null, bitrate: config.audio.bitrate ?? null },
      ),
    }
  }

  if (config.streams.preserveOtherAudioStreams) {
    return {
      error: makeError(
        'error.targetSize.audio.streamCountUnknown',
        'Keeping all audio streams leaves the audio stream count unknown. Select streams explicitly or enter the total audio bitrate manually.',
        ['tools.targetSize.manualAudioBitrateKbps', 'streams.preserveOtherAudioStreams'],
        { preserveAll: true },
      ),
    }
  }

  const streamCount = getExplicitStreamCount(
    config.streams.audioStreamIndexes,
    config.streams.audioStreamIndex,
  )
  return { totalKbps: bitrateKbps * streamCount, streamCount }
}

function getExplicitStreamCount(indexes: number[], legacyIndex?: number): number {
  const values = indexes.length > 0 ? indexes : [legacyIndex ?? 0]
  return new Set(values).size
}

/** 解析 FFmpeg 常用 bps/k/M 码率写法并统一为十进制 kbps。 */
export function parseBitrateKbps(value: string | undefined): number | undefined {
  const match = String(value ?? '').trim().match(/^(\d+(?:\.\d+)?)\s*([kKmM]?)$/)
  if (!match) return undefined
  const amount = Number(match[1])
  if (!Number.isFinite(amount) || amount <= 0) return undefined
  const unit = match[2].toLowerCase()
  if (unit === 'm') return amount * 1000
  if (unit === 'k') return amount
  return amount / 1000
}

function findCustomConflicts(config: ProjectConfig): string[] {
  const groups: Array<[string, string[]]> = [
    ['customArgs.globalArgs', config.customArgs.globalArgs],
    ['customArgs.videoArgs', config.customArgs.videoArgs],
    ['customArgs.audioArgs', config.customArgs.audioArgs],
    ['customArgs.preOutputArgs', config.customArgs.preOutputArgs],
    ['customArgs.tailArgs', config.customArgs.tailArgs],
  ]
  const conflict = /(^|\s)-(?:map|an|vn|sn|c:[va]|b(?::[va])?|crf|qp|pass|passlogfile)(?::\d+)?(?:\s|$|=)/i
  return groups
    .filter(([, tokens]) => tokens.some((token) => conflict.test(token)))
    .map(([originId]) => originId)
}

function makeError(
  code: string,
  message: string,
  originIds: string[],
  context: Record<string, unknown>,
): Diagnostic {
  return { code, severity: 'error', category: 'configuration', message, originIds, context }
}
