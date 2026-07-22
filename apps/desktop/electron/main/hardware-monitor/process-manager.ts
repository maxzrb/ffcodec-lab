import { app, BrowserWindow } from 'electron'
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process'
import { join } from 'path'
import { existsSync } from 'fs'
import { createInterface } from 'readline'
import type { HardwareMonitorStartResult, HardwareMonitorState, HardwareSnapshot } from '../../../shared/hardware-monitor-types'
import { MAX_MONITOR_MESSAGE_BYTES, parseHelperMessage } from './protocol'

const DEFAULT_INTERVAL_MS = 1_000
let child: ChildProcessWithoutNullStreams | null = null
let latestSnapshot: HardwareSnapshot | null = null
let state: HardwareMonitorState = { status: 'idle', message: null, intervalMs: DEFAULT_INTERVAL_MS }
let startPromise: Promise<HardwareMonitorStartResult> | null = null

function helperPath(): string {
  return app.isPackaged
    ? join(process.resourcesPath, 'hardware-monitor', 'FFCodec.HardwareMonitor.exe')
    : join(app.getAppPath(), 'native', 'FFCodec.HardwareMonitor', 'bin', 'Release', 'net8.0', 'FFCodec.HardwareMonitor.exe')
}

function broadcast(channel: string, payload: unknown): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send(channel, payload)
  }
}

function updateState(next: HardwareMonitorState): void {
  state = next
  broadcast('hardware-monitor:state', state)
}

export function getHardwareMonitorState(): HardwareMonitorState {
  return { ...state }
}

export function getLatestHardwareSnapshot(): HardwareSnapshot | null {
  return latestSnapshot
}

export async function startHardwareMonitor(intervalMs = DEFAULT_INTERVAL_MS): Promise<HardwareMonitorStartResult> {
  if (child) {
    setHardwareMonitorInterval(intervalMs)
    return { ok: true, state: getHardwareMonitorState() }
  }
  if (startPromise) return startPromise

  startPromise = new Promise((resolve) => {
    const executable = helperPath()
    if (!existsSync(executable)) {
      const error = `性能监控辅助程序不存在：${executable}`
      updateState({ status: 'unavailable', message: error, intervalMs })
      resolve({ ok: false, state: getHardwareMonitorState(), error })
      startPromise = null
      return
    }

    updateState({ status: 'starting', message: null, intervalMs })
    const process = spawn(executable, [], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'], shell: false })
    child = process
    let settled = false
    let stderr = ''
    const readyTimeout = setTimeout(() => {
      if (settled) return
      settled = true
      const error = '性能监控辅助程序启动超时。'
      updateState({ status: 'unavailable', message: error, intervalMs })
      process.kill()
      resolve({ ok: false, state: getHardwareMonitorState(), error })
    }, 10_000)

    const lines = createInterface({ input: process.stdout, crlfDelay: Infinity })
    lines.on('line', (line) => {
      if (Buffer.byteLength(line, 'utf8') > MAX_MONITOR_MESSAGE_BYTES) {
        process.kill()
        return
      }
      const message = parseHelperMessage(line)
      if (!message) return
      if (message.type === 'ready') {
        process.stdin.write(`${JSON.stringify({ type: 'start', intervalMs })}\n`)
        updateState({ status: 'running', message: null, intervalMs })
        if (!settled) {
          settled = true
          clearTimeout(readyTimeout)
          resolve({ ok: true, state: getHardwareMonitorState() })
        }
      } else if (message.type === 'snapshot' && message.snapshot) {
        latestSnapshot = message.snapshot
        const limited = message.snapshot.diagnostics.some((item) => item.level === 'warning' || item.level === 'error')
        updateState({ status: limited ? 'limited' : 'running', message: limited ? message.snapshot.diagnostics[0]?.message ?? null : null, intervalMs: message.snapshot.intervalMs })
        broadcast('hardware-monitor:snapshot', latestSnapshot)
      } else if (message.type === 'error') {
        updateState({ status: 'limited', message: message.message ?? '辅助程序报告错误。', intervalMs })
      }
    })

    process.stderr.on('data', (chunk: Buffer) => {
      stderr = `${stderr}${chunk.toString('utf8')}`.slice(-4_096)
    })
    process.on('error', (error) => {
      updateState({ status: 'unavailable', message: error.message, intervalMs })
      if (!settled) {
        settled = true
        clearTimeout(readyTimeout)
        resolve({ ok: false, state: getHardwareMonitorState(), error: error.message })
      }
    })
    process.on('exit', (code) => {
      clearTimeout(readyTimeout)
      child = null
      startPromise = null
      if (state.status !== 'idle') {
        updateState({ status: 'unavailable', message: stderr.trim() || `性能监控辅助程序已退出（${code ?? 'unknown'}）。`, intervalMs })
      }
      if (!settled) {
        settled = true
        const error = state.message ?? '性能监控辅助程序启动失败。'
        resolve({ ok: false, state: getHardwareMonitorState(), error })
      }
    })
  })
  return startPromise
}

export function setHardwareMonitorInterval(intervalMs: number): HardwareMonitorState {
  const safeInterval = Math.max(500, Math.min(10_000, Math.round(intervalMs)))
  state = { ...state, intervalMs: safeInterval }
  child?.stdin.write(`${JSON.stringify({ type: 'set-interval', intervalMs: safeInterval })}\n`)
  return getHardwareMonitorState()
}

export async function stopHardwareMonitor(): Promise<void> {
  const process = child
  child = null
  latestSnapshot = null
  updateState({ status: 'idle', message: null, intervalMs: DEFAULT_INTERVAL_MS })
  if (!process || process.killed) return
  process.stdin.write(`${JSON.stringify({ type: 'stop' })}\n`)
  await Promise.race([
    new Promise<void>((resolve) => process.once('exit', () => resolve())),
    new Promise<void>((resolve) => setTimeout(() => { process.kill(); resolve() }, 2_000)),
  ])
}

export function requestHardwareSnapshot(): void {
  child?.stdin.write(`${JSON.stringify({ type: 'snapshot' })}\n`)
}
