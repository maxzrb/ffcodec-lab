import { describe, it, expect } from 'vitest'
import { normalizeConfig } from '@ffcodec/domain/normalization/normalize-config'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'

const catalog = loadCatalog()

describe('Normalizer', () => {
  it('preserves valid quality mode when switching to same encoder', () => {
    const prev = createDefaultProjectConfig()
    const next = createDefaultProjectConfig()

    const result = normalizeConfig(prev, next, catalog)

    expect(result.config.video.rateControl?.mode).toBe('crf')
    expect(result.config.video.rateControl?.qualityValue).toBe(23)
    expect(result.notices.length).toBe(0)
  })

  it('resets invalid preset on encoder switch', () => {
    const prev = createDefaultProjectConfig()
    const next: ProjectConfig = {
      ...createDefaultProjectConfig(),
      video: {
        ...createDefaultProjectConfig().video,
        encoderId: 'libsvtav1',
        preset: 'medium', // libsvtav1 uses numeric presets, 'medium' is invalid
      },
    }

    const result = normalizeConfig(prev, next, catalog)

    // libsvtav1 preset is numeric, 'medium' should be reset
    expect(result.notices.length).toBeGreaterThan(0)
    expect(result.notices.some((n) => n.fieldId === 'video.preset')).toBe(true)
  })

  it('resets invalid profile on encoder switch', () => {
    const prev = createDefaultProjectConfig()
    const next: ProjectConfig = {
      ...createDefaultProjectConfig(),
      video: {
        ...createDefaultProjectConfig().video,
        encoderId: 'libsvtav1',
        profile: 'baseline', // libsvtav1 doesn't have baseline
      },
    }

    const result = normalizeConfig(prev, next, catalog)

    expect(result.notices.some((n) => n.fieldId === 'video.profile')).toBe(true)
  })

  it('resets quality value outside new encoder range', () => {
    const prev = createDefaultProjectConfig()

    // Use out-of-range value
    const nextOOR: ProjectConfig = {
      ...createDefaultProjectConfig(),
      video: {
        ...createDefaultProjectConfig().video,
        encoderId: 'libx264',
        rateControl: {
          mode: 'crf',
          qualityValue: 100, // out of range for libx264 CRF max 51
          additionalValues: {},
        },
      },
    }

    const result = normalizeConfig(prev, nextOOR, catalog)

    expect(result.notices.some((n) => n.fieldId === 'video.rateControl.qualityValue')).toBe(true)
  })

  it('clears special parameters from old encoder', () => {
    const prev: ProjectConfig = {
      ...createDefaultProjectConfig(),
      video: {
        ...createDefaultProjectConfig().video,
        encoderId: 'libx264',
        specialParameters: { '-x264-params': 'keyint=250' },
      },
    }
    const next: ProjectConfig = {
      ...createDefaultProjectConfig(),
      video: {
        ...createDefaultProjectConfig().video,
        encoderId: 'libx265',
      },
    }

    const result = normalizeConfig(prev, next, catalog)

    expect(result.config.video.specialParameters).toEqual({})
    expect(result.notices.some((n) => n.fieldId === 'video.specialParameters')).toBe(true)
  })

  it('切换输出容器时同步替换输出文件扩展名', () => {
    const previous = createDefaultProjectConfig()
    previous.output.path = 'D:\\Exports\\demo.final.mp4'
    const next = structuredClone(previous)
    next.output.containerId = 'mkv'

    const result = normalizeConfig(previous, next, catalog)

    expect(result.config.output.path).toBe('D:\\Exports\\demo.final.mkv')
    expect(result.notices.some((notice) => notice.fieldId === 'output.path')).toBe(true)
  })

  it('输入已知容器扩展名时同步切换输出容器', () => {
    const previous = createDefaultProjectConfig()
    const next = structuredClone(previous)
    next.output.path = '/exports/video.webm'

    const result = normalizeConfig(previous, next, catalog)

    expect(result.config.output.containerId).toBe('webm')
    expect(result.config.output.path).toBe('/exports/video.webm')
    expect(result.notices.some((notice) => notice.fieldId === 'output.containerId')).toBe(true)
  })
})
