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
  /** 要保留的相对视频流索引，例如 [0, 2] 对应 0:v:0 与 0:v:2。 */
  videoStreamIndexes: number[]
  /** 要保留的相对音频流索引，例如 [0, 1] 对应 0:a:0 与 0:a:1。 */
  audioStreamIndexes: number[]
  /** 旧配置兼容字段；新界面使用 videoStreamIndexes。 */
  videoStreamIndex?: number
  /** 旧配置兼容字段；新界面使用 audioStreamIndexes。 */
  audioStreamIndex?: number
  /** 要保留的相对字幕流索引，例如 [0, 2] 对应 0:s:0 与 0:s:2。 */
  subtitleStreamIndexes: number[]
  /** 旧配置兼容字段；新界面使用 subtitleStreamIndexes。 */
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
  /** 输出流色彩标记；未设置的字段不进入命令。 */
  color?: VideoColorConfig
  specialParameters: Record<string, unknown>
}

export interface VideoColorConfig {
  range?: 'tv' | 'pc'
  space?: string
  primaries?: string
  transfer?: string
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
  filters?: AdvancedVideoFiltersConfig
}

export interface AdvancedVideoFiltersConfig {
  crop: {
    enabled: boolean
    width: number
    height: number
    x: number
    y: number
  }
  transform: {
    rotate: 'none' | 'clockwise' | 'counterclockwise' | '180'
    horizontalFlip: boolean
    verticalFlip: boolean
  }
  adjustment: {
    enabled: boolean
    brightness: number
    contrast: number
    saturation: number
    gamma: number
  }
  deinterlace: {
    enabled: boolean
    mode: 'send_frame' | 'send_field'
    parity: 'auto' | 'tff' | 'bff'
  }
  sharpen: {
    enabled: boolean
    amount: number
  }
  denoise: {
    enabled: boolean
    algorithm?: 'hqdn3d' | 'nlmeans' | 'atadenoise' | 'bm3d'
    values: Record<string, number>
  }
  deband: {
    enabled: boolean
    algorithm?: 'deband' | 'gradfun'
    values: Record<string, number | boolean>
  }
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
