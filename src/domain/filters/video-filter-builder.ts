import type { AdvancedVideoFiltersConfig, ProjectConfig } from '../config/project-config'
import type { CommandArg } from '../command/command-ast'
import { createDefaultAdvancedVideoFilters } from '../config/defaults'

// 所有画面处理都进入同一有序滤镜链，最终最多生成一个 -vf 参数。
export type VideoFilterSpec =
  | { type: 'yadif'; mode: 'send_frame' | 'send_field'; parity: 'auto' | 'tff' | 'bff' }
  | { type: 'crop'; width: number; height: number; x: number; y: number }
  | { type: 'scale'; width?: number; height?: number }
  | { type: 'transpose'; direction: 'clock' | 'cclock' }
  | { type: 'hflip' }
  | { type: 'vflip' }
  | { type: 'eq'; brightness: number; contrast: number; saturation: number; gamma: number }
  | { type: 'unsharp'; amount: number }
  | { type: 'denoise'; filterString: string }
  | { type: 'deband'; filterString: string }
  | { type: 'fps'; fps: number }
  | { type: 'subtitles' | 'ass'; filterString: string }
  | { type: 'custom'; filterString: string }

/** 按稳定顺序把配置转换为滤镜规格。 */
export function buildVideoFilterChain(config: ProjectConfig): VideoFilterSpec[] {
  const chain: VideoFilterSpec[] = []
  if (config.video.mode !== 'encode') return chain

  const filters = config.frame.filters ?? createDefaultAdvancedVideoFilters()
  if (filters.deinterlace.enabled) {
    chain.push({
      type: 'yadif',
      mode: filters.deinterlace.mode,
      parity: filters.deinterlace.parity,
    })
  }

  if (filters.crop.enabled) {
    chain.push({ type: 'crop', ...filters.crop })
  }

  const resolution = config.frame.resolution
  if (resolution.mode === 'size') {
    chain.push({ type: 'scale', width: resolution.width, height: resolution.height })
  } else if (resolution.mode === 'width') {
    chain.push({ type: 'scale', width: resolution.width })
  } else if (resolution.mode === 'height') {
    chain.push({ type: 'scale', height: resolution.height })
  }

  if (filters.transform.rotate === 'clockwise') {
    chain.push({ type: 'transpose', direction: 'clock' })
  } else if (filters.transform.rotate === 'counterclockwise') {
    chain.push({ type: 'transpose', direction: 'cclock' })
  } else if (filters.transform.rotate === '180') {
    chain.push({ type: 'hflip' }, { type: 'vflip' })
  }
  if (filters.transform.horizontalFlip) chain.push({ type: 'hflip' })
  if (filters.transform.verticalFlip) chain.push({ type: 'vflip' })

  if (filters.denoise.enabled && filters.denoise.algorithm) {
    chain.push({ type: 'denoise', filterString: buildDenoiseFilter(filters.denoise) })
  }
  if (filters.deband.enabled && filters.deband.algorithm) {
    chain.push({ type: 'deband', filterString: buildDebandFilter(filters.deband) })
  }

  if (filters.adjustment.enabled) {
    chain.push({ type: 'eq', ...filters.adjustment })
  }
  if (filters.sharpen.enabled) {
    chain.push({ type: 'unsharp', amount: filters.sharpen.amount })
  }

  if (config.frame.frameRate.mode === 'value') {
    chain.push({ type: 'fps', fps: config.frame.frameRate.value })
  }

  if (config.subtitle.burn.enabled) {
    chain.push({
      type: config.subtitle.burn.filterKind,
      filterString: buildSubtitleBurnFilter(config),
    })
  }

  return chain
}

/** 将滤镜规格渲染为一个可追溯的 CommandArg。 */
export function renderFilterChain(
  chain: VideoFilterSpec[],
  originId: string,
): CommandArg | null {
  if (chain.length === 0) return null

  const parts = chain.map((spec) => {
    switch (spec.type) {
      case 'yadif':
        return `yadif=mode=${spec.mode}:parity=${spec.parity}:deint=all`
      case 'crop':
        return `crop=${spec.width}:${spec.height}:${spec.x}:${spec.y}`
      case 'scale':
        return `scale=${spec.width ?? -2}:${spec.height ?? -2}`
      case 'transpose':
        return `transpose=${spec.direction}`
      case 'hflip':
      case 'vflip':
        return spec.type
      case 'eq':
        return `eq=brightness=${spec.brightness}:contrast=${spec.contrast}:saturation=${spec.saturation}:gamma=${spec.gamma}`
      case 'unsharp':
        return `unsharp=luma_msize_x=5:luma_msize_y=5:luma_amount=${spec.amount}`
      case 'denoise':
      case 'deband':
        return spec.filterString
      case 'fps':
        return `fps=${spec.fps}`
      case 'subtitles':
      case 'ass':
      case 'custom':
        return spec.filterString
    }
  })

  return {
    id: 'filter.vf',
    originId,
    phase: 'VIDEO_FILTER',
    tokens: ['-vf', parts.join(',')],
    explanationId: 'expl.filter.vf',
  }
}

