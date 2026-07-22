// ============================================================
// ExecutionPlan builder — walks the Command AST and produces
// structured args[] arrays safe for direct spawn().
//
// This is an ADDITIONAL output path. Shell text rendering
// continues to work unchanged through the existing renderers.
// ============================================================

import { flattenInvocation } from '@ffcodec/domain/command/argument-order'
import type { CommandPlan } from '@ffcodec/domain/command/command-ast'
import type { ExecutionPlan } from './types'

/**
 * Build one ExecutionPlan per CommandInvocation.
 *
 * Two-pass encodings produce two plans — the caller MUST execute
 * them in order (pass-1 then pass-2).
 *
 * The returned `args` exclude the `ffmpeg` executable name and are
 * suitable for `child_process.spawn(ffmpegPath, args, { shell: false })`.
 */
export function buildExecutionPlans(plan: CommandPlan): ExecutionPlan[] {
  return plan.invocations.map((inv) => {
    const tokens = flattenInvocation(inv)

    // Drop the leading 'ffmpeg' token — keep only arguments.
    const args = tokens.slice(1).map((t) => t.text)

    const inputPaths = inv.inputs.map((input) => input.path)

    // Pass-1 for two-pass outputs to '-' (null device) — not a real file.
    const outputPath = inv.output.path
    const outputPaths = outputPath === '-' ? [] : [outputPath]

    return {
      args,
      inputPaths,
      outputPaths,
    }
  })
}
