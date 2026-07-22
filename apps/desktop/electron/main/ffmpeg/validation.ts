// ============================================================
// Pre-execution validation — checks performed by the main
// process before spawning FFmpeg.
//
// Security: all validations run in the main process. The
// renderer never has direct filesystem access.
//
// NOTE: Pure-structure validations are inlined here rather
// than imported from @ffcodec/command-plan because the
// Electron main process runs in CJS context and cannot
// load ESM workspace packages via externalizeDepsPlugin.
// ============================================================

import fs from 'node:fs'
import path from 'node:path'
import type { ExecutionPlan } from './types'

export interface ValidationResult {
  ok: boolean
  errors: string[]
}

/**
 * Full pre-execution validation.
 *
 * Checks:
 * 1. Plan structure (args non-empty, inputs non-empty, no i/o collision)
 * 2. Every input file exists and is readable
 * 3. Output directory exists or can be created
 * 4. No input path equals any output path (resolved absolute)
 * 5. Overwrite policy is respected
 */
export function validateBeforeExecution(
  plan: ExecutionPlan,
  overwriteMode: 'replace' | 'fail',
): ValidationResult {
  const errors: string[] = []

  // 1. Pure-structure validation (inlined from @ffcodec/command-plan)
  const structErrors = validatePlanStructure(plan)
  for (const e of structErrors) {
    errors.push(e)
  }

  // 2. Input files must exist
  for (const inputPath of plan.inputPaths) {
    if (!inputPath) continue
    try {
      fs.accessSync(inputPath, fs.constants.R_OK)
    } catch {
      errors.push(`Input file not found or not readable: ${inputPath}`)
    }
  }

  // 3. Output directory must exist or be creatable (skip for pass-1 null output)
  for (const outputPath of plan.outputPaths) {
    if (!outputPath || outputPath === '-') continue
    const dir = path.dirname(outputPath)
    if (!dir) continue
    try {
      fs.accessSync(dir, fs.constants.W_OK)
    } catch {
      // Directory doesn't exist — try to create it
      try {
        fs.mkdirSync(dir, { recursive: true })
      } catch (mkdirErr) {
        const msg = mkdirErr instanceof Error ? mkdirErr.message : String(mkdirErr)
        errors.push(`Cannot create output directory ${dir}: ${msg}`)
      }
    }
  }

  // 4. Input-output collision (resolved absolute paths)
  for (const inputPath of plan.inputPaths) {
    if (!inputPath) continue
    for (const outputPath of plan.outputPaths) {
      if (!outputPath) continue
      if (path.resolve(inputPath) === path.resolve(outputPath)) {
        errors.push(`Input and output are the same file: ${inputPath}`)
      }
    }
  }

  // 5. Overwrite policy
  if (overwriteMode === 'fail') {
    for (const outputPath of plan.outputPaths) {
      if (!outputPath || outputPath === '-') continue
      const hasY = plan.args.includes('-y')
      try {
        fs.accessSync(outputPath, fs.constants.F_OK)
        // File exists — check overwrite policy
        if (!hasY) {
          errors.push(
            `Output file already exists and overwrite is disabled: ${outputPath}. ` +
            `Enable overwrite or choose a different output path.`,
          )
        }
      } catch {
        // File doesn't exist — ok
      }
    }
  }

  return { ok: errors.length === 0, errors }
}

// ---- Inlined pure-structure validations (mirrors @ffcodec/command-plan) ----

function validatePlanStructure(plan: ExecutionPlan): string[] {
  const errors: string[] = []

  if (plan.args.length === 0) {
    errors.push('Execution plan has no arguments — nothing to execute.')
  }

  for (const inputPath of plan.inputPaths) {
    if (!inputPath.trim()) {
      errors.push('An input path is empty.')
    }
  }

  if (plan.outputPaths.length === 0) {
    errors.push(
      'Execution plan has no output path. For pass-1 null output this is expected; ' +
      'for single-pass it is an error.',
    )
  }

  return errors
}
