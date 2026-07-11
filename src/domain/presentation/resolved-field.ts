// ============================================================
// Resolved field model — the single UI-facing field type.
// Pages consume ResolvedField[]; they never read catalog,
// encoder definitions, or rule results directly.
// ============================================================

import type { ConfigBinding, SourceRef, VerificationLevel } from '../catalog/catalog-types'
import type { Diagnostic } from '../rules/rule-types'

/** A single option in a select/multiselect control */
export interface ResolvedOption {
  value: string | number
  label: string
  description?: string
  /** optgroup label for grouping by family/implementation */
  group?: string
  /** Implementation badge text, e.g. "NVIDIA", "Intel", "软件" */
  badge?: string
}

/**
 * A fully-resolved UI field.
 * All data-driven behavior (visibility, disabled state, options, range)
 * has been computed by the resolver. The UI component only renders.
 */
export interface ResolvedField {
  /** Unique identifier matching a config path or control id */
  id: string
  /** Display label */
  label: string
  /** Optional help text */
  description?: string
  /** Control type for rendering */
  controlType: 'select' | 'number' | 'text' | 'textarea' | 'switch' | 'multiselect' | 'color' | 'section'
  /** Current value from ProjectConfig */
  value: unknown
  /** Default value from catalog */
  defaultValue?: unknown

  /** Computed visibility from rule engine */
  visible: boolean
  /** Computed disabled state from rule engine */
  disabled: boolean
  /** Human-readable reason when disabled */
  disabledReason?: string

  /** Options for select/multiselect controls */
  options?: ResolvedOption[]
  /** Range constraints for number controls */
  min?: number
  max?: number
  step?: number

  /** Linked explanation entry */
  explanationId?: string
  /** Source references from catalog */
  sourceRefs: SourceRef[]
  /** Verification level from catalog */
  verificationLevel: VerificationLevel
  /** Whether cross-verification is still needed */
  needsCrossVerification: boolean

  /** Origin IDs that this field contributes to in the command */
  commandOrigins: string[]
  /** Validation warnings/errors related to this field */
  diagnostics: Diagnostic[]
  /** Config binding for write-back (maps field back to ProjectConfig path) */
  configBinding?: ConfigBinding
}

/**
 * A logical section grouping related ResolvedFields.
 */
export interface ResolvedSection {
  id: string
  label: string
  description?: string
  fields: ResolvedField[]
}

/**
 * The complete resolved view model for the builder page.
 */
export interface ResolvedBuilderView {
  sections: ResolvedSection[]
  /** Flattened field lookup by ID */
  fieldIndex: Record<string, ResolvedField>
  /** All messages (errors, warnings, info) */
  messages: Diagnostic[]
  /** Whether any errors exist */
  hasErrors: boolean
}
