// ============================================================
// PresetManager — main preset management UI.
// Modal overlay with preset list, editor, and import dialogs.
// ============================================================

import { useState, useCallback } from 'react'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import type { UserPreset } from './preset-types'
import { getPresetService, getBuiltinPresets } from './preset-service'
import { PresetList } from './PresetList'
import { PresetEditorDialog } from './PresetEditorDialog'
import { PresetImportDialog } from './PresetImportDialog'
import type { NormalizationNotice } from '@ffcodec/domain/rules/rule-types'
import { useI18n } from '../i18n/i18n'
import { useAppDialog } from '../dialog/AppDialogProvider'

interface PresetManagerProps {
  /** Called when user applies a preset — receives the config to set */
  onApply: (config: ProjectConfig, notices: NormalizationNotice[]) => void
  /** Called when user requests reset to defaults */
  onReset: () => void
  /** Current config (for save-as) */
  currentConfig: ProjectConfig
  onClose: () => void
}

const catalog = loadCatalog()
const presetService = getPresetService()

export function PresetManager({ onApply, onReset, currentConfig, onClose }: PresetManagerProps) {
  const { locale } = useI18n()
  const dialog = useAppDialog()
  const isZh = locale === 'zh-CN'
  const [userPresets, setUserPresets] = useState<UserPreset[]>(() => presetService.list())
  const [showEditor, setShowEditor] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingPreset, setEditingPreset] = useState<UserPreset | null>(null)
  const [saveAsMode, setSaveAsMode] = useState(false)
  const [notices, setNotices] = useState<string[]>([])

  const builtinPresets = getBuiltinPresets()

  const refreshList = useCallback(() => {
    setUserPresets(presetService.list())
  }, [])

  const handleApply = useCallback(
    (preset: UserPreset) => {
      // Apply goes through the store's setConfig which triggers full pipeline
      onApply(preset.config, [])
      onClose()
    },
    [onApply, onClose],
  )

  const handleApplyBuiltin = useCallback(
    (index: number) => {
      const bp = builtinPresets[index]
      // Built-in presets don't have id/timestamps — create a temp config
      onApply(bp.config, [])
      onClose()
    },
    [builtinPresets, onApply, onClose],
  )

  const handleCreate = useCallback(() => {
    setEditingPreset(null)
    setSaveAsMode(false)
    setShowEditor(true)
  }, [])

  const handleSaveAs = useCallback(() => {
    setEditingPreset(null)
    setSaveAsMode(true)
    setShowEditor(true)
  }, [])

  const handleEdit = useCallback((preset: UserPreset) => {
    setEditingPreset(preset)
    setSaveAsMode(false)
    setShowEditor(true)
  }, [])

  const handleEditorSave = useCallback(
    (name: string, description: string) => {
      try {
        if (saveAsMode) {
          // Save-as: create new preset from current config
          presetService.save({
            name,
            description,
            config: currentConfig,
          })
        } else if (editingPreset) {
          // Editing existing: update name/description
          const updated = presetService.save({
            id: editingPreset.id,
            name,
            description,
            config: editingPreset.config,
          })
          if (updated) {
            setNotices([isZh ? `预设 "${updated.name}" 已更新` : `Preset "${updated.name}" updated`])
          }
        } else {
          // Create new from current config
          presetService.save({
            name,
            description,
            config: currentConfig,
          })
        }
        refreshList()
        setShowEditor(false)
      } catch (e) {
        setNotices([isZh ? `保存失败: ${String(e)}` : `Save failed: ${String(e)}`])
      }
    },
    [saveAsMode, editingPreset, currentConfig, refreshList, isZh],
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!await dialog.confirm({
        title: isZh ? '删除此预设？' : 'Delete this preset?',
        message: isZh ? '此操作不可撤销。' : 'This action cannot be undone.',
        confirmLabel: isZh ? '删除预设' : 'Delete preset',
        cancelLabel: isZh ? '取消' : 'Cancel',
        tone: 'danger',
      })) return
      try {
        presetService.delete(id)
        refreshList()
        setNotices([isZh ? '预设已删除' : 'Preset deleted'])
      } catch (e) {
        setNotices([isZh ? `删除失败: ${String(e)}` : `Delete failed: ${String(e)}`])
      }
    },
    [dialog, refreshList, isZh],
  )

  const handleOverwrite = useCallback(
    async (id: string) => {
      if (!await dialog.confirm({
        title: isZh ? '覆盖此预设？' : 'Overwrite this preset?',
        message: isZh ? '保存的配置将替换为当前参数工作台内容。' : 'The saved configuration will be replaced by the current workbench settings.',
        confirmLabel: isZh ? '确认覆盖' : 'Overwrite',
        cancelLabel: isZh ? '取消' : 'Cancel',
        tone: 'warning',
      })) return
      try {
        const existing = presetService.load(id)
        if (existing) {
          presetService.save({
            id,
            name: existing.name,
            description: existing.description,
            config: currentConfig,
          })
          refreshList()
          setNotices([isZh ? `预设 "${existing.name}" 已覆盖` : `Preset "${existing.name}" overwritten`])
        }
      } catch (e) {
        setNotices([isZh ? `覆盖失败: ${String(e)}` : `Overwrite failed: ${String(e)}`])
      }
    },
    [currentConfig, dialog, refreshList, isZh],
  )

  const handleRename = useCallback(
    (id: string, newName: string) => {
      try {
        presetService.rename(id, newName)
        refreshList()
        setNotices([isZh ? `已重命名为 "${newName}"` : `Renamed to "${newName}"`])
      } catch (e) {
        setNotices([isZh ? `重命名失败: ${String(e)}` : `Rename failed: ${String(e)}`])
      }
    },
    [refreshList, isZh],
  )

  const handleExport = useCallback((id: string) => {
    try {
      const json = presetService.export(id)
      if (!json) {
        setNotices([isZh ? '导出失败：预设不存在' : 'Export failed: preset not found'])
        return
      }
      const preset = presetService.load(id)
      const filename = preset ? `${preset.name.replace(/\s+/g, '_')}.ffcodec.json` : 'preset.ffcodec.json'
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      setNotices([isZh ? '预设已导出为 JSON 文件' : 'Preset exported as JSON'])
    } catch (e) {
      setNotices([isZh ? `导出失败: ${String(e)}` : `Export failed: ${String(e)}`])
    }
  }, [isZh])

  const handleImport = useCallback(
    (json: string) => {
      const { preset, warnings } = presetService.importAndSave(json)
      refreshList()
      setNotices([
        isZh ? `已导入预设 "${preset.name}"` : `Imported preset "${preset.name}"`,
        ...warnings,
      ])
      setShowImport(false)
    },
    [refreshList, isZh],
  )

  const handleReset = useCallback(async () => {
    if (!await dialog.confirm({
      title: isZh ? '恢复默认配置？' : 'Restore defaults?',
      message: isZh ? '当前未保存的更改将丢失。' : 'Current unsaved changes will be lost.',
      confirmLabel: isZh ? '恢复默认' : 'Restore defaults',
      cancelLabel: isZh ? '取消' : 'Cancel',
      tone: 'warning',
    })) return
    onReset()
    onClose()
  }, [dialog, onReset, onClose, isZh])

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-label={isZh ? '预设管理' : 'Preset manager'}>
      <div
        onClick={onClose}
        className="modal-backdrop"
      />

      <div className="modal-card">
        <div className="modal-card__header">
          <div>
            <p className="eyebrow">Workspace presets</p>
            <h2>{isZh ? '预设管理' : 'Preset manager'}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-button"
            aria-label={isZh ? '关闭预设管理' : 'Close preset manager'}
          >
            ✕
          </button>
        </div>

        {notices.length > 0 && (
          <div className="modal-notices" role="status">
            {notices.map((n, i) => (
              <div
                key={i}
                className="modal-notice"
              >
                {n}
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <ToolbarButton label={isZh ? '+ 新建预设' : '+ New preset'} onClick={handleCreate} />
          <ToolbarButton label={isZh ? '另存当前为…' : 'Save current as…'} onClick={handleSaveAs} />
          <ToolbarButton label={isZh ? '导入 JSON' : 'Import JSON'} onClick={() => setShowImport(true)} />
          <div style={{ flex: 1 }} />
          <ToolbarButton label={isZh ? '恢复默认' : 'Restore defaults'} onClick={handleReset} danger />
        </div>

        <div className="modal-card__content">
          <PresetList
            builtinPresets={builtinPresets}
            userPresets={userPresets}
            catalog={catalog}
            onApplyBuiltin={handleApplyBuiltin}
            onApply={handleApply}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOverwrite={handleOverwrite}
            onRename={handleRename}
            onExport={handleExport}
          />
        </div>

        {/* Editor dialog */}
        {showEditor && (
          <PresetEditorDialog
            preset={editingPreset}
            saveAsMode={saveAsMode}
            onSave={handleEditorSave}
            onClose={() => setShowEditor(false)}
          />
        )}

        {/* Import dialog */}
        {showImport && (
          <PresetImportDialog
            onImport={handleImport}
            onClose={() => setShowImport(false)}
          />
        )}
      </div>
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  danger,
}: {
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 12px',
        fontSize: 12,
        background: danger ? 'rgba(255,107,107,0.15)' : 'var(--bg-input)',
        border: `1px solid ${danger ? 'var(--error)' : 'var(--border)'}`,
        borderRadius: 4,
        cursor: 'pointer',
        color: danger ? 'var(--error)' : 'var(--text)',
      }}
    >
      {label}
    </button>
  )
}
