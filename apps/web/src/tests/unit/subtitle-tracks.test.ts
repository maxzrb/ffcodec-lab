import { describe, it, expect } from 'vitest'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { renderBash } from '@ffcodec/domain/shell/bash-renderer'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import type { SubtitleTrackConfig } from '@ffcodec/domain/config/project-config'
import { validateConfig } from '@ffcodec/domain/validation/validate-config'
import { RuleIndex } from '@ffcodec/catalog/rule-index'

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
    expect(text).not.toContain('0:s?')
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

  it('preserveAllSubtitle without tracks generates -c:s copy to prevent bitmap→text conversion', () => {
    const config = createDefaultProjectConfig()
    // Simulate the remux / keep-all-subtitles scenario the user hit:
    // -map 0:s? without -c:s copy causes FFmpeg to auto-select SSA text codec
    // for PGS bitmap subtitles, which fails hard.
    config.streams.preserveAllSubtitleStreams = true
    config.subtitle.tracks = []
    const text = renderBash(buildCommandPlan(config, catalog, [])).text

    expect(text).toContain('-c:s copy')
    // -map 0:s? may be quoted by shell renderers as -map '0:s?' or -map "0:s?"
    expect(text).toMatch(/-map ['"]?0:s\?['"]?/)
  })

  it('preserveAllSubtitle keeps a global copy fallback when one track is configured', () => {
    const config = configWithTracks([makeTrack({ mainStreamRelIndex: 0, codecMode: 'copy' })])
    config.streams.preserveAllSubtitleStreams = true

    const text = renderBash(buildCommandPlan(config, catalog, [])).text

    expect(text).toContain('-c:s copy')
    expect(text).toContain('-c:s:0 copy')
    expect(text.match(/0:s:0/g)).toBeNull()
  })

  it('places the preserve-all copy fallback before a stream-specific transcode override', () => {
    const config = configWithTracks([makeTrack({
      mainStreamRelIndex: 0,
      codecMode: 'transcode',
      sourceCodec: 'ass',
      codec: 'srt',
    })])
    config.streams.preserveAllSubtitleStreams = true

    const text = renderBash(buildCommandPlan(config, catalog, [])).text

    expect(text.indexOf('-c:s copy')).toBeLessThan(text.indexOf('-c:s:0 srt'))
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

  it('escapes Windows drive paths for external subtitle filtergraphs', () => {
    const config = createDefaultProjectConfig()
    config.subtitle.burn = {
      enabled: true,
      source: 'external',
      externalPath: "C:\\Media Files\\导演版's.ass",
      filterKind: 'ass',
      style: {},
    }

    const plan = buildCommandPlan(config, catalog, [])
    const filter = plan.invocations[0].output.filterArgs.find((arg) => arg.tokens[0] === '-vf')?.tokens[1]

    expect(filter).toContain("ass=filename='C\\:/Media Files/导演版\\'s.ass'")
  })

  it('does not emit unsupported force_style for the ass filter', () => {
    const config = createDefaultProjectConfig()
    config.subtitle.burn = {
      enabled: true,
      source: 'external',
      externalPath: 'subtitle.ass',
      filterKind: 'ass',
      style: { fontSize: 32, outline: 2 },
      customForceStyle: 'FontSize=40',
    }

    const plan = buildCommandPlan(config, catalog, [])
    const filter = plan.invocations[0].output.filterArgs.find((arg) => arg.tokens[0] === '-vf')?.tokens[1]

    expect(filter).toContain("ass=filename='subtitle.ass'")
    expect(filter).not.toContain('force_style')
  })

  it('mux subtitle tracks do not generate -vf', () => {
    const config = configWithTracks([makeTrack()])
    const text = renderBash(buildCommandPlan(config, catalog, [])).text

    // No burn → no -vf
    expect(text).not.toContain('-vf')
  })
})

describe('Subtitle tracks — diagnostics', () => {
  it('does not warn when there are no subtitle tracks', () => {
    const messages = validateConfig(configWithTracks([]), catalog, new RuleIndex())
    expect(messages.some((message) => message.code === 'warn.subtitle.copy.unknown.sourcecodec')).toBe(false)
  })

  it('warns only for copied tracks with an unknown source codec', () => {
    const config = configWithTracks([
      makeTrack({ id: 'known', sourceCodecKnown: true }),
      makeTrack({ id: 'unknown', sourceCodecKnown: false }),
      makeTrack({ id: 'transcoded', codecMode: 'transcode', codec: 'mov_text', sourceCodecKnown: false }),
    ])
    const messages = validateConfig(config, catalog, new RuleIndex())
    const warning = messages.find((message) => message.code === 'warn.subtitle.copy.unknown.sourcecodec')

    expect(warning?.originIds).toEqual(['subtitle.tracks.unknown.codecMode'])
    expect(warning?.context.trackIds).toEqual(['unknown'])
  })

  it('blocks bitmap PGS to text subtitle transcoding', () => {
    const config = configWithTracks([makeTrack({
      codecMode: 'transcode',
      sourceCodecKnown: true,
      sourceCodec: 'hdmv_pgs_subtitle',
      codec: 'mov_text',
    })])

    const messages = validateConfig(config, catalog, new RuleIndex())

    expect(messages.some((message) => message.code === 'error.subtitle.transcode.mediaType')).toBe(true)
  })

  it('blocks external subtitle tracks while preserve-all makes output indices ambiguous', () => {
    const config = configWithTracks([makeTrack({
      source: 'external',
      path: 'external.ass',
      mainStreamRelIndex: undefined,
    })])
    config.streams.preserveAllSubtitleStreams = true

    const messages = validateConfig(config, catalog, new RuleIndex())

    expect(messages.some((message) => message.code === 'error.subtitle.preserveAll.externalIndex')).toBe(true)
  })
})
