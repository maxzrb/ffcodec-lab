#!/usr/bin/env tsx
// ============================================================
// 使用用户提供的真实媒体，从 ProjectConfig 生成 ExecutionPlan 后实跑 FFmpeg。
// 覆盖单流、多流、逐流快照、双遍、滤镜、音频、字幕、元数据与 remux。
// ============================================================

import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildExecutionPlans, type ExecutionPlan } from '@ffcodec/command-plan'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { RuleIndex } from '@ffcodec/catalog/rule-index'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import type {
  AudioEncodingSnapshot,
  InputProbeSummary,
  ProjectConfig,
  VideoEncodingSnapshot,
} from '@ffcodec/domain/config/project-config'
import { normalizeConfig } from '@ffcodec/domain/normalization'
import { validateConfig } from '@ffcodec/domain/validation'

interface ProbeStream {
  index: number
  codec_name?: string
  codec_type?: 'video' | 'audio' | 'subtitle' | 'attachment' | 'data'
  width?: number
  height?: number
  pix_fmt?: string
  color_range?: string
  color_space?: string
  color_primaries?: string
  color_transfer?: string
  sample_rate?: string
  channels?: number
  channel_layout?: string
  tags?: Record<string, string>
}

interface ProbeResult {
  streams: ProbeStream[]
  chapters?: unknown[]
  format?: {
    duration?: string
    tags?: Record<string, string>
  }
}

interface MediaFixtures {
  tsu: string
  theater: string
  rough: string
  complex: string
  complexFull: string
  multi: string
  subtitleAss: string
}

interface MatrixCase {
  id: string
  description: string
  makeConfig: (fixtures: MediaFixtures, outputPath: string) => ProjectConfig
  extension: string
  expectedInvocationCount?: number
  expectedArgSequences: string[][]
  hardwareRequirement?: {
    runtime: 'nvidia-encode' | 'nvidia-cuda' | 'nvidia-d3d11-device1'
    filters?: string[]
  }
  verify: (probe: ProbeResult, plans: ExecutionPlan[]) => void
}

interface RunResult {
  status: number | null
  stdout: string
  stderr: string
}

const catalog = loadCatalog()
const ruleIndex = new RuleIndex()
const args = parseArgs(process.argv.slice(2))
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const assetsDir = resolve(projectRoot, args.assetsDir ?? 'assets')
const sourcePaths = {
  tsu: join(assetsDir, 'TSU_1920x1080.mp4'),
  theater: join(assetsDir, 'TheaterSquare_1280x720.mp4'),
  rough: join(assetsDir, 'rough_cut_30s.mkv'),
  complex: join(assetsDir, '00006.MKV'),
}

for (const path of Object.values(sourcePaths)) {
  if (!existsSync(path)) throw new Error(`缺少真实媒体测试素材：${path}`)
}

const ffmpegExecutables = args.ffmpeg.length > 0
  ? args.ffmpeg.map((path) => resolve(projectRoot, path))
  : discoverFFmpegExecutables()
if (ffmpegExecutables.length === 0) throw new Error('没有找到可执行的 FFmpeg；请使用 --ffmpeg <path> 指定。')

const temporaryRoot = mkdtempSync(join(tmpdir(), 'ffcodec-real-media-'))
let failed = false
let passed = 0
let skipped = 0
let total = 0
const hardwarePreflightCache = new Map<string, string | undefined>()
const filterCapabilityCache = new Map<string, string>()

try {
  const fixtureFfmpeg = ffmpegExecutables[0]
  const fixtures = prepareFixtures(fixtureFfmpeg, sourcePaths, temporaryRoot)
  const matrix = createMatrix()
  const safetyAudits = runProductSafetyAudits(fixtures)
  total += safetyAudits
  passed += safetyAudits

  for (const ffmpeg of ffmpegExecutables) {
    const ffprobe = siblingExecutable(ffmpeg, 'ffprobe')
    if (!existsSync(ffmpeg) || !existsSync(ffprobe)) {
      console.error(`\nFAIL 缺少 FFmpeg/ffprobe：${ffmpeg}`)
      failed = true
      continue
    }

    const version = run(ffmpeg, ['-hide_banner', '-version']).stdout.split(/\r?\n/, 1)[0]
    const buildDir = join(temporaryRoot, sanitizeName(basename(dirname(ffmpeg))))
    mkdirSync(buildDir, { recursive: true })
    console.log(`\n=== ${version} ===`)

    for (const testCase of matrix) {
      total += 1
      const hardwareSkipReason = testCase.hardwareRequirement
        ? resolveHardwareCaseSkipReason(ffmpeg, fixtures, testCase.hardwareRequirement)
        : undefined
      if (hardwareSkipReason) {
        skipped += 1
        console.log(`SKIP ${testCase.id} — 硬件环境不可用：${hardwareSkipReason}`)
        continue
      }
      const outputPath = join(buildDir, `${testCase.id}.${testCase.extension}`)
      let plans: ExecutionPlan[] = []
      try {
        plans = buildProductPlans(testCase.makeConfig(fixtures, outputPath))
        assertEqual(
          plans.length,
          testCase.expectedInvocationCount ?? 1,
          `${testCase.id}: ExecutionPlan 数量`,
        )
        assertArgSequences(plans, testCase.expectedArgSequences, testCase.id)
        executePlans(ffmpeg, plans, testCase.id)
        assert(statSync(outputPath).size > 0, `${testCase.id}: 输出文件为空`)
        const probe = probeFile(ffprobe, outputPath)
        testCase.verify(probe, plans)
        decodeCheck(ffmpeg, outputPath)
        passed += 1
        console.log(`PASS ${testCase.id} — ${testCase.description}`)
      } catch (error) {
        failed = true
        console.error(`FAIL ${testCase.id} — ${formatError(error)}`)
        for (let index = 0; index < plans.length; index += 1) {
          console.error(`  PLAN ${index + 1}: ffmpeg ${plans[index].args.map(quoteForLog).join(' ')}`)
        }
      }
    }

    const hardware = runHardwareMatrix(ffmpeg, ffprobe, fixtures.theater, buildDir)
    total += hardware.total
    passed += hardware.passed
    skipped += hardware.skipped
    if (hardware.failed > 0) failed = true
  }

  console.log(`\n真实媒体压制矩阵：PASS ${passed}/${total}，SKIP ${skipped}（硬件环境不可用），FAIL ${total - passed - skipped}`)
  if (args.keep) console.log(`测试产物保留于：${temporaryRoot}`)
} finally {
  if (!args.keep) rmSync(temporaryRoot, { recursive: true, force: true })
}

if (failed) process.exitCode = 1

