// ============================================================
// VisitCounter — 全局访问量计数器组件
// 挂载时 fetch /api/visits，静默加载，错误时不影响页面
// ============================================================

import { useEffect, useState } from 'react'

interface VisitCounterProps {
  label: string
}

export function VisitCounter({ label }: VisitCounterProps) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/visits')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ visits: number }>
      })
      .then((data) => {
        if (!cancelled) setCount(data.visits)
      })
      .catch(() => {
        // 静默失败：本地开发时 /api/visits 不可达，或网络错误
      })
    return () => { cancelled = true }
  }, [])

  if (count === null) return null

  return (
    <span className="visit-counter">
      {label} {count.toLocaleString()}
    </span>
  )
}
