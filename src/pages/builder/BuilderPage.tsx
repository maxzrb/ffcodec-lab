// ============================================================
// BuilderPage — the formal product UI.
// Consumes pipeline output + resolved builder view.
// Components contain ZERO FFmpeg business logic.
// ============================================================

import { useMemo, useCallback, useState } from 'react'
import { useBuilderStore } from '../../store'
import { usePipeline } from '../../store/pipeline'
import { loadCatalog } from '../../domain/catalog/catalog-loader'
import { CatalogIndex } from '../../domain/catalog/catalog-index'
import { resolveBuilderView } from '../../domain/presentation/resolve-builder-view'
import type { ShellKind } from '../../domain/config/project-config'
import { ParameterSection } from './components/ParameterSection'
import { CommandPreview } from './components/CommandPreview'
import { ExplanationPanel } from '../../features/explanations/ExplanationPanel'

const catalog = loadCatalog()
const catalogIndex = new CatalogIndex(catalog)

export function BuilderPage() {
  const config = useBuilderStore((s) => s.config)
  const setConfigValue = useBuilderStore((s) => s.setConfigValue)
  const expandedSections = useBuilderStore((s) => s.expandedSections)
  const toggleSection = useBuilderStore((s) => s.toggleSection)
  const selectedExplanationId = useBuilderStore((s) => s.selectedExplanationId)
  const selectExplanation = useBuilderStore((s) => s.selectExplanation)

  const pipeline = usePipeline(config, catalog)

  // Resolve the builder view from pipeline output
  const view = useMemo(
    () =>
      resolveBuilderView(
        pipeline.normalizedConfig,
        catalog,
        pipeline.evaluationResult,
        pipeline.commandPlan,
      ),
    [pipeline.normalizedConfig, pipeline.evaluationResult, pipeline.commandPlan],
  )

  // Track highlighted field from command token click
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | undefined>()

  const handleFieldChange = useCallback(
    (fieldId: string, value: unknown) => {
      // Map resolved field IDs back to config paths
      const configPath = mapFieldIdToConfigPath(fieldId)
      setConfigValue(configPath, value)
    },
    [setConfigValue],
  )

  const handleTokenClick = useCallback(
    (originId: string) => {
      // Find the field that owns this originId
      const field = view.fieldIndex[originId]
        ?? Object.values(view.fieldIndex).find((f) => f.commandOrigins.includes(originId))

      if (field) {
        setHighlightedFieldId(field.id)
        // Expand the section containing this field
        for (const section of view.sections) {
          if (section.fields.some((f) => f.id === field.id)) {
            if (!expandedSections[section.id]) {
              toggleSection(section.id)
            }
            break
          }
        }
        // Open explanation
        if (field.explanationId) {
          selectExplanation(field.explanationId)
        }
        // Clear highlight after 3 seconds
        setTimeout(() => setHighlightedFieldId(undefined), 3000)
      }
    },
    [view, expandedSections, toggleSection, selectExplanation],
  )

  const handleExplain = useCallback(
    (fieldId: string) => {
      const field = view.fieldIndex[fieldId]
      if (field?.explanationId) {
        selectExplanation(field.explanationId)
      }
    },
    [view.fieldIndex, selectExplanation],
  )

  const handleShellChange = useCallback(
    (shell: ShellKind) => {
      setConfigValue('shell', shell)
    },
    [setConfigValue],
  )

  // Current explanation data
  const currentExplanation = selectedExplanationId
    ? catalogIndex.getExplanation(selectedExplanationId)
    : undefined

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>FFmpeg 压制命令生成器</h1>
      <p style={{ color: 'var(--text-dim)', marginBottom: 20, fontSize: 13 }}>
        选择编码参数，实时生成可执行的 FFmpeg 命令。所有参数均来自已验证编码器目录。
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* LEFT COLUMN: Parameter sections */}
        <div>
          {view.sections.map((section) => (
            <ParameterSection
              key={section.id}
              section={section}
              expanded={expandedSections[section.id] ?? false}
              onToggle={() => toggleSection(section.id)}
              onFieldChange={handleFieldChange}
              onExplain={handleExplain}
              highlightedFieldId={highlightedFieldId}
            />
          ))}
        </div>

        {/* RIGHT COLUMN: Command preview + Explanation */}
        <div>
          <CommandPreview
            commandPlan={pipeline.commandPlan}
            renderedCommand={pipeline.renderedCommand}
            shell={config.shell}
            hasErrors={view.hasErrors}
            onShellChange={handleShellChange}
            onTokenClick={handleTokenClick}
          />

          {/* Messages summary */}
          {view.messages.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {view.messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    padding: '6px 12px',
                    marginBottom: 4,
                    borderLeft: `3px solid ${
                      msg.severity === 'error'
                        ? 'var(--error)'
                        : msg.severity === 'warning'
                          ? 'var(--warning)'
                          : 'var(--info)'
                    }`,
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius)',
                    fontSize: 12,
                  }}
                >
                  <strong style={{ textTransform: 'uppercase', fontSize: 10 }}>
                    {msg.severity}
                  </strong>{' '}
                  {msg.code}
                  {msg.originIds.length > 0 && (
                    <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>
                      {' '}
                      [{msg.originIds.join(', ')}]
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Explanation Panel */}
          {currentExplanation && (
            <ExplanationPanel
              explanation={currentExplanation}
              onClose={() => selectExplanation(null)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Maps resolved field IDs back to ProjectConfig dot-paths.
 * This is the inverse of what the resolver does when reading config values.
 */
function mapFieldIdToConfigPath(fieldId: string): string {
  // Direct config path mappings
  const directMappings: Record<string, string> = {
    'input.path': 'input.path',
    'output.path': 'output.path',
    'output.overwrite': 'output.overwrite',
    'video.mode': 'video.mode',
    'video.encoderId': 'video.encoderId',
    'video.preset': 'video.preset',
    'video.profile': 'video.profile',
    'video.tune': 'video.tune',
    'video.pixelFormat': 'video.pixelFormat',
    'video.rateControl.mode': 'video.rateControl.mode',
    'video.rateControl.qualityValue': 'video.rateControl.qualityValue',
    'video.rateControl.bitrate': 'video.rateControl.bitrate',
    'video.rateControl.maxRate': 'video.rateControl.maxRate',
    'video.rateControl.bufferSize': 'video.rateControl.bufferSize',
    'frame.resolution.mode': 'frame.resolution.mode',
    'frame.resolution.width': 'frame.resolution.width',
    'frame.resolution.height': 'frame.resolution.height',
    'frame.frameRate.mode': 'frame.frameRate.mode',
    'frame.frameRate.value': 'frame.frameRate.value',
    'audio.mode': 'audio.mode',
    'audio.encoderId': 'audio.encoderId',
    'audio.bitrate': 'audio.bitrate',
    'audio.channelLayout': 'audio.channelLayout',
    'audio.sampleRate': 'audio.sampleRate',
    'subtitle.mux.enabled': 'subtitle.mux.enabled',
    'subtitle.mux.source': 'subtitle.mux.source',
    'subtitle.mux.externalPath': 'subtitle.mux.externalPath',
    'subtitle.mux.codecMode': 'subtitle.mux.codecMode',
    'subtitle.burn.enabled': 'subtitle.burn.enabled',
    'subtitle.burn.source': 'subtitle.burn.source',
    'subtitle.burn.externalPath': 'subtitle.burn.externalPath',
    'subtitle.burn.streamIndex': 'subtitle.burn.streamIndex',
    'subtitle.burn.style.fontName': 'subtitle.burn.style.fontName',
    'subtitle.burn.style.fontSize': 'subtitle.burn.style.fontSize',
    'output.containerId': 'output.containerId',
  }

  if (directMappings[fieldId]) {
    return directMappings[fieldId]
  }

  // For encoder special parameters and other dynamic paths, use the fieldId directly
  return fieldId
}
