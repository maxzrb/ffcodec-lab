import type { ProjectConfig } from '../config/project-config'
import type { Catalog, ControlDefinition, EncoderDefinition } from '../catalog/catalog-types'
import type { Diagnostic } from '../rules/rule-types'
import {
  type CommandPlan,
  type CommandInvocation,
  type InputSpec,
  type OutputSpec,
  type CommandArg,
} from './command-ast'
import { buildVideoFilterChain, renderFilterChain } from '../filters/video-filter-builder'
import { getByPath } from '../../utils/object-path'
import { extractConfigKey } from '../config/config-path'
import { calculateTargetSize, type TargetSizeCalculation } from '../tools/target-size'

/**
 * Builds the CommandPlan from ProjectConfig + Catalog.
 * Pure function — no UI dependency, no string concatenation for user-facing output.
 */
export function buildCommandPlan(
  config: ProjectConfig,
  catalog: Catalog,
  messages: Diagnostic[]
): CommandPlan {
  const targetSize = calculateTargetSize(config, catalog)
  const targetSizeReady = targetSize.enabled
    && targetSize.videoBitrateKbps !== undefined
    && !targetSize.diagnostics.some((diagnostic) => diagnostic.severity === 'error')
  const isTwoPass = config.video.rateControl?.mode === 'twoPass' || targetSizeReady

  const invocation: CommandInvocation = {
    executable: 'ffmpeg',
    globalArgs: buildGlobalArgs(config, isTwoPass),
    inputs: buildInputs(config),
    output: buildOutput(config, catalog, targetSize),
    purpose: isTwoPass ? 'pass-1' : 'single-pass',
  }

  const plan: CommandPlan = {
    invocations: [invocation],
    messages,
  }

  // 双遍第一遍只分析视频并写入 null muxer；音频、字幕、元数据和真实输出
  // 只能出现在第二遍，否则默认未覆盖时第二遍会与第一遍生成的文件冲突。
  if (isTwoPass) {
    const pass2 = structuredClone(invocation)
    pass2.purpose = 'pass-2'
    pass2.globalArgs = buildGlobalArgs(config, true).map((a) =>
      a.id === 'global.pass'
        ? { ...a, tokens: ['-pass', '2'], id: 'global.pass2' }
        : a
    )

    invocation.output = buildFirstPassOutput(invocation.output)
    plan.invocations.push(pass2)
  }

  return plan
}

/** 为双遍编码第一遍构造不产生真实媒体文件的视频分析输出。 */
function buildFirstPassOutput(output: OutputSpec): OutputSpec {
  return {
    maps: output.maps.filter((arg) => arg.id.startsWith('map.video.')),
    codecArgs: output.codecArgs,
    qualityArgs: output.qualityArgs,
    filterArgs: output.filterArgs,
    audioArgs: [{
      id: 'pass1.audio.disabled',
      originId: 'rule.twopass',
      phase: 'AUDIO_CODEC',
      tokens: ['-an'],
    }],
    subtitleArgs: [{
      id: 'pass1.subtitle.disabled',
      originId: 'rule.twopass',
      phase: 'SUBTITLE',
      tokens: ['-sn'],
    }],
    metadataArgs: [],
    muxerArgs: [{
      id: 'pass1.null.muxer',
      originId: 'rule.twopass',
      phase: 'MUXER',
      tokens: ['-f', 'null'],
    }],
    customArgs: output.customArgs.filter((arg) => arg.originId === 'customArgs.videoArgs'),
    tailArgs: [],
    path: '-',
  }
}

