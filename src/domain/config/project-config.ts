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
  tracks: SubtitleTrackConfig[]
  burn: SubtitleBurnConfig
}

export interface SubtitleTrackConfig {
  /** Stable unique ID within this config */
  id: string
  /** Source of the subtitle stream */
  source: 'input' | 'external'
  /** For source='input': relative stream index in the main input (0=s:0, 1=s:1) */
  mainStreamRelIndex?: number
  /** For source='external': file path to subtitle file */
  path?: string
  /** For source='external': stream index within the external file (0=first subtitle) */
  externalStreamIndex?: number
  /** Whether to copy or transcode the subtitle stream */
  codecMode: 'copy' | 'transcode'
  /** Target codec when transcoding (mov_text, webvtt, srt, ass, ssa) */
  codec?: string
  /** Known source codec name; undefined when unknown */
  sourceCodec?: string
  /** Whether the source codec has been identified */
  sourceCodecKnown: boolean
  /** ISO 639-2 language code */
  language?: string
  /** Metadata title for the subtitle stream */
  title?: string
  /** Disposition flags */
  disposition: {
    default?: boolean
    forced?: boolean
    hearingImpaired?: boolean
  }
  /** Legacy compatibility field for migration */
  preserveOtherStreams?: boolean
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
