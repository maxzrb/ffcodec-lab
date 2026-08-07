import { describe, it, expect, beforeEach } from 'vitest'
import { PresetService, getBuiltinPresets } from '@ffcodec/workbench/features/presets/preset-service'
import type { PresetFileScope, PresetFileStore } from '@ffcodec/platform-api'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { CURRENT_SCHEMA_VERSION } from '@ffcodec/domain/migration/migration-registry'
import { projectConfigSchema } from '@ffcodec/domain/config/config-schema'
import { calculateTargetSize } from '@ffcodec/domain/tools/target-size'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'

// In-memory storage adapter for testing
class MemoryStorage {
  private store = new Map<string, string>()
  getItem(key: string): string | null { return this.store.get(key) ?? null }
  setItem(key: string, value: string): void { this.store.set(key, value) }
  removeItem(key: string): void { this.store.delete(key) }
  keys(): string[] { return Array.from(this.store.keys()) }
}

// In-memory file store for testing the desktop JSON preset backend
class MemoryFileStore implements PresetFileStore {
  private store = new Map<string, { content: string; scope: PresetFileScope }>()
  private dir = 'C:\\\\presets'
  async listAll() { return Array.from(this.store.entries()).map(([fileName, v]) => ({ fileName, content: v.content, scope: v.scope })) }
  async read(fileName: string, scope?: PresetFileScope) {
    const v = this.store.get(fileName)
    if (!v) return null
    if (scope && v.scope !== scope) return null
    return v.content
  }
  async write(fileName: string, content: string, scope: PresetFileScope = 'user') { this.store.set(fileName, { content, scope }); return { ok: true } as const }
  async delete(fileName: string, scope?: PresetFileScope) {
    const v = this.store.get(fileName)
    if (!v || (scope && v.scope !== scope)) return { ok: false }
    return { ok: this.store.delete(fileName) }
  }
  async getDirectory() { return this.dir }
  async revealDirectory() { return true }
}

