import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { CONFIG_PATHS } from '../../../domain/config/config-path'

const src = { repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20',
  file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/mfenc.c' }

export const hevcMf: EncoderDefinition = {
  id: 'hevc_mf', label: 'hevc_mf (HEVC — MediaFoundation)', ffmpegName: 'hevc_mf',
  mediaType: 'video', family: 'hevc' as const, implementation: 'other' as const,
  availabilityClass: 'platform-dependent',
  capabilityScope: {
    ffmpeg: { minVersion: '3.4' },
    hardware: [
      { vendor: 'nvidia', feature: 'MediaFoundation HEVC', operatingSystems: ['windows'],
        verificationLevel: 'cross-verified', sourceRefs: [{ ...src }] },
      { vendor: 'amd', feature: 'MediaFoundation HEVC', operatingSystems: ['windows'],
        verificationLevel: 'cross-verified', sourceRefs: [{ ...src }] },
      { vendor: 'intel', feature: 'MediaFoundation HEVC', operatingSystems: ['windows'],
        verificationLevel: 'cross-verified', sourceRefs: [{ ...src }] },
    ],
    notes: ['仅 Windows', '通过 Windows Media Foundation 框架调用 GPU 编码'],
  },
  availabilityNote: 'Windows Media Foundation HEVC 硬件编码器。仅 Windows，无需额外编译选项。',
  capabilities: { copy: false, disabled: false, supportsTwoPass: false, supportsLossless: false,
    supportedContainers: ['mp4', 'mkv'] },
  qualityModes: [
    { id: 'cqp', label: 'CQP', emitterId: 'emitter.mf_hevc.cqp', explanationId: 'expl.hevc_mf.cqp',
      sourceRefs: [{ ...src }],
      controls: [{ id: 'hevc_mf.cqp.qp', label: 'QP 值 (-qp)', control: 'number',
        commandBinding: { argName: '-qp', prefix: '-qp', phase: 'VIDEO_RATE_CONTROL' },
        configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
        range: { min: 0, max: 51, step: 1 }, defaultValue: 28, explanationId: 'expl.hevc_mf.cqp.qp' }] },
    { id: 'vbr', label: 'VBR', emitterId: 'emitter.mf_hevc.vbr', explanationId: 'expl.hevc_mf.vbr',
      sourceRefs: [{ ...src }],
      controls: [{ id: 'hevc_mf.vbr.bitrate', label: '目标码率 (-b:v)', control: 'text',
        commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
        configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate }, defaultValue: '5000k',
        explanationId: 'expl.hevc_mf.vbr.bitrate' }] },
    { id: 'cbr', label: 'CBR', emitterId: 'emitter.mf_hevc.cbr', explanationId: 'expl.hevc_mf.cbr',
      sourceRefs: [{ ...src }],
      controls: [{ id: 'hevc_mf.cbr.bitrate', label: '目标码率 (-b:v)', control: 'text',
        commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
        configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate }, defaultValue: '5000k',
        explanationId: 'expl.hevc_mf.cbr.bitrate' }] },
  ],
  specialParameters: [],
  requiredArguments: [], defaultArguments: [],
  explanationId: 'expl.hevc_mf',
  sourceRefs: [{ ...src }],
  sourceAuthority: 'encoder-official', verificationLevel: 'cross-verified',
  needsCrossVerification: false, status: 'verified',
}
