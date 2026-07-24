import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  access: vi.fn(),
  execFile: vi.fn(),
}))

vi.mock('electron', () => ({
  app: {
    isPackaged: false,
    getPath: vi.fn(() => ''),
  },
}))

vi.mock('fs/promises', () => ({
  access: mocks.access,
  readdir: vi.fn(async () => []),
  stat: vi.fn(),
}))

vi.mock('child_process', () => ({
  execFile: mocks.execFile,
}))

import { detectFilterCapabilities, tryFFmpegPath } from './ffmpeg-detect'

describe('FFmpeg executable detection', () => {
  beforeEach(() => {
    mocks.access.mockResolvedValue(undefined)
    mocks.execFile.mockReset()
  })

  it('accepts git snapshot versions reported by ffmpeg', async () => {
    mockVersionOutput('ffmpeg version git-2026-07-14-312c830916 Copyright (c) 2000-2026 the FFmpeg developers\r\n')

    const result = await tryFFmpegPath('C:\\FFmpeg\\ffmpeg.exe', 'bundled')

    expect(result).toMatchObject({
      found: true,
      version: 'git-2026-07-14-312c830916',
      source: 'bundled',
    })
  })

  it('rejects ffprobe even when the executable exits successfully', async () => {
    mockVersionOutput('ffprobe version git-2026-07-14-312c830916 Copyright (c) 2007-2026 the FFmpeg developers\r\n')

    const result = await tryFFmpegPath('C:\\FFmpeg\\ffprobe.exe', 'bundled')

    expect(result).toMatchObject({
      found: false,
      path: 'C:\\FFmpeg\\ffprobe.exe',
      source: 'bundled',
      error: 'Executable did not identify itself as FFmpeg',
    })
  })

  it('parses version output written to stderr', async () => {
    mockVersionOutput('', 'ffmpeg version 8.1.2 Copyright (c) 2000-2026 the FFmpeg developers\n')

    const result = await tryFFmpegPath('ffmpeg.exe', 'path')

    expect(result).toMatchObject({ found: true, version: '8.1.2', source: 'path' })
  })

  it('reads registered filter names from the selected FFmpeg', async () => {
    mocks.execFile.mockImplementation((_file, args, _options, callback) => {
      if (args.includes('-version')) {
        callback(null, 'ffmpeg version 8.1.2 Copyright (c) 2000-2026 the FFmpeg developers\n', '')
      } else {
        callback(null, [
          'Filters:',
          ' .. zscale            V->V       Apply resizing and colorspace conversion.',
          ' .S libplacebo        N->V       Apply GPU filters from libplacebo.',
        ].join('\n'), '')
      }
      return undefined
    })

    const result = await detectFilterCapabilities('C:\\FFmpeg\\ffmpeg.exe')

    expect(result?.filters).toEqual(['zscale', 'libplacebo'])
  })
})

function mockVersionOutput(stdout: string, stderr = '') {
  mocks.execFile.mockImplementation((_file, _args, _options, callback) => {
    callback(null, stdout, stderr)
    return undefined
  })
}
