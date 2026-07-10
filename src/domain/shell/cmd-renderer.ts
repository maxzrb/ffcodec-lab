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

function escapeCmd(text: string): string {
  if (/^[a-zA-Z0-9_.\-:/\\]+$/.test(text)) return text

  // CMD special chars need ^ prefix
  let escaped = text
    .replace(/([&|<>^!%])/g, '^$1')
  if (escaped.includes(' ') && !escaped.startsWith('"')) {
    escaped = `"${escaped}"`
  }
  return escaped
}
