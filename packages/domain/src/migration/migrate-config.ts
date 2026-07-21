// ============================================================
// Config migration — shared by LocalStorage, PresetService,
// share links, and JSON import. All paths use this single
// pipeline so migration logic is never duplicated.
// ============================================================

export interface MigrationStep {
  fromVersion: number
  toVersion: number
  migrate: (config: Record<string, unknown>) => {
    config: Record<string, unknown>
    warnings: string[]
  }
}

export interface MigrationResult {
  config: Record<string, unknown>
  appliedSteps: { from: number; to: number }[]
  warnings: string[]
}

/**
 * Run all applicable migrations from currentVersion to targetVersion.
 * Steps are sorted by fromVersion ascending. Each step's output
 * feeds the next step's input until targetVersion is reached.
 */
export function migrateConfig(
  currentVersion: number,
  targetVersion: number,
  config: Record<string, unknown>,
  steps: MigrationStep[],
): MigrationResult {
  const warnings: string[] = []
  const appliedSteps: { from: number; to: number }[] = []
  let current = structuredClone(config)
  let version = currentVersion

  // Sort steps ascending by fromVersion
  const sorted = [...steps].sort((a, b) => a.fromVersion - b.fromVersion)

  for (const step of sorted) {
    if (version >= targetVersion) break
    if (step.fromVersion !== version) continue

    const result = step.migrate(current)
    current = result.config
    warnings.push(...result.warnings)
    appliedSteps.push({ from: step.fromVersion, to: step.toVersion })
    version = step.toVersion

    // Update schemaVersion in the config
    current = { ...current, schemaVersion: version }
  }

  return { config: current, appliedSteps, warnings }
}
