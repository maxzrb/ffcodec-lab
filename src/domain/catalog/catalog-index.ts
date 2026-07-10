import type { Catalog, EncoderDefinition, ContainerDefinition, ParameterDefinition } from './catalog-types'

/**
 * Index helpers for fast lookups during rule evaluation and command building.
 */
export class CatalogIndex {
  constructor(private catalog: Catalog) {}

  getVideoEncoder(id: string): EncoderDefinition | undefined {
    return this.catalog.encoders.video[id]
  }

  getAudioEncoder(id: string): EncoderDefinition | undefined {
    return this.catalog.encoders.audio[id]
  }

  getContainer(id: string): ContainerDefinition | undefined {
    return this.catalog.containers[id]
  }

  getParameter(id: string): ParameterDefinition | undefined {
    return this.catalog.parameters[id]
  }

  getExplanation(id: string) {
    return this.catalog.explanations[id]
  }

  getVideoEncoderIds(): string[] {
    return Object.keys(this.catalog.encoders.video)
  }

  getAudioEncoderIds(): string[] {
    return Object.keys(this.catalog.encoders.audio)
  }

  getContainerIds(): string[] {
    return Object.keys(this.catalog.containers)
  }
}
