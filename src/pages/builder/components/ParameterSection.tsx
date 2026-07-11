// ============================================================
// ParameterSection — renders a ResolvedSection with all its fields.
// ============================================================

import type { ResolvedSection } from '../../../domain/presentation/resolved-field'
import type { ReactNode } from 'react'
import { ParameterField } from './ParameterField'

interface ParameterSectionProps {
  section: ResolvedSection
  expanded: boolean
  onToggle: () => void
  onFieldChange: (fieldId: string, value: unknown) => void
  onExplain: (fieldId: string) => void
  highlightedFieldId?: string
  actions?: ReactNode
}

export function ParameterSection({
  section,
  expanded,
  onToggle,
  onFieldChange,
  onExplain,
  highlightedFieldId,
  actions,
}: ParameterSectionProps) {
  return (
    <section className="parameter-section">
      <div className="parameter-section__header">
        <button
          type="button"
          onClick={onToggle}
          className="parameter-section__toggle"
          aria-expanded={expanded}
        >
          <span className={`parameter-section__chevron ${expanded ? 'parameter-section__chevron--open' : ''}`} aria-hidden="true">
            ▶
          </span>
          <span className="parameter-section__title">{section.label}</span>
          {section.description && (
            <span className="parameter-section__description">— {section.description}</span>
          )}
        </button>
        {actions && <div className="parameter-section__actions">{actions}</div>}
      </div>

      {expanded && (
        <div className="parameter-section__body">
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
    </section>
  )
}
