import { useMemo } from 'react'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'
import type { Catalog } from '@ffcodec/domain/catalog/catalog-types'
import type { EvaluationResult } from '@ffcodec/domain/rules/rule-types'
import type { CommandPlan } from '@ffcodec/domain/command/command-ast'
import type { RenderedCommand } from '@ffcodec/domain/shell/shell-types'
import { normalizeConfig } from '@ffcodec/domain/normalization'
import { RuleIndex } from '@ffcodec/catalog/rule-index'
import { evaluateRules } from '@ffcodec/domain/rules/rule-evaluator'
import { validateConfig } from '@ffcodec/domain/validation'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { renderBash, renderPowerShell, renderCmd } from '@ffcodec/domain/shell'

/**
 * React hook that runs the full domain pipeline.
 * Config → normalize → rules → validate → command → render.
 * Pure derivation — no state mutation, just computation.
 */
export interface PipelineOutput {
  normalizedConfig: ProjectConfig
  evaluationResult: EvaluationResult
  commandPlan: CommandPlan
  renderedCommand: RenderedCommand
  hasErrors: boolean
}

export function usePipeline(config: ProjectConfig, catalog: Catalog): PipelineOutput {
  return useMemo(() => {
    // 1. Normalize (against previous — in store we use self-ref)
    const { config: normalized, notices } = normalizeConfig(config, config, catalog)

    // 2. Rules
    const ruleIndex = new RuleIndex()
    const ctx = { config: normalized, catalog }
    const evaluationResult: EvaluationResult = evaluateRules(ruleIndex.getAll(), ctx)
    evaluationResult.normalizationNotices.push(...notices)

    // 3. Validate
    const allMessages = validateConfig(normalized, catalog, ruleIndex)
    // 正式页面必须看到完整校验结果，而不仅是规则引擎消息。
    evaluationResult.messages = allMessages

    // 4. Command
    const commandPlan = buildCommandPlan(normalized, catalog, allMessages)

    // 5. Render
    let rendered: RenderedCommand
    switch (normalized.shell) {
      case 'powershell':
        rendered = renderPowerShell(commandPlan)
        break
      case 'cmd':
        rendered = renderCmd(commandPlan)
        break
      case 'bash':
      default:
        rendered = renderBash(commandPlan)
        break
    }

    const hasErrors = allMessages.some((m) => m.severity === 'error')

    return {
      normalizedConfig: normalized,
      evaluationResult,
      commandPlan,
      renderedCommand: rendered,
      hasErrors,
    }
  }, [config, catalog])
}
