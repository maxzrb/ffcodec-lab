import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { CONFIG_PATHS, videoSpecialParamPath } from '../../../domain/config/config-path'

const xavs2Source = {
  repository: 'pkuvcl/xavs2',
  branch: 'master',
  snapshotDate: '2026-07-20',
  file: 'README.md',
  sourceType: 'encoder-official' as const,
  url: 'https://github.com/pkuvcl/xavs2',
}

export const libxavs2: EncoderDefinition = {
  id: 'libxavs2',
  label: 'libxavs2 (AVS2 — PKU-VCL)',
  ffmpegName: 'libxavs2',
  mediaType: 'video',
  family: 'avs2' as const,
  implementation: 'software' as const,
  availabilityClass: 'ffmpeg-build-dependent',

  capabilityScope: {
    ffmpeg: { minVersion: '4.0' },
    buildRequirements: ['--enable-libxavs2', '--enable-gpl'],
    library: { name: 'xavs2', minVersion: '1.3' },
    hardware: [
      {
        vendor: 'other',
        feature: 'AVS2 4K 编码',
        minimumGeneration: 'N/A（纯 CPU 编码）',
        verificationLevel: 'cross-verified',
        sourceRefs: [{ ...xavs2Source, note: 'AVS2 对标 HEVC，面向中国 4K 广电 (CCTV-4K)' }],
      },
    ],
    notes: [
      '需提前安装 xavs2 库，公开发行版 FFmpeg 通常不包含此编码器',
      '主要用于中国广电标准场景 (CCTV-4K)，境外需求极少',
      '解码器为 libdavs2 (同团队独立库)',
    ],
  },

  availabilityNote:
    '北京大学 PKU-VCL AVS2 编码器。需 FFmpeg --enable-libxavs2 + --enable-gpl 编译，且需提前安装 xavs2 库。仅用于中国广电标准场景。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: false,
    supportsLossless: false,
    supportedContainers: ['mp4', 'mkv', 'ts'],
  },

  preset: {
    id: 'libxavs2.preset',
    label: '编码预设 (preset)',
    control: 'select',
    commandBinding: { argName: '-preset', prefix: '-preset', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'ultrafast', label: 'ultrafast — 极快' },
      { value: 'fast', label: 'fast' },
      { value: 'medium', label: 'medium — 中速 (默认)' },
      { value: 'slow', label: 'slow' },
      { value: 'veryslow', label: 'veryslow — 最慢 (最高质量)' },
    ],
    defaultValue: 'medium',
    explanationId: 'expl.libxavs2.preset',
  },

  profile: {
    id: 'libxavs2.profile',
    label: '编码配置 (profile)',
    control: 'select',
    commandBinding: { argName: '-profile', prefix: '-profile', phase: 'VIDEO_PROFILE' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'main', label: 'main (8-bit)' },
      { value: 'main10', label: 'main10 (10-bit)' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.libxavs2.profile',
  },

  qualityModes: [
    {
      id: 'cqp',
      label: 'CQP (恒定量化参数)',
      emitterId: 'emitter.libxavs2.cqp',
      explanationId: 'expl.libxavs2.cqp',
      sourceRefs: [{ ...xavs2Source, note: 'AVS2 CQP 模式' }],
      controls: [
        {
          id: 'libxavs2.cqp.qp',
          label: 'QP 值 (-qp)',
          control: 'number',
          commandBinding: { argName: '-qp', prefix: '-qp', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 51, step: 1 },
          defaultValue: 28,
          explanationId: 'expl.libxavs2.cqp.qp',
        },
      ],
    },
    {
      id: 'vbr',
      label: 'VBR (可变码率)',
      emitterId: 'emitter.libxavs2.vbr',
      explanationId: 'expl.libxavs2.vbr',
      sourceRefs: [{ ...xavs2Source, note: 'AVS2 VBR 模式' }],
      controls: [
        {
          id: 'libxavs2.vbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.libxavs2.vbr.bitrate',
        },
      ],
    },
    {
      id: 'cbr',
      label: 'CBR (恒定码率)',
      emitterId: 'emitter.libxavs2.cbr',
      explanationId: 'expl.libxavs2.cbr',
      sourceRefs: [{ ...xavs2Source, note: 'AVS2 CBR 模式' }],
      controls: [
        {
          id: 'libxavs2.cbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.libxavs2.cbr.bitrate',
        },
      ],
    },
  ],

  specialParameters: [
    {
      id: 'libxavs2.keyint', label: '关键帧间隔 (-g)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('keyint') },
      commandBinding: { argName: '-g', prefix: '-g', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 500 }, optional: true,
      explanationId: 'expl.libxavs2.keyint', sourceRefs: [xavs2Source],
    },
    {
      id: 'libxavs2.lookahead', label: '前瞻帧数 (-lookahead)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('lookahead') },
      commandBinding: { argName: '-lookahead', prefix: '-lookahead', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 100, step: 1 }, optional: true,
      explanationId: 'expl.libxavs2.lookahead', sourceRefs: [xavs2Source],
    },
    {
      id: 'libxavs2.threads', label: '编码线程 (-threads)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('threads') },
      commandBinding: { argName: '-threads', prefix: '-threads', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.libxavs2.threads', sourceRefs: [xavs2Source],
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.libxavs2',
  sourceRefs: [
    {
      repository: 'pkuvcl/xavs2',
      snapshotDate: '2026-07-20',
      file: 'README.md',
      sourceType: 'encoder-official',
      url: 'https://github.com/pkuvcl/xavs2',
    },
  ],
  sourceAuthority: 'encoder-official',
  verificationLevel: 'cross-verified',
  needsCrossVerification: false,
  status: 'verified',
}
