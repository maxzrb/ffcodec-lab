import { describe, it, expect } from 'vitest'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { renderBash } from '@ffcodec/domain/shell/bash-renderer'
import { videoEncoders } from '@ffcodec/catalog/data/encoders/video'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'

const catalog = loadCatalog()

function makeConfig(overrides: Record<string, unknown> = {}) {
  const base = createDefaultProjectConfig()
  const merged = { ...base, ...overrides }
  if (overrides.video) {
    merged.video = { ...base.video, ...(overrides.video as Record<string, unknown>) }
    if ((overrides.video as Record<string, unknown>)?.rateControl) {
      merged.video.rateControl = {
        ...base.video.rateControl,
        ...((overrides.video as Record<string, unknown>).rateControl as Record<string, unknown>),
      } as typeof base.video.rateControl
    }
  }
  return merged
}

function nvencCqConfig() {
  return makeConfig({
    video: {
      encoderId: 'h264_nvenc',
      rateControl: { mode: 'nvenc-cq', qualityValue: 23, additionalValues: {} },
    },
  })
}

describe('NVENC encoder catalog', () => {
  it('h264_nvenc is registered', () => {
    expect(videoEncoders['h264_nvenc']).toBeDefined()
  })

  it('hevc_nvenc is registered', () => {
    expect(videoEncoders['hevc_nvenc']).toBeDefined()
  })

  it('h264_nvenc has correct family and implementation', () => {
    const enc = videoEncoders['h264_nvenc']
    expect(enc.family).toBe('h264')
    expect(enc.implementation).toBe('nvidia')
  })

  it('h264_nvenc preset values are p1-p7 (not ultrafast)', () => {
    const enc = videoEncoders['h264_nvenc']
    const values = enc.preset!.options!.map((o) => o.value)
    expect(values).toContain('p1')
    expect(values).toContain('p7')
    expect(values).not.toContain('ultrafast')
    expect(values).not.toContain('medium')
  })

  it('h264_nvenc does not support twoPass', () => {
    expect(videoEncoders['h264_nvenc'].capabilities.supportsTwoPass).toBe(false)
  })

  it('NVENC quality modes include nvenc-cq, not crf', () => {
    const enc = videoEncoders['h264_nvenc']
    const modes = enc.qualityModes.map((m) => m.id)
    expect(modes).toContain('nvenc-cq')
    expect(modes).toContain('cqp')
    expect(modes).toContain('vbr')
    expect(modes).toContain('cbr')
    expect(modes).not.toContain('crf')
  })
})

describe('NVENC command generation', () => {
  it('h264_nvenc CQ mode generates -rc:0 vbr -cq N', () => {
    const plan = buildCommandPlan(nvencCqConfig(), catalog, [])
    const text = renderBash(plan).text

    expect(text).toContain('-c:v')
    expect(text).toContain('h264_nvenc')
    expect(text).toContain('-rc')
    expect(text).toContain('-cq')
    expect(text).not.toContain('-crf')
  })

  it('NVENC switch parameters emit one explicit 1/0 value without duplicates', () => {
    const enabled = nvencCqConfig()
    enabled.video.specialParameters = { spatialAq: true }
    const enabledText = renderBash(buildCommandPlan(enabled, catalog, [])).text
    expect(enabledText).toContain('-spatial_aq 1')
    expect(enabledText.split('-spatial_aq').length - 1).toBe(1)

    const disabled = nvencCqConfig()
    disabled.video.specialParameters = { spatialAq: false, temporalAq: true }
    const disabledText = renderBash(buildCommandPlan(disabled, catalog, [])).text
    expect(disabledText).toContain('-spatial_aq 0')
    expect(disabledText).toContain('-temporal_aq 1')
  })

  it('h264_nvenc CQP mode generates -rc:0 constqp -qp:0 N', () => {
    const config = makeConfig({
      video: {
        encoderId: 'h264_nvenc',
        rateControl: { mode: 'cqp', qualityValue: 18, additionalValues: {} },
      },
    })
    const text = renderBash(buildCommandPlan(config, catalog, [])).text
    expect(text).toContain('-rc')
    expect(text).toContain('constqp')
    expect(text).toContain('-qp')
  })

  it('NVENC VBR mode generates bitrate/maxrate/bufsize', () => {
    const config = makeConfig({
      video: {
        encoderId: 'h264_nvenc',
        rateControl: { mode: 'vbr', bitrate: '5000k', maxRate: '8000k', bufferSize: '4000k', additionalValues: {} },
      },
    })
    const text = renderBash(buildCommandPlan(config, catalog, [])).text
    expect(text).toContain('-b:v')
    expect(text).toContain('5000k')
    expect(text).toContain('-maxrate')
    expect(text).toContain('-bufsize')
  })

  it('NVENC CBR mode generates -rc:0 cbr -b:v:0 N', () => {
    const config = makeConfig({
      video: {
        encoderId: 'h264_nvenc',
        rateControl: { mode: 'cbr', bitrate: '3000k', additionalValues: {} },
      },
    })
    const text = renderBash(buildCommandPlan(config, catalog, [])).text
    expect(text).toContain('-rc')
    expect(text).toContain('cbr')
    expect(text).toContain('-b:v')
  })

  it('container compatibility: h264_nvenc in webm is unsupported', () => {
    expect(catalog.containers['webm'].videoCodecs['h264_nvenc']).toBe('unsupported')
  })

  it('all generated NVENC args have originId', () => {
    const plan = buildCommandPlan(nvencCqConfig(), catalog, [])
    for (const inv of plan.invocations) {
      const allArgs = [...inv.globalArgs, ...inv.output.maps, ...inv.output.codecArgs,
        ...inv.output.qualityArgs, ...inv.output.filterArgs, ...inv.output.audioArgs,
        ...inv.output.subtitleArgs, ...inv.output.muxerArgs, ...inv.output.customArgs]
      for (const arg of allArgs) {
        expect(arg.originId).toBeTruthy()
      }
    }
  })

  it('NVENC CQ mode does not emit -crf', () => {
    const text = renderBash(buildCommandPlan(nvencCqConfig(), catalog, [])).text
    expect(text).not.toContain('-crf')
  })

  it('availability warning does not block command generation', () => {
    const plan = buildCommandPlan(nvencCqConfig(), catalog, [{
      code: 'warn.avail.hardware', severity: 'warning', category: 'availability',
      message: 'Hardware not detected', originIds: ['video.encoderId'], context: {},
    }])
    expect(plan.invocations.length).toBeGreaterThan(0)
  })
})
