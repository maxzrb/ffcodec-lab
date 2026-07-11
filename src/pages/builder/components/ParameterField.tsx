// ============================================================
// ParameterField — renders a single ResolvedField.
// Contains ZERO FFmpeg business logic. Only consumes
// the resolved field model from the presentation layer.
// ============================================================

import type { ResolvedField } from '../../../domain/presentation/resolved-field'

interface ParameterFieldProps {
  field: ResolvedField
  onChange: (value: unknown) => void
  onExplain?: (fieldId: string) => void
  highlighted?: boolean
}

export function ParameterField({ field, onChange, onExplain, highlighted }: ParameterFieldProps) {
  if (!field.visible) return null

  const hasDiagnostics = field.diagnostics.length > 0
  const hasErrors = field.diagnostics.some((d) => d.severity === 'error')
  const controlId = `control-${field.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`
  const classes = [
    'param-field',
    highlighted ? 'param-field--highlighted' : '',
    field.disabled ? 'param-field--disabled' : '',
    hasErrors ? 'param-field--error' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      data-field-id={field.id}
    >
      <div className="param-field__header">
        <label className="param-field__label" htmlFor={controlId}>{field.label}</label>
        {field.explanationId && onExplain && (
          <button
            type="button"
            onClick={() => onExplain(field.id)}
            title="查看参数说明"
            aria-label={`查看${field.label}说明`}
            className="icon-button"
          >
            ?
          </button>
        )}
      </div>

      {field.description && (
        <div className="param-field__description">
          {field.description}
        </div>
      )}

      {renderControl(field, onChange, field.disabled, controlId)}

      {field.disabled && field.disabledReason && (
        <DisabledReason reason={field.disabledReason} />
      )}

      {hasDiagnostics && (
        <div className="diagnostic-list" role="status">
          {field.diagnostics.map((d, i) => (
            <div
              key={i}
              className={`diagnostic diagnostic--${d.severity}`}
            >
              [{d.severity.toUpperCase()}] {d.code}
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

function renderControl(
  field: ResolvedField,
  onChange: (v: unknown) => void,
  disabled: boolean,
  controlId: string,
) {
  switch (field.controlType) {
    case 'section':
      return (
        <div className="section-divider" role="separator" aria-label={field.label}>
          {field.value !== undefined && field.value !== null ? String(field.value) : ''}
        </div>
      )

    case 'select':
      return (
        <select
          id={controlId}
          value={String(field.value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {field.options?.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}{opt.badge ? ` · ${opt.badge}` : ''}
            </option>
          ))}
        </select>
      )

    case 'number':
      return (
        <input
          id={controlId}
          type="number"
          value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
          onChange={(e) => {
            const v = e.target.value === '' ? undefined : parseFloat(e.target.value)
            onChange(v)
          }}
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          disabled={disabled}
        />
      )

    case 'switch':
      return (
        <label className={`switch-control ${disabled ? 'switch-control--disabled' : ''}`}>
          <input
            id={controlId}
            type="checkbox"
            checked={Boolean(field.value)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
          <span className="switch-control__track" aria-hidden="true" />
          <span>{field.value ? '开启' : '关闭'}</span>
        </label>
      )

    case 'text':
      return (
        <input
          id={controlId}
          type="text"
          value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )

    case 'textarea':
      return (
        <textarea
          id={controlId}
          value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={4}
          className="token-textarea"
        />
      )

    default:
      return (
        <input
          id={controlId}
          type="text"
          value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )
  }
}

function DisabledReason({ reason }: { reason: string }) {
  return (
    <div className="param-field__reason">
      已禁用：{reason}
    </div>
  )
}
