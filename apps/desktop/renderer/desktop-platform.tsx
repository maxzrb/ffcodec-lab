// ============================================================
// Desktop Platform Adapter — Electron implementation.
// Phase 4: localStorage-backed storage with INI mirror.
// Phase 5: extensions for desktop-specific UI (path fields, etc.).
// ============================================================

import type { PlatformAdapter, PresetFileScope, PresetFileStore, StorageAdapter, WorkbenchExtensions } from '@ffcodec/platform-api'
import { DesktopPathField } from './components/DesktopPathField'
import { desktopCommandActions } from './components/DesktopCommandActions'
import { desktopSettingsSections } from './components/DesktopSettingsSection'
import { AudioCapabilityUnlockButton } from './components/AudioCapabilityUnlockButton'
import { CustomCommandActions } from './components/CustomCommandActions'
import { ConfigFilePanel } from './components/ConfigFilePanel'
import { MediaProbePanel } from './components/MediaProbePanel'
import { TargetDurationProbeAction } from './components/TargetDurationProbeAction'
import { BatchQueuePanel, SingleFileOutputLocationControl } from './batch-queue/BatchQueuePanel'
import {
  getSelectedBatchQueueConfig,
  onSelectedBatchQueueConfigChange,
} from './batch-queue/batch-queue-store'
import {
  getAudioCapabilityOverride,
  onAudioCapabilityOverrideChange,
} from './audio-capability-override'
import {
  getPreferredFFmpegPath,
  onPreferredFFmpegPathChange,
} from './ffmpeg-path-selection'

/** localStorage-backed storage for Electron renderer.
 *  INI persistence happens in parallel via electronAPI.storageSetItem. */
class ElectronStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch (e) {
      console.warn('Failed to write to localStorage:', e)
    }
    // Mirror to INI store (fire-and-forget)
    void window.electronAPI?.storageSetItem(key, value)
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch {
      // Silently ignore
    }
    void window.electronAPI?.storageRemoveItem(key)
  }

  keys(): string[] {
    try {
      const result: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) result.push(key)
      }
      return result
    } catch {
      return []
    }
  }
}

/** 基于主进程 IPC 的外挂 JSON 预设存储。 */
class ElectronPresetFileStore implements PresetFileStore {
  async listAll() {
    return (await window.electronAPI?.presetListAll()) ?? []
  }

  async read(fileName: string, scope?: PresetFileScope) {
    return (await window.electronAPI?.presetRead(fileName, scope)) ?? null
  }

  async write(fileName: string, content: string, scope?: PresetFileScope) {
    const result = await window.electronAPI?.presetWrite(fileName, content, scope)
    if (!result) return { ok: false as const, error: '预设文件存储不可用' }
    return result
  }

  async delete(fileName: string, scope?: PresetFileScope) {
    const result = await window.electronAPI?.presetDelete(fileName, scope)
    return result ?? { ok: false, error: '预设文件存储不可用' }
  }

  async getDirectory() {
    return (await window.electronAPI?.presetGetDirectory()) ?? null
  }

  async revealDirectory() {
    return (await window.electronAPI?.presetRevealDirectory()) ?? false
  }
}

const desktopExtensions: WorkbenchExtensions = {
  headerItems: [<AudioCapabilityUnlockButton key="audio-capability-unlock" />],
  inputOutputSection: {
    additionalContent: <SingleFileOutputLocationControl />,
    after: <BatchQueuePanel />,
  },
  getCommandPreviewOverride: () => {
    const config = getSelectedBatchQueueConfig()
    return config ? { config } : null
  },
  onCommandPreviewOverrideChange: onSelectedBatchQueueConfigChange,
  pathFieldRenderer: DesktopPathField,
  commandActions: desktopCommandActions,
  renderCommandEditorActions: ({ command, dirty }) => <CustomCommandActions command={command} dirty={dirty} />,
  renderFieldAction: (fieldId, { openInspectorTab }) => fieldId === 'tools.targetSize.durationMinutes'
    ? <TargetDurationProbeAction onOpenMediaProbe={() => openInspectorTab('diagnostics')} />
    : null,
  settingsSections: desktopSettingsSections,
  panels: [{ id: 'config-file', label: '配置文件', render: () => <ConfigFilePanel /> }],
  diagnosticsPanelPrefix: <MediaProbePanel />,
  getAudioEncoderCapabilities: () => {
    const customPath = getPreferredFFmpegPath()
    return window.electronAPI?.getAudioEncoderCapabilities(customPath) ?? Promise.resolve(null)
  },
  getFilterCapabilities: () => {
    const customPath = getPreferredFFmpegPath()
    return window.electronAPI?.getFilterCapabilities(customPath) ?? Promise.resolve(null)
  },
  getFFmpegCapabilities: () => {
    const customPath = getPreferredFFmpegPath()
    return window.electronAPI?.getFFmpegCapabilities(customPath) ?? Promise.resolve(null)
  },
  getFFmpegEncoderCapabilities: (encoder) => {
    const customPath = getPreferredFFmpegPath()
    return window.electronAPI?.getFFmpegEncoderCapabilities(encoder, customPath) ?? Promise.resolve(null)
  },
  onFFmpegSelectionChange: onPreferredFFmpegPathChange,
  getAudioCapabilityOverride,
  onAudioCapabilityOverrideChange,
  presetFileStore: new ElectronPresetFileStore(),
}

/** Full desktop platform adapter. Capabilities declare what desktop can do. */
export const desktopPlatform: PlatformAdapter = {
  capabilities: {
    desktop: true,
    nativeFileDialog: true,          // Phase 6 ✅
    ffmpegDetect: true,              // Phase 6 ✅
    localFFmpegExecution: true,      // Phase 9 ✅
    revealInFolder: true,            // Phase 6 ✅
    persistentEncodingHistory: true,  // Phase 11 ✅
    filePresetStore: true,            // 外挂 JSON 预设
  },
  storage: new ElectronStorageAdapter(),
  extensions: desktopExtensions,
}
