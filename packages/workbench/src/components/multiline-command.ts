import type { ShellKind } from '@ffcodec/domain/config/project-config'
import type { RenderedCommand, RenderedSegment } from '@ffcodec/domain/shell/shell-types'

export interface MultilineCommandLine {
  prefix: string
  segments: RenderedSegment[]
  suffix: string
  systemText?: string
}

export interface MultilineCommand {
  lines: MultilineCommandLine[]
  text: string
}

/**
 * 将已完成 Shell 转义的 token 排成可直接粘贴执行的多行命令。
 * 每个参数组占一行；输入标记与输入路径保持在同一行。
 */
export function formatMultilineCommand(rendered: RenderedCommand, shell: ShellKind): MultilineCommand {
  const invocations = splitInvocations(rendered.segments)
  const lines: MultilineCommandLine[] = []
  const continuation = shell === 'powershell' ? '`' : shell === 'cmd' ? '^' : '\\'

  invocations.forEach((invocation, invocationIndex) => {
    const nestedPowerShell = shell === 'powershell' && invocationIndex > 0
    if (nestedPowerShell) {
      lines.push({ prefix: '', segments: [], suffix: '', systemText: 'if ($LASTEXITCODE -eq 0) {' })
    }

    const groups = groupArguments(invocation)
    groups.forEach((segments, groupIndex) => {
      const isLastGroup = groupIndex === groups.length - 1
      const hasNextInvocation = invocationIndex < invocations.length - 1
      const baseIndent = nestedPowerShell ? '  ' : ''
      const prefix = `${baseIndent}${groupIndex > 0 ? '  ' : ''}`
      let suffix = isLastGroup ? '' : ` ${continuation}`

      if (isLastGroup && hasNextInvocation) {
        if (shell === 'bash') suffix = ' &&'
        if (shell === 'cmd') suffix = ' && ^'
      }

      lines.push({ prefix, segments, suffix })
    })

    if (nestedPowerShell) {
      lines.push({ prefix: '', segments: [], suffix: '', systemText: '}' })
    }
  })

  return {
    lines,
    text: lines.map(lineToText).join('\n'),
  }
}

function splitInvocations(segments: RenderedSegment[]): RenderedSegment[][] {
  const invocations: RenderedSegment[][] = [[]]
  for (const segment of segments) {
    if (segment.argumentId === 'separator') {
      if (invocations[invocations.length - 1]?.length) invocations.push([])
      continue
    }
    if (segment.argumentId === 'conditional.end') continue
    invocations[invocations.length - 1]?.push(segment)
  }
  return invocations.filter((invocation) => invocation.length > 0)
}

function groupArguments(segments: RenderedSegment[]): RenderedSegment[][] {
  const groups: RenderedSegment[][] = []
  for (const segment of segments) {
    const current = groups[groups.length - 1]
    if (!current || current[0].argumentId !== segment.argumentId) groups.push([segment])
    else current.push(segment)
  }

  // flattenInvocation 为 -i 和路径保留不同 argumentId；预览时仍应视为一组。
  for (let index = 0; index < groups.length - 1; index += 1) {
    if (groups[index].length === 1 && groups[index][0].text === '-i') {
      groups[index].push(...groups[index + 1])
      groups.splice(index + 1, 1)
    }
  }
  return groups
}

function lineToText(line: MultilineCommandLine): string {
  if (line.systemText) return line.systemText
  return `${line.prefix}${line.segments.map((segment) => segment.text).join(' ')}${line.suffix}`
}
