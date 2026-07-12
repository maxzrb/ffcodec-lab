import { describe, expect, it } from 'vitest'
import { loadCatalog } from '../../domain/catalog/catalog-loader'
import { localizeExplanation, translateText } from '../../features/i18n/i18n'
import { createDefaultProjectConfig } from '../../domain/config/defaults'
import {
  resolveAudioSection,
  resolveContainerSection,
  resolveCustomArgsSection,
  resolveFrameSection,
  resolveInputSection,
  resolveSubtitleSection,
  resolveVideoSection,
} from '../../domain/presentation/resolve-section'

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

  it('全部展开字段的标签、说明、禁用原因和选项都能显示为英文', () => {
    const fieldStates = {}
    const sections = []
    const base = createDefaultProjectConfig()
    sections.push(
      resolveInputSection(base, fieldStates),
      resolveFrameSection(base, fieldStates),
      resolveContainerSection(base, catalog, fieldStates),
      resolveCustomArgsSection(base),
    )

    const subtitleConfig = createDefaultProjectConfig()
    subtitleConfig.streams.preserveOtherSubtitleStreams = false
    subtitleConfig.subtitle.tracks = [{
      id: 'track-1', source: 'external', path: 'subtitle.srt', externalStreamIndex: 0,
      codecMode: 'transcode', codec: 'srt', sourceCodecKnown: true, language: 'eng', title: 'English',
      disposition: {},
    }]
    subtitleConfig.subtitle.burn.enabled = true
    sections.push(resolveSubtitleSection(subtitleConfig, catalog, fieldStates))

    for (const encoderId of Object.keys(catalog.encoders.video)) {
      const config = createDefaultProjectConfig()
      config.video.encoderId = encoderId
      sections.push(resolveVideoSection(config, catalog, fieldStates))
    }
    for (const encoderId of Object.keys(catalog.encoders.audio)) {
      const config = createDefaultProjectConfig()
      config.audio.encoderId = encoderId
      sections.push(resolveAudioSection(config, catalog, fieldStates))
    }

    const untranslated = sections.flatMap((section) => [
      { id: section.id, value: section.label },
      ...(section.description ? [{ id: section.id, value: section.description }] : []),
      ...section.fields.flatMap((field) => [
        { id: field.id, value: field.label },
        ...(field.description ? [{ id: field.id, value: field.description }] : []),
        ...(field.disabledReason ? [{ id: field.id, value: field.disabledReason }] : []),
        ...(field.options ?? []).flatMap((option) => [
          { id: field.id, value: option.label },
          ...(option.badge ? [{ id: field.id, value: option.badge }] : []),
        ]),
      ]),
    ])
      .map((entry) => ({ ...entry, translated: translateText(entry.value, 'en') }))
      .filter((entry) => containsChinese(entry.translated))

    expect(untranslated).toEqual([])
  })
})
