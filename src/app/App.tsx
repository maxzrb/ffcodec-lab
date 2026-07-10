import { useState } from 'react'
import { BuilderPage } from '../pages/builder/BuilderPage'
import { DevVerificationPage } from '../pages/builder/DevVerificationPage'

export default function App() {
  const [devMode, setDevMode] = useState(false)

  return (
    <div>
      <div
        style={{
          position: 'fixed',
          top: 8,
          right: 12,
          zIndex: 1000,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
          {devMode ? '开发验证页面' : '正式页面'}
        </span>
        <button
          type="button"
          onClick={() => setDevMode(!devMode)}
          style={{
            fontSize: 10,
            padding: '2px 10px',
            background: devMode ? 'var(--accent)' : 'var(--bg-input)',
            color: devMode ? '#fff' : 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
          }}
        >
          {devMode ? '切换到正式页面' : '开发模式'}
        </button>
      </div>
      {devMode ? <DevVerificationPage /> : <BuilderPage />}
    </div>
  )
}
