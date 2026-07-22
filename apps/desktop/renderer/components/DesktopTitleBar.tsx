import { useEffect, useState } from 'react'
import { useDesktopLocale } from '../useDesktopLocale'

interface WindowState {
  maximized: boolean
  sizeUnlocked: boolean
}

const initialState: WindowState = { maximized: false, sizeUnlocked: false }

export function DesktopTitleBar() {
  const api = window.electronAPI
  const locale = useDesktopLocale()
  const isZh = locale === 'zh-CN'
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
            ? (isZh ? '重新锁定推荐最小窗口尺寸' : 'Restore the recommended minimum window size')
            : (isZh ? '解锁窗口大小；缩小后将显示细滚动条，避免内容被截断' : 'Unlock window sizing; thin scrollbars prevent clipped content at smaller sizes')}
          aria-pressed={state.sizeUnlocked}
        >
          <span aria-hidden="true">{state.sizeUnlocked ? '🔓' : '🔒'}</span>
          {state.sizeUnlocked
            ? (isZh ? '尺寸已解锁' : 'Size unlocked')
            : (isZh ? '解锁窗口大小' : 'Unlock window size')}
        </button>
        <button type="button" onClick={() => void api?.minimizeWindow()} aria-label={isZh ? '最小化' : 'Minimize'}>
          <span className="desktop-titlebar__window-icon desktop-titlebar__window-icon--minimize" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => void toggleMaximize()} aria-label={state.maximized ? (isZh ? '还原' : 'Restore') : (isZh ? '最大化' : 'Maximize')}>
          <span
            className={`desktop-titlebar__window-icon ${state.maximized
              ? 'desktop-titlebar__window-icon--restore'
              : 'desktop-titlebar__window-icon--maximize'}`}
            aria-hidden="true"
          />
        </button>
        <button type="button" className="desktop-titlebar__close" onClick={() => void api?.closeWindow()} aria-label={isZh ? '关闭' : 'Close'}>
          <span className="desktop-titlebar__window-icon desktop-titlebar__window-icon--close" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
