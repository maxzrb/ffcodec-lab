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

/**
 * Escape a token for PowerShell.
 *
 * Strategy:
 * - Safe ASCII token → no quoting needed
 * - Contains double quote → use single quotes
 * - Everything else → use double quotes (PowerShell preferred)
 */
function escapePowerShell(text: string): string {
  // Safe: only ASCII alphanumeric and common path separators
  if (/^[a-zA-Z0-9_.\-:/\\]+$/.test(text)) return text

  // Contains double quotes → must use single quotes
  if (text.includes('"')) {
    return `'${text}'`
  }

  // All other cases (Unicode, spaces, brackets, parens, $, etc.)
  return `"${text}"`
}
