// ============================================================
// Preset service — CRUD operations for user presets.
// Stores ProjectConfig, never command strings.
// ============================================================

import type { ProjectConfig } from '@ffcodec/domain/config/project-config'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { projectConfigSchema } from '@ffcodec/domain/config/config-schema'
import { migrateConfig } from '@ffcodec/domain/migration/migrate-config'
import { ALL_MIGRATION_STEPS, CURRENT_SCHEMA_VERSION } from '@ffcodec/domain/migration/migration-registry'
import type { UserPreset, UserPresetImport } from './preset-types'
import {
  CURRENT_PRESET_SCHEMA_VERSION,
  userPresetSchema,
  userPresetImportSchema,
} from './preset-types'
import {
  StorageAdapter,
  LocalStorageAdapter,
  makePresetKey,
  ACTIVE_CONFIG_KEY,
  parsePresetKey,
} from './preset-storage'

// -- helpers ----------------------------------------------------

function generateId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function nowISO(): string {
  return new Date().toISOString()
}

// -- service ----------------------------------------------------

export class PresetService {
  private storage: StorageAdapter

  constructor(storage?: StorageAdapter) {
    this.storage = storage ?? new LocalStorageAdapter()
  }

  /** List all saved presets */
  list(): UserPreset[] {
    const presets: UserPreset[] = []
    for (const key of this.storage.keys()) {
      const id = parsePresetKey(key)
      if (!id) continue
      const preset = this.load(id)
      if (preset) presets.push(preset)
    }
    return presets.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  }

  /** Load a single preset by ID */
  load(id: string): UserPreset | null {
    try {
      const raw = this.storage.getItem(makePresetKey(id))
      if (!raw) return null
      const parsed = JSON.parse(raw)
      const validated = userPresetSchema.parse(parsed)
      const preset = this.migratePreset(validated)
      preset.config = migrateProjectConfig(preset.config)
      return preset
    } catch {
      return null
    }
  }

  /** Save a preset (create or update) */
  save(preset: { name: string; description?: string; config: ProjectConfig; id?: string; schemaVersion?: number }): UserPreset {
    const now = nowISO()
    const id = preset.id ?? generateId()
    const existing = preset.id ? this.load(preset.id) : null

    const record: UserPreset = {
      id,
      name: preset.name,
      description: preset.description,
      schemaVersion: preset.schemaVersion ?? CURRENT_PRESET_SCHEMA_VERSION,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      config: preset.config,
    }

    this.storage.setItem(makePresetKey(id), JSON.stringify(record))
    return record
  }

  /** Delete a preset */
  delete(id: string): boolean {
    const key = makePresetKey(id)
    if (!this.storage.getItem(key)) return false
    this.storage.removeItem(key)
    return true
  }

  /** Rename a preset */
  rename(id: string, newName: string): UserPreset | null {
    const preset = this.load(id)
    if (!preset) return null
    preset.name = newName
    preset.updatedAt = nowISO()
    this.storage.setItem(makePresetKey(id), JSON.stringify(preset))
    return preset
  }

  /** 交换相邻两项的顺序（用户自定义排序用） */
  moveOrder(id: string, direction: 'up' | 'down'): void {
    const presets = this.list()
    const idx = presets.findIndex((p) => p.id === id)
    if (idx === -1) return
    const otherIdx = direction === 'up' ? idx - 1 : idx + 1
    if (otherIdx < 0 || otherIdx >= presets.length) return

    const a = idx, b = otherIdx
    const orderA = presets[a].order ?? a
    const orderB = presets[b].order ?? b

    presets[a] = { ...presets[a], order: orderB, updatedAt: nowISO() }
    presets[b] = { ...presets[b], order: orderA, updatedAt: nowISO() }

    this.storage.setItem(makePresetKey(presets[a].id), JSON.stringify(presets[a]))
    this.storage.setItem(makePresetKey(presets[b].id), JSON.stringify(presets[b]))
  }

  /** Export a preset as JSON string */
  export(id: string): string | null {
    const preset = this.load(id)
    if (!preset) return null
    return JSON.stringify(preset, null, 2)
  }

