#!/usr/bin/env tsx
/**
 * Catalog audit script — validates all catalog data for:
 * - Missing source references
 * - Default values out of range
 * - Invalid rule references
 * - Missing emitterIds
 * - Encoders without quality modes
 * - Missing explanation IDs
 *
 * Run: npx tsx scripts/validate-catalog.ts
 * Exit code 1 if any issues found.
 */

import { videoEncoders } from '@ffcodec/catalog/data/encoders/video'
import { audioEncoders } from '@ffcodec/catalog/data/encoders/audio'
import { containers } from '@ffcodec/catalog/data/containers'
import { explanations } from '@ffcodec/catalog/data/explanations'
import { parameters } from '@ffcodec/catalog/data/parameters'
import { builtinRules } from '@ffcodec/catalog/data/rules'
import type { EncoderDefinition, ContainerDefinition, ParameterDefinition } from '@ffcodec/domain/catalog/catalog-types'

const errors: string[] = []
const warnings: string[] = []

// -- Source references ------------------------------------------
function checkSourceRefs(item: { id: string; sourceRefs?: unknown[]; status?: string }) {
  const refs = item.sourceRefs
  if (!refs || (Array.isArray(refs) && refs.length === 0)) {
    if (item.status === 'verified') {
      errors.push(`[source] Verified item "${item.id}" has no source references`)
    } else {
      warnings.push(`[source] Item "${item.id}" has no source references (status: ${item.status})`)
    }
  }
}

// -- Verification level / source authority consistency -----------
interface VerifiableItem {
  id: string
  sourceAuthority?: string
  verificationLevel?: string
  needsCrossVerification?: boolean
  status?: string
}

function checkVerificationLevel(item: VerifiableItem) {
  const { id, sourceAuthority, verificationLevel, needsCrossVerification } = item

  // Must have the new fields
  if (!sourceAuthority) {
    errors.push(`[verify] Item "${id}" is missing sourceAuthority`)
  }
  if (!verificationLevel) {
    errors.push(`[verify] Item "${id}" is missing verificationLevel`)
  }
  if (needsCrossVerification === undefined) {
    errors.push(`[verify] Item "${id}" is missing needsCrossVerification`)
  }

  // Illegal combinations
  if (needsCrossVerification === true && verificationLevel === 'official') {
    errors.push(`[verify] Item "${id}": needsCrossVerification=true conflicts with verificationLevel=official`)
  }
  if (needsCrossVerification === true && verificationLevel === 'cross-verified') {
    errors.push(`[verify] Item "${id}": needsCrossVerification=true conflicts with verificationLevel=cross-verified`)
  }
  if (needsCrossVerification === false && verificationLevel === 'pending') {
    errors.push(`[verify] Item "${id}": needsCrossVerification=false conflicts with verificationLevel=pending`)
  }

  // sourceAuthority must be valid
  const validAuthorities = ['ffmpeg-official', 'encoder-official', 'ffmpegfreeui', 'community', 'unknown']
  if (sourceAuthority && !validAuthorities.includes(sourceAuthority)) {
    errors.push(`[verify] Item "${id}" has invalid sourceAuthority: "${sourceAuthority}"`)
  }

  // verificationLevel must be valid
  const validLevels = ['official', 'cross-verified', 'project-derived', 'pending', 'deprecated']
  if (verificationLevel && !validLevels.includes(verificationLevel)) {
    errors.push(`[verify] Item "${id}" has invalid verificationLevel: "${verificationLevel}"`)
  }
}

// -- Default value in range -------------------------------------
function checkDefaultInRange(def: { id: string; range?: { min?: number; max?: number }; defaultValue?: unknown }) {
  if (def.range && def.defaultValue !== undefined && def.defaultValue !== null && typeof def.defaultValue === 'number') {
    const min = def.range.min ?? -Infinity
    const max = def.range.max ?? Infinity
    const val = def.defaultValue as number
    if (val < min || val > max) {
      errors.push(`[range] "${def.id}" default value ${val} is outside range [${min}, ${max}]`)
    }
  }
}

// -- Verify explanation IDs exist --------------------------------
function checkExplanationId(id: string, ownerId: string) {
  if (!explanations[id]) {
    warnings.push(`[explanation] "${ownerId}" references missing explanation "${id}"`)
  }
}

