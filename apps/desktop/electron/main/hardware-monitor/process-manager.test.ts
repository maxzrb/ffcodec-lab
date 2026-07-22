import { describe, expect, it } from 'vitest'
import { hardwareMonitorRestartDelay } from './process-manager'

describe('性能监控 helper 重启退避', () => {
  it('前三次按 1、2、4 秒指数退避并限制最大等待', () => {
    expect([1, 2, 3].map(hardwareMonitorRestartDelay)).toEqual([1_000, 2_000, 4_000])
    expect(hardwareMonitorRestartDelay(10)).toBe(8_000)
  })
})
