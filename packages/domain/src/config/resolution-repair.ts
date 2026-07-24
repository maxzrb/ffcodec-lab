import type { ProjectConfig, ResolutionConfig } from './project-config'

export interface OddResolutionDimension {
  axis: 'width' | 'height'
  value: number
  repairedValue: number
}

/** 返回非正数或非整数的显式尺寸边；所有缩放模式的空边都表示 FFmpeg 自动尺寸。 */
export function findInvalidExplicitResolutionDimensions(config: ProjectConfig): Array<Pick<OddResolutionDimension, 'axis'> & { value: unknown }> {
  if (config.video.mode !== 'encode') return []

  const resolution = config.frame.resolution
  const dimensions: Array<Pick<OddResolutionDimension, 'axis'> & { value: unknown }> = []
  if (resolution.mode === 'width' || resolution.mode === 'size') {
    addSpecifiedInvalidDimension(dimensions, 'width', resolution.width)
  }
  if (resolution.mode === 'height' || resolution.mode === 'size') {
    addSpecifiedInvalidDimension(dimensions, 'height', resolution.height)
  }
  return dimensions
}

/** 返回用户显式填写的奇数边；跟随源尺寸不在此处猜测。 */
export function findOddExplicitResolutionDimensions(config: ProjectConfig): OddResolutionDimension[] {
  if (config.video.mode !== 'encode') return []

  const resolution = config.frame.resolution
  const dimensions: OddResolutionDimension[] = []
  if (resolution.mode === 'width' || resolution.mode === 'size') {
    addOddDimension(dimensions, 'width', resolution.width)
  }
  if (resolution.mode === 'height' || resolution.mode === 'size') {
    addOddDimension(dimensions, 'height', resolution.height)
  }
  return dimensions
}

/** 将显式填写的奇数边向上修正为相邻偶数；未命中时返回原对象。 */
export function repairOddExplicitResolution(config: ProjectConfig): ProjectConfig {
  const dimensions = findOddExplicitResolutionDimensions(config)
  if (dimensions.length === 0) return config

  const resolution = config.frame.resolution
  const repairedResolution = repairResolution(resolution)
  return {
    ...config,
    frame: {
      ...config.frame,
      resolution: repairedResolution,
    },
  }
}

function addOddDimension(
  dimensions: OddResolutionDimension[],
  axis: OddResolutionDimension['axis'],
  value: unknown,
): void {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0 && value % 2 !== 0) {
    dimensions.push({ axis, value, repairedValue: value + 1 })
  }
}

function addInvalidDimension(
  dimensions: Array<Pick<OddResolutionDimension, 'axis'> & { value: unknown }>,
  axis: OddResolutionDimension['axis'],
  value: unknown,
): void {
  if (!Number.isInteger(value) || typeof value !== 'number' || value <= 0) {
    dimensions.push({ axis, value })
  }
}

/** size 模式留空代表 scale 的 -2 自动边，不属于缺失配置。 */
function addSpecifiedInvalidDimension(
  dimensions: Array<Pick<OddResolutionDimension, 'axis'> & { value: unknown }>,
  axis: OddResolutionDimension['axis'],
  value: unknown,
): void {
  if (value !== undefined) addInvalidDimension(dimensions, axis, value)
}

function repairResolution(resolution: ResolutionConfig): ResolutionConfig {
  if (resolution.mode === 'width') {
    if (resolution.width === undefined) return resolution
    return { ...resolution, width: evenAtOrAbove(resolution.width) }
  }
  if (resolution.mode === 'height') {
    if (resolution.height === undefined) return resolution
    return { ...resolution, height: evenAtOrAbove(resolution.height) }
  }
  if (resolution.mode === 'size') {
    const { width, height, ...base } = resolution
    return {
      ...base,
      ...(width === undefined ? {} : { width: evenAtOrAbove(width) }),
      ...(height === undefined ? {} : { height: evenAtOrAbove(height) }),
    }
  }
  return resolution
}

function evenAtOrAbove(value: number): number {
  if (!Number.isInteger(value) || value <= 0) return value
  return value % 2 === 0 ? value : value + 1
}
