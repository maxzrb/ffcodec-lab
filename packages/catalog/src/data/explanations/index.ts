import type { ExplanationDefinition } from '@ffcodec/domain/catalog/catalog-types'
import { audioExpandedExplanations } from './audio-expanded'

export const explanations: Record<string, ExplanationDefinition> = {
  ...audioExpandedExplanations,
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
    sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-10', file: 'src/databases/video-encoders.json', symbol: 'libx264.special.threads', sourceType: 'ffmpegfreeui' }],
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
    sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-10', file: 'src/databases/video-encoders.json', symbol: 'libx265.special.threads', sourceType: 'ffmpegfreeui' }],
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
    short: 'twoloop 提供稳定质量，fast 优先速度；nmr 是新版噪声掩蔽比搜索算法，使用前需核验 FFmpeg 构建。',
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

  'expl.aac.nmrSpeed': {
    id: 'expl.aac.nmrSpeed',
    title: 'NMR 搜索速度',
    short: '仅用于 NMR coder；0 最慢且质量最高，数值越高搜索越快，范围 0~4。',
    sourceRefs: [{
      repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-22',
      file: 'libavcodec/aacenc.c', symbol: 'aac_nmr_speed', sourceType: 'ffmpeg-official',
      url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/aacenc.c',
    }],
  },

  'expl.aac.ms': {
    id: 'expl.aac.ms', title: 'M/S 立体声',
    short: '控制中/侧声道立体声编码；通常保留编码器默认，仅在明确需要时强制关闭或开启。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-22', file: 'libavcodec/aacenc.c', symbol: 'aac_ms', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/aacenc.c' }],
  },

  'expl.aac.is': {
    id: 'expl.aac.is', title: '强度立体声',
    short: '允许编码器以强度信息表示部分高频立体声内容；低码率可能受益，默认交由编码器决定。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-22', file: 'libavcodec/aacenc.c', symbol: 'aac_is', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/aacenc.c' }],
  },

  'expl.aac.pns': {
    id: 'expl.aac.pns', title: '感知噪声替代',
    short: '以参数化噪声替代部分噪声状频谱，可能改善低码率效率；默认交由编码器决定。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-22', file: 'libavcodec/aacenc.c', symbol: 'aac_pns', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/aacenc.c' }],
  },

  'expl.aac.tns': {
    id: 'expl.aac.tns', title: '时域噪声整形',
    short: '对瞬态信号的量化噪声进行时域整形；通常保留编码器默认。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-22', file: 'libavcodec/aacenc.c', symbol: 'aac_tns', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/aacenc.c' }],
  },

  'expl.aac.pce': {
    id: 'expl.aac.pce', title: 'PCE 声道配置',
    short: '强制写入 Program Config Element；仅在特定多声道兼容需求下开启。',
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-22', file: 'libavcodec/aacenc.c', symbol: 'aac_pce', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/aacenc.c' }],
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

  // -- 裁剪参数 -----------------------------------------------------
  'expl.filter.crop.width': {
    id: 'expl.filter.crop.width',
    title: '裁剪宽度',
    short: '最终保留的画面宽度（像素）。相当于 FFmpeg crop 滤镜的 w 参数——crop=w:h:x:y。',
    detail: '设置裁剪后输出画面的水平像素数。与原始画面宽度的差值部分会被丢弃。例如原始 1920×1080，设置宽度 1280 则左右共裁掉 640 像素。配合左侧偏移可以精确控制保留哪个水平区域。',
    sourceRefs: [
      { repository: 'FFmpeg', snapshotDate: '2026-07-10', file: 'ffmpeg-filters.html#crop', sourceType: 'ffmpeg-official' },
    ],
  },
  'expl.filter.crop.height': {
    id: 'expl.filter.crop.height',
    title: '裁剪高度',
    short: '最终保留的画面高度（像素）。相当于 FFmpeg crop 滤镜的 h 参数——crop=w:h:x:y。',
    detail: '设置裁剪后输出画面的垂直像素数。与原始画面高度的差值部分会被丢弃。例如原始 1920×1080，设置高度 720 则上下共裁掉 360 像素。配合顶部偏移可以精确控制保留哪个垂直区域。',
    sourceRefs: [
      { repository: 'FFmpeg', snapshotDate: '2026-07-10', file: 'ffmpeg-filters.html#crop', sourceType: 'ffmpeg-official' },
    ],
  },
  'expl.filter.crop.x': {
    id: 'expl.filter.crop.x',
    title: '左侧偏移',
    short: '从画面左边缘起算，往右跳过多少像素后开始保留。0 表示从最左边开始。',
    detail: '对应 FFmpeg crop 滤镜的 x 参数。设 0 保留最左端；设 320 则跳过左侧 320 像素，从第 321 像素开始保留。\n\n举例：原始 1920×1080，裁剪宽度 1280、左侧偏移 320，保留第 321 到第 1600 像素的水平区域——实现居中裁剪。',
    sourceRefs: [
      { repository: 'FFmpeg', snapshotDate: '2026-07-20', file: 'ffmpeg-filters.html#crop', sourceType: 'ffmpeg-official' },
    ],
  },
  'expl.filter.crop.y': {
    id: 'expl.filter.crop.y',
    title: '顶部偏移',
    short: '从画面上边缘起算，往下跳过多少像素后开始保留。0 表示从最顶部开始。',
    detail: '对应 FFmpeg crop 滤镜的 y 参数。设 0 保留最顶端；设 180 则跳过顶部 180 像素，从第 181 像素开始保留。\n\n举例：原始 1920×1080，裁剪高度 720、顶部偏移 180，去除上下各 180 像素的黑边，保留中央 720 行。',
    sourceRefs: [
      { repository: 'FFmpeg', snapshotDate: '2026-07-20', file: 'ffmpeg-filters.html#crop', sourceType: 'ffmpeg-official' },
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
    title: 'NVENC 码控前瞻帧数 (-rc-lookahead)',
    short: '编码器提前分析未来帧的复杂度，在简单场景"储蓄"码率留给即将到来的复杂段。0–32 帧，默认 0。值越大场景过渡处画质越平滑，但编码延迟线性增加——每增加 1 帧 = 多 1/帧率的延迟秒数。',
    detail: 'NVENC 的前瞻引擎与软件编码器不同——使用 GPU 的硬件分析流水线而非 CPU 缓冲区。因为 GPU 前瞻的资源开销相对较小，设 32 帧（约 1.3 秒 @24fps）对编码速度的影响比软件前瞻小得多。但 NVENC 的前瞻质量窗口较短——32 帧已是硬件上限，不像 x264 可以设 250 帧。对离线转码建议设满 32；对直播和低延迟场景设 0。与 lookahead_level 联动——后者控制分析的"精细度"而非"帧数"。',
    commandExample: '-rc-lookahead 32',
    effects: { quality: 4, fileSize: 3, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
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
    title: 'NVENC 最大 B 帧数 (-bf)',
    short: '限制 NVENC 硬件 GOP 中连续 B 帧的最大数量，范围 0–4。B 帧使用双向预测，压缩效率比 P 帧高约 30%，但更多 B 帧意味着更深的参考链和编码延迟。',
    detail: 'NVENC 的 B 帧支持取决于 GPU 架构——Turing 及更新架构（RTX 20xx+）支持全部 4 个 B 帧；Pascal（GTX 10xx）HEVC 编码限制 0 个 B 帧，H.264 支持 2 个。对离线转码，充分利用 4 个 B 帧可获得最佳压缩比；对直播和游戏串流，减少到 0–1 个以降低延迟。与 b_ref_mode 联动控制这些 B 帧是否可被后续帧参考。',
    commandExample: '-bf 4',
    effects: { quality: 1, fileSize: 3, speed: 2, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
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
    title: 'QSV 最大 B 帧数 (-bf)',
    short: '限制 Intel QSV GOP 中连续 B 帧的最大数量，范围 0–16。B 帧使用双向预测——静态内容从中获益最大（8–16 带来显著压缩增益），快速运动内容收益较小。',
    detail: 'QSV 硬件编码器的 B 帧能力因 GPU 代际而异：Skylake（6 代）及以上支持 HEVC B 帧，较早的 Broadwell/Haswell 仅 H.264 支持。默认 3 对大多数内容合理。对静态访谈或新闻可增加到 8–12 以节约大量码率；对运动激烈的内容保持在 2–4 以避免参考匹配不准。与 adaptive_b 配合——后者根据运动复杂度自动调节实际使用的 B 帧数。',
    commandExample: '-bf 3',
    effects: { quality: 1, fileSize: 3, speed: 2, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },

  'expl.qsv.gop': {
    id: 'expl.qsv.gop',
    title: 'QSV GOP 大小 (-g)',
    short: '以帧数为单位控制 QSV 关键帧之间的最大距离，范围 1–600。小的 GOP 改善搜索和容错但关键帧比 P/B 帧大得多（5–10×）；大的 GOP 压缩效率高但随机访问慢。',
    detail: 'QSV 硬件按 GOP 结构组织编码——GOP 大小直接影响了关键帧插入频率和参考层级深度。与软件编码器不同，QSV 的 GOP 大小选定了硬件内部的参考缓冲分配策略：过小的 GOP 浪费 GPU 编码资源（因为需要频繁刷新参考帧）；过大的 GOP 可能超出某些 QSV 硬件版本的参考缓冲限制。对 H.264 推荐 120–300；对 HEVC 可适当加大到 300–600。场景检测（内置于 QSV 硬件）会在切镜处自动缩短实际 GOP。',
    commandExample: '-g 250',
    effects: { quality: 1, fileSize: 4, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },

  'expl.qsv.refs': {
    id: 'expl.qsv.refs',
    title: 'QSV 参考帧数 (-refs)',
    short: 'QSV 运动估计可搜索的前向参考帧数量，范围 1–16。每增加一帧改善运动匹配概率，但第 5–6 帧后边际增益急剧递减。也影响解码端 DPB 内存——设得过高可能超出目标硬件解码上限。',
    detail: 'QSV 的参考帧管理与软件编码器不同——Intel GPU 硬件参考缓冲有固定容量，设 16 参考帧意味着每帧需存储 16 个完整解码帧在 GPU 显存中，对 4K 编码这是巨大的显存开销。对 1080p 编码 4–6 参考帧已足够且显存友好；对 4K 编码建议 2–4 以避免 GPU 显存瓶颈。低运动内容（Vlog、访谈）几乎不会用到太远的参考帧，可以降到 2。',
    commandExample: '-refs 4',
    effects: { quality: 2, fileSize: 2, speed: 2, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
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
    id: 'expl.advanced.gopSize',
    title: 'GOP 大小 / 关键帧间隔 (-g)',
    short: '以帧数为单位控制两个关键帧（I 帧）之间的最大距离。小的 GOP 改善快进和随机搜索，但关键帧比 P/B 帧大得多所以文件体积增加。24fps 下 -g 240 = 约 10 秒间隔。',
    detail: '关键帧是完整的独立编码帧，不依赖其他帧即可解码——因此它们是随机搜索的"锚点"。GOP 大小定义了两个锚点之间的最大帧数。小 GOP（30–60 帧）适合需要频繁快进定位的内容；中 GOP（120–300 帧）是通用分发推荐；大 GOP（600 帧以上）用于流媒体 VOD 追求极致压缩。场景切换检测会在检测到切镜时自动插入新的关键帧，所以实际 GOP 通常小于此上限。',
    commandExample: '-g 240',
    effects: { quality: 1, fileSize: 4, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.advanced.bFrames': {
    id: 'expl.advanced.bFrames',
    title: '最大 B 帧数 (-bf)',
    short: '限制 I/P 帧之间连续 B 帧的最大数量。B 帧使用双向预测，比 P 帧压缩效率高约 30%。但更多的连续 B 帧增加编码计算量和解码参考链深度。',
    detail: 'B 帧可参考前后两个方向的帧做运动补偿——这是它比仅前向参考的 P 帧压缩效率更高的原因。在静态访谈、新闻播报等内容中，大量 B 帧（8–16）带来显著的比特节省。但过多 B 帧也意味着解码器需要更大的 DPB 缓冲区来存储参考帧。配合 B 帧自适应策略（b-adapt）才能真正优化分配——仅设高上限不一定增加实际 B 帧使用量。',
    commandExample: '-bf 3',
    effects: { quality: 1, fileSize: 3, speed: 2, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.advanced.keyintMin': {
    id: 'expl.advanced.keyintMin',
    title: '最小关键帧间隔 (-keyint_min)',
    short: '强制关键帧之间的最小帧数间隔。防止场景检测在闪光灯、爆炸等短暂亮度突变时"误触发"密集的关键帧爆发。通常设为 GOP 大小的 1/5–1/10。',
    detail: '舞台灯光频闪、相机闪光、爆炸特效——这些场景的帧间差异极大，编码器可能连续多帧都判定为"场景切换"，导致关键帧链式爆发。这在码率受限时会严重拖累后续数秒的画质。keyint_min 创建了保护窗口——无论帧间差异多大，上一关键帧之后的 N 帧内不插入新关键帧。GOP=250 时建议 keyint_min=25。',
    commandExample: '-keyint_min 25',
    effects: { quality: 0, fileSize: 2, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.advanced.qmin': {
    id: 'expl.advanced.qmin',
    title: '最小量化值 (-qmin)',
    short: '所有帧类型的量化下限。防止编码器在黑屏、静止单色画面等"极易编码"帧上浪费过多码率追求不可见的完美。0 不设限；恒定码率编码推荐 10–20。',
    detail: '纯黑帧或静止标题中——如果用极低的 QP 编码可达到"数学完美"，但这些码率消耗在肉眼看来毫无意义。qmin 设定了下限。动画和 CG（多平坦着色区）特别容易在平坦区浪费码率，建议 1–5。CRF 编码通常设 0–5 即可。',
    commandExample: '-qmin 3',
    effects: { quality: 1, fileSize: 3, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.advanced.qmax': {
    id: 'expl.advanced.qmax',
    title: '最大量化值 (-qmax)',
    short: '所有帧类型的量化上限。在码率预算不足时防止极复杂场景的画质崩塌为马赛克。69=无上限。质量敏感编码建议 35–45。',
    detail: '高运动、密集纹理、水面反射、粒子特效——这些极复杂场景在被分配不足码率时，编码器可能将 QP 推到极高水平，产生大面积块状伪影。qmax 是"画质安全网"——设 45 意味着"即使码率不够也不能把 QP 推过 45"。这会强制文件在这些复杂场景中变大，但保证了基本可观的画质。如果日常编码中频繁触发 qmax 上限，说明你需要提高码率目标。',
    commandExample: '-qmax 45',
    effects: { quality: 4, fileSize: 4, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.advanced.qcomp': {
    id: 'expl.advanced.qcomp',
    title: '量化曲线压缩系数 (-qcomp)',
    short: '控制帧级码率分配的时间策略。0.0=恒定码率（每帧获得相似字节数），1.0=恒定 QP（每帧获得相似量化精度）。默认约 0.6 在码率波动性和质量一致性之间取得平衡。',
    detail: 'qcomp 是理解现代视频编码码率控制的核心参数。接近 0 时，无论场景复杂度如何变化每帧都在相似的码率预算内——复杂场景画质显著下降。接近 1 时，复杂场景获得额外码率来维持与简单场景接近的 QP 水平——但这导致文件大小不可预测。CRF 编码中 qcomp 特别重要：高 qcomp（0.7–0.8）让 CRF 更"真实"但文件更大；低 qcomp（0.5）更接近 ABR 行为但帧间质量波动更大。',
    commandExample: '-qcomp 0.6',
    effects: { quality: 4, fileSize: 4, speed: 0, compatibility: 1 },
    warnings: ['改变 qcomp 即使 CRF 值不变也会显著改变文件大小——从 0.6 升到 0.8 可能增加 15–25%。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.advanced.rcLookahead': {
    id: 'expl.advanced.rcLookahead',
    title: '码控前瞻帧数 (-rc-lookahead)',
    short: '编码器在决定当前帧 QP 之前"预看"未来帧的数量。值越大码率在场景变化处的分配越平滑，但编码延迟和内存相应增加。40–60 帧是质量编码推荐范围。',
    detail: '如果不知道后面的场景更复杂还是更简单，就无法为当前帧做出最优码率分配——这是码率限制的根本困境。rc-lookahead 让编码器提前分析未来 N 帧的复杂度，在简单场景中"储蓄"位留给即将到来的复杂段。对序列中有规律淡入淡出或场景过渡的内容改善显著。但 rc-lookahead 也是编码延迟的首要来源——设 250 时编码器需缓存 10 秒（24fps）视频才能开始输出。直播和低延迟场景必须设 0。',
    commandExample: '-rc-lookahead 40',
    effects: { quality: 3, fileSize: 2, speed: 3, compatibility: 1 },
    warnings: ['提升 rc-lookahead 同时增大了 mbtree/CU-tree 的有效分析窗口，两者联动发挥作用。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.advanced.aqStrength': {
    id: 'expl.advanced.aqStrength',
    title: '自适应量化强度 (-aq-strength)',
    short: '控制自适应量化在不同画面区域的"倾斜"程度。0.6–0.8 适合纹理丰富的内容，1.0 是通用均衡点，1.2–1.5 适合平坦背景多的内容。值越高平坦区域（天空、墙壁）得到更多码率保护，但纹理区相应被牺牲。',
    detail: '自适应量化（AQ）通过在不同复杂度区域使用不同 QP 来重新分配码率——因为人眼对平坦区域的色阶断层极度敏感，而对复杂纹理区域的压缩损失不敏感。AQ 将平坦区域的 QP 降低（给更多码率）以消除色带，同时在纹理区抬高 QP（节省码率）。对人物面部和布料纹理多的内容降低强度（0.6–0.8），对天空和墙壁多的内容提高强度（1.2–1.5）。与 aq-mode 联动——调整 aq-strength 后可能需要微调 CRF 值。',
    commandExample: '-aq-strength 0.8',
    effects: { quality: 4, fileSize: 3, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.advanced.sceneThreshold': {
    id: 'expl.advanced.sceneThreshold',
    title: '场景切换检测阈值 (-sc_threshold)',
    short: '控制帧间差异触发场景切换关键帧的敏感度。值越小越敏感，越容易在画面突变处插入 I 帧。0=完全关闭场景检测（所有关键帧仅由 GOP 大小决定）。默认约 40。',
    detail: '基于相邻帧的亮度变化百分比来判定切换。动画和 CG 因画面纯净切镜时的帧差比实拍更明显——调高到 50–60 可减少误检。手持摄像和运动激烈的内容可能需要降低到 20–30。关闭（0）用于需要固定 GOP 结构的广播和流媒体协议——此时所有关键帧位置完全由 -g 决定。',
    commandExample: '-sc_threshold 40',
    effects: { quality: 3, fileSize: 3, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.advanced.refs': {
    id: 'expl.advanced.refs',
    title: '参考帧数 (-refs)',
    short: '运动估计可搜索的前向参考帧数量。每增加一帧就多一个找到最佳运动匹配的机会。压缩效率在第 5–6 帧后边际增益急剧递减（<0.5%），但编码时间持续线性增长。默认 3–5 是通用甜区。',
    detail: '多个参考帧对运动复杂、有多个重叠运动物体的场景最有益——不同物体可以在不同的参考帧中找到各自最优匹配。对静态访谈、新闻等内容 refs=2 已足够。对体育和动作片可受益于 refs=5–6。对动画和低运动内容几乎无收益。也影响解码端 DPB 内存分配——设得过高可能超出目标设备的硬件解码上限。',
    commandExample: '-refs 4',
    effects: { quality: 2, fileSize: 2, speed: 4, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.advanced.level': {
    id: 'expl.advanced.level',
    title: '编码级别 (-level)',
    short: '声明输出码流遵循的 H.264/H.265 级别（Level），约束最大分辨率、码率和参考帧数。关键用途是保证目标播放设备的硬件解码兼容性。不设置时编码器自行推断。',
    detail: '级别定义了播放设备必须支持的一组硬性上限。例如 H.264 Level 4.1 = 1080p@30fps、最大码率 50Mbps——这是蓝光和大多数电视的标准。Level 5.1 = 4K@30fps。为移动设备编码需遵守更低级别（Level 3.1 = 720p）。不设置时编码器根据实际参数自动推断——通常是对的——但广播和物理介质交付通常要求显式声明以通过合规审核。',
    commandExample: '-level 4.1',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 5 },
    warnings: ['超出目标设备硬件支持的 Level 会导致解码失败或黑屏。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.advanced.lookaheadLevel': {
    id: 'expl.advanced.lookaheadLevel',
    title: 'NVENC 前瞻等级 (-lookahead_level)',
    short: '控制 NVENC 内部前瞻分析的算法规模和精度。值越高分析越彻底——更优的码率分配和自适应量化决策——但编码延迟和 GPU 资源占用上升。默认 0 是速度优先的最小分析。',
    detail: 'NVIDIA 的前瞻引擎不同于单纯的帧缓冲——它还包含帧内复杂度和运动分析流水线。低等级（0–5）适合低延迟编码；中等级（6–10）在质量和速度间取得好的平衡；高等级（11–15）榨取最大压缩效率但逼近 GPU 的硬件前瞻资源上限。与 rc-lookahead 联动——rc-lookahead 决定"看多少帧"，lookahead_level 决定"看得多仔细"。',
    commandExample: '-lookahead_level 8',
    effects: { quality: 3, fileSize: 2, speed: 4, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
  },
  'expl.advanced.extbrc': {
    id: 'expl.advanced.extbrc',
    title: 'Intel QSV 扩展码率控制 (-extbrc)',
    short: '启用 Intel GPU 的扩展码率控制模式——允许硬件做更精细的逐宏块 QP 调整，改善画质一致性但增加 GPU 编码流水线负载。对质量优先的 QSV 编码推荐开启。',
    detail: '默认的 QSV 码率控制在帧级或 slice 级操作。extbrc 将控制粒度下推到宏块层级——硬件可以在每个宏块上独立微调 QP 来更精确地匹配目标码率和画质分布。对 ICQ 和 LA-ICQ 等质量模式改善尤为明显——平坦区和纹理区的码率分配更合理。但开启后编码器在每帧上需要额外的 GPU 计算遍次，GPU 高负载时可能影响编码帧率。',
    commandExample: '-extbrc 1',
    effects: { quality: 3, fileSize: 2, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.advanced.qvbrQualityLevel': {
    id: 'expl.advanced.qvbrQualityLevel',
    title: 'AMD QVBR 质量级别 (-qvbr_quality_level)',
    short: '在 QVBR（质量可变码率）模式下设定目标质量级别，范围 0–51。值越小质量越高但码率越大。类似 CRF 但由 AMD 硬件直接实现——不经过软件码率控制层。',
    detail: 'QVBR 是 AMF 的质量优先码率控制模式——编码器以恒定质量为目标自动调整码率，而非固定码率下牺牲质量。qvbr_quality_level 的效果类似 x264 的 CRF：值越低（如 18–23）接近视觉无损但文件很大；值越高（如 30–35）压缩更激进而质量可接受。与 CQP（恒定量化器）不同，QVBR 仍在帧间动态调整码率分配以优化主观画质。',
    commandExample: '-qvbr_quality_level 23',
    effects: { quality: 5, fileSize: 5, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc.c' }],
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

  // -- libx264 explanations (new) --------------------------------
  'expl.libx264.psy': {
    id: 'expl.libx264.psy',
    title: 'x264 心理视觉优化 (-psy)',
    short: '控制 x264 是否启用心理视觉优化来提升主观画质；关闭后编码器仅追求 PSNR 等客观指标，画面可能显得平滑但缺乏纹理质感。',
    detail: '心理视觉优化（Psychovisual Optimization）是 x264 的核心特性之一。启用时编码器会在率失真决策中偏向保留人眼更敏感的纹理和边缘，即使这会略微偏离客观指标最优解。关闭后码率分配更"数学准确"但主观观感变得模糊平坦。对于动画、屏幕录制等平坦内容可以关闭；实拍视频、电影内容强烈建议保持开启。搭配 -psy-rd 可精细调节力度。',
    commandExample: '-psy 1',
    effects: { quality: 5, fileSize: 3, speed: 1, compatibility: 1 },
    warnings: ['关闭 -psy 同时开启 -psy-rd 不会生效，因为 psy-rd 工作在 psy 框架之下。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'psy', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.psyRd': {
    id: 'expl.libx264.psyRd',
    title: 'x264 心理视觉 RDO (-psy-rd)',
    short: '以 "RDO强度:格子量化强度" 格式精细控制心理视觉优化的力度；第一个值控制纹理保留，第二个值控制平坦区域噪点分布。',
    detail: '格式为 "psy_rdo_strength:psy_trellis_strength"。第一个值（RDO）影响编码器如何在模式决策中偏向纹理——典型值 0.8–1.2，越高画面越锐利但可能产生振铃伪影。第二个值（trellis）影响量化阶段的噪点分布——高值在高频区域产生更自然的"胶片颗粒感"，但码率也会随之升高。动画内容常设 0.4:0，电影内容常设 1.0:0.2。两个值都可单独微调。',
    commandExample: '-psy-rd "1.0:0.2"',
    effects: { quality: 5, fileSize: 4, speed: 1, compatibility: 1 },
    warnings: ['psy-rd 同时影响画质和码率，修改后应重测 CRF 值是否仍合适。', '过高值（>1.5）可能在锐利边缘产生双重轮廓伪影。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'psy-rd', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.nr': {
    id: 'expl.libx264.nr',
    title: 'x264 心理视觉降噪 (-nr)',
    short: '在编码器内部对源画面施加自适应降噪，不同于预处理滤镜——它结合运动估计只去除"不被后续帧保留"的噪声，避免无效码率浪费。',
    detail: 'x264 的内置降噪（nr）是一种心理视觉优化手段，不是独立的预处理滤镜。它利用编码器的运动补偿信息来区分"会被后续帧保留的信号"和"随机噪点"。只对随机噪点部分做降噪，从而在不牺牲真实细节的前提下节省码率。值域 0–1000，典型值 100–500。噪点极多的源（如胶片扫描、高 ISO 暗光）效果显著；干净的源（如数字动画）不建议开启。与外部降噪滤镜（hqdn3d、nlmeans）叠加使用时可能要降低此值以避免过度平滑。',
    commandExample: '-nr 150',
    effects: { quality: 3, fileSize: 4, speed: 1, compatibility: 1 },
    warnings: ['过高值会消除"有意义"的细纹理乃至皮肤毛孔和布料纹路。', '与预处理降噪滤镜效果叠加，应逐一测试避免双重降噪。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'noise_reduction', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.aqMode': {
    id: 'expl.libx264.aqMode',
    title: 'x264 自适应量化模式 (-aq-mode)',
    short: '自适应量化在不同画面区域分配不同的量化精度——平坦区域多给码率以避免色块，复杂纹理区域少给码率（人眼对纹理区压缩不敏感）。0=关闭，1=方差，2=自动方差（默认），3=自动方差+暗景偏向。',
    detail: 'AQ（Adaptive Quantization）是 x264 最重要的码率分配工具之一。关闭（0）意味着所有宏块使用相同 QP，平坦天空和墙壁容易产生色阶断层。方差模式（1）根据宏块复杂度分配 QP。自动方差（2）在此基础上根据帧内容动态调整强度，适合绝大多数内容。暗景偏向模式（3）额外对暗部区域降低 QP，避免暗场景出现块状伪影——适合电影、恐怖片等暗调内容，但码率会有所增加。AQ 强度由 -aq-strength 单独设置。',
    commandExample: '-aq-mode 2',
    effects: { quality: 5, fileSize: 4, speed: 1, compatibility: 1 },
    warnings: ['AQ 模式 3 在暗场景多的内容上码率增加显著（10–20%），需在 CRF/码率预算中考量。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'aq-mode', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.aqStrength': {
    id: 'expl.libx264.aqStrength',
    title: 'x264 自适应量化强度 (-aq-strength)',
    short: '配合 aq-mode 使用，控制自适应量化的干预力度；0 等于关闭 AQ 效果，1.0 为默认均衡值。低于 1.0 更接近关闭 AQ 的行为，高于 1.0 平坦区域得到更多码率但纹理区牺牲更大。',
    detail: 'AQ 强度决定了编码器在平坦区域和复杂区域之间分配码率的"倾斜程度"。0.6–0.8 适合纹理复杂的源（让复杂区保留更多细节）；1.0 是通用平衡点；1.2–1.5 适合平坦背景多的源（如采访、演讲，避免背景色块）。超过 1.5 时纹理区可能严重劣化。与 aq-mode=3（暗景偏向）搭配使用时，建议强度设 0.8–1.0，因为暗景模式本身已经加重了暗部保护。',
    commandExample: '-aq-strength 0.8',
    effects: { quality: 4, fileSize: 3, speed: 0, compatibility: 1 },
    warnings: ['AQ 强度与 CRF 值存在交互——提高 AQ 强度后可能需要微调 CRF 以维持目标画质。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'aq-strength', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.partitions': {
    id: 'expl.libx264.partitions',
    title: 'x264 分区类型 (-partitions)',
    short: '控制编码器可以使用哪些宏块分区尺寸来搜索最优压缩方式；更多分区类型提升压缩效率但增加编码时间。如 "p8x8,b8x8,i8x8,i4x4"。',
    detail: 'x264 在运动估计时尝试将每个宏块（16×16）分割为更小的子分区。每个启用的分区类型增加一个搜索维度。p8x8（P 帧 8×8）、b8x8（B 帧 8×8）基本必须开启；i8x8 和 i4x4 控制帧内预测的精细度——启用它们对静态画面和文字内容改善明显但编码极慢。所有分区全开（p8x8,p8x4,p4x8,b8x8,i8x8,i4x4,p4x4）只在质量至上的归档场景使用。预设不同默认开启的分区不同，手动设置会覆盖预设值。',
    commandExample: '-partitions "p8x8,b8x8,i8x8,i4x4"',
    effects: { quality: 3, fileSize: 2, speed: 5, compatibility: 1 },
    warnings: ['更多分区 = 更慢编码，p4x4 对绝大多数内容压缩增益极小但耗时显著增加。', '通常用 preset 控制分区足以，手动设置主要用于极端场景。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'partitions', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.directPred': {
    id: 'expl.libx264.directPred',
    title: 'x264 直接 MV 预测模式 (-direct-pred)',
    short: '控制 B 帧的直接模式（Direct Mode）运动矢量推导方式。spatial 从同帧邻块推导，temporal 从前向参考帧推导，auto 由编码器自动选择。',
    detail: '直接模式允许 B 帧宏块"复用"已计算的运动矢量而非自行搜索，显著节省编码时间。spatial（空间）对运动简单的场景效果更好；temporal（时间）对缓慢平移或一致运动场景更准；auto 让编码器逐块决策。auto 通常是最优选择——手动指定 spatial 或 temporal 只在确认特定源类型有优势时才做。',
    commandExample: '-direct-pred auto',
    effects: { quality: 2, fileSize: 1, speed: 2, compatibility: 1 },
    warnings: ['spatial 在运动复杂时可能产生块状伪影；temporal 在场景切换处表现较差。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'direct-pred', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.weightp': {
    id: 'expl.libx264.weightp',
    title: 'x264 P 帧加权预测 (-weightp)',
    short: 'P 帧加权预测允许编码器为每个参考帧赋予不同权重来补偿淡入淡出和光照变化。0=关闭，1=简单加权，2=智能加权（默认）。',
    detail: '淡入淡出、闪烁灯光或渐变滤镜等场景中，画面亮度会发生全局变化。普通运动补偿无法处理这种变化，而加权预测可以为参考帧施加一个全局亮度偏移。简单模式（1）对每个参考帧施加单一权重；智能模式（2）进一步分析重复帧和非重复帧的不同特性。对电影、MV、有转场特效的内容，weightp=2 是非常有价值的比特节约来源。',
    commandExample: '-weightp 2',
    effects: { quality: 3, fileSize: 3, speed: 1, compatibility: 1 },
    warnings: ['智能加权要求解码器支持，但主流播放器均已兼容——除非目标是非常老的硬件播放器。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'weightp', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.weightb': {
    id: 'expl.libx264.weightb',
    title: 'x264 B 帧加权预测 (-weightb)',
    short: '是否对 B 帧也启用加权预测（P 帧加权预测已由 -weightp 单独控制）。B 帧加权对淡入淡出场景的压缩效率有额外帮助，但解码器负担略增。',
    detail: '与 P 帧加权类似，B 帧加权预测允许双向参考的 B 帧对各参考帧施加权重来匹配亮度变化。因为 B 帧已有双向预测优势，加权预测的额外增益不如 P 帧显著，但在连续淡入淡出（如 MV 场景过渡）中仍能节省可观码率。启用对编码速度几乎没有影响，解码端要求 High Profile 及以上，主流设备都支持。',
    commandExample: '-weightb 1',
    effects: { quality: 2, fileSize: 2, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'weightb', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.bBias': {
    id: 'expl.libx264.bBias',
    title: 'x264 B 帧使用偏向 (-b-bias)',
    short: '控制编码器在 B 帧和 P 帧之间选择时对 B 帧的偏好程度。正值更倾向使用 B 帧（压缩效率更高但参考链更长），负值减少 B 帧使用。',
    detail: 'B 帧比 P 帧有更高的压缩效率（因为可使用双向参考），但过多的连续 B 帧会增加解码参考链深度和延迟。b-bias 影响编码器在 GOP 中分配 B 帧数量的倾向性。默认值 0 让编码器自行平衡；正值（如 50–100）在追求极致压缩率的归档场景使用更多 B 帧；负值（如 -50）在要求低延迟或快速随机访问时减少 B 帧。通常不需要手动调整——B 帧数量由 -bf 和 b-adapt 策略控制更为直接。',
    commandExample: '-b-bias 50',
    effects: { quality: 1, fileSize: 2, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'b-bias', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.bPyramid': {
    id: 'expl.libx264.bPyramid',
    title: 'x264 B 帧金字塔 (-b-pyramid)',
    short: '允许 B 帧本身作为其他 B 帧的参考帧，形成多层预测金字塔。normal 模式在压缩效率和质量之间最优平衡，strict 严格遵循 Blu-ray 规范。',
    detail: '传统 B 帧只能参考前后的 I/P 帧。B-pyramid 允许"低级"B 帧作为"高级"B 帧的参考，形成多层预测结构。这显著提高了高 B 帧数量场景下的压缩效率，因为更多 B 帧可以找到更接近的参考。normal 模式给编码器完全自由；strict 模式限制参考链深度以满足 Blu-ray 等严格规范的兼容性要求。对于网络分发和本地播放，normal 推荐使用。',
    commandExample: '-b-pyramid normal',
    effects: { quality: 3, fileSize: 3, speed: 1, compatibility: 2 },
    warnings: ['strict 是某些硬件播放器（老款蓝光机）的硬性要求；normal 在绝大多数现代设备上正常工作。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'b-pyramid', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.mixedRefs': {
    id: 'expl.libx264.mixedRefs',
    title: 'x264 混合参考帧 (-mixed-refs)',
    short: '允许宏块的每个 8×8 子分区独立选择参考帧，而非整个宏块共用同一参考。对运动复杂画面能提升压缩效率，但编码计算量增加。',
    detail: '关闭时，一个 16×16 宏块的所有子分区必须引用同一参考帧。开启后，每个 8×8 分区可以有自己最佳的参考帧选择。在运动复杂、有多个运动物体的场景中显著提升压缩效率（因为不同分区可能来自不同参考帧的匹配最好）。编码耗时约增加 10–15%，但码率节省在复杂场景通常可达 5–10%。',
    commandExample: '-mixed-refs 1',
    effects: { quality: 2, fileSize: 2, speed: 3, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'mixed-refs', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.dct8x8': {
    id: 'expl.libx264.dct8x8',
    title: 'x264 自适应 8×8 DCT (-dct8x8)',
    short: '允许编码器自动在 4×4 和 8×8 DCT 变换之间选择；8×8 对大块平坦区域压缩更高效，4×4 对精细纹理保真更好。',
    detail: 'DCT（离散余弦变换）将像素块转为频域系数——变换块越大，能量集中效应越好（压缩效率高），但对精细纹理的保真度下降。自适应 8×8 允许编码器根据宏块内容选择最优变换尺寸：平坦天空、墙壁用 8×8；文字、毛发、颗粒噪声用 4×4。开启后对绝大多数内容都有净收益——压缩效率提升且无明显质量损失。与 preset 中的 trellis 量化配合效果最佳。',
    commandExample: '-dct8x8 1',
    effects: { quality: 2, fileSize: 2, speed: 2, compatibility: 2 },
    warnings: ['需要解码器支持 High Profile——极老的移动设备或低端播放器可能不兼容。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'dct8x8', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.fastPskip': {
    id: 'expl.libx264.fastPskip',
    title: 'x264 快速 P-skip (-fast-pskip)',
    short: '启用快速 P-skip 检测可大幅加速编码（尤其静态场景），但极少数情况下可能在暗部产生微弱块状伪影。',
    detail: 'P-skip 是 H.264 的一种高效压缩模式——编码器判断某个宏块的内容变化"小到可以跳过"时，直接告诉解码器"复制对应参考帧的像素"。快速检测使用启发式方法而非完整 RDO 来决策 P-skip，可节省 10–20% 编码时间。对于绝大多数内容，质量损失肉眼不可见。关闭后编码器对每个宏块都做完整分析，仅在追求"完美"画质的归档场景考虑。',
    commandExample: '-fast-pskip 1',
    effects: { quality: 1, fileSize: 1, speed: 4, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'fast-pskip', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.mbtree': {
    id: 'expl.libx264.mbtree',
    title: 'x264 宏块树码控 (-mbtree)',
    short: '宏块树（Macroblock Tree）根据每个宏块被后续帧"参考引用"的频率来调节其 QP——被高引用的宏块给更多码率，因为它的质量会传播到多帧。',
    detail: 'mbtree 是 x264 最重要的前瞻性码控工具。编码器先做一次轻量前瞻分析，跟踪每个宏块在后续帧中被运动补偿引用的程度。被大量引用的宏块（如背景建筑、人脸）会得到较低的 QP（更高码率），因为它们影响多帧的画质；很少被引用的宏块（如快速运动物体遮挡后的背景）不会被"浪费"码率。关闭 mbtree 会让所有宏块平等分配码率——这在快速剪辑的内容中可能更好（因为缺少稳定参考链）。对一般内容，mbtree 能显著改善主观画质。',
    commandExample: '-mbtree 1',
    effects: { quality: 4, fileSize: 4, speed: 3, compatibility: 1 },
    warnings: ['mbtree 与 rc-lookahead 联动——rc-lookahead 决定了树分析的帧范围。', '对于极短 GOP 或全 I 帧编码，mbtree 没有作用且应关闭。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'mbtree', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.cplxblur': {
    id: 'expl.libx264.cplxblur',
    title: 'x264 复杂度模糊 (-cplxblur)',
    short: '对帧间复杂度变化做时间平滑，避免编码器对单帧复杂度突变（如闪光灯）做过度反应。值越大 QP 波动越小、码率波动越平稳，但场景切换响应变慢。',
    detail: '在编码过程中，场景的编码复杂度可能剧烈变化——爆炸、闪光、快速摇摄等会使某一帧的复杂度骤升。如果没有平滑，编码器会给这一帧分配极高的码率或严重降低 QP，造成码率尖峰。cplxblur 对时间维度的复杂度值施加低通滤波：较大的值（如 20–30）让 QP 变化更平稳，适合恒定码率场景；较小的值（2–5）让编码器更快响应场景变化，适合 CRF 编码。默认值通常在 preset 中设定，手动设置主要用于微调。',
    commandExample: '-cplxblur 20',
    effects: { quality: 2, fileSize: 2, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'cplxblur', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.chromaOffset': {
    id: 'expl.libx264.chromaOffset',
    title: 'x264 色度 QP 偏移 (-chromaoffset)',
    short: '相对于亮度分量的 QP 增减——负值给色度更多码率（色彩保真更好），正值降低色度码率（亮度和细节得到更多码率）。',
    detail: '人眼对亮度变化的敏感度远高于色彩变化，因此视频编码通常会降低色度平面的精度。chromaoffset 让你微调这个平衡：-1 或 -2 给色度额外码率，适合色彩丰富的动画或对色彩保真要求高的内容；+1 或 +2 把更多码率留给亮度（= 更清晰的纹理和边缘），适合黑白或色调柔和的内容。变化幅度很小（±2 通常已足够），极端值会导致色度明显劣化或浪费码率。',
    commandExample: '-chromaoffset -1',
    effects: { quality: 2, fileSize: 1, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'chromaoffset', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.deblock': {
    id: 'expl.libx264.deblock',
    title: 'x264 去块滤波参数 (-deblock)',
    short: '以 "alpha:beta" 格式控制 H.264 环路去块滤波器的强度——alpha 控制块边界滤波强度，beta 控制块内边缘检测阈值。负值减少滤波（更锐利、更多块状伪影），正值加强（更平滑、更模糊）。',
    detail: 'H.264 的去块滤波器在解码循环中运行，用于掩盖 DCT 变换产生的块边界不连续。alpha 决定"处理多大强度的边界不连续"——高 alpha 过滤更多边界；beta 决定"什么被视为块边界"——高 beta 检测更多边界。默认值 0:0 对大多数内容最优。动画和 CG 常设 -1:-1 到 -2:-2 以获得更锐利的线条；噪点较多或低码率编码时设 1:1 或 2:2 来减少色块。用 -1:-1 意味着"少一点滤波 = 多一点块状伪影但更多纹理保留"。',
    commandExample: '-deblock "-1:-1"',
    effects: { quality: 4, fileSize: 2, speed: 0, compatibility: 1 },
    warnings: ['极度负值（<-3）会产生非常明显的块状条纹，通常只在分析调试时使用。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'deblock', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.aud': {
    id: 'expl.libx264.aud',
    title: 'x264 Access Unit Delimiter (-aud)',
    short: '在每个 H.264 帧前插入 AU Delimiter NAL 单元，方便播放器、封装器和流媒体服务器定位帧边界。对画质零影响，仅改变码流结构。',
    detail: 'AU Delimiter 是一个极小的 NAL 单元（通常 2-4 字节），标记一个完整"访问单元"（一帧所有 NAL 的集合）的起始。它的存在不改变任何编码决策和像素输出，但为下游工具提供便利：TS 封装、HLS 切片器和硬件解码器可以利用 AUD 快速定位帧边界，无需解析所有 NAL。对于本地播放通常不需要，但对于流媒体再封装、广播级播出或使用某些专业分析工具时推荐开启。',
    commandExample: '-aud 1',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'aud', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.nalHrd': {
    id: 'expl.libx264.nalHrd',
    title: 'x264 HRD 信令 (-nal-hrd)',
    short: '在码流中写入 HRD（Hypothetical Reference Decoder）参数，告诉播放器正确缓冲模型。vbr 适合动态码率输出，cbr 适合恒定码率广播。none 不写入。',
    detail: 'HRD 参数描述了解码器解码该流时需要的缓冲区大小和码率特性。虽不直接影响画质，但为播放器、硬件解码器和流媒体服务器提供了正确初始化和缓冲的元数据。vbr 模式写入可变码率缓冲参数；cbr 模式写入恒定码率参数。蓝光制作需要 nal-hrd=vbr；IPTV 广播常需 cbr。本地播放和网络渐进下载通常不需要。',
    commandExample: '-nal-hrd vbr',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 5 },
    warnings: ['HRD 参数必须与实际码率控制参数（vbv-maxrate、vbv-bufsize）一致，否则播放器缓存计算错误。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'nal-hrd', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.sliceMaxSize': {
    id: 'expl.libx264.sliceMaxSize',
    title: 'x264 最大 Slice 大小 (-slice-max-size)',
    short: '限制每个 slice 的最大字节数，超过时分叉新的 slice。值 0 不限制。主要用于网络传输场景中控制单个网络包的大小，避免 IP 分片。',
    detail: 'H.264 帧可以由多个 slice 组成，每个 slice 独立可解码（仅限帧内 slice 边界）。限制 slice 最大大小主要用于 UDP/RTP 传输——如果整个帧编码为一个 slice 且超过 MTU（约 1500 字节），网络层需要进行 IP 分片，丢失任一片整个帧报废。设 slice-max-size 为略低于 MTU 的值可以避免这一问题。对本地文件和 HTTP 传输没有必要。设此值会略微降低压缩效率，因为 slice 边界打断了帧内的预测连续性。',
    commandExample: '-slice-max-size 1400',
    effects: { quality: 2, fileSize: 2, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'slice-max-size', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },

  'expl.libx264.fastfirstpass': {
    id: 'expl.libx264.fastfirstpass',
    title: 'x264 快速 2-pass 第一遍 (-fastfirstpass)',
    short: '2-pass 编码时，第一遍使用更简化的参数（如降低 subme、关闭 trellis）来快速生成统计文件；第二遍正常编码利用统计数据。推荐开启，质量损失极小但大幅加速。',
    detail: '2-pass 编码需要先完整分析一遍视频。fastfirstpass 让第一遍自动应用更快（略低精度）的设置，仅收集码率分配信息——这一步不需要完美画质。第二遍再利用统计数据以完整精度编码。对绝大多数内容，fastfirstpass 开启时的最终质量与关闭时几乎无差别，但第一遍时间缩短 30–60%。只在使用 2-pass (VBR/CBR) 或目标文件大小工具时有意义，CRF 模式不涉及 2-pass。',
    commandExample: '-fastfirstpass 1',
    effects: { quality: 0, fileSize: 0, speed: 5, compatibility: 1 },
    warnings: ['仅在 2-pass 编码时有效；CRF/ABR 单遍编码忽略此参数。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx264.c', symbol: 'fastfirstpass', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx264.c' }],
  },


  // -- libx265 explanations (new) --------------------------------

  'expl.libx265.aqMode': {
    id: 'expl.libx265.aqMode',
    title: 'x265 自适应量化模式 (aq-mode)',
    short: '控制 x265 如何在画面不同区域分配量化精度——平坦区域（天空、墙壁）需要更多码率来避免色带和块效应，纹理复杂区域（草地、织物）可以容忍更粗糙的量化。0=关闭（全帧统一 QP），1=方差自适应，2=自动方差（默认），3=自动方差+暗景偏向，4=增强暗景偏向。',
    detail: '自适应量化（AQ）是 x265 最重要的心理视觉工具之一。人眼对平坦区域的编码瑕疵（色带、块效应）极为敏感，而对高频纹理区域的失真几乎无感。AQ 的核心机制是：分析每个 CTU 的局部方差，方差低的块（平坦区）降低 QP（分配更多码率），方差高的块（纹理区）提高 QP（节省码率）。模式 0 关闭 AQ——全帧使用同一 QP，平坦区最容易出块效应。模式 1 基于方差做线性偏置。模式 2（默认）引入自动强度校准，根据帧级内容复杂度动态调整偏置幅度——这对混合内容（访谈、纪录片）尤其有效。模式 3 和 4 增加了"暗景偏向"——在方差的基础上叠加亮度因子，暗场景额外降低 QP。因为人眼在暗环境下瞳孔放大，对暗部噪点和色带的敏感度是亮部的数倍。模式 4 比模式 3 的暗景偏向更激进，适用于大量夜景/HDR 暗部内容的影片。对动漫、屏幕录制等平坦面积占比大的内容，建议至少保持模式 2。',
    commandExample: '-x265-params aq-mode=2',
    effects: { quality: 4, fileSize: 1, speed: 1, compatibility: 1 },
    warnings: ['aq-mode=0 对动画和游戏录制内容的画质影响尤为严重，不推荐。', '与 aq-strength 联动——高 aq-mode 配合过高 aq-strength 可能导致平坦区过度分配码率。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.aqStrength': {
    id: 'expl.libx265.aqStrength',
    title: 'x265 自适应量化强度 (aq-strength)',
    short: '控制 AQ 偏置的幅度——值越高，平坦区与纹理区之间的 QP 差异越大，平坦区获得更多码率保护但纹理区可能被过度压缩。范围 0.0-3.0，默认约 1.0。设为 0 等同于关闭 AQ。',
    detail: 'aq-strength 是 AQ 的"增益旋钮"。每次 AQ 计算出某 CTU 的"复杂度评分"后，aq-strength 决定这个评分转化为 QP 偏移的倍数。低值（0.3-0.7）：轻度保护平坦区，纹理区不会被过度牺牲——适合本身画质已经很好的高质量片源（BD 原盘、ProRes 中间片）。中值（0.8-1.2，默认范围）：平衡的保护力度，对大多数内容适用。高值（1.5-3.0）：激进保护平坦区——天空、墙面极其干净，但代价是纹理区（草地、皮肤毛孔、织物纹理）可能被"抹平"为模糊团块。实际调参时建议逐步增减 0.2 并对比同一帧的平坦区和纹理区：在平坦区看到色带→加大 aq-strength；纹理区变得模糊→减小 aq-strength。对 4K HDR 内容，由于高位深降低了色带风险，可以适当降低到 0.5-0.8。',
    commandExample: '-x265-params aq-strength=1.0',
    effects: { quality: 3, fileSize: 1, speed: 1, compatibility: 1 },
    warnings: ['过高的 aq-strength（>2.0）会导致纹理区出现"涂抹状"模糊，尤其在人脸皮肤和织物材质上易于察觉。', '与 aq-mode 联动——aq-mode=3 或 4 时暗景已有额外偏置，aq-strength 不宜过高。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.psyRd': {
    id: 'expl.libx265.psyRd',
    title: 'x265 心理视觉率失真优化 (psy-rd)',
    short: '在 RDO 决策中引入心理视觉偏置——告诉编码器"保留看起来重要的细节，即使它在数学上不是最优的"。范围 0.0-5.0，默认约 2.0。值越高，纹理和边缘保留越好，但传统指标（PSNR、SSIM）反而下降。',
    detail: '传统 RDO（率失真优化）以均方误差（MSE）为失真度量——MSE 认为"平滑但模糊的块"优于"略有噪点但细节丰富的块"，因为平滑块在数学上与原始的像素差更小。但人眼不这么看：我们更容易接受细小的随机噪点，却极其敏感于纹理抹平和边缘模糊。psy-rd 在 RDO 的失真计算中注入一个基于原始像素能量的补偿项——如果编码块包含大量高频纹理（原始画面"信息丰富"），RDO 会认为"把这块压模糊的代价更高"，从而分配更多码率保留纹理。低值（0-1）：接近纯数学优化，画面干净但细节可能被抹去——适合 CG 动画和屏幕录制。中值（1.5-2.5）：平衡的纹理保留，适合电影和实拍内容。高值（3-5）：激进保留纹理，甚至可能"制造"伪纹理（ringing artifacts）——适合噪点多的老胶片修复场景。注意 psy-rd 与 psy-rdoq 正交：psy-rd 作用于模式决策阶段，psy-rdoq 作用于量化舍入阶段，两者叠加使用。',
    commandExample: '-x265-params psy-rd=2.0',
    effects: { quality: 3, fileSize: 2, speed: 1, compatibility: 1 },
    warnings: ['过高的 psy-rd（>3.5）可能在锐利边缘周围产生振铃伪影——表现为物体轮廓外侧的"鬼影"细线。', 'psy-rd 值过高时编码器可能在平坦背景中引入细微的颗粒感，这在动画内容中尤其刺眼，建议动画/屏幕录制使用 0.5-1.0。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.psyRdoq': {
    id: 'expl.libx265.psyRdoq',
    title: 'x265 心理视觉量化舍入优化 (psy-rdoq)',
    short: '在量化阶段做心理视觉偏置——当变换系数处于两个量化级别的边界时，倾向于向保留更多高频的方向舍入。范围 0.0-50.0，默认约 12.5。配合 psy-rd 使用，两者覆盖不同的编码决策阶段。',
    detail: '量化（Quantization）将 DCT/DST 变换系数除以 QStep 后取整——这是有损编码中信息丢失的核心步骤。传统量化舍入（Deadzone Quantization）在"向上取"还是"向下取"之间仅依据数学 MSE 做决定，会系统性地将小幅度高频系数舍入到零，造成纹理丢失。psy-rdoq 在每个系数量化时计算一个"心理视觉代价"：如果原始块的纹理丰富（高频分量多），将系数向保留方向舍入的代价降低，使其更有可能"幸存"而非归零。低值（0-5）：接近传统量化，画面干净清爽，适合干净的数字摄影。中值（8-15）：温和保留纹理，适合大多数自然内容。高值（20-50）：激进保留每一个可能的纹理系数，噪点和胶片颗粒得到更好保留，但码率明显增加且可能在平坦区出现"孤立亮点"伪影。psy-rdoq 与 psy-rd 协同工作但作用于不同阶段：psy-rd 影响"选哪种编码模式"，psy-rdoq 影响"选了之后系数怎么量化"。两者同时调高时纹理保留效果最明显，但也要注意码率膨胀——建议先调 psy-rd 到满意水平，再微调 psy-rdoq。',
    commandExample: '-x265-params psy-rdoq=12.5',
    effects: { quality: 3, fileSize: 2, speed: 2, compatibility: 1 },
    warnings: ['psy-rdoq 必须配合 rdoq-level=1 或 2 使用——如果 rdoq-level=0（RDO-Q 关闭），此参数无效。', 'psy-rdoq > 30 时建议同时检查 flat 区域的块效应，高频系数过多保留可能使平坦背景出现"噪点感"。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.bframes': {
    id: 'expl.libx265.bframes',
    title: 'x265 最大连续 B 帧数 (bframes)',
    short: '控制两个 P/I 帧之间最多允许插入多少个连续的 B 帧。B 帧因使用双向预测而压缩效率最高（典型比 P 帧省 20-40% 码率），但 B 帧越多编码延迟越大、解码端参考帧缓冲需求越高。范围 0-16，默认 4。',
    detail: 'H.265 的帧间预测有三种类型：I 帧仅帧内编码（最大，无依赖性），P 帧单向参考前序帧，B 帧可同时参考前序和后续帧。B 帧的高压缩效率来自两个方向运动补偿的加权平均——当物体在两帧之间匀速运动时，B 帧可以从前后两帧"插值"出精确的运动信息，残差极小。连续使用多个 B 帧相当于让编码器在更长的时间跨度内寻找最优的双向匹配。对静态或缓慢变化的内容（访谈、风景纪录片），8-16 个 B 帧可显著降低码率（10-25%），因为大量帧之间差异极小。对快速运动或频繁场景切换的内容（体育、动作片），过多 B 帧收益递减——因为远距离的前后帧已经没有可用的双向相关性，B 帧退化为近似 P 帧的效率。硬件播放兼容性也是约束因素：部分老旧电视盒和嵌入式播放器对大量连续 B 帧支持不佳（参考帧缓冲不足），建议流媒体分发控制在 3-5。',
    commandExample: '-x265-params bframes=4',
    effects: { quality: 1, fileSize: 3, speed: 2, compatibility: 2 },
    warnings: ['bframes=0 等同于关闭 B 帧——压缩效率显著下降，码率可能增加 20-40%，不推荐。', 'bframes 值受硬件播放器 DPB（解码图像缓冲）大小限制——蓝光和 OTT 设备通常限制 4-6 个连续 B 帧。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.bAdapt': {
    id: 'expl.libx265.bAdapt',
    title: 'x265 B 帧自适应放置策略 (b-adapt)',
    short: '决定编码器如何在 GOP 中"安排"B 帧的位置——是机械地固定模式放置，还是通过率失真分析智能选择最优位置。0=关闭（固定 B 帧模式），1=快速启发式，2=完整 RDO 分析（最优但最慢）。',
    detail: '固定 B 帧模式（b-adapt=0）在每个 P/I 帧之间放置恰好 bframes 个 B 帧，形成机械的 IBBBBPBBBBP 结构。这在所有内容类型上表现平均但不最优——例如场景切换前的最后几帧如果被安排为 B 帧，其参考帧可能来自完全不同场景的下一 GOP，压缩效率极差。b-adapt=1 使用快速启发式（基于帧间 SATD 代价梯度变化）判断哪些帧"适合"做 B 帧——当连续帧之间变化平缓时插入 B 帧，当检测到运动突变或场景边界时改用 P 帧。b-adapt=2 做完整的 RDO 分析：对多种候选 GOP 结构计算真实码率-失真代价，选整体最优方案——这是 x265 preset slow 及以上才启用的选项，编码时间显著增加（尤其是 bframes 设得较大时，候选结构组合爆炸），但 BD-Rate 通常比模式 1 额外节省 2-5%。对离线编码任务（文件转码、存档压缩），模式 2 的额外时间投入物有所值；对实时/近实时编码（直播、会议），建议使用模式 1。',
    commandExample: '-x265-params b-adapt=2',
    effects: { quality: 2, fileSize: 3, speed: 3, compatibility: 1 },
    warnings: ['b-adapt=2 且 bframes >= 8 时编码时间显著增加——候选 GOP 结构数量随 bframes 指数增长。', 'b-adapt=0 在场景切换频繁的内容（预告片、广告）上可能产生明显画质损失——切换点 B 帧缺少有效参考帧。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.ref': {
    id: 'expl.libx265.ref',
    title: 'x265 最大参考帧数 (ref)',
    short: '每个 P/B 帧在做运动估计时可搜索的历史帧数量。范围 1-16，默认 3-5（取决于 preset）。更多参考帧可能捕获跨越多帧的运动轨迹，提升压缩效率，但编码时间和内存消耗随 ref 线性增长。',
    detail: '多参考帧机制是 H.265 区别于早期标准的重大改进之一。传统编码器每个 P 帧只能参考它的前一帧——如果物体在两帧内运动过大超出搜索范围，就只能残差编码。多参考帧允许编码器回溯 1-16 帧的历史画面，从中选择运动匹配最好的一帧（或多帧）作为参考——这对周期性运动（钟摆、风扇叶片、行走步伐）和遮挡/显露场景（物体经过遮挡物后重新出现）尤为有效。实际收益在 ref=1→3 时最明显（BD-Rate 节省 2-5%），3→5 时边际收益递减（1-2%），超过 6 后几乎只有学术意义——除非内容包含极长周期的往复运动（如体育赛事慢动作重放）。内存方面：每个额外参考帧需要存储一帧完整解码画面（DPB），对 4K 内容约 12 MB/帧。16 个参考帧 ≈ 额外 200 MB 编码内存。硬件编码器（NVENC、QSV、AMF）通常限制 ref ≤ 4，x265 软件编码无此限制但也极少需要超过 6。',
    commandExample: '-x265-params ref=4',
    effects: { quality: 2, fileSize: 2, speed: 2, compatibility: 2 },
    warnings: ['ref 与 limit-refs 联动——ref 设置较大时建议同时启用 limit-refs=1 或 2 以控制实际搜索开销，否则编码时间成倍增长。', 'ref 过大可能超出硬件解码器 DPB 限制——蓝光标准限制 4 帧，移动设备通常限制 5-6 帧。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.scenecut': {
    id: 'expl.libx265.scenecut',
    title: 'x265 场景切换检测阈值 (scenecut)',
    short: '控制编码器自动检测场景切换的灵敏度——当相邻帧之间的差异超过此阈值时，在该位置插入 I 帧（IDR）开启新 GOP。范围 0-100，0 关闭场景检测（所有 GOP 固定长度），默认 40。值越低越敏感。',
    detail: '场景切换是视频压缩中的关键断点——切换前后的画面内容完全不同，帧间预测几乎失效。如果场景切换恰好落在 GOP 中间，切换后第一帧作为 P/B 帧参考前一 GOP 末尾的"旧场景"帧，残差极大，产生的码率尖峰可能让整个 GOP 的画质崩溃（VBV 缓冲溢出、QP 漂升）。scenecut 通过在编码前对每帧与前一帧做快速 SATD（Hadamard 变换域绝对差值和）比较来预判切换位置——如果两帧的 SATD 比值超过内部阈值（由 scenecut 值映射），就在该位置强行插入 IDR 帧。低值（10-20）：灵敏检测——适合微电影、MV、预告片等剪辑密集的内容，确保每次剪切都刷新 GOP。中值（30-50，默认）：通用平衡——匹配大多数自然内容和混合内容的剪辑频率。高值（60-100）：迟钝——只有极剧烈的场景变化才会触发，适合长镜头、纪录片等剪辑稀疏的内容，减少不必要的 I 帧可以节省码率（I 帧体积通常是 P 帧的 3-10 倍）。scenecut=0 完全关闭动态检测，GOP 长度固定为 keyint 值，仅适用于对 GOP 结构有严格要求的广播规范。',
    commandExample: '-x265-params scenecut=40',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 1 },
    warnings: ['scenecut 过低（<10）可能产生过于密集的 I 帧，导致码率浪费在"假阳性"切换上（例如闪光灯、爆炸特效的瞬时亮度变化）。', '与 keyint（GOP 最大长度）联动——scenecut 在 keyint 范围内工作：即使 scenecut 检测不到切换，keyint 也会强制插入 I 帧。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.ctu': {
    id: 'expl.libx265.ctu',
    title: 'x265 编码树单元大小 (ctu)',
    short: '决定 x265 画面划分的基本块大小——H.265 以 CTU 为根节点递归划分 CU。64×64 像素（默认）对 1080p 及以上内容压缩最优；32×32 和 16×16 适用于低分辨率或特殊需求。CTU 越大，编码效率越高，但内存和计算开销也越大。',
    detail: 'CTU（Coding Tree Unit）是 H.265 编码的基本单元。每个 CTU 内部以四叉树结构递归划分为更小的 CU（编码单元），直到 8×8 的最小子块。CTU=64 意味着每个 CTU 覆盖 64×64 像素区域——对该区域编码器可以灵活地在 64×64、32×32、16×16、8×8 之间选择最优划分。大 CTU 的优势在于：大面积平坦区域（天空、墙面）可以用一个 64×64 的 CU 编码，只记录一个运动矢量和一个预测模式——极省码率。小 CTU 则在精细纹理和物体边缘有用，但需要更多划分层级。对 4K 内容，64×64 的 CTU 覆盖的物理面积相对合理；对 720p 或更低分辨率，64×64 块在画面上占比过大（覆盖 5% 以上的画面宽度），导致细节区域被迫使用更深的四叉树层次（因为大块内同时包含前景和背景），反而不如直接使用 32×32 的 CTU 扁平高效。兼容性方面：所有 H.265 Level 4 及以上设备均支持 64×64 CTU；H.265 Level 3/3.1（部分低端移动设备）限制 CTU ≤ 32。',
    commandExample: '-x265-params ctu=64',
    effects: { quality: 2, fileSize: 2, speed: 2, compatibility: 2 },
    warnings: ['ctu=64 对 ≤ 480p 内容几乎没有收益——在极小分辨率上大块划分的不灵活性抵消了压缩效率优势。', '部分低端硬件解码器（早期 4K 电视、廉价 OTT 盒子）不支持 CTU=64，如遇播放故障可降为 32。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.me': {
    id: 'expl.libx265.me',
    title: 'x265 运动估计搜索算法 (me)',
    short: '决定编码器如何在参考帧中搜索运动匹配块——菱形 (dia) 和六边形 (hex) 适用于快速编码；非均匀多六边形 (umh) 是默认通用最优选择；星形 (star) 和连续消除 (sea) 提供更高搜索精度；全搜索 (full) 穷尽所有可能位置，最精确但最慢。',
    detail: '运动估计（ME）是视频编码中最耗时的环节——占编码总时间的 40-70%。ME 的本质是在参考帧中找到一个与当前块"最像"的像素区域，两者位置差即为运动矢量（MV）。理想的最优解是全搜索（full）——在搜索范围内逐个像素比较，找到真正的最优匹配。但对每个 CU 做全搜索的计算量惊人（对 64×64 块在 ±57 像素搜索范围内需检验约 13000 个候选位置），因此实际使用启发式搜索：dia（菱形）从中心向外以菱形模式搜索，速度快但易陷入局部最优；hex（六边形）比菱形搜索更细的网格；umh（非均匀多六边形）先用粗网格快速定位大致区域再用细网格精细搜索——性价比最高，是 x265 medium/slow 预设的默认选择；star（星形）在 umh 基础上增加了对角线方向的采样密度；sea（连续消除）利用 Hadamard 变换的数学性质快速排除"绝不可能"的候选区域，在保持接近全搜索精度的同时大幅减少计算。对离线高质量编码，建议 me=star 或 sea（配合 subme ≥ 5）；对快速预览或实时编码，me=hex 即可。',
    commandExample: '-x265-params me=star',
    effects: { quality: 3, fileSize: 1, speed: 4, compatibility: 1 },
    warnings: ['me=full 在 4K 内容上可能使编码时间增加数倍而画质改善微乎其微——不推荐，umh 或 star 已接近全搜索精度。', 'me 与 merange 联动——merange 越大，搜索算法差异越明显；merange < 16 时所有算法表现接近。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.subme': {
    id: 'expl.libx265.subme',
    title: 'x265 子像素运动估计精度 (subme)',
    short: '控制运动估计的像素级以下细化精度——整数像素搜索找到大致位置后，围绕该位置做 1/2、1/4 甚至 1/8 像素级别的精细调整。范围 0-7，默认 2-5（取决于 preset）。值越高，运动矢量越精确，但子像素搜索的计算量随精度级数指数增长。',
    detail: '现实中的物体运动很少恰好落在整数像素格点上——当物体移动 3.7 像素时，整数搜索只能找到偏移 4 或 3 的匹配，残差中残留不可忽视的高频能量。子像素 ME 通过插值生成"亚像素"参考图像（1/2 像素用 8 抽头滤波器，1/4 像素用 7 抽头滤波器），在插值后的高分辨率参考帧中搜索更精细的匹配。subme 级别控制插值精度和搜索细化策略：0=仅整数像素（最快，但运动场景会出现明显的"锯齿状"运动伪影）；2=1/2 像素 + SATD 代价；5=1/4 像素 + 全 RDO 代价（推荐的最低质量级别）；7=1/4 像素 + 多轮迭代细化（适用于最挑剔的离线编码）。从 subme=5 提升到 7，典型编码时间增加 15-25%，BD-Rate 改善 0.5-2%，画质差异在高速运动场景（体育、动作）中肉眼可辨。对静态访谈类内容，subme 的收益几乎不可见——运动本身太少。',
    commandExample: '-x265-params subme=5',
    effects: { quality: 3, fileSize: 1, speed: 3, compatibility: 1 },
    warnings: ['subme < 3 在高速运动内容上可能产生明显的运动矢量误差累积——表现为快速移动物体边缘的闪烁模糊。', 'subme=7 对 CPU 编码线程利用率有负面影响——精细的子像素搜索可能成为并行瓶颈。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.merange': {
    id: 'expl.libx265.merange',
    title: 'x265 运动估计搜索范围 (merange)',
    short: '以像素为单位决定 ME 在参考帧中的最大搜索半径——值越大，编码器能在更远距离上追踪物体运动，但搜索计算量以 O(r²) 增长。范围 0-32768，默认 57。对 1080p 内容 57 即可覆盖大多数运动场景；对 4K 高速运动可能需要增大到 128-256。',
    detail: 'merange 的本质是"编码器愿在当前参考帧中跑多远去找匹配块"。如果物体的帧间位移超过 merange，编码器找不到有效运动矢量，只能退化为帧内编码或次优残差编码——后果是运动场景的码率尖峰和局部模糊。选 merange 的经验公式：merange ≥ 画面高度 × 最大物体运动速度（画面占比每秒）÷ 帧率。例如 1080p 画面中一只鸟以 0.3 画面高度/秒的速度飞过，帧率 30，最小 merange = 1080 × 0.3 / 30 = 10.8——57 的默认值很充裕。但对 4K（2160p）极限运动场景（赛车、体育慢动作），merange=57 仅覆盖约 2.6% 的画面高度，快速移动的小物体（球、飞鸟）可能被遗漏——建议增大至 128-256。merange 不能"越大越好"：搜索面积与 merange² 成正比，merange=256 是 merange=57 的约 20 倍搜索面积——编码时间显著增长。',
    commandExample: '-x265-params merange=57',
    effects: { quality: 2, fileSize: 1, speed: 3, compatibility: 1 },
    warnings: ['merange > 512 在大多数内容上仅增加编码时间而不改善画质——只有 8K 极限运动场景才需要如此大的搜索范围。', 'merange 与 me 联动——快速算法（hex、dia）在大 merange 下的搜索效率下降更严重，建议 merange > 128 时同时使用 umh 或 star。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.noOpenGop': {
    id: 'expl.libx265.noOpenGop',
    title: 'x265 关闭开放 GOP (no-open-gop)',
    short: '开放 GOP 允许当前 GOP 末尾的 B 帧参考下一个 GOP 的 I 帧——这提供了额外的时间预测信息，略微提升压缩效率。关闭开放 GOP（no-open-gop=1）后每个 GOP 完全独立，更适合需要精确 seek 和章节定位的场景。',
    detail: '开放 GOP（Open Group of Pictures）的核心思想是：GOP 边界不应成为运动预测的"硬墙"。典型开放 GOP 结构中，GOP 末尾的 B 帧可以在时间上前向参考当前 GOP 的 P 帧，后向参考下一个 GOP 的开头 I 帧——这个双向跨 GOP 的参考关系为 B 帧提供了更完整的时间上下文，压缩效率比封闭 GOP 高约 1-5%。但开放 GOP 的代价是兼容性和可编辑性：删除或损坏一个 GOP 会影响相邻 GOP 的末尾 B 帧（因为它们依赖于"隔壁"的 I 帧）；精确 seek 到某帧时需要先解码其参考链中可能来自另一个 GOP 的帧；视频编辑软件（Premiere、DaVinci Resolve）的智能剪切通常要求封闭 GOP。关闭开放 GOP 适用场景：蓝光制作、广播级分发、需要精确帧级剪辑的工作流、基于 HTTP 自适应流的分段视频（HLS/DASH）。保持开放 GOP 适用场景：本地存储播放（播放器线性解码，不受影响）、对文件大小敏感的在线分发。',
    commandExample: '-x265-params no-open-gop=1',
    effects: { quality: 1, fileSize: 1, speed: 1, compatibility: 3 },
    warnings: ['关闭开放 GOP 后每个 GOP 的首个 I 帧不能为后续 GOP 的 B 帧所用——需略微提高 I 帧质量（降低 I 帧 QP）补偿边际效率损失。', 'HLS/DASH 分段流媒体建议关闭开放 GOP 以确保每段完全独立可解码。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.noSao': {
    id: 'expl.libx265.noSao',
    title: 'x265 关闭样点自适应偏移滤波 (no-sao)',
    short: 'SAO（Sample Adaptive Offset）是 H.265 环路滤波的第二阶段——在去块滤波之后，按类别对重建像素施加微小偏移以补偿量化误差。关闭 SAO 可节省编码时间 5-15%，但平缓渐变区域（天空、水面）可能出现肉眼可察的色带。',
    detail: 'H.265 的去块滤波（Deblocking Filter）仅作用于块边界——在 8×8 块边缘平滑量化不连续性。但它无法处理块内部的量化误差累积：例如一个从亮到暗的平滑渐变区域，量化后可能出现"阶梯状"的离散亮度跳变（色带效应）。SAO 解决这个问题：编码器将每个 CTU 的像素按边缘方向或亮度区间分类，对每个类别计算一个"全局偏移量"加到重建像素上——这个偏移量由编码器分析原始像素与重建像素的系统性偏差后确定，写入码流供解码器执行。关闭 SAO（no-sao=1）意味着跳过整个 SAO 分析-计算-应用流程，编码时间节省明显，但代价是：1）平滑渐变区可能出现色带；2）尖锐边缘附近可能出现轻微的振铃伪影（因为 SAO 的边缘偏移模式也负责抑制这种伪影）；3）整体画面看起来略微"粗糙"。对动漫内容（大面积平坦色块 + 锐利边缘），SAO 的正面作用尤为关键——关闭后色带极明显。对噪点丰富的实拍内容，SAO 的改善相对微妙——因为噪点本身掩盖了量化伪影。不建议关闭 SAO，除非编码速度是绝对优先级且内容本身噪声足够高。',
    commandExample: '-x265-params no-sao=0',
    effects: { quality: 3, fileSize: 1, speed: 3, compatibility: 1 },
    warnings: ['关闭 SAO 对动画和 CGI 内容的画质影响远大于实拍内容——动画的平坦色块是色带的"完美画布"。', 'SAO 与去块滤波是互补关系——关闭 SAO 不等于关闭去块滤波，两者分别处理块边界和块内部的不同伪影类型。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.selectiveSao': {
    id: 'expl.libx265.selectiveSao',
    title: 'x265 选择性 SAO 应用 (selective-sao)',
    short: '智能跳过 SAO 收益微小的 CTU 而非全帧应用——在对画质影响极小的情况下收回 SAO 消耗的部分编码时间。0=关闭（全帧应用 SAO），1=开启选择性跳过，2=增强跳过（更激进的跳过策略）。',
    detail: '全帧 SAO 存在一个效率浪费：对纹理丰富的 CTU（草地、织物、树叶），量化误差被高频纹理掩盖，SAO 施加的微小像素偏移对人眼完全不可见——但编码器仍为每个这样的 CTU 计算 SAO 参数并写入码流。selectiveSao 在 SAO 分析阶段引入一个"收益预判"步骤：编码器快速评估 SAO 在每个 CTU 上的率失真收益（施加偏移后的质量改善 vs 写入 SAO 参数的码率开销），如果收益低于阈值则直接跳过该 CTU 的 SAO 处理。模式 1 使用保守阈值——仅跳过"几乎确定无收益"的 CTU，安全性高。模式 2 使用更宽松的阈值——可能跳过更多 CTU，画质影响轻微但仍建议 ABX 对比确认。在大多数内容上，selectiveSao=1 可以在画质损失 <0.1% dB 的前提下回收 20-40% 的 SAO 耗时。对极致质量追求，保持模式 0（全帧 SAO）。对速度敏感但不愿完全关闭 SAO（避免色带灾难）的场景，模式 1 是最佳折中。',
    commandExample: '-x265-params selective-sao=1',
    effects: { quality: 1, fileSize: 1, speed: 2, compatibility: 1 },
    warnings: ['selectiveSao=2 对动画内容需谨慎——动画的平坦区域面积大，SAO 收益明显，激进跳过可能导致局部色带。', 'selectiveSao 与 noSao 互斥——no-sao=1 时此参数无意义。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.saoNonDeblock': {
    id: 'expl.libx265.saoNonDeblock',
    title: 'x265 SAO 非去块模式 (sao-non-deblock)',
    short: '开启后 SAO 仅处理未被去块滤波修改的像素——避免对已被去块滤波器"修复"的块边界像素再做偏移，减少两阶段环路滤波之间的交互伪影。值为 1 时开启此限制，默认 0（SAO 处理所有像素）。',
    detail: 'H.265 的环路滤波分为两个顺序阶段：先去块滤波（Deblocking）再 SAO。去块滤波在块边界修正 0-2 个像素的灰度值以平滑边界不连续性——这些被修正的像素已经从"编码残差+量化误差"的被污染状态恢复到了接近原始的状态。如果紧接着 SAO 再次修改这些像素（基于 CTU 级别的分类偏移），存在过度修正风险——去块滤波已经推了一把，SAO 可能推过头。sao-non-deblock=1 告诉 SAO："跳过那些被去块滤波碰过的像素，只处理块内部的未被污染的像素"。这避免了双重滤波干扰，画面更干净自然，但代价是块边界附近的少量像素失去了 SAO 对量化误差的补偿——不过去块滤波本身已经处理了这部分误差。对大多数内容，开启此选项带来的改善非常微妙（通常在 ABX 测试中不可分辨），但在某些边缘密集型内容（文字叠加、UI 界面录制、动漫线条）上，可以观察到边界清晰度的轻微提升——因为 SAO 不再"软化"被去块滤波锐化过的边缘。',
    commandExample: '-x265-params sao-non-deblock=1',
    effects: { quality: 1, fileSize: 1, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.noStrongIntraSmoothing': {
    id: 'expl.libx265.noStrongIntraSmoothing',
    title: 'x265 关闭帧内强平滑滤波 (no-strong-intra-smoothing)',
    short: 'x265 默认对 32×32 帧内预测块施加一个强平滑滤波器以减少平坦区域的轮廓伪影。关闭后纹理细节和噪点得到更好保留，但可能在平滑渐变区域出现细微的块状轮廓。值为 1 时关闭平滑。',
    detail: '帧内预测是通过相邻已编码块的边界像素"外推"当前块内容的过程——当 32×32 的大块使用 DC 或平面模式时，预测块是相邻边界像素的平滑外推结果，内部天然缺乏纹理变化。如果原始画面此处恰好有微妙的纹理（皮肤毛孔、胶片颗粒、织物纹理），大块帧内预测会产生明显的"塑料感"——块内部过于平滑而边缘处纹理突然恢复，形成视觉上的块状轮廓。强帧内平滑（Strong Intra Smoothing）在帧内预测生成大块预测信号后，对参考边界像素施加一次额外的高斯式平滑——使外推结果更"软"，减少轮廓伪影，但代价是边界像素携带的纹理信息被削弱。关闭此平滑（no-strong-intra-smoothing=1）让帧内预测块尽可能忠实于相邻像素的纹理特征——对噪点多、颗粒感强的胶片内容和手持暗光拍摄素材更有利，保留了材质的"质感"。对干净的数码摄影和 CGI，保持平滑开启（默认）能预防平坦区域的孤立轮廓线。',
    commandExample: '-x265-params no-strong-intra-smoothing=1',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 1 },
    warnings: ['此参数仅影响帧内预测，不影响帧间预测（P/B 帧）——帧间预测有自己的插值滤波器，不受此开关控制。', '关闭强平滑后如果 I 帧质量不足（CRF 偏高），大块帧内预测块的"脏纹理"可能比平滑伪影更刺眼。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.noConstrainedIntra': {
    id: 'expl.libx265.noConstrainedIntra',
    title: 'x265 无约束帧内预测 (no-constrained-intra)',
    short: '关闭约束帧内预测后，帧内编码块可从相邻的帧间编码块获取参考像素——压缩效率有所提升，但一旦帧间参考帧出现传输丢包或损坏，错误会沿帧内预测链扩散到后续帧。值为 0 时保持约束（默认安全行为），值为 1 时放开限制。',
    detail: '约束帧内预测（Constrained Intra Prediction）是 H.265 的错误恢复机制。开启约束（no-constrained-intra=0，默认）时，帧内编码块只能参考其他帧内编码块的像素，确保预测链完全不依赖帧间块——即使 P/B 帧因网络丢包损坏，帧内块也不会被"污染"，后续 I 帧可完全刷新错误。关闭约束（no-constrained-intra=1）后，帧内块可从帧间邻居直接借用重建像素——这些重建像素更接近原始画面（因为帧间预测已利用了时间相关性），压缩效率更高，但帧内块进入了帧间块的依赖链。对本地文件存储和可靠网络传输（HTTP、本地播放）建议关闭以榨取额外压缩率；对广播链、UDP 流媒体等不可靠传输链路建议保持默认约束。',
    commandExample: '-x265-params no-constrained-intra=1',
    effects: { quality: 0, fileSize: 2, speed: 0, compatibility: 3 },
    warnings: ['与 no-lossless、no-weightb 等参数存在于同一 -x265-params 字典中，多个参数以冒号分隔：-x265-params "no-constrained-intra=1:limit-modes=1"。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.limitModes': {
    id: 'expl.libx265.limitModes',
    title: 'x265 限制编码模式候选 (limit-modes)',
    short: '在 RDO 分析阶段用启发式规则提前剪枝低概率的候选编码模式，显著加速编码，画质损失极小。值为 1（开启）时典型节省 20-40% 模式决策时间，BD-Rate 损失在 1% 以内。',
    detail: 'x265 在 RDO（率失真优化）分析阶段为每个 CU 评估多种帧内方向、帧间分区和预测组合。limit-modes 利用残差能量、SATD 代价等启发式指标预判哪些候选模式"几乎不可能胜出"，在进入昂贵的完整 RDO 计算之前就将其排除。这是 x265 预设系统最核心的加速手段之一——从 medium 到 ultrafast 各档预设均默认开启，仅 placebo 关闭以进行全量候选评估。关闭 limit-modes 会让编码器评估所有可能模式，理论上能找到最优解，但编码时间增加 30-60% 而画质改善肉眼无法分辨。仅在需要验证编码器 RDO 行为正确性的基准测试或学术研究场景考虑关闭。',
    commandExample: '-x265-params limit-modes=1',
    effects: { quality: 1, fileSize: 1, speed: 5, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.limitRefs': {
    id: 'expl.libx265.limitRefs',
    title: 'x265 限制参考帧候选 (limit-refs)',
    short: '逐级减少运动估计中实际参与搜索的参考帧数量——0=不限制（全量搜索所有可用参考帧），1=轻度剪枝，2=中度剪枝，3=激进剪枝。越高越快，但快速运动场景可能错过最优跨帧匹配。',
    detail: 'H.265 支持多参考帧机制（通常默认 3-5 帧），每个 CU 需在所有可用参考帧中独立搜索最佳运动矢量匹配。limit-refs 基于时空一致性启发式逐级减少候选参考帧：级别 1 剔除与当前帧时间距离过远或运动趋势不匹配的参考帧；级别 2 进一步利用相邻 CU 已选参考帧的信息做剪枝；级别 3 最激进，每 CU 仅保留最可能的 1-2 个参考帧。对静态访谈、新闻播报等内容，即使开到 3 也几乎没有质量影响，因为运动补偿本身需求简单。但对体育赛事、动作电影、手持拍摄等快速或复杂运动内容，激进剪枝可能导致某些 CU 被迫使用次优参考帧，产生轻微的运动模糊或块状伪影——建议保持 0 或 1。',
    commandExample: '-x265-params limit-refs=1',
    effects: { quality: 2, fileSize: 1, speed: 4, compatibility: 1 },
    warnings: ['与 ref（最大参考帧数）参数联动——ref 设置越大，limit-refs 的加速作用越明显；ref=1 时 limit-refs 几乎没有意义。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.noCutree': {
    id: 'expl.libx265.noCutree',
    title: 'x265 关闭 CU-tree (no-cutree)',
    short: '关闭 CU-tree 后编码器不再根据每个 CTU 被后续帧引用的频度来调节 QP——所有区域均等分配码率。对于场景切换频繁、快速摇摄或动画内容（时间参考链短）可避免无效的前瞻码率重分配，获得更一致的画质。',
    detail: 'CU-tree（Coding Unit Tree）是 x265 对标 x264 mbtree 的核心前瞻码控工具。编码器先通过 rc-lookahead 做轻量前瞻分析，追踪每个 CTU 在后续帧中被运动补偿"参考引用"的次数。被大量引用的区域（如固定背景建筑、人物面部）获得更低 QP（更多码率），因为其质量直接影响后续多帧；很少被引用的区域（如快速运动物体遮挡后露出的背景）减少码率分配。这一策略在常规电影和电视剧中效果显著，平均可节省 10-20% 码率而不损失主观画质。但在以下场景中 CU-tree 的分配逻辑可能适得其反：动画（画面纹理各有不同，前后帧未必"共享"同一背景质量）、快速剪辑的 MV 或预告片（平均镜头长度 < 2 秒，时间传播链极短）、剧烈摇摄镜头（每帧内容大幅偏移，参考关系不稳定）。对此类素材关闭 CU-tree 让 QP 分配更"扁平化"，各区域画质更一致。',
    commandExample: '-x265-params no-cutree=1',
    effects: { quality: 3, fileSize: 4, speed: 3, compatibility: 1 },
    warnings: ['no-cutree=1 关闭后 rc-lookahead 仍可用于码率控制决策，只是不再驱动 QP 空间重分配。', '关闭 CU-tree 后建议适当降低 CRF 值（1-2 档）以维持整体画质水平，因为失去了 CU-tree 的"免费"码率优化。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.rdoqLevel': {
    id: 'expl.libx265.rdoqLevel',
    title: 'x265 率失真优化量化级别 (rdoq-level)',
    short: '在量化阶段对每个系数评估"保留还是丢弃"的 RD 代价，替代简单的数学取整。0=关闭，1=轻量（仅低频系数），2=完整（所有系数组）。Level 2 的 BD-Rate 改善约 3-5%，编码时间增加 30-50%。',
    detail: '标准量化器仅按 QP 对变换系数取整——每个系数独立决策，不考虑系数之间的率失真耦合。RDO-Q（Rate-Distortion Optimized Quantization）以系数组（Coefficient Group / CG，通常 4×4）为单位做联合优化：评估多种"哪些系数保留、哪些归零"的组合方案，选取 RD 代价最低的全局解。Level 1 仅对频域低区的系数组（对视觉影响最大）做 RD 决策；Level 2 对所有系数组做完整分析。对存档级编码（如母带归档、长期保存），Level 2 的 3-5% 码率节省非常可观且不会丢失。对日常转码和网络分发，Level 1 已能获得大部分收益——低频系数占视觉权重的绝大部分。Level 2 与 trellis 量化有协同效果（两者都在量化阶段引入 RD 优化），但计算成本叠加。',
    commandExample: '-x265-params rdoq-level=2',
    effects: { quality: 5, fileSize: 4, speed: 4, compatibility: 1 },
    warnings: ['RDO-Q Level 2 的编码耗时增加显著（30-50%），对于长视频（>1 小时）需评估时间预算。', '通过 -x265-params 传入时参数名为 rdoq-level，不是 rdoq_level。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.rdpenalty': {
    id: 'expl.libx265.rdpenalty',
    title: 'x265 RD 分区惩罚 (rdpenalty)',
    short: '对大尺寸 CU 分区（64×64、32×32）施加额外的 RD 惩罚，使编码器倾向选择更小、更精细的分区来保留细粒度纹理。0=关闭（默认偏向大分区），1=轻度偏向小分区，2=强力偏向。对草地、布料、毛发等纹理密集内容效果显著，但码率随之上升。',
    detail: 'x265 的 RDO 决策天然偏向大 CU 分区——用 64×64 编码一个块只需记录一次预测模式和少量残差，比特开销极低。在平坦背景区域这完全正确，但在纹理密集区域（草坪、织物、沙滩、动物毛发），"一刀切"的大分区会磨平所有细粒度变化，产生蜡像般的平滑感。rdpenalty 在 RD 成本计算公式中对大分区额外加收码率惩罚——相当于告诉编码器"如果能用小分区更好地保留纹理，多花的码率是值得的"。Level 1 的偏向幅度适中，对多数自然场景可感知纹理保留改善，码率增加约 2-5%。Level 2 强力压制大分区，码率增加可达 10-15%，仅推荐纹理保真度要求极高的素材（如面料产品展示、自然纪录片）。与 psy-rd 和 psy-rd 在 x264 中的作用类似——两者都在 RD 决策中引入"主观质量"而非纯数学指标。',
    commandExample: '-x265-params rdpenalty=1',
    effects: { quality: 4, fileSize: 3, speed: 1, compatibility: 1 },
    warnings: ['Level 2 在高 QP（低码率）场景可能适得其反——小分区在码率不足时比大分区产生更多块状伪影。', '与 strong-intra-smoothing=0 搭配使用时，纹理保留效果叠加，但码率增加也叠加。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.maxMerge': {
    id: 'expl.libx265.maxMerge',
    title: 'x265 最大 Merge 候选数 (max-merge)',
    short: '控制每个 CU 可尝试的 Merge 模式候选数量，范围 1-5。Merge 模式让当前块直接继承相邻块的运动信息（运动矢量+参考帧索引），无需编码自己的运动矢量——候选越多，成功合并的概率越大，压缩效率略有提升但搜索量增加。',
    detail: 'Merge 模式是 H.265 最高效的编码工具之一——如果当前 CU 的运动矢量、参考帧索引与某个空间邻居或时间同位块完全相同，编码器只需写一个 2-3 比特的 merge 索引，运动信息本身零比特开销。max-merge 决定编码器从几个邻块构造候选列表：空间左邻、上邻、右上、左下邻居和时间同位块。候选数越少，构造列表和评估更快，但某些块可能因列表中没有合适匹配而被迫用更昂贵的显式运动矢量编码；候选数越多，覆盖更多运动场景，但评估时间略微增加。对静态和简单平移运动内容（如摄像机固定拍摄的讲座），候选数增加收益递减，因为前 1-2 个候选已基本覆盖了所有运动模式。对复杂运动（多人、多物体的运动交错），更多候选能捕捉到更多无开销 merge 机会。默认值由 preset 确定（多数预设 2-3），手动提高到 4-5 对压缩效率有微小正向贡献。',
    commandExample: '-x265-params max-merge=3',
    effects: { quality: 1, fileSize: 1, speed: 2, compatibility: 1 },
    warnings: ['max-merge 的值不能超过 H.265 标准上限（5），设更高值会被自动截断为 5。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.earlySkip': {
    id: 'expl.libx265.earlySkip',
    title: 'x265 快速早期 Skip 检测 (early-skip)',
    short: '在进入完整的 RDO 模式搜索前用启发式快速判断一个 CU 是否可以直接标记为 Skip——Skip 的 CU 解码器直接复制参考帧像素，几乎不消耗新增码率。值为 1 时大幅加速编码，BD-Rate 影响在 0.2% 以内，肉眼不可见。',
    detail: 'Skip 模式是 H.265 压缩效率的极致体现：当编码器判定某个 CU 的内容与参考帧对应位置"足够接近"（残差能量低于阈值），整个 CU 标记为 skip——解码器直接复制参考帧的像素，零残差、零运动矢量增量、仅需一个标志位。early-skip 在进入昂贵的全 RDO 模式搜索前使用残差能量阈值和运动矢量一致性等启发式做快速预判——如果残差已极低且运动矢量与邻块一致，大概率全 RDO 搜索后仍会选择 skip，那不如直接跳过以节省计算。这是一项极为成熟的加速技术，几乎所有非 placebo 预设均开启。关闭后编码器为每个 CU 完整运行 RDO 再决策，仅在需要对比"跳过优化前后编码决策是否一致"的回归测试中考虑。',
    commandExample: '-x265-params early-skip=1',
    effects: { quality: 0, fileSize: 0, speed: 4, compatibility: 1 },
    warnings: ['与 limit-modes、limit-refs 配合使用时加速效果叠加，搭配合理的 preset 通常不需要单独调整此参数。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.fastIntra': {
    id: 'expl.libx265.fastIntra',
    title: 'x265 快速帧内预测 (fast-intra)',
    short: '用"粗筛+半精度细化"替代逐方向全搜索来加速帧内预测模式决策。H.265 定义了 35 种帧内方向，全搜索计算量巨大——快速搜略牺牲极少精度换取明显加速。值为 1 时开启（推荐），但渐变丰富的画面可关闭以获得更准确的方向选择。',
    detail: 'H.265 帧内预测共 35 种角度模式（H.264 仅 9 种），加上 Planar 和 DC 共 35 种候选。x265 的 fast-intra 采用分级策略：第一轮用粗粒度的 SATD 代价快速扫描所有 35 个方向，筛出前若干个最可能的候选；第二轮仅对入围候选做更精确的 RDO 评估和 1/4 像素细化。这种"先粗后精"的策略避免了 80% 以上的方向做完整 RDO 计算，速度提升显著而对绝大多数内容的方向选择准确率几乎无影响。对渐变丰富的内容（天空从蓝到白的平滑过渡、水下光线衰减、柔光人像背景），少量方向落入粗选筛网之外可能导致极微弱的色阶带状伪影——建议对这类素材以 fast-intra=0 覆盖预设设定。与 limit-modes 不同，fast-intra 专攻帧内方向搜索，两者关闭时叠加的成本很高。',
    commandExample: '-x265-params fast-intra=1',
    effects: { quality: 1, fileSize: 1, speed: 4, compatibility: 1 },
    warnings: ['与 limit-modes=0 叠加关闭时，帧内 CU 的编码时间可能增加 2-3 倍，仅在纯粹的画质基准测试或学术对比中有意义。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  'expl.libx265.bIntra': {
    id: 'expl.libx265.bIntra',
    title: 'x265 B 帧帧内块许可 (b-intra)',
    short: '是否允许 B 帧内部使用帧内编码块（而非强制所有块使用帧间预测）。值为 1（默认）时 B 帧可混合帧内块来处理"无良好时间参考"的区域；值为 0 时 B 帧完全禁止帧内块，略微加速但可能在遮挡显露或场景切换处产生块状伪影。',
    detail: 'B 帧的优势在于双向预测——它可同时参考前后帧，比 P 帧有更高概率找到准确的运动匹配。但当画面中出现"之前被遮挡、现在才显露"的背景区域（如行人走过后的墙面），或场景切换后的前几个 B 帧，帧间预测找不到好的参考——前后帧里都没有对应的像素。此时若强制只用帧间编码，编码器只能"硬凑"一个不准确的运动矢量加大量残差，效果差且码率高。b-intra=1（默认）允许编码器在这些区域灵活地插入帧内块——用当前帧自身的像素信息编码，不依赖不存在的参考。关闭 b-intra 可省去 B 帧的帧内模式搜索，略微加速编码，但风险较高——仅在源画面运动完全可预测且参考帧质量极好（如屏幕录制、固定机位监控）的严格受控场景才安全。对一般自然视频内容，强烈建议保持默认开启。',
    commandExample: '-x265-params b-intra=1',
    effects: { quality: 2, fileSize: 2, speed: 1, compatibility: 1 },
    warnings: ['关闭 b-intra 后 B 帧质量下降可能在播放时表现为"闪烁"——某些帧的某些块出现瞬间的模糊或不正确纹理，下一帧又恢复，因为后续 P 帧重新建立了正确的参考。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  // === libx265 continued (rate control / output / filtering) ===
  'expl.libx265.vbvMaxrate': {
    id: 'expl.libx265.vbvMaxrate',
    title: 'x265 VBV 最大码率 (vbv-maxrate)',
    short: '以 kbps 设定解码缓冲区允许的最大瞬时输入速率。0=不限制。典型设置是目标码率的 1.5–2 倍。与 vbv-bufsize 配对才能生效。硬件解码和流媒体分发的兼容性强制要求。',
    detail: 'VBV 模拟了一个有限容量的解码器缓冲——如果编码器输出的瞬时码率超过缓冲排空速度，真实解码器就会丢帧。vbv-maxrate 限制了进入缓冲的最大速率。蓝光 1080p 硬性要求 ≤40000kbps。流媒体平台通常在其编码规范中明确要求特定 VBV 值。过于严格的限制会压缩 I 帧质量（I 帧通常需要瞬时高码率）；过于宽松则失去兼容性保护作用。',
    commandExample: '-x265-params vbv-maxrate=10000',
    effects: { quality: 3, fileSize: 3, speed: 0, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },
  'expl.libx265.vbvBufsize': {
    id: 'expl.libx265.vbvBufsize',
    title: 'x265 VBV 缓冲区大小 (vbv-bufsize)',
    short: '以 kbps 设定 VBV 模型的解码缓冲容量。缓冲越大允许越灵活的瞬时码率波动（I 帧可"爆发"更高码率）。通常设为 vbv-maxrate 的 1–2 倍。',
    detail: 'VBV 缓冲就像解码器端的"蓄水池"——maxrate 限制进水量，bufsize 决定池子容量。大缓冲让编码器更灵活分配码率（关键帧可以从缓冲中"借"更多位）；小缓冲强制更均匀的速率。设 bufsize=maxrate 时两者同频——这是 CBR 广播的常见要求。蓝光 1080p 规范：vbv-maxrate=40000, vbv-bufsize=30000。',
    commandExample: '-x265-params vbv-bufsize=15000',
    effects: { quality: 3, fileSize: 2, speed: 0, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },
  'expl.libx265.qpmin': {
    id: 'expl.libx265.qpmin',
    title: 'x265 最小 QP (qpmin)',
    short: '所有帧类型的最低允许 QP 值。防止编码器在极简单场景（黑屏、静止标题）中浪费码率于不可见的"超高质量"。默认 0 不设限；CCR 编码建议 10–15。',
    detail: '极简单的帧（纯黑转场、单色标题卡）如果放任编码器使用极低 QP，会消耗不成比例的码率——这些"完美像素"肉眼看不到，却占用了本可以用于后续复杂场景的宝贵数据位。设 qpmin 为 10–15 可以大幅减少这种浪费。CRF 编码通常可以保持在 0–5。',
    commandExample: '-x265-params qpmin=10',
    effects: { quality: 1, fileSize: 2, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },
  'expl.libx265.qpmax': {
    id: 'expl.libx265.qpmax',
    title: 'x265 最大 QP (qpmax)',
    short: '所有帧类型的最高允许 QP 值。防止极复杂场景画质崩塌为马赛克。69=无上限（默认）。质量敏感编码建议 35–45。',
    detail: '当码率预算严重不足时——高运动、水面、粒子特效等极端复杂场景——编码器可能将 QP 推到 50+，画面出现大面积块状伪影。qpmax 设定硬性上限来阻止这种情况。代价是这些场景的文件会变大（被强制分配更多码率）。这是质量"安全网"而非日常调优工具——如果日常编码中频繁触发 qpmax，说明码率目标需要提高。',
    commandExample: '-x265-params qpmax=40',
    effects: { quality: 4, fileSize: 4, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },
  'expl.libx265.qpstep': {
    id: 'expl.libx265.qpstep',
    title: 'x265 QP 帧间步长限制 (qpstep)',
    short: '相邻帧之间 QP 变化的最大允许幅度。默认 1 确保帧间画质平滑过渡。增加到 2–4 让编码器在场景切换后更快"收敛"到目标质量，但可能在过渡处出现画质"跳跃"。',
    detail: '如果每帧 QP 只能变化 1，场景切换后编码器需要多帧才能调整到新场景的合适 QP——也就是说，切换后的前几帧可能质量不准。qpstep=4 允许四倍的调整速度，代价是可能在帧间产生可感知的质量波动。对反应速度要求高的内容（MV、动作片预告片）略有裨益。',
    commandExample: '-x265-params qpstep=1',
    effects: { quality: 2, fileSize: 1, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },
  'expl.libx265.hrd': {
    id: 'expl.libx265.hrd',
    title: 'x265 HRD 一致性输出 (hrd)',
    short: '在码流 SEI 中写入缓冲周期和图像定时信息以支持 HRD 合规性验证。需配合 vbv-maxrate 和 vbv-bufsize 使用。蓝光、广播和流媒体平台分发的常见硬性要求。',
    detail: 'HRD（Hypothetical Reference Decoder）是编码标准的附录规范，描述了一个理想化的解码器模型。开启 hrd 后编码器模拟 VBV 并在码流中写入验证数据，允许外部工具检查码流是否符合 HRD 假设。对本地文件编码完全不需要；对任何需提交给第三方平台的内容，通常必须开启。',
    commandExample: '-x265-params hrd=1',
    effects: { quality: 0, fileSize: 1, speed: 1, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },
  'expl.libx265.hrdConcat': {
    id: 'expl.libx265.hrdConcat',
    title: 'x265 HRD 拼接模式 (hrd-concat)',
    short: '用于分段编码后拼接的码流。确保每段的 HRD 初始缓冲状态与上一段的结束状态连贯，拼接后整体码流仍满足 HRD 合规。',
    detail: '广告插入和分段 HLS/DASH 编码中，视频被切为多个独立编码的段再拼接。如果第二段假设的初始缓冲状态与第一段结尾的实际状态不一致，拼接点可能出现 HRD 错误。hrd-concat 模式让后续段不重新初始化缓冲，而是假设缓冲已由前段填充。',
    commandExample: '-x265-params hrd-concat=1',
    effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },
  'expl.libx265.noInfo': {
    id: 'expl.libx265.noInfo',
    title: 'x265 去除编码器信息 (no-info)',
    short: '开启后不在 SEI 中写入 x265 版本号和编译选项等元数据。安全用途——避免公开分发的文件中泄露编码工具链信息。',
    detail: '默认 x265 在每个关键帧写入"编码器=x265 v3.5+...编译参数..."等详细信息。这些信息本身无害，但对安全敏感的分发（商业发行、内部机密资料）可能暴露编码环境和工具链版本。开启 no-info 后仅抑制这些非必要 SEI，不影响画质和兼容性。',
    commandExample: '-x265-params no-info=1',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },
  'expl.libx265.hash': {
    id: 'expl.libx265.hash',
    title: 'x265 解码校验哈希 (hash)',
    short: '在每帧编码数据中嵌入该帧解码图像的校验哈希。0=关闭，1=MD5，2=CRC32。用于验证编码-解码全链路是否逐帧一致（bit-exact）。主要用于编码器和驱动开发测试。',
    detail: '开启后编码器对每帧重建图像计算校验和并嵌入 SEI。解码端可独立计算并以 SEI 对比确认是否输出完全一致——任何不匹配意味着编码或解码中存在 bug。每帧仅额外消耗约 16–32 字节。最终用户通常不需要。',
    commandExample: '-x265-params hash=1',
    effects: { quality: 0, fileSize: 1, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },
  'expl.libx265.repeatHeaders': {
    id: 'expl.libx265.repeatHeaders',
    title: 'x265 重复序列头 (repeat-headers)',
    short: '在每个关键帧前重复插入 SPS/PPS/VPS，使码流支持从中间加入解码。流媒体随机访问和分段编码的必备特性。',
    detail: '解码器需要序列参数集（SPS/PPS）才能初始化——默认这些只在码流开头出现一次。repeat-headers 将它们随每个关键帧重复，使播放器从任意位置加入流后都能立即获得初始化解码所需的全部元数据。这对 HLS/DASH 分段、随机拖动进度条、以及视频拼接都是必需的。开启后文件仅增加极小体积（每次 GOP 多几百字节）。',
    commandExample: '-x265-params repeat-headers=1',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },
  'expl.libx265.deblock': {
    id: 'expl.libx265.deblock',
    title: 'x265 去块滤波参数 (deblock)',
    short: '以 "alpha:beta" 格式控制 HEVC 环路去块滤波器强度。alpha 控制边界滤波力度，beta 控制边界检测阈值。负值更锐利但可能显现块状伪影，正值更平滑但丢失微纹理。',
    detail: '环路去块滤波在解码循环中运行，掩盖 DCT 块边界的不连续性。alpha 决定滤波的强度基数——高 alpha 过滤更多边界。beta 决定什么程度的像素差被视为"需要去块的边界边缘"。动画和 CG 常设 -1:-1 到 -3:-3（更锐利的线条）；低码率编码可反向设 1:1。如果你觉得编码后"有点软"而源是锐利的，试验 -1:-1。极度负值（<-3）会产生严重块状条纹，仅调试用。',
    commandExample: '-x265-params deblock=-1:-1',
    effects: { quality: 4, fileSize: 2, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },
  'expl.libx265.noDeblock': {
    id: 'expl.libx265.noDeblock',
    title: 'x265 关闭去块滤波 (no-deblock)',
    short: '完全禁用环路去块滤波器。产生最锐利但可能布满块状伪影的画面。仅用于编码画质基准测试或后期流程中由外部工具统一去块的场景。',
    detail: '与 deblock=-6:-6（减弱而非关闭）不同，no-deblock=1 彻底移除去块。对常规分发编码永远不应使用——输出不符合任何主流分发规范的外观标准。只适用于：① 编码器对比测试（排除去块差异干扰）② 后期制作中由专业去块/恢复滤镜统一后处理的中间文件。',
    commandExample: '-x265-params no-deblock=1',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 1 },
    warnings: ['关闭去块后输出码流外观极差，不符合任何分发标准，仅适合内部处理。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libx265.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c' }],
  },

  // ============================================================
  // GENERIC CODEC OPTIONS
  // ============================================================
  'expl.generic.gopSize': {
    id: 'expl.generic.gopSize',
    title: 'GOP 大小 / 关键帧间隔 (-g)',
    short: '以帧数为单位控制两个关键帧（I 帧）之间的最大距离。小的 GOP 改善快进和随机搜索，但关键帧比 P/B 帧大得多所以文件体积增加。24fps 下 -g 240 = 约 10 秒间隔。',
    detail: '关键帧是完整的独立编码帧，不依赖其他帧即可解码——因此它们是随机搜索的"锚点"。GOP 大小定义了两个锚点之间的最大帧数。小 GOP（30–60 帧）适合需要频繁快进定位的内容；中 GOP（120–300 帧）是通用分发推荐；大 GOP（600 帧以上）用于流媒体 VOD 追求极致压缩。场景切换检测会在检测到切镜时自动插入新的关键帧，所以实际 GOP 通常小于此上限。',
    commandExample: '-g 240',
    effects: { quality: 1, fileSize: 4, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.generic.bFrames': {
    id: 'expl.generic.bFrames',
    title: '最大 B 帧数 (-bf)',
    short: '限制 I/P 帧之间连续 B 帧的最大数量。B 帧使用双向预测，比 P 帧压缩效率高约 30%。但更多的连续 B 帧增加编码计算量和解码参考链深度。',
    detail: 'B 帧可参考前后两个方向的帧做运动补偿——这是它比仅前向参考的 P 帧压缩效率更高的原因。在静态访谈、新闻播报等内容中，大量 B 帧（8–16）带来显著的比特节省。但过多 B 帧也意味着解码器需要更大的 DPB 缓冲区来存储参考帧。配合 B 帧自适应策略（b-adapt）才能真正优化分配——仅设高上限不一定增加实际 B 帧使用量。',
    commandExample: '-bf 3',
    effects: { quality: 1, fileSize: 3, speed: 2, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.generic.keyintMin': {
    id: 'expl.generic.keyintMin',
    title: '最小关键帧间隔 (-keyint_min)',
    short: '强制关键帧之间的最小帧数间隔。防止场景检测在闪光灯、爆炸等短暂亮度突变时"误触发"密集的关键帧爆发。通常设为 GOP 大小的 1/5–1/10。',
    detail: '舞台灯光频闪、相机闪光、爆炸特效——这些场景的帧间差异极大，编码器可能连续多帧都判定为"场景切换"，导致关键帧链式爆发。这在码率受限时会严重拖累后续数秒的画质。keyint_min 创建了保护窗口——无论帧间差异多大，上一关键帧之后的 N 帧内不插入新关键帧。GOP=250 时建议 keyint_min=25。',
    commandExample: '-keyint_min 25',
    effects: { quality: 0, fileSize: 2, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.generic.qmin': {
    id: 'expl.generic.qmin',
    title: '最小量化值 (-qmin)',
    short: '所有帧类型的量化下限。防止编码器在黑屏、静止单色画面等"极易编码"帧上浪费过多码率追求不可见的完美。0 不设限；恒定码率编码推荐 10–20。',
    detail: '纯黑帧或静止标题中——如果用极低的 QP 编码可达到"数学完美"，但这些码率消耗在肉眼看来毫无意义。qmin 设定了下限。动画和 CG（多平坦着色区）特别容易在平坦区浪费码率，建议 1–5。CRF 编码通常设 0–5 即可。',
    commandExample: '-qmin 3',
    effects: { quality: 1, fileSize: 3, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.generic.qmax': {
    id: 'expl.generic.qmax',
    title: '最大量化值 (-qmax)',
    short: '所有帧类型的量化上限。在码率预算不足时防止极复杂场景的画质崩塌为马赛克。69=无上限。质量敏感编码建议 35–45。',
    detail: '高运动、密集纹理、水面反射、粒子特效——这些极复杂场景在被分配不足码率时，编码器可能将 QP 推到极高水平，产生大面积块状伪影。qmax 是"画质安全网"——设 45 意味着"即使码率不够也不能把 QP 推过 45"。这会强制文件在这些复杂场景中变大，但保证了基本可观的画质。如果日常编码中频繁触发 qmax 上限，说明你需要提高码率目标。',
    commandExample: '-qmax 45',
    effects: { quality: 4, fileSize: 4, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.generic.qcomp': {
    id: 'expl.generic.qcomp',
    title: '量化曲线压缩系数 (-qcomp)',
    short: '控制帧级码率分配的时间策略。0.0=恒定码率（每帧获得相似字节数），1.0=恒定 QP（每帧获得相似量化精度）。默认约 0.6 在码率波动性和质量一致性之间取得平衡。',
    detail: 'qcomp 是理解现代视频编码码率控制的核心参数。接近 0 时，无论场景复杂度如何变化每帧都在相似的码率预算内——复杂场景画质显著下降。接近 1 时，复杂场景获得额外码率来维持与简单场景接近的 QP 水平——但这导致文件大小不可预测。CRF 编码中 qcomp 特别重要：高 qcomp（0.7–0.8）让 CRF 更"真实"但文件更大；低 qcomp（0.5）更接近 ABR 行为但帧间质量波动更大。',
    commandExample: '-qcomp 0.6',
    effects: { quality: 4, fileSize: 4, speed: 0, compatibility: 1 },
    warnings: ['改变 qcomp 即使 CRF 值不变也会显著改变文件大小——从 0.6 升到 0.8 可能增加 15–25%。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.generic.refs': {
    id: 'expl.generic.refs',
    title: '参考帧数 (-refs)',
    short: '运动估计可搜索的前向参考帧数量。每增加一帧就多一个找到最佳运动匹配的机会。压缩效率在第 5–6 帧后边际增益急剧递减，但编码时间持续线性增长。默认 3–5。',
    detail: '多个参考帧对运动复杂、有多个重叠运动物体的场景最有益——不同物体可以在不同的参考帧中找到各自最优匹配。但第 5 帧以后的额外参考帧通常只贡献 <0.5% 压缩提升，而编码时间线性增加。对静态访谈、新闻等内容 refs=2 已足够。对体育和动作片可受益于 refs=5–6。也影响解码端 DPB 内存分配。',
    commandExample: '-refs 4',
    effects: { quality: 2, fileSize: 2, speed: 4, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.generic.level': {
    id: 'expl.generic.level',
    title: '编码级别 (-level)',
    short: '声明输出码流遵循的 H.264/H.265 级别（Level），约束最大分辨率、码率和参考帧数。关键用途是保证目标播放设备的硬件解码兼容性。不设置时编码器自行推断。',
    detail: '级别定义了播放设备必须支持的一组硬性上限。例如 H.264 Level 4.1 = 1080p@30fps、最大码率 50Mbps——这是蓝光和大多数电视的标准。Level 5.1 = 4K@30fps。为移动设备编码需遵守更低级别（Level 3.1 = 720p）。不设置时编码器根据实际参数自动推断——通常是对的——但广播和物理介质交付通常要求显式声明以通过合规审核。',
    commandExample: '-level 4.1',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 5 },
    warnings: ['超出目标设备硬件支持的 Level 会导致解码失败或黑屏。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.generic.rcLookahead': {
    id: 'expl.generic.rcLookahead',
    title: '码控前瞻帧数 (-rc-lookahead)',
    short: '编码器在决定当前帧 QP 之前"预看"未来帧的数量。值越大码率在场景变化处的分配越平滑，但编码延迟和内存相应增加。40–60 帧是质量编码推荐范围。',
    detail: '如果不知道后面的场景更复杂还是更简单，就无法为当前帧做出最优码率分配——这是码率限制的根本困境。rc-lookahead 让编码器提前分析未来 N 帧的复杂度，在简单场景中"储蓄"位留给即将到来的复杂段。对序列中有规律淡入淡出或场景过渡的内容改善显著。但 rc-lookahead 也是编码延迟的首要来源——设 250 时编码器需缓存 10 秒（24fps）视频才能开始输出。直播和低延迟场景必须设 0。',
    commandExample: '-rc-lookahead 40',
    effects: { quality: 3, fileSize: 2, speed: 3, compatibility: 1 },
    warnings: ['提升 rc-lookahead 同时增大了 mbtree/CU-tree 的有效分析窗口，两者联动发挥作用。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },
  'expl.generic.scThreshold': {
    id: 'expl.generic.scThreshold',
    title: '场景切换检测阈值 (-sc_threshold)',
    short: '控制帧间差异触发场景切换关键帧的敏感度。值越小越敏感，越容易在画面突变处插入 I 帧。0=完全关闭场景检测（所有关键帧仅由 GOP 大小决定）。默认约 40。',
    detail: '基于相邻帧的亮度变化百分比来判定切换。动画和 CG 因画面纯净切镜时的帧差比实拍更明显——调高到 50–60 可减少误检。手持摄像和运动激烈的内容可能需要降低到 20–30。关闭（0）用于需要固定 GOP 结构的广播和流媒体协议——此时所有关键帧位置完全由 -g 决定。',
    commandExample: '-sc_threshold 40',
    effects: { quality: 3, fileSize: 3, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/options_table.h', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/options_table.h' }],
  },

  // ============================================================
  // SVT-AV1 remaining params (film-grain already in index.ts)
  // ============================================================
  'expl.libsvtav1.tune': {
    id: 'expl.libsvtav1.tune',
    title: 'SVT-AV1 视觉调优模式 (tune)',
    short: '选择编码器优化目标。0=主观视觉质量（VQ）优先，画面更锐利、心理视觉保真度更高；1=PSNR 客观指标优先。社区推荐 VQ（0）用于主观观感。',
    detail: 'tune=0（VQ）让 SVT-AV1 在心理视觉层面优化——偏向保留人眼敏感的纹理、边缘和锐度，即使这在 PSNR 指标上不是最优。tune=1（PSNR）追求客观保真度的数学最优，画面可能更"准确"但显得枯燥模糊。这与 x264/x265 的 -tune film/animation 不同——SVT-AV1 的 tune 只是 VQ vs PSNR 的二元选择，不涉及内容类型。SVT-AV1-PSY fork 额外支持 tune=2（SSIM）和 tune=3（SSIM+VQ 混合）。',
    commandExample: '-svtav1-params tune=0',
    effects: { quality: 4, fileSize: 2, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', symbol: 'Tune / --tune', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.keyint': {
    id: 'expl.libsvtav1.keyint',
    title: 'SVT-AV1 关键帧间隔 (keyint)',
    short: 'SVT-AV1 内部 GOP 长度，直接传入编码器库而非通过 FFmpeg 的 -g。支持秒后缀（如 10s = 10 秒间隔）。与通用 -g 独立——该项直接控制 SVT-AV1 的关键帧决策逻辑。',
    detail: 'SVT-AV1 有自己的内部 GOP 管理，与 FFmpeg 的 -g 互不干扰。设置 keyint=10s 意味着编码器每 10 秒自动插入一个关键帧，不受帧率影响。对 AV1 而言，keyint 还与层级结构（hierarchical levels）有关——推荐值为 2^levels × N + 1，如 keyint=63（三层层级+8 的 mini-GOP）或 keyint=127。流媒体 VOD 推荐 5–10 秒；本地归档可更大。注意 keyint 与 irefresh-type 联动——CRA 开放 GOP 下 keyint 需要为层级结构的倍数。',
    commandExample: '-svtav1-params keyint=10s',
    effects: { quality: 1, fileSize: 3, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', symbol: 'IntraPeriodLength / --keyint', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.irefreshType': {
    id: 'expl.libsvtav1.irefreshType',
    title: 'SVT-AV1 帧内刷新类型 (irefresh-type)',
    short: '1=CRA 开放 GOP（推荐）——后续帧可参考前一个 GOP 的帧，压缩效率更高；2=IDR 封闭 GOP——GOP 完全独立，方便剪切和流媒体分段。',
    detail: 'CRA（Clean Random Access）是 AV1 中类似 HEVC 开放 GOP 的机制——GOP 边界可以被跨越参考，压缩效率优于封闭 GOP。IDR（Instantaneous Decoder Refresh）类似 H.264 的 IDR 帧——关键帧后的所有帧完全不能参考前一 GOP 的任何数据。封闭 GOP 适合精确帧剪辑和需要独立分段的分发场景（HLS/DASH）。',
    commandExample: '-svtav1-params irefresh-type=1',
    effects: { quality: 1, fileSize: 2, speed: 0, compatibility: 3 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', symbol: 'IntraRefreshType / --irefresh-type', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.lookahead': {
    id: 'expl.libsvtav1.lookahead',
    title: 'SVT-AV1 前瞻距离 (lookahead)',
    short: '编码器在决策当前帧的码率与模式之前预先分析的帧数。-1 为自动（由 preset 决定）。增大可改善场景过渡处的码率分配平滑度，但增加延迟和内存。',
    detail: '与通用 rc-lookahead 类似但作用于 SVT-AV1 内部。更大的 lookahead 让编码器有更长的时间窗口来检测即将到来的复杂场景并提前调整。对 VBR 和 CRF 编码有助益。直播/低延迟场景应保持小值或 -1。SVT-AV1 v2.x+ 中 preset 会自行管理此值，手动设置仅用于微调。',
    commandExample: '-svtav1-params lookahead=40',
    effects: { quality: 3, fileSize: 2, speed: 3, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', symbol: 'LookaheadDistance / --lookahead', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.lp': {
    id: 'expl.libsvtav1.lp',
    title: 'SVT-AV1 逻辑处理器数 (lp)',
    short: '告知编码器目标 CPU 逻辑核心数以优化内部线程池和缓冲区分配。0 为自动检测。不影响线程亲和性。设置为核心数的 50–80% 可在保留系统响应的同时充分利用多核。',
    detail: 'SVT-AV1 根据此值决定内部并行等级（1–6 级），从而影响段数量、波前并行处理单元和缓冲大小分配。lp=0 让编码器查询系统 CPU 数并自动选择。手动设置主要用于：① 在共享服务器上限制编码器 CPU 占用；② 解决自动检测在某些虚拟化环境中的错误。此值不设置线程 CPU 亲和性——如需绑定特定核心，使用 OS 级 taskset/numactl。',
    commandExample: '-svtav1-params lp=4',
    effects: { quality: 0, fileSize: 0, speed: 4, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', symbol: 'LogicalProcessors / --lp', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.sharpness': {
    id: 'expl.libsvtav1.sharpness',
    title: 'SVT-AV1 锐度偏向 (sharpness)',
    short: '控制在去块滤波和 R/D 模式决策中偏向锐利还是柔和的方向。-7 最柔和，7 最锐利，0 中立。正值为画面增加主观锐度，但过高可能产生振铃和颗粒伪影。',
    detail: 'sharpness 通过两条路径影响画面：① 调整去块滤波的强度偏向——正值减少滤波使边缘更锐利，负值增加滤波使画面更柔和；② 在编码模式决策中偏向保留更多高频细节（纹理）的方向。对动画和 CG，正值（1–3）能让线条更有力；对噪点多的实拍内容，负值（-2 到 0）可减轻噪点被锐化后产生的"沙砾感"。SVT-AV1-Essential 社区版默认 sharpness=1。',
    commandExample: '-svtav1-params sharpness=1',
    effects: { quality: 3, fileSize: 2, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', symbol: 'Sharpness / --sharpness', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.enableVarianceBoost': {
    id: 'expl.libsvtav1.enableVarianceBoost',
    title: 'SVT-AV1 方差增强 (enable-variance-boost)',
    short: '增强低对比度平坦区域的编码精度，以极小的性能代价改善色阶过渡和暗部细节。VQ（tune=0）模式下推荐开启。',
    detail: '方差增强是 SVT-AV1 v2.0 后引入的心理视觉特性，专门针对人眼对低对比度区域极度敏感的生理特性——平坦天空的色阶断层或暗部的块状伪影即使极轻微也容易被察觉。它在这些区域的量化决策中增加额外的精度保护。性能开销极小（<3%）。配合 variance-boost-strength 和 variance-octile 可精细调整作用范围和强度。',
    commandExample: '-svtav1-params enable-variance-boost=1',
    effects: { quality: 3, fileSize: 1, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', symbol: 'VarianceBoost / --enable-variance-boost', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.varianceBoostStrength': {
    id: 'expl.libsvtav1.varianceBoostStrength',
    title: 'SVT-AV1 方差增强强度 (variance-boost-strength)',
    short: '控制方差增强的介入力度。1=轻度，4=激进。仅在 enable-variance-boost=1 时生效。对"干净"的数字内容可大胆用 3–4；对已带噪点的源保持 1–2。',
    detail: '强度越高，对低对比度区域施加的 QP 降低越多——这些区域获得更多码率，色阶过渡更平滑。但过高强度可能在原本平坦的区域引入细碎纹理（类似过强的 AQ 效果）。对数字动画、CG 和干净实拍，高强度效果优秀；对胶片扫描或高 ISO 暗光素材（本身带有噪点），低强度可避免噪点被当作"需要保留的纹理"。',
    commandExample: '-svtav1-params enable-variance-boost=1:variance-boost-strength=2',
    effects: { quality: 3, fileSize: 2, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.varianceOctile': {
    id: 'expl.libsvtav1.varianceOctile',
    title: 'SVT-AV1 方差八分位阈值 (variance-octile)',
    short: '设定 8×8 块方差统计中选取哪个八分位作为方差增强的触发阈值。1=最敏感（检测更多低对比度区域），8=最保守。默认 6 在有效性和精度的平衡点。',
    detail: '方差增强需要先识别哪些 8×8 块属于"低对比度"——variance-octile 通过排序所有块的方差值并选取第 N 个八分位作为阈值。较低的值意味着更多的块被判定为需要增强（可能包括一些本不需要增强的）。对色阶过渡问题严重的内容，降到 3–4；对总体画面质量已很好的源，保持 6–8 以避免不必要的码率增长。',
    commandExample: '-svtav1-params variance-octile=6',
    effects: { quality: 2, fileSize: 2, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.aqMode': {
    id: 'expl.libsvtav1.aqMode',
    title: 'SVT-AV1 自适应量化模式 (aq-mode)',
    short: '0=关闭，1=方差基准，2=DeltaQ 预测效率（默认推荐）。AQ 在平坦和复杂区域之间重新分配码率以改善主观画质。',
    detail: 'SVT-AV1 的 AQ 模式 2 使用了一种基于预测残差的启发式——DeltaQ——来动态调节每个超块的 QP 偏移。与传统的方差 AQ（模式 1）相比，DeltaQ 更好地预测了人眼对不同区域的敏感度，在保留纹理细节的同时减少平坦区域的色阶。模式 2 是 SVT-AV1 推荐默认。关闭 AQ 会使所有区域使用相同 QP——数学上更"公平"但主观上平坦区域容易出现梯度色带。',
    commandExample: '-svtav1-params aq-mode=2',
    effects: { quality: 4, fileSize: 3, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.qpScaleCompressStrength': {
    id: 'expl.libsvtav1.qpScaleCompressStrength',
    title: 'SVT-AV1 QP 曲线压缩强度 (qp-scale-compress-strength)',
    short: '控制 mini-GOP 内各层级帧之间的 QP 差异幅度。0=关闭（各层级相同 QP），3=默认值，8=最大差异。低值使帧间画质更均匀，高值在层级结构上分配更极端的 QP 差异以提升整体压缩。',
    detail: 'SVT-AV1 的层级 GOP 结构中，不同层级（temporal layer）的帧通常对画质的影响不同——低层级帧被更多高层帧参考，因此需要更高质量。qp-scale-compress-strength 控制这种层级间 QP 差异的"陡峭程度"。较低值（1–2）画质帧间更一致，适合质量优先编码；较高值（4–6）在层级帧上更积极地节省码率，适合体积优先。',
    commandExample: '-svtav1-params qp-scale-compress-strength=3',
    effects: { quality: 3, fileSize: 3, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.luminanceQpBias': {
    id: 'expl.libsvtav1.luminanceQpBias',
    title: 'SVT-AV1 亮度 QP 偏向 (luminance-qp-bias)',
    short: '根据每帧平均亮度水平调整 QP 偏移。值越低对暗景的保护越强（降低暗帧 QP），值为 50 时无偏向。0–100，适用于暗调电影和恐怖片等大量暗景的内容。',
    detail: '人眼在暗环境中对噪点和色阶的感知更敏感——这就是为什么暗场景的编码伪影特别令人烦恼。luminance-qp-bias 检测每帧的平均亮度并施加补偿：低值（10–30）对暗帧给更多码率；高值（70–90）对亮帧给更多码率。默认 50 表示不施加偏向。对暗调恐怖片和夜景多的电影，设 10–25 可显著改善暗景质量，代价是亮景画质略微下降。',
    commandExample: '-svtav1-params luminance-qp-bias=20',
    effects: { quality: 3, fileSize: 2, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.enableTf': {
    id: 'expl.libsvtav1.enableTf',
    title: 'SVT-AV1 时域滤波 (enable-tf)',
    short: '启用编码器内置的时域滤波——利用邻近多帧信息生成更干净的替代参考帧（ALT-REF），有效去除随机噪点并提升压缩效率。对高噪点源（胶片、暗光）效果显著。',
    detail: '时域滤波（temporal filtering）在编码前预处理 ALT-REF 帧——结合多帧信息来降低随机噪点同时保留真正的内容边缘和纹理。这为编码器提供了更"干净"的参考，使运动补偿更高效、码率分配更集中于真实信号而非噪声。对噪点多的源（胶片扫描、高 ISO 拍摄），这是最重要的压缩效率特性之一。但对已很"干净"的数字源（CG/动画），开启增益有限且可能略微软化画面。开启后强烈建议降低 tf-strength 到 1–2（默认 3 可能过强）。',
    commandExample: '-svtav1-params enable-tf=1:tf-strength=1',
    effects: { quality: 3, fileSize: 4, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.tfStrength': {
    id: 'expl.libsvtav1.tfStrength',
    title: 'SVT-AV1 时域滤波强度 (tf-strength)',
    short: '控制时域滤波的去噪强度。0=关闭，4=最强。默认 3 在旧版中被认为过强，可能模糊细节并在关键帧处产生阻塞状伪影。社区普遍推荐 1–2。',
    detail: '旧版 SVT-AV1 的默认 tf-strength=3 因过于激进被社区广泛诟病——关键帧的 ALT-REF 被过度降噪后产生明显的"塑料感"和阻塞伪影。新版已改善但保守依旧明智。对干净的数字源（CG/动画）推荐 0–1（甚至关闭 enable-tf）；对带噪点的实拍源推荐 1–2；对噪点极重的源（胶片/暗光手持）可考虑 3。时域滤波强度与 Film Grain Synthesis 存在交互——高 tf 会削弱源噪声，从而降低 Film Grain 分析的准确性。',
    commandExample: '-svtav1-params enable-tf=1:tf-strength=1',
    effects: { quality: 3, fileSize: 3, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.enableQm': {
    id: 'expl.libsvtav1.enableQm',
    title: 'SVT-AV1 量化矩阵 (enable-qm)',
    short: '启用 AV1 量化矩阵——根据频率系数位置使用不同的量化精度以优化主观画质。搭配低 qm-min（0–4）通常能改善压缩效率。',
    detail: '量化矩阵让编码器在低频（承载主要视觉信息）使用更精确的量化而在高频（纹理和噪声）节省精度。AV1 的 QM 系统支持根据帧的 qindex 在最小和最大 QM 之间线性插值。开启 QM 并非在所有内容上都有净收益——对动画和高锐度内容，QM 可能模糊高频"线条感"；对自然实拍，QM 配合低 qm-min 通常提供净增益。最有效的是让 qm-min=0–4（默认 8 太大）来充分释放 QM 潜力。',
    commandExample: '-svtav1-params enable-qm=1:qm-min=2',
    effects: { quality: 3, fileSize: 2, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.qmMin': {
    id: 'expl.libsvtav1.qmMin',
    title: 'SVT-AV1 量化矩阵最小值 (qm-min)',
    short: 'QM 系统中最低质量帧使用的 QM 索引。0 为最平坦的 QM（低频得到最多的额外精度），15 为最陡峭。仅 enable-qm=1 时生效。默认 8 对大多数场景过于保守。',
    detail: 'qm-min 控制了在最高质量帧（低 qindex）上 QM 的"激进程度"。值 0 意味着在高质量帧上低频系数获得显著的额外精度保护——这对透明编码（接近无损）最有价值。值 8 意味着即使高质量帧上 QM 也是温和的。社区推荐 0–4 来充分释放 QM 的频率选择性优势，尤其在 CRF 中低范围内。',
    commandExample: '-svtav1-params enable-qm=1:qm-min=2',
    effects: { quality: 3, fileSize: 2, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.enableOverlays': {
    id: 'expl.libsvtav1.enableOverlays',
    title: 'SVT-AV1 覆盖层增强 (enable-overlays)',
    short: '启用覆盖层编码技术以改善关键帧质量——关键帧被拆分为多层次编码，各层使用不同的编码策略。推荐保持开启（默认）。',
    detail: '覆盖层（overlays）是一种关键帧增强技术——关键帧被分为基础层和增强层分别编码，让复杂纹理区域和简单区域各自使用最优编码模式。这对静态标题卡、图文混合内容的关键帧改善最为明显。早期版本（v0.9）曾有闪烁 bug，但新版已修复。通常不需要手动管理。',
    commandExample: '-svtav1-params enable-overlays=1',
    effects: { quality: 2, fileSize: 1, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.scd': {
    id: 'expl.libsvtav1.scd',
    title: 'SVT-AV1 场景切换检测 (scd)',
    short: '自动检测画面突变（切镜、转场）并插入关键帧。几乎对任何内容都有益——除非你有特殊理由（如严格固定 GOP 结构），否则保持开启。',
    detail: 'SVT-AV1 的場景检测基于帧间直方图差异分析，比通用的 -sc_threshold 更适应 AV1 的编码特性。当检测到超过阈值的场景变化时，编码器插入一个新的关键帧（或 CRA 帧）——避免了将不相关的画面跨场景参考，这在编码效率上至关重要。关闭后所有 GOP 边界按 keyint 参数固定位置。',
    commandExample: '-svtav1-params scd=1',
    effects: { quality: 3, fileSize: 3, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.enableDlf': {
    id: 'expl.libsvtav1.enableDlf',
    title: 'SVT-AV1 去块滤波模式 (enable-dlf)',
    short: '0=关闭去块滤波，1=全部帧开启（默认），2=仅在非关键帧开启。AV1 的去块滤波对编码伪影抑制很重要——只有在极端锐度优先和后期处理接管时才考虑关闭。',
    detail: 'AV1 的环路去块滤波（CDEF + Loop Restoration）是其编码工具链的核心部分。关闭去块（0）极端锐利但充满伪影——仅适合编码器开发调试或后期流程中由外部专业工具统一去块处理。模式 2 给关键帧保留最锐利的原貌（因为关键帧通常已获得足够码率），但对非关键帧施加去块以减少传播性伪影。',
    commandExample: '-svtav1-params enable-dlf=1',
    effects: { quality: 4, fileSize: 1, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },
  'expl.libsvtav1.acBias': {
    id: 'expl.libsvtav1.acBias',
    title: 'SVT-AV1 AC 偏向 [PSY] (ac-bias)',
    short: '心理视觉增强特性（SVT-AV1-PSY / v4.0+）：增强 AC 变换系数的保留倾向，改善纹理细节和胶片颗粒在编码后的保真度。对实拍内容可提升"胶片质感"。',
    detail: 'AC-bias 是 SVT-AV1 v4.0 从 PSY fork 合并的心理视觉特性。它在量化阶段对 AC（交流/高频）系数施加额外的保留偏向——这些系数承载了纹理、颗粒和边缘信息。传统的率失真优化可能在数学上正确地"舍去"这些系数以节省码率，但人眼非常敏感于这些系数的丢失（表现为画面变软、颗粒消失）。AC-bias 调整了这个偏向，建议在 tune=0（VQ）时搭配使用以增强主观质感。对动画和 CG（缺少自然颗粒的干净画面），开启可能引入不自然的噪点。',
    commandExample: '-svtav1-params ac-bias=1',
    effects: { quality: 3, fileSize: 2, speed: 1, compatibility: 1 },
    warnings: ['需要 SVT-AV1 v4.0+ 或 PSY fork。旧版本不支持此参数，传递后会被忽略。'],
    sourceRefs: [{ repository: 'AOMediaCodec/SVT-AV1', branch: 'master', snapshotDate: '2026-07-20', file: 'Docs/Parameters.md', sourceType: 'encoder-official', url: 'https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md' }],
  },

  // ============================================================
  // NVENC (shared h264_nvenc / hevc_nvenc)
  // ============================================================
  'expl.nvenc.lookaheadLevel': {
    id: 'expl.nvenc.lookaheadLevel',
    title: 'NVENC 前瞻等级 (lookahead_level)',
    short: '控制 NVENC 内部前瞻分析的算法规模和精度。值越高分析越彻底——更优的码率分配和自适应量化决策——但编码延迟和 GPU 资源占用上升。默认 0 是速度优先的最小分析。',
    detail: 'NVIDIA 的前瞻引擎不同于单纯的帧缓冲——它还包含帧内复杂度和运动分析流水线。lookahead_level 决定了这个流水线的深度。低等级（0–5）适合低延迟编码；中等级（6–10）在质量和速度间取得好的平衡；高等级（11–15）榨取最大压缩效率但逼近 GPU 的硬件前瞻资源上限。与 rc-lookahead 联动——rc-lookahead 决定"看多少帧"，lookahead_level 决定"看得多仔细"。',
    commandExample: '-lookahead_level 8',
    effects: { quality: 3, fileSize: 2, speed: 4, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
  },
  'expl.nvenc.bRefMode': {
    id: 'expl.nvenc.bRefMode',
    title: 'NVENC B 帧参考模式 (-b_ref_mode)',
    short: '控制哪些 B 帧可以作为其他帧的参考。each=每帧均可被参考（最佳压缩），middle=仅中间帧可参考，disabled=B 帧不作为任何参考（快但不高效）。',
    detail: 'B 帧作为参考的能力是 H.264/H.265 压缩效率的核心——如果 B 帧可以被后续帧参考，编码器拥有更丰富的参考选择。each 模式最灵活但解码端需要管理较多的参考帧。disabled 退化为传统 B 帧（仅被参考不能被参考），压缩效率最低但解码器最简单。对于分发编码，推荐 each 或 middle。',
    commandExample: '-b_ref_mode each',
    effects: { quality: 2, fileSize: 3, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
  },
  'expl.nvenc.noScenecut': {
    id: 'expl.nvenc.noScenecut',
    title: 'NVENC 关闭场景检测 (-no-scenecut)',
    short: '禁用 NVENC 的硬件场景切换检测。关闭后 GOP 结构严格按 -g 参数运行，无自适应关键帧插入。用于需要固定 GOP 结构或怀疑硬件检测有误检的场景。',
    detail: 'NVIDIA 硬件编码器有内置的场景变化检测电路。通常情况下这很有用——自动在切镜处插入关键帧。但在某些场景（固定 GOP 广播流、特定流媒体协议），你需要完全控制关键帧位置。关闭 scenecut 后所有关键帧位置仅由 GOP 参数决定。同时也会轻微降低 GPU 编码负载（因为少了一个分析通路）。',
    commandExample: '-no-scenecut 1',
    effects: { quality: 1, fileSize: 2, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
  },
  'expl.nvenc.forcedIdr': {
    id: 'expl.nvenc.forcedIdr',
    title: 'NVENC 强制 IDR 关键帧 (-forced-idr)',
    short: '开启后所有关键帧使用 IDR 类型（完全刷新、封闭 GOP）而非更灵活的 CRA 类型。适用于需要严格 GOP 独立性的场景（视频拼接、分发音轨切换）。',
    detail: 'NVENC 默认可能使用非 IDR 的关键帧类型（如 intra-refresh），这些帧允许后续帧跨越 GOP 边界参考。forced-idr 强制每个 -g 指定的关键帧都是完整的 IDR 刷新——解码器状态完全重置，后续帧不能参考前一 GOP。这在流媒体分段和拼接时有保障，但轻微降低压缩效率。',
    commandExample: '-forced-idr 1',
    effects: { quality: 0, fileSize: 2, speed: 0, compatibility: 4 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
  },
  'expl.nvenc.strictGop': {
    id: 'expl.nvenc.strictGop',
    title: 'NVENC 严格 GOP (-strict_gop)',
    short: '强制编码器严格遵守 -g 指定的 GOP 大小，不允许场景检测或其他启发式提前或延后关键帧。广播级固定 GOP 结构的强制要求。',
    detail: '开启后 NVENC 输出精确间隔的关键帧——每 -g 帧一个，不多不少。这对于需要精确 GOP 对齐的应用（广播时间码、TS 流复用计时）至关重要。关闭时硬件场景检测可能在切镜处提前插入关键帧，实际 GOP 因此变短。注意 forced-idr 和 strict_gop 通常配合使用——一个决定"怎样刷新"，一个决定"何时刷新"。',
    commandExample: '-strict_gop 1',
    effects: { quality: 0, fileSize: 2, speed: 0, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
  },
  'expl.nvenc.coder': {
    id: 'expl.nvenc.coder',
    title: 'NVENC 熵编码器 (-coder)',
    short: '选择熵编码模式。auto=硬件自动选择，cabac=算术编码（更高效），cavlc=变长编码（更快但码率更高）。几乎所有场景都应该保持 auto 或 cabac。',
    detail: 'CABAC（上下文自适应二进制算术编码）比 CAVLC 压缩效率高 10–15%，是所有现代 H.264/H.265 分发的标准。NVENC 的 auto 模式会根据 profile 和分辨率自动选择最优编码器——几乎总是 CABAC。手动选择 CAVLC 仅在极低延迟或解码器极端受限的 legacy 场景中有意义。',
    commandExample: '-coder auto',
    effects: { quality: 1, fileSize: 3, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
  },
  'expl.nvenc.twopass': {
    id: 'expl.nvenc.twopass',
    title: 'NVENC 2-pass 编码 (-2pass)',
    short: '启用 NVENC 硬件两遍编码。第一遍分析帧复杂度和运动分布，第二遍利用数据优化码率分配。仅在 VBR/CBR 模式下有效。对质量有明显改善但编码延迟翻倍。',
    detail: 'NVENC 的硬件 2-pass 不同于软件 x264 的两遍编码——它不生成中间统计文件，而是在硬件内部缓冲帧并执行两遍编码流水线。第一遍收集帧内复杂度和运动分析数据，第二遍据此优化 QP 分配。对复杂混合内容（交替静态和高速运动），质量改善在 5–15% BD-Rate。但编码延迟约翻倍，不适合实时应用。',
    commandExample: '-2pass 1',
    effects: { quality: 4, fileSize: 3, speed: 4, compatibility: 1 },
    warnings: ['仅在 VBR 和 CBR 模式下可用；CQ/QP 模式忽略此参数。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
  },
  'expl.nvenc.surfaces': {
    id: 'expl.nvenc.surfaces',
    title: 'NVENC 内部 Surface 数 (-surfaces)',
    short: '编码器内部分配的 GPU 表面（Surface/帧缓冲）数量。默认 32 对大多数场景足够。提高可容纳更深的异步编码流水线但增加 GPU 显存占用。',
    detail: 'NVENC 使用异步流水线——多帧同时在编码的不同阶段。更多的 surface 意味着更深的流水线和更好的 GPU 占用率，在高帧率编码时尤其重要。但每个 surface 消耗 GPU 显存（随分辨率和像素格式而定）。对于 4K 编码，32 surfaces 可能消耗数百 MB 显存。除非遇到"编码延迟增加"或"GPU 利用率不满"的问题，否则不需要调整。',
    commandExample: '-surfaces 32',
    effects: { quality: 0, fileSize: 0, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
  },
  'expl.nvenc.delay': {
    id: 'expl.nvenc.delay',
    title: 'NVENC 编码延迟帧数 (-delay)',
    short: '控制编码器内部允许的最大帧延迟，用于 B 帧重新排序和前瞻。0 最小延迟（适合直播），高值允许更灵活的帧重排和更优的编码效率。',
    detail: 'B 帧的编码顺序与显示顺序不同（因为需要参考未来帧），所以编码器会缓冲帧来重新排序。delay 参数限制了这个缓冲的深度。对直播和视频会议设 0（无 B 帧延迟）；对分发编码让编码器自行决定（默认 INT_MAX 意味着不限制）。严格低延迟场景中此值与 bf 和 rc-lookahead 联动控制。',
    commandExample: '-delay 0',
    effects: { quality: 2, fileSize: 2, speed: 3, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
  },
  'expl.nvenc.initQpP': {
    id: 'expl.nvenc.initQpP',
    title: 'NVENC 初始 P 帧 QP (-init_qpP)',
    short: '编码开始时 P 帧的初始 QP 值。-1 让编码器自行决定。仅影响编码初期的几帧，之后由码率控制接管。在有规律的场景过渡内容中有微小影响。',
    detail: '码率控制在编码最初几帧没有足够历史数据来做出最优 QP 决策，因此使用初始 QP 作为"起跑点"。这个值只在编码开始时产生短暂影响，随后由实际码控接管。对单次编码几乎无关紧要；对分段编码（如广告插入的独立视频段），合理设置初始值能让每段起始的几帧画质更接近预期。',
    commandExample: '-init_qpP 26',
    effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
  },
  'expl.nvenc.initQpB': {
    id: 'expl.nvenc.initQpB',
    title: 'NVENC 初始 B 帧 QP (-init_qpB)',
    short: '编码开始时 B 帧的初始 QP，-1 自动。B 帧因使用双向预测通常 QP 比 P 帧高（略差质量换来高压缩效率）。',
    detail: '与 init_qpP 同理但针对 B 帧。B 帧的量化偏移通常为正（QP 更高 = 质量略低），因为 B 帧被参考得最少——牺牲一点 B 帧质量换取显著码率节省是编码策略的核心。此参数仅在码率控制的初始阶段起作用。',
    commandExample: '-init_qpB 28',
    effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
  },
  'expl.nvenc.initQpI': {
    id: 'expl.nvenc.initQpI',
    title: 'NVENC 初始 I 帧 QP (-init_qpI)',
    short: '编码开始时 I 帧的初始 QP。-1 自动。I 帧作为所有后续帧的参考，通常使用更低的 QP（更高质量）以确保参考质量。',
    detail: 'I 帧质量决定了整个 GOP 的"基准线"——不准确的 I 帧会导致错误传播到所有参考它的 P/B 帧。因此 I 帧 QP 通常显著低于 P 帧（典型 I:P 偏移约 -6 到 -3）。此参数仅影响编码初段——对于长视频几乎无足轻重，但对于短视频片段（<5 秒）的独立编码，合理的初始值影响显著。',
    commandExample: '-init_qpI 21',
    effects: { quality: 2, fileSize: 2, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
  },
  'expl.nvenc.qpCbOffset': {
    id: 'expl.nvenc.qpCbOffset',
    title: 'NVENC Cb 色度 QP 偏移 (-qp_cb_offset)',
    short: '对 Cb（蓝色度）平面的 QP 施加相对亮度的固定偏移。-12 到 12，默认 0。负值给 Cb 平面更多精度，正值节省用于亮度的码率。',
    detail: '人眼对色度变化的分辨能力远低于亮度，因此视频编码几乎总是给色度平面降精度。但降多少是可通过此参数微调的。对蓝色调丰富的画面（海洋、天空夜景），给 Cb 略微负偏移（-1 到 -2）能保留更多蓝色渐变细节。总体上色度偏移的影响比亮度调整小得多。',
    commandExample: '-qp_cb_offset -1',
    effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
  },
  'expl.nvenc.qpCrOffset': {
    id: 'expl.nvenc.qpCrOffset',
    title: 'NVENC Cr 色度 QP 偏移 (-qp_cr_offset)',
    short: '对 Cr（红色度）平面的 QP 偏移。-12 到 12，默认 0。人类肤色主要由 Cr 成分承载——对人物内容给 Cr 负偏移可保留更好的肤色过渡。',
    detail: 'Cr 平面承载了肤色、暖色调和红色的主要信息。人眼对不自然的肤色（过度的色度量化导致的"蜡像感"或色块）非常敏感。对以人物为主的内容（对话、访谈、人脸特写），设 qp_cr_offset=-1 到 -2 可以显著改善肤色的自然过渡，代价是轻微的码率增加。',
    commandExample: '-qp_cr_offset -1',
    effects: { quality: 2, fileSize: 1, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
  },
  'expl.nvenc.weightedPred': {
    id: 'expl.nvenc.weightedPred',
    title: 'NVENC 加权预测 (-weighted_pred)',
    short: '启用或关闭对 P/B 帧的加权预测。开启后编码器可以为参考帧施加权重来匹配淡入淡出、灯光变化等全局亮度变化，改善这类场景下的压缩效率。',
    detail: '在淡入淡出、渐变滤镜、闪烁灯光等改变全局亮度的场景，普通的运动补偿无法匹配画面变化——这时加权预测可以在参考帧上施加一个全局亮度偏移来"拉近"两帧的距离。NVENC 的硬件加权预测支持有限制的权重组合（与软件实现的完整灵活度有差距），但在淡入淡出场景中仍提供实质压缩增益。开启对非淡入淡出场景无影响，但略微增加硬件计算开销。',
    commandExample: '-weighted_pred 1',
    effects: { quality: 2, fileSize: 2, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc.c' }],
  },

  // ============================================================
  // libaom_av1
  // ============================================================
  'expl.libaom.usage': {
    id: 'expl.libaom.usage',
    title: 'libaom 编码模式 (-usage)',
    short: 'good=常规高质量模式（默认推荐），realtime=低延迟实时模式，allintra=全 I 帧模式（仅帧内预测，类似 Motion JPEG）。',
    detail: 'usage 从根本上改变了 libaom 的编码策略。good 模式启用完整的多帧参考、ALT-REF、时域滤波和最大化的压缩工具——这是"正常"编码。realtime 模式大幅简化工具链（关闭前瞻、限制分区搜索、禁用多参考帧）以降低延迟，画质明显下降但满足实时性。allintra 让每一帧都是独立编码的关键帧——适合编辑中间格式和帧精确处理。',
    commandExample: '-usage good',
    effects: { quality: 5, fileSize: 5, speed: 5, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },
  'expl.libaom.tune': {
    id: 'expl.libaom.tune',
    title: 'libaom 调优模式 (-tune)',
    short: '选择编码器优化方向。psnr/ssim 追求相应客观指标最优；vmaf 系列针对 Netflix VMAF 感知模型优化；vq 追求主观视觉质量。',
    detail: '不同 tune 改变 libaom 内部多项参数的默认值——包括 AQ 模式、量化矩阵和时域滤波策略——以偏向所选指标。vmaf_with_preprocessing 额外对源做预处理来提升 VMAF 分数但不一定改善主观观感。对实际分发编码，vq 是社区推荐的通用选择——它平衡了主观观感和各项客观指标。',
    commandExample: '-tune vq',
    effects: { quality: 4, fileSize: 2, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },
  'expl.libaom.tileColumns': {
    id: 'expl.libaom.tileColumns',
    title: 'libaom 水平 Tile 分区 (-tile-columns)',
    short: '将画面在水平方向分为 2^n 个 tile 独立编码。tile 之间无跨 tile 预测，因此可并行编码和解码。值越大并行度越高但压缩效率略微下降。',
    detail: 'Tile 是 AV1 的并行化核心机制——每个 tile 可独立编码和解码。tile-columns=2 意味着 4 列 tile（2^2），与 4 核以上 CPU 配对时编码加速显著。但 tile 边界打断了帧内预测和去块滤波的连续性，压缩效率轻微下降（每增加一个 tile 层级约损失 1–3%）。推荐设为 CPU 核心数的 log2——如 8 核设 3（8 tiles）。',
    commandExample: '-tile-columns 2',
    effects: { quality: 1, fileSize: 2, speed: 4, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },
  'expl.libaom.tileRows': {
    id: 'expl.libaom.tileRows',
    title: 'libaom 垂直 Tile 分区 (-tile-rows)',
    short: '将画面在垂直方向分为 2^n 个 tile。水平和垂直 tile 可组合为网格（如 tile-columns=2 + tile-rows=1 = 8×2 tile 网格）。垂直分区对超宽画幅内容更有益。',
    detail: '对超宽（21:9）或竖屏（9:16）内容，单方向 tile 分区不足以充分利用并行——tile-columns + tile-rows 组合形成 2D 网格能让更多核心参与编码。但每个 tile 维度都增加压缩效率损失，对于标准 16:9 内容通常只设 tile-columns 就够了。',
    commandExample: '-tile-rows 1',
    effects: { quality: 1, fileSize: 2, speed: 3, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },
  'expl.libaom.arnrStrength': {
    id: 'expl.libaom.arnrStrength',
    title: 'libaom Alt-Ref 降噪强度 (-arnr-strength)',
    short: '控制 ALT-REF（替代参考帧）的时域降噪强度。-1=关闭，0–6 递增。在噪点源上降低 ARNR 强度能保留更多纹理细节，但压缩效率下降。',
    detail: 'libaom 生成的 ALT-REF 帧是多个邻近帧融合而成的"超级参考帧"——ARNR 在此过程中对噪声进行抑制以提升参考质量。强度越高，参考帧越"干净"，编码效率越高——但这也是 libaom 编码后"丢失胶片质感"的首要原因。对胶片扫描和高 ISO 素材，设 0–2 可保留更多自然颗粒。对数字动画和干净源，4–6 安全。',
    commandExample: '-arnr-strength 3',
    effects: { quality: 3, fileSize: 4, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },
  'expl.libaom.arnrMaxFrames': {
    id: 'expl.libaom.arnrMaxFrames',
    title: 'libaom ARNR 最大参考帧 (-arnr-max-frames)',
    short: 'ALT-REF 降噪时可融合的最大邻近帧数量。更多帧提供更好的降噪效果但计算量增加。0–15，默认 7。',
    detail: 'ARNR 将前后多帧的信息加权融合来生成去噪的 ALT-REF。帧数越多，随机噪声被平均掉的概率越高，但精细的运动物体（如快速振翅的鸟）可能被错误地"平均"掉——表现为细微运动模糊。对静态为主的源（访谈、风景），高值（10–15）安全且降噪效果优秀；对快速运动和频繁切镜，低值（3–5）更安全。',
    commandExample: '-arnr-max-frames 7',
    effects: { quality: 2, fileSize: 2, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },
  'expl.libaom.enableCdef': {
    id: 'expl.libaom.enableCdef',
    title: 'libaom CDEF 滤波 (-enable-cdef)',
    short: 'AV1 核心环路滤波——约束方向增强滤波器。在去块之后运行，对边缘方向做定向平滑以消除振铃伪影。默认开启。对高画质归档可关闭以保留极致锐度。',
    detail: 'CDEF（Constrained Directional Enhancement Filter）是 AV1 独有的滤波工具——分析每个块的边缘方向后沿该方向施加定向平滑，比传统去块更"智能"地消除编码振铃。关闭 CDEF 会让画面变得锐利但充满微小的振铃伪影（尤其在锐利边缘周围）。动画和 CG 可能受益于关闭（更强的线条）；实拍内容保持开启。',
    commandExample: '-enable-cdef 1',
    effects: { quality: 4, fileSize: 1, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },
  'expl.libaom.enableRestoration': {
    id: 'expl.libaom.enableRestoration',
    title: 'libaom 环路恢复滤波 (-enable-restoration)',
    short: 'AV1 环路恢复滤波（LR）——在 CDEF 之后对重建帧做 Wiener 或 SGR 滤波以恢复被编码损伤的纹理和边缘。显著提升主观画质，性能开销可接受。',
    detail: 'Loop Restoration 是 AV1 编码工具的最后一环——它试图"修复"前面所有编码步骤积累的误差。使用 Wiener 或自引导恢复（SGR）滤波器对重建帧做逐块恢复。对中低码率编码的改善尤其显著（BD-Rate 3–6%）。关闭后画面在低码率下明显更粗糙。几乎没有理由关闭——除非在做编码工具链对比测试。',
    commandExample: '-enable-restoration 1',
    effects: { quality: 4, fileSize: 2, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },
  'expl.libaom.enableGlobalMotion': {
    id: 'expl.libaom.enableGlobalMotion',
    title: 'libaom 全局运动补偿 (-enable-global-motion)',
    short: '启用 AV1 全局运动模型——对全景平移、缩放和旋转等摄像机运动用单一运动参数描述整个帧，大幅节省这类场景的码率。对摇摄镜头和航拍内容尤其实用。',
    detail: '传统运动补偿逐块进行——摄像机平移时每一块都需要单独编码运动矢量。全局运动检测出整帧的共性运动模式（平移、旋转、缩放），用一个参数集描述它，所有块默认继承这个运动——只对"例外"物体编码额外的局部运动。对长摇摄镜头和航拍视频，可节省 10–20% 码率。对静态场景无效，但也不会增加开销。',
    commandExample: '-enable-global-motion 1',
    effects: { quality: 1, fileSize: 3, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },
  'expl.libaom.aqMode': {
    id: 'expl.libaom.aqMode',
    title: 'libaom AQ 模式 (-aq-mode)',
    short: '0=关闭，1=方差 AQ，2=复杂度 AQ，3=循环 AQ。控制 libaom 在不同画面内容复杂度区域重新分配码率的策略。',
    detail: '方差 AQ（1）基于块内方差分布来调整 QP——平坦区给小 QP（更多码率），复杂区给大 QP（省码率）。复杂度 AQ（2）额外考虑块的纹理方向和频率特征——更精细但稍慢。循环 AQ（3）在 AQ 决策中引入时间维度的反馈——对运动场景更智能但计算量最大。对一般编码，模式 1 已够用；高质量归档可考虑 2。',
    commandExample: '-aq-mode 1',
    effects: { quality: 4, fileSize: 3, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },
  'expl.libaom.deltaqMode': {
    id: 'expl.libaom.deltaqMode',
    title: 'libaom DeltaQ 模式 (-deltaq-mode)',
    short: '0=关闭，1–4 递增的 DeltaQ 精细度。DeltaQ 允许编码器在不同超块和帧层级应用不同 QP 偏移，实现更精准的码率分配。',
    detail: 'DeltaQ 在标准 QP 之上叠加逐块微调——对 ROI（感兴趣区域）可降低 QP 给更多码率，对"不重要"区域可升高 QP 省码率。更高的模式引入了更细致的 DeltaQ 层级（从帧级→超块级→块级）。对质量敏感的归档，模式 2–3 提供净收益；对所有内容都用相同 QP 的设置，DeltaQ 没有作用（设为 0）。',
    commandExample: '-deltaq-mode 2',
    effects: { quality: 3, fileSize: 2, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },
  'expl.libaom.lagInFrames': {
    id: 'expl.libaom.lagInFrames',
    title: 'libaom 前瞻帧数 (-lag-in-frames)',
    short: '编码器在输出当前帧前缓存分析的帧数量。0=无前瞻，最大值 48。更大值让 ALT-REF 生成和码率前瞻更精确，但内存和延迟增加。',
    detail: 'lag-in-frames 的不同之处在于它控制的是 ALT-REF 可使用的"未来"帧范围——不仅影响码率控制，还决定了多帧融合生成的超级参考帧的质量。48 帧（2 秒 @24fps）足够覆盖典型的场景片段。对实时编码设 0，对归档质量编码保持 25–35。',
    commandExample: '-lag-in-frames 25',
    effects: { quality: 3, fileSize: 2, speed: 3, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },
  'expl.libaom.autoAltRef': {
    id: 'expl.libaom.autoAltRef',
    title: 'libaom 自动 ALT-REF 帧数 (-auto-alt-ref)',
    short: '自动插入 ALT-REF（替代参考帧）的层级数。0=关闭，1–6 递增。ALT-REF 是高压缩效率的关键——它用多帧融合的超级参考帧替代常规参考帧。',
    detail: 'libaom 的 ALT-REF 与 x265 的 b-pyramid 类似但更激进——它不是简单地用 B 帧构建金字塔，而是生成全新的、多帧融合的参考帧。层级越高，金字塔越深，在静态内容上的压缩增益越大。但复杂的层级结构也意味着解码器端需要更大的 DPB。默认 1 对大多数内容合理；动画和静态访谈可受益于 3–5。',
    commandExample: '-auto-alt-ref 1',
    effects: { quality: 2, fileSize: 4, speed: 3, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },
  'expl.libaom.sbSize': {
    id: 'expl.libaom.sbSize',
    title: 'libaom 超级块大小 (-sb-size)',
    short: 'AV1 超级块（Superblock）尺寸：64 或 128。128 对大分辨率和高画质编码更高效，64 对小分辨率和低延迟场景更灵活。',
    detail: '超级块是 AV1 的基本编码单元——所有分区、预测和变换都在超级块内部发生。128×128 给大平坦区域提供了更好的压缩效率（更大的变换、更少的语法开销），但小分辨率（<720p）下超块覆盖比例过大失去粒度优势。默认保持 128，480p 及以下考虑 64。',
    commandExample: '-sb-size 128',
    effects: { quality: 2, fileSize: 2, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },
  'expl.libaom.monochrome': {
    id: 'expl.libaom.monochrome',
    title: 'libaom 单色模式 (-monochrome)',
    short: '将输出强制编码为纯亮度（无色彩）的 AV1 流。仅适合黑白源——不要把彩色视频意外设置为单色。',
    detail: '单色模式丢弃所有色度信息，仅编码亮度平面。这显著缩小了文件体积（约 30–40%），但输出是纯灰度的。对于本身就是黑白的源（老电影、纪录片、红外摄像），这是无损的。对于有意制作黑白版本的情况——注意这不是"去饱和"滤镜，而是完全省略色度编码。',
    commandExample: '-monochrome 0',
    effects: { quality: 0, fileSize: 3, speed: 1, compatibility: 1 },
    warnings: ['不要对彩色源启用——输出会是灰度且不可逆。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },
  'expl.libaom.errorResilience': {
    id: 'expl.libaom.errorResilience',
    title: 'libaom 错误恢复 (-error-resilience)',
    short: '启用 AV1 错误恢复工具——在码流中插入额外的重同步标记和帧内刷新数据，使得码流在有传输错误（丢包/位翻转）时更健壮。',
    detail: '默认 AV1 编码假设码流在无错信道传输（如文件存储、稳定 TCP 流）。开启 error-resilience 后，编码器定期插入帧内刷新块作为"安全锚点"——即使之前的数据出错，刷新块之后的区域仍可正确解码。对不可靠网络传输（UDP 流、无线广播）和物理介质（光盘划损）有实际保护作用，但轻微增加文件体积（2–5%）。',
    commandExample: '-error-resilience 1',
    effects: { quality: 0, fileSize: 2, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },
  'expl.libaom.enableIntrabc': {
    id: 'expl.libaom.enableIntrabc',
    title: 'libaom 帧内块复制 (-enable-intrabc)',
    short: '启用 AV1 帧内块复制——在当前帧内搜索相似块作为"参考"来复制。对屏幕录制、文字和 UI 内容有显著压缩增益，对自然视频几乎无影响。',
    detail: 'IntraBC 是类似 HEVC Screen Content Coding 的工具——在屏幕录制中，菜单栏的重复图标、文本编辑器的重复字符、UI 的重复元素都可以从同一帧的其他位置"复制"而不需要额外编码。这对屏幕录制和游戏视频有 10–30% 压缩收益；对自然场景的实拍内容几乎没有效果但也没有害处。',
    commandExample: '-enable-intrabc 1',
    effects: { quality: 1, fileSize: 2, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libaomenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libaomenc.c' }],
  },

  // ============================================================
  // QSV (shared h264_qsv / hevc_qsv)
  // ============================================================
  'expl.qsv.adaptiveI': {
    id: 'expl.qsv.adaptiveI',
    title: 'QSV 自适应 I 帧 (-adaptive_i)',
    short: '允许 Intel QSV 编码器根据画面内容自适应地在 GOP 中插入额外的 I 帧。场景切换和复杂场景时自动触发了新关键帧。',
    detail: 'QSV 的自适应 I 帧机制独立于标准的场景切换检测——它根据帧内复杂度突增和编码效率下降程度来决策"插入一个快速刷新"。这对画面快速变化（如动作场景爆发）很有用。如果你使用固定 GOP 结构（如广播要求），应关闭此选项以确保 GOP 可预测。',
    commandExample: '-adaptive_i 1',
    effects: { quality: 2, fileSize: 2, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.adaptiveB': {
    id: 'expl.qsv.adaptiveB',
    title: 'QSV 自适应 B 帧 (-adaptive_b)',
    short: '允许 QSV 硬件根据当前运动复杂度动态调整 GOP 中 B 帧的数量。与 -bf 指定的上限配合——在运动简单时插入更多 B 帧，运动复杂时减少。',
    detail: 'QSV 的自适应 B 帧让硬件编码器根据内容的运动幅度自动在 0 和 -bf 上限之间调整 B 帧插入。平移慢速的访谈自动获得更多 B 帧（更好压缩）；快速运动自动减少（避免匹配不准）。对内容不确定的直播，这是非常有用的自动化。对需要精确控制 GOP 结构的场景关闭。',
    commandExample: '-adaptive_b 1',
    effects: { quality: 2, fileSize: 3, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.bStrategy': {
    id: 'expl.qsv.bStrategy',
    title: 'QSV B 帧策略 (-b_strategy)',
    short: '0=不使用 B 帧作为参考，1=使用金字塔 B 帧结构。金字塔 B 帧更高效——低级 B 帧可被高级 B 帧参考，提升压缩效率。',
    detail: '类似 x265 的 b-pyramid，QSV 的 B 帧策略控制硬件是否构建多层 B 帧预测结构。策略 1（金字塔）提供更好的压缩效率（5–10%），但略微增加解码参考链深度。策略 0 保持传统非参考 B 帧结构，兼容性更好但压缩效率较低。',
    commandExample: '-b_strategy 1',
    effects: { quality: 2, fileSize: 3, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.idrInterval': {
    id: 'expl.qsv.idrInterval',
    title: 'QSV IDR 帧间隔 (-idr_interval)',
    short: '指定每隔多少个 GOP 插入一个 IDR 类型关键帧（而非更轻量的 I 帧）。0 表示每个关键帧都是 IDR。IDR 重置整个编码状态，适合流媒体分段和拼接。',
    detail: 'QSV 可以在 GOP 内部使用非 IDR 类型的关键帧（与 IDR 不同，它们允许部分跨 GOP 参考）。idr_interval 强制每 N 个 GOP 插入一个完整 IDR 刷新以重置编码状态。这在需要周期性随机访问点或分段拼接（HLS/DASH）时很重要。设 0 让所有关键帧都是 IDR（最安全的随机访问，但略微降低压缩效率）。',
    commandExample: '-idr_interval 1',
    effects: { quality: 1, fileSize: 2, speed: 0, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.intRefType': {
    id: 'expl.qsv.intRefType',
    title: 'QSV 帧内刷新类型 (-int_ref_type)',
    short: '0=关闭，1=垂直条带刷新，2=水平条带刷新。不使用完整关键帧，而是逐列/逐行刷新部分画面区域——避免关键帧的突发码率峰值。',
    detail: '帧内刷新（Intra Refresh）是替代传统关键帧的机制——不是一次性刷完整帧，而是在多帧中逐列（垂直）或逐行（水平）刷新一部分区域。这避免了关键帧的码率尖峰（I 帧通常比 P 帧大 5–10 倍），在需要恒定码率但又要容错的流媒体场景中非常有用。但对随机访问不友好——播放器需要在刷新周期中找到刷新起始点才能加入。',
    commandExample: '-int_ref_type 1',
    effects: { quality: 2, fileSize: 2, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.intRefCycleSize': {
    id: 'expl.qsv.intRefCycleSize',
    title: 'QSV 帧内刷新周期 (-int_ref_cycle_size)',
    short: '配合 int_ref_type 使用，指定帧内刷新完成一个完整循环所需的帧数。较小的值 = 更快完成刷新 = 更频繁的随机访问点但更多码率开销。',
    detail: '帧内刷新周期决定了一个"虚拟 GOP"的长度——在这个周期内，画面的每个区域都被刷新一次。周期越短容错越强（错误恢复快），但码率开销越大（因为更多块被编码为帧内模式）。对需要每隔 2 秒有刷新点的应用（视频会议等），适当缩短周期以满足延迟要求。',
    commandExample: '-int_ref_cycle_size 60',
    effects: { quality: 2, fileSize: 3, speed: 0, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.cavlc': {
    id: 'expl.qsv.cavlc',
    title: 'QSV CAVLC 熵编码 (-cavlc)',
    short: '强制 QSV 使用 CAVLC（变长编码）替代默认的 CABAC（算术编码）。CAVLC 编码和解码更快但压缩效率低约 10–15%。仅在 legacy 设备兼容性需要时使用。',
    detail: 'CABAC 是所有现代 H.264 分发的事实标准——它比 CAVLC 高效太多，且所有现代解码器都支持。QSV 默认使用 CABAC。手动切换到 CAVLC 仅在为极老设备（如 15 年前的 MP4 播放器）或极低功耗解码场景（IoT 设备）编码时有必要。对硬件解码，CABAC 的计算负担在现代芯片上微不足道。',
    commandExample: '-cavlc 0',
    effects: { quality: 2, fileSize: 3, speed: 2, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.maxFrameSize': {
    id: 'expl.qsv.maxFrameSize',
    title: 'QSV 最大帧大小 (-max_frame_size)',
    short: '以 bytes 为单位限制单帧编码输出大小。超过时限编码器会调整 QP 压缩帧。用于网络传输中避免单个网络包超过 MTU 的场景。0 不限制。',
    detail: '对 UDP 流传输，单个帧编码结果超过 MTU（约 1500 bytes）时 IP 层需要分片——丢失任一片则该帧完全报废。max_frame_size 强制编码器内部将大帧拆分为多个 slice 或调整 QP，使得每个 NAL 单元都低于此限制。对本地文件和 TCP 流传输无必要。设得过小（如 <MTU）会严重损害 I 帧质量和压缩效率。',
    commandExample: '-max_frame_size 0',
    effects: { quality: 2, fileSize: 2, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.maxSliceSize': {
    id: 'expl.qsv.maxSliceSize',
    title: 'QSV 最大 Slice 大小 (-max_slice_size)',
    short: '限制单个 slice 的 bytes 上限。超过时 QSV 硬件将帧拆分为多个 slice。类似 max_frame_size 但作用于 slice 层级——对网络传输更精细的控制。',
    detail: 'Slice 是 H.264/H.265 中的独立可解码单元——帧内的每个 slice 有自己独立的熵编码上下文，可并行解码。限制 slice 大小主要用于网络打包——slice 作为 NAL 单元通常是 IP 包的直接内容。对本地文件编码不需要限制，让编码器自行决定即可。',
    commandExample: '-max_slice_size 0',
    effects: { quality: 2, fileSize: 2, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.mbbrc': {
    id: 'expl.qsv.mbbrc',
    title: 'QSV 宏块级码控 (-mbbrc)',
    short: '启用逐宏块的码率控制——在每个宏块粒度上调节 QP 而非仅在帧级。显著改善复杂纹理区域的码率分配精准度，但 GPU 额外开销增加。',
    detail: '默认的帧级码控在整个帧上用统一的 QP 策略。mbbrc 让 QSV 硬件对每个宏块独立计算最优 QP——宏块级的自适应码率控制。对画质有明显改善（尤其在混合了平坦和复杂区域的帧），但增加了 GPU 编码流水线的计算量。在 GPU 利用率接近满负荷时可能反而降低帧率。',
    commandExample: '-mbbrc 1',
    effects: { quality: 3, fileSize: 2, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.scenario': {
    id: 'expl.qsv.scenario',
    title: 'QSV 使用场景 (-scenario)',
    short: '告知 Intel 硬件编码器当前负载的使用场景以优化内部资源调度。unknown=通用，display_remastering=高质量转码，game_streaming=游戏串流，compute=计算/分析。',
    detail: 'Intel GPU 根据不同场景调整编码器内部管道优先级、缓冲大小和功耗策略。display_remastering 优先质量和一致性；game_streaming 优先低延迟和 GPU 资源共享；compute 为纯计算量（非实时播放）优化。对于日常转码，unknown 自动检测通常足够；对专业用途明确指定可榨取最佳性能。',
    commandExample: '-scenario display_remastering',
    effects: { quality: 2, fileSize: 1, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.avbrAccuracy': {
    id: 'expl.qsv.avbrAccuracy',
    title: 'QSV AVBR 精度 (-avbr_accuracy)',
    short: 'AVBR（平均可变码率）模式下的目标码率跟踪精度。值越高编码器越严格地匹配目标码率但画质波动增大；值越低允许更灵活的码率分配以提升画质一致性。',
    detail: 'AVBR 是 QSV 专有的码率控制模式——结合了 CBR 的码率上限和 VBR 的质量弹性。avbr_accuracy 决定了编码器对目标平均码率的"跟踪紧度"。高精度（如 1000+）适合需要严格码率控制的广播场景；低精度（如 100–500）让编码器根据内容复杂度灵活分配，适合画质优先的编码。仅在 AVBR 模式下有效。',
    commandExample: '-avbr_accuracy 500',
    effects: { quality: 3, fileSize: 3, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.avbrConvergence': {
    id: 'expl.qsv.avbrConvergence',
    title: 'QSV AVBR 收敛速度 (-avbr_convergence)',
    short: 'AVBR 模式下码率控制从初始 QP 收敛到目标码率的速度。较大的值收敛更快（快速接近目标码率），较小时收敛更平滑（初始帧画质更稳定）。',
    detail: 'AVBR 码控在编码启动时需要几秒来找到目标码率——初始 QP 猜测可能不准。avbr_convergence 控制了这个"追码率"过程的快慢。快速收敛导致开头几秒画质可能波动明显；慢速收敛让开头画质稳定但偏离目标码率的时间更长。对短视频片段（<30 秒）建议较快收敛；对长视频可用默认值。',
    commandExample: '-avbr_convergence 500',
    effects: { quality: 2, fileSize: 2, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.picTimingSei': {
    id: 'expl.qsv.picTimingSei',
    title: 'QSV pic_timing SEI (-pic_timing_sei)',
    short: '在码流 SEI 中写入图像定时信息（PicTiming）。默认开启。几乎对所有应用都有益，提供帧时间戳给播放器做 A/V 同步——没有理由关闭。',
    detail: 'PicTiming SEI 携带了每帧的显示时间和时钟信息，是播放器音视频同步（lip-sync）的关键数据。除非你确定播放端有其他时间线管理机制，否则保持默认开启。关闭后 A/V 同步可能不稳定，表现为口型不一致。',
    commandExample: '-pic_timing_sei 1',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 4 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.recoveryPointSei': {
    id: 'expl.qsv.recoveryPointSei',
    title: 'QSV Recovery Point SEI (-recovery_point_sei)',
    short: '在关键帧处写入恢复点 SEI，告知解码器"从这个关键帧开始解码需要多少帧才能完全恢复画质"。对随机访问和码流切换场景很有帮助。',
    detail: '当播放器从中间关键帧开始解码时（如用户拖动进度条），最初几帧可能画质不佳——因为参考帧链还未重建完整。Recovery Point SEI 告诉解码器需要等待多少帧才能达到"完整质量"——播放器可以利用这个信息在恢复期间插入画面过渡或提示用户。对交互式播放应用推荐开启。',
    commandExample: '-recovery_point_sei 1',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.repeatPps': {
    id: 'expl.qsv.repeatPps',
    title: 'QSV 重复 PPS (-repeat_pps)',
    short: '在每个帧前重复插入图像参数集（PPS），确保解码器在任意帧位置加入码流时都有完整的初始化解码参数。类似 x265 的 repeat-headers。',
    detail: 'PPS 包含了解码每帧需要的量化矩阵和熵编码参数。默认只在码流开头写一次——如果播放器从中间加入，缺少 PPS 无法解码。开启 repeat_pps 让每帧前都有 PPS，确保从任何位置加入都有完整的初始化信息。对 HLS/DASH 流媒体和交互式播放必须开启；本地文件线性播放可关闭。',
    commandExample: '-repeat_pps 1',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.singleSeiNalUnit': {
    id: 'expl.qsv.singleSeiNalUnit',
    title: 'QSV 单 SEI NAL 单元 (-single_sei_nal_unit)',
    short: '将所有 SEI 消息打包进一个 NAL 单元而非分多个。减少 NAL 头开销，但某些硬件解码器期望每种 SEI 类型独立。通常保持默认即可。',
    detail: 'SEI 消息可以独立放在各自的 NAL 单元中（每个都有 NAL 头）或打包进一个。单 NAL 模式减少 NAL 头重复开销（微不足道），且某些流媒体封装器（如 TS）对 NAL 单元数量有限制——在这些场景中有些许裨益。但极少数老旧硬件解码器要求每种 SEI 类型独立 NAL。默认关闭（多 NAL）是最兼容的选择。',
    commandExample: '-single_sei_nal_unit 0',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.vcm': {
    id: 'expl.qsv.vcm',
    title: 'QSV VCM 模式 (-vcm)',
    short: 'VCM（Video Conferencing Mode）——为视频会议/实时通信优化编码流水线：降低编码延迟、简化 GOP 结构、减少前瞻深度。',
    detail: 'VCM 是 Intel 为视频会议和远程协作场景设计的专用模式——它重新配置 QSV 编码器流水线以优先低延迟和稳定帧率，而非最大化压缩效率。开启后自动调整多项内部参数（包括收紧 GOP、减少 B 帧、简化前瞻）。对录播和归档编码应关闭——VCM 会牺牲压缩效率和部分画质换取延迟改善。',
    commandExample: '-vcm 0',
    effects: { quality: 2, fileSize: 2, speed: 2, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },
  'expl.qsv.rdo': {
    id: 'expl.qsv.rdo',
    title: 'QSV RDO 级别 (-rdo)',
    short: '控制 QSV 硬件编码器的率失真优化深度。0=关闭（最快），3=最高（最佳压缩）。每提高一级增加 GPU 编码周期但改善压缩效率。',
    detail: 'RDO 让编码器在多个候选编码模式中通过率失真计算选出最优解——考虑"多花的码率值不值得带来的画质改善"。QSV 的 RDO 级别与软件编码器中的 subme/preset 系统类似——级别越高，评估的候选模式越多，压缩效率越好但编码越慢。级别 3 对复杂内容有 5–10% 压缩增益。在高负载下（多路同时编码），降低 RDO 可以防止 GPU 瓶颈。',
    commandExample: '-rdo 2',
    effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c' }],
  },

  // ============================================================
  // libvvenc
  // ============================================================
  'expl.libvvenc.level': {
    id: 'expl.libvvenc.level',
    title: 'VVenC VVC 层级 (-level)',
    short: '声明输出 VVC 码流遵循的层级（level）约束。与 H.264/H.265 的 level 类似——限制最大分辨率、码率和 DPB 大小以确保目标解码器兼容。不设置时编码器自行推断。',
    detail: 'VVC level 系统比 HEVC 粒度更细——覆盖从移动端（Level 1）到 8K+ HDR（Level 6.3+）的整个范围。正确设置 level 确保输出码流不会超出目标播放设备或芯片的硬件解码上限。不设置时编码器根据分辨率和帧率自动推断——通常正确——但广播和物理介质交付要求显式声明。',
    commandExample: '-level 5.1',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvvenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvvenc.c' }],
  },

  // ============================================================
  // AMF (shared h264_amf / hevc_amf)
  // ============================================================
  'expl.amf.qpI': {
    id: 'expl.amf.qpI',
    title: 'AMF I 帧 QP (-qp_i)',
    short: 'CQP 模式下 I 帧的独立 QP 值。I 帧作为 GOP 的参考锚点通常需要更低的 QP（更高质量）以避免错误传播到整个 GOP。典型值比 P 帧低 2–4。',
    detail: '在 CQP 模式中，每个帧类型可以用不同的 QP。因为 I 帧是 GOP 所有帧的最终参考来源，它的质量决定了整个 GOP 的质量上限。如果 qp_i 过高，关键帧本身的模糊和块状伪影会在后续 P/B 帧中传播和放大。对归档质量，qp_i 应比 qp_p 低 3–6。对追求文件最小化的场景，可以拉近两者差距。',
    commandExample: '-qp_i 18',
    effects: { quality: 4, fileSize: 4, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc.c' }],
  },
  'expl.amf.qpP': {
    id: 'expl.amf.qpP',
    title: 'AMF P 帧 QP (-qp_p)',
    short: 'CQP 模式下 P 帧的独立 QP 值。P 帧比 B 帧在参考链中更重要，通常 QP 应介于 I 和 B 之间。',
    detail: 'P 帧是 GOP 中的单向前向参考帧——虽不如 I 帧关键，但仍作为后续 P 和 B 帧的参考。qp_p 通常比 qp_i 高 2–4（稍低质量），但比 qp_b 低 1–3。对质量优先的内容，尽量让三者接近以维持帧间画质一致性；对体积优先，加大差距。',
    commandExample: '-qp_p 22',
    effects: { quality: 3, fileSize: 3, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc.c' }],
  },
  'expl.amf.enforceHrd': {
    id: 'expl.amf.enforceHrd',
    title: 'AMF 强制 HRD 兼容 (-enforce_hrd)',
    short: '强制编码器严格遵守 HRD 假设模型——限制瞬时码率不超过设定上限。配合 vbv 参数使用时确保输出码流在指定缓冲模型下合规。',
    detail: 'AMF 的 VBV 码率控制在正常模式下可能"有意偏离"以改善画质——在一些场景中轻微违规对真机播放无影响。enforce_hrd 让 AMF 严格执行 HRD 约束——如不满足则宁可降画质也不超额。这在提交给严格合规审核平台（广播、蓝光）的码流中是必需的。',
    commandExample: '-enforce_hrd 1',
    effects: { quality: 2, fileSize: 2, speed: 1, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc.c' }],
  },
  'expl.amf.fillerData': {
    id: 'expl.amf.fillerData',
    title: 'AMF 填充数据 CBR (-filler_data)',
    short: 'CBR 模式下，当编码简单场景码率不足时插入空填充字节以维持恒定输出速率。这是真正 CBR 的核心——没有填充数据码率就不可能真正恒定。',
    detail: '恒定码率（CBR）通常需要填充数据——视频内容不可能精确地每帧产生相同数量的比特。当场景很简单（黑屏、静止）时，编码器产出的码率达不到目标值，就用空填充字节（filler data NAL units）补齐。这对需要真正恒定流量的传输链路（卫星、广播 TS 流）是强制性的。对本地文件和普通分发，关闭填充数据更节省空间。',
    commandExample: '-filler_data 1',
    effects: { quality: 0, fileSize: 3, speed: 0, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc.c' }],
  },
  'expl.amf.maxAuSize': {
    id: 'expl.amf.maxAuSize',
    title: 'AMF 最大 AU 大小 (-max_au_size)',
    short: '限制单个 Access Unit（一帧所有 NAL 的总和）的最大 bytes。超过时分拆多帧或施加严格 QP 限制。用于管理网络传输 MTU 和解码器缓冲。',
    detail: '一个 Access Unit 包含一帧的所有编码数据——在极复杂场景中这些数据可能远超预期。max_au_size 给解码器设置了明确的处理预算。对 IP 网络传输和特定的硬件解码器（如低功耗芯片），这确保帧数据在可预测的缓冲窗口内。0 不限制。',
    commandExample: '-max_au_size 0',
    effects: { quality: 2, fileSize: 1, speed: 0, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc.c' }],
  },
  'expl.amf.meHalfPel': {
    id: 'expl.amf.meHalfPel',
    title: 'AMF 半像素运动估计 (-me_half_pel)',
    short: '启用 1/2 像素精度的运动估计。默认开启。仅当 AMD 硬件或驱动有兼容问题时考虑关闭——关闭后运动补偿精度降至整数像素，压缩效率显著下降。',
    detail: '物体运动几乎不可能恰好落在整数像素——半像素 ME 允许编码器在亚像素位置搜索最佳匹配，这是现代视频编码压缩效率的基础。关闭后画面产生"偏移模糊"——运动物体边缘不锐利且压缩效率下降约 10–20%。仅在驱动 bug 排查或极限性能测试时关闭。',
    commandExample: '-me_half_pel 1',
    effects: { quality: 4, fileSize: 3, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc.c' }],
  },
  'expl.amf.meQuarterPel': {
    id: 'expl.amf.meQuarterPel',
    title: 'AMF 1/4 像素运动估计 (-me_quarter_pel)',
    short: '启用 1/4 像素精度的运动估计。在半像素 ME 基础上进一步细化。对 H.264 和 HEVC，1/4 像素是标准精度——关闭后运动补偿精度大幅受损。',
    detail: 'H.264 和 HEVC 标准定义了 1/4 像素运动补偿——这是标准的亚像素精度。半像素是"近似圆"，1/4 像素是"精确圆"。开启对压缩效率和运动边界的锐利度都是净收益。与 me_half_pel 不同，1/4 像素级别的搜索计算量较大，对 GPU 消耗更明显。',
    commandExample: '-me_quarter_pel 1',
    effects: { quality: 3, fileSize: 2, speed: 3, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc.c' }],
  },
  'expl.amf.aud': {
    id: 'expl.amf.aud',
    title: 'AMF AU Delimiter (-aud)',
    short: '在每帧前插入 Access Unit Delimiter NAL 单元。对 TS 封装、HLS 切片和专业分析工具有用，对本地播放无影响。',
    detail: '与 x264 的 -aud 同理——插入帧边界的标记 NAL。对本地 MP4/MKV 播放冗余；对广播 TS 流、HLS 切片器和某些硬件解码器提供帧同步便利。',
    commandExample: '-aud 1',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc.c' }],
  },
  'expl.amf.logToDbg': {
    id: 'expl.amf.logToDbg',
    title: 'AMF 调试日志 (-log_to_dbg)',
    short: '将 AMF 运行时内部日志输出到调试器。仅开发/故障排查用途——正常编码应保持关闭。',
    detail: '开启后 AMF 编码器向系统调试器（Windows Debug Output 或 Linux syslog）输出详细运行时信息，包括硬件状态、编码统计和内存分配记录。对最终用户无意义且增加微小性能开销。仅在排查编码异常、驱动问题或性能 bug 时开启。',
    commandExample: '-log_to_dbg 0',
    effects: { quality: 0, fileSize: 0, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc.c' }],
  },
  'expl.amf.bFrameRef': {
    id: 'expl.amf.bFrameRef',
    title: 'AMF B 帧参考模式 (-b_frame_ref)',
    short: '允许 B 帧作为后续帧的参考。默认开启。关闭后 B 帧仅作为非参考帧存在，压缩效率下降但 GOP 层级简化。',
    detail: 'B 帧作为参考的能力是现代编码器压缩效率的核心——它增加了参考候选的丰富度。AMF 通过 AMD 硬件 B 帧参考引擎支持这一特性。关闭后 GOP 结构退化为"仅 P 帧参考"模式——压缩效率下降但解码更简单，对极低功耗解码器可能有微小益处。',
    commandExample: '-b_frame_ref 1',
    effects: { quality: 2, fileSize: 3, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc.c' }],
  },
  'expl.amf.headerInsertionMode': {
    id: 'expl.amf.headerInsertionMode',
    title: 'AMF SEI 头信息插入模式 (-header_insertion_mode)',
    short: '控制 VPS/SPS/PPS 等参数集 NAL 单元的插入频率——0=不重复插入（仅码流开头一处），1=每个 GOP 开头重复一次，2=每个 IDR 帧处重复。重复插入增加微小码率但提升随机接入和丢包恢复能力。',
    detail: 'H.264/H.265 码流中的参数集（SPS/PPS/VPS）告诉解码器如何解析后续的视频数据——包括分辨率、Profile/Level、熵编码模式等关键信息。如果不重复插入（模式 0），参数集只在码流的最开头出现一次，解码器必须从头开始解码才能获取这些信息。这对本地播放完全没问题，但对流媒体和广播场景可能致命：中途加入的观众（切换频道、直播延迟加入）收到第一个 IDR 帧后不知道如何解码，需要等待下一个包含参数集的片段。模式 1（每个 GOP）在每个 GOP 开头的 I 帧前附带一份参数集副本——约增加几十字节/GOP，但确保了 GOP 级别的独立可解码性。模式 2（每个 IDR）更激进——在每一处 IDR（包括场景切换触发的 IDR）前都插入参数集，适合 HLS/DASH 等基于 IDR 对齐的分段流媒体方案。对本地文件编码，三种模式实际解码效果无差异，选 0 节省微小的重复开销即可。',
    commandExample: '-header_insertion_mode 1',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 3 },
    warnings: ['模式 1 和 2 对编解码兼容性有积极影响——部分老旧解码器在参数集缺失时可能报错或花屏，重复插入可避免此问题。', '对 HLS/DASH 分发建议至少选择模式 1，确保每段独立可解。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc.c' }],
  },
  'expl.amf.queryTimeout': {
    id: 'expl.amf.queryTimeout',
    title: 'AMF 查询超时 (-query_timeout)',
    short: 'AMF 编码器等待硬件返回编码结果的超时时间（ms）。0 为默认超时。仅在极特殊硬件状态（显卡繁忙、驱动异常）时需要增加此值——正常情况不需要调整。',
    detail: 'AMF 编码是异步的——提交帧给 GPU 后通过轮询取回编码结果。query_timeout 决定了最长等待多少毫秒。如果编码器持续超时（表现为编码极慢或卡死），可能意味着 GPU 过载或驱动异常。正常情况下调整此值无益。',
    commandExample: '-query_timeout 0',
    effects: { quality: 0, fileSize: 0, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc.c' }],
  },
  'expl.amf.preanalysis': {
    id: 'expl.amf.preanalysis',
    title: 'AMF 预分析 (-preanalysis)',
    short: '启用编码前预处理分析——对帧做复杂度统计和场景检测以便优化码率分配。类似 NVENC 的 lookahead，改善码控精度但增加 GPU 负载和编码延迟。',
    detail: 'AMF 的预分析独立于 preencode（预编码）——它只做轻量级统计分析而不实际编码。开启后编码器在正式编码前做一次快速复杂度扫描，据此优化 QP 分配和场景切换检测。对质量有帮助但增加 GPU 负载和延迟。对离线转码推荐开启；对实时和直播慎重。',
    commandExample: '-preanalysis 1',
    effects: { quality: 3, fileSize: 2, speed: 3, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc.c' }],
  },

  // ============================================================
  // VideoToolbox (shared h264/hevc)
  // ============================================================
  'expl.videotoolbox.framesBefore': {
    id: 'expl.videotoolbox.framesBefore',
    title: 'VideoToolbox 前置帧模式 (-frames_before)',
    short: '开启后编码器延迟输出以预先分析后续帧——允许生成 B 帧和更优的码率分配。关闭则编码器仅使用已编码帧的信息，B 帧功能受限。',
    detail: '前置帧让 VideoToolbox 在输出当前帧之前先分析几个未来帧——这类似于软件编码器的前瞻机制。开启后 B 帧数量和码率分配的准确性都得到改善。代价是编码延迟增加（缓冲帧数 × 帧时长）。对离线转码开启；对实时编码关闭以保持最小延迟。',
    commandExample: '-frames_before 1',
    effects: { quality: 3, fileSize: 2, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/videotoolboxenc.c' }],
  },
  'expl.videotoolbox.framesAfter': {
    id: 'expl.videotoolbox.framesAfter',
    title: 'VideoToolbox 后置帧模式 (-frames_after)',
    short: '编码后保留帧以作为后续帧的额外参考。与 frames_before 互补——前者控制前瞻，后者控制回顾。',
    detail: 'frames_after 让编码器保留已编码的帧作为额外参考而非立即释放。对复杂的运动模式有益——增加了参考候选的时间覆盖范围。但增加了 GPU 内存占用。对标准内容保持默认；对极复杂运动可开启配合 frames_before 形成完整的前后向参考窗口。',
    commandExample: '-frames_after 0',
    effects: { quality: 2, fileSize: 2, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/videotoolboxenc.c' }],
  },
  'expl.videotoolbox.a53cc': {
    id: 'expl.videotoolbox.a53cc',
    title: 'VideoToolbox A/53 字幕 (-a53cc)',
    short: '允许 VideoToolbox 将 CEA-608/708 隐藏字幕数据嵌入 H.264/H.265 码流的 SEI 中。默认开启——保持即可，除非你要用第三方字幕轨道。',
    detail: 'A/53 是 ATSC 广播标准中定义的隐藏字幕封装格式。VideoToolbox 从输入中检测 CEA-608/708 数据并将其写入 SEI。打开后输出码流携带字幕数据——播放器可以从 SEI 中恢复并显示。如果使用外部字幕文件或字幕轨道（MKV 内置），可以关闭以避免重复或冲突。',
    commandExample: '-a53cc 1',
    effects: { quality: 0, fileSize: 1, speed: 1, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/videotoolboxenc.c' }],
  },
  'expl.videotoolbox.sse': {
    id: 'expl.videotoolbox.sse',
    title: 'VideoToolbox SSE 计算 (-sse)',
    short: '编码后计算并输出每帧的 SSE（Sum of Squared Errors）统计数据。纯诊断用途——正常编码应关闭以节省性能。',
    detail: 'SSE 是帧重建误差的数学度量——编码后与原帧的像素差平方和。VideoToolbox 可选的输出这一数据到调试接口，对编码质量分析和参数调优有帮助。但对最终用户无意义且增加轻微性能开销。仅在编码器开发、调参对比和画质验证时开启。',
    commandExample: '-sse 0',
    effects: { quality: 0, fileSize: 0, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/videotoolboxenc.c' }],
  },
  'expl.videotoolbox.requireSw': {
    id: 'expl.videotoolbox.requireSw',
    title: 'VideoToolbox 要求软件编码 (-require_sw)',
    short: '强制 VideoToolbox 使用软件编码路径而非硬件加速。画质与硬件编码相同但速度极慢——仅在硬件编码器有兼容性问题或 bug 时作为应急方案。',
    detail: 'Apple 的 VideoToolbox 框架在 Mac/iOS 上同时提供硬件（GPU）和软件（CPU）编码路径。软件路径使用相同的编码标准但完全在 CPU 上运行——极度慢但不受硬件版本/驱动影响。正常场景绝不应该使用——这是硬件兼容故障时的最后应急方案。如果你遇到硬件编码的特定 bug（如某些分辨率崩溃），可以临时切换为软件路径绕过。',
    commandExample: '-require_sw 0',
    effects: { quality: 0, fileSize: 0, speed: 5, compatibility: 1 },
    warnings: ['软件编码极慢（比硬件慢 10–50 倍），仅用于应急或调试。'],
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/videotoolboxenc.c' }],
  },
  'expl.videotoolbox.prioSpeed': {
    id: 'expl.videotoolbox.prioSpeed',
    title: 'VideoToolbox 优先速度 (-prio_speed)',
    short: '要求 VideoToolbox 在编码质量与速度的平衡中偏向速度。开启后编码器使用更快的简化编码路径，画质略降但延迟减少。',
    detail: 'VideoToolbox 内部有多个编码质量层级——每个层级使用不同程度的运动估计算法和 RDO 优化。prio_speed 选择更快的层级，适合实时编码、直播或屏幕共享等对延迟敏感的场景。与 prio_quality 互斥——两者同时开启的行为未定义。',
    commandExample: '-prio_speed 0',
    effects: { quality: 3, fileSize: 1, speed: 4, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/videotoolboxenc.c' }],
  },
  'expl.videotoolbox.prioQuality': {
    id: 'expl.videotoolbox.prioQuality',
    title: 'VideoToolbox 优先质量 (-prio_quality)',
    short: '要求 VideoToolbox 在编码中偏向最高画质，即使编码速度因此下降。归档和分发编码推荐开启。与 prio_speed 互斥。',
    detail: 'prio_quality 让苹果的编码框架使用最慢但最精确的运动估计和量化路径——类似 x264 的 placebo 预设（但仍在硬件加速限制内）。对永远只需编码一次的内容（如本地归档、视频发布），付出的额外时间换来永久的质量改善。与 prio_speed 互斥——两者同时设置的行为不确定。',
    commandExample: '-prio_quality 1',
    effects: { quality: 4, fileSize: 2, speed: 4, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/videotoolboxenc.c' }],
  },
  'expl.videotoolbox.alphaQuality': {
    id: 'expl.videotoolbox.alphaQuality',
    title: 'VideoToolbox Alpha 质量优化 (-alpha_quality)',
    short: '对带 Alpha（透明度）通道的视频（如 HEVC with Alpha）优化编码质量。对普通不含透明度的视频无效果。',
    detail: '部分 HEVC 编码支持 Alpha 通道——用于运动图形、字幕叠层和 UI 元素的独立透明度信息。alpha_quality 让 VideoToolbox 在 Alpha 平面分配更多编码精度以保留平滑的透明度渐变和硬边。对不带 Alpha 的普通视频，此选项被忽略。',
    commandExample: '-alpha_quality 0',
    effects: { quality: 2, fileSize: 2, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/videotoolboxenc.c' }],
  },
  'expl.videotoolbox.maxRefFrames': {
    id: 'expl.videotoolbox.maxRefFrames',
    title: 'VideoToolbox 最大参考帧数 (-max_ref_frames)',
    short: '限制编码器可使用的最大参考帧数量。更多参考帧提升压缩效率但增加 GPU 内存和解码 DPB 开销。0 由编码器自行管理。',
    detail: '与通用 -refs 参数类似但直接控制 VideoToolbox 内部的参考管理。对高质量编码可适当放宽（6–8 帧）以增加参考候选丰富度；对内存受限或低功耗设备（iOS 后台编码）应收紧（2–4 帧）。此值也会写入码流约束解码端——解码设备必须支持此设定值，否则无法播放。',
    commandExample: '-max_ref_frames 4',
    effects: { quality: 2, fileSize: 2, speed: 2, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/videotoolboxenc.c' }],
  },
// Auto-generated new explanation entries for 5 AV1 encoders
// This file is concatenated into src/data/explanations/index.ts

  // ================================================================
  // av1_amf — AMD AMF AV1 硬件编码器
  // ================================================================

  'expl.av1_amf': {
    id: 'expl.av1_amf',
    title: 'av1_amf (AMD AMF AV1)',
    short: 'AMD AMF 硬件 AV1 编码器。需 RDNA3 (RX 7000) 或更新 GPU，提供 CQP/VBR/CBR/QVBR 四种码率控制模式。',
    detail: 'av1_amf 利用 AMD GPU 内置的 AV1 硬件编码单元进行高速 AV1 编码，编码速度远超 CPU 软件方案。支持 8-bit nv12/yuv420p 和 10-bit p010le 像素格式。quality 预设提供 speed/balanced/quality 三档速度与质量平衡。',
    effects: { quality: 3, fileSize: 2, speed: 5, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c' }],
  },
  'expl.av1_amf.profile': {
    id: 'expl.av1_amf.profile',
    title: 'av1_amf 编码配置 (profile)',
    short: 'AV1 码流配置。main 为 8-bit 4:2:0 标准配置，auto 由编码器自行选择。',
    effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 4 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c' }],
  },
  'expl.av1_amf.pixfmt': {
    id: 'expl.av1_amf.pixfmt',
    title: 'av1_amf 像素格式',
    short: 'nv12 适合 8-bit 硬件路径；yuv420p 为通用 8-bit；p010le 用于 10-bit AV1 编码。',
    effects: { quality: 2, fileSize: 2, speed: 1, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c' }],
  },
  'expl.av1_amf.cqp': {
    id: 'expl.av1_amf.cqp',
    title: 'av1_amf CQP 模式',
    short: '恒定量化参数模式——为 I 帧和 P 帧分别设置固定 QP 值，数值越低画质越高。',
    commandExample: '-rc cqp -qp_i 18 -qp_p 20',
    effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c' }],
  },
  'expl.av1_amf.qpI': {
    id: 'expl.av1_amf.qpI',
    title: 'AMF AV1 I 帧 QP',
    short: 'CQP 模式下 I 帧（关键帧）的量化参数，范围 0–51。I 帧是全帧内编码，QP 值直接影响整体画质感知。',
    effects: { quality: 5, fileSize: 4, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c' }],
  },
  'expl.av1_amf.qpP': {
    id: 'expl.av1_amf.qpP',
    title: 'AMF AV1 P 帧 QP',
    short: 'CQP 模式下 P 帧（预测帧）的量化参数，范围 0–51。通常设在 I 帧 QP +1 到 +3。',
    effects: { quality: 4, fileSize: 3, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c' }],
  },
  'expl.av1_amf.vbr': {
    id: 'expl.av1_amf.vbr',
    title: 'av1_amf VBR 模式',
    short: '可变码率模式——目标码率控制平均体积，maxrate 限制瞬时峰值，适合文件体积可预期且画质稳定的场景。',
    commandExample: '-rc vbr_latency -b:v 5000k -maxrate 8000k -bufsize 16000k',
    effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c' }],
  },
  'expl.av1_amf.vbr.bitrate': {
    id: 'expl.av1_amf.vbr.bitrate',
    title: 'av1_amf VBR 目标码率',
    short: 'VBR 模式下的视频平均目标码率（如 5000k = 5 Mbps）。较高值提升画质但增大文件。',
    effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c' }],
  },
  'expl.av1_amf.vbr.maxrate': {
    id: 'expl.av1_amf.vbr.maxrate',
    title: 'av1_amf VBR 最大码率',
    short: '限制编码器瞬时输出的最高码率，防止峰值超过传输/解码能力。',
    effects: { quality: 2, fileSize: 3, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c' }],
  },
  'expl.av1_amf.vbr.bufsize': {
    id: 'expl.av1_amf.vbr.bufsize',
    title: 'av1_amf VBR 缓冲区',
    short: '编码器码率控制缓冲大小，决定码率波动的容差。通常设为 maxrate 的 2 倍。',
    effects: { quality: 1, fileSize: 2, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c' }],
  },
  'expl.av1_amf.cbr': {
    id: 'expl.av1_amf.cbr',
    title: 'av1_amf CBR 模式',
    short: '恒定码率模式——码率全程保持稳定，适合直播推流或带宽严格受限的传输场景。',
    commandExample: '-rc cbr -b:v 5000k',
    effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c' }],
  },
  'expl.av1_amf.cbr.bitrate': {
    id: 'expl.av1_amf.cbr.bitrate',
    title: 'av1_amf CBR 目标码率',
    short: 'CBR 模式下恒定的目标码率。应为带宽上限的 80%–90% 以留出协议开销余量。',
    effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c' }],
  },
  'expl.av1_amf.qvbr': {
    id: 'expl.av1_amf.qvbr',
    title: 'av1_amf QVBR 模式',
    short: '质量可变码率——在保证量化质量的前提下动态分配码率，固定画质而不固定体积。',
    commandExample: '-rc qvbr -qvbr_quality_level 23 -b:v 5000k',
    effects: { quality: 4, fileSize: 2, speed: 3, compatibility: 4 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c' }],
  },
  'expl.av1_amf.qvbr.level': {
    id: 'expl.av1_amf.qvbr.level',
    title: 'av1_amf QVBR 质量级别',
    short: 'QVBR 模式的目标质量级别 (0–51)。数值越低画质越高，编码器自动调节码率以匹配此目标。',
    effects: { quality: 5, fileSize: 3, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c' }],
  },
  'expl.av1_amf.qvbr.bitrate': {
    id: 'expl.av1_amf.qvbr.bitrate',
    title: 'av1_amf QVBR 码率上限',
    short: 'QVBR 模式下的码率上限约束，防止简单场景自动使用过高码率。',
    effects: { quality: 0, fileSize: 4, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c' }],
  },
  'expl.av1_amf.asyncDepth': {
    id: 'expl.av1_amf.asyncDepth',
    title: 'av1_amf 异步编码深度',
    short: '控制硬件编码队列深度 (1–64)。较高值可提高 GPU 利用率，但会增加编码延迟。默认 4。',
    effects: { quality: 0, fileSize: 0, speed: 3, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/amfenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/amfenc_av1.c' }],
  },

  // ================================================================
  // av1_nvenc — NVIDIA NVENC AV1 硬件编码器
  // ================================================================

  'expl.av1_nvenc': {
    id: 'expl.av1_nvenc',
    title: 'av1_nvenc (NVIDIA NVENC AV1)',
    short: 'NVIDIA NVENC 硬件 AV1 编码器。需 RTX 4060+ (Ada Lovelace) 或更新 GPU，支持 CQ/CQP/VBR/CBR 四种模式及无损编码。',
    detail: 'av1_nvenc 利用 NVIDIA GPU 第 8 代 NVENC 编码单元进行 AV1 硬件加速编码。相比 H.264/HEVC 方案，AV1 在同等码率下可提升 30% 以上画质。支持 p1–p7 七档预设、hq/ll/ull/lossless 四种 tune，以及完整的空间/时间自适应量化、前瞻码控与 2-pass 编码。',
    effects: { quality: 4, fileSize: 3, speed: 5, compatibility: 3 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official', url: 'https://developer.nvidia.com/video-codec-sdk' }],
  },
  'expl.av1_nvenc.preset': {
    id: 'expl.av1_nvenc.preset',
    title: 'av1_nvenc 编码预设',
    short: 'p1 最快 p7 最慢。较高预设使用更多 GPU 编码资源进行精细运动估计和模式决策，提升压缩效率。',
    effects: { quality: 3, fileSize: 3, speed: 5, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.profile': {
    id: 'expl.av1_nvenc.profile',
    title: 'av1_nvenc 编码配置',
    short: 'AV1 码流配置。main 为 8-bit 4:2:0 标准配置，auto 由编码器自行选择。',
    effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 4 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.tune': {
    id: 'expl.av1_nvenc.tune',
    title: 'av1_nvenc 场景优化',
    short: 'hq 偏向高质量；ll/ull 降低编码延迟；lossless 为数学无损模式。根据使用场景选择。',
    effects: { quality: 2, fileSize: 2, speed: 3, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.pixfmt': {
    id: 'expl.av1_nvenc.pixfmt',
    title: 'av1_nvenc 像素格式',
    short: 'yuv420p 为 8-bit 标准格式；p010le 用于 10-bit 高色深编码。auto 自动匹配输入。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },

  // av1_nvenc quality modes
  'expl.av1_nvenc.cq': {
    id: 'expl.av1_nvenc.cq',
    title: 'av1_nvenc CQ 模式',
    short: 'NVENC 恒定质量模式——使用 -rc vbr + -cq 组合，在保证目标质量的前提下让编码器自动调节码率分配。推荐值 18–28。',
    commandExample: '-rc vbr -cq 23',
    effects: { quality: 5, fileSize: 2, speed: 4, compatibility: 5 },
    sourceRefs: [{ repository: 'NVIDIA/Video_Codec_SDK', snapshotDate: '2026-07-10', file: 'NVENC_Programming_Guide.pdf', sourceType: 'encoder-official', url: 'https://developer.nvidia.com/video-codec-sdk' }],
  },
  'expl.av1_nvenc.cq.value': {
    id: 'expl.av1_nvenc.cq.value',
    title: 'av1_nvenc CQ 值',
    short: '恒定质量参数 (1–51)。18 为视觉无损，23 为默认平衡，28 为一般质量。数值越低画质越高。',
    effects: { quality: 5, fileSize: 4, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.cqp': {
    id: 'expl.av1_nvenc.cqp',
    title: 'av1_nvenc CQP 模式',
    short: '恒定量化参数模式——使用 -rc constqp，所有帧使用相同的 QP 值。适合需要精确控制每帧质量的场景。',
    commandExample: '-rc constqp -qp 23',
    effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.cqp.value': {
    id: 'expl.av1_nvenc.cqp.value',
    title: 'av1_nvenc CQP QP 值',
    short: '全帧统一的量化参数 (0–51)。适中的 QP 值（20–25）在体积与画质间取得平衡。',
    effects: { quality: 5, fileSize: 4, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.vbr': {
    id: 'expl.av1_nvenc.vbr',
    title: 'av1_nvenc VBR 模式',
    short: '可变码率模式——目标码率控制平均体积，配合 maxrate 和 bufsize 约束码率峰值。',
    commandExample: '-rc vbr -b:v 5000k -maxrate 8000k -bufsize 16000k',
    effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.vbr.bitrate': {
    id: 'expl.av1_nvenc.vbr.bitrate',
    title: 'av1_nvenc VBR 目标码率',
    short: 'VBR 模式下的视频平均目标码率。AV1 编码效率高，同等画质下可用比 H.264 低 30%–50% 的码率。',
    effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.vbr.maxrate': {
    id: 'expl.av1_nvenc.vbr.maxrate',
    title: 'av1_nvenc VBR 最大码率',
    short: '限制编码器瞬时输出的最高码率值。建议设为目标码率的 1.5–2 倍。',
    effects: { quality: 2, fileSize: 3, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.vbr.bufsize': {
    id: 'expl.av1_nvenc.vbr.bufsize',
    title: 'av1_nvenc VBR 缓冲区',
    short: '码率控制缓冲大小。通常设为 maxrate 的 1.5–2 倍，缓冲越大码率波动越灵活。',
    effects: { quality: 1, fileSize: 2, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.cbr': {
    id: 'expl.av1_nvenc.cbr',
    title: 'av1_nvenc CBR 模式',
    short: '恒定码率模式——码率全程保持稳定，适合直播推流或带宽严格受限的场景。',
    commandExample: '-rc cbr -b:v 5000k',
    effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.cbr.bitrate': {
    id: 'expl.av1_nvenc.cbr.bitrate',
    title: 'av1_nvenc CBR 目标码率',
    short: 'CBR 模式下恒定的目标码率。应设为带宽上限的 80%–90% 以留出网络协议开销余量。',
    effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },

  // av1_nvenc special parameters
  'expl.av1_nvenc.gpu': {
    id: 'expl.av1_nvenc.gpu',
    title: 'av1_nvenc GPU 设备索引',
    short: '多 GPU 系统中指定使用哪张显卡 (0–7)。单卡系统保持默认 0。',
    effects: { quality: 0, fileSize: 0, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.rcLookahead': {
    id: 'expl.av1_nvenc.rcLookahead',
    title: 'av1_nvenc 码率控制前瞻',
    short: '让编码器提前分析 0–32 帧未来内容以优化码率分配。提高画质但增加编码延迟和 GPU 内存。',
    effects: { quality: 3, fileSize: 1, speed: 2, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.lookaheadLevel': {
    id: 'expl.av1_nvenc.lookaheadLevel',
    title: 'av1_nvenc 前瞻等级',
    short: '控制前瞻分析的深度 (0–15)，较高级别执行更详细的预分析。仅在启用 rcLookahead 时生效。',
    effects: { quality: 2, fileSize: 1, speed: 2, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.spatialAq': {
    id: 'expl.av1_nvenc.spatialAq',
    title: 'av1_nvenc 空间自适应量化',
    short: '根据画面空间复杂度自动调整量化参数——平坦区域使用更精细的量化，纹理丰富区域适当放宽，提升主观画质。',
    effects: { quality: 3, fileSize: 1, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.temporalAq': {
    id: 'expl.av1_nvenc.temporalAq',
    title: 'av1_nvenc 时间自适应量化',
    short: '根据帧间运动和时间变化调整量化参数——运动场景动态调整 QP 以维持画质一致性。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.bf': {
    id: 'expl.av1_nvenc.bf',
    title: 'av1_nvenc 最大 B 帧数',
    short: '设置两个参考帧之间插入的最大连续 B 帧数 (0–4)。更多 B 帧提升压缩效率但增加编码复杂度。',
    effects: { quality: 1, fileSize: 2, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.bRefMode': {
    id: 'expl.av1_nvenc.bRefMode',
    title: 'av1_nvenc B 帧参考模式',
    short: '控制 B 帧是否可作为后续帧的参考。each 每帧均可参考（最高压缩效率）；middle 仅中间帧；disabled 关闭。',
    effects: { quality: 2, fileSize: 2, speed: 2, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.noScenecut': {
    id: 'expl.av1_nvenc.noScenecut',
    title: 'av1_nvenc 关闭场景检测',
    short: '关闭编码器自动场景切换检测。开启后所有关键帧将严格按照 GOP 间隔插入，不做自适应场景切换。',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.forcedIdr': {
    id: 'expl.av1_nvenc.forcedIdr',
    title: 'av1_nvenc 强制 IDR 关键帧',
    short: '在每个关键帧位置强制输出 IDR 帧（即时解码刷新），而非普通 I 帧。提升 seek 性能且允许解码器在关键帧处完全重置。',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.strictGop': {
    id: 'expl.av1_nvenc.strictGop',
    title: 'av1_nvenc 严格 GOP 结构',
    short: '强制编码器严格遵守设定的 GOP 大小和结构，不因场景切换等内容变化而调整 GOP 边界。',
    effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.twopass': {
    id: 'expl.av1_nvenc.twopass',
    title: 'av1_nvenc 2-pass 编码',
    short: '启用 NVENC 内置两遍编码模式——首次遍历收集统计信息，第二遍优化码率分配。提升画质但增加编码时间。',
    effects: { quality: 3, fileSize: 2, speed: 3, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.surfaces': {
    id: 'expl.av1_nvenc.surfaces',
    title: 'av1_nvenc 内部 Surface 数',
    short: 'NVENC 内部分配的解码 Surface 数量 (0–64)。较高的值提升并行度但增加 GPU 内存占用。默认 32。',
    effects: { quality: 0, fileSize: 0, speed: 2, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.delay': {
    id: 'expl.av1_nvenc.delay',
    title: 'av1_nvenc 编码延迟帧数',
    short: '编码器内部延迟帧数 (0–120)。较高的值允许编码器参考更多未来帧，提升压缩效率但增加延迟。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.initQpP': {
    id: 'expl.av1_nvenc.initQpP',
    title: 'av1_nvenc 初始 P 帧 QP',
    short: '编码开始时 P 帧的初始量化参数 (-1 到 51)。-1 表示由编码器自行决定。',
    effects: { quality: 3, fileSize: 2, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.initQpB': {
    id: 'expl.av1_nvenc.initQpB',
    title: 'av1_nvenc 初始 B 帧 QP',
    short: '编码开始时 B 帧的初始量化参数 (-1 到 51)。通常在 P 帧 QP 基础上增加 1–3。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.initQpI': {
    id: 'expl.av1_nvenc.initQpI',
    title: 'av1_nvenc 初始 I 帧 QP',
    short: '编码开始时 I 帧的初始量化参数 (-1 到 51)。I 帧 QP 通常低于 P/B 帧以保留关键帧质量。',
    effects: { quality: 3, fileSize: 2, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.qpCbOffset': {
    id: 'expl.av1_nvenc.qpCbOffset',
    title: 'av1_nvenc Cb 色度 QP 偏移',
    short: '对 Cb（蓝色差）通道的 QP 偏移 (-12 到 12)。负值提升蓝色保真度但增加该通道码率。',
    effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.qpCrOffset': {
    id: 'expl.av1_nvenc.qpCrOffset',
    title: 'av1_nvenc Cr 色度 QP 偏移',
    short: '对 Cr（红色差）通道的 QP 偏移 (-12 到 12)。负值提升红色保真度但增加该通道码率。',
    effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.weightedPred': {
    id: 'expl.av1_nvenc.weightedPred',
    title: 'av1_nvenc 加权预测',
    short: '允许编码器在帧间预测时使用加权参考帧（而非等权平均），对淡入淡出和亮度渐变场景可提升压缩效率。',
    effects: { quality: 1, fileSize: 1, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.a53cc': {
    id: 'expl.av1_nvenc.a53cc',
    title: 'av1_nvenc 隐藏字幕',
    short: '启用 ATSC A/53 Part 4 隐藏字幕 SEI 消息写入。用于广播和流媒体场景的字幕合规性。',
    effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.aud': {
    id: 'expl.av1_nvenc.aud',
    title: 'av1_nvenc AU 分隔符',
    short: '在每个 Access Unit（编码帧）前插入分隔符 NAL。提升码流的随机访问能力和流媒体兼容性。',
    effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.tileRows': {
    id: 'expl.av1_nvenc.tileRows',
    title: 'av1_nvenc Tile 行数',
    short: 'AV1 编码时画面纵向 tile 分区数 (0–4)。更多 tile 提升并行解码能力但略微降低压缩效率。',
    effects: { quality: 0, fileSize: 0, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.tileCols': {
    id: 'expl.av1_nvenc.tileCols',
    title: 'av1_nvenc Tile 列数',
    short: 'AV1 编码时画面横向 tile 分区数 (0–4)。结合 tile_rows 实现灵活的多核并行解码。',
    effects: { quality: 0, fileSize: 0, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },
  'expl.av1_nvenc.highBitDepth': {
    id: 'expl.av1_nvenc.highBitDepth',
    title: 'av1_nvenc 10-bit 编码',
    short: '启用 10-bit 色深编码模式，减少色带效应（banding）并提升渐变画面的平滑度。需配合 p010le 像素格式。',
    effects: { quality: 3, fileSize: 2, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/nvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/nvenc_av1.c' }],
  },

  // ================================================================
  // av1_qsv — Intel QSV AV1 硬件编码器
  // ================================================================

  'expl.av1_qsv': {
    id: 'expl.av1_qsv',
    title: 'av1_qsv (Intel QSV AV1)',
    short: 'Intel QSV 硬件 AV1 编码器。需 Intel Arc 独显或 Meteor Lake+ 处理器，提供 ICQ/CQP/VBR/CBR/QVBR 五种码率控制模式。',
    detail: 'av1_qsv 利用 Intel GPU 内置的 AV1 硬件编码单元，通过 Intel Media Driver (iHD) 或 oneVPL 运行时进行 AV1 编码。支持 veryfast–veryslow 七档预设、main/main10 配置、完整的自适应帧类型与 RDO 控制以及低功耗/低延迟模式。',
    effects: { quality: 3, fileSize: 2, speed: 5, compatibility: 2 },
    sourceRefs: [{ repository: 'Intel/media-driver', snapshotDate: '2026-07-10', file: 'README.md', sourceType: 'encoder-official', url: 'https://github.com/intel/media-driver' }],
  },
  'expl.av1_qsv.preset': {
    id: 'expl.av1_qsv.preset',
    title: 'av1_qsv 编码预设',
    short: 'veryfast 到 veryslow 七档速度与质量平衡。较慢预设使用更多 GPU 计算资源进行精细运动搜索。',
    effects: { quality: 3, fileSize: 3, speed: 5, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.profile': {
    id: 'expl.av1_qsv.profile',
    title: 'av1_qsv 编码配置',
    short: 'main 为 8-bit 4:2:0；main10 支持 10-bit 色深。10-bit 可有效减少色带效应。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.pixfmt': {
    id: 'expl.av1_qsv.pixfmt',
    title: 'av1_qsv 像素格式',
    short: 'nv12 为 8-bit 硬件原生格式；p010le 用于 10-bit 编码。auto 自动匹配输入像素格式。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },

  // av1_qsv quality modes
  'expl.av1_qsv.icq': {
    id: 'expl.av1_qsv.icq',
    title: 'av1_qsv ICQ 模式',
    short: 'Intel 智能恒定质量模式——QSV 特有算法，在保证主观画质的前提下智能分配码率。推荐值 18–28。',
    commandExample: '-global_quality 23',
    effects: { quality: 5, fileSize: 2, speed: 4, compatibility: 4 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.icq.value': {
    id: 'expl.av1_qsv.icq.value',
    title: 'av1_qsv ICQ 质量值',
    short: '全局质量参数 (1–51)，控制 ICQ 模式下的目标画质水平。18 为高质量，23 为平衡，28 为一般。',
    effects: { quality: 5, fileSize: 3, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.cqp': {
    id: 'expl.av1_qsv.cqp',
    title: 'av1_qsv CQP 模式',
    short: '恒定量化参数模式——所有帧使用统一的 QP 值。适合需要简单、可预测的量化控制场景。',
    commandExample: '-qp 23',
    effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.cqp.value': {
    id: 'expl.av1_qsv.cqp.value',
    title: 'av1_qsv CQP QP 值',
    short: '统一的量化参数 (0–51)。数值越低画质越高、文件越大。20–25 为常用范围。',
    effects: { quality: 5, fileSize: 4, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.vbr': {
    id: 'expl.av1_qsv.vbr',
    title: 'av1_qsv VBR 模式',
    short: '可变码率模式——目标码率控制平均体积，maxrate 限制瞬时峰值。最通用的码率控制方式。',
    commandExample: '-b:v 5000k -maxrate 8000k -bufsize 16000k',
    effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.vbr.bitrate': {
    id: 'expl.av1_qsv.vbr.bitrate',
    title: 'av1_qsv VBR 目标码率',
    short: 'VBR 模式下的视频平均目标码率。AV1 编码效率远高于 H.264，同等画质可用更低的码率。',
    effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.vbr.maxrate': {
    id: 'expl.av1_qsv.vbr.maxrate',
    title: 'av1_qsv VBR 最大码率',
    short: '限制编码器瞬时输出的最高码率值。建议设为目标码率的 1.5–2 倍。',
    effects: { quality: 2, fileSize: 3, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.vbr.bufsize': {
    id: 'expl.av1_qsv.vbr.bufsize',
    title: 'av1_qsv VBR 缓冲区',
    short: '码率控制缓冲大小。缓冲越大码率波动越灵活，但也会增加编码延迟。默认设为 maxrate 的 2 倍。',
    effects: { quality: 1, fileSize: 2, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.cbr': {
    id: 'expl.av1_qsv.cbr',
    title: 'av1_qsv CBR 模式',
    short: '恒定码率模式——码率保持稳定，适合直播推流或带宽严格受限的传输场景。',
    commandExample: '-b:v 5000k',
    effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.cbr.bitrate': {
    id: 'expl.av1_qsv.cbr.bitrate',
    title: 'av1_qsv CBR 目标码率',
    short: 'CBR 模式下恒定的目标码率。应设为带宽上限的 80%–90% 以留出协议开销余量。',
    effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.qvbr': {
    id: 'expl.av1_qsv.qvbr',
    title: 'av1_qsv QVBR 模式',
    short: '质量可变码率——在保证量化质量的前提下动态分配码率，画质稳定但文件大小不定。',
    commandExample: '-qvbr_quality_level 23 -b:v 5000k',
    effects: { quality: 4, fileSize: 2, speed: 3, compatibility: 4 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.qvbr.level': {
    id: 'expl.av1_qsv.qvbr.level',
    title: 'av1_qsv QVBR 质量级别',
    short: 'QVBR 模式的目标质量级别 (0–51)。编码器根据此目标自动调节码率——低值→高画质→大文件。',
    effects: { quality: 5, fileSize: 3, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.qvbr.bitrate': {
    id: 'expl.av1_qsv.qvbr.bitrate',
    title: 'av1_qsv QVBR 码率上限',
    short: 'QVBR 模式下的码率上限约束，防止简单场景使用过高码率浪费存储空间。',
    effects: { quality: 0, fileSize: 4, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },

  // av1_qsv special parameters
  'expl.av1_qsv.asyncDepth': {
    id: 'expl.av1_qsv.asyncDepth',
    title: 'av1_qsv 异步编码深度',
    short: 'QSV 硬件编码队列深度 (1–255)。较高值提高 GPU 利用率但增加编码延迟和内存占用。默认 4。',
    effects: { quality: 0, fileSize: 0, speed: 3, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.lowPower': {
    id: 'expl.av1_qsv.lowPower',
    title: 'av1_qsv 低功耗模式',
    short: '启用 QSV 低功耗编码路径——使用 GPU EU 效率核而非性能核，牺牲速度换取更低功耗。',
    effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.bf': {
    id: 'expl.av1_qsv.bf',
    title: 'av1_qsv 最大 B 帧数',
    short: '设置两参考帧之间的最大连续 B 帧数 (0–7)。更多 B 帧提升压缩效率但增加编码和解码复杂度。',
    effects: { quality: 1, fileSize: 2, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.gopSize': {
    id: 'expl.av1_qsv.gopSize',
    title: 'av1_qsv GOP 大小',
    short: '关键帧之间的最大帧数 (1–1000)。较小 GOP 提升 seek 精度但降低压缩效率。默认约 250 帧。',
    effects: { quality: 1, fileSize: 1, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.refs': {
    id: 'expl.av1_qsv.refs',
    title: 'av1_qsv 参考帧数',
    short: '编码器可用的最大参考帧数量 (1–16)。更多参考帧提升质量但增加 GPU 内存占用。',
    effects: { quality: 2, fileSize: 1, speed: 2, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.adaptiveI': {
    id: 'expl.av1_qsv.adaptiveI',
    title: 'av1_qsv 自适应 I 帧',
    short: '允许编码器根据画面内容自动决定何时插入 I 帧，而非严格按 GOP 间隔。通常配合场景检测使用。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.adaptiveB': {
    id: 'expl.av1_qsv.adaptiveB',
    title: 'av1_qsv 自适应 B 帧',
    short: '允许编码器根据内容动态调整 B 帧放置策略，在运动复杂区域减少 B 帧、静态区域增加 B 帧。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.bStrategy': {
    id: 'expl.av1_qsv.bStrategy',
    title: 'av1_qsv B 帧放置策略',
    short: 'B 帧插入算法选择。0 为传统固定模式，1 为自适应模式（按内容复杂度动态调整 B 帧数量）。',
    effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.idrInterval': {
    id: 'expl.av1_qsv.idrInterval',
    title: 'av1_qsv IDR 帧间隔',
    short: '两个连续 IDR 帧之间的最大帧数 (0–9999)。0 表示不使用 IDR。IDR 帧支持随机访问但比普通 I 帧开销更大。',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.intRefType': {
    id: 'expl.av1_qsv.intRefType',
    title: 'av1_qsv 帧内刷新类型',
    short: 'Intra Refresh 策略——使用水平或垂直条带逐步刷新画面，避免 IDR 帧突发码率峰值。none 关闭。',
    effects: { quality: 1, fileSize: 1, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.intRefCycleSize': {
    id: 'expl.av1_qsv.intRefCycleSize',
    title: 'av1_qsv 帧内刷新周期',
    short: 'Intra Refresh 一个完整刷新周期的帧数 (1–9999)。周期越短刷新越快但编码效率损失越大。',
    effects: { quality: 0, fileSize: 1, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.maxFrameSize': {
    id: 'expl.av1_qsv.maxFrameSize',
    title: 'av1_qsv 最大帧体积',
    short: '限制单帧编码输出的最大字节数 (0–52428800)。0 关闭限制。对网络传输的场景可防止单帧过大导致缓冲溢出。',
    effects: { quality: 0, fileSize: 2, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.maxSliceSize': {
    id: 'expl.av1_qsv.maxSliceSize',
    title: 'av1_qsv 最大 Slice 体积',
    short: '限制单个 Slice 的最大字节数 (0–52428800)。控制 Slice 大小有助于低延迟传输。',
    effects: { quality: 0, fileSize: 1, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.mbbrc': {
    id: 'expl.av1_qsv.mbbrc',
    title: 'av1_qsv 宏块级码控',
    short: '启用宏块级别（而非帧级别）的码率控制，对每个宏块进行更精细的码率分配。提升画质但增加计算开销。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.extbrc': {
    id: 'expl.av1_qsv.extbrc',
    title: 'av1_qsv 扩展码率控制',
    short: '启用 QSV 扩展码率控制算法，提供比默认 BRC 更精细的码率分配。对高复杂度内容效果更明显。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.scenario': {
    id: 'expl.av1_qsv.scenario',
    title: 'av1_qsv 使用场景',
    short: '告知编码器内容的预期用途——display 偏向画质；game 偏向低延迟；archive 偏向高压缩率。',
    effects: { quality: 2, fileSize: 2, speed: 2, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.lookAheadDepth': {
    id: 'expl.av1_qsv.lookAheadDepth',
    title: 'av1_qsv 前瞻深度',
    short: '编码器预分析的未来帧数 (0–100)。较高的值提升码率控制精度，但增加 GPU 内存占用和编码延迟。',
    effects: { quality: 3, fileSize: 1, speed: 2, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.avbrAccuracy': {
    id: 'expl.av1_qsv.avbrAccuracy',
    title: 'av1_qsv AVBR 精度',
    short: 'AVBR（自适应可变码率）模式下码率目标的精度权重 (0–65535)。较高值更严格地匹配目标码率。',
    effects: { quality: 1, fileSize: 2, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.avbrConvergence': {
    id: 'expl.av1_qsv.avbrConvergence',
    title: 'av1_qsv AVBR 收敛速度',
    short: 'AVBR 模式下码率向目标收敛的速度 (0–65535)。较高值更快收敛但可能引发短暂画质波动。',
    effects: { quality: 1, fileSize: 2, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.picTimingSei': {
    id: 'expl.av1_qsv.picTimingSei',
    title: 'av1_qsv 图像时序 SEI',
    short: '在码流中写入 Picture Timing SEI 消息，记录每帧的呈现时间戳信息。用于广播级时码精确性。',
    effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.recoveryPointSei': {
    id: 'expl.av1_qsv.recoveryPointSei',
    title: 'av1_qsv 恢复点 SEI',
    short: '在随机访问点后写入 Recovery Point SEI 消息，告知解码器从当前帧开始需要多少帧才能完全恢复解码。',
    effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.repeatPps': {
    id: 'expl.av1_qsv.repeatPps',
    title: 'av1_qsv 重复 OBU 头',
    short: '在视频序列中不时重复写入序列头 OBU，保证中途加入的解码器可以有效初始化。对直播场景尤为重要。',
    effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.singleSeiNalUnit': {
    id: 'expl.av1_qsv.singleSeiNalUnit',
    title: 'av1_qsv 单一 SEI NAL',
    short: '将所有 SEI 消息打包到一个 NAL 单元内，而非分散在多个 NAL 中。简化码流解析。',
    effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.rdo': {
    id: 'expl.av1_qsv.rdo',
    title: 'av1_qsv RDO 级别',
    short: '率失真优化级别——0 关闭，1–3 逐渐增强。更高级别在编码决策中更精确地权衡码率与失真，提升压缩效率。',
    effects: { quality: 3, fileSize: 2, speed: 3, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },
  'expl.av1_qsv.lowDelayBrc': {
    id: 'expl.av1_qsv.lowDelayBrc',
    title: 'av1_qsv 低延迟码控',
    short: '启用面向低延迟场景优化的码率控制，减少前瞻缓冲以最小化编码延迟。适合实时交互和直播。',
    effects: { quality: 0, fileSize: 0, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_av1.c' }],
  },

  // ================================================================
  // av1_vulkan — Vulkan Video AV1 编码器（跨厂商）
  // ================================================================

  'expl.av1_vulkan': {
    id: 'expl.av1_vulkan',
    title: 'av1_vulkan (Vulkan Video AV1)',
    short: '跨厂商 Vulkan Video AV1 硬件编码器（FFmpeg 8.0+，实验性）。同一 API 覆盖 NVIDIA/AMD/Intel AV1 硬件，支持 CQP/VBR/CBR。',
    detail: 'av1_vulkan 基于 Khronos VK_KHR_video_encode_av1 扩展，提供跨 GPU 厂商的统一 AV1 硬件编码 API。作为实验性功能，参数相对精简但代表了 GPU 编码的未来标准化方向。当前无 preset/tune/profile 控件，主要依赖像素格式和码率控制模式。实验性编码器，建议生产环境双轨测试后再采用。',
    effects: { quality: 3, fileSize: 2, speed: 4, compatibility: 2 },
    sourceRefs: [{ repository: 'KhronosGroup/Vulkan-Docs', snapshotDate: '2026-07-20', file: 'VK_KHR_video_encode_av1.adoc', sourceType: 'ffmpeg-official', url: 'https://registry.khronos.org/vulkan/specs/latest/man/html/VK_KHR_video_encode_av1.html' }],
  },
  'expl.av1_vulkan.pixfmt': {
    id: 'expl.av1_vulkan.pixfmt',
    title: 'av1_vulkan 像素格式',
    short: 'nv12 为 8-bit 硬件原生格式；p010le 用于 10-bit 编码。auto 自动匹配输入像素格式。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_encode_av1.c' }],
  },

  // av1_vulkan quality modes
  'expl.av1_vulkan.cqp': {
    id: 'expl.av1_vulkan.cqp',
    title: 'av1_vulkan CQP 模式',
    short: '恒定量化参数模式——所有帧使用统一的 QP 值。简单直接的画质控制方式。',
    commandExample: '-qp 23',
    effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_encode_av1.c' }],
  },
  'expl.av1_vulkan.cqp.value': {
    id: 'expl.av1_vulkan.cqp.value',
    title: 'av1_vulkan CQP QP 值',
    short: '统一的量化参数 (0–51)。20 为高质量，23 为平衡，28 为一般。数值越低画质越高。',
    effects: { quality: 5, fileSize: 4, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_encode_av1.c' }],
  },
  'expl.av1_vulkan.vbr': {
    id: 'expl.av1_vulkan.vbr',
    title: 'av1_vulkan VBR 模式',
    short: '可变码率模式——目标码率控制平均体积，maxrate 和 bufsize 约束码率峰值。',
    commandExample: '-b:v 5000k -maxrate 8000k -bufsize 16000k',
    effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_encode_av1.c' }],
  },
  'expl.av1_vulkan.vbr.bitrate': {
    id: 'expl.av1_vulkan.vbr.bitrate',
    title: 'av1_vulkan VBR 目标码率',
    short: 'VBR 模式下的视频平均目标码率。AV1 编码效率远超 H.264/HEVC，同等画质可用更低码率。',
    effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_encode_av1.c' }],
  },
  'expl.av1_vulkan.vbr.maxrate': {
    id: 'expl.av1_vulkan.vbr.maxrate',
    title: 'av1_vulkan VBR 最大码率',
    short: '限制编码器瞬时输出的最高码率。建议设为目标码率的 1.5–2 倍。',
    effects: { quality: 2, fileSize: 3, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_encode_av1.c' }],
  },
  'expl.av1_vulkan.vbr.bufsize': {
    id: 'expl.av1_vulkan.vbr.bufsize',
    title: 'av1_vulkan VBR 缓冲区',
    short: '码率控制缓冲大小。通常设为 maxrate 的 2 倍。缓冲越大码率波动越灵活。',
    effects: { quality: 1, fileSize: 2, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_encode_av1.c' }],
  },
  'expl.av1_vulkan.cbr': {
    id: 'expl.av1_vulkan.cbr',
    title: 'av1_vulkan CBR 模式',
    short: '恒定码率模式——码率全程保持稳定，适合带宽严格受限的实时传输场景。',
    commandExample: '-b:v 5000k',
    effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_encode_av1.c' }],
  },
  'expl.av1_vulkan.cbr.bitrate': {
    id: 'expl.av1_vulkan.cbr.bitrate',
    title: 'av1_vulkan CBR 目标码率',
    short: 'CBR 模式下恒定的目标码率。应设为带宽上限的 80%–90% 以留出网络开销余量。',
    effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_encode_av1.c' }],
  },

  // av1_vulkan special parameters
  'expl.av1_vulkan.gopSize': {
    id: 'expl.av1_vulkan.gopSize',
    title: 'av1_vulkan GOP 大小',
    short: '关键帧之间的最大帧数 (1–1000)。较小 GOP 提升 seek 精度但降低压缩效率。',
    effects: { quality: 1, fileSize: 1, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_encode_av1.c' }],
  },
  'expl.av1_vulkan.bf': {
    id: 'expl.av1_vulkan.bf',
    title: 'av1_vulkan 最大 B 帧数',
    short: '两个参考帧之间的最大连续 B 帧数 (0–4)。更多 B 帧提升压缩效率但增加编码复杂度。默认 2。',
    effects: { quality: 1, fileSize: 2, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_encode_av1.c' }],
  },
  'expl.av1_vulkan.refs': {
    id: 'expl.av1_vulkan.refs',
    title: 'av1_vulkan 参考帧数',
    short: '编码器可用的最大参考帧数量 (1–8)。更多参考帧提升质量但增加 GPU 内存占用。',
    effects: { quality: 2, fileSize: 1, speed: 2, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_encode_av1.c' }],
  },
  'expl.av1_vulkan.asyncDepth': {
    id: 'expl.av1_vulkan.asyncDepth',
    title: 'av1_vulkan 异步编码深度',
    short: '硬件编码队列深度 (1–64)。较高值提高 GPU 利用率但增加编码延迟。默认 4。',
    effects: { quality: 0, fileSize: 0, speed: 3, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_encode_av1.c' }],
  },
  'expl.av1_vulkan.tileRows': {
    id: 'expl.av1_vulkan.tileRows',
    title: 'av1_vulkan Tile 行数',
    short: 'AV1 编码时画面纵向 tile 分区数 (0–4)。更多 tile 提升并行解码能力但略微降低压缩效率。',
    effects: { quality: 0, fileSize: 0, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_encode_av1.c' }],
  },
  'expl.av1_vulkan.tileCols': {
    id: 'expl.av1_vulkan.tileCols',
    title: 'av1_vulkan Tile 列数',
    short: 'AV1 编码时画面横向 tile 分区数 (0–4)。结合 tile_rows 优化多核并行解码效率。',
    effects: { quality: 0, fileSize: 0, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_av1.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_encode_av1.c' }],
  },

  // ================================================================
  // librav1e — Rust AV1 CPU 编码器
  // ================================================================

  'expl.librav1e': {
    id: 'expl.librav1e',
    title: 'librav1e (Rust AV1)',
    short: 'Rust 实现的 AV1 CPU 软件编码器（BSD 许可）。画质介于 libaom-av1 和 libsvtav1 之间，支持 CQP/VBR 及丰富的编码控制。',
    detail: 'librav1e 基于 Xiph 的 rav1e 库，以安全性和可维护性为核心设计原则。相比 libaom-av1 速度更快，相比 libsvtav1 在某些场景下画质更优。使用 -speed 0–10 控制编码速度（0 最慢、10 最快、6 为默认），支持 tile 多线程、低延迟模式和丰富的附加参数。',
    effects: { quality: 3, fileSize: 3, speed: 3, compatibility: 4 },
    sourceRefs: [{ repository: 'xiph/rav1e', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official', url: 'https://github.com/xiph/rav1e' }],
  },
  'expl.librav1e.pixfmt': {
    id: 'expl.librav1e.pixfmt',
    title: 'librav1e 像素格式',
    short: '支持 yuv420p、yuv422p、yuv444p 及对应 10-bit 版本。丰富的色度采样支持是 rav1e 的特色。',
    effects: { quality: 2, fileSize: 2, speed: 1, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/librav1e.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/librav1e.c' }],
  },

  // librav1e quality modes
  'expl.librav1e.cqp': {
    id: 'expl.librav1e.cqp',
    title: 'librav1e CQP 模式',
    short: '恒定量化参数模式——rav1e 的 QP 范围 0–255（注意：此范围与 x264/x265 的 0–51 不同）。推荐值约 100。',
    commandExample: '-qp 100',
    effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 },
    sourceRefs: [{ repository: 'xiph/rav1e', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official', url: 'https://github.com/xiph/rav1e' }],
  },
  'expl.librav1e.cqp.value': {
    id: 'expl.librav1e.cqp.value',
    title: 'librav1e CQP QP 值',
    short: 'rav1e 量化参数 (0–255)。默认 100。注意 rav1e 的 QP 标度与其他编码器不同——100 约等于 x264 CRF 23。',
    effects: { quality: 5, fileSize: 4, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/librav1e.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/librav1e.c' }],
  },
  'expl.librav1e.vbr': {
    id: 'expl.librav1e.vbr',
    title: 'librav1e VBR 模式',
    short: '可变码率模式——指定目标码率，编码器自动在不同复杂度场景间分配码率。',
    commandExample: '-b:v 5000k',
    effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/librav1e.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/librav1e.c' }],
  },
  'expl.librav1e.vbr.bitrate': {
    id: 'expl.librav1e.vbr.bitrate',
    title: 'librav1e VBR 目标码率',
    short: 'VBR 模式下的视频平均目标码率。AV1 的高效率使得同等画质下所需码率远低于 H.264。',
    effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/librav1e.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/librav1e.c' }],
  },

  // librav1e special parameters
  'expl.librav1e.speed': {
    id: 'expl.librav1e.speed',
    title: 'librav1e 编码速度',
    short: 'rav1e 的速度预设 (0–10)。0 最慢但压缩率最高，10 最快但文件较大。默认 6 提供良好的速度/压缩平衡。',
    effects: { quality: 2, fileSize: 3, speed: 5, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/librav1e.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/librav1e.c' }],
  },
  'expl.librav1e.tileColumns': {
    id: 'expl.librav1e.tileColumns',
    title: 'librav1e Tile 列数',
    short: 'log2 形式指定 tile 列数 (0–4)。如 2 表示 4 列 tile。更多 tile 提升多核并行编码效率。',
    effects: { quality: 0, fileSize: 0, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/librav1e.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/librav1e.c' }],
  },
  'expl.librav1e.tileRows': {
    id: 'expl.librav1e.tileRows',
    title: 'librav1e Tile 行数',
    short: 'log2 形式指定 tile 行数 (0–4)。如 1 表示 2 行 tile。结合 tile-columns 实现二维 tile 网格。',
    effects: { quality: 0, fileSize: 0, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/librav1e.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/librav1e.c' }],
  },
  'expl.librav1e.tiles': {
    id: 'expl.librav1e.tiles',
    title: 'librav1e Tile 总数',
    short: '编码器使用的 tile 总数 (1–64)。较大的值通过增加并行度提升编码速度，但过多的 tile 会降低压缩效率。',
    effects: { quality: 0, fileSize: 0, speed: 3, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/librav1e.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/librav1e.c' }],
  },
  'expl.librav1e.keyint': {
    id: 'expl.librav1e.keyint',
    title: 'librav1e 关键帧间隔',
    short: '两个关键帧之间的最大帧数 (1–1000)。较小值提升 seek 精度但降低压缩效率。默认帧率的 10 倍。',
    effects: { quality: 1, fileSize: 1, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/librav1e.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/librav1e.c' }],
  },
  'expl.librav1e.lowLatency': {
    id: 'expl.librav1e.lowLatency',
    title: 'librav1e 低延迟模式',
    short: '优化编码流程以降低编码延迟（帧重排序缓冲）。对实时编码和直播场景减小编码管道延迟。',
    effects: { quality: 0, fileSize: 0, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/librav1e.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/librav1e.c' }],
  },
  'expl.librav1e.rav1eparams': {
    id: 'expl.librav1e.rav1eparams',
    title: 'librav1e 附加参数',
    short: '传递键值对参数给底层 rav1e 库，使用冒号分隔（如 key1=value1:key2=value2）。适用所有 rav1e 原生 CLI 参数。',
    effects: { quality: 2, fileSize: 2, speed: 2, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/librav1e.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/librav1e.c' }],
  },
// New explanation entries for P1 encoders (VP8→ProRes)
// This file is concatenated into src/data/explanations/index.ts

  // ================================================================
  // libvpx-vp9 — Google libvpx VP9 编码器
  // ================================================================

  'expl.libvpx-vp9': {
    id: 'expl.libvpx-vp9',
    title: 'libvpx-vp9 (Google libvpx VP9)',
    short: 'Google 官方 VP9 CPU 软件编码器。需 --enable-libvpx 编译，适合 YouTube 上传和 Web 流媒体生态。10/12-bit 需要额外 --enable-vp9-highbitdepth。',
    detail: 'libvpx-vp9 是 VP9 编解码格式的参考实现，由 Google WebM 项目维护。VP9 在 YouTube、Netflix 等平台大量使用，是 Web 生态中 AV1 之外的最佳通用编码。支持 CRF/VBR/CBR/2-Pass/Lossless 五种模式，通过 -cpu-used (-8 到 8)、-deadline (realtime/good/best) 和丰富的自适应量化参数控制编码行为。',
    effects: { quality: 4, fileSize: 3, speed: 2, compatibility: 4 },
    sourceRefs: [{ repository: 'webmproject/libvpx', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official', url: 'https://chromium.googlesource.com/webm/libvpx/' }],
  },
  'expl.libvpx-vp9.pixfmt': {
    id: 'expl.libvpx-vp9.pixfmt',
    title: 'libvpx-vp9 像素格式',
    short: '支持 8/10/12-bit 和 4:2:0/4:2:2/4:4:4 色度采样，是 VP9 相比 VP8 在色彩方面的主要升级之一。',
    effects: { quality: 2, fileSize: 2, speed: 1, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.crf': {
    id: 'expl.libvpx-vp9.crf',
    title: 'libvpx-vp9 CRF 模式',
    short: '恒定质量模式——使用 -crf 0–63 控制画质（需配合 -b:v 0）。推荐值 15（高质量）–39（一般质量），默认 31。',
    commandExample: '-crf 31 -b:v 0',
    effects: { quality: 5, fileSize: 2, speed: 3, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.crf.value': {
    id: 'expl.libvpx-vp9.crf.value',
    title: 'VP9 CRF 值',
    short: '恒定质量参数 (0–63)。与 x264 CRF (0–51) 不同——VP9 的 31 约等于 x264 的 23。数值越低画质越高。',
    effects: { quality: 5, fileSize: 3, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.vbr': {
    id: 'expl.libvpx-vp9.vbr',
    title: 'libvpx-vp9 VBR 模式',
    short: '可变码率模式——目标码率控制平均体积，可配合 minrate/maxrate 约束波动范围。VP9 编码效率远高于 H.264。',
    commandExample: '-b:v 2000k -minrate 1000k -maxrate 4000k',
    effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.vbr.bitrate': {
    id: 'expl.libvpx-vp9.vbr.bitrate',
    title: 'VP9 VBR 目标码率',
    short: 'VBR 模式下的视频平均目标码率。VP9 的压缩效率约为 H.264 的 2 倍——2000k VP9 约等于 4000k H.264 画质。',
    effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.vbr.minrate': {
    id: 'expl.libvpx-vp9.vbr.minrate',
    title: 'VP9 VBR 最小码率',
    short: '限制编码器在简单场景下的最低输出码率。防止静态/全黑场景出现解码缓冲下溢。通常设为目标码率的 40%–50%。',
    effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.vbr.maxrate': {
    id: 'expl.libvpx-vp9.vbr.maxrate',
    title: 'VP9 VBR 最大码率',
    short: '限制编码器瞬时输出的最高码率值。防止复杂场景码率峰值超过传输或解码能力。',
    effects: { quality: 2, fileSize: 3, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.cbr': {
    id: 'expl.libvpx-vp9.cbr',
    title: 'libvpx-vp9 CBR 模式',
    short: '恒定码率模式——码率保持稳定，适合带宽严格受限的直播推流场景。',
    commandExample: '-b:v 2000k',
    effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.cbr.bitrate': {
    id: 'expl.libvpx-vp9.cbr.bitrate',
    title: 'VP9 CBR 目标码率',
    short: 'CBR 模式下恒定的目标码率。应设为带宽上限的 80%–90% 以留出协议开销余量。',
    effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.twopass': {
    id: 'expl.libvpx-vp9.twopass',
    title: 'libvpx-vp9 2-Pass VBR 模式',
    short: '双遍编码——第一遍分析视频复杂度，第二遍优化码率分配。码率控制比单遍 VBR 更精确，适合文件体积敏感的批处理。',
    commandExample: '-b:v 2000k -pass 1 (第一遍) / -b:v 2000k -pass 2 (第二遍)',
    effects: { quality: 4, fileSize: 3, speed: 4, compatibility: 4 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.twopass.bitrate': {
    id: 'expl.libvpx-vp9.twopass.bitrate',
    title: 'VP9 2-Pass VBR 目标码率',
    short: '双遍 VBR 的目标码率。双遍分析的额外时间换来了更精确的码率控制——文件体积更接近设定值。',
    effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },

  // VP9 special parameters
  'expl.libvpx-vp9.cpuUsed': {
    id: 'expl.libvpx-vp9.cpuUsed',
    title: 'VP9 编码速度 (-cpu-used)',
    short: '编码速度与质量平衡 (-8 到 8)。负数=更高质量更慢（-8 最优），正数=更快但质量下降。0 为默认均衡。',
    effects: { quality: 3, fileSize: 3, speed: 5, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.deadline': {
    id: 'expl.libvpx-vp9.deadline',
    title: 'VP9 编码截止策略 (-deadline)',
    short: '控制编码时间预算——realtime=实时帧率约束、good=质量与速度平衡（默认）、best=最高质量（最慢）。',
    effects: { quality: 3, fileSize: 2, speed: 4, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.rowMt': {
    id: 'expl.libvpx-vp9.rowMt',
    title: 'VP9 行级多线程 (-row-mt)',
    short: '启用基于图像行的多线程编码，大幅提升多核 CPU 利用率。对 4K 编码效果显著，默认开启。',
    effects: { quality: 0, fileSize: 0, speed: 4, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.tileColumns': {
    id: 'expl.libvpx-vp9.tileColumns',
    title: 'VP9 Tile 列数 (-tile-columns)',
    short: 'log2 Tile 列数 (0–6)，如 2 表示 4 列。Tile 是 VP9 的并行编解码基本单元，增加 tile 提升并行度但略微降低压缩效率。',
    effects: { quality: 0, fileSize: 0, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.tileRows': {
    id: 'expl.libvpx-vp9.tileRows',
    title: 'VP9 Tile 行数 (-tile-rows)',
    short: 'log2 Tile 行数 (0–2)。结合 tile-columns 构建二维 tile 网格以优化编解码并行效率。',
    effects: { quality: 0, fileSize: 0, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.frameParallel': {
    id: 'expl.libvpx-vp9.frameParallel',
    title: 'VP9 帧级并行解码 (-frame-parallel)',
    short: '启用帧级并行解码——允许解码器同时处理多个帧。提升播放流畅度但略微增加码率开销。',
    effects: { quality: 0, fileSize: 0, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.autoAltRef': {
    id: 'expl.libvpx-vp9.autoAltRef',
    title: 'VP9 自动 Alt-Ref 帧数 (-auto-alt-ref)',
    short: '自动生成 Alt-Reference 帧（VP9 特有的高质量不可见参考帧）的数量 (0–6)。提升压缩效率，默认 1。',
    effects: { quality: 2, fileSize: 2, speed: 2, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.lagInFrames': {
    id: 'expl.libvpx-vp9.lagInFrames',
    title: 'VP9 前瞻帧数 (-lag-in-frames)',
    short: '多帧 RDO 分析的未来帧前瞻数量 (0–25)。较大的值让编码器做出更全局最优的编码决策，默认 25。',
    effects: { quality: 3, fileSize: 1, speed: 3, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.arnrMaxFrames': {
    id: 'expl.libvpx-vp9.arnrMaxFrames',
    title: 'VP9 Alt-Ref 降噪帧数 (-arnr-max-frames)',
    short: 'Alt-Ref 降噪涉及的最大帧数 (0–15)。ARNR 对 Alt-Ref 帧进行时域降噪，使参考帧更"干净"，提升其他帧的预测效率。',
    effects: { quality: 1, fileSize: 1, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.arnrStrength': {
    id: 'expl.libvpx-vp9.arnrStrength',
    title: 'VP9 Alt-Ref 降噪强度 (-arnr-strength)',
    short: '控制 Alt-Ref 降噪的强度 (0–6)。较高值进一步减少参考帧噪声但可能损失细微纹理。默认 3。',
    effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.aqMode': {
    id: 'expl.libvpx-vp9.aqMode',
    title: 'VP9 自适应量化模式 (-aq-mode)',
    short: '自适应量化策略——0=关闭；1=方差 AQ（平坦区域精细量化，纹理区域放宽）；2=复杂度 AQ（基于编码复杂度的自适应）。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.sharpness': {
    id: 'expl.libvpx-vp9.sharpness',
    title: 'VP9 环路滤波锐度 (-sharpness)',
    short: 'VP9 环路滤波的锐度调整 (0–7)。较高值增强画面锐度，但也可能减少环路滤波的去块效应。',
    effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.keyint': {
    id: 'expl.libvpx-vp9.keyint',
    title: 'VP9 关键帧间隔 (-g)',
    short: '两个关键帧之间的最大帧数。较小值提升 seek 精度但降低压缩效率。默认 128 帧。',
    effects: { quality: 1, fileSize: 1, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.errorResilient': {
    id: 'expl.libvpx-vp9.errorResilient',
    title: 'VP9 错误恢复模式 (-error-resilient)',
    short: '启用码流错误恢复——partition 模式允许解码器在分组包丢失后继续解码后续分区中的帧。对不可靠网络传输场景有益。',
    effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.lossless': {
    id: 'expl.libvpx-vp9.lossless',
    title: 'VP9 无损模式 (-lossless)',
    short: '启用数学意义上的无损编码。输出文件极大但像素精确匹配输入。适合中间存档和需要进一步处理的素材。',
    effects: { quality: 5, fileSize: 5, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx-vp9.threads': {
    id: 'expl.libvpx-vp9.threads',
    title: 'VP9 编码线程 (-threads)',
    short: '明确指定编码线程数。默认自动检测 CPU 核心数。在多路编码场景下可手动限制以避免抢占。',
    effects: { quality: 0, fileSize: 0, speed: 3, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },

  // ================================================================
  // ffv1 — FFmpeg 内置无损编码器（IETF RFC 9043）
  // ================================================================

  'expl.ffv1': {
    id: 'expl.ffv1',
    title: 'ffv1 (FFV1 无损存档编码)',
    short: 'FFmpeg 内置的无损视频编码器（IETF RFC 9043 标准）。被欧洲广播联盟 (EBU) 和美国国会图书馆推荐用于数字存档。版本 3 支持多线程。',
    detail: 'FFV1 是数字存档领域的标准无损编码格式。相比 Huffyuv/FFVHUFF 等旧式无损编码，FFV1 提供了更好的压缩率（通过 Range Coder 和大型上下文模型）以及 Slice CRC 校验保障。IETF 已将 FFV1 版本 1.3 标准化为 RFC 9043。存档最佳实践：level=3 + coder=1 + context=1 + slicecrc=1 + slices=24。',
    effects: { quality: 5, fileSize: 5, speed: 2, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/ffv1enc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/ffv1enc.c' }],
  },
  'expl.ffv1.pixfmt': {
    id: 'expl.ffv1.pixfmt',
    title: 'FFV1 像素格式',
    short: 'FFV1 支持几乎所有常见像素格式——从 8-bit yuv420p 到 16-bit RGBA。这种广泛的格式支持是 FFV1 在存档领域的重要优势。',
    effects: { quality: 3, fileSize: 2, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/ffv1enc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/ffv1enc.c' }],
  },
  'expl.ffv1.default': {
    id: 'expl.ffv1.default',
    title: 'FFV1 默认模式 (无损)',
    short: 'FFV1 始终以数学无损模式编码，输出像素与输入精确一致。没有传统意义上的"质量模式"——编码参数影响压缩比和编码速度，而非画质。',
    effects: { quality: 5, fileSize: 4, speed: 2, compatibility: 4 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/ffv1enc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/ffv1enc.c' }],
  },
  'expl.ffv1.level': {
    id: 'expl.ffv1.level',
    title: 'FFV1 版本 (-level)',
    short: '选择 FFV1 编码版本。1=版本 1.3 (IETF RFC 9043，存档推荐)；3=版本 3.x (支持多线程编码，生产推荐)。',
    effects: { quality: 0, fileSize: 1, speed: 3, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/ffv1enc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/ffv1enc.c' }],
  },
  'expl.ffv1.coder': {
    id: 'expl.ffv1.coder',
    title: 'FFV1 熵编码器 (-coder)',
    short: '选择熵编码算法——0=Golomb Rice（快速）、1=Range Coder（最佳压缩比）、ac=算术编码（实验性）。存档推荐 coder=1。',
    effects: { quality: 0, fileSize: 3, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/ffv1enc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/ffv1enc.c' }],
  },
  'expl.ffv1.context': {
    id: 'expl.ffv1.context',
    title: 'FFV1 上下文模型 (-context)',
    short: '上下文模型大小——0=小型（默认，速度更快）；1=大型（略优压缩率，速度较慢）。存档推荐 context=1。',
    effects: { quality: 0, fileSize: 2, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/ffv1enc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/ffv1enc.c' }],
  },
  'expl.ffv1.slices': {
    id: 'expl.ffv1.slices',
    title: 'FFV1 Slice 数量 (-slices)',
    short: '编码时每帧切分为的独立 Slice 数 (4–24)。每个 Slice 可独立编解码——更多 Slice 提升多线程并行度并在损坏时限制错误扩散。存档推荐 slices=24。',
    effects: { quality: 0, fileSize: 1, speed: 3, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/ffv1enc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/ffv1enc.c' }],
  },
  'expl.ffv1.slicecrc': {
    id: 'expl.ffv1.slicecrc',
    title: 'FFV1 Slice CRC 校验 (-slicecrc)',
    short: '为每个 Slice 添加 CRC 校验和。数字存档必须开启，用于检测存储介质静默损坏。轻微增加编码时间。',
    effects: { quality: 0, fileSize: 0, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/ffv1enc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/ffv1enc.c' }],
  },
  'expl.ffv1.keyint': {
    id: 'expl.ffv1.keyint',
    title: 'FFV1 关键帧间隔 (-g)',
    short: '两个关键帧之间的最大帧数。FFV1 既支持纯帧内（g=1）也支持带 GOP 的有损编码模式。存档通常设 g=1 以获得最强的错误恢复能力。',
    effects: { quality: 0, fileSize: 2, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/ffv1enc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/ffv1enc.c' }],
  },
  'expl.ffv1.threads': {
    id: 'expl.ffv1.threads',
    title: 'FFV1 编码线程 (-threads)',
    short: '指定编码线程数。FFV1 版本 3 的 Slice 级并行依赖充足的线程——每个 Slice 可由独立线程处理。',
    effects: { quality: 0, fileSize: 0, speed: 4, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/ffv1enc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/ffv1enc.c' }],
  },

  // ================================================================
  // prores_ks — Apple ProRes 编码器
  // ================================================================

  'expl.prores_ks': {
    id: 'expl.prores_ks',
    title: 'prores_ks (Apple ProRes)',
    short: 'FFmpeg 内置的 Apple ProRes 编码器。支持所有 ProRes Profile（Proxy 到 4444 XQ），专业视频后期制作的标准中间编码。',
    detail: 'ProRes 是 Apple 开发的专业视频中间编码格式，被 Final Cut Pro、DaVinci Resolve、Adobe Premiere 等非编软件广泛支持。prores_ks 是 FFmpeg 中功能最完整的 ProRes 实现。ProRes 的质量由 profile（0–5）决定——更高的 profile 号意味着更高的码率和更好的质量，从 422 Proxy（~45 Mbps）到 4444 XQ（~500 Mbps）。',
    effects: { quality: 5, fileSize: 5, speed: 3, compatibility: 4 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/proresenc_kostya.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/proresenc_kostya.c' }],
  },
  'expl.prores_ks.profile': {
    id: 'expl.prores_ks.profile',
    title: 'ProRes Profile',
    short: 'ProRes 的质量由 Profile 号决定。0=422 Proxy (~45Mbps)、1=422 LT (~102Mbps)、2=422 默认 (~147Mbps)、3=422 HQ (~220Mbps)、4=4444 (~330Mbps)、5=4444 XQ (~500Mbps)。',
    effects: { quality: 5, fileSize: 5, speed: 1, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/proresenc_kostya.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/proresenc_kostya.c' }],
  },
  'expl.prores_ks.pixfmt': {
    id: 'expl.prores_ks.pixfmt',
    title: 'ProRes 像素格式',
    short: '像素格式由 Profile 决定——422 profiles 对应 yuv422p10le，4444 profiles 对应 yuva444p10le（带 Alpha 通道）。auto 自动匹配。',
    effects: { quality: 2, fileSize: 2, speed: 0, compatibility: 3 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/proresenc_kostya.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/proresenc_kostya.c' }],
  },
  'expl.prores_ks.default': {
    id: 'expl.prores_ks.default',
    title: 'ProRes 质量模式',
    short: 'ProRes 没有 CRF/CQP/VBR 等传统质量模式——编码质量由 Profile 决定。每个 Profile 有固定的目标码率，确保不同编码器/平台生成的 ProRes 文件质量一致。',
    effects: { quality: 5, fileSize: 5, speed: 0, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/proresenc_kostya.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/proresenc_kostya.c' }],
  },
  'expl.prores_ks.vendor': {
    id: 'expl.prores_ks.vendor',
    title: 'ProRes 厂商标识 (-vendor)',
    short: '写入码流的四字符编码器厂商标识（如 "fmpg"、"appl"）。不影响编码质量，仅为元数据标记。',
    effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/proresenc_kostya.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/proresenc_kostya.c' }],
  },
  'expl.prores_ks.quantMat': {
    id: 'expl.prores_ks.quantMat',
    title: 'ProRes 量化矩阵 (-quant_mat)',
    short: '选择量化矩阵——auto 根据 profile 自动选择；可用 discrete 矩阵：proxy、lt、standard、hq。多数场景保持 auto。',
    effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/proresenc_kostya.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/proresenc_kostya.c' }],
  },
  'expl.prores_ks.bitsPerMb': {
    id: 'expl.prores_ks.bitsPerMb',
    title: 'ProRes 每宏块目标比特 (-bits_per_mb)',
    short: '手动控制每宏块最小目标比特数，用于微调 ProRes 码率分配。通常留空（由 profile 自动管理）。',
    effects: { quality: 2, fileSize: 3, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/proresenc_kostya.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/proresenc_kostya.c' }],
  },
  'expl.prores_ks.mbsPerSlice': {
    id: 'expl.prores_ks.mbsPerSlice',
    title: 'ProRes 每 Slice 宏块数 (-mbs_per_slice)',
    short: '控制每个 Slice 包含的宏块数量 (1–8)。更多宏块/Slice 减少总 Slice 数和 Slice 头开销，但降低错误恢复和并行度。默认 8。',
    effects: { quality: 0, fileSize: 1, speed: 1, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/proresenc_kostya.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/proresenc_kostya.c' }],
  },
  'expl.prores_ks.alphaBits': {
    id: 'expl.prores_ks.alphaBits',
    title: 'ProRes Alpha 通道位深 (-alpha_bits)',
    short: '4444 profiles 专用——控制透明度通道的位深。0=无 Alpha；8=8-bit Alpha；16=16-bit Alpha。仅对 4444/4444 XQ Profile 有意义。',
    effects: { quality: 1, fileSize: 2, speed: 0, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/proresenc_kostya.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/proresenc_kostya.c' }],
  },

  // ================================================================
  // libvpx (VP8) — Google libvpx VP8 编码器
  // ================================================================

  'expl.libvpx': {
    id: 'expl.libvpx',
    title: 'libvpx (VP8)',
    short: 'Google libvpx VP8 编码器。需 --enable-libvpx 编译。VP8 主要用于旧式 WebRTC 兼容场景，新项目推荐 VP9 或 AV1。',
    detail: 'VP8 是 Google 在 2010 年发布的开源视频编码格式，曾是 WebRTC 强制视频编码标准。虽然已被 VP9 和 AV1 取代，但在旧式 WebRTC 兼容场景中仍有使用。libvpx 是 VP8/VP9 的共享编码库，VP8 仅支持 8-bit 4:2:0，不支持 tile 编码。',
    effects: { quality: 2, fileSize: 2, speed: 3, compatibility: 3 },
    sourceRefs: [{ repository: 'webmproject/libvpx', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official', url: 'https://chromium.googlesource.com/webm/libvpx/' }],
  },
  'expl.libvpx.cqp': {
    id: 'expl.libvpx.cqp',
    title: 'libvpx VP8 CQP 模式',
    short: '恒定量化参数模式——VP8 的量化参数范围 0–63，默认 10。数值越低画质越高。适合需要均匀质量的编码。',
    commandExample: '-crf 10',
    effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx.cqp.value': {
    id: 'expl.libvpx.cqp.value',
    title: 'VP8 CQP QP 值',
    short: '恒定量化参数 (0–63)。10 为默认值，约等于 VP9 CRF 20–25 的画质水平。',
    effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx.vbr': {
    id: 'expl.libvpx.vbr',
    title: 'libvpx VP8 VBR 模式',
    short: '可变码率模式——目标码率控制平均体积。VP8 编码效率低于 VP9，同等画质需要约 1.5 倍码率。',
    commandExample: '-b:v 1000k',
    effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx.vbr.bitrate': {
    id: 'expl.libvpx.vbr.bitrate',
    title: 'VP8 VBR 目标码率',
    short: 'VBR 模式下的视频平均目标码率。VP8 编码效率较低，1080p 通常需要 2000k–4000k 以保持可接受画质。',
    effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx.twopass': {
    id: 'expl.libvpx.twopass',
    title: 'libvpx VP8 2-Pass 模式',
    short: '双遍编码——第一遍分析视频统计信息，第二遍优化码率分配。VP8 的双遍模式可以显著提升画质一致性。',
    commandExample: '-b:v 1000k -pass 1 (第一遍)',
    effects: { quality: 4, fileSize: 3, speed: 4, compatibility: 4 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx.twopass.bitrate': {
    id: 'expl.libvpx.twopass.bitrate',
    title: 'VP8 2-Pass 目标码率',
    short: '双遍 VBR 的目标码率。双遍分析使码率控制更精确，文件体积更接近设定值。',
    effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx.cpuUsed': {
    id: 'expl.libvpx.cpuUsed',
    title: 'VP8 编码速度 (-cpu-used)',
    short: '编码速度与质量平衡 (-16 到 16)。负数更慢但质量更高，正数更快但压缩效率下降。',
    effects: { quality: 3, fileSize: 3, speed: 5, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx.deadline': {
    id: 'expl.libvpx.deadline',
    title: 'VP8 编码截止策略 (-deadline)',
    short: '控制编码时间预算——realtime 实时、good 平衡（默认）、best 最高质量（最慢）。与 VP9 同参数语义一致。',
    effects: { quality: 3, fileSize: 2, speed: 4, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx.errorResilient': {
    id: 'expl.libvpx.errorResilient',
    title: 'VP8 错误恢复 (-error-resilient)',
    short: '为丢包网络场景优化码流结构。启用后码流在部分包丢失时更容易恢复——WebRTC 实时通信的常用选项。',
    effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx.keyint': {
    id: 'expl.libvpx.keyint',
    title: 'VP8 关键帧间隔 (-g)',
    short: '两个关键帧之间的最大帧数。较小值提升 seek 精度；较大值提升压缩效率。直播通常设帧率的 2 倍。',
    effects: { quality: 1, fileSize: 1, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },
  'expl.libvpx.threads': {
    id: 'expl.libvpx.threads',
    title: 'VP8 编码线程 (-threads)',
    short: '编码线程数。默认自动检测。多线程通过帧级并行实现——VP8 不支持行级/tile 级并行。',
    effects: { quality: 0, fileSize: 0, speed: 3, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libvpxenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c' }],
  },

  // ================================================================
  // cavs — AVS1-P2 中国第一代视频编码国标
  // ================================================================

  'expl.cavs': {
    id: 'expl.cavs',
    title: 'cavs (AVS1-P2)',
    short: 'FFmpeg 内置的中国第一代视频编码国标（GB/T 20090.2-2006）。仅 JiZhun Profile，无 B 帧/CABAC，主要用于老式广电标清兼容。',
    detail: 'AVS1-P2 是中国自主制定的第一代视频编码标准，技术上约等于 H.264 Baseline Profile 的子集。FFmpeg 内置了 cavs 编解码器，无需外部库。当前实用价值有限——主要为中国老式数字电视兼容场景留存。新项目推荐使用 H.264 或更新的编码标准。',
    effects: { quality: 1, fileSize: 1, speed: 3, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/cavsenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/cavsenc.c' }],
  },
  'expl.cavs.cqp': {
    id: 'expl.cavs.cqp',
    title: 'cavs CQP 模式',
    short: '恒定量化参数模式——使用 -qp 0–51 控制画质。AVS1 CQP 模式为软件编码提供基础的均匀量化。',
    commandExample: '-qp 23',
    effects: { quality: 4, fileSize: 4, speed: 3, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/cavsenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/cavsenc.c' }],
  },
  'expl.cavs.cqp.qp': {
    id: 'expl.cavs.cqp.qp',
    title: 'AVS1 CQP QP 值',
    short: '恒定量化参数 (0–51)。23 为常用默认值，类似 H.264 的 QP 语义——数值越低画质越高。',
    effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/cavsenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/cavsenc.c' }],
  },
  'expl.cavs.vbr': {
    id: 'expl.cavs.vbr',
    title: 'cavs VBR 模式',
    short: '可变码率模式——目标码率控制平均体积。AVS1 的编码效率有限，标清约需 2000k–4000k。',
    commandExample: '-b:v 2000k',
    effects: { quality: 3, fileSize: 3, speed: 3, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/cavsenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/cavsenc.c' }],
  },
  'expl.cavs.vbr.bitrate': {
    id: 'expl.cavs.vbr.bitrate',
    title: 'AVS1 VBR 目标码率',
    short: 'VBR 模式下的视频平均目标码率。AVS1 编码效率较低，标清素材通常需要 2000k–4000k。',
    effects: { quality: 3, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/cavsenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/cavsenc.c' }],
  },
  'expl.cavs.keyint': {
    id: 'expl.cavs.keyint',
    title: 'AVS1 关键帧间隔 (-g)',
    short: '两个 IDR 关键帧之间的最大帧数。AVS1 不支持 B 帧，所有非关键帧均为 P 帧——较小的 GOP 可减少 P 帧连锁质量退化。',
    effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 1 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/cavsenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/cavsenc.c' }],
  },

  // ================================================================
  // libxavs2 — AVS2 国标第二代编码器
  // ================================================================

  'expl.libxavs2': {
    id: 'expl.libxavs2',
    title: 'libxavs2 (AVS2 — PKU-VCL)',
    short: '北京大学 PKU-VCL 的 AVS2 编码器，对标 HEVC，面向中国 4K 广电。需 --enable-libxavs2 + --enable-gpl 编译及提前安装 xavs2 库。',
    detail: 'AVS2 (IEEE 1857.4) 是中国第二代视频编码标准，编码效率对标 H.265/HEVC。主要用于中国 4K 广电（CCTV-4K 等）。libxavs2 是北京大学视频编码实验室 (PKU-VCL) 开发的 AVS2 编码器，已在 FFmpeg 中合并但需通过编译选项启用。解码器为 libdavs2（同团队独立库）。对中国境外用户几乎没有使用场景。',
    effects: { quality: 3, fileSize: 3, speed: 2, compatibility: 1 },
    sourceRefs: [{ repository: 'pkuvcl/xavs2', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official', url: 'https://github.com/pkuvcl/xavs2' }],
  },
  'expl.libxavs2.preset': {
    id: 'expl.libxavs2.preset',
    title: 'AVS2 编码预设',
    short: '编码速度与质量平衡——从 ultrafast 到 veryslow。越慢的 preset 使用更多计算资源换取更好的压缩效率。默认 medium。',
    effects: { quality: 3, fileSize: 3, speed: 5, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libxavs2.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libxavs2.c' }],
  },
  'expl.libxavs2.profile': {
    id: 'expl.libxavs2.profile',
    title: 'AVS2 编码配置',
    short: '编码 Profile——main 为 8-bit 标准配置；main10 支持 10-bit 高色深。AVS2 对标 HEVC 的 Main/Main10 Profile。',
    effects: { quality: 2, fileSize: 1, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libxavs2.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libxavs2.c' }],
  },
  'expl.libxavs2.cqp': {
    id: 'expl.libxavs2.cqp',
    title: 'AVS2 CQP 模式',
    short: '恒定量化参数模式——使用 -qp 0–51。AVS2 的 QP 标度与 HEVC 兼容，28 为常用默认。',
    commandExample: '-qp 28',
    effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libxavs2.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libxavs2.c' }],
  },
  'expl.libxavs2.cqp.qp': {
    id: 'expl.libxavs2.cqp.qp',
    title: 'AVS2 CQP QP 值',
    short: '恒定量化参数 (0–51)。AVS2 的 QP 语义类似于 HEVC——28 约等于 x265 CRF 28 的画质水平。',
    effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libxavs2.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libxavs2.c' }],
  },
  'expl.libxavs2.vbr': {
    id: 'expl.libxavs2.vbr',
    title: 'AVS2 VBR 模式',
    short: '可变码率模式——目标码率控制平均体积。AVS2 编码效率对标 HEVC，4K 内容约需 15M–30M。',
    commandExample: '-b:v 5000k',
    effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libxavs2.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libxavs2.c' }],
  },
  'expl.libxavs2.vbr.bitrate': {
    id: 'expl.libxavs2.vbr.bitrate',
    title: 'AVS2 VBR 目标码率',
    short: 'VBR 模式下的视频平均目标码率。AVS2 作为 HEVC 对标标准，4K 广电级素材约需 15M–30M。',
    effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libxavs2.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libxavs2.c' }],
  },
  'expl.libxavs2.cbr': {
    id: 'expl.libxavs2.cbr',
    title: 'AVS2 CBR 模式',
    short: '恒定码率模式——码率保持稳定，适合带宽严格受限的广电传输场景。中国广电标准中常用模式。',
    commandExample: '-b:v 5000k',
    effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libxavs2.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libxavs2.c' }],
  },
  'expl.libxavs2.cbr.bitrate': {
    id: 'expl.libxavs2.cbr.bitrate',
    title: 'AVS2 CBR 目标码率',
    short: 'CBR 模式下恒定的目标码率。广电场景下通常设为信道带宽的 80% 以留出音频和元数据开销。',
    effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libxavs2.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libxavs2.c' }],
  },
  'expl.libxavs2.keyint': {
    id: 'expl.libxavs2.keyint',
    title: 'AVS2 关键帧间隔 (-g)',
    short: '两个关键帧之间的最大帧数 (1–500)。广电场景通常设为帧率的 1–2 倍以保证快速频道切换。',
    effects: { quality: 1, fileSize: 1, speed: 1, compatibility: 2 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libxavs2.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libxavs2.c' }],
  },
  'expl.libxavs2.lookahead': {
    id: 'expl.libxavs2.lookahead',
    title: 'AVS2 前瞻帧数 (-lookahead)',
    short: '编码器前瞻分析的帧数 (0–100)。提前查看未来内容可优化码率分配，提升画质但增加编码延迟和内存。',
    effects: { quality: 2, fileSize: 1, speed: 2, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libxavs2.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libxavs2.c' }],
  },
  'expl.libxavs2.threads': {
    id: 'expl.libxavs2.threads',
    title: 'AVS2 编码线程 (-threads)',
    short: '编码线程数。默认自动检测。手动限制可用于多路编码场景避免 CPU 抢占。',
    effects: { quality: 0, fileSize: 0, speed: 3, compatibility: 0 },
    sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/libxavs2.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libxavs2.c' }],
  },
// New explanation entries for P1+P2 encoders (VAAPI, Vulkan, D3D12, MF, QSV-VP9, VideoToolbox ProRes, kvazaar, SVT-HEVC)

  // ================================================================
  // VAAPI encoders — h264_vaapi, hevc_vaapi, vp9_vaapi, av1_vaapi
  // ================================================================

  // --- h264_vaapi ---
  'expl.h264_vaapi': { id: 'expl.h264_vaapi', title: 'h264_vaapi (H.264 — Linux VAAPI)', short: 'Linux VAAPI 硬件 H.264 编码器。通过 --enable-vaapi 编译和 /dev/dri/renderD128 设备访问 GPU 编码能力，支持 Intel 和 AMD GPU。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vaapi.profile': { id: 'expl.h264_vaapi.profile', title: 'VAAPI H.264 Profile', short: 'H.264 编码配置。baseline 兼容性最广，main 标准选择，high 支持更多特性。', effects: { quality: 1, fileSize: 2, speed: 0, compatibility: 4 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vaapi.cqp': { id: 'expl.h264_vaapi.cqp', title: 'VAAPI H.264 CQP', short: '恒定量化参数模式，使用 -rc_mode CQP + -qp N 控制画质。QP 范围 0–51，默认 23。', effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vaapi.cqp.qp': { id: 'expl.h264_vaapi.cqp.qp', title: 'VAAPI H.264 QP 值', short: 'CQP 模式下的量化参数 (0–51)。23 为默认平衡值，数值越低画质越高。', effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vaapi.vbr': { id: 'expl.h264_vaapi.vbr', title: 'VAAPI H.264 VBR', short: '可变码率模式，使用 -rc_mode VBR。目标码率控制平均体积，可配合 maxrate 约束峰值。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vaapi.vbr.bitrate': { id: 'expl.h264_vaapi.vbr.bitrate', title: 'VAAPI H.264 目标码率', short: 'VBR 模式的目标码率。1080p 推荐 3000k–8000k，4K 推荐 15M–30M。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vaapi.vbr.maxrate': { id: 'expl.h264_vaapi.vbr.maxrate', title: 'VAAPI H.264 最大码率', short: '限制编码器瞬时最高码率，防止峰值超出传输/解码能力。', effects: { quality: 2, fileSize: 3, speed: 0, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vaapi.cbr': { id: 'expl.h264_vaapi.cbr', title: 'VAAPI H.264 CBR', short: '恒定码率模式，使用 -rc_mode CBR。码率全程保持稳定，适合直播等带宽受限场景。', effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vaapi.cbr.bitrate': { id: 'expl.h264_vaapi.cbr.bitrate', title: 'VAAPI H.264 CBR 码率', short: 'CBR 模式恒定目标码率。建议设为带宽上限的 80%–90% 预留协议开销。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vaapi.quality': { id: 'expl.h264_vaapi.quality', title: 'VAAPI 质量级别', short: 'VAAPI 编码器的质量级别 (0–8)，影响编码速度与压缩比的平衡。较高值使用更多 GPU 计算资源进行精细编码。', effects: { quality: 3, fileSize: 2, speed: 3, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vaapi.compressionLevel': { id: 'expl.h264_vaapi.compressionLevel', title: 'VAAPI 压缩级别', short: 'VAAPI 编码压缩策略级别 (0–7)，控制运动估计精度和模式决策深度。', effects: { quality: 2, fileSize: 2, speed: 2, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vaapi.bf': { id: 'expl.h264_vaapi.bf', title: 'VAAPI H.264 B 帧数', short: '两个参考帧之间的连续 B 帧数量 (0–4)。更多 B 帧提升压缩效率但增加编码复杂度。', effects: { quality: 1, fileSize: 2, speed: 2, compatibility: 1 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vaapi.keyint': { id: 'expl.h264_vaapi.keyint', title: 'VAAPI H.264 GOP 大小', short: '两个关键帧之间的最大帧数。较小值提升 seek 精度，较大值提升压缩效率。', effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vaapi.asyncDepth': { id: 'expl.h264_vaapi.asyncDepth', title: 'VAAPI 异步深度', short: '硬件编码管线最大并行帧数 (1–64)。较高值提升 GPU 利用率但增加编码延迟。', effects: { quality: 0, fileSize: 0, speed: 3, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vaapi.idrInterval': { id: 'expl.h264_vaapi.idrInterval', title: 'VAAPI IDR 间隔', short: '两个连续 IDR 帧之间的帧数。IDR 帧允许解码器完全重置，对 seek 和流媒体切换至关重要。', effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h264.c', sourceType: 'ffmpeg-official' }] },

  // --- hevc_vaapi ---
  'expl.hevc_vaapi': { id: 'expl.hevc_vaapi', title: 'hevc_vaapi (HEVC — Linux VAAPI)', short: 'Linux VAAPI 硬件 HEVC 编码器。需 Skylake+ Intel / Polaris+ AMD GPU，通过 --enable-vaapi 编译。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vaapi.profile': { id: 'expl.hevc_vaapi.profile', title: 'VAAPI HEVC Profile', short: 'main 为 8-bit 标准配置；main10 支持 10-bit HDR 编码。', effects: { quality: 2, fileSize: 1, speed: 0, compatibility: 3 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vaapi.cqp': { id: 'expl.hevc_vaapi.cqp', title: 'VAAPI HEVC CQP', short: '恒定量化参数模式，QP 范围 0–51。HEVC 默认 28，画质与 x265 CRF 28 相当。', effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vaapi.cqp.qp': { id: 'expl.hevc_vaapi.cqp.qp', title: 'VAAPI HEVC QP 值', short: 'CQP 模式量化参数 (0–51)。默认 28，低值=高画质。', effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vaapi.vbr': { id: 'expl.hevc_vaapi.vbr', title: 'VAAPI HEVC VBR', short: '可变码率模式，HEVC 编码效率比 H.264 高约 50%——同等画质可用更低码率。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vaapi.vbr.bitrate': { id: 'expl.hevc_vaapi.vbr.bitrate', title: 'VAAPI HEVC VBR 码率', short: 'VBR 目标码率。HEVC 效率约为 H.264 的 1.5–2 倍。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vaapi.vbr.maxrate': { id: 'expl.hevc_vaapi.vbr.maxrate', title: 'VAAPI HEVC 最大码率', short: '限制编码器瞬时最高码率。通常设为目标码率的 1.5–2 倍。', effects: { quality: 2, fileSize: 3, speed: 0, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vaapi.cbr': { id: 'expl.hevc_vaapi.cbr', title: 'VAAPI HEVC CBR', short: '恒定码率模式，适合带宽严格受限的传输场景。', effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vaapi.cbr.bitrate': { id: 'expl.hevc_vaapi.cbr.bitrate', title: 'VAAPI HEVC CBR 码率', short: 'CBR 恒定目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vaapi.quality': { id: 'expl.hevc_vaapi.quality', title: 'VAAPI HEVC 质量级别', short: 'VAAPI HEVC 质量级别 (0–8)，影响编码速度与压缩比。', effects: { quality: 3, fileSize: 2, speed: 3, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vaapi.bf': { id: 'expl.hevc_vaapi.bf', title: 'VAAPI HEVC B 帧数', short: '最大连续 B 帧数 (0–4)。', effects: { quality: 1, fileSize: 2, speed: 2, compatibility: 1 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vaapi.keyint': { id: 'expl.hevc_vaapi.keyint', title: 'VAAPI HEVC GOP 大小', short: '关键帧之间的最大帧数。', effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vaapi.asyncDepth': { id: 'expl.hevc_vaapi.asyncDepth', title: 'VAAPI HEVC 异步深度', short: '硬件编码管线并行帧数 (1–64)。', effects: { quality: 0, fileSize: 0, speed: 3, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_h265.c', sourceType: 'ffmpeg-official' }] },

  // --- vp9_vaapi ---
  'expl.vp9_vaapi': { id: 'expl.vp9_vaapi', title: 'vp9_vaapi (VP9 — Linux VAAPI)', short: 'Linux VAAPI 硬件 VP9 编码器。需 Kaby Lake+ Intel / Raven Ridge+ AMD GPU。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_vaapi.cqp': { id: 'expl.vp9_vaapi.cqp', title: 'VAAPI VP9 CQP', short: '恒定量化参数模式，QP 范围 0–63。VP9 的 QP 标度与 H.264 不同——31 约等于 H.264 QP 23。', effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_vaapi.cqp.qp': { id: 'expl.vp9_vaapi.cqp.qp', title: 'VAAPI VP9 QP 值', short: 'QP 值 (0–63)，默认 31。VP9 QP 标度不同于 H.264/HEVC。', effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_vaapi.vbr': { id: 'expl.vp9_vaapi.vbr', title: 'VAAPI VP9 VBR', short: '可变码率模式，VP9 硬件编码效率优于 H.264。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_vaapi.vbr.bitrate': { id: 'expl.vp9_vaapi.vbr.bitrate', title: 'VAAPI VP9 VBR 码率', short: 'VBR 目标码率。VP9 编码效率约为 H.264 的 1.5–2 倍。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_vaapi.cbr': { id: 'expl.vp9_vaapi.cbr', title: 'VAAPI VP9 CBR', short: '恒定码率模式。', effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_vaapi.cbr.bitrate': { id: 'expl.vp9_vaapi.cbr.bitrate', title: 'VAAPI VP9 CBR 码率', short: 'CBR 恒定目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_vaapi.quality': { id: 'expl.vp9_vaapi.quality', title: 'VAAPI VP9 质量级别', short: 'VP9 VAAPI 质量级别 (0–8)。', effects: { quality: 3, fileSize: 2, speed: 3, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_vaapi.keyint': { id: 'expl.vp9_vaapi.keyint', title: 'VAAPI VP9 GOP 大小', short: '关键帧之间的最大帧数。', effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_vp9.c', sourceType: 'ffmpeg-official' }] },

  // --- av1_vaapi ---
  'expl.av1_vaapi': { id: 'expl.av1_vaapi', title: 'av1_vaapi (AV1 — Linux VAAPI)', short: 'Linux VAAPI 硬件 AV1 编码器（FFmpeg 6.1+）。需 Intel Arc 或 Meteor Lake+ 的 AV1 编码硬件单元。', effects: { quality: 4, fileSize: 3, speed: 4, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_av1.c', sourceType: 'ffmpeg-official' }] },
  'expl.av1_vaapi.cqp': { id: 'expl.av1_vaapi.cqp', title: 'VAAPI AV1 CQP', short: '恒定量化参数模式，QP 范围 0–63。AV1 编码效率比 HEVC 高约 30%。', effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_av1.c', sourceType: 'ffmpeg-official' }] },
  'expl.av1_vaapi.cqp.qp': { id: 'expl.av1_vaapi.cqp.qp', title: 'VAAPI AV1 QP 值', short: 'QP 值 (0–63)，默认 31。', effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_av1.c', sourceType: 'ffmpeg-official' }] },
  'expl.av1_vaapi.vbr': { id: 'expl.av1_vaapi.vbr', title: 'VAAPI AV1 VBR', short: '可变码率模式。AV1 的高效率使同等画质下码率可大幅降低。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_av1.c', sourceType: 'ffmpeg-official' }] },
  'expl.av1_vaapi.vbr.bitrate': { id: 'expl.av1_vaapi.vbr.bitrate', title: 'VAAPI AV1 VBR 码率', short: 'VBR 目标码率。AV1 效率比 H.264 高 2–3 倍。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_av1.c', sourceType: 'ffmpeg-official' }] },
  'expl.av1_vaapi.cbr': { id: 'expl.av1_vaapi.cbr', title: 'VAAPI AV1 CBR', short: '恒定码率模式。', effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_av1.c', sourceType: 'ffmpeg-official' }] },
  'expl.av1_vaapi.cbr.bitrate': { id: 'expl.av1_vaapi.cbr.bitrate', title: 'VAAPI AV1 CBR 码率', short: 'CBR 恒定目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_av1.c', sourceType: 'ffmpeg-official' }] },
  'expl.av1_vaapi.quality': { id: 'expl.av1_vaapi.quality', title: 'VAAPI AV1 质量级别', short: 'AV1 VAAPI 质量级别 (0–8)。', effects: { quality: 3, fileSize: 2, speed: 3, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_av1.c', sourceType: 'ffmpeg-official' }] },
  'expl.av1_vaapi.keyint': { id: 'expl.av1_vaapi.keyint', title: 'VAAPI AV1 GOP 大小', short: '关键帧之间的最大帧数。', effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_av1.c', sourceType: 'ffmpeg-official' }] },
  'expl.av1_vaapi.asyncDepth': { id: 'expl.av1_vaapi.asyncDepth', title: 'VAAPI AV1 异步深度', short: '硬件编码管线并行帧数 (1–64)。', effects: { quality: 0, fileSize: 0, speed: 3, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vaapi_encode_av1.c', sourceType: 'ffmpeg-official' }] },

  // ================================================================
  // Vulkan Video encoders — h264_vulkan, hevc_vulkan
  // ================================================================

  'expl.h264_vulkan': { id: 'expl.h264_vulkan', title: 'h264_vulkan (H.264 — Vulkan Video)', short: '跨厂商 Vulkan Video H.264 编码器（FFmpeg 7.1+）。同一 API 覆盖 NVIDIA/AMD/Intel GPU，需驱动暴露 VK_KHR_video_encode_h264。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 3 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vulkan.profile': { id: 'expl.h264_vulkan.profile', title: 'Vulkan H.264 Profile', short: 'H.264 编码配置。main 标准配置，high 支持更多编码特性。', effects: { quality: 1, fileSize: 2, speed: 0, compatibility: 4 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vulkan.cqp': { id: 'expl.h264_vulkan.cqp', title: 'Vulkan H.264 CQP', short: '恒定量化参数模式，QP 0–51。跨厂商统一的 Vulkan 编码接口。', effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vulkan.cqp.qp': { id: 'expl.h264_vulkan.cqp.qp', title: 'Vulkan H.264 QP 值', short: 'QP 值 (0–51)，默认 23。', effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vulkan.vbr': { id: 'expl.h264_vulkan.vbr', title: 'Vulkan H.264 VBR', short: '可变码率模式，跨厂商 GPU 通用。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vulkan.vbr.bitrate': { id: 'expl.h264_vulkan.vbr.bitrate', title: 'Vulkan H.264 VBR 码率', short: 'VBR 目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vulkan.vbr.maxrate': { id: 'expl.h264_vulkan.vbr.maxrate', title: 'Vulkan H.264 VBR 最大码率', short: '限制瞬时最高码率。', effects: { quality: 2, fileSize: 3, speed: 0, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vulkan.cbr': { id: 'expl.h264_vulkan.cbr', title: 'Vulkan H.264 CBR', short: '恒定码率模式。', effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vulkan.cbr.bitrate': { id: 'expl.h264_vulkan.cbr.bitrate', title: 'Vulkan H.264 CBR 码率', short: 'CBR 恒定目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vulkan.bf': { id: 'expl.h264_vulkan.bf', title: 'Vulkan H.264 B 帧数', short: '最大连续 B 帧数 (0–2)，驱动/硬件相关。', effects: { quality: 1, fileSize: 2, speed: 2, compatibility: 1 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vulkan.keyint': { id: 'expl.h264_vulkan.keyint', title: 'Vulkan H.264 GOP 大小', short: '关键帧之间的最大帧数。', effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_vulkan.asyncDepth': { id: 'expl.h264_vulkan.asyncDepth', title: 'Vulkan 异步深度', short: '硬件编码管线并行帧数 (1–64)。', effects: { quality: 0, fileSize: 0, speed: 3, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h264.c', sourceType: 'ffmpeg-official' }] },

  'expl.hevc_vulkan': { id: 'expl.hevc_vulkan', title: 'hevc_vulkan (HEVC — Vulkan Video)', short: '跨厂商 Vulkan Video HEVC 编码器（FFmpeg 7.1+）。需驱动暴露 VK_KHR_video_encode_h265。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 3 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vulkan.profile': { id: 'expl.hevc_vulkan.profile', title: 'Vulkan HEVC Profile', short: 'main 为 8-bit，main10 支持 10-bit HDR。', effects: { quality: 2, fileSize: 1, speed: 0, compatibility: 3 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vulkan.cqp': { id: 'expl.hevc_vulkan.cqp', title: 'Vulkan HEVC CQP', short: '恒定量化参数模式，QP 0–51，默认 28。', effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vulkan.cqp.qp': { id: 'expl.hevc_vulkan.cqp.qp', title: 'Vulkan HEVC QP 值', short: 'QP 值 (0–51)，默认 28。', effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vulkan.vbr': { id: 'expl.hevc_vulkan.vbr', title: 'Vulkan HEVC VBR', short: '可变码率模式。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vulkan.vbr.bitrate': { id: 'expl.hevc_vulkan.vbr.bitrate', title: 'Vulkan HEVC VBR 码率', short: 'VBR 目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vulkan.vbr.maxrate': { id: 'expl.hevc_vulkan.vbr.maxrate', title: 'Vulkan HEVC 最大码率', short: '限制瞬时最高码率。', effects: { quality: 2, fileSize: 3, speed: 0, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vulkan.cbr': { id: 'expl.hevc_vulkan.cbr', title: 'Vulkan HEVC CBR', short: '恒定码率模式。', effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vulkan.cbr.bitrate': { id: 'expl.hevc_vulkan.cbr.bitrate', title: 'Vulkan HEVC CBR 码率', short: 'CBR 恒定目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vulkan.bf': { id: 'expl.hevc_vulkan.bf', title: 'Vulkan HEVC B 帧数', short: '最大连续 B 帧数 (0–2)。', effects: { quality: 1, fileSize: 2, speed: 2, compatibility: 1 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vulkan.keyint': { id: 'expl.hevc_vulkan.keyint', title: 'Vulkan HEVC GOP 大小', short: '关键帧之间的最大帧数。', effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h265.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_vulkan.asyncDepth': { id: 'expl.hevc_vulkan.asyncDepth', title: 'Vulkan HEVC 异步深度', short: '硬件编码管线并行帧数 (1–64)。', effects: { quality: 0, fileSize: 0, speed: 3, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_encode_h265.c', sourceType: 'ffmpeg-official' }] },

  // ================================================================
  // Vulkan Compute encoders — ffv1_vulkan, prores_vulkan
  // ================================================================

  'expl.ffv1_vulkan': { id: 'expl.ffv1_vulkan', title: 'ffv1_vulkan (FFV1 — Vulkan Compute)', short: '跨厂商 Vulkan Compute FFV1 无损编码器（FFmpeg 8.0+）。任何 Vulkan 1.3+ GPU 均可使用，相比 CPU 版本大幅加速。', effects: { quality: 5, fileSize: 5, speed: 4, compatibility: 3 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_ffv1.c', sourceType: 'ffmpeg-official' }] },
  'expl.ffv1_vulkan.default': { id: 'expl.ffv1_vulkan.default', title: 'Vulkan FFV1 默认模式', short: 'FFV1 始终为数学无损编码，GPU 加速不影响输出画质——像素精确匹配输入。', effects: { quality: 5, fileSize: 4, speed: 4, compatibility: 4 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_ffv1.c', sourceType: 'ffmpeg-official' }] },
  'expl.ffv1_vulkan.level': { id: 'expl.ffv1_vulkan.level', title: 'Vulkan FFV1 版本', short: 'FFV1 编码版本。1=版本 1.3 (IETF RFC 9043 存档标准)，3=版本 3.x (多线程生产推荐)。', effects: { quality: 0, fileSize: 1, speed: 2, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_ffv1.c', sourceType: 'ffmpeg-official' }] },
  'expl.ffv1_vulkan.slices': { id: 'expl.ffv1_vulkan.slices', title: 'Vulkan FFV1 Slice 数', short: '每帧 Slice 数 (4–24)。更多 Slice 提升 GPU 并行度和错误恢复能力。', effects: { quality: 0, fileSize: 1, speed: 2, compatibility: 1 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_ffv1.c', sourceType: 'ffmpeg-official' }] },
  'expl.ffv1_vulkan.coder': { id: 'expl.ffv1_vulkan.coder', title: 'Vulkan FFV1 熵编码器', short: '0=Golomb Rice（快速），1=Range Coder（最佳压缩比）。存档推荐 coder=1。', effects: { quality: 0, fileSize: 3, speed: 2, compatibility: 1 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_ffv1.c', sourceType: 'ffmpeg-official' }] },

  'expl.prores_vulkan': { id: 'expl.prores_vulkan', title: 'prores_vulkan (ProRes — Vulkan Compute)', short: '跨厂商 Vulkan Compute ProRes 编码器（FFmpeg 8.1+，实验性）。任何 Vulkan 1.3+ GPU 均可实现 GPU 加速 ProRes 编码。', effects: { quality: 5, fileSize: 5, speed: 4, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_prores.c', sourceType: 'ffmpeg-official' }] },
  'expl.prores_vulkan.default': { id: 'expl.prores_vulkan.default', title: 'Vulkan ProRes 质量', short: 'ProRes 质量由 Profile 决定（0–5），无独立 CRF/CQP 质量参数。GPU Vulkan Compute 加速仅影响编码速度。', effects: { quality: 5, fileSize: 5, speed: 0, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_prores.c', sourceType: 'ffmpeg-official' }] },
  'expl.prores_vulkan.profile': { id: 'expl.prores_vulkan.profile', title: 'Vulkan ProRes Profile', short: '0=422 Proxy (~45Mbps) 至 5=4444 XQ (~500Mbps)。默认 profile 2 (422, ~147Mbps)。', effects: { quality: 5, fileSize: 5, speed: 0, compatibility: 3 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_prores.c', sourceType: 'ffmpeg-official' }] },
  'expl.prores_vulkan.quantMat': { id: 'expl.prores_vulkan.quantMat', title: 'Vulkan ProRes 量化矩阵', short: '选择量化矩阵：auto（根据 profile）、proxy、lt、standard、hq。多数场景保持 auto。', effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 1 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/vulkan_prores.c', sourceType: 'ffmpeg-official' }] },

  // ================================================================
  // Intel QSV VP9
  // ================================================================

  'expl.vp9_qsv': { id: 'expl.vp9_qsv', title: 'vp9_qsv (VP9 — Intel QSV)', short: 'Intel QSV VP9 硬件编码器（FFmpeg 4.3+）。需 Kaby Lake+ Intel GPU 和 --enable-libmfx。不支持 B 帧（VP9 编解码限制）。', effects: { quality: 3, fileSize: 3, speed: 5, compatibility: 3 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_qsv.cqp': { id: 'expl.vp9_qsv.cqp', title: 'QSV VP9 CQP', short: '恒定量化参数，QP 0–63。', effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_qsv.cqp.qp': { id: 'expl.vp9_qsv.cqp.qp', title: 'QSV VP9 QP 值', short: 'QP 值 (0–63)，默认 31。', effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_qsv.icq': { id: 'expl.vp9_qsv.icq', title: 'QSV VP9 ICQ', short: 'Intel 智能恒定质量模式，通过 -global_quality 1–51 控制画质。', effects: { quality: 5, fileSize: 2, speed: 4, compatibility: 4 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_qsv.icq.value': { id: 'expl.vp9_qsv.icq.value', title: 'QSV VP9 ICQ 值', short: '全局质量值 (1–51)，默认 23。', effects: { quality: 5, fileSize: 3, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_qsv.vbr': { id: 'expl.vp9_qsv.vbr', title: 'QSV VP9 VBR', short: '可变码率模式。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_qsv.vbr.bitrate': { id: 'expl.vp9_qsv.vbr.bitrate', title: 'QSV VP9 VBR 码率', short: 'VBR 目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_qsv.cbr': { id: 'expl.vp9_qsv.cbr', title: 'QSV VP9 CBR', short: '恒定码率模式。', effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_qsv.cbr.bitrate': { id: 'expl.vp9_qsv.cbr.bitrate', title: 'QSV VP9 CBR 码率', short: 'CBR 恒定目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_qsv.asyncDepth': { id: 'expl.vp9_qsv.asyncDepth', title: 'QSV VP9 异步深度', short: 'QSV 硬件编码并行帧数 (1–255)。', effects: { quality: 0, fileSize: 0, speed: 3, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_qsv.lowPower': { id: 'expl.vp9_qsv.lowPower', title: 'QSV VP9 低功耗模式', short: '启用 QSV 低功耗编码路径，牺牲编码速度以降低功耗。', effects: { quality: 0, fileSize: 0, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_vp9.c', sourceType: 'ffmpeg-official' }] },
  'expl.vp9_qsv.keyint': { id: 'expl.vp9_qsv.keyint', title: 'QSV VP9 GOP 大小', short: '关键帧之间的最大帧数。', effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/qsvenc_vp9.c', sourceType: 'ffmpeg-official' }] },

  // ================================================================
  // Apple VideoToolbox ProRes
  // ================================================================

  'expl.prores_vt': { id: 'expl.prores_vt', title: 'prores_videotoolbox (ProRes — Apple)', short: 'Apple VideoToolbox ProRes 硬件编码器。仅 macOS/iOS，需 Apple Silicon 或 T2 芯片。', effects: { quality: 5, fileSize: 5, speed: 5, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official' }] },
  'expl.prores_vt.default': { id: 'expl.prores_vt.default', title: 'VideoToolbox ProRes 质量', short: 'ProRes 质量由 profile（0–5）决定，VideoToolbox 硬件加速不改变编码质量。', effects: { quality: 5, fileSize: 5, speed: 0, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official' }] },
  'expl.prores_vt.profile': { id: 'expl.prores_vt.profile', title: 'VideoToolbox ProRes Profile', short: '0=422 Proxy 至 5=4444 XQ。默认 profile 2 (422)。', effects: { quality: 5, fileSize: 5, speed: 0, compatibility: 3 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official' }] },

  // ================================================================
  // D3D12 Windows encoders — h264_d3d12, av1_d3d12
  // ================================================================

  'expl.h264_d3d12': { id: 'expl.h264_d3d12', title: 'h264_d3d12 (H.264 — D3D12)', short: 'Windows D3D12 硬件 H.264 编码器（FFmpeg 8.1+）。仅 Windows，基于 Direct3D 12 Video API，跨 GPU 厂商统一接口。', effects: { quality: 3, fileSize: 3, speed: 5, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_d3d12.cqp': { id: 'expl.h264_d3d12.cqp', title: 'D3D12 H.264 CQP', short: '恒定量化参数模式，QP 0–51。', effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_d3d12.cqp.qp': { id: 'expl.h264_d3d12.cqp.qp', title: 'D3D12 H.264 QP 值', short: 'QP 值 (0–51)，默认 23。', effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_d3d12.vbr': { id: 'expl.h264_d3d12.vbr', title: 'D3D12 H.264 VBR', short: '可变码率模式。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_d3d12.vbr.bitrate': { id: 'expl.h264_d3d12.vbr.bitrate', title: 'D3D12 H.264 VBR 码率', short: 'VBR 目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_d3d12.cbr': { id: 'expl.h264_d3d12.cbr', title: 'D3D12 H.264 CBR', short: '恒定码率模式。', effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_d3d12.cbr.bitrate': { id: 'expl.h264_d3d12.cbr.bitrate', title: 'D3D12 H.264 CBR 码率', short: 'CBR 恒定目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_d3d12.bf': { id: 'expl.h264_d3d12.bf', title: 'D3D12 H.264 B 帧数', short: '最大连续 B 帧数 (0–4)。', effects: { quality: 1, fileSize: 2, speed: 2, compatibility: 1 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_h264.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_d3d12.keyint': { id: 'expl.h264_d3d12.keyint', title: 'D3D12 H.264 GOP 大小', short: '关键帧之间的最大帧数。', effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_h264.c', sourceType: 'ffmpeg-official' }] },

  'expl.av1_d3d12': { id: 'expl.av1_d3d12', title: 'av1_d3d12 (AV1 — D3D12)', short: 'Windows D3D12 硬件 AV1 编码器（FFmpeg 8.1+）。仅 Windows，需支持 AV1 编码的 GPU（RTX 4060+ / RX 7600+ / Arc）。', effects: { quality: 4, fileSize: 3, speed: 5, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_av1.c', sourceType: 'ffmpeg-official' }] },
  'expl.av1_d3d12.cqp': { id: 'expl.av1_d3d12.cqp', title: 'D3D12 AV1 CQP', short: '恒定量化参数，QP 0–63。', effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_av1.c', sourceType: 'ffmpeg-official' }] },
  'expl.av1_d3d12.cqp.qp': { id: 'expl.av1_d3d12.cqp.qp', title: 'D3D12 AV1 QP 值', short: 'QP 值 (0–63)，默认 31。', effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_av1.c', sourceType: 'ffmpeg-official' }] },
  'expl.av1_d3d12.vbr': { id: 'expl.av1_d3d12.vbr', title: 'D3D12 AV1 VBR', short: '可变码率模式。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_av1.c', sourceType: 'ffmpeg-official' }] },
  'expl.av1_d3d12.vbr.bitrate': { id: 'expl.av1_d3d12.vbr.bitrate', title: 'D3D12 AV1 VBR 码率', short: 'VBR 目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_av1.c', sourceType: 'ffmpeg-official' }] },
  'expl.av1_d3d12.cbr': { id: 'expl.av1_d3d12.cbr', title: 'D3D12 AV1 CBR', short: '恒定码率模式。', effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_av1.c', sourceType: 'ffmpeg-official' }] },
  'expl.av1_d3d12.cbr.bitrate': { id: 'expl.av1_d3d12.cbr.bitrate', title: 'D3D12 AV1 CBR 码率', short: 'CBR 恒定目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_av1.c', sourceType: 'ffmpeg-official' }] },
  'expl.av1_d3d12.keyint': { id: 'expl.av1_d3d12.keyint', title: 'D3D12 AV1 GOP 大小', short: '关键帧之间的最大帧数。', effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/d3d12va_encode_av1.c', sourceType: 'ffmpeg-official' }] },

  // ================================================================
  // MediaFoundation Windows encoders — h264_mf, hevc_mf
  // ================================================================

  'expl.h264_mf': { id: 'expl.h264_mf', title: 'h264_mf (H.264 — MediaFoundation)', short: 'Windows Media Foundation H.264 硬件编码器。仅 Windows，通过系统 MF 框架调用 GPU，无需额外 FFmpeg 编译选项。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_mf.cqp': { id: 'expl.h264_mf.cqp', title: 'MF H.264 CQP', short: '恒定量化参数模式，QP 0–51。', effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_mf.cqp.qp': { id: 'expl.h264_mf.cqp.qp', title: 'MF H.264 QP 值', short: 'QP 值 (0–51)。', effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_mf.vbr': { id: 'expl.h264_mf.vbr', title: 'MF H.264 VBR', short: '可变码率模式。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_mf.vbr.bitrate': { id: 'expl.h264_mf.vbr.bitrate', title: 'MF H.264 VBR 码率', short: 'VBR 目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_mf.cbr': { id: 'expl.h264_mf.cbr', title: 'MF H.264 CBR', short: '恒定码率模式。', effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_mf.cbr.bitrate': { id: 'expl.h264_mf.cbr.bitrate', title: 'MF H.264 CBR 码率', short: 'CBR 恒定目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' }] },
  'expl.h264_mf.keyint': { id: 'expl.h264_mf.keyint', title: 'MF H.264 GOP 大小', short: '关键帧之间的最大帧数。', effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' }] },

  'expl.hevc_mf': { id: 'expl.hevc_mf', title: 'hevc_mf (HEVC — MediaFoundation)', short: 'Windows Media Foundation HEVC 硬件编码器。仅 Windows。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 2 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_mf.cqp': { id: 'expl.hevc_mf.cqp', title: 'MF HEVC CQP', short: '恒定量化参数，QP 0–51。', effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_mf.cqp.qp': { id: 'expl.hevc_mf.cqp.qp', title: 'MF HEVC QP 值', short: 'QP 值 (0–51)。', effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_mf.vbr': { id: 'expl.hevc_mf.vbr', title: 'MF HEVC VBR', short: '可变码率模式。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_mf.vbr.bitrate': { id: 'expl.hevc_mf.vbr.bitrate', title: 'MF HEVC VBR 码率', short: 'VBR 目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_mf.cbr': { id: 'expl.hevc_mf.cbr', title: 'MF HEVC CBR', short: '恒定码率模式。', effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' }] },
  'expl.hevc_mf.cbr.bitrate': { id: 'expl.hevc_mf.cbr.bitrate', title: 'MF HEVC CBR 码率', short: 'CBR 恒定目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20', file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' }] },

  // ================================================================
  // libkvazaar — HEVC LGPL
  // ================================================================

  'expl.libkvazaar': { id: 'expl.libkvazaar', title: 'libkvazaar (HEVC — LGPL)', short: '⚠️ LGPL 许可的 HEVC 编码器。需 --enable-libkvazaar 编译和外部 kvazaar 库，主流 FFmpeg 构建通常不包含。kvazaar 的主要优势是 LGPL 许可（vs x265 的 GPL）。', effects: { quality: 3, fileSize: 3, speed: 2, compatibility: 1 }, sourceRefs: [{ repository: 'ultravideo/kvazaar', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libkvazaar.preset': { id: 'expl.libkvazaar.preset', title: 'kvazaar 编码预设', short: 'ultrafast 至 placebo 十档。越慢越好的经典 x264 风格预设体系。', effects: { quality: 3, fileSize: 3, speed: 5, compatibility: 0 }, sourceRefs: [{ repository: 'ultravideo/kvazaar', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libkvazaar.profile': { id: 'expl.libkvazaar.profile', title: 'kvazaar Profile', short: 'main (8-bit)、main10 (10-bit)、main-still-picture。', effects: { quality: 2, fileSize: 1, speed: 0, compatibility: 3 }, sourceRefs: [{ repository: 'ultravideo/kvazaar', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libkvazaar.cqp': { id: 'expl.libkvazaar.cqp', title: 'kvazaar CQP', short: '恒定量化参数模式，QP 0–51。', effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 }, sourceRefs: [{ repository: 'ultravideo/kvazaar', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libkvazaar.cqp.qp': { id: 'expl.libkvazaar.cqp.qp', title: 'kvazaar CQP QP 值', short: 'QP 值 (0–51)。', effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'ultravideo/kvazaar', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libkvazaar.vbr': { id: 'expl.libkvazaar.vbr', title: 'kvazaar VBR', short: '可变码率模式。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'ultravideo/kvazaar', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libkvazaar.vbr.bitrate': { id: 'expl.libkvazaar.vbr.bitrate', title: 'kvazaar VBR 码率', short: 'VBR 目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'ultravideo/kvazaar', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libkvazaar.noSao': { id: 'expl.libkvazaar.noSao', title: 'kvazaar 关闭 SAO', short: '关闭 Sample Adaptive Offset 滤波。SAO 是 HEVC 特有的改善边界重建质量的滤波器。', effects: { quality: 0, fileSize: 1, speed: 1, compatibility: 0 }, sourceRefs: [{ repository: 'ultravideo/kvazaar', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libkvazaar.noDeblock': { id: 'expl.libkvazaar.noDeblock', title: 'kvazaar 关闭去块滤波', short: '关闭去块效应滤波。关闭后编码速度提升但可能出现块效应。', effects: { quality: 0, fileSize: 1, speed: 1, compatibility: 0 }, sourceRefs: [{ repository: 'ultravideo/kvazaar', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libkvazaar.lossless': { id: 'expl.libkvazaar.lossless', title: 'kvazaar 无损模式', short: '数学上完全无损的 HEVC 编码，输出像素与输入精确一致。', effects: { quality: 5, fileSize: 5, speed: 1, compatibility: 1 }, sourceRefs: [{ repository: 'ultravideo/kvazaar', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libkvazaar.slices': { id: 'expl.libkvazaar.slices', title: 'kvazaar Slice 数', short: '每帧 Slice 数。更多 Slice 提升并行度。', effects: { quality: 0, fileSize: 1, speed: 1, compatibility: 1 }, sourceRefs: [{ repository: 'ultravideo/kvazaar', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libkvazaar.kvazaarParams': { id: 'expl.libkvazaar.kvazaarParams', title: 'kvazaar 附加参数', short: '通过 -kvazaar-params key1=val1:key2=val2 直通 kvazaar 库内部参数。', effects: { quality: 2, fileSize: 2, speed: 2, compatibility: 0 }, sourceRefs: [{ repository: 'ultravideo/kvazaar', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },

  // ================================================================
  // libsvt_hevc — Intel SVT-HEVC (⚠️ 需要自行打补丁编译)
  // ================================================================

  'expl.libsvthevc': { id: 'expl.libsvthevc', title: 'libsvt_hevc (HEVC — SVT-HEVC, ⚠️ 需补丁)', short: '⚠️ Intel SVT 架构 HEVC 编码器——FFmpeg 8.1.2 公开发行版不包含此编码器。需要从 OpenVisualCloud/SVT-HEVC 获取补丁并自行编译带 SVT-HEVC 支持的 FFmpeg。BSD 许可，多核扩展性出色。如选中此编码器但 FFmpeg 未打补丁，将提示"Unknown encoder"错误。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 0 }, sourceRefs: [{ repository: 'OpenVisualCloud/SVT-HEVC', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libsvthevc.preset': { id: 'expl.libsvthevc.preset', title: 'SVT-HEVC 编码预设', short: '0 (最慢/最高质量) 到 12 (最快)，默认 7。类似 SVT-AV1 的预设体系。', effects: { quality: 3, fileSize: 3, speed: 5, compatibility: 0 }, sourceRefs: [{ repository: 'OpenVisualCloud/SVT-HEVC', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libsvthevc.tune': { id: 'expl.libsvthevc.tune', title: 'SVT-HEVC 质量指标', short: 'vq=视觉质量优化（默认），ssim=PSNR/SSIM 优化，vmaf=VMAF 优化。', effects: { quality: 2, fileSize: 1, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'OpenVisualCloud/SVT-HEVC', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libsvthevc.cqp': { id: 'expl.libsvthevc.cqp', title: 'SVT-HEVC CQP', short: '恒定量化参数，QP 1–63。', effects: { quality: 5, fileSize: 4, speed: 3, compatibility: 5 }, sourceRefs: [{ repository: 'OpenVisualCloud/SVT-HEVC', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libsvthevc.cqp.qp': { id: 'expl.libsvthevc.cqp.qp', title: 'SVT-HEVC CQP QP 值', short: 'QP 值 (1–63)，默认 32。', effects: { quality: 5, fileSize: 4, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'OpenVisualCloud/SVT-HEVC', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libsvthevc.vbr': { id: 'expl.libsvthevc.vbr', title: 'SVT-HEVC VBR', short: '可变码率模式。', effects: { quality: 3, fileSize: 3, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'OpenVisualCloud/SVT-HEVC', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libsvthevc.vbr.bitrate': { id: 'expl.libsvthevc.vbr.bitrate', title: 'SVT-HEVC VBR 码率', short: 'VBR 目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'OpenVisualCloud/SVT-HEVC', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libsvthevc.cbr': { id: 'expl.libsvthevc.cbr', title: 'SVT-HEVC CBR', short: '恒定码率模式。', effects: { quality: 2, fileSize: 4, speed: 4, compatibility: 5 }, sourceRefs: [{ repository: 'OpenVisualCloud/SVT-HEVC', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libsvthevc.cbr.bitrate': { id: 'expl.libsvthevc.cbr.bitrate', title: 'SVT-HEVC CBR 码率', short: 'CBR 恒定目标码率。', effects: { quality: 4, fileSize: 5, speed: 0, compatibility: 0 }, sourceRefs: [{ repository: 'OpenVisualCloud/SVT-HEVC', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libsvthevc.keyint': { id: 'expl.libsvthevc.keyint', title: 'SVT-HEVC GOP 大小', short: '关键帧之间的最大帧数。', effects: { quality: 1, fileSize: 1, speed: 0, compatibility: 2 }, sourceRefs: [{ repository: 'OpenVisualCloud/SVT-HEVC', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libsvthevc.lookahead': { id: 'expl.libsvthevc.lookahead', title: 'SVT-HEVC 前瞻帧数', short: '编码器前瞻分析帧数 (0–120)。提升码率控制精度。', effects: { quality: 2, fileSize: 1, speed: 2, compatibility: 0 }, sourceRefs: [{ repository: 'OpenVisualCloud/SVT-HEVC', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libsvthevc.asm': { id: 'expl.libsvthevc.asm', title: 'SVT-HEVC 汇编优化', short: '启用汇编优化以提升编码速度。', effects: { quality: 0, fileSize: 0, speed: 2, compatibility: 0 }, sourceRefs: [{ repository: 'OpenVisualCloud/SVT-HEVC', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
  'expl.libsvthevc.threads': { id: 'expl.libsvthevc.threads', title: 'SVT-HEVC 逻辑处理器数', short: '指定编码使用的逻辑处理器数。', effects: { quality: 0, fileSize: 0, speed: 3, compatibility: 0 }, sourceRefs: [{ repository: 'OpenVisualCloud/SVT-HEVC', snapshotDate: '2026-07-20', file: 'README.md', sourceType: 'encoder-official' }] },
}
