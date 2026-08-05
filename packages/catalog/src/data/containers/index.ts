import type { ContainerDefinition, CompatibilityLevel } from '@ffcodec/domain/catalog/catalog-types'

const ALL_AUDIO_ENCODERS = [
  'aac', 'libfdk_aac', 'aac_at', 'libopus', 'opus', 'libmp3lame', 'flac', 'alac', 'alac_at',
  'ac3', 'eac3', 'dca', 'truehd', 'tta', 'wavpack', 'libvorbis', 'vorbis', 'mp2', 'libtwolame',
  'real_144', 'libopencore_amrnb', 'libvo_amrwbenc', 'ilbc_at',
  'pcm_s16le', 'pcm_s32le', 'pcm_s64le', 'pcm_f64le', 'pcm_alaw_at', 'pcm_mulaw_at',
  'copy',
]

const ALL_VIDEO_ENCODERS = [
  'libx264', 'libx265', 'libsvtav1', 'libaom_av1', 'libvvenc', 'libvpx', 'libvpx-vp9',
  'mpeg2video', 'mpeg4', 'ffv1', 'prores_ks', 'cavs', 'libxavs2',
  'h264_nvenc', 'hevc_nvenc', 'av1_nvenc',
  'h264_qsv', 'hevc_qsv', 'av1_qsv',
  'h264_amf', 'hevc_amf', 'av1_amf',
  'h264_videotoolbox', 'hevc_videotoolbox',
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

function videoAll(level: CompatibilityLevel = 'supported'): ContainerDefinition['videoCodecs'] {
  return Object.fromEntries(ALL_VIDEO_ENCODERS.map((id) => [id, level]))
}

function videoNone(): ContainerDefinition['videoCodecs'] {
  return Object.fromEntries(ALL_VIDEO_ENCODERS.map((id) => [id, 'unsupported']))
}

function audioAll(): ContainerDefinition['audioCodecs'] {
  return audioCompatibility(ALL_AUDIO_ENCODERS)
}

function audioNone(): ContainerDefinition['audioCodecs'] {
  return audioCompatibility([])
}

function noSubtitles(): ContainerDefinition['subtitleCodecs'] {
  return { copy: 'unsupported' }
}

function passthroughSubtitles(): ContainerDefinition['subtitleCodecs'] {
  return { copy: 'supported' }
}

// ── 完整目录容器 ──

const mp4: ContainerDefinition = {
  id: 'mp4', label: 'MP4', extension: 'mp4',
  category: 'video',
  videoCodecs: {
    libx264: 'supported', libx265: 'supported',
    libsvtav1: 'supported-with-caveat', libaom_av1: 'supported-with-caveat',
    libvvenc: 'supported-with-caveat', libvpx: 'unsupported', 'libvpx-vp9': 'supported-with-caveat',
    mpeg2video: 'supported-with-caveat', mpeg4: 'supported',
    h264_nvenc: 'supported', hevc_nvenc: 'supported',
    h264_qsv: 'supported', hevc_qsv: 'supported',
    h264_amf: 'supported', hevc_amf: 'supported',
    h264_videotoolbox: 'supported', hevc_videotoolbox: 'supported',
    copy: 'supported',
  },
  audioCodecs: audioCompatibility(
    ['aac', 'libfdk_aac', 'aac_at', 'libmp3lame', 'alac', 'alac_at', 'ac3', 'eac3', 'copy'],
    ['libopus', 'flac'],
  ),
  subtitleCodecs: { mov_text: 'supported', copy: 'supported', srt: 'unsupported', ass: 'unsupported', ssa: 'unsupported', webvtt: 'unsupported' },
  autoSubtitleResolverId: 'resolver.subtitle.mp4', muxerArguments: [],
  sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-10', file: 'src/databases/containers.json', symbol: 'mp4', sourceType: 'ffmpegfreeui' }],
}

const mkv: ContainerDefinition = {
  id: 'mkv', label: 'MKV (Matroska)', extension: 'mkv',
  category: 'video',
  videoCodecs: { ...videoAll(), libvvenc: 'supported-with-caveat' as CompatibilityLevel },
  audioCodecs: audioAll(),
  subtitleCodecs: { copy: 'supported', srt: 'supported', ass: 'supported', ssa: 'supported', mov_text: 'supported', webvtt: 'supported' },
  autoSubtitleResolverId: 'resolver.subtitle.mkv', muxerArguments: [],
  sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-10', file: 'src/databases/containers.json', symbol: 'mkv', sourceType: 'ffmpegfreeui' }],
}

const webm: ContainerDefinition = {
  id: 'webm', label: 'WebM', extension: 'webm',
  category: 'video',
  videoCodecs: {
    libsvtav1: 'supported', libaom_av1: 'supported', libvpx: 'supported', 'libvpx-vp9': 'supported',
    libvvenc: 'unsupported', mpeg2video: 'unsupported', mpeg4: 'unsupported',
    libx264: 'unsupported', libx265: 'unsupported',
    h264_nvenc: 'unsupported', hevc_nvenc: 'unsupported',
    h264_qsv: 'unsupported', hevc_qsv: 'unsupported',
    h264_amf: 'unsupported', hevc_amf: 'unsupported',
    h264_videotoolbox: 'unsupported', hevc_videotoolbox: 'unsupported',
    copy: 'supported',
  },
  audioCodecs: audioCompatibility(['libopus', 'opus', 'libvorbis', 'vorbis', 'copy']),
  subtitleCodecs: { webvtt: 'supported', copy: 'supported', srt: 'unsupported', ass: 'unsupported', ssa: 'unsupported', mov_text: 'unsupported' },
  autoSubtitleResolverId: 'resolver.subtitle.webm', muxerArguments: [],
  sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-10', file: 'src/databases/containers.json', symbol: 'webm', sourceType: 'ffmpegfreeui' }],
}

const mov: ContainerDefinition = {
  id: 'mov', label: 'MOV (QuickTime)', extension: 'mov',
  category: 'video',
  videoCodecs: {
    libx264: 'supported', libx265: 'supported',
    libsvtav1: 'supported-with-caveat', libaom_av1: 'supported-with-caveat',
    libvvenc: 'supported-with-caveat', libvpx: 'unsupported', 'libvpx-vp9': 'unsupported',
    mpeg2video: 'supported-with-caveat', mpeg4: 'supported',
    h264_nvenc: 'supported', hevc_nvenc: 'supported',
    h264_qsv: 'supported', hevc_qsv: 'supported',
    h264_amf: 'supported', hevc_amf: 'supported',
    h264_videotoolbox: 'supported', hevc_videotoolbox: 'supported',
    copy: 'supported',
  },
  audioCodecs: audioCompatibility(
    ['aac', 'libfdk_aac', 'aac_at', 'libmp3lame', 'alac', 'alac_at', 'ac3', 'eac3',
      'pcm_s16le', 'pcm_s32le', 'pcm_s64le', 'pcm_f64le', 'pcm_alaw_at', 'pcm_mulaw_at',
      'libopencore_amrnb', 'libvo_amrwbenc', 'ilbc_at', 'copy'],
    ['libopus', 'flac'],
  ),
  subtitleCodecs: { mov_text: 'supported', copy: 'supported', srt: 'unsupported', ass: 'unsupported', ssa: 'unsupported', webvtt: 'unsupported' },
  autoSubtitleResolverId: 'resolver.subtitle.mp4mov', muxerArguments: [],
  sourceRefs: [{ repository: 'Lake1059/FFmpegFreeUI', branch: 'main', snapshotDate: '2026-07-10', file: 'src/databases/containers.json', symbol: 'mov', sourceType: 'ffmpegfreeui' }],
}

const ogg: ContainerDefinition = {
  id: 'ogg', label: 'OGG', extension: 'ogg',
  category: 'audio',
  videoCodecs: { copy: 'supported' },
  audioCodecs: audioCompatibility(['flac', 'libopus', 'opus', 'libvorbis', 'vorbis', 'copy']),
  subtitleCodecs: { copy: 'supported' }, muxerArguments: [],
  sourceRefs: [{ repository: 'FFmpeg/FFmpeg', snapshotDate: '2026-07-10', file: 'libavformat/oggparseflac.c', sourceType: 'ffmpeg-official' }],
}

const wav: ContainerDefinition = {
  id: 'wav', label: 'WAV', extension: 'wav',
  category: 'audio',
  videoCodecs: videoNone(),
  audioCodecs: audioCompatibility(['pcm_s16le', 'pcm_s32le', 'pcm_s64le', 'pcm_f64le', 'pcm_alaw_at', 'pcm_mulaw_at', 'copy']),
  subtitleCodecs: noSubtitles(), muxerArguments: [],
  sourceRefs: [{ repository: 'FFmpeg/FFmpeg', branch: 'master', snapshotDate: '2026-07-22', file: 'libavformat/wavenc.c', sourceType: 'ffmpeg-official', url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavformat/wavenc.c' }],
}

// ── 视频容器（轻量定义） ──

const flv: ContainerDefinition = { id: 'flv', label: 'FLV', extension: 'flv', category: 'video', videoCodecs: { libx264: 'supported', h264_nvenc: 'supported', copy: 'supported' }, audioCodecs: audioCompatibility(['aac', 'libmp3lame', 'copy']), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const m2ts: ContainerDefinition = { id: 'm2ts', label: 'M2TS (Blu-ray)', extension: 'm2ts', category: 'video', videoCodecs: { libx264: 'supported', h264_nvenc: 'supported', libx265: 'supported', hevc_nvenc: 'supported', copy: 'supported' }, audioCodecs: audioCompatibility(['aac', 'ac3', 'eac3', 'dca', 'truehd', 'pcm_s16le', 'copy']), subtitleCodecs: passthroughSubtitles(), muxerArguments: [], sourceRefs: [] }
const wmv: ContainerDefinition = { id: 'wmv', label: 'WMV', extension: 'wmv', category: 'video', videoCodecs: { copy: 'supported' }, audioCodecs: audioCompatibility(['copy']), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const avi: ContainerDefinition = { id: 'avi', label: 'AVI', extension: 'avi', category: 'video', videoCodecs: { libx264: 'supported', mpeg4: 'supported', copy: 'supported' }, audioCodecs: audioCompatibility(['libmp3lame', 'ac3', 'copy']), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const rmvb: ContainerDefinition = { id: 'rmvb', label: 'RMVB', extension: 'rmvb', category: 'video', videoCodecs: { copy: 'supported' }, audioCodecs: audioCompatibility(['copy']), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const ts: ContainerDefinition = { id: 'ts', label: 'MPEG-TS', extension: 'ts', category: 'video', videoCodecs: { libx264: 'supported', h264_nvenc: 'supported', libx265: 'supported', hevc_nvenc: 'supported', mpeg2video: 'supported', copy: 'supported' }, audioCodecs: audioCompatibility(['aac', 'libmp3lame', 'ac3', 'eac3', 'copy']), subtitleCodecs: passthroughSubtitles(), muxerArguments: [], sourceRefs: [] }
const _3gp: ContainerDefinition = { id: '3gp', label: '3GP', extension: '3gp', category: 'video', videoCodecs: { libx264: 'supported', h264_nvenc: 'supported', mpeg4: 'supported', copy: 'supported' }, audioCodecs: audioCompatibility(['aac', 'libopencore_amrnb', 'copy']), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }

// ── 音频容器 ──

const mp3: ContainerDefinition = { id: 'mp3', label: 'MP3', extension: 'mp3', category: 'audio', videoCodecs: videoNone(), audioCodecs: audioCompatibility(['libmp3lame', 'copy']), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const aacC: ContainerDefinition = { id: 'aac', label: 'AAC (Raw)', extension: 'aac', category: 'audio', videoCodecs: videoNone(), audioCodecs: audioCompatibility(['aac', 'libfdk_aac', 'copy']), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const opusC: ContainerDefinition = { id: 'opus-audio', label: 'Opus (Audio)', extension: 'opus', category: 'audio', videoCodecs: videoNone(), audioCodecs: audioCompatibility(['libopus', 'copy']), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const m4a: ContainerDefinition = { id: 'm4a', label: 'M4A', extension: 'm4a', category: 'audio', videoCodecs: videoNone(), audioCodecs: audioCompatibility(['aac', 'libfdk_aac', 'aac_at', 'alac', 'alac_at', 'copy']), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const flacC: ContainerDefinition = { id: 'flac', label: 'FLAC', extension: 'flac', category: 'audio', videoCodecs: videoNone(), audioCodecs: audioCompatibility(['flac', 'copy']), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const alacC: ContainerDefinition = { id: 'alac', label: 'ALAC', extension: 'alac', category: 'audio', videoCodecs: videoNone(), audioCodecs: audioCompatibility(['alac', 'copy']), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const aiff: ContainerDefinition = { id: 'aiff', label: 'AIFF', extension: 'aiff', category: 'audio', videoCodecs: videoNone(), audioCodecs: audioCompatibility(['pcm_s16le', 'pcm_s32le', 'copy']), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const ac3C: ContainerDefinition = { id: 'ac3', label: 'AC-3', extension: 'ac3', category: 'audio', videoCodecs: videoNone(), audioCodecs: audioCompatibility(['ac3', 'eac3', 'copy']), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const mka: ContainerDefinition = { id: 'mka', label: 'MKA (Matroska Audio)', extension: 'mka', category: 'audio', videoCodecs: videoNone(), audioCodecs: audioAll(), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }

// ── 图片容器 ──

const png: ContainerDefinition = { id: 'png', label: 'PNG', extension: 'png', category: 'image', videoCodecs: videoNone(), audioCodecs: audioNone(), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const jpg: ContainerDefinition = { id: 'jpg', label: 'JPEG', extension: 'jpg', category: 'image', videoCodecs: videoNone(), audioCodecs: audioNone(), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const jpeg: ContainerDefinition = { id: 'jpeg', label: 'JPEG (Full)', extension: 'jpeg', category: 'image', videoCodecs: videoNone(), audioCodecs: audioNone(), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const webp: ContainerDefinition = { id: 'webp', label: 'WebP', extension: 'webp', category: 'image', videoCodecs: videoNone(), audioCodecs: audioNone(), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const avif: ContainerDefinition = { id: 'avif', label: 'AVIF', extension: 'avif', category: 'image', videoCodecs: videoNone(), audioCodecs: audioNone(), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const bmp: ContainerDefinition = { id: 'bmp', label: 'BMP', extension: 'bmp', category: 'image', videoCodecs: videoNone(), audioCodecs: audioNone(), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const gif: ContainerDefinition = { id: 'gif', label: 'GIF', extension: 'gif', category: 'image', videoCodecs: videoNone(), audioCodecs: audioNone(), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }
const ico: ContainerDefinition = { id: 'ico', label: 'ICO', extension: 'ico', category: 'image', videoCodecs: videoNone(), audioCodecs: audioNone(), subtitleCodecs: noSubtitles(), muxerArguments: [], sourceRefs: [] }

export const containers: Record<string, ContainerDefinition> = {
  // ── 视频容器 ──
  mp4, mkv, webm, mov,
  flv, m2ts, wmv, avi, rmvb, ts, '3gp': _3gp,
  // ── 音频容器 ──
  ogg, wav,
  mp3, aac: aacC, 'opus-audio': opusC, m4a, flac: flacC, alac: alacC, aiff, ac3: ac3C, mka,
  // ── 图片容器 ──
  png, jpg, jpeg, webp, avif, bmp, gif, ico,
}
