import { spawn } from 'child_process'
import { join } from 'path'
import { createInterface } from 'readline'
import { createServer } from 'net'
import { randomBytes } from 'crypto'
import { describe, expect, it } from 'vitest'
import { parseHelperMessage } from './protocol'

describe('LibreHardwareMonitor helper 集成', () => {
  it('启动、返回真实快照并按 stop 正常退出', async () => {
    const executable = join(process.cwd(), 'native', 'FFCodec.HardwareMonitor', 'bin', 'Release', 'net8.0', 'FFCodec.HardwareMonitor.exe')
    const child = spawn(executable, [], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'], shell: false })
    const lines = createInterface({ input: child.stdout, crlfDelay: Infinity })
    const messages: NonNullable<ReturnType<typeof parseHelperMessage>>[] = []

    const completed = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        child.kill()
        reject(new Error('helper 集成测试超时'))
      }, 20_000)
      child.once('error', reject)
      child.once('exit', (code) => {
        clearTimeout(timeout)
        if (code === 0) resolve()
        else reject(new Error(`helper 退出码：${code}`))
      })
      lines.on('line', (line) => {
        const message = parseHelperMessage(line)
        if (!message) return
        messages.push(message)
        if (message.type === 'ready') child.stdin.write('{"type":"snapshot"}\n')
        if (message.type === 'snapshot') child.stdin.write('{"type":"stop"}\n')
      })
    })

    await completed
    const snapshot = messages.find((message) => message.type === 'snapshot')?.snapshot
    expect(snapshot?.cpu.length).toBeGreaterThan(0)
    expect(snapshot?.memory).not.toBeNull()
    expect(messages.at(-1)?.message).toBe('stopped')
  }, 25_000)

  it('通过随机命名管道交换快照并退出', async () => {
    const executable = join(process.cwd(), 'native', 'FFCodec.HardwareMonitor', 'bin', 'Release', 'net8.0', 'FFCodec.HardwareMonitor.exe')
    const pipeName = `ffcodec-test-${process.pid}-${randomBytes(8).toString('hex')}`
    const pipePath = `\\\\.\\pipe\\${pipeName}`
    const server = createServer()
    const childExited = new Promise<void>((resolve, reject) => {
      server.listen(pipePath, () => {
        const child = spawn(executable, ['--pipe', pipeName], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], shell: false })
        child.once('error', reject)
        child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`管道 helper 退出码：${code}`)))
      })
    })
    const messages: NonNullable<ReturnType<typeof parseHelperMessage>>[] = []
    const exchange = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('命名管道测试超时')), 20_000)
      server.once('connection', (socket) => {
        const lines = createInterface({ input: socket, crlfDelay: Infinity })
        lines.on('line', (line) => {
          const message = parseHelperMessage(line)
          if (!message) return
          messages.push(message)
          if (message.type === 'ready') socket.write('{"type":"snapshot"}\n')
          if (message.type === 'snapshot') socket.write('{"type":"stop"}\n')
          if (message.type === 'state' && message.message === 'stopped') {
            clearTimeout(timeout)
            resolve()
          }
        })
      })
    })

    await exchange
    await childExited
    server.close()
    expect(messages[0]?.type).toBe('ready')
    expect(messages.some((message) => message.type === 'snapshot')).toBe(true)
  }, 25_000)
})
