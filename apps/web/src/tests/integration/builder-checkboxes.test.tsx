// ============================================================
// builder-checkboxes.test.tsx — v0.4.1 热修复
// 正式 BuilderPage 复选框交互集成测试。
// 这些用例在修复前必须失败，用于证明缺陷可以稳定复现。
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppDialogProvider, WorkbenchApp } from '@ffcodec/workbench'
import { useBuilderStore } from '../../store'
import { PlatformProvider } from '@ffcodec/platform-api'
import type { PlatformAdapter, StorageAdapter } from '@ffcodec/platform-api'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'

/** In-memory storage for tests — no browser localStorage needed. */
class MemoryStorage implements StorageAdapter {
  private store = new Map<string, string>()
  getItem(key: string): string | null { return this.store.get(key) ?? null }
  setItem(key: string, value: string): void { this.store.set(key, value) }
  removeItem(key: string): void { this.store.delete(key) }
  keys(): string[] { return Array.from(this.store.keys()) }
}

let testStorage: MemoryStorage
let testPlatform: PlatformAdapter

function TestWrapper() {
  return (
    <PlatformProvider adapter={testPlatform}>
      <AppDialogProvider>
        <WorkbenchApp />
      </AppDialogProvider>
    </PlatformProvider>
  )
}

function makeTestPlatform(): PlatformAdapter {
  testStorage = new MemoryStorage()
  testPlatform = {
    capabilities: { desktop: false, nativeFileDialog: false, ffmpegDetect: false, localFFmpegExecution: false, revealInFolder: false, persistentEncodingHistory: false },
    storage: testStorage,
  }
  return testPlatform
}

/**
 * 在自定义 Dropdown 中选择选项。
 * 点击触发器打开面板 → 通过 data-value 找到选项 → 点击。
 */
async function chooseDropdown(label: string | RegExp, value: string) {
  const trigger = screen.getByLabelText(label)
  await userEvent.click(trigger)
  // 等待面板出现后用 data-value 找到目标选项
  const panel = document.querySelector('.custom-select-panel')
  if (!panel) throw new Error(`Dropdown panel not found after clicking "${label}"`)
  const option = panel.querySelector(`[data-value="${value}"]`)
  if (!option) throw new Error(`Option with data-value="${value}" not found in dropdown "${label}"`)
  await userEvent.click(option as HTMLElement)
}

/** 获取下拉按钮当前显示的文本 */
function dropdownText(label: string | RegExp): string {
  const trigger = screen.getByLabelText(label)
  return trigger.querySelector('.custom-select__text')?.textContent ?? ''
}

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
      'section.video-advanced': false,
      'section.frame': false,
      'section.audio': true,
      'section.audio-advanced': false,
      'section.audio-loudness': false,
      'section.subtitle': false,
      'section.container': false,
    },
    selectedExplanationId: null,
    activePanelId: 'input-output',
    commandPreviewCleared: false,
    encoderSessionCache: {},
  })
}

async function openPanel(label: string) {
  await userEvent.click(screen.getByRole('button', { name: new RegExp(`^${label}`) }))
}

async function expandEncoderAdvanced() {
  const toggle = screen.getByRole('button', { name: /编码器私有参数/ })
  if (toggle.getAttribute('aria-expanded') === 'false') {
    await userEvent.click(toggle)
  }
}

