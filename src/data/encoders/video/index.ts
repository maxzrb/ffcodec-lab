import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { libx264 } from './libx264'
import { libx265 } from './libx265'
import { libsvtav1 } from './libsvtav1'
import { h264Nvenc } from './h264_nvenc'
import { hevcNvenc } from './hevc_nvenc'
import { h264Qsv } from './h264_qsv'
import { hevcQsv } from './hevc_qsv'

export const videoEncoders: Record<string, EncoderDefinition> = {
  libx264,
  libx265,
  libsvtav1,
  h264_nvenc: h264Nvenc,
  hevc_nvenc: hevcNvenc,
  h264_qsv: h264Qsv,
  hevc_qsv: hevcQsv,
}
