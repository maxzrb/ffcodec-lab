// ============================================================
// @ffcodec/command-plan — Structured execution plan builder.
// Phase 8: produces spawn-ready args[] from Command AST.
// ============================================================

export type {
  ExecutionPlan,
  OverwriteCheck,
  ExecutionPlanValidationError,
} from './types'

export { buildExecutionPlans } from './execution-plan-builder'
export { validateExecutionPlan, checkOverwrite } from './validation'
