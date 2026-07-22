import { useEffect, useState } from 'react'
import { usePlatform } from '@ffcodec/platform-api'

export interface AudioEncoderRuntimeCapabilities {
  encoders: string[]
  aacOptions: string[]
}

export function useAudioEncoderCapabilities(): AudioEncoderRuntimeCapabilities | null | undefined {
  const { extensions } = usePlatform()
  const loader = extensions?.getAudioEncoderCapabilities
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
    loader()
      .then((result) => { if (!cancelled) setCapabilities(result) })
      .catch(() => { if (!cancelled) setCapabilities(null) })
    return () => { cancelled = true }
  }, [loader])

  useEffect(() => {
    setOverrideEnabled(extensions?.getAudioCapabilityOverride?.() ?? false)
    return extensions?.onAudioCapabilityOverrideChange?.(setOverrideEnabled)
  }, [extensions])

  return overrideEnabled ? null : capabilities
}
