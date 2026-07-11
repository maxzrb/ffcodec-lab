import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { CONFIG_PATHS, videoSpecialParamPath } from '../../../domain/config/config-path'

export const libsvtav1: EncoderDefinition = {
  id: 'libsvtav1',
  label: 'libsvtav1 (AV1/SVT-AV1)',
  ffmpegName: 'libsvtav1',
  mediaType: 'video',
  family: 'av1' as const,
  implementation: 'software' as const,
  availabilityClass: 'ffmpeg-build-dependent',
  capabilityScope: {
    buildRequirements: ['--enable-libsvtav1'],
    library: { name: 'SVT-AV1', minVersion: '1.0.0' },
    notes: [
      'SVT-AV1 编码器需要 FFmpeg 编译时启用 libsvtav1',
      'SVT-AV1 v2.x preset 范围 0-9，v1.x 为 0-13',
    ],
  },
  availabilityNote:
    'SVT-AV1 编码器需要 FFmpeg 编译时启用 libsvtav1。可用性取决于本机 FFmpeg 构建、硬件和驱动。可运行 ffmpeg -encoders | grep svtav1 检查。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: false,
    supportsLossless: false,
    supportedContainers: ['mp4', 'mkv', 'webm', 'mov'],
  },

  preset: {
    id: 'libsvtav1.preset',
    label: '编码预设 (preset)',
    control: 'select',
    commandBinding: { argName: '-preset', prefix: '-preset', phase: 'VIDEO_CODEC' },
    options: [
      { value: 0, label: '0 — 最慢 (最高质量)', description: '研究/归档用' },
      { value: 2, label: '2' },
      { value: 4, label: '4' },
      { value: 6, label: '6 — 默认', description: '速度与质量平衡' },
      { value: 8, label: '8' },
      { value: 10, label: '10' },
      { value: 12, label: '12' },
      { value: 13, label: '13 — 最快 (较低质量)' },
    ],
    defaultValue: 6,
    explanationId: 'expl.libsvtav1.preset',
    capabilityScope: {
      library: { name: 'SVT-AV1', minVersion: '1.0.0', maxVersion: '1.x' },
      notes: [
        'SVT-AV1 v1.x preset 范围 0-13',
        'SVT-AV1 v2.x 已重构 preset，范围缩减为 0-9',
        '若使用 SVT-AV1 v2.x，请参考最新文档调整 preset',
      ],
    },
  },

  profile: {
    id: 'libsvtav1.profile',
    label: '配置文件 (profile)',
    control: 'select',
    commandBinding: { argName: '-profile:v', prefix: '-profile:v', phase: 'VIDEO_PROFILE' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'main', label: 'main (8-bit)' },
      { value: 'high', label: 'high (10-bit)' },
      { value: 'professional', label: 'professional (12-bit)' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.libsvtav1.profile',
  },

  // libsvtav1 不使用 -tune，使用 -svtav1-params tune=...
  tune: undefined,

  pixelFormat: {
    id: 'libsvtav1.pixelFormat',
    label: '像素格式 (pix_fmt)',
    control: 'select',
    commandBinding: { argName: '-pix_fmt', prefix: '-pix_fmt', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'yuv420p', label: 'yuv420p (8-bit)' },
      { value: 'yuv420p10le', label: 'yuv420p10le (10-bit)' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.libsvtav1.pixfmt',
  },

  qualityModes: [
    {
      id: 'crf',
      label: 'CRF (恒定质量)',
      emitterId: 'emitter.crf',
      explanationId: 'expl.libsvtav1.crf',
      sourceRefs: [
        {
          repository: 'Lake1059/FFmpegFreeUI',
          branch: 'main',
          snapshotDate: '2026-07-10',
          file: 'src/databases/video-encoders.json',
          symbol: 'libsvtav1.quality.crf',
          sourceType: 'ffmpegfreeui',
        },
      ],
      recommendedValues: [
        { label: '高质量', value: 30, description: '接近透明质量' },
        { label: '默认', value: 35, description: '画质与体积的良好平衡' },
        { label: '一般质量', value: 45, description: '文件较小' },
      ],
      controls: [
        {
          id: 'libsvtav1.crf.value',
          label: 'CRF 值',
          control: 'number',
          commandBinding: { argName: '-crf', prefix: '-crf', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 63, step: 1 },
          defaultValue: 35,
          explanationId: 'expl.libsvtav1.crf.value',
        },
      ],
    },
    {
      id: 'vbr',
      label: 'VBR (动态码率)',
      emitterId: 'emitter.vbr',
      explanationId: 'expl.libsvtav1.vbr',
      sourceRefs: [
        {
          repository: 'Lake1059/FFmpegFreeUI',
          branch: 'main',
          snapshotDate: '2026-07-10',
          file: 'src/databases/video-encoders.json',
          symbol: 'libsvtav1.quality.vbr',
          sourceType: 'ffmpegfreeui',
        },
      ],
      controls: [
        {
          id: 'libsvtav1.vbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.libsvtav1.vbr.bitrate',
        },
      ],
    },
    {
      id: 'cqp',
      label: 'CQP (恒定量化)',
      emitterId: 'emitter.cqp',
      explanationId: 'expl.libsvtav1.cqp',
      sourceRefs: [
        {
          repository: 'Lake1059/FFmpegFreeUI',
          branch: 'main',
          snapshotDate: '2026-07-10',
          file: 'src/databases/video-encoders.json',
          symbol: 'libsvtav1.quality.cqp',
          sourceType: 'ffmpegfreeui',
        },
      ],
      controls: [
        {
          id: 'libsvtav1.cqp.value',
          label: 'QP 值',
          control: 'number',
          commandBinding: { argName: '-qp', prefix: '-qp', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 63, step: 1 },
          defaultValue: 35,
          explanationId: 'expl.libsvtav1.cqp.value',
        },
      ],
    },
    {
      id: 'cbr',
      label: 'CBR (恒定码率)',
      emitterId: 'emitter.cbr',
      explanationId: 'expl.libsvtav1.cbr',
      sourceRefs: [
        {
          repository: 'Lake1059/FFmpegFreeUI',
          branch: 'main',
          snapshotDate: '2026-07-10',
          file: 'src/databases/video-encoders.json',
          symbol: 'libsvtav1.quality.cbr',
          sourceType: 'ffmpegfreeui',
        },
      ],
      controls: [
        {
          id: 'libsvtav1.cbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.libsvtav1.cbr.bitrate',
        },
      ],
    },
  ],

  specialParameters: [
    {
      id: 'libsvtav1.svtav1params',
      label: 'SVT-AV1 附加参数 (-svtav1-params)',
      control: 'text',
      configBinding: { path: videoSpecialParamPath('svtav1Params') },
      commandBinding: { argName: '-svtav1-params', prefix: '-svtav1-params', phase: 'VIDEO_CODEC' },
      explanationId: 'expl.libsvtav1.svtav1params',
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.libsvtav1',
  sourceRefs: [
    {
      repository: 'Lake1059/FFmpegFreeUI',
      branch: 'main',
      snapshotDate: '2026-07-10',
      file: 'src/databases/video-encoders.json',
      symbol: 'libsvtav1',
      sourceType: 'ffmpegfreeui',
    },
    {
      repository: 'FFmpeg/FFmpeg',
      branch: 'master',
      snapshotDate: '2026-07-10',
      file: 'libavcodec/libsvtav1.c',
      sourceType: 'ffmpeg-official',
      url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libsvtav1.c',
    },
  ],
  sourceAuthority: 'ffmpegfreeui',
  verificationLevel: 'project-derived',
  needsCrossVerification: true,
  status: 'verified',
}
