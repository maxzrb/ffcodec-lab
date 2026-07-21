// ============================================================
// apply-diagnostic-fix — transactional fix application.
// Pipeline: whitelist → schema → normalization → rules → validation.
// Never auto-applies; always requires user confirmation first.
// ============================================================

import type { ProjectConfig } from '../config/project-config'
import type { Catalog } from '../catalog/catalog-types'
import type { Diagnostic, DiagnosticFix, NormalizationNotice } from '../rules/rule-types'
import { projectConfigSchema } from '../config/config-schema'
import { normalizeConfig } from '../normalization/normalize-config'
import { RuleIndex } from '@ffcodec/catalog/rule-index'
import { evaluateRules } from '../rules/rule-evaluator'
import { validateConfig } from '../validation/validate-config'
import { setByPath } from '@ffcodec/domain/utils/object-path'
import { isValidConfigPath } from '../config/config-path'

// Whitelist of allowed operation paths
const ALLOWED_PATHS = new Set([
  'output.containerId',
  'video.mode',
  'video.encoderId',
  'frame.resolution',
  'frame.frameRate',
  'subtitle.burn',
])

export interface FixApplicationResult {
  success: boolean
  newConfig: ProjectConfig
  diagnostics: Diagnostic[]
  normalizationNotices: NormalizationNotice[]
  appliedAt: string
  error?: string
}

/**
 * Apply a diagnostic fix transactionally.
 * 1. Path whitelist validation
 * 2. Apply patch operations
 * 3. Zod schema validation
 * 4. Normalization
 * 5. Rule evaluation
 * 6. Full validation
 */
export function applyFix(
  config: ProjectConfig,
  fix: DiagnosticFix,
  catalog: Catalog,
): FixApplicationResult {
  const timestamp = new Date().toISOString()

  // 1. Path whitelist validation
  for (const op of fix.operations) {
    if (op.op === 'set' || op.op === 'clear') {
      if (!isValidConfigPath(op.path)) {
        return {
          success: false,
          newConfig: config,
          diagnostics: [],
          normalizationNotices: [],
          appliedAt: timestamp,
          error: `Illegal config path in fix operation: ${op.path}`,
        }
      }
      if (!ALLOWED_PATHS.has(op.path)) {
        return {
          success: false,
          newConfig: config,
          diagnostics: [],
          normalizationNotices: [],
          appliedAt: timestamp,
          error: `Path not in whitelist: ${op.path}`,
        }
      }
    }
  }

  // 2. Apply patch operations
  let newConfig = structuredClone(config)
  for (const op of fix.operations) {
    switch (op.op) {
      case 'set':
        newConfig = setByPath(newConfig, op.path, op.value) as ProjectConfig
        break
      case 'clear':
        newConfig = setByPath(newConfig, op.path, undefined) as ProjectConfig
        break
    }
  }

  // 3. Zod schema validation
  const parsed = projectConfigSchema.safeParse(newConfig)
  if (!parsed.success) {
    return {
      success: false,
      newConfig: config,
      diagnostics: [],
      normalizationNotices: [],
      appliedAt: timestamp,
      error: `Fix produces invalid config: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
    }
  }
  newConfig = parsed.data as ProjectConfig

  // 4. Normalization
  const normResult = normalizeConfig(config, newConfig, catalog)
  newConfig = normResult.config

  // 5. Rules
  const ruleIndex = new RuleIndex()
  const evalResult = evaluateRules(ruleIndex.getAll(), { config: newConfig, catalog })

  // 6. Validation
  const messages = validateConfig(newConfig, catalog, ruleIndex)

  return {
    success: true,
    newConfig,
    diagnostics: messages,
    normalizationNotices: [...normResult.notices, ...evalResult.normalizationNotices],
    appliedAt: timestamp,
  }
}

/**
 * Check if an operation is allowed in a fix (currently only 'set' and 'clear').
 */
export function isAllowedOperation(
  op: { op: string; path?: string },
): boolean {
  if (op.op === 'set' || op.op === 'clear') {
    return op.path ? ALLOWED_PATHS.has(op.path) && isValidConfigPath(op.path) : false
  }
  return false
}
