// ============================================================
// Migration registry — collects all migration steps.
// Add new steps here when the project schema version changes.
// ============================================================

import type { MigrationStep } from './migrate-config'
import { v1ToV2 } from './migrations/v1-to-v2'
import { v2ToV3 } from './migrations/v2-to-v3'
import { v3ToV4 } from './migrations/v3-to-v4'
import { v4ToV5 } from './migrations/v4-to-v5'

/** All registered migration steps, sorted by fromVersion */
export const ALL_MIGRATION_STEPS: readonly MigrationStep[] = [
  v1ToV2,
  v2ToV3,
  v3ToV4,
  v4ToV5,
]

/** Current project config schema version */
export const CURRENT_SCHEMA_VERSION = 5
