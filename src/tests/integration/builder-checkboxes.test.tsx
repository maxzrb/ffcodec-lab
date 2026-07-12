// ============================================================
// builder-checkboxes.test.tsx — v0.4.1 热修复
// 正式 BuilderPage 复选框交互集成测试。
// 这些用例在修复前必须失败，用于证明缺陷可以稳定复现。
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BuilderPage } from '../../pages/builder/BuilderPage'
import { useBuilderStore } from '../../store'
import { createDefaultProjectConfig } from '../../domain/config/defaults'
import type { ProjectConfig } from '../../domain/config/project-config'

/** 创建指定视频编码器并展开相关区域的测试配置。 */
function makeConfig(encoderId: string): ProjectConfig {
  const config = createDefaultProjectConfig()
  config.video.mode = 'encode'
  config.video.encoderId = encoderId
  // 按编码器设置可用的默认码率控制模式。
  if (encoderId === 'h264_nvenc' || encoderId === 'hevc_nvenc') {
    config.video.rateControl = {
      mode: 'nvenc-cq',
      qualityValue: 23,
      additionalValues: {},
    }
  } else if (encoderId === 'h264_qsv' || encoderId === 'hevc_qsv') {
    config.video.rateControl = {
      mode: 'qsv-cqp',
      qualityValue: 23,
      additionalValues: {},
    }
  }
  config.video.specialParameters = {}
  return config
}

function makeAudioConfig(encoderId: string): ProjectConfig {
  const config = createDefaultProjectConfig()
  config.audio.mode = 'encode'
  config.audio.encoderId = encoderId
  config.audio.qualityValues = {}
  return config
}

/** 将状态仓库重置为可预测的测试状态。 */
function presetStore(config: ProjectConfig) {
  useBuilderStore.setState({
    config,
    expandedSections: {
      'section.input': false,
      'section.video': true,
      'section.frame': false,
      'section.audio': true,
      'section.subtitle': false,
      'section.container': false,
    },
    selectedExplanationId: null,
    encoderSessionCache: {},
  })
}

