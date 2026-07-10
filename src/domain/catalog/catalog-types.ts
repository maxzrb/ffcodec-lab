// ============================================================
// Catalog types — the data model for parameters, encoders,
// containers, explanations, and source references.
// All cross-referenced by ID; no hardcoded values in UI.
// ============================================================

// -- source reference -----------------------------------------

export interface SourceRef {
  repository: string
  branch?: string
  snapshotDate: string
  file: string
  symbol?: string
  url?: string
  sourceType: 'ffmpegfreeui' | 'ffmpeg-official' | 'encoder-official' | 'manual-note'
  note?: string
}

// -- parameter definition -------------------------------------

export interface ParameterDefinition {
  id: string
  label: string
  group: string
  control: 'select' | 'number' | 'text' | 'switch' | 'multiselect' | 'color'
  commandBinding?: CommandBinding
  defaultValue?: unknown
  optionsSource?: OptionSource
  rangeSource?: RangeSource
  explanationId: string
  sourceRefs: SourceRef[]
  status: 'verified' | 'experimental' | 'unverified'
}

export interface CommandBinding {
  argName: string
  prefix?: string
  /** If true, value is appended directly after prefix with no space */
  compact?: boolean
  phase: ArgumentPhase
}

export interface OptionSource {
  type: 'static' | 'dynamic'
  /** Static option list */
  options?: SelectOption[]
  /** Dynamic source resolver ID */
  resolverId?: string
}

export interface SelectOption {
  value: string | number
  label: string
  description?: string
}

export interface RangeSource {
  min?: number
  max?: number
  step?: number
  /** Encoder-specific overrides keyed by encoderId */
  encoderOverrides?: Record<string, { min?: number; max?: number; step?: number }>
}

// -- argument phase (for ordering) ----------------------------

export type ArgumentPhase =
  | 'GLOBAL'
  | 'PRE_INPUT'
  | 'INPUT'
  | 'MAP'
  | 'VIDEO_CODEC'
  | 'VIDEO_PROFILE'
  | 'VIDEO_RATE_CONTROL'
  | 'VIDEO_FILTER'
  | 'AUDIO_CODEC'
  | 'AUDIO_QUALITY'
  | 'SUBTITLE'
  | 'METADATA'
  | 'MUXER'
  | 'CUSTOM_OUTPUT'
  | 'OUTPUT'

// -- encoder definition ---------------------------------------

export interface EncoderDefinition {
  id: string
  label: string
  ffmpegName: string
  mediaType: 'video' | 'audio' | 'image'
  family: string
  implementation: 'software' | 'nvidia' | 'intel' | 'amd' | 'other'
  availabilityNote?: string

  capabilities: {
    copy?: boolean
    disabled?: boolean
    supportsTwoPass?: boolean
    supportsLossless?: boolean
    supportedContainers?: string[]
  }

  preset?: ControlDefinition
  profile?: ControlDefinition
  tune?: ControlDefinition
  pixelFormat?: ControlDefinition
  qualityModes: RateControlModeDefinition[]
  specialParameters: ControlDefinition[]
  requiredArguments: ArgumentTemplate[]
  defaultArguments: ArgumentTemplate[]

  explanationId: string
  sourceRefs: SourceRef[]
  status: 'verified' | 'experimental' | 'unverified'
}

export interface ControlDefinition {
  id: string
  label: string
  commandBinding?: CommandBinding
  control: 'select' | 'number' | 'text' | 'switch'
  options?: SelectOption[]
  range?: { min?: number; max?: number; step?: number }
  defaultValue?: unknown
  explanationId: string
}

export interface RateControlModeDefinition {
  id: 'crf' | 'vbr' | 'cqp' | 'cbr' | 'twoPass'
  label: string
  controls: ControlDefinition[]
  emitterId: string
  recommendedValues?: RecommendedValue[]
  explanationId: string
  sourceRefs: SourceRef[]
}

export interface RecommendedValue {
  label: string
  value: number
  description: string
}

export interface ArgumentTemplate {
  argName: string
  value?: string | number
  condition?: string
  phase: ArgumentPhase
}

// -- container definition -------------------------------------

export type CompatibilityLevel =
  | 'supported'
  | 'supported-with-caveat'
  | 'transcode-recommended'
  | 'unsupported'
  | 'unknown'

export interface ContainerDefinition {
  id: string
  label: string
  extension: string
  videoCodecs: Record<string, CompatibilityLevel>
  audioCodecs: Record<string, CompatibilityLevel>
  subtitleCodecs: Record<string, CompatibilityLevel>
  autoSubtitleResolverId?: string
  muxerArguments: ArgumentTemplate[]
  sourceRefs: SourceRef[]
}

// -- explanation definition -----------------------------------

export interface ExplanationDefinition {
  id: string
  title: string
  short: string
  detail?: string
  commandExample?: string
  effects?: {
    quality?: 0 | 1 | 2 | 3 | 4 | 5
    fileSize?: 0 | 1 | 2 | 3 | 4 | 5
    speed?: 0 | 1 | 2 | 3 | 4 | 5
    compatibility?: 0 | 1 | 2 | 3 | 4 | 5
  }
  warnings?: string[]
  sourceRefs: SourceRef[]
}

// -- catalog aggregate ----------------------------------------

export interface Catalog {
  parameters: Record<string, ParameterDefinition>
  encoders: {
    video: Record<string, EncoderDefinition>
    audio: Record<string, EncoderDefinition>
    image: Record<string, EncoderDefinition>
  }
  containers: Record<string, ContainerDefinition>
  explanations: Record<string, ExplanationDefinition>
}
