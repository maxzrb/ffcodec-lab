import type { MigrationStep } from '../migrate-config'

/** v4 → v5：新增自定义元数据（默认禁用），迁移后命令不变。 */
export const v4ToV5: MigrationStep = {
  fromVersion: 4,
  toVersion: 5,
  migrate(config) {
    return {
      config: {
        ...config,
        schemaVersion: 5,
        output: {
          ...(config.output as Record<string, unknown> ?? {}),
          metadata: {
            globalRaw: '',
            streamRaw: '',
          },
        },
      },
      warnings: [],
    }
  },
}
