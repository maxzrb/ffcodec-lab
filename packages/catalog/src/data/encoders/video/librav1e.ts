import type { EncoderDefinition } from '@ffcodec/domain/catalog/catalog-types'
import { CONFIG_PATHS, videoSpecialParamPath } from '@ffcodec/domain/config/config-path'

const rav1eSource = {
  repository: 'FFmpeg/FFmpeg',
  branch: 'master',
  snapshotDate: '2026-07-20',
  file: 'libavcodec/librav1e.c',
  sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/librav1e.c',
}

export const librav1e: EncoderDefinition = {
  id: 'librav1e',
  label: 'librav1e (AV1 — Rust CPU)',
  ffmpegName: 'librav1e',
  mediaType: 'video',
  family: 'av1' as const,
  implementation: 'software' as const,
  availabilityClass: 'ffmpeg-build-dependent',

  capabilityScope: {
    ffmpeg: { minVersion: '4.0' },
    buildRequirements: ['--enable-librav1e'],
    library: { name: 'rav1e', minVersion: '0.3.0' },
    notes: ['librav1e 是 Rust 实现的 AV1 编码器，BSD 许可，需要 Cargo 编译环境'],
  },

  availabilityNote:
    'Rust 实现的 AV1 CPU 编码器。需要 FFmpeg --enable-librav1e 编译。画质介于 libaom 和 libsvtav1 之间。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: true,
    supportsLossless: false,
    supportedContainers: ['mp4', 'mkv', 'webm', 'mov'],
  },

  // librav1e 无 preset 概念，使用 -speed 替代
  qualityModes: [
    {
      id: 'rav1e-cqp',
      label: 'CQP (恒定量化参数)',
      emitterId: 'emitter.rav1e.cqp',
      explanationId: 'expl.librav1e.cqp',
      sourceRefs: [{
        repository: 'xiph/rav1e',
        snapshotDate: '2026-07-20',
        file: 'README.md',
        sourceType: 'encoder-official',
        url: 'https://github.com/xiph/rav1e',
      }],
      controls: [
        {
          id: 'librav1e.cqp.value',
          label: '量化参数 (-qp)',
          control: 'number',
          commandBinding: { argName: '-qp', prefix: '-qp', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 255, step: 1 },
          defaultValue: 100,
          explanationId: 'expl.librav1e.cqp.value',
        },
      ],
    },
    {
      id: 'vbr',
      label: 'VBR (可变码率)',
      emitterId: 'emitter.rav1e.vbr',
      explanationId: 'expl.librav1e.vbr',
      sourceRefs: [{
        repository: 'xiph/rav1e',
        snapshotDate: '2026-07-20',
        file: 'README.md',
        sourceType: 'encoder-official',
        url: 'https://github.com/xiph/rav1e',
      }],
      controls: [
        {
          id: 'librav1e.vbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.librav1e.vbr.bitrate',
        },
      ],
    },
  ],

  pixelFormat: {
    id: 'librav1e.pixelFormat',
    label: '像素格式 (pix_fmt)',
    control: 'select',
    commandBinding: { argName: '-pix_fmt', prefix: '-pix_fmt', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'yuv420p', label: 'yuv420p' },
      { value: 'yuv420p10le', label: 'yuv420p10le' },
      { value: 'yuv422p', label: 'yuv422p' },
      { value: 'yuv422p10le', label: 'yuv422p10le' },
      { value: 'yuv444p', label: 'yuv444p' },
      { value: 'yuv444p10le', label: 'yuv444p10le' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.librav1e.pixfmt',
  },

  specialParameters: [
    // -- 编码速度（替代 preset）----------------------------------
    {
      id: 'librav1e.speed', label: '编码速度 (-speed)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('speed') },
      commandBinding: { argName: '-speed', prefix: '-speed', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 10, step: 1 }, defaultValue: 6,
      explanationId: 'expl.librav1e.speed', sourceRefs: [rav1eSource],
    },
    // -- Tile ---------------------------------------------------
    {
      id: 'librav1e.tileColumns', label: 'Tile 列数 (-tile-columns)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('tileColumns') },
      commandBinding: { argName: '-tile-columns', prefix: '-tile-columns', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 4, step: 1 }, optional: true,
      explanationId: 'expl.librav1e.tileColumns', sourceRefs: [rav1eSource],
    },
    {
      id: 'librav1e.tileRows', label: 'Tile 行数 (-tile-rows)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('tileRows') },
      commandBinding: { argName: '-tile-rows', prefix: '-tile-rows', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 4, step: 1 }, optional: true,
      explanationId: 'expl.librav1e.tileRows', sourceRefs: [rav1eSource],
    },
    {
      id: 'librav1e.tiles', label: 'Tile 总数 (-tiles)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('tiles') },
      commandBinding: { argName: '-tiles', prefix: '-tiles', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 64, step: 1 }, optional: true,
      explanationId: 'expl.librav1e.tiles', sourceRefs: [rav1eSource],
    },
    // -- 关键帧 --------------------------------------------------
    {
      id: 'librav1e.keyint', label: '关键帧间隔 (-g)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('keyint') },
      commandBinding: { argName: '-g', prefix: '-g', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 1000, step: 1 }, optional: true,
      explanationId: 'expl.librav1e.keyint', sourceRefs: [rav1eSource],
    },
    // -- 低延迟模式 ----------------------------------------------
    {
      id: 'librav1e.lowLatency', label: '低延迟模式 (-low_latency)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('lowLatency') },
      commandBinding: { argName: '-low_latency', prefix: '-low_latency', phase: 'VIDEO_CODEC' },
      optional: true,
      explanationId: 'expl.librav1e.lowLatency', sourceRefs: [rav1eSource],
    },
    // -- 附加参数字典 --------------------------------------------
    {
      id: 'librav1e.rav1eparams',
      label: 'rav1e 附加参数 (-rav1e-params)',
      control: 'text',
      configBinding: { path: videoSpecialParamPath('rav1eParams') },
      commandBinding: {
        argName: '-rav1e-params',
        prefix: '-rav1e-params',
        phase: 'VIDEO_CODEC',
        dictionary: { key: undefined as unknown as string, separator: ':' },
      },
      optional: true,
      explanationId: 'expl.librav1e.rav1eparams',
      sourceRefs: [rav1eSource],
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.librav1e',
  sourceRefs: [
    {
      repository: 'xiph/rav1e',
      snapshotDate: '2026-07-20',
      file: 'README.md',
      sourceType: 'encoder-official',
      url: 'https://github.com/xiph/rav1e',
    },
  ],
  sourceAuthority: 'encoder-official',
  verificationLevel: 'cross-verified',
  needsCrossVerification: false,
  status: 'verified',
}
