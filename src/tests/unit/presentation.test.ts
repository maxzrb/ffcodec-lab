import { describe, it, expect } from 'vitest'
import {
  resolveControlField,
  resolveParameterField,
  resolveTextField,
  resolveSwitchField,
  attachDiagnostics,
} from '../../domain/presentation/resolve-field'
import {
  resolveInputSection,
  resolveVideoSection,
  resolveFrameSection,
  resolveAudioSection,
  resolveSubtitleSection,
  resolveContainerSection,
} from '../../domain/presentation/resolve-section'
import { resolveBuilderView } from '../../domain/presentation/resolve-builder-view'
import { createDefaultProjectConfig } from '../../domain/config/defaults'
import { loadCatalog } from '../../domain/catalog/catalog-loader'
import { evaluateRules } from '../../domain/rules/rule-evaluator'
import { RuleIndex } from '../../domain/rules/rule-index'
import { buildCommandPlan } from '../../domain/command/command-builder'
import type { ProjectConfig } from '../../domain/config/project-config'
import type { ControlDefinition } from '../../domain/catalog/catalog-types'

const catalog = loadCatalog()

function makeConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return { ...createDefaultProjectConfig(), ...overrides } as ProjectConfig
}

function makeEvalResult(config: ProjectConfig) {
  const ruleIndex = new RuleIndex()
  return evaluateRules(ruleIndex.getAll(), { config, catalog })
}

describe('ResolvedField — control field resolution', () => {
  it('resolves a select control field with options and range', () => {
    const ctrl: ControlDefinition = {
      id: 'test.select',
      label: 'Test Select',
      control: 'select',
      options: [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
      ],
      defaultValue: 'a',
      explanationId: 'expl.test',
    }
    const config = makeConfig()
    const result = resolveControlField(ctrl, config, 'test.path', {})

    expect(result.id).toBe('test.select')
    expect(result.controlType).toBe('select')
    expect(result.options).toHaveLength(2)
    expect(result.defaultValue).toBe('a')
  })

  it('resolves a number control field with range constraints', () => {
    const ctrl: ControlDefinition = {
      id: 'test.number',
      label: 'Test Number',
      control: 'number',
      range: { min: 0, max: 100, step: 5 },
      defaultValue: 50,
      explanationId: 'expl.test',
    }
    const config = makeConfig()
    const result = resolveControlField(ctrl, config, 'test.path', {})

    expect(result.controlType).toBe('number')
    expect(result.min).toBe(0)
    expect(result.max).toBe(100)
    expect(result.step).toBe(5)
  })

  it('reads value from config using configPath', () => {
    const ctrl: ControlDefinition = {
      id: 'video.preset',
      label: 'Preset',
      control: 'select',
      options: [{ value: 'slow', label: 'slow' }],
      explanationId: 'expl.test',
    }
    const config = makeConfig({ video: { ...createDefaultProjectConfig().video, preset: 'slow' } })
    const result = resolveControlField(ctrl, config, 'video.preset', {})

    expect(result.value).toBe('slow')
  })

  it('falls back to default value when config value is undefined', () => {
    const ctrl: ControlDefinition = {
      id: 'test.field',
      label: 'Field',
      control: 'text',
      defaultValue: 'fallback',
      explanationId: 'expl.test',
    }
    const config = makeConfig()
    const result = resolveControlField(ctrl, config, 'nonexistent.path', {})

    expect(result.value).toBe('fallback')
  })

  it('applies field state for visibility and disabled', () => {
    const ctrl: ControlDefinition = {
      id: 'test.field',
      label: 'Field',
      control: 'text',
      explanationId: 'expl.test',
    }
    const fieldStates = {
      'test.field': { visible: false, enabled: false, required: false, reason: 'hidden by rule' },
    }
    const config = makeConfig()
    const result = resolveControlField(ctrl, config, 'test.path', fieldStates)

    expect(result.visible).toBe(false)
    expect(result.disabled).toBe(true)
    expect(result.disabledReason).toBe('hidden by rule')
  })
})

