import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

export interface AppDialogOptions {
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  tone?: 'default' | 'warning' | 'danger'
}

interface DialogRequest extends AppDialogOptions {
  alertOnly: boolean
  resolve: (accepted: boolean) => void
}

interface AppDialogValue {
  confirm: (options: AppDialogOptions) => Promise<boolean>
  alert: (options: Omit<AppDialogOptions, 'cancelLabel'>) => Promise<void>
}

const AppDialogContext = createContext<AppDialogValue | null>(null)

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<DialogRequest | null>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)

  const finish = useCallback((accepted: boolean) => {
    setRequest((current) => {
      current?.resolve(accepted)
      return null
    })
  }, [])

  const confirm = useCallback((options: AppDialogOptions) => new Promise<boolean>((resolve) => {
    setRequest({ ...options, alertOnly: false, resolve })
  }), [])
  const alert = useCallback((options: Omit<AppDialogOptions, 'cancelLabel'>) => new Promise<void>((resolve) => {
    setRequest({ ...options, alertOnly: true, resolve: () => resolve() })
  }), [])

  useEffect(() => {
    if (!request) return
    requestAnimationFrame(() => confirmRef.current?.focus())
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [finish, request])

  return (
    <AppDialogContext.Provider value={{ confirm, alert }}>
      {children}
      {request && (
        <div className="app-dialog-layer" role="dialog" aria-modal="true" aria-labelledby="app-dialog-title" aria-describedby="app-dialog-message">
          <button type="button" className="app-dialog__backdrop" aria-label={request.cancelLabel ?? 'Close'} onClick={() => finish(false)} />
          <section className={`app-dialog app-dialog--${request.tone ?? 'default'}`}>
            <header>
              <span className="app-dialog__symbol" aria-hidden="true">{request.tone === 'danger' ? '!' : request.tone === 'warning' ? '⚠' : 'i'}</span>
              <div><h2 id="app-dialog-title">{request.title}</h2><p id="app-dialog-message">{request.message}</p></div>
            </header>
            <footer>
              {!request.alertOnly && <button type="button" className="button-ghost" onClick={() => finish(false)}>{request.cancelLabel}</button>}
              <button ref={confirmRef} type="button" className={`button ${request.tone === 'danger' ? 'button--danger' : request.tone === 'warning' ? 'app-dialog__confirm--warning' : 'button--primary'}`} onClick={() => finish(true)}>{request.confirmLabel}</button>
            </footer>
          </section>
        </div>
      )}
    </AppDialogContext.Provider>
  )
}

export function useAppDialog(): AppDialogValue {
  const value = useContext(AppDialogContext)
  if (!value) throw new Error('useAppDialog must be used inside AppDialogProvider')
  return value
}
