import { describe, expect, it } from 'vitest'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { renderBash } from '@ffcodec/domain/shell/bash-renderer'

const catalog = loadCatalog()

function commandFor(encoderId: string, qualityValues: Record<string, unknown> = {}): string {
  const config = createDefaultProjectConfig()
  config.audio.encoderId = encoderId
  config.audio.qualityValues = qualityValues
  return renderBash(buildCommandPlan(config, catalog, [])).text
}

describe('核心音频编码器目录', () => {
  it.each([
    ['libfdk_aac', 'libfdk_aac'],
    ['libmp3lame', 'libmp3lame'],
    ['alac', 'alac'],
    ['ac3', 'ac3'],
    ['eac3', 'eac3'],
    ['wavpack', 'wavpack'],
    ['libvorbis', 'libvorbis'],
    ['pcm_s16le', 'pcm_s16le'],
    ['pcm_s32le', 'pcm_s32le'],
    ['pcm_s64le', 'pcm_s64le'],
    ['pcm_f64le', 'pcm_f64le'],
  ])('%s 生成正确 encoder 名', (encoderId, ffmpegName) => {
    expect(commandFor(encoderId)).toContain(`-c:a ${ffmpegName}`)
  })

  it('FDK profiles 复用同一 encoder，并仅在 LC 下发射 VBR', () => {
    expect(commandFor('libfdk_aac', { profile: 'aac_he' })).toContain('-profile:a aac_he')
    expect(commandFor('libfdk_aac', { profile: 'aac_he', vbr: 4 })).not.toContain('-vbr 4')
    const lc = commandFor('libfdk_aac', { profile: 'aac_low', vbr: 4 })
    expect(lc).toContain('-profile:a aac_low')
    expect(lc).toContain('-vbr 4')
  })

  it('无损和 PCM 编码器不发射无意义的音频码率', () => {
    for (const encoderId of ['flac', 'alac', 'wavpack', 'pcm_s16le', 'pcm_s32le', 'pcm_s64le', 'pcm_f64le']) {
      expect(commandFor(encoderId)).not.toContain('-b:a')
    }
  })

  it('WAV 64-bit 整数与浮点是两个明确 encoder', () => {
    expect(catalog.encoders.audio.pcm_s64le.label).toContain('integer')
    expect(catalog.encoders.audio.pcm_f64le.label).toContain('float')
  })
})
