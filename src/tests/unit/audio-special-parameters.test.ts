import { describe, expect, it } from 'vitest'
import { loadCatalog } from '../../domain/catalog/catalog-loader'
import { buildCommandPlan } from '../../domain/command/command-builder'
import { createDefaultProjectConfig } from '../../domain/config/defaults'
import { renderBash } from '../../domain/shell/bash-renderer'

const catalog = loadCatalog()

describe('音频特殊参数命令生成', () => {
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
})
