import type { HardwareSnapshot } from '../../../shared/hardware-monitor-types'

export const MAX_MONITOR_MESSAGE_BYTES = 1024 * 1024

interface HelperMessage {
  type: 'ready' | 'snapshot' | 'state' | 'error' | 'pong'
  protocolVersion?: number
  message?: string | null
  intervalMs?: number | null
  snapshot?: HardwareSnapshot | null
}

function finiteOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function sanitizeSnapshot(value: unknown): HardwareSnapshot | null {
  if (!value || typeof value !== 'object') return null
  const source = value as HardwareSnapshot
  if (!Number.isSafeInteger(source.sequence) || !Number.isFinite(source.sampledAt)) return null

  return {
    sequence: source.sequence,
    sampledAt: source.sampledAt,
    intervalMs: Math.max(500, Math.min(10_000, finiteOrNull(source.intervalMs) ?? 1_000)),
    cpu: Array.isArray(source.cpu) ? source.cpu.slice(0, 8).map((cpu) => ({
      id: String(cpu.id).slice(0, 256),
      name: String(cpu.name).slice(0, 256),
      load: finiteOrNull(cpu.load), temperatureC: finiteOrNull(cpu.temperatureC),
      powerW: finiteOrNull(cpu.powerW), clockMhz: finiteOrNull(cpu.clockMhz),
      cores: Array.isArray(cpu.cores) ? cpu.cores.slice(0, 256).map((core) => ({
        id: String(core.id).slice(0, 256), name: String(core.name).slice(0, 256),
        load: finiteOrNull(core.load), clockMhz: finiteOrNull(core.clockMhz),
      })) : [],
    })) : [],
    gpu: Array.isArray(source.gpu) ? source.gpu.slice(0, 16).map((gpu) => ({
      id: String(gpu.id).slice(0, 256), name: String(gpu.name).slice(0, 256), kind: String(gpu.kind).slice(0, 64),
      load: finiteOrNull(gpu.load), memoryLoad: finiteOrNull(gpu.memoryLoad),
      memoryUsedGb: finiteOrNull(gpu.memoryUsedGb), memoryTotalGb: finiteOrNull(gpu.memoryTotalGb),
      temperatureC: finiteOrNull(gpu.temperatureC), powerW: finiteOrNull(gpu.powerW),
      coreClockMhz: finiteOrNull(gpu.coreClockMhz), memoryClockMhz: finiteOrNull(gpu.memoryClockMhz),
      fanRpm: finiteOrNull(gpu.fanRpm),
    })) : [],
    memory: source.memory ? ({
      id: String(source.memory.id).slice(0, 256), name: String(source.memory.name).slice(0, 256),
      load: finiteOrNull(source.memory.load), usedGb: finiteOrNull(source.memory.usedGb),
      availableGb: finiteOrNull(source.memory.availableGb), totalGb: finiteOrNull(source.memory.totalGb),
    }) : null,
    storage: Array.isArray(source.storage) ? source.storage.slice(0, 64).map((storage) => ({
      id: String(storage.id).slice(0, 256), name: String(storage.name).slice(0, 256),
      spaceLoad: finiteOrNull(storage.spaceLoad), readLoad: finiteOrNull(storage.readLoad),
      writeLoad: finiteOrNull(storage.writeLoad), readRateMb: finiteOrNull(storage.readRateMb),
      writeRateMb: finiteOrNull(storage.writeRateMb), temperatureC: finiteOrNull(storage.temperatureC),
    })) : [],
    diagnostics: Array.isArray(source.diagnostics) ? source.diagnostics.slice(0, 64).map((diagnostic) => ({
      level: diagnostic.level === 'error' || diagnostic.level === 'warning' ? diagnostic.level : 'info',
      code: String(diagnostic.code).slice(0, 128),
      message: String(diagnostic.message).slice(0, 1_024),
    })) : [],
  }
}

export function parseHelperMessage(line: string): HelperMessage | null {
  if (Buffer.byteLength(line, 'utf8') > MAX_MONITOR_MESSAGE_BYTES) return null
  try {
    const value = JSON.parse(line) as Record<string, unknown>
    if (!['ready', 'snapshot', 'state', 'error', 'pong'].includes(String(value.type))) return null
    if (value.protocolVersion != null && value.protocolVersion !== 1) return null
    const message: HelperMessage = { type: value.type as HelperMessage['type'] }
    if (typeof value.message === 'string') message.message = value.message.slice(0, 1_024)
    if (typeof value.intervalMs === 'number' && Number.isFinite(value.intervalMs)) message.intervalMs = value.intervalMs
    if (message.type === 'snapshot') {
      message.snapshot = sanitizeSnapshot(value.snapshot)
      if (!message.snapshot) return null
    }
    return message
  } catch {
    return null
  }
}
