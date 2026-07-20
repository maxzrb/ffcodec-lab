import { describe, expect, it } from 'vitest'
import { loadCatalog } from '../../domain/catalog/catalog-loader'
import { buildCommandPlan } from '../../domain/command/command-builder'
import { createDefaultProjectConfig } from '../../domain/config/defaults'
import { resolveVideoAdvancedSection } from '../../domain/presentation/resolve-section'
import { resolveVideoSection } from '../../domain/presentation/resolve-section'
import { renderBash } from '../../domain/shell/bash-renderer'
import { isRawParameterDictionary, synchronizeVideoParameterDictionary } from '../../domain/catalog/parameter-dictionary'

// 与 resolve-section.ts 中的 GENERIC_CODEC_ARG_NAMES 保持一致
const GENERIC_CODEC_ARG_NAMES = new Set([
  '-g', '-bf', '-keyint_min', '-qmin', '-qmax', '-qcomp',
  '-refs', '-level', '-rc-lookahead', '-aq-strength', '-sc_threshold', '-threads',
])

const catalog = loadCatalog()

function configForEncoder(encoderId: string) {
  const config = createDefaultProjectConfig()
  const encoder = catalog.encoders.video[encoderId]
  const mode = encoder.qualityModes[0]
  config.video.encoderId = encoderId
  const preset = encoder.preset?.defaultValue
  const profile = encoder.profile?.defaultValue
  const tune = encoder.tune?.defaultValue
  const pixelFormat = encoder.pixelFormat?.defaultValue
  config.video.preset = typeof preset === 'string' || typeof preset === 'number' ? preset : undefined
  config.video.profile = typeof profile === 'string' ? profile : undefined
  config.video.tune = typeof tune === 'string' ? tune : undefined
  config.video.pixelFormat = typeof pixelFormat === 'string' ? pixelFormat : undefined
  config.video.rateControl = mode ? {
    mode: mode.id,
    qualityValue: 23,
    bitrate: '5000k',
    maxRate: '7000k',
    bufferSize: '10000k',
    additionalValues: {},
  } : undefined
  config.video.specialParameters = {}
  return config
}

describe('视频编码器高级参数统一契约', () => {
  it('40 个编码器都提供独立高级参数，空配置不会发射私有默认值', () => {
    const encoders = Object.values(catalog.encoders.video)
    expect(encoders).toHaveLength(40)

    for (const encoder of encoders) {
      expect(encoder.specialParameters.length, encoder.id).toBeGreaterThan(0)
      const config = configForEncoder(encoder.id)
      const section = resolveVideoAdvancedSection(config, catalog, {})
      const plan = buildCommandPlan(config, catalog, [])

      expect(section.id).toBe('section.encoder-private')
      const advancedControls = encoder.specialParameters
        .filter((control) => !isRawParameterDictionary(control))
        .filter((control) => !GENERIC_CODEC_ARG_NAMES.has(control.commandBinding?.argName ?? ''))
      expect(section.fields.length, encoder.id).toBe(advancedControls.length)
      expect(section.fields.every((field) => field.optional && field.value === '')).toBe(true)
      expect(plan.invocations[0].output.codecArgs.some((arg) => arg.id.startsWith('codec.special.'))).toBe(false)
    }
  })

  it('在视频编码栏保留各软件编码器附加参数文本框作为未收录选项的补充入口', () => {
    const rawFields = [
      ['libx264', 'libx264.x264params'],
      ['libx265', 'libx265.x265params'],
      ['libsvtav1', 'libsvtav1.svtav1params'],
      ['libaom_av1', 'libaom_av1.aom_params'],
      ['libvvenc', 'libvvenc.params'],
    ] as const

    for (const [encoderId, fieldId] of rawFields) {
      const config = configForEncoder(encoderId)
      const section = resolveVideoSection(config, catalog, {})
      const advancedSection = resolveVideoAdvancedSection(config, catalog, {})
      const field = section.fields.find((candidate) => candidate.id === fieldId)
      expect(field, `${encoderId}/${fieldId}`).toBeDefined()
      expect(field?.controlType).toBe('text')
      expect(field?.optional).toBe(true)
      expect(advancedSection.fields.some((candidate) => candidate.id === fieldId)).toBe(false)
    }
  })

  it('SVT-AV1 字典文本与结构化控件保持双向同步', () => {
    const encoder = catalog.encoders.video.libsvtav1
    let config = configForEncoder('libsvtav1')
    config.video.specialParameters = { svtav1Params: 'tune=0', filmGrain: 4, filmGrainDenoise: true }

    config = synchronizeVideoParameterDictionary(config, encoder, 'libsvtav1.filmGrain')
    expect(config.video.specialParameters.svtav1Params).toBe('tune=0:film-grain=4:film-grain-denoise=1')

    config.video.specialParameters.svtav1Params = 'tune=0:film-grain=7:film-grain-denoise=0'
    config = synchronizeVideoParameterDictionary(config, encoder, 'libsvtav1.svtav1params')
    expect(config.video.specialParameters.filmGrain).toBe(7)
    expect(config.video.specialParameters.filmGrainDenoise).toBe(false)
  })

  it('SVT-AV1 结构化参数与自由文本合并为唯一字典，结构化值覆盖同名文本键', () => {
    const config = configForEncoder('libsvtav1')
    config.video.specialParameters = {
      svtav1Params: 'tune=0:film-grain=2:film-grain-denoise=0',
      filmGrain: 4,
      filmGrainDenoise: true,
    }

    const text = renderBash(buildCommandPlan(config, catalog, [])).text
    expect(text.split('-svtav1-params').length - 1).toBe(1)
    expect(text).toContain("-svtav1-params 'tune=0:film-grain=4:film-grain-denoise=1'")
    expect(text).not.toContain('film-grain=2')
  })

  it('SVT-AV1 Film Grain 控件包含范围、可选语义和官方说明', () => {
    const encoder = catalog.encoders.video.libsvtav1
    const filmGrain = encoder.specialParameters.find((control) => control.id === 'libsvtav1.filmGrain')
    const denoise = encoder.specialParameters.find((control) => control.id === 'libsvtav1.filmGrainDenoise')

    expect(filmGrain?.range).toEqual({ min: 0, max: 50, step: 1 })
    expect(filmGrain?.optional).toBe(true)
    expect(filmGrain?.commandBinding?.dictionary?.key).toBe('film-grain')
    expect(denoise?.commandBinding?.dictionary?.key).toBe('film-grain-denoise')
    expect(catalog.explanations['expl.libsvtav1.filmGrain'].sourceRefs[0].sourceType).toBe('encoder-official')
  })
})
