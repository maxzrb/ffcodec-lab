import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'

export const libx265: EncoderDefinition = {
  id: 'libx265',
  label: 'libx265 (H.265/HEVC)',
  ffmpegName: 'libx265',
  mediaType: 'video',
  family: 'hevc',
  implementation: 'software',
  availabilityNote:
    'libx265 是 HEVC/H.265 软件编码器。可用性取决于本机 FFmpeg 构建。可运行 ffmpeg -encoders | grep x265 检查。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: true,
    supportsLossless: true,
    supportedContainers: ['mp4', 'mkv', 'mov', 'mxf', 'ts'],
  },

  preset: {
    id: 'libx265.preset',
    label: '编码预设 (preset)',
    control: 'select',
    commandBinding: { argName: '-preset', prefix: '-preset', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'ultrafast', label: 'ultrafast' },
      { value: 'superfast', label: 'superfast' },
      { value: 'veryfast', label: 'veryfast' },
      { value: 'faster', label: 'faster' },
      { value: 'fast', label: 'fast' },
      { value: 'medium', label: 'medium', description: '默认值' },
      { value: 'slow', label: 'slow' },
      { value: 'slower', label: 'slower' },
      { value: 'veryslow', label: 'veryslow' },
      { value: 'placebo', label: 'placebo', description: '极慢，不推荐' },
    ],
    defaultValue: 'medium',
    explanationId: 'expl.libx265.preset',
  },

  profile: {
    id: 'libx265.profile',
    label: '配置文件 (profile)',
    control: 'select',
    commandBinding: { argName: '-profile:v', prefix: '-profile:v', phase: 'VIDEO_PROFILE' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'main', label: 'main' },
      { value: 'main10', label: 'main10' },
      { value: 'main12', label: 'main12' },
      { value: 'mainstillpicture', label: 'mainstillpicture' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.libx265.profile',
  },

  tune: {
    id: 'libx265.tune',
    label: '场景优化 (tune)',
    control: 'select',
    commandBinding: { argName: '-tune', prefix: '-tune', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '无 (自动)' },
      { value: 'psnr', label: 'psnr' },
      { value: 'ssim', label: 'ssim' },
      { value: 'grain', label: 'grain' },
      { value: 'fastdecode', label: 'fastdecode' },
      { value: 'zerolatency', label: 'zerolatency' },
      { value: 'animation', label: 'animation' },
      { value: 'stillimage', label: 'stillimage' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.libx265.tune',
  },

  pixelFormat: {
    id: 'libx265.pixelFormat',
    label: '像素格式 (pix_fmt)',
    control: 'select',
    commandBinding: { argName: '-pix_fmt', prefix: '-pix_fmt', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'yuv420p', label: 'yuv420p' },
      { value: 'yuv422p', label: 'yuv422p' },
      { value: 'yuv444p', label: 'yuv444p' },
      { value: 'yuv420p10le', label: 'yuv420p10le' },
      { value: 'yuv422p10le', label: 'yuv422p10le' },
      { value: 'yuv444p10le', label: 'yuv444p10le' },
      { value: 'yuv420p12le', label: 'yuv420p12le' },
      { value: 'yuv422p12le', label: 'yuv422p12le' },
      { value: 'yuv444p12le', label: 'yuv444p12le' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.libx265.pixfmt',
  },

  qualityModes: [
    {
      id: 'crf',
      label: 'CRF (恒定质量)',
      emitterId: 'emitter.crf',
      explanationId: 'expl.libx265.crf',
      sourceRefs: [
        {
          repository: 'Lake1059/FFmpegFreeUI',
          branch: 'main',
          snapshotDate: '2026-07-10',
          file: 'src/databases/video-encoders.json',
          symbol: 'libx265.quality.crf',
          sourceType: 'ffmpegfreeui',
        },
      ],
      recommendedValues: [
        { label: '高质量', value: 24, description: '接近透明质量' },
        { label: '默认', value: 28, description: '画质与体积的良好平衡' },
        { label: '一般质量', value: 32, description: '文件较小' },
      ],
      controls: [
        {
          id: 'libx265.crf.value',
          label: 'CRF 值',
          control: 'number',
          commandBinding: { argName: '-crf', prefix: '-crf', phase: 'VIDEO_RATE_CONTROL' },
          range: { min: 0, max: 51, step: 0.1 },
          defaultValue: 28,
          explanationId: 'expl.libx265.crf.value',
        },
      ],
    },
    {
      id: 'vbr',
      label: 'VBR (动态码率)',
      emitterId: 'emitter.vbr',
      explanationId: 'expl.libx265.vbr',
      sourceRefs: [
        {
          repository: 'Lake1059/FFmpegFreeUI',
          branch: 'main',
          snapshotDate: '2026-07-10',
          file: 'src/databases/video-encoders.json',
          symbol: 'libx265.quality.vbr',
          sourceType: 'ffmpegfreeui',
        },
      ],
      controls: [
        {
          id: 'libx265.vbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          defaultValue: '5000k',
          explanationId: 'expl.libx265.vbr.bitrate',
        },
        {
          id: 'libx265.vbr.maxrate',
          label: '最大码率 (-maxrate)',
          control: 'text',
          commandBinding: { argName: '-maxrate', prefix: '-maxrate', phase: 'VIDEO_RATE_CONTROL' },
          explanationId: 'expl.libx265.vbr.maxrate',
        },
        {
          id: 'libx265.vbr.bufsize',
          label: '缓冲区 (-bufsize)',
          control: 'text',
          commandBinding: { argName: '-bufsize', prefix: '-bufsize', phase: 'VIDEO_RATE_CONTROL' },
          explanationId: 'expl.libx265.vbr.bufsize',
        },
      ],
    },
    {
      id: 'cqp',
      label: 'CQP (恒定量化)',
      emitterId: 'emitter.cqp',
      explanationId: 'expl.libx265.cqp',
      sourceRefs: [
        {
          repository: 'Lake1059/FFmpegFreeUI',
          branch: 'main',
          snapshotDate: '2026-07-10',
          file: 'src/databases/video-encoders.json',
          symbol: 'libx265.quality.cqp',
          sourceType: 'ffmpegfreeui',
        },
      ],
      controls: [
        {
          id: 'libx265.cqp.value',
          label: 'QP 值 (-qp)',
          control: 'number',
          commandBinding: { argName: '-qp', prefix: '-qp', phase: 'VIDEO_RATE_CONTROL' },
          range: { min: 0, max: 51, step: 1 },
          defaultValue: 28,
          explanationId: 'expl.libx265.cqp.value',
        },
      ],
    },
    {
      id: 'cbr',
      label: 'CBR (恒定码率)',
      emitterId: 'emitter.cbr',
      explanationId: 'expl.libx265.cbr',
      sourceRefs: [
        {
          repository: 'Lake1059/FFmpegFreeUI',
          branch: 'main',
          snapshotDate: '2026-07-10',
          file: 'src/databases/video-encoders.json',
          symbol: 'libx265.quality.cbr',
          sourceType: 'ffmpegfreeui',
        },
      ],
      controls: [
        {
          id: 'libx265.cbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          defaultValue: '5000k',
          explanationId: 'expl.libx265.cbr.bitrate',
        },
      ],
    },
    {
      id: 'twoPass',
      label: '二次编码 (Two-Pass)',
      emitterId: 'emitter.twoPass',
      explanationId: 'expl.libx265.twopass',
      sourceRefs: [
        {
          repository: 'Lake1059/FFmpegFreeUI',
          branch: 'main',
          snapshotDate: '2026-07-10',
          file: 'src/databases/video-encoders.json',
          symbol: 'libx265.quality.twoPass',
          sourceType: 'ffmpegfreeui',
        },
      ],
      controls: [
        {
          id: 'libx265.twopass.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          defaultValue: '5000k',
          explanationId: 'expl.libx265.twopass.bitrate',
        },
      ],
    },
  ],

  specialParameters: [
    {
      id: 'libx265.threads',
      label: '编码线程数',
      control: 'number',
      commandBinding: { argName: '-threads', prefix: '-threads', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 128 },
      explanationId: 'expl.libx265.threads',
    },
    {
      id: 'libx265.x265params',
      label: 'x265 附加参数 (-x265-params)',
      control: 'text',
      commandBinding: { argName: '-x265-params', prefix: '-x265-params', phase: 'VIDEO_CODEC' },
      explanationId: 'expl.libx265.x265params',
    },
  ],

  requiredArguments: [],
  defaultArguments: [
    {
      argName: '-threads',
      value: 'auto',
      phase: 'VIDEO_CODEC',
    },
  ],

  explanationId: 'expl.libx265',
  sourceRefs: [
    {
      repository: 'Lake1059/FFmpegFreeUI',
      branch: 'main',
      snapshotDate: '2026-07-10',
      file: 'src/databases/video-encoders.json',
      symbol: 'libx265',
      sourceType: 'ffmpegfreeui',
    },
    {
      repository: 'FFmpeg/FFmpeg',
      branch: 'master',
      snapshotDate: '2026-07-10',
      file: 'libavcodec/libx265.c',
      sourceType: 'ffmpeg-official',
      url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c',
    },
  ],
  status: 'verified',
}
