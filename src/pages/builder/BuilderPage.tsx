// ============================================================
// BuilderPage — the formal product UI.
// Consumes pipeline output + resolved builder view.
// Components contain ZERO FFmpeg business logic.
// ============================================================

import { useMemo, useCallback, useEffect, useState } from 'react'
import { useBuilderStore } from '../../store'
import { usePipeline } from '../../store/pipeline'
import { loadCatalog } from '../../domain/catalog/catalog-loader'
import { CatalogIndex } from '../../domain/catalog/catalog-index'
import { resolveBuilderView } from '../../domain/presentation/resolve-builder-view'
import { applyFieldChangeToConfig } from '../../domain/presentation/apply-field-change'
import type { ShellKind } from '../../domain/config/project-config'
import type { ProjectConfig } from '../../domain/config/project-config'
import type { SubtitleTrackConfig } from '../../domain/config/project-config'
import { ParameterSection } from './components/ParameterSection'
import { CommandPreview } from './components/CommandPreview'
import { ExplanationPanel } from '../../features/explanations/ExplanationPanel'
import { PresetManager } from '../../features/presets/PresetManager'
import { addSubtitleTrack, removeSubtitleTrack } from '../../domain/config/project-actions'
import { decodeConfigFromShare, encodeConfigToShare } from '../../features/sharing/share-codec'

const catalog = loadCatalog()
const catalogIndex = new CatalogIndex(catalog)
type ThemeKind = 'light' | 'dark'

