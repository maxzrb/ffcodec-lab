// ============================================================
// 输入与输出模块内的 Desktop 批处理入口。
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { CollapsibleSection, Dropdown, useBuilderStore, useI18n } from '@ffcodec/workbench'
import { getPreferredFFmpegPath } from '../ffmpeg-path-selection'
import { useEncodingJob } from '../components/useEncodingJob'
import { runBatchQueue } from './batch-queue-runner'
import { useBatchQueueStore, type BatchQueueItem, type BatchQueueItemStatus } from './batch-queue-store'
import {
  buildOutputSuffix,
  deriveOutputInSourceDirectory,
  deriveOutputPath,
  ensureUniqueOutputPath,
  getPathDirectory,
  isAbsoluteLocalPath,
} from './batch-queue-paths'

const catalog = loadCatalog()

const STATUS_LABELS: Record<BatchQueueItemStatus, { zh: string; en: string }> = {
  ready: { zh: '等待中', en: 'Ready' },
  running: { zh: '运行中', en: 'Running' },
  completed: { zh: '已完成', en: 'Completed' },
  failed: { zh: '已失败', en: 'Failed' },
  cancelled: { zh: '已取消', en: 'Cancelled' },
}

function displayName(filePath: string): string {
  const slashIndex = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'))
  return filePath.slice(slashIndex + 1) || filePath
}

const SUFFIX_OPTIONS: { value: string; zh: string; en: string }[] = [
  { value: 'ffcodec', zh: 'ffcodec (默认)', en: 'ffcodec (default)' },
  { value: 'timestamp', zh: '时间戳', en: 'Timestamp' },
  { value: 'increment', zh: '递增序号', en: 'Increment' },
  { value: 'encoder', zh: '编码器与质量参数', en: 'Encoder & quality' },
  { value: 'random', zh: '随机数字字母', en: 'Random' },
]

function resolveQualityLabel(config: ReturnType<typeof useBuilderStore.getState>['config']): string {
  const rc = config.video.rateControl
  if (!rc) return ''
  const qv = rc.qualityValue != null ? String(rc.qualityValue) : ''
  switch (rc.mode) {
    case 'crf': return `crf${qv}`
    case 'cqp': return `qp${qv}`
    case 'twoPass': {
      const bv = (rc.additionalValues as Record<string, string> | undefined)?.bitrate ?? ''
      return bv.replace('k', '')
    }
    default: {
      const bv = (rc.additionalValues as Record<string, string> | undefined)?.bitrate ?? ''
      return bv ? bv : rc.mode
    }
  }
}

/** 置于既有"输入与输出"卡片内的单文件输出位置设置。 */
export function SingleFileOutputLocationControl() {
  const { locale } = useI18n()
  const isZh = locale === 'zh-CN'
  const config = useBuilderStore((state) => state.config)
  const setConfig = useBuilderStore((state) => state.setConfig)
  const singleOutputToSourceDirectory = useBatchQueueStore((state) => state.singleOutputToSourceDirectory)
  const setSingleOutputToSourceDirectory = useBatchQueueStore((state) => state.setSingleOutputToSourceDirectory)

  const outputExtension = catalog.containers[config.output.containerId]?.extension ?? 'mp4'
  const suffixStyle = config.output.outputSuffix ?? 'ffcodec'

  // 只在输入路径、容器扩展名、开关状态或后缀风格变化时自动推导输出路径。
  const prevDeriveKey = useRef('')
  useEffect(() => {
    if (!singleOutputToSourceDirectory || !isAbsoluteLocalPath(config.input.path)) {
      if (!singleOutputToSourceDirectory) prevDeriveKey.current = ''
      return
    }
    const current = useBuilderStore.getState().config
    const suffix = buildOutputSuffix(suffixStyle, {
      encoderId: config.video.encoderId,
      qualityLabel: resolveQualityLabel(current),
    })
    const deriveKey = `${config.input.path}|${outputExtension}|${suffix}`
    if (deriveKey === prevDeriveKey.current) return
    prevDeriveKey.current = deriveKey
    const outputPath = deriveOutputInSourceDirectory(config.input.path, outputExtension, suffix)
    setConfig({ ...current, output: { ...current.output, path: outputPath } })
  }, [config.input.path, outputExtension, suffixStyle, singleOutputToSourceDirectory, setConfig])

  const suffixOptions = SUFFIX_OPTIONS.map((opt) => ({
    value: opt.value,
    label: isZh ? opt.zh : opt.en,
  }))

  const showPreview = singleOutputToSourceDirectory && isAbsoluteLocalPath(config.input.path)

  return (
    <div className="input-output-output-location">
      <label className="switch-control">
        <input
          type="checkbox"
          checked={singleOutputToSourceDirectory}
          onChange={(event) => setSingleOutputToSourceDirectory(event.target.checked)}
        />
        <span className="switch-control__track" aria-hidden="true" />
        <span>{isZh ? '输出到原目录' : 'Output to source directory'}</span>
      </label>
      <label className="output-suffix-row">
        <span className="output-suffix-row__label">{isZh ? '文件名后缀' : 'Filename suffix'}</span>
        <Dropdown
          value={suffixStyle}
          options={suffixOptions}
          onChange={(value) => {
            const current = useBuilderStore.getState().config
            setConfig({ ...current, output: { ...current.output, outputSuffix: value as typeof suffixStyle } })
          }}
        />
      </label>
      {showPreview && (
        <p className="batch-queue-hint" title={config.output.path}>
          {isZh ? '将生成：' : 'Will create: '}<code>{config.output.path}</code>
        </p>
      )}
    </div>
  )
}

