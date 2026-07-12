// ============================================================
// VisitCounter — 今日 / 历史访问量仪表盘组件
// 单设备 4 小时内仅上报一次，防止重复计数和类 DDOS 攻击
// ============================================================

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ffcodec-last-visit'
const THROTTLE_MS = 4 * 60 * 60 * 1000 // 4 小时

interface VisitCounterProps {
  /** 今日访问量标签 */
  todayLabel: string
  /** 历史总访问量标签 */
  totalLabel: string
}

function shouldSkip(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const lastVisit = parseInt(raw, 10)
    if (Number.isNaN(lastVisit)) return false
    return Date.now() - lastVisit < THROTTLE_MS
  } catch {
    return false // localStorage 不可用时正常上报
  }
}

function recordVisit(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    // 忽略存储失败
  }
}

export function VisitCounter({ todayLabel, totalLabel }: VisitCounterProps) {
  const [stats, setStats] = useState<{ total: number; today: number } | null>(null)

  useEffect(() => {
    if (shouldSkip()) return

    let cancelled = false
    fetch('/api/visits')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ total: number; today: number }>
      })
      .then((data) => {
        if (!cancelled) {
          recordVisit()
          setStats(data)
        }
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
