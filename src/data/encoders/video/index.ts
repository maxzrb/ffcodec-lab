import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { libx264 } from './libx264'
import { libx265 } from './libx265'
import { libsvtav1 } from './libsvtav1'
import { h264Nvenc } from './h264_nvenc'
import { hevcNvenc } from './hevc_nvenc'

export const videoEncoders: Record<string, EncoderDefinition> = {
  libx264,
  libx265,
  libsvtav1,
  h264_nvenc: h264Nvenc,
  hevc_nvenc: hevcNvenc,
}
