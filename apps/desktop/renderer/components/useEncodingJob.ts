// ============================================================
// 编码任务状态 Hook，供桌面操作按钮与壳层状态栏使用。
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import {
  getJobDisplayState,
  subscribeToJob,
  startEncoding,
  cancelEncoding,
  restoreActiveJob,
  type JobDisplayState,
} from './encoding-job'

export type { JobDisplayState }

export function useEncodingJob() {
  const [jobState, setJobState] = useState<JobDisplayState>(getJobDisplayState)

  useEffect(() => {
    // Subscribe for cross-component updates
    const unsub = subscribeToJob(() => {
      setJobState(getJobDisplayState())
    })

    // Check for an active job (e.g. on component remount / hot reload)
    restoreActiveJob()

    return unsub
  }, [])

  const start = useCallback(
    (request: FFmpegJobStartRequest) => startEncoding(request),
    [],
  )

  const cancel = useCallback(() => cancelEncoding(), [])

  return { jobState, start, cancel } as const
}
