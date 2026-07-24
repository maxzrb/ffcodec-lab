import { describe, expect, it } from 'vitest'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { projectConfigSchema } from '@ffcodec/domain/config/config-schema'
import { buildVideoFilterChain, collectRequiredVideoFilterNames, renderFilterChain } from '@ffcodec/domain/filters/video-filter-builder'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { validateConfig } from '@ffcodec/domain/validation'
import { RuleIndex } from '@ffcodec/catalog/rule-index'
import { findOddExplicitResolutionDimensions, repairOddExplicitResolution } from '@ffcodec/domain/config/resolution-repair'
import type { ResolutionConfig } from '@ffcodec/domain/config/project-config'

describe('高级视频滤镜', () => {
  it('按固定顺序合并为单个 -vf 参数', () => {
    const config = createDefaultProjectConfig()
    const filters = config.frame.filters!
    filters.deinterlace.enabled = true
    filters.crop = { enabled: true, width: 1280, height: 720, x: 10, y: 20 }
    config.frame.resolution = { mode: 'width', width: 960 }
    filters.transform.rotate = 'clockwise'
    filters.transform.horizontalFlip = true
    filters.denoise = { enabled: true, algorithm: 'hqdn3d', values: { lumaSpatial: 5 } }
    filters.deband = { enabled: true, algorithm: 'deband', values: { threshold: 0.03 } }
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
      'denoise',
      'deband',
      'eq',
      'unsharp',
      'fps',
    ])

    const argument = renderFilterChain(chain, 'filter.chain')
    expect(argument?.tokens[0]).toBe('-vf')
    expect(argument?.tokens[1]).toContain('crop=1280:720:10:20')
    expect(argument?.tokens[1]).toContain('transpose=clock')
    expect(argument?.tokens[1]).toContain('unsharp=luma_msize_x=5')
    expect(argument?.tokens[1]).toContain('hqdn3d=5:3:6:4.5')
    expect(argument?.tokens[1]).toContain('deband=1thr=0.03:2thr=0.03:3thr=0.03')

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
    expect(parsed.frame.filters.denoise.enabled).toBe(false)
    expect(parsed.frame.filters.deband.enabled).toBe(false)
  })

  it('视频复制模式不会生成滤镜链', () => {
    const config = createDefaultProjectConfig()
    config.video.mode = 'copy'
    config.frame.filters!.crop.enabled = true
    expect(buildVideoFilterChain(config)).toEqual([])
  })

  it('仅写元数据保持旧行为，不生成色彩滤镜', () => {
    const config = createDefaultProjectConfig()
    config.video.color = {
      operation: 'metadata-only', filter: 'zscale', toneMap: 'none',
      space: 'bt709', primaries: 'bt709', transfer: 'bt709', range: 'tv',
    }
    expect(buildVideoFilterChain(config).some((item) => item.type === 'color')).toBe(false)
    const args = buildCommandPlan(config, loadCatalog(), []).invocations[0].output.codecArgs.flatMap((arg) => arg.tokens)
    expect(args).toContain('-colorspace')
  })

  it('zscale 色彩转换进入去色带之后、基础调色之前的唯一滤镜链', () => {
    const config = createDefaultProjectConfig()
    config.frame.filters!.deband = { enabled: true, algorithm: 'gradfun', values: {} }
    config.frame.filters!.adjustment.enabled = true
    config.video.color = {
      operation: 'convert-and-tag', filter: 'zscale', toneMap: 'none',
      space: 'bt709', primaries: 'bt709', transfer: 'bt709', range: 'tv',
    }
    const chain = buildVideoFilterChain(config)
    expect(chain.map((item) => item.type)).toEqual(['deband', 'color', 'eq'])
    const vf = renderFilterChain(chain, 'filter.chain')?.tokens[1]
    expect(vf).toContain('zscale=matrix=bt709:primaries=bt709:transfer=bt709:range=tv')
    expect(buildCommandPlan(config, loadCatalog(), []).invocations[0].output.filterArgs).toHaveLength(1)
  })

  it('CPU HDR 转 SDR 生成 zscale → float → tonemap → zscale → format', () => {
    const config = createDefaultProjectConfig()
    config.video.color = {
      operation: 'convert-and-tag', filter: 'zscale', toneMap: 'mobius', nominalPeak: 100,
      desaturation: 1.5, space: 'bt709', primaries: 'bt709', transfer: 'bt709', range: 'tv',
    }
    const vf = renderFilterChain(buildVideoFilterChain(config), 'filter.chain')?.tokens[1] ?? ''
    expect(vf).toContain('zscale=transfer=linear:npl=100,format=gbrpf32le')
    expect(vf).toContain('tonemap=tonemap=mobius:desat=1.5')
    expect(vf).toContain('zscale=matrix=bt709:primaries=bt709:transfer=bt709:range=tv,format=yuv420p')
  })

  it('从受控滤镜链提取 FFmpeg 能力核验所需名称', () => {
    const config = createDefaultProjectConfig()
    config.frame.filters!.denoise = { enabled: true, algorithm: 'bm3d', values: {} }
    config.video.color = {
      operation: 'convert-and-tag', filter: 'zscale', toneMap: 'mobius',
      space: 'bt709', primaries: 'bt709', transfer: 'bt709', range: 'tv',
    }

    expect(collectRequiredVideoFilterNames(config)).toEqual(['bm3d', 'zscale', 'format', 'tonemap'])
  })

  it('奇数显式尺寸可诊断并向上修复为偶数', () => {
    const config = createDefaultProjectConfig()
    config.frame.resolution = { mode: 'width', width: 223 }

    expect(findOddExplicitResolutionDimensions(config)).toEqual([
      { axis: 'width', value: 223, repairedValue: 224 },
    ])
    expect(validateConfig(config, loadCatalog(), new RuleIndex()).some(
      (message) => message.code === 'warn.resolution.dimension.odd' && message.severity === 'warning',
    )).toBe(true)

    const repaired = repairOddExplicitResolution(config)
    expect(repaired.frame.resolution).toEqual({ mode: 'width', width: 224 })
    const vf = renderFilterChain(buildVideoFilterChain(repaired), 'filter.chain')?.tokens[1]
    expect(vf).toBe('scale=224:-2')
  })

  it('所有缩放模式留空都会生成合法的自动偶数尺寸 scale=-2:-2', () => {
    const automaticResolutions: ResolutionConfig[] = [
      { mode: 'size', keepAspect: true },
      { mode: 'width' },
      { mode: 'height' },
    ]

    for (const resolution of automaticResolutions) {
      const config = createDefaultProjectConfig()
      config.frame.resolution = resolution

      expect(projectConfigSchema.safeParse(config).success).toBe(true)
      expect(validateConfig(config, loadCatalog(), new RuleIndex()).some(
        (message) => message.code.startsWith('error.resolution.') || message.code === 'warn.resolution.dimension.odd',
      )).toBe(false)

      const vf = renderFilterChain(buildVideoFilterChain(config), 'filter.chain')?.tokens[1]
      expect(vf).toBe('scale=-2:-2')
    }
  })

  it('指定宽高只填写一边时仅修复已填写的奇数边', () => {
    const config = createDefaultProjectConfig()
    config.frame.resolution = { mode: 'size', width: 223, keepAspect: true }

    expect(validateConfig(config, loadCatalog(), new RuleIndex()).some(
      (message) => message.code === 'warn.resolution.dimension.odd',
    )).toBe(true)

    const repaired = repairOddExplicitResolution(config)
    expect(repaired.frame.resolution).toEqual({ mode: 'size', width: 224, keepAspect: true })
    const vf = renderFilterChain(buildVideoFilterChain(repaired), 'filter.chain')?.tokens[1]
    expect(vf).toBe('scale=224:-2')
  })

  it('仅转换模式不写输出色彩标记，libplacebo 保留构建可用性提示', () => {
    const config = createDefaultProjectConfig()
    config.video.color = {
      operation: 'convert-only', filter: 'libplacebo', toneMap: 'bt.2390',
      space: 'bt709', primaries: 'bt709', transfer: 'bt709', range: 'tv',
    }
    const plan = buildCommandPlan(config, loadCatalog(), [])
    const codecTokens = plan.invocations[0].output.codecArgs.flatMap((arg) => arg.tokens)
    const vf = plan.invocations[0].output.filterArgs[0].tokens[1]
    expect(codecTokens).not.toContain('-colorspace')
    expect(vf).toContain('libplacebo=colorspace=bt709:color_primaries=bt709:color_trc=bt709:range=tv:tonemapping=bt.2390')
    const messages = validateConfig(config, loadCatalog(), new RuleIndex())
    expect(messages.some((message) => message.code === 'info.color.libplacebo.build')).toBe(true)
  })

  it('色调映射缺少目标传输特性时阻止复制命令', () => {
    const config = createDefaultProjectConfig()
    config.video.color = { operation: 'convert-and-tag', filter: 'zscale', toneMap: 'hable', space: 'bt709' }
    const messages = validateConfig(config, loadCatalog(), new RuleIndex())
    expect(messages.some((message) => message.code === 'error.color.tonemap.target')).toBe(true)
  })
})
