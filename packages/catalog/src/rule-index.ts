import type { RuleDefinition } from '@ffcodec/domain/rules/rule-types'
import { builtinRules } from './data/rules'

export class RuleIndex {
  private rules: RuleDefinition[]

  constructor(extraRules: RuleDefinition[] = []) {
    this.rules = [...builtinRules, ...extraRules]
  }

  getAll(): RuleDefinition[] {
    return this.rules
  }

  getById(id: string): RuleDefinition | undefined {
    return this.rules.find((r) => r.id === id)
  }
}
