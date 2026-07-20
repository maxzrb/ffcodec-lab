import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { CONFIG_PATHS, videoSpecialParamPath } from '../../../domain/config/config-path'

const vaapiSource = {
  repository: 'FFmpeg/FFmpeg',
  branch: 'master',
  snapshotDate: '2026-07-20',
  file: 'libavcodec/vaapi_encode_h264.c',
  sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vaapi_encode_h264.c',
}

export const h264Vaapi: EncoderDefinition = {
  id: 'h264_vaapi',
  label: 'h264_vaapi (H.264 — Linux VAAPI)',
  ffmpegName: 'h264_vaapi',
  mediaType: 'video',
  family: 'h264' as const,
  implementation: 'other' as const,
  availabilityClass: 'platform-dependent',

  capabilityScope: {
    ffmpeg: { minVersion: '2.8' },
    buildRequirements: ['--enable-vaapi'],
    hardware: [
      {
        vendor: 'intel',
        feature: 'H.264 VAAPI 硬件编码',
        minimumGeneration: 'Sandy Bridge+ / Mesa iHD 或 i965',
        operatingSystems: ['linux'],
        verificationLevel: 'cross-verified',
        sourceRefs: [{ ...vaapiSource, note: 'Intel iGPU VAAPI H.264' }],
      },
      {
        vendor: 'amd',
        feature: 'H.264 VAAPI 硬件编码',
        minimumGeneration: 'GCN 1.0+ / Mesa RADV',
        operatingSystems: ['linux'],
        verificationLevel: 'cross-verified',
        sourceRefs: [{ ...vaapiSource, note: 'AMD GPU VAAPI H.264' }],
      },
    ],
    notes: [
      '仅 Linux 可用，需要 /dev/dri/renderD128 设备和正确的驱动',
      'Windows/macOS 上不可用',
    ],
  },

  availabilityNote:
    'Linux VAAPI 硬件 H.264 编码器。需要 --enable-vaapi 编译和 /dev/dri/renderD128 设备，仅 Linux 可用。',

  capabilities: {
    copy: false, disabled: false, supportsTwoPass: false, supportsLossless: false,
    supportedContainers: ['mp4', 'mkv', 'mov'],
  },

  profile: {
    id: 'h264_vaapi.profile', label: '编码配置 (profile)', control: 'select',
    commandBinding: { argName: '-profile:v', prefix: '-profile:v', phase: 'VIDEO_PROFILE' },
    options: [
      { value: 'auto', label: '自动' }, { value: 'baseline', label: 'baseline' },
      { value: 'main', label: 'main' }, { value: 'high', label: 'high' },
    ],
    defaultValue: 'auto', explanationId: 'expl.h264_vaapi.profile',
  },

  qualityModes: [
    {
      id: 'cqp', label: 'CQP (恒定QP)', emitterId: 'emitter.vaapi_h264.cqp',
      explanationId: 'expl.h264_vaapi.cqp',
      modeArguments: [{ argName: '-rc_mode', value: 'CQP', phase: 'VIDEO_RATE_CONTROL' }],
      sourceRefs: [{ ...vaapiSource, note: 'VAAPI CQP' }],
      controls: [{
        id: 'h264_vaapi.cqp.qp', label: 'QP 值 (-qp)', control: 'number',
        commandBinding: { argName: '-qp', prefix: '-qp', phase: 'VIDEO_RATE_CONTROL' },
        configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
        range: { min: 0, max: 51, step: 1 }, defaultValue: 23,
        explanationId: 'expl.h264_vaapi.cqp.qp',
      }],
    },
    {
      id: 'vbr', label: 'VBR (可变码率)', emitterId: 'emitter.vaapi_h264.vbr',
      explanationId: 'expl.h264_vaapi.vbr',
      modeArguments: [{ argName: '-rc_mode', value: 'VBR', phase: 'VIDEO_RATE_CONTROL' }],
      sourceRefs: [{ ...vaapiSource, note: 'VAAPI VBR' }],
      controls: [
        { id: 'h264_vaapi.vbr.bitrate', label: '目标码率 (-b:v)', control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate }, defaultValue: '5000k',
          explanationId: 'expl.h264_vaapi.vbr.bitrate' },
        { id: 'h264_vaapi.vbr.maxrate', label: '最大码率 (-maxrate)', control: 'text',
          commandBinding: { argName: '-maxrate', prefix: '-maxrate', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.maxRate },
          explanationId: 'expl.h264_vaapi.vbr.maxrate', optional: true },
      ],
    },
    {
      id: 'cbr', label: 'CBR (恒定码率)', emitterId: 'emitter.vaapi_h264.cbr',
      explanationId: 'expl.h264_vaapi.cbr',
      modeArguments: [{ argName: '-rc_mode', value: 'CBR', phase: 'VIDEO_RATE_CONTROL' }],
      sourceRefs: [{ ...vaapiSource, note: 'VAAPI CBR' }],
      controls: [{
        id: 'h264_vaapi.cbr.bitrate', label: '目标码率 (-b:v)', control: 'text',
        commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
        configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate }, defaultValue: '5000k',
        explanationId: 'expl.h264_vaapi.cbr.bitrate',
      }],
    },
  ],

  specialParameters: [
    { id: 'h264_vaapi.quality', label: '质量级别 (-quality)', control: 'number',
      configBinding: { path: videoSpecialParamPath('quality') },
      commandBinding: { argName: '-quality', prefix: '-quality', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 8 }, optional: true,
      explanationId: 'expl.h264_vaapi.quality', sourceRefs: [vaapiSource] },
    { id: 'h264_vaapi.compressionLevel', label: '压缩级别 (-compression_level)', control: 'number',
      configBinding: { path: videoSpecialParamPath('compressionLevel') },
      commandBinding: { argName: '-compression_level', prefix: '-compression_level', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 7 }, optional: true,
      explanationId: 'expl.h264_vaapi.compressionLevel', sourceRefs: [vaapiSource] },
    { id: 'h264_vaapi.bf', label: 'B 帧数 (-bf)', control: 'number',
      configBinding: { path: videoSpecialParamPath('bFrames') },
      commandBinding: { argName: '-bf', prefix: '-bf', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 4 }, optional: true,
      explanationId: 'expl.h264_vaapi.bf', sourceRefs: [vaapiSource] },
    { id: 'h264_vaapi.keyint', label: 'GOP 大小 (-g)', control: 'number',
      configBinding: { path: videoSpecialParamPath('keyint') },
      commandBinding: { argName: '-g', prefix: '-g', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 600 }, optional: true,
      explanationId: 'expl.h264_vaapi.keyint', sourceRefs: [vaapiSource] },
    { id: 'h264_vaapi.asyncDepth', label: '异步深度 (-async_depth)', control: 'number',
      configBinding: { path: videoSpecialParamPath('asyncDepth') },
      commandBinding: { argName: '-async_depth', prefix: '-async_depth', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 64 }, defaultValue: 4, optional: true,
      explanationId: 'expl.h264_vaapi.asyncDepth', sourceRefs: [vaapiSource] },
    { id: 'h264_vaapi.idrInterval', label: 'IDR 间隔 (-idr_interval)', control: 'number',
      configBinding: { path: videoSpecialParamPath('idrInterval') },
      commandBinding: { argName: '-idr_interval', prefix: '-idr_interval', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.h264_vaapi.idrInterval', sourceRefs: [vaapiSource] },
  ],

  requiredArguments: [], defaultArguments: [],
  explanationId: 'expl.h264_vaapi',
  sourceRefs: [{ ...vaapiSource }],
  sourceAuthority: 'encoder-official', verificationLevel: 'cross-verified',
  needsCrossVerification: false, status: 'verified',
}
