import { useEffect, useState } from 'react'
import { usePlatform } from '@ffcodec/platform-api'

export interface AudioEncoderRuntimeCapabilities {
  encoders: string[]
  aacOptions: string[]
}

export function useAudioEncoderCapabilities(): AudioEncoderRuntimeCapabilities | null | undefined {
  const { extensions } = usePlatform()
  const loader = extensions?.getAudioEncoderCapabilities
  const onFFmpegSelectionChange = extensions?.onFFmpegSelectionChange
  const [overrideEnabled, setOverrideEnabled] = useState(
    () => extensions?.getAudioCapabilityOverride?.() ?? false,
  )
  const [capabilities, setCapabilities] = useState<AudioEncoderRuntimeCapabilities | null | undefined>(
    loader ? undefined : null,
  )

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
          if (!cancelled && currentRequest === requestId) setCapabilities(result)
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

  useEffect(() => {
    setOverrideEnabled(extensions?.getAudioCapabilityOverride?.() ?? false)
    return extensions?.onAudioCapabilityOverrideChange?.(setOverrideEnabled)
  }, [extensions])

  return overrideEnabled ? null : capabilities
}
