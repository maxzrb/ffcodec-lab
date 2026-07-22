import { describe, expect, it } from 'vitest'
import { MAX_MONITOR_MESSAGE_BYTES, parseHelperMessage } from './protocol'

const snapshot = {
  sequence: 1,
  sampledAt: 123,
  intervalMs: 1_000,
  cpu: [{ id: '/cpu/0', name: 'CPU', load: 25, temperatureC: null, powerW: 10, clockMhz: 4_000, cores: [] }],
  gpu: [],
  memory: null,
  storage: [],
  diagnostics: [],
}

describe('LibreHardwareMonitor JSON Lines 协议', () => {
  it('接受并净化合法快照', () => {
    const message = parseHelperMessage(JSON.stringify({ type: 'snapshot', protocolVersion: 1, snapshot }))
    expect(message?.type).toBe('snapshot')
    expect(message?.snapshot?.cpu[0]?.load).toBe(25)
  })

  it('拒绝未知消息、错误协议和无效数值', () => {
    expect(parseHelperMessage('{"type":"unknown"}')).toBeNull()
    expect(parseHelperMessage(JSON.stringify({ type: 'ready', protocolVersion: 2 }))).toBeNull()
    expect(parseHelperMessage(JSON.stringify({ type: 'snapshot', snapshot: { ...snapshot, sequence: 1.5 } }))).toBeNull()
  })

  it('拒绝超过上限的单行消息', () => {
    expect(parseHelperMessage('x'.repeat(MAX_MONITOR_MESSAGE_BYTES + 1))).toBeNull()
  })

  it('限制设备数量并截断诊断内容', () => {
    const oversized = {
      ...snapshot,
      gpu: Array.from({ length: 20 }, (_, index) => ({
        id: `/gpu/${index}`, name: 'GPU', kind: 'GpuAmd', load: 1, memoryLoad: null,
        memoryUsedGb: null, memoryTotalGb: null, temperatureC: null, powerW: null,
        coreClockMhz: null, memoryClockMhz: null, fanRpm: null,
      })),
      diagnostics: [{ level: 'warning', code: 'x', message: 'a'.repeat(2_000) }],
    }
    const message = parseHelperMessage(JSON.stringify({ type: 'snapshot', snapshot: oversized }))
    expect(message?.snapshot?.gpu).toHaveLength(16)
    expect(message?.snapshot?.diagnostics[0]?.message).toHaveLength(1_024)
  })
})
