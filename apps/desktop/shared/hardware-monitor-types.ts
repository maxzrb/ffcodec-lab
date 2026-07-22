export type HardwareMonitorStatus = 'idle' | 'starting' | 'running' | 'limited' | 'unavailable'

export interface MonitorDiagnostic {
  level: 'info' | 'warning' | 'error'
  code: string
  message: string
}

export interface CoreSnapshot {
  id: string
  name: string
  load: number | null
  clockMhz: number | null
}

export interface CpuSnapshot {
  id: string
  name: string
  load: number | null
  temperatureC: number | null
  powerW: number | null
  clockMhz: number | null
  cores: CoreSnapshot[]
}

export interface GpuSnapshot {
  id: string
  name: string
  kind: string
  load: number | null
  memoryLoad: number | null
  memoryUsedGb: number | null
  memoryTotalGb: number | null
  temperatureC: number | null
  powerW: number | null
  coreClockMhz: number | null
  memoryClockMhz: number | null
  fanRpm: number | null
}

export interface MemorySnapshot {
  id: string
  name: string
  load: number | null
  usedGb: number | null
  availableGb: number | null
  totalGb: number | null
}

export interface StorageSnapshot {
  id: string
  name: string
  spaceLoad: number | null
  readLoad: number | null
  writeLoad: number | null
  readRateMb: number | null
  writeRateMb: number | null
  temperatureC: number | null
}

export interface HardwareSnapshot {
  sequence: number
  sampledAt: number
  intervalMs: number
  cpu: CpuSnapshot[]
  gpu: GpuSnapshot[]
  memory: MemorySnapshot | null
  storage: StorageSnapshot[]
  diagnostics: MonitorDiagnostic[]
}

export interface HardwareMonitorState {
  status: HardwareMonitorStatus
  message: string | null
  intervalMs: number
  elevated: boolean
}

export interface HardwareMonitorStartResult {
  ok: boolean
  state: HardwareMonitorState
  error?: string
}
