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
        id: `${id}.realtime`, label: '实时编码提示', control: 'switch', defaultValue: false,
        commandBinding: { argName: '-realtime', prefix: '-realtime', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('realtime') }, explanationId: 'expl.videotoolbox.realtime',
      },
      {
        id: `${id}.allow_sw`, label: '允许软件编码回退', control: 'switch', defaultValue: false,
        commandBinding: { argName: '-allow_sw', prefix: '-allow_sw', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('allowSoftware') }, explanationId: 'expl.videotoolbox.allow_sw',
      },
      {
        id: `${id}.power_efficient`, label: '优先节能', control: 'switch', defaultValue: false,
        commandBinding: { argName: '-power_efficient', prefix: '-power_efficient', phase: 'VIDEO_CODEC' },
        configBinding: { path: videoSpecialParamPath('powerEfficient') }, explanationId: 'expl.videotoolbox.power',
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
