import type { EncoderDefinition } from '@ffcodec/domain/catalog/catalog-types'
import { CONFIG_PATHS, videoSpecialParamPath } from '@ffcodec/domain/config/config-path'

const vpxVp9Source = {
  repository: 'FFmpeg/FFmpeg',
  branch: 'master',
  snapshotDate: '2026-07-20',
  file: 'libavcodec/libvpxenc.c',
  sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libvpxenc.c',
}

export const libvpxVp9: EncoderDefinition = {
  id: 'libvpx-vp9',
  label: 'libvpx-vp9 (VP9 — Google libvpx)',
  ffmpegName: 'libvpx-vp9',
  mediaType: 'video',
  family: 'vp9' as const,
  implementation: 'software' as const,
  availabilityClass: 'ffmpeg-build-dependent',

  capabilityScope: {
    ffmpeg: { minVersion: '2.0' },
    buildRequirements: ['--enable-libvpx'],
    library: { name: 'libvpx', minVersion: '1.7.0' },
    notes: [
      '10/12-bit 编码额外需要 --enable-vp9-highbitdepth',
      'libvpx-vp9 是 Google 官方 VP9 编码器，适合 YouTube、Web 生态',
    ],
  },

  availabilityNote:
    'Google libvpx VP9 编码器。需 FFmpeg --enable-libvpx 编译。VP9 是 YouTube 等平台的标准编码格式。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: true,
    supportsLossless: true,
    supportedContainers: ['mkv', 'webm', 'mp4'],
  },

  // libvpx-vp9 使用 -cpu-used 和 -deadline 作为速度控制，无传统 preset
  pixelFormat: {
    id: 'libvpx-vp9.pixelFormat',
    label: '像素格式 (pix_fmt)',
    control: 'select',
    commandBinding: { argName: '-pix_fmt', prefix: '-pix_fmt', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'yuv420p', label: 'yuv420p (8-bit 4:2:0)' },
      { value: 'yuv422p', label: 'yuv422p (8-bit 4:2:2)' },
      { value: 'yuv444p', label: 'yuv444p (8-bit 4:4:4)' },
      { value: 'yuv420p10le', label: 'yuv420p10le (10-bit)' },
      { value: 'yuv420p12le', label: 'yuv420p12le (12-bit)' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.libvpx-vp9.pixfmt',
  },

  qualityModes: [
    {
      id: 'vp9-crf',
      label: 'CRF (恒定质量)',
      emitterId: 'emitter.libvpx-vp9.crf',
      explanationId: 'expl.libvpx-vp9.crf',
      sourceRefs: [{ ...vpxVp9Source, note: 'VP9 CRF 模式' }],
      recommendedValues: [
        { label: '高质量', value: 15, description: '文件较大，画质接近无损' },
        { label: '推荐', value: 31, description: '画质与体积的良好平衡' },
        { label: '一般', value: 39, description: '文件较小，画质可接受' },
      ],
      modeArguments: [
        { argName: '-b:v', value: '0', phase: 'VIDEO_RATE_CONTROL' },
      ],
      controls: [
        {
          id: 'libvpx-vp9.crf.value',
          label: 'CRF 值 (-crf)',
          control: 'number',
          commandBinding: { argName: '-crf', prefix: '-crf', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 63, step: 1 },
          defaultValue: 31,
          explanationId: 'expl.libvpx-vp9.crf.value',
        },
      ],
    },
    {
      id: 'vbr',
      label: 'VBR (可变码率)',
      emitterId: 'emitter.libvpx-vp9.vbr',
      explanationId: 'expl.libvpx-vp9.vbr',
      sourceRefs: [{ ...vpxVp9Source, note: 'VP9 VBR 模式' }],
      controls: [
        {
          id: 'libvpx-vp9.vbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '2000k',
          explanationId: 'expl.libvpx-vp9.vbr.bitrate',
        },
        {
          id: 'libvpx-vp9.vbr.minrate',
          label: '最小码率 (-minrate)',
          control: 'text',
          commandBinding: { argName: '-minrate', prefix: '-minrate', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: videoSpecialParamPath('minrate') },
          optional: true,
          explanationId: 'expl.libvpx-vp9.vbr.minrate',
        },
        {
          id: 'libvpx-vp9.vbr.maxrate',
          label: '最大码率 (-maxrate)',
          control: 'text',
          commandBinding: { argName: '-maxrate', prefix: '-maxrate', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: videoSpecialParamPath('maxrate') },
          optional: true,
          explanationId: 'expl.libvpx-vp9.vbr.maxrate',
        },
      ],
    },
    {
      id: 'cbr',
      label: 'CBR (恒定码率)',
      emitterId: 'emitter.libvpx-vp9.cbr',
      explanationId: 'expl.libvpx-vp9.cbr',
      sourceRefs: [{ ...vpxVp9Source, note: 'VP9 CBR 模式' }],
      controls: [
        {
          id: 'libvpx-vp9.cbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '2000k',
          explanationId: 'expl.libvpx-vp9.cbr.bitrate',
        },
      ],
    },
    {
      id: 'twoPass',
      label: '2-Pass VBR (双遍可变码率)',
      emitterId: 'emitter.libvpx-vp9.twopass',
      explanationId: 'expl.libvpx-vp9.twopass',
      sourceRefs: [{ ...vpxVp9Source, note: 'VP9 2-Pass VBR' }],
      controls: [
        {
          id: 'libvpx-vp9.twopass.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '2000k',
          explanationId: 'expl.libvpx-vp9.twopass.bitrate',
        },
      ],
    },
  ],

  specialParameters: [
    // -- 速度与质量策略 ------------------------------------------
    {
      id: 'libvpx-vp9.cpuUsed', label: '编码速度 (-cpu-used)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('cpuUsed') },
      commandBinding: { argName: '-cpu-used', prefix: '-cpu-used', phase: 'VIDEO_CODEC' },
      range: { min: -8, max: 8, step: 1 }, defaultValue: 0,
      optional: true, explanationId: 'expl.libvpx-vp9.cpuUsed',
      sourceRefs: [vpxVp9Source],
    },
    {
      id: 'libvpx-vp9.deadline', label: '编码截止策略 (-deadline)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('deadline') },
      commandBinding: { argName: '-deadline', prefix: '-deadline', phase: 'VIDEO_CODEC' },
      options: [
        { value: 'good', label: 'good — 质量与速度平衡 (默认)' },
        { value: 'best', label: 'best — 最高质量' },
        { value: 'realtime', label: 'realtime — 实时帧率约束' },
      ],
      optional: true, explanationId: 'expl.libvpx-vp9.deadline',
      sourceRefs: [vpxVp9Source],
    },
    // -- 多线程与 Tile ------------------------------------------
    {
      id: 'libvpx-vp9.rowMt', label: '行级多线程 (-row-mt)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('rowMt') },
      commandBinding: { argName: '-row-mt', prefix: '-row-mt', phase: 'VIDEO_CODEC' },
      defaultValue: 1, optional: true,
      explanationId: 'expl.libvpx-vp9.rowMt', sourceRefs: [vpxVp9Source],
    },
    {
      id: 'libvpx-vp9.tileColumns', label: 'Tile 列数 (-tile-columns)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('tileColumns') },
      commandBinding: { argName: '-tile-columns', prefix: '-tile-columns', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 6, step: 1 }, optional: true,
      explanationId: 'expl.libvpx-vp9.tileColumns', sourceRefs: [vpxVp9Source],
    },
    {
      id: 'libvpx-vp9.tileRows', label: 'Tile 行数 (-tile-rows)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('tileRows') },
      commandBinding: { argName: '-tile-rows', prefix: '-tile-rows', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 2, step: 1 }, optional: true,
      explanationId: 'expl.libvpx-vp9.tileRows', sourceRefs: [vpxVp9Source],
    },
    {
      id: 'libvpx-vp9.frameParallel', label: '帧级并行解码 (-frame-parallel)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('frameParallel') },
      commandBinding: { argName: '-frame-parallel', prefix: '-frame-parallel', phase: 'VIDEO_CODEC' },
      defaultValue: 1, optional: true,
      explanationId: 'expl.libvpx-vp9.frameParallel', sourceRefs: [vpxVp9Source],
    },
    // -- 参考帧与前瞻 -------------------------------------------
    {
      id: 'libvpx-vp9.autoAltRef', label: '自动 Alt-Ref 帧数 (-auto-alt-ref)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('autoAltRef') },
      commandBinding: { argName: '-auto-alt-ref', prefix: '-auto-alt-ref', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 6 }, defaultValue: 1, optional: true,
      explanationId: 'expl.libvpx-vp9.autoAltRef', sourceRefs: [vpxVp9Source],
    },
    {
      id: 'libvpx-vp9.lagInFrames', label: '前瞻帧数 (-lag-in-frames)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('lagInFrames') },
      commandBinding: { argName: '-lag-in-frames', prefix: '-lag-in-frames', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 25 }, defaultValue: 25, optional: true,
      explanationId: 'expl.libvpx-vp9.lagInFrames', sourceRefs: [vpxVp9Source],
    },
    // -- Alt-Ref 降噪 -------------------------------------------
    {
      id: 'libvpx-vp9.arnrMaxFrames', label: 'Alt-Ref 降噪帧数 (-arnr-max-frames)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('arnrMaxFrames') },
      commandBinding: { argName: '-arnr-max-frames', prefix: '-arnr-max-frames', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 15 }, optional: true,
      explanationId: 'expl.libvpx-vp9.arnrMaxFrames', sourceRefs: [vpxVp9Source],
    },
    {
      id: 'libvpx-vp9.arnrStrength', label: 'Alt-Ref 降噪强度 (-arnr-strength)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('arnrStrength') },
      commandBinding: { argName: '-arnr-strength', prefix: '-arnr-strength', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 6 }, defaultValue: 3, optional: true,
      explanationId: 'expl.libvpx-vp9.arnrStrength', sourceRefs: [vpxVp9Source],
    },
    // -- 自适应量化 ---------------------------------------------
    {
      id: 'libvpx-vp9.aqMode', label: '自适应量化模式 (-aq-mode)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('aqMode') },
      commandBinding: { argName: '-aq-mode', prefix: '-aq-mode', phase: 'VIDEO_CODEC' },
      options: [
        { value: '0', label: '0 — 关闭' },
        { value: '1', label: '1 — 方差 AQ' },
        { value: '2', label: '2 — 复杂度 AQ' },
      ],
      optional: true, explanationId: 'expl.libvpx-vp9.aqMode', sourceRefs: [vpxVp9Source],
    },
    // -- 环路滤波 -----------------------------------------------
    {
      id: 'libvpx-vp9.sharpness', label: '环路滤波锐度 (-sharpness)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('sharpness') },
      commandBinding: { argName: '-sharpness', prefix: '-sharpness', phase: 'VIDEO_CODEC' },
      range: { min: 0, max: 7 }, optional: true,
      explanationId: 'expl.libvpx-vp9.sharpness', sourceRefs: [vpxVp9Source],
    },
    // -- GOP / 关键帧 -------------------------------------------
    {
      id: 'libvpx-vp9.keyint', label: '关键帧间隔 (-g)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('keyint') },
      commandBinding: { argName: '-g', prefix: '-g', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 1000, step: 1 }, optional: true,
      explanationId: 'expl.libvpx-vp9.keyint', sourceRefs: [vpxVp9Source],
    },
    // -- 错误恢复 -----------------------------------------------
    {
      id: 'libvpx-vp9.errorResilient', label: '错误恢复模式 (-error-resilient)',
      control: 'select',
      configBinding: { path: videoSpecialParamPath('errorResilient') },
      commandBinding: { argName: '-error-resilient', prefix: '-error-resilient', phase: 'VIDEO_CODEC' },
      options: [
        { value: 'default', label: 'default — 默认' },
        { value: 'partitions', label: 'partitions — 分区错误恢复' },
      ],
      optional: true, explanationId: 'expl.libvpx-vp9.errorResilient', sourceRefs: [vpxVp9Source],
    },
    // -- 无损模式 -----------------------------------------------
    {
      id: 'libvpx-vp9.lossless', label: '无损模式 (-lossless)',
      control: 'switch',
      configBinding: { path: videoSpecialParamPath('lossless') },
      commandBinding: { argName: '-lossless', prefix: '-lossless', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.libvpx-vp9.lossless', sourceRefs: [vpxVp9Source],
    },
    // -- 线程 ---------------------------------------------------
    {
      id: 'libvpx-vp9.threads', label: '编码线程 (-threads)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('threads') },
      commandBinding: { argName: '-threads', prefix: '-threads', phase: 'VIDEO_CODEC' },
      optional: true, explanationId: 'expl.libvpx-vp9.threads', sourceRefs: [vpxVp9Source],
    },
  ],

  requiredArguments: [],
  defaultArguments: [],

  explanationId: 'expl.libvpx-vp9',
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
