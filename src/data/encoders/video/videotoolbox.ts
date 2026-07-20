import type { CodecFamily, EncoderDefinition, SourceRef } from '../../../domain/catalog/catalog-types'
import { CONFIG_PATHS, videoSpecialParamPath } from '../../../domain/config/config-path'

const sourceUrl = 'https://ffmpeg.org/doxygen/trunk/videotoolboxenc_8c_source.html'

function createVideoToolboxEncoder(family: Extract<CodecFamily, 'h264' | 'hevc'>): EncoderDefinition {
  const id = `${family}_videotoolbox`
  const sourceRefs: SourceRef[] = [{
    repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-11',
    file: 'libavcodec/videotoolboxenc.c', sourceType: 'ffmpeg-official', url: sourceUrl,
  }]

  return {
    id,
    label: family === 'h264' ? 'Apple VideoToolbox H.264' : 'Apple VideoToolbox HEVC',
    ffmpegName: id,
    mediaType: 'video',
    family,
    implementation: 'apple',
    availabilityClass: 'platform-dependent',
    capabilityScope: {
      hardware: [{
        vendor: 'apple', feature: 'Apple VideoToolbox 编码', operatingSystems: ['macOS'],
        verificationLevel: 'official', sourceRefs,
      }],
      notes: ['仅适用于带 VideoToolbox 的 Apple 平台；具体能力取决于系统与硬件'],
    },
    availabilityNote: '仅适用于支持 VideoToolbox 的 macOS。请运行 ffmpeg -h encoder=' + id + ' 核验本机选项。',
    capabilities: { supportsTwoPass: false, supportsLossless: false, supportedContainers: ['mp4', 'mkv', 'mov'] },
    profile: {
      id: `${id}.profile`, label: '编码配置 (-profile)', control: 'select',
      commandBinding: { argName: '-profile', prefix: '-profile', phase: 'VIDEO_PROFILE' },
      configBinding: { path: CONFIG_PATHS.video.profile },
      options: family === 'h264'
        ? [{ value: 'auto', label: '自动' }, { value: 'baseline', label: 'Baseline' }, { value: 'main', label: 'Main' }, { value: 'high', label: 'High' }]
        : [{ value: 'auto', label: '自动' }, { value: 'main', label: 'Main' }, { value: 'main10', label: 'Main 10' }],
      defaultValue: 'auto', explanationId: 'expl.videotoolbox.profile',
    },
    pixelFormat: {
      id: `${id}.pixfmt`, label: '像素格式', control: 'select',
      commandBinding: { argName: '-pix_fmt', prefix: '-pix_fmt', phase: 'VIDEO_CODEC' },
      configBinding: { path: CONFIG_PATHS.video.pixelFormat },
      options: family === 'h264'
        ? [{ value: 'auto', label: '自动' }, { value: 'nv12', label: 'NV12' }, { value: 'yuv420p', label: 'YUV 4:2:0 8-bit' }]
        : [{ value: 'auto', label: '自动' }, { value: 'nv12', label: 'NV12' }, { value: 'yuv420p', label: 'YUV 4:2:0 8-bit' }, { value: 'p010le', label: 'P010 10-bit' }],
      defaultValue: 'auto', explanationId: 'expl.videotoolbox.pixfmt',
    },
    qualityModes: [
      {
        id: 'vbr', label: '平均码率', emitterId: 'emitter.videotoolbox.vbr',
        controls: [{
          id: `${id}.vbr.bitrate`, label: '目标码率', control: 'text', defaultValue: '6000k',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate }, explanationId: 'expl.videotoolbox.bitrate',
        }],
        explanationId: 'expl.videotoolbox.vbr', sourceRefs,
      },
      {
        id: 'cbr', label: '恒定码率（macOS 13+）', emitterId: 'emitter.videotoolbox.cbr',
        modeArguments: [{ argName: '-constant_bit_rate', value: 1, phase: 'VIDEO_RATE_CONTROL' }],
        controls: [{
          id: `${id}.cbr.bitrate`, label: '目标码率', control: 'text', defaultValue: '6000k',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate }, explanationId: 'expl.videotoolbox.bitrate',
        }],
        explanationId: 'expl.videotoolbox.cbr', sourceRefs,
      },
    ],
    specialParameters: [
      {
        id: `${id}.realtime`, label: '实时编码提示 (-realtime)', control: 'switch', defaultValue: false,
        commandBinding: { argName: '-realtime', prefix: '-realtime', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('realtime') }, explanationId: 'expl.videotoolbox.realtime',
      },
      {
        id: `${id}.allow_sw`, label: '允许软件回退 (-allow_sw)', control: 'switch', defaultValue: false,
        commandBinding: { argName: '-allow_sw', prefix: '-allow_sw', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('allowSoftware') }, explanationId: 'expl.videotoolbox.allow_sw',
      },
      {
        id: `${id}.power_efficient`, label: '优先节能 (-power_efficient)', control: 'switch', defaultValue: false,
        commandBinding: { argName: '-power_efficient', prefix: '-power_efficient', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('powerEfficient') }, explanationId: 'expl.videotoolbox.power',
      },
      {
        id: `${id}.frames_before`, label: '前置帧模式 (-frames_before)', control: 'switch', optional: true,
        commandBinding: { argName: '-frames_before', prefix: '-frames_before', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('framesBefore') }, explanationId: 'expl.videotoolbox.framesBefore',
      },
      {
        id: `${id}.frames_after`, label: '后置帧模式 (-frames_after)', control: 'switch', optional: true,
        commandBinding: { argName: '-frames_after', prefix: '-frames_after', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('framesAfter') }, explanationId: 'expl.videotoolbox.framesAfter',
      },
      {
        id: `${id}.a53cc`, label: 'A/53 字幕 (-a53cc)', control: 'switch', defaultValue: true,
        commandBinding: { argName: '-a53cc', prefix: '-a53cc', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('a53cc') }, explanationId: 'expl.videotoolbox.a53cc',
      },
      {
        id: `${id}.sse`, label: '计算 SSE (-sse)', control: 'switch', optional: true,
        commandBinding: { argName: '-sse', prefix: '-sse', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('sse') }, explanationId: 'expl.videotoolbox.sse',
      },
      {
        id: `${id}.require_sw`, label: '要求软件编码 (-require_sw)', control: 'switch', optional: true,
        commandBinding: { argName: '-require_sw', prefix: '-require_sw', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('requireSw') }, explanationId: 'expl.videotoolbox.requireSw',
      },
      {
        id: `${id}.prio_speed`, label: '优先速度 (-prio_speed)', control: 'switch', optional: true,
        commandBinding: { argName: '-prio_speed', prefix: '-prio_speed', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('prioSpeed') }, explanationId: 'expl.videotoolbox.prioSpeed',
      },
      {
        id: `${id}.prio_quality`, label: '优先质量 (-prio_quality)', control: 'switch', optional: true,
        commandBinding: { argName: '-prio_quality', prefix: '-prio_quality', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('prioQuality') }, explanationId: 'expl.videotoolbox.prioQuality',
      },
      {
        id: `${id}.alpha_quality`, label: 'Alpha 质量优化 (-alpha_quality)', control: 'switch', optional: true,
        commandBinding: { argName: '-alpha_quality', prefix: '-alpha_quality', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('alphaQuality') }, explanationId: 'expl.videotoolbox.alphaQuality',
      },
      {
        id: `${id}.max_ref_frames`, label: '最大参考帧数 (-max_ref_frames)', control: 'number', optional: true,
        range: { min: 0, max: 16, step: 1 },
        commandBinding: { argName: '-max_ref_frames', prefix: '-max_ref_frames', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('maxRefFrames') }, explanationId: 'expl.videotoolbox.maxRefFrames',
      },
    ],
    requiredArguments: [],
    defaultArguments: [],
    explanationId: 'expl.videotoolbox.encoder',
    sourceRefs,
    sourceAuthority: 'ffmpeg-official',
    verificationLevel: 'official',
    needsCrossVerification: false,
    status: 'verified',
  }
}

export const h264VideoToolbox = createVideoToolboxEncoder('h264')
export const hevcVideoToolbox = createVideoToolboxEncoder('hevc')
