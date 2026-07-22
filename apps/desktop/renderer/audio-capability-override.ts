let enabled = false
const listeners = new Set<(value: boolean) => void>()

export function getAudioCapabilityOverride(): boolean {
  return enabled
}

export function setAudioCapabilityOverride(value: boolean): void {
  enabled = value
  for (const listener of listeners) listener(enabled)
}

export function onAudioCapabilityOverrideChange(listener: (value: boolean) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
