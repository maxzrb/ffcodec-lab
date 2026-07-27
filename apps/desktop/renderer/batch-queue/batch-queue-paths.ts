// ============================================================
// 批处理队列输出路径推导。运行在 renderer，不能依赖 Node path。
// ============================================================

/** 取本地路径所在目录；既兼容 Windows 分隔符，也兼容 POSIX 分隔符。 */
export function getPathDirectory(filePath: string): string {
  const slashIndex = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'))
  return slashIndex >= 0 ? filePath.slice(0, slashIndex) : ''
}

/** 从本地路径中取文件名并去除最后一个扩展名。 */
export function getPathStem(filePath: string): string {
  const slashIndex = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'))
  const fileName = filePath.slice(slashIndex + 1)
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName
}

/** 是否是 Desktop 文件选择器通常返回的绝对本地路径。 */
export function isAbsoluteLocalPath(filePath: string): boolean {
  return /^[A-Za-z]:[\\/]/.test(filePath) || filePath.startsWith('\\\\') || filePath.startsWith('/')
}

/** 使用目标目录、输入文件名和容器扩展名生成不会覆盖源文件的默认输出。 */
export function deriveOutputPath(inputPath: string, directory: string, extension: string): string {
  const normalizedExtension = extension.replace(/^\.+/, '') || 'mp4'
  const separator = directory.includes('\\') || /^[A-Za-z]:/.test(directory) ? '\\' : '/'
  const normalizedDirectory = directory.replace(/[\\/]+$/, '')
  const prefix = normalizedDirectory ? `${normalizedDirectory}${separator}` : ''
  return `${prefix}${getPathStem(inputPath) || 'output'}-ffcodec.${normalizedExtension}`
}

/** 默认将结果写到原始媒体文件同目录。 */
export function deriveOutputInSourceDirectory(inputPath: string, extension: string): string {
  return deriveOutputPath(inputPath, getPathDirectory(inputPath), extension)
}

/** 为同一队列中的重名输出添加稳定的序号，路径比较忽略 Windows 大小写。 */
export function ensureUniqueOutputPath(desiredPath: string, usedPaths: Iterable<string>): string {
  const used = new Set(Array.from(usedPaths, (path) => path.toLocaleLowerCase()))
  if (!used.has(desiredPath.toLocaleLowerCase())) return desiredPath

  const dotIndex = desiredPath.lastIndexOf('.')
  const hasExtension = dotIndex > Math.max(desiredPath.lastIndexOf('/'), desiredPath.lastIndexOf('\\'))
  const base = hasExtension ? desiredPath.slice(0, dotIndex) : desiredPath
  const extension = hasExtension ? desiredPath.slice(dotIndex) : ''

  for (let index = 2; index < Number.MAX_SAFE_INTEGER; index++) {
    const candidate = `${base}-${index}${extension}`
    if (!used.has(candidate.toLocaleLowerCase())) return candidate
  }

  return desiredPath
}
