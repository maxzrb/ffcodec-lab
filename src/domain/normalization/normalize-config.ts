import type { ProjectConfig, RateControlConfig } from '../config/project-config'
import type { Catalog } from '../catalog/catalog-types'
import type { NormalizationNotice } from '../rules/rule-types'

export interface NormalizationResult {
  config: ProjectConfig
  notices: NormalizationNotice[]
}

/**
 * Normalize a config transition (previous → next) against encoder capabilities.
 * Pure function — no side effects.
 *
 * Rules:
 * 1. If old quality mode is supported by new encoder, keep it.
 * 2. If not, use encoder's first quality mode default.
 * 3. If quality value is in new range, keep; otherwise use default.
 * 4. Same logic for preset, profile, tune, pixelFormat.
 * 5. Clear old encoder's special parameters.
 */
export function normalizeConfig(
  previous: ProjectConfig,
  next: ProjectConfig,
  catalog: Catalog
): NormalizationResult {
  const notices: NormalizationNotice[] = []
  let config = structuredClone(next)

  // Only normalize when video mode is 'encode' and encoder changed
  if (next.video.mode === 'encode' && next.video.encoderId) {
    const encoder = catalog.encoders.video[next.video.encoderId]
    if (!encoder) {
      notices.push({
        fieldId: 'video.encoderId',
        from: next.video.encoderId,
        to: '<unknown>',
        reason: `Encoder "${next.video.encoderId}" not found in catalog`,
      })
      return { config, notices }
    }

    // Normalize preset
    if (next.video.preset !== undefined && encoder.preset) {
      const validValues = encoder.preset.options?.map((o) => o.value) ?? []
      if (validValues.length > 0 && !validValues.includes(next.video.preset)) {
        const newVal = encoder.preset.defaultValue
        notices.push({
          fieldId: 'video.preset',
          from: next.video.preset,
          to: newVal,
          reason: `Preset "${next.video.preset}" not valid for ${encoder.id}; reset to default`,
        })
        config = { ...config, video: { ...config.video, preset: newVal as string | number } }
      }
    }

    // Normalize profile
    if (next.video.profile && next.video.profile !== 'auto' && encoder.profile) {
      const validValues = encoder.profile.options?.map((o) => o.value) ?? []
      if (validValues.length > 0 && !validValues.includes(next.video.profile)) {
        const newVal = encoder.profile.defaultValue
        notices.push({
          fieldId: 'video.profile',
          from: next.video.profile,
          to: newVal,
          reason: `Profile "${next.video.profile}" not valid for ${encoder.id}; reset to default`,
        })
        config = { ...config, video: { ...config.video, profile: newVal as string } }
      }
    }

    // Normalize tune
    if (next.video.tune && next.video.tune !== 'auto' && encoder.tune) {
      const validValues = encoder.tune.options?.map((o) => o.value) ?? []
      if (validValues.length > 0 && !validValues.includes(next.video.tune)) {
        const newVal = encoder.tune.defaultValue
        notices.push({
          fieldId: 'video.tune',
          from: next.video.tune,
          to: newVal,
          reason: `Tune "${next.video.tune}" not valid for ${encoder.id}; reset to default`,
        })
        config = { ...config, video: { ...config.video, tune: newVal as string } }
      }
    }

    // Normalize pixelFormat
    if (next.video.pixelFormat && next.video.pixelFormat !== 'auto' && encoder.pixelFormat) {
      const validValues = encoder.pixelFormat.options?.map((o) => o.value) ?? []
      if (validValues.length > 0 && !validValues.includes(next.video.pixelFormat)) {
        const newVal = encoder.pixelFormat.defaultValue
        notices.push({
          fieldId: 'video.pixelFormat',
          from: next.video.pixelFormat,
          to: newVal,
          reason: `Pixel format "${next.video.pixelFormat}" not valid for ${encoder.id}; reset to default`,
        })
        config = { ...config, video: { ...config.video, pixelFormat: newVal as string } }
      }
    }

    // Normalize rate control mode
    if (next.video.rateControl) {
      const validModes = encoder.qualityModes.map((m) => m.id)
      if (!validModes.includes(next.video.rateControl.mode)) {
        const defaultMode = encoder.qualityModes[0]
        if (defaultMode) {
          const defaultQc = defaultMode.controls[0]
          notices.push({
            fieldId: 'video.rateControl.mode',
            from: next.video.rateControl.mode,
            to: defaultMode.id,
            reason: `Rate control "${next.video.rateControl.mode}" not supported by ${encoder.id}; reset to ${defaultMode.id}`,
          })
          config = {
            ...config,
            video: {
              ...config.video,
              rateControl: {
                mode: defaultMode.id,
                qualityValue: (defaultQc?.defaultValue as number | undefined),
                additionalValues: {},
              },
            },
          }
        }
      } else {
        // Check if quality value is in range for the current mode
        const qMode = encoder.qualityModes.find((m) => m.id === next.video.rateControl!.mode)
        if (qMode && next.video.rateControl.qualityValue !== undefined) {
          const qControl = qMode.controls[0]
          if (qControl?.range) {
            const { min = 0, max = 100 } = qControl.range
            const qv = next.video.rateControl.qualityValue
            if (qv < min || qv > max) {
              const newVal = qControl.defaultValue as number | undefined
              notices.push({
                fieldId: 'video.rateControl.qualityValue',
                from: qv,
                to: newVal,
                reason: `Quality value ${qv} out of range [${min}, ${max}] for ${encoder.id}/${qMode.id}; reset to default`,
              })
              config = {
                ...config,
                video: {
                  ...config.video,
                  rateControl: {
                    ...config.video.rateControl,
                    qualityValue: newVal,
                  } as RateControlConfig,
                },
              }
            }
          }
        }
      }
    }

    // Clear special parameters from previous encoder
    if (previous.video.encoderId && previous.video.encoderId !== next.video.encoderId) {
      config = {
        ...config,
        video: {
          ...config.video,
          specialParameters: {},
        },
      }
      notices.push({
        fieldId: 'video.specialParameters',
        from: previous.video.specialParameters,
        to: {},
        reason: `Cleared special parameters from previous encoder "${previous.video.encoderId}"`,
      })
    }
  }

  return { config, notices }
}
