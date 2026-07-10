/**
 * Reads a value from an object by dot-path.
 * Example: getByPath(obj, 'video.rateControl.mode') → 'crf'
 */
export function getByPath(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

/**
 * Immutably sets a value at a dot-path in an object.
 * Returns a new object with the value replaced.
 */
export function setByPath<T>(obj: T, path: string, value: unknown): T {
  if (typeof obj !== 'object' || obj === null) return obj
  const parts = path.split('.')
  if (parts.length === 0) return obj

  const result = { ...obj }
  let current: Record<string, unknown> = result as unknown as Record<string, unknown>

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    const existing = current[part]
    if (typeof existing === 'object' && existing !== null && !Array.isArray(existing)) {
      current[part] = { ...(existing as Record<string, unknown>) }
    } else {
      current[part] = {}
    }
    current = current[part] as Record<string, unknown>
  }

  current[parts[parts.length - 1]] = value
  return result as unknown as T
}
