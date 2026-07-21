import { describe, it, expect } from 'vitest'
import { buildCommandPlan } from '../../domain/command/command-builder'
import { renderBash } from '../../domain/shell/bash-renderer'
import { renderPowerShell } from '../../domain/shell/powershell-renderer'
import { renderCmd } from '../../domain/shell/cmd-renderer'
import type { ProjectConfig } from '../../domain/config/project-config'
import { createDefaultProjectConfig } from '../../domain/config/defaults'
import { loadCatalog } from '../../domain/catalog/catalog-loader'

const catalog = loadCatalog()

function makeConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return { ...createDefaultProjectConfig(), ...overrides } as ProjectConfig
}

describe('Command AST — Invariants', () => {
  it('高级质量和色彩参数默认不发射，显式设置后才进入命令', () => {
    const config = makeConfig()
    let rendered = renderBash(buildCommandPlan(config, catalog, []))
    expect(rendered.text).not.toContain('-g ')
    expect(rendered.text).not.toContain('-qmin')
    expect(rendered.text).not.toContain('-color_primaries')

    config.video.specialParameters.gopSize = 240
    config.video.specialParameters.qmin = 8
    config.video.color = { space: 'bt2020nc', primaries: 'bt2020', transfer: 'smpte2084', range: 'tv' }
    rendered = renderBash(buildCommandPlan(config, catalog, []))
    expect(rendered.text).toContain('-g 240')
    expect(rendered.text).toContain('-qmin 8')
    expect(rendered.text).toContain('-colorspace bt2020nc')
    expect(rendered.text).toContain('-color_primaries bt2020')
    expect(rendered.text).toContain('-color_trc smpte2084')
    expect(rendered.text).toContain('-color_range tv')
  })

  it('视频复制模式忽略已保存的色彩和高级质量设置', () => {
    const config = makeConfig()
    config.video.mode = 'copy'
    config.video.color = { space: 'bt709', range: 'tv' }
    config.video.specialParameters.gopSize = 120
    const rendered = renderBash(buildCommandPlan(config, catalog, []))
    expect(rendered.text).not.toContain('-colorspace')
    expect(rendered.text).not.toContain('-g 120')
  })

  it('generates command for libx264 + CRF + AAC + MP4', () => {
    const config = makeConfig()
    const plan = buildCommandPlan(config, catalog, [])
    const rendered = renderBash(plan)

    expect(rendered.text).toContain('ffmpeg')
    expect(rendered.text).toContain('-c:v')
    expect(rendered.text).toContain('libx264')
    expect(rendered.text).toContain('-crf')
    expect(rendered.text).toContain('-c:a')
    expect(rendered.text).toContain('aac')
    expect(rendered.text).toContain('-b:a')
  })

  it('video copy does NOT generate video quality or filter params', () => {
    const config = makeConfig({
      video: { ...createDefaultProjectConfig().video, mode: 'copy' },
    })
    const plan = buildCommandPlan(config, catalog, [])
    const rendered = renderBash(plan)

    expect(rendered.text).toContain('-c:v copy')
    expect(rendered.text).not.toContain('-crf')
    expect(rendered.text).not.toContain('-vf')
  })

  it('-vn generates no video params', () => {
    const config = makeConfig({
      video: { ...createDefaultProjectConfig().video, mode: 'disabled' },
    })
    const plan = buildCommandPlan(config, catalog, [])
    const rendered = renderBash(plan)

    expect(rendered.text).toContain('-vn')
    expect(rendered.text).not.toContain('libx264')
    expect(rendered.text).not.toContain('-crf')
  })

  it('-an generates no audio params', () => {
    const config = makeConfig({
      audio: { ...createDefaultProjectConfig().audio, mode: 'disabled' },
    })
    const plan = buildCommandPlan(config, catalog, [])
    const rendered = renderBash(plan)

    expect(rendered.text).toContain('-an')
    expect(rendered.text).not.toContain('aac')
  })

  it('audio copy does not generate quality params', () => {
    const config = makeConfig({
      audio: { ...createDefaultProjectConfig().audio, mode: 'copy' },
    })
    const plan = buildCommandPlan(config, catalog, [])
    const rendered = renderBash(plan)

    expect(rendered.text).toContain('-c:a copy')
    expect(rendered.text).not.toContain('-b:a')
  })

  it('all generated args have originId', () => {
    const config = makeConfig()
    const plan = buildCommandPlan(config, catalog, [])

    for (const inv of plan.invocations) {
      for (const arg of [
        ...inv.globalArgs,
        ...inv.output.codecArgs,
        ...inv.output.qualityArgs,
        ...inv.output.filterArgs,
        ...inv.output.audioArgs,
        ...inv.output.subtitleArgs,
      ]) {
        expect(arg.originId).toBeTruthy()
      }
      for (const input of inv.inputs) {
        expect(input.originId).toBeTruthy()
      }
    }
  })

  it('at most one -vf is generated', () => {
    const config = makeConfig({
      frame: {
        resolution: { mode: 'size', width: 1280, height: 720, keepAspect: true },
        frameRate: { mode: 'value', value: 30 },
      },
    })
    const plan = buildCommandPlan(config, catalog, [])
    const rendered = renderBash(plan)

    const vfCount = (rendered.text.match(/-vf/g) ?? []).length
    expect(vfCount).toBeLessThanOrEqual(1)
  })

  it('Bash escapes paths with spaces', () => {
    const config = makeConfig({
      input: { ...createDefaultProjectConfig().input, path: 'my video.mp4' },
      output: { ...createDefaultProjectConfig().output, path: 'output file.mkv' },
    })
    const rendered = renderBash(buildCommandPlan(config, catalog, []))

    // Paths with spaces should be quoted
    expect(rendered.text).toMatch(/'.*my video\.mp4.*'/)
    expect(rendered.text).toMatch(/'.*output file\.mkv.*'/)
  })

  it('Bash quotes paths with Chinese characters and brackets', () => {
    const config = makeConfig({
      input: { ...createDefaultProjectConfig().input, path: 'F:\\演示片\\视频.mp4' },
      output: { ...createDefaultProjectConfig().output, path: 'output.mkv' },
    })
    const rendered = renderBash(buildCommandPlan(config, catalog, []))

    // Chinese paths must be quoted even without spaces
    expect(rendered.text).toContain("'F:\\演示片\\视频.mp4'")
  })

  it('Bash quotes paths with square brackets', () => {
    const config = makeConfig({
      input: { ...createDefaultProjectConfig().input, path: 'D:\\videos\\[test].mp4' },
      output: { ...createDefaultProjectConfig().output, path: 'output.mkv' },
    })
    const rendered = renderBash(buildCommandPlan(config, catalog, []))

    // Brackets are special in bash, must be quoted
    expect(rendered.text).toContain("'D:\\videos\\[test].mp4'")
  })

  it('PowerShell quotes non-ASCII paths', () => {
    const config = makeConfig({
      input: { ...createDefaultProjectConfig().input, path: 'E:\\素材\\风景.mp4' },
      output: { ...createDefaultProjectConfig().output, path: 'out.mkv' },
    })
    const plan = buildCommandPlan(config, catalog, [])
    const rendered = renderPowerShell(plan)

    expect(rendered.text).toContain('ffmpeg')
    expect(rendered.text).toContain('"E:\\素材\\风景.mp4"')
  })

  it('CMD quotes non-ASCII paths', () => {
    const config = makeConfig({
      input: { ...createDefaultProjectConfig().input, path: 'E:\\素材\\风景.mp4' },
      output: { ...createDefaultProjectConfig().output, path: 'out.mkv' },
    })
    const plan = buildCommandPlan(config, catalog, [])
    const rendered = renderCmd(plan)

    expect(rendered.text).toContain('ffmpeg')
    expect(rendered.text).toContain('"E:\\素材\\风景.mp4"')
  })

  it('PowerShell renderer works', () => {
    const config = makeConfig()
    const plan = buildCommandPlan(config, catalog, [])
    const rendered = renderPowerShell(plan)

    expect(rendered.text).toContain('ffmpeg')
    expect(rendered.text).toContain('libx264')
  })

  it('声道布局使用 FFmpeg 布局参数，跟随输入时不生成参数', () => {
    const config = makeConfig()
    config.audio.channelLayout = '5.1(side)'
    let rendered = renderPowerShell(buildCommandPlan(config, catalog, []))
    expect(rendered.text).toContain('-channel_layout:a')
    expect(rendered.text).toContain('5.1(side)')
    expect(rendered.text).not.toContain('-ac ')

    config.audio.channelLayout = 'source'
    rendered = renderPowerShell(buildCommandPlan(config, catalog, []))
    expect(rendered.text).not.toContain('-channel_layout:a')
  })

  it('CMD renderer works', () => {
    const config = makeConfig()
    const plan = buildCommandPlan(config, catalog, [])
    const rendered = renderCmd(plan)

    expect(rendered.text).toContain('ffmpeg')
    expect(rendered.text).toContain('libx264')
  })

  it('双遍第一遍只分析视频并写入 null，第二遍才写真实输出', () => {
    const config = makeConfig({
      video: {
        ...createDefaultProjectConfig().video,
        rateControl: { mode: 'twoPass', bitrate: '5000k', additionalValues: {} },
      },
    })
    const plan = buildCommandPlan(config, catalog, [])

    expect(plan.invocations.length).toBe(2)
    expect(plan.invocations[0].purpose).toBe('pass-1')
    expect(plan.invocations[1].purpose).toBe('pass-2')

    const pass1 = renderBash({ invocations: [plan.invocations[0]], messages: [] }).text
    const pass2 = renderBash({ invocations: [plan.invocations[1]], messages: [] }).text
    expect(pass1).toContain('-pass 1')
    expect(pass1).toContain('-an')
    expect(pass1).toContain('-sn')
    expect(pass1).toContain('-f null -')
    expect(pass1).not.toContain('-c:a')
    expect(pass1).not.toContain(config.output.path)
    expect(pass2).toContain('-pass 2')
    expect(pass2).toContain('-c:a aac')
    expect(pass2).toContain(config.output.path)
  })

  it('双遍命令在三种 Shell 中都只在第一遍成功后执行第二遍', () => {
    const config = makeConfig({
      video: {
        ...createDefaultProjectConfig().video,
        rateControl: { mode: 'twoPass', bitrate: '5000k', additionalValues: {} },
      },
    })
    const plan = buildCommandPlan(config, catalog, [])

    expect(renderBash(plan).text).toContain(' && ')
    expect(renderCmd(plan).text).toContain(' && ')
    const powerShell = renderPowerShell(plan).text
    expect(powerShell).toContain('if ($LASTEXITCODE -eq 0) {')
    expect(powerShell.endsWith(' }')).toBe(true)
  })
})
