import { describe, expect, it } from 'vitest'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { renderBash } from '@ffcodec/domain/shell/bash-renderer'

const catalog = loadCatalog()

describe('音频特殊参数命令生成', () => {
  it('AAC NMR 与进阶参数按共享目录生成，NMR 速度受 coder 条件约束', () => {
    const config = createDefaultProjectConfig()
    config.audio.encoderId = 'aac'
    config.audio.qualityValues = {
      coder: 'twoloop',
      nmrSpeed: 3,
      ms: 1,
      is: 0,
      pns: 'auto',
      tns: 1,
      pce: 0,
    }

    let text = renderBash(buildCommandPlan(config, catalog, [])).text
    expect(text).toContain('-aac_coder twoloop')
    expect(text).not.toContain('-aac_nmr_speed')
    expect(text).toContain('-aac_ms 1')
    expect(text).toContain('-aac_is 0')
    expect(text).not.toContain('-aac_pns')
    expect(text).toContain('-aac_tns 1')
    expect(text).toContain('-aac_pce 0')

    config.audio.qualityValues.coder = 'nmr'
    text = renderBash(buildCommandPlan(config, catalog, [])).text
    expect(text).toContain('-aac_coder nmr')
    expect(text).toContain('-aac_nmr_speed 3')
  })

  it('AAC 目录不再提供已删除的 anmr，并包含完整 NMR 控件', () => {
    const aac = catalog.encoders.audio.aac
    const coder = aac.specialParameters.find((control) => control.id === 'aac.coder')
    expect(coder?.options?.map((option) => option.value)).toEqual(['auto', 'twoloop', 'fast', 'nmr'])
    expect(aac.specialParameters.some((control) => control.id === 'aac.nmrSpeed')).toBe(true)
    expect(aac.specialParameters.map((control) => control.commandBinding?.argName)).toEqual(
      expect.arrayContaining(['-aac_ms', '-aac_is', '-aac_pns', '-aac_tns', '-aac_pce']),
    )
  })

  it('libopus 复选框值会映射为 on/off，并保留其他特殊参数', () => {
    const config = createDefaultProjectConfig()
    config.audio.encoderId = 'libopus'
    config.audio.qualityValues = {
      vbr: false,
      application: 'voip',
      frameDuration: 40,
    }

    const disabledText = renderBash(buildCommandPlan(config, catalog, [])).text
    expect(disabledText).toContain('-vbr off')
    expect(disabledText).toContain('-application voip')
    expect(disabledText).toContain('-frame_duration 40')

    config.audio.qualityValues.vbr = true
    const enabledText = renderBash(buildCommandPlan(config, catalog, [])).text
    expect(enabledText).toContain('-vbr on')
  })

  it('FLAC 所有特殊参数都通过稳定配置键生成', () => {
    const config = createDefaultProjectConfig()
    config.audio.encoderId = 'flac'
    config.audio.qualityValues = {
      compressionLevel: 8,
      sampleFormat: 's24',
    }

    const text = renderBash(buildCommandPlan(config, catalog, [])).text
    expect(text).toContain('-compression_level 8')
    expect(text).toContain('-sample_fmt s24')
  })

  it('loudnorm 只发射独立启用的目标，并明确使用单遍动态模式', () => {
    const config = createDefaultProjectConfig()
    config.audio.loudnessNormalization = {
      integratedLoudnessEnabled: true,
      integratedLoudness: -16,
      loudnessRangeEnabled: false,
      loudnessRange: 7,
      truePeakEnabled: true,
      truePeak: -1,
      dualMono: true,
    }

    const text = renderBash(buildCommandPlan(config, catalog, [])).text
    expect(text).toContain('-filter:a')
    expect(text).toContain('loudnorm=I=-16:TP=-1:linear=false:dual_mono=true')
    expect(text).not.toContain('LRA=')

    config.audio.loudnessNormalization.integratedLoudnessEnabled = false
    config.audio.loudnessNormalization.truePeakEnabled = false
    expect(renderBash(buildCommandPlan(config, catalog, [])).text).not.toContain('loudnorm=')
  })
})
