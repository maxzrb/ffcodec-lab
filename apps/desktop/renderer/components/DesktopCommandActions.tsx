// ============================================================
// DesktopCommandActions — Run button that triggers FFmpeg.
// Phase 10: wired to real encoding execution via IPC.
// ============================================================

import { useCallback, useMemo } from 'react'
import type { CommandActionExtension } from '@ffcodec/platform-api'
import { useAppDialog, useI18n, useBuilderStore, usePipeline } from '@ffcodec/workbench'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { buildExecutionPlans } from '@ffcodec/command-plan'
import { useEncodingJob } from './useEncodingJob'
import { localizeJobError } from './encoding-job'

const catalog = loadCatalog()

function RunButton() {
  const { locale } = useI18n()
  const dialog = useAppDialog()
  const isZh = locale === 'zh-CN'
  const config = useBuilderStore((s) => s.config)

  // Mini-pipeline to get the command plan (shared pipeline runs in WorkbenchApp,
  // but we need the plan here for execution; re-running is cheap and guarantees
  // we use the latest config).
  const pipeline = usePipeline(config, catalog)
  const { jobState, start } = useEncodingJob()

  // Check validity: we need a valid command with at least one input and one output
  const canRun = useMemo(() => {
    const plan = pipeline.commandPlan
    if (plan.invocations.length === 0) return false
    const inv = plan.invocations[0]
    if (!inv.inputs.length || !inv.output.path || inv.output.path === '-') return false
    if (pipeline.hasErrors) return false
    return true
  }, [pipeline])

  const isRunning = jobState.phase === 'preparing' || jobState.phase === 'running' || jobState.phase === 'cancelling'

  const handleRun = useCallback(async () => {
    if (!canRun || isRunning) return

    const plans = buildExecutionPlans(pipeline.commandPlan)
    if (plans.length === 0) return

    // For two-pass, execute the first plan (pass-1). Phase 12+ will handle
    // sequential execution of both passes automatically.
    const plan = plans[0]

    // Resolve FFmpeg custom path from INI store (fallback to localStorage)
    const customFfmpegPath = (localStorage.getItem('ffcodec-desktop-ffmpeg-path') ?? window.electronAPI?.storageGetItem('ffcodec-desktop-ffmpeg-path'))?.trim() || undefined

    const result = await start({
      executionPlan: plan,
      customFfmpegPath,
      overwriteMode: 'replace',
    })
    if (!result.ok) {
      await dialog.alert({
        title: isZh ? '编码任务未能启动' : 'Encoding job did not start',
        message: localizeJobError(result.error, isZh),
        confirmLabel: isZh ? '知道了' : 'OK',
        tone: 'danger',
      })
    }
  }, [canRun, dialog, isRunning, isZh, pipeline.commandPlan, start])

  const canCancel = jobState.phase === 'running'

  // Show cancel button when running
  if (isRunning && canCancel) {
    return (
      <button
        type="button"
        className="button button--danger button--run"
        onClick={() => {
          const api = window.electronAPI
          if (api) api.cancelFFmpegJob()
        }}
        title={isZh ? '取消当前编码任务' : 'Cancel the current encoding job'}
      >
        {isZh ? '⏹ 取消' : '⏹ Cancel'}
      </button>
    )
  }

  // Show disabled Run button when preparing/cancelling
  if (isRunning) {
    return (
      <button
        type="button"
        className="button button--primary button--run"
        disabled
      >
        {jobState.phase === 'preparing'
          ? (isZh ? '准备中…' : 'Preparing…')
          : (isZh ? '取消中…' : 'Cancelling…')}
      </button>
    )
  }

  // Normal Run button
  return (
    <button
      type="button"
      className="button button--primary button--run"
      disabled={!canRun}
      onClick={handleRun}
      title={
        !canRun
          ? (isZh
            ? '请先完成编码器、输入和输出文件的配置'
            : 'Configure an encoder, input and output files first')
          : (isZh ? '本地运行 FFmpeg 编码' : 'Run FFmpeg encoding locally')
      }
    >
      {isZh ? '▶ 运行' : '▶ Run'}
    </button>
  )
}

export const desktopCommandActions: CommandActionExtension[] = [
  {
    id: 'desktop-run',
    label: 'Run',
    render: () => <RunButton />,
  },
]
