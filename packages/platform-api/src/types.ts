// ============================================================
// Platform API types — shared contracts between Web and Desktop.
// Zero dependencies on Electron, Node.js, or browser APIs.
// ============================================================

import type { ReactNode } from 'react'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'

// ---- Platform capabilities (feature flags) ----

export interface PlatformCapabilities {
  /** Whether this is the Electron desktop app (vs. web). */
  desktop: boolean
  /** Native OS file/folder dialogs (Electron only). */
  nativeFileDialog: boolean
  /** Can detect local FFmpeg binary (version, path, source). */
  ffmpegDetect: boolean
  /** Can locally spawn FFmpeg child processes. */
  localFFmpegExecution: boolean
  /** Can reveal a file in the OS file manager. */
  revealInFolder: boolean
  /** Encoding history can be persisted locally (electron-store). */
  persistentEncodingHistory: boolean
}

// ---- Storage abstraction ----

export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  keys(): string[]
}

// ---- Platform adapter (provided by each host) ----

export interface PlatformAdapter {
  capabilities: PlatformCapabilities
  storage: StorageAdapter
  /** Optional workbench extensions — desktop provides these; web omits them. */
  extensions?: WorkbenchExtensions
}

// ---- Workbench extension points (desktop injects UI via these) ----

export interface InspectorTabExtension {
  id: string
  label: string
  badge?: number
  render: () => ReactNode
}

export interface CommandActionExtension {
  id: string
  label: string
  render: () => ReactNode
}

/** 平台可临时将共享命令面板切换为一份冻结配置的只读预览。 */
export interface CommandPreviewOverride {
  config: ProjectConfig
}

export type PathFieldRenderer = (props: {
  fieldId: string
  value: string
  kind: 'open-file' | 'open-files' | 'save-file' | 'directory'
  onChange: (value: string) => void
}) => ReactNode

export interface SettingsSectionExtension {
  id: string
  title: string
  render: () => ReactNode
}

export interface CustomPanelExtension {
  id: string
  label: string
  render: () => ReactNode
}

export interface FieldActionContext {
  openInspectorTab: (tabId: string) => void
}

/** 附加在共享“输入与输出”参数区的 Desktop 专用内容。 */
export interface InputOutputSectionExtension {
  /** 渲染在既有输入与输出字段之后，仍属于同一张折叠卡片。 */
  additionalContent?: ReactNode
  /** 渲染在既有输入与输出卡片之后的同级内容。 */
  after?: ReactNode
}

export interface WorkbenchExtensions {
  headerItems?: ReactNode[]
  inputOutputSection?: InputOutputSectionExtension
  inspectorTabs?: InspectorTabExtension[]
  getCommandPreviewOverride?: () => CommandPreviewOverride | null
  onCommandPreviewOverrideChange?: (listener: () => void) => () => void
  commandActions?: CommandActionExtension[]
  renderCommandEditorActions?: (context: { command: string; dirty: boolean }) => ReactNode
  renderFieldAction?: (fieldId: string, context: FieldActionContext) => ReactNode
  pathFieldRenderer?: PathFieldRenderer
  settingsSections?: SettingsSectionExtension[]
  /** Additional React nodes rendered at the top of the workbench content area. */
  contentSections?: ReactNode[]
  /** Custom panels appended to the workbench navigation tabs. */
  panels?: CustomPanelExtension[]
  /** React node rendered above the shared diagnostics panel. */
  diagnosticsPanelPrefix?: ReactNode
  getAudioEncoderCapabilities?: () => Promise<{
    encoders: string[]
    aacOptions: string[]
  } | null>
  /** 查询当前 FFmpeg 已注册的滤镜，用于执行前能力校验。 */
  getFilterCapabilities?: () => Promise<{
    filters: string[]
  } | null>
  /** 查询当前 FFmpeg 实际注册的编码器和滤镜。 */
  getFFmpegCapabilities?: () => Promise<{
    encoders: string[]
    filters: string[]
  } | null>
  /** 按需查询编码器私有选项及 FFmpeg 通用视频编码 AVOptions。 */
  getFFmpegEncoderCapabilities?: (encoder: string) => Promise<{
    encoder: string
    options: string[]
    videoCodecOptions: string[]
  } | null>
  /** 订阅 Desktop 当前 FFmpeg 选择变化。 */
  onFFmpegSelectionChange?: (listener: () => void) => () => void
  getAudioCapabilityOverride?: () => boolean
  onAudioCapabilityOverrideChange?: (listener: (enabled: boolean) => void) => () => void
}
