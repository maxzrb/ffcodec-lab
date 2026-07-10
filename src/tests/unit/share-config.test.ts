import { describe, it, expect } from 'vitest'
import { createDefaultProjectConfig } from '../../domain/config/defaults'
import {
  encodeConfigToShare,
  decodeConfigFromShare,
  toShareable,
} from '../../features/sharing/share-codec'

describe('Share config — encoding', () => {
  it('encodeConfigToShare returns hash for normal config', () => {
    const config = createDefaultProjectConfig()
    const result = encodeConfigToShare(config)
    expect(result.kind).toBe('hash')
    expect(result.value.startsWith('#')).toBe(true)
  })

  it('hash does not contain command text', () => {
    const config = createDefaultProjectConfig()
    const result = encodeConfigToShare(config)
    expect(result.value).not.toContain('ffmpeg')
    expect(result.value).not.toContain('-c:v')
    expect(result.value).not.toContain('-crf')
  })

  it('toShareable strips local paths', () => {
    const config = {
      ...createDefaultProjectConfig(),
      input: { path: '/home/user/video.mkv', additionalInputs: [] as never[] },
      output: { path: '/home/user/output.mp4', containerId: 'mp4', overwrite: false },
    }
    const shareable = toShareable(config)
    // Shareable does not have input.path or output.path
    expect((shareable as Record<string, unknown>).input).toBeUndefined()
    const out = (shareable as Record<string, unknown>).o as Record<string, unknown> | undefined
    expect(out?.path).toBeUndefined()
  })
})

describe('Share config — decoding', () => {
  it('round-trips config correctly', () => {
    const config = createDefaultProjectConfig()
    const encoded = encodeConfigToShare(config)
    const decoded = decodeConfigFromShare(encoded.value)

    expect(decoded.success).toBe(true)
    expect(decoded.config).toBeDefined()
    expect(decoded.config!.video.encoderId).toBe('libx264')
    expect(decoded.config!.output.containerId).toBe('mp4')
  })

  it('rejects invalid hash', () => {
    const decoded = decodeConfigFromShare('#this-is-not-valid-base64!!!')
    expect(decoded.success).toBe(false)
  })

  it('warns on future schema version', () => {
    // Create a payload with future version
    const json = JSON.stringify({ v: 999, c: toShareable(createDefaultProjectConfig()) })
    const encoded = '#' + btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const decoded = decodeConfigFromShare(encoded)
    // May succeed with warnings or fail
    if (decoded.success) {
      expect(decoded.warnings.length).toBeGreaterThan(0)
    }
  })

  it('preserves NVENC-specific config through round-trip', () => {
    const config = {
      ...createDefaultProjectConfig(),
      video: {
        ...createDefaultProjectConfig().video,
        encoderId: 'h264_nvenc',
        rateControl: {
          mode: 'nvenc-cq' as const,
          qualityValue: 23,
          additionalValues: {},
        },
      },
    }
    const encoded = encodeConfigToShare(config)
    const decoded = decodeConfigFromShare(encoded.value)

    expect(decoded.success).toBe(true)
    expect(decoded.config!.video.encoderId).toBe('h264_nvenc')
  })
})