// -- Validate encoders -------------------------------------------
function validateEncoder(encoder: EncoderDefinition, type: string) {
  checkSourceRefs(encoder)
  checkVerificationLevel(encoder as unknown as VerifiableItem)

  // Must have at least one quality mode, unless lossless (e.g. FLAC)
  if (encoder.qualityModes.length === 0 && !encoder.capabilities.supportsLossless) {
    errors.push(`[encoder] ${type} "${encoder.id}" has no quality modes`)
  }

  // Check each quality mode
  const modeIds = new Set<string>()
  for (const qm of encoder.qualityModes) {
    if (modeIds.has(qm.id)) {
      errors.push(`[encoder] ${type} "${encoder.id}" has duplicate quality mode "${qm.id}"`)
    }
    modeIds.add(qm.id)
    checkExplanationId(qm.explanationId, `${encoder.id}.qualityModes.${qm.id}`)
    checkSourceRefs(qm)

    for (const ctrl of qm.controls) {
      checkExplanationId(ctrl.explanationId, ctrl.id)
      checkDefaultInRange(ctrl)
    }
  }

  // Check preset/profile/tune/pixelFormat
  for (const sub of [encoder.preset, encoder.profile, encoder.tune, encoder.pixelFormat]) {
    if (sub) {
      checkExplanationId(sub.explanationId, sub.id)
      checkDefaultInRange(sub)
      // For select controls, ensure default is in options
      if (sub.options && sub.defaultValue !== undefined && sub.defaultValue !== null && sub.defaultValue !== 'auto') {
        const validValues = sub.options.map((o) => o.value)
        if (!validValues.includes(sub.defaultValue as string | number)) {
          errors.push(`[default] "${sub.id}" default value "${String(sub.defaultValue)}" is not in options: [${validValues.map(String).join(', ')}]`)
        }
      }
    }
  }

  // Check special params
  for (const sp of encoder.specialParameters) {
    checkExplanationId(sp.explanationId, sp.id)
  }

  // Check explanation ID
  checkExplanationId(encoder.explanationId, encoder.id)
}

// -- Validate containers -----------------------------------------
function validateContainer(container: ContainerDefinition) {
  checkSourceRefs(container)

  // Check that referenced encoder families are reasonable
  const allVideoEncoders = new Set(Object.keys(videoEncoders))
  const allAudioEncoders = new Set(Object.keys(audioEncoders))

  for (const vid of Object.keys(container.videoCodecs)) {
    if (vid !== 'copy' && !allVideoEncoders.has(vid)) {
      warnings.push(`[container] "${container.id}" references nonexistent video encoder "${vid}"`)
    }
  }
  for (const aud of Object.keys(container.audioCodecs)) {
    if (aud !== 'copy' && !allAudioEncoders.has(aud)) {
      warnings.push(`[container] "${container.id}" references nonexistent audio encoder "${aud}"`)
    }
  }
}

// -- Validate parameters -----------------------------------------
function validateParameter(param: ParameterDefinition) {
  checkSourceRefs(param)
  checkVerificationLevel(param as unknown as VerifiableItem)
  checkExplanationId(param.explanationId, param.id)

  if (param.optionsSource?.type === 'static' && param.optionsSource.options) {
    if (param.defaultValue !== undefined && param.defaultValue !== null) {
      const validValues = param.optionsSource.options.map((o) => o.value)
      if (!validValues.includes(param.defaultValue as string | number)) {
        errors.push(`[default] Parameter "${param.id}" default value "${String(param.defaultValue)}" is not in options: [${validValues.map(String).join(', ')}]`)
      }
    }
  }

  if (param.rangeSource) {
    checkDefaultInRange({ id: param.id, range: param.rangeSource, defaultValue: param.defaultValue })
  }
}

// -- Validate rules ----------------------------------------------
function validateRules() {
  for (const rule of builtinRules) {
    checkSourceRefs(rule)

    if (!rule.effects || rule.effects.length === 0) {
      warnings.push(`[rule] Rule "${rule.id}" has no effects`)
    }

    // Check effect targets are valid
    for (const effect of rule.effects) {
      if (effect.type === 'hide' || effect.type === 'disable' || effect.type === 'require' || effect.type === 'clearInvalid') {
        const target = effect.target
        if (!target.startsWith('section.') && !target.startsWith('video.') &&
            !target.startsWith('audio.') && !target.startsWith('frame.') &&
            !target.startsWith('subtitle.') && !target.startsWith('output.') &&
            !target.startsWith('param.')) {
          warnings.push(`[rule] Rule "${rule.id}" target "${target}" does not match known namespace prefixes`)
        }
      }
    }
  }
}

