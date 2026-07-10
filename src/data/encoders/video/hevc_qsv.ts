import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { CONFIG_PATHS } from '../../../domain/config/config-path'

export const hevcQsv: EncoderDefinition = {
  id: 'hevc_qsv',
  label: 'hevc_qsv (H.265/HEVC — Intel QSV)',
  ffmpegName: 'hevc_qsv',
  mediaType: 'video',
  family: 'hevc' as const,
  implementation: 'intel' as const,
  availabilityClass: 'hardware-dependent',

  capabilityScope: {
    ffmpeg: { minVersion: '3.4' },
    buildRequirements: ['--enable-libmfx', '--enable-encoder=hevc_qsv'],
    hardware: [
      {
        vendor: 'intel',
        feature: 'Intel Quick Sync Video (HEVC 硬件编码)',
        minimumGeneration: 'Broadwell (5th Gen Core)',
        minimumDriver: 'Intel Media Driver 或 iHD',
        operatingSystems: ['linux', 'windows'],
        verificationLevel: 'cross-verified',
        sourceRefs: [
          {
            repository: 'FFmpeg/FFmpeg',
            snapshotDate: '2026-07-10',
            file: 'libavcodec/qsvenc_hevc.c',
            sourceType: 'ffmpeg-official',
            url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_hevc.c',
            note: 'QSV HEVC 编码器从 FFmpeg 3.4 开始可用',
          },
          {
            repository: 'Intel/media-driver',
            snapshotDate: '2026-07-10',
            file: 'README.md',
            sourceType: 'encoder-official',
            url: 'https://github.com/intel/media-driver',
          },
        ],
      },
      {
        vendor: 'intel',
        feature: 'HEVC 10-bit 编码',
        minimumGeneration: 'Broadwell (5th Gen Core)',
        verificationLevel: 'cross-verified',
        sourceRefs: [
          {
            repository: 'FFmpeg/FFmpeg',
            snapshotDate: '2026-07-10',
            file: 'libavcodec/qsvenc_hevc.c',
            sourceType: 'ffmpeg-official',
          },
        ],
      },
      {
        vendor: 'intel',
        feature: 'HEVC B 帧支持',
        minimumGeneration: 'Skylake (6th Gen Core)',
        verificationLevel: 'cross-verified',
        sourceRefs: [
          {
            repository: 'Intel/media-driver',
            snapshotDate: '2026-07-10',
            file: 'README.md',
            sourceType: 'encoder-official',
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
          },
        ],
      },
    ],
    notes: [
      'HEVC QSV 需要 Broadwell (5th Gen) 以上 Intel GPU',
      'QSV 编码器可用性取决于 FFmpeg --enable-libmfx 编译',
      '实际可用性取决于 Intel 图形硬件、驱动和运行时',
      'FFCodec 只生成命令 — 未检测本机环境',
    ],
  },

  availabilityNote:
    'Intel QSV HEVC 硬件编码器。需要 Broadwell 以上 Intel GPU 和 FFmpeg --enable-libmfx 编译。FFCodec 不检测本机硬件。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: false,
    supportsLossless: false,
    supportedContainers: ['mp4', 'mkv', 'mov'],
  },

  preset: {
    id: 'hevc_qsv.preset',
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
  },

  profile: {
    id: 'hevc_qsv.profile',
    label: '配置文件 (profile)',
    control: 'select',
    commandBinding: { argName: '-profile:v', prefix: '-profile:v', phase: 'VIDEO_PROFILE' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'main', label: 'main (8-bit)' },
      { value: 'main10', label: 'main10 (10-bit)' },
      { value: 'mainsp', label: 'mainsp (still picture)' },
      {
        value: 'rext',
        label: 'rext (range extension)',
        capabilityScope: {
          hardware: [
            {
              vendor: 'intel',
              feature: 'HEVC Range Extension (4:2:2/4:4:4)',
              minimumGeneration: 'Tiger Lake (11th Gen Core)',
              verificationLevel: 'cross-verified',
              sourceRefs: [
                {
                  repository: 'FFmpeg/FFmpeg',
                  snapshotDate: '2026-07-10',
                  file: 'libavcodec/qsvenc_hevc.c',
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
    id: 'hevc_qsv.pixelFormat',
    label: '像素格式 (pix_fmt)',
    control: 'select',
    commandBinding: { argName: '-pix_fmt', prefix: '-pix_fmt', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'nv12', label: 'nv12' },
      { value: 'yuv420p', label: 'yuv420p' },
      { value: 'p010le', label: 'p010le (10-bit)' },
      { value: 'yuyv422', label: 'yuyv422' },
      { value: 'y210le', label: 'y210le (10-bit 4:2:2)' },
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
        },
      ],
      recommendedValues: [
        { label: '高质量', value: 23, description: '接近无损画质' },
        { label: '默认', value: 28, description: 'HEVC 效率较 H.264 更高' },
        { label: '一般质量', value: 35, description: '文件较小' },
      ],
      controls: [
        {
          id: 'hevc_qsv.cqp.value',
          label: 'QP 值 (-qp)',
          control: 'number',
          commandBinding: { argName: '-qp', prefix: '-qp', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 51, step: 1 },
          defaultValue: 28,
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
        },
      ],
      recommendedValues: [
        { label: '高质量', value: 23, description: '接近无损' },
        { label: '默认', value: 28, description: 'HEVC 画质与体积良好平衡' },
        { label: '一般质量', value: 35, description: '文件较小' },
      ],
      controls: [
        {
          id: 'hevc_qsv.icq.value',
          label: '全局质量 (-global_quality)',
          control: 'number',
          commandBinding: { argName: '-global_quality', prefix: '-global_quality', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 1, max: 51, step: 1 },
          defaultValue: 28,
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
        },
      ],
      recommendedValues: [
        { label: '高质量', value: 23, description: '接近无损' },
        { label: '默认', value: 28, description: 'HEVC 画质与体积良好平衡' },
        { label: '一般质量', value: 35, description: '文件较小' },
      ],
      controls: [
        {
          id: 'hevc_qsv.laicq.value',
          label: '全局质量 (-global_quality)',
          control: 'number',
          commandBinding: { argName: '-global_quality', prefix: '-global_quality', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 1, max: 51, step: 1 },
          defaultValue: 28,
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
          id: 'hevc_qsv.vbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.qsv.vbr.bitrate',
        },
        {
          id: 'hevc_qsv.vbr.maxrate',
          label: '最大码率 (-maxrate)',
          control: 'text',
          commandBinding: { argName: '-maxrate', prefix: '-maxrate', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.maxRate },
          explanationId: 'expl.qsv.vbr.maxrate',
        },
        {
          id: 'hevc_qsv.vbr.bufsize',
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
          id: 'hevc_qsv.cbr.bitrate',
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
        },
      ],
      controls: [
        {
          id: 'hevc_qsv.lavbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.qsv.lavbr.bitrate',
        },
        {
          id: 'hevc_qsv.lavbr.maxrate',
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
      id: 'hevc_qsv.asyncdepth',
      label: '异步深度 (-async_depth)',
      control: 'number',
      commandBinding: { argName: '-async_depth', prefix: '-async_depth', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 20 },
      defaultValue: 4,
      explanationId: 'expl.qsv.asyncdepth',
    },
    {
      id: 'hevc_qsv.lowpower',
      label: '低功耗模式 (-low_power)',
      control: 'switch',
      commandBinding: { argName: '-low_power', prefix: '-low_power', compact: true, phase: 'VIDEO_CODEC' },
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
      },
    },
    {
      id: 'hevc_qsv.bf',
      label: '最大 B 帧数 (-bf)',
      control: 'number',
      commandBinding: { argName: '-bf', prefix: '-bf', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 16 },
      defaultValue: 3,
      explanationId: 'expl.qsv.bf',
      capabilityScope: {
        hardware: [
          {
            vendor: 'intel',
            feature: 'HEVC B 帧',
            minimumGeneration: 'Skylake (6th Gen Core)',
            verificationLevel: 'cross-verified',
            sourceRefs: [
              {
                repository: 'Intel/media-driver',
                snapshotDate: '2026-07-10',
                file: 'README.md',
                sourceType: 'encoder-official',
              },
            ],
          },
        ],
      },
    },
    {
      id: 'hevc_qsv.g',
      label: 'GOP 大小 (-g)',
      control: 'number',
      commandBinding: { argName: '-g', prefix: '-g', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 600 },
      defaultValue: 250,
      explanationId: 'expl.qsv.gop',
    },
    {
      id: 'hevc_qsv.refs',
      label: '参考帧数 (-refs)',
      control: 'number',
      commandBinding: { argName: '-refs', prefix: '-refs', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 16 },
      defaultValue: 4,
      explanationId: 'expl.qsv.refs',
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.hevc_qsv',
  sourceRefs: [
    {
      repository: 'FFmpeg/FFmpeg',
      snapshotDate: '2026-07-10',
      file: 'libavcodec/qsvenc_hevc.c',
      sourceType: 'ffmpeg-official',
      url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_hevc.c',
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
