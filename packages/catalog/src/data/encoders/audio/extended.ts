import type { EncoderDefinition } from '@ffcodec/domain/catalog/catalog-types'
import { audioQualityValuePath } from '@ffcodec/domain/config/config-path'
import { audioBitrateMode, audioTriState, createAudioEncoder } from './core'

function simple(definition: {
  id: string
  label: string
  ffmpegName?: string
  family?: EncoderDefinition['family']
  category: NonNullable<EncoderDefinition['audioCategory']>
  availability: EncoderDefinition['availabilityClass']
  availabilityNote: string
  lossless?: boolean
  containers: string[]
  bitrate?: boolean
  strictExperimental?: boolean
  defaultBitrate?: string
}): EncoderDefinition {
  return createAudioEncoder({
    id: definition.id,
    label: definition.label,
    ffmpegName: definition.ffmpegName ?? definition.id,
    family: definition.family ?? 'other',
    audioCategory: definition.category,
    defaultAudioBitrate: definition.lossless || definition.bitrate === false
      ? undefined
      : definition.defaultBitrate ?? '192k',
    availabilityClass: definition.availability,
    availabilityNote: definition.availabilityNote,
    capabilityScope: definition.availability === 'platform-dependent'
      ? { notes: ['仅在对应平台和 FFmpeg 构建中可用'] }
      : definition.availability === 'ffmpeg-build-dependent'
        ? { buildRequirements: [`FFmpeg 构建需包含 ${definition.ffmpegName ?? definition.id}`] }
        : undefined,
    capabilities: {
      supportsLossless: definition.lossless ?? false,
      supportedContainers: definition.containers,
    },
    qualityModes: definition.bitrate === false || definition.lossless
      ? []
      : audioBitrateMode(`expl.${definition.id}`),
    specialParameters: definition.strictExperimental ? [{
      id: `${definition.id}.strict`, label: '启用实验编码器', control: 'select',
      configBinding: { path: audioQualityValuePath('strict') },
      commandBinding: { argName: '-strict', prefix: '-strict', phase: 'AUDIO_CODEC' },
      options: [{ value: 'experimental', label: 'experimental' }],
      defaultValue: 'experimental', explanationId: 'expl.audio.strictExperimental',
    }] : [],
    requiredArguments: [], defaultArguments: [], explanationId: `expl.${definition.id}`,
  })
}

export const extendedAudioEncoders: EncoderDefinition[] = [
  simple({ id: 'aac_at', label: 'AudioToolbox AAC', family: 'aac', category: 'platform', availability: 'platform-dependent', availabilityNote: '仅 Apple 平台的 AudioToolbox FFmpeg 构建可用。', containers: ['mp4', 'mkv', 'mov', 'm4a'] }),
  simple({ id: 'alac_at', label: 'AudioToolbox ALAC', family: 'alac', category: 'platform', availability: 'platform-dependent', availabilityNote: '仅 Apple 平台的 AudioToolbox FFmpeg 构建可用。', lossless: true, containers: ['mp4', 'mkv', 'mov', 'm4a'] }),
  simple({ id: 'pcm_alaw_at', label: 'AudioToolbox PCM A-law', family: 'pcm', category: 'platform', availability: 'platform-dependent', availabilityNote: 'Apple AudioToolbox G.711 A-law encoder。', lossless: true, containers: ['mov', 'wav', 'mkv'] }),
  simple({ id: 'pcm_mulaw_at', label: 'AudioToolbox PCM mu-law', family: 'pcm', category: 'platform', availability: 'platform-dependent', availabilityNote: 'Apple AudioToolbox G.711 mu-law encoder。', lossless: true, containers: ['mov', 'wav', 'mkv'] }),
  simple({ id: 'ilbc_at', label: 'AudioToolbox iLBC', category: 'platform', availability: 'platform-dependent', availabilityNote: '仅 Apple AudioToolbox 构建可用的语音编码器。', containers: ['mov', 'mkv'] }),
  simple({ id: 'opus', label: 'Opus（FFmpeg 原生实验实现）', family: 'opus', category: 'experimental', availability: 'experimental', availabilityNote: 'FFmpeg 原生 Opus encoder，通常优先选择 libopus。', containers: ['webm', 'mkv', 'ogg'], strictExperimental: true }),
  simple({ id: 'vorbis', label: 'Vorbis（FFmpeg 原生实验实现）', family: 'vorbis', category: 'experimental', availability: 'experimental', availabilityNote: 'FFmpeg 原生 Vorbis encoder，通常优先选择 libvorbis。', containers: ['webm', 'mkv', 'ogg'], strictExperimental: true }),
  simple({ id: 'dca', label: 'DTS Coherent Acoustics', category: 'experimental', availability: 'experimental', availabilityNote: 'FFmpeg DCA/DTS encoder，当前构建常标记为 experimental。', containers: ['mkv', 'ts'], strictExperimental: true }),
  simple({ id: 'truehd', label: 'TrueHD', category: 'experimental', availability: 'experimental', availabilityNote: 'FFmpeg TrueHD encoder，当前构建常标记为 experimental。', lossless: true, containers: ['mkv'], strictExperimental: true }),
  simple({ id: 'tta', label: 'True Audio (TTA)', category: 'lossless', availability: 'generally-available', availabilityNote: 'FFmpeg 内置 TTA 无损音频编码器。', lossless: true, containers: ['mkv'] }),
  simple({ id: 'real_144', label: 'RealAudio 1.0 (14.4K)', category: 'legacy', availability: 'generally-available', availabilityNote: '旧式低码率 RealAudio encoder；仅用于兼容历史工作流。', containers: ['mkv'], defaultBitrate: '14.4k' }),
  simple({ id: 'mp2', label: 'MP2（FFmpeg 原生）', category: 'legacy', availability: 'generally-available', availabilityNote: 'FFmpeg 内置 MPEG Audio Layer II encoder。', containers: ['mkv', 'ts', 'mp4'] }),
  simple({ id: 'libtwolame', label: 'TwoLAME MP2', category: 'general-lossy', availability: 'ffmpeg-build-dependent', availabilityNote: 'MP2 外部实现；“LAME MP2”应使用 TwoLAME 命名。', containers: ['mkv', 'ts', 'mp4'] }),
  simple({ id: 'libopencore_amrnb', label: 'AMR-NB', category: 'voice', availability: 'ffmpeg-build-dependent', availabilityNote: '依赖 OpenCORE AMR-NB，适合窄带语音。', containers: ['mov', 'mkv'], defaultBitrate: '12.2k' }),
  simple({ id: 'libvo_amrwbenc', label: 'AMR-WB', category: 'voice', availability: 'ffmpeg-build-dependent', availabilityNote: '依赖 VisualOn AMR-WB，适合宽带语音。', containers: ['mov', 'mkv'], defaultBitrate: '23.85k' }),
]

// AMR 与语音编码器的关键约束使用结构化控件表达。
for (const encoder of extendedAudioEncoders) {
  if (encoder.id === 'libopencore_amrnb') {
    encoder.specialParameters.push(audioTriState('libopencore_amrnb.dtx', '不连续传输 (DTX)', '-dtx', 'expl.audio.dtx'))
  }
  if (encoder.id === 'libvo_amrwbenc') {
    encoder.specialParameters.push(audioTriState('libvo_amrwbenc.dtx', '不连续传输 (DTX)', '-dtx', 'expl.audio.dtx'))
  }
}