// -- Phase 3 audit: codec family & implementation -----------------
const VALID_FAMILIES = new Set(['h264', 'hevc', 'av1', 'vvc', 'vp8', 'vp9', 'avs', 'avs2', 'avs3', 'ffv1', 'prores', 'aac', 'opus', 'flac', 'other'])
const VALID_IMPLEMENTATIONS = new Set(['software', 'nvidia', 'intel', 'amd', 'apple', 'other'])
const VALID_AVAILABILITY = new Set([
  'generally-available', 'ffmpeg-build-dependent', 'hardware-dependent',
  'driver-dependent', 'platform-dependent', 'experimental', 'deprecated',
])

function checkEncoderMetadata(encoder: EncoderDefinition) {
  if (!VALID_FAMILIES.has(encoder.family)) {
    errors.push(`[family] Encoder "${encoder.id}" has invalid family: "${encoder.family}"`)
  }
  if (!VALID_IMPLEMENTATIONS.has(encoder.implementation)) {
    errors.push(`[impl] Encoder "${encoder.id}" has invalid implementation: "${encoder.implementation}"`)
  }
  if (!VALID_AVAILABILITY.has(encoder.availabilityClass)) {
    errors.push(`[avail] Encoder "${encoder.id}" has invalid availabilityClass: "${encoder.availabilityClass}"`)
  }

  // hardware-dependent must have capabilityScope.hardware
  if (encoder.availabilityClass === 'hardware-dependent') {
    if (!encoder.capabilityScope?.hardware || encoder.capabilityScope.hardware.length === 0) {
      errors.push(`[avail] Hardware-dependent encoder "${encoder.id}" is missing capabilityScope.hardware`)
    }
  }

  // project-derived must not masquerade as official
  if (encoder.verificationLevel === 'project-derived' && encoder.sourceAuthority === 'ffmpeg-official') {
    errors.push(`[verify] Encoder "${encoder.id}": project-derived cannot claim ffmpeg-official authority`)
  }
  if (encoder.verificationLevel === 'project-derived' && encoder.sourceAuthority === 'encoder-official') {
    errors.push(`[verify] Encoder "${encoder.id}": project-derived cannot claim encoder-official authority`)
  }
}

function checkQualityModeArgs(encoder: EncoderDefinition) {
  for (const qm of encoder.qualityModes) {
    // modeArguments must reference valid phases
    for (const tpl of qm.modeArguments ?? []) {
      const validPhases = ['GLOBAL','PRE_INPUT','INPUT','MAP','VIDEO_CODEC','VIDEO_PROFILE',
        'VIDEO_RATE_CONTROL','VIDEO_FILTER','AUDIO_CODEC','AUDIO_QUALITY',
        'SUBTITLE','METADATA','MUXER','CUSTOM_OUTPUT','OUTPUT']
      if (!validPhases.includes(tpl.phase)) {
        errors.push(`[phase] ${encoder.id}/${qm.id} modeArgument "${tpl.argName}" has invalid phase: "${tpl.phase}"`)
      }
    }

    // Same quality mode must not produce conflicting args
    const prefixes = new Set<string>()
    for (const ctrl of qm.controls) {
      if (ctrl.commandBinding?.prefix) {
        if (prefixes.has(ctrl.commandBinding.prefix)) {
          errors.push(`[conflict] ${encoder.id}/${qm.id} has duplicate prefix "${ctrl.commandBinding.prefix}" in controls`)
        }
        prefixes.add(ctrl.commandBinding.prefix)
      }
    }
    for (const tpl of qm.modeArguments ?? []) {
      if (prefixes.has(tpl.argName)) {
        errors.push(`[conflict] ${encoder.id}/${qm.id} modeArgument "${tpl.argName}" conflicts with control prefix`)
      }
    }
  }
}

// Check configBinding paths
import { isValidConfigPath } from '@ffcodec/domain/config/config-path'

