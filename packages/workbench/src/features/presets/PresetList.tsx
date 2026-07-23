// ============================================================
// PresetList — displays built-in and user presets.
// ============================================================

import { useMemo, useState } from 'react'
import type { UserPreset } from './preset-types'
import type { Catalog } from '@ffcodec/domain/catalog/catalog-types'
import { resolvePresetSummary } from './resolve-preset-summary'
import { useI18n } from '../i18n/i18n'

interface PresetListProps {
  builtinPresets: Array<Omit<UserPreset, 'id' | 'createdAt' | 'updatedAt'>>
  userPresets: UserPreset[]
  catalog: Catalog
  onApplyBuiltin: (index: number) => void
  onApply: (preset: UserPreset) => void
  onEdit: (preset: UserPreset) => void
  onDelete: (id: string) => void
  onOverwrite: (id: string) => void
  onRename: (id: string, name: string) => void
  onExport: (id: string) => void
}

type BuiltinPreset = Omit<UserPreset, 'id' | 'createdAt' | 'updatedAt'>
type PresetScope = 'all' | 'builtin' | 'user'
type PresetEntry =
  | { kind: 'builtin'; index: number; preset: BuiltinPreset }
  | { kind: 'user'; preset: UserPreset }

const PRESETS_PER_PAGE = 12

export function PresetList({
  builtinPresets,
  userPresets,
  catalog,
  onApplyBuiltin,
  onApply,
  onEdit,
  onDelete,
  onOverwrite,
  onExport,
}: PresetListProps) {
  const { locale, text } = useI18n()
  const isZh = locale === 'zh-CN'
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<PresetScope>('all')
  const [page, setPage] = useState(1)
  const normalizedQuery = query.trim().toLocaleLowerCase(locale)

  const matchingBuiltins = useMemo(() => builtinPresets
    .map((preset, index) => ({ kind: 'builtin' as const, index, preset }))
    .filter(({ preset }) => matchesQuery(text(preset.name), preset.description ? text(preset.description) : '', normalizedQuery)),
  [builtinPresets, normalizedQuery, text])
  const matchingUsers = useMemo(() => userPresets
    .filter((preset) => matchesQuery(preset.name, preset.description ?? '', normalizedQuery))
    .map((preset) => ({ kind: 'user' as const, preset })),
  [normalizedQuery, userPresets])
  const entries: PresetEntry[] = [
    ...(scope === 'user' ? [] : matchingBuiltins),
    ...(scope === 'builtin' ? [] : matchingUsers),
  ]
  const pageCount = Math.max(1, Math.ceil(entries.length / PRESETS_PER_PAGE))
  const activePage = Math.min(page, pageCount)
  const visibleEntries = entries.slice(
    (activePage - 1) * PRESETS_PER_PAGE,
    activePage * PRESETS_PER_PAGE,
  )
  const visibleBuiltins = visibleEntries.filter((entry) => entry.kind === 'builtin')
  const visibleUsers = visibleEntries.filter((entry) => entry.kind === 'user')

  const changeScope = (nextScope: PresetScope) => {
    setScope(nextScope)
    setPage(1)
  }

  return (
    <div className="preset-browser">
      <div className="preset-browser__tools">
        <input
          type="search"
          className="preset-browser__search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(1)
          }}
          placeholder={isZh ? '搜索预设名称或描述' : 'Search preset name or description'}
          aria-label={isZh ? '搜索预设' : 'Search presets'}
        />
        <div className="preset-browser__scope" role="group" aria-label={isZh ? '预设分类' : 'Preset category'}>
          <ScopeButton active={scope === 'all'} label={isZh ? '全部' : 'All'} onClick={() => changeScope('all')} />
          <ScopeButton active={scope === 'builtin'} label={isZh ? '内置' : 'Built-in'} onClick={() => changeScope('builtin')} />
          <ScopeButton active={scope === 'user'} label={isZh ? '用户' : 'User'} onClick={() => changeScope('user')} />
        </div>
      </div>

      {/* Built-in presets */}
      {visibleBuiltins.length > 0 && (
        <SectionHeader
          label={isZh ? '内置预设' : 'Built-in presets'}
          count={matchingBuiltins.length}
          total={builtinPresets.length}
        />
      )}
      {visibleBuiltins.map(({ preset: bp, index }) => {
        const config = bp.config
        const summary = resolvePresetSummary(config, catalog, locale)
        return (
          <PresetCard
            key={`builtin-${index}`}
            name={text(bp.name)}
            description={bp.description ? text(bp.description) : undefined}
            summary={summary}
            actions={
              <>
                <CardButton label={isZh ? '应用' : 'Apply'} onClick={() => onApplyBuiltin(index)} primary />
              </>
            }
          />
        )
      })}

      {/* User presets */}
      {visibleUsers.length > 0 && (
        <SectionHeader
          label={isZh ? '用户预设' : 'User presets'}
          count={matchingUsers.length}
          total={userPresets.length}
        />
      )}
      {scope !== 'builtin' && userPresets.length === 0 && !normalizedQuery && (
        <div style={{ padding: '12px 0', color: 'var(--text-dim)', fontSize: 13, textAlign: 'center' }}>
          {isZh ? '暂无用户预设。点击「+ 新建预设」或「另存当前为…」创建。' : 'No user presets yet. Create one with “+ New preset” or “Save current as…”.'}
        </div>
      )}
      {visibleUsers.map(({ preset }) => {
        const summary = resolvePresetSummary(preset.config, catalog, locale)
        return (
          <PresetCard
            key={preset.id}
            name={preset.name}
            description={preset.description}
            summary={summary}
            meta={`${isZh ? '更新于' : 'Updated'} ${new Date(preset.updatedAt).toLocaleString(isZh ? 'zh-CN' : 'en')}`}
            actions={
              <>
                <CardButton label={isZh ? '应用' : 'Apply'} onClick={() => onApply(preset)} primary />
                <CardButton label={isZh ? '编辑' : 'Edit'} onClick={() => onEdit(preset)} />
                <CardButton label={isZh ? '覆盖' : 'Overwrite'} onClick={() => onOverwrite(preset.id)} />
                <CardButton label={isZh ? '导出' : 'Export'} onClick={() => onExport(preset.id)} />
                <CardButton label={isZh ? '删除' : 'Delete'} onClick={() => onDelete(preset.id)} danger />
              </>
            }
          />
        )
      })}

      {entries.length === 0 && (normalizedQuery || userPresets.length > 0) && (
        <div className="preset-browser__empty">
          {isZh ? '没有匹配的预设' : 'No matching presets'}
        </div>
      )}

      {pageCount > 1 && (
        <div className="preset-browser__pagination" aria-label={isZh ? '预设分页' : 'Preset pagination'}>
          <button
            type="button"
            onClick={() => setPage(Math.max(1, activePage - 1))}
            disabled={activePage === 1}
            aria-label={isZh ? '上一页' : 'Previous page'}
          >
            ‹
          </button>
          <span>{activePage} / {pageCount}</span>
          <button
            type="button"
            onClick={() => setPage(Math.min(pageCount, activePage + 1))}
            disabled={activePage === pageCount}
            aria-label={isZh ? '下一页' : 'Next page'}
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}

function matchesQuery(name: string, description: string, query: string): boolean {
  if (!query) return true
  return `${name}\n${description}`.toLocaleLowerCase().includes(query)
}

function ScopeButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick}>
      {label}
    </button>
  )
}

