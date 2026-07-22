import type { EncoderDefinition } from '@ffcodec/domain/catalog/catalog-types'
import { aac } from './aac'
import { libopus } from './libopus'
import { flac } from './flac'
import {
  ac3, alac, eac3, libfdkAac, libmp3lame, libvorbis,
  pcmF64le, pcmS16le, pcmS32le, pcmS64le, wavpack,
} from './core'
import { extendedAudioEncoders } from './extended'

export const audioEncoders: Record<string, EncoderDefinition> = {
  aac,
  libopus,
  flac,
  libfdk_aac: libfdkAac,
  libmp3lame,
  alac,
  ac3,
  eac3,
  wavpack,
  libvorbis,
  pcm_s16le: pcmS16le,
  pcm_s32le: pcmS32le,
  pcm_s64le: pcmS64le,
  pcm_f64le: pcmF64le,
  ...Object.fromEntries(extendedAudioEncoders.map((encoder) => [encoder.id, encoder])),
}
