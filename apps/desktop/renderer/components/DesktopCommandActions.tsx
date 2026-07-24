// ============================================================
// DesktopCommandActions — Run button that triggers FFmpeg.
// Phase 10: wired to real encoding execution via IPC.
// ============================================================

import { useCallback, useMemo, type MouseEvent } from 'react'
import type { CommandActionExtension } from '@ffcodec/platform-api'
import { useAppDialog, useI18n, useBuilderStore, usePipeline, useRuntimeFilterDiagnostics } from '@ffcodec/workbench'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { buildExecutionPlans } from '@ffcodec/command-plan'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { repairOddExplicitResolution } from '@ffcodec/domain/config/resolution-repair'
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
  const setConfig = useBuilderStore((s) => s.setConfig)
  const runtimeFilterDiagnostics = useRuntimeFilterDiagnostics(config)

  // Mini-pipeline to get the command plan (shared pipeline runs in WorkbenchApp,
  // but we need the plan here for execution; re-running is cheap and guarantees
  // we use the latest config).
  const pipeline = usePipeline(config, catalog, runtimeFilterDiagnostics)
  const { jobState, start } = useEncodingJob()

  const plans = useMemo(() => buildExecutionPlans(pipeline.commandPlan), [pipeline.commandPlan])
  // 奇数尺寸只是警告。左键会自动修复，但不能借此绕过其他真正的错误。
  const canAutoRepairOddResolution = !pipeline.hasErrors && pipeline.evaluationResult.messages.some(
    (diagnostic) => diagnostic.code === 'warn.resolution.dimension.odd',
  )
  const autoRepairedConfig = useMemo(
    () => canAutoRepairOddResolution ? repairOddExplicitResolution(pipeline.normalizedConfig) : null,
    [canAutoRepairOddResolution, pipeline.normalizedConfig],
  )
  const normalCommandPlan = useMemo(
    () => autoRepairedConfig ? buildCommandPlan(autoRepairedConfig, catalog, []) : pipeline.commandPlan,
    [autoRepairedConfig, pipeline.commandPlan],
  )
  const normalPlans = useMemo(() => buildExecutionPlans(normalCommandPlan), [normalCommandPlan])
  // 强制运行仍必须具备结构化输入与真实文件输出，不能绕过这一底线。
  const canForceRun = useMemo(
    () => canRunExecutionPlans(plans, false),
    [plans],
  )
  const canRun = canForceRun && !pipeline.hasErrors

  const isRunning = jobState.phase === 'preparing' || jobState.phase === 'running' || jobState.phase === 'cancelling'

  const handleRun = useCallback(async (force = false) => {
    if ((force ? !canForceRun : !canRun) || isRunning) return
    const plansToRun = force ? plans : normalPlans
    if (plansToRun.length === 0) return

    // 左键只会自动修复唯一的奇数尺寸阻塞项；右键始终执行用户当前原始命令。
    if (!force && autoRepairedConfig) setConfig(autoRepairedConfig)

    // 菜单选中版本优先，其次使用左栏自定义路径。
    const customFfmpegPath = getPreferredFFmpegPath()

    const result = await start({
      executionPlan: plansToRun[0],
      executionPlans: plansToRun.length > 1 ? plansToRun : undefined,
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
  }, [autoRepairedConfig, canForceRun, canRun, dialog, isRunning, isZh, normalPlans, plans, setConfig, start])

  const handleForceRun = useCallback(async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (!canForceRun || (!pipeline.hasErrors && !canAutoRepairOddResolution) || isRunning) return

    const confirmed = await dialog.confirm({
      title: isZh ? '强制运行当前命令？' : 'Force-run the current command?',
      message: isZh
        ? (canAutoRepairOddResolution
          ? '当前命令包含奇数尺寸警告。左键运行会自动调整为偶数；右键强制运行会保留用户原始参数。FFmpeg 仍可能失败，程序不保证输出有效或任务成功。'
          : '当前配置存在阻塞性诊断。强制运行会跳过本程序的配置检查；FFmpeg 仍可能立即失败，程序不保证命令可执行、输出有效或成功完成。')
        : (canAutoRepairOddResolution
          ? 'The command has an odd-dimension warning. Left-click Run repairs it to an even value; right-click force-run preserves the original arguments. FFmpeg may still fail, and the app does not guarantee valid output or a successful job.'
          : 'The configuration has blocking diagnostics. Force-run skips this app\'s configuration checks; FFmpeg may still fail immediately, and the app does not guarantee that the command can run, produce valid output, or complete successfully.'),
      confirmLabel: isZh ? '仍然强制运行' : 'Force run anyway',
      cancelLabel: isZh ? '取消' : 'Cancel',
      tone: 'warning',
    })
    if (confirmed) await handleRun(true)
  }, [canAutoRepairOddResolution, canForceRun, dialog, handleRun, isRunning, isZh, pipeline.hasErrors])

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
      className={`button button--primary button--run${!canRun && canForceRun ? ' button--run-blocked' : ''}`}
      disabled={!canForceRun}
      aria-disabled={!canRun}
      onClick={() => { void handleRun() }}
      onContextMenu={handleForceRun}
      title={
        canAutoRepairOddResolution
          ? (isZh
            ? '左键将自动调整奇数尺寸后运行；右键强制运行会保留原始命令'
            : 'Left-click repairs odd dimensions before running; right-click force-run preserves the original command')
          : !canRun
          ? (isZh
            ? (pipeline.hasErrors ? '当前配置存在错误，请先查看诊断与建议；右键可强制运行并确认风险' : '请先完成编码器、输入和输出文件的配置')
            : (pipeline.hasErrors ? 'Resolve the diagnostics before running; right-click to force-run after confirming the risk' : 'Configure an encoder, input and output files first'))
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
