import type {
  ControlDefinition,
  EncoderDefinition,
  RateControlModeDefinition,
  SourceRef,
} from '@ffcodec/domain/catalog/catalog-types'
import { audioQualityValuePath } from '@ffcodec/domain/config/config-path'

export const ffmpegAudioSource: SourceRef = {
  repository: 'FFmpeg/FFmpeg',
  branch: 'master',
  snapshotDate: '2026-07-22',
  file: 'doc/encoders.texi',
  sourceType: 'ffmpeg-official',
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/doc/encoders.texi',
}

export function audioBitrateMode(explanationId: string): RateControlModeDefinition[] {
  return [{
    id: 'vbr',
    label: '码率/质量编码',
    controls: [],
    emitterId: 'emitter.audio.vbr',
    explanationId,
    sourceRefs: [ffmpegAudioSource],
  }]
}

export function audioTriState(
  id: string,
  label: string,
  argName: string,
  explanationId: string,
): ControlDefinition {
  const pathParts = id.split('.')
  const configKey = pathParts[pathParts.length - 1]
  return {
    id,
    label,
    control: 'select',
    configBinding: { path: audioQualityValuePath(configKey) },
    commandBinding: { argName, prefix: argName, phase: 'AUDIO_CODEC' },
    options: [
      { value: 'auto', label: '跟随编码器默认' },
      { value: 0, label: '关闭' },
      { value: 1, label: '开启' },
    ],
    defaultValue: 'auto',
    explanationId,
  }
}

export function createAudioEncoder(definition: Omit<EncoderDefinition,
  'mediaType' | 'implementation' | 'sourceRefs' | 'sourceAuthority' |
  'verificationLevel' | 'needsCrossVerification' | 'status'>): EncoderDefinition {
  return {
    ...definition,
    mediaType: 'audio',
    implementation: 'software',
    sourceRefs: [ffmpegAudioSource],
    sourceAuthority: 'ffmpeg-official',
    verificationLevel: 'official',
    needsCrossVerification: false,
    status: 'verified',
  }
}

export const libfdkAac = createAudioEncoder({
  id: 'libfdk_aac', label: 'FDK AAC', ffmpegName: 'libfdk_aac', family: 'aac', audioCategory: 'aac',
  defaultAudioBitrate: '128k',
  availabilityClass: 'ffmpeg-build-dependent',
  capabilityScope: { buildRequirements: ['FFmpeg --enable-libfdk-aac'], library: { name: 'libfdk-aac' } },
  availabilityNote: '需要 FFmpeg 构建时启用 libfdk-aac。LC、HE、HE v2 是同一 encoder 的 profiles。',
  capabilities: { supportsLossless: false, supportedContainers: ['mp4', 'mkv', 'mov', 'm4a', 'ts'] },
  qualityModes: audioBitrateMode('expl.libfdk_aac'),
  specialParameters: [
    {
      id: 'libfdk_aac.profile', label: 'FDK AAC Profile', control: 'select',
      configBinding: { path: audioQualityValuePath('profile') },
      commandBinding: { argName: '-profile:a', prefix: '-profile:a', phase: 'AUDIO_CODEC' },
      options: [
        { value: 'aac_low', label: 'AAC LC — 通用' },
        { value: 'aac_he', label: 'HE-AAC — 低码率' },
        { value: 'aac_he_v2', label: 'HE-AAC v2 — 更低码率立体声' },
        { value: 'aac_ld', label: 'AAC-LD — 低延迟' },
        { value: 'aac_eld', label: 'AAC-ELD — 增强低延迟' },
      ],
      defaultValue: 'aac_low', explanationId: 'expl.libfdk_aac.profile',
    },
    {
      id: 'libfdk_aac.vbr', label: 'VBR 质量 (1~5)', control: 'number',
      configBinding: { path: audioQualityValuePath('vbr') },
      commandBinding: { argName: '-vbr', prefix: '-vbr', phase: 'AUDIO_QUALITY' },
      range: { min: 1, max: 5, step: 1 }, optional: true,
      activeWhen: { path: 'audio.qualityValues.profile', equals: 'aac_low' },
      explanationId: 'expl.libfdk_aac.vbr',
    },
  ],
  requiredArguments: [], defaultArguments: [], explanationId: 'expl.libfdk_aac',
})

