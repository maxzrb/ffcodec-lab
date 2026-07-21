import type { ControlDefinition, EncoderDefinition } from './catalog-types'
import type { ProjectConfig } from '../config/project-config'

/** 判断控件是否为编码器私有 key=value 字典的自由文本入口。 */
export function isRawParameterDictionary(control: ControlDefinition): boolean {
  return Boolean(control.commandBinding?.dictionary && !control.commandBinding.dictionary.key)
}

/** 从扁平 specialParameters 记录中取得控件对应的稳定键。 */
export function getSpecialParameterKey(control: ControlDefinition): string {
  const path = control.configBinding?.path
  return path ? path.split('.').pop() ?? control.id : control.id
}

/**
 * 返回自由文本框应展示的同步值。已选择的结构化键会替换文本中的同名键，
 * 未收录的自由文本项保持原有顺序。
 */
export function resolveRawParameterDictionaryValue(
  encoder: EncoderDefinition,
  rawControl: ControlDefinition,
  values: Record<string, unknown>,
  preserveStoredRaw = false,
): string {
  const binding = rawControl.commandBinding
  if (!binding?.dictionary) return String(values[getSpecialParameterKey(rawControl)] ?? '')
  const rawValue = String(values[getSpecialParameterKey(rawControl)] ?? '')
  // 用户正在输入时保留原始文本（包括末尾分隔符），避免受控输入框在每次按键后
  // 重排内容。结构化控件变更时，同步函数会直接更新该存储值。
  if (preserveStoredRaw && rawValue) return rawValue
  const keyedControls = findKeyedControls(encoder, rawControl)
  const keyedValues = keyedControls.flatMap((control) => {
    const value = values[getSpecialParameterKey(control)]
    const rendered = renderDictionaryControlValue(control, value)
    return rendered === null ? [] : [{ key: control.commandBinding!.dictionary!.key!, value: rendered }]
  })
  return mergeDictionaryValue(rawValue, keyedValues, binding.dictionary.separator ?? ':')
}

/** 结构化字段未显式存储时，从同组自由文本中解析其当前值。 */
export function resolveStructuredDictionaryValue(
  encoder: EncoderDefinition,
  control: ControlDefinition,
  values: Record<string, unknown>,
): unknown {
  const stored = values[getSpecialParameterKey(control)]
  if (stored !== undefined && stored !== null && stored !== '') return stored

  const rawControl = encoder.specialParameters.find((candidate) =>
    isRawParameterDictionary(candidate) && controlsShareDictionary(candidate, control))
  const dictionaryKey = control.commandBinding?.dictionary?.key
  if (!rawControl || !dictionaryKey) return ''

  const separator = rawControl.commandBinding?.dictionary?.separator ?? ':'
  const rawValue = String(values[getSpecialParameterKey(rawControl)] ?? '')
  const entry = parseDictionary(rawValue, separator)
    .find((part) => part.key?.toLowerCase() === dictionaryKey.toLowerCase())
  return entry ? parseDictionaryControlValue(control, entry.value) : ''
}

/**
 * 字典自由文本与结构化控件双向同步。该函数只处理声明了 dictionary 的控件，
 * 普通 FFmpeg 参数仍按各自 commandBinding 独立生成。
 */
