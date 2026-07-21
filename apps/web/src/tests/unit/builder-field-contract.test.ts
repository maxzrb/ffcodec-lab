import { describe, expect, it } from 'vitest'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'
import { normalizeConfig } from '@ffcodec/domain/normalization'
import { applyFieldChange } from '@ffcodec/domain/presentation/apply-field-change'
import { resolveBuilderView } from '@ffcodec/domain/presentation/resolve-builder-view'
import { evaluateRules } from '@ffcodec/domain/rules/rule-evaluator'
import { RuleIndex } from '@ffcodec/catalog/rule-index'

const catalog = loadCatalog()
const rules = new RuleIndex()

function resolve(config: ProjectConfig) {
  const evaluation = evaluateRules(rules.getAll(), { config, catalog })
  const plan = buildCommandPlan(config, catalog, evaluation.messages)
  return resolveBuilderView(config, catalog, evaluation, plan)
}

function expectEveryEditableFieldWritable(config: ProjectConfig, scenario: string) {
  const view = resolve(config)
  const rejected = Object.values(view.fieldIndex)
    .filter((field) => field.visible && field.controlType !== 'section')
    .filter((field) => !applyFieldChange(field.id, field.value, view.fieldIndex).accepted)
    .map((field) => field.id)

  expect(rejected, scenario).toEqual([])
}

describe('正式页面字段写入契约', () => {
  it('所有视频编码器的可见控件都有有效写入路径', () => {
    const base = createDefaultProjectConfig()
    for (const encoderId of Object.keys(catalog.encoders.video)) {
      const requested: ProjectConfig = {
        ...base,
        video: { ...base.video, encoderId },
      }
      const config = normalizeConfig(base, requested, catalog).config
      expectEveryEditableFieldWritable(config, encoderId)
    }
  })

  it('所有音频编码器的可见控件都有有效写入路径', () => {
    const base = createDefaultProjectConfig()
    for (const encoderId of Object.keys(catalog.encoders.audio)) {
      const requested: ProjectConfig = {
        ...base,
        audio: { ...base.audio, encoderId },
      }
      const config = normalizeConfig(base, requested, catalog).config
      expectEveryEditableFieldWritable(config, encoderId)
    }
  })

  it('高级滤镜、字幕轨道、字幕样式和自定义参数全部可写', () => {
    const config = createDefaultProjectConfig()
    config.frame.filters!.crop.enabled = true
    config.frame.filters!.adjustment.enabled = true
    config.frame.filters!.deinterlace.enabled = true
    config.frame.filters!.sharpen.enabled = true
    config.subtitle.tracks = [{
      id: 'contract-track',
      source: 'external',
      path: 'subtitle.srt',
      externalStreamIndex: 0,
      codecMode: 'transcode',
      codec: 'mov_text',
      sourceCodecKnown: true,
      sourceCodec: 'srt',
      disposition: { default: true, forced: false, hearingImpaired: false },
    }]
    config.subtitle.burn.enabled = true
    config.subtitle.burn.externalPath = 'subtitle.ass'

    expectEveryEditableFieldWritable(config, '高级功能')
  })
})
