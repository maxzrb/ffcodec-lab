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
    schemaVersion: 5,
    shell: 'powershell',
    input: {
      path: 'input.mkv',
      additionalInputs: [],
    },
    output: {
      path: 'output.mp4',
      containerId: 'mp4',
      overwrite: false,
      metadata: { globalLines: [], streamLines: [] },
    },
    streams: {
      videoStreamIndexes: [0],
      audioStreamIndexes: [0],
      subtitleStreamIndexes: [0],
      preserveOtherVideoStreams: false,
      preserveOtherAudioStreams: false,
      preserveOtherSubtitleStreams: true,
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
