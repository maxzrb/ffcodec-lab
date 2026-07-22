import { app, BrowserWindow } from 'electron'
import { spawn, type ChildProcess, type ChildProcessWithoutNullStreams } from 'child_process'
import { createHash, randomBytes } from 'crypto'
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import { createServer, type Server, type Socket } from 'net'
import { join } from 'path'
import { createInterface } from 'readline'
import type { HardwareMonitorStartResult, HardwareMonitorState, HardwareSnapshot, PawnIoInstallResult } from '../../../shared/hardware-monitor-types'
import { MAX_MONITOR_MESSAGE_BYTES, parseHelperMessage } from './protocol'

const DEFAULT_INTERVAL_MS = 1_000
const PAWN_IO_SHA256 = '1f519a22e47187f70a1379a48ca604981c4fcf694f4e65b734aaa74a9fba3032'
const initialState: HardwareMonitorState = { status: 'idle', message: null, intervalMs: DEFAULT_INTERVAL_MS, elevated: false }

interface HelperTransport {
  elevatedRequested: boolean
  write: (command: object) => void
  close: () => Promise<void>
}

let transport: HelperTransport | null = null
let latestSnapshot: HardwareSnapshot | null = null
let state: HardwareMonitorState = initialState
let startPromise: Promise<HardwareMonitorStartResult> | null = null
let desiredRunning = false
let desiredIntervalMs = DEFAULT_INTERVAL_MS
let restartAttempts = 0
let restartTimer: ReturnType<typeof setTimeout> | null = null
let stableTimer: ReturnType<typeof setTimeout> | null = null
let pawnIoInstallPromise: Promise<PawnIoInstallResult> | null = null

export function hardwareMonitorRestartDelay(attempt: number): number {
  return Math.min(8_000, 1_000 * 2 ** Math.max(0, attempt - 1))
}

function helperPath(): string {
  return app.isPackaged
    ? join(process.resourcesPath, 'hardware-monitor', 'FFCodec.HardwareMonitor.exe')
    : join(app.getAppPath(), 'native', 'FFCodec.HardwareMonitor', 'bin', 'Release', 'net8.0', 'FFCodec.HardwareMonitor.exe')
}

function pawnIoInstallerPath(): string {
  return app.isPackaged
    ? join(process.resourcesPath, 'hardware-monitor', 'pawnio', 'PawnIO_setup.exe')
    : join(app.getAppPath(), 'native', 'third-party', 'PawnIO', 'PawnIO_setup.exe')
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
  desiredRunning = true
  desiredIntervalMs = Math.max(500, Math.min(10_000, Math.round(intervalMs)))
  if (restartTimer) {
    clearTimeout(restartTimer)
    restartTimer = null
  }
  if (transport) {
    setHardwareMonitorInterval(desiredIntervalMs)
    return { ok: true, state: getHardwareMonitorState() }
  }
  if (startPromise) return startPromise

  startPromise = startMonitor(intervalMs).finally(() => {
    startPromise = null
  })
  return startPromise
}

