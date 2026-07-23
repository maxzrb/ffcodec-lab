import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { validateBeforeExecution } from './validation'
import type { ExecutionPlan } from './types'

const tempDirs: string[] = []

afterEach(() => {
  for (const dir of tempDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true })
})

function nullOutputPlan(): ExecutionPlan {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ffcodec-validation-'))
  tempDirs.push(dir)
  const inputPath = path.join(dir, 'input.mkv')
  fs.writeFileSync(inputPath, 'test', 'utf8')
  return {
    args: ['-i', inputPath, '-f', 'null', '-'],
    inputPaths: [inputPath],
    outputPaths: [],
  }
}

describe('FFmpeg execution validation', () => {
  it('仅在显式允许时接受 pass 1 的空输出路径数组', () => {
    const plan = nullOutputPlan()

    expect(validateBeforeExecution(plan, 'replace', { allowNullOutput: true })).toEqual({
      ok: true,
      errors: [],
    })
    expect(validateBeforeExecution(plan, 'replace').errors).toContain(
      'Execution plan has no output path. For pass-1 null output this is expected; for single-pass it is an error.',
    )
  })
})
