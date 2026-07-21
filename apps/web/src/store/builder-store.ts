import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { projectConfigSchema } from '@ffcodec/domain/config/config-schema'
import { migrateConfig } from '@ffcodec/domain/migration/migrate-config'
import { ALL_MIGRATION_STEPS, CURRENT_SCHEMA_VERSION } from '@ffcodec/domain/migration/migration-registry'

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
  activePanelId: string
  commandPreviewCleared: boolean

  // -- per-encoder session cache (not part of config) --
  encoderSessionCache: Record<string, Record<string, unknown>>

  // -- actions --
  setConfigValue: (path: string, value: unknown) => void
  applyConfigPatch: (patch: Partial<ProjectConfig>) => void
  setConfig: (config: ProjectConfig) => void
  resetSection: (sectionId: string) => void
  toggleSection: (sectionId: string) => void
  selectExplanation: (id: string | null) => void
  setActivePanel: (id: string) => void
  setEncoderCache: (encoderId: string, cache: Record<string, unknown>) => void
  resetConfig: () => void
  clearAllCommands: () => void
}

export const useBuilderStore = create<BuilderState>()(persist((set) => ({
  config: createDefaultProjectConfig(),

  expandedSections: {
    'section.input': true,
    'section.video': true,
    'section.video-advanced': false,
    'section.frame': true,
    'section.audio': true,
    'section.subtitle': true,
    'section.container': true,
    'section.customArgs': true,
    'section.quality': true,
    'section.color': true,
    'section.filters': true,
    'section.streams-container': true,
    'section.tools': true,
  },

  selectedExplanationId: null,
  activePanelId: 'input-output',
  commandPreviewCleared: false,
  encoderSessionCache: {},

  // -- actions --
  setConfigValue: (path, value) =>
    set((state) => ({
      config: setByPath(state.config, path, value),
      commandPreviewCleared: false,
    })),

  applyConfigPatch: (patch) =>
    set((state) => ({
      config: { ...state.config, ...patch } as ProjectConfig,
      commandPreviewCleared: false,
    })),

  setConfig: (config) => set({ config, commandPreviewCleared: false }),

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
            commandPreviewCleared: false,
          }
        case 'audio':
          return {
            config: { ...state.config, audio: defaults.audio },
            commandPreviewCleared: false,
          }
        case 'subtitle':
          return {
            config: { ...state.config, subtitle: defaults.subtitle },
            commandPreviewCleared: false,
          }
        default:
          return state
      }
    }),

  toggleSection: (sectionId) =>
    set((state) => {
      const currentlyExpanded = state.expandedSections[sectionId] ?? true
      return {
        expandedSections: {
          ...state.expandedSections,
          [sectionId]: !currentlyExpanded,
        },
      }
    }),

  selectExplanation: (id) => set({ selectedExplanationId: id }),
  setActivePanel: (id) => set({ activePanelId: id }),

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
      commandPreviewCleared: false,
    }),

  clearAllCommands: () =>
    set({
      config: createDefaultProjectConfig(),
      encoderSessionCache: {},
      selectedExplanationId: null,
      commandPreviewCleared: true,
    }),
}), {
  name: 'ffcodec-builder-v2',
  version: 2,
  partialize: (state) => ({ config: state.config }) as BuilderState,
  merge: (persistedState, currentState) => {
    const persistedConfig = (persistedState as Partial<BuilderState>)?.config
    const source = persistedConfig as unknown as Record<string, unknown> | undefined
    const version = typeof source?.schemaVersion === 'number' ? source.schemaVersion : CURRENT_SCHEMA_VERSION
    const migrated = source
      ? migrateConfig(version, CURRENT_SCHEMA_VERSION, source, [...ALL_MIGRATION_STEPS]).config
      : undefined
    const parsed = projectConfigSchema.safeParse(migrated)
    return {
      ...currentState,
      config: parsed.success ? parsed.data as ProjectConfig : currentState.config,
    }
  },
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
