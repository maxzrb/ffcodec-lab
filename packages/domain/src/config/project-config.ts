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
  tools: UtilityToolsConfig
  customArgs: CustomArgsConfig
}

/** 独立于编码参数面板的实用工具配置。 */
export interface UtilityToolsConfig {
  targetSize: TargetSizeToolConfig
}

/**
 * 目标文件大小工具。目标大小和时长是用户约束，视频码率始终由它们派生，
 * 不写回 rateControl.bitrate，关闭工具后原质量控制设置可完整恢复。
 */
export interface TargetSizeToolConfig {
  enabled: boolean
  /** 目标文件大小，使用二进制 MiB（1 MiB = 1024 × 1024 bytes）。 */
  targetMiB: number
  /** 完整输入时长，单位为分钟。 */
  durationMinutes: number
  /** 为容器、字幕、元数据和码率波动预留的比例。 */
  overheadPercent: number
  /** 无法自动推导时，手工填写全部输出音轨的总码率。 */
  manualAudioBitrateKbps?: number
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
  /** 自定义元数据；全局作用于整个文件，流级作用于指定流。 */
  metadata?: MetadataConfig
}

export interface MetadataConfig {
  /** 全局元数据原始文本，每行 key=value → -metadata key=value */
  globalRaw: string
  /** 流级元数据原始文本，每行 stream_type:index:key=value → -metadata:s:v/a/s:N key=value */
  streamRaw: string
}

export interface StreamMapEntry {
  /** 类型内相对流索引（0=v:0, 1=v:1）。 */
  index: number
  /** 编码模式：encode（参与编码）或 copy（原样复制）。默认 encode。 */
  codecMode: 'encode' | 'copy'
}

export interface StreamSelectionConfig {
  /** 逐流映射：视频流列表，每项含 index + codecMode。默认 [{index:0, codecMode:'encode'}]。 */
  videoStreams: StreamMapEntry[]
  /** 逐流映射：音频流列表。 */
  audioStreams: StreamMapEntry[]
  /** 逐流映射：字幕流列表。 */
  subtitleStreams: StreamMapEntry[]

  /** 保留全部视频流（默认 true）。开启时使用 -map 0:v? 覆盖逐流选择，编码参数不加流选择符。 */
  preserveAllVideoStreams?: boolean
  /** 保留全部音频流（默认 true）。开启时使用 -map 0:a? 覆盖逐流选择。 */
  preserveAllAudioStreams?: boolean
  /** 保留全部字幕流（默认 true）。开启时使用 -map 0:s? 覆盖逐流选择。 */
  preserveAllSubtitleStreams?: boolean

  // ---- 旧字段（仅用于迁移兼容，新代码不应直接读写） ----
  /** @deprecated 迁移至 preserveAllVideoStreams */
  videoStreamIndexes?: number[]
  /** @deprecated 迁移至 preserveAllAudioStreams + audioStreams */
  audioStreamIndexes?: number[]
  /** @deprecated 迁移至 videoStreams */
  videoStreamIndex?: number
  /** @deprecated 迁移至 audioStreams */
  audioStreamIndex?: number
  /** @deprecated 迁移至 subtitleStreams */
  subtitleStreamIndexes?: number[]
  /** @deprecated 迁移至 subtitleStreams */
  subtitleStreamIndex?: number
  /** @deprecated 迁移至 preserveAllVideoStreams */
  preserveOtherVideoStreams?: boolean
  /** @deprecated 迁移至 preserveAllAudioStreams */
  preserveOtherAudioStreams?: boolean
  /** @deprecated 迁移至 preserveAllSubtitleStreams */
  preserveOtherSubtitleStreams?: boolean
}

export interface VideoConfig {
  mode: 'encode' | 'copy' | 'disabled'
  codecCategory?: string
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
  /** 元数据、实际转换和输出标记之间的关系。 */
  operation?: 'metadata-only' | 'convert-and-tag' | 'convert-only'
  /** 色彩转换滤镜；zscale 为 CPU，libplacebo 需要对应 FFmpeg 构建。 */
  filter?: 'zscale' | 'libplacebo'
  /** 在色彩转换前先统一像素格式。 */
  preFormat?: string
  /** none 表示只转换色彩空间，不进行动态范围压缩。 */
  toneMap?: 'none' | 'auto' | 'clip' | 'st2094-40' | 'st2094-10' | 'bt.2390' | 'bt.2446a' | 'spline' | 'reinhard' | 'mobius' | 'hable' | 'gamma' | 'linear'
  /** CPU tonemap 的去饱和强度。 */
  desaturation?: number
  /** zscale 线性化阶段使用的标称峰值亮度。 */
  nominalPeak?: number
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
  /**
   * `scale=-2:-2` 是 FFmpeg 合法的自动偶数尺寸写法，因此所有手工缩放模式都允许对应边留空。
   * 只有用户明确输入的边才是显式尺寸，并参与奇数尺寸诊断。
   */
  | { mode: 'size'; width?: number; height?: number; keepAspect: boolean }
  | { mode: 'width'; width?: number }
  | { mode: 'height'; height?: number }

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
  loudnessNormalization: {
    integratedLoudnessEnabled: boolean
    integratedLoudness: number
    loudnessRangeEnabled: boolean
    loudnessRange: number
    truePeakEnabled: boolean
    truePeak: number
    dualMono: boolean
  }
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
