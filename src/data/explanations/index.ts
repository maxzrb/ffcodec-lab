import type { ExplanationDefinition } from '../../domain/catalog/catalog-types'

export const explanations: Record<string, ExplanationDefinition> = {
  // -- video encoders -------------------------------------------
  'expl.libx264': {
    id: 'expl.libx264',
    title: 'libx264',
    short: 'FFmpeg 最广泛使用的 H.264/AVC 软件编码器。',
    detail:
      'libx264 基于 x264 开源库，提供极高的编码效率。支持 8-bit 到 10-bit 色深，兼容几乎所有设备和平台。CRF 模式推荐值 18（视觉无损）到 28（一般质量）。',
    effects: { quality: 4, fileSize: 3, speed: 3, compatibility: 5 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.description',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.preset': {
    id: 'expl.libx264.preset',
    title: 'Preset',
    short: '控制编码速度与压缩效率的平衡。越慢 preset 压缩率越高（同画质下文件越小）。',
    detail:
      'preset 从 ultrafast（最快、最大文件）到 placebo（极慢、不推荐实际使用）。medium 是默认值，多数场景 slow 是推荐的甜点。',
    effects: { quality: 3, fileSize: 3, speed: 5, compatibility: 0 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.preset',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.profile': {
    id: 'expl.libx264.profile',
    title: 'Profile',
    short: '定义编码器使用的 H.264 特性子集，影响兼容性和色深支持。',
    detail:
      'baseline 兼容性最广但特性最少；high 是多数设备的标准选择，支持 8-bit；high10 支持 10-bit。',
    effects: { quality: 1, fileSize: 2, speed: 0, compatibility: 5 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.profile',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.tune': {
    id: 'expl.libx264.tune',
    title: 'Tune',
    short: '根据内容类型优化编码参数。',
    detail:
      'film 适合实拍影片，animation 适合动画，grain 保留胶片颗粒。psnr/ssim 仅用于基准测试，会降低主观画质。zerolatency 适合直播。',
    effects: { quality: 3, fileSize: 2, speed: 1, compatibility: 0 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.tune',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.pixfmt': {
    id: 'expl.libx264.pixfmt',
    title: '像素格式',
    short: '选择编码器输出的像素格式，影响色度采样和位深。',
    detail: 'yuv420p 是通用选择；10-bit 格式可减少色带，但兼容性较低。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 3 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.pixelFormat',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.crf': {
    id: 'expl.libx264.crf',
    title: 'CRF 恒定质量',
    short: '以恒定视觉质量编码，码率自动适应画面复杂度。',
    detail:
      'CRF 是 x264/x265 推荐的编码模式。范围 0~51，默认 23。值越小质量越高、文件越大。通常 18~28 是实用范围。',
    effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.quality.crf',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.crf.value': {
    id: 'expl.libx264.crf.value',
    title: 'CRF 值',
    short: 'CRF 质量值，范围 0~51。18≈视觉无损，23=默认，28+≈明显压缩。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.quality.crf.range',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.vbr': {
    id: 'expl.libx264.vbr',
    title: 'VBR 动态码率',
    short: '指定目标码率，编码器在简单场景使用较低码率，复杂场景使用较高码率。',
    effects: { quality: 3, fileSize: 3, speed: 0, compatibility: 0 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.quality.vbr',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.vbr.bitrate': {
    id: 'expl.libx264.vbr.bitrate',
    title: '目标码率',
    short: '编码器输出视频的平均码率。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.quality.vbr.bitrate',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.vbr.maxrate': {
    id: 'expl.libx264.vbr.maxrate',
    title: '最大码率',
    short: '编码器允许的最大瞬时码率。与 bufsize 配合实现 VBV 码率控制。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.quality.vbr.maxrate',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.vbr.bufsize': {
    id: 'expl.libx264.vbr.bufsize',
    title: '缓冲区大小',
    short: 'VBV 缓冲区大小，控制码率波动的平滑程度。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.quality.vbr.bufsize',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.cqp': {
    id: 'expl.libx264.cqp',
    title: 'CQP 恒定量化',
    short: '以恒定量化参数编码，所有帧使用相同 QP 值。',
    detail: 'CQP 模式下编码器不试图控制码率，每帧使用固定的量化值。适合测试和特殊场景。',
    effects: { quality: 2, fileSize: 2, speed: 0, compatibility: 0 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.quality.cqp',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.cqp.value': {
    id: 'expl.libx264.cqp.value',
    title: 'QP 值',
    short: '恒定量化参数，范围 0~69。值越小质量越高。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.quality.cqp.range',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.cbr': {
    id: 'expl.libx264.cbr',
    title: 'CBR 恒定码率',
    short: '以恒定码率编码，适合流媒体和需要固定带宽的场景。',
    effects: { quality: 2, fileSize: 2, speed: 0, compatibility: 0 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.quality.cbr',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.cbr.bitrate': {
    id: 'expl.libx264.cbr.bitrate',
    title: '目标码率',
    short: '恒定码率编码的目标码率。在 CBR 模式中，maxrate 和 minrate 应接近此值。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.quality.cbr.bitrate',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.twopass': {
    id: 'expl.libx264.twopass',
    title: '二次编码',
    short: '两次编码：第一遍分析视频复杂度，第二遍根据分析分配码率。',
    detail:
      '二次编码可显著提高 VBR 码率控制精度。第一遍生成统计文件，第二遍使用统计文件编码。',
    effects: { quality: 4, fileSize: 3, speed: 1, compatibility: 0 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.quality.twoPass',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.twopass.bitrate': {
    id: 'expl.libx264.twopass.bitrate',
    title: '目标码率',
    short: '二次编码的目标平均码率。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.quality.twoPass.bitrate',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.threads': {
    id: 'expl.libx264.threads',
    title: '编码线程数',
    short: '控制并行编码的线程数。默认 auto 由编码器自动决定。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.special.threads',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx264.x264params': {
    id: 'expl.libx264.x264params',
    title: 'x264 附加参数',
    short: '直接向 x264 编码器传递私有参数。仅对高级用户开放。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx264.special.x264params',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // -- libx265 explanations -------------------------------------
  'expl.libx265': {
    id: 'expl.libx265',
    title: 'libx265',
    short: 'HEVC/H.265 软件编码器，比 H.264 提供高约 50% 的压缩效率。',
    detail:
      'libx265 基于 x265 开源库。在同等画质下，文件大小约为 H.264 的一半，但编码速度较慢，解码需要更多计算资源。',
    effects: { quality: 5, fileSize: 5, speed: 2, compatibility: 3 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx265.description',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx265.preset': {
    id: 'expl.libx265.preset',
    title: 'Preset',
    short: '控制编码速度与压缩效率的平衡。x265 的 slow 及以上 preset 非常慢但压缩效率极高。',
    effects: { quality: 3, fileSize: 3, speed: 5, compatibility: 0 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx265.preset',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx265.profile': {
    id: 'expl.libx265.profile',
    title: 'Profile',
    short: 'HEVC 配置文件。main 支持 8-bit，main10 支持 10-bit，main12 支持 12-bit。',
    effects: { quality: 1, fileSize: 2, speed: 0, compatibility: 4 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx265.profile',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx265.tune': {
    id: 'expl.libx265.tune',
    title: 'Tune',
    short: '根据内容类型优化编码参数，x265 支持 film、animation、grain 等。',
    effects: { quality: 3, fileSize: 2, speed: 1, compatibility: 0 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx265.tune',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx265.pixfmt': {
    id: 'expl.libx265.pixfmt',
    title: '像素格式',
    short: 'HEVC 广泛支持 8-bit 到 12-bit 色深。yuv420p10le 是 HDR 的常用格式。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 3 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx265.pixelFormat',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx265.crf': {
    id: 'expl.libx265.crf',
    title: 'CRF 恒定质量',
    short: '以恒定视觉质量编码。x265 的 CRF 默认值为 28（与 x264 的 23 大致相当）。',
    detail:
      'x265 的 CRF 范围 0~51，但心理视觉模型与 x264 不同。默认 28 在大多数场景下是良好的平衡点。',
    effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 },
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
  },

  'expl.libx265.crf.value': {
    id: 'expl.libx265.crf.value',
    title: 'CRF 值',
    short: 'CRF 质量值，范围 0~51。24≈高质量，28=默认，32+≈一般质量。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx265.quality.crf.range',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx265.vbr': {
    id: 'expl.libx265.vbr',
    title: 'VBR 动态码率',
    short: '指定目标码率的可变码率编码。',
    effects: { quality: 3, fileSize: 3, speed: 0, compatibility: 0 },
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
  },

  'expl.libx265.vbr.bitrate': {
    id: 'expl.libx265.vbr.bitrate',
    title: '目标码率',
    short: '编码器输出视频的平均码率。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx265.quality.vbr.bitrate',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx265.vbr.maxrate': {
    id: 'expl.libx265.vbr.maxrate',
    title: '最大码率',
    short: '编码器允许的最大瞬时码率。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx265.quality.vbr.maxrate',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx265.vbr.bufsize': {
    id: 'expl.libx265.vbr.bufsize',
    title: '缓冲区大小',
    short: 'VBV 缓冲区大小。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx265.quality.vbr.bufsize',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx265.cqp': {
    id: 'expl.libx265.cqp',
    title: 'CQP 恒定量化',
    short: '以恒定量化参数编码所有帧。',
    effects: { quality: 2, fileSize: 2, speed: 0, compatibility: 0 },
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
  },

  'expl.libx265.cqp.value': {
    id: 'expl.libx265.cqp.value',
    title: 'QP 值',
    short: '恒定量化参数，范围 0~51。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx265.quality.cqp.range',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx265.cbr': {
    id: 'expl.libx265.cbr',
    title: 'CBR 恒定码率',
    short: '以恒定码率编码。',
    effects: { quality: 2, fileSize: 2, speed: 0, compatibility: 0 },
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
  },

  'expl.libx265.cbr.bitrate': {
    id: 'expl.libx265.cbr.bitrate',
    title: '目标码率',
    short: 'CBR 模式的目标码率。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx265.quality.cbr.bitrate',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx265.twopass': {
    id: 'expl.libx265.twopass',
    title: '二次编码',
    short: '两次编码以获得精确的码率控制和更好的画质分布。',
    effects: { quality: 4, fileSize: 3, speed: 1, compatibility: 0 },
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
  },

  'expl.libx265.twopass.bitrate': {
    id: 'expl.libx265.twopass.bitrate',
    title: '目标码率',
    short: '二次编码的目标平均码率。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx265.quality.twoPass.bitrate',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx265.threads': {
    id: 'expl.libx265.threads',
    title: '编码线程数',
    short: '控制并行编码线程数。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx265.special.threads',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libx265.x265params': {
    id: 'expl.libx265.x265params',
    title: 'x265 附加参数',
    short: '直接向 x265 编码器传递私有参数。高级用途。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libx265.special.x265params',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // -- libsvtav1 explanations ----------------------------------
  'expl.libsvtav1': {
    id: 'expl.libsvtav1',
    title: 'libsvtav1',
    short: 'SVT-AV1 编码器，Intel/Netflix 联合开发的高性能 AV1 软件编码器。',
    detail:
      'SVT-AV1 针对多核 CPU 优化，编码速度显著快于 libaom-av1。preset 用数字表示速度/质量折衷：0（最慢最高质量）到 13（最快）。',
    effects: { quality: 5, fileSize: 5, speed: 3, compatibility: 2 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libsvtav1.description',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libsvtav1.preset': {
    id: 'expl.libsvtav1.preset',
    title: 'Preset',
    short: 'SVT-AV1 使用数字 preset（0~13），数字越小质量越高、速度越慢。默认 6。',
    effects: { quality: 4, fileSize: 3, speed: 5, compatibility: 0 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libsvtav1.preset',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libsvtav1.profile': {
    id: 'expl.libsvtav1.profile',
    title: 'Profile',
    short: 'AV1 配置文件：main (8-bit)、high (10-bit)、professional (12-bit)。',
    effects: { quality: 1, fileSize: 2, speed: 0, compatibility: 4 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libsvtav1.profile',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libsvtav1.pixfmt': {
    id: 'expl.libsvtav1.pixfmt',
    title: '像素格式',
    short: 'AV1 主要支持 yuv420p (8-bit) 和 yuv420p10le (10-bit)。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 3 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libsvtav1.pixelFormat',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libsvtav1.crf': {
    id: 'expl.libsvtav1.crf',
    title: 'CRF 恒定质量',
    short: '以恒定视觉质量编码。SVT-AV1 的 CRF 范围 0~63，默认 35。',
    detail:
      'SVT-AV1 的 CRF 语义与其他编码器不同。通常 30~45 是实用范围。值越小质量越高、文件越大。',
    effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 },
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
  },

  'expl.libsvtav1.crf.value': {
    id: 'expl.libsvtav1.crf.value',
    title: 'CRF 值',
    short: 'CRF 质量值，范围 0~63。30≈高质量，35=默认，45≈一般质量。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libsvtav1.quality.crf.range',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libsvtav1.vbr': {
    id: 'expl.libsvtav1.vbr',
    title: 'VBR 动态码率',
    short: '指定目标码率的 AV1 可变码率编码。',
    effects: { quality: 3, fileSize: 3, speed: 0, compatibility: 0 },
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
  },

  'expl.libsvtav1.vbr.bitrate': {
    id: 'expl.libsvtav1.vbr.bitrate',
    title: '目标码率',
    short: 'AV1 编码的目标平均码率。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libsvtav1.quality.vbr.bitrate',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libsvtav1.cqp': {
    id: 'expl.libsvtav1.cqp',
    title: 'CQP 恒定量化',
    short: '以恒定量化参数编码所有帧。AV1 QP 范围 0~63。',
    effects: { quality: 2, fileSize: 2, speed: 0, compatibility: 0 },
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
  },

  'expl.libsvtav1.cqp.value': {
    id: 'expl.libsvtav1.cqp.value',
    title: 'QP 值',
    short: '恒定量化参数，范围 0~63。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libsvtav1.quality.cqp.range',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libsvtav1.cbr': {
    id: 'expl.libsvtav1.cbr',
    title: 'CBR 恒定码率',
    short: '以恒定码率编码 AV1 视频。',
    effects: { quality: 2, fileSize: 2, speed: 0, compatibility: 0 },
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
  },

  'expl.libsvtav1.cbr.bitrate': {
    id: 'expl.libsvtav1.cbr.bitrate',
    title: '目标码率',
    short: 'CBR 模式的目标码率。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libsvtav1.quality.cbr.bitrate',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libsvtav1.svtav1params': {
    id: 'expl.libsvtav1.svtav1params',
    title: 'SVT-AV1 附加参数',
    short: '直接向 SVT-AV1 编码器传递私有参数。高级用途。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/video-encoders.json',
        symbol: 'libsvtav1.special.svtav1params',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // -- AAC explanations -----------------------------------------
  'expl.aac': {
    id: 'expl.aac',
    title: 'FFmpeg 原生 AAC',
    short: 'FFmpeg 内置 AAC 编码器，通用性好，兼容几乎所有设备。',
    detail:
      'FFmpeg 原生 AAC 编码器已显著改善，在中等及以上码率下质量接近 FDK-AAC。128~192 kbps 立体声通常足够。',
    effects: { quality: 3, fileSize: 3, speed: 5, compatibility: 5 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/audio-encoders.json',
        symbol: 'aac.description',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.aac.vbr': {
    id: 'expl.aac.vbr',
    title: 'VBR 可变码率',
    short: '以可变码率编码 AAC 音频，在保证质量的同时减小文件。',
    effects: { quality: 3, fileSize: 3, speed: 0, compatibility: 0 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/audio-encoders.json',
        symbol: 'aac.quality.vbr',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.aac.cbr': {
    id: 'expl.aac.cbr',
    title: 'CBR 恒定码率',
    short: '以恒定码率编码 AAC，适合流媒体。',
    effects: { quality: 3, fileSize: 2, speed: 0, compatibility: 0 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/audio-encoders.json',
        symbol: 'aac.quality.cbr',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.aac.bitrate': {
    id: 'expl.aac.bitrate',
    title: '音频码率',
    short: 'AAC 立体声推荐 128~192 kbps。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/audio-encoders.json',
        symbol: 'aac.quality.bitrate',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.aac.cbr.bitrate': {
    id: 'expl.aac.cbr.bitrate',
    title: '音频码率',
    short: 'CBR 模式的恒定音频码率。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/audio-encoders.json',
        symbol: 'aac.quality.cbr.bitrate',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.aac.profile': {
    id: 'expl.aac.profile',
    title: 'AAC 编码算法',
    short: 'twoloop 提供更好质量，fast 速度更快。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/audio-encoders.json',
        symbol: 'aac.special.aac_coder',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // -- libopus explanations ------------------------------------
  'expl.libopus': {
    id: 'expl.libopus',
    title: 'libopus',
    short: 'Opus 音频编码器，现代音频编码器，在低码率下表现优异。',
    detail:
      'Opus 是 IETF 标准化的现代音频编码器，在 64k~128k 立体声即可获得出色音质，远优于同码率的 AAC 和 MP3。WebM 容器的推荐音频编码。',
    effects: { quality: 5, fileSize: 4, speed: 4, compatibility: 3 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/audio-encoders.json',
        symbol: 'libopus.description',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libopus.vbr.switch': {
    id: 'expl.libopus.vbr.switch',
    title: 'VBR 开关',
    short: '控制 Opus 是否使用可变码率。Opus 默认推荐 VBR。',
    effects: { quality: 3, fileSize: 2, speed: 0, compatibility: 0 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/audio-encoders.json',
        symbol: 'libopus.vbr',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libopus.application': {
    id: 'expl.libopus.application',
    title: '应用类型',
    short: 'audio 优化音乐，voip 优化语音，lowdelay 降低编码延迟。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/audio-encoders.json',
        symbol: 'libopus.application',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libopus.frame_duration': {
    id: 'expl.libopus.frame_duration',
    title: '帧时长',
    short: 'Opus 编码帧时长。长帧（40~120ms）编码效率更高，短帧（20ms）延迟更低。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/audio-encoders.json',
        symbol: 'libopus.frame_duration',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libopus.vbr': {
    id: 'expl.libopus.vbr',
    title: 'VBR 动态码率',
    short: 'Opus 推荐的 VBR 编码模式。',
    effects: { quality: 4, fileSize: 4, speed: 0, compatibility: 0 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/audio-encoders.json',
        symbol: 'libopus.quality.vbr',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libopus.cbr': {
    id: 'expl.libopus.cbr',
    title: 'CBR 恒定码率',
    short: 'Opus 恒定码率模式。',
    effects: { quality: 3, fileSize: 2, speed: 0, compatibility: 0 },
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/audio-encoders.json',
        symbol: 'libopus.quality.cbr',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libopus.bitrate': {
    id: 'expl.libopus.bitrate',
    title: '音频码率',
    short: 'Opus 立体声推荐 128 kbps，语音 64 kbps 已足够。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/audio-encoders.json',
        symbol: 'libopus.quality.bitrate',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.libopus.cbr.bitrate': {
    id: 'expl.libopus.cbr.bitrate',
    title: '音频码率',
    short: 'CBR 模式的恒定音频码率。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/audio-encoders.json',
        symbol: 'libopus.quality.cbr.bitrate',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // -- containers ----------------------------------------------
  'expl.container.mp4': {
    id: 'expl.container.mp4',
    title: 'MP4',
    short: '最广泛使用的通用容器格式。兼容几乎所有设备和平台。',
    detail:
      'MP4 支持 H.264/HEVC 视频和 AAC 音频。字幕仅支持 mov_text、tx3g 和少量内置格式。不适合保留高级字幕流（ASS/SSA）。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/containers.json',
        symbol: 'mp4',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.container.mkv': {
    id: 'expl.container.mkv',
    title: 'MKV (Matroska)',
    short: '开源通用容器，几乎支持所有编码格式和字幕流。',
    detail:
      'MKV 是最灵活的容器之一，支持几乎所有视频/音频编码、多种字幕流、章节和附件。适合归档和收藏用途。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/containers.json',
        symbol: 'mkv',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.container.webm': {
    id: 'expl.container.webm',
    title: 'WebM',
    short: 'Web 优化的开源容器，支持 AV1/VP9 视频和 Opus/Vorbis 音频。',
    detail:
      'WebM 专为 Web 播放设计，限制为 AV1 或 VP9 视频编码和 Opus 或 Vorbis 音频编码。字幕仅支持 WebVTT 格式。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/containers.json',
        symbol: 'webm',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.container.mov': {
    id: 'expl.container.mov',
    title: 'MOV (QuickTime)',
    short: 'Apple QuickTime 容器，适合 Apple 生态和 ProRes 工作流。',
    detail:
      'MOV 是 Apple 的原生容器，广泛用于专业视频工作流。支持 H.264/HEVC 视频和 AAC/PCM 音频。字幕支持与 MP4 类似。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/databases/containers.json',
        symbol: 'mov',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // -- shared parameter explanations ----------------------------
  'expl.param.shell': {
    id: 'expl.param.shell',
    title: 'Shell 类型',
    short: '选择终端环境以生成对应的转义和续行格式。',
    sourceRefs: [
      {
        repository: 'manual-note',
        snapshotDate: '2026-07-10',
        file: 'docs/Codex_FFmpeg命令生成器_项目指令集.md',
        sourceType: 'manual-note',
        note: '本项目新增参数',
      },
    ],
  },

  'expl.param.container': {
    id: 'expl.param.container',
    title: '输出容器',
    short: '选择输出文件的封装格式，影响支持的编码器和字幕类型。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/panels/output-settings.js',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.param.overwrite': {
    id: 'expl.param.overwrite',
    title: '覆盖文件',
    short: '添加 -y 标志，使 FFmpeg 在输出文件已存在时自动覆盖而不询问。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/panels/output-settings.js',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.param.video.mode': {
    id: 'expl.param.video.mode',
    title: '视频处理方式',
    short: '选择重新编码、复制视频流或不输出视频。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/panels/video-encoder.js',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.param.video.encoder': {
    id: 'expl.param.video.encoder',
    title: '视频编码器',
    short: '选择重新编码时使用的视频编码器。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/panels/video-encoder.js',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.param.audio.mode': {
    id: 'expl.param.audio.mode',
    title: '音频处理方式',
    short: '选择重新编码、复制音频流或不输出音频。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/panels/audio-encoder.js',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.param.audio.encoder': {
    id: 'expl.param.audio.encoder',
    title: '音频编码器',
    short: '选择重新编码时使用的音频编码器。',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/panels/audio-encoder.js',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  'expl.filter.vf': {
    id: 'expl.filter.vf',
    title: '视频滤镜链',
    short: '由分辨率、帧率和字幕烧录组合而成的视频滤镜。',
    sourceRefs: [
      {
        repository: 'manual-note',
        snapshotDate: '2026-07-10',
        file: 'FFmpegFreeUI_参数树与网页首版裁剪方案.md',
        sourceType: 'manual-note',
      },
    ],
  },
}
