import { useEffect, useMemo, useRef, useState } from 'react'
import uPlot, { type AlignedData, type Options } from 'uplot'
import 'uplot/dist/uPlot.min.css'

interface UPlotChartProps {
  values: Array<number | null>
  label: string
  color?: string
  height?: number
  max?: number
  compact?: boolean
}

export function UPlotChart({ values, label, color, height = 130, max = 100, compact = false }: UPlotChartProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<uPlot | null>(null)
  const [themeRevision, setThemeRevision] = useState(0)
  const visibleValues = useMemo(() => values.slice(compact ? -60 : -300), [compact, values])

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeRevision((value) => value + 1))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const resolvedColor = resolveColor(color)
    const data = makeData([null, null])
    const options: Options = {
      width: Math.max(80, host.clientWidth),
      height,
      pxAlign: 1,
      cursor: { show: false },
      legend: { show: false },
      select: { show: false, left: 0, top: 0, width: 0, height: 0 },
      scales: {
        x: { time: false, auto: false, range: [compact ? -59 : -299, 0] },
        y: { auto: false, range: [0, max] },
      },
      axes: [
        { show: false },
        { show: false },
      ],
      series: [
        {},
        {
          label,
          stroke: resolvedColor,
          width: compact ? 1 : 1.35,
          fill: `${resolvedColor}${compact ? '1a' : '14'}`,
          spanGaps: false,
          points: { show: false },
        },
      ],
      hooks: {
        drawClear: [(chart) => drawTaskManagerGrid(chart, resolvedColor)],
      },
    }
    const chart = new uPlot(options, data, host)
    chartRef.current = chart
    const resize = new ResizeObserver(([entry]) => {
      const width = Math.floor(entry?.contentRect.width ?? host.clientWidth)
      if (width > 0) chart.setSize({ width, height })
    })
    resize.observe(host)
    return () => {
      resize.disconnect()
      chart.destroy()
      chartRef.current = null
    }
  }, [color, compact, height, label, max, themeRevision])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    // 固定坐标范围无需重新计算 scale，但 uPlot 在 resetScales=false 时也会跳过 commit，
    // 因此必须显式 redraw，确保每次硬件快照都会绘制到 Canvas。
    chart.setData(makeData(visibleValues), false)
    chart.redraw()
  }, [visibleValues])

  return <div ref={hostRef} className={`performance-uplot${compact ? ' performance-uplot--compact' : ''}`} role="img" aria-label={label} />
}

function resolveColor(value?: string): string {
  const variable = value?.match(/^var\((--[^)]+)\)$/)?.[1] ?? '--accent'
  if (!value || value.startsWith('var(')) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || '#087f6c'
  }
  return value
}

function makeData(values: Array<number | null>): AlignedData {
  const padded = values.length >= 2 ? values : [null, values[0] ?? null]
  const offset = padded.length - 1
  return [padded.map((_, index) => index - offset), padded]
}

function drawTaskManagerGrid(chart: uPlot, color: string): void {
  const context = chart.ctx
  const { left, top, width, height } = chart.bbox
  context.save()
  context.strokeStyle = `${color}24`
  context.lineWidth = 1
  context.beginPath()
  for (let column = 0; column <= 6; column += 1) {
    const x = Math.round(left + width * column / 6) + .5
    context.moveTo(x, top)
    context.lineTo(x, top + height)
  }
  for (let row = 0; row <= 4; row += 1) {
    const y = Math.round(top + height * row / 4) + .5
    context.moveTo(left, y)
    context.lineTo(left + width, y)
  }
  context.stroke()
  context.restore()
}
