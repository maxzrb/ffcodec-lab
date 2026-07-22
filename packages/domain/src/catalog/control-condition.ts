import type { ControlDefinition } from './catalog-types'
import { getByPath } from '../utils/object-path'

/** 同时供展示层与命令层使用，确保条件隐藏和参数发射遵循同一规则。 */
export function isControlActive(control: ControlDefinition, config: unknown): boolean {
  if (!control.activeWhen) return true
  return getByPath(config, control.activeWhen.path) === control.activeWhen.equals
}