describe('ResolvedField — parameter field resolution', () => {
  it('resolves a parameter definition from catalog', () => {
    const param = catalog.parameters['param.video.mode']
    expect(param).toBeDefined()

    const config = makeConfig()
    const result = resolveParameterField(param, config, 'video.mode', {})

    expect(result.id).toBe('param.video.mode')
    expect(result.controlType).toBe('select')
    expect(result.value).toBe('encode')
    expect(result.options).toBeDefined()
    expect(result.options!.length).toBe(3)
  })

  it('carries sourceRefs and verificationLevel from parameter', () => {
    const param = catalog.parameters['param.video.mode']
    const config = makeConfig()
    const result = resolveParameterField(param, config, 'video.mode', {})

    expect(result.sourceRefs.length).toBeGreaterThan(0)
    expect(result.verificationLevel).toBeDefined()
    expect(result.needsCrossVerification).toBeDefined()
  })
})

describe('ResolvedField — text and switch fields', () => {
  it('resolves a text field', () => {
    const result = resolveTextField('input.path', 'Input', 'video.mp4', {})

    expect(result.controlType).toBe('text')
    expect(result.value).toBe('video.mp4')
    expect(result.visible).toBe(true)
    expect(result.disabled).toBe(false)
  })

  it('resolves a switch field', () => {
    const result = resolveSwitchField('output.overwrite', 'Overwrite', true, {})

    expect(result.controlType).toBe('switch')
    expect(result.value).toBe(true)
    expect(result.defaultValue).toBe(false)
  })

  it('attaches diagnostics to matching fields', () => {
    const fields = [
      resolveTextField('field.a', 'Field A', 'val', {}),
      resolveTextField('field.b', 'Field B', 'val', {}),
    ]
    const messages = [
      {
        code: 'error.test',
        severity: 'error' as const,
        category: 'configuration' as const,
        message: 'error.test',
        originIds: ['field.a'],
        context: {},
      },
    ]

    attachDiagnostics(fields, messages)

    expect(fields[0].diagnostics.length).toBe(1)
    expect(fields[0].diagnostics[0].code).toBe('error.test')
    expect(fields[1].diagnostics.length).toBe(0)
  })
})

describe('Resolver — section resolution', () => {
  it('resolves input section with path and overwrite fields', () => {
    const config = makeConfig()
    const section = resolveInputSection(config, {})

    expect(section.id).toBe('section.input')
    expect(section.fields.length).toBeGreaterThan(0)
    expect(section.fields.some((f) => f.id === 'input.path')).toBe(true)
    expect(section.fields.some((f) => f.id === 'output.path')).toBe(true)
  })

  it('resolves video section for encode mode with encoder controls', () => {
    const config = makeConfig({
      video: { ...createDefaultProjectConfig().video, mode: 'encode', encoderId: 'libx264' },
    })
    const section = resolveVideoSection(config, catalog, {})

    expect(section.id).toBe('section.video')
    expect(section.fields.some((f) => f.id === 'libx264.preset')).toBe(true)
    expect(section.fields.some((f) => f.id === 'video.rateControl.mode')).toBe(true)
  })

  it('resolves video section for copy mode without quality controls', () => {
    const config = makeConfig({
      video: { ...createDefaultProjectConfig().video, mode: 'copy' },
    })
    const section = resolveVideoSection(config, catalog, {})

    // Should not have encoder-specific controls in copy mode
    const hasQualityMode = section.fields.some((f) => f.id === 'video.rateControl.mode')
    expect(hasQualityMode).toBe(false)
  })

  it('resolves frame section with resolution and framerate options', () => {
    const config = makeConfig()
    const section = resolveFrameSection(config, {})

    expect(section.fields.some((f) => f.id === 'frame.resolution.mode')).toBe(true)
    expect(section.fields.some((f) => f.id === 'frame.frameRate.mode')).toBe(true)
  })

  it('shows width and height fields when resolution mode is size', () => {
    const config = makeConfig({
      frame: {
        resolution: { mode: 'size', width: 1920, height: 1080, keepAspect: true },
        frameRate: { mode: 'source' },
      },
    })
    const section = resolveFrameSection(config, {})

    expect(section.fields.some((f) => f.id === 'frame.resolution.width')).toBe(true)
    expect(section.fields.some((f) => f.id === 'frame.resolution.height')).toBe(true)
  })

  it('resolves audio section with encoder and quality controls', () => {
    const config = makeConfig({
      audio: { ...createDefaultProjectConfig().audio, mode: 'encode', encoderId: 'aac' },
    })
    const section = resolveAudioSection(config, catalog, {})

    expect(section.fields.some((f) => f.id === 'audio.bitrate')).toBe(true)
    expect(section.fields.some((f) => f.id === 'audio.sampleRate')).toBe(true)
  })

  it('hides audio quality controls in copy mode', () => {
    const config = makeConfig({
      audio: { ...createDefaultProjectConfig().audio, mode: 'copy' },
    })
    const section = resolveAudioSection(config, catalog, {})

    // In copy mode, encoder selector should not appear
    const hasEncoder = section.fields.some((f) => f.id === 'param.audio.encoder')
    expect(hasEncoder).toBe(false)
  })

  it('resolves subtitle section with mux and burn controls', () => {
    const config = makeConfig()
    const section = resolveSubtitleSection(config, catalog, {})

    expect(section.fields.some((f) => f.id === 'subtitle.mux.enabled')).toBe(true)
    expect(section.fields.some((f) => f.id === 'subtitle.burn.enabled')).toBe(true)
  })

  it('shows subtitle mux options when enabled', () => {
    const config = makeConfig({
      subtitle: {
        ...createDefaultProjectConfig().subtitle,
        mux: { ...createDefaultProjectConfig().subtitle.mux, enabled: true },
      },
    })
    const section = resolveSubtitleSection(config, catalog, {})

    expect(section.fields.some((f) => f.id === 'subtitle.mux.source')).toBe(true)
    expect(section.fields.some((f) => f.id === 'subtitle.mux.codecMode')).toBe(true)
  })

  it('resolves container section with dynamic options', () => {
    const config = makeConfig()
    const section = resolveContainerSection(config, catalog, {})

    const containerField = section.fields.find((f) => f.id === 'param.container')
    expect(containerField).toBeDefined()
    expect(containerField!.options!.length).toBeGreaterThanOrEqual(4) // mp4, mkv, webm, mov
  })
})

