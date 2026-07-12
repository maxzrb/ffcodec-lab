// ============================================================
// VisitCounter — 今日 / 历史访问量仪表盘组件
// 单设备 4 小时内仅上报一次（?count=false 只读），始终拉取实时数据
// ============================================================

import { useEffect, useState } from 'react'

const CACHE_KEY = 'ffcodec-visit-cache'
const THROTTLE_MS = 4 * 60 * 60 * 1000 // 4 小时

interface VisitCache {
  ts: number
}

interface VisitCounterProps {
  todayLabel: string
  totalLabel: string
}

function isThrottled(): boolean {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return false
    const cache = JSON.parse(raw) as VisitCache
    if (typeof cache.ts !== 'number') return false
    return Date.now() - cache.ts < THROTTLE_MS
  } catch {
    return false
  }
}

function markVisit(): void {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now() }))
  } catch {
    // 忽略存储失败
  }
}

export function VisitCounter({ todayLabel, totalLabel }: VisitCounterProps) {
  const [stats, setStats] = useState<{ total: number; today: number } | null>(null)

  useEffect(() => {
    const throttled = isThrottled()
    const url = throttled ? '/api/visits?count=false' : '/api/visits'

    let cancelled = false
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ total: number; today: number }>
      })
      .then((data) => {
        if (!cancelled) {
          if (!throttled) markVisit()
          setStats(data)
        }
      })
      .catch(() => {
        // 静默失败：本地开发或网络错误
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
