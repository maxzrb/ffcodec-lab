import { describe, expect, it } from 'vitest'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import {
  collectConfiguredVideoEncoderOptionGroups,
  collectConfiguredVideoEncoderOptions,
  collectRequiredVideoEncoders,
  collectVideoEncoderControlOptions,
} from '@ffcodec/domain/validation'

const catalog = loadCatalog()

describe('runtime FFmpeg capability requirements', () => {
  it('uses FFmpeg self-reported registration names rather than catalog ids', () => {
    const config = createDefaultProjectConfig()
    config.video.encoderId = 'h264_d3d12'

    expect(collectRequiredVideoEncoders(config, catalog)).toEqual([{
      encoderId: 'h264_d3d12',
      ffmpegName: 'h264_d3d12va',
      originId: 'param.video.encoder',
    }])
    expect(catalog.encoders.video.av1_d3d12.ffmpegName).toBe('av1_d3d12va')
    expect(catalog.encoders.video.prores_vulkan.ffmpegName).toBe('prores_ks_vulkan')
  })

  it('checks configured NVENC private options while ignoring generic bitrate options', () => {
    const config = createDefaultProjectConfig()
    config.video.encoderId = 'h264_nvenc'
    config.video.rateControl = {
      mode: 'vbr',
      bitrate: '5000k',
      maxRate: '8000k',
      bufferSize: '4000k',
      additionalValues: {},
    }
    config.video.specialParameters = { multipass: 'qres' }

    const options = collectConfiguredVideoEncoderOptions(config, catalog).map(({ option }) => option)
    expect(options).toContain('-rc')
    expect(options).toContain('-multipass')
    expect(options).not.toContain('-b')
    expect(options).not.toContain('-maxrate')
  })

  it('exposes private control ids for runtime UI filtering', () => {
    const config = createDefaultProjectConfig()
    config.video.encoderId = 'hevc_nvenc'
    const encoder = catalog.encoders.video.hevc_nvenc

    const requirements = collectVideoEncoderControlOptions(encoder, config)
    expect(requirements).toContainEqual({ option: '-multipass', originId: 'hevc_nvenc.multipass' })
  })

  it('groups per-stream private options by the encoder actually used', () => {
    const config = createDefaultProjectConfig()
    config.video.encoderId = 'h264_nvenc'
    config.video.rateControl = { mode: 'nvenc-cq', qualityValue: 23, additionalValues: {} }
    config.video.specialParameters = { multipass: 'fullres' }
    config.streams.preserveAllVideoStreams = false
    config.streams.videoStreams = [
      { index: 0, codecMode: 'encode', video: { encoderId: 'h264_nvenc', preset: 'p5' } },
      { index: 1, codecMode: 'encode', video: { encoderId: 'libx264', preset: 'slow' } },
    ]

    const groups = collectConfiguredVideoEncoderOptionGroups(config, catalog)
    const nvenc = groups.find(({ ffmpegName }) => ffmpegName === 'h264_nvenc')
    const x264 = groups.find(({ ffmpegName }) => ffmpegName === 'libx264')

    expect(nvenc?.requirements.map(({ option }) => option)).toEqual(expect.arrayContaining([
      '-preset', '-cq', '-rc', '-multipass',
    ]))
    expect(x264?.requirements.map(({ option }) => option)).toContain('-preset')
  })
})
