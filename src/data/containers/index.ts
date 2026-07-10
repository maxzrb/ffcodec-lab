import type { ContainerDefinition } from '../../domain/catalog/catalog-types'

const mp4: ContainerDefinition = {
  id: 'mp4',
  label: 'MP4',
  extension: 'mp4',
  videoCodecs: {
    libx264: 'supported',
    libx265: 'supported',
    libsvtav1: 'supported-with-caveat',
    copy: 'supported',
  },
  audioCodecs: {
    aac: 'supported',
    libopus: 'supported-with-caveat',
    copy: 'supported',
  },
  subtitleCodecs: {
    mov_text: 'supported',
    copy: 'supported',
    srt: 'unsupported',
    ass: 'unsupported',
    ssa: 'unsupported',
    webvtt: 'unsupported',
  },
  autoSubtitleResolverId: 'resolver.subtitle.mp4',
  muxerArguments: [],
  sourceRefs: [
    {
      repository: 'Lake1059/FFmpegFreeUI',
      branch: 'main',
      snapshotDate: '2026-07-10',
      file: 'src/databases/containers.json',
      symbol: 'mp4',
      sourceType: 'ffmpegfreeui',
    },
  ],
}

const mkv: ContainerDefinition = {
  id: 'mkv',
  label: 'MKV (Matroska)',
  extension: 'mkv',
  videoCodecs: {
    libx264: 'supported',
    libx265: 'supported',
    libsvtav1: 'supported',
    copy: 'supported',
  },
  audioCodecs: {
    aac: 'supported',
    libopus: 'supported',
    copy: 'supported',
  },
  subtitleCodecs: {
    copy: 'supported',
    srt: 'supported',
    ass: 'supported',
    ssa: 'supported',
    mov_text: 'supported',
    webvtt: 'supported',
  },
  autoSubtitleResolverId: 'resolver.subtitle.mkv',
  muxerArguments: [],
  sourceRefs: [
    {
      repository: 'Lake1059/FFmpegFreeUI',
      branch: 'main',
      snapshotDate: '2026-07-10',
      file: 'src/databases/containers.json',
      symbol: 'mkv',
      sourceType: 'ffmpegfreeui',
    },
  ],
}

const webm: ContainerDefinition = {
  id: 'webm',
  label: 'WebM',
  extension: 'webm',
  videoCodecs: {
    libsvtav1: 'supported',
    libx264: 'unsupported',
    libx265: 'unsupported',
    copy: 'supported',
  },
  audioCodecs: {
    libopus: 'supported',
    aac: 'unsupported',
    copy: 'supported',
  },
  subtitleCodecs: {
    webvtt: 'supported',
    copy: 'supported',
    srt: 'unsupported',
    ass: 'unsupported',
    ssa: 'unsupported',
    mov_text: 'unsupported',
  },
  autoSubtitleResolverId: 'resolver.subtitle.webm',
  muxerArguments: [],
  sourceRefs: [
    {
      repository: 'Lake1059/FFmpegFreeUI',
      branch: 'main',
      snapshotDate: '2026-07-10',
      file: 'src/databases/containers.json',
      symbol: 'webm',
      sourceType: 'ffmpegfreeui',
    },
  ],
}

const mov: ContainerDefinition = {
  id: 'mov',
  label: 'MOV (QuickTime)',
  extension: 'mov',
  videoCodecs: {
    libx264: 'supported',
    libx265: 'supported',
    libsvtav1: 'supported-with-caveat',
    copy: 'supported',
  },
  audioCodecs: {
    aac: 'supported',
    libopus: 'supported-with-caveat',
    copy: 'supported',
  },
  subtitleCodecs: {
    mov_text: 'supported',
    copy: 'supported',
    srt: 'unsupported',
    ass: 'unsupported',
    ssa: 'unsupported',
    webvtt: 'unsupported',
  },
  autoSubtitleResolverId: 'resolver.subtitle.mp4mov',
  muxerArguments: [],
  sourceRefs: [
    {
      repository: 'Lake1059/FFmpegFreeUI',
      branch: 'main',
      snapshotDate: '2026-07-10',
      file: 'src/databases/containers.json',
      symbol: 'mov',
      sourceType: 'ffmpegfreeui',
    },
  ],
}

export const containers: Record<string, ContainerDefinition> = {
  mp4,
  mkv,
  webm,
  mov,
}
