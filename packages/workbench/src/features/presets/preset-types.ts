// ============================================================
// Preset types — structured user presets for config persistence.
// Presets store ProjectConfig, never command strings.
// ============================================================

import { z } from 'zod'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'
import { projectConfigSchema } from '@ffcodec/domain/config/config-schema'

/** Schema version for forward/backward compatibility */
export const CURRENT_PRESET_SCHEMA_VERSION = 1

export interface UserPreset {
  id: string
  name: string
  description?: string
  schemaVersion: number
  createdAt: string
  updatedAt: string
  /** 用户自定义排序位置，越小越靠前 */
  order?: number
  /** 是否为内置种子预设（外挂 JSON 文件中的标记，Web 内置预设同样携带） */
  builtin?: boolean
  /** 文件模式下该预设 JSON 所在的子目录（内置/用户） */
  fileScope?: 'builtin' | 'user'
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
  order: z.number().int().optional(),
  builtin: z.boolean().optional(),
  fileScope: z.enum(['builtin', 'user']).optional(),
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
  order: z.number().int().optional(),
  builtin: z.boolean().optional(),
  fileScope: z.enum(['builtin', 'user']).optional(),
  config: projectConfigSchema,
})

export type UserPresetImport = z.infer<typeof userPresetImportSchema>
