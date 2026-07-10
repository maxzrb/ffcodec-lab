import type { ProjectConfig } from '../config/project-config'
import type { Catalog } from '../catalog/catalog-types'
import type { Diagnostic } from '../rules/rule-types'

/**
 * Validates container ↔ encoder compatibility.
 * Pure function — reads config + catalog, returns diagnostics.
 */
export function validateCompatibility(
  config: ProjectConfig,
  catalog: Catalog
): Diagnostic[] {
  const messages: Diagnostic[] = []
  const container = catalog.containers[config.output.containerId]
  if (!container) {
    messages.push({
      code: 'error.unknown.container',
      severity: 'error',
      category: 'compatibility',
      message: `Unknown container: ${config.output.containerId}`,
      originIds: ['output.containerId'],
      context: { containerId: config.output.containerId },
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
  messages: Diagnostic[],
  level: string,
  encoderId: string,
  kind: string,
  containerId: string
): void {
  const originIds = [kind === 'video' ? 'video.encoderId' : 'audio.encoderId', 'output.containerId']
  const context = { encoderId, containerId, mediaType: kind }
  switch (level) {
    case 'unsupported':
      messages.push({
        code: 'error.compat.unsupported',
        severity: 'error',
        category: 'compatibility',
        message: `${kind === 'video' ? 'Video' : 'Audio'} encoder "${encoderId}" is not supported in container "${containerId}"`,
        originIds,
        context,
      })
      break
    case 'supported-with-caveat':
      messages.push({
        code: 'warn.compat.caveat',
        severity: 'warning',
        category: 'compatibility',
        message: `${kind === 'video' ? 'Video' : 'Audio'} encoder "${encoderId}" has limited support in container "${containerId}"`,
        originIds,
        context,
      })
      break
    case 'transcode-recommended':
      messages.push({
        code: 'info.compat.transcode',
        severity: 'info',
        category: 'compatibility',
        message: `Transcoding recommended for "${encoderId}" in container "${containerId}"`,
        originIds,
        context,
      })
      break
    case 'unknown':
      messages.push({
        code: 'warn.compat.unknown',
        severity: 'warning',
        category: 'compatibility',
        message: `Compatibility unknown for "${encoderId}" in container "${containerId}"`,
        originIds,
        context,
      })
      break
  }
}
