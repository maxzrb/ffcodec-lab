import { useCallback, useState } from 'react'
import type { CommandArg, CommandPlan } from '../../../domain/command/command-ast'
import type { ShellKind } from '../../../domain/config/project-config'
import type { RenderedCommand } from '../../../domain/shell/shell-types'
import { ShellSelector } from './ShellSelector'

interface CommandPreviewProps {
  commandPlan: CommandPlan
  renderedCommand: RenderedCommand
  shell: ShellKind
  hasErrors: boolean
  onShellChange: (shell: ShellKind) => void
  onTokenClick?: (originId: string) => void
}

export function CommandPreview({
  commandPlan,
  renderedCommand,
  shell,
  hasErrors,
  onShellChange,
  onTokenClick,
}: CommandPreviewProps) {
  const [multiline, setMultiline] = useState(true)
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(renderedCommand.text)
    } catch {
      // 兼容未开放 Clipboard API 的旧浏览器。
      const textarea = document.createElement('textarea')
      textarea.value = renderedCommand.text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [renderedCommand.text])

  const allTokens = collectAllTokens(commandPlan)

  return (
    <section className={`command-card ${hasErrors ? 'command-card--error' : ''}`} aria-label="命令预览">
      <div className="command-toolbar">
        <span className="command-toolbar__title">命令预览</span>
        <ShellSelector value={shell} onChange={onShellChange} />
        <button
          type="button"
          onClick={() => setMultiline(!multiline)}
          className={`button-ghost ${multiline ? 'button-ghost--active' : ''}`}
          aria-pressed={multiline}
        >
          {multiline ? '多行' : '单行'}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={hasErrors}
          className={`button-ghost ${copied ? 'button-ghost--active' : ''}`}
        >
          {copied ? '已复制' : '复制'}
        </button>
        {commandPlan.invocations.length > 1 && (
          <span className="meta-pill">{commandPlan.invocations.length} 条两遍命令</span>
        )}
      </div>

      {hasErrors && (
        <div className="command-error-banner" role="alert">
          当前配置存在错误，复制已禁用。请先处理下方诊断。
        </div>
      )}

      <div className="command-body">
        {multiline ? (
          <div>
            {renderedCommand.segments.map((segment, index) => (
              <CommandToken
                key={`${segment.originId}-${index}`}
                segment={segment}
                tokens={allTokens}
                onClick={onTokenClick}
              />
            ))}
          </div>
        ) : (
          <pre>{renderedCommand.text}</pre>
        )}
      </div>
    </section>
  )
}

interface TokenInfo {
  originId: string
  text: string
}

function collectAllTokens(plan: CommandPlan): TokenInfo[] {
  const tokens: TokenInfo[] = []
  for (const invocation of plan.invocations) {
    const args: CommandArg[] = [
      ...invocation.globalArgs,
      ...invocation.output.maps,
      ...invocation.output.codecArgs,
      ...invocation.output.qualityArgs,
      ...invocation.output.filterArgs,
      ...invocation.output.audioArgs,
      ...invocation.output.subtitleArgs,
      ...invocation.output.muxerArgs,
      ...invocation.output.customArgs,
      ...(invocation.output.tailArgs ?? []),
    ]
    for (const argument of args) {
      for (const token of argument.tokens) {
        tokens.push({ originId: argument.originId, text: token })
      }
    }
  }
  return tokens
}

function CommandToken({
  segment,
  tokens,
  onClick,
}: {
  segment: { text: string; originId: string }
  tokens: TokenInfo[]
  onClick?: (originId: string) => void
}) {
  const matchedToken = tokens.find(
    (token) => token.text === segment.text.trim() || segment.text.includes(token.text),
  )

  if (matchedToken?.originId && onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(matchedToken.originId)}
        className="command-token"
        title={`定位参数：${matchedToken.originId}`}
      >
        {segment.text}
      </button>
    )
  }
  return <span>{segment.text}</span>
}