export const libmp3lame = createAudioEncoder({
  id: 'libmp3lame', label: 'LAME MP3', ffmpegName: 'libmp3lame', family: 'mp3', audioCategory: 'general-lossy',
  defaultAudioBitrate: '192k',
  availabilityClass: 'ffmpeg-build-dependent',
  capabilityScope: { buildRequirements: ['FFmpeg --enable-libmp3lame'], library: { name: 'libmp3lame' } },
  availabilityNote: '需要 FFmpeg 构建包含 libmp3lame。',
  capabilities: { supportsLossless: false, supportedContainers: ['mp4', 'mkv', 'mov', 'avi'] },
  qualityModes: audioBitrateMode('expl.libmp3lame'),
  specialParameters: [
    { id: 'libmp3lame.quality', label: 'VBR 质量 (-q:a，0最好)', control: 'number', configBinding: { path: audioQualityValuePath('quality') }, commandBinding: { argName: '-q:a', prefix: '-q:a', phase: 'AUDIO_QUALITY' }, range: { min: 0, max: 9, step: 1 }, optional: true, explanationId: 'expl.libmp3lame.quality' },
    audioTriState('libmp3lame.reservoir', '比特储备', '-reservoir', 'expl.libmp3lame.reservoir'),
    audioTriState('libmp3lame.jointStereo', '联合立体声', '-joint_stereo', 'expl.libmp3lame.jointStereo'),
  ],
  requiredArguments: [], defaultArguments: [], explanationId: 'expl.libmp3lame',
})

export const alac = createAudioEncoder({
  id: 'alac', label: 'ALAC (Apple Lossless)', ffmpegName: 'alac', family: 'alac', audioCategory: 'lossless',
  availabilityClass: 'generally-available',
  availabilityNote: 'FFmpeg 内置 ALAC 无损编码器。',
  capabilities: { supportsLossless: true, supportedContainers: ['mp4', 'mkv', 'mov', 'm4a'] },
  qualityModes: [],
  specialParameters: [
    { id: 'alac.minPredictionOrder', label: '最小预测阶数', control: 'number', configBinding: { path: audioQualityValuePath('minPredictionOrder') }, commandBinding: { argName: '-min_prediction_order', prefix: '-min_prediction_order', phase: 'AUDIO_CODEC' }, range: { min: 1, max: 30, step: 1 }, optional: true, explanationId: 'expl.alac.prediction' },
    { id: 'alac.maxPredictionOrder', label: '最大预测阶数', control: 'number', configBinding: { path: audioQualityValuePath('maxPredictionOrder') }, commandBinding: { argName: '-max_prediction_order', prefix: '-max_prediction_order', phase: 'AUDIO_CODEC' }, range: { min: 1, max: 30, step: 1 }, optional: true, explanationId: 'expl.alac.prediction' },
  ],
  requiredArguments: [], defaultArguments: [], explanationId: 'expl.alac',
})

function dolbyEncoder(id: 'ac3' | 'eac3', label: string): EncoderDefinition {
  return createAudioEncoder({
    id, label, ffmpegName: id, family: id, audioCategory: 'general-lossy',
    defaultAudioBitrate: id === 'ac3' ? '384k' : '384k',
    availabilityClass: 'generally-available', availabilityNote: 'FFmpeg 内置 Dolby 音频编码器。',
    capabilities: { supportsLossless: false, supportedContainers: ['mkv', 'mp4', 'mov', 'ts'] },
    qualityModes: audioBitrateMode(`expl.${id}`),
    specialParameters: [
      { id: `${id}.dialnorm`, label: '对白归一化 (dB)', control: 'number', configBinding: { path: audioQualityValuePath('dialnorm') }, commandBinding: { argName: '-dialnorm', prefix: '-dialnorm', phase: 'AUDIO_CODEC' }, range: { min: -31, max: -1, step: 1 }, optional: true, explanationId: 'expl.dolby.dialnorm' },
    ],
    requiredArguments: [], defaultArguments: [], explanationId: `expl.${id}`,
  })
}

