import { useDesktopLocale } from '../useDesktopLocale'
import { Gauge } from './Gauge'
import { useHardwareMonitor } from './HardwareMonitorContext'

function formatTemperature(value: number | null | undefined): string | undefined {
  return value == null ? undefined : `${Math.round(value)} °C`
}

export function PerformanceSummary() {
  const locale = useDesktopLocale()
  const isZh = locale === 'zh-CN'
  const { state, snapshot, summaryEnabled } = useHardwareMonitor()
  if (!summaryEnabled) return null
  const cpu = snapshot?.cpu[0]
  const gpu = snapshot?.gpu[0]
  const memory = snapshot?.memory
  return (
    <section className="performance-summary" aria-label={isZh ? '性能摘要' : 'Performance summary'}>
      <header>
        <strong>{isZh ? '性能摘要' : 'Performance'}</strong>
        <span className={`performance-status performance-status--${state.status}`}>{state.status === 'running' ? (isZh ? '实时' : 'Live') : state.status}</span>
      </header>
      <div className="performance-summary__gauges">
        <Gauge label="CPU" value={cpu?.load ?? null} detail={formatTemperature(cpu?.temperatureC)} />
        <Gauge label="GPU" value={gpu?.load ?? null} detail={formatTemperature(gpu?.temperatureC)} />
        <Gauge label={isZh ? '内存' : 'Memory'} value={memory?.load ?? null} compact detail={memory?.usedGb != null && memory.totalGb != null ? `${memory.usedGb.toFixed(1)} / ${memory.totalGb.toFixed(1)} GB` : undefined} />
      </div>
      {state.message && <p>{state.message}</p>}
    </section>
  )
}
