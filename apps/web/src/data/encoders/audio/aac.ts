import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { CONFIG_PATHS, audioQualityValuePath } from '../../../domain/config/config-path'

export const aac: EncoderDefinition = {
  id: 'aac',
  label: 'FFmpeg 原生 AAC',
  ffmpegName: 'aac',
  mediaType: 'audio',
  family: 'aac' as const,
  implementation: 'software' as const,
  availabilityClass: 'generally-available',
  capabilityScope: {
    notes: ['FFmpeg 原生 AAC 编码器随 FFmpeg 主构建分发，无需额外编译选项'],
  },
  availabilityNote:
    'FFmpeg 原生 AAC 编码器随 FFmpeg 主构建分发。可用性取决于本机 FFmpeg 构建。可运行 ffmpeg -encoders | grep aac 检查。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: false,
    supportsLossless: false,
    supportedContainers: ['mp4', 'mkv', 'mov', 'm4a', 'flv', 'ts', 'avi'],
  },

  qualityModes: [
    {
      id: 'vbr',
      label: 'VBR (可变码率)',
      emitterId: 'emitter.audio.vbr',
      explanationId: 'expl.aac.vbr',
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
      controls: [
        {
          id: 'aac.bitrate',
          label: '音频码率 (-b:a)',
          control: 'select',
          commandBinding: { argName: '-b:a', prefix: '-b:a', phase: 'AUDIO_QUALITY' },
          configBinding: { path: CONFIG_PATHS.audio.bitrate },
          options: [
            { value: '96k', label: '96 kbps' },
            { value: '128k', label: '128 kbps', description: '常用默认值' },
            { value: '192k', label: '192 kbps' },
            { value: '256k', label: '256 kbps' },
            { value: '320k', label: '320 kbps' },
          ],
          defaultValue: '192k',
          explanationId: 'expl.aac.bitrate',
        },
      ],
    },
    {
      id: 'cbr',
      label: 'CBR (恒定码率)',
      emitterId: 'emitter.audio.cbr',
      explanationId: 'expl.aac.cbr',
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
      controls: [
        {
          id: 'aac.cbr.bitrate',
          label: '音频码率 (-b:a)',
          control: 'select',
          commandBinding: { argName: '-b:a', prefix: '-b:a', phase: 'AUDIO_QUALITY' },
          configBinding: { path: CONFIG_PATHS.audio.bitrate },
          options: [
            { value: '96k', label: '96 kbps' },
            { value: '128k', label: '128 kbps' },
            { value: '192k', label: '192 kbps' },
            { value: '256k', label: '256 kbps' },
            { value: '320k', label: '320 kbps' },
          ],
          defaultValue: '192k',
          explanationId: 'expl.aac.cbr.bitrate',
        },
      ],
    },
  ],

  specialParameters: [
    {
      id: 'aac.profile',
      label: 'AAC 编码配置',
      control: 'select',
      configBinding: { path: audioQualityValuePath('profile') },
      commandBinding: { argName: '-aac_coder', prefix: '-aac_coder', phase: 'AUDIO_CODEC' },
      options: [
        { value: 'auto', label: '自动' },
        { value: 'twoloop', label: 'twoloop — 标准质量' },
        { value: 'fast', label: 'fast — 快速编码' },
        {
          value: 'anmr',
          label: 'anmr — 平均噪声掩蔽比',
          description: '实验性算法，输出质量可能不稳定，不推荐用于生产编码',
          capabilityScope: { notes: ['实验性选项 (experimental)，输出质量不稳定'] },
        },
      ],
      defaultValue: 'auto',
      explanationId: 'expl.aac.profile',
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.aac',
  sourceRefs: [
    {
      repository: 'Lake1059/FFmpegFreeUI',
      branch: 'main',
      snapshotDate: '2026-07-10',
      file: 'src/databases/audio-encoders.json',
      symbol: 'aac',
      sourceType: 'ffmpegfreeui',
    },
    {
      repository: 'FFmpeg/FFmpeg',
      branch: 'master',
      snapshotDate: '2026-07-10',
      file: 'libavcodec/aacenc.c',
      sourceType: 'ffmpeg-official',
      url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/aacenc.c',
    },
  ],
  sourceAuthority: 'ffmpegfreeui',
  verificationLevel: 'project-derived',
  needsCrossVerification: true,
  status: 'verified',
}
