// ============================================================
// PresetManager — main preset management UI.
// Modal overlay with preset list, editor, and import dialogs.
// ============================================================

import { useState, useCallback } from 'react'
import type { ProjectConfig } from '../../domain/config/project-config'
import { loadCatalog } from '../../domain/catalog/catalog-loader'
import type { UserPreset } from './preset-types'
import { getPresetService, getBuiltinPresets } from './preset-service'
import { PresetList } from './PresetList'
import { PresetEditorDialog } from './PresetEditorDialog'
import { PresetImportDialog } from './PresetImportDialog'
import type { NormalizationNotice } from '../../domain/rules/rule-types'

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
            setNotices([`预设 "${updated.name}" 已更新`])
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
        setNotices([`保存失败: ${String(e)}`])
      }
    },
    [saveAsMode, editingPreset, currentConfig, refreshList],
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (!window.confirm('确定要删除此预设吗？此操作不可撤销。')) return
      try {
        presetService.delete(id)
        refreshList()
        setNotices(['预设已删除'])
      } catch (e) {
        setNotices([`删除失败: ${String(e)}`])
      }
    },
    [refreshList],
  )

  const handleOverwrite = useCallback(
    (id: string) => {
      if (!window.confirm('确定要用当前配置覆盖此预设吗？')) return
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
          setNotices([`预设 "${existing.name}" 已覆盖`])
        }
      } catch (e) {
        setNotices([`覆盖失败: ${String(e)}`])
      }
    },
    [currentConfig, refreshList],
  )

  const handleRename = useCallback(
    (id: string, newName: string) => {
      try {
        presetService.rename(id, newName)
        refreshList()
        setNotices([`已重命名为 "${newName}"`])
      } catch (e) {
        setNotices([`重命名失败: ${String(e)}`])
      }
    },
    [refreshList],
  )

  const handleExport = useCallback((id: string) => {
    try {
      const json = presetService.export(id)
      if (!json) {
        setNotices(['导出失败：预设不存在'])
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
      setNotices(['预设已导出为 JSON 文件'])
    } catch (e) {
      setNotices([`导出失败: ${String(e)}`])
    }
  }, [])

  const handleImport = useCallback(
    (json: string) => {
      try {
        const { preset, warnings } = presetService.importAndSave(json)
        refreshList()
        setNotices([
          `已导入预设 "${preset.name}"`,
          ...warnings,
        ])
        setShowImport(false)
      } catch (e) {
        throw e // Let the dialog handle display
      }
    },
    [refreshList],
  )

  const handleReset = useCallback(() => {
    if (!window.confirm('确定要恢复为默认配置吗？当前未保存的更改将丢失。')) return
    onReset()
    onClose()
  }, [onReset, onClose])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 20,
          width: 560,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          color: 'var(--text)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>预设管理</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: 'var(--text-dim)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Notices */}
        {notices.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            {notices.map((n, i) => (
              <div
                key={i}
                style={{
                  padding: '4px 8px',
                  fontSize: 12,
                  background: 'var(--bg-input)',
                  borderRadius: 4,
                  marginBottom: 4,
                }}
              >
                {n}
              </div>
            ))}
          </div>
        )}

        {/* Actions toolbar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <ToolbarButton label="+ 新建预设" onClick={handleCreate} />
          <ToolbarButton label="另存当前为…" onClick={handleSaveAs} />
          <ToolbarButton label="导入 JSON" onClick={() => setShowImport(true)} />
          <div style={{ flex: 1 }} />
          <ToolbarButton label="恢复默认" onClick={handleReset} danger />
        </div>

        {/* Preset list (scrollable) */}
        <div style={{ flex: 1, overflow: 'auto' }}>
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
