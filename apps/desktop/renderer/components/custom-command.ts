export interface ParsedCustomCommand {
  args: string[]
  inputPaths: string[]
  outputPaths: string[]
}

export type CustomCommandParseResult =
  | { ok: true; plan: ParsedCustomCommand }
  | { ok: false; error: string }

/**
 * 将用户命令拆成 FFmpeg 参数。只解析引号，不调用任何系统 Shell。
 * 未加引号的 Shell 运算符会被拒绝，避免界面语义与实际执行方式不一致。
 */
export function parseCustomFfmpegCommand(command: string): CustomCommandParseResult {
  const tokens: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null

  for (let index = 0; index < command.length; index += 1) {
    const character = command[index]
    if (quote) {
      if (character === quote) quote = null
      else if (character === '\\' && command[index + 1] === quote) {
        current += quote
        index += 1
      } else current += character
      continue
    }
    if (character === '"' || character === "'") {
      quote = character
      continue
    }
    if ('|;&<>'.includes(character)) {
      return { ok: false, error: '不支持管道、重定向或命令连接符；自定义命令只会直接运行 FFmpeg。' }
    }
    if (/\s/.test(character)) {
      if (current) { tokens.push(current); current = '' }
    } else current += character
  }
  if (quote) return { ok: false, error: '命令中存在未闭合的引号。' }
  if (current) tokens.push(current)
  if (tokens[0] === '&') tokens.shift()
  const executable = tokens.shift()
  if (!executable || !/(^|[\\/])ffmpeg(?:\.exe)?$/i.test(executable) && !/^ffmpeg(?:\.exe)?$/i.test(executable)) {
    return { ok: false, error: '命令必须以 ffmpeg 或 ffmpeg.exe 开头。' }
  }
  if (tokens.length === 0) return { ok: false, error: 'FFmpeg 命令没有参数。' }

  const inputPaths: string[] = []
  for (let index = 0; index < tokens.length - 1; index += 1) {
    if (tokens[index] === '-i' && tokens[index + 1]) inputPaths.push(tokens[index + 1])
  }
  if (inputPaths.length === 0) return { ok: false, error: '自定义命令至少需要一个 -i 输入文件。' }
  const outputPath = tokens.at(-1)
  if (!outputPath || outputPath === '-' || outputPath.startsWith('-')) {
    return { ok: false, error: '命令末尾必须是本地输出文件路径。' }
  }
  return { ok: true, plan: { args: tokens, inputPaths, outputPaths: [outputPath] } }
}
