import { useEffect, useMemo, useState } from 'react'
import type { Catalog } from '@ffcodec/domain/catalog/catalog-types'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'
import { collectRequiredVideoFilterNames } from '@ffcodec/domain/filters/video-filter-builder'
import type { ResolvedBuilderView, ResolvedField } from '@ffcodec/domain/presentation/resolved-field'
import type { Diagnostic } from '@ffcodec/domain/rules/rule-types'
import {
  collectConfiguredAudioEncoderOptionGroups,
  collectConfiguredVideoEncoderOptionGroups,
  collectConfiguredVideoEncoderOptions,
  collectRequiredAudioEncoders,
  collectRequiredVideoEncoders,
  collectVideoEncoderControlOptions,
} from '@ffcodec/domain/validation'
import { usePlatform } from '@ffcodec/platform-api'

export interface RuntimeFFmpegCapabilities {
  encoders: string[]
  filters: string[]
}

export interface RuntimeEncoderCapabilities {
  encoder: string
  options: string[]
  videoCodecOptions: string[]
}

export interface RuntimeFFmpegState {
  capabilities: RuntimeFFmpegCapabilities | null | undefined
  encoderCapabilities: RuntimeEncoderCapabilities | null | undefined
  selectedEncoderName?: string
  diagnostics: Diagnostic[]
  unavailableControlIds: ReadonlySet<string>
}

/**
 * Desktop 直接读取当前 FFmpeg 汇报的组件与当前编码器 AVOptions。
 * Web 没有本地可执行文件时保持静态目录行为。
 */
