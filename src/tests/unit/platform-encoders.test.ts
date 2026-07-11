import { describe, expect, it } from 'vitest'
import { loadCatalog } from '../../domain/catalog/catalog-loader'
import { buildCommandPlan } from '../../domain/command/command-builder'
import { createDefaultProjectConfig } from '../../domain/config/defaults'
import { normalizeConfig } from '../../domain/normalization'
import { renderBash } from '../../domain/shell/bash-renderer'

const catalog = loadCatalog()

function renderEncoder(
  encoderId: string,
  mode: 'vbr' | 'cbr' | 'cqp',
  specialParameters: Record<string, unknown> = {},
): string {
  const config = createDefaultProjectConfig()
  config.video.encoderId = encoderId
  config.video.preset = encoderId.includes('amf') ? 'balanced' : 'auto'
  config.video.profile = 'auto'
  config.video.tune = 'auto'
  config.video.pixelFormat = 'auto'
  config.video.rateControl = {
    mode,
    bitrate: '6000k',
    maxRate: '9000k',
    bufferSize: '12000k',
    additionalValues: { qpI: 20, qpP: 22, qpB: 24 },
  }
  config.video.specialParameters = specialParameters
  return renderBash(buildCommandPlan(config, catalog, [])).text
}

describe('AMF 与 VideoToolbox 编码器', () => {
  it('注册四个具有正确平台分类的编码器', () => {
    expect(catalog.encoders.video.h264_amf.implementation).toBe('amd')
    expect(catalog.encoders.video.hevc_amf.implementation).toBe('amd')
    expect(catalog.encoders.video.h264_videotoolbox.implementation).toBe('apple')
    expect(catalog.encoders.video.hevc_videotoolbox.implementation).toBe('apple')
  })

  it('AMF VBR 生成官方 rc 模式与码率约束', () => {
    const command = renderEncoder('h264_amf', 'vbr', { vbaq: true, asyncDepth: 8 })
    expect(command).toContain('-c:v h264_amf')
    expect(command).toContain('-rc vbr_peak')
    expect(command).toContain('-b:v 6000k')
    expect(command).toContain('-maxrate 9000k')
    expect(command).toContain('-vbaq 1')
    expect(command).toContain('-async_depth 8')
  })

  it('AMF CQP 分别生成 I/P/B 帧量化参数', () => {
    const command = renderEncoder('hevc_amf', 'cqp')
    expect(command).toContain('-rc cqp')
    expect(command).toContain('-qp_i 20')
    expect(command).toContain('-qp_p 22')
    expect(command).toContain('-qp_b 24')
  })

  it('VideoToolbox CBR 生成 macOS 13+ 恒定码率开关', () => {
    const command = renderEncoder('hevc_videotoolbox', 'cbr', {
      realtime: true,
      powerEfficient: true,
    })
    expect(command).toContain('-c:v hevc_videotoolbox')
    expect(command).toContain('-constant_bit_rate 1')
    expect(command).toContain('-realtime 1')
    expect(command).toContain('-power_efficient 1')
  })

  it('编码器切换后目录默认值仍能生成完整码率参数', () => {
    const previous = createDefaultProjectConfig()
    const next = structuredClone(previous)
    next.video.encoderId = 'h264_amf'
    const normalized = normalizeConfig(previous, next, catalog).config
    const command = renderBash(buildCommandPlan(normalized, catalog, [])).text
    expect(command).toContain('-rc vbr_peak')
    expect(command).toContain('-b:v 6000k')
  })

  it('四个编码器在 MP4/MKV/MOV 中具有显式兼容性记录', () => {
    for (const containerId of ['mp4', 'mkv', 'mov']) {
      const codecs = catalog.containers[containerId].videoCodecs
      for (const encoderId of ['h264_amf', 'hevc_amf', 'h264_videotoolbox', 'hevc_videotoolbox']) {
        expect(codecs[encoderId]).toBe('supported')
      }
    }
  })
})
