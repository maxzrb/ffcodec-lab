import type { Catalog } from './catalog-types'
import { videoEncoders } from '../../data/encoders/video'
import { audioEncoders } from '../../data/encoders/audio'
import { containers } from '../../data/containers'
import { explanations } from '../../data/explanations'
import { parameters } from '../../data/parameters'

/**
 * Assembles the full catalog from separate data modules.
 * Domain logic consumes this; UI never reads data files directly.
 */
export function loadCatalog(): Catalog {
  return {
    parameters,
    encoders: {
      video: videoEncoders,
      audio: audioEncoders,
      image: {},
    },
    containers,
    explanations,
  }
}
