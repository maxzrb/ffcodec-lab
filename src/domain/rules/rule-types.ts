// ============================================================
// Rule engine types — declarative rule expressions and effects.
// Rules are pure data; the evaluator interprets them.
// ============================================================

import type { ProjectConfig } from '../config/project-config'
import type { Catalog } from '../catalog/catalog-types'

/** Rule expression AST for declarative condition matching */
export type RuleExpression =
  | { op: 'eq'; path: string; value: unknown }
  | { op: 'neq'; path: string; value: unknown }
  | { op: 'in'; path: string; values: unknown[] }
  | { op: 'notIn'; path: string; values: unknown[] }
  | { op: 'exists'; path: string }
  | { op: 'all'; rules: RuleExpression[] }
  | { op: 'any'; rules: RuleExpression[] }
  | { op: 'not'; rule: RuleExpression }
  | { op: 'capability'; key: string; value?: unknown }

/** Rule definition — when condition is met, the effects apply */
export interface RuleDefinition {
  id: string
  priority: number
  when: RuleExpression
  effects: RuleEffect[]
  sourceRefs: import('../catalog/catalog-types').SourceRef[]
}

/** Rule effects that modify field states, show messages, or suggest patches */
export type RuleEffect =
  | { type: 'hide'; target: string; reasonId: string }
  | { type: 'disable'; target: string; reasonId: string }
  | { type: 'require'; target: string; reasonId: string }
  | { type: 'error'; messageId: string; targets: string[] }
  | { type: 'warning'; messageId: string; targets: string[] }
  | { type: 'suggest'; messageId: string; patch?: Partial<ProjectConfig> }
  | { type: 'clearInvalid'; target: string; reasonId: string }
  | { type: 'resolveAuto'; target: string; resolverId: string }

/** Per-field UI state derived from rule evaluation */
export interface FieldState {
  visible: boolean
  enabled: boolean
  required: boolean
  reason?: string
}

/** Validation message from rules or compatibility checks */
export interface ValidationMessage {
  id: string
  severity: 'error' | 'warning' | 'info'
  messageId: string
  fieldIds: string[]
  sourceRuleId?: string
  details?: Record<string, unknown>
}

export interface Suggestion {
  messageId: string
  patch?: Partial<ProjectConfig>
  sourceRuleId?: string
}

export interface NormalizationNotice {
  fieldId: string
  from: unknown
  to: unknown
  reason: string
}

/** Complete rule evaluation result */
export interface EvaluationResult {
  fieldStates: Record<string, FieldState>
  messages: ValidationMessage[]
  suggestions: Suggestion[]
  normalizationNotices: NormalizationNotice[]
  resolvedValues: Record<string, unknown>
}

/** Context passed to rule evaluator */
export interface RuleContext {
  config: ProjectConfig
  catalog: Catalog
}
