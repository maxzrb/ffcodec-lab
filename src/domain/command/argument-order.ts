import type { CommandArg, CommandInvocation } from './command-ast'
import { sortArgsByPhase } from './command-ast'

/**
 * Flattens an entire invocation into ordered token segments for rendering.
 * The shell renderer uses this to produce the final command text.
 */
export interface OrderedToken {
  text: string
  originId: string
  argId: string
  unsafe?: boolean
}

export function flattenInvocation(inv: CommandInvocation): OrderedToken[] {
  const tokens: OrderedToken[] = []

  // Executable
  tokens.push({ text: 'ffmpeg', originId: 'system', argId: 'executable' })

  // Global args
  for (const arg of sortArgsByPhase(inv.globalArgs)) {
    for (const t of arg.tokens) {
      tokens.push({
        text: t,
        originId: arg.originId,
        argId: arg.id,
        unsafe: arg.unsafe,
      })
    }
  }

  // Inputs with their pre-args
  for (const input of inv.inputs) {
    for (const arg of sortArgsByPhase(input.argsBeforeInput)) {
      for (const t of arg.tokens) {
        tokens.push({
          text: t,
          originId: arg.originId,
          argId: arg.id,
          unsafe: arg.unsafe,
        })
      }
    }
    tokens.push({ text: '-i', originId: input.originId, argId: `${input.id}.flag` })
    tokens.push({ text: input.path, originId: input.originId, argId: input.id })
  }

  // Output args — collect and sort
  const outputArgs = collectAndSortOutput(inv.output)
  for (const arg of outputArgs) {
    for (const t of arg.tokens) {
      tokens.push({
        text: t,
        originId: arg.originId,
        argId: arg.id,
        unsafe: arg.unsafe,
      })
    }
  }

  // Output path
  tokens.push({ text: inv.output.path, originId: 'output.path', argId: 'output.path' })

  return tokens
}

function collectAndSortOutput(output: InvocationOutput): CommandArg[] {
  const groups: CommandArg[][] = [
    output.maps ?? [],
    output.codecArgs ?? [],
    output.qualityArgs ?? [],
    output.filterArgs ?? [],
    output.audioArgs ?? [],
    output.subtitleArgs ?? [],
    output.muxerArgs ?? [],
    output.customArgs ?? [],
  ]
  return sortArgsByPhase(groups.flat())
}

type InvocationOutput = CommandInvocation['output']
