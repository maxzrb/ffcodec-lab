import { useCallback, useState } from 'react'
import type { CommandArg, CommandPlan } from '@ffcodec/domain/command/command-ast'
import type { ShellKind } from '@ffcodec/domain/config/project-config'
import type { RenderedCommand } from '@ffcodec/domain/shell/shell-types'
import { ShellSelector } from './ShellSelector'
import { useI18n } from '../features/i18n/i18n'

interface CommandPreviewProps {
  commandPlan: CommandPlan
  renderedCommand: RenderedCommand
  shell: ShellKind
  hasErrors: boolean
  cleared: boolean
  onShellChange: (shell: ShellKind) => void
  onClear: () => void
  onTokenClick?: (originId: string) => void
}

export function CommandPreview({
  commandPlan,
  renderedCommand,
  shell,
  hasErrors,
  cleared,
  onShellChange,
  onClear,
  onTokenClick,
}: CommandPreviewProps) {
  const { locale } = useI18n()
  const [multiline, setMultiline] = useState(false)
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
    <section className={`command-card ${hasErrors ? 'command-card--error' : ''}`} aria-label={locale === 'zh-CN' ? '命令预览' : 'Command preview'}>
      <div className="command-toolbar">
        <span className="command-toolbar__title">{locale === 'zh-CN' ? '命令预览' : 'Command preview'}</span>
        <ShellSelector value={shell} onChange={onShellChange} />
        <button
          type="button"
          onClick={() => setMultiline(!multiline)}
          disabled={cleared}
          className={`button-ghost ${multiline ? 'button-ghost--active' : ''}`}
          aria-pressed={multiline}
        >
          {multiline ? (locale === 'zh-CN' ? '多行' : 'Multiline') : (locale === 'zh-CN' ? '单行' : 'Single line')}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={hasErrors || cleared || renderedCommand.text.length === 0}
          className={`button-ghost ${copied ? 'button-ghost--active' : ''}`}
        >
          {copied ? (locale === 'zh-CN' ? '已复制' : 'Copied') : (locale === 'zh-CN' ? '复制' : 'Copy')}
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={cleared}
          className="button-ghost button-ghost--danger"
        >
          {locale === 'zh-CN' ? '清空全部' : 'Clear all'}
        </button>
        {!cleared && commandPlan.invocations.length > 1 && (
          <span className="meta-pill">
            {locale === 'zh-CN' ? `${commandPlan.invocations.length} 条两遍命令` : `${commandPlan.invocations.length} two-pass commands`}
          </span>
        )}
      </div>

      {!cleared && hasErrors && (
        <div className="command-error-banner" role="alert">
          {locale === 'zh-CN'
            ? '当前配置存在错误，复制已禁用。请先处理下方诊断。'
            : 'The configuration contains errors. Resolve the diagnostics below before copying.'}
        </div>
      )}

      <div className={`command-body ${cleared ? 'command-body--empty' : ''}`}>
        {cleared ? (
          <p role="status">
            {locale === 'zh-CN'
              ? '所有命令已清空。修改参数工作台中的任意参数后会自动重新生成。'
              : 'All commands are cleared. Change any parameter to generate them again.'}
          </p>
        ) : multiline ? (
          <div>
            {renderedCommand.segments.map((segment, index) => (
              <CommandToken
                key={`${segment.originId}-${index}`}
                segment={segment}
                tokens={allTokens}
                onClick={onTokenClick}
                locale={locale}
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
  locale,
}: {
  segment: { text: string; originId: string }
  tokens: TokenInfo[]
  onClick?: (originId: string) => void
  locale: 'zh-CN' | 'en'
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
        title={locale === 'zh-CN' ? `定位参数：${matchedToken.originId}` : `Locate field: ${matchedToken.originId}`}
      >
        {segment.text}
      </button>
    )
  }
  return <span>{segment.text}</span>
}
