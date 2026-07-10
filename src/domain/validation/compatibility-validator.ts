import type { ProjectConfig } from '../config/project-config'
import type { Catalog } from '../catalog/catalog-types'
import type { ValidationMessage } from '../rules/rule-types'

/**
 * Validates container ↔ encoder compatibility.
 * Pure function — reads config + catalog, returns messages.
 */
export function validateCompatibility(
  config: ProjectConfig,
  catalog: Catalog
): ValidationMessage[] {
  const messages: ValidationMessage[] = []
  const container = catalog.containers[config.output.containerId]
  if (!container) {
    messages.push({
      id: 'compat.unknown.container',
      severity: 'error',
      messageId: 'error.unknown.container',
      fieldIds: ['output.containerId'],
      details: { containerId: config.output.containerId },
    })
    return messages
  }

  // Video compatibility
  if (config.video.mode === 'encode' && config.video.encoderId) {
    const entry = container.videoCodecs[config.video.encoderId] ?? 'unknown'
    pushCompatMessage(messages, entry, config.video.encoderId, 'video', container.id)
  }

  // Audio compatibility
  if (config.audio.mode === 'encode' && config.audio.encoderId) {
    const entry = container.audioCodecs[config.audio.encoderId] ?? 'unknown'
    pushCompatMessage(messages, entry, config.audio.encoderId, 'audio', container.id)
  }

  return messages
}

function pushCompatMessage(
  messages: ValidationMessage[],
  level: string,
  encoderId: string,
  kind: string,
  containerId: string
): void {
  switch (level) {
    case 'unsupported':
      messages.push({
        id: `compat.${containerId}.${encoderId}.unsupported`,
        severity: 'error',
        messageId: 'error.compat.unsupported',
        fieldIds: [kind === 'video' ? 'video.encoderId' : 'audio.encoderId', 'output.containerId'],
        details: { encoderId, containerId, mediaType: kind },
      })
      break
    case 'supported-with-caveat':
      messages.push({
        id: `compat.${containerId}.${encoderId}.caveat`,
        severity: 'warning',
        messageId: 'warn.compat.caveat',
        fieldIds: [kind === 'video' ? 'video.encoderId' : 'audio.encoderId', 'output.containerId'],
        details: { encoderId, containerId, mediaType: kind },
      })
      break
    case 'transcode-recommended':
      messages.push({
        id: `compat.${containerId}.${encoderId}.transcode`,
        severity: 'info',
        messageId: 'info.compat.transcode',
        fieldIds: [kind === 'video' ? 'video.encoderId' : 'audio.encoderId', 'output.containerId'],
        details: { encoderId, containerId, mediaType: kind },
      })
      break
    case 'unknown':
      messages.push({
        id: `compat.${containerId}.${encoderId}.unknown`,
        severity: 'warning',
        messageId: 'warn.compat.unknown',
        fieldIds: [kind === 'video' ? 'video.encoderId' : 'audio.encoderId', 'output.containerId'],
        details: { encoderId, containerId, mediaType: kind },
      })
      break
  }
}
