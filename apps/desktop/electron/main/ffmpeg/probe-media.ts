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

// -- 完整流信息探针类型 ---

export interface ProbeStreamInfo {
  index: number
  codecType: 'video' | 'audio' | 'subtitle' | 'data' | 'attachment' | 'unknown'
  codecName?: string
  codecLongName?: string
  /** 视频宽度 */
  width?: number
  /** 视频高度 */
  height?: number
  /** 视频像素格式 */
  pixFmt?: string
  /** 视频帧率字符串（如 "24000/1001"） */
  rFrameRate?: string
  /** 视频平均帧率字符串 */
  avgFrameRate?: string
  /** 音频采样率 */
  sampleRate?: number
  /** 音频声道数 */
  channels?: number
  /** 音频声道布局 */
  channelLayout?: string
  /** 音频采样格式 */
  sampleFmt?: string
  /** 流时长（秒） */
  duration?: number
  /** 流标签（语言、标题等） */
  tags?: Record<string, string>
  /** 编码器配置文件 */
  profile?: string
}

export interface ProbeResult {
  streams: ProbeStreamInfo[]
  format?: {
    filename?: string
    formatName?: string
    formatLongName?: string
    duration?: number
    bitRate?: number
    size?: number
    tags?: Record<string, string>
  }
}

interface FullProbePayload {
  streams?: Array<Record<string, unknown>>
  format?: Record<string, unknown>
}

interface ProbePayload {
  streams?: Array<{
    nb_frames?: string
    avg_frame_rate?: string
    duration?: string
  }>
  format?: { duration?: string }
}

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

function positiveNumber(value: string | undefined): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function positiveInteger(value: string | undefined): number | undefined {
  const parsed = positiveNumber(value)
  return parsed == null ? undefined : Math.round(parsed)
}

function parseFrameRate(value: string | undefined): number | null {
  if (!value) return null
  const [numerator, denominator = '1'] = value.split('/')
  const top = Number(numerator)
  const bottom = Number(denominator)
  if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom <= 0 || top <= 0) return null
  return top / bottom
}

// -- 完整媒体信息探针（所有流 + 格式元数据）--

/**
 * 使用 ffprobe 完整探测媒体文件，返回所有流信息和格式元数据。
 * ffmpegPath — 已验证的 ffmpeg 可执行文件路径（用于定位同目录 ffprobe）。
 * inputPath — 待探测的媒体文件路径。
 * timeoutMs — 超时（默认 20 秒）。
 */
export async function probeMedia(ffmpegPath: string, inputPath: string, timeoutMs = 20_000): Promise<ProbeResult | null> {
  const ffprobePath = await resolveFFprobePath(ffmpegPath)
  if (!ffprobePath || !inputPath) return null

  try {
    const stdout = await runProbe(ffprobePath, [
      '-v', 'error',
      '-show_entries',
      'stream=index,codec_type,codec_name,codec_long_name,width,height,pix_fmt,r_frame_rate,avg_frame_rate,sample_rate,channels,channel_layout,sample_fmt,duration,tags,profile:format',
      '-of', 'json',
      inputPath,
    ], timeoutMs)
    const payload = JSON.parse(stdout) as FullProbePayload
    return parseProbePayload(payload)
  } catch {
    return null
  }
}

function parseProbePayload(payload: FullProbePayload): ProbeResult {
  const streams: ProbeStreamInfo[] = (payload.streams ?? []).map((raw) => {
    const codecType = normalizeCodecType(String(raw.codec_type ?? 'unknown'))
    const rawTags = raw.tags as Record<string, unknown> | undefined
    return {
      index: (positiveInteger(String(raw.index ?? '')) ?? 0),
      codecType,
      codecName: raw.codec_name ? String(raw.codec_name) : undefined,
      codecLongName: raw.codec_long_name ? String(raw.codec_long_name) : undefined,
      width: positiveInteger(String(raw.width ?? '')),
      height: positiveInteger(String(raw.height ?? '')),
      pixFmt: raw.pix_fmt ? String(raw.pix_fmt) : undefined,
      rFrameRate: raw.r_frame_rate ? String(raw.r_frame_rate) : undefined,
      avgFrameRate: raw.avg_frame_rate ? String(raw.avg_frame_rate) : undefined,
      sampleRate: positiveInteger(String(raw.sample_rate ?? '')),
      channels: positiveInteger(String(raw.channels ?? '')),
      channelLayout: raw.channel_layout ? String(raw.channel_layout) : undefined,
      sampleFmt: raw.sample_fmt ? String(raw.sample_fmt) : undefined,
      duration: positiveNumber(String(raw.duration ?? '')),
      tags: rawTags ? mapStringValues(rawTags) : undefined,
      profile: raw.profile ? String(raw.profile) : undefined,
    }
  })

  const fmt = payload.format
  const fmtTags = fmt?.tags as Record<string, unknown> | undefined
  const format = fmt ? {
    filename: fmt.filename ? String(fmt.filename) : undefined,
    formatName: fmt.format_name ? String(fmt.format_name) : undefined,
    formatLongName: fmt.format_long_name ? String(fmt.format_long_name) : undefined,
    duration: positiveNumber(String(fmt.duration ?? '')),
    bitRate: positiveInteger(String(fmt.bit_rate ?? '')),
    size: positiveInteger(String(fmt.size ?? '')),
    tags: fmtTags ? mapStringValues(fmtTags) : undefined,
  } : undefined

  return { streams, format }
}

function normalizeCodecType(raw: string): ProbeStreamInfo['codecType'] {
  const valid = ['video', 'audio', 'subtitle', 'data', 'attachment'] as const
  return valid.includes(raw as typeof valid[number]) ? (raw as typeof valid[number]) : 'unknown'
}

function mapStringValues(obj: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') result[k] = v
    else if (typeof v === 'number' && Number.isFinite(v)) result[k] = String(v)
    else result[k] = String(v ?? '')
  }
  return result
}

function runProbe(file: string, args: string[], timeoutMs = 20_000): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(file, args, {
      timeout: timeoutMs,
      windowsHide: true,
      maxBuffer: 2 * 1024 * 1024,
    }, (error, stdout) => {
      if (error) reject(error)
      else resolve(stdout)
    })
  })
}

export { resolveFFprobePath }
