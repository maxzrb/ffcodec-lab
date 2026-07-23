// ============================================================
// MediaProbePanel — ffprobe 媒体探针面板。
// 位于流选择卡片上方；无 ffprobe 时禁用并显示提示。
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useBuilderStore, useI18n } from '@ffcodec/workbench'

// -- 探针结果类型（与主进程 probe-media.ts 保持同步） --

interface ProbeStreamInfo {
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

interface ProbeResult {
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

// -- helpers --

function formatDuration(seconds: number | undefined): string {
  if (seconds === undefined || !Number.isFinite(seconds)) return '-'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatBitRate(bps: number | undefined): string {
  if (!bps || !Number.isFinite(bps)) return '-'
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(1)} Mbps`
  return `${Math.round(bps / 1000)} kbps`
}

function formatFileSize(bytes: number | undefined): string {
  if (!bytes || !Number.isFinite(bytes)) return '-'
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(2)} GiB`
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MiB`
  return `${Math.round(bytes / 1024)} KiB`
}

function parseFraction(frac: string | undefined): number | null {
  if (!frac) return null
  const [n, d = '1'] = frac.split('/')
  const num = Number(n)
  const den = Number(d)
  return Number.isFinite(num) && Number.isFinite(den) && den > 0 ? num / den : null
}

function codecLabel(info: ProbeStreamInfo): string {
  if (info.codecType === 'video') {
    const res = info.width && info.height ? `${info.width}x${info.height}` : ''
    const fps = parseFraction(info.rFrameRate ?? info.avgFrameRate)
    const fpsStr = fps ? ` ${fps.toFixed(2)}fps` : ''
    return `${info.codecLongName ?? info.codecName ?? 'Unknown'}${res ? ` | ${res}` : ''}${fpsStr}`
  }
  if (info.codecType === 'audio') {
    const sr = info.sampleRate ? `${(info.sampleRate / 1000).toFixed(1)}kHz` : ''
    const ch = info.channels ? `${info.channels}ch` : ''
    const layout = info.channelLayout ? ` (${info.channelLayout})` : ''
    return `${info.codecLongName ?? info.codecName ?? 'Unknown'}${sr ? ` | ${sr}` : ''}${ch ? ` | ${ch}${layout}` : ''}`
  }
  return info.codecLongName ?? info.codecName ?? 'Unknown'
}

// -- component --

export function MediaProbePanel() {
  const { locale } = useI18n()
  const config = useBuilderStore((s) => s.config)
  const inputPath = config.input.path

  const [tools, setTools] = useState<{ ffmpeg: boolean; ffprobe: boolean; ffplay: boolean } | null>(null)
  const [probeResult, setProbeResult] = useState<ProbeResult | null>(null)
  const [probing, setProbing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  // 启动时检测 ffprobe 是否可用
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const customPath = localStorage.getItem('ffcodec-desktop-ffmpeg-path')?.trim() || undefined
        const info = await window.electronAPI?.getFFmpegToolsInfo(customPath)
        if (!cancelled && info) setTools({ ffmpeg: info.ffmpeg, ffprobe: info.ffprobe, ffplay: info.ffplay })
      } catch {
        // 忽略——工具检测失败不影响主功能。
      }
    })()
    return () => { cancelled = true }
  }, [])

  // 在当前 ffmpeg 路径变动时重新检测
  const checkTools = useCallback(async (customPath?: string) => {
    try {
      const info = await window.electronAPI?.getFFmpegToolsInfo(customPath)
      if (info) setTools({ ffmpeg: info.ffmpeg, ffprobe: info.ffprobe, ffplay: info.ffplay })
    } catch { /* ignore */ }
  }, [])

  const handleProbe = useCallback(async () => {
    if (!inputPath || !inputPath.trim()) return
    setError(null)
    setProbing(true)
    setProbeResult(null)

    try {
      const customPath = localStorage.getItem('ffcodec-desktop-ffmpeg-path')?.trim()
      const ffmpegInfo = await window.electronAPI?.detectFFmpeg(customPath || undefined)
      if (!ffmpegInfo?.found || !ffmpegInfo.path) {
        setError(locale === 'zh-CN' ? '未检测到 FFmpeg，无法使用 ffprobe。' : 'FFmpeg not detected, cannot run ffprobe.')
        return
      }

      await checkTools(customPath || undefined)

      const result = await window.electronAPI?.probeMedia(ffmpegInfo.path, inputPath)
      if (!result) {
        setError(locale === 'zh-CN' ? 'ffprobe 探测失败，请确认输入文件路径正确且可访问。' : 'ffprobe probe failed. Verify the input file path is correct and accessible.')
        return
      }
      setProbeResult(result as unknown as ProbeResult)
      setExpanded(true)
    } catch (err: unknown) {
      setError(String(err instanceof Error ? err.message : err))
    } finally {
      setProbing(false)
    }
  }, [inputPath, locale, checkTools])

  const ffprobeAvailable = tools?.ffprobe === true
  const hasInput = inputPath && inputPath.trim().length > 0

  const zh = locale === 'zh-CN'

  const videoStreams = probeResult?.streams.filter((s) => s.codecType === 'video') ?? []
  const audioStreams = probeResult?.streams.filter((s) => s.codecType === 'audio') ?? []
  const subtitleStreams = probeResult?.streams.filter((s) => s.codecType === 'subtitle') ?? []
  const otherStreams = probeResult?.streams.filter((s) => !['video', 'audio', 'subtitle'].includes(s.codecType)) ?? []

  return (
    <div className="media-probe-panel">
      <div className="media-probe-panel__header">
        <span className="media-probe-panel__title">
          {zh ? '媒体信息探测' : 'Media Probe'}
        </span>
        <span className="media-probe-panel__status">
          {tools === null ? (
            <span className="media-probe-panel__status-checking">
              {zh ? '检测中...' : 'Checking...'}
            </span>
          ) : ffprobeAvailable ? (
            <span className="media-probe-panel__status-ok" title={zh ? 'ffprobe 可用' : 'ffprobe available'}>
              ffprobe OK
            </span>
          ) : (
            <span className="media-probe-panel__status-missing" title={zh ? 'ffprobe 不可用，请将 ffprobe 放在 ffmpeg 同目录下。' : 'ffprobe not found. Place ffprobe in the same directory as ffmpeg.'}>
              {zh ? '未检测到 ffprobe' : 'ffprobe not found'}
            </span>
          )}
        </span>
      </div>

      {!ffprobeAvailable && tools !== null && (
        <div className="media-probe-panel__notice">
          {zh
            ? 'ffprobe 未在 ffmpeg 同目录中找到。请将 ffprobe.exe 放在 ffmpeg.exe 所在目录下以启用媒体信息探测。'
            : 'ffprobe was not found alongside ffmpeg. Place ffprobe.exe in the same directory as ffmpeg.exe to enable media probing.'}
        </div>
      )}

      <div className="media-probe-panel__actions">
        <button
          type="button"
          className="button media-probe-panel__probe-btn"
          disabled={!ffprobeAvailable || !hasInput || probing}
          onClick={handleProbe}
        >
          {probing
            ? (zh ? '探测中...' : 'Probing...')
            : (zh ? '探测当前输入文件' : 'Probe Input File')}
        </button>
        {!hasInput && (
          <span className="media-probe-panel__hint">
            {zh ? '请先填写输入文件路径' : 'Enter an input file path first'}
          </span>
        )}
      </div>

      {error && (
        <div className="media-probe-panel__error">
          {error}
        </div>
      )}

      {probeResult && (
        <div className="media-probe-panel__result">
          <button
            type="button"
            className="media-probe-panel__toggle"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▾' : '▸'} {zh ? '探测结果' : 'Probe Results'}
            <span className="media-probe-panel__summary">
              {probeResult.format?.formatName
                ? ` | ${probeResult.format.formatName}`
                : ''}
              {probeResult.format?.duration
                ? ` | ${formatDuration(probeResult.format.duration)}`
                : ''}
              {` | ${videoStreams.length}V / ${audioStreams.length}A / ${subtitleStreams.length}S`}
              {probeResult.format?.bitRate
                ? ` | ${formatBitRate(probeResult.format.bitRate)}`
                : ''}
            </span>
          </button>

          {expanded && (
            <div className="media-probe-panel__streams">
              {probeResult.format && (
                <div className="media-probe-panel__format-info">
                  <div className="media-probe-panel__format-row">
                    <span className="media-probe-panel__format-key">{zh ? '格式' : 'Format'}</span>
                    <span>{probeResult.format.formatLongName ?? probeResult.format.formatName ?? '-'}</span>
                  </div>
                  <div className="media-probe-panel__format-row">
                    <span className="media-probe-panel__format-key">{zh ? '时长' : 'Duration'}</span>
                    <span>{formatDuration(probeResult.format.duration)}</span>
                  </div>
                  <div className="media-probe-panel__format-row">
                    <span className="media-probe-panel__format-key">{zh ? '码率' : 'Bitrate'}</span>
                    <span>{formatBitRate(probeResult.format.bitRate)}</span>
                  </div>
                  <div className="media-probe-panel__format-row">
                    <span className="media-probe-panel__format-key">{zh ? '大小' : 'Size'}</span>
                    <span>{formatFileSize(probeResult.format.size)}</span>
                  </div>
                </div>
              )}

              {videoStreams.length > 0 && (
                <div className="media-probe-panel__stream-group">
                  <div className="media-probe-panel__stream-group-title">
                    {zh ? '视频流' : 'Video Streams'} ({videoStreams.length})
                  </div>
                  {videoStreams.map((s) => (
                    <div key={`v-${s.index}`} className="media-probe-panel__stream-item">
                      <span className="media-probe-panel__stream-index">#{s.index}</span>
                      <span className="media-probe-panel__stream-detail">
                        {codecLabel(s)}
                        {s.pixFmt ? ` | ${s.pixFmt}` : ''}
                        {s.profile ? ` | ${s.profile}` : ''}
                      </span>
                      {s.tags?.language && (
                        <span className="media-probe-panel__stream-tag">{s.tags.language}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {audioStreams.length > 0 && (
                <div className="media-probe-panel__stream-group">
                  <div className="media-probe-panel__stream-group-title">
                    {zh ? '音频流' : 'Audio Streams'} ({audioStreams.length})
                  </div>
                  {audioStreams.map((s) => (
                    <div key={`a-${s.index}`} className="media-probe-panel__stream-item">
                      <span className="media-probe-panel__stream-index">#{s.index}</span>
                      <span className="media-probe-panel__stream-detail">
                        {codecLabel(s)}
                        {s.sampleFmt ? ` | ${s.sampleFmt}` : ''}
                      </span>
                      {s.tags?.language && (
                        <span className="media-probe-panel__stream-tag">{s.tags.language}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {subtitleStreams.length > 0 && (
                <div className="media-probe-panel__stream-group">
                  <div className="media-probe-panel__stream-group-title">
                    {zh ? '字幕流' : 'Subtitle Streams'} ({subtitleStreams.length})
                  </div>
                  {subtitleStreams.map((s) => (
                    <div key={`s-${s.index}`} className="media-probe-panel__stream-item">
                      <span className="media-probe-panel__stream-index">#{s.index}</span>
                      <span className="media-probe-panel__stream-detail">{codecLabel(s)}</span>
                      {s.tags?.language && (
                        <span className="media-probe-panel__stream-tag">{s.tags.language}</span>
                      )}
                      {s.tags?.title && (
                        <span className="media-probe-panel__stream-tag">{s.tags.title}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {otherStreams.length > 0 && (
                <div className="media-probe-panel__stream-group">
                  <div className="media-probe-panel__stream-group-title">
                    {zh ? '其他流' : 'Other Streams'} ({otherStreams.length})
                  </div>
                  {otherStreams.map((s) => (
                    <div key={`o-${s.index}`} className="media-probe-panel__stream-item">
                      <span className="media-probe-panel__stream-index">#{s.index}</span>
                      <span className="media-probe-panel__stream-detail">
                        {s.codecType} | {s.codecName ?? '?'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {probeResult.streams.length === 0 && (
                <div className="media-probe-panel__empty">
                  {zh ? '文件中未检测到任何流。' : 'No streams detected in the file.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