describe('BuilderPage Checkbox Interaction (v0.4.1 hotfix)', () => {
  beforeEach(() => {
    window.localStorage.removeItem('ffcodec-theme')
    window.localStorage.removeItem('ffcodec-locale')
    // 每条用例结束后恢复默认状态。
    useBuilderStore.setState({
      config: createDefaultProjectConfig(),
      expandedSections: {
        'section.input': false,
        'section.video': true,
        'section.frame': false,
        'section.audio': true,
        'section.subtitle': false,
        'section.container': false,
      },
      selectedExplanationId: null,
      encoderSessionCache: {},
    })
  })

  // -- 用例 1：NVENC 空间 AQ 复选框 --
  it('NVENC spatial AQ checkbox toggles and persists in ProjectConfig', async () => {
    presetStore(makeConfig('h264_nvenc'))
    render(<BuilderPage />)

    // 通过稳定字段 ID 查找空间 AQ 复选框。
    let checkbox: HTMLInputElement | null = null

    await waitFor(() => {
      const container = document.querySelector('[data-field-id="h264_nvenc.spatialaq"]')
      expect(container).not.toBeNull()
      const cb = container!.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(cb).not.toBeNull()
      checkbox = cb
    }, { timeout: 3000 })

    // 默认值为 1，因此初始状态应为选中。
    expect(checkbox!.checked).toBe(true)

    // 点击后取消选中。
    await userEvent.click(checkbox!)

    // 先验证 DOM 状态已变化。
    await waitFor(() => {
      expect(checkbox!.checked).toBe(false)
    }, { timeout: 2000 })

    // 再验证 ProjectConfig 已同步；修复前 applyFieldChange 会拒绝此变更。
    const config = useBuilderStore.getState().config
    const sp = config.video.specialParameters
    // 修复后应写入 spatialAq；修复前该对象始终为空。
    const hasSpatialAq = ('spatialAq' in sp) || ('h264_nvenc.spatialaq' in sp)
    expect(hasSpatialAq).toBe(true)
    // 验证实际值为 false。
    const value = sp['spatialAq'] ?? sp['h264_nvenc.spatialaq']
    expect(value).toBe(false)

    // 再次点击，验证操作可逆。
    await userEvent.click(checkbox!)
    await waitFor(() => {
      expect(checkbox!.checked).toBe(true)
    }, { timeout: 2000 })

    const config2 = useBuilderStore.getState().config
    const sp2 = config2.video.specialParameters
    const recheckedValue = sp2['spatialAq'] ?? sp2['h264_nvenc.spatialaq']
    expect(recheckedValue).toBe(true)
  })

  // -- 用例 2：默认未选中的 NVENC 时间 AQ 复选框 --
  it('NVENC temporal AQ checkbox toggles from unchecked (defaultValue=0)', async () => {
    presetStore(makeConfig('h264_nvenc'))
    render(<BuilderPage />)

    let checkbox: HTMLInputElement | null = null

    await waitFor(() => {
      const container = document.querySelector('[data-field-id="h264_nvenc.temporalaq"]')
      expect(container).not.toBeNull()
      const cb = container!.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(cb).not.toBeNull()
      checkbox = cb
    }, { timeout: 3000 })

    // 默认值为 0。
    expect(checkbox!.checked).toBe(false)

    // 点击后启用。
    await userEvent.click(checkbox!)
    await waitFor(() => {
      expect(checkbox!.checked).toBe(true)
    }, { timeout: 2000 })

    const config = useBuilderStore.getState().config
    const sp = config.video.specialParameters
    const hasValue = ('temporalAq' in sp) || ('h264_nvenc.temporalaq' in sp)
    expect(hasValue).toBe(true)
    const value = sp['temporalAq'] ?? sp['h264_nvenc.temporalaq']
    expect(value).toBe(true)
  })

  // -- 用例 3：QSV 低功耗复选框 --
  it('QSV low power checkbox toggles and persists', async () => {
    presetStore(makeConfig('h264_qsv'))
    render(<BuilderPage />)

    let checkbox: HTMLInputElement | null = null

    await waitFor(() => {
      const container = document.querySelector('[data-field-id="h264_qsv.lowpower"]')
      expect(container).not.toBeNull()
      const cb = container!.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(cb).not.toBeNull()
      checkbox = cb
    }, { timeout: 3000 })

    // 默认值为 0。
    expect(checkbox!.checked).toBe(false)

    // 点击后启用。
    await userEvent.click(checkbox!)
    await waitFor(() => {
      expect(checkbox!.checked).toBe(true)
    }, { timeout: 2000 })

    const config = useBuilderStore.getState().config
    const sp = config.video.specialParameters
    const hasValue = ('lowPower' in sp) || ('h264_qsv.lowpower' in sp)
    expect(hasValue).toBe(true)
    const value = sp['lowPower'] ?? sp['h264_qsv.lowpower']
    expect(value).toBe(true)
  })

  // -- 用例 4：HEVC NVENC 空间 AQ 复选框 --
  it('HEVC NVENC spatial AQ checkbox toggles and persists', async () => {
    presetStore(makeConfig('hevc_nvenc'))
    render(<BuilderPage />)

    let checkbox: HTMLInputElement | null = null

    await waitFor(() => {
      const container = document.querySelector('[data-field-id="hevc_nvenc.spatialaq"]')
      expect(container).not.toBeNull()
      const cb = container!.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(cb).not.toBeNull()
      checkbox = cb
    }, { timeout: 3000 })

    expect(checkbox!.checked).toBe(true) // 默认值为 1。

    await userEvent.click(checkbox!)
    await waitFor(() => {
      expect(checkbox!.checked).toBe(false)
    }, { timeout: 2000 })

    const config = useBuilderStore.getState().config
    const sp = config.video.specialParameters
    const hasValue = ('spatialAq' in sp) || ('hevc_nvenc.spatialaq' in sp)
    expect(hasValue).toBe(true)
    const value = sp['spatialAq'] ?? sp['hevc_nvenc.spatialaq']
    expect(value).toBe(false)
  })

  // -- 用例 5：libopus VBR 音频特殊参数复选框 --
  it('libopus VBR checkbox (audio specialParameter) toggles and persists', async () => {
    presetStore(makeAudioConfig('libopus'))
    render(<BuilderPage />)

    let checkbox: HTMLInputElement | null = null

    await waitFor(() => {
      const container = document.querySelector('[data-field-id="libopus.vbr"]')
      expect(container).not.toBeNull()
      const cb = container!.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(cb).not.toBeNull()
      checkbox = cb
    }, { timeout: 3000 })

    // libopus VBR 默认值为 on，因此初始状态应为选中。
    expect(checkbox!.checked).toBe(true)

    // 点击后取消选中。
    await userEvent.click(checkbox!)
    await waitFor(() => {
      expect(checkbox!.checked).toBe(false)
    }, { timeout: 2000 })

    // 验证状态仓库同步。
    const config = useBuilderStore.getState().config
    const qv = config.audio.qualityValues
    expect(qv['vbr']).toBe(false)

    // 再次点击，验证操作可逆。
    await userEvent.click(checkbox!)
    await waitFor(() => {
      expect(checkbox!.checked).toBe(true)
    }, { timeout: 2000 })
    expect(useBuilderStore.getState().config.audio.qualityValues['vbr']).toBe(true)
  })

  it('非必需的编码应用类型可以保持不设置或再次关闭', async () => {
    presetStore(makeAudioConfig('libopus'))
    render(<BuilderPage />)

    const application = screen.getByLabelText('编码应用类型')
    expect(application).toHaveValue('')
    expect(screen.getAllByRole('option', { name: '不设置（使用编码器默认）' }).length).toBeGreaterThan(0)

    await userEvent.selectOptions(application, 'voip')
    expect(useBuilderStore.getState().config.audio.qualityValues.application).toBe('voip')

    await userEvent.selectOptions(application, '')
    expect(useBuilderStore.getState().config.audio.qualityValues.application).toBe('')
  })

  // -- 用例 6：普通 output.overwrite 复选框回归测试 --
  // 用于确认原缺陷只影响特殊参数，而非所有复选框。
  it('output.overwrite checkbox (non-specialParameter) toggles correctly', async () => {
    // 展开输入区域以显示覆盖开关。
    useBuilderStore.setState({
      expandedSections: {
        'section.input': true,
        'section.video': true,
        'section.frame': false,
        'section.audio': true,
        'section.subtitle': false,
        'section.container': false,
      },
    })
    render(<BuilderPage />)

    let checkbox: HTMLInputElement | null = null

    await waitFor(() => {
      const container = document.querySelector('[data-field-id="output.overwrite"]')
      expect(container).not.toBeNull()
      const cb = container!.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(cb).not.toBeNull()
      checkbox = cb
    }, { timeout: 3000 })

    expect(checkbox!.checked).toBe(false)

    await userEvent.click(checkbox!)
    await waitFor(() => {
      expect(checkbox!.checked).toBe(true)
    }, { timeout: 2000 })

    // 该字段原本已有 configBinding，状态应正常同步。
    const config = useBuilderStore.getState().config
    expect(config.output.overwrite).toBe(true)

    // 验证操作可逆。
    await userEvent.click(checkbox!)
    await waitFor(() => {
      expect(checkbox!.checked).toBe(false)
    }, { timeout: 2000 })
    expect(useBuilderStore.getState().config.output.overwrite).toBe(false)
  })

  it('字幕轨道可从正式页面添加和删除', async () => {
    useBuilderStore.setState({
      expandedSections: {
        'section.input': false,
        'section.video': false,
        'section.frame': false,
        'section.audio': false,
        'section.subtitle': true,
        'section.container': false,
      },
    })
    render(<BuilderPage />)

    await userEvent.click(await screen.findByRole('button', { name: '添加轨道' }))
    expect(useBuilderStore.getState().config.subtitle.tracks).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: '删除轨道' }))
    expect(useBuilderStore.getState().config.subtitle.tracks).toHaveLength(0)
  })

  it('正式页面切换编码器会清理旧编码器特殊参数', async () => {
    const config = makeConfig('h264_nvenc')
    config.video.specialParameters = { spatialAq: true, temporalAq: true }
    presetStore(config)
    render(<BuilderPage />)

    const encoderSelect = await screen.findByLabelText('视频编码器')
    await userEvent.selectOptions(encoderSelect, 'h264_amf')

    await waitFor(() => {
      expect(useBuilderStore.getState().config.video.encoderId).toBe('h264_amf')
      expect(useBuilderStore.getState().config.video.specialParameters).toEqual({})
      expect(useBuilderStore.getState().config.video.rateControl?.mode).toBe('vbr')
    })
  })

  it('输入自定义参数不会导致页面消失，并按行保存 token', async () => {
    useBuilderStore.setState({
      expandedSections: {
        'section.input': false,
        'section.video': false,
        'section.frame': false,
        'section.audio': false,
        'section.subtitle': false,
        'section.container': false,
        'section.customArgs': true,
      },
    })
    render(<BuilderPage />)

    const textarea = await screen.findByLabelText('全局参数')
    await userEvent.type(textarea, '-benchmark')

    expect(screen.getByRole('heading', { name: 'FFmpeg 命令生成器' })).toBeInTheDocument()
    expect(useBuilderStore.getState().config.customArgs.globalArgs).toEqual(['-benchmark'])
  })

  it('默认使用亮色主题，并可切换暗色主题', async () => {
    render(<BuilderPage />)

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('light'))
    await userEvent.click(screen.getByRole('button', { name: '切换到暗色模式' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('ffcodec-theme')).toBe('dark')
  })

  it('全局中/EN开关会翻译工作台并持久化语言', async () => {
    render(<BuilderPage />)

    expect(screen.getByRole('heading', { name: 'FFmpeg 命令生成器' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Switch to English' }))

    expect(screen.getByRole('heading', { name: 'FFmpeg Command Builder' })).toBeInTheDocument()
    expect(screen.getByLabelText('Video encoder')).toBeInTheDocument()
    expect(screen.getByLabelText('Command preview')).toBeInTheDocument()
    expect(window.localStorage.getItem('ffcodec-locale')).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    const multilingualTitle = document.querySelector('[data-multilingual-title]')?.textContent ?? ''
    const englishPageText = (document.body.textContent ?? '').replace(multilingualTitle, '').replace('中', '')
    expect(englishPageText).not.toMatch(/[\u4e00-\u9fff]/)
  })

  it('标题区展示六种语言的 FFmpeg 命令生成器译名', () => {
    render(<BuilderPage />)
    const title = document.querySelector('[data-multilingual-title]')
    expect(title).toHaveTextContent('FFmpeg 指令產生器')
    expect(title).toHaveTextContent('FFmpeg Command Generator')
    expect(title).toHaveTextContent('FFmpeg コマンド生成ツール')
    expect(title).toHaveTextContent('FFmpeg 명령어 생성기')
    expect(title).toHaveTextContent('Генератор команд FFmpeg')
    expect(title).toHaveTextContent('FFmpeg Komut Oluşturucu')
    expect(document.body).not.toHaveTextContent('组合编码、画面、音频与字幕参数')
  })

  it('自由编辑栏允许修改命令、保留手工内容并恢复生成命令', async () => {
    render(<BuilderPage />)
    const editor = screen.getByLabelText('可自由编辑的 FFmpeg 命令')
    expect((editor as HTMLTextAreaElement).value).toContain('ffmpeg')

    await userEvent.clear(editor)
    await userEvent.type(editor, 'ffmpeg -i custom.mkv -c copy custom.mp4')
    expect(editor).toHaveValue('ffmpeg -i custom.mkv -c copy custom.mp4')
    expect(screen.getByText('已脱离自动同步')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '恢复生成命令' }))
    expect((editor as HTMLTextAreaElement).value).toContain('input.mkv')
  })

  it('音频码率使用数值输入和后置单位选择', async () => {
    presetStore(makeAudioConfig('aac'))
    render(<BuilderPage />)

    const amount = screen.getByLabelText('音频码率 (-b:a)')
    const unit = screen.getByLabelText('音频码率 (-b:a)单位')
    expect(amount).toHaveAttribute('type', 'number')
    expect(amount).toHaveValue(192)
    expect(unit).toHaveValue('k')

    await userEvent.clear(amount)
    await userEvent.type(amount, '256')
    await userEvent.selectOptions(unit, 'M')

    expect(useBuilderStore.getState().config.audio.bitrate).toBe('256M')
  })

  it('参数说明不显示内部数据来源，并提供有决策价值的编码器介绍', async () => {
    render(<BuilderPage />)

    await userEvent.click(screen.getByRole('button', { name: '查看视频编码器说明' }))

    expect(screen.getByText(/编码器决定输出视频格式、压缩效率、处理速度/)).toBeInTheDocument()
    // 解释面板不暴露内部数据来源元数据
    expect(screen.queryByText('数据来源：')).not.toBeInTheDocument()
    // 页脚致谢链接是公开署名，不属于"解释面板内部来源"
  })

  it('warning显示可读建议并跟随全局语言切换', async () => {
    const config = createDefaultProjectConfig()
    config.subtitle.tracks = [{
      id: 'unknown-subtitle',
      source: 'input',
      mainStreamRelIndex: 0,
      codecMode: 'copy',
      sourceCodecKnown: false,
      disposition: {},
    }]
    presetStore(config)
    render(<BuilderPage />)

    expect(await screen.findByText('无法确认字幕复制后的容器兼容性')).toBeInTheDocument()
    expect(screen.getByText(/先用 ffprobe 确认字幕编码/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Switch to English' }))
    expect(screen.getByText('Subtitle copy compatibility cannot be confirmed')).toBeInTheDocument()
    expect(screen.getByText(/Inspect the source with ffprobe/)).toBeInTheDocument()
  })

  it('默认显示 PowerShell 单行命令且不显示来源核验提示', async () => {
    render(<BuilderPage />)

    expect(useBuilderStore.getState().config.shell).toBe('powershell')
    expect(screen.getByRole('button', { name: 'PowerShell' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '单行' })).toHaveAttribute('aria-pressed', 'false')
    expect(document.querySelector('.param-field__verification')).toBeNull()
  })

  it('切换输出容器会同步输出文件扩展名', async () => {
    useBuilderStore.setState({
      expandedSections: {
        'section.input': true,
        'section.video': false,
        'section.frame': false,
        'section.audio': false,
        'section.subtitle': false,
        'section.container': true,
        'section.customArgs': false,
      },
    })
    render(<BuilderPage />)

    await userEvent.selectOptions(screen.getByLabelText('输出容器'), 'mkv')

    await waitFor(() => {
      expect(useBuilderStore.getState().config.output.containerId).toBe('mkv')
      expect(useBuilderStore.getState().config.output.path).toBe('output.mkv')
      expect(screen.getByLabelText('输出文件路径')).toHaveValue('output.mkv')
    })
  })

  it('视频、音频和字幕流索引支持分别多选', async () => {
    useBuilderStore.setState({
      expandedSections: {
        'section.input': true,
        'section.video': false,
        'section.frame': false,
        'section.audio': false,
        'section.subtitle': false,
        'section.container': false,
        'section.customArgs': false,
      },
    })
    // 关闭"保留全部字幕流"以启用字幕多选复选框
    const store = useBuilderStore.getState()
    store.setConfigValue('streams.preserveOtherSubtitleStreams', false)
    render(<BuilderPage />)

    const videoField = document.querySelector('[data-field-id="streams.videoStreamIndexes"]')!
    const audioField = document.querySelector('[data-field-id="streams.audioStreamIndexes"]')!
    const subtitleField = document.querySelector('[data-field-id="streams.subtitleStreamIndexes"]')!
    const videoOptions = videoField.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    const audioOptions = audioField.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    const subtitleOptions = subtitleField.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')

    await userEvent.click(videoOptions[2])
    await userEvent.click(audioOptions[1])
    await userEvent.click(subtitleOptions[3])

    expect(useBuilderStore.getState().config.streams.videoStreamIndexes).toEqual([0, 2])
    expect(useBuilderStore.getState().config.streams.audioStreamIndexes).toEqual([0, 1])
    expect(useBuilderStore.getState().config.streams.subtitleStreamIndexes).toEqual([0, 3])
  })
})
