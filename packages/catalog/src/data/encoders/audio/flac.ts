import type { EncoderDefinition } from '@ffcodec/domain/catalog/catalog-types'
import { audioQualityValuePath } from '@ffcodec/domain/config/config-path'

export const flac: EncoderDefinition = {
  id: 'flac',
  label: 'FLAC (Free Lossless Audio Codec)',
  ffmpegName: 'flac',
  mediaType: 'audio',
  family: 'flac' as const,
  audioCategory: 'lossless',
  implementation: 'software' as const,
  availabilityClass: 'generally-available',

  capabilityScope: {
    notes: [
      'FLAC 编码器随 FFmpeg 主构建分发，无需额外编译选项',
      'FLAC 是无损编码 — 压缩级别影响文件大小和编码速度，不影响解码后音频内容',
    ],
  },

  availabilityNote:
    'FLAC 无损音频编码器随 FFmpeg 主构建分发。压缩级别影响编码速度和文件大小，不改变音频质量。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: false,
    supportsLossless: true,
    supportedContainers: ['mkv', 'mp4', 'ogg'],
  },

  // FLAC is lossless — no quality modes (no bitrate/quality controls needed)
  qualityModes: [],

  specialParameters: [
    {
      id: 'flac.compression_level',
      label: '压缩级别 (compression_level)',
      control: 'select',
      configBinding: { path: audioQualityValuePath('compressionLevel') },
      commandBinding: { argName: '-compression_level', prefix: '-compression_level', phase: 'AUDIO_CODEC' },
      options: [
        { value: 0, label: '0 — 最快 (无压缩)' },
        { value: 3, label: '3' },
        { value: 5, label: '5 — 默认', description: '速度与压缩率平衡' },
        { value: 8, label: '8' },
        { value: 12, label: '12 — 最高压缩 (最慢)' },
      ],
      range: { min: 0, max: 12 },
      defaultValue: 5,
      explanationId: 'expl.flac.compression',
    },
    {
      id: 'flac.sampleFormat',
      label: '采样格式 (sample_fmt)',
      control: 'select',
      configBinding: { path: audioQualityValuePath('sampleFormat') },
      commandBinding: { argName: '-sample_fmt', prefix: '-sample_fmt', phase: 'AUDIO_CODEC' },
      options: [
        { value: 'auto', label: '自动' },
        { value: 's16', label: 's16 (16-bit)' },
        { value: 's24', label: 's24 (24-bit)' },
        { value: 's32', label: 's32 (32-bit)' },
      ],
      defaultValue: 'auto',
      explanationId: 'expl.flac.samplefmt',
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.flac',
  sourceRefs: [
    {
      repository: 'FFmpeg/FFmpeg',
      snapshotDate: '2026-07-10',
      file: 'libavcodec/flacenc.c',
      sourceType: 'ffmpeg-official',
      url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/flacenc.c',
    },
    {
      repository: 'Xiph/flac',
      snapshotDate: '2026-07-10',
      file: 'FLAC documentation',
      sourceType: 'encoder-official',
      url: 'https://xiph.org/flac/documentation.html',
    },
  ],
  sourceAuthority: 'encoder-official',
  verificationLevel: 'cross-verified',
  needsCrossVerification: false,
  status: 'verified',
}
