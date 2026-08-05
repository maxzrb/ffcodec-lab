import type { ProjectConfig } from '../config/project-config'
import type { Catalog, ContainerDefinition } from '../catalog/catalog-types'
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
    // 自定义容器（如 avif、m4a）跳过兼容性检查
    if (config.output.containerId !== '__custom__') {
      messages.push({
        code: 'info.compat.customContainer',
        severity: 'info',
        category: 'compatibility',
        message: `自定义容器 "${config.output.containerId}"，跳过容器兼容性校验。请自行确认编码器与该容器的兼容性。`,
        originIds: ['output.containerId'],
        context: { containerId: config.output.containerId },
      })
    }
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

  // 容器类别能力边界检查
  checkContainerCategory(config, container!, messages)

  // libopus + 5.1(side) 不兼容诊断
  checkOpusSideChannelLayout(config, messages)

  // libopus + 未显式指定声道布局时提醒
  checkOpusNeedsChannelLayout(config, messages)

  return messages
}

/** 容器类别能力边界：图片容器不支持音视频编码，音频容器不支持视频编码 */
function checkContainerCategory(config: ProjectConfig, container: ContainerDefinition, messages: Diagnostic[]): void {
  const cat = container.category

  if (cat === 'image') {
    const encoderId = config.video.encoderId
    const codecCompat = encoderId ? (container.videoCodecs[encoderId] ?? 'unsupported') : 'unsupported'
    const videoOk = codecCompat === 'supported' || codecCompat === 'supported-with-caveat'
    if (config.video.mode === 'encode' && !videoOk) {
      messages.push({
        code: 'error.container.image.noVideo',
        severity: 'error', category: 'compatibility',
        message: '图片容器不支持当前视频编码器。请更换为兼容编码器（如 AVIF 用 AV1 编码器，WebP 用 VP8 编码器），或将视频模式设为"禁用"。',
        originIds: ['video.encoderId', 'output.containerId'],
        context: { containerId: container.id, encoderId },
      })
    }
    if (config.audio.mode === 'encode') {
      messages.push({
        code: 'error.container.image.noAudio',
        severity: 'error', category: 'compatibility',
        message: '图片容器不支持音频编码。请将音频模式设为"禁用"或切换为视频容器。',
        originIds: ['audio.mode', 'output.containerId'],
        context: { containerId: container.id },
      })
    }
  }

  if (cat === 'audio') {
    if (config.video.mode === 'encode') {
      messages.push({
        code: 'error.container.audio.noVideo',
        severity: 'error', category: 'compatibility',
        message: '纯音频容器不支持视频编码。请将视频模式设为"禁用"，或切换为视频容器。',
        originIds: ['video.mode', 'output.containerId'],
        context: { containerId: container.id },
      })
    }
    if (config.video.mode === 'copy') {
      messages.push({
        code: 'warn.container.audio.videoCopy',
        severity: 'warning', category: 'compatibility',
        message: '纯音频容器通常无法容纳视频流，视频流复制可能导致 muxer 报错。建议将视频模式设为"禁用"。',
        originIds: ['video.mode', 'output.containerId'],
        context: { containerId: container.id },
      })
    }
  }
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

/**
 * Opus 编码多声道（>2）时需显式指定声道布局。
 * 若用户在全局或逐流中选了 libopus 但声道布局保持"跟随输入"，
 * 则当源为环绕声时 FFmpeg 会直接报错。
 */
function checkOpusNeedsChannelLayout(config: ProjectConfig, messages: Diagnostic[]): void {
  // 全局音频
  if (
    config.audio.mode === 'encode'
    && config.audio.encoderId === 'libopus'
    && (!config.audio.channelLayout || config.audio.channelLayout === 'source')
  ) {
    messages.push({
      code: 'warn.opus.channelLayout.needed',
      severity: 'warning',
      category: 'compatibility',
      message: 'libopus 编码多声道音频时需要确定明确且受支持的声道布局。为避免源文件声道布局缺失或异常导致编码失败，使用 3 个及以上声道时，建议将"声道布局"设置为与源音频匹配的具体布局，如 5.1 或 7.1。',
      originIds: ['audio.channelLayout', 'audio.encoderId'],
      context: { encoderId: 'libopus', channelLayout: 'source' },
    })
  }
  // 逐流音频覆写
  for (let i = 0; i < config.streams.audioStreams.length; i++) {
    const entry = config.streams.audioStreams[i]
    const ch = entry.audio?.channelLayout
    if (
      entry.codecMode === 'encode'
      && entry.audio?.encoderId === 'libopus'
      && (!ch || ch === 'source')
    ) {
      messages.push({
        code: 'warn.opus.channelLayout.needed',
        severity: 'warning',
        category: 'compatibility',
        message: `音频流 ${entry.index} 逐流覆写：libopus 编码多声道音频时建议显式指定声道布局，避免源文件声道信息缺失导致编码失败。`,
        originIds: [`streams.audioStreams.${i}.audio.channelLayout`, `streams.audioStreams.${i}.audio.encoderId`],
        context: { encoderId: 'libopus', channelLayout: 'source', streamIndex: entry.index },
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
