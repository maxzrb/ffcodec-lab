import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { libx264 } from './libx264'
import { libx265 } from './libx265'
import { libsvtav1 } from './libsvtav1'
import { h264Nvenc } from './h264_nvenc'
import { hevcNvenc } from './hevc_nvenc'
import { h264Qsv } from './h264_qsv'
import { hevcQsv } from './hevc_qsv'
import { h264Amf, hevcAmf } from './amf'
import { h264VideoToolbox, hevcVideoToolbox } from './videotoolbox'
import { libaomAv1 } from './libaom_av1'
import { libvvenc } from './libvvenc'
import { withAdvancedQualityControls } from './advanced-quality'

const definitions = [
  libx264, libx265, libsvtav1, libaomAv1, libvvenc,
  h264Nvenc, hevcNvenc, h264Qsv, hevcQsv,
  h264Amf, hevcAmf, h264VideoToolbox, hevcVideoToolbox,
].map(withAdvancedQualityControls)

export const videoEncoders: Record<string, EncoderDefinition> = Object.fromEntries(
  definitions.map((encoder) => [encoder.id, encoder]),
)
