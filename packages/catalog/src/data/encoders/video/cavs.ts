import type { EncoderDefinition } from '@ffcodec/domain/catalog/catalog-types'
import { CONFIG_PATHS, videoSpecialParamPath } from '@ffcodec/domain/config/config-path'

const cavsSource = {
  repository: 'FFmpeg/FFmpeg',
  branch: 'master',
  snapshotDate: '2026-07-20',
  file: 'libavcodec/cavsenc.c',
  sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/cavsenc.c',
}

export const cavs: EncoderDefinition = {
  id: 'cavs',
  label: 'cavs (AVS1-P2)',
  ffmpegName: 'cavs',
  mediaType: 'video',
  family: 'avs' as const,
  implementation: 'software' as const,
  availabilityClass: 'generally-available',

  capabilityScope: {
    ffmpeg: { minVersion: '0.6' },
    notes: [
      'AVS1-P2 (GB/T 20090.2-2006) 是中国第一代视频编码国标，等同于 JiZhun Profile',
      'FFmpeg 内置编解码支持，无需外部库',
      '主要用于中国老式数字电视标清兼容场景',
      '不支持 B 帧，不支持 CABAC，编码效率远低于 H.264',
    ],
  },

  availabilityNote:
    'FFmpeg 内置 AVS1-P2 (国标) 编码器。无需外部库。仅 JiZhun Profile，主要用于老式中国广电标清场景。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: false,
    supportsLossless: false,
    supportedContainers: ['mp4', 'mkv', 'ts'],
  },

  qualityModes: [
    {
      id: 'cqp',
      label: 'CQP (恒定量化参数)',
      emitterId: 'emitter.cavs.cqp',
      explanationId: 'expl.cavs.cqp',
      sourceRefs: [{ ...cavsSource, note: 'AVS1 CQP 模式' }],
      controls: [
        {
          id: 'cavs.cqp.qp',
          label: 'QP 值 (-qp)',
          control: 'number',
          commandBinding: { argName: '-qp', prefix: '-qp', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 51, step: 1 },
          defaultValue: 23,
          explanationId: 'expl.cavs.cqp.qp',
        },
      ],
    },
    {
      id: 'vbr',
      label: 'VBR (可变码率)',
      emitterId: 'emitter.cavs.vbr',
      explanationId: 'expl.cavs.vbr',
      sourceRefs: [{ ...cavsSource, note: 'AVS1 VBR 模式' }],
      controls: [
        {
          id: 'cavs.vbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '2000k',
          explanationId: 'expl.cavs.vbr.bitrate',
        },
      ],
    },
  ],

  specialParameters: [
    {
      id: 'cavs.keyint', label: '关键帧间隔 (-g)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('keyint') },
      commandBinding: { argName: '-g', prefix: '-g', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 300 }, optional: true,
      explanationId: 'expl.cavs.keyint', sourceRefs: [cavsSource],
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.cavs',
  sourceRefs: [
    {
      repository: 'FFmpeg/FFmpeg',
      branch: 'master',
      snapshotDate: '2026-07-20',
      file: 'libavcodec/cavsenc.c',
      sourceType: 'ffmpeg-official',
      url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/cavsenc.c',
    },
  ],
  sourceAuthority: 'encoder-official',
  verificationLevel: 'cross-verified',
  needsCrossVerification: false,
  status: 'verified',
}
