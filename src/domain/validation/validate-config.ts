import type { ProjectConfig } from '../config/project-config'
import type { Catalog } from '../catalog/catalog-types'
import type { EvaluationResult, Diagnostic } from '../rules/rule-types'
import { validateCompatibility } from './compatibility-validator'
import { RuleIndex } from '../rules/rule-index'
import { evaluateRules } from '../rules/rule-evaluator'

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

  return [...ruleResult.messages, ...compatMessages, ...subtitleMessages]
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

export { validateCompatibility }
