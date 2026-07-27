// ============================================================
// CollapsibleSection — 参数区和平台扩展共用的折叠卡片外框。
// ============================================================

import type { ReactNode } from 'react'

interface CollapsibleSectionProps {
  title: ReactNode
  description?: ReactNode
  expanded: boolean
  onToggle: () => void
  actions?: ReactNode
  className?: string
  children: ReactNode
}

export function CollapsibleSection({
  title,
  description,
  expanded,
  onToggle,
  actions,
  className,
  children,
}: CollapsibleSectionProps) {
  return (
    <section className={className ? `parameter-section ${className}` : 'parameter-section'}>
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
          <span className="parameter-section__title">{title}</span>
          {description && (
            <span className="parameter-section__description" title={typeof description === 'string' ? description : undefined}>— {description}</span>
          )}
        </button>
        {actions && <div className="parameter-section__actions">{actions}</div>}
      </div>

      <div className={`parameter-section__body ${expanded ? 'parameter-section__body--expanded' : 'parameter-section__body--collapsed'}`}>
        <div className="parameter-section__body-inner">{children}</div>
      </div>
    </section>
  )
}
