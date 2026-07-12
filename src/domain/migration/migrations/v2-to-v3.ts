import type { MigrationStep } from '../migrate-config'

/** v2 → v3：补充高级色彩、降噪和去色带结构，不启用任何新参数。 */
export const v2ToV3: MigrationStep = {
  fromVersion: 2,
  toVersion: 3,
  migrate(config) {
    const video = (config.video as Record<string, unknown> | undefined) ?? {}
    const frame = (config.frame as Record<string, unknown> | undefined) ?? {}
    const filters = (frame.filters as Record<string, unknown> | undefined) ?? {}

    return {
      config: {
        ...config,
        schemaVersion: 3,
        video: { ...video, color: video.color ?? {} },
        frame: {
          ...frame,
          filters: {
            ...filters,
            denoise: filters.denoise ?? { enabled: false, values: {} },
            deband: filters.deband ?? { enabled: false, values: {} },
          },
        },
      },
      warnings: [],
    }
  },
}
