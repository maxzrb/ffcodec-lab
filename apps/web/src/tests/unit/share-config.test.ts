import { describe, expect, it } from 'vitest'
import { decodeConfigFromShare, encodeConfigToShare, toShareable } from '@ffcodec/workbench/features/sharing/share-codec'
import { shareableConfigSchema } from '@ffcodec/workbench/features/sharing/share-schema'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'

describe('Share config — encoding', () => {
  it('base64url-encodes a round-trippable configuration', () => {
    const config = createDefaultProjectConfig()
    config.video.encoderId = 'libx264'
    const result = encodeConfigToShare(config)
    expect(result.kind).toBe('hash')
    expect(result.value).toBeTruthy()
    const decoded = decodeConfigFromShare(result.value)
    expect(decoded.success).toBe(true)
    expect(decoded.config?.video.encoderId).toBe('libx264')
  })

  it('e2e round-trip across hash', () => {
    const config = createDefaultProjectConfig()
    config.video.encoderId = 'libx264'
    config.video.rateControl = { mode: 'crf', qualityValue: 23, bitrate: '', maxRate: '', bufferSize: '', additionalValues: {} }
    config.audio.encoderId = 'aac'
    config.output.containerId = 'mkv'
    const result = encodeConfigToShare(config)
    expect(result.kind).toBe('hash')
    const decoded = decodeConfigFromShare(result.value)
    expect(decoded.success).toBe(true)
    expect(decoded.config?.video.encoderId).toBe('libx264')
    expect(decoded.config?.audio.encoderId).toBe('aac')
    expect(decoded.config?.output.containerId).toBe('mkv')
  })

  it('toShareable strips input path and output path for privacy', () => {
    const config = {
      ...createDefaultProjectConfig(),
      input: { path: '/home/user/video.mkv', additionalInputs: [], decode: {} },
      output: { path: '/home/user/output.mp4', containerId: 'mp4', overwrite: false, hideBanner: false, outputSuffix: 'ffcodec' as const },
    }
    const shareable = toShareable(config)
    expect((shareable as Record<string, unknown>).input).toBeUndefined()
    const out = (shareable as Record<string, unknown>).o as Record<string, unknown> | undefined
    expect(out?.path).toBeUndefined()
  })

  it('分享包含自定义参数和滤镜表达式，完整保留', () => {
    const config = createDefaultProjectConfig()
    config.customArgs.videoFilters = ['hflip', 'eq=contrast=1.2']
    config.customArgs.audioFilters = ['volume=0.9']
    config.customArgs.videoArgs = ['-preset', 'p7']
    const result = encodeConfigToShare(config)
    const decoded = decodeConfigFromShare(result.value)
    expect(decoded.success).toBe(true)
    expect(decoded.config?.customArgs.videoFilters).toEqual(['hflip', 'eq=contrast=1.2'])
    expect(decoded.config?.customArgs.audioFilters).toEqual(['volume=0.9'])
    expect(decoded.config?.customArgs.videoArgs).toEqual(['-preset', 'p7'])
  })
})

describe('Share config — decoding', () => {
  it('migrates v2 to v4 without enabling pixel conversion', () => {
    const legacy = createDefaultProjectConfig() as unknown as Record<string, unknown>
    legacy.schemaVersion = 2
    const encoded = encodeConfigToShare(legacy as any)
    expect(encoded.kind).toBe('hash')
    const decoded = decodeConfigFromShare(encoded.value)
    expect(decoded.success).toBe(true)
  })

  it('rejects corrupted base64 input', () => {
    const decoded = decodeConfigFromShare('#!!!not-valid-base64!!!')
    expect(decoded.success).toBe(false)
    expect(decoded.error).toBeTruthy()
  })

  it('accepts raw JSON as input for imported .ffcodec-share.json files', () => {
    const config = createDefaultProjectConfig()
    config.video.encoderId = 'libx265'
    const result = encodeConfigToShare(config)
    expect(result.kind).toBe('hash')
    const decoded = decodeConfigFromShare(result.value)
    expect(decoded.success).toBe(true)
    expect(decoded.config?.video.encoderId).toBe('libx265')
  })

  it('decodes old-format links without customArgs or per-stream overrides', () => {
    // 从真实的 createDefaultProjectConfig 出发，encode 一次拿到完整 shareable，
    // 然后手动删除新增字段 c 和逐流覆写 video/audio，模拟 v1.7.1 旧链接
    const config = createDefaultProjectConfig()
    const shareable = toShareable(config)
    // 删除 v1.7.2 新增的字段
    delete (shareable as Record<string, unknown>).c
    const m = shareable.m as Record<string, unknown> | undefined
    if (m?.videoStreams) (m.videoStreams as Record<string, unknown>[]).forEach((s) => delete s.video)
    if (m?.audioStreams) (m.audioStreams as Record<string, unknown>[]).forEach((s) => delete s.audio)

    const parsed = shareableConfigSchema.safeParse(shareable)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.c).toBeDefined()
      expect(parsed.data.c.videoFilters).toEqual([])
      expect(parsed.data.m?.videoStreams?.[0].video).toBeUndefined()
    }
  })
})
