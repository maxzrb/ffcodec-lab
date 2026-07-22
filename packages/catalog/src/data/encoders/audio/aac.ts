import type { EncoderDefinition } from '@ffcodec/domain/catalog/catalog-types'
import { CONFIG_PATHS, audioQualityValuePath } from '@ffcodec/domain/config/config-path'

export const aac: EncoderDefinition = {
  id: 'aac',
  label: 'FFmpeg 原生 AAC',
  ffmpegName: 'aac',
  mediaType: 'audio',
  family: 'aac' as const,
  audioCategory: 'aac',
  defaultAudioBitrate: '192k',
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
      id: 'aac.coder',
      label: 'AAC 编码配置',
      control: 'select',
      configBinding: { path: audioQualityValuePath('coder') },
      commandBinding: { argName: '-aac_coder', prefix: '-aac_coder', phase: 'AUDIO_CODEC' },
      options: [
        { value: 'auto', label: '自动' },
        { value: 'twoloop', label: 'twoloop — 标准质量' },
        { value: 'fast', label: 'fast — 快速编码' },
        {
          value: 'nmr',
          label: 'nmr — 噪声掩蔽比搜索',
          description: '新版 FFmpeg 算法；旧构建可能不支持，Desktop 将按本机能力核验',
          capabilityScope: {
            notes: ['FFmpeg 上游于 2026-06-10 合入；使用前应以 ffmpeg -h encoder=aac 核验'],
          },
        },
      ],
      defaultValue: 'auto',
      explanationId: 'expl.aac.profile',
    },
    {
      id: 'aac.nmrSpeed',
      label: 'NMR 搜索速度 (-aac_nmr_speed)',
      control: 'number',
      configBinding: { path: audioQualityValuePath('nmrSpeed') },
      commandBinding: { argName: '-aac_nmr_speed', prefix: '-aac_nmr_speed', phase: 'AUDIO_CODEC' },
      range: { min: 0, max: 4, step: 1 },
      defaultValue: 0,
      optional: true,
      activeWhen: { path: 'audio.qualityValues.coder', equals: 'nmr' },
      explanationId: 'expl.aac.nmrSpeed',
    },
    ...[
      ['ms', 'M/S 立体声 (-aac_ms)', '-aac_ms', 'expl.aac.ms'],
      ['is', '强度立体声 (-aac_is)', '-aac_is', 'expl.aac.is'],
      ['pns', '感知噪声替代 (-aac_pns)', '-aac_pns', 'expl.aac.pns'],
      ['tns', '时域噪声整形 (-aac_tns)', '-aac_tns', 'expl.aac.tns'],
      ['pce', 'PCE 声道配置 (-aac_pce)', '-aac_pce', 'expl.aac.pce'],
    ].map(([key, label, argName, explanationId]) => ({
      id: `aac.${key}`,
      label,
      control: 'select' as const,
      configBinding: { path: audioQualityValuePath(key) },
      commandBinding: { argName, prefix: argName, phase: 'AUDIO_CODEC' as const },
      options: [
        { value: 'auto', label: '跟随编码器默认' },
        { value: 0, label: '关闭' },
        { value: 1, label: '开启' },
      ],
      defaultValue: 'auto',
      explanationId,
    })),
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