function createMatrix(): MatrixCase[] {
  return [
    {
      id: 'single-video-h264-filter',
      description: 'HEVC 输入转 H.264，缩放/降帧/画面调整/自定义滤镜',
      extension: 'mkv',
      expectedArgSequences: [
        ['-c:v', 'libx264'], ['-crf', '26'], ['-g', '60'], ['-bf', '2'], ['-an'], ['-vf'],
      ],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.tsu, outputPath, 'mkv')
        configureVideo(config, 'libx264', 'crf', 26, 'veryfast', 'high', 'yuv420p')
        config.video.specialParameters = { gopSize: 60, bFrames: 2 }
        config.frame.resolution = { mode: 'width', width: 640 }
        config.frame.frameRate = { mode: 'value', value: 30 }
        config.frame.filters!.processing.mode = 'compatible'
        config.frame.filters!.adjustment = {
          enabled: true,
          brightness: 0.02,
          contrast: 1.03,
          saturation: 1.02,
          gamma: 1,
        }
        config.customArgs.videoFilters = ['hflip']
        disableAudioAndSubtitles(config)
        return config
      },
      verify: (probe) => {
        assertStreams(probe, { video: 1, audio: 0, subtitle: 0 })
        const video = streamsOf(probe, 'video')[0]
        assertEqual(video.codec_name, 'h264', 'single-video-h264-filter: 视频编码')
        assertEqual(video.width, 640, 'single-video-h264-filter: 宽度')
        assertEqual(video.height, 360, 'single-video-h264-filter: 高度')
      },
    },
    {
      id: 'single-video-hevc-10bit',
      description: 'H.264 输入转 HEVC Main10',
      extension: 'mkv',
      expectedArgSequences: [
        ['-c:v', 'libx265'], ['-crf', '28'], ['-profile:v', 'main10'], ['-pix_fmt:v', 'yuv420p10le'], ['-an'],
      ],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.theater, outputPath, 'mkv')
        configureVideo(config, 'libx265', 'crf', 28, 'ultrafast', 'main10', 'yuv420p10le')
        config.frame.resolution = { mode: 'width', width: 640 }
        config.frame.filters!.processing.mode = 'compatible'
        disableAudioAndSubtitles(config)
        return config
      },
      verify: (probe) => {
        assertStreams(probe, { video: 1, audio: 0, subtitle: 0 })
        const video = streamsOf(probe, 'video')[0]
        assertEqual(video.codec_name, 'hevc', 'single-video-hevc-10bit: 视频编码')
        assert(video.pix_fmt?.includes('10') ?? false, `single-video-hevc-10bit: 非 10-bit 像素格式 ${video.pix_fmt}`)
      },
    },
    {
      id: 'single-video-av1',
      description: 'H.264 输入转 SVT-AV1',
      extension: 'mkv',
      expectedArgSequences: [['-c:v', 'libsvtav1'], ['-crf', '40'], ['-an']],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.theater, outputPath, 'mkv')
        configureVideo(config, 'libsvtav1', 'crf', 40, 12, 'auto', 'yuv420p')
        config.frame.resolution = { mode: 'width', width: 320 }
        config.frame.frameRate = { mode: 'value', value: 24 }
        config.frame.filters!.processing.mode = 'compatible'
        disableAudioAndSubtitles(config)
        return config
      },
      verify: (probe) => {
        assertStreams(probe, { video: 1, audio: 0, subtitle: 0 })
        assertEqual(streamsOf(probe, 'video')[0].codec_name, 'av1', 'single-video-av1: 视频编码')
      },
    },
    {
      id: 'external-ass-burn',
      description: '外挂 ASS 字幕烧录到 H.264',
      extension: 'mkv',
      expectedArgSequences: [['-c:v', 'libx264'], ['-vf']],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.theater, outputPath, 'mkv')
        configureVideo(config, 'libx264', 'crf', 28, 'veryfast', 'high', 'yuv420p')
        config.frame.resolution = { mode: 'width', width: 640 }
        config.frame.filters!.processing.mode = 'compatible'
        config.audio.mode = 'disabled'
        config.streams.preserveAllAudioStreams = false
        config.streams.audioStreams = []
        config.streams.preserveAllSubtitleStreams = false
        config.streams.subtitleStreams = []
        config.subtitle.burn = {
          enabled: true,
          source: 'external',
          externalPath: fixtures.subtitleAss,
          filterKind: 'subtitles',
          style: { fontSize: 28, outline: 2, alignment: 2 },
        }
        return config
      },
      verify: (probe) => {
        assertStreams(probe, { video: 1, audio: 0, subtitle: 0 })
        assertEqual(streamsOf(probe, 'video')[0].codec_name, 'h264', 'external-ass-burn: 视频编码')
      },
    },
    {
      id: 'two-pass-h264',
      description: '传统 libx264 双遍码率编码',
      extension: 'mp4',
      expectedInvocationCount: 2,
      expectedArgSequences: [
        ['-pass', '1'], ['-pass', '2'], ['-passlogfile'], ['-c:v', 'libx264'], ['-b:v', '900k'],
      ],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.theater, outputPath, 'mp4')
        configureVideo(config, 'libx264', 'twoPass', undefined, 'veryfast', 'high', 'yuv420p')
        config.video.rateControl!.bitrate = '900k'
        config.frame.resolution = { mode: 'width', width: 640 }
        config.frame.frameRate = { mode: 'value', value: 30 }
        config.frame.filters!.processing.mode = 'compatible'
        disableAudioAndSubtitles(config)
        return config
      },
      verify: (probe, plans) => {
        assertEqual(plans.length, 2, 'two-pass-h264: 双遍计划数')
        assertStreams(probe, { video: 1, audio: 0, subtitle: 0 })
        assertEqual(streamsOf(probe, 'video')[0].codec_name, 'h264', 'two-pass-h264: 视频编码')
      },
    },
    {
      id: 'audio-only-aac',
      description: '从第二音轨提取 AAC，重采样并转单声道',
      extension: 'm4a',
      expectedArgSequences: [
        ['-vn'], ['-map', '0:a:1'], ['-c:a:0', 'aac'], ['-ar:a:0', '44100'], ['-channel_layout:a:0', 'mono'],
      ],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.rough, outputPath, 'm4a')
        config.video.mode = 'disabled'
        config.streams.preserveAllVideoStreams = false
        config.streams.videoStreams = []
        config.audio = {
          ...config.audio,
          mode: 'encode',
          encoderId: 'aac',
          bitrate: '128k',
          channelLayout: 'mono',
          sampleRate: 44100,
        }
        config.streams.preserveAllAudioStreams = false
        config.streams.audioStreams = [{ index: 1, codecMode: 'encode' }]
        config.streams.preserveAllSubtitleStreams = false
        config.streams.subtitleStreams = []
        return config
      },
      verify: (probe) => {
        assertStreams(probe, { video: 0, audio: 1, subtitle: 0 })
        const audio = streamsOf(probe, 'audio')[0]
        assertEqual(audio.codec_name, 'aac', 'audio-only-aac: 音频编码')
        assertEqual(audio.channels, 1, 'audio-only-aac: 声道数')
        assertEqual(audio.sample_rate, '44100', 'audio-only-aac: 采样率')
      },
    },
    {
      id: 'preserve-all-transcode-pgs',
      description: '视频转码、两条音频统一 AAC、四条 PGS 原样保留',
      extension: 'mkv',
      expectedArgSequences: [
        ['-map', '0:v?'], ['-map', '0:a?'], ['-map', '0:s?'], ['-c:v', 'libx264'], ['-c:a', 'aac'], ['-c:s', 'copy'],
      ],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.rough, outputPath, 'mkv')
        configureVideo(config, 'libx264', 'crf', 28, 'veryfast', 'high', 'yuv420p')
        config.frame.resolution = { mode: 'width', width: 640 }
        config.frame.filters!.processing.mode = 'compatible'
        config.audio = {
          ...config.audio,
          mode: 'encode',
          encoderId: 'aac',
          bitrate: '128k',
          channelLayout: 'stereo',
          sampleRate: 48000,
        }
        config.streams.preserveAllVideoStreams = true
        config.streams.preserveAllAudioStreams = true
        config.streams.preserveAllSubtitleStreams = true
        config.subtitle.tracks = []
        return config
      },
      verify: (probe) => {
        assertStreams(probe, { video: 1, audio: 2, subtitle: 4 })
        assert(streamsOf(probe, 'audio').every((stream) => stream.codec_name === 'aac'), 'preserve-all-transcode-pgs: 音频未全部转 AAC')
        assert(streamsOf(probe, 'subtitle').every((stream) => stream.codec_name === 'hdmv_pgs_subtitle'), 'preserve-all-transcode-pgs: PGS 未保留')
      },
    },
    {
      id: 'remux-all-copy-metadata',
      description: '完整 MKV remux，保留全部流并写入全局/流级元数据',
      extension: 'mkv',
      expectedArgSequences: [
        ['-c:v', 'copy'], ['-c:a', 'copy'], ['-c:s', 'copy'], ['-map_metadata', '0'], ['-map_chapters', '0'],
      ],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.rough, outputPath, 'mkv')
        config.video.mode = 'copy'
        config.audio.mode = 'copy'
        config.streams.preserveAllVideoStreams = true
        config.streams.preserveAllAudioStreams = true
        config.streams.preserveAllSubtitleStreams = true
        config.subtitle.tracks = []
        config.output.metadata = {
          globalRaw: 'title=FFCodec Real Media Matrix',
          streamRaw: 'audio:0:title=Primary Audio',
        }
        config.customArgs.preOutputArgs = ['-map_metadata 0', '-map_chapters 0', '-map 0:t?', '-c:t copy']
        return config
      },
      verify: (probe) => {
        assertStreams(probe, { video: 1, audio: 2, subtitle: 4 })
        assertEqual(streamsOf(probe, 'video')[0].codec_name, 'h264', 'remux-all-copy-metadata: 视频编码')
        assertEqual(streamsOf(probe, 'audio')[0].codec_name, 'dts', 'remux-all-copy-metadata: 第一音轨编码')
        assertEqual(probe.format?.tags?.title, 'FFCodec Real Media Matrix', 'remux-all-copy-metadata: 全局标题')
        assertEqual(streamsOf(probe, 'audio')[0].tags?.title, 'Primary Audio', 'remux-all-copy-metadata: 音轨标题')
      },
    },
    {
      id: 'multi-stream-mixed-copy-encode',
      description: '2V+2A+4S 中逐流混合 encode/copy',
      extension: 'mkv',
      expectedArgSequences: [
        ['-map', '0:v:0'], ['-map', '0:v:1'], ['-map', '0:a:0'], ['-map', '0:a:1'],
        ['-c:v:0', 'libx264'], ['-c:v:1', 'copy'], ['-c:a:0', 'libopus'], ['-c:a:1', 'copy'],
        ['-filter:v:0'], ['-filter:a:0'], ['-c:s', 'copy'],
      ],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.multi, outputPath, 'mkv')
        const videoSnapshot = makeVideoSnapshot(config, {
          encoderId: 'libx264', preset: 'veryfast', profile: 'high', pixelFormat: 'yuv420p', quality: 28,
          width: 640, customFilters: ['hflip'],
        })
        const audioSnapshot = makeAudioSnapshot(config, {
          encoderId: 'libopus', bitrate: '192k', channelLayout: '5.1', sampleRate: 48000,
          loudness: true, customFilters: ['volume=0.98'],
        })
        config.streams.preserveAllVideoStreams = false
        config.streams.videoStreams = [
          { index: 0, codecMode: 'encode', videoSnapshot },
          { index: 1, codecMode: 'copy' },
        ]
        config.streams.preserveAllAudioStreams = false
        config.streams.audioStreams = [
          { index: 0, codecMode: 'encode', audioSnapshot },
          { index: 1, codecMode: 'copy' },
        ]
        config.streams.preserveAllSubtitleStreams = true
        config.subtitle.tracks = []
        return config
      },
      verify: (probe) => {
        assertStreams(probe, { video: 2, audio: 2, subtitle: 4 })
        assertEqual(streamsOf(probe, 'video')[0].codec_name, 'h264', 'multi-stream-mixed-copy-encode: v0')
        assertEqual(streamsOf(probe, 'video')[1].codec_name, 'h264', 'multi-stream-mixed-copy-encode: v1 copy')
        assertEqual(streamsOf(probe, 'audio')[0].codec_name, 'opus', 'multi-stream-mixed-copy-encode: a0')
        assertEqual(streamsOf(probe, 'audio')[1].codec_name, 'ac3', 'multi-stream-mixed-copy-encode: a1 copy')
      },
    },
    {
      id: 'multi-stream-all-snapshots',
      description: '两条视频和两条音频分别使用不同冻结快照',
      extension: 'mkv',
      expectedArgSequences: [
        ['-c:v:0', 'libx264'], ['-c:v:1', 'libx264'], ['-filter:v:0'], ['-filter:v:1'],
        ['-c:a:0', 'libopus'], ['-c:a:1', 'aac'], ['-filter:a:0'], ['-filter:a:1'],
      ],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.multi, outputPath, 'mkv')
        const v0 = makeVideoSnapshot(config, {
          encoderId: 'libx264', preset: 'veryfast', profile: 'high', pixelFormat: 'yuv420p', quality: 29,
          width: 640, customFilters: ['hflip'],
        })
        const v1 = makeVideoSnapshot(config, {
          encoderId: 'libx264', preset: 'medium', profile: 'high', pixelFormat: 'yuv420p', quality: 31,
          width: 640, customFilters: ['vflip'],
        })
        const a0 = makeAudioSnapshot(config, {
          encoderId: 'libopus', bitrate: '160k', channelLayout: 'stereo', sampleRate: 48000,
          loudness: true, customFilters: ['volume=0.97'],
        })
        const a1 = makeAudioSnapshot(config, {
          encoderId: 'aac', bitrate: '112k', channelLayout: 'mono', sampleRate: 44100,
          loudness: false, customFilters: ['volume=0.96'],
        })
        config.streams.preserveAllVideoStreams = false
        config.streams.videoStreams = [
          { index: 0, codecMode: 'encode', videoSnapshot: v0 },
          { index: 1, codecMode: 'encode', videoSnapshot: v1 },
        ]
        config.streams.preserveAllAudioStreams = false
        config.streams.audioStreams = [
          { index: 0, codecMode: 'encode', audioSnapshot: a0 },
          { index: 1, codecMode: 'encode', audioSnapshot: a1 },
        ]
        config.streams.preserveAllSubtitleStreams = false
        config.streams.subtitleStreams = [
          { index: 0, codecMode: 'copy' },
          { index: 2, codecMode: 'copy' },
        ]
        return config
      },
      verify: (probe) => {
        assertStreams(probe, { video: 2, audio: 2, subtitle: 2 })
        const videos = streamsOf(probe, 'video')
        const audios = streamsOf(probe, 'audio')
        assertEqual(videos[0].codec_name, 'h264', 'multi-stream-all-snapshots: v0')
        assertEqual(videos[1].codec_name, 'h264', 'multi-stream-all-snapshots: v1')
        assertEqual(audios[0].codec_name, 'opus', 'multi-stream-all-snapshots: a0')
        assertEqual(audios[1].codec_name, 'aac', 'multi-stream-all-snapshots: a1')
      },
    },
    {
      id: 'explicit-stream-selection',
      description: '只选择第二视频、第二音频和第三字幕流',
      extension: 'mkv',
      expectedArgSequences: [
        ['-map', '0:v:1'], ['-map', '0:a:1'], ['-map', '0:s:2'],
        ['-c:v:0', 'copy'], ['-c:a:0', 'aac'], ['-c:s:0', 'copy'],
      ],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.multi, outputPath, 'mkv')
        config.streams.preserveAllVideoStreams = false
        config.streams.videoStreams = [{ index: 1, codecMode: 'copy' }]
        config.streams.preserveAllAudioStreams = false
        config.streams.audioStreams = [{ index: 1, codecMode: 'encode' }]
        config.audio = {
          ...config.audio,
          mode: 'encode', encoderId: 'aac', bitrate: '128k', channelLayout: 'stereo', sampleRate: 48000,
        }
        config.streams.preserveAllSubtitleStreams = false
        config.streams.subtitleStreams = [{ index: 2, codecMode: 'copy' }]
        return config
      },
      verify: (probe) => {
        assertStreams(probe, { video: 1, audio: 1, subtitle: 1 })
        assertEqual(streamsOf(probe, 'video')[0].codec_name, 'h264', 'explicit-stream-selection: 视频 copy')
        assertEqual(streamsOf(probe, 'audio')[0].codec_name, 'aac', 'explicit-stream-selection: 音频编码')
        assertEqual(streamsOf(probe, 'subtitle')[0].tags?.language, 'zho', 'explicit-stream-selection: 字幕语言')
      },
    },
    {
      id: 'target-size-two-pass',
      description: '目标文件大小工具驱动双遍视频码率',
      extension: 'mp4',
      expectedInvocationCount: 2,
      expectedArgSequences: [['-pass', '1'], ['-pass', '2'], ['-b:v'], ['-c:v', 'libx264']],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.theater, outputPath, 'mp4')
        configureVideo(config, 'libx264', 'crf', 25, 'veryfast', 'high', 'yuv420p')
        config.frame.resolution = { mode: 'width', width: 640 }
        config.frame.filters!.processing.mode = 'compatible'
        disableAudioAndSubtitles(config)
        config.tools.targetSize = {
          enabled: true,
          targetMiB: 1.2,
          durationMinutes: 0.05,
          overheadPercent: 3,
          manualAudioBitrateKbps: 0,
        }
        return config
      },
      verify: (probe, plans) => {
        assertEqual(plans.length, 2, 'target-size-two-pass: 双遍计划数')
        assertStreams(probe, { video: 1, audio: 0, subtitle: 0 })
      },
    },
    {
      id: 'advanced-filter-color-metadata',
      description: '高精度滤镜链、裁剪、锐化、降噪、去色带与 BT.709 标记',
      extension: 'mkv',
      expectedArgSequences: [['-c:v', 'libx264'], ['-vf'], ['-color_range', 'tv'], ['-colorspace', 'bt709']],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.theater, outputPath, 'mkv')
        configureVideo(config, 'libx264', 'crf', 28, 'veryfast', 'high10', 'yuv420p10le')
        config.video.color = {
          operation: 'metadata-only',
          filter: 'zscale',
          toneMap: 'none',
          range: 'tv',
          space: 'bt709',
          primaries: 'bt709',
          transfer: 'bt709',
        }
        const filters = config.frame.filters!
        filters.processing.mode = 'high-precision'
        filters.processing.bitDepth = '10'
        filters.crop = { enabled: true, width: 960, height: 540, x: 0, y: 0 }
        filters.adjustment = { enabled: true, brightness: 0.01, contrast: 1.02, saturation: 1.03, gamma: 1 }
        filters.sharpen = { enabled: true, amount: 0.4 }
        filters.denoise = { enabled: true, algorithm: 'hqdn3d', values: { lumaSpatial: 2, chromaSpatial: 1.5 } }
        filters.deband = { enabled: true, algorithm: 'deband', values: { threshold1: 0.01, threshold2: 0.01, threshold3: 0.01, range: 8 } }
        config.customArgs.videoFilters = ['fps=24']
        disableAudioAndSubtitles(config)
        return config
      },
      verify: (probe) => {
        assertStreams(probe, { video: 1, audio: 0, subtitle: 0 })
        const video = streamsOf(probe, 'video')[0]
        assertEqual(video.width, 960, 'advanced-filter-color-metadata: 宽度')
        assertEqual(video.height, 540, 'advanced-filter-color-metadata: 高度')
        assert(video.pix_fmt?.includes('10') ?? false, `advanced-filter-color-metadata: 非 10-bit ${video.pix_fmt}`)
      },
    },
    {
      id: 'zscale-tagged-color-conversion',
      description: '有完整 bt709 源标签时执行 zscale 转换并写入输出标签',
      extension: 'mkv',
      expectedArgSequences: [['-vf'], ['-colorspace', 'bt709'], ['-color_primaries', 'bt709'], ['-color_trc', 'bt709']],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.rough, outputPath, 'mkv')
        configureVideo(config, 'libx264', 'crf', 29, 'veryfast', 'high', 'yuv420p')
        config.frame.resolution = { mode: 'width', width: 640 }
        config.frame.filters!.processing.mode = 'compatible'
        config.video.color = {
          operation: 'convert-and-tag',
          filter: 'zscale',
          toneMap: 'none',
          range: 'tv',
          space: 'bt709',
          primaries: 'bt709',
          transfer: 'bt709',
        }
        config.input.probe = {
          inputPath: config.input.path,
          videoStreams: [{
            index: 0,
            pixFmt: 'yuv420p',
            width: 1920,
            height: 1080,
            colorRange: 'tv',
            colorSpace: 'bt709',
            colorPrimaries: 'bt709',
            colorTransfer: 'bt709',
          }],
        }
        disableAudioAndSubtitles(config)
        return config
      },
      verify: (probe) => {
        const video = streamsOf(probe, 'video')[0]
        assertEqual(video.color_space, 'bt709', 'zscale-tagged-color-conversion: 色彩矩阵')
        assertEqual(video.color_primaries, 'bt709', 'zscale-tagged-color-conversion: 主色')
        assertEqual(video.color_transfer, 'bt709', 'zscale-tagged-color-conversion: 传递函数')
      },
    },
    {
      id: 'libplacebo-untagged-color-conversion',
      description: '无源色彩标签时使用 libplacebo 转换并写入 bt709 标签',
      extension: 'mkv',
      expectedArgSequences: [['-vf'], ['-colorspace', 'bt709'], ['-color_primaries', 'bt709'], ['-color_trc', 'bt709']],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.theater, outputPath, 'mkv')
        configureVideo(config, 'libx264', 'crf', 29, 'veryfast', 'high', 'yuv420p')
        config.frame.resolution = { mode: 'width', width: 640 }
        config.frame.filters!.processing.mode = 'compatible'
        config.video.color = {
          operation: 'convert-and-tag',
          filter: 'libplacebo',
          toneMap: 'none',
          range: 'tv',
          space: 'bt709',
          primaries: 'bt709',
          transfer: 'bt709',
        }
        config.input.probe = {
          inputPath: config.input.path,
          videoStreams: [{ index: 0, pixFmt: 'yuv420p', width: 1280, height: 720, colorRange: 'tv' }],
        }
        disableAudioAndSubtitles(config)
        return config
      },
      verify: (probe) => {
        const video = streamsOf(probe, 'video')[0]
        assertEqual(video.color_space, 'bt709', 'libplacebo-untagged-color-conversion: 色彩矩阵')
        assertEqual(video.color_primaries, 'bt709', 'libplacebo-untagged-color-conversion: 主色')
        assertEqual(video.color_transfer, 'bt709', 'libplacebo-untagged-color-conversion: 传递函数')
      },
    },
    {
      id: 'cuda-hwdecode-cpu-high-precision-hdr10',
      description: 'CUDA 硬解 HDR10，按 p010le 下载后执行多段 CPU 高精度滤镜并以 HEVC NVENC 输出',
      extension: 'mkv',
      hardwareRequirement: { runtime: 'nvidia-cuda' },
      expectedArgSequences: [
        ['-hwaccel', 'cuda'], ['-hwaccel_output_format', 'cuda'], ['-hwaccel_device', '0'],
        ['-c:v:0', 'hevc_nvenc'], ['-multipass:v:0', 'qres'], ['-pix_fmt:v:0', 'yuv420p10le'], ['-filter:v:0'],
      ],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.complex, outputPath, 'mkv')
        configureNvenc(config, 'hevc_nvenc', 'main10', 'qres', 'yuv420p10le', '6000k')
        config.input.decode = {
          hwaccel: 'cuda', outputFormat: 'cuda',
          device: { parameter: 'hwaccel_device', value: '0' },
        }
        config.input.probe = hdr10ComplexProbe(config.input.path)
        config.streams.preserveAllVideoStreams = false
        config.streams.videoStreams = [{ index: 0, codecMode: 'encode' }]
        config.frame.resolution = { mode: 'width', width: 1280 }
        config.frame.filters!.processing.mode = 'high-precision'
        config.frame.filters!.adjustment = {
          enabled: true, brightness: 0.01, contrast: 1.01, saturation: 1.01, gamma: 1,
        }
        config.frame.filters!.sharpen = { enabled: true, amount: 0.25 }
        config.customArgs.videoFilters = ['hflip']
        disableAudioAndSubtitles(config)
        return config
      },
      verify: (probe, plans) => {
        const vf = argumentValue(plans, '-filter:v:0')
        assert(vf?.startsWith('hwdownload,format=pix_fmts=p010le,format=pix_fmts=yuv420p10le') ?? false,
          `cuda-hwdecode-cpu-high-precision-hdr10: 硬件下载边界错误 ${vf}`)
        assertHdr10Video(probe, 1280, 720, 'cuda-hwdecode-cpu-high-precision-hdr10')
      },
    },
    {
      id: 'd3d11-device1-cpu-high-precision-hdr10',
      description: 'D3D11VA 明确选择 RTX 3060 适配器 1，下载 HDR10 硬件帧后执行 CPU 滤镜',
      extension: 'mkv',
      hardwareRequirement: { runtime: 'nvidia-d3d11-device1' },
      expectedArgSequences: [
        ['-hwaccel', 'd3d11va'], ['-hwaccel_output_format', 'd3d11'], ['-hwaccel_device', '1'],
        ['-c:v:0', 'hevc_nvenc'], ['-multipass:v:0', 'fullres'], ['-filter:v:0'],
      ],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.complex, outputPath, 'mkv')
        configureNvenc(config, 'hevc_nvenc', 'main10', 'fullres', 'yuv420p10le', '6000k')
        config.input.decode = {
          hwaccel: 'd3d11va', outputFormat: 'd3d11',
          device: { parameter: 'hwaccel_device', value: '1' },
        }
        config.input.probe = hdr10ComplexProbe(config.input.path)
        config.streams.preserveAllVideoStreams = false
        config.streams.videoStreams = [{ index: 0, codecMode: 'encode' }]
        config.frame.resolution = { mode: 'width', width: 1280 }
        config.frame.filters!.processing.mode = 'high-precision'
        config.frame.filters!.transform.horizontalFlip = true
        config.customArgs.videoFilters = ['unsharp=5:5:0.2']
        disableAudioAndSubtitles(config)
        return config
      },
      verify: (probe, plans) => {
        const vf = argumentValue(plans, '-filter:v:0')
        assert(vf?.startsWith('hwdownload,format=pix_fmts=p010le,format=pix_fmts=yuv420p10le') ?? false,
          `d3d11-device1-cpu-high-precision-hdr10: 硬件下载边界错误 ${vf}`)
        assertHdr10Video(probe, 1280, 720, 'd3d11-device1-cpu-high-precision-hdr10')
      },
    },
    {
      id: 'cuda-zero-copy-multi-filter-hdr10',
      description: 'CUDA 硬解后保持 10-bit 设备帧，连续执行两级 scale_cuda 并交给 NVENC',
      extension: 'mkv',
      hardwareRequirement: { runtime: 'nvidia-cuda', filters: ['scale_cuda'] },
      expectedArgSequences: [
        ['-hwaccel', 'cuda'], ['-hwaccel_output_format', 'cuda'], ['-hwaccel_device', '0'],
        ['-c:v:0', 'hevc_nvenc'], ['-multipass:v:0', 'qres'], ['-filter:v:0'],
      ],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.complex, outputPath, 'mkv')
        configureNvenc(config, 'hevc_nvenc', 'main10', 'qres', 'auto', '6000k')
        config.input.decode = {
          hwaccel: 'cuda', outputFormat: 'cuda',
          device: { parameter: 'hwaccel_device', value: '0' },
        }
        config.input.probe = hdr10ComplexProbe(config.input.path)
        config.streams.preserveAllVideoStreams = false
        config.streams.videoStreams = [{ index: 0, codecMode: 'encode' }]
        config.frame.filters!.processing.mode = 'compatible'
        config.customArgs.videoFilters = [
          'scale_cuda=1920:1080:format=p010le:interp_algo=lanczos:passthrough=0',
          'scale_cuda=1280:720:format=p010le:interp_algo=lanczos:passthrough=0',
        ]
        disableAudioAndSubtitles(config)
        return config
      },
      verify: (probe, plans) => {
        const vf = argumentValue(plans, '-filter:v:0')
        assertEqual(
          vf,
          'scale_cuda=1920:1080:format=p010le:interp_algo=lanczos:passthrough=0,scale_cuda=1280:720:format=p010le:interp_algo=lanczos:passthrough=0',
          'cuda-zero-copy-multi-filter-hdr10: CUDA 滤镜顺序',
        )
        assertHdr10Video(probe, 1280, 720, 'cuda-zero-copy-multi-filter-hdr10')
      },
    },
    {
      id: 'cuda-zero-copy-bilateral-8bit-aligned',
      description: 'CUDA 硬解 8-bit NV12，按 32 像素对齐高度连续执行缩放、双边降噪与范围处理',
      extension: 'mkv',
      hardwareRequirement: {
        runtime: 'nvidia-cuda',
        filters: ['scale_cuda', 'bilateral_cuda', 'colorspace_cuda'],
      },
      expectedArgSequences: [
        ['-hwaccel', 'cuda'], ['-hwaccel_output_format', 'cuda'], ['-hwaccel_device', '0'],
        ['-c:v', 'h264_nvenc'], ['-multipass', 'qres'], ['-vf'],
      ],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.theater, outputPath, 'mkv')
        configureNvenc(config, 'h264_nvenc', 'high', 'qres', 'auto', '3000k')
        config.input.decode = {
          hwaccel: 'cuda', outputFormat: 'cuda',
          device: { parameter: 'hwaccel_device', value: '0' },
        }
        config.frame.filters!.processing.mode = 'compatible'
        config.customArgs.videoFilters = [
          'scale_cuda=640:352:format=nv12:interp_algo=lanczos',
          'bilateral_cuda=sigmaS=1:sigmaR=0.1:window_size=3',
          'colorspace_cuda=range=tv',
        ]
        disableAudioAndSubtitles(config)
        return config
      },
      verify: (probe, plans) => {
        const vf = argumentValue(plans, '-vf')
        assertEqual(
          vf,
          'scale_cuda=640:352:format=nv12:interp_algo=lanczos,bilateral_cuda=sigmaS=1:sigmaR=0.1:window_size=3,colorspace_cuda=range=tv',
          'cuda-zero-copy-bilateral-8bit-aligned: CUDA 滤镜顺序',
        )
        const video = streamsOf(probe, 'video')[0]
        assertEqual(video.codec_name, 'h264', 'cuda-zero-copy-bilateral-8bit-aligned: 视频编码')
        assertEqual(video.width, 640, 'cuda-zero-copy-bilateral-8bit-aligned: 宽度')
        assertEqual(video.height, 352, 'cuda-zero-copy-bilateral-8bit-aligned: 高度')
        assertEqual(video.pix_fmt, 'yuv420p', 'cuda-zero-copy-bilateral-8bit-aligned: 像素格式')
      },
    },
    {
      id: 'cpu-to-cuda-mixed-filter-chain',
      description: '软件帧先执行受控 CPU 裁剪/翻转，再上传 CUDA、缩放与降噪后交给 H.264 NVENC',
      extension: 'mkv',
      hardwareRequirement: { runtime: 'nvidia-cuda', filters: ['hwupload_cuda', 'scale_cuda'] },
      expectedArgSequences: [['-c:v', 'h264_nvenc'], ['-multipass', 'disabled'], ['-vf']],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.theater, outputPath, 'mkv')
        configureNvenc(config, 'h264_nvenc', 'high', 'disabled', 'auto', '3000k')
        config.frame.filters!.processing.mode = 'compatible'
        config.frame.filters!.crop = { enabled: true, width: 1278, height: 718, x: 0, y: 0 }
        config.frame.filters!.transform.horizontalFlip = true
        config.customArgs.videoFilters = [
          'hwupload_cuda',
          'scale_cuda=640:360:format=nv12:interp_algo=lanczos',
        ]
        disableAudioAndSubtitles(config)
        return config
      },
      verify: (probe, plans) => {
        const vf = argumentValue(plans, '-vf')
        assertEqual(
          vf,
          'crop=1278:718:0:0,hflip,hwupload_cuda,scale_cuda=640:360:format=nv12:interp_algo=lanczos',
          'cpu-to-cuda-mixed-filter-chain: CPU/CUDA 滤镜顺序',
        )
        const video = streamsOf(probe, 'video')[0]
        assertEqual(video.codec_name, 'h264', 'cpu-to-cuda-mixed-filter-chain: 视频编码')
        assertEqual(video.width, 640, 'cpu-to-cuda-mixed-filter-chain: 宽度')
        assertEqual(video.height, 360, 'cpu-to-cuda-mixed-filter-chain: 高度')
        assertEqual(video.pix_fmt, 'yuv420p', 'cpu-to-cuda-mixed-filter-chain: 像素格式')
      },
    },
    {
      id: 'cuda-4k60-hdr10-fullres-stress',
      description: '原始 4K60 HDR10 取 10 秒，CUDA 硬解与双级 4K CUDA 处理后使用 HEVC NVENC fullres',
      extension: 'mkv',
      hardwareRequirement: { runtime: 'nvidia-cuda', filters: ['scale_cuda'] },
      expectedArgSequences: [
        ['-hwaccel', 'cuda'], ['-hwaccel_output_format', 'cuda'], ['-hwaccel_device', '0'],
        ['-c:v:0', 'hevc_nvenc'], ['-multipass:v:0', 'fullres'], ['-filter:v:0'], ['-t', '10'],
      ],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.complexFull, outputPath, 'mkv')
        configureNvenc(config, 'hevc_nvenc', 'main10', 'fullres', 'auto', '16000k')
        config.input.decode = {
          hwaccel: 'cuda', outputFormat: 'cuda',
          device: { parameter: 'hwaccel_device', value: '0' },
        }
        config.input.probe = hdr10ComplexProbe(config.input.path)
        config.streams.preserveAllVideoStreams = false
        config.streams.videoStreams = [{ index: 0, codecMode: 'encode' }]
        config.frame.filters!.processing.mode = 'compatible'
        config.customArgs.videoFilters = [
          'scale_cuda=3840:2160:format=p010le:interp_algo=lanczos:passthrough=0',
          'scale_cuda=3840:2160:format=p010le:interp_algo=lanczos:passthrough=0',
        ]
        config.customArgs.preOutputArgs = ['-t 10']
        disableAudioAndSubtitles(config)
        return config
      },
      verify: (probe) => {
        assertHdr10Video(probe, 3840, 2160, 'cuda-4k60-hdr10-fullres-stress')
        const duration = Number(probe.format?.duration)
        assert(duration >= 9.5 && duration <= 10.5, `cuda-4k60-hdr10-fullres-stress: 时长异常 ${duration}`)
      },
    },
    {
      id: 'complex-2v-3a-mixed-encode-copy',
      description: '4K HDR10 视频转码、1080p 视频复制，并保留 TrueHD/AC-3/E-AC-3 三音轨',
      extension: 'mkv',
      hardwareRequirement: { runtime: 'nvidia-encode' },
      expectedArgSequences: [
        ['-map', '0:v:0'], ['-map', '0:v:1'], ['-c:v:0', 'hevc_nvenc'], ['-c:v:1', 'copy'],
        ['-map', '0:a:0'], ['-map', '0:a:1'], ['-map', '0:a:2'],
        ['-c:a:0', 'copy'], ['-c:a:1', 'copy'], ['-c:a:2', 'copy'],
      ],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.complex, outputPath, 'mkv')
        configureNvenc(config, 'hevc_nvenc', 'main10', 'qres', 'yuv420p10le', '6000k')
        config.input.probe = hdr10ComplexProbe(config.input.path)
        config.streams.preserveAllVideoStreams = false
        config.streams.videoStreams = [
          { index: 0, codecMode: 'encode' },
          { index: 1, codecMode: 'copy' },
        ]
        config.streams.preserveAllAudioStreams = false
        config.streams.audioStreams = [
          { index: 0, codecMode: 'copy' },
          { index: 1, codecMode: 'copy' },
          { index: 2, codecMode: 'copy' },
        ]
        config.audio.mode = 'copy'
        config.streams.preserveAllSubtitleStreams = false
        config.streams.subtitleStreams = []
        config.subtitle.tracks = []
        config.frame.resolution = { mode: 'width', width: 1280 }
        config.frame.filters!.processing.mode = 'high-precision'
        return config
      },
      verify: (probe) => {
        assertStreams(probe, { video: 2, audio: 3, subtitle: 0 })
        const videos = streamsOf(probe, 'video')
        assertEqual(videos[0]?.codec_name, 'hevc', 'complex-2v-3a: 编码视频格式')
        assertEqual(videos[0]?.width, 1280, 'complex-2v-3a: 编码视频宽度')
        assertEqual(videos[0]?.height, 720, 'complex-2v-3a: 编码视频高度')
        assert(videos[0]?.pix_fmt?.includes('10') ?? false, `complex-2v-3a: 编码视频非 10-bit ${videos[0]?.pix_fmt}`)
        assertEqual(videos[1]?.width, 1920, 'complex-2v-3a: 复制视频宽度')
        assertEqual(videos[1]?.height, 1080, 'complex-2v-3a: 复制视频高度')
        assertEqual(
          streamsOf(probe, 'audio').map((stream) => stream.codec_name).join(','),
          'truehd,ac3,eac3',
          'complex-2v-3a: 音频编码顺序',
        )
      },
    },
    {
      id: 'preserve-all-partial-subtitle-config',
      description: 'preserve-all 配置单条字幕时其余 PGS 仍以 copy 兜底',
      extension: 'mkv',
      expectedArgSequences: [['-map', '0:s?'], ['-c:s:0', 'copy'], ['-c:s', 'copy']],
      makeConfig: (fixtures, outputPath) => {
        const config = baseConfig(fixtures.rough, outputPath, 'mkv')
        config.video.mode = 'copy'
        config.audio.mode = 'copy'
        config.streams.preserveAllVideoStreams = true
        config.streams.preserveAllAudioStreams = true
        config.streams.preserveAllSubtitleStreams = true
        config.subtitle.tracks = [{
          id: 'pgs-0',
          source: 'input',
          mainStreamRelIndex: 0,
          codecMode: 'copy',
          sourceCodecKnown: true,
          sourceCodec: 'hdmv_pgs_subtitle',
          disposition: {},
        }]
        return config
      },
      verify: (probe) => {
        assertStreams(probe, { video: 1, audio: 2, subtitle: 4 })
        assert(streamsOf(probe, 'subtitle').every((stream) => stream.codec_name === 'hdmv_pgs_subtitle'), 'preserve-all-partial-subtitle-config: PGS 未全部保留')
      },
    },
  ]
}

