import type { RenderedCommand, RenderedSegment } from './shell-types'
import type { CommandPlan } from '../command/command-ast'
import { flattenInvocation } from '../command/argument-order'

/**
 * Renders a CommandPlan as a Bash/Zsh command.
 * Handles line continuations (\ at EOL) and proper quoting.
 */
export function renderBash(plan: CommandPlan): RenderedCommand {
  const segments: RenderedSegment[] = []

  for (const inv of plan.invocations) {
    if (segments.length > 0) {
      segments.push({ text: ' && ', originId: 'system', argumentId: 'separator' })
    }

    const tokens = flattenInvocation(inv)
    for (const token of tokens) {
      const escaped = escapeBash(token.text)
      segments.push({
        text: escaped,
        originId: token.originId,
        argumentId: token.argId,
      })
    }
  }

  return {
    text: segments.map((s) => s.text).join(' '),
    segments,
  }
}

/**
 * Escape a token for Bash: wrap in quotes if it contains characters
 * outside the safe ASCII set (including Unicode, spaces, brackets, etc.).
 *
 * Strategy:
 * - Safe ASCII token (alnum + _ . - : / \) → no quoting needed
 * - Contains single quote → use double quotes with \" escaping
 * - Everything else → use single quotes (bash literal, preserves all chars)
 */
function escapeBash(text: string): string {
  // Safe: only ASCII alphanumeric and common path separators
  if (/^[a-zA-Z0-9_.\-:/\\]+$/.test(text)) return text

  // Contains single quotes → must use double quotes
  if (text.includes("'")) {
    return `"${text.replace(/"/g, '\\"')}"`
  }

  // All other cases (Unicode, spaces, brackets, parens, $, `, etc.)
  // Single quotes preserve everything literally in bash
  return `'${text}'`
}
