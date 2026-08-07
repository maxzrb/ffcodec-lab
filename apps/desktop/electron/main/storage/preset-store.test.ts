import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'

const shellMock = vi.hoisted(() => ({ showItemInFolder: vi.fn() }))

vi.mock('electron', () => ({
  shell: { showItemInFolder: shellMock.showItemInFolder },
}))

import {
  PresetFileStore,
  migratePresetsDir,
  sanitizePresetFileName,
} from './preset-store'

describe('sanitizePresetFileName', () => {
  it('接受普通 JSON 文件名', () => {
    expect(sanitizePresetFileName('my-preset.json')).toBe('my-preset.json')
    expect(sanitizePresetFileName('内置预设.json')).toBe('内置预设.json')
  })

  it('拒绝路径穿越与非法字符', () => {
    expect(sanitizePresetFileName('../evil.json')).toBeNull()
    expect(sanitizePresetFileName('..\\evil.json')).toBeNull()
    expect(sanitizePresetFileName('C:\\x\\y.json')).toBeNull()
    expect(sanitizePresetFileName('a/b.json')).toBeNull()
  })

  it('拒绝非 JSON 或空文件名', () => {
    expect(sanitizePresetFileName('a.txt')).toBeNull()
    expect(sanitizePresetFileName('')).toBeNull()
    expect(sanitizePresetFileName('.')).toBeNull()
  })
})

describe('PresetFileStore', () => {
  let dir: string
  let store: PresetFileStore

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'preset-store-'))
    store = new PresetFileStore(dir)
  })

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })

  it('write / read / listAll / delete 往返（默认 user/）', () => {
    expect(store.write('a.json', '{"name":"A"}')).toEqual({ ok: true })
    expect(store.read('a.json')).toBe('{"name":"A"}')
    expect(store.listAll()).toEqual([{ fileName: 'a.json', content: '{"name":"A"}', scope: 'user' }])
    expect(fs.existsSync(path.join(dir, 'user', 'a.json'))).toBe(true)
    expect(store.delete('a.json')).toEqual({ ok: true })
    expect(store.read('a.json')).toBeNull()
    expect(store.listAll()).toEqual([])
  })

  it('内置预设写入 builtin/，用户预设写入 user/，listAll 带 scope', () => {
    expect(store.write('seed.json', '{"builtin":true}', 'builtin')).toEqual({ ok: true })
    expect(store.write('mine.json', '{}')).toEqual({ ok: true })
    expect(fs.existsSync(path.join(dir, 'builtin', 'seed.json'))).toBe(true)
    expect(fs.existsSync(path.join(dir, 'user', 'mine.json'))).toBe(true)
    expect(store.listAll().sort((a, b) => a.fileName.localeCompare(b.fileName))).toEqual([
      { fileName: 'mine.json', content: '{}', scope: 'user' },
      { fileName: 'seed.json', content: '{"builtin":true}', scope: 'builtin' },
    ])
    expect(store.read('seed.json', 'builtin')).toBe('{"builtin":true}')
    expect(store.read('seed.json', 'user')).toBeNull()
  })

  it('首次访问时把旧版根目录遗留 JSON 按 builtin 标记迁移到子目录', () => {
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'old-builtin.json'), '{"builtin":true}', 'utf8')
    fs.writeFileSync(path.join(dir, 'old-user.json'), '{"name":"x"}', 'utf8')

    const records = store.listAll()
    expect(records).toHaveLength(2)
    expect(records.find((r) => r.fileName === 'old-builtin.json')?.scope).toBe('builtin')
    expect(records.find((r) => r.fileName === 'old-user.json')?.scope).toBe('user')
    expect(fs.existsSync(path.join(dir, 'old-builtin.json'))).toBe(false)
    expect(fs.existsSync(path.join(dir, 'old-user.json'))).toBe(false)
  })

  it('拒绝非法文件名写入或删除', () => {
    expect(store.write('../x.json', '{}').ok).toBe(false)
    expect(store.write('x.txt', '{}').ok).toBe(false)
    expect(store.delete('../x.json').ok).toBe(false)
    expect(store.read('../x.json')).toBeNull()
  })

  it('getDirectory 返回构造目录', () => {
    expect(store.getDirectory()).toBe(dir)
  })

  it('migratePresetsDir 复制两个子目录且不覆盖已有文件', () => {
    const newDir = path.join(os.tmpdir(), `preset-store-target-${Date.now()}`)
    try {
      store.write('a.json', '{"a":1}')
      store.write('seed.json', '{"builtin":true}', 'builtin')
      fs.mkdirSync(newDir, { recursive: true })
      fs.mkdirSync(path.join(newDir, 'user'), { recursive: true })
      fs.writeFileSync(path.join(newDir, 'user', 'a.json'), '{"keep":1}', 'utf8')
      store.write('b.json', '{"b":2}')

      migratePresetsDir(dir, newDir)

      expect(JSON.parse(fs.readFileSync(path.join(newDir, 'user', 'a.json'), 'utf8'))).toEqual({ keep: 1 })
      expect(JSON.parse(fs.readFileSync(path.join(newDir, 'user', 'b.json'), 'utf8'))).toEqual({ b: 2 })
      expect(JSON.parse(fs.readFileSync(path.join(newDir, 'builtin', 'seed.json'), 'utf8'))).toEqual({ builtin: true })
    } finally {
      fs.rmSync(newDir, { recursive: true, force: true })
    }
  })

  it('migratePresetsDir 把旧版根目录遗留文件复制到新目录 user/', () => {
    const newDir = path.join(os.tmpdir(), `preset-store-target2-${Date.now()}`)
    try {
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(path.join(dir, 'legacy.json'), '{"name":"old"}', 'utf8')
      migratePresetsDir(dir, newDir)
      expect(JSON.parse(fs.readFileSync(path.join(newDir, 'user', 'legacy.json'), 'utf8'))).toEqual({ name: 'old' })
    } finally {
      fs.rmSync(newDir, { recursive: true, force: true })
    }
  })
})
