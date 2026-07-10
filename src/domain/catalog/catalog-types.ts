// ============================================================
// Catalog types — the data model for parameters, encoders,
// containers, explanations, and source references.
// All cross-referenced by ID; no hardcoded values in UI.
// ============================================================

// -- codec family & implementation -----------------------------

export type CodecFamily =
  | 'h264'
  | 'hevc'
  | 'av1'
  | 'vp9'
  | 'prores'
  | 'aac'
  | 'opus'
  | 'flac'
  | 'other'

export type EncoderImplementation =
  | 'software'
  | 'nvidia'
  | 'intel'
  | 'amd'
  | 'apple'
  | 'other'

// -- availability ----------------------------------------------

export type AvailabilityClass =
  | 'generally-available'
  | 'ffmpeg-build-dependent'
  | 'hardware-dependent'
  | 'driver-dependent'
  | 'platform-dependent'
  | 'experimental'
  | 'deprecated'

// -- capability scope ------------------------------------------

export interface HardwareRequirement {
  vendor: 'nvidia' | 'intel' | 'amd' | 'apple' | 'other'
  feature: string
  minimumGeneration?: string
  minimumDriver?: string
  operatingSystems?: string[]
  verificationLevel: VerificationLevel
  sourceRefs: SourceRef[]
}

export interface CapabilityScope {
  ffmpeg?: {
    minVersion?: string
    maxVersion?: string
    verifiedVersions?: string[]
  }
  library?: {
    name: string
    minVersion?: string
    maxVersion?: string
    verifiedVersions?: string[]
  }
  hardware?: HardwareRequirement[]
  buildRequirements?: string[]
  notes?: string[]
}

// -- source authority & verification ---------------------------

/**
 * Where the primary parameter data originated.
 * Distinct from VerificationLevel — a parameter may come from
 * FFmpegFreeUI but not yet be cross-verified against official docs.
 */
export type SourceAuthority =
  | 'ffmpeg-official'
  | 'encoder-official'
  | 'ffmpegfreeui'
  | 'community'
  | 'unknown'

/**
 * Degree of cross-verification against official documentation.
 * - official: confirmed against FFmpeg or encoder official docs
 * - cross-verified: confirmed against multiple independent sources
 * - project-derived: sourced from FFmpegFreeUI or internal analysis,
 *   not yet confirmed against official docs
 * - pending: not yet verified against any source
 * - deprecated: was once verified but known to be outdated
 */
export type VerificationLevel =
  | 'official'
  | 'cross-verified'
  | 'project-derived'
  | 'pending'
  | 'deprecated'

// -- source reference -----------------------------------------

export interface SourceRef {
  repository: string
  branch?: string
  snapshotDate: string
  file: string
  symbol?: string
  url?: string
  /** Legacy field — prefer sourceAuthority on the owning definition */
  sourceType: 'ffmpegfreeui' | 'ffmpeg-official' | 'encoder-official' | 'manual-note'
  note?: string
}

// -- rate control mode id --------------------------------------

export type RateControlModeId =
  | 'crf'
  | 'vbr'
  | 'cqp'
  | 'cbr'
  | 'twoPass'
  | 'nvenc-cq'
  | 'qsv-cqp'
  | 'qsv-icq'
  | 'qsv-la-icq'
  | 'qsv-vbr'
  | 'qsv-cbr'
  | 'qsv-la-vbr'

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
  /** Primary origin of the parameter data */
  sourceAuthority: SourceAuthority
  /** Degree of cross-verification against official docs */
  verificationLevel: VerificationLevel
  /** True when sourced from non-official channels and awaiting cross-verification */
  needsCrossVerification: boolean
  /** Per-parameter capability constraints (version, hardware, etc.) */
  capabilityScope?: CapabilityScope
  /** @deprecated — use verificationLevel instead */
  status: 'verified' | 'experimental' | 'unverified'
}

export interface CommandBinding {
  argName: string
  prefix?: string
  /** If true, value is appended directly after prefix with no space */
  compact?: boolean
  phase: ArgumentPhase
}

/**
 * Maps a control to its value location in ProjectConfig.
 * Used by getControlValue() in command-builder.ts to read
 * the current value without encoder-specific branches.
 */
export interface ConfigBinding {
  path: import('../config/config-path').ConfigPath
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
  /** Per-option capability constraints (e.g. specific preset requires driver version) */
  capabilityScope?: CapabilityScope
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
  family: CodecFamily
  implementation: EncoderImplementation
  /** Encoder-level availability classification */
  availabilityClass: AvailabilityClass
  /** Version, hardware, and build constraints */
  capabilityScope?: CapabilityScope
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
  sourceAuthority: SourceAuthority
  verificationLevel: VerificationLevel
  needsCrossVerification: boolean
  /** @deprecated — use verificationLevel instead */
  status: 'verified' | 'experimental' | 'unverified'
}

export interface ControlDefinition {
  id: string
  label: string
  commandBinding?: CommandBinding
  /** Maps this control to its value location in ProjectConfig */
  configBinding?: ConfigBinding
  control: 'select' | 'number' | 'text' | 'switch'
  options?: SelectOption[]
  range?: { min?: number; max?: number; step?: number }
  defaultValue?: unknown
  explanationId: string
  /** Per-control capability constraints (overrides encoder-level) */
  capabilityScope?: CapabilityScope
}

export interface RateControlModeDefinition {
  id: RateControlModeId
  label: string
  controls: ControlDefinition[]
  emitterId: string
  /** Extra args emitted before controls (e.g. -rc vbr for NVENC CQ) */
  modeArguments?: ArgumentTemplate[]
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