function buildDenoiseFilter(filters: AdvancedVideoFiltersConfig['denoise']): string {
  const value = filters.values
  switch (filters.algorithm) {
    case 'hqdn3d':
      return `hqdn3d=${value.lumaSpatial ?? 4}:${value.chromaSpatial ?? 3}:${value.lumaTemporal ?? 6}:${value.chromaTemporal ?? 4.5}`
    case 'nlmeans':
      return `nlmeans=s=${value.strength ?? 1}:p=${value.patchSize ?? 7}:pc=${value.chromaPatchSize ?? 0}:r=${value.researchSize ?? 15}`
    case 'atadenoise':
      return `atadenoise=0a=${value.lumaStatic ?? 0.02}:0b=${value.lumaDynamic ?? 0.04}:1a=${value.chromaStatic ?? 0.02}:1b=${value.chromaDynamic ?? 0.04}`
    case 'bm3d':
      return `bm3d=sigma=${value.sigma ?? 1}:block=${value.block ?? 16}:bstep=${value.blockStep ?? 4}:group=${value.group ?? 1}`
    default:
      return ''
  }
}

function buildDebandFilter(filters: AdvancedVideoFiltersConfig['deband']): string {
  const value = filters.values
  if (filters.algorithm === 'gradfun') {
    return `gradfun=strength=${value.strength ?? 1.2}:radius=${value.radius ?? 16}`
  }
  const threshold = value.threshold ?? 0.02
  return `deband=1thr=${threshold}:2thr=${threshold}:3thr=${threshold}:range=${value.range ?? 16}:direction=${value.direction ?? 0}:blur=1:coupling=${value.coupling ? 1 : 0}`
}

/** 根据字幕烧录配置构建 subtitles/ass 滤镜。 */
function buildSubtitleBurnFilter(config: ProjectConfig): string {
  const burn = config.subtitle.burn
  let source = ''
  if (burn.source === 'internal' && burn.streamIndex !== undefined) {
    source = `si=${burn.streamIndex}`
  } else if (burn.source === 'external' && burn.externalPath) {
    source = `filename='${burn.externalPath}'`
  }

  let filterString = `${burn.filterKind}=${source}`
  if (burn.customForceStyle) {
    return `${filterString}:force_style='${burn.customForceStyle}'`
  }
  if (burn.customFilter) return burn.customFilter

  const style: string[] = []
  const value = burn.style
  if (value.fontName) style.push(`FontName=${value.fontName}`)
  if (value.fontSize) style.push(`FontSize=${value.fontSize}`)
  if (value.bold) style.push('Bold=1')
  if (value.italic) style.push('Italic=1')
  if (value.underline) style.push('Underline=1')
  if (value.strikeOut) style.push('StrikeOut=1')
  if (value.primaryColor) style.push(`PrimaryColour=${value.primaryColor}`)
  if (value.secondaryColor) style.push(`SecondaryColour=${value.secondaryColor}`)
  if (value.outlineColor) style.push(`OutlineColour=${value.outlineColor}`)
  if (value.backColor) style.push(`BackColour=${value.backColor}`)
  if (value.borderStyle) style.push(`BorderStyle=${value.borderStyle}`)
  if (value.outline !== undefined) style.push(`Outline=${value.outline}`)
  if (value.shadow !== undefined) style.push(`Shadow=${value.shadow}`)
  if (value.alignment) style.push(`Alignment=${value.alignment}`)
  if (value.marginL !== undefined) style.push(`MarginL=${value.marginL}`)
  if (value.marginR !== undefined) style.push(`MarginR=${value.marginR}`)
  if (value.marginV !== undefined) style.push(`MarginV=${value.marginV}`)
  if (value.spacing !== undefined) style.push(`Spacing=${value.spacing}`)
  if (style.length > 0) filterString += `:force_style='${style.join(',')}'`
  return filterString
}
