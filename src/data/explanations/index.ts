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
    short: '围绕目标平均码率按画面复杂度分配数据，适合需要预估文件体积、又允许瞬时码率波动的场景。',
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
    short: '决定整段视频平均每秒的数据量；提高后通常能保留更多细节，但文件体积也会近似按比例增加。',
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
    short: '限制复杂场景的瞬时码率峰值；过低会压低高运动画面的质量，过高则可能超过网络或播放器吞吐能力。',
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
    short: '决定码率在目标值附近可波动的时间窗口；缓冲越大，编码器越能把码率集中到复杂片段，但短时带宽波动也更明显。',
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
    short: '固定量化强度而不控制最终码率；适合测试和特殊工作流，不适合要求明确文件体积或传输带宽的任务。',
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
    short: '控制 CQP 的压缩强度，范围 0~51；数值越低通常细节越多、文件越大，数值越高则压缩痕迹更明显。',
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
    short: '让输出码率尽量贴近固定目标，适合直播或严格带宽预算；面对复杂画面时，画质弹性通常不如 VBR。',
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
    short: '设定 CBR 要维持的每秒数据量；应按分辨率、帧率、内容复杂度和传输带宽共同确定。',
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
    short: '设定第二遍编码需要达到的平均码率；第一遍分析会把有限码率更合理地分配到复杂片段。',
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
    short: '限制 x265 可使用的并行线程；自动模式通常能获得更好吞吐，仅在需要给其他任务保留 CPU 时手动限制。',
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
    short: '把键值直接交给 x265 私有参数解析器，可覆盖高级行为；错误语法或与界面参数冲突时可能导致失败或结果难以预测。',
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
    short: '设定 AV1 输出的平均数据量；提高码率通常改善细节并增加文件体积，降低码率则更依赖编码器的内容分配能力。',
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
    short: '控制 AV1 CQP 的压缩强度，范围 0~63；数值越低通常画质和体积越高，数值越高压缩越强。',
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
    short: '让 AV1 输出码率尽量维持固定值，适合实时传输；相比 VBR，更容易在复杂画面中因码率不足而损失细节。',
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
    short: '设定 AV1 CBR 需要维持的带宽，应根据分辨率、帧率、画面复杂度和网络上限选择。',
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
    short: '把尚未收录的高级选项直接传给 SVT-AV1；与结构化控件同名时，以结构化控件的值为准。',
    detail:
      '按 key=value:key=value 形式填写，不要重复输入 -svtav1-params。命令生成器会把该文本与上方结构化选项合并为唯一一个 -svtav1-params 参数；如果两处出现同名 key，会保留结构化控件的值并移除文本中的重复项。',
    commandExample: 'tune=0:film-grain=4',
    warnings: ['自由文本只做字典合并和 Shell 转义，不校验每个 SVT-AV1 键的取值范围。'],
    sourceRefs: [
      {
        repository: 'AOMediaCodec/SVT-AV1',
        branch: 'master',
        snapshotDate: '2026-07-20',
        file: 'Docs/Ffmpeg.md',
        symbol: 'Passing options to SvtAv1EncApp',
        sourceType: 'encoder-official',
        url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Ffmpeg.md',
      },
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

  'expl.libsvtav1.filmGrain': {
    id: 'expl.libsvtav1.filmGrain',
    title: 'SVT-AV1 Film Grain Synthesis',
    short: '启用 AV1 胶片颗粒合成，范围 0–50；0 表示关闭，数值越高，颗粒分析与去噪强度越高。',
    detail:
      'SVT-AV1 会分析源画面中的胶片颗粒或传感器噪声，将部分随机纹理从编码主体中去除，再把颗粒模型写入 AV1 码流供解码端重建。这样通常能节省码率并保留主观质感，但过高数值可能损失细小纹理。建议从 4–12 的较低值试验，并用代表性片段比较。',
    commandExample: '-svtav1-params film-grain=4',
    effects: { quality: 3, fileSize: 4, speed: 2, compatibility: 1 },
    warnings: [
      '该参数改变的是编码器内部颗粒建模，不等同于画面滤镜中的普通降噪。',
      '播放端必须正确支持 AV1 Film Grain Synthesis 才能还原颗粒。',
      'SVT-AV1 会提示高于 6 的速度预设使用 Film Grain 时计算开销显著；正式编码前应以代表性片段测试速度。',
    ],
    sourceRefs: [{
      repository: 'AOMediaCodec/SVT-AV1',
      branch: 'master',
      snapshotDate: '2026-07-20',
      file: 'Docs/Parameters.md',
      symbol: 'FilmGrain / --film-grain',
      sourceType: 'encoder-official',
      url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md',
    }],
  },

  'expl.libsvtav1.filmGrainDenoise': {
    id: 'expl.libsvtav1.filmGrainDenoise',
    title: 'SVT-AV1 Film Grain 去噪',
    short: '控制启用 Film Grain 时是否按其强度先对源画面去噪，再通过码流中的颗粒模型重建质感。',
    detail:
      '开启时，SVT-AV1 使用 Film Grain 强度进行去噪并估计合成颗粒；关闭时不执行这一步去噪，但仍可把颗粒数据写入帧头。该选项只有 Film Grain 强度已设置且大于 0 时才有实际意义。',
    commandExample: '-svtav1-params film-grain=4:film-grain-denoise=1',
    effects: { quality: 3, fileSize: 3, speed: 2, compatibility: 1 },
    warnings: ['请与大于 0 的 Film Grain Synthesis 强度配合使用。'],
    sourceRefs: [{
      repository: 'AOMediaCodec/SVT-AV1',
      branch: 'master',
      snapshotDate: '2026-07-20',
      file: 'Docs/Parameters.md',
      symbol: 'FilmGrainDenoise / --film-grain-denoise',
      sourceType: 'encoder-official',
      url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md',
    }],
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
    short: '控制 AAC 每秒可使用的数据量；提高码率通常能保留更多细节并增大文件，立体声可从 128~192 kbps 起步。',
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
    short: '设定 AAC CBR 需要维持的数据量；语音可使用较低值，音乐、多声道或高采样率内容通常需要更高码率。',
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
    short: '让 Opus 根据声音复杂度动态分配码率，通常比固定码率更有效地利用体积，适合文件输出和非刚性带宽场景。',
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
    short: '让 Opus 输出尽量保持固定带宽，适合对实时传输速率有严格约束的场景，但同平均码率下效率通常低于 VBR。',
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
    short: '控制 Opus 每秒可使用的数据量；语音可从 64 kbps 起步，立体声音乐可从 96~160 kbps 试起，再按试听结果调整。',
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
    short: '设定 Opus CBR 需要维持的带宽；数值过低会在复杂音乐中损失细节，过高则增加传输与存储成本。',
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
    short: '决定命令中的引号、特殊字符转义和换行语法；选错后，路径含空格或特殊字符时可能无法执行。',
    detail: '在 Windows PowerShell 中直接粘贴请选择 PowerShell；传统命令提示符请选择 CMD；Linux、macOS、WSL 及其他 POSIX 终端通常选择 Bash。',
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
    short: '容器负责把视频、音频、字幕和元数据封装进一个文件，本身不决定画质，但会限制可用编码和播放兼容性。',
    detail: '需要通用播放兼容性时优先 MP4；需要灵活容纳多音轨、多字幕或更多编码时优先 MKV；WebM 适合 AV1/Opus 网络分发；MOV 更适合 Apple 与剪辑工作流。',
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
    short: '开启后添加 -y，输出路径已存在时会直接替换原文件；关闭时 FFmpeg 会询问或中止，能降低误覆盖风险。',
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
    short: '重新编码可更换编码器并使用缩放、调色、字幕烧录等滤镜；复制流速度最快且无二次画质损失；不输出会移除全部视频。',
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
    short: '编码器决定输出视频格式、压缩效率、处理速度、硬件要求和播放兼容性，是影响成片体积与适用设备的核心选择。',
    detail: 'libx264 适合追求广泛兼容；libx265/AV1 适合在终端支持允许时减小体积；NVENC、QSV、AMF、VideoToolbox 适合优先速度和低 CPU 占用。具体画质仍需结合质量模式与参数判断。',
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
    short: '重新编码可改变格式、码率、声道和采样率；复制流保留原始压缩数据且无二次损失；不输出会移除全部音频。',
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
    short: '音频编码器决定格式兼容性、同码率音质以及是否无损；不同容器和播放设备对 AAC、Opus、FLAC 的支持范围不同。',
    detail: 'AAC 适合通用播放和 MP4；Opus 在中低码率下效率较高，适合 WebM；FLAC 完全无损，但文件通常明显大于有损编码。',
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
    short: '把缩放、帧率、裁剪、旋转、调色、去隔行、锐化和字幕烧录按顺序合并为一条 -vf 滤镜链；任一处理都会要求视频重新编码。',
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

  'expl.amf.encoder': {
    id: 'expl.amf.encoder', title: 'AMD AMF 硬件编码器',
    short: '通过 AMD Advanced Media Framework 执行 H.264 或 HEVC 硬件编码。',
    detail: '可用性取决于 AMD GPU、驱动与 FFmpeg 构建；网页只生成命令，不检测本机硬件。',
    effects: { quality: 3, fileSize: 3, speed: 5, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/amfenc_h264.c', sourceType: 'ffmpeg-official', url: 'https://ffmpeg.org/doxygen/trunk/amfenc__h264_8c_source.html' }],
  },
  'expl.amf.preset': {
    id: 'expl.amf.preset', title: 'AMF 质量预设', short: '在编码速度与压缩质量之间选择 speed、balanced 或 quality。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/amfenc_h264.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.amf.profile': {
    id: 'expl.amf.profile', title: 'AMF 编码配置', short: '选择 H.264 或 HEVC 码流配置；10-bit HEVC 应配合 Main 10 与 P010。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/amfenc_h264.c / amfenc_hevc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.amf.usage': {
    id: 'expl.amf.usage', title: 'AMF 使用场景', short: '按通用转码、高质量或低延迟场景调整编码器内部策略。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/amfenc_h264.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.amf.pixfmt': {
    id: 'expl.amf.pixfmt', title: 'AMF 像素格式', short: 'NV12 适合 8-bit 硬件路径；P010 用于受支持的 10-bit HEVC 路径。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/amfenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.amf.vbr': {
    id: 'expl.amf.vbr', title: 'AMF VBR Peak', short: '使用峰值约束的可变码率，目标码率控制平均体积，maxrate 限制瞬时峰值。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/amfenc_h264.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.amf.cbr': {
    id: 'expl.amf.cbr', title: 'AMF CBR', short: '面向带宽稳定的恒定码率模式。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/amfenc_h264.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.amf.cqp': {
    id: 'expl.amf.cqp', title: 'AMF CQP', short: '分别为 I、P、B 帧设置固定量化参数；数值越低，质量和体积通常越高。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/amfenc_h264.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.amf.qp': {
    id: 'expl.amf.qp', title: 'AMF 帧类型 QP', short: 'AMF 的 qp_i、qp_p、qp_b 范围为 0–51。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/amfenc_h264.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.amf.bitrate': {
    id: 'expl.amf.bitrate', title: 'AMF 码率约束', short: '目标码率、峰值码率和缓冲区共同约束 AMF 码率控制。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/amfenc_h264.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.amf.vbaq': {
    id: 'expl.amf.vbaq', title: 'VBAQ', short: '启用基于方差的自适应量化；是否受支持取决于 AMF 驱动与硬件。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/amfenc_h264.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.amf.preencode': {
    id: 'expl.amf.preencode', title: '预编码分析', short: '启用预编码辅助码率控制，可能提高分析开销与延迟。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/amfenc_h264.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.amf.asyncdepth': {
    id: 'expl.amf.asyncdepth', title: 'AMF 异步深度', short: '控制最大编码并行度；较高值可能提高吞吐并增加延迟。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/amfenc_h264.c', sourceType: 'ffmpeg-official' }],
  },

  'expl.videotoolbox.encoder': {
    id: 'expl.videotoolbox.encoder', title: 'Apple VideoToolbox 编码器',
    short: '调用 macOS VideoToolbox 执行 H.264 或 HEVC 编码。',
    detail: '实际硬件加速和可用选项取决于 Apple 设备、macOS 版本与 FFmpeg 构建。',
    effects: { quality: 3, fileSize: 3, speed: 5, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official', url: 'https://ffmpeg.org/doxygen/trunk/videotoolboxenc_8c_source.html' }],
  },
  'expl.videotoolbox.profile': {
    id: 'expl.videotoolbox.profile', title: 'VideoToolbox 编码配置', short: '选择硬件与目标设备支持的 H.264/HEVC profile。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.videotoolbox.pixfmt': {
    id: 'expl.videotoolbox.pixfmt', title: 'VideoToolbox 像素格式', short: 'H.264 支持 NV12/YUV420P；HEVC 还可在受支持设备上使用 P010 10-bit。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.videotoolbox.vbr': {
    id: 'expl.videotoolbox.vbr', title: 'VideoToolbox 平均码率', short: '通过 -b:v 设置平均码率，由 VideoToolbox 分配帧间码率。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.videotoolbox.cbr': {
    id: 'expl.videotoolbox.cbr', title: 'VideoToolbox 恒定码率', short: '通过 constant_bit_rate 请求恒定码率；该选项要求 macOS 13 或更新版本。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.videotoolbox.bitrate': {
    id: 'expl.videotoolbox.bitrate', title: 'VideoToolbox 目标码率', short: '设置编码目标码率，适合可预测文件体积或传输带宽。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.videotoolbox.realtime': {
    id: 'expl.videotoolbox.realtime', title: '实时编码提示', short: '提示编码器以实时或更快速度处理，适合采集与直播场景。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.videotoolbox.allow_sw': {
    id: 'expl.videotoolbox.allow_sw', title: '允许软件回退', short: '硬件编码不可用时允许 VideoToolbox 使用软件实现；速度与能力可能不同。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.videotoolbox.power': {
    id: 'expl.videotoolbox.power', title: '节能优先', short: '在系统支持时优先选择更节能的编码路径。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official' }],
  },

  'expl.libaom.encoder': {
    id: 'expl.libaom.encoder', title: 'libaom-av1 软件编码器',
    short: 'AOMedia 的参考级 AV1 编码器，压缩效率高且选项丰富，但常用质量设置下编码速度明显慢于 H.264/HEVC。',
    detail: '适合对体积和 AV1 质量控制要求较高、可以接受长编码时间的任务。FFmpeg 必须在编译时启用 libaom。',
    effects: { quality: 5, fileSize: 5, speed: 1, compatibility: 3 },
    warnings: ['cpu-used 较低时编码可能非常慢；开始长任务前建议先截取短片测试。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-12', file: 'doc/encoders.texi / libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://ffmpeg.org/ffmpeg-codecs.html#libaom_002dav1' }],
  },
  'expl.libaom.profile': {
    id: 'expl.libaom.profile', title: 'AV1 Profile', short: '限制 AV1 的位深和色度格式能力；自动模式会按输入格式选择，通常最不容易造成不必要的兼容性限制。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'doc/encoders.texi', sourceType: 'ffmpeg-official' }],
  },
  'expl.libaom.pixfmt': {
    id: 'expl.libaom.pixfmt', title: 'libaom 像素格式', short: '决定 AV1 输入到编码器的位深与色度采样；10-bit 可减轻渐变色带，但解码兼容性和运算开销更高。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.libaom.crf': {
    id: 'expl.libaom.crf', title: 'libaom 恒定质量', short: '让码率随画面复杂度变化，并用 CRF 控制质量；本模式同时生成 -b:v 0，避免设置目标码率。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'doc/encoders.texi', sourceType: 'ffmpeg-official' }],
  },
  'expl.libaom.crf.value': {
    id: 'expl.libaom.crf.value', title: 'libaom CRF', short: '范围 0–63，数值越低质量越高、文件越大；相同数字不能直接与 x264/x265 的 CRF 横向比较。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'doc/encoders.texi', sourceType: 'ffmpeg-official' }],
  },
  'expl.libaom.vbr': {
    id: 'expl.libaom.vbr', title: 'libaom VBR', short: '按目标平均码率分配数据，便于估算文件体积；画质会随素材复杂度变化。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'doc/encoders.texi', sourceType: 'ffmpeg-official' }],
  },
  'expl.libaom.vbr.bitrate': {
    id: 'expl.libaom.vbr.bitrate', title: 'libaom 目标码率', short: '设置 AV1 输出的平均视频码率。分辨率、帧率和内容复杂度越高，通常需要更高码率。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'doc/encoders.texi', sourceType: 'ffmpeg-official' }],
  },
  'expl.libaom.cpu_used': {
    id: 'expl.libaom.cpu_used', title: 'libaom 速度等级', short: '0–8，数值越高编码越快、压缩效率通常越低。官方默认 1 很慢，日常测试可从 4–6 开始。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'doc/encoders.texi', sourceType: 'ffmpeg-official' }],
  },
  'expl.libaom.row_mt': {
    id: 'expl.libaom.row_mt', title: 'libaom 行级多线程', short: '允许编码器按行并行处理，可能提高多核利用率；实际收益还取决于分块和线程设置。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'doc/encoders.texi', sourceType: 'ffmpeg-official' }],
  },
  'expl.libaom.params': {
    id: 'expl.libaom.params', title: 'AOM 附加参数', short: '用冒号分隔 key=value，把 libaom 私有选项直接交给编码器；错误键值会让 FFmpeg 启动失败。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'doc/encoders.texi', sourceType: 'ffmpeg-official' }],
  },

  'expl.libvvenc.encoder': {
    id: 'expl.libvvenc.encoder', title: 'libvvenc H.266/VVC 编码器',
    short: 'Fraunhofer VVenC 的 H.266/VVC 软件编码器，面向更高压缩效率；目前编码耗时、FFmpeg 构建可用性和播放支持都较受限。',
    detail: '只接受 yuv420p10le 输入。适合实验、研究或明确具备 VVC 播放链路的交付，不建议作为普通设备通用格式。',
    effects: { quality: 5, fileSize: 5, speed: 1, compatibility: 1 },
    warnings: ['使用前请确认目标 FFmpeg 启用 libvvenc，且接收端支持 H.266/VVC。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-12', file: 'doc/encoders.texi / libavcodec/libvvenc.c', sourceType: 'ffmpeg-official', url: 'https://ffmpeg.org/ffmpeg-codecs.html#libvvenc' }],
  },
  'expl.libvvenc.preset': {
    id: 'expl.libvvenc.preset', title: 'VVenC 编码预设', short: '从 faster 到 slower 调整速度与压缩效率；medium 是官方默认，较慢档位会显著增加编码时间。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'libavcodec/libvvenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.libvvenc.pixfmt': {
    id: 'expl.libvvenc.pixfmt', title: 'VVenC 输入像素格式', short: 'FFmpeg 当前 libvvenc 封装只接受 yuv420p10le，因此此项固定为 10-bit 4:2:0。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'libavcodec/libvvenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.libvvenc.cqp': {
    id: 'expl.libvvenc.cqp', title: 'VVenC 恒定量化', short: '使用固定 QP 控制质量，不设目标码率；数值越低通常质量和文件体积越高。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'libavcodec/libvvenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.libvvenc.qp': {
    id: 'expl.libvvenc.qp', title: 'VVenC QP', short: 'FFmpeg 封装允许 -1–63，默认 32；降低 QP 会增加细节、体积和编码负担。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'libavcodec/libvvenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.libvvenc.vbr': {
    id: 'expl.libvvenc.vbr', title: 'VVenC 码率模式', short: '设置目标码率以便估算体积和带宽；复杂场景的瞬时质量会随码率预算变化。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'doc/encoders.texi', sourceType: 'ffmpeg-official' }],
  },
  'expl.libvvenc.bitrate': {
    id: 'expl.libvvenc.bitrate', title: 'VVenC 目标码率', short: '通过 -b:v 设置目标视频码率。官方示例使用 MP4，但实际播放支持仍取决于接收端。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'doc/encoders.texi', sourceType: 'ffmpeg-official' }],
  },
  'expl.libvvenc.qpa': {
    id: 'expl.libvvenc.qpa', title: 'VVenC 感知优化', short: '启用主观感知驱动的量化优化；关闭时更偏向基础量化行为。留空则采用编码器默认值。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'libavcodec/libvvenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.libvvenc.tier': {
    id: 'expl.libvvenc.tier', title: 'VVC Tier', short: '选择 main 或 high tier，限制特定 level 下允许的码率能力；不确定时留空使用编码器默认值。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'libavcodec/libvvenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.libvvenc.period': {
    id: 'expl.libvvenc.period', title: '帧内刷新周期', short: '以秒为单位控制周期性帧内刷新；更短周期便于跳转和错误恢复，但通常降低压缩效率。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'libavcodec/libvvenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.libvvenc.params': {
    id: 'expl.libvvenc.params', title: 'VVenC 附加参数', short: '用冒号分隔 key=value，直接传递 VVenC 私有选项；只在核对 vvencapp --fullhelp 后使用。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'doc/encoders.texi / libavcodec/libvvenc.c', sourceType: 'ffmpeg-official' }],
  },
  'expl.advanced.gopSize': {
    id: 'expl.advanced.gopSize', title: '关键帧间隔', short: '通过 -g 设置两个关键帧之间允许的最大帧数；留空时使用编码器默认。',
    sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-12', file: 'FFmpegFreeUI/界面 v6 参数面板/Form_v6_参数面板_质量.vb', sourceType: 'ffmpegfreeui' }],
  },
  'expl.advanced.bFrames': {
    id: 'expl.advanced.bFrames', title: '最大 B 帧数', short: '通过 -bf 限制连续 B 帧数量；留空时使用编码器默认。',
    sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-12', file: 'FFmpegFreeUI/界面 v6 参数面板/Form_v6_参数面板_质量.vb', sourceType: 'ffmpegfreeui' }],
  },
  'expl.advanced.keyintMin': {
    id: 'expl.advanced.keyintMin', title: '最小关键帧间隔', short: '通过 -keyint_min 限制关键帧之间的最小距离；留空时使用编码器默认。',
    sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-12', file: 'FFmpegFreeUI/界面 v6 参数面板/Form_v6_参数面板_质量.vb', sourceType: 'ffmpegfreeui' }],
  },
  'expl.advanced.qmin': {
    id: 'expl.advanced.qmin', title: '最低量化值', short: '通过 -qmin 限制最高画质侧的量化值；留空时使用编码器默认。',
    sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-12', file: 'FFmpegFreeUI/界面 v6 参数面板/Form_v6_参数面板_质量.vb', sourceType: 'ffmpegfreeui' }],
  },
  'expl.advanced.qmax': {
    id: 'expl.advanced.qmax', title: '最高量化值', short: '通过 -qmax 限制最低画质侧的量化值；留空时使用编码器默认。',
    sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-12', file: 'FFmpegFreeUI/界面 v6 参数面板/Form_v6_参数面板_质量.vb', sourceType: 'ffmpegfreeui' }],
  },
  'expl.advanced.qcomp': {
    id: 'expl.advanced.qcomp', title: '量化曲线压缩', short: '通过 -qcomp 调整复杂与简单场景之间的码率分配，范围 0–1；留空时使用编码器默认。',
    sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-12', file: 'FFmpegFreeUI/界面 v6 参数面板/Form_v6_参数面板_质量.vb', sourceType: 'ffmpegfreeui' }],
  },
  'expl.advanced.rcLookahead': {
    id: 'expl.advanced.rcLookahead', title: '码率控制前瞻', short: '让编码器预读更多帧后再分配帧类型和码率；通常提高复杂场景质量，但会增加延迟和内存占用。',
    sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-12', file: 'FFmpegFreeUI/界面 v6 参数面板/Form_v6_参数面板_质量.vb', sourceType: 'ffmpegfreeui' }],
  },
  'expl.advanced.aqStrength': {
    id: 'expl.advanced.aqStrength', title: '自适应量化强度', short: '控制 AQ 在平坦区和纹理区之间重新分配码率的幅度；过高可能损害客观指标或产生不稳定观感。',
    sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-12', file: 'FFmpegFreeUI/界面 v6 参数面板/Form_v6_参数面板_质量.vb', sourceType: 'ffmpegfreeui' }],
  },
  'expl.advanced.sceneThreshold': {
    id: 'expl.advanced.sceneThreshold', title: '场景切换阈值', short: '控制编码器在画面突变处插入关键帧的敏感度；留空时采用编码器自身的场景检测策略。',
    sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-12', file: 'FFmpegFreeUI/界面 v6 参数面板/Form_v6_参数面板_质量.vb', sourceType: 'ffmpegfreeui' }],
  },
  'expl.advanced.refs': {
    id: 'expl.advanced.refs', title: '参考帧数', short: '增加参考帧可能提高压缩效率，但会增加编码与解码开销，并可能限制硬件播放器兼容性。',
    sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-12', file: 'FFmpegFreeUI/界面 v6 参数面板/Form_v6_参数面板_质量.vb', sourceType: 'ffmpegfreeui' }],
  },
  'expl.advanced.level': {
    id: 'expl.advanced.level', title: '编码级别', short: '限制分辨率、帧率、码率和解码复杂度上限；只有目标平台明确要求时再填写。',
    sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-12', file: 'FFmpegFreeUI/界面 v6 参数面板/Form_v6_参数面板_质量.vb', sourceType: 'ffmpegfreeui' }],
  },
  'expl.advanced.lookaheadLevel': {
    id: 'expl.advanced.lookaheadLevel', title: 'NVENC 前瞻等级', short: '提高 NVENC 前瞻分析强度可能改善质量，但会增加性能开销；需要驱动和硬件支持。',
    sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-12', file: 'FFmpegFreeUI/界面 v6 参数面板/Form_v6_参数面板_质量.vb', sourceType: 'ffmpegfreeui' }],
  },
  'expl.advanced.extbrc': {
    id: 'expl.advanced.extbrc', title: 'Intel 扩展码率控制', short: '启用更积极的扩展码率分配；可明确开启或关闭，未设置时交给 QSV 驱动决定。',
    sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-12', file: 'FFmpegFreeUI/界面 v6 参数面板/Form_v6_参数面板_质量.vb', sourceType: 'ffmpegfreeui' }],
  },
  'expl.advanced.qvbrQualityLevel': {
    id: 'expl.advanced.qvbrQualityLevel', title: 'AMD QVBR 质量级别', short: '为 AMF QVBR 指定目标质量级别；实际行为取决于驱动、编码器与所选码率控制模式。',
    sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-12', file: 'FFmpegFreeUI/界面 v6 参数面板/Form_v6_参数面板_质量.vb', sourceType: 'ffmpegfreeui' }],
  },

  // -- color management -----------------------------------------
  'expl.color.operation': {
    id: 'expl.color.operation', title: '色彩空间操作方式',
    short: '控制输出视频的色彩处理策略：仅写入元数据、写入元数据并实际转换像素、或仅转换不写标记。',
    detail: '“仅写入元数据”只设置输出流的色彩标记（-colorspace/-color_primaries/-color_trc/-color_range），不改变像素值，适合输入已正确标记的场景。“写入元数据并转换”通过 zscale 或 libplacebo 执行实际色彩空间转换，同时写入目标标记。“仅转换”只执行像素转换但不写输出标记，适合后续还需要其他工具处理色彩的场景。',
    effects: { quality: 4, fileSize: 0, speed: 3, compatibility: 3 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'ffmpeg -h filter=zscale', sourceType: 'ffmpeg-official', url: 'https://ffmpeg.org/ffmpeg-filters.html#zscale' },
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'doc/ffmpeg.texi -colorspace/-color_primaries/-color_trc/-color_range', sourceType: 'ffmpeg-official' },
    ],
  },
  'expl.color.filter': {
    id: 'expl.color.filter', title: '色彩转换滤镜',
    short: '选择执行实际像素色彩转换的滤镜后端：zscale（CPU 软件）或 libplacebo（GPU/Vulkan）。',
    detail: 'zscale 基于 z.lib 库，在 CPU 上执行高质量缩放和色彩空间转换，无需 GPU，兼容性最好。libplacebo 基于 libplacebo/Vulkan，在 GPU 上执行色彩管理和色调映射，支持更丰富的色调映射算法（如 bt.2390），但需要 FFmpeg 编译时启用 --enable-libplacebo 且系统有 Vulkan 驱动。',
    effects: { quality: 3, fileSize: 0, speed: 4, compatibility: 4 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'ffmpeg -h filter=zscale', sourceType: 'ffmpeg-official', url: 'https://ffmpeg.org/ffmpeg-filters.html#zscale' },
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'ffmpeg -h filter=libplacebo', sourceType: 'ffmpeg-official', url: 'https://ffmpeg.org/ffmpeg-filters.html#libplacebo' },
    ],
  },
  'expl.color.space': {
    id: 'expl.color.space', title: '矩阵 / 色彩空间',
    short: '设置输出流的色彩矩阵/色彩空间元数据（-colorspace），定义 RGB↔YUV 转换矩阵。',
    detail: 'bt709 是 SDR 内容的标准色彩空间（Rec.709）。bt2020nc/bt2020c 用于 HDR/WCG 内容（Rec.2020），nc 为非恒定亮度编码（常用），c 为恒定亮度。bt470bg 对应 PAL/SECAM 标清。smpte170m 对应 NTSC 标清。fcc 是 FCC 标准。gbr 为 RGB 空间。选择“不设置”时保留输入流标记。',
    effects: { quality: 2, fileSize: 0, speed: 0, compatibility: 4 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'ffmpeg -h filter=zscale matrix parameter', sourceType: 'ffmpeg-official', url: 'https://ffmpeg.org/ffmpeg-filters.html#zscale' },
      { repository: 'ITU-R', snapshotDate: '2026-07-12', file: 'Rec.709 / Rec.2020', sourceType: 'encoder-official', note: '色彩空间标准' },
    ],
  },
  'expl.color.primaries': {
    id: 'expl.color.primaries', title: '色域 / 原色',
    short: '设置输出流的色域原色元数据（-color_primaries），定义红绿蓝三原色坐标。',
    detail: 'bt709 覆盖 Rec.709/sRGB 色域，是大多数 SDR 内容的标准。bt2020 覆盖 Rec.2020 广色域（WCG），用于 HDR 和 UHD 内容。smpte431（DCI-P3）和 smpte432（Display P3）用于数字影院和 Apple 设备。smpte428 为 DCDM 规格。film 泛指胶片色域。选择“不设置”时保留输入流标记。',
    effects: { quality: 2, fileSize: 0, speed: 0, compatibility: 4 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'ffmpeg -h filter=zscale primaries parameter', sourceType: 'ffmpeg-official', url: 'https://ffmpeg.org/ffmpeg-filters.html#zscale' },
      { repository: 'ITU-R', snapshotDate: '2026-07-12', file: 'Rec.709 / Rec.2020', sourceType: 'encoder-official', note: '原色标准' },
    ],
  },
  'expl.color.transfer': {
    id: 'expl.color.transfer', title: '传输特性',
    short: '设置输出流的传输特性/伽马元数据（-color_trc），定义电信号到光学亮度的映射关系。',
    detail: 'bt709 对应标准 SDR Gamma 2.2 曲线。bt2020-10/bt2020-12 对应 HDR/WCG 的传输特性。smpte2084 即 PQ (Perceptual Quantizer)，用于 HDR10/Dolby Vision，标称峰值亮度为 10000 nit。linear 是线性光域编码，通常在色彩转换管线中使用。iec61966-2-1 即 sRGB 的传输曲线。arib-std-b67 即 HLG (Hybrid Log-Gamma)，兼容 SDR 和 HDR 显示。选择“不设置”时保留输入流标记。',
    effects: { quality: 3, fileSize: 0, speed: 0, compatibility: 4 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'ffmpeg -h filter=zscale transfer parameter', sourceType: 'ffmpeg-official', url: 'https://ffmpeg.org/ffmpeg-filters.html#zscale' },
      { repository: 'SMPTE', snapshotDate: '2026-07-12', file: 'ST 2084 / ST 2086', sourceType: 'encoder-official', note: 'PQ/HDR 传输标准' },
    ],
  },
  'expl.color.range': {
    id: 'expl.color.range', title: '色彩范围',
    short: '设置输出流的色彩范围元数据（-color_range）：tv 有限范围或 pc 全范围。',
    detail: 'tv（有限范围/mpeg）是视频制品的默认值，Y 值在 16–235、UV 在 16–240。pc（全范围/jpeg）使用全部 0–255 范围，常见于计算机图形和 RGB 数据。错误设置可能导致视频偏亮/偏暗或色彩溢出。多数消费级视频使用 tv 范围。',
    effects: { quality: 3, fileSize: 0, speed: 0, compatibility: 4 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'ffmpeg -h filter=zscale range parameter', sourceType: 'ffmpeg-official', url: 'https://ffmpeg.org/ffmpeg-filters.html#zscale' },
    ],
  },
  'expl.color.toneMap': {
    id: 'expl.color.toneMap', title: '色调映射算法',
    short: '选择 HDR→SDR 或高亮度→显示亮度的动态范围压缩算法。none 表示只做色彩空间转换不压缩亮度。',
    detail: 'zscale 支持的算法：clip（硬截断高光）、reinhard（经典全局压缩，暗部保留好）、mobius（改进全局压缩，过渡平滑）、hable（电影级色调映射）、gamma 和 linear（基础伽马/线性映射）。libplacebo 额外支持：auto（自动选择）、st2094-40/10（SMPTE 动态元数据）、bt.2390（ITU-R HDR 参考算法）、bt.2446a（ITU-R HDR→SDR 方法A）、spline（样条曲线）。',
    effects: { quality: 5, fileSize: 0, speed: 2, compatibility: 3 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'ffmpeg -h filter=zscale npl parameter + tonemap filter', sourceType: 'ffmpeg-official', url: 'https://ffmpeg.org/ffmpeg-filters.html#zscale' },
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'ffmpeg -h filter=libplacebo tonemapping', sourceType: 'ffmpeg-official', url: 'https://ffmpeg.org/ffmpeg-filters.html#libplacebo' },
    ],
  },
  'expl.color.preFormat': {
    id: 'expl.color.preFormat', title: '转换前像素格式',
    short: '在执行色彩空间转换之前，先将像素数据统一到此格式；保持空位时沿用输入或上游滤镜的格式。',
    detail: '色彩转换滤镜对输入格式有严格要求（如 zscale 需要平面 YUV）。提前设置转换前像素格式可以避免自动协商错误，确保转换管线稳定。常用选择：yuv420p（常规 8-bit）、yuv420p10le（10-bit HDR 常用）、yuv444p10le（最高保真度但体积大，适合色彩转换中间步骤）。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 2 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'ffmpeg -pix_fmts', sourceType: 'ffmpeg-official' },
    ],
  },
  'expl.color.nominalPeak': {
    id: 'expl.color.nominalPeak', title: '标称峰值亮度 (npl)',
    short: '告知 zscale 色调映射器输入内容的标称峰值亮度（cd/m²）；默认 100 nit 即标准 SDR 亮度。',
    detail: 'zscale 的 npl 参数在 zscale 和 tonemap 滤镜之间传递，影响色调映射算法的亮度缩放行为。HDR 内容通常为 1000 nit（HDR10）或 4000–10000 nit（Dolby Vision 母版级）。设置错误的 npl 会导致画面过亮或过暗。此参数仅对 zscale 路径生效，libplacebo 有独立的输入亮度设定。',
    effects: { quality: 4, fileSize: 0, speed: 0, compatibility: 2 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'ffmpeg -h filter=zscale npl parameter', sourceType: 'ffmpeg-official', url: 'https://ffmpeg.org/ffmpeg-filters.html#zscale' },
    ],
  },
  'expl.color.desaturation': {
    id: 'expl.color.desaturation', title: '色调映射去饱和强度',
    short: '控制 HDR→SDR 色调映射过程中对高亮度色彩的去饱和程度，避免映射后出现过于鲜艳的虚假色彩。',
    detail: '当 HDR 亮度被压缩到 SDR 范围时，高亮度区域可能产生不自然的过饱和观感。去饱和参数（tonemap 的 desat）按指数衰减这些区域的饱和度，使画面看起来更自然。值 0 不去饱和，值越高去饱和越强烈，推荐从 2 开始调试。过高会导致画面整体灰淡。',
    effects: { quality: 4, fileSize: 0, speed: 0, compatibility: 2 },
    sourceRefs: [
      { repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-12', file: 'ffmpeg -h filter=tonemap desat parameter', sourceType: 'ffmpeg-official', url: 'https://ffmpeg.org/ffmpeg-filters.html#tonemap' },
    ],
  },
}