  /** Import a preset from JSON string */
  import(json: string): { preset: UserPreset; warnings: string[] } {
    const warnings: string[] = []

    let parsed: unknown
    try {
      parsed = JSON.parse(json)
    } catch {
      throw new Error('无效的 JSON 格式')
    }

    // Validate with import schema
    const imported = userPresetImportSchema.parse(parsed) as UserPresetImport

    // Check schema version
    if (imported.schemaVersion && imported.schemaVersion > CURRENT_PRESET_SCHEMA_VERSION) {
      warnings.push(
        `预设 schema 版本 ${imported.schemaVersion} 高于当前版本 ${CURRENT_PRESET_SCHEMA_VERSION}，部分设置可能丢失`,
      )
    }

    const now = nowISO()
    const preset: UserPreset = {
      id: imported.id ?? generateId(),
      name: imported.name,
      description: imported.description,
      schemaVersion: imported.schemaVersion ?? CURRENT_PRESET_SCHEMA_VERSION,
      createdAt: imported.createdAt ?? now,
      updatedAt: imported.updatedAt ?? now,
      config: migrateProjectConfig(imported.config),
    }

    // Run migration if needed
    const migrated = this.migratePreset(preset)

    return { preset: migrated, warnings }
  }

  /** Import and save */
  importAndSave(json: string): { preset: UserPreset; warnings: string[] } {
    const { preset, warnings } = this.import(json)
    this.save(preset)
    return { preset, warnings }
  }

  /** Save the active config to localStorage */
  saveActiveConfig(config: ProjectConfig): void {
    try {
      this.storage.setItem(ACTIVE_CONFIG_KEY, JSON.stringify(config))
    } catch {
      // Silently ignore persistence errors
    }
  }

  /** Load the active config from localStorage */
  loadActiveConfig(): ProjectConfig | null {
    try {
      const raw = this.storage.getItem(ACTIVE_CONFIG_KEY)
      if (!raw) return null
      return migrateProjectConfig(JSON.parse(raw) as ProjectConfig)
    } catch {
      return null
    }
  }

  /** Migrate a preset to the current schema version */
  private migratePreset(preset: UserPreset): UserPreset {
    if (preset.schemaVersion >= CURRENT_PRESET_SCHEMA_VERSION) return preset

    // Migration v0 → v1: add schemaVersion field if missing
    if (preset.schemaVersion < 1) {
      preset.schemaVersion = 1
    }

    // Future migrations go here:
    // if (preset.schemaVersion < 2) { ... }

    return preset
  }
}

function migrateProjectConfig(config: ProjectConfig): ProjectConfig {
  const version = typeof config.schemaVersion === 'number' ? config.schemaVersion : CURRENT_SCHEMA_VERSION
  const migrated = migrateConfig(
    version,
    CURRENT_SCHEMA_VERSION,
    config as unknown as Record<string, unknown>,
    [...ALL_MIGRATION_STEPS],
  ).config
  return projectConfigSchema.parse(migrated) as ProjectConfig
}

// -- singleton ---------------------------------------------------

let _instance: PresetService | null = null

export function getPresetService(): PresetService {
  if (!_instance) {
    _instance = new PresetService()
  }
  return _instance
}

// -- built-in presets -------------------------------------------

