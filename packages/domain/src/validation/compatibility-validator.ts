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

  // libopus + 5.1(side) 不兼容诊断
  checkOpusSideChannelLayout(config, messages)

  return messages
}

/**
 * libopus 不支持 5.1(side) 声道布局，选此组合会直接报错。
 * 检查全局音频配置和所有逐流覆写。
 */
function checkOpusSideChannelLayout(config: ProjectConfig, messages: Diagnostic[]): void {
  // 全局音频
  if (
    config.audio.mode === 'encode'
    && config.audio.encoderId === 'libopus'
    && config.audio.channelLayout === '5.1(side)'
  ) {
    messages.push({
      code: 'warn.opus.channelLayout.side',
      severity: 'warning',
      category: 'compatibility',
      message: 'libopus 不支持 5.1(side) 声道布局，请改用 5.1。当前选择会导致编码失败（"Invalid channel layout 5.1(side) for specified mapping family"）。',
      originIds: ['audio.channelLayout', 'audio.encoderId'],
      context: { encoderId: 'libopus', channelLayout: '5.1(side)' },
    })
  }
  // 逐流音频覆写
  for (let i = 0; i < config.streams.audioStreams.length; i++) {
    const entry = config.streams.audioStreams[i]
    if (
      entry.codecMode === 'encode'
      && entry.audio?.encoderId === 'libopus'
      && entry.audio?.channelLayout === '5.1(side)'
    ) {
      messages.push({
        code: 'warn.opus.channelLayout.side',
        severity: 'warning',
        category: 'compatibility',
        message: `音频流 ${entry.index} 逐流覆写：libopus 不支持 5.1(side) 声道布局，请改用 5.1。当前选择会导致编码失败。`,
        originIds: [`streams.audioStreams.${i}.audio.channelLayout`, `streams.audioStreams.${i}.audio.encoderId`],
        context: { encoderId: 'libopus', channelLayout: '5.1(side)', streamIndex: entry.index },
      })
    }
  }
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
