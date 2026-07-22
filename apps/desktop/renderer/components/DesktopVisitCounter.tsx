import { useEffect, useState } from 'react'

interface UsageStats {
  total: number
  today: number
}

export function DesktopVisitCounter() {
  const [stats, setStats] = useState<UsageStats | null>(null)

  useEffect(() => {
    let cancelled = false
    const api = window.electronAPI
    if (!api) return () => { cancelled = true }

    api.getUsageStats()
      .then((result) => {
        if (!cancelled && result) setStats(result)
      })
      .catch(() => {
        // 离线或接口异常时保留占位符，不影响桌面功能。
      })
    return () => { cancelled = true }
  }, [])

  return (
    <span className="visit-dashboard" aria-label="使用统计">
      <span className="meta-pill visit-pill">
        今日访问 <strong>{stats ? stats.today.toLocaleString() : '-'}</strong>
      </span>
      <span className="meta-pill visit-pill">
        总计访问 <strong>{stats ? stats.total.toLocaleString() : '-'}</strong>
      </span>
    </span>
  )
}
