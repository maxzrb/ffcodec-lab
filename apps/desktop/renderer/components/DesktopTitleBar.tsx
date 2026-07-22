import { useEffect, useState } from 'react'
import { useDesktopLocale } from '../useDesktopLocale'
import { useHardwareMonitor } from '../hardware-monitor/HardwareMonitorContext'

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
  const monitor = useHardwareMonitor()

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
        <img className="desktop-titlebar__mark" src="./assets/ffcodec-lab-avatar.png" alt="" aria-hidden="true" />
        <strong>FFCodec Lab</strong>
        <span>Desktop</span>
      </div>
      <div className="desktop-titlebar__actions" onDoubleClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className={`desktop-titlebar__performance desktop-titlebar__performance--${monitor.state.status}${monitor.pageOpen ? ' desktop-titlebar__performance--active' : ''}`}
          onClick={() => monitor.pageOpen ? monitor.closePage() : void monitor.openPage()}
          title={isZh ? '打开性能监控；由 LibreHardwareMonitor 在本机只读采集' : 'Open performance monitor; read-only local data from LibreHardwareMonitor'}
          aria-pressed={monitor.pageOpen}
        >
          <span className="desktop-titlebar__performance-icon" aria-hidden="true"><i /><i /><i /><i /></span>
          <span className="desktop-titlebar__performance-label">{isZh ? '性能监控' : 'Performance'}</span>
        </button>
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
