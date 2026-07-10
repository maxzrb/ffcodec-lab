// ============================================================
// ShellSelector — switch between Bash, PowerShell, and CMD.
// ============================================================

import type { ShellKind } from '../../../domain/config/project-config'

interface ShellSelectorProps {
  value: ShellKind
  onChange: (shell: ShellKind) => void
}

const SHELL_OPTIONS: { value: ShellKind; label: string }[] = [
  { value: 'bash', label: 'Bash / Zsh' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'cmd', label: 'Windows CMD' },
]

export function ShellSelector({ value, onChange }: ShellSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
      {SHELL_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            padding: '4px 14px',
            fontSize: 12,
            fontWeight: value === opt.value ? 600 : 400,
            background: value === opt.value ? 'var(--accent)' : 'var(--bg-input)',
            color: value === opt.value ? '#fff' : 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
