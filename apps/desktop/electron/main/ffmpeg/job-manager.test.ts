import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ExecutorCallbacks } from './executor'
import type { ExecutionPlan, FFmpegJobSnapshot, FFmpegJobStartRequest } from './types'

const mocks = vi.hoisted(() => ({
  callbacks: [] as ExecutorCallbacks[],
  startJob: vi.fn(),
  createEncodingHistory: vi.fn(),
  finishEncodingHistory: vi.fn(),
}))

vi.mock('electron', () => ({
  app: { getPath: () => 'C:\\ffcodec-test' },
}))

vi.mock('../ffmpeg-detect', () => ({
  detectFFmpeg: vi.fn(async () => ({ found: true, path: 'ffmpeg.exe' })),
  tryFFmpegPath: vi.fn(async () => ({ found: true, path: 'ffmpeg.exe' })),
}))

vi.mock('./validation', () => ({
  validateBeforeExecution: vi.fn(() => ({ ok: true, errors: [] })),
  validateCustomExecutionPlan: vi.fn(() => []),
}))

vi.mock('./probe-media', () => ({
  probeMediaProgress: vi.fn(async () => ({ durationMs: 60_000, totalFrames: 1_500 })),
}))

vi.mock('../history-store', () => ({
  createEncodingHistory: mocks.createEncodingHistory,
  finishEncodingHistory: mocks.finishEncodingHistory,
  listEncodingHistory: vi.fn(() => []),
  recordUserCancel: vi.fn(),
}))

vi.mock('./executor', () => ({
  startJob: mocks.startJob,
}))

import { launchJob } from './job-manager'

function plan(outputPath: string): ExecutionPlan {
  return {
    args: ['-i', 'input.mkv', '-passlogfile', 'ffmpeg2pass', outputPath],
    inputPaths: ['input.mkv'],
    outputPaths: [outputPath],
  }
}

function snapshot(
  request: FFmpegJobStartRequest,
  jobId: string,
  createdAt: number,
  startedAt: number,
): FFmpegJobSnapshot {
  return {
    jobId,
    commandSource: request.commandSource ?? 'generated',
    phase: 'running',
    createdAt,
    startedAt,
    endedAt: null,
    inputPaths: request.executionPlan.inputPaths,
    outputPaths: request.executionPlan.outputPaths,
    frame: null,
    totalFrames: null,
    fps: null,
    bitrate: null,
    speed: null,
    outTimeUs: null,
    outTimeMs: null,
    expectedDurationMs: null,
    percent: null,
    estimatedRemainingMs: null,
    totalSize: null,
    exitCode: null,
    signal: null,
    errorSummary: null,
    logPath: `C:\\ffcodec-test\\logs\\ffcodec-${jobId}.log`,
  }
}

beforeEach(() => {
  mocks.callbacks.length = 0
  mocks.startJob.mockReset()
  mocks.createEncodingHistory.mockReset()
  mocks.finishEncodingHistory.mockReset()

  let invocation = 0
  mocks.startJob.mockImplementation((
    request: FFmpegJobStartRequest,
    _ffmpegPath: string,
    _logDir: string,
    jobId: string,
    createdAt: number,
    callbacks: ExecutorCallbacks,
  ) => {
    invocation += 1
    mocks.callbacks.push(callbacks)
    return {
      snapshot: snapshot(request, jobId, createdAt, createdAt + invocation * 100),
      cancel: vi.fn(),
    }
  })
})

describe('FFmpeg plan sequence', () => {
  it('第一遍成功后启动第二遍，并只在最终完成时收尾历史', async () => {
    const first = { ...plan('-'), outputPaths: [] }
    const second = plan('output.mp4')
    const result = await launchJob({
      executionPlan: first,
      executionPlans: [first, second],
      overwriteMode: 'replace',
    })

    expect(result.ok).toBe(true)
    expect(mocks.startJob).toHaveBeenCalledTimes(1)
    const firstRequest = mocks.startJob.mock.calls[0][0] as FFmpegJobStartRequest
    const firstPassLog = firstRequest.executionPlan.args[firstRequest.executionPlan.args.indexOf('-passlogfile') + 1]
    expect(firstPassLog).toMatch(/ffcodec-pass-/)
    expect(firstPassLog).not.toBe('ffmpeg2pass')
    const firstStartedAt = result.ok ? result.snapshot.startedAt : null

    mocks.callbacks[0].onFinish({
      ...(result.ok ? result.snapshot : snapshot({ executionPlan: first, overwriteMode: 'replace' }, 'fallback', 0, 0)),
      phase: 'completed',
      endedAt: Date.now(),
      exitCode: 0,
    })

    expect(mocks.startJob).toHaveBeenCalledTimes(2)
    const secondRequest = mocks.startJob.mock.calls[1][0] as FFmpegJobStartRequest
    const secondPassLog = secondRequest.executionPlan.args[secondRequest.executionPlan.args.indexOf('-passlogfile') + 1]
    expect(secondPassLog).toBe(firstPassLog)
    expect(mocks.finishEncodingHistory).not.toHaveBeenCalled()

    const secondSnapshot = mocks.startJob.mock.results[1].value.snapshot as FFmpegJobSnapshot
    mocks.callbacks[1].onFinish({
      ...secondSnapshot,
      phase: 'completed',
      endedAt: Date.now(),
      exitCode: 0,
    })

    expect(mocks.finishEncodingHistory).toHaveBeenCalledTimes(1)
    expect(mocks.finishEncodingHistory).toHaveBeenCalledWith(expect.objectContaining({
      phase: 'completed',
      outputPaths: ['output.mp4'],
      startedAt: firstStartedAt,
    }))
  })

  it('第一遍失败时不启动第二遍', async () => {
    const first = { ...plan('-'), outputPaths: [] }
    const second = plan('output.mp4')
    const result = await launchJob({
      executionPlan: first,
      executionPlans: [first, second],
      overwriteMode: 'replace',
    })

    expect(result.ok).toBe(true)
    const firstSnapshot = result.ok ? result.snapshot : snapshot({ executionPlan: first, overwriteMode: 'replace' }, 'fallback', 0, 0)
    mocks.callbacks[0].onFinish({
      ...firstSnapshot,
      phase: 'failed',
      endedAt: Date.now(),
      exitCode: 1,
      errorSummary: 'pass 1 failed',
    })

    expect(mocks.startJob).toHaveBeenCalledTimes(1)
    expect(mocks.finishEncodingHistory).toHaveBeenCalledTimes(1)
    expect(mocks.finishEncodingHistory).toHaveBeenCalledWith(expect.objectContaining({
      phase: 'failed',
      errorSummary: 'pass 1 failed',
    }))
  })
})
