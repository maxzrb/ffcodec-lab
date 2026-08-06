import { describe, expect, it } from 'vitest'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { projectConfigSchema } from '@ffcodec/domain/config/config-schema'
import { migrateConfig } from '@ffcodec/domain/migration/migrate-config'
import { ALL_MIGRATION_STEPS, CURRENT_SCHEMA_VERSION } from '@ffcodec/domain/migration/migration-registry'
import {
  applyAudioSnapshotToStreams,
  applyVideoSnapshotToStreams,
  loadVideoSnapshotIntoTemplate,
  resolveEffectiveAudioStreamPlans,
  resolveEffectiveVideoStreamPlans,
  restoreVideoStreamInheritance,
} from '@ffcodec/domain/streams'
import { decodeConfigFromShare, encodeConfigToShare } from '@ffcodec/workbench/features/sharing/share-codec'

describe('stream encoding snapshots', () => {
  it('freezes the current video template and exits preserve-all mode', () => {
    const config = createDefaultProjectConfig()
    config.streams.videoStreams = [
      { index: 0, codecMode: 'encode' },
      { index: 1, codecMode: 'encode' },
    ]
    config.video.encoderId = 'h264_nvenc'
    config.video.rateControl = { mode: 'nvenc-cq', qualityValue: 20, additionalValues: {} }
    config.customArgs.videoFilters = ['scale=1920:1080']

    const applied = applyVideoSnapshotToStreams(config, [1])
    applied.video.encoderId = 'libx264'
    applied.video.rateControl!.qualityValue = 28
    applied.customArgs.videoFilters = []

    const plans = resolveEffectiveVideoStreamPlans(applied)
    expect(applied.streams.preserveAllVideoStreams).toBe(false)
    expect(plans[0]).toMatchObject({ inputIndex: 0, source: 'global' })
    expect(plans[1]).toMatchObject({ inputIndex: 1, source: 'snapshot' })
    expect(plans[1].video.encoderId).toBe('h264_nvenc')
    expect(plans[1].video.rateControl?.qualityValue).toBe(20)
    expect(plans[1].customVideoFilters).toEqual(['scale=1920:1080'])
  })

  it('restores inheritance and can load a snapshot back into the global template', () => {
    const config = createDefaultProjectConfig()
    config.video.encoderId = 'hevc_nvenc'
    const applied = applyVideoSnapshotToStreams(config, [0])
    applied.video.encoderId = 'libx265'

    const loaded = loadVideoSnapshotIntoTemplate(applied, 0)
    expect(loaded.video.encoderId).toBe('hevc_nvenc')
    expect(restoreVideoStreamInheritance(applied, 0).streams.videoStreams[0].videoSnapshot).toBeUndefined()
  })

  it('freezes audio quality and processing independently', () => {
    const config = createDefaultProjectConfig()
    config.streams.audioStreams = [{ index: 0, codecMode: 'encode' }]
    config.audio.encoderId = 'libopus'
    config.audio.bitrate = '384k'
    config.customArgs.audioFilters = ['volume=0.9']
    const applied = applyAudioSnapshotToStreams(config, [0])
    applied.audio.bitrate = '128k'

    const plan = resolveEffectiveAudioStreamPlans(applied)[0]
    expect(plan.source).toBe('snapshot')
    expect(plan.audio.bitrate).toBe('384k')
    expect(plan.customAudioFilters).toEqual(['volume=0.9'])
  })

  it('migrates v8 sparse overrides into validated frozen snapshots', () => {
    const legacy = createDefaultProjectConfig() as any
    legacy.schemaVersion = 8
    legacy.streams.preserveAllVideoStreams = false
    legacy.streams.videoStreams = [{
      index: 0,
      codecMode: 'encode',
      video: { encoderId: 'h264_nvenc', crf: 19, preset: 'p6' },
    }]

    const migrated = migrateConfig(8, CURRENT_SCHEMA_VERSION, legacy, [...ALL_MIGRATION_STEPS])
    const parsed = projectConfigSchema.parse(migrated.config)
    const snapshot = parsed.streams.videoStreams[0].videoSnapshot

    expect(parsed.schemaVersion).toBe(9)
    expect(snapshot?.video.encoderId).toBe('h264_nvenc')
    expect(snapshot?.video.rateControl?.qualityValue).toBe(19)
    expect(snapshot?.video.preset).toBe('p6')
    expect(migrated.warnings).toContain('已将 1 个视频流覆写迁移为冻结参数快照')
  })

  it('preserves snapshots through privacy-safe sharing', () => {
    const config = applyVideoSnapshotToStreams(createDefaultProjectConfig(), [0])
    const encoded = encodeConfigToShare(config)
    const decoded = decodeConfigFromShare(encoded.value)

    expect(decoded.success).toBe(true)
    expect(decoded.config?.streams.videoStreams[0].videoSnapshot?.video.encoderId).toBe('libx264')
  })
})
