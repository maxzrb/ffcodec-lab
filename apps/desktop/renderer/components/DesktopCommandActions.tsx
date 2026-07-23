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
import { getPreferredFFmpegPath } from '../ffmpeg-path-selection'
import { canRunExecutionPlans } from './execution-plan-guards'

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
    const plans = buildExecutionPlans(plan)
    return canRunExecutionPlans(plans, pipeline.hasErrors)
  }, [pipeline])

  const isRunning = jobState.phase === 'preparing' || jobState.phase === 'running' || jobState.phase === 'cancelling'

  const handleRun = useCallback(async () => {
    if (!canRun || isRunning) return

    const plans = buildExecutionPlans(pipeline.commandPlan)
    if (plans.length === 0) return

    // 菜单选中版本优先，其次使用左栏自定义路径。
    const customFfmpegPath = getPreferredFFmpegPath()

    const result = await start({
      executionPlan: plans[0],
      executionPlans: plans.length > 1 ? plans : undefined,
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
            ? (pipeline.hasErrors ? '当前配置存在错误，请先查看诊断与建议' : '请先完成编码器、输入和输出文件的配置')
            : (pipeline.hasErrors ? 'Resolve the configuration errors before running' : 'Configure an encoder, input and output files first'))
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
