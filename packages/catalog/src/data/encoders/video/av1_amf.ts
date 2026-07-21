import type { EncoderDefinition } from '@ffcodec/domain/catalog/catalog-types'
import { CONFIG_PATHS, videoSpecialParamPath } from '@ffcodec/domain/config/config-path'

const amfAv1Source = {
  repository: 'FFmpeg/FFmpeg',
  branch: 'master',
  snapshotDate: '2026-07-20',
  file: 'libavcodec/amfenc_av1.c',
  sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c',
}

export const av1Amf: EncoderDefinition = {
  id: 'av1_amf',
  label: 'av1_amf (AV1 — AMD AMF)',
  ffmpegName: 'av1_amf',
  mediaType: 'video',
  family: 'av1' as const,
  implementation: 'amd' as const,
  availabilityClass: 'hardware-dependent',

  capabilityScope: {
    ffmpeg: { minVersion: '7.0' },
    buildRequirements: ['--enable-amf'],
    hardware: [
      {
        vendor: 'amd',
        feature: 'AV1 硬件编码 (AMF)',
        minimumGeneration: 'RDNA3 (RX 7000 系列)',
        minimumDriver: '23.30+ (Windows) / Mesa RADV (Linux)',
        verificationLevel: 'cross-verified',
        sourceRefs: [
          {
            repository: 'GPUOpen-Libraries/AMF',
            snapshotDate: '2026-07-10',
            file: 'README.md',
            sourceType: 'encoder-official',
            url: 'https://github.com/GPUOpen-LibrariesAndSDKs/AMF',
            note: 'AMF AV1 编码从 RDNA3 代 (RX 7600/7800XT/7900XTX) 开始支持',
          },
        ],
      },
    ],
    notes: [
      '仅 RX 7600 及以上 AMD GPU 支持 AV1 AMF 编码',
      'Linux 需 Mesa RADV 驱动暴露 AV1 编码能力',
    ],
  },

  availabilityNote:
    'AMD AMF 硬件 AV1 编码器。需 RX 7000 系列 (RDNA3) 或更新 GPU。FFCodec 不检测本机硬件。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: false,
    supportsLossless: false,
    supportedContainers: ['mp4', 'mkv', 'webm', 'mov'],
  },

  preset: {
    id: 'av1_amf.preset',
    label: '编码预设 (quality)',
    control: 'select',
    commandBinding: { argName: '-quality', prefix: '-quality', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'speed', label: 'speed — 最快' },
      { value: 'balanced', label: 'balanced — 均衡 (默认)' },
      { value: 'quality', label: 'quality — 最高质量' },
    ],
    defaultValue: 'balanced',
    explanationId: 'expl.amf.preset',
  },

  profile: {
    id: 'av1_amf.profile',
    label: '配置文件 (profile)',
    control: 'select',
    commandBinding: { argName: '-profile:v', prefix: '-profile:v', phase: 'VIDEO_PROFILE' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'main', label: 'main (8-bit 4:2:0)' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.av1_amf.profile',
  },

  // AMF 没有独立的 tune 参数
  pixelFormat: {
    id: 'av1_amf.pixelFormat',
    label: '像素格式 (pix_fmt)',
    control: 'select',
    commandBinding: { argName: '-pix_fmt', prefix: '-pix_fmt', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'nv12', label: 'nv12 (8-bit)' },
      { value: 'yuv420p', label: 'yuv420p (8-bit)' },
      { value: 'p010le', label: 'p010le (10-bit)' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.av1_amf.pixfmt',
  },

  qualityModes: [
    {
      id: 'av1-amf-cqp',
      label: 'CQP (恒定量化参数)',
      emitterId: 'emitter.av1_amf.cqp',
      explanationId: 'expl.av1_amf.cqp',
      sourceRefs: [{ ...amfAv1Source, note: 'AMF CQP 模式' }],
      modeArguments: [
        { argName: '-rc', value: 'cqp', phase: 'VIDEO_RATE_CONTROL' },
      ],
      controls: [
        {
          id: 'av1_amf.cqp.qpI',
          label: 'I 帧 QP (-qp_i)',
          control: 'number',
          commandBinding: { argName: '-qp_i', prefix: '-qp_i', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 51, step: 1 },
          defaultValue: 23,
          explanationId: 'expl.av1_amf.qpI',
        },
        {
          id: 'av1_amf.cqp.qpP',
          label: 'P 帧 QP (-qp_p)',
          control: 'number',
          commandBinding: { argName: '-qp_p', prefix: '-qp_p', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: videoSpecialParamPath('qpP') },
          range: { min: 0, max: 51, step: 1 }, defaultValue: 23,
          explanationId: 'expl.av1_amf.qpP',
        },
      ],
    },
    {
      id: 'vbr',
      label: 'VBR (可变码率)',
      emitterId: 'emitter.av1_amf.vbr',
      explanationId: 'expl.av1_amf.vbr',
      sourceRefs: [{ ...amfAv1Source, note: 'AMF VBR 模式' }],
      modeArguments: [
        { argName: '-rc', value: 'vbr_latency', phase: 'VIDEO_RATE_CONTROL' },
      ],
      controls: [
        {
          id: 'av1_amf.vbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.av1_amf.vbr.bitrate',
        },
        {
          id: 'av1_amf.vbr.maxrate',
          label: '最大码率 (-maxrate)',
          control: 'text',
          commandBinding: { argName: '-maxrate', prefix: '-maxrate', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.maxRate },
          explanationId: 'expl.av1_amf.vbr.maxrate',
        },
        {
          id: 'av1_amf.vbr.bufsize',
          label: '缓冲区 (-bufsize)',
          control: 'text',
          commandBinding: { argName: '-bufsize', prefix: '-bufsize', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bufferSize },
          explanationId: 'expl.av1_amf.vbr.bufsize',
        },
      ],
    },
    {
      id: 'cbr',
      label: 'CBR (恒定码率)',
      emitterId: 'emitter.av1_amf.cbr',
      explanationId: 'expl.av1_amf.cbr',
      sourceRefs: [{ ...amfAv1Source, note: 'AMF CBR 模式' }],
      modeArguments: [
        { argName: '-rc', value: 'cbr', phase: 'VIDEO_RATE_CONTROL' },
      ],
      controls: [
        {
          id: 'av1_amf.cbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.av1_amf.cbr.bitrate',
        },
      ],
    },
    {
      id: 'av1-amf-qvbr',
      label: 'QVBR (质量可变码率)',
      emitterId: 'emitter.av1_amf.qvbr',
      explanationId: 'expl.av1_amf.qvbr',
      sourceRefs: [{ ...amfAv1Source, note: 'AMF QVBR 模式' }],
      modeArguments: [
        { argName: '-rc', value: 'qvbr', phase: 'VIDEO_RATE_CONTROL' },
      ],
      controls: [
        {
          id: 'av1_amf.qvbr.level',
          label: '质量级别 (-qvbr_quality_level)',
          control: 'number',
          commandBinding: { argName: '-qvbr_quality_level', prefix: '-qvbr_quality_level', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 51, step: 1 },
          defaultValue: 23,
          explanationId: 'expl.av1_amf.qvbr.level',
        },
        {
          id: 'av1_amf.qvbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.av1_amf.qvbr.bitrate',
        },
      ],
    },
  ],

  specialParameters: [
    // -- 使用场景 ------------------------------------------------
    {
      id: 'av1_amf.usage', label: '使用场景 (-usage)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('usage') },
      commandBinding: { argName: '-usage', prefix: '-usage', phase: 'VIDEO_CODEC' },
      options: [
        { value: 'transcoding', label: 'transcoding — 转码' },
        { value: 'ultralowlatency', label: 'ultralowlatency — 超低延迟' },
        { value: 'lowlatency', label: 'lowlatency — 低延迟' },
        { value: 'webcam', label: 'webcam — 摄像头' },
      ],
      optional: true, explanationId: 'expl.amf.usage', sourceRefs: [amfAv1Source],
    },
    // -- 自适应量化 ----------------------------------------------
    {
      id: 'av1_amf.vbaq', label: 'VBAQ 方差自适应量化 (-enable_vbaq)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('vbaq') },
      commandBinding: { argName: '-enable_vbaq', prefix: '-enable_vbaq', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.amf.vbaq', sourceRefs: [amfAv1Source],
    },
    {
      id: 'av1_amf.preencode', label: '预编码分析 (-preencode)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('preencode') },
      commandBinding: { argName: '-preencode', prefix: '-preencode', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.amf.preencode', sourceRefs: [amfAv1Source],
    },
    // -- 异步 ----------------------------------------------------
    {
      id: 'av1_amf.asyncDepth', label: '异步编码深度 (-async_depth)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('asyncDepth') },
      commandBinding: { argName: '-async_depth', prefix: '-async_depth', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 64 }, defaultValue: 4, optional: true,
      explanationId: 'expl.av1_amf.asyncDepth', sourceRefs: [amfAv1Source],
    },
    // -- QP 单控 ------------------------------------------------
    {
      id: 'av1_amf.qpI', label: 'I 帧 QP (-qp_i)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('qpI') },
      commandBinding: { argName: '-qp_i', prefix: '-qp_i', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 51, step: 1 }, optional: true,
      explanationId: 'expl.amf.qpI', sourceRefs: [amfAv1Source],
    },
    {
      id: 'av1_amf.qpP', label: 'P 帧 QP (-qp_p)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('qpP') },
      commandBinding: { argName: '-qp_p', prefix: '-qp_p', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 51, step: 1 }, optional: true,
      explanationId: 'expl.amf.qpP', sourceRefs: [amfAv1Source],
    },
    // -- HRD / CBR ---------------------------------------------------
    {
      id: 'av1_amf.enforceHrd', label: '强制 HRD (-enforce_hrd)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('enforceHrd') },
      commandBinding: { argName: '-enforce_hrd', prefix: '-enforce_hrd', phase: 'VIDEO_RATE_CONTROL' },
      optional: true, explanationId: 'expl.amf.enforceHrd', sourceRefs: [amfAv1Source],
    },
    {
      id: 'av1_amf.fillerData', label: '填充数据 (-filler_data)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('fillerData') },
      commandBinding: { argName: '-filler_data', prefix: '-filler_data', phase: 'VIDEO_RATE_CONTROL' },
      optional: true, explanationId: 'expl.amf.fillerData', sourceRefs: [amfAv1Source],
    },
    {
      id: 'av1_amf.maxAuSize', label: '最大 AU 大小 (-max_au_size)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('maxAuSize') },
      commandBinding: { argName: '-max_au_size', prefix: '-max_au_size', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 52428800, step: 1 }, optional: true,
      explanationId: 'expl.amf.maxAuSize', sourceRefs: [amfAv1Source],
    },
    // -- 运动估计 ------------------------------------------------
    {
      id: 'av1_amf.meHalfPel', label: '半像素 ME (-me_half_pel)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('meHalfPel') },
      commandBinding: { argName: '-me_half_pel', prefix: '-me_half_pel', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.amf.meHalfPel', sourceRefs: [amfAv1Source],
    },
    {
      id: 'av1_amf.meQuarterPel', label: '1/4 像素 ME (-me_quarter_pel)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('meQuarterPel') },
      commandBinding: { argName: '-me_quarter_pel', prefix: '-me_quarter_pel', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.amf.meQuarterPel', sourceRefs: [amfAv1Source],
    },
    // -- SEI / 格式 ---------------------------------------------
    {
      id: 'av1_amf.aud', label: 'AU 分隔符 (-aud)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('aud') },
      commandBinding: { argName: '-aud', prefix: '-aud', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.amf.aud', sourceRefs: [amfAv1Source],
    },
    {
      id: 'av1_amf.logToDbg', label: '调试日志 (-log_to_dbg)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('logToDbg') },
      commandBinding: { argName: '-log_to_dbg', prefix: '-log_to_dbg', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.amf.logToDbg', sourceRefs: [amfAv1Source],
    },
    // -- B 帧 ----------------------------------------------------
    {
      id: 'av1_amf.bFrameRef', label: 'B 帧参考 (-b_frame_ref)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('bFrameRef') },
      commandBinding: { argName: '-b_frame_ref', prefix: '-b_frame_ref', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.amf.bFrameRef', sourceRefs: [amfAv1Source],
    },
    {
      id: 'av1_amf.headerInsertionMode', label: 'SEI 头插入模式 (-header_insertion_mode)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('headerInsertionMode') },
      commandBinding: { argName: '-header_insertion_mode', prefix: '-header_insertion_mode', phase: 'VIDEO_CODEC' },
      options: [
        { value: '0', label: '0 — 不插入' },
        { value: '1', label: '1 — 每个 GOP' },
        { value: '2', label: '2 — 每个 IDR' },
      ],
      optional: true, explanationId: 'expl.amf.headerInsertionMode', sourceRefs: [amfAv1Source],
    },
    {
      id: 'av1_amf.queryTimeout', label: '查询超时 ms (-query_timeout)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('queryTimeout') },
      commandBinding: { argName: '-query_timeout', prefix: '-query_timeout', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 60000, step: 1 }, optional: true,
      explanationId: 'expl.amf.queryTimeout', sourceRefs: [amfAv1Source],
    },
    {
      id: 'av1_amf.preanalysis', label: '预分析 (-preanalysis)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('preanalysis') },
      commandBinding: { argName: '-preanalysis', prefix: '-preanalysis', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.amf.preanalysis', sourceRefs: [amfAv1Source],
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.av1_amf',
  sourceRefs: [
    {
      repository: 'GPUOpen-Libraries/AMF',
      snapshotDate: '2026-07-10',
      file: 'README.md',
      sourceType: 'encoder-official',
      url: 'https://github.com/GPUOpen-LibrariesAndSDKs/AMF',
    },
  ],
  sourceAuthority: 'encoder-official',
  verificationLevel: 'cross-verified',
  needsCrossVerification: false,
  status: 'verified',
}
