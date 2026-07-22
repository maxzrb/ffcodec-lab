import { spawn } from 'child_process'
import { join } from 'path'
import { createInterface } from 'readline'
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
})
