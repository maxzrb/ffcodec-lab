import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { HardwareMonitorState, HardwareSnapshot } from '../../shared/hardware-monitor-types'

const SUMMARY_STORAGE_KEY = 'ffcodec-desktop-performance-summary-enabled'
const initialState: HardwareMonitorState = { status: 'idle', message: null, intervalMs: 1_000, elevated: false }

interface HardwareMonitorContextValue {
  state: HardwareMonitorState
  snapshot: HardwareSnapshot | null
  history: HardwareSnapshot[]
  pageOpen: boolean
  summaryEnabled: boolean
  openPage: () => Promise<void>
  closePage: () => void
  setSummaryEnabled: (enabled: boolean) => void
  retry: () => Promise<void>
  installPawnIo: () => Promise<void>
  pawnIoInstalling: boolean
  pawnIoError: string | null
}

const HardwareMonitorContext = createContext<HardwareMonitorContextValue | null>(null)

export function HardwareMonitorProvider({ children }: { children: ReactNode }) {
  const api = window.electronAPI
  const [state, setState] = useState(initialState)
  const [snapshot, setSnapshot] = useState<HardwareSnapshot | null>(null)
  const [history, setHistory] = useState<HardwareSnapshot[]>([])
  const [pageOpen, setPageOpen] = useState(false)
  const [summaryEnabledState, setSummaryEnabledState] = useState(() =>
    (window.localStorage.getItem(SUMMARY_STORAGE_KEY) ?? window.electronAPI?.storageGetItem(SUMMARY_STORAGE_KEY)) === 'true')
  const [pawnIoInstalling, setPawnIoInstalling] = useState(false)
  const [pawnIoError, setPawnIoError] = useState<string | null>(null)
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelStop = useCallback(() => {
    if (stopTimer.current) clearTimeout(stopTimer.current)
    stopTimer.current = null
  }, [])

  useEffect(() => {
    if (!api) return
    void api.getHardwareMonitorState().then(setState)
    void api.getHardwareSnapshot().then((value) => value && setSnapshot(value))
    const offSnapshot = api.onHardwareSnapshot((value) => {
      setSnapshot(value)
      // 默认 1 秒采样，仅保留最近 5 分钟，避免长时间开启摘要时无界增长。
      setHistory((current) => [...current, value].slice(-300))
    })
    const offState = api.onHardwareMonitorStateChanged(setState)
    return () => {
      offSnapshot()
      offState()
      cancelStop()
    }
  }, [api, cancelStop])

  useEffect(() => {
    const statusBar = document.querySelector<HTMLElement>('.desktop-status-bar')
    const updateStatusBarHeight = () => {
      const height = statusBar?.getBoundingClientRect().height ?? 38
      document.documentElement.style.setProperty('--desktop-status-bar-height', `${Math.ceil(height)}px`)
    }
    const statusBarObserver = statusBar && typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateStatusBarHeight)
      : null
    updateStatusBarHeight()
    if (statusBar) statusBarObserver?.observe(statusBar)
    return () => {
      statusBarObserver?.disconnect()
      document.documentElement.style.removeProperty('--desktop-status-bar-height')
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('performance-page-open', pageOpen)
    const lockedRegions = Array.from(document.querySelectorAll<HTMLElement>('.desktop-shell__content'))
    const lockedScrollY = window.scrollY
    const keepMainPageStill = () => {
      if (pageOpen && window.scrollY !== lockedScrollY) window.scrollTo({ top: lockedScrollY })
    }
    for (const region of lockedRegions) {
      if (pageOpen) region.setAttribute('inert', '')
      else region.removeAttribute('inert')
    }
    if (pageOpen) {
      window.addEventListener('scroll', keepMainPageStill, { passive: true })
      requestAnimationFrame(() => document.querySelector<HTMLElement>('.performance-page button')?.focus())
    }
    return () => {
      window.removeEventListener('scroll', keepMainPageStill)
      document.documentElement.classList.remove('performance-page-open')
      for (const region of lockedRegions) region.removeAttribute('inert')
    }
  }, [pageOpen])

  useEffect(() => {
    if (!api) return
    const updateInterval = () => {
      const interval = document.hidden ? 3_000 : 1_000
      if (state.status === 'running' || state.status === 'limited') {
        void api.setHardwareMonitorInterval(interval)
        if (!document.hidden) void api.requestHardwareSnapshot()
      }
    }
    document.addEventListener('visibilitychange', updateInterval)
    return () => document.removeEventListener('visibilitychange', updateInterval)
  }, [api, state.status])

  const start = useCallback(async () => {
    cancelStop()
    if (!api) return
    const result = await api.startHardwareMonitor(document.hidden ? 3_000 : 1_000)
    setState(result.state)
  }, [api, cancelStop])

  const openPage = useCallback(async () => {
    setPageOpen(true)
    await start()
  }, [start])

  const closePage = useCallback(() => {
    setPageOpen(false)
    if (!summaryEnabledState && api) {
      cancelStop()
      stopTimer.current = setTimeout(() => void api.stopHardwareMonitor(), 10_000)
    }
  }, [api, cancelStop, summaryEnabledState])

  const setSummaryEnabled = useCallback((enabled: boolean) => {
    setSummaryEnabledState(enabled)
    window.electronAPI?.storageSetItem(SUMMARY_STORAGE_KEY, String(enabled))
    try { window.localStorage.setItem(SUMMARY_STORAGE_KEY, String(enabled)) } catch { /* ignore */ }
    if (enabled) {
      cancelStop()
      void start()
    } else if (!pageOpen && api) {
      cancelStop()
      stopTimer.current = setTimeout(() => void api.stopHardwareMonitor(), 10_000)
    }
  }, [api, cancelStop, pageOpen, start])

  useEffect(() => {
    if (summaryEnabledState) void start()
  }, [start, summaryEnabledState])

  const installPawnIo = useCallback(async () => {
    if (!api || pawnIoInstalling) return
    setPawnIoInstalling(true)
    setPawnIoError(null)
    try {
      const result = await api.installPawnIo()
      if (!result.ok) setPawnIoError(result.error ?? 'PawnIO installation failed.')
    } finally {
      setPawnIoInstalling(false)
    }
  }, [api, pawnIoInstalling])

  const value = useMemo<HardwareMonitorContextValue>(() => ({
    state, snapshot, history, pageOpen, summaryEnabled: summaryEnabledState,
    openPage, closePage, setSummaryEnabled, retry: start, installPawnIo, pawnIoInstalling, pawnIoError,
  }), [state, snapshot, history, pageOpen, summaryEnabledState, openPage, closePage, setSummaryEnabled, start, installPawnIo, pawnIoInstalling, pawnIoError])

  return <HardwareMonitorContext.Provider value={value}>{children}</HardwareMonitorContext.Provider>
}

export function useHardwareMonitor(): HardwareMonitorContextValue {
  const value = useContext(HardwareMonitorContext)
  if (!value) throw new Error('useHardwareMonitor 必须在 HardwareMonitorProvider 内使用。')
  return value
}
