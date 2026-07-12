// ============================================================
// ParameterField — renders a single ResolvedField.
// Contains ZERO FFmpeg business logic. Only consumes
// the resolved field model from the presentation layer.
// ============================================================

import type { ResolvedField } from '../../../domain/presentation/resolved-field'
import { useI18n } from '../../../features/i18n/i18n'

interface ParameterFieldProps {
  field: ResolvedField
  onChange: (value: unknown) => void
  onExplain?: (fieldId: string) => void
  highlighted?: boolean
}

export function ParameterField({ field, onChange, onExplain, highlighted }: ParameterFieldProps) {
  const { locale, text } = useI18n()
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
        <label className="param-field__label" htmlFor={controlId}>{text(field.label)}</label>
        {field.explanationId && onExplain && (
          <button
            type="button"
            onClick={() => onExplain(field.id)}
            title={locale === 'zh-CN' ? '查看参数说明' : 'Open parameter guide'}
            aria-label={locale === 'zh-CN' ? `查看${field.label}说明` : `Open guide for ${text(field.label)}`}
            className="icon-button"
          >
            ?
          </button>
        )}
      </div>

      {field.description && (
        <div className="param-field__description">
          {text(field.description)}
        </div>
      )}

      {renderControl(field, onChange, field.disabled, controlId, text)}

      {field.disabled && field.disabledReason && (
        <DisabledReason reason={text(field.disabledReason)} locale={locale} />
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
  text: (value: string) => string,
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
              {text(opt.label)}{opt.badge ? ` · ${text(opt.badge)}` : ''}
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
      if (field.optional) {
        return (
          <select
            id={controlId}
            value={field.value === true ? 'true' : field.value === false ? 'false' : ''}
            onChange={(event) => {
              const value = event.target.value
              onChange(value === '' ? undefined : value === 'true')
            }}
            disabled={disabled}
          >
            <option value="">{text('不设置（使用编码器默认）')}</option>
            <option value="true">{text('开启')}</option>
            <option value="false">{text('关闭')}</option>
          </select>
        )
      }
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
          <span>{field.value ? text('开启') : text('关闭')}</span>
        </label>
      )

    case 'text':
      return (
        <input
          id={controlId}
          type="text"
          value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
          onChange={(e) => onChange(sanitizeTextValue(e.target.value))}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text/plain')
            if (pasted) {
              e.preventDefault()
              onChange(sanitizeTextValue(pasted))
            }
          }}
          disabled={disabled}
        />
      )

    case 'bitrate':
      return (
        <BitrateControl
          id={controlId}
          label={text(field.label)}
          value={field.value}
          disabled={disabled}
          onChange={onChange}
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

    case 'multiselect': {
      const selectedValues = Array.isArray(field.value) ? field.value : []
      return (
        <div id={controlId} className="multiselect-grid" role="group" aria-label={field.label}>
          {field.options?.map((option) => {
            const checked = selectedValues.some((value) => String(value) === String(option.value))
            const isOnlySelection = checked && selectedValues.length === 1
            return (
              <label key={String(option.value)} className="multiselect-option">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled || isOnlySelection}
                  onChange={(event) => {
                    const nextValues = event.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter((value) => String(value) !== String(option.value))
                    onChange(nextValues)
                  }}
                />
                <span>{option.label}</span>
              </label>
            )
          })}
        </div>
      )
    }

    default:
      return (
        <input
          id={controlId}
          type="text"
          value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
          onChange={(e) => onChange(sanitizeTextValue(e.target.value))}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text/plain')
            if (pasted) {
              e.preventDefault()
              onChange(sanitizeTextValue(pasted))
            }
          }}
          disabled={disabled}
        />
      )
  }
}

type BitrateUnit = '' | 'k' | 'M'

function BitrateControl({
  id,
  label,
  value,
  disabled,
  onChange,
}: {
  id: string
  label: string
  value: unknown
  disabled: boolean
  onChange: (value: unknown) => void
}) {
  const parsed = parseBitrate(value)

  const emit = (amount: string, unit: BitrateUnit) => {
    onChange(amount === '' ? undefined : `${amount}${unit}`)
  }

  return (
    <div className="unit-input">
      <input
        id={id}
        type="number"
        min="0"
        step="1"
        inputMode="decimal"
        value={parsed.amount}
        onChange={(event) => emit(event.target.value, parsed.unit)}
        disabled={disabled}
      />
      <select
        aria-label={`${label}单位`}
        value={parsed.unit}
        onChange={(event) => emit(parsed.amount, event.target.value as BitrateUnit)}
        disabled={disabled}
        className="unit-input__unit"
      >
        <option value="">bps</option>
        <option value="k">kbps</option>
        <option value="M">Mbps</option>
      </select>
    </div>
  )
}

function parseBitrate(value: unknown): { amount: string; unit: BitrateUnit } {
  const raw = String(value ?? '').trim()
  const match = raw.match(/^(\d+(?:\.\d+)?)\s*([kKmM]?)$/)
  if (!match) return { amount: '', unit: 'k' }
  const suffix = match[2]
  return {
    amount: match[1],
    unit: suffix.toLowerCase() === 'k' ? 'k' : suffix.toLowerCase() === 'm' ? 'M' : '',
  }
}

/**
 * 清理文本输入值：自动剥离两端成对引号。
 * 解决从 Windows 资源管理器粘贴路径时剪贴板自带双引号的问题。
 * 仅当首尾字符为相同引号（'或"）时才剥离。
 */
function sanitizeTextValue(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length < 2) return value
  const first = trimmed[0]
  const last = trimmed[trimmed.length - 1]
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return trimmed.slice(1, -1)
  }
  return value
}

function DisabledReason({ reason, locale }: { reason: string; locale: 'zh-CN' | 'en' }) {
  return (
    <div className="param-field__reason">
      {locale === 'zh-CN' ? '已禁用：' : 'Disabled: '}{reason}
    </div>
  )
}
