import { describe, expect, it } from 'vitest'
import { canRunExecutionPlans } from './execution-plan-guards'
import type { ExecutionPlan } from '@ffcodec/command-plan'

function plan(outputPath: string, inputPath = 'input.mkv'): ExecutionPlan {
  return {
    args: ['-i', inputPath, outputPath],
    inputPaths: [inputPath],
    outputPaths: [outputPath],
  }
}

describe('execution plan guards', () => {
  it('允许双遍第一遍使用 null muxer，只要后续计划有真实输出', () => {
    expect(canRunExecutionPlans([{ ...plan('-'), outputPaths: [] }, plan('output.mp4')], false)).toBe(true)
  })

  it('拒绝没有真实文件输出的计划', () => {
    expect(canRunExecutionPlans([{ ...plan('-'), outputPaths: [] }], false)).toBe(false)
  })

  it('配置存在错误时拒绝运行', () => {
    expect(canRunExecutionPlans([plan('output.mp4')], true)).toBe(false)
  })
})