function buildGlobalArgs(config: ProjectConfig, isTwoPass: boolean): CommandArg[] {
  const args: CommandArg[] = []

  if (config.output.overwrite) {
    args.push({
      id: 'global.overwrite',
      originId: 'param.overwrite',
      phase: 'GLOBAL',
      tokens: ['-y'],
      explanationId: 'expl.param.overwrite',
    })
  }

  if (isTwoPass) {
    args.push({
      id: 'global.pass',
      originId: 'rule.twopass',
      phase: 'GLOBAL',
      tokens: ['-pass', '1'],
    })
    args.push({
      id: 'global.passlogfile',
      originId: 'rule.twopass',
      phase: 'GLOBAL',
      tokens: ['-passlogfile', 'ffmpeg2pass'],
    })
  }

  // Custom global args
  for (let i = 0; i < config.customArgs.globalArgs.length; i++) {
    args.push({
      id: `global.custom.${i}`,
      originId: 'customArgs.globalArgs',
      phase: 'GLOBAL',
      tokens: [config.customArgs.globalArgs[i]],
      unsafe: true,
    })
  }

  return args
}

function buildInputs(config: ProjectConfig): InputSpec[] {
  const inputs: InputSpec[] = [
    {
      id: 'input.main',
      argsBeforeInput: [],
      path: config.input.path,
      originId: 'input.path',
    },
  ]

  for (let index = 0; index < config.customArgs.preInputArgs.length; index++) {
    inputs[0].argsBeforeInput.push({
      id: `input.custom.${index}`,
      originId: 'customArgs.preInputArgs',
      phase: 'PRE_INPUT',
      tokens: [config.customArgs.preInputArgs[index]],
      unsafe: true,
    })
  }

  // Subtitle track external inputs
  // Input indices: main=0, then external subtitle tracks in track array order
  for (const track of config.subtitle.tracks) {
    if (track.source === 'external' && track.path) {
      inputs.push({
        id: `input.subtitle.${track.id}`,
        argsBeforeInput: [],
        path: track.path,
        originId: `subtitle.tracks.${track.id}.path`,
      })
    }
  }

  if (config.subtitle.burn.enabled && config.subtitle.burn.source === 'external' && config.subtitle.burn.externalPath) {
    inputs.push({
      id: 'input.subtitle.burn',
      argsBeforeInput: [],
      path: config.subtitle.burn.externalPath,
      originId: 'subtitle.burn.externalPath',
    })
  }

  return inputs
}

