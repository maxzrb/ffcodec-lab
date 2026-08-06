import { describe, expect, it } from 'vitest'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { RuleIndex } from '@ffcodec/catalog/rule-index'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { ALL_MIGRATION_STEPS, CURRENT_SCHEMA_VERSION } from '@ffcodec/domain/migration/migration-registry'
import { migrateConfig } from '@ffcodec/domain/migration/migrate-config'
import { renderBash } from '@ffcodec/domain/shell/bash-renderer'
import { validateConfig } from '@ffcodec/domain/validation/validate-config'
import { decodeConfigFromShare, encodeConfigToShare } from '@ffcodec/workbench/features/sharing/share-codec'

const catalog = loadCatalog()
const rules = new RuleIndex()

function commandFor(config = createDefaultProjectConfig()): string {
  return renderBash(buildCommandPlan(config, catalog, [])).text
}

describe('主输入解码设置', () => {
  it('默认配置不发射任何解码覆盖参数', () => {
    const command = commandFor()

    expect(command).not.toContain('-hwaccel')
    expect(command).not.toContain('-threads')
    expect(command).not.toContain('-init_hw_device')
    expect(command).not.toContain('-qsv_device')
  })

  it('把输入选项放在主输入前，并保留文本形式的设备值', () => {
    const config = createDefaultProjectConfig()
    config.input.decode = {
      hwaccel: 'cuda',
      threads: 4,
      outputFormat: 'nv12',
      device: { parameter: 'hwaccel_device', value: 'GPU 1' },
    }

    const command = commandFor(config)
    const inputIndex = command.indexOf('-i input.mkv')

    expect(command).toContain("-hwaccel_device 'GPU 1'")
    for (const option of ['-hwaccel cuda', '-threads 4', '-hwaccel_output_format nv12', '-hwaccel_device']) {
      expect(command.indexOf(option)).toBeGreaterThan(-1)
      expect(command.indexOf(option)).toBeLessThan(inputIndex)
    }
  })

  it('把设备初始化选项放在全局区，而不是输入选项区', () => {
    const initConfig = createDefaultProjectConfig()
    initConfig.input.decode.device = { parameter: 'init_hw_device', value: 'cuda=gpu:0' }
    const initPlan = buildCommandPlan(initConfig, catalog, [])
    expect(initPlan.invocations[0].globalArgs.flatMap((arg) => arg.tokens))
      .toEqual(expect.arrayContaining(['-init_hw_device', 'cuda=gpu:0']))
    expect(initPlan.invocations[0].inputs[0].argsBeforeInput.flatMap((arg) => arg.tokens))
      .not.toContain('-init_hw_device')

    const qsvConfig = createDefaultProjectConfig()
    qsvConfig.input.decode.device = { parameter: 'qsv_device', value: '/dev/dri/renderD128' }
    const qsvPlan = buildCommandPlan(qsvConfig, catalog, [])
    expect(qsvPlan.invocations[0].globalArgs.flatMap((arg) => arg.tokens))
      .toEqual(expect.arrayContaining(['-qsv_device', '/dev/dri/renderD128']))
  })

  it('复制或禁用视频时不发射已保存的解码设置', () => {
    for (const mode of ['copy', 'disabled'] as const) {
      const config = createDefaultProjectConfig()
      config.video.mode = mode
      config.input.decode = {
        hwaccel: 'cuda', threads: 2, outputFormat: 'd3d11',
        device: { parameter: 'hwaccel_device', value: '0' },
      }

      const command = commandFor(config)
      expect(command).not.toContain('-hwaccel')
      expect(command).not.toContain('-threads 2')
    }
  })

  it('双遍的两条命令复用同一组解码设置', () => {
    const config = createDefaultProjectConfig()
    config.video.rateControl = { mode: 'twoPass', bitrate: '5000k', additionalValues: {} }
    config.input.decode = { hwaccel: 'qsv', outputFormat: 'p010' }
    const plan = buildCommandPlan(config, catalog, [])

    expect(plan.invocations).toHaveLength(2)
    for (const invocation of plan.invocations) {
      const tokens = invocation.inputs[0].argsBeforeInput.flatMap((arg) => arg.tokens)
      expect(tokens).toEqual(expect.arrayContaining(['-hwaccel', 'qsv', '-hwaccel_output_format', 'p010']))
    }
  })

  it('产生硬件环境、格式、线程与设备组合的六类诊断', () => {
    const config = createDefaultProjectConfig()
    config.input.decode = {
      hwaccel: 'cuda',
      threads: 2,
      outputFormat: 'd3d11',
      device: { parameter: 'qsv_device', value: '' },
    }
    const codes = validateConfig(config, catalog, rules).map((diagnostic) => diagnostic.code)

    expect(codes).toEqual(expect.arrayContaining([
      'warn.decode.hwaccel.environment',
      'warn.decode.outputFormat.hardwareFrames',
      'info.decode.threads.hwaccel',
      'warn.decode.device.incomplete',
      'warn.decode.device.qsvMismatch',
    ]))

    const withoutHwaccel = createDefaultProjectConfig()
    withoutHwaccel.input.decode.outputFormat = 'nv12'
    expect(validateConfig(withoutHwaccel, catalog, rules).map((diagnostic) => diagnostic.code))
      .toContain('warn.decode.outputFormat.without.hwaccel')
  })

  it('分享配置保留解码设置，v6 迁移后保持默认命令不变', () => {
    const config = createDefaultProjectConfig()
    config.input.decode = {
      hwaccel: 'cuda', threads: 3, outputFormat: 'cuda',
      device: { parameter: 'hwaccel_device', value: '0' },
    }
    const decoded = decodeConfigFromShare(encodeConfigToShare(config).value)
    expect(decoded.success).toBe(true)
    expect(decoded.config?.input.decode).toEqual(config.input.decode)

    const legacy = createDefaultProjectConfig() as unknown as Record<string, unknown>
    legacy.schemaVersion = 6
    delete (legacy.input as Record<string, unknown>).decode
    const before = commandFor(createDefaultProjectConfig())
    const migrated = migrateConfig(6, CURRENT_SCHEMA_VERSION, legacy, [...ALL_MIGRATION_STEPS]).config
    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect((migrated.input as Record<string, unknown>).decode).toEqual({})
    expect(commandFor(migrated as unknown as ReturnType<typeof createDefaultProjectConfig>)).toBe(before)
  })
})
