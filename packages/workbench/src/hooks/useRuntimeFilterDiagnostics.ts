import { useEffect, useMemo, useState } from 'react'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'
import { collectRequiredVideoFilterNames } from '@ffcodec/domain/filters/video-filter-builder'
import type { Diagnostic } from '@ffcodec/domain/rules/rule-types'
import { usePlatform } from '@ffcodec/platform-api'

/**
 * 将 Desktop 当前 FFmpeg 的已注册滤镜转换为共享诊断。
 * Web 没有本地 FFmpeg 能力，因此保持原有的纯命令生成行为。
 */
export function useRuntimeFilterDiagnostics(config: ProjectConfig): Diagnostic[] {
  const { extensions } = usePlatform()
  const loader = extensions?.getFilterCapabilities
  const onFFmpegSelectionChange = extensions?.onFFmpegSelectionChange
  const [capabilities, setCapabilities] = useState<string[] | null | undefined>(
    loader ? undefined : null,
  )
  const requiredFilters = useMemo(() => collectRequiredVideoFilterNames(config), [config])

  useEffect(() => {
    if (!loader) {
      setCapabilities(null)
      return
    }
    let cancelled = false
    let requestId = 0
    const load = () => {
      const currentRequest = ++requestId
      setCapabilities(undefined)
      loader()
        .then((result) => {
          if (!cancelled && currentRequest === requestId) setCapabilities(result?.filters ?? null)
        })
        .catch(() => {
          if (!cancelled && currentRequest === requestId) setCapabilities(null)
        })
    }
    load()
    const unsubscribe = onFFmpegSelectionChange?.(load)
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [loader, onFFmpegSelectionChange])

  return useMemo(() => {
    if (requiredFilters.length === 0 || !loader) return []

    if (capabilities === undefined) {
      return [diagnostic(
        'error.filter.capabilities.pending',
        'Checking the selected FFmpeg filter capabilities.',
      )]
    }
    if (capabilities === null) {
      return [diagnostic(
        'error.filter.capabilities.unknown',
        'Unable to inspect the selected FFmpeg filter capabilities.',
      )]
    }

    const available = new Set(capabilities)
    const unavailable = requiredFilters.filter((name) => !available.has(name))
    if (unavailable.length === 0) return []
    return [diagnostic(
      'error.filter.capabilities.unavailable',
      `The selected FFmpeg does not provide: ${unavailable.join(', ')}.`,
      { filters: unavailable },
    )]
  }, [capabilities, loader, requiredFilters])
}

function diagnostic(code: string, message: string, context: Record<string, unknown> = {}): Diagnostic {
  return {
    code,
    severity: 'error',
    category: 'availability',
    message,
    originIds: ['filter.chain'],
    context,
  }
}
