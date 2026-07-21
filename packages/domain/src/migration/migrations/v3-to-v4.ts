import type { MigrationStep } from '../migrate-config'

/** v3 → v4：旧色彩设置保持“仅写元数据”，因此迁移前后命令完全一致。 */
export const v3ToV4: MigrationStep = {
  fromVersion: 3,
  toVersion: 4,
  migrate(config) {
    const video = (config.video as Record<string, unknown> | undefined) ?? {}
    const color = (video.color as Record<string, unknown> | undefined) ?? {}
    return {
      config: {
        ...config,
        schemaVersion: 4,
        video: {
          ...video,
          color: {
            operation: 'metadata-only',
            filter: 'zscale',
            toneMap: 'none',
            ...color,
          },
        },
      },
      warnings: [],
    }
  },
}
