// ============================================================
// 批处理队列调度器。主进程仍只执行一个 FFmpeg Job；这里在 renderer
// 按队列项串行提交，保留既有安全 spawn、取消、历史和日志语义。
// ============================================================

import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { buildExecutionPlans, type ExecutionPlan } from '@ffcodec/command-plan'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { repairOddExplicitResolution } from '@ffcodec/domain/config/resolution-repair'
import { normalizeConfig } from '@ffcodec/domain/normalization'
import {
  collectConfiguredVideoEncoderOptionGroups,
  collectRequiredVideoEncoders,
  validateConfig,
} from '@ffcodec/domain/validation'
import { RuleIndex } from '@ffcodec/catalog/rule-index'
import { collectRequiredVideoFilterNames } from '@ffcodec/domain/filters/video-filter-builder'
import { canRunExecutionPlans } from '../components/execution-plan-guards'
import { getJobDisplayState, startEncoding, subscribeToJob } from '../components/encoding-job'
import { useBatchQueueStore, type BatchQueueItem } from './batch-queue-store'

const catalog = loadCatalog()

interface PreparedQueueItem {
  plans: ExecutionPlan[]
  error?: string
}

async function prepareQueueItem(item: BatchQueueItem, customFfmpegPath?: string): Promise<PreparedQueueItem> {
  const normalized = normalizeConfig(item.config, item.config, catalog).config
  const diagnostics = validateConfig(normalized, catalog, new RuleIndex())
  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === 'error')
  if (errors.length > 0) {
    return { plans: [], error: errors.map((diagnostic) => diagnostic.message).join('\n') }
  }

  const requiredFilters = collectRequiredVideoFilterNames(normalized)
  const requiredEncoders = collectRequiredVideoEncoders(normalized, catalog)
  if (requiredFilters.length > 0 || requiredEncoders.length > 0) {
    const capabilities = await window.electronAPI?.getFFmpegCapabilities(customFfmpegPath)
    if (!capabilities) {
      return { plans: [], error: '无法检查当前 FFmpeg 的编码器与滤镜能力。' }
    }

    const availableEncoders = new Set(capabilities.encoders)
    const unavailableEncoders = requiredEncoders.filter(({ ffmpegName }) => !availableEncoders.has(ffmpegName))
    if (unavailableEncoders.length > 0) {
      return { plans: [], error: `当前 FFmpeg 不提供所需编码器：${unavailableEncoders.map(({ ffmpegName }) => ffmpegName).join(', ')}。` }
    }

    const availableFilters = new Set(capabilities.filters)
    const unavailableFilters = requiredFilters.filter((name) => !availableFilters.has(name))
    if (unavailableFilters.length > 0) {
      return { plans: [], error: `当前 FFmpeg 不提供所需滤镜：${unavailableFilters.join(', ')}。` }
    }

    for (const group of collectConfiguredVideoEncoderOptionGroups(normalized, catalog)) {
      if (group.requirements.length === 0) continue
      const encoderCapabilities = await window.electronAPI?.getFFmpegEncoderCapabilities(
        group.ffmpegName,
        customFfmpegPath,
      )
      if (!encoderCapabilities) {
        return { plans: [], error: `无法检查编码器 ${group.ffmpegName} 的私有选项。` }
      }
      const availableOptions = new Set(encoderCapabilities.options)
      const unavailableOptions = [...new Set(
        group.requirements.filter(({ option }) => !availableOptions.has(option)).map(({ option }) => option),
      )]
      if (unavailableOptions.length > 0) {
        return { plans: [], error: `编码器 ${group.ffmpegName} 不提供所需选项：${unavailableOptions.join(', ')}。` }
      }
    }
  }

  // 与单文件左键运行一致：仅修复兼容性 warning 中的显式奇数尺寸。
  const executableConfig = repairOddExplicitResolution(normalized)
  const commandPlan = buildCommandPlan(executableConfig, catalog, diagnostics)
  const plans = buildExecutionPlans(commandPlan)
  if (!canRunExecutionPlans(plans, false)) {
    return { plans: [], error: '任务缺少可读取的输入文件或最终输出文件。' }
  }
  return { plans }
}

function waitForJobCompletion(jobId: string): Promise<FFmpegJobSnapshot> {
  return new Promise((resolve) => {
    const terminal: FFmpegJobSnapshot['phase'][] = ['completed', 'failed', 'cancelled']
    const finishIfMatching = () => {
      const snapshot = getJobDisplayState().snapshot
      if (!snapshot || snapshot.jobId !== jobId || !terminal.includes(snapshot.phase)) return false
      resolve(snapshot)
      return true
    }

    if (finishIfMatching()) return
    const unsubscribe = subscribeToJob(() => {
      if (finishIfMatching()) unsubscribe()
    })
  })
}

/** 从首个 ready 项开始串行执行；失败或取消时暂停，待用户明确重试。 */
export async function runBatchQueue(customFfmpegPath?: string): Promise<{ ok: boolean; error?: string }> {
  const initial = useBatchQueueStore.getState()
  const activePhase = getJobDisplayState().phase
  if (!initial.queueEnabled) return { ok: false, error: '请先启用批处理队列。' }
  if (initial.running) return { ok: false, error: '批处理队列正在运行。' }
  if (activePhase === 'preparing' || activePhase === 'running' || activePhase === 'cancelling') {
    return { ok: false, error: '已有编码任务正在运行，请先等待或取消当前任务。' }
  }

  initial.setRunning(true)
  try {
    let item = useBatchQueueStore.getState().items.find((candidate) => candidate.status === 'ready')
    while (item) {
      const state = useBatchQueueStore.getState()

      const prepared = await prepareQueueItem(item, customFfmpegPath)
      if (prepared.error || prepared.plans.length === 0) {
        state.setItemStatus(item.id, 'failed', prepared.error ?? '无法生成可执行任务。')
        return { ok: false, error: prepared.error }
      }

      state.setItemStatus(item.id, 'running')
      const result = await startEncoding({
        executionPlan: prepared.plans[0],
        executionPlans: prepared.plans.length > 1 ? prepared.plans : undefined,
        customFfmpegPath,
        overwriteMode: 'replace',
      })
      if (!result.ok) {
        useBatchQueueStore.getState().setItemStatus(item.id, 'failed', result.error)
        return result
      }

      const completed = await waitForJobCompletion(result.snapshot.jobId)
      if (completed.phase === 'completed') {
        useBatchQueueStore.getState().setItemStatus(item.id, 'completed')
        item = useBatchQueueStore.getState().items.find((candidate) => candidate.status === 'ready')
        continue
      }

      useBatchQueueStore.getState().setItemStatus(
        item.id,
        completed.phase === 'cancelled' ? 'cancelled' : 'failed',
        completed.errorSummary ?? undefined,
      )
      return { ok: false, error: completed.errorSummary ?? '任务未完成。' }
    }
    return { ok: true }
  } finally {
    useBatchQueueStore.getState().setRunning(false)
  }
}
