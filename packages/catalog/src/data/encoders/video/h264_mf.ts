import type { EncoderDefinition } from '@ffcodec/domain/catalog/catalog-types'
import { CONFIG_PATHS, videoSpecialParamPath } from '@ffcodec/domain/config/config-path'

const src = { repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20',
  file: 'libavcodec/mfenc.c', sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/mfenc.c' }

export const h264Mf: EncoderDefinition = {
  id: 'h264_mf', label: 'h264_mf (H.264 — MediaFoundation)', ffmpegName: 'h264_mf',
  mediaType: 'video', family: 'h264' as const, implementation: 'other' as const,
  availabilityClass: 'platform-dependent',
  capabilityScope: {
    ffmpeg: { minVersion: '3.4' },
    hardware: [
      { vendor: 'nvidia', feature: 'MediaFoundation H.264', operatingSystems: ['windows'],
        verificationLevel: 'cross-verified', sourceRefs: [{ ...src }] },
      { vendor: 'amd', feature: 'MediaFoundation H.264', operatingSystems: ['windows'],
        verificationLevel: 'cross-verified', sourceRefs: [{ ...src }] },
      { vendor: 'intel', feature: 'MediaFoundation H.264', operatingSystems: ['windows'],
        verificationLevel: 'cross-verified', sourceRefs: [{ ...src }] },
    ],
    notes: ['仅 Windows', '通过 Windows Media Foundation 框架调用 GPU 编码', '无需额外 FFmpeg 编译选项'],
  },
  availabilityNote: 'Windows Media Foundation H.264 硬件编码器。仅 Windows，无需额外编译选项。',
  capabilities: { copy: false, disabled: false, supportsTwoPass: false, supportsLossless: false,
    supportedContainers: ['mp4', 'mkv'] },
  qualityModes: [
    { id: 'cqp', label: 'CQP', emitterId: 'emitter.mf_h264.cqp', explanationId: 'expl.h264_mf.cqp',
      sourceRefs: [{ ...src }],
      controls: [{ id: 'h264_mf.cqp.qp', label: 'QP 值 (-qp)', control: 'number',
        commandBinding: { argName: '-qp', prefix: '-qp', phase: 'VIDEO_RATE_CONTROL' },
        configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
        range: { min: 0, max: 51, step: 1 }, defaultValue: 23, explanationId: 'expl.h264_mf.cqp.qp' }] },
    { id: 'vbr', label: 'VBR', emitterId: 'emitter.mf_h264.vbr', explanationId: 'expl.h264_mf.vbr',
      sourceRefs: [{ ...src }],
      controls: [{ id: 'h264_mf.vbr.bitrate', label: '目标码率 (-b:v)', control: 'text',
        commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
        configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate }, defaultValue: '5000k',
        explanationId: 'expl.h264_mf.vbr.bitrate' }] },
    { id: 'cbr', label: 'CBR', emitterId: 'emitter.mf_h264.cbr', explanationId: 'expl.h264_mf.cbr',
      sourceRefs: [{ ...src }],
      controls: [{ id: 'h264_mf.cbr.bitrate', label: '目标码率 (-b:v)', control: 'text',
        commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
        configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate }, defaultValue: '5000k',
        explanationId: 'expl.h264_mf.cbr.bitrate' }] },
  ],
  specialParameters: [
    { id: 'h264_mf.keyint', label: 'GOP 大小 (-g)', control: 'number',
      configBinding: { path: videoSpecialParamPath('keyint') },
      commandBinding: { argName: '-g', prefix: '-g', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.h264_mf.keyint', sourceRefs: [src] },
  ],
  requiredArguments: [], defaultArguments: [],
  explanationId: 'expl.h264_mf',
  sourceRefs: [{ ...src }],
  sourceAuthority: 'encoder-official', verificationLevel: 'cross-verified',
  needsCrossVerification: false, status: 'verified',
}