import type { ProjectConfig } from '../config/project-config'
import type { Catalog } from '../catalog/catalog-types'
import { CODEC_CATEGORIES } from '../catalog/catalog-types'
import type { EvaluationResult, Diagnostic } from '../rules/rule-types'
import { validateCompatibility } from './compatibility-validator'
import { RuleIndex } from '../rules/rule-index'
import { evaluateRules } from '../rules/rule-evaluator'
import { calculateTargetSize } from '../tools/target-size'

/**
 * Full validation pipeline — rules + compatibility.
 * Called after normalization produces a clean config.
 */
export function validateConfig(
  config: ProjectConfig,
  catalog: Catalog,
  ruleIndex: RuleIndex
): Diagnostic[] {
  const ctx = { config, catalog }

  const ruleResult: EvaluationResult = evaluateRules(ruleIndex.getAll(), ctx)
  const compatMessages = validateCompatibility(config, catalog)
  const subtitleMessages = validateSubtitleTracks(config)
  const colorMessages = validateColorProcessing(config)
  const targetSizeMessages = calculateTargetSize(config, catalog).diagnostics

  const placeholderMessages = validatePlaceholderCategory(config)

  return [
    ...ruleResult.messages,
    ...compatMessages,
    ...subtitleMessages,
    ...colorMessages,
    ...placeholderMessages,
    ...targetSizeMessages,
  ]
}

function validateColorProcessing(config: ProjectConfig): Diagnostic[] {
  const color = config.video.color
  const operation = color?.operation ?? 'metadata-only'
  if (!color || operation === 'metadata-only') return []

  const messages: Diagnostic[] = []
  const origins = ['video.color.operation', 'video.color.filter']
  if (config.video.mode !== 'encode') {
    messages.push({
      code: 'error.color.requires.encode', severity: 'error', category: 'configuration',
      message: 'Color conversion requires video encoding.', originIds: origins,
      context: { videoMode: config.video.mode },
    })
  }

  const hasTarget = Boolean(color.space || color.primaries || color.transfer || color.range || color.preFormat)
  if (!hasTarget) {
    messages.push({
      code: 'error.color.conversion.empty', severity: 'error', category: 'configuration',
      message: 'Color conversion has no target values.', originIds: origins,
      context: { filter: color.filter ?? 'zscale' },
    })
  }

  if (color.toneMap && color.toneMap !== 'none' && !color.transfer) {
    messages.push({
      code: 'error.color.tonemap.target', severity: 'error', category: 'configuration',
      message: 'Tone mapping requires an explicit target transfer characteristic.',
      originIds: ['video.color.toneMap', 'video.color.transfer'],
      context: { toneMap: color.toneMap },
    })
  }

  const cpuToneMaps = new Set(['none', 'clip', 'reinhard', 'mobius', 'hable', 'gamma', 'linear'])
  if ((color.filter ?? 'zscale') === 'zscale' && color.toneMap && !cpuToneMaps.has(color.toneMap)) {
    messages.push({
      code: 'error.color.tonemap.filter', severity: 'error', category: 'configuration',
      message: 'The selected tone-mapping algorithm requires libplacebo.',
      originIds: ['video.color.filter', 'video.color.toneMap'],
      context: { toneMap: color.toneMap },
    })
  }

  if (color.filter === 'libplacebo') {
    messages.push({
      code: 'info.color.libplacebo.build', severity: 'info', category: 'availability',
      message: 'libplacebo conversion depends on the user FFmpeg build and GPU runtime.',
      originIds: ['video.color.filter'], context: { filter: 'libplacebo' },
    })
  }
  return messages
}

function validateSubtitleTracks(config: ProjectConfig): Diagnostic[] {
  const unknownCopyTracks = config.subtitle.tracks.filter(
    (track) => track.codecMode === 'copy' && !track.sourceCodecKnown,
  )
  if (unknownCopyTracks.length === 0) return []

  return [{
    code: 'warn.subtitle.copy.unknown.sourcecodec',
    severity: 'warning',
    category: 'compatibility',
    message: 'Subtitle stream copy compatibility cannot be confirmed because the source codec is unknown.',
    originIds: unknownCopyTracks.map((track) => `subtitle.tracks.${track.id}.codecMode`),
    context: {
      trackIds: unknownCopyTracks.map((track) => track.id),
      containerId: config.output.containerId,
    },
  }]
}

function validatePlaceholderCategory(config: ProjectConfig): Diagnostic[] {
  if (config.video.mode !== 'encode' || !config.video.codecCategory) return []

  const category = CODEC_CATEGORIES.find((c) => c.id === config.video.codecCategory)
  if (!category?.placeholder) return []

  return [{
    code: 'info.category.placeholder',
    severity: 'info',
    category: 'availability',
    message: category.placeholderNote ?? `"${category.label}" 分类在当前 FFmpeg 发行版中暂无可用编码器。`,
    originIds: ['video.codecCategory', 'video.encoderId'],
    context: {
      codecCategory: config.video.codecCategory,
      placeholderNote: category.placeholderNote,
    },
  }]
}

export { validateCompatibility }