async function startMonitor(intervalMs: number): Promise<HardwareMonitorStartResult> {
  const executable = helperPath()
  if (!existsSync(executable)) {
    const error = `性能监控辅助程序不存在：${executable}`
    updateState({ status: 'unavailable', message: error, intervalMs, elevated: false })
    return { ok: false, state: getHardwareMonitorState(), error }
  }

  updateState({ status: 'starting', message: null, intervalMs, elevated: false })
  let resolveReady: ((value: HardwareMonitorStartResult) => void) | null = null
  const ready = new Promise<HardwareMonitorStartResult>((resolve) => { resolveReady = resolve })
  let closed = false
  const onLine = (line: string) => {
    if (Buffer.byteLength(line, 'utf8') > MAX_MONITOR_MESSAGE_BYTES) {
      void stopHardwareMonitor()
      return
    }
    const message = parseHelperMessage(line)
    if (!message) return
    if (message.type === 'ready') {
      const elevated = message.elevated === true
      transport?.write({ type: 'start', intervalMs })
      updateState({ status: 'running', message: null, intervalMs, elevated })
      resolveReady?.({ ok: true, state: getHardwareMonitorState() })
      resolveReady = null
      if (stableTimer) clearTimeout(stableTimer)
      stableTimer = setTimeout(() => { restartAttempts = 0 }, 30_000)
    } else if (message.type === 'snapshot' && message.snapshot) {
      latestSnapshot = message.snapshot
      const limited = message.snapshot.diagnostics.some((item) => item.level === 'warning' || item.level === 'error')
      updateState({
        status: limited ? 'limited' : 'running',
        message: limited ? message.snapshot.diagnostics[0]?.message ?? null : null,
        intervalMs: message.snapshot.intervalMs,
        elevated: state.elevated,
      })
      broadcast('hardware-monitor:snapshot', latestSnapshot)
    } else if (message.type === 'error') {
      updateState({ status: 'limited', message: message.message ?? '辅助程序报告错误。', intervalMs, elevated: state.elevated })
    }
  }
  const onClosed = (reason: string | null) => {
    if (closed) return
    closed = true
    transport = null
    if (stableTimer) {
      clearTimeout(stableTimer)
      stableTimer = null
    }
    if (state.status !== 'idle') {
      updateState({ status: 'unavailable', message: reason ?? '性能监控辅助程序已退出。', intervalMs, elevated: false })
    }
    if (resolveReady) {
      const error = reason ?? '性能监控辅助程序启动失败。'
      resolveReady({ ok: false, state: getHardwareMonitorState(), error })
      resolveReady = null
    }
    scheduleRestart()
  }

  try {
    // 首次打开自动请求仅 helper 提权；取消 UAC 时自动退回普通权限采集。
    transport = process.platform === 'win32' && process.env.FFCODEC_MONITOR_STANDARD !== '1'
      ? await createElevatedTransport(executable, onLine, onClosed)
      : createStandardTransport(executable, onLine, onClosed)
  } catch {
    transport = createStandardTransport(executable, onLine, onClosed)
  }

  const timeout = setTimeout(() => {
    if (!resolveReady) return
    const error = '性能监控辅助程序启动超时。'
    updateState({ status: 'unavailable', message: error, intervalMs, elevated: false })
    resolveReady({ ok: false, state: getHardwareMonitorState(), error })
    resolveReady = null
    void transport?.close()
    transport = null
  }, 45_000)
  const result = await ready
  clearTimeout(timeout)
  return result
}

function scheduleRestart(): void {
  if (!desiredRunning || restartTimer || restartAttempts >= 3) return
  restartAttempts += 1
  const delay = hardwareMonitorRestartDelay(restartAttempts)
  updateState({
    status: 'unavailable',
    message: `性能监控辅助程序已退出，将在 ${delay / 1_000} 秒后重试（${restartAttempts}/3）。`,
    intervalMs: desiredIntervalMs,
    elevated: false,
  })
  restartTimer = setTimeout(() => {
    restartTimer = null
    void startHardwareMonitor(desiredIntervalMs)
  }, delay)
}

function createStandardTransport(executable: string, onLine: (line: string) => void, onClosed: (reason: string | null) => void): HelperTransport {
  const child = spawn(executable, [], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'], shell: false })
  let stderr = ''
  const lines = createInterface({ input: child.stdout, crlfDelay: Infinity })
  lines.on('line', onLine)
  child.stderr.on('data', (chunk: Buffer) => { stderr = `${stderr}${chunk.toString('utf8')}`.slice(-4_096) })
  child.once('error', (error) => onClosed(error.message))
  child.once('exit', (code) => onClosed(stderr.trim() || (code === 0 ? null : `性能监控辅助程序已退出（${code ?? 'unknown'}）。`)))
  return childTransport(child, false)
}

async function createElevatedTransport(executable: string, onLine: (line: string) => void, onClosed: (reason: string | null) => void): Promise<HelperTransport> {
  const pipeName = `ffcodec-hardware-${process.pid}-${randomBytes(16).toString('hex')}`
  const pipePath = `\\\\.\\pipe\\${pipeName}`
  let server: Server | null = createServer()
  let elevationProcess: ChildProcess | null = null

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      server?.close()
      elevationProcess?.kill()
      reject(new Error('管理员 helper 连接超时。'))
    }, 40_000)

    server?.once('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })
    server?.once('connection', (socket: Socket) => {
      clearTimeout(timeout)
      server?.close()
      server = null
      socket.setEncoding('utf8')
      let buffer = ''
      socket.on('data', (chunk: string) => {
        buffer += chunk
        let newline = buffer.indexOf('\n')
        while (newline >= 0) {
          const line = buffer.slice(0, newline).replace(/\r$/, '')
          // 等待传输对象完成赋值，避免 helper 的 ready 消息早于调用方持有写入端。
          queueMicrotask(() => onLine(line))
          buffer = buffer.slice(newline + 1)
          newline = buffer.indexOf('\n')
        }
      })
      socket.once('error', (error) => onClosed(error.message))
      socket.once('close', () => onClosed(null))
      resolve({
        elevatedRequested: true,
        write: (command) => socket.write(`${JSON.stringify(command)}\n`),
        close: async () => {
          if (!socket.destroyed) socket.write(`${JSON.stringify({ type: 'stop' })}\n`)
          await Promise.race([
            new Promise<void>((done) => socket.once('close', () => done())),
            new Promise<void>((done) => setTimeout(() => { socket.destroy(); elevationProcess?.kill(); done() }, 2_000)),
          ])
        },
      })
    })
    server?.listen(pipePath, () => {
      const escapedExecutable = executable.replace(/'/g, "''")
      const script = `$p = Start-Process -FilePath '${escapedExecutable}' -ArgumentList '--pipe','${pipeName}' -Verb RunAs -WindowStyle Hidden -PassThru; $p.WaitForExit(); exit $p.ExitCode`
      elevationProcess = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
        windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], shell: false,
      })
      elevationProcess.once('error', reject)
      elevationProcess.once('exit', () => {
        if (server) {
          clearTimeout(timeout)
          server.close()
          server = null
          reject(new Error('用户取消或系统拒绝了管理员权限。'))
        }
      })
    })
  })
}

