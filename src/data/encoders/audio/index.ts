import type { EncoderDefinition } from '../../../domain/catalog/catalog-types'
import { aac } from './aac'
import { libopus } from './libopus'

export const audioEncoders: Record<string, EncoderDefinition> = {
  aac,
  libopus,
}
