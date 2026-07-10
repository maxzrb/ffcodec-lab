// ============================================================
// ProjectConfig — the single source of truth for user choices.
// Command text is derived from this, never parsed back.
// ============================================================

export type ShellKind = 'bash' | 'powershell' | 'cmd'

export interface ProjectConfig {
  schemaVersion: number
  shell: ShellKind
  input: InputConfig
  output: OutputConfig
  streams: StreamSelectionConfig
  video: VideoConfig
  frame: FrameConfig
  audio: AudioConfig
  subtitle: SubtitleConfig
  customArgs: CustomArgsConfig
}

export interface InputConfig {
  path: string
  additionalInputs: AdditionalInputConfig[]
}

export interface AdditionalInputConfig {
  path: string
  label?: string
  purpose: 'subtitle' | 'attachment' | 'concat' | 'other'
}

export interface OutputConfig {
  path: string
  containerId: string
  overwrite: boolean
}

export interface StreamSelectionConfig {
  videoStreamIndex?: number
  audioStreamIndex?: number
  subtitleStreamIndex?: number
  preserveOtherVideoStreams: boolean
  preserveOtherAudioStreams: boolean
  preserveOtherSubtitleStreams: boolean
}

export interface VideoConfig {
  mode: 'encode' | 'copy' | 'disabled'
  encoderId?: string
  rateControl?: RateControlConfig
  preset?: string | number
  profile?: string
  tune?: string
  pixelFormat?: string
  gpuIndex?: number
  threads?: number
  specialParameters: Record<string, unknown>
}

export interface RateControlConfig {
  mode: import('../catalog/catalog-types').RateControlModeId
  qualityValue?: number
  bitrate?: string
  minRate?: string
  maxRate?: string
  bufferSize?: string
  additionalValues: Record<string, unknown>
}

export type ResolutionConfig =
  | { mode: 'source' }
  | { mode: 'size'; width: number; height: number; keepAspect: boolean }
  | { mode: 'width'; width: number }
  | { mode: 'height'; height: number }

export type FrameRateConfig =
  | { mode: 'source' }
  | { mode: 'value'; value: number }

export interface FrameConfig {
  resolution: ResolutionConfig
  frameRate: FrameRateConfig
}

export interface AudioConfig {
  mode: 'encode' | 'copy' | 'disabled'
  encoderId?: string
  bitrate?: string
  channelLayout?: string
  sampleRate?: number
  sampleFormat?: string
  qualityValues: Record<string, unknown>
}

export interface SubtitleConfig {
  mux: SubtitleMuxConfig
  burn: SubtitleBurnConfig
}

export interface SubtitleMuxConfig {
  enabled: boolean
  source: 'internal' | 'external'
  streamSelector?: string
  externalPath?: string
  codecMode: 'auto' | 'copy' | 'mov_text' | 'webvtt' | 'srt' | 'ass' | 'ssa'
  preserveOtherStreams: boolean
}

export interface SubtitleBurnConfig {
  enabled: boolean
  source: 'internal' | 'external'
  streamIndex?: number
  externalPath?: string
  filterKind: 'subtitles' | 'ass'
  style: SubtitleStyleConfig
  customForceStyle?: string
  customFilter?: string
}

export interface SubtitleStyleConfig {
  fontName?: string
  fontSize?: number
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikeOut?: boolean
  primaryColor?: string
  secondaryColor?: string
  outlineColor?: string
  backColor?: string
  borderStyle?: 1 | 3
  outline?: number
  shadow?: number
  alignment?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  marginL?: number
  marginR?: number
  marginV?: number
  spacing?: number
}

export interface CustomArgsConfig {
  globalArgs: string[]
  preInputArgs: string[]
  videoArgs: string[]
  audioArgs: string[]
  preOutputArgs: string[]
  tailArgs: string[]
}
