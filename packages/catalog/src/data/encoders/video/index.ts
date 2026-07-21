import type { EncoderDefinition } from '@ffcodec/domain/catalog/catalog-types'
import { libx264 } from './libx264'
import { libx265 } from './libx265'
import { libsvtav1 } from './libsvtav1'
import { libaomAv1 } from './libaom_av1'
import { librav1e } from './librav1e'
import { libvpxVp8 } from './libvpx_vp8'
import { libvpxVp9 } from './libvpx_vp9'
import { h264Nvenc } from './h264_nvenc'
import { hevcNvenc } from './hevc_nvenc'
import { av1Nvenc } from './av1_nvenc'
import { h264Qsv } from './h264_qsv'
import { hevcQsv } from './hevc_qsv'
import { av1Qsv } from './av1_qsv'
import { vp9Qsv } from './vp9_qsv'
import { h264Amf, hevcAmf } from './amf'
import { av1Amf } from './av1_amf'
import { av1Vulkan } from './av1_vulkan'
import { h264Vulkan } from './h264_vulkan'
import { hevcVulkan } from './hevc_vulkan'
import { ffv1Vulkan } from './ffv1_vulkan'
import { proresVulkan } from './prores_vulkan'
import { h264VideoToolbox, hevcVideoToolbox } from './videotoolbox'
import { proresVideoToolbox } from './prores_videotoolbox'
import { libvvenc } from './libvvenc'
import { ffv1 } from './ffv1'
import { proresKs } from './prores_ks'
import { cavs } from './cavs'
import { libxavs2 } from './libxavs2'
import { h264Vaapi } from './h264_vaapi'
import { hevcVaapi } from './hevc_vaapi'
import { vp9Vaapi } from './vp9_vaapi'
import { av1Vaapi } from './av1_vaapi'
import { h264D3d12 } from './h264_d3d12'
import { av1D3d12 } from './av1_d3d12'
import { h264Mf } from './h264_mf'
import { hevcMf } from './hevc_mf'
import { libkvazaar } from './libkvazaar'
import { libsvthevc } from './libsvthevc'
import { withAdvancedQualityControls } from './advanced-quality'

const definitions = [
  // CPU software — H.264/HEVC/AV1/VVC
  libx264, libx265, libsvtav1, libaomAv1, librav1e, libvvenc, libkvazaar, libsvthevc,
  // NVENC — NVIDIA GPU
  h264Nvenc, hevcNvenc, av1Nvenc,
  // QSV — Intel GPU
  h264Qsv, hevcQsv, av1Qsv, vp9Qsv,
  // AMF — AMD GPU
  h264Amf, hevcAmf, av1Amf,
  // Vulkan Video / Vulkan Compute — cross-vendor GPU
  av1Vulkan, h264Vulkan, hevcVulkan, ffv1Vulkan, proresVulkan,
  // VAAPI — Linux GPU
  h264Vaapi, hevcVaapi, vp9Vaapi, av1Vaapi,
  // VideoToolbox — Apple
  h264VideoToolbox, hevcVideoToolbox, proresVideoToolbox,
  // D3D12 — Windows GPU
  h264D3d12, av1D3d12,
  // MediaFoundation — Windows
  h264Mf, hevcMf,
  // CPU software — legacy / niche
  libvpxVp8, libvpxVp9, ffv1, proresKs, cavs, libxavs2,
].map(withAdvancedQualityControls)

export const videoEncoders: Record<string, EncoderDefinition> = Object.fromEntries(
  definitions.map((encoder) => [encoder.id, encoder]),
)
