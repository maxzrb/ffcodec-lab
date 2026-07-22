// ============================================================
// Encoding Job State — module-level singleton shared between
// Run 按钮与桌面壳层底部状态栏共享此状态。
//
// Communicates with the Electron main process via the
// preload-exposed electronAPI (startFFmpegJob / cancelFFmpegJob
// / onFFmpegJobUpdated).
// ============================================================

export type JobDisplayPhase =
  | 'idle'
  | 'preparing'
  | 'running'
  | 'cancelling'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface JobDisplayState {
  phase: JobDisplayPhase
  snapshot: FFmpegJobSnapshot | null
  error: string | null
}

// ---- Module singleton ----

let state: JobDisplayState = { phase: 'idle', snapshot: null, error: null }
const listeners = new Set<() => void>()

function notify(): void {
  listeners.forEach((fn) => fn())
}

// ---- Public API ----

export function getJobDisplayState(): JobDisplayState {
  return state
}

export function subscribeToJob(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/**
 * Start an encoding job. Handles the full lifecycle:
 *   idle → preparing → (start) → running → completed/failed/cancelled
 *
 * Progress updates are delivered via the onFFmpegJobUpdated IPC event.
 */
export async function startEncoding(
  request: FFmpegJobStartRequest,
): Promise<void> {
  const api = window.electronAPI
  if (!api) {
    state = { phase: 'idle', snapshot: null, error: 'electronAPI not available' }
    notify()
    return
  }

  // Transition to preparing
  state = { phase: 'preparing', snapshot: null, error: null }
  notify()

  // Start the job
  const result = await api.startFFmpegJob(request)

  if (!result.ok) {
    state = { phase: 'idle', snapshot: null, error: result.error }
    notify()
    return
  }

  // Transition to running
  state = { phase: 'running', snapshot: result.snapshot, error: null }
  notify()

  // Subscribe to progress updates — runs until terminal phase
  const unsubscribe = api.onFFmpegJobUpdated((snapshot) => {
    const terminal: FFmpegJobSnapshot['phase'][] = [
      'completed',
      'failed',
      'cancelled',
    ]
    if (terminal.includes(snapshot.phase)) {
      unsubscribe()
      state = {
        phase: snapshot.phase as JobDisplayPhase,
        snapshot,
        error: snapshot.errorSummary,
      }
    } else {
      state = { phase: 'running', snapshot, error: null }
    }
    notify()
  })
}

/**
 * Cancel the currently active encoding job.
 */
export async function cancelEncoding(): Promise<void> {
  const api = window.electronAPI
  if (!api) return

  // Optimistic update
  if (state.phase === 'running' && state.snapshot) {
    state = {
      phase: 'cancelling',
      snapshot: { ...state.snapshot, phase: 'cancelling' },
      error: null,
    }
    notify()
  }

  const result = await api.cancelFFmpegJob()
  if (!result.ok) {
    console.warn('Cancel failed:', result.error)
  }
}

/**
 * Re-check for an active job on mount / reconnect.
 * If a job is running, re-subscribe to updates.
 */
export async function restoreActiveJob(): Promise<void> {
  const api = window.electronAPI
  if (!api) return

  const snapshot = await api.getActiveFFmpegJob()
  if (!snapshot) return

  const terminal: FFmpegJobSnapshot['phase'][] = [
    'completed',
    'failed',
    'cancelled',
  ]

  if (terminal.includes(snapshot.phase)) {
    state = {
      phase: snapshot.phase as JobDisplayPhase,
      snapshot,
      error: snapshot.errorSummary,
    }
    notify()
    return
  }

  // Still running — re-subscribe
  state = { phase: 'running', snapshot, error: null }
  notify()

  const unsubscribe = api.onFFmpegJobUpdated((snap) => {
    if (terminal.includes(snap.phase)) {
      unsubscribe()
      state = {
        phase: snap.phase as JobDisplayPhase,
        snapshot: snap,
        error: snap.errorSummary,
      }
    } else {
      state = { phase: 'running', snapshot: snap, error: null }
    }
    notify()
  })
}
