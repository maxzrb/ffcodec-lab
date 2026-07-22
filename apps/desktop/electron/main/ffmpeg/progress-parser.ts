// ============================================================
// FFmpeg progress parser — parses stdout from `-progress pipe:1`.
// Reference: https://ffmpeg.org/ffmpeg-all.html#Progress
// ============================================================

/**
 * Parsed progress fields from a single `progress=...` stanza.
 * All values are strings or undefined before coercion.
 */
export interface FFmpegProgressFrame {
  frame?: string
  fps?: string
  /** e.g. "1234.5kbits/s" */
  bitrate?: string
  total_size?: string
  /** Microseconds as integer string, e.g. "12345678". */
  out_time_us?: string
  /** HH:MM:SS.microseconds format, e.g. "00:01:23.456789". */
  out_time?: string
  speed?: string
  /** "continue" while encoding, "end" when done. */
  progress?: string
}

/**
 * Parses a key=value line from ffmpeg stdout into the accumulator.
 * Returns the same accumulator (mutated) for chaining via reduce.
 */
export function parseProgressLine(
  acc: FFmpegProgressFrame,
  line: string,
): FFmpegProgressFrame {
  const trimmed = line.trim()
  if (!trimmed) return acc

  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) return acc

  const key = trimmed.slice(0, eqIdx)
  const value = trimmed.slice(eqIdx + 1)

  switch (key) {
    case 'frame':
      acc.frame = value
      break
    case 'fps':
      acc.fps = value
      break
    case 'bitrate':
      acc.bitrate = value
      break
    case 'total_size':
      acc.total_size = value
      break
    case 'out_time_us':
      acc.out_time_us = value
      break
    case 'out_time':
      acc.out_time = value
      break
    case 'speed':
      acc.speed = value
      break
    case 'progress':
      acc.progress = value
      break
    default:
      // Ignore unknown keys (ffmpeg may add fields in future versions)
      break
  }

  return acc
}

/**
 * Converts a parsed progress frame into a partial snapshot update.
 */
export function progressFrameToSnapshot(
  frame: FFmpegProgressFrame,
): Partial<{
  frame: number
  fps: number
  bitrate: string
  speed: number
  outTimeUs: number
  outTimeMs: number
  totalSize: number
}> {
  const update: ReturnType<typeof progressFrameToSnapshot> = {}

  if (frame.frame !== undefined) {
    const n = parseInt(frame.frame, 10)
    if (!Number.isNaN(n)) update.frame = n
  }
  if (frame.fps !== undefined) {
    const n = parseFloat(frame.fps)
    if (!Number.isNaN(n)) update.fps = n
  }
  if (frame.bitrate !== undefined) {
    update.bitrate = frame.bitrate
  }
  if (frame.speed !== undefined) {
    // speed can be "N/A" when unknown
    const n = parseFloat(frame.speed)
    if (!Number.isNaN(n)) update.speed = n
  }
  if (frame.out_time_us !== undefined) {
    const n = parseInt(frame.out_time_us, 10)
    if (!Number.isNaN(n)) {
      update.outTimeUs = n
      update.outTimeMs = Math.floor(n / 1000)
    }
  }
  if (frame.total_size !== undefined) {
    const n = parseInt(frame.total_size, 10)
    if (!Number.isNaN(n)) update.totalSize = n
  }

  return update
}

/**
 * Computes progress percentage and estimated remaining time.
 */
export function computeProgress(
  outTimeMs: number | null,
  expectedDurationMs: number | null,
  speed: number | null,
): { percent: number | null; estimatedRemainingMs: number | null } {
  if (outTimeMs === null || expectedDurationMs === null || expectedDurationMs <= 0) {
    return { percent: null, estimatedRemainingMs: null }
  }

  const percent = Math.min(100, Math.round((outTimeMs / expectedDurationMs) * 100 * 100) / 100)

  let estimatedRemainingMs: number | null = null
  if (speed !== null && speed > 0) {
    estimatedRemainingMs = Math.round(((expectedDurationMs - outTimeMs) / speed))
  }

  return { percent, estimatedRemainingMs }
}