function runProductSafetyAudits(fixtures: MediaFixtures): number {
  const audits: Array<{ name: string; run: () => void }> = [
    {
      name: 'untagged zscale conversion is blocked',
      run: () => {
        const config = baseConfig(fixtures.theater, join(temporaryRoot, 'blocked-zscale.mkv'), 'mkv')
        config.video.color = {
          operation: 'convert-and-tag', filter: 'zscale', toneMap: 'none',
          range: 'tv', space: 'bt709', primaries: 'bt709', transfer: 'bt709',
        }
        config.input.probe = {
          inputPath: config.input.path,
          videoStreams: [{ index: 0, pixFmt: 'yuv420p', width: 1280, height: 720, colorRange: 'tv' }],
        }
        assertDiagnostic(config, 'error.color.zscale.sourceMetadata')
      },
    },
    {
      name: 'PGS to text subtitle transcode is blocked',
      run: () => {
        const config = baseConfig(fixtures.rough, join(temporaryRoot, 'blocked-pgs.mp4'), 'mp4')
        config.subtitle.tracks = [{
          id: 'pgs', source: 'input', mainStreamRelIndex: 0, codecMode: 'transcode',
          codec: 'mov_text', sourceCodecKnown: true, sourceCodec: 'hdmv_pgs_subtitle', disposition: {},
        }]
        assertDiagnostic(config, 'error.subtitle.transcode.mediaType')
      },
    },
    {
      name: 'multiple encoded video streams with passlog two-pass are blocked',
      run: () => {
        const config = baseConfig(fixtures.multi, join(temporaryRoot, 'blocked-multi-pass.mp4'), 'mp4')
        config.streams.preserveAllVideoStreams = false
        config.streams.videoStreams = [
          { index: 0, codecMode: 'encode' },
          { index: 1, codecMode: 'encode' },
        ]
        config.video.rateControl = { mode: 'twoPass', bitrate: '2000k', additionalValues: {} }
        assertDiagnostic(config, 'error.twopass.multipleVideoStreams')
      },
    },
    {
      name: 'preserve-all partial subtitle config retains global copy fallback',
      run: () => {
        const config = baseConfig(fixtures.rough, join(temporaryRoot, 'subtitle-fallback.mkv'), 'mkv')
        config.streams.preserveAllSubtitleStreams = true
        config.subtitle.tracks = [{
          id: 'pgs', source: 'input', mainStreamRelIndex: 0, codecMode: 'copy',
          sourceCodecKnown: true, sourceCodec: 'hdmv_pgs_subtitle', disposition: {},
        }]
        const normalized = normalizeConfig(config, config, catalog).config
        const plans = buildExecutionPlans(buildCommandPlan(normalized, catalog, []))
        assertArgSequences(plans, [['-c:s', 'copy'], ['-c:s:0', 'copy']], 'subtitle-fallback')
      },
    },
    {
      name: 'hardware-frame CPU pipeline without a matching probe is blocked',
      run: () => {
        const config = baseConfig(fixtures.complex, join(temporaryRoot, 'blocked-hwdownload-format.mkv'), 'mkv')
        config.input.decode = { hwaccel: 'cuda', outputFormat: 'cuda' }
        config.frame.filters!.crop.enabled = true
        assertDiagnostic(config, 'error.decode.outputFormat.hardwareDownloadFormatUnknown')
      },
    },
    {
      name: 'hardware-frame GPU pipeline with a forced software pixel format is blocked',
      run: () => {
        const config = baseConfig(fixtures.complex, join(temporaryRoot, 'blocked-hardware-pixfmt.mkv'), 'mkv')
        config.input.decode = { hwaccel: 'cuda', outputFormat: 'cuda' }
        config.frame.filters!.processing.mode = 'compatible'
        config.customArgs.videoFilters = ['scale_cuda=1280:720:format=p010le']
        config.video.pixelFormat = 'yuv420p10le'
        assertDiagnostic(config, 'error.decode.outputFormat.hardwareFramesExplicitPixelFormat')
      },
    },
    {
      name: 'controlled CPU filters cannot consume hardware frames in compatible mode',
      run: () => {
        const config = baseConfig(fixtures.complex, join(temporaryRoot, 'blocked-hardware-cpu-filter.mkv'), 'mkv')
        config.input.decode = { hwaccel: 'cuda', outputFormat: 'cuda' }
        config.frame.filters!.processing.mode = 'compatible'
        config.frame.filters!.crop.enabled = true
        config.video.pixelFormat = 'auto'
        assertDiagnostic(config, 'error.decode.outputFormat.hardwareFramesCpuFilter')
      },
    },
  ]

  for (const audit of audits) {
    audit.run()
    console.log(`PASS safety — ${audit.name}`)
  }
  return audits.length
}

