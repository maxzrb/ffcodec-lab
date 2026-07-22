import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Dropdown } from '@ffcodec/workbench'
import { useDesktopLocale } from '../useDesktopLocale'
import { Gauge } from './Gauge'
import { useHardwareMonitor } from './HardwareMonitorContext'
import { UPlotChart } from './UPlotChart'

const valueText = (value: number | null | undefined, suffix: string, digits = 0) => value == null ? '--' : `${value.toFixed(digits)}${suffix}`

export function PerformancePage() {
  const locale = useDesktopLocale()
  const isZh = locale === 'zh-CN'
  const { state, snapshot, history, closePage, summaryEnabled, setSummaryEnabled, retry, installPawnIo, pawnIoInstalling, pawnIoError } = useHardwareMonitor()
  const [cpuId, setCpuId] = useState<string>('')
  const [gpuId, setGpuId] = useState<string>('')
  const [storageId, setStorageId] = useState<string>('')
  const [paused, setPaused] = useState(false)
  const [frozenHistory, setFrozenHistory] = useState<typeof history>([])
  const [cpuChartMetric, setCpuChartMetric] = useState<'load' | 'clock'>('load')
  const pageRef = useRef<HTMLElement>(null)
  const dragRef = useRef<{ pointerY: number; scrollTop: number } | null>(null)
  const [scrollbar, setScrollbar] = useState({ top: 8, height: 42, maxScroll: 0 })

  const updateScrollbar = useCallback(() => {
    const page = pageRef.current
    if (!page) return
    const trackHeight = Math.max(0, page.clientHeight - 16)
    const maxScroll = Math.max(0, page.scrollHeight - page.clientHeight)
    const height = maxScroll === 0 ? trackHeight : Math.max(42, trackHeight * page.clientHeight / page.scrollHeight)
    const top = 8 + (maxScroll === 0 ? 0 : page.scrollTop / maxScroll * Math.max(0, trackHeight - height))
    setScrollbar({ top, height, maxScroll })
  }, [])

  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    const observer = new ResizeObserver(updateScrollbar)
    observer.observe(page)
    for (const child of page.children) observer.observe(child)
    page.addEventListener('scroll', updateScrollbar, { passive: true })
    updateScrollbar()
    return () => {
      observer.disconnect()
      page.removeEventListener('scroll', updateScrollbar)
    }
  }, [updateScrollbar])

  const moveScrollbar = (event: ReactPointerEvent<HTMLDivElement>) => {
    const page = pageRef.current
    const drag = dragRef.current
    if (!page || !drag || scrollbar.maxScroll === 0) return
    const travel = Math.max(1, page.clientHeight - 16 - scrollbar.height)
    page.scrollTop = drag.scrollTop + (event.clientY - drag.pointerY) / travel * scrollbar.maxScroll
  }

  useEffect(() => { if (!cpuId && snapshot?.cpu[0]) setCpuId(snapshot.cpu[0].id) }, [cpuId, snapshot])
  useEffect(() => { if (!gpuId && snapshot?.gpu[0]) setGpuId(snapshot.gpu[0].id) }, [gpuId, snapshot])
  useEffect(() => { if (!storageId && snapshot?.storage[0]) setStorageId(snapshot.storage[0].id) }, [storageId, snapshot])

  const visibleHistory = paused ? frozenHistory : history
  const currentCpu = snapshot?.cpu.find((item) => item.id === cpuId) ?? snapshot?.cpu[0]
  const currentGpu = snapshot?.gpu.find((item) => item.id === gpuId) ?? snapshot?.gpu[0]
  const currentStorage = snapshot?.storage.find((item) => item.id === storageId) ?? snapshot?.storage[0]

  const gpuSeries = useMemo(() => [
    {
      key: '3d', label: '3D', value: currentGpu?.threeDLoad ?? null,
      values: visibleHistory.map((item) => item.gpu.find((gpu) => gpu.id === currentGpu?.id)?.threeDLoad ?? null),
    },
    {
      key: 'memory', label: isZh ? '显存' : 'VRAM', value: currentGpu?.memoryLoad ?? null,
      values: visibleHistory.map((item) => item.gpu.find((gpu) => gpu.id === currentGpu?.id)?.memoryLoad ?? null),
    },
    {
      key: 'copy', label: 'Copy', value: currentGpu?.copyLoad ?? null,
      values: visibleHistory.map((item) => item.gpu.find((gpu) => gpu.id === currentGpu?.id)?.copyLoad ?? null),
    },
    {
      key: 'decode', label: isZh ? '视频解码' : 'Video decode', value: currentGpu?.videoDecodeLoad ?? null,
      values: visibleHistory.map((item) => item.gpu.find((gpu) => gpu.id === currentGpu?.id)?.videoDecodeLoad ?? null),
    },
    {
      key: 'encode', label: isZh ? '视频编码' : 'Video encode', value: currentGpu?.videoEncodeLoad ?? null,
      values: visibleHistory.map((item) => item.gpu.find((gpu) => gpu.id === currentGpu?.id)?.videoEncodeLoad ?? null),
    },
  ], [currentGpu, isZh, visibleHistory])
  const memoryValues = useMemo(() => visibleHistory.map((item) => item.memory?.load ?? null), [visibleHistory])

  const togglePaused = () => {
    if (!paused) setFrozenHistory(history)
    setPaused((value) => !value)
  }

  return (
    <section id="performance-page-content" ref={pageRef} className="performance-page" aria-label={isZh ? '性能监控' : 'Performance monitor'}>
      <header className="performance-page__header">
        <div>
          <p className="eyebrow">LibreHardwareMonitor</p>
          <h2>{isZh ? '性能监控' : 'Performance Monitor'}</h2>
        </div>
        <div className="performance-page__controls">
          <span className={`performance-status performance-status--${state.status}`}>
            {state.status} · {state.elevated ? (isZh ? '管理员采集' : 'Elevated') : (isZh ? '标准权限' : 'Standard access')}
          </span>
          {(state.status === 'unavailable' || state.status === 'limited') && <button type="button" className="button" onClick={() => void retry()}>{isZh ? '重试' : 'Retry'}</button>}
          <button type="button" className="button" onClick={togglePaused}>{paused ? (isZh ? '继续' : 'Resume') : (isZh ? '暂停' : 'Pause')}</button>
          <button type="button" className="button button--primary" onClick={closePage}>{isZh ? '返回工作台' : 'Back to workbench'}</button>
        </div>
      </header>

      {state.message && <div className="performance-page__notice" role="status">{state.message}</div>}

      <div className="performance-page__settings">
        <div>
          <strong>{isZh ? '主界面性能摘要' : 'Main page performance summary'}</strong>
          <small>{isZh ? '在命令检查器下方显示 CPU、GPU 与内存仪表。' : 'Show CPU, GPU, and memory gauges below the command inspector.'}</small>
        </div>
        <label className="performance-summary-toggle">
          <input type="checkbox" checked={summaryEnabled} onChange={(event) => setSummaryEnabled(event.target.checked)} />
          <span aria-hidden="true" />
          {summaryEnabled ? (isZh ? '已开启' : 'On') : (isZh ? '已关闭' : 'Off')}
        </label>
      </div>

      <div className="performance-page__grid">
        <article className="performance-panel performance-panel--cpu">
          <header>
            <div><span>CPU</span><strong>{currentCpu?.name ?? (isZh ? '未检测到' : 'Not detected')}</strong></div>
            {snapshot && snapshot.cpu.length > 1 && <Dropdown ariaLabel={isZh ? '选择 CPU' : 'Select CPU'} value={currentCpu?.id ?? ''} onChange={setCpuId} options={snapshot.cpu.map((cpu) => ({ value: cpu.id, label: cpu.name }))} />}
          </header>
          <div className="performance-panel__hero">
            <Gauge label={isZh ? '总占用' : 'Total load'} value={currentCpu?.load ?? null} detail={valueText(currentCpu?.temperatureC, ' °C')} />
            <dl>
              <div><dt>{isZh ? '温度' : 'Temperature'}</dt><dd>{valueText(currentCpu?.temperatureC, ' °C')}</dd></div>
              <div><dt>{isZh ? '功耗' : 'Power'}</dt><dd>{valueText(currentCpu?.powerW, ' W', 1)}</dd></div>
              <div><dt>{isZh ? '频率' : 'Clock'}</dt><dd>{valueText(currentCpu?.clockMhz, ' MHz')}</dd></div>
              <div><dt>{isZh ? '线程' : 'Threads'}</dt><dd>{currentCpu?.cores.length ?? 0}</dd></div>
            </dl>
          </div>
          {(currentCpu?.temperatureC == null || currentCpu.powerW == null) && (
            <div className="performance-hardware-note">
              <span>{isZh ? '完整 CPU 传感器需要 PawnIO。' : 'Full CPU sensors require PawnIO.'}</span>
              <button type="button" className="button" disabled={pawnIoInstalling} onClick={() => void installPawnIo()}>
                {pawnIoInstalling ? (isZh ? '正在安装…' : 'Installing…') : (isZh ? '安装并重新检测' : 'Install and retry')}
              </button>
              {pawnIoError && <small role="alert">{pawnIoError}</small>}
            </div>
          )}
          <div className="cpu-logical-header">
            <div>
              <strong>{isZh ? '逻辑处理器' : 'Logical processors'}</strong>
              <small>{isZh ? '最近 60 秒' : 'Last 60 seconds'}</small>
            </div>
            <div className="cpu-chart-metric" role="group" aria-label={isZh ? '核心图表指标' : 'Core chart metric'}>
              <button type="button" className={cpuChartMetric === 'load' ? 'is-active' : ''} onClick={() => setCpuChartMetric('load')}>{isZh ? '占用' : 'Load'}</button>
              <button type="button" className={cpuChartMetric === 'clock' ? 'is-active' : ''} onClick={() => setCpuChartMetric('clock')}>{isZh ? '频率' : 'Clock'}</button>
            </div>
          </div>
          <div className="cpu-core-grid">
            {currentCpu?.cores.map((core) => {
              const isClock = cpuChartMetric === 'clock'
              const values = visibleHistory.map((item) => {
                const candidate = item.cpu.find((cpu) => cpu.id === currentCpu.id)?.cores.find((itemCore) => itemCore.id === core.id)
                return isClock ? candidate?.clockMhz ?? null : candidate?.load ?? null
              })
              const value = isClock ? core.clockMhz : core.load
              return <div className="cpu-core-chart" key={core.id}>
                <header><span>{core.name.replace('CPU ', '')}</span><strong>{valueText(value, isClock ? ' MHz' : '%')}</strong></header>
                <UPlotChart values={values} label={`${core.name} ${isClock ? (isZh ? '频率' : 'clock') : (isZh ? '使用率' : 'usage')}`} color="var(--accent)" height={76} max={isClock ? 6_000 : 100} compact />
              </div>
            })}
          </div>
        </article>

        <article className="performance-panel performance-panel--gpu">
          <header>
            <div><span>GPU</span><strong>{currentGpu?.name ?? (isZh ? '未检测到' : 'Not detected')}</strong></div>
            {snapshot && snapshot.gpu.length > 1 && <Dropdown ariaLabel={isZh ? '选择 GPU' : 'Select GPU'} value={currentGpu?.id ?? ''} onChange={setGpuId} options={snapshot.gpu.map((gpu) => ({ value: gpu.id, label: gpu.name }))} />}
          </header>
          <div className="performance-panel__hero performance-panel__hero--small">
            <Gauge label={isZh ? '核心占用' : 'Core load'} value={currentGpu?.load ?? null} compact />
            <dl>
              <div><dt>{isZh ? '温度' : 'Temperature'}</dt><dd>{valueText(currentGpu?.temperatureC, ' °C')}</dd></div>
              <div><dt>{isZh ? '功耗' : 'Power'}</dt><dd>{valueText(currentGpu?.powerW, ' W', 1)}</dd></div>
              <div><dt>{isZh ? '核心频率' : 'Core clock'}</dt><dd>{valueText(currentGpu?.coreClockMhz, ' MHz')}</dd></div>
              <div><dt>{isZh ? '显存' : 'VRAM'}</dt><dd>{currentGpu?.memoryUsedGb != null && currentGpu.memoryTotalGb != null ? `${currentGpu.memoryUsedGb.toFixed(1)} / ${currentGpu.memoryTotalGb.toFixed(1)} GB` : '--'}</dd></div>
            </dl>
          </div>
          <div className="gpu-engine-grid">
            {gpuSeries.map((series) => (
              <div className="gpu-engine-chart" key={series.key}>
                <header><span>{series.label}</span><strong>{valueText(series.value, '%')}</strong></header>
                <UPlotChart values={series.values} label={`${series.label} ${isZh ? '使用率' : 'usage'}`} color="var(--blue)" height={62} compact />
              </div>
            ))}
          </div>
        </article>

        <article className="performance-panel performance-panel--resources">
          <header><div><span>{isZh ? '内存与硬盘' : 'Memory & Storage'}</span><strong>{snapshot?.memory?.name ?? '--'}</strong></div></header>
          <div className="performance-resources">
            <Gauge label={isZh ? '内存' : 'Memory'} value={snapshot?.memory?.load ?? null} compact detail={snapshot?.memory?.usedGb != null && snapshot.memory.totalGb != null ? `${snapshot.memory.usedGb.toFixed(1)} / ${snapshot.memory.totalGb.toFixed(1)} GB` : undefined} />
            <UPlotChart values={memoryValues} label={isZh ? '内存使用率历史' : 'Memory usage history'} color="var(--accent)" height={82} />
          </div>
          {snapshot && snapshot.storage.length > 0 ? <div className="storage-metrics">
            <Dropdown ariaLabel={isZh ? '选择硬盘' : 'Select storage'} value={currentStorage?.id ?? ''} onChange={setStorageId} options={snapshot.storage.map((storage) => ({ value: storage.id, label: storage.name }))} />
            <dl>
              <div><dt>{isZh ? '空间占用' : 'Space used'}</dt><dd>{valueText(currentStorage?.spaceLoad, '%')}</dd></div>
              <div><dt>{isZh ? '读取' : 'Read'}</dt><dd>{valueText(currentStorage?.readRateMb, ' MB/s', 1)}</dd></div>
              <div><dt>{isZh ? '写入' : 'Write'}</dt><dd>{valueText(currentStorage?.writeRateMb, ' MB/s', 1)}</dd></div>
              <div><dt>{isZh ? '温度' : 'Temperature'}</dt><dd>{valueText(currentStorage?.temperatureC, ' °C')}</dd></div>
            </dl>
          </div> : <p className="performance-empty">{isZh ? '当前权限或硬件未提供硬盘传感器。' : 'Storage sensors are unavailable with the current hardware or permissions.'}</p>}
        </article>
      </div>
      <div
        className="performance-page__scrollbar"
        role="scrollbar"
        aria-label={isZh ? '性能监控页面滚动条' : 'Performance page scrollbar'}
        aria-controls="performance-page-content"
        aria-valuemin={0}
        aria-valuemax={Math.round(scrollbar.maxScroll)}
        aria-valuenow={Math.round(pageRef.current?.scrollTop ?? 0)}
        tabIndex={0}
        onPointerDown={(event) => {
          if (event.target !== event.currentTarget || !pageRef.current || scrollbar.maxScroll === 0) return
          const rect = event.currentTarget.getBoundingClientRect()
          const ratio = Math.max(0, Math.min(1, (event.clientY - rect.top - scrollbar.height / 2) / Math.max(1, rect.height - scrollbar.height)))
          pageRef.current.scrollTop = ratio * scrollbar.maxScroll
        }}
        onKeyDown={(event) => {
          const page = pageRef.current
          if (!page) return
          const amount = event.key === 'PageDown' ? page.clientHeight * .85 : event.key === 'PageUp' ? -page.clientHeight * .85 : event.key === 'ArrowDown' ? 48 : event.key === 'ArrowUp' ? -48 : null
          if (amount != null) { event.preventDefault(); page.scrollBy({ top: amount }) }
          else if (event.key === 'Home') { event.preventDefault(); page.scrollTop = 0 }
          else if (event.key === 'End') { event.preventDefault(); page.scrollTop = scrollbar.maxScroll }
        }}
      >
        <div
          className="performance-page__scrollbar-thumb"
          style={{ height: scrollbar.height, transform: `translateY(${scrollbar.top}px)` }}
          onPointerDown={(event) => {
            if (!pageRef.current || scrollbar.maxScroll === 0) return
            dragRef.current = { pointerY: event.clientY, scrollTop: pageRef.current.scrollTop }
            event.currentTarget.setPointerCapture(event.pointerId)
            event.preventDefault()
          }}
          onPointerMove={moveScrollbar}
          onPointerUp={(event) => { dragRef.current = null; event.currentTarget.releasePointerCapture(event.pointerId) }}
          onPointerCancel={() => { dragRef.current = null }}
        />
      </div>
    </section>
  )
}
