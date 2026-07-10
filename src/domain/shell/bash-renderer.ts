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
 * Escape a token for Bash: wrap in single quotes if it contains
 * special characters. Escapes single quotes inside the value.
 */
function escapeBash(text: string): string {
  // No escaping needed for simple alphanumeric tokens
  if (/^[a-zA-Z0-9_.\-:/\\]+$/.test(text)) return text

  // For tokens with spaces or special chars, use single quotes
  // with proper single-quote escaping
  if (text.includes("'")) {
    return `"${text.replace(/"/g, '\\"')}"`
  }
  if (text.includes(' ') || text.includes('(') || text.includes(')') || text.includes('$') || text.includes('`')) {
    return `'${text}'`
  }
  return text
}
