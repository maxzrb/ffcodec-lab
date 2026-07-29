import type { MigrationStep } from '../migrate-config'

/** v7 → v8：旧配置保持原有 FFmpeg 自动协商，新项目由默认值启用自动高精度。 */
export const v7ToV8: MigrationStep = {
  fromVersion: 7,
  toVersion: 8,
  migrate(config) {
    const frame = config.frame && typeof config.frame === 'object'
      ? config.frame as Record<string, unknown>
      : {}
    const filters = frame.filters && typeof frame.filters === 'object'
      ? frame.filters as Record<string, unknown>
      : {}
    return {
      config: {
        ...config,
        schemaVersion: 8,
        frame: {
          ...frame,
          filters: {
            ...filters,
            processing: {
              mode: 'compatible',
              bitDepth: 'preserve',
              chroma: 'preserve',
              colorFamily: 'preserve',
              preserveAlpha: true,
              dither: 'auto',
              incompatiblePolicy: 'block',
            },
          },
        },
      },
      warnings: [],
    }
  },
}
