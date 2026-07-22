// ============================================================
// ExecutionPlan — structured args for desktop spawn().
// Built from CommandPlan, NOT from rendered shell text.
// ============================================================

/**
 * A flat, spawn-ready argument list derived from the structured Command AST.
 *
 * One `ExecutionPlan` maps to one `CommandInvocation`. For two-pass
 * encoding the caller receives two plans and MUST execute them in order.
 *
 * Security: `args` are built from `CommandArg.tokens`, never parsed
 * from `RenderedCommand.text`. No shell interpolation is needed at
 * execution time — the desktop main process passes `args` directly
 * to `child_process.spawn(ffmpegPath, args, { shell: false })`.
 */
export interface ExecutionPlan {
  /** Flat argument list WITHOUT the executable name (e.g. ['-i', 'in.mp4', '-c:v', 'libx264', 'out.mp4']). */
  args: string[]

  /** Absolute paths to input files discovered during plan construction. */
  inputPaths: string[]

  /** Absolute paths to output files.  Pass-1 null-output ('-') yields an empty array. */
  outputPaths: string[]

  /** Estimated encoding duration in milliseconds, or undefined if unknown. */
  expectedDurationMs?: number
}

/**
 * Result of checking whether an output file already exists on disk.
 * The `exists` field is filled by the caller (main process) because
 * this package has no filesystem access.
 */
export interface OverwriteCheck {
  outputPath: string
  /** Whether any output path in the plan already exists on the filesystem. */
  exists: boolean
  /** Whether the plan includes `-y` (force overwrite). */
  overwriteFlag: boolean
}

/**
 * Pure-structure validation error — does NOT require filesystem access.
 */
export interface ExecutionPlanValidationError {
  kind: 'empty-args' | 'missing-input-path' | 'input-output-same' | 'no-output-path'
  message: string
  /** The problematic path, when applicable. */
  path?: string
}
