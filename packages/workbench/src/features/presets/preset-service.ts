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
    {
      name: 'H.264 日常均衡',
      description: 'libx264 CRF 23 + AAC 192k，适合日常压制',
      schemaVersion: CURRENT_PRESET_SCHEMA_VERSION,
      config: createDefaultProjectConfig(),
    },
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
      name: 'AV1 节省空间',
      description: 'libsvtav1 CRF36 yuv420p10le film-grain=4 + Opus 128k compression_level=10，适合高压缩效率输出',
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
      name: '视频流复制',
      description: '视频和音频流直接复制，仅更换容器',
      schemaVersion: CURRENT_PRESET_SCHEMA_VERSION,
      config: {
        ...createDefaultProjectConfig(),
        video: { ...createDefaultProjectConfig().video, mode: 'copy' },
        audio: { ...createDefaultProjectConfig().audio, mode: 'copy' },
      },
    },
    {
      name: '仅提取音频',
      description: '禁用视频，仅输出 AAC 音频',
      schemaVersion: CURRENT_PRESET_SCHEMA_VERSION,
      config: {
        ...createDefaultProjectConfig(),
        output: { ...createDefaultProjectConfig().output, containerId: 'mp4' },
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