function assertDiagnostic(config: ProjectConfig, code: string): void {
  const normalized = normalizeConfig(config, config, catalog).config
  const diagnostics = validateConfig(normalized, catalog, ruleIndex)
  assert(diagnostics.some((diagnostic) => diagnostic.code === code), `缺少安全诊断 ${code}`)
}

function baseConfig(inputPath: string, outputPath: string, containerId: string): ProjectConfig {
  const config = createDefaultProjectConfig()
  config.input.path = inputPath
  config.output.path = outputPath
  config.output.containerId = containerId
  config.output.overwrite = true
  config.output.hideBanner = true
  config.output.metadata = { globalRaw: '', streamRaw: '' }
  return config
}

function configureVideo(
  config: ProjectConfig,
  encoderId: string,
  mode: 'crf' | 'twoPass',
  quality: number | undefined,
  preset: string | number,
  profile: string,
  pixelFormat: string,
): void {
  config.video = {
    ...config.video,
    mode: 'encode',
    encoderId,
    preset,
    profile,
    tune: 'auto',
    pixelFormat,
    rateControl: { mode, qualityValue: quality, additionalValues: {} },
    specialParameters: {},
  }
}

function configureNvenc(
  config: ProjectConfig,
  encoderId: 'h264_nvenc' | 'hevc_nvenc',
  profile: string,
  multipass: 'disabled' | 'qres' | 'fullres',
  pixelFormat: string,
  bitrate: string,
): void {
  config.video = {
    ...config.video,
    mode: 'encode',
    encoderId,
    preset: 'p4',
    profile,
    tune: 'hq',
    pixelFormat,
    rateControl: {
      mode: 'vbr', bitrate, maxRate: bitrate,
      bufferSize: `${Number.parseInt(bitrate, 10) * 2}k`, additionalValues: {},
    },
    specialParameters: { multipass },
  }
}

