// ============================================================
// share-codec — URL hash encode/decode for ProjectConfig sharing.
// Never includes command text, local file paths, or customArgs.
// ============================================================

import type { ProjectConfig } from '@ffcodec/domain/config/project-config'
import {
  type ShareableProjectConfig,
  SHARE_PAYLOAD_VERSION,
  shareableConfigSchema,
} from './share-schema'
import { migrateConfig } from '@ffcodec/domain/migration/migrate-config'
import { ALL_MIGRATION_STEPS, CURRENT_SCHEMA_VERSION } from '@ffcodec/domain/migration/migration-registry'

/** Maximum URL hash length before falling back to JSON export */
const MAX_HASH_LENGTH = 2000

/** Convert ProjectConfig to privacy-safe ShareableProjectConfig */
export function toShareable(config: ProjectConfig): ShareableProjectConfig {
  return {
    sv: config.schemaVersion,
    shell: config.shell,
    v: {
      mode: config.video.mode,
      encoderId: config.video.encoderId,
      rateControl: config.video.rateControl,
      preset: config.video.preset,
      profile: config.video.profile,
      tune: config.video.tune,
      pixelFormat: config.video.pixelFormat,
      color: config.video.color,
      specialParameters: config.video.specialParameters,
    },
    f: {
      resolution: config.frame.resolution,
      frameRate: config.frame.frameRate,
      filters: config.frame.filters,
    },
    a: {
      mode: config.audio.mode,
      encoderId: config.audio.encoderId,
      bitrate: config.audio.bitrate,
      channelLayout: config.audio.channelLayout,
      sampleRate: config.audio.sampleRate,
      qualityValues: config.audio.qualityValues,
      ln: {
        ei: config.audio.loudnessNormalization.integratedLoudnessEnabled,
        i: config.audio.loudnessNormalization.integratedLoudness,
        el: config.audio.loudnessNormalization.loudnessRangeEnabled,
        l: config.audio.loudnessNormalization.loudnessRange,
        et: config.audio.loudnessNormalization.truePeakEnabled,
        t: config.audio.loudnessNormalization.truePeak,
        dm: config.audio.loudnessNormalization.dualMono,
      },
    },
    s: {
      tracks: config.subtitle.tracks.map((t) => ({
        id: t.id,
        source: t.source,
        mainStreamRelIndex: t.mainStreamRelIndex,
        codecMode: t.codecMode,
        codec: t.codec,
        sourceCodecKnown: t.sourceCodecKnown,
        language: t.language,
        title: t.title,
        disposition: t.disposition,
        // path intentionally excluded — privacy
      })),
      burn: {
        enabled: config.subtitle.burn.enabled,
        source: config.subtitle.burn.source,
        filterKind: config.subtitle.burn.filterKind,
        // style and externalPath intentionally excluded — privacy
      },
    },
    o: {
      containerId: config.output.containerId,
      overwrite: config.output.overwrite,
      meta: config.output.metadata ?? { globalRaw: '', streamRaw: '' },
      // path intentionally excluded — privacy
    },
    m: {
      videoStreams: config.streams.videoStreams,
      audioStreams: config.streams.audioStreams,
      subtitleStreams: config.streams.subtitleStreams,
    },
    u: config.tools,
  }
}

