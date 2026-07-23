import { describe, expect, it } from 'vitest'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { renderBash } from '@ffcodec/domain/shell/bash-renderer'
import { resolveAudioSection } from '@ffcodec/domain/presentation/resolve-section'

const catalog = loadCatalog()

function commandFor(encoderId: string): string {
  const config = createDefaultProjectConfig()
  config.output.containerId = 'mkv'
  config.audio.encoderId = encoderId
  return renderBash(buildCommandPlan(config, catalog, [])).text
}

describe('平台、语音、旧格式与实验音频编码器', () => {
  it.each([
    'aac_at', 'alac_at', 'pcm_alaw_at', 'pcm_mulaw_at', 'ilbc_at',
    'opus', 'vorbis', 'dca', 'truehd', 'tta', 'real_144', 'mp2',
    'libtwolame', 'libopencore_amrnb', 'libvo_amrwbenc',
  ])('%s 已进入共享目录并生成正确 encoder', (encoderId) => {
    expect(catalog.encoders.audio[encoderId]).toBeDefined()
    expect(commandFor(encoderId)).toContain(`-c:a ${encoderId}`)
  })

  it('实验 encoder 自动附加 strict experimental', () => {
    for (const encoderId of ['opus', 'vorbis', 'dca', 'truehd']) {
      expect(commandFor(encoderId)).toContain('-strict experimental')
    }
  })

  it('选择器使用容器矩阵禁用不兼容 encoder', () => {
    const config = createDefaultProjectConfig()
    config.output.containerId = 'webm'
    const section = resolveAudioSection(config, catalog, {})
    const field = section.fields.find((candidate) => candidate.id === 'param.audio.encoder')
    expect(field?.options?.find((option) => option.value === 'libopus')?.compatibility).toBe('supported')
    expect(field?.options?.find((option) => option.value === 'ac3')?.compatibility).toBe('unsupported')
  })

  it('WAV 容器明确支持四种 PCM 选择', () => {
    const wav = catalog.containers.wav
    for (const encoderId of ['pcm_s16le', 'pcm_s32le', 'pcm_s64le', 'pcm_f64le']) {
      expect(wav.audioCodecs[encoderId]).toBe('supported')
    }
  })
})
