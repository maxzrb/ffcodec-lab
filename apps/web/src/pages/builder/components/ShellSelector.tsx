import type { ShellKind } from '../../../domain/config/project-config'
import { useI18n } from '../../../features/i18n/i18n'

interface ShellSelectorProps {
  value: ShellKind
  onChange: (shell: ShellKind) => void
}

const shellOptions: { value: ShellKind; label: string }[] = [
  { value: 'bash', label: 'Bash' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'cmd', label: 'CMD' },
]

export function ShellSelector({ value, onChange }: ShellSelectorProps) {
  const { locale } = useI18n()
  return (
    <div className="shell-selector" role="group" aria-label={locale === 'zh-CN' ? '命令环境' : 'Shell'}>
      {shellOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`segmented-button ${value === option.value ? 'segmented-button--active' : ''}`}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
