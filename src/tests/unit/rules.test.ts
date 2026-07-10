import { describe, it, expect } from 'vitest'
import { evaluateExpression, evaluateRules } from '../../domain/rules/rule-evaluator'
import { RuleIndex } from '../../domain/rules/rule-index'
import type { ProjectConfig } from '../../domain/config/project-config'
import { createDefaultProjectConfig } from '../../domain/config/defaults'
import { loadCatalog } from '../../domain/catalog/catalog-loader'
import type { RuleContext } from '../../domain/rules/rule-types'

const catalog = loadCatalog()

function makeCtx(overrides: Partial<ProjectConfig> = {}): RuleContext {
  return {
    config: { ...createDefaultProjectConfig(), ...overrides } as ProjectConfig,
    catalog,
  }
}

describe('Rule Expression Evaluator', () => {
  it('evaluates eq correctly', () => {
    const ctx = makeCtx({ video: { ...createDefaultProjectConfig().video, mode: 'copy' } })
    expect(evaluateExpression({ op: 'eq', path: 'video.mode', value: 'copy' }, ctx)).toBe(true)
    expect(evaluateExpression({ op: 'eq', path: 'video.mode', value: 'encode' }, ctx)).toBe(false)
  })

  it('evaluates neq correctly', () => {
    const ctx = makeCtx()
    expect(evaluateExpression({ op: 'neq', path: 'video.mode', value: 'disabled' }, ctx)).toBe(true)
    expect(evaluateExpression({ op: 'neq', path: 'video.mode', value: 'encode' }, ctx)).toBe(false)
  })

  it('evaluates "in" correctly', () => {
    const ctx = makeCtx({ output: { ...createDefaultProjectConfig().output, containerId: 'mp4' } })
    expect(evaluateExpression({ op: 'in', path: 'output.containerId', values: ['mp4', 'mov'] }, ctx)).toBe(true)
    expect(evaluateExpression({ op: 'in', path: 'output.containerId', values: ['webm'] }, ctx)).toBe(false)
  })

  it('evaluates "all" correctly', () => {
    const ctx = makeCtx({ video: { ...createDefaultProjectConfig().video, mode: 'copy' } })
    const expr = {
      op: 'all' as const,
      rules: [
        { op: 'eq' as const, path: 'video.mode', value: 'copy' },
        { op: 'neq' as const, path: 'video.mode', value: 'encode' },
      ],
    }
    expect(evaluateExpression(expr, ctx)).toBe(true)
  })

  it('evaluates "any" correctly', () => {
    const ctx = makeCtx()
    const expr = {
      op: 'any' as const,
      rules: [
        { op: 'eq' as const, path: 'video.mode', value: 'copy' },
        { op: 'eq' as const, path: 'video.mode', value: 'encode' },
      ],
    }
    expect(evaluateExpression(expr, ctx)).toBe(true)
  })

  it('evaluates "not" correctly', () => {
    const ctx = makeCtx()
    expect(evaluateExpression({ op: 'not', rule: { op: 'eq', path: 'video.mode', value: 'disabled' } }, ctx)).toBe(true)
  })

  it('evaluates "exists" correctly', () => {
    const ctx = makeCtx()
    expect(evaluateExpression({ op: 'exists', path: 'video.encoderId' }, ctx)).toBe(true)
    expect(evaluateExpression({ op: 'exists', path: 'nonexistent.field' }, ctx)).toBe(false)
  })
})