function hdr10ComplexProbe(inputPath: string): InputProbeSummary {
  return {
    inputPath,
    videoStreams: [
      {
        index: 0, pixFmt: 'yuv420p10le', width: 3840, height: 2160,
        colorRange: 'tv', colorSpace: 'bt2020nc', colorPrimaries: 'bt2020', colorTransfer: 'smpte2084',
      },
      {
        index: 1, pixFmt: 'yuv420p10le', width: 1920, height: 1080,
        colorRange: 'tv', colorSpace: 'bt2020nc', colorPrimaries: 'bt2020', colorTransfer: 'smpte2084',
      },
    ],
  }
}

function disableAudioAndSubtitles(config: ProjectConfig): void {
  config.audio.mode = 'disabled'
  config.streams.preserveAllAudioStreams = false
  config.streams.audioStreams = []
  config.streams.preserveAllSubtitleStreams = false
  config.streams.subtitleStreams = []
  config.subtitle.tracks = []
}

function makeVideoSnapshot(
  config: ProjectConfig,
  values: {
    encoderId: string
    preset: string | number
    profile: string
    pixelFormat: string
    quality: number
    width: number
    customFilters: string[]
  },
): VideoEncodingSnapshot {
  const frame = structuredClone(config.frame)
  frame.resolution = { mode: 'width', width: values.width }
  frame.frameRate = { mode: 'value', value: 24 }
  frame.filters!.processing.mode = 'compatible'
  return {
    snapshotVersion: 1,
    video: {
      codecCategory: config.video.codecCategory,
      encoderId: values.encoderId,
      preset: values.preset,
      profile: values.profile,
      tune: 'auto',
      pixelFormat: values.pixelFormat,
      color: structuredClone(config.video.color),
      threads: 2,
      rateControl: { mode: 'crf', qualityValue: values.quality, additionalValues: {} },
      specialParameters: { threads: 2 },
    },
    frame,
    customVideoFilters: values.customFilters,
  }
}

