// ============================================================
// PresetList — displays built-in and user presets.
// ============================================================

import type { UserPreset } from './preset-types'
import type { Catalog } from '../../domain/catalog/catalog-types'
import { resolvePresetSummary } from './resolve-preset-summary'

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
  return (
    <div>
      {/* Built-in presets */}
      <SectionHeader label="内置预设" count={builtinPresets.length} />
      {builtinPresets.map((bp, i) => {
        const config = bp.config
        const summary = resolvePresetSummary(config, catalog)
        return (
          <PresetCard
            key={`builtin-${i}`}
            name={bp.name}
            description={bp.description}
            summary={summary}
            actions={
              <>
                <CardButton label="应用" onClick={() => onApplyBuiltin(i)} primary />
              </>
            }
          />
        )
      })}

      {/* User presets */}
      <SectionHeader label="用户预设" count={userPresets.length} />
      {userPresets.length === 0 && (
        <div style={{ padding: '12px 0', color: 'var(--text-dim)', fontSize: 13, textAlign: 'center' }}>
          暂无用户预设。点击「+ 新建预设」或「另存当前为…」创建。
        </div>
      )}
      {userPresets.map((preset) => {
        const summary = resolvePresetSummary(preset.config, catalog)
        return (
          <PresetCard
            key={preset.id}
            name={preset.name}
            description={preset.description}
            summary={summary}
            meta={`更新于 ${new Date(preset.updatedAt).toLocaleString('zh-CN')}`}
            actions={
              <>
                <CardButton label="应用" onClick={() => onApply(preset)} primary />
                <CardButton label="编辑" onClick={() => onEdit(preset)} />
                <CardButton label="覆盖" onClick={() => onOverwrite(preset.id)} />
                <CardButton label="导出" onClick={() => onExport(preset.id)} />
                <CardButton label="删除" onClick={() => onDelete(preset.id)} danger />
              </>
            }
          />
        )
      })}
    </div>
  )
}

function SectionHeader({ label, count }: { label: string; count: number }) {
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
      {label} ({count})
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 13 }}>{name}</strong>
          {description && (
            <span style={{ color: 'var(--text-dim)', marginLeft: 8, fontSize: 11 }}>
              — {description}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>{actions}</div>
      </div>

      {/* Summary */}
      <div style={{ marginTop: 6, display: 'flex', gap: 16, color: 'var(--text-dim)', fontSize: 11 }}>
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
