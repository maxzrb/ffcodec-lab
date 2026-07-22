// ============================================================
// Phase 11 编码历史与事件日志持久化。
// 只在任务开始、用户取消和任务结束等关键节点写盘，实时进度不落盘。
// ============================================================

import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import type { FFmpegJobSnapshot } from './ffmpeg/types'

export type EncodingLogEventKind =
  | 'user-start'
  | 'ffmpeg-start'
  | 'user-cancel'
  | 'user-end'
  | 'ffmpeg-error'

export type EncodingLogEventLevel = 'info' | 'action' | 'success' | 'warning' | 'error'

export interface EncodingLogEvent {
  id: string
  timestamp: number
  kind: EncodingLogEventKind
  level: EncodingLogEventLevel
  message: string
  detail?: string
}

export interface EncodingHistoryItem {
  historyId: string
  jobId: string
  createdAt: number
  updatedAt: number
  status: FFmpegJobSnapshot['phase']
  inputPaths: string[]
  outputPaths: string[]
  startedAt: number | null
  endedAt: number | null
  durationMs: number | null
  exitCode: number | null
  logPath: string
  errorSummary: string | null
  events: EncodingLogEvent[]
  snapshot: FFmpegJobSnapshot
}

interface HistoryFile {
  version: 1
  items: EncodingHistoryItem[]
}

const MAX_HISTORY_ITEMS = 100
const MAX_LOG_AGE_MS = 30 * 24 * 60 * 60 * 1000

function historyPath(): string {
  return path.join(app.getPath('userData'), 'encoding-history.json')
}

function emptyHistory(): HistoryFile {
  return { version: 1, items: [] }
}

function readHistory(): HistoryFile {
  try {
    const parsed = JSON.parse(fs.readFileSync(historyPath(), 'utf8')) as Partial<HistoryFile>
    return parsed.version === 1 && Array.isArray(parsed.items)
      ? { version: 1, items: parsed.items }
      : emptyHistory()
  } catch {
    return emptyHistory()
  }
}

function writeHistory(data: HistoryFile): void {
  const target = historyPath()
  fs.mkdirSync(path.dirname(target), { recursive: true })
  const temp = `${target}.tmp`
  fs.writeFileSync(temp, JSON.stringify(data, null, 2), 'utf8')
  fs.renameSync(temp, target)
}

function event(
  kind: EncodingLogEventKind,
  level: EncodingLogEventLevel,
  message: string,
  detail?: string,
): EncodingLogEvent {
  return { id: crypto.randomUUID(), timestamp: Date.now(), kind, level, message, detail }
}

export function createEncodingHistory(snapshot: FFmpegJobSnapshot): EncodingHistoryItem {
  const data = readHistory()
  const now = Date.now()
  const item: EncodingHistoryItem = {
    historyId: crypto.randomUUID(),
    jobId: snapshot.jobId,
    createdAt: snapshot.createdAt,
    updatedAt: now,
    status: snapshot.phase,
    inputPaths: [...snapshot.inputPaths],
    outputPaths: [...snapshot.outputPaths],
    startedAt: snapshot.startedAt,
    endedAt: snapshot.endedAt,
    durationMs: null,
    exitCode: snapshot.exitCode,
    logPath: snapshot.logPath,
    errorSummary: null,
    events: [
      event('user-start', 'action', '用户开始编码'),
      event('ffmpeg-start', 'info', 'FFmpeg 进程已启动', snapshot.logPath),
    ],
    snapshot: { ...snapshot },
  }
  data.items.unshift(item)
  data.items = data.items.slice(0, MAX_HISTORY_ITEMS)
  writeHistory(data)
  cleanupExpiredLogs(data.items)
  return item
}

export function recordUserCancel(jobId: string): void {
  updateItem(jobId, (item) => {
    if (!item.events.some((entry) => entry.kind === 'user-cancel')) {
      item.events.push(event('user-cancel', 'warning', '用户请求结束编码'))
    }
  })
}