function childTransport(child: ChildProcessWithoutNullStreams, elevatedRequested: boolean): HelperTransport {
  return {
    elevatedRequested,
    write: (command) => child.stdin.write(`${JSON.stringify(command)}\n`),
    close: async () => {
      if (child.killed) return
      child.stdin.write(`${JSON.stringify({ type: 'stop' })}\n`)
      await Promise.race([
        new Promise<void>((resolve) => child.once('exit', () => resolve())),
        new Promise<void>((resolve) => setTimeout(() => { child.kill(); resolve() }, 2_000)),
      ])
    },
  }
}

export function setHardwareMonitorInterval(intervalMs: number): HardwareMonitorState {
  const safeInterval = Math.max(500, Math.min(10_000, Math.round(intervalMs)))
  state = { ...state, intervalMs: safeInterval }
  transport?.write({ type: 'set-interval', intervalMs: safeInterval })
  return getHardwareMonitorState()
}

export async function stopHardwareMonitor(): Promise<void> {
  desiredRunning = false
  restartAttempts = 0
  if (restartTimer) clearTimeout(restartTimer)
  if (stableTimer) clearTimeout(stableTimer)
  restartTimer = null
  stableTimer = null
  const current = transport
  transport = null
  latestSnapshot = null
  updateState(initialState)
  await current?.close()
}

export function installPawnIo(): Promise<PawnIoInstallResult> {
  if (pawnIoInstallPromise) return pawnIoInstallPromise
  pawnIoInstallPromise = installPawnIoInternal().finally(() => { pawnIoInstallPromise = null })
  return pawnIoInstallPromise
}

async function installPawnIoInternal(): Promise<PawnIoInstallResult> {
  if (process.platform !== 'win32') return { ok: false, error: 'PawnIO 仅支持 Windows。' }
  const installer = pawnIoInstallerPath()
  if (!existsSync(installer)) return { ok: false, error: 'PawnIO 官方安装器不存在。' }
  const digest = createHash('sha256').update(await readFile(installer)).digest('hex')
  if (digest !== PAWN_IO_SHA256) return { ok: false, error: 'PawnIO 安装器完整性校验失败。' }

  await stopHardwareMonitor()
  updateState({ status: 'starting', message: '正在安装 PawnIO 硬件访问驱动…', intervalMs: desiredIntervalMs, elevated: false })
  const escapedInstaller = installer.replace(/'/g, "''")
  const script = `$p = Start-Process -FilePath '${escapedInstaller}' -ArgumentList '-install','-silent' -Verb RunAs -WindowStyle Hidden -PassThru -Wait; exit $p.ExitCode`
  const result = await new Promise<PawnIoInstallResult>((resolve) => {
    const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
      windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'], shell: false,
    })
    let stderr = ''
    child.stderr?.on('data', (chunk: Buffer) => { stderr = `${stderr}${chunk.toString('utf8')}`.slice(-2_048) })
    child.once('error', (error) => resolve({ ok: false, error: error.message }))
    child.once('exit', (code) => resolve(code === 0
      ? { ok: true }
      : { ok: false, error: stderr.trim() || 'PawnIO 安装被取消或安装失败。' }))
  })
  if (!result.ok) {
    updateState({ status: 'limited', message: result.error ?? 'PawnIO 安装失败。', intervalMs: desiredIntervalMs, elevated: false })
    return result
  }

  await new Promise((resolve) => setTimeout(resolve, 500))
  const restarted = await startHardwareMonitor(desiredIntervalMs)
  return restarted.ok ? result : { ok: false, error: restarted.error ?? 'PawnIO 已安装，但监控 helper 重启失败。' }
}

export function requestHardwareSnapshot(): void {
  transport?.write({ type: 'snapshot' })
}
