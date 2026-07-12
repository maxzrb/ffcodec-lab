import type { RenderedCommand } from './shell-types'
import type { CommandPlan } from '../command/command-ast'
import { flattenInvocation } from '../command/argument-order'

/**
 * Renders a CommandPlan as a Windows CMD command.
 * Uses ^ for escaping special characters.
 */
export function renderCmd(plan: CommandPlan): RenderedCommand {
  const allSegments: RenderedCommand['segments'] = []

  for (let i = 0; i < plan.invocations.length; i++) {
    if (i > 0) {
      allSegments.push({ text: ' && ', originId: 'system', argumentId: 'separator' })
    }

    const tokens = flattenInvocation(plan.invocations[i])
    for (const token of tokens) {
      const escaped = escapeCmd(token.text)
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
 * Escape a token for Windows CMD.
 *
 * Strategy:
 * - Safe ASCII token → no escaping needed
 * - Otherwise: escape CMD metacharacters with ^, then wrap in double quotes
 */
function escapeCmd(text: string): string {
  // Safe: only ASCII alphanumeric and common path separators
  if (/^[a-zA-Z0-9_.\-:/\\]+$/.test(text)) return text

  // Escape CMD metacharacters
  let escaped = text.replace(/([&|<>^!%])/g, '^$1')

  // Wrap in double quotes if not already quoted
  if (!escaped.startsWith('"')) {
    escaped = `"${escaped}"`
  }
  return escaped
}
