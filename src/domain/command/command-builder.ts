import type { ProjectConfig } from '../config/project-config'
import type { Catalog } from '../catalog/catalog-types'
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

/**
 * Builds the CommandPlan from ProjectConfig + Catalog.
 * Pure function — no UI dependency, no string concatenation for user-facing output.
 */
export function buildCommandPlan(
  config: ProjectConfig,
  catalog: Catalog,
  messages: Diagnostic[]
): CommandPlan {
  const hasErrors = messages.some((m) => m.severity === 'error')

  const invocation: CommandInvocation = {
    executable: 'ffmpeg',
    globalArgs: buildGlobalArgs(config),
    inputs: buildInputs(config),
    output: buildOutput(config, catalog),
    purpose: config.video.rateControl?.mode === 'twoPass' ? 'pass-1' : 'single-pass',
  }

  const plan: CommandPlan = {
    invocations: [invocation],
    messages,
  }

  // For two-pass, add pass-2 with logfile
  if (config.video.rateControl?.mode === 'twoPass' && !hasErrors) {
    const pass2: CommandInvocation = structuredClone(invocation)
    pass2.purpose = 'pass-2'
    // Pass 1 global args differ
    pass2.globalArgs = buildGlobalArgs(config).map((a) =>
      a.id === 'global.pass'
        ? { ...a, tokens: ['-pass', '2'], id: 'global.pass2' }
        : a
    )
    plan.invocations.push(pass2)
  }

  return plan
}

function buildGlobalArgs(config: ProjectConfig): CommandArg[] {
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

  if (config.video.rateControl?.mode === 'twoPass') {
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

  // Subtitle external inputs
  if (config.subtitle.mux.enabled && config.subtitle.mux.source === 'external' && config.subtitle.mux.externalPath) {
    inputs.push({
      id: 'input.subtitle.mux',
      argsBeforeInput: [],
      path: config.subtitle.mux.externalPath,
      originId: 'subtitle.mux.externalPath',
    })
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

function buildOutput(config: ProjectConfig, catalog: Catalog): OutputSpec {
  const output: OutputSpec = {
    maps: [],
    codecArgs: [],
    qualityArgs: [],
    filterArgs: [],
    audioArgs: [],
    subtitleArgs: [],
    muxerArgs: [],
    customArgs: [],
    path: config.output.path,
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

      // Quality / rate control
      if (config.video.rateControl) {
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
              const val = getControlValue(config, ctrl)
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

      // Special params
      for (const [key, val] of Object.entries(config.video.specialParameters)) {
        if (val !== undefined && val !== null && val !== '') {
          output.codecArgs.push({
            id: `codec.special.${key}`,
            originId: `video.specialParameters.${key}`,
            phase: 'VIDEO_CODEC',
            tokens: [key, String(val)],
            unsafe: true,
          })
        }
      }
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

      if (config.audio.channelLayout) {
        output.audioArgs.push({
          id: 'quality.a.ch',
          originId: 'audio.channelLayout',
          phase: 'AUDIO_QUALITY',
          tokens: ['-ac', config.audio.channelLayout],
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
    }
  }

  // -- subtitle mux -------------------------------------------
  if (config.subtitle.mux.enabled) {
    if (config.subtitle.mux.codecMode !== 'auto') {
      output.subtitleArgs.push({
        id: 'subtitle.mux.codec',
        originId: 'subtitle.mux.codecMode',
        phase: 'SUBTITLE',
        tokens: ['-c:s', config.subtitle.mux.codecMode],
      })
    }
  }

  return output
}

/**
 * Resolves the value for a control.
 * Prefers configBinding.path (explicit mapping), falls back to pattern matching
 * for legacy controls that haven't been migrated yet.
 *
 * TODO(revision-19): Remove pattern-matching fallback once all controls
 * have configBinding. Audit script must verify no omissions.
 */
function getControlValue(
  config: ProjectConfig,
  ctrl: { id: string; configBinding?: { path: string } },
): unknown {
  // NEW: explicit configBinding takes priority
  if (ctrl.configBinding?.path) {
    return getByPath(config, ctrl.configBinding.path)
  }

  // LEGACY FALLBACK: pattern matching on control ID
  // Will be removed after all controls are migrated (revision #19)
  const controlId = ctrl.id
  if (controlId.includes('.crf.value') || controlId.includes('.cqp.value')) {
    return config.video.rateControl?.qualityValue
  }
  if (controlId.includes('.vbr.bitrate') || controlId.includes('.cbr.bitrate') || controlId.includes('.twopass.bitrate')) {
    return config.video.rateControl?.bitrate
  }
  if (controlId.includes('.vbr.maxrate')) {
    return config.video.rateControl?.maxRate
  }
  if (controlId.includes('.vbr.bufsize')) {
    return config.video.rateControl?.bufferSize
  }
  return undefined
}
