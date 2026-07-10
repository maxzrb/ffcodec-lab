import type { ProjectConfig } from '../config/project-config'
import type { CommandArg } from '../command/command-ast'

// ============================================================
// Contained video filter builder.
// First version: only scale, framerate, subtitle burn.
// Order: scale → framerate → subtitle burn → (reserved tail)
// Produces at most ONE -vf parameter.
// ============================================================

export type VideoFilterSpec =
  | ScaleFilterSpec
  | FrameRateFilterSpec
  | SubtitleBurnFilterSpec
  | CustomTailFilterSpec

export interface ScaleFilterSpec {
  type: 'scale'
  width?: number
  height?: number
}

export interface FrameRateFilterSpec {
  type: 'fps'
  fps: number
}

export interface SubtitleBurnFilterSpec {
  type: 'subtitles' | 'ass'
  /** Full filter string, e.g. "subtitles=sub.srt:force_style='...'" */
  filterString: string
}

export interface CustomTailFilterSpec {
  type: 'custom'
  filterString: string
}

/**
 * Builds the ordered filter chain from config.
 * Returns empty array if no filters needed.
 */
export function buildVideoFilterChain(config: ProjectConfig): VideoFilterSpec[] {
  const chain: VideoFilterSpec[] = []

  // Skip if video is not re-encoding
  if (config.video.mode !== 'encode') return chain

  // 1. Scale
  const res = config.frame.resolution
  if (res.mode === 'size') {
    chain.push({ type: 'scale', width: res.width, height: res.height })
  } else if (res.mode === 'width') {
    chain.push({ type: 'scale', width: res.width })
  } else if (res.mode === 'height') {
    chain.push({ type: 'scale', height: res.height })
  }

  // 2. FPS
  const fps = config.frame.frameRate
  if (fps.mode === 'value') {
    chain.push({ type: 'fps', fps: fps.value })
  }

  // 3. Subtitle burn
  if (config.subtitle.burn.enabled) {
    const filterStr = buildSubtitleBurnFilter(config)
    chain.push({
      type: config.subtitle.burn.filterKind,
      filterString: filterStr,
    })
  }

  return chain
}

/**
 * Renders the filter chain into a single CommandArg (or null if empty).
 */
export function renderFilterChain(
  chain: VideoFilterSpec[],
  originId: string,
): CommandArg | null {
  if (chain.length === 0) return null

  const filterParts: string[] = []

  for (const spec of chain) {
    switch (spec.type) {
      case 'scale': {
        const w = spec.width ?? -2
        const h = spec.height ?? -2
        filterParts.push(`scale=${w}:${h}`)
        break
      }
      case 'fps': {
        filterParts.push(`fps=${spec.fps}`)
        break
      }
      case 'subtitles':
      case 'ass': {
        filterParts.push(spec.filterString)
        break
      }
      case 'custom': {
        filterParts.push(spec.filterString)
        break
      }
    }
  }

  return {
    id: 'filter.vf',
    originId,
    phase: 'VIDEO_FILTER',
    tokens: ['-vf', filterParts.join(',')],
    explanationId: 'expl.filter.vf',
  }
}

/**
 * Builds the subtitle burn filter string from the burn config.
 */
function buildSubtitleBurnFilter(config: ProjectConfig): string {
  const burn = config.subtitle.burn
  const filterKind = burn.filterKind // 'subtitles' or 'ass'

  let source: string
  if (burn.source === 'internal' && burn.streamIndex !== undefined) {
    source = `si=${burn.streamIndex}`
  } else if (burn.source === 'external' && burn.externalPath) {
    source = `filename='${burn.externalPath}'`
  } else {
    source = ''
  }

  let filterStr = `${filterKind}=${source}`

  // Apply force_style if custom is provided — it overrides the style panel
  if (burn.customForceStyle) {
    filterStr += `:force_style='${burn.customForceStyle}'`
  } else if (burn.customFilter) {
    filterStr = burn.customFilter // fully custom overrides everything
  } else {
    const style: string[] = []
    const s = burn.style
    if (s.fontName) style.push(`FontName=${s.fontName}`)
    if (s.fontSize) style.push(`FontSize=${s.fontSize}`)
    if (s.bold) style.push('Bold=1')
    if (s.italic) style.push('Italic=1')
    if (s.underline) style.push('Underline=1')
    if (s.strikeOut) style.push('StrikeOut=1')
    if (s.primaryColor) style.push(`PrimaryColour=${s.primaryColor}`)
    if (s.secondaryColor) style.push(`SecondaryColour=${s.secondaryColor}`)
    if (s.outlineColor) style.push(`OutlineColour=${s.outlineColor}`)
    if (s.backColor) style.push(`BackColour=${s.backColor}`)
    if (s.borderStyle) style.push(`BorderStyle=${s.borderStyle}`)
    if (s.outline !== undefined) style.push(`Outline=${s.outline}`)
    if (s.shadow !== undefined) style.push(`Shadow=${s.shadow}`)
    if (s.alignment) style.push(`Alignment=${s.alignment}`)
    if (s.marginL !== undefined) style.push(`MarginL=${s.marginL}`)
    if (s.marginR !== undefined) style.push(`MarginR=${s.marginR}`)
    if (s.marginV !== undefined) style.push(`MarginV=${s.marginV}`)
    if (s.spacing !== undefined) style.push(`Spacing=${s.spacing}`)

    if (style.length > 0) {
      filterStr += `:force_style='${style.join(',')}'`
    }
  }

  return filterStr
}
