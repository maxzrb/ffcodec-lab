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

export const videoEncoders: Record<string, EncoderDefinition> = {
  libx264,
  libx265,
  libsvtav1,
  libaom_av1: libaomAv1,
  libvvenc,
  h264_nvenc: h264Nvenc,
  hevc_nvenc: hevcNvenc,
  h264_qsv: h264Qsv,
  hevc_qsv: hevcQsv,
  h264_amf: h264Amf,
  hevc_amf: hevcAmf,
  h264_videotoolbox: h264VideoToolbox,
  hevc_videotoolbox: hevcVideoToolbox,
}
