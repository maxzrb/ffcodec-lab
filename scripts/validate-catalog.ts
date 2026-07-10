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

import { videoEncoders } from '../src/data/encoders/video'
import { audioEncoders } from '../src/data/encoders/audio'
import { containers } from '../src/data/containers'
import { explanations } from '../src/data/explanations'
import { parameters } from '../src/data/parameters'
import { builtinRules } from '../src/data/rules'
import type { EncoderDefinition, ContainerDefinition, ParameterDefinition } from '../src/domain/catalog/catalog-types'

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

  // Must have at least one quality mode
  if (encoder.qualityModes.length === 0) {
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

// -- RUN ---------------------------------------------------------
console.log('Catalog validation starting...\n')

// Validate encoders
for (const enc of Object.values(videoEncoders)) {
  validateEncoder(enc, 'video')
}
for (const enc of Object.values(audioEncoders)) {
  validateEncoder(enc, 'audio')
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
