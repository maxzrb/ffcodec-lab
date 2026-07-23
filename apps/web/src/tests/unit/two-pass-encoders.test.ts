import { describe, expect, it } from 'vitest'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { flattenInvocation } from '@ffcodec/domain/command/argument-order'
import { buildCommandPlan } from '@ffcodec/domain/command/command-builder'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { calculateTargetSize } from '@ffcodec/domain/tools/target-size'
import { renderBash } from '@ffcodec/domain/shell/bash-renderer'
import { renderCmd } from '@ffcodec/domain/shell/cmd-renderer'
import { renderPowerShell } from '@ffcodec/domain/shell/powershell-renderer'

const catalog = loadCatalog()
const TWO_PASS_ENCODERS = [
  'libaom_av1',
  'libsvtav1',
  'libvvenc',
  'mpeg2video',
  'mpeg4',
  'libvpx-vp9',
  'libvpx',
] as const

function configFor(encoderId: (typeof TWO_PASS_ENCODERS)[number]) {
  const config = createDefaultProjectConfig()
  config.input.path = 'F:\\素材库\\输入 文件.mkv'
  config.output.path = 'F:\\输出目录\\双遍 结果.mkv'
  config.output.containerId = 'mkv'
  config.video.encoderId = encoderId
  config.video.rateControl = { mode: 'twoPass', bitrate: '2500k', additionalValues: {} }
  return config
}

describe('已验证传统 passlog 二遍编码器', () => {
  it.each(TWO_PASS_ENCODERS)('%s 暴露 twoPass 能力和质量模式', (encoderId) => {
    const encoder = catalog.encoders.video[encoderId]
    expect(encoder, encoderId).toBeDefined()
    expect(encoder.capabilities.supportsTwoPass, encoderId).toBe(true)
    expect(encoder.qualityModes.some((mode) => mode.id === 'twoPass'), encoderId).toBe(true)
  })

  it.each(TWO_PASS_ENCODERS)('%s 生成参数顺序正确的两次调用', (encoderId) => {
    const config = configFor(encoderId)
    const plan = buildCommandPlan(config, catalog, [])
    expect(plan.invocations).toHaveLength(2)

    for (const [index, invocation] of plan.invocations.entries()) {
      const args = flattenInvocation(invocation).slice(1).map((token) => token.text)
      const inputIndex = args.indexOf('-i')
      const passIndex = args.indexOf('-pass')
      const passLogIndex = args.indexOf('-passlogfile')
      expect(passIndex, `${encoderId} pass ${index + 1}`).toBeGreaterThan(inputIndex)
      expect(passLogIndex, `${encoderId} pass ${index + 1}`).toBeGreaterThan(inputIndex)
      expect(args[passIndex + 1]).toBe(String(index + 1))
      expect(args[passLogIndex + 1]).toBe('F:\\输出目录\\双遍 结果.mkv.ffcodec-pass')
      expect(invocation.output.path).toBe(index === 0 ? '-' : config.output.path)
    }
  })

  it.each(TWO_PASS_ENCODERS)('%s 在三种 Shell 中不输出裸 ffmpeg2pass', (encoderId) => {
    const plan = buildCommandPlan(configFor(encoderId), catalog, [])
    for (const rendered of [renderBash(plan), renderPowerShell(plan), renderCmd(plan)]) {
      expect(rendered.text).not.toContain('ffmpeg2pass')
      expect(rendered.text).toContain('双遍 结果.mkv.ffcodec-pass')
    }
  })

  it.each(TWO_PASS_ENCODERS)('%s 可用于目标大小计算且不误报二遍能力错误', (encoderId) => {
    const config = configFor(encoderId)
    config.tools.targetSize.enabled = true
    const result = calculateTargetSize(config, catalog)
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).not.toContain(
      'error.targetSize.encoder.requiresTwoPass',
    )
    expect(result.videoBitrateKbps).toBeDefined()
  })
})
