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

/** @deprecated — use Diagnostic instead */
export type ValidationMessage = Diagnostic

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
  messages: Diagnostic[]
  suggestions: Suggestion[]
  normalizationNotices: NormalizationNotice[]
  resolvedValues: Record<string, unknown>
}

/** Context passed to rule evaluator */
export interface RuleContext {
  config: ProjectConfig
  catalog: Catalog
}

// ============================================================
// Diagnostic types — structured messages with fix suggestions
// ============================================================

export type DiagnosticCategory =
  | 'configuration'
  | 'syntax'
  | 'compatibility'
  | 'availability'
  | 'verification'
  | 'normalization'

/** A structured diagnostic — stable code + context drives fix generation */
export interface Diagnostic {
  /** Stable machine-readable code, e.g. 'E_COMPAT_VIDEO_CONTAINER' */
  code: string
  severity: 'error' | 'warning' | 'info'
  category: DiagnosticCategory
  /** Human-readable message */
  message: string
  /** Related originIds (field IDs, encoder IDs, container IDs) */
  originIds: string[]
  /** Structured context for fix suggestion generation */
  context: Record<string, unknown>
  sourceRuleId?: string
}

/** A controlled config patch operation */
export type ConfigPatchOperation =
  | { op: 'set'; path: import('../config/config-path').ConfigPath; value: unknown }
  | { op: 'clear'; path: import('../config/config-path').ConfigPath }

/** A suggested fix for a diagnostic */
export interface DiagnosticFix {
  id: string
  label: string
  description: string
  category: DiagnosticCategory
  operations: ConfigPatchOperation[]
  /** Safety classification for UI confirmation behavior */
  safety: 'safe' | 'changes-output' | 'destructive'
  sourceRuleId?: string
}
