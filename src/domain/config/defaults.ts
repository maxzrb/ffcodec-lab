import type { ProjectConfig } from './project-config'

/**
 * Produces the default ProjectConfig used when the app loads fresh.
 * All values must be valid according to the config schema.
 */
export function createDefaultProjectConfig(): ProjectConfig {
  return {
    schemaVersion: 1,
    shell: 'bash',
    input: {
      path: 'input.mkv',
      additionalInputs: [],
    },
    output: {
      path: 'output.mp4',
      containerId: 'mp4',
      overwrite: false,
    },
    streams: {
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
      mux: {
        enabled: false,
        source: 'internal',
        codecMode: 'auto',
        preserveOtherStreams: true,
      },
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
