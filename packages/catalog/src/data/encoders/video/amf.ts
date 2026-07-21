import type { CodecFamily, EncoderDefinition, SourceRef } from '@ffcodec/domain/catalog/catalog-types'
import { CONFIG_PATHS, configPath, videoSpecialParamPath } from '@ffcodec/domain/config/config-path'

function createAmfEncoder(family: Extract<CodecFamily, 'h264' | 'hevc'>): EncoderDefinition {
  const id = `${family}_amf`
  const sourceFile = family === 'h264' ? 'libavcodec/amfenc_h264.c' : 'libavcodec/amfenc_hevc.c'
  const sourceUrl = family === 'h264'
    ? 'https://ffmpeg.org/doxygen/trunk/amfenc__h264_8c_source.html'
    : 'https://ffmpeg.org/doxygen/trunk/amfenc__hevc_8c_source.html'
  const sourceRefs: SourceRef[] = [{
    repository: 'FFmpeg/FFmpeg',
    branch: 'master',
    snapshotDate: '2026-07-11',
    file: sourceFile,
    sourceType: 'ffmpeg-official',
    url: sourceUrl,
  }]

  return {
    id,
    label: family === 'h264' ? 'AMD AMF H.264' : 'AMD AMF HEVC',
    ffmpegName: id,
    mediaType: 'video',
    family,
    implementation: 'amd',
    availabilityClass: 'hardware-dependent',
    capabilityScope: {
      hardware: [{
        vendor: 'amd',
        feature: 'AMD AMF 硬件编码',
        operatingSystems: ['Windows', 'Linux'],
        verificationLevel: 'official',
        sourceRefs,
      }],
      buildRequirements: ['FFmpeg 构建包含 AMF 支持'],
      notes: ['实际可用性取决于 AMD GPU、驱动和 FFmpeg 构建'],
    },
    availabilityNote: '需要受支持的 AMD GPU、驱动与包含 AMF 的 FFmpeg 构建。请运行 ffmpeg -h encoder=' + id + ' 核验。',
    capabilities: {
      supportsTwoPass: false,
      supportsLossless: false,
      supportedContainers: ['mp4', 'mkv', 'mov'],
    },
    preset: {
      id: `${id}.preset`,
      label: '质量预设 (-quality)',
      control: 'select',
      commandBinding: { argName: '-quality', prefix: '-quality', phase: 'VIDEO_CODEC' },
      configBinding: { path: CONFIG_PATHS.video.preset },
      options: [
        { value: 'speed', label: 'Speed — 速度优先' },
        { value: 'balanced', label: 'Balanced — 平衡' },
        { value: 'quality', label: 'Quality — 质量优先' },
      ],
      defaultValue: 'balanced',
      explanationId: 'expl.amf.preset',
    },
    profile: {
      id: `${id}.profile`,
      label: '编码配置 (-profile)',
      control: 'select',
      commandBinding: { argName: '-profile', prefix: '-profile', phase: 'VIDEO_PROFILE' },
      configBinding: { path: CONFIG_PATHS.video.profile },
      options: family === 'h264'
        ? [
            { value: 'auto', label: '自动' },
            { value: 'main', label: 'Main' },
            { value: 'high', label: 'High' },
            { value: 'constrained_baseline', label: 'Constrained Baseline' },
            { value: 'constrained_high', label: 'Constrained High' },
          ]
        : [
            { value: 'auto', label: '自动' },
            { value: 'main', label: 'Main' },
            { value: 'main10', label: 'Main 10' },
          ],
      defaultValue: 'auto',
      explanationId: 'expl.amf.profile',
    },
    tune: {
      id: `${id}.usage`,
      label: '使用场景 (-usage)',
      control: 'select',
      commandBinding: { argName: '-usage', prefix: '-usage', phase: 'VIDEO_CODEC' },
      configBinding: { path: CONFIG_PATHS.video.tune },
      options: [
        { value: 'auto', label: '自动' },
        { value: 'transcoding', label: '通用转码' },
        { value: 'high_quality', label: '高质量' },
        { value: 'lowlatency', label: '低延迟' },
        { value: 'ultralowlatency', label: '超低延迟' },
      ],
      defaultValue: 'auto',
      explanationId: 'expl.amf.usage',
    },
    pixelFormat: {
      id: `${id}.pixfmt`,
      label: '像素格式',
      control: 'select',
      commandBinding: { argName: '-pix_fmt', prefix: '-pix_fmt', phase: 'VIDEO_CODEC' },
      configBinding: { path: CONFIG_PATHS.video.pixelFormat },
      options: family === 'h264'
        ? [{ value: 'auto', label: '自动' }, { value: 'nv12', label: 'NV12' }, { value: 'yuv420p', label: 'YUV 4:2:0 8-bit' }]
        : [{ value: 'auto', label: '自动' }, { value: 'nv12', label: 'NV12' }, { value: 'yuv420p', label: 'YUV 4:2:0 8-bit' }, { value: 'p010le', label: 'P010 10-bit' }],
      defaultValue: 'auto',
      explanationId: 'expl.amf.pixfmt',
    },
    qualityModes: [
      {
        id: 'vbr',
        label: 'VBR Peak（峰值约束可变码率）',
        emitterId: 'emitter.amf.vbr',
        modeArguments: [{ argName: '-rc', value: 'vbr_peak', phase: 'VIDEO_RATE_CONTROL' }],
        controls: [
          {
            id: `${id}.vbr.bitrate`, label: '目标码率', control: 'text', defaultValue: '6000k',
            commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
            configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate }, explanationId: 'expl.amf.bitrate',
          },
          {
            id: `${id}.vbr.maxrate`, label: '峰值码率', control: 'text', defaultValue: '9000k',
            commandBinding: { argName: '-maxrate', prefix: '-maxrate', phase: 'VIDEO_RATE_CONTROL' },
            configBinding: { path: CONFIG_PATHS.video.rateControl.maxRate }, explanationId: 'expl.amf.bitrate',
          },
          {
            id: `${id}.vbr.bufsize`, label: '缓冲区', control: 'text', defaultValue: '12000k',
            commandBinding: { argName: '-bufsize', prefix: '-bufsize', phase: 'VIDEO_RATE_CONTROL' },
            configBinding: { path: CONFIG_PATHS.video.rateControl.bufferSize }, explanationId: 'expl.amf.bitrate',
          },
        ],
        explanationId: 'expl.amf.vbr',
        sourceRefs,
      },
      {
        id: 'cbr',
        label: 'CBR（恒定码率）',
        emitterId: 'emitter.amf.cbr',
        modeArguments: [{ argName: '-rc', value: 'cbr', phase: 'VIDEO_RATE_CONTROL' }],
        controls: [{
          id: `${id}.cbr.bitrate`, label: '目标码率', control: 'text', defaultValue: '6000k',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate }, explanationId: 'expl.amf.bitrate',
        }],
        explanationId: 'expl.amf.cbr',
        sourceRefs,
      },
      {
        id: 'cqp',
        label: 'CQP（固定量化参数）',
        emitterId: 'emitter.amf.cqp',
        modeArguments: [{ argName: '-rc', value: 'cqp', phase: 'VIDEO_RATE_CONTROL' }],
        controls: [
          ['qp_i', 'I 帧 QP', 'qpI'],
          ['qp_p', 'P 帧 QP', 'qpP'],
          ['qp_b', 'B 帧 QP', 'qpB'],
        ].map(([argument, label, key]) => ({
          id: `${id}.cqp.${key}`,
          label,
          control: 'number' as const,
          range: { min: 0, max: 51, step: 1 },
          defaultValue: 22,
          commandBinding: { argName: `-${argument}`, prefix: `-${argument}`, phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: configPath(['video', 'rateControl', 'additionalValues', key]) },
          explanationId: 'expl.amf.qp',
        })),
        explanationId: 'expl.amf.cqp',
        sourceRefs,
      },
    ],
    specialParameters: [
      {
        id: `${id}.vbaq`, label: '启用 VBAQ (-vbaq)', control: 'switch', defaultValue: false,
        commandBinding: { argName: '-vbaq', prefix: '-vbaq', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('vbaq') }, explanationId: 'expl.amf.vbaq',
      },
      {
        id: `${id}.preencode`, label: '启用预编码分析 (-preencode)', control: 'switch', defaultValue: false,
        commandBinding: { argName: '-preencode', prefix: '-preencode', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('preencode') }, explanationId: 'expl.amf.preencode',
      },
      {
        id: `${id}.async_depth`, label: '异步深度 (-async_depth)', control: 'number', defaultValue: 16,
        range: { min: 1, max: 16, step: 1 },
        commandBinding: { argName: '-async_depth', prefix: '-async_depth', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('asyncDepth') }, explanationId: 'expl.amf.asyncdepth',
      },
      {
        id: `${id}.qpI`, label: 'I 帧 QP (-qp_i)', control: 'number', optional: true,
        range: { min: 0, max: 51, step: 1 },
        commandBinding: { argName: '-qp_i', prefix: '-qp_i', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('qpI') }, explanationId: 'expl.amf.qpI',
      },
      {
        id: `${id}.qpP`, label: 'P 帧 QP (-qp_p)', control: 'number', optional: true,
        range: { min: 0, max: 51, step: 1 },
        commandBinding: { argName: '-qp_p', prefix: '-qp_p', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('qpP') }, explanationId: 'expl.amf.qpP',
      },
      {
        id: `${id}.enforceHrd`, label: '强制 HRD 兼容 (-enforce_hrd)', control: 'switch', optional: true,
        commandBinding: { argName: '-enforce_hrd', prefix: '-enforce_hrd', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('enforceHrd') }, explanationId: 'expl.amf.enforceHrd',
      },
      {
        id: `${id}.fillerData`, label: '填充数据 CBR (-filler_data)', control: 'switch', optional: true,
        commandBinding: { argName: '-filler_data', prefix: '-filler_data', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('fillerData') }, explanationId: 'expl.amf.fillerData',
      },
      {
        id: `${id}.maxAuSize`, label: '最大 AU 大小 (-max_au_size)', control: 'number', optional: true,
        range: { min: 0, max: 52428800, step: 1 },
        commandBinding: { argName: '-max_au_size', prefix: '-max_au_size', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('maxAuSize') }, explanationId: 'expl.amf.maxAuSize',
      },
      {
        id: `${id}.meHalfPel`, label: '半像素 ME (-me_half_pel)', control: 'switch', defaultValue: true,
        commandBinding: { argName: '-me_half_pel', prefix: '-me_half_pel', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('meHalfPel') }, explanationId: 'expl.amf.meHalfPel',
      },
      {
        id: `${id}.meQuarterPel`, label: '1/4 像素 ME (-me_quarter_pel)', control: 'switch', defaultValue: true,
        commandBinding: { argName: '-me_quarter_pel', prefix: '-me_quarter_pel', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('meQuarterPel') }, explanationId: 'expl.amf.meQuarterPel',
      },
      {
        id: `${id}.aud`, label: 'Access Unit Delimiter (-aud)', control: 'switch', optional: true,
        commandBinding: { argName: '-aud', prefix: '-aud', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('aud') }, explanationId: 'expl.amf.aud',
      },
      {
        id: `${id}.logToDbg`, label: '调试日志 (-log_to_dbg)', control: 'switch', optional: true,
        commandBinding: { argName: '-log_to_dbg', prefix: '-log_to_dbg', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('logToDbg') }, explanationId: 'expl.amf.logToDbg',
      },
      {
        id: `${id}.bFrameRef`, label: 'B 帧参考 (-b_frame_ref)', control: 'switch', defaultValue: true,
        commandBinding: { argName: '-b_frame_ref', prefix: '-b_frame_ref', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('bFrameRef') }, explanationId: 'expl.amf.bFrameRef',
      },
      {
        id: `${id}.headerInsertionMode`, label: 'SEI 头插入模式 (-header_insertion_mode)',
        control: 'select',
        options: [
          { value: '0', label: '0 — 不插入' },
          { value: '1', label: '1 — 每个 GOP' },
          { value: '2', label: '2 — 每个 IDR' },
        ],
        optional: true,
        commandBinding: { argName: '-header_insertion_mode', prefix: '-header_insertion_mode', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('headerInsertionMode') }, explanationId: 'expl.amf.headerInsertionMode',
      },
      {
        id: `${id}.queryTimeout`, label: '查询超时 ms (-query_timeout)', control: 'number', optional: true,
        range: { min: 0, max: 60000, step: 1 },
        commandBinding: { argName: '-query_timeout', prefix: '-query_timeout', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('queryTimeout') }, explanationId: 'expl.amf.queryTimeout',
      },
      {
        id: `${id}.preanalysis`, label: '预分析 (-preanalysis)', control: 'switch', optional: true,
        commandBinding: { argName: '-preanalysis', prefix: '-preanalysis', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('preanalysis') }, explanationId: 'expl.amf.preanalysis',
      },
    ],
    requiredArguments: [],
    defaultArguments: [],
    explanationId: 'expl.amf.encoder',
    sourceRefs,
    sourceAuthority: 'ffmpeg-official',
    verificationLevel: 'official',
    needsCrossVerification: false,
    status: 'verified',
  }
}

export const h264Amf = createAmfEncoder('h264')
export const hevcAmf = createAmfEncoder('hevc')
