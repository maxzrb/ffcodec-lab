import type { EncoderDefinition } from '@ffcodec/domain/catalog/catalog-types'
import { videoSpecialParamPath } from '@ffcodec/domain/config/config-path'

const proresSource = {
  repository: 'FFmpeg/FFmpeg',
  branch: 'master',
  snapshotDate: '2026-07-20',
  file: 'libavcodec/proresenc_kostya.c',
  sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/proresenc_kostya.c',
}

export const proresKs: EncoderDefinition = {
  id: 'prores_ks',
  label: 'prores_ks (Apple ProRes)',
  ffmpegName: 'prores_ks',
  mediaType: 'video',
  family: 'prores' as const,
  implementation: 'software' as const,
  availabilityClass: 'generally-available',

  capabilityScope: {
    ffmpeg: { minVersion: '2.0' },
    notes: [
      'prores_ks 是 FFmpeg 内置的 ProRes 编码器，无需外部库',
      '支持所有 ProRes Profile（Proxy 到 4444 XQ）',
      '专业视频后期制作的标准中间编码格式',
    ],
  },

  availabilityNote:
    'FFmpeg 内置 Apple ProRes 编码器。无需额外编译选项。专业后期制作的标准中间编码格式。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: false,
    supportsLossless: false,
    supportedContainers: ['mov', 'mkv'],
  },

  // ProRes 没有传统的 quality mode——质量由 profile 决定
  profile: {
    id: 'prores_ks.profile',
    label: 'ProRes Profile (-profile:v)',
    control: 'select',
    commandBinding: { argName: '-profile:v', prefix: '-profile:v', phase: 'VIDEO_PROFILE' },
    options: [
      { value: '0', label: '0 — 422 Proxy (~45 Mbps@1080p)' },
      { value: '1', label: '1 — 422 LT (~102 Mbps@1080p)' },
      { value: '2', label: '2 — 422 (~147 Mbps@1080p, 默认)' },
      { value: '3', label: '3 — 422 HQ (~220 Mbps@1080p)' },
      { value: '4', label: '4 — 4444 (~330 Mbps@1080p)' },
      { value: '5', label: '5 — 4444 XQ (~500 Mbps@1080p)' },
    ],
    defaultValue: '2',
    explanationId: 'expl.prores_ks.profile',
  },

  pixelFormat: {
    id: 'prores_ks.pixelFormat',
    label: '像素格式 (pix_fmt)',
    control: 'select',
    commandBinding: { argName: '-pix_fmt', prefix: '-pix_fmt', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '自动 (根据 profile)' },
      { value: 'yuv422p10le', label: 'yuv422p10le (422 profiles)' },
      { value: 'yuva444p10le', label: 'yuva444p10le (4444 + Alpha)' },
      { value: 'yuv444p10le', label: 'yuv444p10le (4444, 无 Alpha)' },
      { value: 'yuv422p', label: 'yuv422p (8-bit 422)' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.prores_ks.pixfmt',
  },

  qualityModes: [
    {
      id: 'cqp',
      label: 'Profile 决定质量',
      emitterId: 'emitter.prores_ks.default',
      explanationId: 'expl.prores_ks.default',
      sourceRefs: [{ ...proresSource, note: 'ProRes 质量由 profile 参数控制，无独立质量模式' }],
      controls: [],
    },
  ],

  specialParameters: [
    {
      id: 'prores_ks.vendor', label: '编码器厂商标识 (-vendor)',
      control: 'text',
      configBinding: { path: videoSpecialParamPath('vendor') },
      commandBinding: { argName: '-vendor', prefix: '-vendor', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.prores_ks.vendor', sourceRefs: [proresSource],
    },
    {
      id: 'prores_ks.quantMat', label: '量化矩阵 (-quant_mat)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('quantMat') },
      commandBinding: { argName: '-quant_mat', prefix: '-quant_mat', phase: 'VIDEO_CODEC' },
      options: [
        { value: 'auto', label: 'auto — 自动 (根据 profile) ' },
        { value: 'default', label: 'default — 默认' },
        { value: 'proxy', label: 'proxy' },
        { value: 'lt', label: 'lt' },
        { value: 'standard', label: 'standard (与 profile 2 对应)' },
        { value: 'hq', label: 'hq' },
      ],
      optional: true, explanationId: 'expl.prores_ks.quantMat', sourceRefs: [proresSource],
    },
    {
      id: 'prores_ks.bitsPerMb', label: '每宏块目标比特 (-bits_per_mb)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('bitsPerMb') },
      commandBinding: { argName: '-bits_per_mb', prefix: '-bits_per_mb', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.prores_ks.bitsPerMb', sourceRefs: [proresSource],
    },
    {
      id: 'prores_ks.mbsPerSlice', label: '每 Slice 宏块数 (-mbs_per_slice)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('mbsPerSlice') },
      commandBinding: { argName: '-mbs_per_slice', prefix: '-mbs_per_slice', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 8 }, defaultValue: 8, optional: true,
      explanationId: 'expl.prores_ks.mbsPerSlice', sourceRefs: [proresSource],
    },
    {
      id: 'prores_ks.alphaBits', label: 'Alpha 通道位深 (-alpha_bits)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('alphaBits') },
      commandBinding: { argName: '-alpha_bits', prefix: '-alpha_bits', phase: 'VIDEO_CODEC' },
      options: [
        { value: '0', label: '0 — 无 Alpha (默认)' },
        { value: '8', label: '8 — 8-bit Alpha' },
        { value: '16', label: '16 — 16-bit Alpha' },
      ],
      optional: true, explanationId: 'expl.prores_ks.alphaBits', sourceRefs: [proresSource],
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.prores_ks',
  sourceRefs: [
    {
      repository: 'FFmpeg/FFmpeg',
      branch: 'master',
      snapshotDate: '2026-07-20',
      file: 'libavcodec/proresenc_kostya.c',
      sourceType: 'ffmpeg-official',
      url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/proresenc_kostya.c',
    },
  ],
  sourceAuthority: 'encoder-official',
  verificationLevel: 'cross-verified',
  needsCrossVerification: false,
  status: 'verified',
}