export const ac3 = dolbyEncoder('ac3', 'ATSC A/52A (AC-3)')
export const eac3 = dolbyEncoder('eac3', 'ATSC A/52B (E-AC-3)')

export const wavpack = createAudioEncoder({
  id: 'wavpack', label: 'WavPack', ffmpegName: 'wavpack', family: 'wavpack', audioCategory: 'lossless',
  availabilityClass: 'generally-available', availabilityNote: 'FFmpeg 内置 WavPack 无损编码器。',
  capabilities: { supportsLossless: true, supportedContainers: ['mkv'] }, qualityModes: [],
  specialParameters: [
    audioTriState('wavpack.jointStereo', '联合立体声', '-joint_stereo', 'expl.wavpack.jointStereo'),
    audioTriState('wavpack.optimizeMono', '单声道优化', '-optimize_mono', 'expl.wavpack.optimizeMono'),
  ],
  requiredArguments: [], defaultArguments: [], explanationId: 'expl.wavpack',
})

export const libvorbis = createAudioEncoder({
  id: 'libvorbis', label: 'Vorbis', ffmpegName: 'libvorbis', family: 'vorbis', audioCategory: 'general-lossy',
  defaultAudioBitrate: '160k',
  availabilityClass: 'ffmpeg-build-dependent',
  capabilityScope: { buildRequirements: ['FFmpeg --enable-libvorbis'], library: { name: 'libvorbis' } },
  availabilityNote: '推荐使用外部 libvorbis 实现；需要对应 FFmpeg 构建支持。',
  capabilities: { supportsLossless: false, supportedContainers: ['mkv', 'ogg', 'webm'] },
  qualityModes: audioBitrateMode('expl.libvorbis'),
  specialParameters: [
    { id: 'libvorbis.quality', label: 'VBR 质量 (-q:a)', control: 'number', configBinding: { path: audioQualityValuePath('quality') }, commandBinding: { argName: '-q:a', prefix: '-q:a', phase: 'AUDIO_QUALITY' }, range: { min: -1, max: 10, step: 0.1 }, optional: true, explanationId: 'expl.libvorbis.quality' },
    { id: 'libvorbis.iblock', label: '脉冲块偏置', control: 'number', configBinding: { path: audioQualityValuePath('iblock') }, commandBinding: { argName: '-iblock', prefix: '-iblock', phase: 'AUDIO_CODEC' }, range: { min: -15, max: 0, step: 0.1 }, optional: true, explanationId: 'expl.libvorbis.iblock' },
  ],
  requiredArguments: [], defaultArguments: [], explanationId: 'expl.libvorbis',
})

function pcm(id: 'pcm_s16le' | 'pcm_s32le' | 'pcm_s64le' | 'pcm_f64le', label: string): EncoderDefinition {
  return createAudioEncoder({
    id, label, ffmpegName: id, family: 'pcm', audioCategory: 'pcm', availabilityClass: 'generally-available',
    availabilityNote: 'FFmpeg 内置未压缩 PCM 编码器；文件体积很大。',
    capabilities: { supportsLossless: true, supportedContainers: ['wav', 'mkv', 'mov'] },
    qualityModes: [], specialParameters: [], requiredArguments: [], defaultArguments: [], explanationId: `expl.${id}`,
  })
}

export const pcmS16le = pcm('pcm_s16le', 'WAV PCM 16-bit integer')
export const pcmS32le = pcm('pcm_s32le', 'WAV PCM 32-bit integer')
export const pcmS64le = pcm('pcm_s64le', 'WAV PCM 64-bit integer')
export const pcmF64le = pcm('pcm_f64le', 'WAV PCM 64-bit float')
