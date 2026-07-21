import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { CONFIG_PATHS, videoSpecialParamPath } from '../../../domain/config/config-path'

const nvencSource = {
  repository: 'FFmpeg/FFmpeg',
  branch: 'master',
  snapshotDate: '2026-07-20',
  file: 'libavcodec/nvenc.c',
  sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c',
}

export const h264Nvenc: EncoderDefinition = {
  id: 'h264_nvenc',
  label: 'h264_nvenc (H.264/AVC — NVIDIA NVENC)',
  ffmpegName: 'h264_nvenc',
  mediaType: 'video',
  family: 'h264' as const,
  implementation: 'nvidia' as const,
  availabilityClass: 'hardware-dependent',

  capabilityScope: {
    ffmpeg: { minVersion: '3.4' },
    buildRequirements: ['--enable-nvenc'],
    hardware: [
      {
        vendor: 'nvidia',
        feature: 'H.264 硬件编码 (NVENC)',
        minimumGeneration: 'Kepler (GK104)',
        minimumDriver: '390.77 (Linux) / 392.68 (Windows)',
        verificationLevel: 'cross-verified',
        sourceRefs: [
          {
            repository: 'NVIDIA/Video_Codec_SDK',
            snapshotDate: '2026-07-10',
            file: 'NVENC_Application_Note.pdf',
            sourceType: 'encoder-official',
            url: 'https://developer.nvidia.com/video-codec-sdk',
            note: 'NVENC H.264 编码从 Kepler 代开始支持',
          },
        ],
      },
      {
        vendor: 'nvidia',
        feature: 'B 帧支持',
        minimumGeneration: 'Maxwell (GM206)',
        minimumDriver: '470.57.02',
        verificationLevel: 'cross-verified',
        sourceRefs: [
          {
            repository: 'NVIDIA/Video_Codec_SDK',
            snapshotDate: '2026-07-10',
            file: 'NVENC_Application_Note.pdf',
            sourceType: 'encoder-official',
            note: 'NVENC B 帧从 Maxwell GM206 (NVENC 第 4 代) 开始支持',
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
            note: 'HEVC B 帧需要 Maxwell GM206 以上',
          },
        ],
      },
    ],
    notes: [
      'NVENC 可用性取决于 FFmpeg --enable-nvenc 编译、NVIDIA GPU 代际和驱动版本',
      'FFCodec 不检测本机硬件 — 请自行确认 GPU 和驱动是否满足要求',
    ],
  },

  availabilityNote:
    'NVIDIA NVENC 硬件 H.264 编码器。需要 NVIDIA GPU 和 FFmpeg --enable-nvenc 编译。FFCodec 不检测本机硬件，请确认 GPU 和驱动。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: false,
    supportsLossless: true,
    supportedContainers: ['mp4', 'mkv', 'mov', 'flv'],
  },

  preset: {
    id: 'h264_nvenc.preset',
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
    id: 'h264_nvenc.profile',
    label: '配置文件 (profile)',
    control: 'select',
    commandBinding: { argName: '-profile:v', prefix: '-profile:v', phase: 'VIDEO_PROFILE' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'baseline', label: 'baseline' },
      { value: 'main', label: 'main' },
      { value: 'high', label: 'high' },
      { value: 'high444p', label: 'high444p' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.nvenc.profile',
  },

  tune: {
    id: 'h264_nvenc.tune',
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
    id: 'h264_nvenc.pixelFormat',
    label: '像素格式 (pix_fmt)',
    control: 'select',
    commandBinding: { argName: '-pix_fmt', prefix: '-pix_fmt', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'yuv420p', label: 'yuv420p' },
      { value: 'yuv444p', label: 'yuv444p' },
      { value: 'yuv420p10le', label: 'yuv420p10le' },
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
          note: 'NVENC CQ 模式使用 -rc vbr + -cq N 组合',
        },
      ],
      recommendedValues: [
        { label: '视觉无损', value: 18, description: '几乎无法察觉的画质损失' },
        { label: '默认', value: 23, description: '画质与体积的良好平衡' },
        { label: '一般质量', value: 28, description: '文件较小，画质可接受' },
      ],
      controls: [
        {
          id: 'h264_nvenc.cq.value',
          label: 'CQ 值 (-cq)',
          control: 'number',
          commandBinding: { argName: '-cq', prefix: '-cq', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 1, max: 51, step: 1 },
          defaultValue: 23,
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
          id: 'h264_nvenc.cqp.value',
          label: 'QP 值 (-qp)',
          control: 'number',
          commandBinding: { argName: '-qp', prefix: '-qp', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 51, step: 1 },
          defaultValue: 23,
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
          id: 'h264_nvenc.vbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.nvenc.vbr.bitrate',
        },
        {
          id: 'h264_nvenc.vbr.maxrate',
          label: '最大码率 (-maxrate)',
          control: 'text',
          commandBinding: { argName: '-maxrate', prefix: '-maxrate', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.maxRate },
          explanationId: 'expl.nvenc.vbr.maxrate',
        },
        {
          id: 'h264_nvenc.vbr.bufsize',
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
          id: 'h264_nvenc.cbr.bitrate',
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
    // -- GPU 设备 ------------------------------------------------
    {
      id: 'h264_nvenc.gpu', label: 'GPU 设备索引 (-gpu)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('gpu') },
      commandBinding: { argName: '-gpu', prefix: '-gpu', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 7 },
      explanationId: 'expl.nvenc.gpu', sourceRefs: [nvencSource],
    },
    // -- 码率控制 ------------------------------------------------
    {
      id: 'h264_nvenc.rclookahead', label: '码率控制前瞻 (-rc-lookahead)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('rcLookahead') },
      commandBinding: { argName: '-rc-lookahead', prefix: '-rc-lookahead', phase: 'VIDEO_RATE_CONTROL' },
      range: { min: 0, max: 32 }, defaultValue: 0,
      explanationId: 'expl.nvenc.rclookahead', sourceRefs: [nvencSource],
    },
    {
      id: 'h264_nvenc.lookaheadLevel', label: '前瞻等级 (-lookahead_level)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('lookaheadLevel') },
      commandBinding: { argName: '-lookahead_level', prefix: '-lookahead_level', phase: 'VIDEO_RATE_CONTROL' },
      range: { min: 0, max: 15 }, defaultValue: 0,
      explanationId: 'expl.nvenc.lookaheadLevel', sourceRefs: [nvencSource],
    },
    // -- 自适应量化 ----------------------------------------------
    {
      id: 'h264_nvenc.spatialaq', label: '空间 AQ (-spatial_aq)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('spatialAq') },
      commandBinding: { argName: '-spatial_aq', prefix: '-spatial_aq', phase: 'VIDEO_CODEC' },
      defaultValue: 1, explanationId: 'expl.nvenc.spatialaq', sourceRefs: [nvencSource],
    },
    {
      id: 'h264_nvenc.temporalaq', label: '时间 AQ (-temporal_aq)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('temporalAq') },
      commandBinding: { argName: '-temporal_aq', prefix: '-temporal_aq', phase: 'VIDEO_CODEC' },
      defaultValue: 0, explanationId: 'expl.nvenc.temporalaq', sourceRefs: [nvencSource],
    },
    // -- B 帧 / GOP 控制 -----------------------------------------
    {
      id: 'h264_nvenc.bf', label: '最大 B 帧数 (-bf)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('bFrames') },
      commandBinding: { argName: '-bf', prefix: '-bf', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 4 }, defaultValue: 2,
      explanationId: 'expl.nvenc.bf', sourceRefs: [nvencSource],
    },
    {
      id: 'h264_nvenc.bRefMode', label: 'B 帧参考模式 (-b_ref_mode)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('bRefMode') },
      commandBinding: { argName: '-b_ref_mode', prefix: '-b_ref_mode', phase: 'VIDEO_CODEC' },
      options: [
        { value: 'each', label: 'each — 每帧均可参考' },
        { value: 'middle', label: 'middle — 仅中间帧' },
        { value: 'disabled', label: 'disabled — 关闭' },
      ],
      optional: true, explanationId: 'expl.nvenc.bRefMode', sourceRefs: [nvencSource],
    },
    {
      id: 'h264_nvenc.noScenecut', label: '关闭场景检测 (-no-scenecut)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('noScenecut') },
      commandBinding: { argName: '-no-scenecut', prefix: '-no-scenecut', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.nvenc.noScenecut', sourceRefs: [nvencSource],
    },
    {
      id: 'h264_nvenc.forcedIdr', label: '强制 IDR 关键帧 (-forced-idr)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('forcedIdr') },
      commandBinding: { argName: '-forced-idr', prefix: '-forced-idr', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.nvenc.forcedIdr', sourceRefs: [nvencSource],
    },
    {
      id: 'h264_nvenc.strictGop', label: '严格 GOP 结构 (-strict_gop)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('strictGop') },
      commandBinding: { argName: '-strict_gop', prefix: '-strict_gop', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.nvenc.strictGop', sourceRefs: [nvencSource],
    },
    // -- 编码器内部 ----------------------------------------------
    {
      id: 'h264_nvenc.coder', label: '熵编码器 (-coder)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('coder') },
      commandBinding: { argName: '-coder', prefix: '-coder', phase: 'VIDEO_CODEC' },
      options: [
        { value: 'auto', label: 'auto — 自动' },
        { value: 'cabac', label: 'cabac' },
        { value: 'cavlc', label: 'cavlc' },
      ],
      optional: true, explanationId: 'expl.nvenc.coder', sourceRefs: [nvencSource],
    },
    {
      id: 'h264_nvenc.twopass', label: '2-pass 编码 (-2pass)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('twopass') },
      commandBinding: { argName: '-2pass', prefix: '-2pass', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.nvenc.twopass', sourceRefs: [nvencSource],
    },
    {
      id: 'h264_nvenc.surfaces', label: '内部 Surface 数 (-surfaces)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('surfaces') },
      commandBinding: { argName: '-surfaces', prefix: '-surfaces', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 64 }, defaultValue: 32,
      explanationId: 'expl.nvenc.surfaces', sourceRefs: [nvencSource],
    },
    {
      id: 'h264_nvenc.delay', label: '编码延迟帧数 (-delay)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('delay') },
      commandBinding: { argName: '-delay', prefix: '-delay', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 120, step: 1 },
      optional: true, explanationId: 'expl.nvenc.delay', sourceRefs: [nvencSource],
    },
    // -- QP 偏移 -------------------------------------------------
    {
      id: 'h264_nvenc.initQpP', label: '初始 P 帧 QP (-init_qpP)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('initQpP') },
      commandBinding: { argName: '-init_qpP', prefix: '-init_qpP', phase: 'VIDEO_CODEC' },
      range: { min: -1, max: 51 }, defaultValue: -1,
      explanationId: 'expl.nvenc.initQpP', sourceRefs: [nvencSource],
    },
    {
      id: 'h264_nvenc.initQpB', label: '初始 B 帧 QP (-init_qpB)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('initQpB') },
      commandBinding: { argName: '-init_qpB', prefix: '-init_qpB', phase: 'VIDEO_CODEC' },
      range: { min: -1, max: 51 }, defaultValue: -1,
      explanationId: 'expl.nvenc.initQpB', sourceRefs: [nvencSource],
    },
    {
      id: 'h264_nvenc.initQpI', label: '初始 I 帧 QP (-init_qpI)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('initQpI') },
      commandBinding: { argName: '-init_qpI', prefix: '-init_qpI', phase: 'VIDEO_CODEC' },
      range: { min: -1, max: 51 }, defaultValue: -1,
      explanationId: 'expl.nvenc.initQpI', sourceRefs: [nvencSource],
    },
    {
      id: 'h264_nvenc.qpCbOffset', label: 'Cb QP 偏移 (-qp_cb_offset)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('qpCbOffset') },
      commandBinding: { argName: '-qp_cb_offset', prefix: '-qp_cb_offset', phase: 'VIDEO_CODEC' },
      range: { min: -12, max: 12 }, defaultValue: 0,
      explanationId: 'expl.nvenc.qpCbOffset', sourceRefs: [nvencSource],
    },
    {
      id: 'h264_nvenc.qpCrOffset', label: 'Cr QP 偏移 (-qp_cr_offset)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('qpCrOffset') },
      commandBinding: { argName: '-qp_cr_offset', prefix: '-qp_cr_offset', phase: 'VIDEO_CODEC' },
      range: { min: -12, max: 12 }, defaultValue: 0,
      explanationId: 'expl.nvenc.qpCrOffset', sourceRefs: [nvencSource],
    },
    // -- 加权预测 ------------------------------------------------
    {
      id: 'h264_nvenc.weightedPred', label: '加权预测 (-weighted_pred)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('weightedPred') },
      commandBinding: { argName: '-weighted_pred', prefix: '-weighted_pred', phase: 'VIDEO_CODEC' },
      options: [
        { value: '0', label: '0 — 关闭' },
        { value: '1', label: '1 — 开启' },
      ],
      optional: true, explanationId: 'expl.nvenc.weightedPred', sourceRefs: [nvencSource],
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.h264_nvenc',
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
