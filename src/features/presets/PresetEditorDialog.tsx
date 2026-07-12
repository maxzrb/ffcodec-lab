// ============================================================
// PresetEditorDialog — create/edit/save-as preset form.
// ============================================================

import { useState } from 'react'
import type { UserPreset } from './preset-types'
import { useI18n } from '../i18n/i18n'

interface PresetEditorDialogProps {
  preset: UserPreset | null
  saveAsMode: boolean
  onSave: (name: string, description: string) => void
  onClose: () => void
}

export function PresetEditorDialog({
  preset,
  saveAsMode,
  onSave,
  onClose,
}: PresetEditorDialogProps) {
  const { locale } = useI18n()
  const isZh = locale === 'zh-CN'
  const [name, setName] = useState(preset?.name ?? '')
  const [description, setDescription] = useState(preset?.description ?? '')
  const [error, setError] = useState('')

  const title = saveAsMode
    ? (isZh ? '另存为新预设' : 'Save as new preset')
    : preset
      ? (isZh ? '编辑预设' : 'Edit preset')
      : (isZh ? '新建预设' : 'New preset')

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError(isZh ? '预设名称不能为空' : 'Preset name is required')
      return
    }
    onSave(trimmed, description.trim() || undefined!)
    setError('')
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
        }}
      />
      <div
        style={{
          position: 'relative',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 20,
          width: 360,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          color: 'var(--text)',
        }}
      >
        <h3 style={{ fontSize: 15, margin: '0 0 16px' }}>{title}</h3>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>
            {isZh ? '名称' : 'Name'} <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            placeholder={isZh ? '输入预设名称' : 'Enter a preset name'}
            autoFocus
            style={{
              width: '100%',
              padding: '6px 10px',
              fontSize: 13,
              background: 'var(--bg-input)',
              border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`,
              borderRadius: 4,
              color: 'var(--text)',
              boxSizing: 'border-box',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit()
              if (e.key === 'Escape') onClose()
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>
            {isZh ? '描述' : 'Description'} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>({isZh ? '可选' : 'optional'})</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isZh ? '简短描述此预设的用途' : 'Briefly describe when to use this preset'}
            style={{
              width: '100%',
              padding: '6px 10px',
              fontSize: 13,
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              color: 'var(--text)',
              boxSizing: 'border-box',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit()
              if (e.key === 'Escape') onClose()
            }}
          />
        </div>

        {error && (
          <div style={{ color: 'var(--error)', fontSize: 12, marginBottom: 12 }}>{error}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              fontSize: 12,
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              cursor: 'pointer',
              color: 'var(--text)',
            }}
          >
            {isZh ? '取消' : 'Cancel'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            style={{
              padding: '6px 16px',
              fontSize: 12,
              background: name.trim() ? 'var(--accent)' : 'var(--bg-input)',
              border: '1px solid ' + (name.trim() ? 'var(--accent)' : 'var(--border)'),
              borderRadius: 4,
              cursor: name.trim() ? 'pointer' : 'not-allowed',
              color: name.trim() ? '#fff' : 'var(--text-dim)',
            }}
          >
            {isZh ? '保存' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
