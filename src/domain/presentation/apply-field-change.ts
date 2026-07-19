// ============================================================
// apply-field-change — unified field change entry point.
//
// React components call applyFieldChange(field.id, nextValue)
// and must NOT:
//   - parse ConfigPath
//   - modify ProjectConfig deep objects
//   - branch on encoder ID
//   - concatenate argument names
// ============================================================

import type { ConfigPath } from '../config/config-path'
import type { ProjectConfig } from '../config/project-config'
import type { Catalog } from '../catalog/catalog-types'
import type { ResolvedField } from './resolved-field'
import { setByPath } from '../../utils/object-path'
import { normalizeConfig } from '../normalization'

// -- types ------------------------------------------------------

export interface FieldChangeNotice {
  code: string
  message: string
  originIds: string[]
}

export interface AppliedFieldChange {
  /** The validated ConfigPath to write to */
  path: ConfigPath | null
  /** The value to write (undefined = clear) */
  value: unknown
  /** Notices about the change (validation, type coercion, etc.) */
  notices: FieldChangeNotice[]
  /** Whether the value was accepted */
  accepted: boolean
}

// -- entry point ------------------------------------------------

/**
 * Resolve a field change into a ConfigPath write.
 * React components call this — they never parse paths themselves.
 *
 * @param fieldId - The ResolvedField.id
 * @param nextValue - The new value from user input
 * @param fieldIndex - The view's fieldIndex for looking up the binding
 */
export function applyFieldChange(
  fieldId: string,
  nextValue: unknown,
  fieldIndex: Record<string, ResolvedField>,
): AppliedFieldChange {
  const notices: FieldChangeNotice[] = []

  // Look up the field
  const field = fieldIndex[fieldId]
  if (!field) {
    return {
      path: null,
      value: nextValue,
      accepted: true,
      notices: [
        {
          code: 'FIELD_NOT_RESOLVED',
          message: `Field "${fieldId}" not found in resolved view — applying with raw ID as path`,
          originIds: [fieldId],
        },
      ],
    }
  }

  // Use explicit configBinding if present
  if (field.configBinding?.path) {
    const coerced = coerceValue(nextValue, field)
    if (coerced.notice) notices.push(coerced.notice)

    return {
      path: field.configBinding.path,
      value: coerced.value,
      accepted: true,
      notices,
    }
  }

  // Fallback: use the field's ID as a config path
  // (for dynamic subtitle track fields and other non-binding paths)
  if (isValidDynamicPath(fieldId)) {
    // 动态字段同样必须经过类型转换；自定义参数 textarea 需要由文本变为 token 数组。
    const coerced = coerceValue(nextValue, field)
    if (coerced.notice) notices.push(coerced.notice)
    return {
      path: fieldId as ConfigPath,
      value: coerced.value,
      accepted: true,
      notices,
    }
  }

  // No binding and no valid dynamic path — reject
  return {
    path: null,
    value: nextValue,
    accepted: false,
    notices: [
      {
        code: 'NO_CONFIG_BINDING',
        message: `Field "${fieldId}" has no configBinding and is not a recognized dynamic path — change not applied`,
        originIds: [fieldId],
      },
    ],
  }
}

/**
 * 将一次正式页面字段操作应用到完整配置，并执行编码器切换规范化。
 * React 只提交字段 ID 与值，不解析配置路径或复制业务规则。
 */
export function applyFieldChangeToConfig(
  previous: ProjectConfig,
  fieldId: string,
  nextValue: unknown,
  fieldIndex: Record<string, ResolvedField>,
  catalog: Catalog,
): { config: ProjectConfig; change: AppliedFieldChange } {
  const change = applyFieldChange(fieldId, nextValue, fieldIndex)
  if (!change.accepted || !change.path) return { config: previous, change }

  const next = setByPath(previous, change.path, change.value)
  const normalized = normalizeConfig(previous, next, catalog)
  return {
    config: normalized.config,
    change: {
      ...change,
      notices: [
        ...change.notices,
        ...normalized.notices.map((notice) => ({
          code: 'NORMALIZED',
          message: notice.reason,
          originIds: [notice.fieldId],
        })),
      ],
    },
  }
}

