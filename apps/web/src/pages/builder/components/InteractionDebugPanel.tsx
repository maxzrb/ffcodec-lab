// ============================================================
// InteractionDebugPanel — dev-only debug overlay for tracing
// the full interaction chain of user operations.
//
// Enabled via: ?debugInteractions=1
// ============================================================

import { useState, useEffect } from 'react'
import type { ResolvedBuilderView } from '../../../domain/presentation/resolved-field'
import type { AppliedFieldChange } from '../../../domain/presentation/apply-field-change'

interface InteractionLogEntry {
  timestamp: number
  fieldId: string
  oldValue: unknown
  newValue: unknown
  binding: string | null
  accepted: boolean
  notices: string[]
}

interface InteractionDebugPanelProps {
  view: ResolvedBuilderView
}

export function InteractionDebugPanel({ view }: InteractionDebugPanelProps) {
  const [entries, setEntries] = useState<InteractionLogEntry[]>([])
  const [expanded, setExpanded] = useState(false)
  const [enabled, setEnabled] = useState(false)

  // Check for debug query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setEnabled(params.get('debugInteractions') === '1')
  }, [])

  // Intercept field changes via monkey-patching
  // We hook into the store's setConfigValue to capture old/new values
  useEffect(() => {
    if (!enabled) return

    // Listen for custom debug events dispatched by the patched store
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<InteractionLogEntry>).detail
      setEntries((prev) => [detail, ...prev].slice(0, 50))
    }

    window.addEventListener('ffcodec:fieldChange', handler)
    return () => window.removeEventListener('ffcodec:fieldChange', handler)
  }, [enabled])

  if (!enabled) return null

  const lastEntry = entries[0]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: expanded ? 480 : 280,
        maxHeight: expanded ? '70vh' : 'auto',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRight: 'none',
        borderBottom: 'none',
        borderTopLeftRadius: 8,
        padding: 12,
        fontSize: 11,
        fontFamily: 'monospace',
        zIndex: 9999,
        overflow: 'auto',
        boxShadow: '0 -2px 16px rgba(0,0,0,0.3)',
        transition: 'width 0.2s',
        color: 'var(--text)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong style={{ fontSize: 12 }}>🔍 交互调试面板</strong>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text)',
            cursor: 'pointer',
            fontSize: 10,
            padding: '2px 8px',
          }}
        >
          {expanded ? '收起' : '展开'}
        </button>
      </div>

      {/* Last interaction summary */}
      {lastEntry ? (
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: 'var(--accent)', marginBottom: 4 }}>
            ▶ 最近操作: <strong>{lastEntry.fieldId}</strong>
          </div>
          <Row label="旧值" value={JSON.stringify(lastEntry.oldValue)} />
          <Row label="新值" value={JSON.stringify(lastEntry.newValue)} />
          <Row label="binding" value={lastEntry.binding ?? '(none)'} />
          <Row label="accepted" value={String(lastEntry.accepted)} />
          {lastEntry.notices.length > 0 && (
            <div style={{ marginTop: 4 }}>
              {lastEntry.notices.map((n, i) => (
                <div key={i} style={{ color: 'var(--warning)', fontSize: 10 }}>
                  ⚠ {n}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ color: 'var(--text-dim)', marginBottom: 8 }}>
          等待用户操作...
        </div>
      )}

      {/* Field index summary */}
      {expanded && (
        <>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
          <div style={{ marginBottom: 4 }}>
            <strong>已解析字段 ({Object.keys(view.fieldIndex).length})</strong>
          </div>
          <div style={{ maxHeight: 200, overflow: 'auto' }}>
            {Object.entries(view.fieldIndex).slice(0, 100).map(([id, field]) => (
              <div key={id} style={{ marginBottom: 2, fontSize: 10, opacity: field.visible ? 1 : 0.4 }}>
                <span style={{ color: field.disabled ? 'var(--text-dim)' : 'var(--text)' }}>
                  {field.controlType === 'switch' ? '☐' : field.controlType === 'select' ? '▾' : '▸'}
                </span>{' '}
                {id}
                <span style={{ color: 'var(--text-dim)' }}>
                  {' '}= {JSON.stringify(field.value)}
                </span>
                {field.configBinding && (
                  <span style={{ color: 'var(--accent)', fontSize: 9 }}>
                    {' '}→ {field.configBinding.path}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* History */}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
          <div style={{ marginBottom: 4 }}>
            <strong>交互历史 ({entries.length})</strong>
          </div>
          <div style={{ maxHeight: 150, overflow: 'auto' }}>
            {entries.slice(1).map((entry, i) => (
              <div key={i} style={{ fontSize: 10, marginBottom: 2, color: 'var(--text-dim)' }}>
                {entry.fieldId}: {JSON.stringify(entry.oldValue)} → {JSON.stringify(entry.newValue)}
                {!entry.accepted && ' ❌'}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 1 }}>
      <span style={{ color: 'var(--text-dim)', minWidth: 64 }}>{label}:</span>
      <span style={{ wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}

// ============================================================
// Store patch helper — dispatches debug events on field changes
// Should be called once during app initialization when debug mode is on
// ============================================================
export function dispatchFieldChangeEvent(
  fieldId: string,
  oldValue: unknown,
  newValue: unknown,
  result: AppliedFieldChange,
) {
  const entry: InteractionLogEntry = {
    timestamp: performance.now(),
    fieldId,
    oldValue,
    newValue,
    binding: result.path ?? null,
    accepted: result.accepted,
    notices: result.notices.map((n) => `${n.code}: ${n.message}`),
  }
  window.dispatchEvent(new CustomEvent('ffcodec:fieldChange', { detail: entry }))
}
