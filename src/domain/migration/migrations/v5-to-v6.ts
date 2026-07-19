import type { MigrationStep } from '../migrate-config'

/** v5 → v6：新增默认关闭的目标文件大小工具，迁移后命令完全不变。 */
export const v5ToV6: MigrationStep = {
  fromVersion: 5,
  toVersion: 6,
  migrate(config) {
    return {
      config: {
        ...config,
        schemaVersion: 6,
        tools: {
          targetSize: {
            enabled: false,
            targetMiB: 700,
            durationMinutes: 90,
            overheadPercent: 3,
          },
        },
      },
      warnings: [],
    }
  },
}
