// ============================================================
// qsv.test.ts — Intel QSV encoder unit tests.
// ============================================================

import { describe, it, expect } from 'vitest'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { renderBash, renderPowerShell, renderCmd } from '@ffcodec/domain/shell'
import { videoEncoders } from '@ffcodec/catalog/data/encoders/video'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { normalizeConfig } from '@ffcodec/domain/normalization'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'

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

function h264QsvCqp(): ProjectConfig {
  return makeConfig({
    video: {
      encoderId: 'h264_qsv',
      rateControl: { mode: 'qsv-cqp', qualityValue: 23, additionalValues: {} },
    },
  })
}

function hevcQsvCqp(): ProjectConfig {
  return makeConfig({
    video: {
      encoderId: 'hevc_qsv',
      rateControl: { mode: 'qsv-cqp', qualityValue: 28, additionalValues: {} },
    },
  })
}

function buildCommand(config: ProjectConfig): string {
  const { config: normalized } = normalizeConfig(config, config, catalog)
  const plan = buildCommandPlan(normalized, catalog, [])
  return renderBash(plan).text
}

describe('QSV Encoder Catalog', () => {
  it('h264_qsv and hevc_qsv are registered', () => {
    expect(videoEncoders['h264_qsv']).toBeDefined()
    expect(videoEncoders['hevc_qsv']).toBeDefined()
  })

  it('QSV encoders have intel implementation', () => {
    expect(videoEncoders['h264_qsv'].implementation).toBe('intel')
    expect(videoEncoders['hevc_qsv'].implementation).toBe('intel')
  })

  it('QSV encoders have hardware-dependent availability', () => {
    expect(videoEncoders['h264_qsv'].availabilityClass).toBe('hardware-dependent')
    expect(videoEncoders['hevc_qsv'].availabilityClass).toBe('hardware-dependent')
  })

  it('QSV encoders declare build and hardware requirements', () => {
    for (const id of ['h264_qsv', 'hevc_qsv']) {
      const enc = videoEncoders[id]
      expect(enc.capabilityScope?.buildRequirements?.length).toBeGreaterThan(0)
      expect(enc.capabilityScope?.hardware?.length).toBeGreaterThan(0)
    }
  })

  it('all QSV quality mode controls have configBinding', () => {
    for (const id of ['h264_qsv', 'hevc_qsv']) {
      const enc = videoEncoders[id]
      for (const qm of enc.qualityModes) {
        for (const ctrl of qm.controls) {
          expect(ctrl.configBinding).toBeDefined()
          expect(ctrl.configBinding!.path).toBeTruthy()
        }
      }
    }
  })

  it('all 6 QSV quality mode IDs are uniquely registered', () => {
    const qsvIds = ['qsv-cqp', 'qsv-icq', 'qsv-la-icq', 'qsv-vbr', 'qsv-cbr', 'qsv-la-vbr']
    const h264 = videoEncoders['h264_qsv']
    const hevc = videoEncoders['hevc_qsv']
    for (const modeId of qsvIds) {
      expect(h264.qualityModes.some((m) => m.id === modeId) || hevc.qualityModes.some((m) => m.id === modeId)).toBe(true)
    }
  })
})

