import { describe, it, expect, beforeEach } from 'vitest'
import { PresetService } from '@ffcodec/workbench/features/presets/preset-service'
import { getBuiltinPresets } from '@ffcodec/workbench/features/presets/preset-service'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'

// In-memory storage adapter for testing
class MemoryStorage {
  private store = new Map<string, string>()
  getItem(key: string): string | null { return this.store.get(key) ?? null }
  setItem(key: string, value: string): void { this.store.set(key, value) }
  removeItem(key: string): void { this.store.delete(key) }
  keys(): string[] { return Array.from(this.store.keys()) }
}

describe('PresetService', () => {
  let service: PresetService
  let storage: MemoryStorage

  beforeEach(() => {
    storage = new MemoryStorage()
    service = new PresetService(storage)
  })

  it('saves and loads a preset', () => {
    const config = createDefaultProjectConfig()
    const saved = service.save({ name: 'Test Preset', config })

    expect(saved.id).toBeDefined()
    expect(saved.name).toBe('Test Preset')
    expect(saved.config.video.encoderId).toBe('libx264')
    expect(saved.schemaVersion).toBe(1)

    const loaded = service.load(saved.id)
    expect(loaded).not.toBeNull()
    expect(loaded!.name).toBe('Test Preset')
    expect(loaded!.config.video.encoderId).toBe('libx264')
  })

  it('loads v2 project config as schema v4 without enabling pixel conversion', () => {
    const legacy = createDefaultProjectConfig()
    legacy.schemaVersion = 2
    delete legacy.video.color
    const filters = legacy.frame.filters as unknown as Record<string, unknown>
    delete filters.denoise
    delete filters.deband
    const saved = service.save({ name: 'Legacy v2', config: legacy })

    const loaded = service.load(saved.id)
    expect(loaded?.config.schemaVersion).toBe(6)
    expect(loaded?.config.video.color).toEqual({ operation: 'metadata-only', filter: 'zscale', toneMap: 'none' })
    expect(loaded?.config.frame.filters?.denoise.enabled).toBe(false)
    expect(loaded?.config.frame.filters?.deband.enabled).toBe(false)
  })

  it('lists saved presets sorted by updatedAt', async () => {
    service.save({ name: 'First', config: createDefaultProjectConfig() })
    // Small delay to ensure different timestamps
    await new Promise((r) => setTimeout(r, 10))
    service.save({ name: 'Second', config: createDefaultProjectConfig() })

    const list = service.list()
    expect(list.length).toBe(2)
    expect(list[0].name).toBe('Second') // Most recent first
  })

  it('updates an existing preset', () => {
    const saved = service.save({ name: 'Original', config: createDefaultProjectConfig() })
    const updated = service.save({
      id: saved.id,
      name: 'Updated',
      config: {
        ...createDefaultProjectConfig(),
        video: { ...createDefaultProjectConfig().video, encoderId: 'libx265' },
      },
    })

    expect(updated.id).toBe(saved.id)
    expect(updated.name).toBe('Updated')
    const loaded = service.load(saved.id)
    expect(loaded!.config.video.encoderId).toBe('libx265')
  })

  it('deletes a preset', () => {
    const saved = service.save({ name: 'Delete Me', config: createDefaultProjectConfig() })
    expect(service.delete(saved.id)).toBe(true)
    expect(service.load(saved.id)).toBeNull()
    expect(service.delete(saved.id)).toBe(false)
  })

  it('renames a preset', () => {
    const saved = service.save({ name: 'Old Name', config: createDefaultProjectConfig() })
    const renamed = service.rename(saved.id, 'New Name')
    expect(renamed).not.toBeNull()
    expect(renamed!.name).toBe('New Name')
  })

  it('exports a preset as JSON string', () => {
    const saved = service.save({ name: 'Export Test', config: createDefaultProjectConfig() })
    const json = service.export(saved.id)
    expect(json).not.toBeNull()
    const parsed = JSON.parse(json!)
    expect(parsed.name).toBe('Export Test')
    expect(parsed.config).toBeDefined()
  })

  it('export returns null for nonexistent preset', () => {
    expect(service.export('nonexistent')).toBeNull()
  })

  it('imports a valid preset JSON', () => {
    const json = JSON.stringify({
      name: 'Imported',
      config: createDefaultProjectConfig(),
    })
    const { preset, warnings } = service.import(json)
    expect(preset.name).toBe('Imported')
    expect(preset.config).toBeDefined()
    expect(warnings.length).toBe(0)
  })

  it('rejects invalid JSON on import', () => {
    expect(() => service.import('not json')).toThrow('无效的 JSON 格式')
  })

  it('rejects preset with missing name on import', () => {
    const json = JSON.stringify({
      config: createDefaultProjectConfig(),
    })
    expect(() => service.import(json)).toThrow()
  })

  it('rejects preset with invalid config on import', () => {
    const json = JSON.stringify({
      name: 'Bad Config',
      config: { invalid: true },
    })
    expect(() => service.import(json)).toThrow()
  })

  it('warns when importing preset with newer schema version', () => {
    const json = JSON.stringify({
      name: 'Future Preset',
      schemaVersion: 999,
      config: createDefaultProjectConfig(),
    })
    const { warnings } = service.import(json)
    expect(warnings.length).toBeGreaterThan(0)
    expect(warnings[0]).toContain('999')
  })

  it('does not store command text in preset', () => {
    const config = createDefaultProjectConfig()
    const saved = service.save({ name: 'No Command', config })
    const json = service.export(saved.id)
    // Should contain config but not command text
    expect(json).toContain('"encoderId"')
    expect(json).not.toContain('ffmpeg -i') // No raw command
  })

  it('preserves config structure through save/load cycle', () => {
    const config: ProjectConfig = {
      ...createDefaultProjectConfig(),
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
        bitrate: '160k',
      },
    }
    const saved = service.save({ name: 'Complex', config })
    const loaded = service.load(saved.id)

    expect(loaded!.config.video.encoderId).toBe('libx265')
    expect(loaded!.config.video.rateControl!.qualityValue).toBe(24)
    expect(loaded!.config.audio.encoderId).toBe('libopus')
  })
})

describe('Built-in presets', () => {
  it('provides at least 5 built-in presets', () => {
    const builtins = getBuiltinPresets()
    expect(builtins.length).toBeGreaterThanOrEqual(5)
  })

  it('all built-in presets have valid configs', () => {
    const builtins = getBuiltinPresets()
    for (const preset of builtins) {
      expect(preset.name).toBeTruthy()
      expect(preset.config).toBeDefined()
      expect(preset.config.video).toBeDefined()
      expect(preset.config.audio).toBeDefined()
    }
  })

  it('video copy preset has mode=copy for both video and audio', () => {
    const builtins = getBuiltinPresets()
    const copyPreset = builtins.find((p) => p.name.includes('流复制') || p.name.includes('copy'))
    expect(copyPreset).toBeDefined()
    if (copyPreset) {
      expect(copyPreset.config.video.mode).toBe('copy')
      expect(copyPreset.config.audio.mode).toBe('copy')
    }
  })

  it('built-in presets contain only config, not command strings', () => {
    const builtins = getBuiltinPresets()
    const json = JSON.stringify(builtins)
    expect(json).not.toContain('ffmpeg')
  })

  it('全部内置预设默认不使用 WebM', () => {
    for (const preset of getBuiltinPresets()) {
      expect(preset.config.output.containerId, preset.name).not.toBe('webm')
    }
  })
})
