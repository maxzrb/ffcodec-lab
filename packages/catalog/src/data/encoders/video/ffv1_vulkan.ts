import type { EncoderDefinition } from '@ffcodec/domain/catalog/catalog-types'
import { videoSpecialParamPath } from '@ffcodec/domain/config/config-path'

const src = { repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20',
  file: 'libavcodec/vulkan_ffv1.c', sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_ffv1.c' }

export const ffv1Vulkan: EncoderDefinition = {
  id: 'ffv1_vulkan', label: 'ffv1_vulkan (FFV1 — Vulkan Compute)', ffmpegName: 'ffv1_vulkan',
  mediaType: 'video', family: 'ffv1' as const, implementation: 'other' as const,
  availabilityClass: 'hardware-dependent',
  capabilityScope: {
    ffmpeg: { minVersion: '8.0' }, buildRequirements: ['--enable-vulkan'],
    hardware: [
      { vendor: 'nvidia', feature: 'Vulkan 1.3 计算着色器', minimumGeneration: 'GTX 10xx+',
        minimumDriver: '545+ (Linux) / 555+ (Windows)', verificationLevel: 'cross-verified', sourceRefs: [{ ...src }] },
      { vendor: 'amd', feature: 'Vulkan 1.3 计算着色器', minimumGeneration: 'RX 5000+ (RDNA1)',
        minimumDriver: 'Mesa RADV 24.0+', verificationLevel: 'cross-verified', sourceRefs: [{ ...src }] },
      { vendor: 'intel', feature: 'Vulkan 1.3 计算着色器', minimumGeneration: 'Arc (Alchemist)+',
        minimumDriver: 'Mesa ANV 24.0+', verificationLevel: 'cross-verified', sourceRefs: [{ ...src }] },
    ],
    notes: ['基于 Vulkan Compute（非 Vulkan Video）— 对任何 Vulkan 1.3+ GPU 通用', '相比 CPU 版本大幅加速 FFV1 编码'],
  },
  availabilityNote: '跨厂商 Vulkan Compute FFV1 无损编码器（FFmpeg 8.0+）。需要 Vulkan 1.3 兼容 GPU。',
  capabilities: { copy: false, disabled: false, supportsTwoPass: false, supportsLossless: true,
    supportedContainers: ['mkv', 'avi', 'mov'] },
  qualityModes: [
    { id: 'ffv1-default', label: '默认 (无损)', emitterId: 'emitter.ffv1_vulkan.default',
      explanationId: 'expl.ffv1_vulkan.default',
      sourceRefs: [{ ...src, note: 'Vulkan FFV1 始终为无损编码' }], controls: [] },
  ],
  specialParameters: [
    { id: 'ffv1_vulkan.level', label: 'FFV1 版本 (-level)', control: 'select',
      configBinding: { path: videoSpecialParamPath('level') },
      commandBinding: { argName: '-level', prefix: '-level', phase: 'VIDEO_CODEC' },
      options: [{ value: '1', label: '1 — FFV1 1.3 (IETF RFC 9043)' }, { value: '3', label: '3 — FFV1 3.x (多线程)' }],
      defaultValue: '3', explanationId: 'expl.ffv1_vulkan.level', sourceRefs: [src] },
    { id: 'ffv1_vulkan.slices', label: 'Slice 数量 (-slices)', control: 'number',
      configBinding: { path: videoSpecialParamPath('slices') },
      commandBinding: { argName: '-slices', prefix: '-slices', phase: 'VIDEO_CODEC' },
      range: { min: 4, max: 24 }, defaultValue: 4, optional: true,
      explanationId: 'expl.ffv1_vulkan.slices', sourceRefs: [src] },
    { id: 'ffv1_vulkan.coder', label: '熵编码器 (-coder)', control: 'select',
      configBinding: { path: videoSpecialParamPath('coder') },
      commandBinding: { argName: '-coder', prefix: '-coder', phase: 'VIDEO_CODEC' },
      options: [{ value: '-1', label: '-1 — 自动' }, { value: '1', label: '1 — Range Coder (最佳压缩)' },
        { value: '0', label: '0 — Golomb Rice' }],
      optional: true, explanationId: 'expl.ffv1_vulkan.coder', sourceRefs: [src] },
  ],
  requiredArguments: [], defaultArguments: [],
  explanationId: 'expl.ffv1_vulkan',
  sourceRefs: [{ ...src }],
  sourceAuthority: 'encoder-official', verificationLevel: 'cross-verified',
  needsCrossVerification: false, status: 'verified',
}
