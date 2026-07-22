interface GaugeProps {
  label: string
  value: number | null
  detail?: string
  compact?: boolean
}

export function Gauge({ label, value, detail, compact = false }: GaugeProps) {
  const safe = value == null ? 0 : Math.max(0, Math.min(100, value))
  const radius = compact ? 36 : 48
  const circumference = Math.PI * radius
  const dash = circumference * safe / 100
  const width = compact ? 96 : 126
  const height = compact ? 66 : 86
  return (
    <div className={`performance-gauge${compact ? ' performance-gauge--compact' : ''}`} role="img" aria-label={`${label}: ${value == null ? '--' : `${Math.round(value)}%`}`}>
      <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <path className="performance-gauge__track" d={`M ${width / 2 - radius} ${height - 8} A ${radius} ${radius} 0 0 1 ${width / 2 + radius} ${height - 8}`} pathLength={circumference} />
        <path className="performance-gauge__value" d={`M ${width / 2 - radius} ${height - 8} A ${radius} ${radius} 0 0 1 ${width / 2 + radius} ${height - 8}`} pathLength={circumference} strokeDasharray={`${dash} ${circumference}`} />
        <line className="performance-gauge__needle" x1={width / 2} y1={height - 8} x2={width / 2} y2={height - radius + 2} transform={`rotate(${-90 + safe * 1.8} ${width / 2} ${height - 8})`} />
        <circle cx={width / 2} cy={height - 8} r="3" className="performance-gauge__hub" />
      </svg>
      <strong>{value == null ? '--' : `${Math.round(value)}%`}</strong>
      <span>{label}</span>
      {detail && <small>{detail}</small>}
    </div>
  )
}
