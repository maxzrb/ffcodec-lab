// ============================================================
// FFmpegStatusBar — Electron 壳层的独立底部状态栏。
// 显示 FFmpeg 环境信息与当前编码任务的实时摘要。
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEncodingJob } from './useEncodingJob'
import { localizeJobError } from './encoding-job'
import { EncodingLogDialog } from './EncodingLogDialog'
import { useDesktopLocale } from '../useDesktopLocale'
import { notifyPreferredFFmpegPathChange } from '../ffmpeg-path-selection'

const CUSTOM_PATH_STORAGE_KEY = 'ffcodec-desktop-ffmpeg-path'
const SELECTED_PATH_STORAGE_KEY = 'ffcodec-desktop-selected-ffmpeg-path'
const SOURCE_STORAGE_KEY = 'ffcodec-desktop-ffmpeg-source'

type StatusState =
  | { kind: 'detecting' }
  | { kind: 'found'; info: FFmpegInfo; allVersions: FFmpegInfo[] }
  | { kind: 'not-found' }

const SOURCE_LABELS: Record<string, { zh: string; en: string }> = {
  custom: { zh: '自定义', en: 'custom' },
  bundled: { zh: '同目录', en: 'bundled' },
  path: { zh: '系统PATH', en: 'sys PATH' },
}

function getStoredSource(): FFmpegInfo['source'] | undefined {
  const source = localStorage.getItem(SOURCE_STORAGE_KEY)
    ?? window.electronAPI?.storageGetItem(SOURCE_STORAGE_KEY)
  return source === 'custom' || source === 'bundled' || source === 'path'
    ? source
    : undefined
}

function storeSource(source: FFmpegInfo['source']): void {
  localStorage.setItem(SOURCE_STORAGE_KEY, source)
  void window.electronAPI?.storageSetItem(SOURCE_STORAGE_KEY, source)
}

function storeSelectedPath(ffmpegPath: string): void {
  localStorage.setItem(SELECTED_PATH_STORAGE_KEY, ffmpegPath)
  void window.electronAPI?.storageSetItem(SELECTED_PATH_STORAGE_KEY, ffmpegPath)
}

function clearCustomPath(): void {
  localStorage.removeItem(CUSTOM_PATH_STORAGE_KEY)
  void window.electronAPI?.storageRemoveItem(CUSTOM_PATH_STORAGE_KEY)
}

