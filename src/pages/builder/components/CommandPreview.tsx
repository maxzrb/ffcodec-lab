// ============================================================
// CommandPreview — renders the generated FFmpeg command.
// Supports single-line and multi-line display, copy, and
// click-to-locate-field via originId mapping.
// ============================================================

import { useState, useCallback } from 'react'
import type { CommandPlan, CommandArg } from '../../../domain/command/command-ast'
import type { RenderedCommand } from '../../../domain/shell/shell-types'
import { ShellSelector } from './ShellSelector'
import type { ShellKind } from '../../../domain/config/project-config'

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
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = renderedCommand.text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [renderedCommand.text])

  // Collect all token originIds for click mapping
  const allTokens = collectAllTokens(commandPlan)

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: hasErrors ? '2px solid var(--error)' : '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'var(--bg-input)',
          borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, marginRight: 8 }}>命令预览</span>

        <ShellSelector value={shell} onChange={onShellChange} />

        <button
          type="button"
          onClick={() => setMultiline(!multiline)}
          style={{
            padding: '3px 10px',
            fontSize: 11,
            background: multiline ? 'var(--accent)' : 'var(--bg-input)',
            color: multiline ? '#fff' : 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
          }}
        >
          {multiline ? '多行' : '单行'}
        </button>

        <button
          type="button"
          onClick={handleCopy}
          disabled={hasErrors}
          style={{
            padding: '3px 10px',
            fontSize: 11,
            background: copied ? '#28a745' : 'var(--bg-input)',
            color: copied ? '#fff' : hasErrors ? 'var(--text-dim)' : 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            cursor: hasErrors ? 'not-allowed' : 'pointer',
            opacity: hasErrors ? 0.5 : 1,
          }}
        >
          {copied ? '已复制!' : '复制命令'}
        </button>

        {commandPlan.invocations.length > 1 && (
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            {commandPlan.invocations.length} 条命令（两遍编码）
          </span>
        )}
      </div>

      {/* Command display */}
      {hasErrors && (
        <div
          style={{
            padding: '6px 12px',
            background: 'rgba(255,107,107,0.15)',
            color: 'var(--error)',
            fontSize: 12,
          }}
        >
          ⚠ 当前配置存在错误，此命令不保证可执行。复制已禁用。
        </div>
      )}

      <div style={{ padding: multiline ? 12 : 8 }}>
        {multiline ? (
          <div style={{ fontSize: 13, fontFamily: 'monospace', lineHeight: 1.8 }}>
            {renderedCommand.segments.map((seg, i) => (
              <CommandToken
                key={i}
                segment={seg}
                tokens={allTokens}
                onClick={onTokenClick}
              />
            ))}
          </div>
        ) : (
          <pre
            style={{
              fontSize: 12,
              margin: 0,
              padding: 8,
              background: '#0d1117',
              borderRadius: 'var(--radius)',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {renderedCommand.text}
          </pre>
        )}
      </div>
    </div>
  )
}

// -- helpers ----------------------------------------------------

interface TokenInfo {
  originId: string
  text: string
}

function collectAllTokens(plan: CommandPlan): TokenInfo[] {
  const tokens: TokenInfo[] = []
  for (const inv of plan.invocations) {
    const args: CommandArg[] = [
      ...inv.globalArgs,
      ...inv.output.maps,
      ...inv.output.codecArgs,
      ...inv.output.qualityArgs,
      ...inv.output.filterArgs,
      ...inv.output.audioArgs,
      ...inv.output.subtitleArgs,
      ...inv.output.muxerArgs,
      ...inv.output.customArgs,
    ]
    for (const arg of args) {
      for (const t of arg.tokens) {
        tokens.push({ originId: arg.originId, text: t })
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
  // Find if this segment text matches any known token originId
  const matchedToken = tokens.find(
    (t) => t.text === segment.text.trim() || segment.text.includes(t.text),
  )

  if (matchedToken && onClick && matchedToken.originId) {
    return (
      <span
        onClick={() => onClick(matchedToken.originId)}
        style={{
          cursor: 'pointer',
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          textUnderlineOffset: 3,
        }}
        title={`来源: ${matchedToken.originId}`}
      >
        {segment.text}
      </span>
    )
  }

  return <span>{segment.text}</span>
}
