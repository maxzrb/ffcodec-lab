// ============================================================
// WorkbenchApp — the shared product UI for Web and Desktop.
// Consumes pipeline output + resolved builder view.
// Components contain ZERO FFmpeg business logic.
// ============================================================

import { useMemo, useCallback, useEffect, useState, Fragment, type ReactNode } from 'react'
import { useBuilderStore } from './hooks'
import { usePipeline } from './hooks/usePipeline'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { CatalogIndex } from '@ffcodec/catalog/catalog-index'
import { resolveBuilderView } from '@ffcodec/domain/presentation/resolve-builder-view'
import type { ResolvedSection, ResolvedWorkspacePanel } from '@ffcodec/domain/presentation/resolved-field'
import { applyFieldChangeToConfig } from '@ffcodec/domain/presentation/apply-field-change'
import type { ShellKind } from '@ffcodec/domain/config/project-config'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'
import type { SubtitleTrackConfig } from '@ffcodec/domain/config/project-config'
import { ParameterSection } from './components/ParameterSection'
import { CommandPreview } from './components/CommandPreview'
import { ExplanationPanel } from './features/explanations/ExplanationPanel'
import { PresetManager } from './features/presets/PresetManager'
import { addSubtitleTrack, removeSubtitleTrack } from '@ffcodec/domain/config/project-actions'
import { decodeConfigFromShare, encodeConfigToShare } from './features/sharing/share-codec'
import { I18nProvider, translateText, useI18n, type Locale } from './features/i18n/i18n'
import { DiagnosticPanel } from './components/DiagnosticPanel'
import { applyFix } from '@ffcodec/domain/diagnostics/apply-diagnostic-fix'
import type { DiagnosticFix } from '@ffcodec/domain/rules/rule-types'
import { CommandEditor } from './components/CommandEditor'
import { WorkbenchShell } from './components/WorkbenchShell'
import { WorkbenchStateNotice } from './components/WorkbenchStateNotice'
import { Dropdown } from './components/Dropdown'
import { usePlatform } from '@ffcodec/platform-api'
import { useAppDialog } from './features/dialog/AppDialogProvider'

const catalog = loadCatalog()
const catalogIndex = new CatalogIndex(catalog)
type ThemeKind = 'light' | 'dark'

const PROJECT_URL = 'https://github.com/maxzrb/ffcodec-lab'
const APP_VERSION = 'v1.0'