function SectionHeader({ label, count, total }: { label: string; count: number; total: number }) {
  return (
    <h3
      style={{
        fontSize: 13,
        fontWeight: 600,
        margin: '12px 0 8px',
        paddingBottom: 4,
        borderBottom: '1px solid var(--border)',
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {label} ({count === total ? total : `${count}/${total}`})
    </h3>
  )
}

function PresetCard({
  name,
  description,
  summary,
  meta,
  actions,
}: {
  name: string
  description?: string
  summary: { video: string; audio: string; container: string; subtitles: string }
  meta?: string
  actions: React.ReactNode
}) {
  return (
    <div
      style={{
        padding: '8px 12px',
        marginBottom: 6,
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        fontSize: 12,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>
          <strong style={{ fontSize: 13 }}>{name}</strong>
          {description && (
            <span style={{ color: 'var(--text-dim)', marginLeft: 8, fontSize: 11 }}>
              — {description}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, flexShrink: 0 }}>{actions}</div>
      </div>

      {/* Summary */}
      <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: '4px 16px', color: 'var(--text-dim)', fontSize: 11 }}>
        <span>🎬 {summary.video}</span>
        <span>🔊 {summary.audio}</span>
        <span>📦 {summary.container}</span>
        <span>💬 {summary.subtitles}</span>
      </div>

      {meta && (
        <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-dim)', fontStyle: 'italic' }}>
          {meta}
        </div>
      )}
    </div>
  )
}

function CardButton({
  label,
  onClick,
  primary,
  danger,
}: {
  label: string
  onClick: () => void
  primary?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '2px 8px',
        fontSize: 10,
        background: primary
          ? 'var(--accent)'
          : danger
            ? 'rgba(255,107,107,0.1)'
            : 'var(--bg-card)',
        border: `1px solid ${danger ? 'var(--error)' : primary ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 3,
        cursor: 'pointer',
        color: primary ? '#fff' : danger ? 'var(--error)' : 'var(--text)',
      }}
    >
      {label}
    </button>
  )
}
