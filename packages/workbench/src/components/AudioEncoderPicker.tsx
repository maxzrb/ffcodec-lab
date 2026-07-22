import { useMemo, useState } from 'react'
import type { ResolvedOption } from '@ffcodec/domain/presentation/resolved-field'
import { useI18n } from '../features/i18n/i18n'
import { useAudioEncoderCapabilities } from '../hooks/useAudioEncoderCapabilities'
import { Dropdown } from './Dropdown'

interface AudioEncoderPickerProps {
  options: ResolvedOption[]
  value: unknown
  disabled: boolean
  onChange: (value: unknown) => void
}

export function AudioModePicker({ options, value, disabled, onChange }: AudioEncoderPickerProps) {
  const { locale, text } = useI18n()
  const selected = String(value ?? 'encode')
  return (
    <div className="audio-mode-picker" role="group" aria-label={locale === 'zh-CN' ? '音频处理方式' : 'Audio handling'}>
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          className={`audio-mode-picker__option${selected === String(option.value) ? ' audio-mode-picker__option--selected' : ''}`}
          onClick={() => onChange(option.value)}
          disabled={disabled}
          aria-pressed={selected === String(option.value)}
        >
          {text(option.label)}
        </button>
      ))}
    </div>
  )
}

export function AudioEncoderPicker({ options, value, disabled, onChange }: AudioEncoderPickerProps) {
  const { locale, text } = useI18n()
  const runtimeCapabilities = useAudioEncoderCapabilities()
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const selected = String(value ?? '')
  const recommended = options
    .filter((option) => option.recommended && !isRuntimeUnavailable(option, runtimeCapabilities))
    .slice(0, 4)
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filtered = useMemo(() => options.filter((option) => {
    if (!normalizedQuery) return true
    return [option.label, text(option.label), option.badge, option.group, text(option.group ?? ''), option.description, text(option.description ?? '')]
      .filter(Boolean)
      .some((part) => String(part).toLocaleLowerCase().includes(normalizedQuery))
  }), [normalizedQuery, options, text])
  const groups = useMemo(() => {
    const result = new Map<string, ResolvedOption[]>()
    for (const option of filtered) {
      const group = option.group ?? (locale === 'zh-CN' ? '其他' : 'Other')
      result.set(group, [...(result.get(group) ?? []), option])
    }
    return result
  }, [filtered, locale])

  return (
    <div className="audio-encoder-picker">
      <div className="audio-encoder-picker__heading">
        {locale === 'zh-CN' ? '当前容器推荐' : 'Recommended for this container'}
      </div>
      <div className="audio-encoder-recommendations">
        {recommended.map((option) => (
          <EncoderOptionButton
            key={String(option.value)} option={option} selected={selected === String(option.value)}
            disabled={disabled || option.compatibility === 'unsupported' || isRuntimeUnavailable(option, runtimeCapabilities)}
            runtimeUnavailable={isRuntimeUnavailable(option, runtimeCapabilities)} onClick={() => onChange(option.value)} compact
          />
        ))}
      </div>

      <button
        type="button"
        className="audio-encoder-picker__all-toggle"
        onClick={() => setShowAll((current) => !current)}
        aria-expanded={showAll}
        disabled={disabled}
      >
        {showAll
          ? (locale === 'zh-CN' ? '收起全部编码器' : 'Hide all encoders')
          : (locale === 'zh-CN' ? `搜索全部编码器 (${options.length})` : `Search all encoders (${options.length})`)}
      </button>

      {showAll && (
        <div className="audio-encoder-browser">
          <input
            type="search"
            className="audio-encoder-browser__search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={locale === 'zh-CN' ? '搜索名称、FFmpeg encoder 或分类…' : 'Search name, FFmpeg encoder, or category…'}
            disabled={disabled}
          />
          <div className="audio-encoder-browser__groups">
            {[...groups.entries()].map(([group, groupOptions]) => (
              <section key={group} className="audio-encoder-group">
                <h4>{text(group)}</h4>
                <div className="audio-encoder-group__options">
                  {groupOptions.map((option) => (
                    <EncoderOptionButton
                      key={String(option.value)} option={option} selected={selected === String(option.value)}
                      disabled={disabled || option.compatibility === 'unsupported' || isRuntimeUnavailable(option, runtimeCapabilities)}
                      runtimeUnavailable={isRuntimeUnavailable(option, runtimeCapabilities)} onClick={() => onChange(option.value)}
                    />
                  ))}
                </div>
              </section>
            ))}
            {filtered.length === 0 && (
              <div className="audio-encoder-browser__empty">
                {locale === 'zh-CN' ? '没有匹配的编码器' : 'No matching encoders'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function isRuntimeUnavailable(
  option: ResolvedOption,
  capabilities: ReturnType<typeof useAudioEncoderCapabilities>,
): boolean {
  if (!capabilities) return false
  return !capabilities.encoders.includes(option.badge ?? String(option.value))
}

function EncoderOptionButton({ option, selected, disabled, runtimeUnavailable, onClick, compact = false }: {
  option: ResolvedOption
  selected: boolean
  disabled: boolean
  runtimeUnavailable: boolean
  onClick: () => void
  compact?: boolean
}) {
  const { locale, text } = useI18n()
  return (
    <button
      type="button"
      className={`audio-encoder-option${selected ? ' audio-encoder-option--selected' : ''}${compact ? ' audio-encoder-option--compact' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      title={option.availabilityNote ? text(option.availabilityNote) : undefined}
    >
      <span className="audio-encoder-option__title">{text(option.label)}</span>
      <span className="audio-encoder-option__codec">{option.badge}</span>
      <span className="audio-encoder-option__badges">
        {option.badges?.map((badge) => <span key={badge}>{text(badge)}</span>)}
        {option.compatibility === 'unsupported' && (
          <span className="audio-encoder-option__incompatible">
            {locale === 'zh-CN' ? '容器不支持' : 'Unsupported container'}
          </span>
        )}
        {runtimeUnavailable && (
          <span className="audio-encoder-option__incompatible">
            {locale === 'zh-CN' ? '当前 FFmpeg 不可用' : 'Unavailable in current FFmpeg'}
          </span>
        )}
      </span>
    </button>
  )
}

export function AacCoderPicker({
  id, value, options, disabled, onChange,
}: {
  id: string
  value: unknown
  options: ResolvedOption[]
  disabled: boolean
  onChange: (value: unknown) => void
}) {
  const { locale, text } = useI18n()
  const capabilities = useAudioEncoderCapabilities()
  const nmrUnavailable = Boolean(capabilities && !capabilities.aacOptions.includes('nmr'))
  const availableOptions = nmrUnavailable
    ? options.filter((option) => option.value !== 'nmr')
    : options
  return (
    <div className="aac-coder-picker">
      <Dropdown
        id={id}
        value={String(value ?? 'auto')}
        options={availableOptions.map((option) => ({
          ...option,
          label: text(option.label),
          description: option.description ? text(option.description) : undefined,
        }))}
        onChange={onChange}
        disabled={disabled}
        ariaLabel={text('AAC 编码配置')}
      />
      {nmrUnavailable && (
        <span className="aac-coder-picker__notice">
          {locale === 'zh-CN'
            ? '当前 FFmpeg 未提供 NMR；已隐藏该选项。'
            : 'NMR is unavailable in the current FFmpeg build and has been hidden.'}
        </span>
      )}
    </div>
  )
}
