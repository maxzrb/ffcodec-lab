import type { ExplanationDefinition, SourceRef } from '@ffcodec/domain/catalog/catalog-types'

const source: SourceRef = {
  repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-22',
  file: 'doc/encoders.texi', sourceType: 'ffmpeg-official',
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/doc/encoders.texi',
}

const loudnormSource: SourceRef = {
  repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-22',
  file: 'doc/filters.texi#loudnorm', sourceType: 'ffmpeg-official',
  url: 'https://ffmpeg.org/ffmpeg-filters.html#loudnorm',
}

function explanation(id: string, title: string, short: string): ExplanationDefinition {
  return { id, title, short, sourceRefs: [source] }
}

export const audioExpandedExplanations: Record<string, ExplanationDefinition> = {
  'expl.audio.loudnorm': { id: 'expl.audio.loudnorm', title: '响度标准化', short: '使用 FFmpeg loudnorm 的单遍动态模式，同时约束综合响度、响度范围和最大真峰值。动态模式会为真峰值检测内部上采样至 192 kHz。', sourceRefs: [loudnormSource] },
  'expl.audio.loudnorm.I': { id: 'expl.audio.loudnorm.I', title: '目标综合响度', short: 'I 的官方范围为 -70~-5 LUFS，默认 -24。音乐平台常见目标约 -16 LUFS，影视和广播常见 -23~-24 LUFS。', sourceRefs: [loudnormSource] },
  'expl.audio.loudnorm.LRA': { id: 'expl.audio.loudnorm.LRA', title: '目标响度范围', short: 'LRA 的官方范围为 1~50 LU，默认 7。数值越低，滤镜允许的整体动态起伏越小。', sourceRefs: [loudnormSource] },
  'expl.audio.loudnorm.TP': { id: 'expl.audio.loudnorm.TP', title: '最大真峰值', short: 'TP 的官方范围为 -9~0 dBTP，默认 -2；留出负值余量可降低重采样或有损编码后的削波风险。', sourceRefs: [loudnormSource] },
  'expl.audio.loudnorm.dualMono': { id: 'expl.audio.loudnorm.dualMono', title: '双单声道补偿', short: '仅当单声道内容预期在立体声系统播放时开启；FFmpeg 会补偿这种播放方式造成的 EBU R128 感知测量偏差。', sourceRefs: [loudnormSource] },
  'expl.libfdk_aac': explanation('expl.libfdk_aac', 'FDK AAC', '高质量 AAC 外部实现；需要 FFmpeg 构建包含 libfdk-aac。'),
  'expl.libfdk_aac.profile': explanation('expl.libfdk_aac.profile', 'FDK AAC Profile', 'LC 通用性最好；HE 和 HE v2 面向低码率；LD/ELD 面向低延迟。'),
  'expl.libfdk_aac.vbr': explanation('expl.libfdk_aac.vbr', 'FDK VBR 质量', 'AAC LC 下可使用 1~5 的 VBR 质量级别，数值越高质量越高。'),
  'expl.libmp3lame': explanation('expl.libmp3lame', 'LAME MP3', '成熟的 MP3 编码器，兼容性极高，但压缩效率低于 AAC 和 Opus。'),
  'expl.libmp3lame.quality': explanation('expl.libmp3lame.quality', 'MP3 VBR 质量', 'LAME VBR 质量 0 最好、9 最低；设置后可与固定码率二选一。'),
  'expl.libmp3lame.reservoir': explanation('expl.libmp3lame.reservoir', 'MP3 比特储备', '允许复杂帧借用相邻帧的比特，通常保持编码器默认。'),
  'expl.libmp3lame.jointStereo': explanation('expl.libmp3lame.jointStereo', 'MP3 联合立体声', '利用声道相关性提高压缩效率，通常保持编码器默认。'),
  'expl.alac': explanation('expl.alac', 'ALAC', 'Apple Lossless 无损编码，适合 Apple 生态与 MP4/M4A 容器。'),
  'expl.alac.prediction': explanation('expl.alac.prediction', 'ALAC 预测阶数', '限制预测器搜索阶数；高级调优项，通常不设置。'),
  'expl.ac3': explanation('expl.ac3', 'AC-3', '广泛用于影视、广播和家庭影院的有损多声道音频。'),
  'expl.eac3': explanation('expl.eac3', 'E-AC-3', 'AC-3 的增强版本，支持更高效率和更多声道。'),
  'expl.dolby.dialnorm': explanation('expl.dolby.dialnorm', '对白归一化', '写入 Dolby 对白电平元数据，范围 -31~-1 dB；不确定时不设置。'),
  'expl.wavpack': explanation('expl.wavpack', 'WavPack', '无损音频编码器，适合归档和 Matroska 工作流。'),
  'expl.wavpack.jointStereo': explanation('expl.wavpack.jointStereo', 'WavPack 联合立体声', '利用左右声道相关性压缩，通常交由编码器决定。'),
  'expl.wavpack.optimizeMono': explanation('expl.wavpack.optimizeMono', 'WavPack 单声道优化', '针对双声道中等同声道的特殊优化，通常关闭。'),
  'expl.libvorbis': explanation('expl.libvorbis', 'Vorbis', 'Ogg/WebM 生态的有损音频编码；推荐外部 libvorbis 实现。'),
  'expl.libvorbis.quality': explanation('expl.libvorbis.quality', 'Vorbis VBR 质量', '使用 -q:a 设置 Vorbis 可变质量，值越高质量和体积越大。'),
  'expl.libvorbis.iblock': explanation('expl.libvorbis.iblock', 'Vorbis 脉冲块偏置', '高级瞬态块调节，范围 -15~0，通常不设置。'),
  'expl.pcm_s16le': explanation('expl.pcm_s16le', 'PCM 16-bit integer', '未压缩 16-bit 有符号整数 PCM，兼容性好、体积较大。'),
  'expl.pcm_s32le': explanation('expl.pcm_s32le', 'PCM 32-bit integer', '未压缩 32-bit 有符号整数 PCM，适合高精度中间文件。'),
  'expl.pcm_s64le': explanation('expl.pcm_s64le', 'PCM 64-bit integer', '未压缩 64-bit 有符号整数 PCM，与 64-bit float 明确区分。'),
  'expl.pcm_f64le': explanation('expl.pcm_f64le', 'PCM 64-bit float', '未压缩 64-bit 浮点 PCM，适合特殊高精度处理，文件体积很大。'),
  'expl.audio.strictExperimental': explanation('expl.audio.strictExperimental', '实验编码器许可', '生成 -strict experimental 以允许 FFmpeg 使用标记为实验性的音频 encoder。'),
  'expl.audio.dtx': explanation('expl.audio.dtx', '不连续传输', '语音静音段减少或停止编码，以降低平均码率；可能影响连续背景声。'),
}

