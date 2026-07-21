// ============================================================
// ExplanationPanel — 向用户展示参数用途、取舍和注意事项。
// 来源引用仅供内部目录审计，不在产品界面暴露。
// ============================================================

import type { ExplanationDefinition } from '@ffcodec/domain/catalog/catalog-types'
import { localizeExplanation, useI18n } from '../i18n/i18n'

interface ExplanationPanelProps {
  explanation: ExplanationDefinition
  onClose: () => void
}

export function ExplanationPanel({ explanation, onClose }: ExplanationPanelProps) {
  const { locale } = useI18n()
  const content = localizeExplanation(explanation, locale)
  return (
    <section className="explanation-card">
      <div className="explanation-card__header">
        <h3>{content.title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="icon-button"
          aria-label={locale === 'zh-CN' ? '关闭参数说明' : 'Close parameter guide'}
        >
          ✕
        </button>
      </div>

      <div className="explanation-card__body">
        <p style={{ margin: '0 0 8px' }}>{content.short}</p>

        {content.detail && (
          <p style={{ color: 'var(--text-dim)', fontSize: 12, margin: '0 0 12px' }}>
            {content.detail}
          </p>
        )}

        {explanation.commandExample && (
          <div className="explanation-command-example">
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
              {locale === 'zh-CN' ? '命令示例：' : 'Command example: '}
            </span>
            <code>{explanation.commandExample}</code>
          </div>
        )}

        {/* Effects indicators */}
        {explanation.effects && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>
              {locale === 'zh-CN' ? '影响评估：' : 'Impact:'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <EffectRow label={locale === 'zh-CN' ? '画质' : 'Quality'} value={explanation.effects.quality ?? 0} />
              <EffectRow label={locale === 'zh-CN' ? '文件体积' : 'File size'} value={explanation.effects.fileSize ?? 0} />
              <EffectRow label={locale === 'zh-CN' ? '编码速度' : 'Speed'} value={explanation.effects.speed ?? 0} />
              <EffectRow label={locale === 'zh-CN' ? '兼容性' : 'Compatibility'} value={explanation.effects.compatibility ?? 0} />
            </div>
          </div>
        )}

        {/* Warnings */}
        {content.warnings && content.warnings.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--warning)', fontWeight: 600, marginBottom: 4 }}>
              {locale === 'zh-CN' ? '注意事项：' : 'Notes:'}
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
              {content.warnings.map((w, i) => (
                <li key={i} style={{ color: 'var(--text-dim)' }}>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </section>
  )
}

function EffectRow({ label, value }: { label: string; value: number }) {
  const maxBars = 5
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, minWidth: 56, color: 'var(--text-dim)' }}>{label}</span>
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: maxBars }, (_, i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 6,
              borderRadius: 2,
              background: i < value
                ? value >= 4 ? 'var(--info)' : value >= 3 ? 'var(--warning)' : 'var(--accent)'
                : 'var(--bg-input)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
