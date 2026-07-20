import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { videoSpecialParamPath } from '../../../domain/config/config-path'

const src = { repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20',
  file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/videotoolboxenc.c' }

export const proresVideoToolbox: EncoderDefinition = {
  id: 'prores_videotoolbox', label: 'prores_videotoolbox (ProRes — Apple VideoToolbox)',
  ffmpegName: 'prores_videotoolbox', mediaType: 'video', family: 'prores' as const,
  implementation: 'apple' as const, availabilityClass: 'platform-dependent',
  capabilityScope: {
    ffmpeg: { minVersion: '5.0' },
    hardware: [
      { vendor: 'apple', feature: 'VideoToolbox ProRes 硬件编码', minimumGeneration: 'Apple Silicon (M1+)',
        minimumDriver: 'macOS 12+', operatingSystems: ['macos'],
        verificationLevel: 'cross-verified', sourceRefs: [{ ...src }] },
    ],
    notes: ['仅 macOS / iOS 可用', '需要 Apple Silicon 或 T2 芯片的 Mac', '通过 VideoToolbox 框架调用硬件编码'],
  },
  availabilityNote: 'Apple VideoToolbox ProRes 硬件编码器。仅 macOS/iOS，需要 Apple Silicon 或 T2 芯片。',
  capabilities: { copy: false, disabled: false, supportsTwoPass: false, supportsLossless: false,
    supportedContainers: ['mov'] },
  profile: {
    id: 'prores_vt.profile', label: 'ProRes Profile (-profile:v)', control: 'select',
    commandBinding: { argName: '-profile:v', prefix: '-profile:v', phase: 'VIDEO_PROFILE' },
    options: [
      { value: '0', label: '0 — 422 Proxy' }, { value: '1', label: '1 — 422 LT' },
      { value: '2', label: '2 — 422 (默认)' }, { value: '3', label: '3 — 422 HQ' },
      { value: '4', label: '4 — 4444' }, { value: '5', label: '5 — 4444 XQ' },
    ],
    defaultValue: '2', explanationId: 'expl.prores_vt.profile',
  },
  qualityModes: [
    { id: 'cqp', label: 'Profile 决定质量', emitterId: 'emitter.prores_vt.default',
      explanationId: 'expl.prores_vt.default',
      sourceRefs: [{ ...src, note: 'ProRes VideoToolbox 质量由 profile 决定' }], controls: [] },
  ],
  specialParameters: [
    { id: 'prores_vt.prioSpeed', label: '优先速度 (-prio_speed)', control: 'switch',
      configBinding: { path: videoSpecialParamPath('prioSpeed') },
      commandBinding: { argName: '-prio_speed', prefix: '-prio_speed', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.videotoolbox.prioSpeed', sourceRefs: [src] },
  ],
  requiredArguments: [], defaultArguments: [],
  explanationId: 'expl.prores_vt',
  sourceRefs: [{ ...src }],
  sourceAuthority: 'encoder-official', verificationLevel: 'cross-verified',
  needsCrossVerification: false, status: 'verified',
}
