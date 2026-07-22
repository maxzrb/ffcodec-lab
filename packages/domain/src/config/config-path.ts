// ============================================================
// ConfigPath — controlled path type for safe config access.
// Rejects __proto__, prototype, constructor, and non-identifier
// segments. All ConfigBinding and ConfigPatchOperation paths
// must go through configPath().
// ============================================================

const SEGMENT_RE = /^[a-zA-Z_][a-zA-Z0-9_-]*$/
const FORBIDDEN = new Set(['__proto__', 'prototype', 'constructor'])

declare const __brand: unique symbol

/** A validated dot-path into ProjectConfig. Construct only via configPath(). */
export type ConfigPath = string & { readonly [__brand]: 'ConfigPath' }

/**
 * Create a validated ConfigPath from segments.
 * Throws on illegal segments (__proto__, prototype, constructor, non-identifier chars).
 */
export function configPath(segments: string[]): ConfigPath {
  for (const s of segments) {
    if (FORBIDDEN.has(s)) {
      throw new Error(`Forbidden config path segment: ${s}`)
    }
    if (!SEGMENT_RE.test(s)) {
      throw new Error(`Illegal config path segment: "${s}"`)
    }
  }
  return segments.join('.') as ConfigPath
}

/**
 * Check whether a string looks like a valid ConfigPath without throwing.
 */
export function isValidConfigPath(path: string): boolean {
  const segments = path.split('.')
  return segments.every((s) => !FORBIDDEN.has(s) && SEGMENT_RE.test(s))
}

/** 为视频特殊参数创建 video.specialParameters.<key> 配置路径。 */
export function videoSpecialParamPath(key: string): ConfigPath {
  return configPath(['video', 'specialParameters', key])
}

/** 为音频特殊参数创建 audio.qualityValues.<key> 配置路径。 */
export function audioQualityValuePath(key: string): ConfigPath {
  return configPath(['audio', 'qualityValues', key])
}

/** 提取配置路径的最后一段，例如 spatialAq。 */
export function extractConfigKey(path: ConfigPath): string {
  const segments = path.split('.')
  return segments[segments.length - 1]
}

// ============================================================
// Pre-defined path constants — use these instead of raw strings
// ============================================================

