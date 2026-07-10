import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { libx264 } from './libx264'
import { libx265 } from './libx265'
import { libsvtav1 } from './libsvtav1'

export const videoEncoders: Record<string, EncoderDefinition> = {
  libx264,
  libx265,
  libsvtav1,
}
