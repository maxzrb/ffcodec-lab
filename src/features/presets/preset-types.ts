// ============================================================
// Preset types — structured user presets for config persistence.
// Presets store ProjectConfig, never command strings.
// ============================================================

import { z } from 'zod'
import type { ProjectConfig } from '../../domain/config/project-config'
import { projectConfigSchema } from '../../domain/config/config-schema'

/** Schema version for forward/backward compatibility */
export const CURRENT_PRESET_SCHEMA_VERSION = 1

export interface UserPreset {
  id: string
  name: string
  description?: string
  schemaVersion: number
  createdAt: string
  updatedAt: string
  config: ProjectConfig
}

/** Zod schema for validating imported preset JSON */
export const userPresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, '预设名称不能为空'),
  description: z.string().optional(),
  schemaVersion: z.number().int().positive(),
  createdAt: z.string(),
  updatedAt: z.string(),
  config: projectConfigSchema,
})

/** Partial schema for import — allows missing id/timestamps (will be generated) */
export const userPresetImportSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, '预设名称不能为空'),
  description: z.string().optional(),
  schemaVersion: z.number().int().positive().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  config: projectConfigSchema,
})

export type UserPresetImport = z.infer<typeof userPresetImportSchema>
