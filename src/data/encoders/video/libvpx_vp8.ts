import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { CONFIG_PATHS, videoSpecialParamPath } from '../../../domain/config/config-path'

const vpxVp8Source = {
  repository: 'FFmpeg/FFmpeg',
  branch: 'master',
  snapshotDate: '2026-07-20',
  file: 'libavcodec/libvpxenc.c',
  sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c',
}

export const libvpxVp8: EncoderDefinition = {
  id: 'libvpx',
  label: 'libvpx (VP8)',
  ffmpegName: 'libvpx',
  mediaType: 'video',
  family: 'vp8' as const,
  implementation: 'software' as const,
  availabilityClass: 'ffmpeg-build-dependent',

  capabilityScope: {
    ffmpeg: { minVersion: '0.6' },
    buildRequirements: ['--enable-libvpx'],
    library: { name: 'libvpx', minVersion: '1.3.0' },
    notes: [
      'VP8 已逐渐被 VP9/AV1 替代，主要用于旧式 WebRTC 兼容场景',
      '与 libvpx-vp9 共享 libvpx 库',
    ],
  },

  availabilityNote:
    'Google libvpx VP8 编码器。需 FFmpeg --enable-libvpx 编译。VP8 主要用于旧 WebRTC 兼容场景，新项目推荐使用 VP9 或 AV1。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: true,
    supportsLossless: false,
    supportedContainers: ['webm', 'mkv'],
  },

  // VP8 使用 -cpu-used 和 -deadline 作为速度控制
  qualityModes: [
    {
      id: 'cqp',
      label: 'CQP (恒定量化参数)',
      emitterId: 'emitter.libvpx.cqp',
      explanationId: 'expl.libvpx.cqp',
      sourceRefs: [{ ...vpxVp8Source, note: 'VP8 CQP 模式' }],
      controls: [
        {
          id: 'libvpx.cqp.value',
          label: 'QP 值 (-crf / -qmin -qmax)',
          control: 'number',
          commandBinding: { argName: '-crf', prefix: '-crf', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 63, step: 1 },
          defaultValue: 10,
          explanationId: 'expl.libvpx.cqp.value',
        },
      ],
    },
    {
      id: 'vbr',
      label: 'VBR (可变码率)',
      emitterId: 'emitter.libvpx.vbr',
      explanationId: 'expl.libvpx.vbr',
      sourceRefs: [{ ...vpxVp8Source, note: 'VP8 VBR 模式' }],
      controls: [
        {
          id: 'libvpx.vbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '1000k',
          explanationId: 'expl.libvpx.vbr.bitrate',
        },
      ],
    },
    {
      id: 'twoPass',
      label: '2-Pass VBR (双遍)',
      emitterId: 'emitter.libvpx.twopass',
      explanationId: 'expl.libvpx.twopass',
      sourceRefs: [{ ...vpxVp8Source, note: 'VP8 2-Pass' }],
      controls: [
        {
          id: 'libvpx.twopass.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '1000k',
          explanationId: 'expl.libvpx.twopass.bitrate',
        },
      ],
    },
  ],

  specialParameters: [
    {
      id: 'libvpx.cpuUsed', label: '编码速度 (-cpu-used)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('cpuUsed') },
      commandBinding: { argName: '-cpu-used', prefix: '-cpu-used', phase: 'VIDEO_CODEC' },
      range: { min: -16, max: 16, step: 1 }, optional: true,
      explanationId: 'expl.libvpx.cpuUsed', sourceRefs: [vpxVp8Source],
    },
    {
      id: 'libvpx.deadline', label: '编码截止策略 (-deadline)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('deadline') },
      commandBinding: { argName: '-deadline', prefix: '-deadline', phase: 'VIDEO_CODEC' },
      options: [
        { value: 'good', label: 'good — 质量与速度平衡 (默认)' },
        { value: 'best', label: 'best — 最高质量' },
        { value: 'realtime', label: 'realtime — 实时帧率约束' },
      ],
      optional: true, explanationId: 'expl.libvpx.deadline', sourceRefs: [vpxVp8Source],
    },
    {
      id: 'libvpx.errorResilient', label: '错误恢复 (-error-resilient)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('errorResilient') },
      commandBinding: { argName: '-error-resilient', prefix: '-error-resilient', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.libvpx.errorResilient', sourceRefs: [vpxVp8Source],
    },
    {
      id: 'libvpx.keyint', label: '关键帧间隔 (-g)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('keyint') },
      commandBinding: { argName: '-g', prefix: '-g', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 9999 }, optional: true,
      explanationId: 'expl.libvpx.keyint', sourceRefs: [vpxVp8Source],
    },
    {
      id: 'libvpx.threads', label: '编码线程 (-threads)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('threads') },
      commandBinding: { argName: '-threads', prefix: '-threads', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.libvpx.threads', sourceRefs: [vpxVp8Source],
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.libvpx',
  sourceRefs: [
    {
      repository: 'webmproject/libvpx',
      snapshotDate: '2026-07-20',
      file: 'README.md',
      sourceType: 'encoder-official',
      url: 'https://chromium.googlesource.com/webm/libvpx/',
    },
  ],
  sourceAuthority: 'encoder-official',
  verificationLevel: 'cross-verified',
  needsCrossVerification: false,
  status: 'verified',
}
