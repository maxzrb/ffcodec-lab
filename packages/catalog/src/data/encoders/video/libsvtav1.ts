import type { EncoderDefinition } from '@ffcodec/domain/catalog/catalog-types'
import { CONFIG_PATHS, videoSpecialParamPath } from '@ffcodec/domain/config/config-path'

const svtav1SourceRefs = [{
  repository: 'AOMediaCodec/SVT-AV1',
  branch: 'master',
  snapshotDate: '2026-07-20',
  file: 'Docs/Parameters.md',
  sourceType: 'encoder-official' as const,
  url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md',
}]

function svtav1ParamSource(symbol: string) {
  return { ...svtav1SourceRefs[0], symbol }
}

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
    supportsTwoPass: true,
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
      id: 'twoPass',
      label: '2-Pass VBR (双遍可变码率)',
      emitterId: 'emitter.libsvtav1.twopass',
      explanationId: 'expl.libsvtav1.twopass',
      sourceRefs: svtav1SourceRefs,
      controls: [
        {
          id: 'libsvtav1.twopass.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.libsvtav1.twopass.bitrate',
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
    // -- 基础调优 ------------------------------------------------
    {
      id: 'libsvtav1.tune',
      label: '视觉调优模式 (tune)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('tune') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'tune', separator: ':' },
      },
      options: [
        { value: '0', label: '0 — 主观质量 (VQ)' },
        { value: '1', label: '1 — 客观质量 (PSNR)' },
      ],
      optional: true,
      explanationId: 'expl.libsvtav1.tune',
      sourceRefs: [svtav1ParamSource('Tune / --tune')],
    },
    {
      id: 'libsvtav1.keyint',
      label: '关键帧间隔 (keyint)',
      control: 'text',
      configBinding: { path: videoSpecialParamPath('keyint') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'keyint', separator: ':' },
      },
      optional: true,
      explanationId: 'expl.libsvtav1.keyint',
      sourceRefs: [svtav1ParamSource('IntraPeriodLength / --keyint')],
    },
    {
      id: 'libsvtav1.irefreshType',
      label: '帧内刷新类型 (irefresh-type)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('irefreshType') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'irefresh-type', separator: ':' },
      },
      options: [
        { value: '1', label: '1 — CRA 开放 GOP（推荐）' },
        { value: '2', label: '2 — IDR 封闭 GOP' },
      ],
      optional: true,
      explanationId: 'expl.libsvtav1.irefreshType',
      sourceRefs: [svtav1ParamSource('IntraRefreshType / --irefresh-type')],
    },
    {
      id: 'libsvtav1.lookahead',
      label: '前瞻距离 (lookahead)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('lookahead') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'lookahead', separator: ':' },
      },
      range: { min: -1, max: 120, step: 1 },
      optional: true,
      explanationId: 'expl.libsvtav1.lookahead',
      sourceRefs: [svtav1ParamSource('LookaheadDistance / --lookahead')],
    },
    {
      id: 'libsvtav1.lp',
      label: '逻辑处理器数 (lp)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('lp') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'lp', separator: ':' },
      },
      range: { min: 0, max: 128, step: 1 },
      optional: true,
      explanationId: 'expl.libsvtav1.lp',
      sourceRefs: [svtav1ParamSource('LogicalProcessors / --lp')],
    },

    // -- 视觉质量 / PSY 增强 -------------------------------------
    {
      id: 'libsvtav1.sharpness',
      label: '锐度偏向 (sharpness)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('sharpness') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'sharpness', separator: ':' },
      },
      range: { min: -7, max: 7, step: 1 },
      optional: true,
      explanationId: 'expl.libsvtav1.sharpness',
      sourceRefs: [svtav1ParamSource('Sharpness / --sharpness')],
    },
    {
      id: 'libsvtav1.enableVarianceBoost',
      label: '启用方差增强 (enable-variance-boost)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('enableVarianceBoost') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'enable-variance-boost', separator: ':' },
      },
      optional: true,
      explanationId: 'expl.libsvtav1.enableVarianceBoost',
      sourceRefs: [svtav1ParamSource('VarianceBoost / --enable-variance-boost')],
    },
    {
      id: 'libsvtav1.varianceBoostStrength',
      label: '方差增强强度 (variance-boost-strength)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('varianceBoostStrength') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'variance-boost-strength', separator: ':' },
      },
      range: { min: 1, max: 4, step: 1 },
      optional: true,
      explanationId: 'expl.libsvtav1.varianceBoostStrength',
      sourceRefs: [svtav1ParamSource('VarianceBoostStrength / --variance-boost-strength')],
    },
    {
      id: 'libsvtav1.varianceOctile',
      label: '方差八分位阈值 (variance-octile)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('varianceOctile') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'variance-octile', separator: ':' },
      },
      range: { min: 1, max: 8, step: 1 },
      optional: true,
      explanationId: 'expl.libsvtav1.varianceOctile',
      sourceRefs: [svtav1ParamSource('VarianceOctile / --variance-octile')],
    },

    // -- 量化与自适应量化 ----------------------------------------
    {
      id: 'libsvtav1.aqMode',
      label: '自适应量化模式 (aq-mode)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('aqMode') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'aq-mode', separator: ':' },
      },
      options: [
        { value: '0', label: '0 — 关闭' },
        { value: '1', label: '1 — 方差基准' },
        { value: '2', label: '2 — DeltaQ 预测效率（默认，推荐）' },
      ],
      optional: true,
      explanationId: 'expl.libsvtav1.aqMode',
      sourceRefs: [svtav1ParamSource('AQMode / --aq-mode')],
    },
    {
      id: 'libsvtav1.qpScaleCompressStrength',
      label: 'QP 曲线压缩强度 (qp-scale-compress-strength)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('qpScaleCompressStrength') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'qp-scale-compress-strength', separator: ':' },
      },
      range: { min: 0, max: 8, step: 1 },
      optional: true,
      explanationId: 'expl.libsvtav1.qpScaleCompressStrength',
      sourceRefs: [svtav1ParamSource('QPScaleCompressStrength')],
    },
    {
      id: 'libsvtav1.luminanceQpBias',
      label: '亮度 QP 偏向 (luminance-qp-bias)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('luminanceQpBias') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'luminance-qp-bias', separator: ':' },
      },
      range: { min: 0, max: 100, step: 1 },
      optional: true,
      explanationId: 'expl.libsvtav1.luminanceQpBias',
      sourceRefs: [svtav1ParamSource('LuminanceQPBias / --luminance-qp-bias')],
    },

    // -- 时域滤波 ------------------------------------------------
    {
      id: 'libsvtav1.enableTf',
      label: '启用时域滤波 (enable-tf)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('enableTf') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'enable-tf', separator: ':' },
      },
      optional: true,
      explanationId: 'expl.libsvtav1.enableTf',
      sourceRefs: [svtav1ParamSource('TemporalFiltering / --enable-tf')],
    },
    {
      id: 'libsvtav1.tfStrength',
      label: '时域滤波强度 (tf-strength)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('tfStrength') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'tf-strength', separator: ':' },
      },
      range: { min: 0, max: 4, step: 1 },
      optional: true,
      explanationId: 'expl.libsvtav1.tfStrength',
      sourceRefs: [svtav1ParamSource('TemporalFilteringStrength / --tf-strength')],
    },

    // -- 量化矩阵 (QM) -------------------------------------------
    {
      id: 'libsvtav1.enableQm',
      label: '启用量化矩阵 (enable-qm)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('enableQm') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'enable-qm', separator: ':' },
      },
      optional: true,
      explanationId: 'expl.libsvtav1.enableQm',
      sourceRefs: [svtav1ParamSource('QuantizationMatrices / --enable-qm')],
    },
    {
      id: 'libsvtav1.qmMin',
      label: '量化矩阵最小值 (qm-min)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('qmMin') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'qm-min', separator: ':' },
      },
      range: { min: 0, max: 15, step: 1 },
      optional: true,
      explanationId: 'expl.libsvtav1.qmMin',
      sourceRefs: [svtav1ParamSource('QMMin / --qm-min')],
    },

    // -- 其他编码器特性 ------------------------------------------
    {
      id: 'libsvtav1.enableOverlays',
      label: '启用覆盖层增强 (enable-overlays)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('enableOverlays') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'enable-overlays', separator: ':' },
      },
      optional: true,
      explanationId: 'expl.libsvtav1.enableOverlays',
      sourceRefs: [svtav1ParamSource('Overlays / --enable-overlays')],
    },
    {
      id: 'libsvtav1.scd',
      label: '场景切换检测 (scd)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('scd') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'scd', separator: ':' },
      },
      optional: true,
      explanationId: 'expl.libsvtav1.scd',
      sourceRefs: [svtav1ParamSource('SceneChangeDetection / --scd')],
    },
    {
      id: 'libsvtav1.enableDlf',
      label: '去块滤波模式 (enable-dlf)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('enableDlf') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'enable-dlf', separator: ':' },
      },
      options: [
        { value: '0', label: '0 — 关闭去块滤波' },
        { value: '1', label: '1 — 全部开启（默认）' },
        { value: '2', label: '2 — 仅非关键帧' },
      ],
      optional: true,
      explanationId: 'expl.libsvtav1.enableDlf',
      sourceRefs: [svtav1ParamSource('DeblockingLoopFilter / --enable-dlf')],
    },

    // -- PSY 高级特性 (SVT-AV1 v4.0+ / PSY fork) ----------------
    {
      id: 'libsvtav1.acBias',
      label: 'AC 偏向 (ac-bias) [PSY]',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('acBias') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'ac-bias', separator: ':' },
      },
      optional: true,
      explanationId: 'expl.libsvtav1.acBias',
      sourceRefs: [{
        repository: 'AOMediaCodec/SVT-AV1',
        branch: 'master',
        snapshotDate: '2026-07-20',
        file: 'Docs/Parameters.md',
        symbol: 'ACBias PSY / --ac-bias',
        sourceType: 'encoder-official',
        url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md',
      }],
    },

    // -- Film Grain (已存在，保留) --------------------------------
    {
      id: 'libsvtav1.filmGrain',
      label: 'Film Grain Synthesis 强度',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('filmGrain') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'film-grain', separator: ':' },
      },
      range: { min: 0, max: 50, step: 1 },
      optional: true,
      explanationId: 'expl.libsvtav1.filmGrain',
      sourceRefs: [svtav1ParamSource('FilmGrain / --film-grain')],
    },
    {
      id: 'libsvtav1.filmGrainDenoise',
      label: 'Film Grain 去噪',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('filmGrainDenoise') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { key: 'film-grain-denoise', separator: ':' },
      },
      optional: true,
      explanationId: 'expl.libsvtav1.filmGrainDenoise',
      sourceRefs: [svtav1ParamSource('FilmGrainDenoise / --film-grain-denoise')],
    },

    // -- 附加参数字典 (保留) ------------------------------------
    {
      id: 'libsvtav1.svtav1params',
      label: 'SVT-AV1 附加参数 (-svtav1-params)',
      control: 'text',
      configBinding: { path: videoSpecialParamPath('svtav1Params') },
      commandBinding: {
        argName: '-svtav1-params', prefix: '-svtav1-params',
        phase: 'VIDEO_CODEC', dictionary: { separator: ':' },
      },
      optional: true,
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