describe('Rule Engine — Invariants', () => {
  it('R01: video copy disables quality, resolution, framerate, burn', () => {
    const ctx = makeCtx({ video: { ...createDefaultProjectConfig().video, mode: 'copy' } })
    const ruleIndex = new RuleIndex()
    const result = evaluateRules(ruleIndex.getAll(), ctx)

    expect(result.fieldStates['section.video.quality']?.visible).toBe(false)
    expect(result.fieldStates['section.frame']?.visible).toBe(false)
    expect(result.fieldStates['section.subtitle.burn']?.visible).toBe(false)
  })

  it('R02: video disabled hides all video and burn', () => {
    const ctx = makeCtx({ video: { ...createDefaultProjectConfig().video, mode: 'disabled' } })
    const ruleIndex = new RuleIndex()
    const result = evaluateRules(ruleIndex.getAll(), ctx)

    expect(result.fieldStates['section.video']?.visible).toBe(false)
    expect(result.fieldStates['section.subtitle.burn']?.visible).toBe(false)
  })

  it('R03: audio copy disables quality params', () => {
    const ctx = makeCtx({ audio: { ...createDefaultProjectConfig().audio, mode: 'copy' } })
    const ruleIndex = new RuleIndex()
    const result = evaluateRules(ruleIndex.getAll(), ctx)

    expect(result.fieldStates['section.audio.quality']?.visible).toBe(false)
    expect(result.fieldStates['section.audio.channel']?.visible).toBe(false)
    expect(result.fieldStates['section.audio.samplerate']?.visible).toBe(false)
  })

  it('R04: audio disabled hides all audio', () => {
    const ctx = makeCtx({ audio: { ...createDefaultProjectConfig().audio, mode: 'disabled' } })
    const ruleIndex = new RuleIndex()
    const result = evaluateRules(ruleIndex.getAll(), ctx)

    expect(result.fieldStates['section.audio']?.visible).toBe(false)
  })

  it('R07: resolution change with copy produces error', () => {
    const ctx = makeCtx({
      video: { ...createDefaultProjectConfig().video, mode: 'copy' },
      frame: {
        resolution: { mode: 'size', width: 1920, height: 1080, keepAspect: true },
        frameRate: { mode: 'source' },
      },
    })
    const ruleIndex = new RuleIndex()
    const result = evaluateRules(ruleIndex.getAll(), ctx)

    const errors = result.messages.filter((m) => m.severity === 'error')
    expect(errors.some((e) => e.code === 'error.resolution.requires.encode')).toBe(true)
  })

  it('R08: subtitle burn with copy produces error', () => {
    const ctx = makeCtx({
      video: { ...createDefaultProjectConfig().video, mode: 'copy' },
      subtitle: {
        ...createDefaultProjectConfig().subtitle,
        burn: { ...createDefaultProjectConfig().subtitle.burn, enabled: true },
      },
    })
    const ruleIndex = new RuleIndex()
    const result = evaluateRules(ruleIndex.getAll(), ctx)

    const errors = result.messages.filter((m) => m.severity === 'error')
    expect(errors.some((e) => e.code === 'error.burn.requires.encode')).toBe(true)
  })

  it('R12: MP4 container suggests mov_text for subtitle tracks', () => {
    const ctx = makeCtx({ output: { ...createDefaultProjectConfig().output, containerId: 'mp4' } })
    const ruleIndex = new RuleIndex()
    const result = evaluateRules(ruleIndex.getAll(), ctx)

    expect(result.suggestions.some((s) => s.messageId === 'suggest.subtitle.movtext')).toBe(true)
  })

  it('R13: WebM container suggests webvtt for subtitle tracks', () => {
    const ctx = makeCtx({ output: { ...createDefaultProjectConfig().output, containerId: 'webm' } })
    const ruleIndex = new RuleIndex()
    const result = evaluateRules(ruleIndex.getAll(), ctx)

    expect(result.suggestions.some((s) => s.messageId === 'suggest.subtitle.webvtt')).toBe(true)
  })

  it('R15: WebM + libx264 produces error', () => {
    const ctx = makeCtx({
      output: { ...createDefaultProjectConfig().output, containerId: 'webm' },
      video: { ...createDefaultProjectConfig().video, encoderId: 'libx264' },
    })
    const ruleIndex = new RuleIndex()
    const result = evaluateRules(ruleIndex.getAll(), ctx)

    const errors = result.messages.filter((m) => m.severity === 'error')
    expect(errors.some((e) => e.code === 'error.webm.video.incompatible')).toBe(true)
  })

  it('R15b: WebM + AAC produces error', () => {
    const ctx = makeCtx({
      output: { ...createDefaultProjectConfig().output, containerId: 'webm' },
      audio: { ...createDefaultProjectConfig().audio, encoderId: 'aac' },
    })
    const ruleIndex = new RuleIndex()
    const result = evaluateRules(ruleIndex.getAll(), ctx)

    const errors = result.messages.filter((m) => m.severity === 'error')
    expect(errors.some((e) => e.code === 'error.webm.audio.incompatible')).toBe(true)
  })
})
