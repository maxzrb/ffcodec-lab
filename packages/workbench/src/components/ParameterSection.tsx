// ============================================================
// ParameterSection — renders a ResolvedSection with all its fields.
// Fields separated by controlType='section' dividers are visually
// grouped as sub-sections (e.g., subtitle tracks) with a quick-jump
// nav bar rendered above the groups.
// ============================================================

import type { ResolvedField, ResolvedSection } from '@ffcodec/domain/presentation/resolved-field'
import type { ReactNode } from 'react'
import type { PathFieldRenderer } from '@ffcodec/platform-api'
import { useCallback } from 'react'
import { CollapsibleSection } from './CollapsibleSection'
import { ParameterField } from './ParameterField'
import { useI18n } from '../features/i18n/i18n'

interface ParameterSectionProps {
  section: ResolvedSection
  expanded: boolean
  onToggle: () => void
  onFieldChange: (fieldId: string, value: unknown) => void
  onExplain: (fieldId: string) => void
  highlightedFieldId?: string
  actions?: ReactNode
  /** 平台在既有参数区正文末尾追加的内容。 */
  additionalContent?: ReactNode
  /** Platform-specific path field renderer, passed through to ParameterField. */
  pathFieldRenderer?: PathFieldRenderer
  renderFieldAction?: (fieldId: string) => ReactNode
}

interface FieldGroup {
  key: string
  /** Section-divider field that starts this group (null for leaderless groups). */
  divider: ResolvedField | null
  fields: ResolvedField[]
}

/** Split a flat field list into groups delimited by section-divider fields. */
function groupFields(fields: ResolvedField[]): FieldGroup[] {
  const groups: FieldGroup[] = []
  let current: FieldGroup = { key: '_default', divider: null, fields: [] }

  for (const field of fields) {
    if (field.controlType === 'section') {
      if (current.fields.length > 0 || current.divider) {
        groups.push(current)
      }
      current = { key: field.id, divider: field, fields: [] }
    } else {
      current.fields.push(field)
    }
  }
  if (current.fields.length > 0 || current.divider) {
    groups.push(current)
  }
  return groups
}

/** A quick-jump nav pill bar for field groups. */
function GroupNav({ groups, text }: { groups: FieldGroup[]; text: (v: string) => string }) {
  const jumpTo = useCallback((groupId: string) => {
    const el = document.getElementById(`pgroup-${groupId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className="group-nav">
      {groups.map((g) => {
        if (!g.divider) return null
        const label = (g.divider.value !== undefined && g.divider.value !== null && g.divider.value !== '')
          ? String(g.divider.value)
          : text(g.divider.label)
        return (
          <button
            key={g.key}
            type="button"
            className="group-nav__pill"
            onClick={() => jumpTo(g.key)}
            title={text('跳转到') + ' ' + label}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export function ParameterSection({
  section,
  expanded,
  onToggle,
  onFieldChange,
  onExplain,
  highlightedFieldId,
  actions,
  additionalContent,
  pathFieldRenderer,
  renderFieldAction,
}: ParameterSectionProps) {
  const { text } = useI18n()

  const renderField = (field: ResolvedField) => (
    <ParameterField
      key={field.id}
      field={field}
      onChange={(v) => onFieldChange(field.id, v)}
      onExplain={onExplain}
      highlighted={field.id === highlightedFieldId}
      pathFieldRenderer={pathFieldRenderer}
      action={renderFieldAction?.(field.id)}
    />
  )

  const groups = groupFields(section.fields)
  const hasGroups = groups.length > 1 || (groups.length === 1 && groups[0].divider)
  const navigableGroups = groups.filter((g) => g.divider)

  return (
    <CollapsibleSection
      title={text(section.label)}
      description={section.description ? text(section.description) : undefined}
      expanded={expanded}
      onToggle={onToggle}
      actions={actions}
    >
      {navigableGroups.length > 1 && <GroupNav groups={navigableGroups} text={text} />}
      {hasGroups
        ? groups.map((group) => (
            <div key={group.key} id={`pgroup-${group.key}`} className="parameter-field-group">
              {group.divider && renderField(group.divider)}
              {group.fields.map(renderField)}
            </div>
          ))
        : groups[0]?.fields.map(renderField)
      }
      {additionalContent}
    </CollapsibleSection>
  )
}
