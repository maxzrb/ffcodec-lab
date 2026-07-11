import { useState } from 'react'
import { BuilderPage } from '../pages/builder/BuilderPage'
import { DevVerificationPage } from '../pages/builder/DevVerificationPage'

export default function App() {
  const [devMode, setDevMode] = useState(false)

  return (
    <div className="app-shell">
      <div className="dev-toolbar">
        <span className="dev-toolbar__label">
          {devMode ? '开发验证页面' : '正式页面'}
        </span>
        <button
          type="button"
          onClick={() => setDevMode(!devMode)}
          className={`dev-toolbar__button ${devMode ? 'dev-toolbar__button--active' : ''}`}
        >
          {devMode ? '切换到正式页面' : '开发模式'}
        </button>
      </div>
      {devMode ? <DevVerificationPage /> : <BuilderPage />}
    </div>
  )
}
