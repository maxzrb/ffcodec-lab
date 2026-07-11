import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { CONFIG_PATHS, videoSpecialParamPath } from '../../../domain/config/config-path'

export const h264Qsv: EncoderDefinition = {
  id: 'h264_qsv',
  label: 'h264_qsv (H.264/AVC — Intel QSV)',
  ffmpegName: 'h264_qsv',
  mediaType: 'video',
  family: 'h264' as const,
  implementation: 'intel' as const,
  availabilityClass: 'hardware-dependent',

  capabilityScope: {
    ffmpeg: { minVersion: '3.3' },
    buildRequirements: ['--enable-libmfx', '--enable-encoder=h264_qsv'],
    hardware: [
      {
        vendor: 'intel',
        feature: 'Intel Quick Sync Video (H.264 硬件编码)',
        minimumGeneration: 'Sandy Bridge (2nd Gen Core)',
        minimumDriver: 'Intel Media Driver 或 iHD',
        operatingSystems: ['linux', 'windows'],
        verificationLevel: 'cross-verified',
        sourceRefs: [
          {
            repository: 'FFmpeg/FFmpeg',
            snapshotDate: '2026-07-10',
            file: 'libavcodec/qsvenc_h264.c',
            sourceType: 'ffmpeg-official',
            url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_h264.c',
            note: 'QSV H.264 编码器从 FFmpeg 3.3 开始可用',
          },
          {
            repository: 'Intel/media-driver',
            snapshotDate: '2026-07-10',
            file: 'README.md',
            sourceType: 'encoder-official',
            url: 'https://github.com/intel/media-driver',
            note: 'Intel Media Driver 提供 QSV 运行时支持',
          },
        ],
      },
      {
        vendor: 'intel',
        feature: 'H.264 B 帧支持',
        minimumGeneration: 'Sandy Bridge',
        verificationLevel: 'cross-verified',
        sourceRefs: [
          {
            repository: 'FFmpeg/FFmpeg',
            snapshotDate: '2026-07-10',
            file: 'libavcodec/qsvenc.c',
            sourceType: 'ffmpeg-official',
            note: 'QSV B 帧从 Sandy Bridge 代开始支持',
          },
        ],
      },
      {
        vendor: 'intel',
        feature: 'Look-ahead (LA)',
        minimumGeneration: 'Haswell (4th Gen Core)',
        verificationLevel: 'cross-verified',
        sourceRefs: [
          {
            repository: 'Intel/media-driver',
            snapshotDate: '2026-07-10',
            file: 'README.md',
            sourceType: 'encoder-official',
            note: 'Look-ahead 需要 Haswell 以上 GPU',
          },
        ],
      },
      {
        vendor: 'intel',
        feature: '低功耗模式 (low_power)',
        minimumGeneration: 'Broadwell (5th Gen Core)',
        verificationLevel: 'cross-verified',
        sourceRefs: [
          {
            repository: 'FFmpeg/FFmpeg',
            snapshotDate: '2026-07-10',
            file: 'libavcodec/qsvenc.c',
            sourceType: 'ffmpeg-official',
            note: 'low_power 需要 Broadwell 以上',
          },
        ],
      },
    ],
    notes: [
      'QSV 编码器可用性取决于 FFmpeg 编译配置（--enable-libmfx）',
      '实际可用性取决于 Intel 图形硬件、iHD/i965 驱动和运行时',
      'Linux 上推荐使用 iHD 驱动（Intel Media Driver），Windows 上推荐使用 Intel 官方驱动',
      'FFCodec 只生成命令 — 未检测本机环境',
    ],
  },

  availabilityNote:
    'Intel QSV H.264 硬件编码器。需要 Intel 集成/独立显卡和 FFmpeg --enable-libmfx 编译。FFCodec 不检测本机硬件。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: false,
    supportsLossless: false,
    supportedContainers: ['mp4', 'mkv', 'mov', 'flv'],
  },

  preset: {
    id: 'h264_qsv.preset',
    label: '编码预设 (preset)',
    control: 'select',
    commandBinding: { argName: '-preset', prefix: '-preset', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'veryfast', label: 'veryfast — 最快速度' },
      { value: 'faster', label: 'faster' },
      { value: 'fast', label: 'fast' },
      { value: 'medium', label: 'medium — 默认', description: '速度与质量平衡' },
      { value: 'slow', label: 'slow' },
      { value: 'slower', label: 'slower' },
      { value: 'veryslow', label: 'veryslow — 最高质量' },
    ],
    defaultValue: 'medium',
    explanationId: 'expl.qsv.preset',
    capabilityScope: {
      notes: [
        'QSV preset 有效值为 veryfast/faster/fast/medium/slow/slower/veryslow',
        '与 x264 preset 名称相同但内部映射不同',
      ],
    },
  },

  profile: {
    id: 'h264_qsv.profile',
    label: '配置文件 (profile)',
    control: 'select',
    commandBinding: { argName: '-profile:v', prefix: '-profile:v', phase: 'VIDEO_PROFILE' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'baseline', label: 'baseline' },
      { value: 'main', label: 'main' },
      { value: 'high', label: 'high' },
      {
        value: 'high422',
        label: 'high422',
        capabilityScope: {
          hardware: [
            {
              vendor: 'intel',
              feature: '4:2:2 色度采样',
              minimumGeneration: 'Haswell',
              verificationLevel: 'cross-verified',
              sourceRefs: [
                {
                  repository: 'FFmpeg/FFmpeg',
                  snapshotDate: '2026-07-10',
                  file: 'libavcodec/qsvenc_h264.c',
                  sourceType: 'ffmpeg-official',
                },
              ],
            },
          ],
        },
      },
      {
        value: 'high444',
        label: 'high444',
        capabilityScope: {
          hardware: [
            {
              vendor: 'intel',
              feature: '4:4:4 色度采样',
              minimumGeneration: 'Broadwell',
              verificationLevel: 'cross-verified',
              sourceRefs: [
                {
                  repository: 'FFmpeg/FFmpeg',
                  snapshotDate: '2026-07-10',
                  file: 'libavcodec/qsvenc_h264.c',
                  sourceType: 'ffmpeg-official',
                },
              ],
            },
          ],
        },
      },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.qsv.profile',
  },

  // QSV has no -tune parameter
  tune: undefined,

  pixelFormat: {
    id: 'h264_qsv.pixelFormat',
    label: '像素格式 (pix_fmt)',
    control: 'select',
    commandBinding: { argName: '-pix_fmt', prefix: '-pix_fmt', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'nv12', label: 'nv12' },
      { value: 'yuv420p', label: 'yuv420p' },
      { value: 'p010le', label: 'p010le (10-bit)' },
      { value: 'yuyv422', label: 'yuyv422' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.qsv.pixfmt',
  },

  qualityModes: [
    // -- CQP ---------------------------------------------------
    {
      id: 'qsv-cqp',
      label: 'CQP (恒定 QP — QSV)',
      emitterId: 'emitter.qsv.cqp',
      explanationId: 'expl.qsv.cqp',
      sourceRefs: [
        {
          repository: 'FFmpeg/FFmpeg',
          snapshotDate: '2026-07-10',
          file: 'libavcodec/qsvenc.c',
          sourceType: 'ffmpeg-official',
          note: 'QSV CQP 使用 -qp 参数，不需要 -rc 标志',
        },
      ],
      recommendedValues: [
        { label: '高质量', value: 18, description: '接近无损画质' },
        { label: '默认', value: 23, description: '画质与体积良好平衡' },
        { label: '一般质量', value: 28, description: '文件较小' },
      ],
      controls: [
        {
          id: 'h264_qsv.cqp.value',
          label: 'QP 值 (-qp)',
          control: 'number',
          commandBinding: { argName: '-qp', prefix: '-qp', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 51, step: 1 },
          defaultValue: 23,
          explanationId: 'expl.qsv.cqp.value',
        },
      ],
    },
    // -- ICQ ---------------------------------------------------
    {
      id: 'qsv-icq',
      label: 'ICQ (智能恒定质量 — QSV)',
      emitterId: 'emitter.qsv.icq',
      explanationId: 'expl.qsv.icq',
      modeArguments: [
        { argName: '-look_ahead', value: 1, phase: 'VIDEO_RATE_CONTROL' },
      ],
      sourceRefs: [
        {
          repository: 'Intel/media-driver',
          snapshotDate: '2026-07-10',
          file: 'README.md',
          sourceType: 'encoder-official',
          note: 'ICQ 是 Intel QSV 特有的智能质量模式，使用 -global_quality',
        },
      ],
      recommendedValues: [
        { label: '高质量', value: 18, description: '接近无损' },
        { label: '默认', value: 23, description: '画质与体积良好平衡' },
        { label: '一般质量', value: 28, description: '文件较小' },
      ],
      controls: [
        {
          id: 'h264_qsv.icq.value',
          label: '全局质量 (-global_quality)',
          control: 'number',
          commandBinding: { argName: '-global_quality', prefix: '-global_quality', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 1, max: 51, step: 1 },
          defaultValue: 23,
          explanationId: 'expl.qsv.icq.value',
        },
      ],
    },
    // -- LA_ICQ ------------------------------------------------
    {
      id: 'qsv-la-icq',
      label: 'LA-ICQ (前瞻智能恒定质量 — QSV)',
      emitterId: 'emitter.qsv.laicq',
      explanationId: 'expl.qsv.laicq',
      modeArguments: [
        { argName: '-look_ahead', value: 1, phase: 'VIDEO_RATE_CONTROL' },
        { argName: '-look_ahead_depth', value: 40, phase: 'VIDEO_RATE_CONTROL' },
      ],
      sourceRefs: [
        {
          repository: 'Intel/media-driver',
          snapshotDate: '2026-07-10',
          file: 'README.md',
          sourceType: 'encoder-official',
          note: 'LA_ICQ 在 ICQ 基础上增加 look_ahead_depth 前瞻深度',
        },
      ],
      recommendedValues: [
        { label: '高质量', value: 18, description: '接近无损' },
        { label: '默认', value: 23, description: '画质与体积良好平衡' },
        { label: '一般质量', value: 28, description: '文件较小' },
      ],
      controls: [
        {
          id: 'h264_qsv.laicq.value',
          label: '全局质量 (-global_quality)',
          control: 'number',
          commandBinding: { argName: '-global_quality', prefix: '-global_quality', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 1, max: 51, step: 1 },
          defaultValue: 23,
          explanationId: 'expl.qsv.laicq.value',
        },
      ],
    },
    // -- VBR ---------------------------------------------------
    {
      id: 'qsv-vbr',
      label: 'VBR (可变码率 — QSV)',
      emitterId: 'emitter.qsv.vbr',
      explanationId: 'expl.qsv.vbr',
      sourceRefs: [
        {
          repository: 'FFmpeg/FFmpeg',
          snapshotDate: '2026-07-10',
          file: 'libavcodec/qsvenc.c',
          sourceType: 'ffmpeg-official',
        },
      ],
      controls: [
        {
          id: 'h264_qsv.vbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.qsv.vbr.bitrate',
        },
        {
          id: 'h264_qsv.vbr.maxrate',
          label: '最大码率 (-maxrate)',
          control: 'text',
          commandBinding: { argName: '-maxrate', prefix: '-maxrate', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.maxRate },
          explanationId: 'expl.qsv.vbr.maxrate',
        },
        {
          id: 'h264_qsv.vbr.bufsize',
          label: '缓冲区 (-bufsize)',
          control: 'text',
          commandBinding: { argName: '-bufsize', prefix: '-bufsize', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bufferSize },
          explanationId: 'expl.qsv.vbr.bufsize',
        },
      ],
    },
    // -- CBR ---------------------------------------------------
    {
      id: 'qsv-cbr',
      label: 'CBR (恒定码率 — QSV)',
      emitterId: 'emitter.qsv.cbr',
      explanationId: 'expl.qsv.cbr',
      sourceRefs: [
        {
          repository: 'FFmpeg/FFmpeg',
          snapshotDate: '2026-07-10',
          file: 'libavcodec/qsvenc.c',
          sourceType: 'ffmpeg-official',
        },
      ],
      controls: [
        {
          id: 'h264_qsv.cbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.qsv.cbr.bitrate',
        },
      ],
    },
    // -- LA_VBR ------------------------------------------------
    {
      id: 'qsv-la-vbr',
      label: 'Look-ahead VBR (前瞻可变码率 — QSV)',
      emitterId: 'emitter.qsv.lavbr',
      explanationId: 'expl.qsv.lavbr',
      modeArguments: [
        { argName: '-look_ahead', value: 1, phase: 'VIDEO_RATE_CONTROL' },
        { argName: '-look_ahead_depth', value: 40, phase: 'VIDEO_RATE_CONTROL' },
      ],
      sourceRefs: [
        {
          repository: 'Intel/media-driver',
          snapshotDate: '2026-07-10',
          file: 'README.md',
          sourceType: 'encoder-official',
          note: 'Look-ahead VBR 提供更好的码率分配',
        },
      ],
      controls: [
        {
          id: 'h264_qsv.lavbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.qsv.lavbr.bitrate',
        },
        {
          id: 'h264_qsv.lavbr.maxrate',
          label: '最大码率 (-maxrate)',
          control: 'text',
          commandBinding: { argName: '-maxrate', prefix: '-maxrate', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.maxRate },
          explanationId: 'expl.qsv.lavbr.maxrate',
        },
      ],
    },
  ],

  specialParameters: [
    {
      id: 'h264_qsv.asyncdepth',
      label: '异步深度 (-async_depth)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('asyncDepth') },
      commandBinding: { argName: '-async_depth', prefix: '-async_depth', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 20 },
      defaultValue: 4,
      explanationId: 'expl.qsv.asyncdepth',
    },
    {
      id: 'h264_qsv.lowpower',
      label: '低功耗模式 (-low_power)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('lowPower') },
      commandBinding: { argName: '-low_power', prefix: '-low_power', phase: 'VIDEO_CODEC' },
      defaultValue: 0,
      explanationId: 'expl.qsv.lowpower',
      capabilityScope: {
        hardware: [
          {
            vendor: 'intel',
            feature: '低功耗编码模式',
            minimumGeneration: 'Broadwell (5th Gen Core)',
            verificationLevel: 'cross-verified',
            sourceRefs: [
              {
                repository: 'FFmpeg/FFmpeg',
                snapshotDate: '2026-07-10',
                file: 'libavcodec/qsvenc.c',
                sourceType: 'ffmpeg-official',
              },
            ],
          },
        ],
        notes: ['low_power 需要 Broadwell 以上 GPU'],
      },
    },
    {
      id: 'h264_qsv.bf',
      label: '最大 B 帧数 (-bf)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('bFrames') },
      commandBinding: { argName: '-bf', prefix: '-bf', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 16 },
      defaultValue: 3,
      explanationId: 'expl.qsv.bf',
    },
    {
      id: 'h264_qsv.g',
      label: 'GOP 大小 (-g)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('gopSize') },
      commandBinding: { argName: '-g', prefix: '-g', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 600 },
      defaultValue: 250,
      explanationId: 'expl.qsv.gop',
    },
    {
      id: 'h264_qsv.refs',
      label: '参考帧数 (-refs)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('refs') },
      commandBinding: { argName: '-refs', prefix: '-refs', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 16 },
      defaultValue: 4,
      explanationId: 'expl.qsv.refs',
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.h264_qsv',
  sourceRefs: [
    {
      repository: 'FFmpeg/FFmpeg',
      snapshotDate: '2026-07-10',
      file: 'libavcodec/qsvenc_h264.c',
      sourceType: 'ffmpeg-official',
      url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_h264.c',
    },
    {
      repository: 'Intel/media-driver',
      snapshotDate: '2026-07-10',
      file: 'README.md',
      sourceType: 'encoder-official',
      url: 'https://github.com/intel/media-driver',
    },
  ],
  sourceAuthority: 'encoder-official',
  verificationLevel: 'cross-verified',
  needsCrossVerification: false,
  status: 'verified',
}
