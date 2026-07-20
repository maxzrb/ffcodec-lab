import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { CONFIG_PATHS, videoSpecialParamPath } from '../../../domain/config/config-path'

const vulkanAv1Source = {
  repository: 'FFmpeg/FFmpeg',
  branch: 'master',
  snapshotDate: '2026-07-20',
  file: 'libavcodec/vulkan_encode_av1.c',
  sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_encode_av1.c',
}

export const av1Vulkan: EncoderDefinition = {
  id: 'av1_vulkan',
  label: 'av1_vulkan (AV1 — Vulkan Video)',
  ffmpegName: 'av1_vulkan',
  mediaType: 'video',
  family: 'av1' as const,
  implementation: 'other' as const,
  availabilityClass: 'hardware-dependent',

  capabilityScope: {
    ffmpeg: { minVersion: '8.0' },
    buildRequirements: ['--enable-vulkan'],
    hardware: [
      {
        vendor: 'nvidia',
        feature: 'AV1 编码 (Vulkan Video)',
        minimumGeneration: 'RTX 4060+ (Ada)',
        minimumDriver: '550.40+ (Linux) / 555.85+ (Windows)',
        verificationLevel: 'cross-verified',
        sourceRefs: [{ ...vulkanAv1Source, note: '需 GPU 驱动暴露 VK_KHR_video_encode_av1 扩展' }],
      },
      {
        vendor: 'amd',
        feature: 'AV1 编码 (Vulkan Video)',
        minimumGeneration: 'RX 7600+ (RDNA3)',
        minimumDriver: 'Mesa RADV 24.0+ (Linux)',
        verificationLevel: 'cross-verified',
        sourceRefs: [{ ...vulkanAv1Source, note: 'Mesa RADV 驱动需包含 VK_KHR_video_encode_av1' }],
      },
      {
        vendor: 'intel',
        feature: 'AV1 编码 (Vulkan Video)',
        minimumGeneration: 'Arc (Alchemist)',
        minimumDriver: 'Mesa ANV 24.0+ (Linux)',
        verificationLevel: 'cross-verified',
        sourceRefs: [{ ...vulkanAv1Source, note: 'Intel ANV Vulkan 驱动需暴露 AV1 编码扩展' }],
      },
    ],
    notes: [
      '需 GPU 驱动暴露 VK_KHR_video_encode_av1 Vulkan 扩展',
      '运行 vulkaninfo | grep VK_KHR_video_encode_av1 检查驱动支持',
      'FFmpeg 8.0 引入，8.1.2 中标记为实验性功能',
      '跨厂商统一 API —— 同一个编码器代码在三家 GPU 上均可运行',
    ],
  },

  availabilityNote:
    '跨厂商 Vulkan Video AV1 硬件编码器（FFmpeg 8.0+，实验性）。统一 API 覆盖 NVIDIA/AMD/Intel AV1 编解码硬件。需 GPU 驱动暴露 Vulkan Video 扩展。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: false,
    supportsLossless: false,
    supportedContainers: ['mp4', 'mkv', 'webm', 'mov'],
  },

  // Vulkan Video 编码器通常没有丰富的 preset/tune/profile 选项
  pixelFormat: {
    id: 'av1_vulkan.pixelFormat',
    label: '像素格式 (pix_fmt)',
    control: 'select',
    commandBinding: { argName: '-pix_fmt', prefix: '-pix_fmt', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'nv12', label: 'nv12 (8-bit)' },
      { value: 'p010le', label: 'p010le (10-bit)' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.av1_vulkan.pixfmt',
  },

  qualityModes: [
    {
      id: 'av1-vulkan-cqp',
      label: 'CQP (恒定量化参数)',
      emitterId: 'emitter.av1_vulkan.cqp',
      explanationId: 'expl.av1_vulkan.cqp',
      sourceRefs: [{ ...vulkanAv1Source, note: 'Vulkan CQP 模式' }],
      controls: [
        {
          id: 'av1_vulkan.cqp.value',
          label: 'QP 值 (-qp)',
          control: 'number',
          commandBinding: { argName: '-qp', prefix: '-qp', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 51, step: 1 },
          defaultValue: 23,
          explanationId: 'expl.av1_vulkan.cqp.value',
        },
      ],
    },
    {
      id: 'vbr',
      label: 'VBR (可变码率)',
      emitterId: 'emitter.av1_vulkan.vbr',
      explanationId: 'expl.av1_vulkan.vbr',
      sourceRefs: [{ ...vulkanAv1Source, note: 'Vulkan VBR 模式' }],
      controls: [
        {
          id: 'av1_vulkan.vbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.av1_vulkan.vbr.bitrate',
        },
        {
          id: 'av1_vulkan.vbr.maxrate',
          label: '最大码率 (-maxrate)',
          control: 'text',
          commandBinding: { argName: '-maxrate', prefix: '-maxrate', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.maxRate },
          explanationId: 'expl.av1_vulkan.vbr.maxrate',
        },
        {
          id: 'av1_vulkan.vbr.bufsize',
          label: '缓冲区 (-bufsize)',
          control: 'text',
          commandBinding: { argName: '-bufsize', prefix: '-bufsize', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bufferSize },
          explanationId: 'expl.av1_vulkan.vbr.bufsize',
        },
      ],
    },
    {
      id: 'cbr',
      label: 'CBR (恒定码率)',
      emitterId: 'emitter.av1_vulkan.cbr',
      explanationId: 'expl.av1_vulkan.cbr',
      sourceRefs: [{ ...vulkanAv1Source, note: 'Vulkan CBR 模式' }],
      controls: [
        {
          id: 'av1_vulkan.cbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.av1_vulkan.cbr.bitrate',
        },
      ],
    },
  ],

  specialParameters: [
    {
      id: 'av1_vulkan.gopSize', label: 'GOP 大小 (-g)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('gopSize') },
      commandBinding: { argName: '-g', prefix: '-g', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 1000, step: 1 }, optional: true,
      explanationId: 'expl.av1_vulkan.gopSize', sourceRefs: [vulkanAv1Source],
    },
    {
      id: 'av1_vulkan.bf', label: '最大 B 帧数 (-bf)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('bFrames') },
      commandBinding: { argName: '-bf', prefix: '-bf', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 4 }, defaultValue: 2, optional: true,
      explanationId: 'expl.av1_vulkan.bf', sourceRefs: [vulkanAv1Source],
    },
    {
      id: 'av1_vulkan.refs', label: '参考帧数 (-refs)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('refs') },
      commandBinding: { argName: '-refs', prefix: '-refs', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 8 }, optional: true,
      explanationId: 'expl.av1_vulkan.refs', sourceRefs: [vulkanAv1Source],
    },
    {
      id: 'av1_vulkan.asyncDepth', label: '异步编码深度 (-async_depth)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('asyncDepth') },
      commandBinding: { argName: '-async_depth', prefix: '-async_depth', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 64 }, defaultValue: 4, optional: true,
      explanationId: 'expl.av1_vulkan.asyncDepth', sourceRefs: [vulkanAv1Source],
    },
    {
      id: 'av1_vulkan.tileRows', label: 'Tile 行数 (-tile_rows)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('tileRows') },
      commandBinding: { argName: '-tile_rows', prefix: '-tile_rows', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 4 }, optional: true,
      explanationId: 'expl.av1_vulkan.tileRows', sourceRefs: [vulkanAv1Source],
    },
    {
      id: 'av1_vulkan.tileCols', label: 'Tile 列数 (-tile_cols)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('tileCols') },
      commandBinding: { argName: '-tile_cols', prefix: '-tile_cols', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 4 }, optional: true,
      explanationId: 'expl.av1_vulkan.tileCols', sourceRefs: [vulkanAv1Source],
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.av1_vulkan',
  sourceRefs: [
    {
      repository: 'KhronosGroup/Vulkan-Docs',
      snapshotDate: '2026-07-20',
      file: 'VK_KHR_video_encode_av1.adoc',
      sourceType: 'ffmpeg-official' as const,
      url: 'https://registry.khronos.org/vulkan/specs/latest/man/html/VK_KHR_video_encode_av1.html',
      note: 'Vulkan Video AV1 Encode 扩展规范',
    },
  ],
  sourceAuthority: 'encoder-official',
  verificationLevel: 'cross-verified',
  needsCrossVerification: false,
  status: 'verified',
}
