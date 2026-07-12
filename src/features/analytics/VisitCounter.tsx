// ============================================================
// VisitCounter — 今日 / 历史访问量仪表盘组件
// 挂载时 fetch /api/visits，静默加载，错误时不影响页面
// ============================================================

import { useEffect, useState } from 'react'

interface VisitCounterProps {
  /** 今日访问量标签 */
  todayLabel: string
  /** 历史总访问量标签 */
  totalLabel: string
}

export function VisitCounter({ todayLabel, totalLabel }: VisitCounterProps) {
  const [stats, setStats] = useState<{ total: number; today: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/visits')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ total: number; today: number }>
      })
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch(() => {
        // 静默失败：本地开发时 /api/visits 不可达，或网络错误
      })
    return () => { cancelled = true }
  }, [])

  if (stats === null) return null

  return (
    <span className="visit-dashboard">
      <span className="meta-pill visit-pill">
        {todayLabel} <strong>{stats.today.toLocaleString()}</strong>
      </span>
      <span className="meta-pill visit-pill">
        {totalLabel} <strong>{stats.total.toLocaleString()}</strong>
      </span>
    </span>
  )
}