export function synchronizeVideoParameterDictionary(
  config: ProjectConfig,
  encoder: EncoderDefinition | undefined,
  changedFieldId: string,
): ProjectConfig {
  if (!encoder) return config
  const changedControl = encoder.specialParameters.find((control) => control.id === changedFieldId)
  if (!changedControl?.commandBinding?.dictionary) return config

  const nextValues = { ...config.video.specialParameters }
  if (isRawParameterDictionary(changedControl)) {
    const separator = changedControl.commandBinding.dictionary.separator ?? ':'
    const rawValue = String(nextValues[getSpecialParameterKey(changedControl)] ?? '')
    const parsed = parseDictionary(rawValue, separator)
    for (const control of findKeyedControls(encoder, changedControl)) {
      const dictionaryKey = control.commandBinding!.dictionary!.key!
      const entry = parsed.find((part) => part.key?.toLowerCase() === dictionaryKey.toLowerCase())
      const configKey = getSpecialParameterKey(control)
      const value = entry ? parseDictionaryControlValue(control, entry.value) : undefined
      if (value === undefined || value === '') delete nextValues[configKey]
      else nextValues[configKey] = value
    }
  } else {
    const rawControl = encoder.specialParameters.find((candidate) =>
      isRawParameterDictionary(candidate) && controlsShareDictionary(candidate, changedControl))
    if (!rawControl) return config
    const rawKey = getSpecialParameterKey(rawControl)
    const synchronized = resolveRawParameterDictionaryValue(encoder, rawControl, nextValues)
    if (synchronized) nextValues[rawKey] = synchronized
    else delete nextValues[rawKey]
  }

  return {
    ...config,
    video: {
      ...config.video,
      specialParameters: nextValues,
    },
  }
}

function findKeyedControls(encoder: EncoderDefinition, rawControl: ControlDefinition): ControlDefinition[] {
  return encoder.specialParameters.filter((control) =>
    Boolean(control.commandBinding?.dictionary?.key) && controlsShareDictionary(rawControl, control))
}

function controlsShareDictionary(first: ControlDefinition, second: ControlDefinition): boolean {
  const firstBinding = first.commandBinding
  const secondBinding = second.commandBinding
  if (!firstBinding?.dictionary || !secondBinding?.dictionary) return false
  return (firstBinding.prefix ?? firstBinding.argName) === (secondBinding.prefix ?? secondBinding.argName)
    && firstBinding.phase === secondBinding.phase
    && (firstBinding.dictionary.separator ?? ':') === (secondBinding.dictionary.separator ?? ':')
}

function mergeDictionaryValue(
  rawValue: string,
  keyedValues: Array<{ key: string; value: string }>,
  separator: string,
): string {
  const structuredKeys = new Set(keyedValues.map((entry) => entry.key.toLowerCase()))
  const rawParts = parseDictionary(rawValue, separator)
    .filter((part) => !part.key || !structuredKeys.has(part.key.toLowerCase()))
    .map((part) => part.raw)
  return [...rawParts, ...keyedValues.map((entry) => `${entry.key}=${entry.value}`)].join(separator)
}

function parseDictionary(value: string, separator: string): Array<{ raw: string; key?: string; value: string }> {
  return value.split(separator).map((part) => part.trim()).filter(Boolean).map((raw) => {
    const equalsIndex = raw.indexOf('=')
    if (equalsIndex < 0) return { raw, value: raw }
    return {
      raw,
      key: raw.slice(0, equalsIndex).trim(),
      value: raw.slice(equalsIndex + 1).trim(),
    }
  })
}

function renderDictionaryControlValue(control: ControlDefinition, value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null
  if (control.control !== 'switch' || typeof value !== 'boolean') return String(value)
  const optionValues = control.options?.map((option) => option.value) ?? []
  if (value) return optionValues.includes('on') ? 'on' : '1'
  return optionValues.includes('off') ? 'off' : '0'
}

function parseDictionaryControlValue(control: ControlDefinition, value: string): unknown {
  if (control.control === 'number') {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return undefined
    if (control.range?.min !== undefined && parsed < control.range.min) return undefined
    if (control.range?.max !== undefined && parsed > control.range.max) return undefined
    return parsed
  }
  if (control.control === 'switch') {
    const normalized = value.toLowerCase()
    if (['1', 'true', 'on', 'yes'].includes(normalized)) return true
    if (['0', 'false', 'off', 'no'].includes(normalized)) return false
    return undefined
  }
  if (control.control === 'select') {
    return control.options?.find((option) => String(option.value) === value)?.value
  }
  return value
}