export function WorkbenchApp({ footerItems, commandInspectorFooter }: { footerItems?: ReactNode; commandInspectorFooter?: ReactNode }) {
  const { storage, extensions } = usePlatform()
  const dialog = useAppDialog()
  const config = useBuilderStore((s) => s.config)
  const setConfigValue = useBuilderStore((s) => s.setConfigValue)
  const setConfig = useBuilderStore((s) => s.setConfig)
  const resetConfig = useBuilderStore((s) => s.resetConfig)
  const expandedSections = useBuilderStore((s) => s.expandedSections)
  const toggleSection = useBuilderStore((s) => s.toggleSection)
  const selectedExplanationId = useBuilderStore((s) => s.selectedExplanationId)
  const selectExplanation = useBuilderStore((s) => s.selectExplanation)
  const activePanelId = useBuilderStore((s) => s.activePanelId)
  const setActivePanel = useBuilderStore((s) => s.setActivePanel)
  const commandPreviewCleared = useBuilderStore((s) => s.commandPreviewCleared)
  const clearAllCommands = useBuilderStore((s) => s.clearAllCommands)
  const [theme, setTheme] = useState<ThemeKind>(() =>
    storage.getItem('ffcodec-theme') === 'dark' ? 'dark' : 'light',
  )
  const [locale, setLocale] = useState<Locale>(() =>
    storage.getItem('ffcodec-locale') === 'en' ? 'en' : 'zh-CN',
  )
  const isZh = locale === 'zh-CN'
  const text = useCallback((value: string) => translateText(value, locale), [locale])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    storage.setItem('ffcodec-theme', theme)
  }, [theme, storage])

  useEffect(() => {
    document.documentElement.lang = locale === 'zh-CN' ? 'zh-CN' : 'en'
    storage.setItem('ffcodec-locale', locale)
    window.dispatchEvent(new CustomEvent('ffcodec:locale-change', { detail: locale }))
  }, [locale, storage])

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
  const [inspectorTab, setInspectorTab] = useState<string>('command')

  useEffect(() => {
    if (!window.location.hash) return
    const decoded = decodeConfigFromShare(window.location.hash)
    if (decoded.success && decoded.config) {
      setConfig(decoded.config)
      setShareNotice(decoded.warnings[0] ?? (isZh ? '已载入链接中的共享配置' : 'Loaded configuration from the shared link'))
    } else if (decoded.error) {
      setShareNotice(isZh ? '共享链接无法解析，已保留当前配置' : 'The shared link could not be decoded; the current configuration was kept')
    }
  }, [isZh, setConfig])

  useEffect(() => {
    const requested = new URL(window.location.href).searchParams.get('panel')
    if (requested && view.panels.some((panel) => panel.id === requested)) setActivePanel(requested)
  }, [setActivePanel, view.panels])

  const handlePanelChange = useCallback((panelId: string) => {
    setActivePanel(panelId)
    const url = new URL(window.location.href)
    url.searchParams.set('panel', panelId)
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
  }, [setActivePanel])

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
      const url = new URL(window.location.href)
      url.hash = result.value
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
      try {
        await navigator.clipboard.writeText(window.location.href)
        setShareNotice(isZh ? '共享链接已复制；本地文件路径不会写入链接' : 'Share link copied; local file paths are excluded')
      } catch {
        setShareNotice(isZh ? '共享链接已写入地址栏，可直接复制' : 'The share link is in the address bar and ready to copy')
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
    setShareNotice(isZh ? '配置较长，已改为下载隐私安全的 JSON' : 'The configuration is too long for a link, so a privacy-safe JSON file was created')
  }, [config, isZh])

  const handleApplyDiagnosticFix = useCallback((fix: DiagnosticFix) => {
    const result = applyFix(config, fix, catalog)
    if (result.success) {
      setConfig(result.newConfig)
      setShareNotice(isZh ? `已应用修复：${fix.label}` : 'Diagnostic fix applied')
    } else {
      setShareNotice(isZh ? `修复未应用：${result.error ?? '未知错误'}` : `Fix was not applied: ${result.error ?? 'unknown error'}`)
    }
  }, [config, isZh, setConfig])

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
        const ownerPanel = view.panels.find((panel) => panel.sections.some(
          (section) => section.fields.some((candidate) => candidate.id === field.id),
        ))
        if (ownerPanel) handlePanelChange(ownerPanel.id)
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
    [view, expandedSections, toggleSection, selectExplanation, handlePanelChange],
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

  const handleClearAllCommands = useCallback(async () => {
    const confirmed = await dialog.confirm({
      title: isZh ? '清空全部命令？' : 'Clear all commands?',
      message: isZh ? '参数工作台将恢复默认值，当前参数和自由编辑内容都会丢失。' : 'The parameter workbench will reset; current parameters and manual edits will be discarded.',
      confirmLabel: isZh ? '清空并重置' : 'Clear and reset',
      cancelLabel: isZh ? '取消' : 'Cancel',
      tone: 'danger',
    })
    if (!confirmed) return

    clearAllCommands()
    setHighlightedFieldId(undefined)
    setInspectorTab('command')
    const url = new URL(window.location.href)
    url.hash = ''
    window.history.replaceState(null, '', `${url.pathname}${url.search}`)
    setShareNotice(isZh
      ? '已清空所有命令并重置参数工作台'
      : 'All commands cleared and parameter workbench reset')
  }, [clearAllCommands, dialog, isZh])

  // Current explanation data
  const currentExplanation = selectedExplanationId
    ? catalogIndex.getExplanation(selectedExplanationId)
    : undefined

  // Merge catalog panels with custom extension panels
  const allPanels: ResolvedWorkspacePanel[] = useMemo(() => {
    const custom: ResolvedWorkspacePanel[] = (extensions?.panels ?? []).map((p) => ({
      id: p.id,
      label: p.label,
      stateNotice: undefined,
      sections: [] as ResolvedSection[],
      diagnosticCount: 0,
      enabledAdvancedCount: 0,
    }))
    return [...view.panels, ...custom]
  }, [view.panels, extensions?.panels])

  const activePanel = allPanels.find((panel) => panel.id === activePanelId) ?? allPanels[0]
  const activeCustomPanel = extensions?.panels?.find((p) => p.id === activePanel?.id)

  return (
    <I18nProvider locale={locale}>
    <main className="builder-page">
      <header className="product-header">
        <div className="product-header__brand">
          <img className="brand-mark" src="./assets/ffcodec-lab-avatar.png" alt="FFCodec Lab" />
          <div>
            <p className="eyebrow">FFCodec Lab · Command Workbench</p>
            <h1>{isZh ? 'FFmpeg 命令生成器' : 'FFmpeg Command Builder'}</h1>
            <p className="product-header__description" data-multilingual-title>
              {isZh ? '模块化参数工作台 · 高级参数按需设置' : 'Modular parameter workbench · advanced settings on demand'}
            </p>
          </div>
        </div>
        <div className="product-header__actions">
          {extensions?.headerItems?.map((item, i) => (
            <Fragment key={`header-ext-${i}`}>{item}</Fragment>
          ))}
          <button
            type="button"
            onClick={() => setLocale((current) => current === 'zh-CN' ? 'en' : 'zh-CN')}
            className="button"
            aria-label={isZh ? 'Switch to English' : '切换到中文'}
          >
            {isZh ? 'EN' : '中'}
          </button>
          <button
            type="button"
            onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
            className="button"
            aria-pressed={theme === 'dark'}
            aria-label={theme === 'light'
              ? (isZh ? '切换到暗色模式' : 'Switch to dark mode')
              : (isZh ? '切换到亮色模式' : 'Switch to light mode')}
          >
            {theme === 'light'
              ? (isZh ? '暗色模式' : 'Dark mode')
              : (isZh ? '亮色模式' : 'Light mode')}
          </button>
          <button type="button" onClick={handleShare} className="button">
            {isZh ? '分享配置' : 'Share'}
          </button>
          <button
            type="button"
            onClick={() => setShowPresetManager(true)}
            className="button button--primary"
          >
            {isZh ? '管理预设' : 'Presets'}
          </button>
          {shareNotice && <span className="share-notice" role="status">{shareNotice}</span>}
        </div>
      </header>

      <WorkbenchShell
        panels={allPanels}
        activePanelId={activePanel.id}
        onPanelChange={handlePanelChange}
        settingsSections={extensions?.settingsSections}
        contentSections={extensions?.contentSections}
        footer={(
          <footer className="builder-footer">
            <small>
              {isZh
                ? '本项目部分参数参考自 '
                : 'Some parameters referenced from '}
              <a href="https://github.com/Lake1059/FFmpegFreeUI" target="_blank" rel="noopener noreferrer">
                Lake1059/FFmpegFreeUI
              </a>
            </small>
            <div className="builder-footer__project">
              <a
                className="builder-footer__project-link"
                href={PROJECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={isZh ? '在 GitHub 打开 FFCodec Lab 项目' : 'Open FFCodec Lab on GitHub'}
                title={PROJECT_URL}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.05-.02-1.9-2.78.62-3.37-1.21-3.37-1.21-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .08 1.53 1.05 1.53 1.05.9 1.57 2.35 1.12 2.92.86.09-.66.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.36 9.36 0 0 1 12 7.45c.85 0 1.69.12 2.48.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.95.68 1.92 0 1.39-.01 2.5-.01 2.84 0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
                </svg>
                <span>maxzrb/ffcodec-lab</span>
              </a>
              <span className="builder-footer__separator" aria-hidden="true" />
              <span className="builder-footer__version">FFCodec Lab {APP_VERSION}</span>
            </div>
            {footerItems && <div className="builder-footer__stats">{footerItems}</div>}
          </footer>
        )}
        content={activeCustomPanel
          ? activeCustomPanel.render()
          : (
          <>
            {activePanel.stateNotice && (
              <WorkbenchStateNotice notice={activePanel.stateNotice} onPanelChange={handlePanelChange} />
            )}
            {activePanel.sections.map((section) => (
              <Fragment key={section.id}>
                {section.id === 'section.input.streams-container' && extensions?.inputSectionPrefix}
                <ParameterSection
                  section={section}
                  expanded={expandedSections[section.id] ?? true}
                  onToggle={() => toggleSection(section.id)}
                  onFieldChange={handleFieldChange}
                  onExplain={handleExplain}
                  highlightedFieldId={highlightedFieldId}
                  pathFieldRenderer={extensions?.pathFieldRenderer}
                  actions={section.id === 'section.subtitle' ? (
                    <SubtitleSectionActions
                      tracks={config.subtitle.tracks}
                      onAdd={handleAddSubtitleTrack}
                      onRemove={handleRemoveSubtitleTrack}
                    />
                  ) : undefined}
                />
              </Fragment>
            ))}
          </>
        )}
        inspector={(
          <>
            <div className="inspector-tabs" role="tablist" aria-label={isZh ? '检查器视图' : 'Inspector view'}>
              <button type="button" role="tab" aria-selected={inspectorTab === 'command'} onClick={() => setInspectorTab('command')}>
                {isZh ? '命令' : 'Command'}
              </button>
              <button type="button" role="tab" aria-selected={inspectorTab === 'diagnostics'} onClick={() => setInspectorTab('diagnostics')}>
                {isZh ? '诊断' : 'Diagnostics'}
                {view.messages.length > 0 && (
                  <span className="inspector-tab__badge">{view.messages.length}</span>
                )}
              </button>
              {extensions?.inspectorTabs?.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={inspectorTab === tab.id}
                  onClick={() => setInspectorTab(tab.id)}
                >
                  {tab.label}
                  {tab.badge != null && (
                    <span className="inspector-tab__badge">{tab.badge}</span>
                  )}
                </button>
              ))}
            </div>
            {inspectorTab === 'command' ? (
              <div className="inspector-panel" key="command">
                <CommandPreview
                  commandPlan={pipeline.commandPlan}
                  renderedCommand={pipeline.renderedCommand}
                  shell={config.shell}
                  hasErrors={view.hasErrors}
                  cleared={commandPreviewCleared}
                  onShellChange={handleShellChange}
                  onClear={handleClearAllCommands}
                  onTokenClick={handleTokenClick}
                  commandActions={extensions?.commandActions?.map((a) => a.render())}
                />
                <CommandEditor
                  generatedCommand={commandPreviewCleared ? '' : pipeline.renderedCommand.text}
                  cleared={commandPreviewCleared}
                  renderActions={extensions?.renderCommandEditorActions}
                />
                {commandInspectorFooter}
              </div>
            ) : inspectorTab === 'diagnostics' ? (
              <div className="inspector-panel" key="diagnostics">
                <DiagnosticPanel
                  diagnostics={view.messages}
                  catalog={catalog}
                  getOriginLabel={(originId) => {
                    const field = view.fieldIndex[originId]
                      ?? Object.values(view.fieldIndex).find((candidate) => originId.startsWith(candidate.id))
                    return field ? text(field.label) : originId
                  }}
                  onLocate={handleTokenClick}
                  onApplyFix={handleApplyDiagnosticFix}
                />
              </div>
            ) : extensions?.inspectorTabs?.some((tab) => tab.id === inspectorTab) ? (
              <div className="inspector-panel" key={inspectorTab}>
                {extensions.inspectorTabs.find((tab) => tab.id === inspectorTab)!.render()}
              </div>
            ) : null}
          </>
        )}
      />

      {currentExplanation && (
        <div className="explanation-drawer">
          <ExplanationPanel explanation={currentExplanation} onClose={() => selectExplanation(null)} />
        </div>
      )}

      {showPresetManager && (
        <PresetManager
          onApply={handleApplyPreset}
          onReset={handleResetConfig}
          currentConfig={config}
          onClose={() => setShowPresetManager(false)}
        />
      )}

    </main>
    </I18nProvider>
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
  const { locale } = useI18n()
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0]?.id ?? '')

  useEffect(() => {
    if (!tracks.some((track) => track.id === selectedTrackId)) {
      setSelectedTrackId(tracks[0]?.id ?? '')
    }
  }, [selectedTrackId, tracks])

  return (
    <>
      {tracks.length > 0 && (
        <Dropdown
          value={selectedTrackId}
          options={tracks.map((track) => ({ value: track.id, label: track.id }))}
          onChange={(v) => setSelectedTrackId(v)}
          className="section-action-select"
          ariaLabel={locale === 'zh-CN' ? '选择要删除的字幕轨道' : 'Select subtitle track to remove'}
        />
      )}
      <button type="button" className="button-ghost" onClick={onAdd}>{locale === 'zh-CN' ? '添加轨道' : 'Add track'}</button>
      <button
        type="button"
        className="button-ghost"
        onClick={() => onRemove(selectedTrackId)}
        disabled={!selectedTrackId}
      >
        {locale === 'zh-CN' ? '删除轨道' : 'Remove track'}
      </button>
    </>
  )
}
