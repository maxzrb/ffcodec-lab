// ============================================================
// MediaProbePanel — ffprobe 媒体探针面板。
// 使用与其他折叠卡片一致的 parameter-section 样式。
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

// -- persistent state (survives panel switching, cleared on app exit) --

let _tools: { ffmpeg: boolean; ffprobe: boolean; ffplay: boolean } | null = null
let _probeResult: ProbeResult | null = null
let _error: string | null = null
const _listeners = new Set<() => void>()

function usePersistentState<T>(key: 'tools' | 'probeResult' | 'error'): [T | null, (v: T | null) => void] {
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1)
    _listeners.add(listener)
    return () => { _listeners.delete(listener) }
  }, [])

  const value = (key === 'tools' ? _tools : key === 'probeResult' ? _probeResult : _error) as T | null
  const setValue = (v: T | null) => {
    if (key === 'tools') _tools = v as any
    else if (key === 'probeResult') _probeResult = v as any
    else _error = v as any
    _listeners.forEach((fn) => fn())
  }
  return [value, setValue]
}

// -- component --

export function MediaProbePanel() {
  const { locale } = useI18n()
  const config = useBuilderStore((s) => s.config)
  const setConfig = useBuilderStore((s) => s.setConfig)
  const inputPath = config.input.path

  const [tools, setTools] = usePersistentState<{ ffmpeg: boolean; ffprobe: boolean; ffplay: boolean }>('tools')
  const [probeResult, setProbeResult] = usePersistentState<ProbeResult>('probeResult')
  const [error, setError] = usePersistentState<string>('error')
  const [probing, setProbing] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [syncEnabled, setSyncEnabled] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const customPath = localStorage.getItem('ffcodec-desktop-ffmpeg-path')?.trim() || undefined
        const info = await window.electronAPI?.getFFmpegToolsInfo(customPath)
        if (!cancelled && info) setTools({ ffmpeg: info.ffmpeg, ffprobe: info.ffprobe, ffplay: info.ffplay })
      } catch { /* ignore */ }
    })()
    return () => { cancelled = true }
  }, [])

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

      // 联动：将探测到的流写入配置
      if (syncEnabled) {
        const data = result as unknown as ProbeResult
        const currentConfig = useBuilderStore.getState().config
        const vStreams = data.streams
          .filter((s) => s.codecType === 'video')
          .map((s) => ({ index: s.index, codecMode: 'encode' as const }))
        const aStreams = data.streams
          .filter((s) => s.codecType === 'audio')
          .map((s) => ({ index: s.index, codecMode: 'encode' as const }))
        const sStreams = data.streams
          .filter((s) => s.codecType === 'subtitle')
          .map((s) => ({ index: s.index, codecMode: 'encode' as const }))
        setConfig({
          ...currentConfig,
          streams: {
            ...currentConfig.streams,
            preserveAllVideoStreams: false,
            preserveAllAudioStreams: false,
            preserveAllSubtitleStreams: false,
            videoStreams: vStreams.length > 0 ? vStreams : currentConfig.streams.videoStreams,
            audioStreams: aStreams.length > 0 ? aStreams : currentConfig.streams.audioStreams,
            subtitleStreams: sStreams,
          },
        })
      }
    } catch (err: unknown) {
      setError(String(err instanceof Error ? err.message : err))
    } finally {
      setProbing(false)
    }
  }, [inputPath, locale, checkTools, syncEnabled])

  const ffprobeAvailable = tools?.ffprobe === true
  const hasInput = inputPath && inputPath.trim().length > 0
  const zh = locale === 'zh-CN'

  const videoStreams = probeResult?.streams.filter((s) => s.codecType === 'video') ?? []
  const audioStreams = probeResult?.streams.filter((s) => s.codecType === 'audio') ?? []
  const subtitleStreams = probeResult?.streams.filter((s) => s.codecType === 'subtitle') ?? []
  const otherStreams = probeResult?.streams.filter((s) => !['video', 'audio', 'subtitle'].includes(s.codecType)) ?? []

  const statusText = tools === null
    ? (zh ? '检测中...' : 'Checking...')
    : ffprobeAvailable
      ? 'ffprobe OK'
      : (zh ? '未检测到 ffprobe' : 'ffprobe not found')

  const probed = probeResult !== null
  const idle = !probed && !probing

  return (
    <section className="parameter-section">
      <div className="parameter-section__header">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="parameter-section__toggle"
          aria-expanded={expanded}
        >
          <span className={`parameter-section__chevron ${expanded ? 'parameter-section__chevron--open' : ''}`} aria-hidden="true">
            {'>'}
          </span>
          <span className="parameter-section__title">
            {zh ? '媒体信息探测' : 'Media Probe'}
          </span>
        </button>

        <div className="parameter-section__actions" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            className="button"
            disabled={!ffprobeAvailable || !hasInput || probing}
            onClick={handleProbe}
            style={{ fontSize: '12px', padding: '2px 10px' }}
          >
            {probing ? (zh ? '探测中...' : 'Probing...') : (zh ? '探测' : 'Probe')}
          </button>
          {probed && (
            <button
              type="button"
              className="button"
              onClick={() => { setProbeResult(null); setError(null) }}
              style={{ fontSize: '12px', padding: '2px 10px', marginLeft: 6 }}
            >
              {zh ? '清空' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      <div className={`parameter-section__body ${expanded ? 'parameter-section__body--expanded' : 'parameter-section__body--collapsed'}`}>
        <div className="parameter-section__body-inner">

          {/* 状态行 — ffprobe 可用性与探测摘要 */}
          <div className="media-probe-panel__status-line">
            <span className="media-probe-panel__status-meta">
              <span className={`media-probe-panel__status-badge ${tools !== null && !ffprobeAvailable ? 'media-probe-panel__status-badge--missing' : ''}`}>
                {statusText}
              </span>
              {probeResult?.format?.duration && (
                <span>{formatDuration(probeResult.format.duration)}</span>
              )}
              {probeResult && (
                <span>{videoStreams.length}V {audioStreams.length}A {subtitleStreams.length}S</span>
              )}
              {probeResult?.format?.bitRate && (
                <span>{formatBitRate(probeResult.format.bitRate)}</span>
              )}
            </span>
            <span className="media-probe-panel__status-toggle">
              <label className="switch-control">
                <input
                  type="checkbox"
                  checked={syncEnabled}
                  onChange={(e) => setSyncEnabled(e.target.checked)}
                />
                <span className="switch-control__track" />
                <span>{zh ? '联动流选择' : 'Sync'}</span>
              </label>
            </span>
          </div>

          {/* 未探测 — 人机交互引导 */}
          {idle && ffprobeAvailable && hasInput && (
            <div className="media-probe-panel__idle">
              {zh
                ? '点击右上角"探测"按钮，使用 ffprobe 分析当前输入文件的媒体信息。'
                : 'Click the Probe button to analyze the current input file with ffprobe.'}
            </div>
          )}

          {/* 无 ffprobe */}
          {!ffprobeAvailable && tools !== null && (
            <div className="media-probe-panel__notice">
              {zh
                ? 'ffprobe 未在 ffmpeg 同目录中找到。请将 ffprobe.exe 放在 ffmpeg.exe 所在目录下以启用媒体信息探测。'
                : 'ffprobe was not found alongside ffmpeg. Place ffprobe.exe in the same directory as ffmpeg.exe to enable media probing.'}
            </div>
          )}

          {/* 无输入路径 */}
          {!hasInput && (
            <div className="media-probe-panel__hint" style={{ marginBottom: 8 }}>
              {zh ? '请先在"输入文件路径"填写媒体文件路径。' : 'Enter an input file path first.'}
            </div>
          )}

          {/* 探测错误 */}
          {error && (
            <div className="media-probe-panel__error">{error}</div>
          )}

          {/* 探测结果 */}
          {probeResult && (
            <div className="media-probe-panel__result">
              {/* 文件信息 */}
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
                  <div className="media-probe-panel__stream-group-title">{zh ? '视频流' : 'Video Streams'} ({videoStreams.length})</div>
                  {videoStreams.map((s) => (
                    <div key={`v-${s.index}`} className="media-probe-panel__stream-item">
                      <span className="media-probe-panel__stream-index">#{s.index}</span>
                      <span className="media-probe-panel__stream-detail">
                        {codecLabel(s)}{s.pixFmt ? ` | ${s.pixFmt}` : ''}{s.profile ? ` | ${s.profile}` : ''}
                      </span>
                      {s.tags?.language && <span className="media-probe-panel__stream-tag">{s.tags.language}</span>}
                    </div>
                  ))}
                </div>
              )}

              {audioStreams.length > 0 && (
                <div className="media-probe-panel__stream-group">
                  <div className="media-probe-panel__stream-group-title">{zh ? '音频流' : 'Audio Streams'} ({audioStreams.length})</div>
                  {audioStreams.map((s) => (
                    <div key={`a-${s.index}`} className="media-probe-panel__stream-item">
                      <span className="media-probe-panel__stream-index">#{s.index}</span>
                      <span className="media-probe-panel__stream-detail">
                        {codecLabel(s)}{s.sampleFmt ? ` | ${s.sampleFmt}` : ''}
                      </span>
                      {s.tags?.language && <span className="media-probe-panel__stream-tag">{s.tags.language}</span>}
                    </div>
                  ))}
                </div>
              )}

              {subtitleStreams.length > 0 && (
                <div className="media-probe-panel__stream-group">
                  <div className="media-probe-panel__stream-group-title">{zh ? '字幕流' : 'Subtitle Streams'} ({subtitleStreams.length})</div>
                  {subtitleStreams.map((s) => (
                    <div key={`s-${s.index}`} className="media-probe-panel__stream-item">
                      <span className="media-probe-panel__stream-index">#{s.index}</span>
                      <span className="media-probe-panel__stream-detail">{codecLabel(s)}</span>
                      {s.tags?.language && <span className="media-probe-panel__stream-tag">{s.tags.language}</span>}
                      {s.tags?.title && <span className="media-probe-panel__stream-tag">{s.tags.title}</span>}
                    </div>
                  ))}
                </div>
              )}

              {otherStreams.length > 0 && (
                <div className="media-probe-panel__stream-group">
                  <div className="media-probe-panel__stream-group-title">{zh ? '其他流' : 'Other Streams'} ({otherStreams.length})</div>
                  {otherStreams.map((s) => (
                    <div key={`o-${s.index}`} className="media-probe-panel__stream-item">
                      <span className="media-probe-panel__stream-index">#{s.index}</span>
                      <span className="media-probe-panel__stream-detail">{s.codecType} | {s.codecName ?? '?'}</span>
                    </div>
                  ))}
                </div>
              )}

              {probeResult.streams.length === 0 && (
                <div className="media-probe-panel__empty">{zh ? '文件中未检测到任何流。' : 'No streams detected in the file.'}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
