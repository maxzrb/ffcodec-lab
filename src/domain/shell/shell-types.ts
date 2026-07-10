import type { CommandPlan } from '../command/command-ast'

export interface RenderedCommand {
  text: string
  segments: RenderedSegment[]
}

export interface RenderedSegment {
  text: string
  originId: string
  argumentId: string
}

export type ShellRenderer = (plan: CommandPlan) => RenderedCommand
