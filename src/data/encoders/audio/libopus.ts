import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { CONFIG_PATHS } from '../../../domain/config/config-path'

export const libopus: EncoderDefinition = {
  id: 'libopus',
  label: 'libopus (Opus)',
  ffmpegName: 'libopus',
  mediaType: 'audio',
  family: 'opus' as const,
  implementation: 'software' as const,
  availabilityClass: 'ffmpeg-build-dependent',
  capabilityScope: {
    buildRequirements: ['--enable-libopus'],
    library: { name: 'libopus', minVersion: '1.3' },
    notes: ['libopus 编码器需要 FFmpeg 编译时启用 libopus'],
  },
  availabilityNote:
    'libopus 编码器需要 FFmpeg 编译时启用 libopus。可用性取决于本机 FFmpeg 构建。可运行 ffmpeg -encoders | grep opus 检查。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: false,
    supportsLossless: false,
    supportedContainers: ['mkv', 'webm', 'mp4', 'mov', 'opus'],
  },

  qualityModes: [
    {
      id: 'vbr',
      label: 'VBR (可变码率 — 推荐)',
      emitterId: 'emitter.audio.vbr',
      explanationId: 'expl.libopus.vbr.switch',
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
      controls: [
        {
          id: 'libopus.bitrate',
          label: '音频码率 (-b:a)',
          control: 'select',
          commandBinding: { argName: '-b:a', prefix: '-b:a', phase: 'AUDIO_QUALITY' },
          configBinding: { path: CONFIG_PATHS.audio.bitrate },
          options: [
            { value: '64k', label: '64 kbps' },
            { value: '96k', label: '96 kbps' },
            { value: '128k', label: '128 kbps', description: 'Opus 常用默认值' },
            { value: '160k', label: '160 kbps' },
            { value: '192k', label: '192 kbps' },
            { value: '256k', label: '256 kbps' },
            { value: '320k', label: '320 kbps' },
            { value: '510k', label: '510 kbps (最大)' },
          ],
          defaultValue: '128k',
          explanationId: 'expl.libopus.bitrate',
        },
      ],
    },
    {
      id: 'cbr',
      label: 'CBR (恒定码率)',
      emitterId: 'emitter.audio.cbr',
      explanationId: 'expl.libopus.cbr',
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
      controls: [
        {
          id: 'libopus.cbr.bitrate',
          label: '音频码率 (-b:a)',
          control: 'select',
          commandBinding: { argName: '-b:a', prefix: '-b:a', phase: 'AUDIO_QUALITY' },
          configBinding: { path: CONFIG_PATHS.audio.bitrate },
          options: [
            { value: '64k', label: '64 kbps' },
            { value: '96k', label: '96 kbps' },
            { value: '128k', label: '128 kbps' },
            { value: '160k', label: '160 kbps' },
            { value: '192k', label: '192 kbps' },
            { value: '256k', label: '256 kbps' },
            { value: '320k', label: '320 kbps' },
          ],
          defaultValue: '128k',
          explanationId: 'expl.libopus.cbr.bitrate',
        },
      ],
    },
  ],

  specialParameters: [
    {
      id: 'libopus.vbr',
      label: 'VBR 开关',
      control: 'switch',
      commandBinding: { argName: '-vbr', prefix: '-vbr', phase: 'AUDIO_CODEC' },
      options: [
        { value: 'on', label: '开启 VBR' },
        { value: 'off', label: '关闭 (CBR)' },
        { value: 'constrained', label: '受限 VBR' },
      ],
      defaultValue: 'on',
      explanationId: 'expl.libopus.vbr.switch',
    },
    {
      id: 'libopus.application',
      label: '编码应用类型',
      control: 'select',
      commandBinding: { argName: '-application', prefix: '-application', phase: 'AUDIO_CODEC' },
      options: [
        { value: 'audio', label: 'audio — 音乐', description: '适合音乐内容' },
        { value: 'voip', label: 'voip — 语音', description: '适合语音通信' },
        { value: 'lowdelay', label: 'lowdelay — 低延迟' },
      ],
      defaultValue: 'audio',
      explanationId: 'expl.libopus.application',
    },
    {
      id: 'libopus.frame_duration',
      label: '帧时长 (frame_duration)',
      control: 'select',
      commandBinding: { argName: '-frame_duration', prefix: '-frame_duration', phase: 'AUDIO_CODEC' },
      options: [
        { value: 2.5, label: '2.5 ms' },
        { value: 5, label: '5 ms' },
        { value: 10, label: '10 ms' },
        { value: 20, label: '20 ms (默认)', description: '平衡延迟与编码效率' },
        { value: 40, label: '40 ms' },
        { value: 60, label: '60 ms' },
      ],
      defaultValue: 20,
      explanationId: 'expl.libopus.frame_duration',
      capabilityScope: {
        notes: [
          'Opus 规范支持 2.5/5/10/20/40/60/80/100/120ms',
          'FFmpeg libopus 封装层仅暴露 2.5/5/10/20/40/60ms 六个选项',
        ],
      },
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.libopus',
  sourceRefs: [
    {
      repository: 'Lake1059/FFmpegFreeUI',
      branch: 'main',
      snapshotDate: '2026-07-10',
      file: 'src/databases/audio-encoders.json',
      symbol: 'libopus',
      sourceType: 'ffmpegfreeui',
    },
    {
      repository: 'FFmpeg/FFmpeg',
      branch: 'master',
      snapshotDate: '2026-07-10',
      file: 'libavcodec/libopusenc.c',
      sourceType: 'ffmpeg-official',
      url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libopusenc.c',
    },
  ],
  sourceAuthority: 'ffmpegfreeui',
  verificationLevel: 'project-derived',
  needsCrossVerification: true,
  status: 'verified',
}