export function useRuntimeFFmpegCapabilities(
  config: ProjectConfig,
  catalog: Catalog,
): RuntimeFFmpegState {
  const { extensions } = usePlatform()
  const loadCapabilities = extensions?.getFFmpegCapabilities
  const loadEncoderCapabilities = extensions?.getFFmpegEncoderCapabilities
  const onFFmpegSelectionChange = extensions?.onFFmpegSelectionChange
  const selectedEncoderName = config.video.encoderId
    ? catalog.encoders.video[config.video.encoderId]?.ffmpegName
    : undefined
  const [capabilities, setCapabilities] = useState<RuntimeFFmpegCapabilities | null | undefined>(
    loadCapabilities ? undefined : null,
  )
  const requiredEncoderNames = useMemo(() => {
    const names = [
      ...collectRequiredVideoEncoders(config, catalog),
      ...collectRequiredAudioEncoders(config, catalog),
    ].map(({ ffmpegName }) => ffmpegName)
    if (selectedEncoderName) names.push(selectedEncoderName)
    return [...new Set(names)]
  }, [catalog, config, selectedEncoderName])
  const requiredEncoderKey = requiredEncoderNames.join('\u0000')
  const [encoderCapabilitiesByName, setEncoderCapabilitiesByName] = useState<
    Record<string, RuntimeEncoderCapabilities | null | undefined>
  >({})

  useEffect(() => {
    if (!loadCapabilities) {
      setCapabilities(null)
      return
    }
    let cancelled = false
    let requestId = 0
    const load = () => {
      const currentRequest = ++requestId
      setCapabilities(undefined)
      setEncoderCapabilitiesByName({})
      loadCapabilities()
        .then((result) => {
          if (!cancelled && currentRequest === requestId) setCapabilities(result ?? null)
        })
        .catch(() => {
          if (!cancelled && currentRequest === requestId) setCapabilities(null)
        })
    }
    load()
    const unsubscribe = onFFmpegSelectionChange?.(load)
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [loadCapabilities, onFFmpegSelectionChange])

  useEffect(() => {
    if (!loadEncoderCapabilities || !capabilities) {
      setEncoderCapabilitiesByName({})
      return
    }
    let cancelled = false
    const registeredNames = requiredEncoderNames.filter((name) => capabilities.encoders.includes(name))
    setEncoderCapabilitiesByName(Object.fromEntries(registeredNames.map((name) => [name, undefined])))
    Promise.all(registeredNames.map(async (name) => {
      try {
        return [name, await loadEncoderCapabilities(name)] as const
      } catch {
        return [name, null] as const
      }
    })).then((results) => {
      if (!cancelled) setEncoderCapabilitiesByName(Object.fromEntries(results.map(([name, value]) => [name, value ?? null])))
    })
    return () => { cancelled = true }
  // 字符串键确保配置对象重建但编码器集合不变时不会重复探测。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capabilities, loadEncoderCapabilities, requiredEncoderKey])

  const encoderCapabilities = selectedEncoderName
    ? encoderCapabilitiesByName[selectedEncoderName]
    : null

  return useMemo(() => {
    if (!loadCapabilities) {
      return {
        capabilities: null,
        encoderCapabilities: null,
        selectedEncoderName,
        diagnostics: [],
        unavailableControlIds: new Set<string>(),
      }
    }

    const diagnostics: Diagnostic[] = []
    const unavailableControlIds = new Set<string>()
    const requiredFilters = collectRequiredVideoFilterNames(config)
    const requiredEncoders = [
      ...collectRequiredVideoEncoders(config, catalog),
      ...collectRequiredAudioEncoders(config, catalog),
    ]

    if (capabilities === undefined) {
      diagnostics.push(diagnostic(
        'error.ffmpeg.capabilities.pending',
        'Checking the selected FFmpeg capabilities.',
        ['param.video.encoder'],
      ))
    } else if (capabilities === null) {
      diagnostics.push(diagnostic(
        'error.ffmpeg.capabilities.unknown',
        'Unable to inspect the selected FFmpeg capabilities.',
        ['param.video.encoder'],
      ))
    } else {
      const availableEncoders = new Set(capabilities.encoders)
      const missingEncoders = requiredEncoders.filter(({ ffmpegName }) => !availableEncoders.has(ffmpegName))
      if (missingEncoders.length > 0) {
        diagnostics.push(diagnostic(
          'error.encoder.capabilities.unavailable',
          `The selected FFmpeg does not provide: ${missingEncoders.map(({ ffmpegName }) => ffmpegName).join(', ')}.`,
          missingEncoders.map(({ originId }) => originId),
          { encoders: missingEncoders.map(({ ffmpegName }) => ffmpegName) },
        ))
      }

      const availableFilters = new Set(capabilities.filters)
      const missingFilters = requiredFilters.filter((name) => !availableFilters.has(name))
      if (missingFilters.length > 0) {
        diagnostics.push(diagnostic(
          'error.filter.capabilities.unavailable',
          `The selected FFmpeg does not provide: ${missingFilters.join(', ')}.`,
          ['filter.chain'],
          { filters: missingFilters },
        ))
      }
    }

    const optionGroupSets = [
      { groups: collectConfiguredVideoEncoderOptionGroups(config, catalog), includeVideoCodecOptions: true },
      { groups: collectConfiguredAudioEncoderOptionGroups(config, catalog), includeVideoCodecOptions: false },
    ]
    for (const { groups, includeVideoCodecOptions } of optionGroupSets) {
      for (const group of groups) {
        if (!capabilities?.encoders.includes(group.ffmpegName)) continue
        const groupCapabilities = encoderCapabilitiesByName[group.ffmpegName]
        if (groupCapabilities === undefined) {
          diagnostics.push(diagnostic(
            'error.encoder.options.pending',
            `Checking ${group.ffmpegName} options.`,
            group.requirements.map(({ originId }) => originId).length > 0
              ? group.requirements.map(({ originId }) => originId)
              : ['param.video.encoder'],
          ))
        } else if (groupCapabilities === null) {
          diagnostics.push(diagnostic(
            'error.encoder.options.unknown',
            `Unable to inspect ${group.ffmpegName} options.`,
            ['param.video.encoder'],
          ))
        } else {
          const availableOptions = new Set([
            ...groupCapabilities.options,
            ...(includeVideoCodecOptions ? groupCapabilities.videoCodecOptions ?? [] : []),
          ])
          const missingConfigured = group.requirements.filter(({ option }) => !availableOptions.has(option))
          if (missingConfigured.length > 0) {
            diagnostics.push(diagnostic(
              'error.encoder.options.unavailable',
              `${group.ffmpegName} does not provide: ${[...new Set(missingConfigured.map(({ option }) => option))].join(', ')}.`,
              missingConfigured.map(({ originId }) => originId),
              { encoder: group.ffmpegName, options: missingConfigured.map(({ option }) => option) },
            ))
          }
        }
      }
    }

    const encoder = config.video.encoderId ? catalog.encoders.video[config.video.encoderId] : undefined
    if (encoder && encoderCapabilities) {
      const availableOptions = new Set([
        ...encoderCapabilities.options,
        ...(encoderCapabilities.videoCodecOptions ?? []),
      ])
      for (const requirement of collectVideoEncoderControlOptions(encoder, config)) {
        if (!availableOptions.has(requirement.option)) unavailableControlIds.add(requirement.originId)
      }
      // 单一全局配置继续使用精确的已配置项来源，便于诊断定位。
      if (config.streams.preserveAllVideoStreams) {
        const configured = collectConfiguredVideoEncoderOptions(config, catalog)
        for (const requirement of configured) {
          if (!availableOptions.has(requirement.option)) unavailableControlIds.add(requirement.originId)
        }
      }
    }

    return { capabilities, encoderCapabilities, selectedEncoderName, diagnostics, unavailableControlIds }
  }, [capabilities, catalog, config, encoderCapabilities, encoderCapabilitiesByName, loadCapabilities, selectedEncoderName])
}

/** 把运行时不可用项投影到展示模型，不修改目录和用户配置。 */
export function applyRuntimeFFmpegCapabilities(
  view: ResolvedBuilderView,
  catalog: Catalog,
  runtime: RuntimeFFmpegState,
): ResolvedBuilderView {
  if (!runtime.capabilities) return view
  const availableEncoders = new Set(runtime.capabilities.encoders)
  const fieldMap = new Map<string, ResolvedField>()

  for (const field of Object.values(view.fieldIndex)) {
    let next = field
    if (field.id === 'param.video.encoder' && field.options) {
      next = {
        ...field,
        options: field.options.map((option) => {
          const encoder = catalog.encoders.video[String(option.value)]
          return encoder && !availableEncoders.has(encoder.ffmpegName)
            ? { ...option, disabled: true, availabilityNote: '当前 FFmpeg 未注册此编码器' }
            : option
        }),
      }
    }
    if (runtime.unavailableControlIds.has(field.id)) {
      next = { ...next, disabled: true, disabledReason: '当前 FFmpeg 未汇报此编码器选项' }
    }
    fieldMap.set(field.id, next)
  }

  const mapSection = (section: ResolvedBuilderView['sections'][number]) => ({
    ...section,
    fields: section.fields.map((field) => fieldMap.get(field.id) ?? field),
  })
  const sections = view.sections.map(mapSection)
  const panels = view.panels.map((panel) => ({ ...panel, sections: panel.sections.map(mapSection) }))
  return {
    ...view,
    sections,
    panels,
    fieldIndex: Object.fromEntries([...fieldMap.entries()]),
  }
}

function diagnostic(
  code: string,
  message: string,
  originIds: string[],
  context: Record<string, unknown> = {},
): Diagnostic {
  return { code, severity: 'error', category: 'availability', message, originIds, context }
}
