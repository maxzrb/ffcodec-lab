import type { ContainerDefinition } from '@ffcodec/domain/catalog/catalog-types'

const ALL_AUDIO_ENCODERS = [
  'aac', 'libfdk_aac', 'aac_at', 'libopus', 'opus', 'libmp3lame', 'flac', 'alac', 'alac_at',
  'ac3', 'eac3', 'dca', 'truehd', 'tta', 'wavpack', 'libvorbis', 'vorbis', 'mp2', 'libtwolame',
  'real_144', 'libopencore_amrnb', 'libvo_amrwbenc', 'ilbc_at',
  'pcm_s16le', 'pcm_s32le', 'pcm_s64le', 'pcm_f64le', 'pcm_alaw_at', 'pcm_mulaw_at',
  'copy',
]

function audioCompatibility(
  supported: string[],
  caveats: string[] = [],
): ContainerDefinition['audioCodecs'] {
  return Object.fromEntries(ALL_AUDIO_ENCODERS.map((id) => [
    id,
    supported.includes(id) ? 'supported' : caveats.includes(id) ? 'supported-with-caveat' : 'unsupported',
  ]))
}

const mp4: ContainerDefinition = {
  id: 'mp4',
  label: 'MP4',
  extension: 'mp4',
  videoCodecs: {
    libx264: 'supported',
    libx265: 'supported',
    libsvtav1: 'supported-with-caveat',
    libaom_av1: 'supported-with-caveat',
    libvvenc: 'supported-with-caveat',
    libvpx: 'unsupported',
    'libvpx-vp9': 'supported-with-caveat',
    mpeg2video: 'supported-with-caveat',
    mpeg4: 'supported',
    h264_nvenc: 'supported',
    hevc_nvenc: 'supported',
    h264_qsv: 'supported',
    hevc_qsv: 'supported',
    h264_amf: 'supported',
    hevc_amf: 'supported',
    h264_videotoolbox: 'supported',
    hevc_videotoolbox: 'supported',
    copy: 'supported',
  },
  audioCodecs: audioCompatibility(
    ['aac', 'libfdk_aac', 'aac_at', 'libmp3lame', 'alac', 'alac_at', 'ac3', 'eac3', 'copy'],
    ['libopus', 'flac'],
  ),
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
    libaom_av1: 'supported',
    libvvenc: 'supported-with-caveat',
    libvpx: 'supported',
    'libvpx-vp9': 'supported',
    mpeg2video: 'supported',
    mpeg4: 'supported',
    h264_nvenc: 'supported',
    hevc_nvenc: 'supported',
    h264_qsv: 'supported',
    hevc_qsv: 'supported',
    h264_amf: 'supported',
    hevc_amf: 'supported',
    h264_videotoolbox: 'supported',
    hevc_videotoolbox: 'supported',
    copy: 'supported',
  },
  audioCodecs: audioCompatibility(ALL_AUDIO_ENCODERS),
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
    libaom_av1: 'supported',
    libvvenc: 'unsupported',
    libvpx: 'supported',
    'libvpx-vp9': 'supported',
    mpeg2video: 'unsupported',
    mpeg4: 'unsupported',
    libx264: 'unsupported',
    libx265: 'unsupported',
    h264_nvenc: 'unsupported',
    hevc_nvenc: 'unsupported',
    h264_qsv: 'unsupported',
    hevc_qsv: 'unsupported',
    h264_amf: 'unsupported',
    hevc_amf: 'unsupported',
    h264_videotoolbox: 'unsupported',
    hevc_videotoolbox: 'unsupported',
    copy: 'supported',
  },
  audioCodecs: audioCompatibility(['libopus', 'opus', 'libvorbis', 'vorbis', 'copy']),
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
    libaom_av1: 'supported-with-caveat',
    libvvenc: 'supported-with-caveat',
    libvpx: 'unsupported',
    'libvpx-vp9': 'unsupported',
    mpeg2video: 'supported-with-caveat',
    mpeg4: 'supported',
    h264_nvenc: 'supported',
    hevc_nvenc: 'supported',
    h264_qsv: 'supported',
    hevc_qsv: 'supported',
    h264_amf: 'supported',
    hevc_amf: 'supported',
    h264_videotoolbox: 'supported',
    hevc_videotoolbox: 'supported',
    copy: 'supported',
  },
  audioCodecs: audioCompatibility(
    ['aac', 'libfdk_aac', 'aac_at', 'libmp3lame', 'alac', 'alac_at', 'ac3', 'eac3',
      'pcm_s16le', 'pcm_s32le', 'pcm_s64le', 'pcm_f64le', 'pcm_alaw_at', 'pcm_mulaw_at',
      'libopencore_amrnb', 'libvo_amrwbenc', 'ilbc_at', 'copy'],
    ['libopus', 'flac'],
  ),
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

const ogg: ContainerDefinition = {
  id: 'ogg',
  label: 'OGG',
  extension: 'ogg',
  videoCodecs: {
    copy: 'supported',
  },
  audioCodecs: audioCompatibility(['flac', 'libopus', 'opus', 'libvorbis', 'vorbis', 'copy']),
  subtitleCodecs: {
    copy: 'supported',
  },
  muxerArguments: [],
  sourceRefs: [
    {
      repository: 'FFmpeg/FFmpeg',
      snapshotDate: '2026-07-10',
      file: 'libavformat/oggparseflac.c',
      sourceType: 'ffmpeg-official',
      note: 'OGG 容器原生支持 FLAC 和 Opus 音频编码',
    },
  ],
}

const wav: ContainerDefinition = {
  id: 'wav',
  label: 'WAV',
  extension: 'wav',
  videoCodecs: { copy: 'unsupported' },
  audioCodecs: audioCompatibility([
    'pcm_s16le', 'pcm_s32le', 'pcm_s64le', 'pcm_f64le', 'pcm_alaw_at', 'pcm_mulaw_at', 'copy',
  ]),
  subtitleCodecs: { copy: 'unsupported' },
  muxerArguments: [],
  sourceRefs: [{
    repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-22',
    file: 'libavformat/wavenc.c', sourceType: 'ffmpeg-official',
    url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavformat/wavenc.c',
  }],
}

export const containers: Record<string, ContainerDefinition> = {
  mp4,
  mkv,
  webm,
  mov,
  ogg,
  wav,
}