export function BuilderPage() {
  const config = useBuilderStore((s) => s.config)
  const setConfigValue = useBuilderStore((s) => s.setConfigValue)
  const setConfig = useBuilderStore((s) => s.setConfig)
  const resetConfig = useBuilderStore((s) => s.resetConfig)
  const expandedSections = useBuilderStore((s) => s.expandedSections)
  const toggleSection = useBuilderStore((s) => s.toggleSection)
  const selectedExplanationId = useBuilderStore((s) => s.selectedExplanationId)
  const selectExplanation = useBuilderStore((s) => s.selectExplanation)
  const [theme, setTheme] = useState<ThemeKind>(() =>
    window.localStorage.getItem('ffcodec-theme') === 'dark' ? 'dark' : 'light',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('ffcodec-theme', theme)
  }, [theme])

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

  // Preset manager
  const [showPresetManager, setShowPresetManager] = useState(false)
  const [shareNotice, setShareNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!window.location.hash) return
    const decoded = decodeConfigFromShare(window.location.hash)
    if (decoded.success && decoded.config) {
      setConfig(decoded.config)
      setShareNotice(decoded.warnings[0] ?? '已载入链接中的共享配置')
    } else if (decoded.error) {
      setShareNotice('共享链接无法解析，已保留当前配置')
    }
  }, [setConfig])

  const handleApplyPreset = useCallback(
    (presetConfig: ProjectConfig) => {
      setConfig(presetConfig)
    },
    [setConfig],
  )

  const handleResetConfig = useCallback(() => {
    resetConfig()
  }, [resetConfig])

  const handleAddSubtitleTrack = useCallback(() => {
    setConfig(addSubtitleTrack(config))
  }, [config, setConfig])

  const handleRemoveSubtitleTrack = useCallback((trackId: string) => {
    setConfig(removeSubtitleTrack(config, trackId))
  }, [config, setConfig])

  const handleShare = useCallback(async () => {
    const result = encodeConfigToShare(config)
    if (result.kind === 'hash') {
      window.history.replaceState(null, '', result.value)
      try {
        await navigator.clipboard.writeText(window.location.href)
        setShareNotice('共享链接已复制；本地文件路径不会写入链接')
      } catch {
        setShareNotice('共享链接已写入地址栏，可直接复制')
      }
      return
    }
    const blob = new Blob([result.value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'ffcodec-share.json'
    anchor.click()
    URL.revokeObjectURL(url)
    setShareNotice('配置较长，已改为下载隐私安全的 JSON')
  }, [config])

  const handleFieldChange = useCallback(
    (fieldId: string, value: unknown) => {
      const result = applyFieldChangeToConfig(config, fieldId, value, view.fieldIndex, catalog)
      if (result.change.accepted) setConfig(result.config)
    },
    [config, setConfig, view.fieldIndex],
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

  const videoEncoderCount = Object.keys(catalog.encoders.video).length

  return (
    <main className="builder-page">
      <header className="product-header">
        <div className="product-header__brand">
          <div className="brand-mark" aria-hidden="true">FF</div>
          <div>
            <p className="eyebrow">FFCodec Lab · Command Workbench</p>
            <h1>FFmpeg 命令生成器</h1>
            <p className="product-header__description">
              组合编码、画面、音频与字幕参数，实时得到可追溯的跨 Shell 命令。所有能力均由目录和规则引擎驱动。
            </p>
            <div className="product-meta" aria-label="项目能力摘要">
              <span className="meta-pill">{videoEncoderCount} 个视频编码器</span>
              <span className="meta-pill">Bash · PowerShell · CMD</span>
              <span className="meta-pill meta-pill--success">纯本地 · 不上传文件</span>
            </div>
          </div>
        </div>
        <div className="product-header__actions">
          <button
            type="button"
            onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
            className="button"
            aria-pressed={theme === 'dark'}
            aria-label={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
          >
            {theme === 'light' ? '暗色模式' : '亮色模式'}
          </button>
          <button type="button" onClick={handleShare} className="button">
            分享配置
          </button>
          <button
            type="button"
            onClick={() => setShowPresetManager(true)}
            className="button button--primary"
          >
            管理预设
          </button>
          {shareNotice && <span className="share-notice" role="status">{shareNotice}</span>}
        </div>
      </header>

      <div className="workspace-grid">
        <section className="workspace-column" aria-label="参数配置">
          {view.sections.map((section) => (
            <ParameterSection
              key={section.id}
              section={section}
              expanded={expandedSections[section.id] ?? false}
              onToggle={() => toggleSection(section.id)}
              onFieldChange={handleFieldChange}
              onExplain={handleExplain}
              highlightedFieldId={highlightedFieldId}
              actions={section.id === 'section.subtitle' ? (
                <SubtitleSectionActions
                  tracks={config.subtitle.tracks}
                  onAdd={handleAddSubtitleTrack}
                  onRemove={handleRemoveSubtitleTrack}
                />
              ) : undefined}
            />
          ))}
        </section>

        <aside className="workspace-column workspace-column--preview" aria-label="命令与诊断">
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
            <div className="message-stack" role="status">
              {view.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`message-item message-item--${msg.severity}`}
                >
                  <strong className="message-item__level">
                    {msg.severity}
                  </strong>{' '}
                  {msg.code}
                  {msg.originIds.length > 0 && (
                    <span className="message-item__origins">
                      {' '}
                      [{msg.originIds.join(', ')}]
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {currentExplanation && (
            <ExplanationPanel
              explanation={currentExplanation}
              onClose={() => selectExplanation(null)}
            />
          )}
        </aside>
      </div>

      {showPresetManager && (
        <PresetManager
          onApply={handleApplyPreset}
          onReset={handleResetConfig}
          currentConfig={config}
          onClose={() => setShowPresetManager(false)}
        />
      )}
    </main>
  )
}

function SubtitleSectionActions({
  tracks,
  onAdd,
  onRemove,
}: {
  tracks: SubtitleTrackConfig[]
  onAdd: () => void
  onRemove: (trackId: string) => void
}) {
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0]?.id ?? '')

  useEffect(() => {
    if (!tracks.some((track) => track.id === selectedTrackId)) {
      setSelectedTrackId(tracks[0]?.id ?? '')
    }
  }, [selectedTrackId, tracks])

  return (
    <>
      {tracks.length > 0 && (
        <select
          value={selectedTrackId}
          onChange={(event) => setSelectedTrackId(event.target.value)}
          aria-label="选择要删除的字幕轨道"
          className="section-action-select"
        >
          {tracks.map((track) => <option key={track.id} value={track.id}>{track.id}</option>)}
        </select>
      )}
      <button type="button" className="button-ghost" onClick={onAdd}>添加轨道</button>
      <button
        type="button"
        className="button-ghost"
        onClick={() => onRemove(selectedTrackId)}
        disabled={!selectedTrackId}
      >
        删除轨道
      </button>
    </>
  )
}
