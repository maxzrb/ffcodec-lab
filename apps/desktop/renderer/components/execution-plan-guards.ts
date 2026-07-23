import type { ExecutionPlan } from '@ffcodec/command-plan'

/** 判断结构化执行计划是否具备可运行的输入和最终文件输出。 */
export function canRunExecutionPlans(plans: ExecutionPlan[], hasErrors: boolean): boolean {
  if (hasErrors || plans.length === 0) return false
  if (plans.some((plan) => plan.inputPaths.length === 0)) return false

  // 双遍第一遍的 null muxer 输出为 "-"，真正的文件输出必须存在于后续计划。
  return plans.some((plan) => plan.outputPaths.some((outputPath) => outputPath && outputPath !== '-'))
}
