import { useDesktopLocale } from '../useDesktopLocale'
import { Gauge } from './Gauge'
import { useHardwareMonitor } from './HardwareMonitorContext'
import { UPlotChart } from './UPlotChart'

function formatTemperature(value: number | null | undefined): string | undefined {
  return value == null ? undefined : `${Math.round(value)} °C`
}

export function PerformanceSummary() {
  const locale = useDesktopLocale()
  const isZh = locale === 'zh-CN'
  const { state, snapshot, history, summaryEnabled } = useHardwareMonitor()
  if (!summaryEnabled) return null
  const cpu = snapshot?.cpu[0]
  const gpu = snapshot?.gpu[0]
  const memory = snapshot?.memory
  const cpuHistory = history.slice(-60).map((item) => item.cpu.find((candidate) => candidate.id === cpu?.id)?.load ?? null)
  const gpuHistory = history.slice(-60).map((item) => item.gpu.find((candidate) => candidate.id === gpu?.id)?.load ?? null)
  const memoryHistory = history.slice(-60).map((item) => item.memory?.load ?? null)
  const cards = [
    { key: 'cpu', label: 'CPU', value: cpu?.load ?? null, detail: formatTemperature(cpu?.temperatureC), values: cpuHistory, color: 'var(--accent)' },
    { key: 'gpu', label: 'GPU', value: gpu?.load ?? null, detail: formatTemperature(gpu?.temperatureC), values: gpuHistory, color: 'var(--blue)' },
    { key: 'memory', label: isZh ? '内存' : 'Memory', value: memory?.load ?? null, detail: memory?.usedGb != null && memory.totalGb != null ? `${memory.usedGb.toFixed(1)} / ${memory.totalGb.toFixed(1)} GB` : undefined, values: memoryHistory, color: 'var(--warning)' },
  ]
  return (
    <section className="performance-summary" aria-label={isZh ? '性能摘要' : 'Performance summary'}>
      <header>
        <strong>{isZh ? '性能摘要' : 'Performance'}</strong>
        <span className={`performance-status performance-status--${state.status}`}>{state.status === 'running' ? (isZh ? '实时' : 'Live') : state.status}</span>
      </header>
      <div className="performance-summary__cards">
        {cards.map((card) => (
          <article className={`performance-summary__card performance-summary__card--${card.key}`} key={card.key}>
            <div className="performance-summary__gauge">
              <Gauge label={card.label} value={card.value} compact detail={card.detail} />
            </div>
            <div className="performance-summary__trend">
              <header><span>60s</span><strong>{card.value == null ? '--' : `${card.value.toFixed(0)}%`}</strong></header>
              <UPlotChart values={card.values} label={`${card.label} ${isZh ? '使用率趋势' : 'usage trend'}`} color={card.color} height={58} compact />
            </div>
          </article>
        ))}
      </div>
      {state.message && <p>{state.message}</p>}
    </section>
  )
}
