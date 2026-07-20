import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { videoSpecialParamPath } from '../../../domain/config/config-path'

const src = { repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-20',
  file: 'libavcodec/vulkan_prores.c', sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vulkan_prores.c' }

export const proresVulkan: EncoderDefinition = {
  id: 'prores_vulkan', label: 'prores_vulkan (ProRes — Vulkan Compute)', ffmpegName: 'prores_vulkan',
  mediaType: 'video', family: 'prores' as const, implementation: 'other' as const,
  availabilityClass: 'hardware-dependent',
  capabilityScope: {
    ffmpeg: { minVersion: '8.1' }, buildRequirements: ['--enable-vulkan'],
    hardware: [
      { vendor: 'nvidia', feature: 'Vulkan Compute ProRes', minimumGeneration: 'GTX 10xx+',
        minimumDriver: '545+ (Linux) / 555+ (Windows)', verificationLevel: 'cross-verified', sourceRefs: [{ ...src }] },
      { vendor: 'amd', feature: 'Vulkan Compute ProRes', minimumGeneration: 'RX 5000+',
        minimumDriver: 'Mesa RADV 24.0+', verificationLevel: 'cross-verified', sourceRefs: [{ ...src }] },
      { vendor: 'intel', feature: 'Vulkan Compute ProRes', minimumGeneration: 'Arc (Alchemist)+',
        minimumDriver: 'Mesa ANV 24.0+', verificationLevel: 'cross-verified', sourceRefs: [{ ...src }] },
    ],
    notes: ['跨厂商 Vulkan Compute（非 Vulkan Video）ProRes 编码', 'FFmpeg 8.1 新增，实验性功能'],
  },
  availabilityNote: '跨厂商 Vulkan Compute ProRes 编码器（FFmpeg 8.1+，实验性）。任何 Vulkan 1.3+ GPU 均可使用。',
  capabilities: { copy: false, disabled: false, supportsTwoPass: false, supportsLossless: false,
    supportedContainers: ['mov', 'mkv'] },
  profile: {
    id: 'prores_vulkan.profile', label: 'ProRes Profile (-profile:v)', control: 'select',
    commandBinding: { argName: '-profile:v', prefix: '-profile:v', phase: 'VIDEO_PROFILE' },
    options: [
      { value: '0', label: '0 — 422 Proxy (~45 Mbps)' },
      { value: '1', label: '1 — 422 LT (~102 Mbps)' },
      { value: '2', label: '2 — 422 (~147 Mbps, 默认)' },
      { value: '3', label: '3 — 422 HQ (~220 Mbps)' },
      { value: '4', label: '4 — 4444 (~330 Mbps)' },
      { value: '5', label: '5 — 4444 XQ (~500 Mbps)' },
    ],
    defaultValue: '2', explanationId: 'expl.prores_vulkan.profile',
  },
  qualityModes: [
    { id: 'cqp', label: 'Profile 决定质量', emitterId: 'emitter.prores_vulkan.default',
      explanationId: 'expl.prores_vulkan.default',
      sourceRefs: [{ ...src, note: 'ProRes 质量由 profile 决定' }], controls: [] },
  ],
  specialParameters: [
    { id: 'prores_vulkan.quantMat', label: '量化矩阵 (-quant_mat)', control: 'select',
      configBinding: { path: videoSpecialParamPath('quantMat') },
      commandBinding: { argName: '-quant_mat', prefix: '-quant_mat', phase: 'VIDEO_CODEC' },
      options: [{ value: 'auto', label: 'auto' }, { value: 'proxy', label: 'proxy' }, { value: 'lt', label: 'lt' },
        { value: 'standard', label: 'standard' }, { value: 'hq', label: 'hq' }],
      optional: true, explanationId: 'expl.prores_vulkan.quantMat', sourceRefs: [src] },
  ],
  requiredArguments: [], defaultArguments: [],
  explanationId: 'expl.prores_vulkan',
  sourceRefs: [{ ...src }],
  sourceAuthority: 'encoder-official', verificationLevel: 'cross-verified',
  needsCrossVerification: false, status: 'verified',
}