/** Merge ShareableProjectConfig into a base ProjectConfig */
export function fromShareable(
  shareable: ShareableProjectConfig,
  base?: Partial<ProjectConfig>,
): ProjectConfig {
  const defaults: ProjectConfig = {
    schemaVersion: shareable.sv,
    shell: shareable.shell,
    input: { path: base?.input?.path ?? 'input.mkv', additionalInputs: [] },
    output: {
      path: base?.output?.path ?? 'output.' + shareable.o.containerId,
      containerId: shareable.o.containerId,
      overwrite: shareable.o.overwrite,
      metadata: shareable.o.meta ?? { globalRaw: '', streamRaw: '' },
    },
    streams: shareable.m ?? {
      videoStreams: [{ index: 0, codecMode: 'encode' as const }],
      audioStreams: [{ index: 0, codecMode: 'encode' as const }],
      subtitleStreams: [],
    },
    video: {
      mode: shareable.v.mode,
      encoderId: shareable.v.encoderId,
      rateControl: shareable.v.rateControl as ProjectConfig['video']['rateControl'],
      preset: shareable.v.preset,
      profile: shareable.v.profile,
      tune: shareable.v.tune,
      pixelFormat: shareable.v.pixelFormat,
      color: shareable.v.color ?? {},
      specialParameters: shareable.v.specialParameters,
    },
    frame: shareable.f as ProjectConfig['frame'],
    audio: {
      mode: shareable.a.mode,
      encoderId: shareable.a.encoderId,
      bitrate: shareable.a.bitrate,
      channelLayout: shareable.a.channelLayout,
      sampleRate: shareable.a.sampleRate,
      qualityValues: shareable.a.qualityValues,
      loudnessNormalization: shareable.a.ln ? {
        integratedLoudnessEnabled: shareable.a.ln.ei,
        integratedLoudness: shareable.a.ln.i,
        loudnessRangeEnabled: shareable.a.ln.el,
        loudnessRange: shareable.a.ln.l,
        truePeakEnabled: shareable.a.ln.et,
        truePeak: shareable.a.ln.t,
        dualMono: shareable.a.ln.dm,
      } : {
        integratedLoudnessEnabled: false, integratedLoudness: -24,
        loudnessRangeEnabled: false, loudnessRange: 7,
        truePeakEnabled: false, truePeak: -2, dualMono: false,
      },
    },
    subtitle: {
      tracks: shareable.s.tracks.map((t) => ({
        id: t.id,
        source: t.source,
        mainStreamRelIndex: t.mainStreamRelIndex,
        codecMode: t.codecMode,
        codec: t.codec,
        sourceCodecKnown: t.sourceCodecKnown,
        language: t.language,
        title: t.title,
        disposition: t.disposition ?? {},
      })),
      burn: {
        enabled: shareable.s.burn.enabled,
        source: shareable.s.burn.source,
        filterKind: shareable.s.burn.filterKind,
        style: {},
      },
    },
    tools: shareable.u,
    customArgs: { globalArgs: [], preInputArgs: [], videoArgs: [], audioArgs: [], preOutputArgs: [], tailArgs: [] },
  }
  return { ...defaults, ...base }
}

/** Base64url encode without padding */
function base64urlEncode(str: string): string {
  const encoded = btoa(unescape(encodeURIComponent(str)))
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Base64url decode */
function base64urlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  return decodeURIComponent(escape(atob(base64)))
}

export interface ShareResult {
  kind: 'hash' | 'json'
  value: string
}

/** Encode ProjectConfig to URL hash or JSON export */
export function encodeConfigToShare(config: ProjectConfig): ShareResult {
  const shareable = toShareable(config)
  const json = JSON.stringify({ v: SHARE_PAYLOAD_VERSION, c: shareable })
  const encoded = base64urlEncode(json)
  const hash = `#${encoded}`

  if (hash.length <= MAX_HASH_LENGTH) {
    return { kind: 'hash', value: hash }
  }
  return { kind: 'json', value: JSON.stringify({ v: SHARE_PAYLOAD_VERSION, c: shareable }, null, 2) }
}

export interface DecodeResult {
  success: boolean
  config?: ProjectConfig
  version?: number
  warnings: string[]
  error?: string
}

/** Decode URL hash or JSON string to ProjectConfig */
export function decodeConfigFromShare(input: string): DecodeResult {
  const warnings: string[] = []

  try {
    // Remove leading # if present
    const encoded = input.replace(/^#/, '')
    let raw: Record<string, unknown>

    // Try JSON first (for file import), then base64url (for hash)
    if (encoded.startsWith('{')) {
      raw = JSON.parse(encoded)
    } else {
      raw = JSON.parse(base64urlDecode(encoded))
    }

    if (raw.v === undefined) {
      return { success: false, warnings, error: 'Missing version in payload' }
    }

    if (typeof raw.v === 'number' && raw.v > SHARE_PAYLOAD_VERSION) {
      warnings.push(`配置来自未来版本 (v${raw.v})，部分设置可能不可用`)
    }

    const parsed = shareableConfigSchema.safeParse(raw.c)
    if (!parsed.success) {
      return {
        success: false,
        warnings,
        error: `Invalid config: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      }
    }

    let config = fromShareable(parsed.data)

    // Run migration if needed
    const migration = migrateConfig(
      config.schemaVersion,
      CURRENT_SCHEMA_VERSION,
      config as unknown as Record<string, unknown>,
      [...ALL_MIGRATION_STEPS],
    )
    warnings.push(...migration.warnings)
    config = migration.config as unknown as ProjectConfig

    return { success: true, config, version: raw.v as number, warnings }
  } catch (e) {
    return { success: false, warnings, error: `Decode failed: ${String(e)}` }
  }
}
