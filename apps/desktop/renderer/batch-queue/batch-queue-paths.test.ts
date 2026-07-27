import { describe, expect, it } from 'vitest'
import { deriveOutputInSourceDirectory, deriveOutputPath, ensureUniqueOutputPath } from './batch-queue-paths'

describe('batch queue output paths', () => {
  it('keeps a single-file output beside the source with the selected container extension', () => {
    expect(deriveOutputInSourceDirectory('D:\\Media\\concert.take.mkv', 'mp4'))
      .toBe('D:\\Media\\concert.take-ffcodec.mp4')
  })

  it('can route batch outputs into a chosen directory', () => {
    expect(deriveOutputPath('D:\\Imports\\clip.mov', 'E:\\Exports', '.webm'))
      .toBe('E:\\Exports\\clip-ffcodec.webm')
  })

  it('adds a suffix for case-insensitive output collisions', () => {
    expect(ensureUniqueOutputPath('D:\\Exports\\clip-ffcodec.mp4', ['d:\\exports\\CLIP-FFCODEC.MP4']))
      .toBe('D:\\Exports\\clip-ffcodec-2.mp4')
  })
})
