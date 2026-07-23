import type { EncoderDefinition } from '@ffcodec/domain/catalog/catalog-types'
import { CONFIG_PATHS, videoSpecialParamPath } from '@ffcodec/domain/config/config-path'

const nvencAv1Source = {
  repository: 'FFmpeg/FFmpeg',
  branch: 'master',
  snapshotDate: '2026-07-20',
  file: 'libavcodec/nvenc_av1.c',
  sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c',
}

export const av1Nvenc: EncoderDefinition = {
  id: 'av1_nvenc',
  label: 'av1_nvenc (AV1 — NVIDIA NVENC)',
  ffmpegName: 'av1_nvenc',
  mediaType: 'video',
  family: 'av1' as const,
  implementation: 'nvidia' as const,
  availabilityClass: 'hardware-dependent',

  capabilityScope: {
    ffmpeg: { minVersion: '7.0' },
    buildRequirements: ['--enable-nvenc'],
    hardware: [
      {
        vendor: 'nvidia',
        feature: 'AV1 硬件编码 (NVENC)',
        minimumGeneration: 'Ada Lovelace (RTX 4060+)',
        minimumDriver: '545.23.08 (Linux) / 546.17 (Windows)',
        verificationLevel: 'cross-verified',
        sourceRefs: [
          {
            repository: 'NVIDIA/Video_Codec_SDK',
            snapshotDate: '2026-07-10',
            file: 'NVENC_Application_Note.pdf',
            sourceType: 'encoder-official',
            url: 'https://developer.nvidia.com/video-codec-sdk',
            note: 'NVENC AV1 编码从 Ada Lovelace (NVENC 第 8 代) 开始支持',
          },
        ],
      },
    ],
    notes: [
      '仅 RTX 4060 及以上或 RTX 5060 及以上 GPU 支持 AV1 NVENC 编码',
      '运行 ffmpeg -encoders | grep av1_nvenc 检查可用性',
    ],
  },

  availabilityNote:
    'NVIDIA NVENC 硬件 AV1 编码器。需 RTX 40 系列 (Ada) 或更新 GPU。FFCodec 不检测本机硬件。',

  capabilities: {
    copy: false,
    disabled: false,
    // NVENC 的 -multipass 是单次编码调用内的硬件分析，不使用传统 passlog 双遍。
    supportsTwoPass: false,
    supportsLossless: true,
    supportedContainers: ['mp4', 'mkv', 'webm', 'mov'],
  },

  preset: {
    id: 'av1_nvenc.preset',
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
    explanationId: 'expl.av1_nvenc.preset',
  },

  profile: {
    id: 'av1_nvenc.profile',
    label: '配置文件 (profile)',
    control: 'select',
    commandBinding: { argName: '-profile:v', prefix: '-profile:v', phase: 'VIDEO_PROFILE' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'main', label: 'main (8-bit 4:2:0)' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.av1_nvenc.profile',
  },

  tune: {
    id: 'av1_nvenc.tune',
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
    explanationId: 'expl.av1_nvenc.tune',
  },

  pixelFormat: {
    id: 'av1_nvenc.pixelFormat',
    label: '像素格式 (pix_fmt)',
    control: 'select',
    commandBinding: { argName: '-pix_fmt', prefix: '-pix_fmt', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'yuv420p', label: 'yuv420p' },
      { value: 'p010le', label: 'p010le (10-bit)' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.av1_nvenc.pixfmt',
  },

  qualityModes: [
    {
      id: 'av1-nvenc-cq',
      label: 'CQ (恒定质量)',
      emitterId: 'emitter.av1_nvenc.cq',
      explanationId: 'expl.av1_nvenc.cq',
      modeArguments: [
        { argName: '-rc', value: 'vbr', phase: 'VIDEO_RATE_CONTROL' },
      ],
      sourceRefs: [
        {
          repository: 'NVIDIA/Video_Codec_SDK',
          snapshotDate: '2026-07-10',
          file: 'NVENC_Programming_Guide.pdf',
          sourceType: 'encoder-official',
          note: 'NVENC AV1 CQ 模式使用 -rc vbr + -cq N 组合',
        },
      ],
      recommendedValues: [
        { label: '视觉无损', value: 18, description: '几乎无法察觉的画质损失' },
        { label: '默认', value: 23, description: '画质与体积的良好平衡' },
        { label: '一般质量', value: 28, description: '文件较小，画质可接受' },
      ],
      controls: [
        {
          id: 'av1_nvenc.cq.value',
          label: 'CQ 值 (-cq)',
          control: 'number',
          commandBinding: { argName: '-cq', prefix: '-cq', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 1, max: 51, step: 1 },
          defaultValue: 23,
          explanationId: 'expl.av1_nvenc.cq.value',
        },
      ],
    },
    {
      id: 'cqp',
      label: 'CQP (恒定量化参数)',
      emitterId: 'emitter.av1_nvenc.cqp',
      explanationId: 'expl.av1_nvenc.cqp',
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
          id: 'av1_nvenc.cqp.value',
          label: 'QP 值 (-qp)',
          control: 'number',
          commandBinding: { argName: '-qp', prefix: '-qp', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 51, step: 1 },
          defaultValue: 23,
          explanationId: 'expl.av1_nvenc.cqp.value',
        },
      ],
    },
    {
      id: 'vbr',
      label: 'VBR (可变码率)',
      emitterId: 'emitter.av1_nvenc.vbr',
      explanationId: 'expl.av1_nvenc.vbr',
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
          id: 'av1_nvenc.vbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.av1_nvenc.vbr.bitrate',
        },
        {
          id: 'av1_nvenc.vbr.maxrate',
          label: '最大码率 (-maxrate)',
          control: 'text',
          commandBinding: { argName: '-maxrate', prefix: '-maxrate', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.maxRate },
          explanationId: 'expl.av1_nvenc.vbr.maxrate',
        },
        {
          id: 'av1_nvenc.vbr.bufsize',
          label: '缓冲区 (-bufsize)',
          control: 'text',
          commandBinding: { argName: '-bufsize', prefix: '-bufsize', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bufferSize },
          explanationId: 'expl.av1_nvenc.vbr.bufsize',
        },
      ],
    },
    {
      id: 'cbr',
      label: 'CBR (恒定码率)',
      emitterId: 'emitter.av1_nvenc.cbr',
      explanationId: 'expl.av1_nvenc.cbr',
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
          id: 'av1_nvenc.cbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.av1_nvenc.cbr.bitrate',
        },
      ],
    },
  ],

  specialParameters: [
    // -- GPU 设备 ------------------------------------------------
    {
      id: 'av1_nvenc.gpu', label: 'GPU 设备索引 (-gpu)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('gpu') },
      commandBinding: { argName: '-gpu', prefix: '-gpu', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 7 }, optional: true,
      explanationId: 'expl.av1_nvenc.gpu', sourceRefs: [nvencAv1Source],
    },
    // -- 码率控制（与 VBR/CBR 模式联动）---------------------------
    {
      id: 'av1_nvenc.rcLookahead', label: '码率控制前瞻 (-rc-lookahead)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('rcLookahead') },
      commandBinding: { argName: '-rc-lookahead', prefix: '-rc-lookahead', phase: 'VIDEO_RATE_CONTROL' },
      range: { min: 0, max: 32 }, defaultValue: 0, optional: true,
      explanationId: 'expl.av1_nvenc.rcLookahead', sourceRefs: [nvencAv1Source],
    },
    {
      id: 'av1_nvenc.lookaheadLevel', label: '前瞻等级 (-lookahead_level)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('lookaheadLevel') },
      commandBinding: { argName: '-lookahead_level', prefix: '-lookahead_level', phase: 'VIDEO_RATE_CONTROL' },
      range: { min: 0, max: 15 }, defaultValue: 0, optional: true,
      explanationId: 'expl.av1_nvenc.lookaheadLevel', sourceRefs: [nvencAv1Source],
    },
    // -- 自适应量化 ----------------------------------------------
    {
      id: 'av1_nvenc.spatialAq', label: '空间 AQ (-spatial_aq)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('spatialAq') },
      commandBinding: { argName: '-spatial_aq', prefix: '-spatial_aq', phase: 'VIDEO_CODEC' },
      defaultValue: 1, optional: true,
      explanationId: 'expl.av1_nvenc.spatialAq', sourceRefs: [nvencAv1Source],
    },
    {
      id: 'av1_nvenc.temporalAq', label: '时间 AQ (-temporal_aq)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('temporalAq') },
      commandBinding: { argName: '-temporal_aq', prefix: '-temporal_aq', phase: 'VIDEO_CODEC' },
      defaultValue: 0, optional: true,
      explanationId: 'expl.av1_nvenc.temporalAq', sourceRefs: [nvencAv1Source],
    },
    // -- B 帧 / GOP 控制 -----------------------------------------
    {
      id: 'av1_nvenc.bf', label: '最大 B 帧数 (-bf)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('bFrames') },
      commandBinding: { argName: '-bf', prefix: '-bf', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 4 }, defaultValue: 2, optional: true,
      explanationId: 'expl.av1_nvenc.bf', sourceRefs: [nvencAv1Source],
    },
    {
      id: 'av1_nvenc.bRefMode', label: 'B 帧参考模式 (-b_ref_mode)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('bRefMode') },
      commandBinding: { argName: '-b_ref_mode', prefix: '-b_ref_mode', phase: 'VIDEO_CODEC' },
      options: [
        { value: 'each', label: 'each — 每帧均可参考' },
        { value: 'middle', label: 'middle — 仅中间帧' },
        { value: 'disabled', label: 'disabled — 关闭' },
      ],
      optional: true, explanationId: 'expl.av1_nvenc.bRefMode', sourceRefs: [nvencAv1Source],
    },
    {
      id: 'av1_nvenc.noScenecut', label: '关闭场景检测 (-no-scenecut)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('noScenecut') },
      commandBinding: { argName: '-no-scenecut', prefix: '-no-scenecut', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.av1_nvenc.noScenecut', sourceRefs: [nvencAv1Source],
    },
    {
      id: 'av1_nvenc.forcedIdr', label: '强制 IDR 关键帧 (-forced-idr)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('forcedIdr') },
      commandBinding: { argName: '-forced-idr', prefix: '-forced-idr', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.av1_nvenc.forcedIdr', sourceRefs: [nvencAv1Source],
    },
    {
      id: 'av1_nvenc.strictGop', label: '严格 GOP 结构 (-strict_gop)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('strictGop') },
      commandBinding: { argName: '-strict_gop', prefix: '-strict_gop', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.av1_nvenc.strictGop', sourceRefs: [nvencAv1Source],
    },
    // -- 编码器内部 ----------------------------------------------
    {
      id: 'av1_nvenc.twopass', label: '2-pass 编码 (-2pass)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('twopass') },
      commandBinding: { argName: '-2pass', prefix: '-2pass', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.av1_nvenc.twopass', sourceRefs: [nvencAv1Source],
    },
    {
      id: 'av1_nvenc.surfaces', label: '内部 Surface 数 (-surfaces)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('surfaces') },
      commandBinding: { argName: '-surfaces', prefix: '-surfaces', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 64 }, defaultValue: 32, optional: true,
      explanationId: 'expl.av1_nvenc.surfaces', sourceRefs: [nvencAv1Source],
    },
    {
      id: 'av1_nvenc.delay', label: '编码延迟帧数 (-delay)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('delay') },
      commandBinding: { argName: '-delay', prefix: '-delay', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 120, step: 1 }, optional: true,
      explanationId: 'expl.av1_nvenc.delay', sourceRefs: [nvencAv1Source],
    },
    // -- QP 偏移 -------------------------------------------------
    {
      id: 'av1_nvenc.initQpP', label: '初始 P 帧 QP (-init_qpP)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('initQpP') },
      commandBinding: { argName: '-init_qpP', prefix: '-init_qpP', phase: 'VIDEO_CODEC' },
      range: { min: -1, max: 51 }, defaultValue: -1, optional: true,
      explanationId: 'expl.av1_nvenc.initQpP', sourceRefs: [nvencAv1Source],
    },
    {
      id: 'av1_nvenc.initQpB', label: '初始 B 帧 QP (-init_qpB)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('initQpB') },
      commandBinding: { argName: '-init_qpB', prefix: '-init_qpB', phase: 'VIDEO_CODEC' },
      range: { min: -1, max: 51 }, defaultValue: -1, optional: true,
      explanationId: 'expl.av1_nvenc.initQpB', sourceRefs: [nvencAv1Source],
    },
    {
      id: 'av1_nvenc.initQpI', label: '初始 I 帧 QP (-init_qpI)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('initQpI') },
      commandBinding: { argName: '-init_qpI', prefix: '-init_qpI', phase: 'VIDEO_CODEC' },
      range: { min: -1, max: 51 }, defaultValue: -1, optional: true,
      explanationId: 'expl.av1_nvenc.initQpI', sourceRefs: [nvencAv1Source],
    },
    {
      id: 'av1_nvenc.qpCbOffset', label: 'Cb QP 偏移 (-qp_cb_offset)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('qpCbOffset') },
      commandBinding: { argName: '-qp_cb_offset', prefix: '-qp_cb_offset', phase: 'VIDEO_CODEC' },
      range: { min: -12, max: 12 }, defaultValue: 0, optional: true,
      explanationId: 'expl.av1_nvenc.qpCbOffset', sourceRefs: [nvencAv1Source],
    },
    {
      id: 'av1_nvenc.qpCrOffset', label: 'Cr QP 偏移 (-qp_cr_offset)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('qpCrOffset') },
      commandBinding: { argName: '-qp_cr_offset', prefix: '-qp_cr_offset', phase: 'VIDEO_CODEC' },
      range: { min: -12, max: 12 }, defaultValue: 0, optional: true,
      explanationId: 'expl.av1_nvenc.qpCrOffset', sourceRefs: [nvencAv1Source],
    },
    // -- 加权预测 ------------------------------------------------
    {
      id: 'av1_nvenc.weightedPred', label: '加权预测 (-weighted_pred)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('weightedPred') },
      commandBinding: { argName: '-weighted_pred', prefix: '-weighted_pred', phase: 'VIDEO_CODEC' },
      options: [
        { value: '0', label: '0 — 关闭' },
        { value: '1', label: '1 — 开启' },
      ],
      optional: true, explanationId: 'expl.av1_nvenc.weightedPred', sourceRefs: [nvencAv1Source],
    },
    // -- 错误恢复 / SEI -------------------------------------------
    {
      id: 'av1_nvenc.a53cc', label: '隐藏字幕 (-a53cc)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('a53cc') },
      commandBinding: { argName: '-a53cc', prefix: '-a53cc', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.av1_nvenc.a53cc', sourceRefs: [nvencAv1Source],
    },
    {
      id: 'av1_nvenc.aud', label: 'AU 分隔符 (-aud)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('aud') },
      commandBinding: { argName: '-aud', prefix: '-aud', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.av1_nvenc.aud', sourceRefs: [nvencAv1Source],
    },
    // -- AV1 独有参数 --------------------------------------------
    {
      id: 'av1_nvenc.tileRows', label: 'Tile 行数 (-tile_rows)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('tileRows') },
      commandBinding: { argName: '-tile_rows', prefix: '-tile_rows', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 4 }, optional: true,
      explanationId: 'expl.av1_nvenc.tileRows', sourceRefs: [nvencAv1Source],
    },
    {
      id: 'av1_nvenc.tileCols', label: 'Tile 列数 (-tile_cols)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('tileCols') },
      commandBinding: { argName: '-tile_cols', prefix: '-tile_cols', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 4 }, optional: true,
      explanationId: 'expl.av1_nvenc.tileCols', sourceRefs: [nvencAv1Source],
    },
    {
      id: 'av1_nvenc.highBitDepth', label: '10-bit 编码 (-highbitdepth)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('highBitDepth') },
      commandBinding: { argName: '-highbitdepth', prefix: '-highbitdepth', phase: 'VIDEO_CODEC' },
      optional: true,
      explanationId: 'expl.av1_nvenc.highBitDepth', sourceRefs: [nvencAv1Source],
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.av1_nvenc',
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
