import type { RuleExpression, RuleDefinition, FieldState, EvaluationResult, RuleContext } from './rule-types'
import { getByPath } from '../../utils/object-path'

/**
 * Evaluates a single rule expression against the current config + catalog context.
 * Pure function — no side effects, no React dependency.
 */
export function evaluateExpression(expr: RuleExpression, ctx: RuleContext): boolean {
  switch (expr.op) {
    case 'eq': {
      const val = getByPath(ctx.config, expr.path)
      return val === expr.value
    }
    case 'neq': {
      const val = getByPath(ctx.config, expr.path)
      return val !== expr.value
    }
    case 'in': {
      const val = getByPath(ctx.config, expr.path)
      return expr.values.includes(val)
    }
    case 'notIn': {
      const val = getByPath(ctx.config, expr.path)
      return !expr.values.includes(val)
    }
    case 'exists': {
      const val = getByPath(ctx.config, expr.path)
      return val !== undefined && val !== null
    }
    case 'all': {
      return expr.rules.every((r) => evaluateExpression(r, ctx))
    }
    case 'any': {
      return expr.rules.some((r) => evaluateExpression(r, ctx))
    }
    case 'not': {
      return !evaluateExpression(expr.rule, ctx)
    }
    case 'capability': {
      // Query encoder capability dynamically
      const encoderId = ctx.config.video.encoderId
      if (!encoderId) return false
      const encoder = ctx.catalog.encoders.video[encoderId]
      if (!encoder) return false
      if (expr.key === 'copy' && expr.value === true) return encoder.capabilities.copy === true
      if (expr.key === 'disabled' && expr.value === true) return encoder.capabilities.disabled === true
      if (expr.key === 'supportsTwoPass') return encoder.capabilities.supportsTwoPass === true
      if (expr.key === 'supportsLossless') return encoder.capabilities.supportsLossless === true
      return false
    }
  }
}

/**
 * Evaluates all rules and produces field states, messages, and suggestions.
 */
export function evaluateRules(
  rules: RuleDefinition[],
  ctx: RuleContext,
  previousResult?: EvaluationResult
): EvaluationResult {
  const sorted = [...rules].sort((a, b) => b.priority - a.priority)

  const fieldStates: Record<string, FieldState> = { ...(previousResult?.fieldStates ?? {}) }
  const messages: NonNullable<EvaluationResult['messages']> = []
  const suggestions: NonNullable<EvaluationResult['suggestions']> = []
  const normalizationNotices: NonNullable<EvaluationResult['normalizationNotices']> = []
  const resolvedValues: Record<string, unknown> = {}

  for (const rule of sorted) {
    if (!evaluateExpression(rule.when, ctx)) continue

    for (const effect of rule.effects) {
      switch (effect.type) {
        case 'hide': {
          fieldStates[effect.target] = {
            ...fieldStates[effect.target],
            visible: false,
            reason: effect.reasonId,
          }
          break
        }
        case 'disable': {
          fieldStates[effect.target] = {
            ...fieldStates[effect.target],
            enabled: false,
            reason: effect.reasonId,
          }
          break
        }
        case 'require': {
          fieldStates[effect.target] = {
            ...fieldStates[effect.target],
            required: true,
            reason: effect.reasonId,
          }
          break
        }
        case 'error': {
          messages.push({
            id: rule.id,
            severity: 'error',
            messageId: effect.messageId,
            fieldIds: effect.targets,
            sourceRuleId: rule.id,
          })
          break
        }
        case 'warning': {
          messages.push({
            id: rule.id,
            severity: 'warning',
            messageId: effect.messageId,
            fieldIds: effect.targets,
            sourceRuleId: rule.id,
          })
          break
        }
        case 'suggest': {
          suggestions.push({
            messageId: effect.messageId,
            patch: effect.patch,
            sourceRuleId: rule.id,
          })
          break
        }
        case 'clearInvalid': {
          normalizationNotices.push({
            fieldId: effect.target,
            from: getByPath(ctx.config, effect.target),
            to: '<cleared>',
            reason: `Cleared invalid value due to rule: ${rule.id}`,
          })
          break
        }
        case 'resolveAuto': {
          resolvedValues[effect.target] = effect.resolverId
          break
        }
      }
    }
  }

  return {
    fieldStates,
    messages,
    suggestions,
    normalizationNotices,
    resolvedValues,
  }
}

/**
 * Default field state — everything visible and enabled.
 */
export function defaultFieldState(): FieldState {
  return { visible: true, enabled: true, required: false }
}

/**
 * Build field states from a list of field IDs with default states.
 */
export function buildFieldStateMap(fieldIds: string[]): Record<string, FieldState> {
  const map: Record<string, FieldState> = {}
  for (const id of fieldIds) {
    map[id] = defaultFieldState()
  }
  return map
}
