// ============================================================
// Desktop Platform Adapter — Electron implementation.
// Phase 4: localStorage-backed storage with INI mirror.
// Phase 5: extensions for desktop-specific UI (path fields, etc.).
// ============================================================

import type { PlatformAdapter, StorageAdapter, WorkbenchExtensions } from '@ffcodec/platform-api'
import { DesktopPathField } from './components/DesktopPathField'
import { desktopCommandActions } from './components/DesktopCommandActions'
import { desktopSettingsSections } from './components/DesktopSettingsSection'
import { AudioCapabilityUnlockButton } from './components/AudioCapabilityUnlockButton'
import { CustomCommandActions } from './components/CustomCommandActions'
import { ConfigFilePanel } from './components/ConfigFilePanel'
import { MediaProbePanel } from './components/MediaProbePanel'
import { TargetDurationProbeAction } from './components/TargetDurationProbeAction'
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

const desktopExtensions: WorkbenchExtensions = {
  headerItems: [<AudioCapabilityUnlockButton key="audio-capability-unlock" />],
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
  onFFmpegSelectionChange: onPreferredFFmpegPathChange,
  getAudioCapabilityOverride,
  onAudioCapabilityOverrideChange,
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
  },
  storage: new ElectronStorageAdapter(),
  extensions: desktopExtensions,
}