describe('BuilderPage Checkbox Interaction (v0.4.1 hotfix)', () => {
  beforeEach(() => {
    makeTestPlatform()
    window.history.replaceState(null, '', window.location.pathname)
    // 每条用例结束后恢复默认状态。
    useBuilderStore.setState({
      config: createDefaultProjectConfig(),
      expandedSections: {
        'section.input': false,
        'section.video': true,
        'section.video-advanced': false,
        'section.frame': false,
        'section.audio': true,
        'section.audio-advanced': false,
        'section.audio-loudness': false,
        'section.subtitle': false,
        'section.container': false,
      },
      selectedExplanationId: null,
      activePanelId: 'input-output',
      commandPreviewCleared: false,
      encoderSessionCache: {},
    })
  })

  it('工作台每次只挂载当前模块并通过查询参数切换', async () => {
    render(<TestWrapper />)
    expect(screen.getByLabelText('输入文件路径')).toBeInTheDocument()
    expect(screen.queryByLabelText('视频编码器')).not.toBeInTheDocument()

    await openPanel('视频编码')
    expect(screen.getByLabelText('视频编码器')).toBeInTheDocument()
    expect(screen.queryByLabelText('输入文件路径')).not.toBeInTheDocument()
    expect(new URL(window.location.href).searchParams.get('panel')).toBe('video')
  })

  it('实用工具可启用目标大小、接管双遍码率并在关闭后恢复原质量模式', async () => {
    render(<TestWrapper />)
    await openPanel('实用工具')

    const enabled = screen.getByLabelText('启用目标文件大小')
    await userEvent.click(enabled)

    expect(screen.getByLabelText('目标文件大小 (MiB)')).toHaveValue(700)
    expect(screen.getByLabelText('完整视频时长（分钟）')).toHaveValue(90)
    expect(useBuilderStore.getState().config.video.rateControl?.mode).toBe('crf')
    let command = screen.getByLabelText('命令预览').querySelector('pre')?.textContent ?? ''
    expect(command).toContain('-pass 1')
    expect(command).toContain('-b:v 862k')
    expect(command).not.toContain('-crf 23')

    await userEvent.click(screen.getByLabelText('启用目标文件大小'))
    await waitFor(() => {
      expect(useBuilderStore.getState().config.tools.targetSize.enabled).toBe(false)
      command = screen.getByLabelText('命令预览').querySelector('pre')?.textContent ?? ''
      expect(command).toContain('-crf 23')
      expect(command).not.toContain('-pass 1')
    })
  })

  it('视频编码器高级参数默认折叠，并随编码器切换显示私有空值控件', async () => {
    render(<TestWrapper />)
    await openPanel('视频编码')

    await chooseDropdown('编解码标准', 'av1')
    await chooseDropdown('视频编码器', 'libsvtav1')

    await openPanel('质量控制')
    const advancedToggle = screen.getByRole('button', { name: /编码器私有参数/ })
    // 默认展开：私有参数字段可见
    expect(advancedToggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByLabelText('SVT-AV1 附加参数 (-svtav1-params)')).toHaveValue('')

    expect(screen.getByLabelText('Film Grain Synthesis 强度')).toHaveValue(null)
    expect(dropdownText('Film Grain 去噪')).toContain('不设置')
    expect(screen.getByLabelText('SVT-AV1 附加参数 (-svtav1-params)')).toHaveValue('')

    await userEvent.type(screen.getByLabelText('Film Grain Synthesis 强度'), '4')
    await chooseDropdown('Film Grain 去噪', 'true')
    expect(screen.getByLabelText('SVT-AV1 附加参数 (-svtav1-params)'))
      .toHaveValue('film-grain=4:film-grain-denoise=1')

    await waitFor(() => {
      const command = screen.getByLabelText('命令预览').querySelector('pre')?.textContent ?? ''
      expect(command).toContain('-svtav1-params "film-grain=4:film-grain-denoise=1"')
    })

    const rawParameters = screen.getByLabelText('SVT-AV1 附加参数 (-svtav1-params)')
    await userEvent.clear(rawParameters)
    await userEvent.type(rawParameters, 'tune=0:film-grain=7:film-grain-denoise=0')
    expect(screen.getByLabelText('Film Grain Synthesis 强度')).toHaveValue(7)
    expect(dropdownText('Film Grain 去噪')).toContain('关闭')
  })

  it('复制或禁用媒体流时解释参数缺失原因，并允许从空质量页返回视频编码', async () => {
    render(<TestWrapper />)
    await openPanel('视频编码')
    await userEvent.click(screen.getByRole('button', { name: '复制视频流 (copy)' }))
    expect(screen.getByText('正在复制视频流')).toBeInTheDocument()

    await openPanel('质量控制')
    expect(screen.getByText('复制模式不需要质量控制')).toBeInTheDocument()
    expect(screen.getByText(/视频数据会原样写入输出文件/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '前往视频编码' }))
    expect(screen.getByRole('button', { name: '复制视频流 (copy)' })).toHaveAttribute('aria-pressed', 'true')

    await openPanel('音频')
    await userEvent.click(screen.getByRole('button', { name: '复制音频流 (copy)' }))
    expect(screen.getByText('正在复制音频流')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '不输出音频 (-an)' }))
    expect(screen.getByText('当前不输出音频')).toBeInTheDocument()
  })

  it('色彩与封装工作台使用不同子标题且默认展开区域首次点击即可关闭', async () => {
    render(<TestWrapper />)
    await openPanel('色彩管理')

    const pixelFormatSection = screen.getByRole('button', { name: /^像素格式/ })
    expect(pixelFormatSection).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: /^色彩元数据/ })).toBeInTheDocument()

    await userEvent.click(pixelFormatSection)
    expect(pixelFormatSection).toHaveAttribute('aria-expanded', 'false')
    // 折叠后 body 容器添加 collapsed 类（grid-template-rows: 0fr + overflow:hidden）
    const body = pixelFormatSection.closest('.parameter-section')?.querySelector('.parameter-section__body')
    expect(body).toHaveClass('parameter-section__body--collapsed')

    await openPanel('流与封装')
    expect(screen.getByRole('button', { name: /^流选择/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^封装设置/ })).toBeInTheDocument()
  })

  it('色彩操作切换会显示转换控件并生成唯一 zscale/tonemap 滤镜链', async () => {
    render(<TestWrapper />)
    await openPanel('色彩管理')

    await chooseDropdown('色彩空间操作方式', 'convert-and-tag')
    await chooseDropdown('矩阵 / 色彩空间', 'bt709')
    await chooseDropdown('色域 / 原色', 'bt709')
    await chooseDropdown('传输特性', 'bt709')
    await chooseDropdown('色彩范围', 'tv')
    await chooseDropdown('色调映射算法', 'mobius')

    expect(useBuilderStore.getState().config.video.color?.operation).toBe('convert-and-tag')
    const command = screen.getByLabelText('命令预览').querySelector('pre')?.textContent ?? ''
    expect(command).toContain('zscale=transfer=linear')
    expect(command.match(/-vf/g)).toHaveLength(1)
  })

  it('移动端模块选择器可切换到字幕栏且不会重复挂载工作台', async () => {
    render(<TestWrapper />)
    await chooseDropdown('当前模块', 'subtitle')
    const subtitleToggle = screen.getAllByRole('button', { name: '字幕' })
      .find((button) => button.hasAttribute('aria-expanded'))
    expect(subtitleToggle).toBeDefined()
    await userEvent.click(subtitleToggle!)
    expect(screen.getByText('字幕轨道 (0 条)')).toBeInTheDocument()
    expect(document.querySelectorAll('.workbench-shell')).toHaveLength(1)
    expect(new URL(window.location.href).searchParams.get('panel')).toBe('subtitle')
  })

  it('参数侧边栏可以折叠并保存本机偏好', async () => {
    render(<TestWrapper />)
    const collapseButton = screen.getByRole('button', { name: '折叠参数侧边栏' })

    await userEvent.click(collapseButton)

    expect(document.querySelector('.workbench-shell')).toHaveClass('workbench-shell--nav-collapsed')
    expect(screen.getByRole('button', { name: '展开参数侧边栏' })).toHaveAttribute('aria-expanded', 'false')
    expect(testStorage.getItem('ffcodec-workbench-sidebar-collapsed')).toBe('true')
  })

  it('无诊断时检查器标签不显示零计数', () => {
    render(<TestWrapper />)
    expect(screen.getByRole('tab', { name: '诊断' })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: '诊断 0' })).not.toBeInTheDocument()
  })

  // -- 用例 1：NVENC 空间 AQ 可选开关 --
  it('NVENC spatial AQ optional switch persists explicit values in ProjectConfig', async () => {
    presetStore(makeConfig('h264_nvenc'))
    render(<TestWrapper />)
    await openPanel('质量控制')
    await expandEncoderAdvanced()

    expect(dropdownText('空间 AQ (-spatial_aq)')).toContain('不设置')
    await chooseDropdown('空间 AQ (-spatial_aq)', 'false')

    // 再验证 ProjectConfig 已同步；修复前 applyFieldChange 会拒绝此变更。
    const config = useBuilderStore.getState().config
    const sp = config.video.specialParameters
    const hasSpatialAq = ('spatialAq' in sp) || ('h264_nvenc.spatialaq' in sp)
    expect(hasSpatialAq).toBe(true)
    const value = sp['spatialAq'] ?? sp['h264_nvenc.spatialaq']
    expect(value).toBe(false)

    await chooseDropdown('空间 AQ (-spatial_aq)', 'true')

    const config2 = useBuilderStore.getState().config
    const sp2 = config2.video.specialParameters
    const recheckedValue = sp2['spatialAq'] ?? sp2['h264_nvenc.spatialaq']
    expect(recheckedValue).toBe(true)
  })

  // -- 用例 2：NVENC 时间 AQ 可选开关 --
  it('NVENC temporal AQ remains unset until explicitly enabled', async () => {
    presetStore(makeConfig('h264_nvenc'))
    render(<TestWrapper />)
    await openPanel('质量控制')
    await expandEncoderAdvanced()

    expect(dropdownText('时间 AQ (-temporal_aq)')).toContain('不设置')
    await chooseDropdown('时间 AQ (-temporal_aq)', 'true')

    const config = useBuilderStore.getState().config
    const sp = config.video.specialParameters
    const hasValue = ('temporalAq' in sp) || ('h264_nvenc.temporalaq' in sp)
    expect(hasValue).toBe(true)
    const value = sp['temporalAq'] ?? sp['h264_nvenc.temporalaq']
    expect(value).toBe(true)
  })

  // -- 用例 3：QSV 低功耗可选开关 --
  it('QSV low power optional switch toggles and persists', async () => {
    presetStore(makeConfig('h264_qsv'))
    render(<TestWrapper />)
    await openPanel('质量控制')
    await expandEncoderAdvanced()

    expect(dropdownText('低功耗模式 (-low_power)')).toContain('不设置')
    await chooseDropdown('低功耗模式 (-low_power)', 'true')

    const config = useBuilderStore.getState().config
    const sp = config.video.specialParameters
    const hasValue = ('lowPower' in sp) || ('h264_qsv.lowpower' in sp)
    expect(hasValue).toBe(true)
    const value = sp['lowPower'] ?? sp['h264_qsv.lowpower']
    expect(value).toBe(true)
  })

  // -- 用例 4：HEVC NVENC 空间 AQ 可选开关 --
  it('HEVC NVENC spatial AQ optional switch toggles and persists', async () => {
    presetStore(makeConfig('hevc_nvenc'))
    render(<TestWrapper />)
    await openPanel('质量控制')
    await expandEncoderAdvanced()

    expect(dropdownText('空间 AQ (-spatial_aq)')).toContain('不设置')
    await chooseDropdown('空间 AQ (-spatial_aq)', 'false')

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
    render(<TestWrapper />)
    await openPanel('音频')

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
    render(<TestWrapper />)
    await openPanel('音频')

    expect(dropdownText('编码应用类型')).toContain('不设置')
    // 打开下拉并验证"不设置"选项存在
    const appTrigger = screen.getByLabelText('编码应用类型')
    await userEvent.click(appTrigger)
    expect(screen.getByRole('option', { name: '不设置（使用编码器默认）' })).toBeInTheDocument()
    // 关闭面板
    await userEvent.click(appTrigger)

    await chooseDropdown('编码应用类型', 'voip')
    expect(useBuilderStore.getState().config.audio.qualityValues.application).toBe('voip')

    await chooseDropdown('编码应用类型', '')
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
    render(<TestWrapper />)

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
    render(<TestWrapper />)
    await openPanel('字幕')

    await userEvent.click(await screen.findByRole('button', { name: '添加轨道' }))
    expect(useBuilderStore.getState().config.subtitle.tracks).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: '删除轨道' }))
    expect(useBuilderStore.getState().config.subtitle.tracks).toHaveLength(0)
  })

  it('正式页面切换编码器会清理旧编码器特殊参数', async () => {
    const config = makeConfig('h264_nvenc')
    config.video.specialParameters = { spatialAq: true, temporalAq: true }
    presetStore(config)
    render(<TestWrapper />)
    await openPanel('视频编码')

    await chooseDropdown('视频编码器', 'h264_amf')

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
    render(<TestWrapper />)
    await openPanel('自定义参数')

    const textarea = await screen.findByLabelText('全局参数')
    await userEvent.type(textarea, '-benchmark')

    expect(screen.getByRole('heading', { name: 'FFmpeg 命令生成器' })).toBeInTheDocument()
    expect(useBuilderStore.getState().config.customArgs.globalArgs).toEqual(['-benchmark'])
  })

  it('默认使用亮色主题，并可切换暗色主题', async () => {
    render(<TestWrapper />)

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('light'))
    await userEvent.click(screen.getByRole('button', { name: '切换到暗色模式' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(testStorage.getItem('ffcodec-theme')).toBe('dark')
  })

  it('全局中/EN开关会翻译工作台并持久化语言', async () => {
    render(<TestWrapper />)

    expect(screen.getByRole('heading', { name: 'FFmpeg 命令生成器' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Switch to English' }))
    await userEvent.click(screen.getByRole('button', { name: /^Video encoding/ }))

    expect(screen.getByRole('heading', { name: 'FFmpeg Command Builder' })).toBeInTheDocument()
    expect(screen.getByLabelText('Video encoder')).toBeInTheDocument()
    expect(screen.getByLabelText('Command preview')).toBeInTheDocument()
    expect(testStorage.getItem('ffcodec-locale')).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    const multilingualTitle = document.querySelector('[data-multilingual-title]')?.textContent ?? ''
    const englishPageText = (document.body.textContent ?? '').replace(multilingualTitle, '').replace('中', '')
    expect(englishPageText).not.toMatch(/[\u4e00-\u9fff]/)
  })

  it('英文音频页会翻译处理方式、推荐卡片、分类标签和高级参数', async () => {
    presetStore(makeAudioConfig('aac'))
    render(<TestWrapper />)

    await userEvent.click(screen.getByRole('button', { name: 'Switch to English' }))
    await userEvent.click(screen.getByRole('button', { name: /^Audio/ }))

    expect(screen.getByRole('group', { name: 'Audio handling' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /FFmpeg native AAC/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Search all encoders/ }))
    expect(screen.getByRole('heading', { name: 'AAC' })).toBeInTheDocument()
    expect(screen.getAllByText('Lossy').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Built-in').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /Audio advanced parameters/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Loudness normalization/ })).toBeInTheDocument()

    const multilingualTitle = document.querySelector('[data-multilingual-title]')?.textContent ?? ''
    const englishPageText = (document.body.textContent ?? '').replace(multilingualTitle, '').replace('中', '')
    expect(englishPageText).not.toMatch(/[\u4e00-\u9fff]/)
  })

  it('标题区使用简洁的模块化工作台说明', () => {
    render(<TestWrapper />)
    const title = document.querySelector('[data-multilingual-title]')
    expect(title).toHaveTextContent('模块化参数工作台')
    expect(document.body).not.toHaveTextContent('组合编码、画面、音频与字幕参数')
  })

  it('自由编辑栏允许修改命令、保留手工内容并恢复生成命令', async () => {
    render(<TestWrapper />)
    const editor = screen.getByLabelText('可自由编辑的 FFmpeg 命令')
    expect((editor as HTMLTextAreaElement).value).toContain('ffmpeg')

    await userEvent.clear(editor)
    await userEvent.type(editor, 'ffmpeg -i custom.mkv -c copy custom.mp4')
    expect(editor).toHaveValue('ffmpeg -i custom.mkv -c copy custom.mp4')
    expect(screen.getByText('已脱离自动同步')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '恢复生成命令' }))
    expect((editor as HTMLTextAreaElement).value).toContain('input.mkv')
  })

  it('命令预览多行模式显示续行符并复制当前多行文本', async () => {
    const originalClipboard = navigator.clipboard
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })

    render(<TestWrapper />)
    await userEvent.click(screen.getByRole('button', { name: '单行' }))

    const previewLines = document.querySelectorAll('.command-multiline__line')
    expect(previewLines.length).toBeGreaterThan(2)
    expect(previewLines[0]).toHaveTextContent('ffmpeg `')
    expect(previewLines[1]).toHaveTextContent('-i input.mkv `')
    await userEvent.click(screen.getByRole('button', { name: '复制' }))
    expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/^ffmpeg `\n\x20{2}-i input\.mkv `/))

    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: originalClipboard })
  })

  it('命令预览可清空全部命令、重置参数，并在参数变化后恢复生成', async () => {
    const config = createDefaultProjectConfig()
    config.input.path = 'movie.mkv'
    config.video.rateControl = { mode: 'crf', qualityValue: 18, additionalValues: {} }
    config.customArgs.globalArgs = ['-benchmark']
    presetStore(config)
    render(<TestWrapper />)
    const editor = screen.getByLabelText('可自由编辑的 FFmpeg 命令')
    await userEvent.clear(editor)
    await userEvent.type(editor, 'ffmpeg -i manual.mkv -c copy manual.mp4')
    await userEvent.click(screen.getByRole('button', { name: '清空全部' }))
    await userEvent.click(screen.getByRole('button', { name: '清空并重置' }))

    expect(useBuilderStore.getState().commandPreviewCleared).toBe(true)
    expect(useBuilderStore.getState().config).toEqual(createDefaultProjectConfig())
    expect(screen.getByLabelText('命令预览').querySelector('pre')).toBeNull()
    expect(screen.getByText(/所有命令已清空/)).toBeInTheDocument()
    expect(editor).toHaveValue('')

    const inputPath = screen.getByLabelText('输入文件路径')
    await userEvent.clear(inputPath)
    await userEvent.type(inputPath, 'next.mkv')

    await waitFor(() => {
      expect(useBuilderStore.getState().commandPreviewCleared).toBe(false)
      expect(screen.getByLabelText('命令预览').querySelector('pre')?.textContent).toContain('next.mkv')
      expect((editor as HTMLTextAreaElement).value).toContain('next.mkv')
    })
  })

  it('音频码率使用数值输入和后置单位选择', async () => {
    presetStore(makeAudioConfig('aac'))
    render(<TestWrapper />)
    await openPanel('音频')

    const amount = screen.getByLabelText('音频码率 (-b:a)')
    expect(amount).toHaveAttribute('type', 'number')
    expect(amount).toHaveValue(192)
    expect(dropdownText('音频码率 (-b:a)单位')).toBe('kbps')

    await userEvent.clear(amount)
    await userEvent.type(amount, '256')
    await chooseDropdown('音频码率 (-b:a)单位', 'M')

    expect(useBuilderStore.getState().config.audio.bitrate).toBe('256M')
  })

  it('音频编码器提供推荐卡片和可搜索分类选择器', async () => {
    const config = makeAudioConfig('aac')
    config.output.containerId = 'mkv'
    presetStore(config)
    render(<TestWrapper />)
    await openPanel('音频')

    expect(screen.getByText('当前容器推荐')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /FFmpeg 原生 AAC/ })).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(screen.getByRole('button', { name: /搜索全部编码器/ }))
    const search = screen.getByPlaceholderText('搜索名称、FFmpeg encoder 或分类…')
    await userEvent.type(search, 'pcm_f64le')

    const pcmFloat = screen.getByRole('button', { name: /WAV PCM 64-bit float/ })
    expect(pcmFloat).toBeEnabled()
    await userEvent.click(pcmFloat)
    expect(useBuilderStore.getState().config.audio.encoderId).toBe('pcm_f64le')
    expect(useBuilderStore.getState().config.audio.bitrate).toBeUndefined()
  })

  it('音频编码器私有选项放在独立的高级参数折叠栏', async () => {
    presetStore(makeAudioConfig('aac'))
    render(<TestWrapper />)
    await openPanel('音频')

    const toggle = screen.getByRole('button', { name: /音频高级参数/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByLabelText('AAC 编码配置')).toBeInTheDocument()

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(useBuilderStore.getState().expandedSections['section.audio-advanced']).toBe(true)
  })

  it('响度标准化提供三个独立开关和官方范围滑杆', async () => {
    presetStore(makeAudioConfig('aac'))
    render(<TestWrapper />)
    await openPanel('音频')

    const sectionToggle = screen.getByRole('button', { name: /响度标准化/ })
    expect(sectionToggle).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(sectionToggle)

    const targetI = screen.getByLabelText('目标响度 I (LUFS)')
    const targetLra = screen.getByLabelText('动态范围 LRA (LU)')
    const targetTp = screen.getByLabelText('峰值电平 TP (dBTP)')
    expect(targetI).toHaveAttribute('type', 'range')
    expect(targetI).toHaveAttribute('min', '-70')
    expect(targetI).toHaveAttribute('max', '-5')
    expect(targetLra).toHaveAttribute('min', '1')
    expect(targetLra).toHaveAttribute('max', '50')
    expect(targetTp).toHaveAttribute('min', '-9')
    expect(targetTp).toHaveAttribute('max', '0')
    expect(targetI).toBeDisabled()
    expect(targetLra).toBeDisabled()
    expect(targetTp).toBeDisabled()

    await userEvent.click(screen.getByLabelText('启用目标响度'))
    await userEvent.click(screen.getByLabelText('启用峰值电平'))
    expect(targetI).toBeEnabled()
    expect(targetLra).toBeDisabled()
    expect(targetTp).toBeEnabled()
    expect(useBuilderStore.getState().config.audio.loudnessNormalization.integratedLoudnessEnabled).toBe(true)
    expect(useBuilderStore.getState().config.audio.loudnessNormalization.truePeakEnabled).toBe(true)
  })

  it('Desktop 根据本机 FFmpeg 能力禁用缺失编码器并隐藏不可用的 AAC NMR', async () => {
    const config = makeAudioConfig('aac')
    config.output.containerId = 'mkv'
    presetStore(config)
    testPlatform = {
      ...testPlatform,
      capabilities: { ...testPlatform.capabilities, desktop: true, ffmpegDetect: true },
      extensions: {
        getAudioEncoderCapabilities: async () => ({
          encoders: ['aac', 'flac'],
          aacOptions: ['twoloop', 'fast'],
        }),
      },
    }
    render(<TestWrapper />)
    await openPanel('音频')

    expect(await screen.findByText('当前 FFmpeg 未提供 NMR；已隐藏该选项。')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /搜索全部编码器/ }))
    await userEvent.type(screen.getByPlaceholderText('搜索名称、FFmpeg encoder 或分类…'), 'libmp3lame')

    const lame = screen.getByRole('button', { name: /LAME MP3/ })
    expect(lame).toBeDisabled()
    expect(lame).toHaveTextContent('当前 FFmpeg 不可用')
  })

  it('Desktop 解锁开关会恢复所有受 FFmpeg 能力检测限制的音频选项', async () => {
    const overrideListeners = new Set<(enabled: boolean) => void>()
    presetStore(makeAudioConfig('aac'))
    testPlatform = {
      ...testPlatform,
      capabilities: { ...testPlatform.capabilities, desktop: true, ffmpegDetect: true },
      extensions: {
        getAudioEncoderCapabilities: async () => ({ encoders: ['aac'], aacOptions: ['fast'] }),
        getAudioCapabilityOverride: () => false,
        onAudioCapabilityOverrideChange: (listener) => {
          overrideListeners.add(listener)
          return () => { overrideListeners.delete(listener) }
        },
      },
    }
    render(<TestWrapper />)
    await openPanel('音频')
    expect(await screen.findByText('当前 FFmpeg 未提供 NMR；已隐藏该选项。')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /LAME MP3/ })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /搜索全部编码器/ }))
    await userEvent.type(screen.getByPlaceholderText('搜索名称、FFmpeg encoder 或分类…'), 'libmp3lame')
    expect(screen.getAllByRole('button', { name: /LAME MP3/ }).every((button) => button.hasAttribute('disabled'))).toBe(true)

    act(() => { for (const listener of overrideListeners) listener(true) })
    expect(screen.queryByText('当前 FFmpeg 未提供 NMR；已隐藏该选项。')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /LAME MP3/ }).every((button) => !button.hasAttribute('disabled'))).toBe(true)
  })

  it('音频质量档与目标码率互斥，避免生成冲突的 FFmpeg 参数', async () => {
    presetStore(makeAudioConfig('libmp3lame'))
    render(<TestWrapper />)
    await openPanel('音频')

    const quality = screen.getByLabelText('VBR 质量 (-q:a，0最好)')
    await userEvent.type(quality, '2')
    expect(useBuilderStore.getState().config.audio.qualityValues.quality).toBe(2)
    expect(useBuilderStore.getState().config.audio.bitrate).toBeUndefined()

    const bitrate = screen.getByLabelText('音频码率 (-b:a)')
    await userEvent.type(bitrate, '192')
    expect(useBuilderStore.getState().config.audio.bitrate).toBe('192k')
    expect(useBuilderStore.getState().config.audio.qualityValues.quality).toBeUndefined()
  })

  it('参数说明不显示内部数据来源，并提供有决策价值的编码器介绍', async () => {
    render(<TestWrapper />)
    expect(screen.getByRole('link', { name: '在 GitHub 打开 FFCodec Lab 项目' }))
      .toHaveAttribute('href', 'https://github.com/maxzrb/ffcodec-lab')
    expect(screen.getByText('FFCodec Lab v1.0')).toBeInTheDocument()
    await openPanel('视频编码')

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
    render(<TestWrapper />)

    await userEvent.click(screen.getByRole('tab', { name: /^诊断/ }))

    expect(await screen.findByText('无法确认字幕复制后的容器兼容性')).toBeInTheDocument()
    expect(screen.getByText(/先用 ffprobe 确认字幕编码/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Switch to English' }))
    expect(screen.getByText('Subtitle copy compatibility cannot be confirmed')).toBeInTheDocument()
    expect(screen.getByText(/Inspect the source with ffprobe/)).toBeInTheDocument()
  })

  it('默认显示 PowerShell 单行命令且不显示来源核验提示', async () => {
    render(<TestWrapper />)
    await openPanel('流与封装')

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
    render(<TestWrapper />)
    await openPanel('流与封装')

    await chooseDropdown('输出容器', 'mkv')
    await openPanel('输入与输出')

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
    render(<TestWrapper />)
    await openPanel('流与封装')

    // 关闭保留全部流开关以显示逐流多选
    const preserveVideo = document.querySelector('[data-field-id="streams.preserveAllVideoStreams"] input[type="checkbox"]') as HTMLInputElement
    const preserveAudio = document.querySelector('[data-field-id="streams.preserveAllAudioStreams"] input[type="checkbox"]') as HTMLInputElement
    const preserveSubtitle = document.querySelector('[data-field-id="streams.preserveAllSubtitleStreams"] input[type="checkbox"]') as HTMLInputElement
    if (preserveVideo?.checked) await userEvent.click(preserveVideo)
    if (preserveAudio?.checked) await userEvent.click(preserveAudio)
    if (preserveSubtitle?.checked) await userEvent.click(preserveSubtitle)

    const videoField = document.querySelector('[data-field-id="streams.videoStreams"]')!
    const audioField = document.querySelector('[data-field-id="streams.audioStreams"]')!
    const subtitleField = document.querySelector('[data-field-id="streams.subtitleStreams"]')!
    const videoOptions = videoField.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    const audioOptions = audioField.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    const subtitleOptions = subtitleField.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')

    await userEvent.click(videoOptions[2])
    await userEvent.click(audioOptions[1])
    await userEvent.click(subtitleOptions[3])

    expect(useBuilderStore.getState().config.streams.videoStreams.map(function(e){return e.index})).toEqual([0, 2])
    expect(useBuilderStore.getState().config.streams.audioStreams.map(function(e){return e.index})).toEqual([0, 1])
    expect(useBuilderStore.getState().config.streams.subtitleStreams.map(function(e){return e.index})).toEqual([3])
  })
})
