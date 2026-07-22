import { useEffect, useRef } from 'react'

interface Series {
  label: string
  color: string
  values: Array<number | null>
}

export function TimeSeriesCanvas({ series, max = 100, label }: { series: Series[]; max?: number; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const rect = canvas.getBoundingClientRect()
    const ratio = window.devicePixelRatio || 1
    canvas.width = Math.max(1, Math.floor(rect.width * ratio))
    canvas.height = Math.max(1, Math.floor(rect.height * ratio))
    context.scale(ratio, ratio)
    context.clearRect(0, 0, rect.width, rect.height)
    context.strokeStyle = 'rgba(125, 145, 165, .2)'
    context.lineWidth = 1
    for (let i = 0; i <= 4; i += 1) {
      const y = 8 + (rect.height - 16) * i / 4
      context.beginPath(); context.moveTo(8, y); context.lineTo(rect.width - 8, y); context.stroke()
    }
    for (const item of series) {
      const values = item.values.slice(-300)
      if (values.length < 2) continue
      context.strokeStyle = item.color
      context.lineWidth = 1.5
      context.beginPath()
      let drawing = false
      values.forEach((value, index) => {
        if (value == null) { drawing = false; return }
        const x = 8 + (rect.width - 16) * index / Math.max(1, values.length - 1)
        const y = 8 + (rect.height - 16) * (1 - Math.max(0, Math.min(max, value)) / max)
        if (!drawing) { context.moveTo(x, y); drawing = true } else context.lineTo(x, y)
      })
      context.stroke()
    }
  }, [max, series])
  return <canvas ref={ref} className="performance-chart" role="img" aria-label={label} />
}
