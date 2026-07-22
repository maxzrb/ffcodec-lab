import { useEffect, useMemo, useState } from 'react'
import { useDesktopLocale } from '../useDesktopLocale'
import { Gauge } from './Gauge'
import { useHardwareMonitor } from './HardwareMonitorContext'
import { UPlotChart } from './UPlotChart'

const valueText = (value: number | null | undefined, suffix: string, digits = 0) => value == null ? '--' : `${value.toFixed(digits)}${suffix}`

export function PerformancePage() {
  const locale = useDesktopLocale()
  const isZh = locale === 'zh-CN'
  const { state, snapshot, history, closePage, summaryEnabled, setSummaryEnabled, retry } = useHardwareMonitor()
  const [cpuId, setCpuId] = useState<string>('')
  const [gpuId, setGpuId] = useState<string>('')
  const [storageId, setStorageId] = useState<string>('')
  const [paused, setPaused] = useState(false)
  const [frozenHistory, setFrozenHistory] = useState<typeof history>([])

  useEffect(() => { if (!cpuId && snapshot?.cpu[0]) setCpuId(snapshot.cpu[0].id) }, [cpuId, snapshot])
  useEffect(() => { if (!gpuId && snapshot?.gpu[0]) setGpuId(snapshot.gpu[0].id) }, [gpuId, snapshot])
  useEffect(() => { if (!storageId && snapshot?.storage[0]) setStorageId(snapshot.storage[0].id) }, [storageId, snapshot])

  const visibleHistory = paused ? frozenHistory : history
  const currentCpu = snapshot?.cpu.find((item) => item.id === cpuId) ?? snapshot?.cpu[0]
  const currentGpu = snapshot?.gpu.find((item) => item.id === gpuId) ?? snapshot?.gpu[0]
  const currentStorage = snapshot?.storage.find((item) => item.id === storageId) ?? snapshot?.storage[0]

  const gpuValues = useMemo(() => visibleHistory.map((item) => item.gpu.find((gpu) => gpu.id === currentGpu?.id)?.load ?? null), [currentGpu, visibleHistory])
  const memoryValues = useMemo(() => visibleHistory.map((item) => item.memory?.load ?? null), [visibleHistory])

  const togglePaused = () => {
    if (!paused) setFrozenHistory(history)
    setPaused((value) => !value)
  }

  return (
    <section className="performance-page" aria-label={isZh ? '性能监控' : 'Performance monitor'}>
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
          <small>{isZh ? '在命令检查器下方显示 CPU、GPU 与内存仪表；详情页入口始终位于标题栏。' : 'Show CPU, GPU, and memory gauges below the command inspector. The title bar remains the only detail-page entry.'}</small>
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
            {snapshot && snapshot.cpu.length > 1 && <select value={currentCpu?.id} onChange={(event) => setCpuId(event.target.value)}>{snapshot.cpu.map((cpu) => <option key={cpu.id} value={cpu.id}>{cpu.name}</option>)}</select>}
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
          <div className="cpu-logical-header">
            <strong>{isZh ? '逻辑处理器' : 'Logical processors'}</strong>
            <small>{isZh ? '最近 60 秒 · 每个逻辑核心独立显示' : 'Last 60 seconds · one graph per logical processor'}</small>
          </div>
          <div className="cpu-core-grid">
            {currentCpu?.cores.map((core) => {
              const values = visibleHistory.map((item) => item.cpu.find((cpu) => cpu.id === currentCpu.id)?.cores.find((candidate) => candidate.id === core.id)?.load ?? null)
              return <div className="cpu-core-chart" key={core.id}>
                <header><span>{core.name.replace('CPU ', '')}</span><strong>{valueText(core.load, '%')}</strong></header>
                <UPlotChart values={values} label={`${core.name} ${isZh ? '使用率' : 'usage'}`} color="var(--accent)" height={76} compact />
              </div>
            })}
          </div>
        </article>

        <article className="performance-panel performance-panel--gpu">
          <header>
            <div><span>GPU</span><strong>{currentGpu?.name ?? (isZh ? '未检测到' : 'Not detected')}</strong></div>
            {snapshot && snapshot.gpu.length > 1 && <select value={currentGpu?.id} onChange={(event) => setGpuId(event.target.value)}>{snapshot.gpu.map((gpu) => <option key={gpu.id} value={gpu.id}>{gpu.name}</option>)}</select>}
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
          <UPlotChart values={gpuValues} label={isZh ? 'GPU 使用率历史' : 'GPU usage history'} color="var(--blue)" height={112} />
        </article>

        <article className="performance-panel performance-panel--resources">
          <header><div><span>{isZh ? '内存与硬盘' : 'Memory & Storage'}</span><strong>{snapshot?.memory?.name ?? '--'}</strong></div></header>
          <div className="performance-resources">
            <Gauge label={isZh ? '内存' : 'Memory'} value={snapshot?.memory?.load ?? null} compact detail={snapshot?.memory?.usedGb != null && snapshot.memory.totalGb != null ? `${snapshot.memory.usedGb.toFixed(1)} / ${snapshot.memory.totalGb.toFixed(1)} GB` : undefined} />
            <UPlotChart values={memoryValues} label={isZh ? '内存使用率历史' : 'Memory usage history'} color="var(--accent)" height={82} />
          </div>
          {snapshot && snapshot.storage.length > 0 ? <div className="storage-metrics">
            <select value={currentStorage?.id} onChange={(event) => setStorageId(event.target.value)}>{snapshot.storage.map((storage) => <option key={storage.id} value={storage.id}>{storage.name}</option>)}</select>
            <dl>
              <div><dt>{isZh ? '空间占用' : 'Space used'}</dt><dd>{valueText(currentStorage?.spaceLoad, '%')}</dd></div>
              <div><dt>{isZh ? '读取' : 'Read'}</dt><dd>{valueText(currentStorage?.readRateMb, ' MB/s', 1)}</dd></div>
              <div><dt>{isZh ? '写入' : 'Write'}</dt><dd>{valueText(currentStorage?.writeRateMb, ' MB/s', 1)}</dd></div>
              <div><dt>{isZh ? '温度' : 'Temperature'}</dt><dd>{valueText(currentStorage?.temperatureC, ' °C')}</dd></div>
            </dl>
          </div> : <p className="performance-empty">{isZh ? '当前权限或硬件未提供硬盘传感器。' : 'Storage sensors are unavailable with the current hardware or permissions.'}</p>}
        </article>
      </div>
    </section>
  )
}
