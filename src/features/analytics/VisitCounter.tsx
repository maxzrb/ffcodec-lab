// ============================================================
// VisitCounter — 今日 / 历史访问量仪表盘组件
// 单设备 4 小时内仅上报一次，期间展示缓存的数值
// ============================================================

import { useEffect, useState } from 'react'

const CACHE_KEY = 'ffcodec-visit-cache'
const THROTTLE_MS = 4 * 60 * 60 * 1000 // 4 小时

interface VisitCache {
  ts: number
  total: number
  today: number
}

interface VisitCounterProps {
  todayLabel: string
  totalLabel: string
}

function readCache(): VisitCache | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as VisitCache
    if (typeof parsed.ts !== 'number' || typeof parsed.total !== 'number' || typeof parsed.today !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(total: number, today: number): void {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), total, today }))
  } catch {
    // 忽略存储失败
  }
}

export function VisitCounter({ todayLabel, totalLabel }: VisitCounterProps) {
  const [stats, setStats] = useState<{ total: number; today: number } | null>(null)

  useEffect(() => {
    const cached = readCache()

    // 4 小时内有缓存 → 直接展示缓存值，不上报
    if (cached && Date.now() - cached.ts < THROTTLE_MS) {
      setStats({ total: cached.total, today: cached.today })
      return
    }

    // 无缓存或已过期 → 上报并更新缓存
    let cancelled = false
    fetch('/api/visits')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ total: number; today: number }>
      })
      .then((data) => {
        if (!cancelled) {
          writeCache(data.total, data.today)
          setStats(data)
        }
      })
      .catch(() => {
        // 静默失败；若有旧缓存则降级展示
        if (!cancelled && cached) {
          setStats({ total: cached.total, today: cached.today })
        }
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
