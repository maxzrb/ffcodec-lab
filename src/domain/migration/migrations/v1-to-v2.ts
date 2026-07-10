// ============================================================
// Migration v1 → v2: subtitle.mux (single) → subtitle.tracks[]
// ============================================================

import type { MigrationStep } from '../migrate-config'

export const v1ToV2: MigrationStep = {
  fromVersion: 1,
  toVersion: 2,

  migrate(config: Record<string, unknown>): {
    config: Record<string, unknown>
    warnings: string[]
  } {
    const warnings: string[] = []
    const subtitle = (config.subtitle as Record<string, unknown> | undefined) ?? {}
    const oldMux = subtitle.mux as Record<string, unknown> | undefined
    const burn = subtitle.burn ?? {
      enabled: false,
      source: 'external',
      filterKind: 'subtitles',
      style: {},
    }

    const tracks: unknown[] = []

    if (oldMux?.enabled === true) {
      const codecMode = oldMux.codecMode as string | undefined
      const track: Record<string, unknown> = {
        id: 'track-1',
        source: oldMux.source ?? 'external',
        mainStreamRelIndex: oldMux.source === 'internal' ? 0 : undefined,
        path: oldMux.source === 'external' ? oldMux.externalPath : undefined,
        codecMode: codecMode === 'auto' || codecMode === 'copy' ? 'copy' : 'transcode',
        codec:
          codecMode && codecMode !== 'auto' && codecMode !== 'copy'
            ? codecMode
            : undefined,
        sourceCodecKnown: false,
        disposition: {},
      }
      tracks.push(track)
      warnings.push(
        '旧版单字幕配置已迁移为多轨道格式 (v1→v2)，请检查字幕设置',
      )
    }

    return {
      config: {
        ...config,
        schemaVersion: 2,
        subtitle: { tracks, burn },
      },
      warnings,
    }
  },
}
