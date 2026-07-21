import type { ArgumentPhase } from '../catalog/catalog-types'
import type { Diagnostic } from '../rules/rule-types'

// ============================================================
// Command AST — structured representation of an ffmpeg command.
// The ONLY way command text is produced.
// ============================================================

export interface CommandPlan {
  invocations: CommandInvocation[]
  messages: Diagnostic[]
}

export interface CommandInvocation {
  executable: 'ffmpeg'
  globalArgs: CommandArg[]
  inputs: InputSpec[]
  output: OutputSpec
  purpose: 'single-pass' | 'pass-1' | 'pass-2'
}

export interface InputSpec {
  id: string
  argsBeforeInput: CommandArg[]
  path: string
  originId: string
}

export interface OutputSpec {
  maps: CommandArg[]
  codecArgs: CommandArg[]
  qualityArgs: CommandArg[]
  filterArgs: CommandArg[]
  audioArgs: CommandArg[]
  subtitleArgs: CommandArg[]
  metadataArgs: CommandArg[]
  muxerArgs: CommandArg[]
  customArgs: CommandArg[]
  /** 输出文件路径之后的危险自定义 token。 */
  tailArgs?: CommandArg[]
  path: string
}

export interface CommandArg {
  id: string
  originId: string
  phase: ArgumentPhase
  tokens: string[]
  explanationId?: string
  unsafe?: boolean
}

// Phase order for sorting
export const PHASE_ORDER: readonly ArgumentPhase[] = [
  'GLOBAL',
  'PRE_INPUT',
  'INPUT',
  'MAP',
  'VIDEO_CODEC',
  'VIDEO_PROFILE',
  'VIDEO_RATE_CONTROL',
  'VIDEO_COLOR',
  'VIDEO_FILTER',
  'AUDIO_CODEC',
  'AUDIO_QUALITY',
  'SUBTITLE',
  'METADATA',
  'MUXER',
  'CUSTOM_OUTPUT',
  'OUTPUT',
] as const

const phaseRank: Record<ArgumentPhase, number> = Object.freeze(
  Object.fromEntries(PHASE_ORDER.map((p, i) => [p, i])) as Record<ArgumentPhase, number>
)

/**
 * Sorts command arguments by their declared phase.
 */
export function sortArgsByPhase(args: CommandArg[]): CommandArg[] {
  return [...args].sort((a, b) => (phaseRank[a.phase] ?? 99) - (phaseRank[b.phase] ?? 99))
}

/**
 * Collects and sorts all output args into a flat, phase-ordered list.
 */
export function collectOutputArgs(output: OutputSpec): CommandArg[] {
  const groups: CommandArg[][] = [
    output.maps,
    output.codecArgs,
    output.qualityArgs,
    output.filterArgs,
    output.audioArgs,
    output.subtitleArgs,
    output.metadataArgs,
    output.muxerArgs,
    output.customArgs,
  ]

  const all = groups.flat()
  return sortArgsByPhase(all)
}
