// ============================================================
// resolve-preset-summary — generates human-readable preset
// summaries from ProjectConfig + Catalog.
// Zero hardcoded encoder/container IDs.
// ============================================================

import type { ProjectConfig } from '../../domain/config/project-config'
import type { Catalog } from '../../domain/catalog/catalog-types'

export interface PresetSummary {
  /** One-line description of the video setup */
  video: string
  /** One-line description of the audio setup */
  audio: string
  /** Container extension */
  container: string
  /** Subtitle track count */
  subtitles: string
}

export function resolvePresetSummary(config: ProjectConfig, catalog: Catalog): PresetSummary {
  const video = resolveVideoSummary(config, catalog)
  const audio = resolveAudioSummary(config, catalog)
  const container = resolveContainerSummary(config, catalog)
  const subtitles = resolveSubtitleSummary(config)

  return { video, audio, container, subtitles }
}

function resolveVideoSummary(config: ProjectConfig, catalog: Catalog): string {
  if (config.video.mode === 'disabled') return '视频已禁用'
  if (config.video.mode === 'copy') return '视频流复制'

  const encoder = config.video.encoderId
    ? catalog.encoders.video[config.video.encoderId]
    : undefined
  const encLabel = encoder?.label ?? config.video.encoderId ?? '未知编码器'

  const rc = config.video.rateControl
  if (!rc) return encLabel

  const modeLabel = encoder?.qualityModes.find((m) => m.id === rc.mode)?.label ?? rc.mode

  if (rc.qualityValue !== undefined) {
    return `${encLabel} / ${modeLabel} ${rc.qualityValue}`
  }
  if (rc.bitrate) {
    return `${encLabel} / ${modeLabel} ${rc.bitrate}`
  }
  return `${encLabel} / ${modeLabel}`
}

function resolveAudioSummary(config: ProjectConfig, catalog: Catalog): string {
  if (config.audio.mode === 'disabled') return '音频已禁用'
  if (config.audio.mode === 'copy') return '音频流复制'

  const encoder = config.audio.encoderId
    ? catalog.encoders.audio[config.audio.encoderId]
    : undefined
  const encLabel = encoder?.label ?? config.audio.encoderId ?? '未知编码器'

  if (config.audio.bitrate) {
    return `${encLabel} ${config.audio.bitrate}`
  }
  return encLabel
}

function resolveContainerSummary(config: ProjectConfig, catalog: Catalog): string {
  const container = catalog.containers[config.output.containerId]
  return container ? `.${container.extension}` : config.output.containerId
}

function resolveSubtitleSummary(config: ProjectConfig): string {
  const count = config.subtitle.tracks.length
  if (count === 0) return '无字幕轨道'
  if (config.subtitle.burn.enabled) return `${count} 条轨道 + 烧录`
  return `${count} 条轨道`
}
