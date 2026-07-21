export type {
  RuleExpression,
  RuleDefinition,
  RuleEffect,
  FieldState,
  ValidationMessage,
  Diagnostic,
  DiagnosticCategory,
  DiagnosticFix,
  ConfigPatchOperation,
  Suggestion,
  NormalizationNotice,
  EvaluationResult,
  RuleContext,
} from './rule-types'
export { evaluateExpression, evaluateRules, defaultFieldState, buildFieldStateMap } from './rule-evaluator'
// RuleIndex moved to @ffcodec/catalog — re-export from there
export { RuleIndex } from '@ffcodec/catalog/rule-index'
