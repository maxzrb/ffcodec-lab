import { describe, expect, it } from 'vitest'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { normalizeConfig } from '@ffcodec/domain/normalization/normalize-config'

const catalog = loadCatalog()

function commandTokens(encoderId: string, values: Record<string, unknown>): string[] {
  const config = createDefaultProjectConfig()
  config.video.encoderId = encoderId
  config.video.specialParameters = values
  return buildCommandPlan(config, catalog, []).invocations[0].output.codecArgs.flatMap((arg) => arg.tokens)
}

describe('高级质量参数第二批', () => {
  it('默认配置不会自动发射任何第二批高级参数', () => {
    const tokens = commandTokens('libx264', {})
    for (const argument of ['-rc-lookahead', '-aq-strength', '-sc_threshold', '-refs', '-level']) {
      expect(tokens).not.toContain(argument)
    }
  })

  it('libx264 只发射用户显式设置的前瞻、AQ、场景切换、参考帧和 level', () => {
    const tokens = commandTokens('libx264', {
      rcLookahead: 40, aqStrength: 1.2, sceneThreshold: 40, refs: 4, level: '4.1',
    })
    expect(tokens).toEqual(expect.arrayContaining([
      '-rc-lookahead', '40', '-aq-strength', '1.2', '-sc_threshold', '40',
      '-refs', '4', '-level', '4.1',
    ]))
  })

  it('NVENC 与 AMF 参数只存在于适用编码器目录', () => {
    expect(catalog.encoders.video.h264_nvenc.specialParameters.some((item) => item.commandBinding?.argName === '-lookahead_level')).toBe(true)
    expect(catalog.encoders.video.h264_amf.specialParameters.some((item) => item.commandBinding?.argName === '-qvbr_quality_level')).toBe(true)
    expect(catalog.encoders.video.libx264.specialParameters.some((item) => item.commandBinding?.argName === '-lookahead_level')).toBe(false)
    expect(commandTokens('h264_nvenc', { aqStrength: 8, lookaheadLevel: 2 })).toEqual(expect.arrayContaining([
      '-aq-strength', '8', '-lookahead_level', '2',
    ]))
  })

  it('QSV extbrc 支持未设置、明确开启和明确关闭三态', () => {
    expect(commandTokens('h264_qsv', {})).not.toContain('-extbrc')
    expect(commandTokens('h264_qsv', { extbrc: true })).toEqual(expect.arrayContaining(['-extbrc', '1']))
    expect(commandTokens('h264_qsv', { extbrc: false })).toEqual(expect.arrayContaining(['-extbrc', '0']))
  })

  it('切换编码器会清理第二批特殊参数', () => {
    const previous = createDefaultProjectConfig()
    previous.video.encoderId = 'libx264'
    previous.video.specialParameters = { rcLookahead: 40, refs: 4 }
    const next = structuredClone(previous)
    next.video.encoderId = 'h264_nvenc'
    const result = normalizeConfig(previous, next, catalog)
    expect(result.config.video.specialParameters).toEqual({})
    expect(result.notices.some((notice) => notice.fieldId === 'video.specialParameters')).toBe(true)
  })
})
