// ============================================================
// PresetImportDialog — JSON import with validation feedback.
// ============================================================

import { useState } from 'react'

interface PresetImportDialogProps {
  onImport: (json: string) => void
  onClose: () => void
}

export function PresetImportDialog({ onImport, onClose }: PresetImportDialogProps) {
  const [json, setJson] = useState('')
  const [error, setError] = useState('')

  const handleImport = () => {
    const trimmed = json.trim()
    if (!trimmed) {
      setError('请粘贴 JSON 内容')
      return
    }
    try {
      onImport(trimmed)
      setError('')
    } catch (e) {
      setError(`导入失败: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const handleFileSelect = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        setJson(String(reader.result ?? ''))
        setError('')
      }
      reader.onerror = () => {
        setError('文件读取失败')
      }
      reader.readAsText(file)
    }
    input.click()
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
          width: 420,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          color: 'var(--text)',
        }}
      >
        <h3 style={{ fontSize: 15, margin: '0 0 16px' }}>导入预设 (JSON)</h3>

        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 500 }}>
              预设 JSON <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <button
              onClick={handleFileSelect}
              style={{
                padding: '2px 8px',
                fontSize: 11,
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 3,
                cursor: 'pointer',
                color: 'var(--text)',
              }}
            >
              选择文件…
            </button>
          </div>
          <textarea
            value={json}
            onChange={(e) => {
              setJson(e.target.value)
              setError('')
            }}
            placeholder='粘贴 .ffcodec.json 文件内容…'
            rows={10}
            style={{
              width: '100%',
              padding: '8px 10px',
              fontSize: 12,
              fontFamily: 'monospace',
              background: 'var(--bg-input)',
              border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`,
              borderRadius: 4,
              color: 'var(--text)',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              color: 'var(--error)',
              fontSize: 12,
              marginBottom: 12,
              padding: '6px 10px',
              background: 'rgba(255,107,107,0.1)',
              borderRadius: 4,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 16 }}>
          支持从「导出 JSON」生成的 .ffcodec.json 文件导入。导入内容会经过 Zod schema 验证和 migration。非法内容会被整体拒绝。
        </div>

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
            onClick={handleImport}
            disabled={!json.trim()}
            style={{
              padding: '6px 16px',
              fontSize: 12,
              background: json.trim() ? 'var(--accent)' : 'var(--bg-input)',
              border: '1px solid ' + (json.trim() ? 'var(--accent)' : 'var(--border)'),
              borderRadius: 4,
              cursor: json.trim() ? 'pointer' : 'not-allowed',
              color: json.trim() ? '#fff' : 'var(--text-dim)',
            }}
          >
            导入
          </button>
        </div>
      </div>
    </div>
  )
}
