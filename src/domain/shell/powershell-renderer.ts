import type { RenderedCommand } from './shell-types'
import type { CommandPlan } from '../command/command-ast'
import { flattenInvocation } from '../command/argument-order'

/**
 * Renders a CommandPlan as a PowerShell command.
 * Uses backtick (`) for line continuation and proper quoting.
 */
export function renderPowerShell(plan: CommandPlan): RenderedCommand {
  const allSegments: RenderedCommand['segments'] = []

  for (let i = 0; i < plan.invocations.length; i++) {
    if (i > 0) {
      allSegments.push({ text: '; ', originId: 'system', argumentId: 'separator' })
    }

    const tokens = flattenInvocation(plan.invocations[i])
    for (const token of tokens) {
      const escaped = escapePowerShell(token.text)
      allSegments.push({
        text: escaped,
        originId: token.originId,
        argumentId: token.argId,
      })
    }
  }

  return {
    text: allSegments.map((s) => s.text).join(' '),
    segments: allSegments,
  }
}

function escapePowerShell(text: string): string {
  if (/^[a-zA-Z0-9_.\-:/\\]+$/.test(text)) return text

  // PowerShell uses backtick for escaping special chars
  if (text.includes('"')) {
    return `'${text}'`
  }
  if (text.includes(' ') || text.includes('(') || text.includes(')') || text.includes('$')) {
    return `"${text}"`
  }
  return text
}
