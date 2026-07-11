import { describe, expect, it } from 'vitest'
import { addSubtitleTrack, removeSubtitleTrack } from '../../domain/config/project-actions'
import { createDefaultProjectConfig } from '../../domain/config/defaults'
import { loadCatalog } from '../../domain/catalog/catalog-loader'
import { buildCommandPlan } from '../../domain/command/command-builder'
import { flattenInvocation } from '../../domain/command/argument-order'
import { decodeConfigFromShare, encodeConfigToShare } from '../../features/sharing/share-codec'

const catalog = loadCatalog()

describe('成品功能闭环', () => {
  it('字幕轨道可添加并按 ID 删除', () => {
    const original = createDefaultProjectConfig()
    const withTrack = addSubtitleTrack(original)
    expect(original.subtitle.tracks).toHaveLength(0)
    expect(withTrack.subtitle.tracks).toHaveLength(1)
    expect(withTrack.subtitle.tracks[0].id).toBe('track-1')

    const removed = removeSubtitleTrack(withTrack, 'track-1')
    expect(removed.subtitle.tracks).toHaveLength(0)
  })

  it('流索引生成显式且可选的 map 选择器', () => {
    const config = createDefaultProjectConfig()
    config.streams.videoStreamIndex = 1
    config.streams.audioStreamIndex = 2
    config.streams.preserveOtherSubtitleStreams = false
    const tokens = flattenInvocation(buildCommandPlan(config, catalog, []).invocations[0]).map((item) => item.text)
    expect(tokens).toContain('0:v:1?')
    expect(tokens).toContain('0:a:2?')
  })

  it('六类自定义参数按 AST 阶段输出，tail 位于输出路径之后', () => {
    const config = createDefaultProjectConfig()
    config.customArgs = {
      globalArgs: ['-benchmark'],
      preInputArgs: ['-thread_queue_size', '1024'],
      videoArgs: ['-tag:v', 'avc1'],
      audioArgs: ['-metadata:s:a:0', 'language=zho'],
      preOutputArgs: ['-movflags', '+faststart'],
      tailArgs: ['-report'],
    }
    const tokens = flattenInvocation(buildCommandPlan(config, catalog, []).invocations[0]).map((item) => item.text)
    expect(tokens.indexOf('-benchmark')).toBeLessThan(tokens.indexOf('-i'))
    expect(tokens.indexOf('-thread_queue_size')).toBeLessThan(tokens.indexOf('-i'))
    expect(tokens).toContain('-tag:v')
    expect(tokens).toContain('-metadata:s:a:0')
    expect(tokens).toContain('-movflags')
    expect(tokens.indexOf('-report')).toBeGreaterThan(tokens.indexOf(config.output.path))
  })

  it('隐私安全分享保留高级滤镜与编码器专用参数', () => {
    const config = createDefaultProjectConfig()
    config.video.encoderId = 'h264_amf'
    config.video.specialParameters = { vbaq: true }
    config.audio.qualityValues = { profile: 'aac_low' }
    config.frame.filters!.crop.enabled = true
    config.frame.filters!.crop.width = 1280

    const encoded = encodeConfigToShare(config)
    expect(encoded.kind).toBe('hash')
    const decoded = decodeConfigFromShare(encoded.value)
    expect(decoded.success).toBe(true)
    expect(decoded.config?.video.specialParameters).toEqual({ vbaq: true })
    expect(decoded.config?.audio.qualityValues).toEqual({ profile: 'aac_low' })
    expect(decoded.config?.frame.filters?.crop.width).toBe(1280)
  })
})
