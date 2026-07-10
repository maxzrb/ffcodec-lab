// ============================================================
// Migration registry — collects all migration steps.
// Add new steps here when the project schema version changes.
// ============================================================

import type { MigrationStep } from './migrate-config'
import { v1ToV2 } from './migrations/v1-to-v2'

/** All registered migration steps, sorted by fromVersion */
export const ALL_MIGRATION_STEPS: readonly MigrationStep[] = [
  v1ToV2,
  // v2ToV3 — reserved for future schema changes
]

/** Current project config schema version */
export const CURRENT_SCHEMA_VERSION = 2
