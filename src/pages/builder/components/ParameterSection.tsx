// ============================================================
// ParameterSection — renders a ResolvedSection with all its fields.
// ============================================================

import type { ResolvedSection } from '../../../domain/presentation/resolved-field'
import { ParameterField } from './ParameterField'

interface ParameterSectionProps {
  section: ResolvedSection
  expanded: boolean
  onToggle: () => void
  onFieldChange: (fieldId: string, value: unknown) => void
  onExplain: (fieldId: string) => void
  highlightedFieldId?: string
}

export function ParameterSection({
  section,
  expanded,
  onToggle,
  onFieldChange,
  onExplain,
  highlightedFieldId,
}: ParameterSectionProps) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '10px 16px',
          background: 'var(--bg-input)',
          border: 'none',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text)',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 10, transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ▶
        </span>
        {section.label}
        {section.description && (
          <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 400 }}>
            — {section.description}
          </span>
        )}
      </button>

      {expanded && (
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {section.fields.map((field) => (
            <ParameterField
              key={field.id}
              field={field}
              onChange={(v) => onFieldChange(field.id, v)}
              onExplain={onExplain}
              highlighted={field.id === highlightedFieldId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
