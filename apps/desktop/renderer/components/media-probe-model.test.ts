import { describe, expect, it } from 'vitest'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'
import { applyProbeStreamsToConfig, getProbeDurationMinutes, type ProbeResult } from './media-probe-model'

const probeResult: ProbeResult = {
  streams: [
    { index: 0, codecType: 'video', duration: 121.5 },
    { index: 1, codecType: 'audio', duration: 121.4 },
    { index: 2, codecType: 'audio', duration: 121.4 },
    { index: 3, codecType: 'subtitle' },
  ],
  format: { duration: 121.5 },
}

function createConfig(): ProjectConfig {
  return {
    streams: {
      videoStreams: [{ index: 0, codecMode: 'encode' }],
      audioStreams: [{ index: 0, codecMode: 'encode' }],
      subtitleStreams: [],
      preserveAllVideoStreams: true,
      preserveAllAudioStreams: true,
      preserveAllSubtitleStreams: false,
    },
    tools: {
      targetSize: {
        enabled: false,
        targetMiB: 1024,
        durationMinutes: 90,
        overheadPercent: 3,
      },
    },
  } as unknown as ProjectConfig
}

describe('media probe config reuse', () => {
  it('把全局流序号转换为类型内序号', () => {
    const config = createConfig()
    const next = applyProbeStreamsToConfig(config, probeResult)

    expect(next.streams.videoStreams).toEqual([{ index: 0, codecMode: 'encode' }])
    expect(next.streams.audioStreams).toEqual([
      { index: 0, codecMode: 'encode' },
      { index: 1, codecMode: 'encode' },
    ])
    expect(next.streams.subtitleStreams).toEqual([{ index: 0, codecMode: 'encode' }])
    expect(next.tools.targetSize.durationMinutes).toBe(90)
  })

  it('从容器时长计算目标大小工具使用的分钟数', () => {
    expect(getProbeDurationMinutes(probeResult)).toBe(2.025)
  })

  it('容器时长缺失时采用最长流时长', () => {
    expect(getProbeDurationMinutes({
      streams: [
        { index: 0, codecType: 'video', duration: 60 },
        { index: 1, codecType: 'audio', duration: 61.2 },
      ],
    })).toBe(1.02)
  })
})
