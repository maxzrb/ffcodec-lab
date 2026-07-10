// ============================================================
// resolve-builder-view — produces the complete ResolvedBuilderView
// from ProjectConfig + Catalog + EvaluationResult.
// This is the single entry point for the UI to get all resolved fields.
// ============================================================

import type { ProjectConfig } from '../config/project-config'
import type { Catalog } from '../catalog/catalog-types'
import type { EvaluationResult, ValidationMessage } from '../rules/rule-types'
import type { ResolvedBuilderView, ResolvedField } from './resolved-field'
import type { CommandPlan } from '../command/command-ast'
import {
  resolveInputSection,
  resolveVideoSection,
  resolveFrameSection,
  resolveAudioSection,
  resolveSubtitleSection,
  resolveContainerSection,
} from './resolve-section'
import { attachDiagnostics } from './resolve-field'

/**
 * Builds the complete resolved view for the builder page.
 * All data-driven UI decisions are made here; the page just renders.
 */
export function resolveBuilderView(
  config: ProjectConfig,
  catalog: Catalog,
  evaluationResult: EvaluationResult,
  commandPlan: CommandPlan,
): ResolvedBuilderView {
  const fieldStates = evaluationResult.fieldStates

  const sections = [
    resolveInputSection(config, fieldStates),
    resolveVideoSection(config, catalog, fieldStates),
    resolveFrameSection(config, fieldStates),
    resolveAudioSection(config, catalog, fieldStates),
    resolveSubtitleSection(config, catalog, fieldStates),
    resolveContainerSection(config, catalog, fieldStates),
  ].filter((s) => s.fields.length > 0)

  // Collect all fields into a flat index
  const allFields: ResolvedField[] = sections.flatMap((s) => s.fields)
  const fieldIndex: Record<string, ResolvedField> = {}
  for (const field of allFields) {
    fieldIndex[field.id] = field
  }

  // Attach command origins from CommandPlan
  attachCommandOrigins(allFields, commandPlan)

  // Attach diagnostics from evaluation result
  const allMessages: ValidationMessage[] = [
    ...evaluationResult.messages,
  ]
  attachDiagnostics(allFields, allMessages)

  const hasErrors = allMessages.some((m) => m.severity === 'error')

  return {
    sections,
    fieldIndex,
    messages: allMessages,
    hasErrors,
  }
}

/**
 * Maps command arguments back to their originating fields
 * via originId. This enables click-to-locate in the command preview.
 */
function attachCommandOrigins(fields: ResolvedField[], plan: CommandPlan): void {
  // Build reverse index: originId → fieldId
  // We go through all command args and map originId to matching field ids
  for (const inv of plan.invocations) {
    const allArgs = [
      ...inv.globalArgs,
      ...inv.output.maps,
      ...inv.output.codecArgs,
      ...inv.output.qualityArgs,
      ...inv.output.filterArgs,
      ...inv.output.audioArgs,
      ...inv.output.subtitleArgs,
      ...inv.output.muxerArgs,
      ...inv.output.customArgs,
    ]

    for (const arg of allArgs) {
      if (!arg.originId) continue

      // Find matching fields by checking prefixes
      for (const field of fields) {
        if (arg.originId === field.id || arg.originId.startsWith(field.id)) {
          if (!field.commandOrigins.includes(arg.originId)) {
            field.commandOrigins.push(arg.originId)
          }
        }
      }
    }
  }
}
