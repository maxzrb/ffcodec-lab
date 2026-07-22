import { describe, expect, it } from 'vitest'
import { localizeJobError } from './encoding-job'
import { parseCustomFfmpegCommand } from './custom-command'

describe('parseCustomFfmpegCommand', () => {
  it('parses quoted Windows input and output paths without invoking a shell', () => {
    const result = parseCustomFfmpegCommand('ffmpeg -i "D:\\Media Files\\input.mkv" -c:v libx264 "D:\\Output Files\\result.mp4"')
    expect(result).toEqual({
      ok: true,
      plan: {
        args: ['-i', 'D:\\Media Files\\input.mkv', '-c:v', 'libx264', 'D:\\Output Files\\result.mp4'],
        inputPaths: ['D:\\Media Files\\input.mkv'],
        outputPaths: ['D:\\Output Files\\result.mp4'],
      },
    })
  })

  it('parses the initial generated command so filesystem validation can report placeholder paths', () => {
    const result = parseCustomFfmpegCommand('ffmpeg -i input.mkv -map "0:v:0?" -map "0:a:0?" -map "0:s?" -c:v libx265 -preset medium -crf 23 -c:a aac -b:a 192k -channel_layout:a stereo -ar 48000 output.mkv')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.plan.inputPaths).toEqual(['input.mkv'])
    expect(result.plan.outputPaths).toEqual(['output.mkv'])
  })

  it.each(['|', '&&', '>', ';'])('rejects unquoted shell operator %s', (operator) => {
    const result = parseCustomFfmpegCommand(`ffmpeg -i input.mkv ${operator} output.mp4`)
    expect(result.ok).toBe(false)
  })

  it('allows filter syntax inside quotes', () => {
    const result = parseCustomFfmpegCommand("ffmpeg -i input.mkv -filter_complex '[0:v]split[a];[a]null[out]' output.mkv")
    expect(result.ok).toBe(true)
  })

  it('rejects commands without a local output path', () => {
    expect(parseCustomFfmpegCommand('ffmpeg -i input.mkv -').ok).toBe(false)
  })
})

describe('localizeJobError', () => {
  it('translates an unreadable input error in the Chinese locale', () => {
    expect(localizeJobError('Input file not found or not readable: input.mkv', true))
      .toBe('找不到或无法读取输入文件：input.mkv')
  })

  it('keeps the original error in the English locale', () => {
    expect(localizeJobError('Input file not found or not readable: input.mkv', false))
      .toBe('Input file not found or not readable: input.mkv')
  })
})
