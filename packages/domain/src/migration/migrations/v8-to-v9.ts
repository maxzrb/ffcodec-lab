import type { MigrationStep } from '../migrate-config'

/** v8 → v9：把逐流稀疏覆写与当时全局模板合并为冻结媒体快照。 */
export const v8ToV9: MigrationStep = {
  fromVersion: 8,
  toVersion: 9,
  migrate(config) {
    const video = asRecord(config.video)
    const audio = asRecord(config.audio)
    const frame = asRecord(config.frame)
    const customArgs = asRecord(config.customArgs)
    const streams = asRecord(config.streams)
    let migratedVideo = 0
    let migratedAudio = 0

    const videoStreams = asArray(streams.videoStreams).map((raw) => {
      const entry = asRecord(raw)
      const override = asRecordOrUndefined(entry.video)
      if (!override || entry.videoSnapshot) return entry
      migratedVideo += 1
      const rateControl = {
        ...asRecord(video.rateControl),
        ...(override.crf !== undefined ? { qualityValue: override.crf } : {}),
        ...(override.bitrate !== undefined ? { bitrate: override.bitrate } : {}),
      }
      const { mode: _mode, ...videoSettings } = video
      return {
        ...entry,
        videoSnapshot: {
          snapshotVersion: 1,
          video: {
            ...videoSettings,
            ...pickDefined(override, ['encoderId', 'preset', 'profile', 'tune', 'pixelFormat']),
            rateControl,
          },
          frame: structuredClone(frame),
          customVideoFilters: structuredClone(asArray(customArgs.videoFilters)),
        },
      }
    })

    const audioStreams = asArray(streams.audioStreams).map((raw) => {
      const entry = asRecord(raw)
      const override = asRecordOrUndefined(entry.audio)
      if (!override || entry.audioSnapshot) return entry
      migratedAudio += 1
      const { mode: _mode, ...audioSettings } = audio
      return {
        ...entry,
        audioSnapshot: {
          snapshotVersion: 1,
          audio: {
            ...audioSettings,
            ...pickDefined(override, ['encoderId', 'bitrate', 'channelLayout', 'sampleRate']),
          },
          customAudioFilters: structuredClone(asArray(customArgs.audioFilters)),
        },
      }
    })

    const warnings: string[] = []
    if (migratedVideo > 0) warnings.push(`已将 ${migratedVideo} 个视频流覆写迁移为冻结参数快照`)
    if (migratedAudio > 0) warnings.push(`已将 ${migratedAudio} 个音频流覆写迁移为冻结参数快照`)
    return {
      config: {
        ...config,
        schemaVersion: 9,
        streams: { ...streams, videoStreams, audioStreams },
      },
      warnings,
    }
  },
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {}
}

function asRecordOrUndefined(value: unknown): Record<string, any> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : undefined
}

function asArray(value: unknown): any[] {
  return Array.isArray(value) ? value : []
}

function pickDefined(source: Record<string, any>, keys: string[]): Record<string, any> {
  return Object.fromEntries(keys.flatMap((key) => source[key] === undefined ? [] : [[key, source[key]]]))
}