// -- helpers ----------------------------------------------------

function coerceValue(
  value: unknown,
  field: ResolvedField,
): { value: unknown; notice?: FieldChangeNotice } {
  switch (field.controlType) {
    case 'textarea':
      // Metadata fields store raw text; command builder parses lines
      if (field.id.startsWith('output.metadata.')) {
        return { value: String(value ?? '') }
      }
      return {
        value: String(value ?? '')
          .split(/\r?\n/)
          .map((token) => token.trim())
          .filter(Boolean),
      }

    case 'multiselect': {
      const rawValues = Array.isArray(value) ? value : []
      const matchedValues = field.options
        ? field.options
            .filter((option) => rawValues.some((item) => String(item) === String(option.value)))
            .map((option) => option.value)
        : rawValues
      return { value: matchedValues.length > 0 ? [...new Set(matchedValues)] : [field.options?.[0]?.value ?? 0] }
    }

    case 'switch':
      if (field.optional && (value === undefined || value === null || value === '')) {
        return { value: undefined }
      }
      // Ensure boolean
      if (typeof value !== 'boolean') {
        return {
          value: Boolean(value),
          notice: {
            code: 'COERCED_TO_BOOLEAN',
            message: `Value "${String(value)}" coerced to boolean for switch field "${field.id}"`,
            originIds: [field.id],
          },
        }
      }
      return { value }

    case 'number': {
      // Ensure number or undefined
      if (value === '' || value === null || value === undefined) {
        return { value: undefined }
      }
      if (typeof value === 'number') {
        // Enforce range
        if (field.min !== undefined && value < field.min) {
          return {
            value: field.min,
            notice: {
              code: 'CLAMPED_TO_MIN',
              message: `Value ${value} clamped to minimum ${field.min} for field "${field.id}"`,
              originIds: [field.id],
            },
          }
        }
        if (field.max !== undefined && value > field.max) {
          return {
            value: field.max,
            notice: {
              code: 'CLAMPED_TO_MAX',
              message: `Value ${value} clamped to maximum ${field.max} for field "${field.id}"`,
              originIds: [field.id],
            },
          }
        }
        return { value }
      }
      // Try to parse
      const num = parseFloat(String(value))
      if (isNaN(num)) {
        return {
          value: undefined,
          notice: {
            code: 'INVALID_NUMBER',
            message: `Value "${String(value)}" is not a valid number for field "${field.id}"`,
            originIds: [field.id],
          },
        }
      }
      return { value: num }
    }

    case 'select':
      // Ensure value is a valid option
      if (field.options && field.options.length > 0) {
        const matchedOption = field.options.find((option) => String(option.value) === String(value))
        if (!matchedOption) {
          return {
            value: field.defaultValue ?? field.options[0].value,
            notice: {
              code: 'INVALID_OPTION',
              message: `Value "${String(value)}" is not a valid option for "${field.id}"; reset to default`,
              originIds: [field.id],
            },
          }
        }
        // DOM select 总是返回字符串，这里恢复目录选项原始的 number/boolean 类型。
        return { value: matchedOption.value }
      }
      return { value }

    default:
      return { value }
  }
}

/** 判断字段 ID 是否为允许交给 setByPath 写入的配置路径。 */
function isValidDynamicPath(fieldId: string): boolean {
  // Subtitle track dynamic fields
  if (/^subtitle\.tracks\.[a-zA-Z0-9_-]+\./.test(fieldId)) {
    return true
  }
  // Special parameters
  if (/^video\.specialParameters\./.test(fieldId)) {
    return true
  }
  if (/^audio\.qualityValues\./.test(fieldId)) {
    return true
  }
  // Custom args
  if (/^customArgs\./.test(fieldId)) {
    return true
  }
  // 仅允许 ProjectConfig 中已知的根级命名空间。
  if (/^(input|output|streams|video|frame|audio|subtitle|tools|shell|schemaVersion)\./.test(fieldId)) {
    return true
  }
  return false
}