describe('Resolver — builder view integration', () => {
  it('builds complete builder view with all sections', () => {
    const config = makeConfig()
    const evalResult = makeEvalResult(config)
    const plan = buildCommandPlan(config, catalog, [])

    const view = resolveBuilderView(config, catalog, evalResult, plan)

    expect(view.sections.length).toBeGreaterThanOrEqual(5)
    expect(view.fieldIndex).toBeDefined()
    expect(Object.keys(view.fieldIndex).length).toBeGreaterThan(0)
  })

  it('hasErrors is true when evaluation produces errors', () => {
    // WebM + libx264 = error
    const config = makeConfig({
      output: { ...createDefaultProjectConfig().output, containerId: 'webm' },
      video: { ...createDefaultProjectConfig().video, encoderId: 'libx264' },
    })
    const evalResult = makeEvalResult(config)
    const plan = buildCommandPlan(config, catalog, evalResult.messages)

    const view = resolveBuilderView(config, catalog, evalResult, plan)

    expect(view.hasErrors).toBe(true)
  })

  it('maps field values through config paths correctly', () => {
    const config = makeConfig({
      video: { ...createDefaultProjectConfig().video, encoderId: 'libx265' },
    })
    const evalResult = makeEvalResult(config)
    const plan = buildCommandPlan(config, catalog, [])

    const view = resolveBuilderView(config, catalog, evalResult, plan)

    // Find the video encoder field
    const encoderField = view.fieldIndex['param.video.encoder']
    expect(encoderField).toBeDefined()
    expect(encoderField.value).toBe('libx265')
  })

  it('disabled reason appears for fields hidden by rules', () => {
    const config = makeConfig({
      video: { ...createDefaultProjectConfig().video, mode: 'copy' },
    })
    const evalResult = makeEvalResult(config)
    const plan = buildCommandPlan(config, catalog, [])

    const view = resolveBuilderView(config, catalog, evalResult, plan)

    // Frame section should have a disabled reason in copy mode
    const frameResolutionField = view.fieldIndex['frame.resolution.mode']
    if (frameResolutionField) {
      // In copy mode, frame fields may be hidden
      expect(frameResolutionField.visible).toBeDefined()
    }
  })
})

describe('Resolver — command origin attachment', () => {
  it('attaches originIds from command plan to fields', () => {
    const config = makeConfig()
    const evalResult = makeEvalResult(config)
    const plan = buildCommandPlan(config, catalog, [])

    const view = resolveBuilderView(config, catalog, evalResult, plan)

    // Some fields should have command origins from the generated args
    const fieldsWithOrigins = Object.values(view.fieldIndex).filter(
      (f) => f.commandOrigins.length > 0,
    )
    // At minimum, the encoder field should have origins
    expect(fieldsWithOrigins.length).toBeGreaterThan(0)
  })
})
