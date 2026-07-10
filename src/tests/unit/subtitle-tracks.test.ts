import { describe, it, expect } from 'vitest'
import { createDefaultProjectConfig } from '../../domain/config/defaults'
import { buildCommandPlan } from '../../domain/command/command-builder'
import { renderBash } from '../../domain/shell/bash-renderer'
import { loadCatalog } from '../../domain/catalog/catalog-loader'
import type { SubtitleTrackConfig } from '../../domain/config/project-config'

const catalog = loadCatalog()

function makeTrack(overrides: Partial<SubtitleTrackConfig> = {}): SubtitleTrackConfig {
  return {
    id: 's1',
    source: 'input',
    mainStreamRelIndex: 0,
    codecMode: 'copy',
    sourceCodecKnown: true,
    disposition: {},
    ...overrides,
  }
}

function configWithTracks(tracks: SubtitleTrackConfig[]) {
  const config = createDefaultProjectConfig()
  config.subtitle.tracks = tracks
  return config
}

describe('Subtitle tracks — command generation', () => {
  it('single internal subtitle track generates -map and -c:s:0', () => {
    const config = configWithTracks([makeTrack()])
    const text = renderBash(buildCommandPlan(config, catalog, [])).text

    expect(text).toContain('-map')
    expect(text).toContain('0:s:0')
    expect(text).toContain('-c:s:0')
    expect(text).toContain('copy')
  })

  it('multiple subtitle tracks generate multiple -c:s:N entries', () => {
    const config = configWithTracks([
      makeTrack({ id: 's1', mainStreamRelIndex: 0 }),
      makeTrack({ id: 's2', mainStreamRelIndex: 1 }),
    ])
    const text = renderBash(buildCommandPlan(config, catalog, [])).text

    expect(text).toContain('-c:s:0')
    expect(text).toContain('-c:s:1')
  })

  it('external subtitle track adds input', () => {
    const config = configWithTracks([
      makeTrack({ source: 'external', path: 'subs.srt', mainStreamRelIndex: undefined, sourceCodecKnown: false }),
    ])
    const plan = buildCommandPlan(config, catalog, [])
    const extInputs = plan.invocations[0].inputs.filter((i) => i.id.startsWith('input.subtitle'))
    expect(extInputs.length).toBe(1)
    expect(extInputs[0].path).toBe('subs.srt')
  })

  it('subtitle language generates -metadata:s:s:N', () => {
    const config = configWithTracks([makeTrack({ language: 'eng' })])
    const text = renderBash(buildCommandPlan(config, catalog, [])).text

    expect(text).toContain('-metadata:s:s:0')
    expect(text).toContain('language=eng')
  })

  it('subtitle title generates -metadata:s:s:N', () => {
    const config = configWithTracks([makeTrack({ title: 'English SDH' })])
    const text = renderBash(buildCommandPlan(config, catalog, [])).text

    expect(text).toContain('title=English SDH')
  })

  it('disposition flags generate -disposition:s:N', () => {
    const config = configWithTracks([makeTrack({ disposition: { default: true, forced: true } })])
    const text = renderBash(buildCommandPlan(config, catalog, [])).text

    expect(text).toContain('-disposition:s:0')
    expect(text).toContain('default+forced')
  })

  it('subtitle transcode mode generates -c:s:N codec', () => {
    const config = createDefaultProjectConfig()
    config.output.containerId = 'mp4'
    config.subtitle.tracks = [makeTrack({ codecMode: 'transcode', codec: 'mov_text' })]
    const text = renderBash(buildCommandPlan(config, catalog, [])).text

    expect(text).toContain('-c:s:0')
    expect(text).toContain('mov_text')
  })

  it('empty tracks array generates no -c:s', () => {
    const text = renderBash(buildCommandPlan(configWithTracks([]), catalog, [])).text
    expect(text).not.toContain('-c:s')
  })

  it('subtitle burn is unaffected by track changes', () => {
    const config = configWithTracks([makeTrack()])
    config.video.mode = 'encode'
    config.subtitle.burn = {
      enabled: true,
      source: 'external',
      externalPath: 'subs.ass',
      filterKind: 'ass',
      style: {},
    }
    const text = renderBash(buildCommandPlan(config, catalog, [])).text

    expect(text).toContain('-vf')
    expect(text).toContain('subs.ass')
  })

  it('mux subtitle tracks do not generate -vf', () => {
    const config = configWithTracks([makeTrack()])
    const text = renderBash(buildCommandPlan(config, catalog, [])).text

    // No burn → no -vf
    expect(text).not.toContain('-vf')
  })
})