export function getBuiltinPresets(): Omit<UserPreset, 'id' | 'createdAt' | 'updatedAt'>[] {
  return [
    // ── 通用编码 ──
    {
      name: 'H.264 日常均衡',
      description: 'libx264 CRF 23 + AAC 192k，MKV，适合日常压制',
      schemaVersion: CURRENT_PRESET_SCHEMA_VERSION,
      config: {
        ...createDefaultProjectConfig(),
        output: { ...createDefaultProjectConfig().output, containerId: 'mkv' },
      },
    },
    {
      name: 'H.265 高质量',
      description: 'libx265 CRF 24 + Opus 128k，HEVC 高效率编码',
      schemaVersion: CURRENT_PRESET_SCHEMA_VERSION,
      config: {
        ...createDefaultProjectConfig(),
        output: { ...createDefaultProjectConfig().output, containerId: 'mkv' },
        video: {
          ...createDefaultProjectConfig().video,
          encoderId: 'libx265',
          rateControl: {
            mode: 'crf',
            qualityValue: 24,
            additionalValues: {},
          },
        },
        audio: {
          ...createDefaultProjectConfig().audio,
          encoderId: 'libopus',
          bitrate: '128k',
        },
      },
    },
    {
      name: 'H265 RTX UHQ超压',
      description: 'hevc_nvenc p7/uhq/main10/p010le CQ30 + libopus 112k VBR soxr，适用于 NVIDIA GPU 的高质量 HEVC 硬件转码，输出 MKV',
      schemaVersion: CURRENT_PRESET_SCHEMA_VERSION,
      config: {
        ...createDefaultProjectConfig(),
        output: {
          ...createDefaultProjectConfig().output,
          path: 'output.mkv',
          containerId: 'mkv',
          overwrite: true,
        },
        streams: {
          ...createDefaultProjectConfig().streams,
          preserveAllVideoStreams: true,
          preserveAllAudioStreams: true,
          preserveAllSubtitleStreams: true,
        },
        video: {
          ...createDefaultProjectConfig().video,
          encoderId: 'hevc_nvenc',
          preset: 'p7',
          tune: 'uhq',
          profile: 'main10',
          pixelFormat: 'p010le',
          rateControl: {
            mode: 'nvenc-cq',
            qualityValue: 30,
            additionalValues: {},
          },
          specialParameters: {
            spatialAq: true,
            aqStrength: 10,
            bFrames: 5,
            bRefMode: 'middle',
          },
        },
        audio: {
          ...createDefaultProjectConfig().audio,
          encoderId: 'libopus',
          bitrate: '112k',
          channelLayout: 'source',
          sampleRate: 0,
        },
        customArgs: {
          ...createDefaultProjectConfig().customArgs,
          audioFilters: ['aresample=48000:resampler=soxr:precision=28:cheby=1:out_chlayout=stereo'],
          audioArgs: ['-compression_level:a', '10'],
        },
      },
    },
    {
      name: 'AV1 节省空间',
      description: 'libsvtav1 CRF36 yuv420p10le film-grain=4 + Opus 128k，适合高压缩效率输出',
      schemaVersion: CURRENT_PRESET_SCHEMA_VERSION,
      config: {
        ...createDefaultProjectConfig(),
        output: {
          ...createDefaultProjectConfig().output,
          path: 'output.mkv',
          containerId: 'mkv',
          overwrite: true,
        },
        video: {
          ...createDefaultProjectConfig().video,
          encoderId: 'libsvtav1',
          preset: 6,
          profile: 'auto',
          pixelFormat: 'yuv420p10le',
          rateControl: {
            mode: 'crf',
            qualityValue: 36,
            additionalValues: {},
          },
          specialParameters: {
            svtav1Params:
              'tune=0:keyint=10s:enable-variance-boost=1:variance-boost-strength=1:film-grain=4:film-grain-denoise=1:sharpness=1:ac-bias=1:lp=4',
          },
        },
        audio: {
          ...createDefaultProjectConfig().audio,
          encoderId: 'libopus',
          bitrate: '128k',
        },
        customArgs: {
          ...createDefaultProjectConfig().customArgs,
          audioArgs: ['-compression_level:a:0', '10'],
        },
      },
    },
    {
      name: 'AVIF 高压缩图片',
      description: 'libaom-av1 still-picture CRF18 cpu-used=1 row-mt=1，输出单帧 AVIF 图片（请用「自定义容器」设为 avif）',
      schemaVersion: CURRENT_PRESET_SCHEMA_VERSION,
      config: {
        ...createDefaultProjectConfig(),
        output: {
          ...createDefaultProjectConfig().output,
          path: 'output.avif',
          containerId: 'avif',
          overwrite: true,
        },
        video: {
          ...createDefaultProjectConfig().video,
          encoderId: 'libaom_av1',
          rateControl: {
            mode: 'crf',
            qualityValue: 18,
            additionalValues: {},
          },
        },
        audio: { ...createDefaultProjectConfig().audio, mode: 'disabled' },
        customArgs: {
          ...createDefaultProjectConfig().customArgs,
          videoArgs: ['-still-picture', '1', '-row-mt', '1'],
          audioArgs: [],
        },
      },
    },
    // ── 特殊用途 ──
    {
      name: '上传材料专用',
      description: 'MP4 + H.264 Main/yuv420p + AAC 128k，目标 1900 MiB；应用后请填写素材实际时长',
      schemaVersion: CURRENT_PRESET_SCHEMA_VERSION,
      config: {
        ...createDefaultProjectConfig(),
        output: {
          ...createDefaultProjectConfig().output,
          path: 'output.mp4',
          containerId: 'mp4',
        },
        streams: {
          ...createDefaultProjectConfig().streams,
          videoStreams: [{ index: 0, codecMode: 'encode' }],
          audioStreams: [{ index: 0, codecMode: 'encode' }],
          subtitleStreams: [],
          preserveAllVideoStreams: false,
          preserveAllAudioStreams: false,
          preserveAllSubtitleStreams: false,
        },
        video: {
          ...createDefaultProjectConfig().video,
          encoderId: 'libx264',
          preset: 'medium',
          profile: 'main',
          tune: 'auto',
          pixelFormat: 'yuv420p',
        },
        audio: {
          ...createDefaultProjectConfig().audio,
          encoderId: 'aac',
          bitrate: '128k',
          channelLayout: 'stereo',
          sampleRate: 48000,
        },
        tools: {
          targetSize: {
            enabled: true,
            targetMiB: 1900,
            durationMinutes: 60,
            overheadPercent: 5,
          },
        },
        customArgs: {
          ...createDefaultProjectConfig().customArgs,
          preOutputArgs: ['-movflags', '+faststart'],
        },
      },
    },
    {
      name: '视频流复制',
      description: '视频和音频流直接复制，仅更换 MKV 容器',
      schemaVersion: CURRENT_PRESET_SCHEMA_VERSION,
      config: {
        ...createDefaultProjectConfig(),
        output: { ...createDefaultProjectConfig().output, containerId: 'mkv' },
        video: { ...createDefaultProjectConfig().video, mode: 'copy' },
        audio: { ...createDefaultProjectConfig().audio, mode: 'copy' },
      },
    },
    {
      name: 'MKV 无损封装',
      description: 'MKV 容器，保留全部视频/音频/字幕/附件流、章节和全局元数据，不做任何重新编码',
      schemaVersion: CURRENT_PRESET_SCHEMA_VERSION,
      config: {
        ...createDefaultProjectConfig(),
        output: {
          ...createDefaultProjectConfig().output,
          path: 'output.mkv',
          containerId: 'mkv',
          overwrite: true,
        },
        streams: {
          ...createDefaultProjectConfig().streams,
          preserveAllVideoStreams: true,
          preserveAllAudioStreams: true,
          preserveAllSubtitleStreams: true,
        },
        video: { ...createDefaultProjectConfig().video, mode: 'copy' },
        audio: { ...createDefaultProjectConfig().audio, mode: 'copy' },
        customArgs: {
          ...createDefaultProjectConfig().customArgs,
          preOutputArgs: ['-map 0:t?', '-c:t copy', '-map_metadata 0', '-map_chapters 0'],
        },
      },
    },
    {
      name: '仅提取音频',
      description: '禁用视频，仅输出 AAC 音频，MKV 容器',
      schemaVersion: CURRENT_PRESET_SCHEMA_VERSION,
      config: {
        ...createDefaultProjectConfig(),
        output: { ...createDefaultProjectConfig().output, containerId: 'mkv' },
        video: { ...createDefaultProjectConfig().video, mode: 'disabled' },
        audio: {
          ...createDefaultProjectConfig().audio,
          mode: 'encode',
          encoderId: 'aac',
          bitrate: '320k',
        },
      },
    },
  ]
}