describe('h264_qsv Commands', () => {
  it('generates CQP command with -qp', () => {
    const cmd = buildCommand(h264QsvCqp())
    expect(cmd).toContain('-c:v h264_qsv')
    expect(cmd).toContain('-qp 23')
  })

  it('generates ICQ command with -global_quality and -look_ahead', () => {
    const config = makeConfig({
      video: {
        encoderId: 'h264_qsv',
        rateControl: { mode: 'qsv-icq', qualityValue: 23, additionalValues: {} },
      },
    })
    const cmd = buildCommand(config)
    expect(cmd).toContain('-c:v h264_qsv')
    expect(cmd).toContain('-global_quality 23')
    expect(cmd).toContain('-look_ahead 1')
  })

  it('generates LA_ICQ command with look_ahead_depth from modeArguments', () => {
    const config = makeConfig({
      video: {
        encoderId: 'h264_qsv',
        rateControl: { mode: 'qsv-la-icq', qualityValue: 20, additionalValues: {} },
      },
    })
    const cmd = buildCommand(config)
    expect(cmd).toContain('-global_quality 20')
    // look_ahead_depth is emitted from modeArguments with default value 40
    expect(cmd).toContain('-look_ahead_depth')
  })

  it('generates VBR command without -qp or -global_quality', () => {
    const config = makeConfig({
      video: {
        encoderId: 'h264_qsv',
        rateControl: { mode: 'qsv-vbr', bitrate: '6000k', maxRate: '8000k', bufferSize: '16000k', additionalValues: {} },
      },
    })
    const cmd = buildCommand(config)
    expect(cmd).toContain('-b:v 6000k')
    expect(cmd).toContain('-maxrate 8000k')
    expect(cmd).toContain('-bufsize 16000k')
    expect(cmd).not.toContain('-qp')
    expect(cmd).not.toContain('-global_quality')
  })

  it('generates CBR command', () => {
    const config = makeConfig({
      video: {
        encoderId: 'h264_qsv',
        rateControl: { mode: 'qsv-cbr', bitrate: '4000k', additionalValues: {} },
      },
    })
    const cmd = buildCommand(config)
    expect(cmd).toContain('-b:v 4000k')
    expect(cmd).not.toContain('-qp')
  })

  it('generates command with preset and profile', () => {
    const config = makeConfig({
      video: {
        encoderId: 'h264_qsv',
        preset: 'slow',
        profile: 'high',
        rateControl: { mode: 'qsv-cqp', qualityValue: 23, additionalValues: {} },
      },
    })
    const cmd = buildCommand(config)
    expect(cmd).toContain('-preset slow')
    expect(cmd).toContain('-profile:v high')
  })

  it('special parameters appear in command', () => {
    const base = h264QsvCqp()
    base.video.specialParameters = { asyncDepth: 8, gopSize: 120, lowPower: true }
    const cmd = buildCommand(base)
    expect(cmd).toContain('-async_depth 8')
    expect(cmd).toContain('-g 120')
    expect(cmd).toContain('-low_power 1')
  })
})

describe('hevc_qsv Commands', () => {
  it('generates CQP command', () => {
    const cmd = buildCommand(hevcQsvCqp())
    expect(cmd).toContain('-c:v hevc_qsv')
    expect(cmd).toContain('-qp 28')
  })

  it('generates ICQ command', () => {
    const config = makeConfig({
      video: {
        encoderId: 'hevc_qsv',
        rateControl: { mode: 'qsv-icq', qualityValue: 28, additionalValues: {} },
      },
    })
    const cmd = buildCommand(config)
    expect(cmd).toContain('-c:v hevc_qsv')
    expect(cmd).toContain('-global_quality 28')
  })

  it('generates VBR with all rate control args', () => {
    const config = makeConfig({
      video: {
        encoderId: 'hevc_qsv',
        rateControl: { mode: 'qsv-vbr', bitrate: '8000k', maxRate: '12000k', bufferSize: '24000k', additionalValues: {} },
      },
    })
    const cmd = buildCommand(config)
    expect(cmd).toContain('-b:v 8000k')
    expect(cmd).toContain('-maxrate 12000k')
    expect(cmd).toContain('-bufsize 24000k')
  })

  it('generates Look-ahead VBR command', () => {
    const config = makeConfig({
      video: {
        encoderId: 'hevc_qsv',
        rateControl: { mode: 'qsv-la-vbr', bitrate: '6000k', maxRate: '10000k', additionalValues: {} },
      },
    })
    const cmd = buildCommand(config)
    expect(cmd).toContain('-b:v 6000k')
    expect(cmd).toContain('-look_ahead 1')
  })
})