function buildOutput(
  config: ProjectConfig,
  catalog: Catalog,
  targetSize: TargetSizeCalculation,
): OutputSpec {
  const output: OutputSpec = {
    maps: [],
    codecArgs: [],
    qualityArgs: [],
    filterArgs: [],
    audioArgs: [],
    subtitleArgs: [],
    metadataArgs: [],
    muxerArgs: [],
    customArgs: [],
    tailArgs: [],
    path: config.output.path,
  }

  const explicitStreamMapping =
    config.streams.videoStreamIndexes.length > 0
    || config.streams.audioStreamIndexes.length > 0
    || config.streams.videoStreamIndex !== undefined
    || config.streams.audioStreamIndex !== undefined
    || config.streams.subtitleStreamIndexes.length > 0
    || config.streams.subtitleStreamIndex !== undefined
    || config.streams.preserveOtherVideoStreams
    || config.streams.preserveOtherAudioStreams
    || config.streams.preserveOtherSubtitleStreams

  if (explicitStreamMapping) {
    if (config.video.mode !== 'disabled') {
      const videoIndexes = config.streams.videoStreamIndexes.length > 0
        ? config.streams.videoStreamIndexes
        : [config.streams.videoStreamIndex ?? 0]
      const selectors = config.streams.preserveOtherVideoStreams
        ? ['0:v?']
        : videoIndexes.map((index) => `0:v:${index}?`)
      selectors.forEach((selector, index) => output.maps.push({
        id: `map.video.${index}`,
        originId: config.streams.preserveOtherVideoStreams
          ? 'streams.preserveOtherVideoStreams'
          : 'streams.videoStreamIndexes',
        phase: 'MAP',
        tokens: ['-map', selector],
      }))
    }
    if (config.audio.mode !== 'disabled') {
      const audioIndexes = config.streams.audioStreamIndexes.length > 0
        ? config.streams.audioStreamIndexes
        : [config.streams.audioStreamIndex ?? 0]
      const selectors = config.streams.preserveOtherAudioStreams
        ? ['0:a?']
        : audioIndexes.map((index) => `0:a:${index}?`)
      selectors.forEach((selector, index) => output.maps.push({
        id: `map.audio.${index}`,
        originId: config.streams.preserveOtherAudioStreams
          ? 'streams.preserveOtherAudioStreams'
          : 'streams.audioStreamIndexes',
        phase: 'MAP',
        tokens: ['-map', selector],
      }))
    }
    if (config.streams.preserveOtherSubtitleStreams || config.streams.subtitleStreamIndexes.length > 0 || config.streams.subtitleStreamIndex !== undefined) {
      const subtitleIndexes = config.streams.subtitleStreamIndexes.length > 0
        ? config.streams.subtitleStreamIndexes
        : [config.streams.subtitleStreamIndex ?? 0]
      const selectors = config.streams.preserveOtherSubtitleStreams
        ? ['0:s?']
        : subtitleIndexes.map((index) => `0:s:${index}?`)
      selectors.forEach((selector, index) => output.maps.push({
        id: `map.subtitle.${index}`,
        originId: config.streams.preserveOtherSubtitleStreams
          ? 'streams.preserveOtherSubtitleStreams'
          : 'streams.subtitleStreamIndexes',
        phase: 'MAP',
        tokens: ['-map', selector],
      }))
    }
  }

  // -- video --------------------------------------------------
  if (config.video.mode === 'disabled') {
    output.codecArgs.push({
      id: 'codec.vn',
      originId: 'video.mode',
      phase: 'VIDEO_CODEC',
      tokens: ['-vn'],
    })
  } else if (config.video.mode === 'copy') {
    output.codecArgs.push({
      id: 'codec.v.copy',
      originId: 'video.mode',
      phase: 'VIDEO_CODEC',
      tokens: ['-c:v', 'copy'],
    })
  } else if (config.video.mode === 'encode' && config.video.encoderId) {
    const encoder = catalog.encoders.video[config.video.encoderId]
    if (encoder) {
      // Video codec
      output.codecArgs.push({
        id: 'codec.v.encoder',
        originId: 'param.video.encoder',
        phase: 'VIDEO_CODEC',
        tokens: ['-c:v', encoder.ffmpegName],
        explanationId: encoder.explanationId,
      })

      // Preset
      if (config.video.preset && config.video.preset !== 'auto' && encoder.preset) {
        output.codecArgs.push({
          id: 'codec.preset',
          originId: 'video.preset',
          phase: 'VIDEO_CODEC',
          tokens: ['-preset', String(config.video.preset)],
          explanationId: encoder.preset.explanationId,
        })
      }

      // Profile
      if (config.video.profile && config.video.profile !== 'auto' && encoder.profile) {
        output.codecArgs.push({
          id: 'codec.profile',
          originId: 'video.profile',
          phase: 'VIDEO_PROFILE',
          tokens: ['-profile:v', String(config.video.profile)],
          explanationId: encoder.profile.explanationId,
        })
      }

      // Tune
      if (config.video.tune && config.video.tune !== 'auto' && encoder.tune) {
        output.codecArgs.push({
          id: 'codec.tune',
          originId: 'video.tune',
          phase: 'VIDEO_CODEC',
          tokens: ['-tune', String(config.video.tune)],
          explanationId: encoder.tune.explanationId,
        })
      }

      // Pixel format
      if (config.video.pixelFormat && config.video.pixelFormat !== 'auto' && encoder.pixelFormat) {
        output.codecArgs.push({
          id: 'codec.pixfmt',
          originId: 'video.pixelFormat',
          phase: 'VIDEO_CODEC',
          tokens: ['-pix_fmt', String(config.video.pixelFormat)],
          explanationId: encoder.pixelFormat.explanationId,
        })
      }

      const colorArguments: Array<[keyof NonNullable<ProjectConfig['video']['color']>, string]> = [
        ['space', '-colorspace'],
        ['primaries', '-color_primaries'],
        ['transfer', '-color_trc'],
        ['range', '-color_range'],
      ]
      if ((config.video.color?.operation ?? 'metadata-only') !== 'convert-only') {
        for (const [key, argName] of colorArguments) {
          const value = config.video.color?.[key]
          if (typeof value !== 'string' || !value) continue
          output.codecArgs.push({
            id: `color.${key}`,
            originId: `video.color.${key}`,
            phase: 'VIDEO_COLOR',
            tokens: [argName, value],
          })
        }
      }

      // 目标大小工具接管平均视频码率，但不改写原质量控制配置；关闭后可原样恢复。
      if (targetSize.enabled) {
        if (targetSize.videoBitrateKbps !== undefined) {
          output.qualityArgs.push({
            id: 'quality.targetSize.bitrate',
            originId: 'tools.targetSize.targetMiB',
            phase: 'VIDEO_RATE_CONTROL',
            tokens: ['-b:v', `${targetSize.videoBitrateKbps}k`],
          })
        }
      } else if (config.video.rateControl) {
        const qMode = encoder.qualityModes.find((m) => m.id === config.video.rateControl!.mode)
        if (qMode) {
          // Emit mode-level arguments first (e.g. -rc vbr for NVENC CQ)
          for (const tpl of qMode.modeArguments ?? []) {
            output.qualityArgs.push({
              id: `quality.mode.${tpl.argName}`,
              originId: `qualityMode.${qMode.id}.args.${tpl.argName}`,
              phase: tpl.phase,
              tokens: tpl.value !== undefined ? [tpl.argName, String(tpl.value)] : [tpl.argName],
            })
          }
          // Then emit per-control arguments
          for (const ctrl of qMode.controls) {
            if (ctrl.commandBinding) {
              const val = getControlValue(config, ctrl) ?? ctrl.defaultValue
              if (val !== undefined && val !== null) {
                output.qualityArgs.push({
                  id: `quality.${ctrl.id}`,
                  originId: `video.rateControl.controls.${ctrl.id}`,
                  phase: ctrl.commandBinding.phase,
                  tokens: ctrl.commandBinding.compact
                    ? [ctrl.commandBinding.prefix!]
                    : [ctrl.commandBinding.prefix!, String(val)],
                  explanationId: ctrl.explanationId,
                })
              }
            }
          }
        }
      }

      // 编码器私有高级参数一律只发射用户显式设置的值；目录 defaultValue
      // 仅用于说明编码器自身默认行为，不能让默认命令变得冗长。
      output.codecArgs.push(...buildVideoSpecialParameterArgs(config, encoder))
    }
  }

  // -- video filters ------------------------------------------
  const filterChain = buildVideoFilterChain(config)
  const vfArg = renderFilterChain(filterChain, 'filter.chain')
  if (vfArg) {
    output.filterArgs.push(vfArg)
  }

  // -- audio --------------------------------------------------
  if (config.audio.mode === 'disabled') {
    output.audioArgs.push({
      id: 'codec.an',
      originId: 'audio.mode',
      phase: 'AUDIO_CODEC',
      tokens: ['-an'],
    })
  } else if (config.audio.mode === 'copy') {
    output.audioArgs.push({
      id: 'codec.a.copy',
      originId: 'audio.mode',
      phase: 'AUDIO_CODEC',
      tokens: ['-c:a', 'copy'],
    })
  } else if (config.audio.mode === 'encode' && config.audio.encoderId) {
    const aEncoder = catalog.encoders.audio[config.audio.encoderId]
    if (aEncoder) {
      output.audioArgs.push({
        id: 'codec.a.encoder',
        originId: 'param.audio.encoder',
        phase: 'AUDIO_CODEC',
        tokens: ['-c:a', aEncoder.ffmpegName],
        explanationId: aEncoder.explanationId,
      })

      if (config.audio.bitrate) {
        output.audioArgs.push({
          id: 'quality.a.bitrate',
          originId: 'audio.bitrate',
          phase: 'AUDIO_QUALITY',
          tokens: ['-b:a', config.audio.bitrate],
        })
      }

      if (config.audio.channelLayout && config.audio.channelLayout !== 'source') {
        output.audioArgs.push({
          id: 'quality.a.ch',
          originId: 'audio.channelLayout',
          phase: 'AUDIO_QUALITY',
          tokens: ['-channel_layout:a', config.audio.channelLayout],
        })
      }

      if (config.audio.sampleRate) {
        output.audioArgs.push({
          id: 'quality.a.sr',
          originId: 'audio.sampleRate',
          phase: 'AUDIO_QUALITY',
          tokens: ['-ar', String(config.audio.sampleRate)],
        })
      }

      // 音频特殊参数同样通过目录定义生成，确保界面、配置和命令使用同一绑定。
      for (const sp of aEncoder.specialParameters) {
        if (!sp.commandBinding) continue
        const configKey = sp.configBinding?.path
          ? extractConfigKey(sp.configBinding.path)
          : sp.id
        const storedValue = config.audio.qualityValues[configKey]
        const val = storedValue !== undefined ? storedValue : (sp.optional ? undefined : sp.defaultValue)
        if (val === undefined || val === null || val === '') continue
        const tokens = buildSpecialParameterTokens(sp, val)
        if (!tokens) continue
        output.audioArgs.push({
          id: `audio.special.${configKey}`,
          originId: sp.id,
          phase: sp.commandBinding.phase,
          tokens,
          explanationId: sp.explanationId,
        })
      }
    }
  }

  // -- subtitle tracks -------------------------------------------
  // Input index counter for external subtitle files
  // Main input = 0, external tracks start at index 1
  let subtitleInputIndex = 1

  for (let i = 0; i < config.subtitle.tracks.length; i++) {
    const track = config.subtitle.tracks[i]
    const outputIndex = i // subtitle stream index in output

    // -map
    if (track.source === 'input') {
      const spec = track.mainStreamRelIndex !== undefined
        ? `0:s:${track.mainStreamRelIndex}`
        : '0:s'
      output.maps.push({
        id: `map.subtitle.${track.id}`,
        originId: `subtitle.tracks.${track.id}.map`,
        phase: 'MAP',
        tokens: ['-map', spec],
      })
    } else if (track.source === 'external' && track.path) {
      output.maps.push({
        id: `map.subtitle.${track.id}`,
        originId: `subtitle.tracks.${track.id}.map`,
        phase: 'MAP',
        tokens: ['-map', `${subtitleInputIndex}:s:${track.externalStreamIndex ?? 0}`],
      })
      subtitleInputIndex++
    }

    // -c:s:N (stream-specific, NOT global -c:s)
    if (track.codecMode === 'copy') {
      output.subtitleArgs.push({
        id: `subtitle.${track.id}.codec`,
        originId: `subtitle.tracks.${track.id}.codec`,
        phase: 'SUBTITLE',
        tokens: ['-c:s:' + String(outputIndex), 'copy'],
      })
    } else if (track.codecMode === 'transcode' && track.codec) {
      output.subtitleArgs.push({
        id: `subtitle.${track.id}.codec`,
        originId: `subtitle.tracks.${track.id}.codec`,
        phase: 'SUBTITLE',
        tokens: ['-c:s:' + String(outputIndex), track.codec],
      })
    }

    // -metadata:s:s:N
    if (track.language) {
      output.subtitleArgs.push({
        id: `subtitle.${track.id}.lang`,
        originId: `subtitle.tracks.${track.id}.language`,
        phase: 'METADATA',
        tokens: ['-metadata:s:s:' + String(outputIndex), `language=${track.language}`],
      })
    }
    if (track.title) {
      output.subtitleArgs.push({
        id: `subtitle.${track.id}.title`,
        originId: `subtitle.tracks.${track.id}.title`,
        phase: 'METADATA',
        tokens: ['-metadata:s:s:' + String(outputIndex), `title=${track.title}`],
      })
    }

    // -disposition:s:N
    if (track.disposition) {
      const flags: string[] = []
      if (track.disposition.default) flags.push('default')
      if (track.disposition.forced) flags.push('forced')
      if (track.disposition.hearingImpaired) flags.push('hearing_impaired')
      if (flags.length > 0) {
        output.subtitleArgs.push({
          id: `subtitle.${track.id}.disposition`,
          originId: `subtitle.tracks.${track.id}.disposition`,
          phase: 'SUBTITLE',
          tokens: ['-disposition:s:' + String(outputIndex), flags.join('+')],
        })
      }
    }
  }

  // -- 自定义元数据 -------------------------------------------
  // 格式：全局 key=value；流级 stream_type:index:key=value
  const metadata = config.output.metadata
  if (metadata) {
    const streamTypePrefix: Record<string, string> = { video: 'v', audio: 'a', subtitle: 's' }

    for (const line of metadata.globalRaw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)) {
      const eq = line.indexOf('=')
      if (eq <= 0) continue
      const key = line.slice(0, eq).trim()
      const value = line.slice(eq + 1)
      if (!key) continue
      output.metadataArgs.push({
        id: `metadata.global.${key}`,
        originId: 'output.metadata.globalRaw',
        phase: 'METADATA',
        tokens: ['-metadata', `${key}=${value}`],
      })
    }

    for (const line of metadata.streamRaw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)) {
      const firstColon = line.indexOf(':')
      if (firstColon <= 0) continue
      const streamType = line.slice(0, firstColon).trim()
      const rest = line.slice(firstColon + 1)
      const secondColon = rest.indexOf(':')
      if (secondColon <= 0) continue
      const indexStr = rest.slice(0, secondColon).trim()
      const keyValue = rest.slice(secondColon + 1)
      const eq = keyValue.indexOf('=')
      if (eq <= 0) continue
      const key = keyValue.slice(0, eq).trim()
      const value = keyValue.slice(eq + 1)
      const streamIndex = Number(indexStr)
      const prefix = streamTypePrefix[streamType]
      if (!prefix || !key || !Number.isFinite(streamIndex) || streamIndex < 0) continue
      output.metadataArgs.push({
        id: `metadata.stream.${streamType}.${streamIndex}.${key}`,
        originId: 'output.metadata.streamRaw',
        phase: 'METADATA',
        tokens: [`-metadata:s:${prefix}:${streamIndex}`, `${key}=${value}`],
      })
    }
  }

  const customGroups: Array<{
    values: string[]
    originId: string
    phase: CommandArg['phase']
  }> = [
    { values: config.customArgs.videoArgs, originId: 'customArgs.videoArgs', phase: 'VIDEO_CODEC' },
    { values: config.customArgs.audioArgs, originId: 'customArgs.audioArgs', phase: 'AUDIO_CODEC' },
    { values: config.customArgs.preOutputArgs, originId: 'customArgs.preOutputArgs', phase: 'CUSTOM_OUTPUT' },
  ]
  for (const group of customGroups) {
    group.values.forEach((token, index) => {
      output.customArgs.push({
        id: `${group.originId}.${index}`,
        originId: group.originId,
        phase: group.phase,
        tokens: [token],
        unsafe: true,
      })
    })
  }
  config.customArgs.tailArgs.forEach((token, index) => {
    output.tailArgs?.push({
      id: `customArgs.tailArgs.${index}`,
      originId: 'customArgs.tailArgs',
      phase: 'OUTPUT',
      tokens: [token],
      unsafe: true,
    })
  })

  return output
}

