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
): Promise<JobStartResult> {
  const api = window.electronAPI
  if (!api) {
    const result: JobStartResult = { ok: false, error: 'electronAPI not available' }
    state = { phase: 'idle', snapshot: null, error: result.error }
    notify()
    return result
  }

  // Transition to preparing
  state = { phase: 'preparing', snapshot: null, error: null }
  notify()

  // Start the job
  let result: JobStartResult
  try {
    result = await api.startFFmpegJob(request)
  } catch (error) {
    result = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }

  if (!result.ok) {
    state = { phase: 'idle', snapshot: null, error: result.error }
    notify()
    return result
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

  return result
}

/** 将主进程返回的常见启动错误转换为当前界面语言。 */
export function localizeJobError(error: string, isZh: boolean): string {
  if (!isZh) return error

  return error.split('\n').map((line) => {
    const inputMatch = line.match(/^Input file not found or not readable:\s*(.+)$/)
    if (inputMatch) return `找不到或无法读取输入文件：${inputMatch[1]}`

    const outputMatch = line.match(/^Output file already exists and overwrite is disabled:\s*(.+?)(?:\. Enable overwrite or choose a different output path\.)?$/)
    if (outputMatch) return `输出文件已存在且禁止覆盖：${outputMatch[1]}`

    const collisionMatch = line.match(/^Input and output are the same file:\s*(.+)$/)
    if (collisionMatch) return `输入与输出不能是同一个文件：${collisionMatch[1]}`

    const directoryMatch = line.match(/^Cannot create output directory\s+(.+?):\s*(.+)$/)
    if (directoryMatch) return `无法创建输出目录 ${directoryMatch[1]}：${directoryMatch[2]}`

    if (line === 'Another encoding job is already running. Cancel it before starting a new one.') {
      return '已有编码任务正在运行，请先取消当前任务。'
    }
    if (line.startsWith('FFmpeg not found.')) return '未找到 FFmpeg，请先安装或在设置中指定可执行文件路径。'
    if (line.startsWith('Custom FFmpeg path is not valid:')) {
      return `设置的 FFmpeg 路径无效：${line.slice('Custom FFmpeg path is not valid:'.length).trim()}`
    }
    return line
  }).join('\n')
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
