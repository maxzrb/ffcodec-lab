/**
 * Reads a value from an object by dot-path.
 * Supports arrays: numeric indices access by position; non-numeric keys
 * search for matching `id` property in the array.
 */
export function getByPath(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (Array.isArray(current)) {
      const numIndex = Number(part)
      if (Number.isFinite(numIndex) && numIndex >= 0) {
        current = current[numIndex]
      } else {
        current = current.find((item: unknown) =>
          typeof item === 'object' && item !== null && (item as Record<string, unknown>).id === part
        )
      }
      continue
    }
    if (typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

/**
 * Immutably sets a value at a dot-path in an object.
 * Supports arrays: when navigating into an array property, the next path
 * segment identifies the target element by numeric index or (for non-numeric
 * segments) by `id` field match.
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

    if (Array.isArray(existing)) {
      const nextKey = parts[i + 1]
      const numIndex = Number(nextKey)
      let targetIndex: number
      if (Number.isFinite(numIndex) && numIndex >= 0) {
        targetIndex = numIndex
      } else {
        targetIndex = existing.findIndex((item: unknown) =>
          typeof item === 'object' && item !== null && (item as Record<string, unknown>).id === nextKey
        )
      }

      let element: Record<string, unknown>
      if (targetIndex >= 0 && targetIndex < existing.length) {
        element = { ...(existing[targetIndex] as Record<string, unknown>) }
        current[part] = [
          ...existing.slice(0, targetIndex),
          element,
          ...existing.slice(targetIndex + 1),
        ]
      } else {
        element = Number.isFinite(numIndex) ? {} : { id: nextKey }
        current[part] = [...existing, element]
      }
      current = element
      i++ // skip the element-identifier part
      continue
    }

    // Original logic — unchanged
    if (typeof existing === 'object' && existing !== null) {
      current[part] = { ...(existing as Record<string, unknown>) }
    } else {
      current[part] = {}
    }
    current = current[part] as Record<string, unknown>
  }

  current[parts[parts.length - 1]] = value
  return result as unknown as T
}
