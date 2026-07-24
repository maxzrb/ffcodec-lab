import type { MigrationStep } from '../migrate-config'

/** v6 → v7：新增默认不设置的主输入解码配置，迁移后命令完全不变。 */
export const v6ToV7: MigrationStep = {
  fromVersion: 6,
  toVersion: 7,
  migrate(config) {
    const input = config.input && typeof config.input === 'object'
      ? config.input as Record<string, unknown>
      : {}
    return {
      config: {
        ...config,
        schemaVersion: 7,
        input: { ...input, decode: {} },
      },
      warnings: [],
    }
  },
}
