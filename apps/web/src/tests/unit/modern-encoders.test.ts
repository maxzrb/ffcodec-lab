import { describe, expect, it } from 'vitest'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { renderBash } from '@ffcodec/domain/shell/bash-renderer'

const catalog = loadCatalog()

function commandFor(encoderId: 'libaom_av1' | 'libvvenc', mode: 'crf' | 'vbr' | 'cqp') {
  const config = createDefaultProjectConfig()
  config.output.containerId = 'mkv'
  config.output.path = 'output.mkv'
  config.video.encoderId = encoderId
  config.video.preset = encoderId === 'libvvenc' ? 'medium' : 'auto'
  config.video.pixelFormat = encoderId === 'libvvenc' ? 'yuv420p10le' : 'auto'
  config.video.rateControl = {
    mode,
    qualityValue: 32,
    bitrate: '3000k',
    additionalValues: {},
  }
  return { config, render: () => renderBash(buildCommandPlan(config, catalog, [])).text }
}

describe('libaom-av1 与 libvvenc', () => {
  it('以官方 FFmpeg 名称注册，并记录构建依赖', () => {
    expect(catalog.encoders.video.libaom_av1.ffmpegName).toBe('libaom-av1')
    expect(catalog.encoders.video.libaom_av1.capabilityScope?.buildRequirements).toContain('--enable-libaom')
    expect(catalog.encoders.video.libvvenc.ffmpegName).toBe('libvvenc')
    expect(catalog.encoders.video.libvvenc.family).toBe('vvc')
    expect(catalog.encoders.video.libvvenc.capabilityScope?.buildRequirements).toContain('--enable-libvvenc')
  })

  it('libaom-av1 恒定质量生成 CRF、零目标码率和显式速度参数', () => {
    const { config, render } = commandFor('libaom_av1', 'crf')
    config.video.specialParameters = { cpuUsed: 5, rowMt: true }
    const command = render()
    expect(command).toContain('-c:v libaom-av1')
    expect(command).toContain('-b:v 0')
    expect(command).toContain('-crf 32')
    expect(command).toContain('-cpu-used 5')
    expect(command).toContain('-row-mt 1')
  })

  it('libvvenc 仅提供官方 10-bit 输入格式并生成 preset 与 QP', () => {
    const { render } = commandFor('libvvenc', 'cqp')
    const command = render()
    expect(catalog.encoders.video.libvvenc.pixelFormat?.options?.map((option) => option.value)).toEqual(['yuv420p10le'])
    expect(command).toContain('-c:v libvvenc')
    expect(command).toContain('-preset medium')
    expect(command).toContain('-pix_fmt yuv420p10le')
    expect(command).toContain('-qp 32')
  })

  it('可选参数在用户未设置时不自动写入命令', () => {
    const { render } = commandFor('libvvenc', 'cqp')
    const command = render()
    expect(command).not.toContain('-qpa')
    expect(command).not.toContain('-tier')
    expect(command).not.toContain('-period')
    expect(command).not.toContain('-vvenc-params')

    const opusConfig = createDefaultProjectConfig()
    opusConfig.audio.encoderId = 'libopus'
    const opusCommand = renderBash(buildCommandPlan(opusConfig, catalog, [])).text
    expect(opusCommand).not.toContain('-application')
    expect(opusCommand).not.toContain('-frame_duration')
  })
})