export function finishEncodingHistory(snapshot: FFmpegJobSnapshot): void {
  updateItem(snapshot.jobId, (item) => {
    item.status = snapshot.phase
    item.startedAt = snapshot.startedAt
    item.endedAt = snapshot.endedAt
    item.durationMs = snapshot.startedAt && snapshot.endedAt
      ? Math.max(0, snapshot.endedAt - snapshot.startedAt)
      : null
    item.exitCode = snapshot.exitCode
    item.errorSummary = snapshot.errorSummary
    item.snapshot = { ...snapshot }

    if (snapshot.phase === 'failed') {
      item.events.push(event(
        'ffmpeg-error',
        'error',
        'FFmpeg 编码失败',
        snapshot.errorSummary ?? `退出码：${snapshot.exitCode ?? '未知'}`,
      ))
      item.events.push(event('user-end', 'error', '编码操作已结束（失败）'))
    } else if (snapshot.phase === 'cancelled') {
      item.events.push(event('user-end', 'warning', '编码操作已结束（已取消）'))
    } else {
      item.events.push(event('user-end', 'success', '编码操作已结束（成功）'))
    }
  })
}

function updateItem(jobId: string, mutate: (item: EncodingHistoryItem) => void): void {
  const data = readHistory()
  const item = data.items.find((entry) => entry.jobId === jobId)
  if (!item) return
  mutate(item)
  item.updatedAt = Date.now()
  writeHistory(data)
}

export function listEncodingHistory(): EncodingHistoryItem[] {
  return readHistory().items.sort((a, b) => b.createdAt - a.createdAt)
}

export function getEncodingHistoryItem(historyId: string): EncodingHistoryItem | null {
  return readHistory().items.find((item) => item.historyId === historyId) ?? null
}

export function deleteEncodingHistoryItem(historyId: string): boolean {
  const data = readHistory()
  const index = data.items.findIndex((item) => item.historyId === historyId)
  if (index < 0) return false
  const [removed] = data.items.splice(index, 1)
  deleteLogFile(removed.logPath)
  writeHistory(data)
  return true
}

export function clearEncodingHistory(): number {
  const data = readHistory()
  for (const item of data.items) deleteLogFile(item.logPath)
  const count = data.items.length
  writeHistory(emptyHistory())
  return count
}

export function readEncodingLog(historyId: string): { ok: true; content: string } | { ok: false; error: string } {
  const item = getEncodingHistoryItem(historyId)
  if (!item) return { ok: false, error: 'History item not found.' }
  if (!isManagedLogPath(item.logPath)) return { ok: false, error: '日志路径无效。' }
  try {
    const content = fs.readFileSync(item.logPath, 'utf8')
    const maxChars = 512_000
    return {
      ok: true,
      content: content.length > maxChars
        ? `[日志过长，仅显示最后 ${maxChars} 个字符]\n${content.slice(-maxChars)}`
        : content,
    }
  } catch {
    return { ok: false, error: '日志文件不存在或无法读取。' }
  }
}

function cleanupExpiredLogs(items: EncodingHistoryItem[]): void {
  const retained = new Set(items.map((item) => path.resolve(item.logPath)))
  const logDir = path.join(app.getPath('userData'), 'logs')
  try {
    const cutoff = Date.now() - MAX_LOG_AGE_MS
    const files = fs.readdirSync(logDir)
      .filter((name) => name.startsWith('ffcodec-') && name.endsWith('.log'))
      .map((name) => path.join(logDir, name))
    for (const file of files) {
      const resolved = path.resolve(file)
      const expired = fs.statSync(file).mtimeMs < cutoff
      if (expired || !retained.has(resolved)) deleteLogFile(file)
    }
  } catch {
    // 日志目录不存在或某个文件正被占用时不阻断编码。
  }
}

function deleteLogFile(logPath: string): void {
  try {
    if (isManagedLogPath(logPath) && fs.existsSync(logPath)) fs.unlinkSync(logPath)
  } catch {
    // 删除失败不影响历史记录操作。
  }
}

export function isManagedLogPath(logPath: string): boolean {
  if (!logPath) return false
  const logDir = path.resolve(app.getPath('userData'), 'logs')
  const resolved = path.resolve(logPath)
  return path.dirname(resolved) === logDir
    && path.basename(resolved).startsWith('ffcodec-')
    && path.extname(resolved) === '.log'
}
