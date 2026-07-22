// ============================================================
// Phase 11 历史与日志弹窗。
// 默认隐藏，由桌面底部状态栏按钮打开；不同事件级别使用不同颜色。
// ============================================================

import { useEffect, useMemo, useState } from 'react'
import { useAppDialog } from '@ffcodec/workbench'

interface EncodingLogDialogProps {
  isZh: boolean
  items: EncodingHistoryItem[]
  onClose: () => void
  onRefresh: () => Promise<void>
}

const STATUS_LABELS: Record<EncodingHistoryItem['status'], { zh: string; en: string }> = {
  created: { zh: '已创建', en: 'Created' },
  starting: { zh: '启动中', en: 'Starting' },
  running: { zh: '编码中', en: 'Running' },
  cancelling: { zh: '取消中', en: 'Cancelling' },
  completed: { zh: '成功', en: 'Completed' },
  failed: { zh: '失败', en: 'Failed' },
  cancelled: { zh: '已取消', en: 'Cancelled' },
}

export function EncodingLogDialog({ isZh, items, onClose, onRefresh }: EncodingLogDialogProps) {
  const dialog = useAppDialog()
  const [selectedId, setSelectedId] = useState(items[0]?.historyId ?? null)
  const [rawLog, setRawLog] = useState<string | null>(null)
  const [logError, setLogError] = useState<string | null>(null)

  useEffect(() => {
    if (!items.some((item) => item.historyId === selectedId)) {
      setSelectedId(items[0]?.historyId ?? null)
      setRawLog(null)
    }
  }, [items, selectedId])

  const selected = useMemo(
    () => items.find((item) => item.historyId === selectedId) ?? null,
    [items, selectedId],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const showRawLog = async () => {
    if (!selected) return
    setLogError(null)
    const result = await window.electronAPI?.readEncodingLog(selected.historyId)
    if (!result) return
    if (result.ok) setRawLog(result.content)
    else setLogError(result.error)
  }

  const deleteSelected = async () => {
    if (!selected) return
    const confirmed = await dialog.confirm({
      title: isZh ? '删除这条历史？' : 'Delete this history item?',
      message: isZh ? '对应的完整日志文件也会删除，此操作无法撤销。' : 'Its full log file will also be deleted. This cannot be undone.',
      confirmLabel: isZh ? '删除历史和日志' : 'Delete history and log',
      cancelLabel: isZh ? '取消' : 'Cancel',
      tone: 'danger',
    })
    if (!confirmed) return
    const result = await window.electronAPI?.deleteEncodingHistory(selected.historyId)
    if (result && !result.ok) {
      setLogError(result.error ?? (isZh ? '删除失败' : 'Delete failed'))
      return
    }
    setRawLog(null)
    await onRefresh()
  }

  const clearAll = async () => {
    if (!items.length) return
    const confirmed = await dialog.confirm({
      title: isZh ? '清空全部历史和日志？' : 'Clear all history and logs?',
      message: isZh ? '全部编码历史和日志文件都会删除，此操作无法撤销。' : 'All encoding history and log files will be deleted. This cannot be undone.',
      confirmLabel: isZh ? '全部清空' : 'Clear everything',
      cancelLabel: isZh ? '取消' : 'Cancel',
      tone: 'danger',
    })
    if (!confirmed) return
    await window.electronAPI?.clearEncodingHistory()
    setRawLog(null)
    await onRefresh()
  }

  const openRawLog = async () => {
    if (!selected) return
    const result = await window.electronAPI?.openEncodingLog(selected.historyId)
    if (result && !result.ok) setLogError(result.error ?? (isZh ? '无法打开日志' : 'Unable to open log'))
  }

  const revealOutput = async () => {
    if (!selected) return
    const result = await window.electronAPI?.revealEncodingOutput(selected.historyId)
    if (result && !result.ok) setLogError(result.error ?? (isZh ? '无法定位输出' : 'Unable to reveal output'))
  }

  return (
    <div className="encoding-log-modal" role="dialog" aria-modal="true" aria-label={isZh ? '编码历史与日志' : 'Encoding history and logs'}>
      <button className="encoding-log-modal__backdrop" type="button" aria-label={isZh ? '关闭' : 'Close'} onClick={onClose} />
      <section className="encoding-log-dialog">
        <header className="encoding-log-dialog__header">
          <div>
            <h2>{isZh ? '编码历史与日志' : 'Encoding history and logs'}</h2>
            <p>{isZh ? '仅记录关键操作和结果，实时进度不会频繁写入磁盘。' : 'Only key actions and results are persisted; live progress is not written repeatedly.'}</p>
          </div>
          <div className="encoding-log-dialog__header-actions">
            <button type="button" className="button-ghost" onClick={clearAll} disabled={!items.length}>
              {isZh ? '清空全部' : 'Clear all'}
            </button>
            <button type="button" className="icon-button" onClick={onClose} aria-label={isZh ? '关闭' : 'Close'}>×</button>
          </div>
        </header>

        <div className="encoding-log-dialog__body">
          <nav className="encoding-history-list" aria-label={isZh ? '编码历史' : 'Encoding history'}>
            {items.length === 0 ? (
              <p className="encoding-history-list__empty">{isZh ? '暂无编码记录' : 'No encoding history yet'}</p>
            ) : items.map((item) => (
              <button
                type="button"
                key={item.historyId}
                className={`encoding-history-item${selectedId === item.historyId ? ' encoding-history-item--active' : ''}`}
                onClick={() => { setSelectedId(item.historyId); setRawLog(null); setLogError(null) }}
              >
                <span className={`encoding-history-item__status encoding-history-item__status--${item.status}`}>
                  {STATUS_LABELS[item.status][isZh ? 'zh' : 'en']}
                </span>
                {item.snapshot.commandSource === 'custom' && <span className="encoding-history-item__source">{isZh ? '自定义' : 'Custom'}</span>}
                <strong>{fileName(item.outputPaths[0] ?? item.inputPaths[0] ?? item.jobId)}</strong>
                <time>{new Date(item.createdAt).toLocaleString(isZh ? 'zh-CN' : 'en-US')}</time>
              </button>
            ))}
          </nav>

          <main className="encoding-log-detail">
            {!selected ? (
              <p className="encoding-log-detail__empty">{isZh ? '选择一条记录查看详情' : 'Select an item to view details'}</p>
            ) : (
              <>
                <div className="encoding-log-detail__summary">
                  <div><span>{isZh ? '输出' : 'Output'}</span><code>{selected.outputPaths[0] ?? '—'}</code></div>
                  <div><span>{isZh ? '耗时' : 'Duration'}</span><strong>{formatDuration(selected.durationMs)}</strong></div>
                  <div><span>{isZh ? '退出码' : 'Exit code'}</span><strong>{selected.exitCode ?? '—'}</strong></div>
                </div>

                <div className="encoding-log-events">
                  {selected.events.map((entry) => (
                    <article key={entry.id} className={`encoding-log-event encoding-log-event--${entry.level} encoding-log-event--${entry.kind}`}>
                      <time>{new Date(entry.timestamp).toLocaleTimeString(isZh ? 'zh-CN' : 'en-US')}</time>
                      <div>
                        <strong>{translateEvent(entry, isZh)}</strong>
                        {entry.detail && <pre>{entry.detail}</pre>}
                      </div>
                    </article>
                  ))}
                </div>

                {rawLog != null && <pre className="encoding-raw-log">{rawLog}</pre>}
                {logError && <p className="encoding-log-error">{logError}</p>}

                <footer className="encoding-log-detail__actions">
                  <button type="button" className="button-ghost" onClick={showRawLog}>
                    {isZh ? '在弹窗中查看完整日志' : 'View full log'}
                  </button>
                  <button type="button" className="button-ghost" onClick={openRawLog}>
                    {isZh ? '用系统程序打开' : 'Open externally'}
                  </button>
                  <button type="button" className="button-ghost" onClick={revealOutput} disabled={!selected.outputPaths.length}>
                    {isZh ? '定位输出' : 'Reveal output'}
                  </button>
                  <button type="button" className="button-ghost encoding-log-delete" onClick={deleteSelected}>
                    {isZh ? '删除记录' : 'Delete'}
                  </button>
                </footer>
              </>
            )}
          </main>
        </div>
      </section>
    </div>
  )
}

function translateEvent(entry: EncodingLogEvent, isZh: boolean): string {
  if (isZh) return entry.message
  if (entry.message === '用户开始自定义命令') return 'User started a custom command'
  if (entry.message === '自定义 FFmpeg 进程已启动') return 'Custom FFmpeg process started'
  const labels: Record<EncodingLogEvent['kind'], string> = {
    'user-start': 'User started encoding',
    'ffmpeg-start': 'FFmpeg process started',
    'user-cancel': 'User requested cancellation',
    'user-end': entry.level === 'success' ? 'Encoding completed successfully' : entry.level === 'error' ? 'Encoding ended with an error' : 'Encoding was cancelled',
    'ffmpeg-error': 'FFmpeg encoding error',
  }
  return labels[entry.kind]
}

function fileName(filePath: string): string {
  return filePath.split(/[\\/]/).filter(Boolean).pop() ?? filePath
}

function formatDuration(ms: number | null): string {
  if (ms == null) return '—'
  const seconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}
