// ============================================================
// 文件型预设存储 — 每个预设一个独立 JSON 文件。
// presets/ 根目录下分两个子目录：
//   builtin/ — 内置种子预设
//   user/    — 用户新建/保存的预设
// 目录跟随偏好存储模式：portable 为程序目录/presets，
// user 为 %APPDATA%/FFCodec Lab/presets。
// 用户可直接编辑、新增、删除 JSON 文件来管理预设。
// ============================================================

import fs from 'node:fs'
import path from 'node:path'
import { shell } from 'electron'
import type { PresetFileScope } from '@ffcodec/platform-api'

const BUILTIN_DIR = 'builtin'
const USER_DIR = 'user'

/** 仅允许纯文件名（basename）且以 .json 结尾，防止路径穿越。 */
export function sanitizePresetFileName(fileName: string): string | null {
  if (typeof fileName !== 'string') return null
  const base = path.basename(fileName)
  if (base !== fileName || base.length === 0 || base.length > 120) return null
  if (base === '.' || base === '..') return null
  if (!base.toLowerCase().endsWith('.json')) return null
  if (base.includes('\0') || /[\\/]/.test(base)) return null
  return base
}

export interface PresetFileRecord {
  fileName: string
  content: string
  scope: PresetFileScope
}

export type PresetWriteResult =
  | { ok: true }
  | { ok: false; error: string }

export class PresetFileStore {
  constructor(private readonly presetsDir: string) {}

  getDirectory(): string {
    return this.presetsDir
  }

  private ensureDir(): void {
    fs.mkdirSync(this.presetsDir, { recursive: true })
    fs.mkdirSync(path.join(this.presetsDir, BUILTIN_DIR), { recursive: true })
    fs.mkdirSync(path.join(this.presetsDir, USER_DIR), { recursive: true })
  }

  /** 子目录路径。 */
  private scopeDir(scope: PresetFileScope): string {
    return path.join(this.presetsDir, scope === 'builtin' ? BUILTIN_DIR : USER_DIR)
  }

  /**
   * 首次访问时把旧版直接放在 presets/ 根目录的 JSON 文件迁移到子目录：
   * 内容含 builtin: true 的进入 builtin/，其余进入 user/。
   */
  private ensureStructure(): void {
    this.ensureDir()
    for (const name of fs.readdirSync(this.presetsDir)) {
      const fileName = sanitizePresetFileName(name)
      if (!fileName) continue
      const source = path.join(this.presetsDir, fileName)
      let scope: PresetFileScope = 'user'
      try {
        const parsed = JSON.parse(fs.readFileSync(source, 'utf8')) as { builtin?: unknown }
        if (parsed.builtin === true) scope = 'builtin'
      } catch {
        // 解析失败按用户预设迁移
      }
      const target = path.join(this.scopeDir(scope), fileName)
      if (fs.existsSync(target)) {
        // 目标已存在同名文件，删除旧根目录文件避免重复
        fs.rmSync(source, { force: true })
        continue
      }
      try {
        fs.renameSync(source, target)
      } catch {
        try {
          fs.copyFileSync(source, target)
          fs.rmSync(source, { force: true })
        } catch {
          // 迁移失败保持原状
        }
      }
    }
  }

  listAll(): PresetFileRecord[] {
    this.ensureStructure()
    const records: PresetFileRecord[] = []
    for (const scope of ['builtin', 'user'] as const) {
      for (const name of fs.readdirSync(this.scopeDir(scope))) {
        const fileName = sanitizePresetFileName(name)
        if (!fileName) continue
        try {
          const content = fs.readFileSync(path.join(this.scopeDir(scope), fileName), 'utf8')
          records.push({ fileName, content, scope })
        } catch {
          // 单个文件读取失败跳过，不阻断其他预设
        }
      }
    }
    return records
  }

  read(fileName: string, scope?: PresetFileScope): string | null {
    const safe = sanitizePresetFileName(fileName)
    if (!safe) return null
    const scopes: PresetFileScope[] = scope ? [scope] : ['user', 'builtin']
    for (const s of scopes) {
      try {
        const content = fs.readFileSync(path.join(this.scopeDir(s), safe), 'utf8')
        return content
      } catch {
        // 继续查找其他子目录
      }
    }
    return null
  }

  write(fileName: string, content: string, scope: PresetFileScope = 'user'): PresetWriteResult {
    const safe = sanitizePresetFileName(fileName)
    if (!safe) return { ok: false, error: '无效的预设文件名' }
    try {
      this.ensureStructure()
      const target = path.join(this.scopeDir(scope), safe)
      const tmp = `${target}.tmp`
      fs.writeFileSync(tmp, content, 'utf8')
      fs.renameSync(tmp, target)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  delete(fileName: string, scope?: PresetFileScope): { ok: boolean; error?: string } {
    const safe = sanitizePresetFileName(fileName)
    if (!safe) return { ok: false, error: '无效的预设文件名' }
    const scopes: PresetFileScope[] = scope ? [scope] : ['user', 'builtin']
    for (const s of scopes) {
      try {
        fs.unlinkSync(path.join(this.scopeDir(s), safe))
        return { ok: true }
      } catch {
        // 继续尝试其他子目录
      }
    }
    return { ok: false, error: '预设文件不存在' }
  }

  reveal(): boolean {
    try {
      this.ensureStructure()
      shell.showItemInFolder(this.presetsDir)
      return true
    } catch {
      return false
    }
  }
}

/**
 * 切换存储模式时把旧预设目录中的 JSON 文件复制到新目录（不删除旧的）。
 * 同时复制 builtin/ 与 user/ 子目录，并把旧版根目录遗留文件归入新目录 user/。
 */
export function migratePresetsDir(oldDir: string, newDir: string): void {
  try {
    if (oldDir === newDir) return
    if (!fs.existsSync(oldDir)) return
    fs.mkdirSync(newDir, { recursive: true })

    // 复制两个子目录
    for (const scope of ['builtin', 'user'] as const) {
      const oldSub = path.join(oldDir, scope)
      if (!fs.existsSync(oldSub)) continue
      const newSub = path.join(newDir, scope)
      fs.mkdirSync(newSub, { recursive: true })
      for (const name of fs.readdirSync(oldSub)) {
        const fileName = sanitizePresetFileName(name)
        if (!fileName) continue
        const target = path.join(newSub, fileName)
        if (fs.existsSync(target)) continue
        try {
          fs.copyFileSync(path.join(oldSub, fileName), target)
        } catch {
          // 单个文件复制失败继续
        }
      }
    }

    // 旧版根目录遗留文件复制到 user/
    const legacyTargetDir = path.join(newDir, USER_DIR)
    fs.mkdirSync(legacyTargetDir, { recursive: true })
    for (const name of fs.readdirSync(oldDir)) {
      const fileName = sanitizePresetFileName(name)
      if (!fileName) continue
      const target = path.join(legacyTargetDir, fileName)
      if (fs.existsSync(target)) continue
      try {
        fs.copyFileSync(path.join(oldDir, fileName), target)
      } catch {
        // 单个文件复制失败继续
      }
    }
  } catch {
    // 迁移失败不影响主流程
  }
}
