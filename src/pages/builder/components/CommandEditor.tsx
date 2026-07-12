import { useCallback, useEffect, useState } from 'react'
import { useI18n } from '../../../features/i18n/i18n'

export function CommandEditor({ generatedCommand }: { generatedCommand: string }) {
  const { locale } = useI18n()
  const isZh = locale === 'zh-CN'
  const [value, setValue] = useState(generatedCommand)
  const [dirty, setDirty] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!dirty) setValue(generatedCommand)
  }, [dirty, generatedCommand])

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = value
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }, [value])

  return (
    <section className="command-card command-editor" aria-label={isZh ? '自由命令编辑器' : 'Free command editor'}>
      <div className="command-toolbar">
        <span className="command-toolbar__title">{isZh ? '自由编辑' : 'Free edit'}</span>
        {dirty && <span className="editor-status">{isZh ? '已脱离自动同步' : 'Manual edits preserved'}</span>}
        <button
          type="button"
          className="button-ghost"
          onClick={() => {
            setValue(generatedCommand)
            setDirty(false)
          }}
        >
          {isZh ? '恢复生成命令' : 'Reset to generated'}
        </button>
        <button type="button" className={`button-ghost ${copied ? 'button-ghost--active' : ''}`} onClick={copy}>
          {copied ? (isZh ? '已复制' : 'Copied') : (isZh ? '复制编辑内容' : 'Copy edited command')}
        </button>
      </div>
      <p className="command-editor__hint">
        {isZh
          ? '可直接粘贴或修改完整 FFmpeg 命令。这里的改动不会反向修改左侧参数。'
          : 'Paste or edit a complete FFmpeg command here. Manual edits do not change the parameter controls.'}
      </p>
      <textarea
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          setDirty(true)
        }}
        rows={8}
        spellCheck={false}
        aria-label={isZh ? '可自由编辑的 FFmpeg 命令' : 'Editable FFmpeg command'}
      />
    </section>
  )
}
