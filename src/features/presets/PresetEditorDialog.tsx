// ============================================================
// PresetEditorDialog — create/edit/save-as preset form.
// ============================================================

import { useState } from 'react'
import type { UserPreset } from './preset-types'

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
  const [name, setName] = useState(preset?.name ?? '')
  const [description, setDescription] = useState(preset?.description ?? '')
  const [error, setError] = useState('')

  const title = saveAsMode ? '另存为新预设' : preset ? '编辑预设' : '新建预设'

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('预设名称不能为空')
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
            名称 <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            placeholder="输入预设名称"
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
            描述 <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(可选)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简短描述此预设的用途"
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
            取消
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
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
