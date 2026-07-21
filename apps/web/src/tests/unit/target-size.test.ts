import { describe, expect, it } from 'vitest'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { resolveBuilderView } from '@ffcodec/domain/presentation/resolve-builder-view'
import { evaluateRules } from '@ffcodec/domain/rules/rule-evaluator'
import { RuleIndex } from '@ffcodec/catalog/rule-index'
import { renderBash } from '@ffcodec/domain/shell/bash-renderer'
import { calculateTargetSize, parseBitrateKbps } from '@ffcodec/domain/tools/target-size'
import { validateConfig } from '@ffcodec/domain/validation/validate-config'

const catalog = loadCatalog()
const rules = new RuleIndex()

function makeEnabledConfig() {
  const config = createDefaultProjectConfig()
  config.tools.targetSize = {
    enabled: true,
    targetMiB: 700,
    durationMinutes: 90,
    overheadPercent: 3,
  }
  return config
}

describe('目标文件大小工具', () => {
  it('未启用时不改变原有单遍 CRF 命令', () => {
    const config = createDefaultProjectConfig()
    const calculation = calculateTargetSize(config, catalog)
    const rendered = renderBash(buildCommandPlan(config, catalog, []))

    expect(calculation.enabled).toBe(false)
    expect(rendered.text).toContain('-crf 23')
    expect(rendered.text).not.toContain('-pass 1')
  })

  it('根据 MiB、时长、预留和音频预算派生码率并生成正确双遍命令', () => {
    const config = makeEnabledConfig()
    const calculation = calculateTargetSize(config, catalog)
    const diagnostics = validateConfig(config, catalog, rules)
    const plan = buildCommandPlan(config, catalog, diagnostics)
    const rendered = renderBash(plan)

    expect(calculation.diagnostics).toEqual([])
    expect(calculation.audioBitrateKbps).toBe(192)
    expect(calculation.videoBitrateKbps).toBe(862)
    expect(plan.invocations).toHaveLength(2)
    expect(rendered.text).toContain('-b:v 862k')
    expect(rendered.text).not.toContain('-crf 23')
    expect(rendered.text).toContain('-f null -')
    expect(rendered.text).toContain(' && ')
  })

  it('关闭工具后恢复之前保存的质量控制设置', () => {
    const config = makeEnabledConfig()
    config.video.rateControl = { mode: 'crf', qualityValue: 19, additionalValues: {} }
    config.tools.targetSize.enabled = false
    const rendered = renderBash(buildCommandPlan(config, catalog, []))

    expect(rendered.text).toContain('-crf 19')
    expect(rendered.text).not.toContain('-pass')
  })

  it('多个显式音轨按每轨码率累加预算', () => {
    const config = makeEnabledConfig()
    config.streams.audioStreamIndexes = [0, 1]
    const calculation = calculateTargetSize(config, catalog)

    expect(calculation.audioStreamCount).toBe(2)
    expect(calculation.audioBitrateKbps).toBe(384)
    expect(calculation.videoBitrateKbps).toBe(670)
  })

  it('音频复制、无损音频和保留全部音轨要求手动总预算', () => {
    const cases = [
      { apply: (config: ReturnType<typeof makeEnabledConfig>) => { config.audio.mode = 'copy' }, code: 'error.targetSize.audio.copyUnknown' },
      { apply: (config: ReturnType<typeof makeEnabledConfig>) => { config.audio.encoderId = 'flac' }, code: 'error.targetSize.audio.bitrateUnknown' },
      { apply: (config: ReturnType<typeof makeEnabledConfig>) => { config.streams.preserveOtherAudioStreams = true }, code: 'error.targetSize.audio.streamCountUnknown' },
    ]

    for (const testCase of cases) {
      const config = makeEnabledConfig()
      testCase.apply(config)
      expect(calculateTargetSize(config, catalog).diagnostics.map((item) => item.code)).toContain(testCase.code)

      config.tools.targetSize.manualAudioBitrateKbps = 256
      const resolved = calculateTargetSize(config, catalog)
      expect(resolved.diagnostics.some((item) => item.severity === 'error')).toBe(false)
      expect(resolved.audioBitrateKbps).toBe(256)
    }
  })

  it('阻止视频复制、不支持双遍、多视频流和自定义码率冲突', () => {
    const config = makeEnabledConfig()
    config.video.mode = 'copy'
    config.video.encoderId = 'h264_nvenc'
    config.streams.videoStreamIndexes = [0, 1]
    config.customArgs.videoArgs = ['-b:v', '2M']

    const codes = calculateTargetSize(config, catalog).diagnostics.map((item) => item.code)
    expect(codes).toContain('error.targetSize.video.requiresEncode')
    expect(codes).toContain('error.targetSize.encoder.requiresTwoPass')
    expect(codes).toContain('error.targetSize.video.singleStream')
    expect(codes).toContain('error.targetSize.custom.conflict')
  })

  it('目标过小无法覆盖音频预算时给出错误', () => {
    const config = makeEnabledConfig()
    config.tools.targetSize.targetMiB = 5
    const result = calculateTargetSize(config, catalog)
    expect(result.diagnostics.map((item) => item.code)).toContain('error.targetSize.budget.exhausted')
    expect(result.videoBitrateKbps).toBeUndefined()
  })

  it('实用工具面板可见，并在启用时禁用原质量控制字段', () => {
    const config = makeEnabledConfig()
    const evaluation = evaluateRules(rules.getAll(), { config, catalog })
    evaluation.messages = validateConfig(config, catalog, rules)
    const plan = buildCommandPlan(config, catalog, evaluation.messages)
    const view = resolveBuilderView(config, catalog, evaluation, plan)

    expect(view.panels.some((panel) => panel.id === 'tools' && panel.label === '实用工具')).toBe(true)
    expect(view.fieldIndex['tools.targetSize.targetMiB']).toBeDefined()
    expect(view.fieldIndex['video.rateControl.mode'].disabled).toBe(true)
    expect(view.fieldIndex['video.rateControl.mode'].disabledReason).toContain('目标文件大小工具')
  })

  it('解析 FFmpeg 常见码率单位', () => {
    expect(parseBitrateKbps('192k')).toBe(192)
    expect(parseBitrateKbps('1.5M')).toBe(1500)
    expect(parseBitrateKbps('128000')).toBe(128)
    expect(parseBitrateKbps('invalid')).toBeUndefined()
  })
})
