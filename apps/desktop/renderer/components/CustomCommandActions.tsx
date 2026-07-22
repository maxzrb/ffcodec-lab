import { useMemo } from 'react'
import { useAppDialog, useI18n } from '@ffcodec/workbench'
import { useEncodingJob } from './useEncodingJob'
import { localizeJobError } from './encoding-job'
import { parseCustomFfmpegCommand } from './custom-command'

export function CustomCommandActions({ command, dirty }: { command: string; dirty: boolean }) {
  const { locale } = useI18n()
  const dialog = useAppDialog()
  const isZh = locale === 'zh-CN'
  const { jobState, start } = useEncodingJob()
  const parsed = useMemo(() => parseCustomFfmpegCommand(command), [command])
  const busy = jobState.phase === 'preparing' || jobState.phase === 'running' || jobState.phase === 'cancelling'

  const run = async () => {
    if (busy) return
    if (!dirty) {
      await dialog.alert({
        title: isZh ? '尚未编辑命令' : 'Command not edited',
        message: isZh ? '请先在自由编辑区手动修改命令，再使用自定义运行。' : 'Edit the free-command area before custom execution.',
        confirmLabel: isZh ? '知道了' : 'OK',
        tone: 'default',
      })
      return
    }
    if (!parsed.ok) {
      await dialog.alert({
        title: isZh ? '命令无法安全运行' : 'Command cannot run safely',
        message: localizeParseError(parsed.error, isZh),
        confirmLabel: isZh ? '返回修改' : 'Edit command',
        tone: 'danger',
      })
      return
    }
    const output = parsed.plan.outputPaths[0]
    const accepted = await dialog.confirm({
      title: isZh ? '运行自定义 FFmpeg 命令？' : 'Run custom FFmpeg command?',
      message: isZh
        ? `这不是上方参数工作台生成任务。命令不会经过参数纠错，也不会调用系统 Shell。\n\n输出：${output}\n已有文件默认拒绝覆盖。`
        : `This is separate from the generated workbench task. It bypasses parameter corrections and does not invoke a system shell.\n\nOutput: ${output}\nExisting files are not overwritten by default.`,
      confirmLabel: isZh ? '确认运行自定义命令' : 'Run custom command',
      cancelLabel: isZh ? '取消' : 'Cancel',
      tone: 'warning',
    })
    if (!accepted) return
    const customFfmpegPath = (localStorage.getItem('ffcodec-desktop-ffmpeg-path') ?? window.electronAPI?.storageGetItem('ffcodec-desktop-ffmpeg-path'))?.trim() || undefined
    const result = await start({ executionPlan: parsed.plan, customFfmpegPath, overwriteMode: 'fail', commandSource: 'custom' })
    if (!result.ok) {
      await dialog.alert({
        title: isZh ? '自定义命令未能启动' : 'Custom command did not start',
        message: localizeStartError(result.error, isZh),
        confirmLabel: isZh ? '返回检查命令' : 'Review command',
        tone: 'danger',
      })
    }
  }

  return (
    <button
      type="button"
      className="button-ghost custom-command-run-button"
      disabled={busy}
      onClick={() => void run()}
      title={isZh ? '运行自由编辑区中的命令；点击后需再次确认' : 'Run the freely edited command; confirmation is required'}
    >
      {busy ? (isZh ? '任务运行中' : 'Job running') : (isZh ? '⚠ 运行自定义命令' : '⚠ Run custom command')}
    </button>
  )
}

function localizeStartError(error: string, isZh: boolean): string {
  const localized = localizeJobError(error, isZh)
  if (!isZh) return localized
  const inputMatch = localized.match(/^找不到或无法读取输入文件：(.+)$/m)
  if (inputMatch) {
    return `找不到或无法读取输入文件：${inputMatch[1]}\n\n请把 input.mkv 等占位名称替换为实际文件路径；路径含空格时请保留引号。`
  }
  if (localized.startsWith('输出文件已存在且禁止覆盖：')) {
    return `${localized}\n\n请更换输出路径，或在确认确实需要覆盖后向命令加入 -y。`
  }
  return localized
}

function localizeParseError(error: string, isZh: boolean): string {
  if (isZh) return error
  const translations: Record<string, string> = {
    '不支持管道、重定向或命令连接符；自定义命令只会直接运行 FFmpeg。': 'Pipes, redirects, and command operators are not supported; only FFmpeg is launched directly.',
    '命令中存在未闭合的引号。': 'The command contains an unclosed quote.',
    '命令必须以 ffmpeg 或 ffmpeg.exe 开头。': 'The command must start with ffmpeg or ffmpeg.exe.',
    'FFmpeg 命令没有参数。': 'The FFmpeg command has no arguments.',
    '自定义命令至少需要一个 -i 输入文件。': 'The custom command needs at least one -i input file.',
    '命令末尾必须是本地输出文件路径。': 'The command must end with a local output file path.',
  }
  return translations[error] ?? error
}