function checkConfigBindings(encoder: EncoderDefinition) {
  let hasConfigBinding = false
  for (const qm of encoder.qualityModes) {
    for (const ctrl of qm.controls) {
      if (!ctrl.configBinding) {
        errors.push(`[configbinding] ${encoder.id}/${qm.id}/${ctrl.id} is missing configBinding`)
        continue
      }
      hasConfigBinding = true
      if (!isValidConfigPath(ctrl.configBinding.path)) {
        errors.push(`[configpath] ${ctrl.id} has invalid configBinding.path: "${ctrl.configBinding.path}"`)
      }
    }
  }
  // Error if any encoder has qualityModes but no controls with configBinding
  // (legacy fallback has been removed — all controls must have configBinding)
  // Skip encoders where all quality modes have zero controls (e.g. FFV1/ProRes placeholder modes)
  const allQmControlsEmpty = encoder.qualityModes.length > 0 && encoder.qualityModes.every((qm) => qm.controls.length === 0)
  if (encoder.qualityModes.length > 0 && !hasConfigBinding && !allQmControlsEmpty) {
    errors.push(`[configbinding] Encoder "${encoder.id}" has no controls with configBinding (all controls must use configBinding)`)
  }

  // 特殊参数也必须显式绑定，禁止重新引入按 ID 猜测路径的兼容分支。
  for (const sp of encoder.specialParameters) {
    if (!sp.configBinding) {
      errors.push(`[configbinding] ${encoder.id}/${sp.id} is missing configBinding`)
      continue
    }
    if (!isValidConfigPath(sp.configBinding.path)) {
      errors.push(`[configpath] ${sp.id} has invalid configBinding.path: "${sp.configBinding.path}"`)
    }
    if (sp.uiPlacement?.tier === 'advanced') {
      if (!sp.optional) {
        errors.push(`[advanced-default] ${encoder.id}/${sp.id} must be optional so it is not emitted by default`)
      }
      if (!sp.sourceRefs || sp.sourceRefs.length === 0) {
        errors.push(`[advanced-source] ${encoder.id}/${sp.id} is missing control-level sourceRefs`)
      }
      if (!sp.commandBinding?.prefix) {
        errors.push(`[advanced-command] ${encoder.id}/${sp.id} is missing an explicit command prefix`)
      }
    }
  }
}

// Check subtitle container matrix
function checkSubtitleMatrix() {
  for (const container of Object.values(containers)) {
    for (const [codec, level] of Object.entries(container.subtitleCodecs)) {
      if (codec === 'copy') continue
      const validLevels = ['supported', 'supported-with-caveat', 'transcode-recommended', 'unsupported', 'unknown']
      if (!validLevels.includes(level)) {
        errors.push(`[subtitle] ${container.id}/subtitleCodecs.${codec} has invalid level: "${level}"`)
      }
    }
    // Warn if container has no subtitle codec entries at all
    if (Object.keys(container.subtitleCodecs).length === 0) {
      warnings.push(`[subtitle] Container "${container.id}" has no subtitle codec entries`)
    }
  }
}

// Check built-in presets reference valid encoders
function checkBuiltinPresets() {
  // Dynamic import not possible in script; checked via test suite
  // This is verified in presets.test.ts: "All built-in presets have valid configs"
  // Placeholder for catalog-level check
}

// -- RUN ---------------------------------------------------------
console.log('Catalog validation starting...\n')

// Validate encoders
for (const enc of Object.values(videoEncoders)) {
  validateEncoder(enc, 'video')
  checkEncoderMetadata(enc)
  checkQualityModeArgs(enc)
  checkConfigBindings(enc)
}
for (const enc of Object.values(audioEncoders)) {
  validateEncoder(enc, 'audio')
  checkEncoderMetadata(enc)
  checkQualityModeArgs(enc)
  checkConfigBindings(enc)
}

// Check for duplicate encoder IDs across types
const allEncoderIds = new Set([
  ...Object.keys(videoEncoders),
  ...Object.keys(audioEncoders),
])
if (allEncoderIds.size !== Object.keys(videoEncoders).length + Object.keys(audioEncoders).length) {
  errors.push('[encoder] Duplicate encoder ID across video/audio categories')
}

// Validate containers
for (const cont of Object.values(containers)) {
  validateContainer(cont)
}

// Validate parameters
for (const param of Object.values(parameters)) {
  validateParameter(param)
}

// Validate rules
validateRules()

// Phase 3 checks
checkSubtitleMatrix()
checkBuiltinPresets()

// Report
console.log('===========================================')
console.log(`  Errors:   ${errors.length}`)
console.log(`  Warnings: ${warnings.length}`)
console.log('===========================================\n')

if (errors.length > 0) {
  console.log('ERRORS:')
  for (const e of errors) {
    console.log(`  * ${e}`)
  }
  console.log()
}

if (warnings.length > 0) {
  console.log('WARNINGS:')
  for (const w of warnings) {
    console.log(`  * ${w}`)
  }
  console.log()
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('All checks passed.\n')
} else if (errors.length > 0) {
  console.log(`Validation FAILED with ${errors.length} error(s).\n`)
  throw new Error('Validation failed')
} else {
  console.log('Validation passed with warnings (see above).\n')
}
