// ============================================================
// build-fix-suggestions — generates DiagnosticFix[] from a
// structured Diagnostic (code + context), never from message text.
// ============================================================

import type { Catalog } from '../catalog/catalog-types'
import type { Diagnostic, DiagnosticFix } from '../rules/rule-types'
import { CONFIG_PATHS } from '../config/config-path'

type FixFactory = (diag: Diagnostic, catalog: Catalog) => DiagnosticFix[]

function buildContainerFixes(diag: Diagnostic, catalog: Catalog, fullySupportedOnly = false): DiagnosticFix[] {
  const encoderId = diag.context.encoderId as string | undefined
  const mediaType = diag.context.mediaType as 'video' | 'audio' | undefined
  if (!encoderId || !mediaType) return []

  return Object.values(catalog.containers)
    .filter((container) => {
      const level = mediaType === 'video'
        ? container.videoCodecs[encoderId]
        : container.audioCodecs[encoderId]
      return level === 'supported' || (!fullySupportedOnly && level === 'supported-with-caveat')
    })
    .slice(0, 3)
    .map((container) => ({
      id: `fix.container.${container.id}`,
      label: `切换到 ${container.label} 容器`,
      description: `${container.label} 与当前编码器兼容。`,
      category: 'compatibility',
      operations: [{ op: 'set', path: CONFIG_PATHS.output.containerId, value: container.id }],
      safety: 'changes-output',
      sourceRuleId: diag.sourceRuleId,
    }))
}

/**
 * Registry mapping diagnostic codes to fix suggestion factories.
 * Each factory receives the full Diagnostic (with context) and Catalog.
 */
