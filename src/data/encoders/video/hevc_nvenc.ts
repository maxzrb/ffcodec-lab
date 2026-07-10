import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { CONFIG_PATHS } from '../../../domain/config/config-path'

export const hevcNvenc: EncoderDefinition = {
  id: 'hevc_nvenc',
  label: 'hevc_nvenc (H.265/HEVC — NVIDIA NVENC)',
  ffmpegName: 'hevc_nvenc',
  mediaType: 'video',
  family: 'hevc' as const,
  implementation: 'nvidia' as const,
  availabilityClass: 'hardware-dependent',

  capabilityScope: {
    ffmpeg: { minVersion: '3.4' },
    buildRequirements: ['--enable-nvenc'],
    hardware: [
      {
        vendor: 'nvidia',
        feature: 'HEVC 硬件编码 (NVENC)',
        minimumGeneration: 'Maxwell (GM206)',
        minimumDriver: '470.57.02',
        verificationLevel: 'cross-verified',
        sourceRefs: [
          {
            repository: 'NVIDIA/Video_Codec_SDK',
            snapshotDate: '2026-07-10',
            file: 'NVENC_Application_Note.pdf',
            sourceType: 'encoder-official',
            url: 'https://developer.nvidia.com/video-codec-sdk',
            note: 'NVENC HEVC 编码从 Maxwell GM206 (第 4 代 NVENC) 开始支持',
          },
        ],
      },
      {
        vendor: 'nvidia',
        feature: 'HEVC 10-bit 编码',
        minimumGeneration: 'Maxwell (GM206)',
        minimumDriver: '470.57.02',
        verificationLevel: 'cross-verified',
        sourceRefs: [
          {
            repository: 'NVIDIA/Video_Codec_SDK',
            snapshotDate: '2026-07-10',
            file: 'NVENC_Application_Note.pdf',
            sourceType: 'encoder-official',
            note: 'HEVC 10-bit 需要 GM206 以上 GPU',
          },
        ],
      },
      {
        vendor: 'nvidia',
        feature: 'HEVC B 帧支持',
        minimumGeneration: 'Maxwell 2nd Gen (GM206)',
        verificationLevel: 'cross-verified',
        sourceRefs: [
          {
            repository: 'NVIDIA/Video_Codec_SDK',
            snapshotDate: '2026-07-10',
            file: 'NVENC_Application_Note.pdf',
            sourceType: 'encoder-official',
          },
        ],
      },
    ],
    notes: [
      'NVENC HEVC 需要 Maxwell GM206 以上 GPU',
      'FFCodec 不检测本机硬件 — 请自行确认 GPU 和驱动',
    ],
  },

  availabilityNote:
    'NVIDIA NVENC 硬件 HEVC 编码器。需要 Maxwell GM206+ GPU 和 FFmpeg --enable-nvenc 编译。FFCodec 不检测本机硬件。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: false,
    supportsLossless: true,
    supportedContainers: ['mp4', 'mkv', 'mov'],
  },

  preset: {
    id: 'hevc_nvenc.preset',
    label: '编码预设 (preset)',
    control: 'select',
    commandBinding: { argName: '-preset', prefix: '-preset', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'p1', label: 'p1 — 最快' },
      { value: 'p2', label: 'p2' },
      { value: 'p3', label: 'p3' },
      { value: 'p4', label: 'p4 — 中速 (默认)' },
      { value: 'p5', label: 'p5' },
      { value: 'p6', label: 'p6' },
      { value: 'p7', label: 'p7 — 最慢 (最高质量)' },
    ],
    defaultValue: 'p4',
    explanationId: 'expl.nvenc.preset',
  },

  profile: {
    id: 'hevc_nvenc.profile',
    label: '配置文件 (profile)',
    control: 'select',
    commandBinding: { argName: '-profile:v', prefix: '-profile:v', phase: 'VIDEO_PROFILE' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'main', label: 'main' },
      { value: 'main10', label: 'main10 (10-bit)' },
      { value: 'rext', label: 'rext (4:4:4)' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.nvenc.profile',
  },

  tune: {
    id: 'hevc_nvenc.tune',
    label: '场景优化 (tune)',
    control: 'select',
    commandBinding: { argName: '-tune', prefix: '-tune', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '无 (自动)' },
      { value: 'hq', label: 'hq — 高质量' },
      { value: 'll', label: 'll — 低延迟' },
      { value: 'ull', label: 'ull — 超低延迟' },
      { value: 'lossless', label: 'lossless — 无损' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.nvenc.tune',
  },

  pixelFormat: {
    id: 'hevc_nvenc.pixelFormat',
    label: '像素格式 (pix_fmt)',
    control: 'select',
    commandBinding: { argName: '-pix_fmt', prefix: '-pix_fmt', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'yuv420p', label: 'yuv420p' },
      { value: 'yuv420p10le', label: 'yuv420p10le' },
      { value: 'yuv444p', label: 'yuv444p' },
      { value: 'yuv444p16le', label: 'yuv444p16le' },
      { value: 'p010le', label: 'p010le (10-bit)' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.nvenc.pixfmt',
  },

  qualityModes: [
    {
      id: 'nvenc-cq',
      label: 'CQ (恒定质量 — NVENC)',
      emitterId: 'emitter.nvenc.cq',
      explanationId: 'expl.nvenc.cq',
      modeArguments: [
        { argName: '-rc', value: 'vbr', phase: 'VIDEO_RATE_CONTROL' },
      ],
      sourceRefs: [
        {
          repository: 'NVIDIA/Video_Codec_SDK',
          snapshotDate: '2026-07-10',
          file: 'NVENC_Programming_Guide.pdf',
          sourceType: 'encoder-official',
        },
      ],
      recommendedValues: [
        { label: '视觉无损', value: 18, description: '几乎无法察觉的画质损失' },
        { label: '默认', value: 28, description: 'HEVC 效率较 H.264 更高' },
        { label: '一般质量', value: 35, description: '文件较小' },
      ],
      controls: [
        {
          id: 'hevc_nvenc.cq.value',
          label: 'CQ 值 (-cq)',
          control: 'number',
          commandBinding: { argName: '-cq', prefix: '-cq', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 1, max: 51, step: 1 },
          defaultValue: 28,
          explanationId: 'expl.nvenc.cq.value',
        },
      ],
    },
    {
      id: 'cqp',
      label: 'CQP (恒定量化参数 — NVENC)',
      emitterId: 'emitter.nvenc.cqp',
      explanationId: 'expl.nvenc.cqp',
      modeArguments: [
        { argName: '-rc', value: 'constqp', phase: 'VIDEO_RATE_CONTROL' },
      ],
      sourceRefs: [
        {
          repository: 'NVIDIA/Video_Codec_SDK',
          snapshotDate: '2026-07-10',
          file: 'NVENC_Programming_Guide.pdf',
          sourceType: 'encoder-official',
        },
      ],
      controls: [
        {
          id: 'hevc_nvenc.cqp.value',
          label: 'QP 值 (-qp)',
          control: 'number',
          commandBinding: { argName: '-qp', prefix: '-qp', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 51, step: 1 },
          defaultValue: 28,
          explanationId: 'expl.nvenc.cqp.value',
        },
      ],
    },
    {
      id: 'vbr',
      label: 'VBR (可变码率 — NVENC)',
      emitterId: 'emitter.nvenc.vbr',
      explanationId: 'expl.nvenc.vbr',
      modeArguments: [
        { argName: '-rc', value: 'vbr', phase: 'VIDEO_RATE_CONTROL' },
      ],
      sourceRefs: [
        {
          repository: 'NVIDIA/Video_Codec_SDK',
          snapshotDate: '2026-07-10',
          file: 'NVENC_Programming_Guide.pdf',
          sourceType: 'encoder-official',
        },
      ],
      controls: [
        {
          id: 'hevc_nvenc.vbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.nvenc.vbr.bitrate',
        },
        {
          id: 'hevc_nvenc.vbr.maxrate',
          label: '最大码率 (-maxrate)',
          control: 'text',
          commandBinding: { argName: '-maxrate', prefix: '-maxrate', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.maxRate },
          explanationId: 'expl.nvenc.vbr.maxrate',
        },
        {
          id: 'hevc_nvenc.vbr.bufsize',
          label: '缓冲区 (-bufsize)',
          control: 'text',
          commandBinding: { argName: '-bufsize', prefix: '-bufsize', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bufferSize },
          explanationId: 'expl.nvenc.vbr.bufsize',
        },
      ],
    },
    {
      id: 'cbr',
      label: 'CBR (恒定码率 — NVENC)',
      emitterId: 'emitter.nvenc.cbr',
      explanationId: 'expl.nvenc.cbr',
      modeArguments: [
        { argName: '-rc', value: 'cbr', phase: 'VIDEO_RATE_CONTROL' },
      ],
      sourceRefs: [
        {
          repository: 'NVIDIA/Video_Codec_SDK',
          snapshotDate: '2026-07-10',
          file: 'NVENC_Programming_Guide.pdf',
          sourceType: 'encoder-official',
        },
      ],
      controls: [
        {
          id: 'hevc_nvenc.cbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.nvenc.cbr.bitrate',
        },
      ],
    },
  ],

  specialParameters: [
    {
      id: 'hevc_nvenc.gpu',
      label: 'GPU 设备索引 (-gpu)',
      control: 'number',
      commandBinding: { argName: '-gpu', prefix: '-gpu', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 7 },
      explanationId: 'expl.nvenc.gpu',
    },
    {
      id: 'hevc_nvenc.rclookahead',
      label: '码率控制前瞻 (-rc-lookahead)',
      control: 'number',
      commandBinding: { argName: '-rc-lookahead', prefix: '-rc-lookahead', phase: 'VIDEO_RATE_CONTROL' },
      range: { min: 0, max: 32 },
      defaultValue: 0,
      explanationId: 'expl.nvenc.rclookahead',
    },
    {
      id: 'hevc_nvenc.spatialaq',
      label: '空间自适应量化 (-spatial-aq)',
      control: 'switch',
      commandBinding: { argName: '-spatial_aq', prefix: '-spatial_aq', compact: true, phase: 'VIDEO_CODEC' },
      defaultValue: 1,
      explanationId: 'expl.nvenc.spatialaq',
    },
    {
      id: 'hevc_nvenc.temporalaq',
      label: '时间自适应量化 (-temporal-aq)',
      control: 'switch',
      commandBinding: { argName: '-temporal_aq', prefix: '-temporal_aq', compact: true, phase: 'VIDEO_CODEC' },
      defaultValue: 0,
      explanationId: 'expl.nvenc.temporalaq',
    },
    {
      id: 'hevc_nvenc.bf',
      label: '最大 B 帧数 (-bf)',
      control: 'number',
      commandBinding: { argName: '-bf', prefix: '-bf', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 4 },
      defaultValue: 2,
      explanationId: 'expl.nvenc.bf',
    },
  ],

  requiredArguments: [],
  defaultArguments: [
    { argName: '-spatial_aq', value: 1, phase: 'VIDEO_CODEC' },
  ],

  explanationId: 'expl.hevc_nvenc',
  sourceRefs: [
    {
      repository: 'NVIDIA/Video_Codec_SDK',
      snapshotDate: '2026-07-10',
      file: 'NVENC_Programming_Guide.pdf',
      sourceType: 'encoder-official',
      url: 'https://developer.nvidia.com/video-codec-sdk',
    },
  ],
  sourceAuthority: 'encoder-official',
  verificationLevel: 'cross-verified',
  needsCrossVerification: false,
  status: 'verified',
}
