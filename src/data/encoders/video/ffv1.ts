import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { videoSpecialParamPath } from '../../../domain/config/config-path'

const ffv1Source = {
  repository: 'FFmpeg/FFmpeg',
  branch: 'master',
  snapshotDate: '2026-07-20',
  file: 'libavcodec/ffv1enc.c',
  sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/ffv1enc.c',
}

export const ffv1: EncoderDefinition = {
  id: 'ffv1',
  label: 'ffv1 (FFV1 — 无损存档编码)',
  ffmpegName: 'ffv1',
  mediaType: 'video',
  family: 'ffv1' as const,
  implementation: 'software' as const,
  availabilityClass: 'generally-available',

  capabilityScope: {
    ffmpeg: { minVersion: '2.0' },
    notes: [
      'FFV1 是 FFmpeg 内置的无损编码器，无需外部库',
      '版本 1.3 为 IETF RFC 标准（RFC 9043），数字存档推荐',
      '版本 3 支持多线程编码，生产环境推荐',
    ],
  },

  availabilityNote:
    'FFmpeg 内置无损视频编码器（IETF RFC 9043）。被欧洲广播联盟和 Library of Congress 推荐用于数字存档。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: false,
    supportsLossless: true,
    supportedContainers: ['mkv', 'avi', 'mov'],
  },

  // FFV1 无预设/Profile/Tune，质量由 level + coder + context 组合决定
  pixelFormat: {
    id: 'ffv1.pixelFormat',
    label: '像素格式 (pix_fmt)',
    control: 'select',
    commandBinding: { argName: '-pix_fmt', prefix: '-pix_fmt', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'yuv420p', label: 'yuv420p' },
      { value: 'yuv422p', label: 'yuv422p' },
      { value: 'yuv444p', label: 'yuv444p' },
      { value: 'yuv420p10le', label: 'yuv420p10le' },
      { value: 'yuv422p10le', label: 'yuv422p10le' },
      { value: 'yuv444p10le', label: 'yuv444p10le' },
      { value: 'yuv444p16le', label: 'yuv444p16le' },
      { value: 'gbrp10le', label: 'gbrp10le (RGB 平面)' },
      { value: 'rgba64le', label: 'rgba64le (RGBA 16-bit)' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.ffv1.pixfmt',
  },

  qualityModes: [
    {
      id: 'ffv1-default',
      label: '默认 (无损)',
      emitterId: 'emitter.ffv1.default',
      explanationId: 'expl.ffv1.default',
      sourceRefs: [{ ...ffv1Source, note: 'FFV1 始终为无损编码' }],
      controls: [],
    },
  ],

  specialParameters: [
    // -- 版本选择 -----------------------------------------------
    {
      id: 'ffv1.level', label: 'FFV1 版本 (-level)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('level') },
      commandBinding: { argName: '-level', prefix: '-level', phase: 'VIDEO_CODEC' },
      options: [
        { value: '1', label: '1 — FFV1 1.3 (IETF RFC 9043，存档推荐)' },
        { value: '3', label: '3 — FFV1 3.x (多线程，生产推荐)' },
      ],
      defaultValue: '3', explanationId: 'expl.ffv1.level', sourceRefs: [ffv1Source],
    },
    // -- 熵编码器 -----------------------------------------------
    {
      id: 'ffv1.coder', label: '熵编码器 (-coder)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('coder') },
      commandBinding: { argName: '-coder', prefix: '-coder', phase: 'VIDEO_CODEC' },
      options: [
        { value: '-1', label: '-1 — 自动选择 (默认)' },
        { value: '0', label: '0 — Golomb Rice' },
        { value: '1', label: '1 — Range Coder (最佳压缩)' },
        { value: 'ac', label: 'ac — 算术编码' },
      ],
      optional: true, explanationId: 'expl.ffv1.coder', sourceRefs: [ffv1Source],
    },
    // -- 上下文模型 ---------------------------------------------
    {
      id: 'ffv1.context', label: '上下文模型 (-context)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('context') },
      commandBinding: { argName: '-context', prefix: '-context', phase: 'VIDEO_CODEC' },
      options: [
        { value: '0', label: '0 — 小型上下文 (默认)' },
        { value: '1', label: '1 — 大型上下文 (略优压缩，速度较慢)' },
      ],
      optional: true, explanationId: 'expl.ffv1.context', sourceRefs: [ffv1Source],
    },
    // -- Slice 结构 ---------------------------------------------
    {
      id: 'ffv1.slices', label: 'Slice 数量 (-slices)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('slices') },
      commandBinding: { argName: '-slices', prefix: '-slices', phase: 'VIDEO_CODEC' },
      range: { min: 4, max: 24 }, defaultValue: 4, optional: true,
      explanationId: 'expl.ffv1.slices', sourceRefs: [ffv1Source],
    },
    {
      id: 'ffv1.slicecrc', label: 'Slice CRC 校验 (-slicecrc)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('slicecrc') },
      commandBinding: { argName: '-slicecrc', prefix: '-slicecrc', phase: 'VIDEO_CODEC' },
      defaultValue: 1, optional: true,
      explanationId: 'expl.ffv1.slicecrc', sourceRefs: [ffv1Source],
    },
    // -- GOP / 线程 ---------------------------------------------
    {
      id: 'ffv1.keyint', label: '关键帧间隔 (-g)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('keyint') },
      commandBinding: { argName: '-g', prefix: '-g', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 9999 }, optional: true,
      explanationId: 'expl.ffv1.keyint', sourceRefs: [ffv1Source],
    },
    {
      id: 'ffv1.threads', label: '编码线程 (-threads)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('threads') },
      commandBinding: { argName: '-threads', prefix: '-threads', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.ffv1.threads', sourceRefs: [ffv1Source],
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.ffv1',
  sourceRefs: [
    {
      repository: 'FFmpeg/FFmpeg',
      branch: 'master',
      snapshotDate: '2026-07-20',
      file: 'libavcodec/ffv1enc.c',
      sourceType: 'ffmpeg-official',
      url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/ffv1enc.c',
    },
  ],
  sourceAuthority: 'encoder-official',
  verificationLevel: 'cross-verified',
  needsCrossVerification: false,
  status: 'verified',
}
