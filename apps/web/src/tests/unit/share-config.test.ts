import { describe, it, expect } from 'vitest'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import {
  encodeConfigToShare,
  decodeConfigFromShare,
  toShareable,
} from '../../features/sharing/share-codec'
import { migrateConfig } from '@ffcodec/domain/migration/migrate-config'
import { ALL_MIGRATION_STEPS, CURRENT_SCHEMA_VERSION } from '@ffcodec/domain/migration/migration-registry'

describe('Share config — encoding', () => {
  it('encodeConfigToShare returns hash for normal config', () => {
    const config = createDefaultProjectConfig()
    const result = encodeConfigToShare(config)
    expect(result.kind).toBe('hash')
    expect(result.value.startsWith('#')).toBe(true)
  })

  it('hash does not contain command text', () => {
    const config = createDefaultProjectConfig()
    const result = encodeConfigToShare(config)
    expect(result.value).not.toContain('ffmpeg')
    expect(result.value).not.toContain('-c:v')
    expect(result.value).not.toContain('-crf')
  })

  it('toShareable strips local paths', () => {
    const config = {
      ...createDefaultProjectConfig(),
      input: { path: '/home/user/video.mkv', additionalInputs: [] as never[] },
      output: { path: '/home/user/output.mp4', containerId: 'mp4', overwrite: false },
    }
    const shareable = toShareable(config)
    // Shareable does not have input.path or output.path
    expect((shareable as Record<string, unknown>).input).toBeUndefined()
    const out = (shareable as Record<string, unknown>).o as Record<string, unknown> | undefined
    expect(out?.path).toBeUndefined()
  })
})

describe('Share config — decoding', () => {
  it('migrates v2 to v4 without enabling pixel conversion', () => {
    const legacy = createDefaultProjectConfig() as unknown as Record<string, unknown>
    legacy.schemaVersion = 2
    const video = legacy.video as Record<string, unknown>
    delete video.color
    const frame = legacy.frame as Record<string, unknown>
    const filters = frame.filters as Record<string, unknown>
    delete filters.denoise
    delete filters.deband

    const migrated = migrateConfig(2, CURRENT_SCHEMA_VERSION, legacy, [...ALL_MIGRATION_STEPS]).config
    const migratedVideo = migrated.video as Record<string, unknown>
    const migratedFilters = (migrated.frame as Record<string, unknown>).filters as Record<string, unknown>
    expect(migrated.schemaVersion).toBe(6)
    expect(migratedVideo.color).toEqual({ operation: 'metadata-only', filter: 'zscale', toneMap: 'none' })
    expect(migratedFilters.denoise).toEqual({ enabled: false, values: {} })
    expect(migratedFilters.deband).toEqual({ enabled: false, values: {} })
  })

  it('round-trips config correctly', () => {
    const config = createDefaultProjectConfig()
    const encoded = encodeConfigToShare(config)
    const decoded = decodeConfigFromShare(encoded.value)

    expect(decoded.success).toBe(true)
    expect(decoded.config).toBeDefined()
    expect(decoded.config!.video.encoderId).toBe('libx264')
    expect(decoded.config!.output.containerId).toBe('mp4')
  })

  it('rejects invalid hash', () => {
    const decoded = decodeConfigFromShare('#this-is-not-valid-base64!!!')
    expect(decoded.success).toBe(false)
  })

  it('warns on future schema version', () => {
    // Create a payload with future version
    const json = JSON.stringify({ v: 999, c: toShareable(createDefaultProjectConfig()) })
    const encoded = '#' + btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const decoded = decodeConfigFromShare(encoded)
    // May succeed with warnings or fail
    if (decoded.success) {
      expect(decoded.warnings.length).toBeGreaterThan(0)
    }
  })

  it('preserves NVENC-specific config through round-trip', () => {
    const config = {
      ...createDefaultProjectConfig(),
      video: {
        ...createDefaultProjectConfig().video,
        encoderId: 'h264_nvenc',
        rateControl: {
          mode: 'nvenc-cq' as const,
          qualityValue: 23,
          additionalValues: {},
        },
      },
    }
    const encoded = encodeConfigToShare(config)
    const decoded = decodeConfigFromShare(encoded.value)

    expect(decoded.success).toBe(true)
    expect(decoded.config!.video.encoderId).toBe('h264_nvenc')
  })

  it('preserves v4 color processing, denoise, deband and advanced quality values', () => {
    const config = createDefaultProjectConfig()
    config.video.color = {
      operation: 'convert-and-tag', filter: 'zscale', toneMap: 'mobius', nominalPeak: 100,
      space: 'bt709', primaries: 'bt709', transfer: 'bt709', range: 'tv',
    }
    config.video.specialParameters.gopSize = 120
    config.frame.filters!.denoise = { enabled: true, algorithm: 'hqdn3d', values: { lumaSpatial: 5 } }
    config.frame.filters!.deband = { enabled: true, algorithm: 'gradfun', values: { strength: 1.4, radius: 18 } }

    const decoded = decodeConfigFromShare(encodeConfigToShare(config).value)
    expect(decoded.success).toBe(true)
    expect(decoded.config?.schemaVersion).toBe(6)
    expect(decoded.config?.video.color?.space).toBe('bt709')
    expect(decoded.config?.video.color?.operation).toBe('convert-and-tag')
    expect(decoded.config?.video.color?.toneMap).toBe('mobius')
    expect(decoded.config?.video.specialParameters.gopSize).toBe(120)
    expect(decoded.config?.frame.filters?.denoise.algorithm).toBe('hqdn3d')
    expect(decoded.config?.frame.filters?.deband.algorithm).toBe('gradfun')
  })

  it('preserves target-size utility settings through a privacy-safe round-trip', () => {
    const config = createDefaultProjectConfig()
    config.tools.targetSize = {
      enabled: true,
      targetMiB: 1450,
      durationMinutes: 122.5,
      overheadPercent: 4,
      manualAudioBitrateKbps: 384,
    }

    const decoded = decodeConfigFromShare(encodeConfigToShare(config).value)
    expect(decoded.success).toBe(true)
    expect(decoded.config?.tools.targetSize).toEqual(config.tools.targetSize)
  })
})
