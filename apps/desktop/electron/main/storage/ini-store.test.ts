import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'

const mocks = vi.hoisted(() => ({
  // 模块顶层 currentMode = readMode() 在 import 时执行，需要默认路径避免 undefined
  getUserData: vi.fn(() => `${process.env.TEMP ?? process.env.TMP ?? '/tmp'}/ffcodec-userdata-init`),
  getAllWindows: vi.fn(() => []),
}))

vi.mock('electron', () => ({
  app: { getPath: mocks.getUserData },
  BrowserWindow: { getAllWindows: mocks.getAllWindows },
}))

import {
  getIniPath,
  getMode,
  getPresetsDir,
  initStore,
  setItem,
  switchMode,
} from './ini-store'

const MODE_FILENAME = 'storage-mode.json'
const INI_FILENAME = 'ffcodec-config.ini'

let appDir: string
let userDataDir: string
let fakeHome: string
let homedirSpy: ReturnType<typeof vi.spyOn>
const originalExecPath = process.execPath

beforeEach(() => {
  appDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ffcodec-app-'))
  userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ffcodec-userdata-'))
  fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ffcodec-home-'))
  mocks.getUserData.mockReturnValue(userDataDir)
  Object.defineProperty(process, 'execPath', {
    value: path.join(appDir, 'FFCodec Lab.exe'),
    configurable: true,
  })
  homedirSpy = vi.spyOn(os, 'homedir').mockReturnValue(fakeHome)
})

afterEach(() => {
  Object.defineProperty(process, 'execPath', { value: originalExecPath, configurable: true })
  homedirSpy.mockRestore()
  for (const d of [appDir, userDataDir, fakeHome]) {
    fs.rmSync(d, { recursive: true, force: true })
  }
})

const userIniPath = () => path.join(fakeHome, 'AppData', 'Roaming', 'FFCodec Lab', INI_FILENAME)

describe('ini-store 存储模式', () => {
  it('无任何标记且程序目录无便携数据时默认用户模式', () => {
    initStore()
    expect(getMode()).toBe('user')
    expect(getIniPath()).toBe(userIniPath())
    expect(getPresetsDir()).toBe(path.join(path.dirname(userIniPath()), 'presets'))
  })

  it('程序目录标记为 portable 时进入便携模式且路径跟随程序目录', () => {
    fs.writeFileSync(path.join(appDir, MODE_FILENAME), JSON.stringify({ mode: 'portable' }), 'utf8')
    initStore()
    expect(getMode()).toBe('portable')
    expect(getIniPath()).toBe(path.join(appDir, INI_FILENAME))
    expect(getPresetsDir()).toBe(path.join(appDir, 'presets'))
  })

  it('旧版 AppData 标记一次性迁移到程序目录', () => {
    fs.writeFileSync(path.join(userDataDir, MODE_FILENAME), JSON.stringify({ mode: 'portable' }), 'utf8')
    initStore()
    expect(getMode()).toBe('portable')
    expect(fs.existsSync(path.join(appDir, MODE_FILENAME))).toBe(true)
    const migrated = JSON.parse(fs.readFileSync(path.join(appDir, MODE_FILENAME), 'utf8')) as { mode?: string }
    expect(migrated.mode).toBe('portable')
  })

  it('程序目录存在便携 INI 且无标记时自动进入便携模式并补写标记', () => {
    fs.mkdirSync(appDir, { recursive: true })
    fs.writeFileSync(path.join(appDir, INI_FILENAME), '; FFCodec Lab User Preferences\r\n', 'utf8')
    initStore()
    expect(getMode()).toBe('portable')
    expect(fs.existsSync(path.join(appDir, MODE_FILENAME))).toBe(true)
  })

  it('switchMode 把标记写入程序目录并迁移 INI', () => {
    initStore()
    expect(getMode()).toBe('user')
    setItem('pref', '1')
    expect(fs.existsSync(userIniPath())).toBe(true)

    const result = switchMode('portable')
    expect(result.ok).toBe(true)
    expect(getMode()).toBe('portable')
    expect(fs.existsSync(path.join(appDir, MODE_FILENAME))).toBe(true)
    expect(fs.existsSync(path.join(appDir, INI_FILENAME))).toBe(true)
    // 旧用户 INI 备份为 .old
    expect(fs.existsSync(`${userIniPath()}.old`)).toBe(true)
  })
})