/**
 * 将目录控件值转换成 FFmpeg 参数。布尔开关需要恢复为编码器接受的
 * on/off 或 1/0，避免把界面布尔值直接输出成 true/false。
 */
function buildSpecialParameterTokens(
  control: ControlDefinition,
  value: unknown,
): string[] | null {
  const binding = control.commandBinding
  if (!binding) return null
  const prefix = binding.prefix ?? binding.argName

  if (control.control !== 'switch') {
    return [prefix, String(value)]
  }

  if (binding.compact) {
    return value ? [prefix] : null
  }

  if (typeof value !== 'boolean') {
    return [prefix, String(value)]
  }

  const optionValues = control.options?.map((option) => option.value) ?? []
  if (value) {
    const enabledValue = optionValues.includes('on') ? 'on' : 1
    return [prefix, String(enabledValue)]
  }
  const disabledValue = optionValues.includes('off') ? 'off' : 0
  return [prefix, String(disabledValue)]
}

interface DictionaryParameterEntry {
  control: ControlDefinition
  value: string
}

interface DictionaryParameterGroup {
  prefix: string
  phase: NonNullable<ControlDefinition['commandBinding']>['phase']
  separator: string
  rawEntries: DictionaryParameterEntry[]
  keyedEntries: Array<DictionaryParameterEntry & { key: string }>
}

