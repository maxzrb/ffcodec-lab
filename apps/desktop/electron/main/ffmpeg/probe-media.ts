// ============================================================
// 状态栏进度所需的轻量 ffprobe 探测。
// 优先使用容器声明的总帧数；缺失时由时长 × 平均帧率估算。
// ============================================================

import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

export interface MediaProgressBasis {
  totalFrames: number | null
  durationMs: number | null
}

interface ProbePayload {
  streams?: Array<{
    nb_frames?: string
    avg_frame_rate?: string
    duration?: string
  }>
  format?: { duration?: string }
}

const PROBE_TIMEOUT_MS = 15_000

export async function probeMediaProgress(ffmpegPath: string, inputPath: string): Promise<MediaProgressBasis> {
  const ffprobePath = await resolveFFprobePath(ffmpegPath)
  if (!ffprobePath || !inputPath) return { totalFrames: null, durationMs: null }

  try {
    const stdout = await runProbe(ffprobePath, [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=nb_frames,avg_frame_rate,duration:format=duration',
      '-of', 'json',
      inputPath,
    ])
    const payload = JSON.parse(stdout) as ProbePayload
    const stream = payload.streams?.[0]
    const durationSeconds = positiveNumber(stream?.duration)
      ?? positiveNumber(payload.format?.duration)
    const durationMs = durationSeconds == null ? null : Math.round(durationSeconds * 1000)
    const declaredFrames = positiveInteger(stream?.nb_frames)
    const averageFps = parseFrameRate(stream?.avg_frame_rate)
    const estimatedFrames = declaredFrames ?? (
      durationSeconds != null && averageFps != null
        ? Math.max(1, Math.round(durationSeconds * averageFps))
        : null
    )
    return { totalFrames: estimatedFrames, durationMs }
  } catch {
    // 探测失败不能阻止编码；状态栏会显示未知总量。
    return { totalFrames: null, durationMs: null }
  }
}

async function resolveFFprobePath(ffmpegPath: string): Promise<string | null> {
  const extension = process.platform === 'win32' ? '.exe' : ''
  if (path.isAbsolute(ffmpegPath)) {
    const sibling = path.join(path.dirname(ffmpegPath), `ffprobe${extension}`)
    try {
      await fs.access(sibling)
      return sibling
    } catch {
      // 同目录无 ffprobe 时继续尝试 PATH。
    }
  }
  return `ffprobe${extension}`
}

function runProbe(file: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(file, args, {
      timeout: PROBE_TIMEOUT_MS,
      windowsHide: true,
      maxBuffer: 2 * 1024 * 1024,
    }, (error, stdout) => {
      if (error) reject(error)
      else resolve(stdout)
    })
  })
}

function positiveNumber(value: string | undefined): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function positiveInteger(value: string | undefined): number | null {
  const parsed = positiveNumber(value)
  return parsed == null ? null : Math.round(parsed)
}

function parseFrameRate(value: string | undefined): number | null {
  if (!value) return null
  const [numerator, denominator = '1'] = value.split('/')
  const top = Number(numerator)
  const bottom = Number(denominator)
  if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom <= 0 || top <= 0) return null
  return top / bottom
}