describe('QSV Encoder Switching', () => {
  it('switching from libx264 to h264_qsv normalizes invalid quality mode', () => {
    const prev = createDefaultProjectConfig()
    const next = makeConfig({
      video: {
        encoderId: 'h264_qsv',
        // 'crf' is not valid for QSV — will be normalized to qsv-cqp
        rateControl: { mode: 'crf', qualityValue: 23, additionalValues: {} },
      },
    })
    const { config: normalized, notices } = normalizeConfig(prev, next, catalog)
    expect(notices.length).toBeGreaterThan(0)
    const modeNotice = notices.find((n) => n.fieldId === 'video.rateControl.mode')
    expect(modeNotice).toBeDefined()
    expect(normalized.video.rateControl?.mode).toBe('qsv-cqp')
  })

  it('switching from h264_qsv to hevc_qsv preserves compatible mode', () => {
    const prev = makeConfig({
      video: {
        encoderId: 'h264_qsv',
        rateControl: { mode: 'qsv-icq', qualityValue: 23, additionalValues: {} },
      },
    })
    const next = makeConfig({
      video: {
        encoderId: 'hevc_qsv',
        rateControl: { mode: 'qsv-icq', qualityValue: 23, additionalValues: {} },
      },
    })
    const { config: normalized } = normalizeConfig(prev, next, catalog)
    expect(normalized.video.rateControl?.mode).toBe('qsv-icq')
  })

  it('encoder switch clears special parameters', () => {
    const prev = makeConfig({
      video: {
        encoderId: 'h264_qsv',
        rateControl: { mode: 'qsv-cqp', qualityValue: 23, additionalValues: {} },
      },
    })
    prev.video.specialParameters = { 'h264_qsv.asyncdepth': 8 }
    const next = createDefaultProjectConfig()
    next.video.encoderId = 'libx264'
    next.video.specialParameters = { 'h264_qsv.asyncdepth': 8 }
    const { config: normalized, notices } = normalizeConfig(prev as ProjectConfig, next as ProjectConfig, catalog)
    expect(normalized.video.specialParameters).toEqual({})
    expect(notices.some((n) => n.fieldId === 'video.specialParameters')).toBe(true)
  })
})

describe('QSV Availability', () => {
  it('availability warnings do not prevent command generation', () => {
    const cmd = buildCommand(h264QsvCqp())
    expect(cmd).toContain('ffmpeg')
    expect(cmd).toContain('h264_qsv')
  })

  it('all parameters carry originId', () => {
    const { config: normalized } = normalizeConfig(h264QsvCqp(), h264QsvCqp(), catalog)
    const plan = buildCommandPlan(normalized, catalog, [])
    for (const arg of plan.invocations[0].output.codecArgs) {
      expect(arg.originId).toBeTruthy()
    }
    for (const arg of plan.invocations[0].output.qualityArgs) {
      expect(arg.originId).toBeTruthy()
    }
  })
})

describe('QSV Three Shell Rendering', () => {
  it('Bash, PowerShell, and CMD all render QSV commands', () => {
    const { config: normalized } = normalizeConfig(h264QsvCqp(), h264QsvCqp(), catalog)
    const plan = buildCommandPlan(normalized, catalog, [])

    expect(renderBash(plan).text).toContain('-c:v h264_qsv')
    expect(renderPowerShell(plan).text).toContain('-c:v h264_qsv')
    expect(renderCmd(plan).text).toContain('-c:v h264_qsv')
  })
})

describe('QSV Parameter Ranges', () => {
  it('CQP range is 0-51', () => {
    const h264 = videoEncoders['h264_qsv']
    const cqp = h264.qualityModes.find((m) => m.id === 'qsv-cqp')
    expect(cqp!.controls[0].range?.min).toBe(0)
    expect(cqp!.controls[0].range?.max).toBe(51)
  })

  it('ICQ uses -global_quality not -qp', () => {
    const h264 = videoEncoders['h264_qsv']
    const icq = h264.qualityModes.find((m) => m.id === 'qsv-icq')
    expect(icq!.controls[0].commandBinding?.argName).toBe('-global_quality')
  })

  it('async_depth range is 1-20', () => {
    const h264 = videoEncoders['h264_qsv']
    const ad = h264.specialParameters.find((s) => s.id === 'h264_qsv.asyncdepth')
    expect(ad?.range?.min).toBe(1)
    expect(ad?.range?.max).toBe(20)
  })

  it('QSV preset values are QSV-specific (not x264 ultrafast/placebo, not NVENC p1-p7)', () => {
    const h264 = videoEncoders['h264_qsv']
    const values = h264.preset!.options!.map((o) => o.value)
    expect(values).toContain('veryfast')
    expect(values).toContain('veryslow')
    expect(values).not.toContain('ultrafast')
    expect(values).not.toContain('placebo')
    expect(values).not.toContain('p1')
  })

  it('QSV special params do not include NVENC-only params', () => {
    const h264 = videoEncoders['h264_qsv']
    const spIds = h264.specialParameters.map((s) => s.id)
    expect(spIds).not.toContain('h264_qsv.spatialaq')
    expect(spIds).not.toContain('h264_qsv.temporalaq')
    expect(spIds).not.toContain('h264_qsv.gpu')
  })
})
