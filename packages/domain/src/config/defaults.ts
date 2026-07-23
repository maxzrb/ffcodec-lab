import type { AdvancedVideoFiltersConfig, ProjectConfig } from './project-config'

/** 为新配置或旧配置迁移创建独立的高级滤镜默认值。 */
export function createDefaultAdvancedVideoFilters(): AdvancedVideoFiltersConfig {
  return {
    crop: { enabled: false, width: 1920, height: 1080, x: 0, y: 0 },
    transform: { rotate: 'none', horizontalFlip: false, verticalFlip: false },
    adjustment: { enabled: false, brightness: 0, contrast: 1, saturation: 1, gamma: 1 },
    deinterlace: { enabled: false, mode: 'send_frame', parity: 'auto' },
    sharpen: { enabled: false, amount: 1 },
    denoise: { enabled: false, values: {} },
    deband: { enabled: false, values: {} },
  }
}

/**
 * Produces the default ProjectConfig used when the app loads fresh.
 * All values must be valid according to the config schema.
 */
export function createDefaultProjectConfig(): ProjectConfig {
  return {
    schemaVersion: 6,
    shell: 'powershell',
    input: {
      path: 'input.mkv',
      additionalInputs: [],
    },
    output: {
      path: 'output.mp4',
      containerId: 'mp4',
      overwrite: false,
      metadata: { globalRaw: '', streamRaw: '' },
    },
    streams: {
      videoStreams: [{ index: 0, codecMode: 'encode' as const }],
      audioStreams: [{ index: 0, codecMode: 'encode' as const }],
      subtitleStreams: [],
      preserveAllVideoStreams: true,
      preserveAllAudioStreams: true,
      preserveAllSubtitleStreams: true,
    },
    video: {
      mode: 'encode',
      encoderId: 'libx264',
      preset: 'medium',
      profile: 'auto',
      tune: 'auto',
      pixelFormat: 'auto',
      color: { operation: 'metadata-only', filter: 'zscale', toneMap: 'none' },
      rateControl: {
        mode: 'crf',
        qualityValue: 23,
        additionalValues: {},
      },
      specialParameters: {},
    },
    frame: {
      resolution: { mode: 'source' },
      frameRate: { mode: 'source' },
      filters: createDefaultAdvancedVideoFilters(),
    },
    audio: {
      mode: 'encode',
      encoderId: 'aac',
      bitrate: '192k',
      channelLayout: 'stereo',
      sampleRate: 48000,
      qualityValues: {},
      loudnessNormalization: {
        integratedLoudnessEnabled: false,
        integratedLoudness: -24,
        loudnessRangeEnabled: false,
        loudnessRange: 7,
        truePeakEnabled: false,
        truePeak: -2,
        dualMono: false,
      },
    },
    subtitle: {
      tracks: [],
      burn: {
        enabled: false,
        source: 'external',
        filterKind: 'subtitles',
        style: {},
      },
    },
    tools: {
      targetSize: {
        enabled: false,
        targetMiB: 700,
        durationMinutes: 90,
        overheadPercent: 3,
      },
    },
    customArgs: {
      globalArgs: [],
      preInputArgs: [],
      videoArgs: [],
      audioArgs: [],
      preOutputArgs: [],
      tailArgs: [],
    },
  }
}