export const CONFIG_PATHS = {
  schemaVersion: configPath(['schemaVersion']),
  shell: configPath(['shell']),

  input: {
    path: configPath(['input', 'path']),
    additionalInputs: configPath(['input', 'additionalInputs']),
  },

  output: {
    path: configPath(['output', 'path']),
    containerId: configPath(['output', 'containerId']),
    overwrite: configPath(['output', 'overwrite']),
    metadata: configPath(['output', 'metadata']),
    metadataGlobalRaw: configPath(['output', 'metadata', 'globalRaw']),
    metadataStreamRaw: configPath(['output', 'metadata', 'streamRaw']),
  },

  streams: {
    videoStreamIndexes: configPath(['streams', 'videoStreamIndexes']),
    audioStreamIndexes: configPath(['streams', 'audioStreamIndexes']),
    videoStreamIndex: configPath(['streams', 'videoStreamIndex']),
    audioStreamIndex: configPath(['streams', 'audioStreamIndex']),
    subtitleStreamIndexes: configPath(['streams', 'subtitleStreamIndexes']),
    subtitleStreamIndex: configPath(['streams', 'subtitleStreamIndex']),
    preserveOtherVideoStreams: configPath(['streams', 'preserveOtherVideoStreams']),
    preserveOtherAudioStreams: configPath(['streams', 'preserveOtherAudioStreams']),
    preserveOtherSubtitleStreams: configPath(['streams', 'preserveOtherSubtitleStreams']),
  },

  video: {
    mode: configPath(['video', 'mode']),
    codecCategory: configPath(['video', 'codecCategory']),
    encoderId: configPath(['video', 'encoderId']),
    preset: configPath(['video', 'preset']),
    profile: configPath(['video', 'profile']),
    tune: configPath(['video', 'tune']),
    pixelFormat: configPath(['video', 'pixelFormat']),
    gpuIndex: configPath(['video', 'gpuIndex']),
    threads: configPath(['video', 'threads']),
    color: {
      range: configPath(['video', 'color', 'range']),
      space: configPath(['video', 'color', 'space']),
      primaries: configPath(['video', 'color', 'primaries']),
      transfer: configPath(['video', 'color', 'transfer']),
      operation: configPath(['video', 'color', 'operation']),
      filter: configPath(['video', 'color', 'filter']),
      preFormat: configPath(['video', 'color', 'preFormat']),
      toneMap: configPath(['video', 'color', 'toneMap']),
      desaturation: configPath(['video', 'color', 'desaturation']),
      nominalPeak: configPath(['video', 'color', 'nominalPeak']),
    },
    specialParameters: configPath(['video', 'specialParameters']),
    rateControl: {
      mode: configPath(['video', 'rateControl', 'mode']),
      qualityValue: configPath(['video', 'rateControl', 'qualityValue']),
      bitrate: configPath(['video', 'rateControl', 'bitrate']),
      minRate: configPath(['video', 'rateControl', 'minRate']),
      maxRate: configPath(['video', 'rateControl', 'maxRate']),
      bufferSize: configPath(['video', 'rateControl', 'bufferSize']),
      additionalValues: configPath(['video', 'rateControl', 'additionalValues']),
    },
  },

  frame: {
    resolution: configPath(['frame', 'resolution']),
    frameRate: configPath(['frame', 'frameRate']),
    filters: configPath(['frame', 'filters']),
  },

  audio: {
    mode: configPath(['audio', 'mode']),
    encoderId: configPath(['audio', 'encoderId']),
    bitrate: configPath(['audio', 'bitrate']),
    channelLayout: configPath(['audio', 'channelLayout']),
    sampleRate: configPath(['audio', 'sampleRate']),
    sampleFormat: configPath(['audio', 'sampleFormat']),
    qualityValues: configPath(['audio', 'qualityValues']),
    loudnessNormalization: {
      integratedLoudnessEnabled: configPath(['audio', 'loudnessNormalization', 'integratedLoudnessEnabled']),
      integratedLoudness: configPath(['audio', 'loudnessNormalization', 'integratedLoudness']),
      loudnessRangeEnabled: configPath(['audio', 'loudnessNormalization', 'loudnessRangeEnabled']),
      loudnessRange: configPath(['audio', 'loudnessNormalization', 'loudnessRange']),
      truePeakEnabled: configPath(['audio', 'loudnessNormalization', 'truePeakEnabled']),
      truePeak: configPath(['audio', 'loudnessNormalization', 'truePeak']),
      dualMono: configPath(['audio', 'loudnessNormalization', 'dualMono']),
    },
  },

  subtitle: {
    tracks: configPath(['subtitle', 'tracks']),
    burn: configPath(['subtitle', 'burn']),
  },

  tools: {
    targetSize: {
      enabled: configPath(['tools', 'targetSize', 'enabled']),
      targetMiB: configPath(['tools', 'targetSize', 'targetMiB']),
      durationMinutes: configPath(['tools', 'targetSize', 'durationMinutes']),
      overheadPercent: configPath(['tools', 'targetSize', 'overheadPercent']),
      manualAudioBitrateKbps: configPath(['tools', 'targetSize', 'manualAudioBitrateKbps']),
    },
  },

  customArgs: {
    globalArgs: configPath(['customArgs', 'globalArgs']),
    preInputArgs: configPath(['customArgs', 'preInputArgs']),
    videoArgs: configPath(['customArgs', 'videoArgs']),
    audioArgs: configPath(['customArgs', 'audioArgs']),
    preOutputArgs: configPath(['customArgs', 'preOutputArgs']),
    tailArgs: configPath(['customArgs', 'tailArgs']),
  },
} as const
