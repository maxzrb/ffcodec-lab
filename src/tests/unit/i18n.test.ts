import { describe, expect, it } from 'vitest'
import { loadCatalog } from '../../domain/catalog/catalog-loader'
import { localizeExplanation, translateText } from '../../features/i18n/i18n'

const catalog = loadCatalog()
const containsChinese = (value: string) => /[一-龥]/.test(value)

describe('全局中英文切换', () => {
  it('全部目录控件标签和选项都能切换为英文', () => {
    const labels = new Set<string>()

    for (const parameter of Object.values(catalog.parameters)) {
      labels.add(parameter.label)
      parameter.optionsSource?.options?.forEach((option) => labels.add(option.label))
    }

    for (const encoders of [catalog.encoders.video, catalog.encoders.audio]) {
      for (const encoder of Object.values(encoders)) {
        labels.add(encoder.label)
        const controls = [
          encoder.preset,
          encoder.profile,
          encoder.tune,
          encoder.pixelFormat,
          ...encoder.specialParameters,
          ...encoder.qualityModes.flatMap((mode) => mode.controls),
        ].filter((control) => control !== undefined)
        encoder.qualityModes.forEach((mode) => labels.add(mode.label))
        controls.forEach((control) => {
          labels.add(control.label)
          control.options?.forEach((option) => labels.add(option.label))
        })
      }
    }

    const untranslated = [...labels]
      .map((label) => translateText(label, 'en'))
      .filter(containsChinese)
    expect(untranslated).toEqual([])
  })

  it('全部参数介绍都有不混入中文的英文版本', () => {
    const untranslated = Object.values(catalog.explanations)
      .map((explanation) => localizeExplanation(explanation, 'en'))
      .filter((explanation) => containsChinese([
        explanation.title,
        explanation.short,
        explanation.detail,
        ...(explanation.warnings ?? []),
      ].filter(Boolean).join(' ')))
      .map((explanation) => explanation.id)

    expect(untranslated).toEqual([])
  })

  it('关键通用介绍说明用途和取舍，而不是重复控件名称', () => {
    const videoEncoder = catalog.explanations['expl.param.video.encoder']
    const audioEncoder = catalog.explanations['expl.param.audio.encoder']

    expect(videoEncoder.short).toContain('压缩效率')
    expect(videoEncoder.short).toContain('播放兼容性')
    expect(audioEncoder.short).toContain('是否无损')
    expect(videoEncoder.short).not.toBe('选择重新编码时使用的视频编码器。')
  })
})
