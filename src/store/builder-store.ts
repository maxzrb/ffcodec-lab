import { create } from 'zustand'
import type { ProjectConfig } from '../domain/config/project-config'
import { createDefaultProjectConfig } from '../domain/config/defaults'

// ============================================================
// Zustand store — holds ProjectConfig and UI session state.
// Does NOT hold derived values: field states, messages,
// command text, etc. are computed via the pipeline hook.
// ============================================================

interface BuilderState {
  // -- primary state --
  config: ProjectConfig

  // -- UI session state (NOT the derived command) --
  expandedSections: Record<string, boolean>
  selectedExplanationId: string | null

  // -- per-encoder session cache (not part of config) --
  encoderSessionCache: Record<string, Record<string, unknown>>

  // -- actions --
  setConfigValue: (path: string, value: unknown) => void
  applyConfigPatch: (patch: Partial<ProjectConfig>) => void
  setConfig: (config: ProjectConfig) => void
  resetSection: (sectionId: string) => void
  toggleSection: (sectionId: string) => void
  selectExplanation: (id: string | null) => void
  setEncoderCache: (encoderId: string, cache: Record<string, unknown>) => void
  resetConfig: () => void
}

export const useBuilderStore = create<BuilderState>((set) => ({
  config: createDefaultProjectConfig(),

  expandedSections: {
    video: true,
    quality: true,
    frame: false,
    audio: true,
    subtitle: false,
    container: false,
    custom: false,
  },

  selectedExplanationId: null,
  encoderSessionCache: {},

  // -- actions --
  setConfigValue: (path, value) =>
    set((state) => ({
      config: setByPath(state.config, path, value),
    })),

  applyConfigPatch: (patch) =>
    set((state) => ({
      config: { ...state.config, ...patch } as ProjectConfig,
    })),

  setConfig: (config) => set({ config }),

  resetSection: (sectionId) =>
    set((state) => {
      const defaults = createDefaultProjectConfig()
      switch (sectionId) {
        case 'video':
          return {
            config: {
              ...state.config,
              video: defaults.video,
              frame: defaults.frame,
            },
          }
        case 'audio':
          return {
            config: { ...state.config, audio: defaults.audio },
          }
        case 'subtitle':
          return {
            config: { ...state.config, subtitle: defaults.subtitle },
          }
        default:
          return state
      }
    }),

  toggleSection: (sectionId) =>
    set((state) => ({
      expandedSections: {
        ...state.expandedSections,
        [sectionId]: !state.expandedSections[sectionId],
      },
    })),

  selectExplanation: (id) => set({ selectedExplanationId: id }),

  setEncoderCache: (encoderId, cache) =>
    set((state) => ({
      encoderSessionCache: {
        ...state.encoderSessionCache,
        [encoderId]: cache,
      },
    })),

  resetConfig: () =>
    set({
      config: createDefaultProjectConfig(),
      encoderSessionCache: {},
      selectedExplanationId: null,
    }),
}))

// Deep path setter — works with ProjectConfig
function setByPath<T>(obj: T, path: string, value: unknown): T {
  const parts = path.split('.')
  if (parts.length === 0) return obj

  // Use JSON round-trip for deep immutable updates
  const clone: Record<string, unknown> = JSON.parse(JSON.stringify(obj))
  let current = clone

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {}
    }
    current = current[part] as Record<string, unknown>
  }

  current[parts[parts.length - 1]] = value
  return clone as unknown as T
}