function makeAudioSnapshot(
  config: ProjectConfig,
  values: {
    encoderId: string
    bitrate: string
    channelLayout: string
    sampleRate: number
    loudness: boolean
    customFilters: string[]
  },
): AudioEncodingSnapshot {
  return {
    snapshotVersion: 1,
    audio: {
      encoderId: values.encoderId,
      bitrate: values.bitrate,
      channelLayout: values.channelLayout,
      sampleRate: values.sampleRate,
      qualityValues: {},
      loudnessNormalization: {
        ...structuredClone(config.audio.loudnessNormalization),
        integratedLoudnessEnabled: values.loudness,
        integratedLoudness: -20,
        truePeakEnabled: values.loudness,
        truePeak: -2,
      },
    },
    customAudioFilters: values.customFilters,
  }
}

function buildProductPlans(config: ProjectConfig): ExecutionPlan[] {
  const normalized = normalizeConfig(config, config, catalog).config
  const diagnostics = validateConfig(normalized, catalog, ruleIndex)
  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === 'error')
  if (errors.length > 0) {
    throw new Error(`产品配置校验失败：${errors.map((diagnostic) => `${diagnostic.code}: ${diagnostic.message}`).join(' | ')}`)
  }
  return buildExecutionPlans(buildCommandPlan(normalized, catalog, diagnostics))
}

