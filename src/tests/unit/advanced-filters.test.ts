import { describe, expect, it } from 'vitest'
import { createDefaultProjectConfig } from '../../domain/config/defaults'
import { projectConfigSchema } from '../../domain/config/config-schema'
import { buildVideoFilterChain, renderFilterChain } from '../../domain/filters/video-filter-builder'
import { buildCommandPlan } from '../../domain/command/command-builder'
import { loadCatalog } from '../../domain/catalog/catalog-loader'

describe('高级视频滤镜', () => {
  it('按固定顺序合并为单个 -vf 参数', () => {
    const config = createDefaultProjectConfig()
    const filters = config.frame.filters!
    filters.deinterlace.enabled = true
    filters.crop = { enabled: true, width: 1280, height: 720, x: 10, y: 20 }
    config.frame.resolution = { mode: 'width', width: 960 }
    filters.transform.rotate = 'clockwise'
    filters.transform.horizontalFlip = true
    filters.adjustment.enabled = true
    filters.adjustment.brightness = 0.1
    filters.sharpen.enabled = true
    filters.sharpen.amount = 1.2
    config.frame.frameRate = { mode: 'value', value: 30 }

    const chain = buildVideoFilterChain(config)
    expect(chain.map((filter) => filter.type)).toEqual([
      'yadif',
      'crop',
      'scale',
      'transpose',
      'hflip',
      'eq',
      'unsharp',
      'fps',
    ])

    const argument = renderFilterChain(chain, 'filter.chain')
    expect(argument?.tokens[0]).toBe('-vf')
    expect(argument?.tokens[1]).toContain('crop=1280:720:10:20')
    expect(argument?.tokens[1]).toContain('transpose=clock')
    expect(argument?.tokens[1]).toContain('unsharp=luma_msize_x=5')

    const plan = buildCommandPlan(config, loadCatalog(), [])
    const filterArgs = plan.invocations.flatMap((invocation) => invocation.output.filterArgs)
    expect(filterArgs).toHaveLength(1)
  })

  it('旧版配置缺少 filters 时由 schema 补齐安全默认值', () => {
    const legacy = createDefaultProjectConfig()
    delete legacy.frame.filters

    const parsed = projectConfigSchema.parse(legacy)
    expect(parsed.frame.filters.crop.enabled).toBe(false)
    expect(parsed.frame.filters.transform.rotate).toBe('none')
  })

  it('视频复制模式不会生成滤镜链', () => {
    const config = createDefaultProjectConfig()
    config.video.mode = 'copy'
    config.frame.filters!.crop.enabled = true
    expect(buildVideoFilterChain(config)).toEqual([])
  })
})
