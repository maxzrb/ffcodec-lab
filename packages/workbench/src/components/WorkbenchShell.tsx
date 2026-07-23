import { useEffect, useState, type ReactNode } from 'react'
import type { ResolvedWorkspacePanel } from '@ffcodec/domain/presentation/resolved-field'
import type { PathFieldRenderer, SettingsSectionExtension } from '@ffcodec/platform-api'
import { useI18n } from '../features/i18n/i18n'
import { Dropdown } from './Dropdown'
import { usePlatform } from '@ffcodec/platform-api'

interface WorkbenchShellProps {
  panels: ResolvedWorkspacePanel[]
  activePanelId: string
  onPanelChange: (panelId: string) => void
  content: ReactNode
  inspector: ReactNode
  footer?: ReactNode
  /** Platform-specific path field renderer, passed through to content. */
  pathFieldRenderer?: PathFieldRenderer
  /** Platform-provided settings sections rendered in the nav sidebar. */
  settingsSections?: SettingsSectionExtension[]
  /** Additional nodes rendered at the top of the workbench content area. */
  contentSections?: ReactNode[]
}

const SIDEBAR_COLLAPSED_KEY = 'ffcodec-workbench-sidebar-collapsed'

const PANEL_SHORT_LABELS: Record<string, { zh: string; en: string }> = {
  'input-output': { zh: '入', en: 'IO' },
  video: { zh: '视', en: 'V' },
  quality: { zh: '质', en: 'Q' },
  color: { zh: '色', en: 'C' },
  filters: { zh: '画', en: 'FX' },
  audio: { zh: '音', en: 'A' },
  subtitle: { zh: '字', en: 'S' },
  'streams-container': { zh: '流', en: 'M' },
  tools: { zh: '工', en: 'T' },
  custom: { zh: '自', en: '+' },
}

export function WorkbenchShell({
  panels,
  activePanelId,
  onPanelChange,
  content,
  inspector,
  footer,
  pathFieldRenderer: _pathFieldRenderer,
  settingsSections,
  contentSections,
}: WorkbenchShellProps) {
  const { text, locale } = useI18n()
  const platform = usePlatform()
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => platform.storage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true',
  )

  useEffect(() => {
    const openInspector = () => setMobileInspectorOpen(true)
    window.addEventListener('ffcodec:open-inspector', openInspector)
    return () => window.removeEventListener('ffcodec:open-inspector', openInspector)
  }, [])

  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed
      platform.storage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
      return next
    })
  }

  return (
    <div className={`workbench-shell ${sidebarCollapsed ? 'workbench-shell--nav-collapsed' : ''}`}>
      <label className="workbench-mobile-nav">
        <span>{locale === 'zh-CN' ? '当前模块' : 'Current module'}</span>
        <Dropdown
          value={activePanelId}
          options={panels.map((panel) => ({ value: panel.id, label: text(panel.label) }))}
          onChange={(v) => onPanelChange(v)}
          ariaLabel={locale === 'zh-CN' ? '当前模块' : 'Current module'}
        />
      </label>

      <nav className="workbench-nav" aria-label={locale === 'zh-CN' ? '参数模块' : 'Parameter modules'}>
        <div className="workbench-nav__header">
          <p className="workbench-nav__title">{locale === 'zh-CN' ? '参数工作台' : 'Parameter workbench'}</p>
          <button
            type="button"
            className="workbench-nav__collapse"
            aria-label={sidebarCollapsed
              ? (locale === 'zh-CN' ? '展开参数侧边栏' : 'Expand parameter sidebar')
              : (locale === 'zh-CN' ? '折叠参数侧边栏' : 'Collapse parameter sidebar')}
            aria-expanded={!sidebarCollapsed}
            onClick={toggleSidebar}
          >
            <span aria-hidden="true">{sidebarCollapsed ? '›' : '‹'}</span>
          </button>
        </div>
        {panels.map((panel) => (
          <button
            key={panel.id}
            type="button"
            className={`workbench-nav__item ${panel.id === activePanelId ? 'workbench-nav__item--active' : ''}`}
            aria-current={panel.id === activePanelId ? 'page' : undefined}
            aria-label={text(panel.label)}
            title={sidebarCollapsed ? text(panel.label) : undefined}
            onClick={() => onPanelChange(panel.id)}
          >
            <span className="workbench-nav__short" aria-hidden="true">
              {PANEL_SHORT_LABELS[panel.id]?.[locale === 'zh-CN' ? 'zh' : 'en'] ?? text(panel.label).slice(0, 1)}
            </span>
            <span className="workbench-nav__label">{text(panel.label)}</span>
            <span className="workbench-nav__badges">
              {panel.enabledAdvancedCount > 0 && <span title={locale === 'zh-CN' ? '已设置高级参数' : 'Advanced settings'}>{panel.enabledAdvancedCount}</span>}
              {panel.diagnosticCount > 0 && <span title={locale === 'zh-CN' ? '诊断信息' : 'Diagnostics'}>{panel.diagnosticCount}</span>}
            </span>
          </button>
        ))}
        {settingsSections && settingsSections.length > 0 && (
          <div className="workbench-nav__settings">
            {settingsSections.map((section) => (
              <div key={section.id} className="workbench-nav__setting-section">
                <p className="workbench-nav__setting-title">{section.title}</p>
                {section.render()}
              </div>
            ))}
          </div>
        )}
      </nav>

      <section className="workbench-content" key={activePanelId}>
        {contentSections && contentSections.length > 0 && (
          <div className="workbench-content__sections">{contentSections}</div>
        )}
        {content}
      </section>
      <button
        type="button"
        className="workbench-mobile-inspector-toggle"
        aria-expanded={mobileInspectorOpen}
        onClick={() => setMobileInspectorOpen((open) => !open)}
      >
        {mobileInspectorOpen
          ? (locale === 'zh-CN' ? '收起命令检查器' : 'Close command inspector')
          : (locale === 'zh-CN' ? '查看命令与诊断' : 'Command and diagnostics')}
      </button>
      <aside
        className={`workbench-inspector ${mobileInspectorOpen ? 'workbench-inspector--mobile-open' : ''}`}
        aria-label={locale === 'zh-CN' ? '命令检查器' : 'Command inspector'}
      >{inspector}</aside>
      {footer}
    </div>
  )
}