describe('PresetService', () => {
  let service: PresetService
  let storage: MemoryStorage

  beforeEach(() => {
    storage = new MemoryStorage()
    service = new PresetService(storage)
  })

  it('saves and loads a preset', async () => {
    const config = createDefaultProjectConfig()
    const saved = await service.save({ name: 'Test Preset', config })

    expect(saved.id).toBeDefined()
    expect(saved.name).toBe('Test Preset')
    expect(saved.config.video.encoderId).toBe('libx264')
    expect(saved.schemaVersion).toBe(1)

    const loaded = await service.load(saved.id)
    expect(loaded).not.toBeNull()
    expect(loaded!.name).toBe('Test Preset')
    expect(loaded!.config.video.encoderId).toBe('libx264')
  })

  it('预设完整保留滤镜格式协商策略', async () => {
    const config = createDefaultProjectConfig()
    config.frame.filters!.processing = {
      mode: 'custom',
      bitDepth: '12',
      chroma: '444',
      colorFamily: 'rgb',
      preserveAlpha: true,
      dither: 'random',
      incompatiblePolicy: 'warn',
    }
    const saved = await service.save({ name: 'Filter format policy', config })
    expect((await service.load(saved.id))?.config.frame.filters?.processing).toEqual(config.frame.filters!.processing)
  })

  it('预设完整保留自定义视频和音频滤镜顺序', async () => {
    const config = createDefaultProjectConfig()
    config.customArgs.videoFilters = ['hflip', 'eq=gamma=1.1']
    config.customArgs.audioFilters = ['highpass=f=80', 'volume=0.9']
    const saved = await service.save({ name: 'Custom filter order', config })
    expect((await service.load(saved.id))?.config.customArgs.videoFilters).toEqual(config.customArgs.videoFilters)
    expect((await service.load(saved.id))?.config.customArgs.audioFilters).toEqual(config.customArgs.audioFilters)
  })

  it('loads v2 project config as schema v4 without enabling pixel conversion', async () => {
    const legacy = createDefaultProjectConfig()
    legacy.schemaVersion = 2
    delete legacy.video.color
    const filters = legacy.frame.filters as unknown as Record<string, unknown>
    delete filters.denoise
    delete filters.deband
    const saved = await service.save({ name: 'Legacy v2', config: legacy })

    const loaded = await service.load(saved.id)
    expect(loaded?.config.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(loaded?.config.input.decode).toEqual({})
    expect(loaded?.config.video.color).toEqual({ operation: 'metadata-only', filter: 'zscale', toneMap: 'none' })
    expect(loaded?.config.frame.filters?.denoise.enabled).toBe(false)
    expect(loaded?.config.frame.filters?.deband.enabled).toBe(false)
  })

  it('lists saved presets sorted by updatedAt', async () => {
    await service.save({ name: 'First', config: createDefaultProjectConfig() })
    // Small delay to ensure different timestamps
    await new Promise((r) => setTimeout(r, 10))
    await service.save({ name: 'Second', config: createDefaultProjectConfig() })

    const list = await service.list()
    expect(list.length).toBe(2)
    expect(list[0].name).toBe('Second') // Most recent first
  })

  it('lists a large preset collection without truncation', async () => {
    for (let index = 0; index < 120; index++) {
      await service.save({ name: `Preset ${index}`, config: createDefaultProjectConfig() })
    }

    expect(await service.list()).toHaveLength(120)
  })

  it('updates an existing preset', async () => {
    const saved = await service.save({ name: 'Original', config: createDefaultProjectConfig() })
    const updated = await service.save({
      id: saved.id,
      name: 'Updated',
      config: {
        ...createDefaultProjectConfig(),
        video: { ...createDefaultProjectConfig().video, encoderId: 'libx265' },
      },
    })

    expect(updated.id).toBe(saved.id)
    expect(updated.name).toBe('Updated')
    const loaded = await service.load(saved.id)
    expect(loaded!.config.video.encoderId).toBe('libx265')
  })

  it('deletes a preset', async () => {
    const saved = await service.save({ name: 'Delete Me', config: createDefaultProjectConfig() })
    expect(await service.delete(saved.id)).toBe(true)
    expect(await service.load(saved.id)).toBeNull()
    expect(await service.delete(saved.id)).toBe(false)
  })

  it('renames a preset', async () => {
    const saved = await service.save({ name: 'Old Name', config: createDefaultProjectConfig() })
    const renamed = await service.rename(saved.id, 'New Name')
    expect(renamed).not.toBeNull()
    expect(renamed!.name).toBe('New Name')
  })

  it('exports a preset as JSON string', async () => {
    const saved = await service.save({ name: 'Export Test', config: createDefaultProjectConfig() })
    const json = await service.export(saved.id)
    expect(json).not.toBeNull()
    const parsed = JSON.parse(json!)
    expect(parsed.name).toBe('Export Test')
    expect(parsed.config).toBeDefined()
  })

  it('export returns null for nonexistent preset', async () => {
    expect(await service.export('nonexistent')).toBeNull()
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

  it('does not store command text in preset', async () => {
    const config = createDefaultProjectConfig()
    const saved = await service.save({ name: 'No Command', config })
    const json = await service.export(saved.id)
    // Should contain config but not command text
    expect(json).toContain('"encoderId"')
    expect(json).not.toContain('ffmpeg -i') // No raw command
  })

  it('preserves config structure through save/load cycle', async () => {
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
    const saved = await service.save({ name: 'Complex', config })
    const loaded = await service.load(saved.id)

    expect(loaded!.config.video.encoderId).toBe('libx265')
    expect(loaded!.config.video.rateControl!.qualityValue).toBe(24)
    expect(loaded!.config.audio.encoderId).toBe('libopus')
  })
})

describe('PresetService (文件模式 / 外挂 JSON)', () => {
  let service: PresetService
  let storage: MemoryStorage
  let fileStore: MemoryFileStore

  beforeEach(() => {
    storage = new MemoryStorage()
    fileStore = new MemoryFileStore()
    service = new PresetService(storage, fileStore)
  })

  it('首次 list 自动把内置预设写入目录（带 builtin 标记与稳定 id）', async () => {
    const list = await service.list()
    const builtinCount = getBuiltinPresets().length
    expect(list.length).toBe(builtinCount)
    expect(list.every((p) => p.builtin === true)).toBe(true)
    expect(list.every((p) => p.fileScope === 'builtin')).toBe(true)
    for (const bp of getBuiltinPresets()) {
      expect(list.some((p) => p.id === bp.id)).toBe(true)
    }
    expect(service.hasFileStore()).toBe(true)
  })

  it('已有内置标记文件时不重复生成种子', async () => {
    await service.list()
    const first = await fileStore.listAll()
    await service.list()
    expect(await fileStore.listAll()).toEqual(first)
  })

  it('用户保存的预设写入独立 JSON 文件', async () => {
    await service.list() // 先种子
    const saved = await service.save({ name: '我的预设', config: createDefaultProjectConfig() })
    const files = await fileStore.listAll()
    expect(files.length).toBe(getBuiltinPresets().length + 1)
    expect(files.some((f) => f.fileName === `${saved.id}.json`)).toBe(true)
    expect(files.find((f) => f.fileName === `${saved.id}.json`)?.scope).toBe('user')
    expect((await service.load(saved.id))?.name).toBe('我的预设')
    expect((await service.load(saved.id))?.fileScope).toBe('user')
    // 新用户预设自动排在全部内置预设之后
    const list = await service.list()
    expect(list[list.length - 1].id).toBe(saved.id)
    expect(list.every((p) => p.id === saved.id || (p.order ?? -1) < (saved.order ?? -1))).toBe(true)
  })

  it('支持用户手写 JSON：缺 id 时以文件名作为 id', async () => {
    await service.list()
    await fileStore.write('my-preset.json', JSON.stringify({
      name: '手写预设',
      schemaVersion: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      config: createDefaultProjectConfig(),
    }))
    const loaded = await service.load('my-preset')
    expect(loaded).not.toBeNull()
    expect(loaded!.name).toBe('手写预设')
  })

  it('删除内置预设文件后不会自动恢复', async () => {
    const list = await service.list()
    const first = list[0]
    expect(await service.delete(first.id)).toBe(true)
    const after = await service.list()
    expect(after.some((p) => p.id === first.id)).toBe(false)
    // 仍有其他内置标记存在，不会重新补种子
    expect(after.length).toBe(getBuiltinPresets().length - 1)
  })

  it('重命名与移动顺序写回 JSON 文件', async () => {
    const list = await service.list()
    const target = list[0]
    const renamed = await service.rename(target.id, '改名后')
    expect(renamed!.name).toBe('改名后')
    expect((await service.load(target.id))?.name).toBe('改名后')

    await service.moveOrder(list[1].id, 'up')
    const reordered = await service.list()
    expect(reordered[0].id).toBe(list[1].id)
  })

  it('无效 JSON 文件被跳过但不影响其他预设', async () => {
    await service.list()
    await fileStore.write('broken.json', '{ not valid json')
    const list = await service.list()
    expect(list.length).toBe(getBuiltinPresets().length)
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

  it('内置预设携带稳定 id 与 builtin 标记', () => {
    const builtins = getBuiltinPresets()
    for (const preset of builtins) {
      expect(preset.id).toBeTruthy()
      expect(preset.builtin).toBe(true)
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

  it('上传材料预设使用兼容配置和 1900 MiB 目标大小', () => {
    const preset = getBuiltinPresets().find((item) => item.name === '上传材料专用')
    expect(preset).toBeDefined()
    if (!preset) return

    expect(projectConfigSchema.safeParse(preset.config).success).toBe(true)
    expect(preset.config.output.containerId).toBe('mp4')
    expect(preset.config.video).toMatchObject({
      encoderId: 'libx264',
      profile: 'main',
      pixelFormat: 'yuv420p',
    })
    expect(preset.config.audio).toMatchObject({ encoderId: 'aac', bitrate: '128k' })
    expect(preset.config.tools.targetSize).toMatchObject({ enabled: true, targetMiB: 1900 })
    expect(preset.config.customArgs.preOutputArgs).toEqual(['-movflags', '+faststart'])

    const result = calculateTargetSize(preset.config, loadCatalog())
    expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === 'error')).toEqual([])
    expect(result.videoBitrateKbps).toBeGreaterThan(0)
  })
})
