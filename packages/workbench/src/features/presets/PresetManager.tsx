// ============================================================
// PresetManager — main preset management UI.
// Modal overlay with preset list, editor, and import dialogs.
// ============================================================

import { useState, useCallback, useEffect } from 'react'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'
import { usePlatform } from '@ffcodec/platform-api'
import type { UserPreset } from './preset-types'
import { getPresetService, getBuiltinPresets } from './preset-service'
import { BUILTIN_ORDER_KEY } from './preset-storage'
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

export function PresetManager({ onApply, onReset, currentConfig, onClose }: PresetManagerProps) {
  const { locale, text } = useI18n()
  const dialog = useAppDialog()
  const platform = usePlatform()
  const isZh = locale === 'zh-CN'
  // Desktop 注入外挂 JSON 预设文件存储；Web 不提供则保持内置 + localStorage
  const presetService = getPresetService(platform.extensions?.presetFileStore ?? null)
  const fileMode = presetService.hasFileStore()
  const [userPresets, setUserPresets] = useState<UserPreset[]>([])
  const [presetDirectory, setPresetDirectory] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingPreset, setEditingPreset] = useState<UserPreset | null>(null)
  const [saveAsMode, setSaveAsMode] = useState(false)
  const [notices, setNotices] = useState<string[]>([])

  // 文件模式下内置预设也来自 JSON 文件（含 builtin 标记），不再单独传硬编码
  const builtinPresets = fileMode ? [] : getBuiltinPresets()

  useEffect(() => {
    let cancelled = false
    void presetService.list().then((list) => {
      if (!cancelled) setUserPresets(list)
    }).catch(() => {})
    void presetService.getDirectory().then((dir) => {
      if (!cancelled) setPresetDirectory(dir)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [presetService])

  const [builtinOrder, setBuiltinOrder] = useState<number[]>(() => {
    if (fileMode) return []
    try {
      const raw = localStorage.getItem(BUILTIN_ORDER_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length === builtinPresets.length) return parsed
      }
    } catch { /* ignore */ }
    return builtinPresets.map((_, i) => i)
  })

  const saveBuiltinOrder = (order: number[]) => {
    try { localStorage.setItem(BUILTIN_ORDER_KEY, JSON.stringify(order)) } catch { /* ignore */ }
    setBuiltinOrder(order)
  }

  const handleMoveBuiltinUp = useCallback((index: number) => {
    const idx = builtinOrder.indexOf(index)
    if (idx <= 0) return
    const next = [...builtinOrder]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    saveBuiltinOrder(next)
  }, [builtinOrder])

  const handleMoveBuiltinDown = useCallback((index: number) => {
    const idx = builtinOrder.indexOf(index)
    if (idx < 0 || idx >= builtinOrder.length - 1) return
    const next = [...builtinOrder]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    saveBuiltinOrder(next)
  }, [builtinOrder])

  const refreshList = useCallback(async () => {
    try {
      const list = await presetService.list()
      setUserPresets(list)
    } catch (e) {
      setNotices([isZh ? `读取预设失败: ${String(e)}` : `Failed to load presets: ${String(e)}`])
    }
  }, [presetService, isZh])

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
    async (name: string, description: string) => {
      try {
        if (saveAsMode) {
          // Save-as: create new preset from current config
          await presetService.save({
            name,
            description,
            config: currentConfig,
          })
        } else if (editingPreset) {
          // Editing existing: update name/description
          const updated = await presetService.save({
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
          await presetService.save({
            name,
            description,
            config: currentConfig,
          })
        }
        await refreshList()
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
        await presetService.delete(id)
        await refreshList()
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
        const existing = await presetService.load(id)
        if (existing) {
          await presetService.save({
            id,
            name: existing.name,
            description: existing.description,
            config: currentConfig,
          })
          await refreshList()
          setNotices([isZh ? `预设 "${existing.name}" 已覆盖` : `Preset "${existing.name}" overwritten`])
        }
      } catch (e) {
        setNotices([isZh ? `覆盖失败: ${String(e)}` : `Overwrite failed: ${String(e)}`])
      }
    },
    [currentConfig, dialog, refreshList, isZh],
  )

  const handleRename = useCallback(
    async (id: string, newName: string) => {
      try {
        await presetService.rename(id, newName)
        await refreshList()
        setNotices([isZh ? `已重命名为 "${newName}"` : `Renamed to "${newName}"`])
      } catch (e) {
        setNotices([isZh ? `重命名失败: ${String(e)}` : `Rename failed: ${String(e)}`])
      }
    },
    [refreshList, isZh],
  )

  const handleExport = useCallback(async (id: string) => {
    try {
      const json = await presetService.export(id)
      if (!json) {
        setNotices([isZh ? '导出失败：预设不存在' : 'Export failed: preset not found'])
        return
      }
      const preset = await presetService.load(id)
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
    async (json: string) => {
      const { preset, warnings } = await presetService.importAndSave(json)
      await refreshList()
      setNotices([
        isZh ? `已导入预设 "${preset.name}"` : `Imported preset "${preset.name}"`,
        ...warnings.map(text),
      ])
      setShowImport(false)
    },
    [refreshList, isZh, text],
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

      <div className="modal-card modal-card--preset-manager">
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

        {fileMode && (
          <div
            className="modal-notice preset-file-hint"
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}
          >
            <span style={{ flex: '1 1 260px', fontSize: 12 }}>
              {isZh
                ? '预设以独立 JSON 文件存放于预设文件夹：内置预设放在 builtin/ 子文件夹，用户预设与新建预设放在 user/ 子文件夹。可直接编辑、新增或删除 JSON 文件（删除内置文件后不会自动恢复），然后点「刷新」。'
                : 'Presets are stored as individual JSON files: built-in presets live in the builtin/ subfolder, user presets in user/. You can edit, add, or delete JSON files directly (deleted built-in files are not restored), then click "Refresh".'}
              {presetDirectory && (
                <code style={{ display: 'block', fontSize: 11, opacity: 0.7, wordBreak: 'break-all', marginTop: 4 }}>
                  {presetDirectory}
                </code>
              )}
            </span>
            <ToolbarButton
              label={isZh ? '刷新' : 'Refresh'}
              onClick={() => { void refreshList().then(() => setNotices([isZh ? '已重新读取预设文件夹' : 'Presets reloaded'])) }}
            />
            <ToolbarButton
              label={isZh ? '打开预设文件夹' : 'Open presets folder'}
              onClick={() => { void presetService.revealDirectory() }}
            />
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
            builtinOrder={builtinOrder}
            catalog={catalog}
            onApplyBuiltin={handleApplyBuiltin}
            onApply={handleApply}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOverwrite={handleOverwrite}
            onRename={handleRename}
            onExport={handleExport}
            onMoveUp={(id) => { void presetService.moveOrder(id, 'up').then(refreshList).catch(() => {}) }}
            onMoveDown={(id) => { void presetService.moveOrder(id, 'down').then(refreshList).catch(() => {}) }}
            onMoveBuiltinUp={handleMoveBuiltinUp}
            onMoveBuiltinDown={handleMoveBuiltinDown}
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
