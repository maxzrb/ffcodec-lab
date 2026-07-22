// ============================================================
// Platform API types — shared contracts between Web and Desktop.
// Zero dependencies on Electron, Node.js, or browser APIs.
// ============================================================

import type { ReactNode } from 'react'

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

export interface WorkbenchExtensions {
  headerItems?: ReactNode[]
  inspectorTabs?: InspectorTabExtension[]
  commandActions?: CommandActionExtension[]
  renderCommandEditorActions?: (context: { command: string; dirty: boolean }) => ReactNode
  pathFieldRenderer?: PathFieldRenderer
  settingsSections?: SettingsSectionExtension[]
  /** Additional React nodes rendered at the top of the workbench content area. */
  contentSections?: ReactNode[]
  /** Custom panels appended to the workbench navigation tabs. */
  panels?: CustomPanelExtension[]
  getAudioEncoderCapabilities?: () => Promise<{
    encoders: string[]
    aacOptions: string[]
  } | null>
  getAudioCapabilityOverride?: () => boolean
  onAudioCapabilityOverrideChange?: (listener: (enabled: boolean) => void) => () => void
}
