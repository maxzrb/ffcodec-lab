import { describe, it, expect } from 'vitest'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { renderBash } from '@ffcodec/domain/shell/bash-renderer'
import { audioEncoders } from '@ffcodec/catalog/data/encoders/audio'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'

const catalog = loadCatalog()

describe('FLAC encoder catalog', () => {
  it('flac is registered', () => {
    expect(audioEncoders['flac']).toBeDefined()
  })

  it('flac has zero qualityModes (lossless)', () => {
    expect(audioEncoders['flac'].qualityModes.length).toBe(0)
  })

  it('flac supportsLossless is true', () => {
    expect(audioEncoders['flac'].capabilities.supportsLossless).toBe(true)
  })

  it('flac compression_level range is 0-12, default 5', () => {
    const sp = audioEncoders['flac'].specialParameters.find((p) => p.id === 'flac.compression_level')
    expect(sp).toBeDefined()
    expect(sp!.range?.min).toBe(0)
    expect(sp!.range?.max).toBe(12)
    expect(sp!.defaultValue).toBe(5)
  })
})

describe('FLAC command generation', () => {
  it('FLAC basic encode generates -c:a:0 flac', () => {
    const config = createDefaultProjectConfig()
    config.audio.encoderId = 'flac'
    config.audio.bitrate = undefined
    const text = renderBash(buildCommandPlan(config, catalog, [])).text

    expect(text).toContain('-c:a')
    expect(text).toContain('flac')
  })

  it('FLAC does not generate -b:a', () => {
    const config = createDefaultProjectConfig()
    config.audio.encoderId = 'flac'
    config.audio.bitrate = undefined
    const text = renderBash(buildCommandPlan(config, catalog, [])).text
    // FLAC is lossless, -b:a:0 should be cleared or absent
    expect(text).not.toContain('-b:a')
  })

  it('FLAC in MP4 container is supported-with-caveat', () => {
    expect(catalog.containers['mp4'].audioCodecs['flac']).toBe('supported-with-caveat')
  })

  it('FLAC in OGG container is supported', () => {
    expect(catalog.containers['ogg'].audioCodecs['flac']).toBe('supported')
  })

  it('FLAC in MKV container is supported', () => {
    expect(catalog.containers['mkv'].audioCodecs['flac']).toBe('supported')
  })
})