/**
 * 构建视频编码器私有参数，并把 `-svtav1-params` 这类字典控件聚合为
 * 唯一参数。结构化字段覆盖自由文本中的同名 key，其余文本原样保留。
 */
function buildVideoSpecialParameterArgs(
  config: ProjectConfig,
  encoder: EncoderDefinition,
): CommandArg[] {
  const args: CommandArg[] = []
  const dictionaryGroups = new Map<string, DictionaryParameterGroup>()

  for (const control of encoder.specialParameters) {
    const binding = control.commandBinding
    if (!binding) continue
    const configKey = control.configBinding?.path
      ? extractConfigKey(control.configBinding.path)
      : control.id
    const storedValue = config.video.specialParameters[configKey]
    if (storedValue === undefined || storedValue === null || storedValue === '') continue

    if (binding.dictionary) {
      const prefix = binding.prefix ?? binding.argName
      const separator = binding.dictionary.separator ?? ':'
      const groupId = `${prefix}\u0000${binding.phase}\u0000${separator}`
      const group = dictionaryGroups.get(groupId) ?? {
        prefix,
        phase: binding.phase,
        separator,
        rawEntries: [],
        keyedEntries: [],
      }
      const renderedValue = buildSpecialParameterValue(control, storedValue)
      if (renderedValue !== null) {
        const entry = { control, value: renderedValue }
        if (binding.dictionary.key) {
          group.keyedEntries.push({ ...entry, key: binding.dictionary.key })
        } else {
          group.rawEntries.push(entry)
        }
        dictionaryGroups.set(groupId, group)
      }
      continue
    }

    const tokens = buildSpecialParameterTokens(control, storedValue)
    if (!tokens) continue
    args.push({
      id: `codec.special.${configKey}`,
      originId: control.id,
      phase: binding.phase,
      tokens,
      explanationId: control.explanationId,
    })
  }

  for (const [groupId, group] of dictionaryGroups) {
    const structuredKeys = new Set(group.keyedEntries.map((entry) => entry.key.toLowerCase()))
    const rawParts = group.rawEntries
      .flatMap((entry) => entry.value.split(group.separator))
      .map((part) => part.trim())
      .filter((part) => {
        if (!part) return false
        const equalsIndex = part.indexOf('=')
        if (equalsIndex < 0) return true
        return !structuredKeys.has(part.slice(0, equalsIndex).trim().toLowerCase())
      })
    const structuredParts = group.keyedEntries.map((entry) => `${entry.key}=${entry.value}`)
    const parts = [...rawParts, ...structuredParts]
    if (parts.length === 0) continue

    const originControl = group.rawEntries[0]?.control ?? group.keyedEntries[0].control
    args.push({
      id: `codec.special.dictionary.${groupId.replace(/[^a-zA-Z0-9_-]/g, '.')}`,
      originId: originControl.id,
      phase: group.phase,
      tokens: [group.prefix, parts.join(group.separator)],
      explanationId: originControl.explanationId,
    })
  }

  return args
}

function buildSpecialParameterValue(control: ControlDefinition, value: unknown): string | null {
  const tokens = buildSpecialParameterTokens(control, value)
  if (!tokens || tokens.length < 2) return null
  return tokens.slice(1).join(' ')
}

/**
 * Resolves the value for a control via its configBinding path.
 * All controls must have configBinding — no pattern-matching fallback.
 */
function getControlValue(
  config: ProjectConfig,
  ctrl: { id: string; configBinding?: { path: string } },
): unknown {
  if (ctrl.configBinding?.path) {
    return getByPath(config, ctrl.configBinding.path)
  }
  return undefined
}
