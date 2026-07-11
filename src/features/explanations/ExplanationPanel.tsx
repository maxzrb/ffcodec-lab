// ============================================================
// ExplanationPanel — displays parameter explanation, source refs,
// verification status, and effects on quality/size/speed/compat.
// ============================================================

import type { ExplanationDefinition } from '../../domain/catalog/catalog-types'

interface ExplanationPanelProps {
  explanation: ExplanationDefinition
  onClose: () => void
}

export function ExplanationPanel({ explanation, onClose }: ExplanationPanelProps) {
  return (
    <section className="explanation-card">
      <div className="explanation-card__header">
        <h3>{explanation.title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="icon-button"
          aria-label="关闭参数说明"
        >
          ✕
        </button>
      </div>

      <div className="explanation-card__body">
        <p style={{ margin: '0 0 8px' }}>{explanation.short}</p>

        {explanation.detail && (
          <p style={{ color: 'var(--text-dim)', fontSize: 12, margin: '0 0 12px' }}>
            {explanation.detail}
          </p>
        )}

        {explanation.commandExample && (
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>命令示例: </span>
            <code
              style={{
                fontSize: 12,
                padding: '2px 6px',
                background: '#0d1117',
                borderRadius: 'var(--radius)',
              }}
            >
              {explanation.commandExample}
            </code>
          </div>
        )}

        {/* Effects indicators */}
        {explanation.effects && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>影响评估：</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <EffectRow label="画质" value={explanation.effects.quality ?? 0} />
              <EffectRow label="文件体积" value={explanation.effects.fileSize ?? 0} />
              <EffectRow label="编码速度" value={explanation.effects.speed ?? 0} />
              <EffectRow label="兼容性" value={explanation.effects.compatibility ?? 0} />
            </div>
          </div>
        )}

        {/* Warnings */}
        {explanation.warnings && explanation.warnings.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--warning)', fontWeight: 600, marginBottom: 4 }}>
              注意事项：
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
              {explanation.warnings.map((w, i) => (
                <li key={i} style={{ color: 'var(--text-dim)' }}>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Source references */}
        {explanation.sourceRefs.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>数据来源：</div>
            {explanation.sourceRefs.map((ref, i) => (
              <div key={i} style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 2 }}>
                {ref.repository} / {ref.file}
                {ref.symbol ? ` → ${ref.symbol}` : ''}
                <span style={{ marginLeft: 8, color: 'var(--text-dim)' }}>
                  ({ref.sourceType})
                </span>
              </div>
            ))}
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
