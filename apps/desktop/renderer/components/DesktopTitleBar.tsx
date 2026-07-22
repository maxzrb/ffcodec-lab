import { useEffect, useState } from 'react'

interface WindowState {
  maximized: boolean
  sizeUnlocked: boolean
}

const initialState: WindowState = { maximized: false, sizeUnlocked: false }

export function DesktopTitleBar() {
  const api = window.electronAPI
  const [state, setState] = useState(initialState)

  useEffect(() => {
    api?.getWindowState().then(setState).catch(() => undefined)
  }, [api])

  useEffect(() => {
    document.documentElement.dataset.windowSizeUnlocked = String(state.sizeUnlocked)
    return () => {
      delete document.documentElement.dataset.windowSizeUnlocked
    }
  }, [state.sizeUnlocked])

  const toggleSizeLock = async () => {
    const next = await api?.setWindowSizeUnlocked(!state.sizeUnlocked)
    if (next) setState(next)
  }

  const toggleMaximize = async () => {
    const next = await api?.toggleMaximizeWindow()
    if (next) setState(next)
  }

  return (
    <header className="desktop-titlebar" onDoubleClick={() => void toggleMaximize()}>
      <div className="desktop-titlebar__identity">
        <span className="desktop-titlebar__mark" aria-hidden="true">FF</span>
        <strong>FFCodec Lab</strong>
        <span>Desktop</span>
      </div>
      <div className="desktop-titlebar__actions" onDoubleClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className={`desktop-titlebar__size-lock${state.sizeUnlocked ? ' desktop-titlebar__size-lock--unlocked' : ''}`}
          onClick={() => void toggleSizeLock()}
          title={state.sizeUnlocked
            ? '重新锁定推荐最小窗口尺寸'
            : '解锁窗口大小；缩小后将显示细滚动条，避免内容被截断'}
          aria-pressed={state.sizeUnlocked}
        >
          <span aria-hidden="true">{state.sizeUnlocked ? '🔓' : '🔒'}</span>
          {state.sizeUnlocked ? '尺寸已解锁' : '解锁窗口大小'}
        </button>
        <button type="button" onClick={() => void api?.minimizeWindow()} aria-label="最小化">
          <span className="desktop-titlebar__window-icon desktop-titlebar__window-icon--minimize" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => void toggleMaximize()} aria-label={state.maximized ? '还原' : '最大化'}>
          <span
            className={`desktop-titlebar__window-icon ${state.maximized
              ? 'desktop-titlebar__window-icon--restore'
              : 'desktop-titlebar__window-icon--maximize'}`}
            aria-hidden="true"
          />
        </button>
        <button type="button" className="desktop-titlebar__close" onClick={() => void api?.closeWindow()} aria-label="关闭">
          <span className="desktop-titlebar__window-icon desktop-titlebar__window-icon--close" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
