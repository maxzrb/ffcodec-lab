// ============================================================
// resolve-builder-view — produces the complete ResolvedBuilderView
// from ProjectConfig + Catalog + EvaluationResult.
// This is the single entry point for the UI to get all resolved fields.
// ============================================================

import type { ProjectConfig } from '../config/project-config'
import type { Catalog } from '../catalog/catalog-types'
import type { EvaluationResult, Diagnostic } from '../rules/rule-types'
import type { ResolvedBuilderView, ResolvedField } from './resolved-field'
import type { CommandPlan } from '../command/command-ast'
import {
  resolveInputSection,
  resolveVideoSection,
  resolveVideoAdvancedSection,
  resolveFrameSection,
  resolveColorSection,
  resolveAudioSection,
  resolveSubtitleSection,
  resolveContainerSection,
  resolveCustomArgsSection,
  resolveMetadataSection,
  resolveUtilityToolsSection,
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
    resolveVideoAdvancedSection(config, catalog, fieldStates),
    resolveFrameSection(config, fieldStates),
    resolveColorSection(config, fieldStates),
    resolveAudioSection(config, catalog, fieldStates),
    resolveSubtitleSection(config, catalog, fieldStates),
    resolveContainerSection(config, catalog, fieldStates),
    resolveUtilityToolsSection(config, catalog),
    resolveMetadataSection(config),
    resolveCustomArgsSection(config),
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
  const allMessages: Diagnostic[] = [
    ...evaluationResult.messages,
  ]
  attachDiagnostics(allFields, allMessages)

  const hasErrors = allMessages.some((m) => m.severity === 'error')
  const panels = buildWorkspacePanels(sections)

  return {
    sections,
    panels,
    fieldIndex,
    messages: allMessages,
    hasErrors,
  }
}

const PANEL_DEFINITIONS = [
  ['input-output', '输入与输出'],
  ['video', '视频编码'],
  ['quality', '质量控制'],
  ['color', '色彩管理'],
  ['filters', '画面与滤镜'],
  ['audio', '音频'],
  ['subtitle', '字幕'],
  ['streams-container', '流与封装'],
  ['tools', '实用工具'],
  ['custom', '自定义参数'],
] as const

function buildWorkspacePanels(sections: ResolvedBuilderView['sections']): ResolvedBuilderView['panels'] {
  return PANEL_DEFINITIONS.map(([id, label]) => {
    const panelSections = sections.flatMap((section) => {
      const fields = section.fields.filter((field) => resolvePanelId(section.id, field) === id)
      if (fields.length === 0) return []
      const split = fields.length !== section.fields.length
      return [{
        ...section,
        id: split ? `${section.id}.${id}` : section.id,
        label: resolvePanelSectionLabel(id, section.id, label),
        fields,
      }]
    })
    const fields = panelSections.flatMap((section) => section.fields)
    return {
      id,
      label,
      sections: panelSections,
      diagnosticCount: fields.reduce((sum, field) => sum + field.diagnostics.length, 0),
      enabledAdvancedCount: fields.filter((field) => field.tier === 'advanced' && field.visible && isAdvancedValueSet(field.value)).length,
    }
  })
}

/** 同一工作台内保留来源分组语义，避免两个区域显示完全相同的标题。 */
function resolvePanelSectionLabel(panelId: string, sectionId: string, fallback: string): string {
  if (panelId === 'video' && sectionId === 'section.video-advanced') return '编码器高级参数'
  if (panelId === 'color' && sectionId === 'section.video') return '像素格式'
  if (panelId === 'color' && sectionId === 'section.color') return '色彩元数据'
  if (panelId === 'streams-container' && sectionId === 'section.input') return '流选择'
  if (panelId === 'streams-container' && sectionId === 'section.container') return '封装设置'
  if (panelId === 'custom' && sectionId === 'section.metadata') return '自定义元数据'
  if (panelId === 'custom' && sectionId === 'section.customArgs') return '自定义参数'
  if (panelId === 'tools' && sectionId === 'section.tools') return '目标文件大小'
  return fallback
}

function resolvePanelId(sectionId: string, field: ResolvedField): string {
  if (field.panelId) return field.panelId
  if (field.id.startsWith('streams.') || sectionId === 'section.container') return 'streams-container'
  if (sectionId === 'section.input') return 'input-output'
  if (sectionId === 'section.video') return 'video'
  if (sectionId === 'section.frame') return 'filters'
  if (sectionId === 'section.color') return 'color'
  if (sectionId === 'section.audio') return 'audio'
  if (sectionId === 'section.subtitle') return 'subtitle'
  if (sectionId === 'section.tools') return 'tools'
  return 'custom'
}

function isAdvancedValueSet(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '' && value !== false && value !== 'none' && value !== 'auto'
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
      ...inv.output.metadataArgs,
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