function isSamePath(left: string, right: string): boolean {
  return left.replace(/\//g, '\\').toLocaleLowerCase()
    === right.replace(/\//g, '\\').toLocaleLowerCase()
}

export function FFmpegStatusBar() {
  const locale = useDesktopLocale()
  const isZh = locale === 'zh-CN'
  const [status, setStatus] = useState<StatusState>({ kind: 'detecting' })
  const [history, setHistory] = useState<EncodingHistoryItem[]>([])
  const [logsOpen, setLogsOpen] = useState(false)
  const [unreadLogs, setUnreadLogs] = useState(0)
  const [hasUnreadFailure, setHasUnreadFailure] = useState(false)
  const [showVersionMenu, setShowVersionMenu] = useState(false)
  const versionMenuRef = useRef<HTMLDivElement>(null)
  const switchingRef = useRef(false)

  // Click outside to close version menu
  useEffect(() => {
    if (!showVersionMenu) return
    const onDocClick = (e: MouseEvent) => {
      if (versionMenuRef.current && !versionMenuRef.current.contains(e.target as Node)) {
        setShowVersionMenu(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [showVersionMenu])

  const knownHistoryStates = useRef<Map<string, EncodingHistoryItem['status']> | null>(null)
  const { jobState } = useEncodingJob()

  const refreshHistory = useCallback(async () => {
    const items = await window.electronAPI?.listEncodingHistory()
    if (!items) return
    if (knownHistoryStates.current) {
      const added = items.filter((item) => !knownHistoryStates.current?.has(item.historyId))
      if (added.length > 0) {
        setUnreadLogs((count) => count + added.length)
      }
      const hasNewFailure = items.some((item) => item.status === 'failed' && knownHistoryStates.current?.get(item.historyId) !== 'failed')
      if (hasNewFailure) setHasUnreadFailure(true)
    }
    knownHistoryStates.current = new Map(items.map((item) => [item.historyId, item.status]))
    setHistory(items)
  }, [])

  const openLogs = () => {
    setUnreadLogs(0)
    setHasUnreadFailure(false)
    setLogsOpen(true)
  }

  const detect = () => {
    setStatus({ kind: 'detecting' })
    const customPath = (localStorage.getItem(CUSTOM_PATH_STORAGE_KEY) ?? window.electronAPI?.storageGetItem(CUSTOM_PATH_STORAGE_KEY))?.trim() || undefined
    const selectedPath = (localStorage.getItem(SELECTED_PATH_STORAGE_KEY) ?? window.electronAPI?.storageGetItem(SELECTED_PATH_STORAGE_KEY))?.trim() || undefined
    const detectionPath = selectedPath ?? customPath
    const storedSource = getStoredSource()
    window.electronAPI?.detectFFmpeg(detectionPath).then(async (info) => {
      const all = (await window.electronAPI?.listFFmpegVersions(customPath)) ?? []
      let resolvedSource = storedSource
      // 兼容旧版本把菜单选择写进自定义路径的状态，并恢复真实来源。
      if (info.found && detectionPath && !resolvedSource) {
        const discovered = (await window.electronAPI?.listFFmpegVersions()) ?? []
        resolvedSource = discovered.find((version) => isSamePath(version.path, info.path))?.source
          ?? 'custom'
        storeSource(resolvedSource)
      }
      if (info.found && !selectedPath && customPath && resolvedSource && resolvedSource !== 'custom') {
        storeSelectedPath(info.path)
        clearCustomPath()
        switchingRef.current = true
        window.dispatchEvent(new StorageEvent('storage', {
          key: CUSTOM_PATH_STORAGE_KEY,
          newValue: null,
        }))
        switchingRef.current = false
      }
      const detectedInfo = info.found && resolvedSource
        ? { ...info, source: resolvedSource }
        : info
      let allVersions = info.found && resolvedSource
        ? all.map((version) => isSamePath(version.path, info.path) ? { ...version, source: resolvedSource } : version)
        : all
      if (detectedInfo.found && !allVersions.some((version) => isSamePath(version.path, detectedInfo.path))) {
        allVersions = [detectedInfo, ...allVersions]
      }
      setStatus(detectedInfo.found
        ? { kind: 'found', info: detectedInfo, allVersions }
        : { kind: 'not-found' })
    }).catch(() => {
      setStatus({ kind: 'not-found' })
    })
  }

  // Auto-detect on mount
  useEffect(() => {
    detect()
  }, [])

  useEffect(() => {
    refreshHistory()
    return window.electronAPI?.onEncodingHistoryChanged(refreshHistory)
  }, [refreshHistory])

  // Listen for custom path changes from settings section via storage event
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CUSTOM_PATH_STORAGE_KEY && !switchingRef.current) detect()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const handleLeftClick = () => {
    if (status.kind === 'found' && status.allVersions.length > 0) {
      setShowVersionMenu((v) => !v)
    } else if (status.kind === 'not-found') {
      window.electronAPI?.openExternal('https://ffmpeg.org/download.html')
    }
  }

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (status.kind === 'found') {
      window.electronAPI?.revealInFolder(status.info.path)
    }
  }

  const selectVersion = async (version: FFmpegInfo) => {
    setShowVersionMenu(false)
    switchingRef.current = true
    try {
      const result = await window.electronAPI?.detectFFmpeg(version.path)
      if (result?.found) {
        storeSelectedPath(result.path)
        storeSource(version.source)
        // 切换时保留菜单原有候选。若以当前路径重新扫描，原自定义版本会从结果中消失，
        // 候选列表缩为一项后状态栏就不再响应左键切换。
        setStatus((prev) => {
          const allVersions = prev.kind === 'found'
            ? prev.allVersions
            : [result]
          return {
            kind: 'found' as const,
            info: { ...result, source: version.source },
            allVersions,
          }
        })
        notifyPreferredFFmpegPathChange()
      }
    } finally {
      switchingRef.current = false
    }
  }

  let ffmpegItem
  if (status.kind === 'detecting') {
    ffmpegItem = (
      <span className="ffmpeg-status ffmpeg-status--detecting">
        {isZh ? '正在检测 FFmpeg…' : 'Detecting FFmpeg…'}
      </span>
    )
  } else if (status.kind === 'found') {
    const sourceLabel = SOURCE_LABELS[status.info.source]?.[isZh ? 'zh' : 'en'] ?? status.info.source
    const hasCandidates = status.allVersions.length > 0
    ffmpegItem = (
      <span className="ffmpeg-status-wrapper" ref={versionMenuRef}>
        <span
          className={`ffmpeg-status ffmpeg-status--found${hasCandidates ? ' ffmpeg-status--switchable' : ''}`}
          onClick={handleLeftClick}
          onContextMenu={handleRightClick}
          title={isZh
            ? `路径: ${status.info.path}\n来源: ${sourceLabel}${hasCandidates ? '\n左键查看候选版本\n右键在资源管理器中定位' : '\n右键在资源管理器中定位'}`
            : `Path: ${status.info.path}\nSource: ${sourceLabel}${hasCandidates ? '\nLeft-click to view available versions\nRight-click to open in Explorer' : '\nRight-click to open in Explorer'}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') handleLeftClick() }}
        >
          FFmpeg {status.info.version} <span className="ffmpeg-status__source">({sourceLabel})</span>
          {hasCandidates && <span className="ffmpeg-status__arrow">▾</span>}
        </span>
        {showVersionMenu && hasCandidates && (
          <div className="ffmpeg-version-menu">
            {status.allVersions.map((v) => (
              <button
                key={v.path}
                type="button"
                className={`ffmpeg-version-menu__item${isSamePath(v.path, status.info.path) ? ' ffmpeg-version-menu__item--active' : ''}`}
                onClick={() => selectVersion(v)}
              >
                <span>FFmpeg {v.version}</span>
                <small>{SOURCE_LABELS[v.source]?.[isZh ? 'zh' : 'en'] ?? v.source}</small>
              </button>
            ))}
          </div>
        )}
      </span>
    )
  } else {
    ffmpegItem = (
      <span
        className="ffmpeg-status ffmpeg-status--not-found"
        onClick={handleLeftClick}
        title={isZh
          ? '未检测到 FFmpeg。点击跳转下载页面。\n你也可在左侧设置面板中指定自定义路径。'
          : 'FFmpeg not found. Click to visit the download page.\nYou can also specify a custom path in the settings panel.'}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') handleLeftClick() }}
      >
        {isZh ? 'FFmpeg 未找到 — 获取 FFmpeg' : 'FFmpeg not found — Get FFmpeg'}
      </span>
    )
  }

  return (
    <footer className="desktop-status-bar" aria-label={isZh ? '桌面应用状态' : 'Desktop application status'}>
      <div className="desktop-status-bar__environment">
        <span className="desktop-status-bar__indicator" aria-hidden="true" />
        {ffmpegItem}
      </div>
      <div className="desktop-status-bar__actions">
        <JobStatus isZh={isZh} jobState={jobState} />
        <button
          type="button"
          className={`desktop-log-button${hasUnreadFailure ? ' desktop-log-button--error' : ''}`}
          onClick={openLogs}
          title={unreadLogs > 0
            ? (isZh ? `${unreadLogs} 条未读记录` : `${unreadLogs} unread ${unreadLogs === 1 ? 'entry' : 'entries'}`)
            : (isZh ? '打开编码历史与日志' : 'Open encoding history and logs')}
        >
          {isZh ? '日志' : 'Logs'}
          {unreadLogs > 0 && <span>{unreadLogs > 99 ? '99+' : unreadLogs}</span>}
        </button>
      </div>
      {logsOpen && (
        <EncodingLogDialog
          isZh={isZh}
          items={history}
          onClose={() => setLogsOpen(false)}
          onRefresh={refreshHistory}
        />
      )}
    </footer>
  )
}

function JobStatus({ isZh, jobState }: {
  isZh: boolean
  jobState: ReturnType<typeof useEncodingJob>['jobState']
}) {
  const { phase, snapshot, error } = jobState
  const active = phase === 'preparing' || phase === 'running' || phase === 'cancelling'
  const percent = snapshot?.percent

  let label = isZh ? '就绪' : 'Ready'
  if (phase === 'preparing') label = isZh ? '正在准备编码' : 'Preparing'
  if (phase === 'running') label = isZh ? '正在编码' : 'Encoding'
  if (phase === 'cancelling') label = isZh ? '正在取消' : 'Cancelling'
  if (phase === 'completed') label = isZh ? '编码完成' : 'Completed'
  if (phase === 'failed') label = isZh ? '编码失败' : 'Failed'
  if (phase === 'cancelled') label = isZh ? '已取消' : 'Cancelled'
  if (snapshot?.commandSource === 'custom' && active) label = isZh ? '自定义命令' : 'Custom command'

  if (!snapshot) {
    if (error) label = isZh ? '任务未启动' : 'Not started'
    return (
      <div
        className={`desktop-job-status desktop-job-status--${error ? 'failed' : phase}`}
        title={error ? localizeJobError(error, isZh) : undefined}
      >
        <span className="desktop-job-status__phase">{label}</span>
      </div>
    )
  }

  const frameText = `${snapshot.frame ?? 0}/${snapshot.totalFrames ?? '—'}`
  const percentText = percent == null ? '—%' : `${percent.toFixed(1)}%`
  const efficiencyText = [
    snapshot.fps == null ? null : `${snapshot.fps.toFixed(1)} FPS`,
    snapshot.speed == null ? null : `${snapshot.speed.toFixed(2)}×`,
  ].filter(Boolean).join(' / ') || '—'
  const estimatedSize = snapshot.totalSize != null && percent != null && percent > 0
    ? Math.round(snapshot.totalSize * 100 / percent)
    : null
  const sizeText = `${formatStatusSize(snapshot.totalSize)} / ${formatStatusSize(estimatedSize)}`
  const bitrateText = snapshot.bitrate?.trim() || '—'
  const elapsedMs = snapshot.startedAt == null
    ? null
    : Math.max(0, (snapshot.endedAt ?? Date.now()) - snapshot.startedAt)
  const timeText = `${formatStatusDuration(snapshot.estimatedRemainingMs)} / ${formatStatusDuration(elapsedMs)}`

  return (
    <div className={`desktop-job-status desktop-job-status--${phase}`}>
      {(active || percent != null) && (
        <span className="desktop-job-status__progress" aria-hidden="true">
          <span style={{ width: `${Math.max(0, Math.min(100, percent ?? 0))}%` }} />
        </span>
      )}
      <StatusMetric label={isZh ? '进度' : 'Progress'} value={frameText} extra={percentText} />
      <StatusMetric label={isZh ? '效率' : 'Efficiency'} value={efficiencyText} />
      <StatusMetric label={isZh ? '大小/预估' : 'Size/Est.'} value={sizeText} />
      <StatusMetric label={isZh ? '质量比特率' : 'Bitrate'} value={bitrateText} />
      <StatusMetric label={isZh ? '剩余/已用' : 'Left/Elapsed'} value={timeText} />
      <span className="desktop-job-status__phase">{label}</span>
    </div>
  )
}

function StatusMetric({ label, value, extra }: { label: string; value: string; extra?: string }) {
  return (
    <span className="desktop-job-status__metric">
      <small>{label}</small>
      <strong>{value}</strong>
      {extra && <em>{extra}</em>}
    </span>
  )
}

function formatStatusDuration(ms: number | null): string {
  if (ms == null) return '—'
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatStatusSize(bytes: number | null): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}
