import { describe, it, expect } from 'vitest'
import { videoEncoders } from '@ffcodec/catalog/data/encoders/video'
import { audioEncoders } from '@ffcodec/catalog/data/encoders/audio'
import { isValidConfigPath, configPath, CONFIG_PATHS } from '@ffcodec/domain/config/config-path'

describe('Capability catalog', () => {
  it('all video encoders have valid family and implementation', () => {
    const VALID_FAMILIES = ['h264', 'hevc', 'av1', 'vvc', 'vp8', 'vp9', 'avs', 'avs2', 'avs3', 'ffv1', 'prores', 'other']
    const VALID_IMPLS = ['software', 'nvidia', 'intel', 'amd', 'apple', 'other']
    for (const enc of Object.values(videoEncoders)) {
      expect(VALID_FAMILIES).toContain(enc.family)
      expect(VALID_IMPLS).toContain(enc.implementation)
    }
  })

  it('all audio encoders have valid family and implementation', () => {
    const VALID_FAMILIES = [
      'aac', 'opus', 'flac', 'mp3', 'alac', 'ac3', 'eac3', 'vorbis', 'wavpack', 'pcm', 'other',
    ]
    for (const enc of Object.values(audioEncoders)) {
      expect(VALID_FAMILIES).toContain(enc.family)
      expect(enc.implementation).toBe('software')
    }
  })

  it('hardware encoders have availabilityClass=hardware-dependent', () => {
    for (const enc of Object.values(videoEncoders)) {
      if (enc.implementation === 'nvidia') {
        expect(enc.availabilityClass).toBe('hardware-dependent')
        expect(enc.capabilityScope?.hardware?.length).toBeGreaterThan(0)
      }
    }
  })

  it('software encoders declare a supported availability class', () => {
    for (const enc of [...Object.values(videoEncoders), ...Object.values(audioEncoders)]) {
      if (enc.implementation === 'software') {
        expect([
          'ffmpeg-build-dependent', 'platform-dependent', 'generally-available', 'experimental',
        ]).toContain(enc.availabilityClass)
      }
    }
  })

  it('lossless encoders may have zero quality modes', () => {
    const flac = audioEncoders['flac']
    expect(flac).toBeDefined()
    expect(flac.capabilities.supportsLossless).toBe(true)
    expect(flac.qualityModes.length).toBe(0)
  })

  it('NVENC encoders have capabilityScope with hardware requirements', () => {
    const nvenc = videoEncoders['h264_nvenc']
    expect(nvenc).toBeDefined()
    expect(nvenc.capabilityScope?.hardware).toBeDefined()
    expect(nvenc.capabilityScope!.hardware!.length).toBeGreaterThan(0)
    for (const hw of nvenc.capabilityScope!.hardware!) {
      expect(hw.vendor).toBe('nvidia')
      expect(hw.feature).toBeTruthy()
    }
  })

  // ConfigPath
  it('configPath() constructs valid paths', () => {
    const path = configPath(['video', 'encoderId'])
    expect(path).toBe('video.encoderId')
  })

  it('configPath() rejects __proto__', () => {
    expect(() => configPath(['video', '__proto__'])).toThrow()
  })

  it('configPath() rejects prototype and constructor', () => {
    expect(() => configPath(['prototype'])).toThrow()
    expect(() => configPath(['constructor'])).toThrow()
  })

  it('isValidConfigPath validates paths', () => {
    expect(isValidConfigPath('video.mode')).toBe(true)
    expect(isValidConfigPath('__proto__')).toBe(false)
    expect(isValidConfigPath('video.__proto__')).toBe(false)
  })

  it('CONFIG_PATHS has expected keys', () => {
    expect(CONFIG_PATHS.video.encoderId).toBe('video.encoderId')
    expect(CONFIG_PATHS.video.rateControl.qualityValue).toBe('video.rateControl.qualityValue')
    expect(CONFIG_PATHS.output.containerId).toBe('output.containerId')
  })
})
