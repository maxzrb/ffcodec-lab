// ============================================================
// resolve-field — produces ResolvedField from catalog entries
// and the current ProjectConfig + EvaluationResult.
// Pure TypeScript, zero React dependency.
// ============================================================

import type { ProjectConfig } from '../config/project-config'
import type {
  EncoderDefinition,
  ParameterDefinition,
  ControlDefinition,
  SelectOption,
} from '../catalog/catalog-types'
import type { FieldState } from '../rules/rule-types'
import type { ResolvedField, ResolvedOption } from './resolved-field'
import { getByPath } from '../../utils/object-path'

// -- helpers ----------------------------------------------------

function toResolvedOptions(opts: SelectOption[]): ResolvedOption[] {
  return opts.map((o) => ({
    value: o.value,
    label: o.label,
    description: o.description,
  }))
}

function findFieldState(fieldStates: Record<string, FieldState>, id: string): FieldState {
  return fieldStates[id] ?? { visible: true, enabled: true, required: false }
}

function readConfigValue(config: ProjectConfig, path: string): unknown {
  return getByPath(config, path)
}

// -- resolve from ControlDefinition -----------------------------

export function resolveControlField(
  ctrl: ControlDefinition,
  config: ProjectConfig,
  _configPath: string,
  fieldStates: Record<string, FieldState>,
  encoder?: EncoderDefinition,
): ResolvedField {
  const state = findFieldState(fieldStates, ctrl.id)
  // Prefer control's configBinding path for reading; fall back to legacy configPath param
  const readPath = ctrl.configBinding?.path ?? _configPath
  const value = readConfigValue(config, readPath) ?? ctrl.defaultValue

  return {
    id: ctrl.id,
    label: ctrl.label,
    controlType: ctrl.control,
    value,
    defaultValue: ctrl.defaultValue,
    visible: state.visible,
    disabled: !state.enabled,
    disabledReason: state.reason,
    options: ctrl.options ? toResolvedOptions(ctrl.options) : undefined,
    min: ctrl.range?.min,
    max: ctrl.range?.max,
    step: ctrl.range?.step,
    explanationId: ctrl.explanationId,
    sourceRefs: encoder?.sourceRefs ?? [],
    verificationLevel: encoder?.verificationLevel ?? 'project-derived',
    needsCrossVerification: encoder?.needsCrossVerification ?? true,
    commandOrigins: [],
    diagnostics: [],
    configBinding: ctrl.configBinding,
  }
}

// -- resolve from ParameterDefinition ---------------------------

export function resolveParameterField(
  param: ParameterDefinition,
  config: ProjectConfig,
  configPath: string,
  fieldStates: Record<string, FieldState>,
): ResolvedField {
  const state = findFieldState(fieldStates, param.id)
  const value = readConfigValue(config, configPath) ?? param.defaultValue

  const options: ResolvedOption[] | undefined =
    param.optionsSource?.type === 'static' && param.optionsSource.options
      ? toResolvedOptions(param.optionsSource.options)
      : undefined

  return {
    id: param.id,
    label: param.label,
    controlType: param.control,
    value,
    defaultValue: param.defaultValue,
    visible: state.visible,
    disabled: !state.enabled,
    disabledReason: state.reason,
    options,
    min: param.rangeSource?.min,
    max: param.rangeSource?.max,
    step: param.rangeSource?.step,
    explanationId: param.explanationId,
    sourceRefs: param.sourceRefs,
    verificationLevel: param.verificationLevel,
    needsCrossVerification: param.needsCrossVerification,
    commandOrigins: [],
    diagnostics: [],
  }
}

// -- resolve text / path fields ----------------------------------

export function resolveTextField(
  id: string,
  label: string,
  value: unknown,
  fieldStates: Record<string, FieldState>,
  explanationId?: string,
  sourceRefs?: ResolvedField['sourceRefs'],
): ResolvedField {
  const state = findFieldState(fieldStates, id)
  return {
    id,
    label,
    controlType: 'text',
    value,
    visible: state.visible,
    disabled: !state.enabled,
    disabledReason: state.reason,
    explanationId,
    sourceRefs: sourceRefs ?? [],
    verificationLevel: 'project-derived',
    needsCrossVerification: false,
    commandOrigins: [],
    diagnostics: [],
  }
}

// -- resolve switch / boolean fields ----------------------------

export function resolveSwitchField(
  id: string,
  label: string,
  value: unknown,
  fieldStates: Record<string, FieldState>,
  explanationId?: string,
  sourceRefs?: ResolvedField['sourceRefs'],
): ResolvedField {
  const state = findFieldState(fieldStates, id)
  return {
    id,
    label,
    controlType: 'switch',
    value,
    defaultValue: false,
    visible: state.visible,
    disabled: !state.enabled,
    disabledReason: state.reason,
    explanationId,
    sourceRefs: sourceRefs ?? [],
    verificationLevel: 'project-derived',
    needsCrossVerification: false,
    commandOrigins: [],
    diagnostics: [],
  }
}

// -- resolve section label field --------------------------------

export function resolveSectionLabel(
  id: string,
  label: string,
  fieldStates: Record<string, FieldState>,
): ResolvedField {
  const state = findFieldState(fieldStates, id)
  return {
    id,
    label,
    controlType: 'section',
    value: null,
    visible: state.visible,
    disabled: false,
    sourceRefs: [],
    verificationLevel: 'project-derived',
    needsCrossVerification: false,
    commandOrigins: [],
    diagnostics: [],
  }
}

// -- attach diagnostics to fields -------------------------------

export function attachDiagnostics(
  fields: ResolvedField[],
  messages: ResolvedField['diagnostics'],
): void {
  for (const field of fields) {
    field.diagnostics = messages.filter(
      (m) => m.originIds.includes(field.id) || m.originIds.some((fid) => field.id.startsWith(fid)),
    )
  }
}