function executePlans(ffmpeg: string, plans: ExecutionPlan[], caseId: string): void {
  for (let index = 0; index < plans.length; index += 1) {
    const result = run(ffmpeg, plans[index].args, 180_000)
    if (result.status !== 0) {
      throw new Error(`${caseId}: 第 ${index + 1}/${plans.length} 个命令失败（${result.status}）\n${tail(result.stderr, 24)}`)
    }
  }
}

function probeFile(ffprobe: string, path: string): ProbeResult {
  const result = run(ffprobe, [
    '-v', 'error', '-show_streams', '-show_format', '-show_chapters', '-of', 'json', path,
  ])
  if (result.status !== 0) throw new Error(`ffprobe 失败：${tail(result.stderr, 12)}`)
  return JSON.parse(result.stdout) as ProbeResult
}

function decodeCheck(ffmpeg: string, path: string): void {
  const result = run(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-xerror', '-i', path,
    '-map', '0:v?', '-map', '0:a?', '-f', 'null', '-',
  ], 180_000)
  if (result.status !== 0) throw new Error(`输出完整解码检查失败：${tail(result.stderr, 16)}`)
}

function prepareFixtures(
  ffmpeg: string,
  sources: { tsu: string; theater: string; rough: string; complex: string },
  root: string,
): MediaFixtures {
  const fixtureDir = join(root, 'fixtures')
  mkdirSync(fixtureDir, { recursive: true })
  const tsu = join(fixtureDir, 'tsu-short.mkv')
  const theater = join(fixtureDir, 'theater-short.mkv')
  const rough = join(fixtureDir, 'rough-short.mkv')
  const complex = join(fixtureDir, 'complex-4k60-hdr10-2v-3a.mkv')
  const multi = join(fixtureDir, 'multi-2v-2a-4s.mkv')
  const subtitleAss = join(fixtureDir, 'overlay.ass')

  trimFixture(ffmpeg, sources.tsu, tsu, ['-map', '0:v:0'])
  trimFixture(ffmpeg, sources.theater, theater, ['-map', '0:v:0'])
  trimFixture(ffmpeg, sources.rough, rough, ['-map', '0'])
  trimFixture(ffmpeg, sources.complex, complex, ['-map', '0'])

  const multiResult = run(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', tsu, '-i', theater, '-i', rough,
    '-map', '0:v:0', '-map', '1:v:0', '-map', '2:a:0', '-map', '2:a:1', '-map', '2:s?',
    '-c', 'copy', '-map_metadata', '2', '-map_chapters', '2', multi,
  ], 120_000)
  if (multiResult.status !== 0) throw new Error(`无法创建多流夹具：${tail(multiResult.stderr, 20)}`)

  writeFileSync(subtitleAss, [
    '[Script Info]',
    'ScriptType: v4.00+',
    'PlayResX: 1280',
    'PlayResY: 720',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    'Style: Default,Arial,40,&H00FFFFFF,&H000000FF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,2,1,2,20,20,30,1',
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
    'Dialogue: 0,0:00:00.20,0:00:02.50,Default,,0,0,0,,FFCodec Lab real-media test',
    '',
  ].join('\n'), 'utf8')

  return { tsu, theater, rough, complex, complexFull: sources.complex, multi, subtitleAss }
}

function trimFixture(ffmpeg: string, input: string, output: string, maps: string[]): void {
  const result = run(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', input,
    ...maps, '-t', '3', '-c', 'copy', '-avoid_negative_ts', 'make_zero', output,
  ], 120_000)
  if (result.status !== 0) throw new Error(`无法裁剪夹具 ${basename(input)}：${tail(result.stderr, 20)}`)
}

function resolveHardwareCaseSkipReason(
  ffmpeg: string,
  fixtures: MediaFixtures,
  requirement: NonNullable<MatrixCase['hardwareRequirement']>,
): string | undefined {
  if (requirement.filters?.length) {
    let registeredFilters = filterCapabilityCache.get(ffmpeg)
    if (registeredFilters === undefined) {
      const result = run(ffmpeg, ['-hide_banner', '-filters'])
      registeredFilters = result.status === 0 ? result.stdout + result.stderr : ''
      filterCapabilityCache.set(ffmpeg, registeredFilters)
    }
    const missing = requirement.filters.filter((filter) => !new RegExp(`\\b${filter}\\b`).test(registeredFilters))
    if (missing.length > 0) return `当前构建未注册滤镜：${missing.join(', ')}`
  }

  const cacheKey = `${ffmpeg}\u0000${requirement.runtime}`
  if (hardwarePreflightCache.has(cacheKey)) return hardwarePreflightCache.get(cacheKey)

  const preflightArgs = requirement.runtime === 'nvidia-encode'
    ? [
        '-hide_banner', '-loglevel', 'error',
        '-f', 'lavfi', '-i', 'color=size=64x64:rate=1',
        '-frames:v', '1', '-c:v', 'hevc_nvenc', '-f', 'null', '-',
      ]
    : requirement.runtime === 'nvidia-cuda'
      ? [
          '-hide_banner', '-loglevel', 'error',
          '-hwaccel', 'cuda', '-hwaccel_output_format', 'cuda', '-hwaccel_device', '0',
          '-i', fixtures.theater, '-map', '0:v:0', '-frames:v', '1',
          '-c:v', 'h264_nvenc', '-f', 'null', '-',
        ]
      : [
          '-hide_banner', '-loglevel', 'error',
          '-hwaccel', 'd3d11va', '-hwaccel_output_format', 'd3d11', '-hwaccel_device', '1',
          '-i', fixtures.complex, '-map', '0:v:0', '-frames:v', '1',
          '-vf', 'hwdownload,format=p010le', '-c:v', 'hevc_nvenc', '-f', 'null', '-',
        ]
  const result = run(ffmpeg, preflightArgs, 30_000)
  const reason = result.status === 0 ? undefined : firstErrorLine(result.stderr || result.stdout)
  hardwarePreflightCache.set(cacheKey, reason)
  return reason
}