const FIX_REGISTRY: Record<string, FixFactory> = {
  'error.compat.unsupported': (d, cat) => buildContainerFixes(d, cat),
  'warn.compat.caveat': (d, cat) => buildContainerFixes(d, cat, true),
  'warn.compat.unknown': (d, cat) => buildContainerFixes(d, cat),
  'error.webm.video.incompatible': (d, cat) => {
    const encoderId = d.context.encoderId as string | undefined
    const compatible = encoderId
      ? Object.values(cat.containers)
          .filter((c) => {
            const level = c.videoCodecs[encoderId]
            return level === 'supported' || level === 'supported-with-caveat'
          })
          .slice(0, 3)
      : []

    const fixes: DiagnosticFix[] = compatible.map((c) => ({
      id: `fix.container.${c.id}`,
      label: `切换到 ${c.label} 容器`,
      description: `${c.label} 容器支持当前视频编码器。`,
      category: 'compatibility',
      operations: [{ op: 'set', path: CONFIG_PATHS.output.containerId, value: c.id }],
      safety: 'changes-output',
      sourceRuleId: d.sourceRuleId,
    }))

    // Also offer switching encoder
    if (d.context.containerId === 'webm') {
      fixes.push({
        id: 'fix.encoder.to.av1',
        label: '切换到 SVT-AV1 编码器',
        description: 'WebM 原生支持 AV1 编码，切换编码器以保持 WebM 容器。',
        category: 'compatibility',
        operations: [{ op: 'set', path: CONFIG_PATHS.video.encoderId, value: 'libsvtav1' }],
        safety: 'changes-output',
        sourceRuleId: d.sourceRuleId,
      })
    }

    return fixes
  },

  'error.burn.requires.encode': () => [
    {
      id: 'fix.burn.disable',
      label: '禁用字幕烧录',
      description: '字幕烧录需要视频重新编码，当前为 copy 模式。',
      category: 'configuration',
      operations: [{ op: 'set', path: CONFIG_PATHS.subtitle.burn, value: { enabled: false, source: 'external', filterKind: 'subtitles', style: {} } }],
      safety: 'safe',
    },
    {
      id: 'fix.burn.switch.encode',
      label: '切换到编码模式',
      description: '将视频模式改为编码以支持字幕烧录。',
      category: 'configuration',
      operations: [{ op: 'set', path: CONFIG_PATHS.video.mode, value: 'encode' }],
      safety: 'changes-output',
    },
  ],

  'error.resolution.requires.encode': () => [
    {
      id: 'fix.resolution.source',
      label: '重置为原分辨率',
      description: '保持原分辨率和帧率，仅复制视频流。',
      category: 'configuration',
      operations: [
        { op: 'set', path: CONFIG_PATHS.frame.resolution, value: { mode: 'source' } },
        { op: 'set', path: CONFIG_PATHS.frame.frameRate, value: { mode: 'source' } },
      ],
      safety: 'safe',
    },
    {
      id: 'fix.resolution.encode',
      label: '切换到编码模式',
      description: '将视频模式改为编码以修改分辨率/帧率。',
      category: 'configuration',
      operations: [{ op: 'set', path: CONFIG_PATHS.video.mode, value: 'encode' }],
      safety: 'changes-output',
    },
  ],

  'warn.resolution.dimension.odd': (diag) => {
    const repairedResolution = diag.context.repairedResolution
    if (!isValidResolution(repairedResolution)) return []
    const dimensions = Array.isArray(diag.context.dimensions)
      ? diag.context.dimensions.filter((value): value is { axis: string; value: number; repairedValue: number } =>
        Boolean(value) && typeof value === 'object' &&
        typeof (value as { value?: unknown }).value === 'number' &&
        typeof (value as { repairedValue?: unknown }).repairedValue === 'number',
      )
      : []
    const summary = dimensions.map(({ axis, value, repairedValue }) => `${axis} ${value} → ${repairedValue}`).join('，')
    return [{
      id: 'fix.resolution.even',
      label: summary ? `调整为偶数尺寸（${summary}）` : '调整为偶数尺寸',
      description: '向上取相邻偶数，避免常见 yuv420p 与视频编码器拒绝奇数尺寸。',
      category: 'configuration',
      operations: [{ op: 'set', path: CONFIG_PATHS.frame.resolution, value: repairedResolution }],
      safety: 'changes-output',
      sourceRuleId: diag.sourceRuleId,
    }]
  },

  'warn.flac.container.incompatible': (_d, cat) => {
    const compatible = Object.values(cat.containers)
      .filter((c) => {
        const level = c.audioCodecs['flac']
        return level === 'supported' || level === 'supported-with-caveat'
      })
    return compatible.map((c) => ({
      id: `fix.container.${c.id}`,
      label: `切换到 ${c.label} 容器`,
      description: `${c.label} 容器支持 FLAC 音频。`,
      category: 'compatibility',
      operations: [{ op: 'set', path: CONFIG_PATHS.output.containerId, value: c.id }],
      safety: 'changes-output',
    }))
  },
}

function isValidResolution(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const resolution = value as { mode?: unknown; width?: unknown; height?: unknown; keepAspect?: unknown }
  if (resolution.mode === 'width') return isOptionalPositiveInteger(resolution.width)
  if (resolution.mode === 'height') return isOptionalPositiveInteger(resolution.height)
  if (resolution.mode === 'size') {
    return isOptionalPositiveInteger(resolution.width)
      && isOptionalPositiveInteger(resolution.height)
      && typeof resolution.keepAspect === 'boolean'
  }
  return resolution.mode === 'source'
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function isOptionalPositiveInteger(value: unknown): boolean {
  return value === undefined || isPositiveInteger(value)
}

/**
 * Generate fix suggestions for a diagnostic.
 * Returns empty array for unknown diagnostic codes.
 */
export function buildFixSuggestions(diag: Diagnostic, catalog: Catalog): DiagnosticFix[] {
  const factory = FIX_REGISTRY[diag.code]
  if (!factory) return []
  try {
    return factory(diag, catalog)
  } catch {
    return []
  }
}
