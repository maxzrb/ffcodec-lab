// ============================================================
// Pure-structure validation for ExecutionPlan.
// Filesystem checks (file existence, directory writability,
// ffprobe duration estimation) are performed by the desktop
// main process — NOT here.
// ============================================================

import type { ExecutionPlan, ExecutionPlanValidationError, OverwriteCheck } from './types'

/**
 * Validates the structure of an ExecutionPlan without touching the filesystem.
 *
 * Checks performed:
 * - args array is non-empty
 * - every input path is non-empty
 * - no input path equals an output path (basic self-collision guard)
 */
export function validateExecutionPlan(plan: ExecutionPlan): ExecutionPlanValidationError[] {
  const errors: ExecutionPlanValidationError[] = []

  if (plan.args.length === 0) {
    errors.push({
      kind: 'empty-args',
      message: 'Execution plan has no arguments — nothing to execute.',
    })
  }

  for (const inputPath of plan.inputPaths) {
    if (!inputPath.trim()) {
      errors.push({
        kind: 'missing-input-path',
        message: 'An input path is empty.',
        path: inputPath,
      })
    }
    // Check if any input path collides with an output path.
    for (const outputPath of plan.outputPaths) {
      if (inputPath === outputPath) {
        errors.push({
          kind: 'input-output-same',
          message: `Input path equals output path: ${inputPath}. This would destroy the source file.`,
          path: inputPath,
        })
      }
    }
  }

  if (plan.outputPaths.length === 0) {
    errors.push({
      kind: 'no-output-path',
      message: 'Execution plan has no output path. For pass-1 null output this is expected; for single-pass it is an error.',
    })
  }

  return errors
}

/**
 * Determines whether any output file already exists, based on the
 * caller-supplied existence map.
 *
 * The `overwriteFlag` field reflects whether `-y` is present in args.
 */
export function checkOverwrite(
  plan: ExecutionPlan,
  existingPaths: Set<string>,
): OverwriteCheck[] {
  const hasY = plan.args.includes('-y')

  return plan.outputPaths.map((outputPath) => ({
    outputPath,
    exists: existingPaths.has(outputPath),
    overwriteFlag: hasY,
  }))
}
