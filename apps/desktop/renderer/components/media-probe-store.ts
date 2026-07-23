import { useSyncExternalStore } from 'react'
import type { ProbeResult } from './media-probe-model'

export interface MediaProbeSnapshot {
  inputPath: string | null
  result: ProbeResult | null
  focusRequest: number
}

let snapshot: MediaProbeSnapshot = {
  inputPath: null,
  result: null,
  focusRequest: 0,
}

const listeners = new Set<() => void>()

function updateSnapshot(patch: Partial<MediaProbeSnapshot>) {
  snapshot = { ...snapshot, ...patch }
  listeners.forEach((listener) => listener())
}

export function getMediaProbeSnapshot(): MediaProbeSnapshot {
  return snapshot
}

export function subscribeMediaProbe(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function useMediaProbeSnapshot(): MediaProbeSnapshot {
  return useSyncExternalStore(subscribeMediaProbe, getMediaProbeSnapshot, getMediaProbeSnapshot)
}

export function setMediaProbeResult(inputPath: string, result: ProbeResult): void {
  updateSnapshot({ inputPath, result })
}

export function clearMediaProbeResult(): void {
  updateSnapshot({ inputPath: null, result: null })
}

export function requestMediaProbeFocus(): void {
  updateSnapshot({ focusRequest: snapshot.focusRequest + 1 })
}
