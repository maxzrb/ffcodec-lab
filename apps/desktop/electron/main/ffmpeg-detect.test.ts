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

import {
  detectFFmpegEncoderCapabilities,
  detectFilterCapabilities,
  parseEncoderNames,
  parseEncoderOptionNames,
  parseFilterNames,
  parseVideoCodecOptionNames,
  tryFFmpegPath,
} from './ffmpeg-detect'

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

  it('parses component tables without treating legend rows as components', () => {
    expect(parseEncoderNames([
      'Encoders:',
      ' V..... = Video',
      ' V....D h264_nvenc          NVIDIA NVENC H.264 encoder',
      ' A..... aac                 AAC (Advanced Audio Coding)',
    ].join('\n'))).toEqual(['h264_nvenc', 'aac'])

    expect(parseFilterNames([
      'Filters:',
      '  T.. = Timeline support',
      ' ..C zscale            V->V       Apply resizing.',
      ' .S. libplacebo        N->V       Apply GPU filters.',
    ].join('\n'))).toEqual(['zscale', 'libplacebo'])
  })

  it('parses encoder AVOptions but excludes enum value rows', () => {
    const result = parseEncoderOptionNames([
      'h264_nvenc AVOptions:',
      '  -preset            <int>        E..V....... Set the encoding preset',
      '     p1              12           E..V....... fastest',
      '  -multipass         <int>        E..V....... Set multipass mode',
      '     disabled        0            E..V....... Single pass',
    ].join('\n'))

    expect(result).toEqual(['-preset', '-multipass'])
  })

  it('parses generic video encoding options only from AVCodecContext help', () => {
    const result = parseVideoCodecOptionNames([
      'AVCodecContext AVOptions:',
      '  -bf               <int>        E..V....... set maximum number of B-frames',
      '  -g                <int>        E..V....... set the GOP size',
      '  -ar               <int>        E...A...... set audio sampling rate',
      '  -skip_frame       <int>        .D.V....... skip decoding frames',
      'h264_nvenc AVOptions:',
      '  -multipass        <int>        E..V....... Set multipass mode',
    ].join('\n'))

    expect(result).toEqual(['-bf', '-g'])
  })

  it('keeps private and generic video encoder options separated in runtime capabilities', async () => {
    mocks.execFile.mockImplementation((_file, args, options, callback) => {
      if (args.includes('-version')) {
        callback(null, 'ffmpeg version 9.0-test Copyright (c) 2000-2026 the FFmpeg developers\n', '')
      } else if (args.includes('encoder=h264_nvenc')) {
        callback(null, [
          'h264_nvenc AVOptions:',
          '  -preset            <int>        E..V....... Set the encoding preset',
          '  -multipass         <int>        E..V....... Set multipass mode',
        ].join('\n'), '')
      } else {
        expect(args).toEqual(['-hide_banner', '-h', 'full'])
        expect(options.maxBuffer).toBeGreaterThan(1024 * 1024)
        callback(null, [
          'AVCodecContext AVOptions:',
          '  -bf               <int>        E..V....... set maximum number of B-frames',
          'h264_nvenc AVOptions:',
          '  -multipass        <int>        E..V....... Set multipass mode',
        ].join('\n'), '')
      }
      return undefined
    })

    const result = await detectFFmpegEncoderCapabilities('h264_nvenc', 'C:\\FFmpeg-9-test')

    expect(result).toEqual({
      encoder: 'h264_nvenc',
      options: ['-preset', '-multipass'],
      videoCodecOptions: ['-bf'],
    })
  })
})

function mockVersionOutput(stdout: string, stderr = '') {
  mocks.execFile.mockImplementation((_file, _args, _options, callback) => {
    callback(null, stdout, stderr)
    return undefined
  })
}
