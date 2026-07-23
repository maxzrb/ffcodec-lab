// ============================================================
// resolve-preset-summary — generates human-readable preset
// summaries from ProjectConfig + Catalog.
// Zero hardcoded encoder/container IDs.
// ============================================================

import type { ProjectConfig } from '@ffcodec/domain/config/project-config'
import type { Catalog } from '@ffcodec/domain/catalog/catalog-types'
import type { Locale } from '../i18n/i18n'
import { translateText } from '../i18n/i18n'

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

export function resolvePresetSummary(config: ProjectConfig, catalog: Catalog, locale: Locale = 'zh-CN'): PresetSummary {
  const video = resolveVideoSummary(config, catalog, locale)
  const audio = resolveAudioSummary(config, catalog, locale)
  const container = resolveContainerSummary(config, catalog)
  const subtitles = resolveSubtitleSummary(config, locale)

  return { video, audio, container, subtitles }
}

function resolveVideoSummary(config: ProjectConfig, catalog: Catalog, locale: Locale): string {
  if (config.video.mode === 'disabled') return locale === 'zh-CN' ? '视频已禁用' : 'Video disabled'
  if (config.video.mode === 'copy') return locale === 'zh-CN' ? '视频流复制' : 'Video stream copy'

  const encoder = config.video.encoderId
    ? catalog.encoders.video[config.video.encoderId]
    : undefined
  const encLabel = encoder?.label ?? config.video.encoderId ?? '未知编码器'

  const rc = config.video.rateControl
  if (!rc) return encLabel

  const modeLabel = translateText(encoder?.qualityModes.find((m) => m.id === rc.mode)?.label ?? rc.mode, locale)

  if (rc.qualityValue !== undefined) {
    return `${encLabel} / ${modeLabel} ${rc.qualityValue}`
  }
  if (rc.bitrate) {
    return `${encLabel} / ${modeLabel} ${rc.bitrate}`
  }
  return `${encLabel} / ${modeLabel}`
}

function resolveAudioSummary(config: ProjectConfig, catalog: Catalog, locale: Locale): string {
  if (config.audio.mode === 'disabled') return locale === 'zh-CN' ? '音频已禁用' : 'Audio disabled'
  if (config.audio.mode === 'copy') return locale === 'zh-CN' ? '音频流复制' : 'Audio stream copy'

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

function resolveSubtitleSummary(config: ProjectConfig, locale: Locale): string {
  const trackCount = config.subtitle.tracks.length
  const hasBurn = config.subtitle.burn.enabled
  const hasStreamSelection = config.streams.subtitleStreams.length > 0

  const parts: string[] = []

  if (hasStreamSelection) {
    const count = config.streams.subtitleStreams.length
    parts.push(locale === 'zh-CN' ? `保留 ${count} 条字幕流` : `${count} subtitle stream(s)`)
  }

  // Describe explicit tracks
  if (trackCount > 0) {
    parts.push(locale === 'zh-CN' ? `${trackCount} 条轨道` : `${trackCount} track(s)`)
  }

  // Burn
  if (hasBurn) {
    parts.push(locale === 'zh-CN' ? '烧录' : 'burn-in')
  }

  if (parts.length === 0) {
    return locale === 'zh-CN' ? '不保留字幕' : 'No subtitles'
  }
  return parts.join(' + ')
}
