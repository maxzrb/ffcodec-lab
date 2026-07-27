// ============================================================
// Desktop 批处理队列状态。每项存储完整配置快照，避免随后编辑工作台
// 时悄悄改变已经排队的任务。
// ============================================================

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'

export type BatchQueueItemStatus = 'ready' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface BatchQueueItem {
  id: string
  createdAt: number
  inputPath: string
  outputPath: string
  config: ProjectConfig
  status: BatchQueueItemStatus
  error?: string
}

interface BatchQueueState {
  items: BatchQueueItem[]
  selectedItemId: string | null
  queueEnabled: boolean
  singleOutputToSourceDirectory: boolean
  batchOutputToSourceDirectory: boolean
  batchOutputDirectory: string
  running: boolean
  addConfigs: (configs: ProjectConfig[]) => string[]
  removeItem: (id: string) => void
  updateItemOutput: (id: string, outputPath: string) => void
  setSelectedItem: (id: string | null) => void
  setItemStatus: (id: string, status: BatchQueueItemStatus, error?: string) => void
  retryItem: (id: string) => void
  clearFinished: () => void
  clearAll: () => void
  setQueueEnabled: (enabled: boolean) => void
  setSingleOutputToSourceDirectory: (enabled: boolean) => void
  setBatchOutputToSourceDirectory: (enabled: boolean) => void
  setBatchOutputDirectory: (directory: string) => void
  setRunning: (running: boolean) => void
}

const STORAGE_KEY = 'ffcodec-desktop-batch-queue-v1'

function createItemId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `batch-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Desktop 保存到 localStorage，同时镜像到现有 INI 存储。 */
const queueStorage = createJSONStorage<BatchQueueState>(() => ({
  getItem: (name) => {
    try {
      return localStorage.getItem(name) ?? window.electronAPI?.storageGetItem(name) ?? null
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
      void window.electronAPI?.storageSetItem(name, value)
    } catch {
      // 本地持久化失败不影响当前会话中的队列。
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
      void window.electronAPI?.storageRemoveItem(name)
    } catch {
      // 同上。
    }
  },
}))

export const useBatchQueueStore = create<BatchQueueState>()(persist((set, get) => ({
  items: [],
  selectedItemId: null,
  queueEnabled: false,
  singleOutputToSourceDirectory: true,
  batchOutputToSourceDirectory: true,
  batchOutputDirectory: '',
  running: false,

  addConfigs: (configs) => {
    const existingInputs = new Set(get().items.map((item) => item.inputPath.toLocaleLowerCase()))
    const created: BatchQueueItem[] = []

    for (const config of configs) {
      const inputPath = config.input.path.trim()
      if (!inputPath || existingInputs.has(inputPath.toLocaleLowerCase())) continue
      existingInputs.add(inputPath.toLocaleLowerCase())
      created.push({
        id: createItemId(),
        createdAt: Date.now(),
        inputPath,
        outputPath: config.output.path,
        config: structuredClone(config),
        status: 'ready',
      })
    }

    if (created.length === 0) return []
    set((state) => ({
      items: [...state.items, ...created],
      selectedItemId: created.at(-1)?.id ?? state.selectedItemId,
    }))
    return created.map((item) => item.id)
  },

  removeItem: (id) => set((state) => {
    const item = state.items.find((candidate) => candidate.id === id)
    if (!item || item.status === 'running') return state
    const items = state.items.filter((candidate) => candidate.id !== id)
    return {
      items,
      selectedItemId: state.selectedItemId === id ? (items[0]?.id ?? null) : state.selectedItemId,
    }
  }),

  updateItemOutput: (id, outputPath) => set((state) => ({
    items: state.items.map((item) => item.id === id && item.status !== 'running'
      ? {
          ...item,
          outputPath,
          config: { ...item.config, output: { ...item.config.output, path: outputPath } },
        }
      : item),
  })),

  setSelectedItem: (selectedItemId) => set({ selectedItemId }),

  setItemStatus: (id, status, error) => set((state) => ({
    items: state.items.map((item) => item.id === id
      ? { ...item, status, error: error || undefined }
      : item),
  })),

  retryItem: (id) => set((state) => ({
    items: state.items.map((item) => item.id === id && (item.status === 'failed' || item.status === 'cancelled')
      ? { ...item, status: 'ready', error: undefined }
      : item),
  })),

  clearFinished: () => set((state) => {
    if (state.running) return state
    const items = state.items.filter((item) => item.status === 'ready' || item.status === 'failed' || item.status === 'cancelled')
    return {
      items,
      selectedItemId: items.some((item) => item.id === state.selectedItemId) ? state.selectedItemId : (items[0]?.id ?? null),
    }
  }),

  clearAll: () => set((state) => state.running ? state : ({
    items: [],
    selectedItemId: null,
    queueEnabled: false,
  })),

  setQueueEnabled: (queueEnabled) => set({ queueEnabled }),
  setSingleOutputToSourceDirectory: (singleOutputToSourceDirectory) => set({ singleOutputToSourceDirectory }),
  setBatchOutputToSourceDirectory: (batchOutputToSourceDirectory) => set({ batchOutputToSourceDirectory }),
  setBatchOutputDirectory: (batchOutputDirectory) => set({ batchOutputDirectory }),
  setRunning: (running) => set({ running }),
}), {
  name: STORAGE_KEY,
  storage: queueStorage,
  partialize: (state) => ({
    items: state.items,
    selectedItemId: state.selectedItemId,
    queueEnabled: state.queueEnabled,
    singleOutputToSourceDirectory: state.singleOutputToSourceDirectory,
    batchOutputToSourceDirectory: state.batchOutputToSourceDirectory,
    batchOutputDirectory: state.batchOutputDirectory,
  }) as BatchQueueState,
  merge: (persisted, current) => ({
    ...current,
    ...(persisted as Partial<BatchQueueState>),
    running: false,
    items: (persisted as Partial<BatchQueueState>)?.items?.map((item) => item.status === 'running'
      ? { ...item, status: 'ready' as const, error: undefined }
      : item) ?? [],
  }),
}))

/** 队列模式下当前选中任务的冻结配置，用于共享命令面板的只读预览。 */
export function getSelectedBatchQueueConfig(): ProjectConfig | null {
  const { items, selectedItemId, queueEnabled } = useBatchQueueStore.getState()
  if (!queueEnabled) return null
  return items.find((item) => item.id === selectedItemId)?.config ?? null
}

/** 仅在命令预览的实际配置变化时通知，避免进度更新抢占用户当前检查器。 */
export function onSelectedBatchQueueConfigChange(listener: () => void): () => void {
  return useBatchQueueStore.subscribe((state, previousState) => {
    const selectedConfig = state.queueEnabled
      ? state.items.find((item) => item.id === state.selectedItemId)?.config ?? null
      : null
    const previousConfig = previousState.queueEnabled
      ? previousState.items.find((item) => item.id === previousState.selectedItemId)?.config ?? null
      : null
    if (selectedConfig !== previousConfig) listener()
  })
}
