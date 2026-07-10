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

  return [...ruleResult.messages, ...compatMessages]
}

export { validateCompatibility }
