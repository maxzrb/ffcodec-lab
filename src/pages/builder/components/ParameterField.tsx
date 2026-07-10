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

  return (
    <div
      className={`param-field ${highlighted ? 'param-field--highlighted' : ''}`}
      data-field-id={field.id}
      style={{
        opacity: field.disabled ? 0.5 : 1,
        border: hasErrors ? '1px solid var(--error)' : highlighted ? '2px solid var(--accent)' : undefined,
        padding: '8px 12px',
        borderRadius: 'var(--radius)',
        background: highlighted ? 'var(--accent-light, rgba(88,166,255,0.1))' : undefined,
        transition: 'border 0.2s, background 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <label style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{field.label}</label>
        {field.explanationId && onExplain && (
          <button
            type="button"
            className="btn-icon"
            onClick={() => onExplain(field.id)}
            title="查看参数说明"
            style={{
              fontSize: 14,
              padding: '2px 6px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-input)',
              color: 'var(--text-dim)',
              cursor: 'pointer',
            }}
          >
            ?
          </button>
        )}
      </div>

      {field.description && (
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>
          {field.description}
        </div>
      )}

      {renderControl(field, onChange, field.disabled)}

      {/* Disabled reason */}
      {field.disabled && field.disabledReason && (
        <DisabledReason reason={field.disabledReason} />
      )}

      {/* Diagnostics */}
      {hasDiagnostics && (
        <div style={{ marginTop: 6 }}>
          {field.diagnostics.map((d, i) => (
            <div
              key={i}
              style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 'var(--radius)',
                background:
                  d.severity === 'error'
                    ? 'rgba(255,107,107,0.15)'
                    : d.severity === 'warning'
                      ? 'rgba(255,184,108,0.15)'
                      : 'rgba(88,166,255,0.1)',
                color:
                  d.severity === 'error'
                    ? 'var(--error)'
                    : d.severity === 'warning'
                      ? 'var(--warning)'
                      : 'var(--info)',
                marginBottom: 2,
              }}
            >
              [{d.severity.toUpperCase()}] {d.code}
            </div>
          ))}
        </div>
      )}

      {/* Verification level badge */}
      {field.needsCrossVerification && (
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4, fontStyle: 'italic' }}>
          来源于 {field.verificationLevel === 'project-derived' ? 'FFmpegFreeUI' : field.verificationLevel}，尚未经过编码器官方文档交叉核验
        </div>
      )}
    </div>
  )
}

function renderControl(field: ResolvedField, onChange: (v: unknown) => void, disabled: boolean) {
  switch (field.controlType) {
    case 'select':
      return (
        <select
          value={String(field.value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={{ width: '100%' }}
        >
          {field.options?.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      )

    case 'number':
      return (
        <input
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
          style={{ width: '100%' }}
        />
      )

    case 'switch':
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: disabled ? 'not-allowed' : 'pointer' }}>
          <input
            type="checkbox"
            checked={Boolean(field.value)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
          <span style={{ fontSize: 12 }}>{Boolean(field.value) ? '开启' : '关闭'}</span>
        </label>
      )

    case 'text':
    default:
      return (
        <input
          type="text"
          value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={{ width: '100%' }}
        />
      )
  }
}

function DisabledReason({ reason }: { reason: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: 'var(--text-dim)',
        marginTop: 4,
        fontStyle: 'italic',
      }}
    >
      已禁用：{reason}
    </div>
  )
}
