import type { ProjectConfig } from '@ffcodec/domain/config/project-config'

export interface ProbeStreamInfo {
  index: number
  codecType: 'video' | 'audio' | 'subtitle' | 'data' | 'attachment' | 'unknown'
  codecName?: string
  codecLongName?: string
  width?: number
  height?: number
  pixFmt?: string
  rFrameRate?: string
  avgFrameRate?: string
  sampleRate?: number
  channels?: number
  channelLayout?: string
  sampleFmt?: string
  duration?: number
  tags?: Record<string, string>
  profile?: string
}

export interface ProbeResult {
  streams: ProbeStreamInfo[]
  format?: {
    filename?: string
    formatName?: string
    formatLongName?: string
    duration?: number
    bitRate?: number
    size?: number
    tags?: Record<string, string>
  }
}

/** 将 ffprobe 的全局流序号转换为 FFmpeg v:N/a:N/s:N 使用的类型内序号。 */
function buildRelativeStreamMap(result: ProbeResult, codecType: 'video' | 'audio' | 'subtitle') {
  return result.streams
    .filter((stream) => stream.codecType === codecType)
    .map((_, index) => ({ index, codecMode: 'encode' as const }))
}

/** 返回目标大小工具使用的分钟数，优先采用容器总时长。 */
export function getProbeDurationMinutes(result: ProbeResult): number | null {
  const streamDurations = result.streams
    .map((stream) => stream.duration)
    .filter((duration): duration is number => (
      typeof duration === 'number' && Number.isFinite(duration) && duration > 0
    ))
  const seconds = Number.isFinite(result.format?.duration) && (result.format?.duration ?? 0) > 0
    ? result.format!.duration!
    : streamDurations.length > 0
      ? Math.max(...streamDurations)
      : null
  if (seconds === null) return null
  return Math.round((seconds / 60) * 10_000) / 10_000
}

/** 将探测到的各类型流写入流选择，目标大小时长由对应字段显式应用。 */
export function applyProbeStreamsToConfig(config: ProjectConfig, result: ProbeResult): ProjectConfig {
  const videoStreams = buildRelativeStreamMap(result, 'video')
  const audioStreams = buildRelativeStreamMap(result, 'audio')
  const subtitleStreams = buildRelativeStreamMap(result, 'subtitle')
  return {
    ...config,
    streams: {
      ...config.streams,
      preserveAllVideoStreams: videoStreams.length > 0
        ? false
        : config.streams.preserveAllVideoStreams,
      preserveAllAudioStreams: audioStreams.length > 0
        ? false
        : config.streams.preserveAllAudioStreams,
      preserveAllSubtitleStreams: false,
      videoStreams: videoStreams.length > 0 ? videoStreams : config.streams.videoStreams,
      audioStreams: audioStreams.length > 0 ? audioStreams : config.streams.audioStreams,
      subtitleStreams,
    },
  }
}