export function BatchQueuePanel() {
  const { locale } = useI18n()
  const isZh = locale === 'zh-CN'
  const config = useBuilderStore((state) => state.config)
  const queueExpanded = useBuilderStore((state) => state.expandedSections['section.batch-queue'] ?? true)
  const toggleSection = useBuilderStore((state) => state.toggleSection)
  const { jobState } = useEncodingJob()
  const items = useBatchQueueStore((state) => state.items)
  const selectedItemId = useBatchQueueStore((state) => state.selectedItemId)
  const queueEnabled = useBatchQueueStore((state) => state.queueEnabled)
  const batchOutputToSourceDirectory = useBatchQueueStore((state) => state.batchOutputToSourceDirectory)
  const batchOutputDirectory = useBatchQueueStore((state) => state.batchOutputDirectory)
  const queueRunning = useBatchQueueStore((state) => state.running)
  const addConfigs = useBatchQueueStore((state) => state.addConfigs)
  const removeItem = useBatchQueueStore((state) => state.removeItem)
  const updateItemOutput = useBatchQueueStore((state) => state.updateItemOutput)
  const setSelectedItem = useBatchQueueStore((state) => state.setSelectedItem)
  const retryItem = useBatchQueueStore((state) => state.retryItem)
  const clearFinished = useBatchQueueStore((state) => state.clearFinished)
  const clearAll = useBatchQueueStore((state) => state.clearAll)
  const setQueueEnabled = useBatchQueueStore((state) => state.setQueueEnabled)
  const setBatchOutputToSourceDirectory = useBatchQueueStore((state) => state.setBatchOutputToSourceDirectory)
  const setBatchOutputDirectory = useBatchQueueStore((state) => state.setBatchOutputDirectory)
  const [notice, setNotice] = useState<string | null>(null)
  const [browsingOutputDirectory, setBrowsingOutputDirectory] = useState(false)

  const outputExtension = catalog.containers[config.output.containerId]?.extension ?? 'mp4'
  const fallbackOutputDirectory = getPathDirectory(config.output.path)
  const effectiveBatchOutputDirectory = batchOutputDirectory || fallbackOutputDirectory
  const activeEncoding = jobState.phase === 'preparing' || jobState.phase === 'running' || jobState.phase === 'cancelling'
  const readyCount = items.filter((item) => item.status === 'ready').length
  const finishedCount = items.filter((item) => item.status === 'completed').length

  const buildQueueConfigs = useCallback((inputPaths: string[]) => {
    const usedOutputs = new Set(items.map((item) => item.outputPath))
    const outputDirectory = effectiveBatchOutputDirectory
    const currentConfig = useBuilderStore.getState().config
    const suffix = buildOutputSuffix(currentConfig.output.outputSuffix ?? 'ffcodec', {
      encoderId: currentConfig.video.encoderId,
      qualityLabel: resolveQualityLabel(currentConfig),
    })

    return inputPaths.map((inputPath) => {
      const directory = batchOutputToSourceDirectory && isAbsoluteLocalPath(inputPath)
        ? getPathDirectory(inputPath)
        : outputDirectory
      const desiredOutput = deriveOutputPath(inputPath, directory, outputExtension, suffix)
      const outputPath = ensureUniqueOutputPath(desiredOutput, usedOutputs)
      usedOutputs.add(outputPath)
      return {
        ...structuredClone(config),
        input: { ...config.input, path: inputPath },
        output: { ...config.output, path: outputPath },
      }
    })
  }, [batchOutputToSourceDirectory, config, effectiveBatchOutputDirectory, items, outputExtension])

  const addInputPaths = useCallback((inputPaths: string[]) => {
    const ids = addConfigs(buildQueueConfigs(inputPaths))
    if (ids.length === 0) {
      setNotice(isZh ? '没有新增任务：文件为空或已在队列中。' : 'No tasks were added: files are empty or already queued.')
    } else {
      setNotice(isZh ? `已加入 ${ids.length} 个任务。` : `${ids.length} task(s) added.`)
    }
  }, [addConfigs, buildQueueConfigs, isZh])

  const handleBrowseFiles = useCallback(async () => {
    const result = await window.electronAPI?.showOpenDialog({
      kind: 'files',
      defaultPath: isAbsoluteLocalPath(config.input.path) ? config.input.path : undefined,
    })
    if (!result || result.canceled || !result.filePaths?.length) return
    addInputPaths(result.filePaths)
  }, [addInputPaths, config.input.path])

  const handleAddCurrent = useCallback(() => {
    const inputPath = config.input.path.trim()
    if (!inputPath) {
      setNotice(isZh ? '请先选择输入文件。' : 'Choose an input file first.')
      return
    }
    addInputPaths([inputPath])
  }, [addInputPaths, config.input.path, isZh])

  const handleRunQueue = useCallback(() => {
    setNotice(null)
    void runBatchQueue(getPreferredFFmpegPath()).then((result) => {
      if (!result.ok && result.error) setNotice(result.error)
    })
  }, [])

  const handleBatchOutputToSourceDirectoryChange = useCallback((enabled: boolean) => {
    setBatchOutputToSourceDirectory(enabled)
    if (!enabled && !batchOutputDirectory) setBatchOutputDirectory(fallbackOutputDirectory)
  }, [batchOutputDirectory, fallbackOutputDirectory, setBatchOutputDirectory, setBatchOutputToSourceDirectory])

  const handleBrowseOutputDirectory = useCallback(async () => {
    const api = window.electronAPI
    if (!api) return

    setBrowsingOutputDirectory(true)
    try {
      const result = await api.showOpenDialog({
        kind: 'directory',
        defaultPath: effectiveBatchOutputDirectory || undefined,
      })
      if (!result.canceled && result.filePath) setBatchOutputDirectory(result.filePath)
    } finally {
      setBrowsingOutputDirectory(false)
    }
  }, [effectiveBatchOutputDirectory, setBatchOutputDirectory])

  return (
    <CollapsibleSection
      className="batch-queue-section"
      title={isZh ? '批处理任务清单' : 'Batch task list'}
      description={items.length === 0 ? (isZh ? '暂无任务' : 'Empty') : `${items.length} ${isZh ? '项' : 'items'}`}
      expanded={queueExpanded}
      onToggle={() => toggleSection('section.batch-queue')}
      actions={(
        <div className="batch-queue-header-actions">
          <button
            type="button"
            className="button-ghost button-ghost--danger"
            onClick={clearAll}
            disabled={queueRunning || items.length === 0}
          >
            {isZh ? '清空队列' : 'Clear queue'}
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={handleRunQueue}
            disabled={!queueEnabled || readyCount === 0 || queueRunning || activeEncoding}
            title={!queueEnabled
              ? (isZh ? '请先启用队列' : 'Enable the queue first')
              : activeEncoding && !queueRunning
              ? (isZh ? '已有编码任务正在运行' : 'Another encoding job is running')
              : undefined}
          >
            {queueRunning ? (isZh ? '执行中…' : 'Running…') : (isZh ? `执行队列${readyCount ? ` (${readyCount})` : ''}` : `Run queue${readyCount ? ` (${readyCount})` : ''}`)}
          </button>
        </div>
      )}
    >
      <div className="batch-queue-toolbar">
        <div className="batch-queue-toolbar__toggles">
          <label className="batch-queue-toggle">
            <input
              type="checkbox"
              checked={queueEnabled}
              onChange={(event) => setQueueEnabled(event.target.checked)}
              disabled={queueRunning || items.length === 0}
            />
            <span>{isZh ? '启用队列' : 'Enable queue'}</span>
          </label>
          <label className="batch-queue-toggle">
            <input
              type="checkbox"
              checked={batchOutputToSourceDirectory}
              onChange={(event) => handleBatchOutputToSourceDirectoryChange(event.target.checked)}
              disabled={queueRunning}
            />
            <span>{isZh ? '输出到原目录' : 'Output to source directory'}</span>
          </label>
        </div>
        <div className="batch-queue-file-actions">
          <button type="button" className="button-ghost" onClick={handleAddCurrent} disabled={queueRunning}>
            {isZh ? '加入当前文件' : 'Add current'}
          </button>
          <button type="button" className="button-ghost" onClick={() => { void handleBrowseFiles() }} disabled={queueRunning}>
            {isZh ? '添加文件' : 'Add files'}
          </button>
        </div>
      </div>

      {!batchOutputToSourceDirectory && (
        <label className="batch-queue-output-directory">
          <span>{isZh ? '新任务输出目录' : 'New task output directory'}</span>
          <div className="batch-queue-output-directory__control">
            <input
              type="text"
              value={effectiveBatchOutputDirectory}
              onChange={(event) => setBatchOutputDirectory(event.target.value)}
              disabled={queueRunning}
            />
            <button
              type="button"
              className="button-ghost"
              onClick={() => { void handleBrowseOutputDirectory() }}
              disabled={queueRunning || browsingOutputDirectory}
            >
              {browsingOutputDirectory ? '…' : (isZh ? '浏览...' : 'Browse...')}
            </button>
          </div>
        </label>
      )}

      {notice && <p className="batch-queue-notice" role="status">{notice}</p>}

      {items.length === 0 ? (
        <p className="batch-queue-empty">{isZh ? '添加多个媒体文件后，会按当前编码设置逐项串行处理。' : 'Add media files to process them one by one with the current encoding settings.'}</p>
      ) : (
        <ul className="batch-queue-list">
          {items.map((item) => (
            <QueueItemRow
              key={item.id}
              item={item}
              selected={item.id === selectedItemId}
              isZh={isZh}
              queueRunning={queueRunning}
              onSelect={() => {
                setSelectedItem(item.id)
                if (queueEnabled) {
                  window.dispatchEvent(new CustomEvent('ffcodec:open-inspector-tab', { detail: 'command' }))
                }
              }}
              onOutputChange={(outputPath) => updateItemOutput(item.id, outputPath)}
              onRemove={() => removeItem(item.id)}
              onRetry={() => retryItem(item.id)}
            />
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <div className="batch-queue-footer">
          <span>{isZh ? `已完成 ${finishedCount} / ${items.length}` : `${finishedCount} / ${items.length} completed`}</span>
          <button type="button" className="button-ghost button-ghost--danger" onClick={clearFinished} disabled={queueRunning || finishedCount === 0}>
            {isZh ? '清除已完成' : 'Clear completed'}
          </button>
        </div>
      )}
    </CollapsibleSection>
  )
}

function QueueItemRow({
  item,
  selected,
  isZh,
  queueRunning,
  onSelect,
  onOutputChange,
  onRemove,
  onRetry,
}: {
  item: BatchQueueItem
  selected: boolean
  isZh: boolean
  queueRunning: boolean
  onSelect: () => void
  onOutputChange: (value: string) => void
  onRemove: () => void
  onRetry: () => void
}) {
  const status = STATUS_LABELS[item.status][isZh ? 'zh' : 'en']
  const canEdit = item.status !== 'running' && !queueRunning

  return (
    <li className={`batch-queue-item${selected ? ' batch-queue-item--selected' : ''}`}>
      <button type="button" className="batch-queue-item__select" onClick={onSelect}>
        <span className="batch-queue-item__name">{displayName(item.inputPath)}</span>
        <span className="batch-queue-item__path" title={item.inputPath}>{item.inputPath}</span>
      </button>
      <div className="batch-queue-item__meta">
        <span className={`batch-queue-status batch-queue-status--${item.status}`}>{status}</span>
        <button type="button" className="batch-queue-icon-button" onClick={onRemove} disabled={!canEdit} title={isZh ? '移除此任务' : 'Remove task'} aria-label={isZh ? '移除此任务' : 'Remove task'}>×</button>
      </div>
      <label className="batch-queue-item__output">
        <span>{isZh ? '输出' : 'Output'}</span>
        <input value={item.outputPath} onChange={(event) => onOutputChange(event.target.value)} disabled={!canEdit} />
      </label>
      {item.error && <p className="batch-queue-item__error" title={item.error}>{item.error}</p>}
      {(item.status === 'failed' || item.status === 'cancelled') && !queueRunning && (
        <button type="button" className="button-ghost" onClick={onRetry}>{isZh ? '重试此项' : 'Retry item'}</button>
      )}
    </li>
  )
}