function runHardwareMatrix(
  ffmpeg: string,
  ffprobe: string,
  inputPath: string,
  outputDir: string,
): { total: number; passed: number; skipped: number; failed: number } {
  const encoders = [
    { id: 'h264_nvenc', codec: 'h264' },
    { id: 'hevc_nvenc', codec: 'hevc' },
    { id: 'av1_nvenc', codec: 'av1' },
    { id: 'h264_qsv', codec: 'h264' },
    { id: 'hevc_qsv', codec: 'hevc' },
    { id: 'av1_qsv', codec: 'av1' },
    { id: 'h264_amf', codec: 'h264' },
    { id: 'hevc_amf', codec: 'hevc' },
    { id: 'av1_amf', codec: 'av1' },
  ]
  let passed = 0
  let skipped = 0
  let failed = 0
  let total = 0

  for (const encoder of encoders) {
    const multipassModes = ['h264_nvenc', 'hevc_nvenc'].includes(encoder.id)
      ? ['disabled', 'qres', 'fullres'] as const
      : [undefined] as const
    total += multipassModes.length
    const registration = run(ffmpeg, ['-hide_banner', '-h', `encoder=${encoder.id}`])
    if (registration.status !== 0 || /Unknown encoder|not recognized/i.test(registration.stdout + registration.stderr)) {
      skipped += multipassModes.length
      for (const multipass of multipassModes) {
        const caseId = `hardware-${encoder.id}${multipass ? `-${multipass}` : ''}`
        console.log(`SKIP ${caseId} — 当前构建未注册`)
      }
      continue
    }
    const preflight = run(ffmpeg, [
      '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=320x180:d=0.12',
      '-frames:v', '1', '-c:v', encoder.id, '-f', 'null', '-',
    ], 30_000)
    if (preflight.status !== 0) {
      skipped += multipassModes.length
      for (const multipass of multipassModes) {
        const caseId = `hardware-${encoder.id}${multipass ? `-${multipass}` : ''}`
        console.log(`SKIP ${caseId} — 本机 GPU/驱动会话不可用：${firstErrorLine(preflight.stderr)}`)
      }
      continue
    }

    for (const multipass of multipassModes) {
      const caseId = `hardware-${encoder.id}${multipass ? `-${multipass}` : ''}`
      const outputPath = join(outputDir, `${caseId}.mkv`)
      try {
        const config = baseConfig(inputPath, outputPath, 'mkv')
        config.video = {
          ...config.video,
          mode: 'encode',
          encoderId: encoder.id,
          preset: undefined,
          profile: 'auto',
          tune: 'auto',
          pixelFormat: 'yuv420p',
          rateControl: { mode: 'vbr', bitrate: '1200k', additionalValues: {} },
          specialParameters: multipass ? { multipass } : {},
        }
        config.frame.resolution = { mode: 'width', width: 640 }
        config.frame.filters!.processing.mode = 'compatible'
        disableAudioAndSubtitles(config)
        const plans = buildProductPlans(config)
        if (multipass) assertArgSequences(plans, [['-multipass', multipass]], caseId)
        executePlans(ffmpeg, plans, caseId)
        const probe = probeFile(ffprobe, outputPath)
        assertEqual(streamsOf(probe, 'video')[0]?.codec_name, encoder.codec, `${caseId}: 编码格式`)
        decodeCheck(ffmpeg, outputPath)
        passed += 1
        console.log(`PASS ${caseId} — 产品命令硬件实跑${multipass ? `，multipass=${multipass}` : ''}`)
      } catch (error) {
        failed += 1
        console.error(`FAIL ${caseId} — ${formatError(error)}`)
      }
    }
  }
  return { total, passed, skipped, failed }
}

function assertArgSequences(plans: ExecutionPlan[], sequences: string[][], caseId: string): void {
  for (const sequence of sequences) {
    const found = plans.some((plan) => containsSequence(plan.args, sequence))
    assert(found, `${caseId}: 命令缺少连续参数 ${sequence.join(' ')}`)
  }
}

function argumentValue(plans: ExecutionPlan[], option: string): string | undefined {
  for (const plan of plans) {
    const index = plan.args.indexOf(option)
    if (index >= 0) return plan.args[index + 1]
  }
  return undefined
}

function assertHdr10Video(probe: ProbeResult, width: number, height: number, caseId: string): void {
  const video = streamsOf(probe, 'video')[0]
  assertEqual(video?.codec_name, 'hevc', `${caseId}: 视频编码`)
  assertEqual(video?.width, width, `${caseId}: 宽度`)
  assertEqual(video?.height, height, `${caseId}: 高度`)
  assert(video?.pix_fmt?.includes('10') ?? false, `${caseId}: 非 10-bit 像素格式 ${video?.pix_fmt}`)
  assertEqual(video?.color_range, 'tv', `${caseId}: 色彩范围`)
  assertEqual(video?.color_space, 'bt2020nc', `${caseId}: 色彩矩阵`)
  assertEqual(video?.color_primaries, 'bt2020', `${caseId}: 主色`)
  assertEqual(video?.color_transfer, 'smpte2084', `${caseId}: 传递函数`)
}

function containsSequence(values: string[], expected: string[]): boolean {
  if (expected.length === 1) return values.includes(expected[0])
  return values.some((_, index) => expected.every((value, offset) => values[index + offset] === value))
}

function assertStreams(
  probe: ProbeResult,
  expected: { video: number; audio: number; subtitle: number },
): void {
  assertEqual(streamsOf(probe, 'video').length, expected.video, '视频流数量')
  assertEqual(streamsOf(probe, 'audio').length, expected.audio, '音频流数量')
  assertEqual(streamsOf(probe, 'subtitle').length, expected.subtitle, '字幕流数量')
}

function streamsOf(probe: ProbeResult, type: ProbeStream['codec_type']): ProbeStream[] {
  return probe.streams.filter((stream) => stream.codec_type === type)
}

function run(file: string, commandArgs: string[], timeout = 60_000): RunResult {
  const result = spawnSync(file, commandArgs, {
    encoding: 'utf8',
    windowsHide: true,
    timeout,
    maxBuffer: 16 * 1024 * 1024,
  })
  if (result.error) throw result.error
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  }
}

function siblingExecutable(ffmpeg: string, name: 'ffprobe'): string {
  return join(dirname(ffmpeg), `${name}${extname(ffmpeg)}`)
}

function discoverFFmpegExecutables(): string[] {
  const candidates = [
    resolve(projectRoot, 'assets/ffmpeg-full-8.6自编译全功能/ffmpeg.exe'),
  ]
  const pathExecutable = process.platform === 'win32' ? findOnPath('ffmpeg.exe') : findOnPath('ffmpeg')
  return [...new Set([pathExecutable, ...candidates].filter((value): value is string => Boolean(value && existsSync(value))))]
}

function findOnPath(name: string): string | undefined {
  const command = process.platform === 'win32' ? 'where.exe' : 'which'
  const result = run(command, [name])
  return result.status === 0 ? result.stdout.split(/\r?\n/).map((line) => line.trim()).find(Boolean) : undefined
}

function parseArgs(values: string[]): { ffmpeg: string[]; assetsDir?: string; keep: boolean } {
  const parsed: { ffmpeg: string[]; assetsDir?: string; keep: boolean } = { ffmpeg: [], keep: false }
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === '--ffmpeg' && values[index + 1]) parsed.ffmpeg.push(values[++index])
    else if (values[index] === '--assets' && values[index + 1]) parsed.assetsDir = values[++index]
    else if (values[index] === '--keep') parsed.keep = true
    else throw new Error(`未知参数：${values[index]}`)
  }
  return parsed
}

function sanitizeName(value: string): string {
  return value.replace(/[^A-Za-z0-9_.-]+/g, '_') || 'ffmpeg'
}

function firstErrorLine(value: string): string {
  return value.split(/\r?\n/).map((line) => line.trim()).find((line) => /error|failed|cannot|unsupported|not found/i.test(line))
    ?? value.split(/\r?\n/).map((line) => line.trim()).find(Boolean)
    ?? '未知硬件初始化错误'
}

function tail(value: string, lines: number): string {
  return value.split(/\r?\n/).slice(-lines).join('\n').trim()
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function quoteForLog(value: string): string {
  return /\s|["']/.test(value) ? JSON.stringify(value) : value
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) throw new Error(`${label}：期望 ${String(expected)}，实际 ${String(actual)}`)
}