const extended: Array<[string, string, string]> = [
  ['aac_at', 'AudioToolbox AAC', 'Apple 平台 AAC encoder，实际可用性取决于系统 AudioToolbox 和 FFmpeg 构建。'],
  ['alac_at', 'AudioToolbox ALAC', 'Apple 平台 ALAC 无损 encoder。'],
  ['pcm_alaw_at', 'AudioToolbox PCM A-law', 'Apple AudioToolbox G.711 A-law encoder。'],
  ['pcm_mulaw_at', 'AudioToolbox PCM mu-law', 'Apple AudioToolbox G.711 mu-law encoder。'],
  ['ilbc_at', 'AudioToolbox iLBC', 'Apple AudioToolbox 低码率语音 encoder。'],
  ['opus', '原生 Opus', 'FFmpeg 原生实验 Opus encoder；生产环境通常优先 libopus。'],
  ['vorbis', '原生 Vorbis', 'FFmpeg 原生实验 Vorbis encoder；生产环境通常优先 libvorbis。'],
  ['dca', 'DTS Coherent Acoustics', 'FFmpeg 实验性 DCA/DTS encoder，使用前检查构建支持与容器。'],
  ['truehd', 'TrueHD', '实验性无损家庭影院音频 encoder，容器和播放兼容性严格。'],
  ['tta', 'True Audio', 'TTA 无损音频编码，主要用于归档和 Matroska。'],
  ['real_144', 'RealAudio 1.0', '14.4K 历史语音格式，仅用于旧系统兼容。'],
  ['mp2', '原生 MP2', 'FFmpeg 内置 MPEG Audio Layer II encoder。'],
  ['libtwolame', 'TwoLAME MP2', '外部 TwoLAME MP2 encoder；不是 LAME MP3。'],
  ['libopencore_amrnb', 'AMR-NB', 'OpenCORE AMR-NB 窄带语音 encoder，需要对应外部库。'],
  ['libvo_amrwbenc', 'AMR-WB', 'VisualOn AMR-WB 宽带语音 encoder，需要对应外部库。'],
]

for (const [id, title, short] of extended) {
  audioExpandedExplanations[`expl.${id}`] = explanation(`expl.${id}`, title, short)
}
