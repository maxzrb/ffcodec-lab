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

  // -- NVENC encoders ---------------------------------------------
  'expl.h264_nvenc': {
    id: 'expl.h264_nvenc',
    title: 'h264_nvenc (NVIDIA NVENC H.264)',
    short: 'NVIDIA 硬件 H.264 编码器。需要 NVIDIA GPU 和 FFmpeg --enable-nvenc 编译。FFCodec 不检测本机硬件。',
    detail:
      'h264_nvenc 利用 NVIDIA GPU 的 NVENC 专用编码芯片进行 H.264 硬件编码。编码速度远超 CPU 软件编码，但压缩效率通常略低于 libx264。使用 CQ 模式控制质量，p1-p7 preset 控制编码速度与压缩率的平衡。',
    effects: { quality: 3, fileSize: 3, speed: 5, compatibility: 3 },
    sourceRefs: [
      {
        repository: 'NVIDIA/Video_Codec_SDK',
        snapshotDate: '2026-07-10',
        file: 'NVENC_Programming_Guide.pdf',
        sourceType: 'encoder-official',
        url: 'https://developer.nvidia.com/video-codec-sdk',
      },
    ],
  },

  'expl.hevc_nvenc': {
    id: 'expl.hevc_nvenc',
    title: 'hevc_nvenc (NVIDIA NVENC HEVC)',
    short: 'NVIDIA 硬件 HEVC 编码器。需要 Maxwell GM206+ GPU 和 FFmpeg --enable-nvenc 编译。FFCodec 不检测本机硬件。',
    detail:
      'hevc_nvenc 利用 NVIDIA GPU 进行 HEVC/H.265 硬件编码。支持 8-bit 和 10-bit 色深。HEVC 在相同画质下比 H.264 节省约 30-50% 码率。需要 Maxwell GM206 以上 GPU。',
    effects: { quality: 3, fileSize: 4, speed: 5, compatibility: 2 },
    sourceRefs: [
      {
        repository: 'NVIDIA/Video_Codec_SDK',
        snapshotDate: '2026-07-10',
        file: 'NVENC_Programming_Guide.pdf',
        sourceType: 'encoder-official',
      },
    ],
  },

  'expl.nvenc.preset': {
    id: 'expl.nvenc.preset',
    title: 'NVENC 编码预设',
    short: 'p1 (最快) 到 p7 (最慢/最高质量)。不同预设调整 NVENC 内部参数。',
    effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 4 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.profile': {
    id: 'expl.nvenc.profile',
    title: 'NVENC 编码配置 (profile)',
    short: 'H.264/HEVC 编码规范级别。baseline/main/high 影响兼容性和功能。',
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.tune': {
    id: 'expl.nvenc.tune',
    title: 'NVENC 场景优化 (tune)',
    short: 'hq (高质量)、ll (低延迟)、ull (超低延迟)、lossless (无损)。',
    effects: { quality: 3, fileSize: 2, speed: 2, compatibility: 4 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.pixfmt': {
    id: 'expl.nvenc.pixfmt',
    title: 'NVENC 像素格式',
    short: 'yuv420p, yuv444p, yuv420p10le, p010le (10-bit) 等。',
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.cq': {
    id: 'expl.nvenc.cq',
    title: 'NVENC CQ (恒定质量)',
    short: 'NVENC 的恒定质量模式。通过 -rc vbr -cq N 实现。CQ 值范围 1-51，值越小质量越高。',
    effects: { quality: 4, fileSize: 3, speed: 4, compatibility: 4 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.cq.value': {
    id: 'expl.nvenc.cq.value',
    title: 'CQ 值',
    short: 'NVENC 恒定质量值。1 (最高质量) 到 51 (最低质量)，推荐 18-28。',
    effects: { quality: 5, fileSize: 4, speed: 1, compatibility: 5 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.cqp': {
    id: 'expl.nvenc.cqp',
    title: 'NVENC CQP (恒定量化参数)',
    short: '通过 -rc constqp -qp N 实现。每个帧使用相同的量化参数。QP 范围 0-51。',
    effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 4 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.cqp.value': {
    id: 'expl.nvenc.cqp.value',
    title: 'QP 值',
    short: 'NVENC 恒定量化参数值。0 (无损) 到 51 (最低质量)。',
    effects: { quality: 5, fileSize: 4, speed: 1, compatibility: 5 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.vbr': {
    id: 'expl.nvenc.vbr',
    title: 'NVENC VBR (可变码率)',
    short: '通过 -rc vbr -b:v N -maxrate N -bufsize N 实现的可变码率模式。',
    effects: { quality: 4, fileSize: 4, speed: 4, compatibility: 4 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.vbr.bitrate': {
    id: 'expl.nvenc.vbr.bitrate',
    title: 'NVENC VBR 目标码率',
    short: '目标平均码率。例如 5000k 表示 5 Mbps。',
    effects: { quality: 5, fileSize: 5, speed: 1, compatibility: 5 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.vbr.maxrate': {
    id: 'expl.nvenc.vbr.maxrate',
    title: 'NVENC VBR 最大码率',
    short: '允许的最大瞬时码率。通常设为目标的 1.5-2 倍。',
    effects: { quality: 4, fileSize: 4, speed: 1, compatibility: 4 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.vbr.bufsize': {
    id: 'expl.nvenc.vbr.bufsize',
    title: 'NVENC VBR 缓冲大小',
    short: '码率控制缓冲区大小。影响码率波动的平滑度。',
    effects: { quality: 3, fileSize: 2, speed: 1, compatibility: 4 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.cbr': {
    id: 'expl.nvenc.cbr',
    title: 'NVENC CBR (恒定码率)',
    short: '通过 -rc cbr -b:v N 实现的恒定码率模式。适合流媒体直播。',
    effects: { quality: 2, fileSize: 5, speed: 4, compatibility: 4 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.cbr.bitrate': {
    id: 'expl.nvenc.cbr.bitrate',
    title: 'NVENC CBR 目标码率',
    short: '恒定输出码率。适用于需要控制带宽的场景。',
    effects: { quality: 5, fileSize: 5, speed: 1, compatibility: 5 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.gpu': {
    id: 'expl.nvenc.gpu',
    title: 'GPU 选择 (-gpu)',
    short: '选择用于编码的 GPU 设备索引。在多 GPU 系统中指定 0, 1, 2 等。',
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.rclookahead': {
    id: 'expl.nvenc.rclookahead',
    title: '码率控制前瞻 (-rc-lookahead)',
    short: '前瞻帧数 (0-32)。启用后编码器可以预分析未来帧以优化码率分配。提升画质但增加延迟。',
    effects: { quality: 3, fileSize: 3, speed: 1, compatibility: 4 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.spatialaq': {
    id: 'expl.nvenc.spatialaq',
    title: '空间自适应量化 (-spatial_aq)',
    short: '根据画面空间复杂度动态分配码率。默认推荐开启。',
    effects: { quality: 3, fileSize: 2, speed: 1, compatibility: 4 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.temporalaq': {
    id: 'expl.nvenc.temporalaq',
    title: '时间自适应量化 (-temporal_aq)',
    short: '根据帧间变化动态调整量化。可能提升画质但增加编码复杂度。',
    effects: { quality: 2, fileSize: 1, speed: 2, compatibility: 4 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  'expl.nvenc.bf': {
    id: 'expl.nvenc.bf',
    title: '最大 B 帧数 (-bf)',
    short: '最大连续 B 帧数 (0-4)。B 帧提升压缩效率但增加编码延迟和 GPU 负担。',
    effects: { quality: 2, fileSize: 3, speed: 2, compatibility: 3 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official' }],
  },

  // -- FLAC encoder ------------------------------------------------
  'expl.flac': {
    id: 'expl.flac',
    title: 'FLAC (Free Lossless Audio Codec)',
    short: '开源无损音频编码器。压缩级别影响文件大小和编码速度，不影响解码后音频内容。',
    detail:
      'FLAC 是无损编码 — 解码后的音频与原始 PCM 完全一致。压缩级别 0 (最快/最大文件) 到 12 (最慢/最小文件)，默认 5。采样格式支持 s16/s24/s32。',
    effects: { quality: 5, fileSize: 2, speed: 4, compatibility: 3 },
    sourceRefs: [
      {
        repository: 'FFmpeg/FFmpeg',
        snapshotDate: '2026-07-10',
        file: 'libavcodec/flacenc.c',
        sourceType: 'ffmpeg-official',
        url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/flacenc.c',
      },
    ],
  },

  'expl.flac.compression': {
    id: 'expl.flac.compression',
    title: 'FLAC 压缩级别',
    short: '0 (最快/无压缩) 到 12 (最高压缩/最慢)。默认 5。不影响音频质量。',
    effects: { quality: 0, fileSize: 3, speed: 5, compatibility: 5 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/flacenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  'expl.flac.samplefmt': {
    id: 'expl.flac.samplefmt',
    title: 'FLAC 采样格式',
    short: '音频采样位深。s16 (16-bit)、s24 (24-bit)、s32 (32-bit)。自动时保持源格式。',
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/flacenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  // -- QSV encoders ---------------------------------------------
  'expl.h264_qsv': {
    id: 'expl.h264_qsv',
    title: 'h264_qsv',
    short: 'Intel Quick Sync Video H.264 硬件编码器。需要 Intel GPU 和 FFmpeg --enable-libmfx 编译。FFCodec 不检测本机硬件。',
    detail: 'QSV H.264 编码器利用 Intel 集成/独立显卡硬件加速 H.264 编码。支持 CQP/ICQ/LA_ICQ/VBR/CBR 多种码率控制模式。ICQ (Intelligent Constant Quality) 是 QSV 特有模式，结合前瞻分析提供优秀的画质-码率平衡。',
    effects: { quality: 4, fileSize: 3, speed: 4, compatibility: 3 },
    warnings: ['QSV 可用性取决于 Intel 图形硬件和驱动，FFCodec 未检测本机环境', 'ICQ/LA_ICQ 需要 Haswell 以上，low_power 需要 Broadwell 以上'],
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc_h264.c', sourceType: 'ffmpeg-official' },
      { repository: 'Intel/media-driver', snapshotDate: '2026-07-10', file: 'README.md', sourceType: 'encoder-official' },
    ],
  },

  'expl.hevc_qsv': {
    id: 'expl.hevc_qsv',
    title: 'hevc_qsv',
    short: 'Intel Quick Sync Video HEVC 硬件编码器。需要 Broadwell 以上 Intel GPU 和 FFmpeg --enable-libmfx 编译。FFCodec 不检测本机硬件。',
    detail: 'QSV HEVC 编码器利用 Intel GPU 硬件加速 H.265/HEVC 编码。支持 8-bit 和 10-bit 色深。Broadwell 代开始支持 HEVC 编码，Skylake 代增加了 B 帧支持。',
    effects: { quality: 5, fileSize: 5, speed: 4, compatibility: 2 },
    warnings: ['HEVC QSV 需要 Broadwell (5th Gen) 以上 Intel GPU', 'FFCodec 未检测本机硬件和驱动'],
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc_hevc.c', sourceType: 'ffmpeg-official' },
      { repository: 'Intel/media-driver', snapshotDate: '2026-07-10', file: 'README.md', sourceType: 'encoder-official' },
    ],
  },

  'expl.qsv.preset': {
    id: 'expl.qsv.preset',
    title: 'Preset',
    short: 'QSV 编码速度预设。veryfast（最快）到 veryslow（最高质量）。默认 medium。与 x264 preset 名称相同但内部映射不同。',
    effects: { quality: 3, fileSize: 2, speed: 5, compatibility: 0 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  'expl.qsv.profile': {
    id: 'expl.qsv.profile',
    title: 'Profile',
    short: 'H.264/HEVC 编码配置文件，约束色深、色度采样等。auto 自动选择与输入匹配的 profile。',
    effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 4 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  'expl.qsv.pixfmt': {
    id: 'expl.qsv.pixfmt',
    title: '像素格式',
    short: 'QSV 支持的像素格式。nv12/yuv420p 为 8-bit 4:2:0；p010le 为 10-bit；yuyv422 为 8-bit 4:2:2。',
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  'expl.qsv.cqp': {
    id: 'expl.qsv.cqp',
    title: 'CQP (恒定 QP)',
    short: '恒定质量编码。使用 -qp 参数，低值=高画质大文件。范围 0-51，推荐 18（高质量）到 28（一般质量）。',
    effects: { quality: 5, fileSize: 2, speed: 4, compatibility: 4 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  'expl.qsv.cqp.value': {
    id: 'expl.qsv.cqp.value',
    title: 'QP 值',
    short: '量化参数值。0=无损，51=最大压缩。范围 0-51，步长 1。',
    effects: { quality: 5, fileSize: 4, speed: 1, compatibility: 0 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  'expl.qsv.icq': {
    id: 'expl.qsv.icq',
    title: 'ICQ (智能恒定质量)',
    short: 'Intel QSV 特有的智能质量模式。使用 -global_quality 参数 + look_ahead=1，根据帧内容动态调节。需要 Haswell 以上。',
    detail: 'ICQ 是 QSV 推荐的画质优先模式。它利用硬件前瞻分析决定每帧的最优量化参数，在保证主观画质的同时尽可能减小文件大小。与 CRF 不同，ICQ 考虑了帧间依赖关系。',
    effects: { quality: 5, fileSize: 3, speed: 4, compatibility: 3 },
    sourceRefs: [
      { repository: 'Intel/media-driver', snapshotDate: '2026-07-10', file: 'README.md', sourceType: 'encoder-official' },
    ],
  },

  'expl.qsv.icq.value': {
    id: 'expl.qsv.icq.value',
    title: '全局质量',
    short: 'ICQ/LA_ICQ 使用的全局质量参数。范围 1-51，推荐 18（高质量）到 28（一般质量）。',
    effects: { quality: 5, fileSize: 4, speed: 1, compatibility: 0 },
    sourceRefs: [
      { repository: 'Intel/media-driver', snapshotDate: '2026-07-10', file: 'README.md', sourceType: 'encoder-official' },
    ],
  },

  'expl.qsv.laicq': {
    id: 'expl.qsv.laicq',
    title: 'LA-ICQ (前瞻智能恒定质量)',
    short: 'ICQ + look_ahead_depth 前瞻深度。在 ICQ 基础上增加多帧前瞻分析，进一步优化码率分配。',
    effects: { quality: 5, fileSize: 3, speed: 3, compatibility: 3 },
    sourceRefs: [
      { repository: 'Intel/media-driver', snapshotDate: '2026-07-10', file: 'README.md', sourceType: 'encoder-official' },
    ],
  },

  'expl.qsv.laicq.value': {
    id: 'expl.qsv.laicq.value',
    title: '全局质量',
    short: 'LA_ICQ 模式的全局质量参数。范围 1-51。',
    effects: { quality: 5, fileSize: 4, speed: 1, compatibility: 0 },
    sourceRefs: [
      { repository: 'Intel/media-driver', snapshotDate: '2026-07-10', file: 'README.md', sourceType: 'encoder-official' },
    ],
  },

  'expl.qsv.lookaheaddepth': {
    id: 'expl.qsv.lookaheaddepth',
    title: '前瞻深度',
    short: '用于 LA_ICQ 和 Look-ahead VBR 模式的前瞻帧数。范围 10-100，默认 40。值越大分析越多，质量和码率分配越优。',
    effects: { quality: 2, fileSize: 2, speed: 4, compatibility: 0 },
    sourceRefs: [
      { repository: 'Intel/media-driver', snapshotDate: '2026-07-10', file: 'README.md', sourceType: 'encoder-official' },
    ],
  },

  'expl.qsv.vbr': {
    id: 'expl.qsv.vbr',
    title: 'VBR (可变码率)',
    short: '可变码率编码。设置目标码率，编码器根据画面复杂度动态分配码率。适用于需要控制文件大小的场景。',
    effects: { quality: 4, fileSize: 4, speed: 4, compatibility: 4 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  'expl.qsv.vbr.bitrate': {
    id: 'expl.qsv.vbr.bitrate',
    title: '目标码率',
    short: 'VBR/CBR 模式的目标码率。格式如 5000k、2M 等。',
    effects: { quality: 5, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  'expl.qsv.vbr.maxrate': {
    id: 'expl.qsv.vbr.maxrate',
    title: '最大码率',
    short: '码率上限。限制编码器在复杂场景中使用的最大码率。',
    effects: { quality: 3, fileSize: 4, speed: 0, compatibility: 0 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  'expl.qsv.vbr.bufsize': {
    id: 'expl.qsv.vbr.bufsize',
    title: '缓冲区大小',
    short: '码率控制缓冲区大小。配合 maxrate 使用，控制码率波动幅度。',
    effects: { quality: 2, fileSize: 3, speed: 0, compatibility: 0 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  'expl.qsv.cbr': {
    id: 'expl.qsv.cbr',
    title: 'CBR (恒定码率)',
    short: '恒定码率编码。输出码率尽量保持在目标值。适用于实时流媒体传输。',
    effects: { quality: 3, fileSize: 4, speed: 4, compatibility: 5 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  'expl.qsv.cbr.bitrate': {
    id: 'expl.qsv.cbr.bitrate',
    title: '目标码率',
    short: 'CBR 模式的目标码率。格式如 5000k、2M 等。',
    effects: { quality: 5, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  'expl.qsv.lavbr': {
    id: 'expl.qsv.lavbr',
    title: 'Look-ahead VBR',
    short: '带前瞻的可变码率编码。结合 look_ahead 分析，在 VBR 基础上优化码率分配。',
    effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 3 },
    sourceRefs: [
      { repository: 'Intel/media-driver', snapshotDate: '2026-07-10', file: 'README.md', sourceType: 'encoder-official' },
    ],
  },

  'expl.qsv.lavbr.bitrate': {
    id: 'expl.qsv.lavbr.bitrate',
    title: '目标码率',
    short: 'Look-ahead VBR 模式的目标码率。',
    effects: { quality: 5, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [
      { repository: 'Intel/media-driver', snapshotDate: '2026-07-10', file: 'README.md', sourceType: 'encoder-official' },
    ],
  },

  'expl.qsv.lavbr.maxrate': {
    id: 'expl.qsv.lavbr.maxrate',
    title: '最大码率',
    short: 'Look-ahead VBR 模式的码率上限。',
    effects: { quality: 3, fileSize: 4, speed: 0, compatibility: 0 },
    sourceRefs: [
      { repository: 'Intel/media-driver', snapshotDate: '2026-07-10', file: 'README.md', sourceType: 'encoder-official' },
    ],
  },

  'expl.qsv.asyncdepth': {
    id: 'expl.qsv.asyncdepth',
    title: '异步深度',
    short: 'QSV 硬件编码的异步管线深度。范围 1-20，默认 4。较大的值可提高吞吐量但增加显存占用。',
    effects: { quality: 0, fileSize: 0, speed: 3, compatibility: 2 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  'expl.qsv.lowpower': {
    id: 'expl.qsv.lowpower',
    title: '低功耗模式',
    short: '启用 QSV 低功耗编码模式。需要 Broadwell 以上 GPU。启用后功耗更低但质量可能略有下降。',
    effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 2 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  'expl.qsv.bf': {
    id: 'expl.qsv.bf',
    title: 'B 帧数',
    short: '最大连续 B 帧数。范围 0-16，默认 3。B 帧可提高压缩效率但增加编码延迟。HEVC B 帧需要 Skylake 以上。',
    effects: { quality: 2, fileSize: 3, speed: 2, compatibility: 2 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  'expl.qsv.gop': {
    id: 'expl.qsv.gop',
    title: 'GOP 大小',
    short: '关键帧间隔。范围 1-600，默认 250。较小的 GOP 有利于快速搜索，较大的 GOP 有利于压缩效率。',
    effects: { quality: 0, fileSize: 2, speed: 0, compatibility: 0 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official' },
    ],
  },

  'expl.qsv.refs': {
    id: 'expl.qsv.refs',
    title: '参考帧数',
    short: '编码参考帧数量。范围 1-16，默认 4。较多的参考帧可提高压缩效率但增加编码复杂度。',
    effects: { quality: 2, fileSize: 2, speed: 2, compatibility: 2 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official' },
    ],
  },
}
