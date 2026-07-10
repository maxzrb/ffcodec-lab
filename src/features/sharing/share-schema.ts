// ============================================================
// ShareableProjectConfig — a privacy-safe subset of ProjectConfig
// for URL hash sharing. Strips local paths by default.
// ============================================================

import { z } from 'zod'

export const SHARE_PAYLOAD_VERSION = 1

/** Privacy-safe config subset: no input path, output path, or external subtitle paths */
export const shareableConfigSchema = z.object({
  sv: z.number().int().positive(),
  shell: z.enum(['bash', 'powershell', 'cmd']),
  v: z.object({
    mode: z.enum(['encode', 'copy', 'disabled']),
    encoderId: z.string().optional(),
    rateControl: z.object({
      mode: z.string(),
      qualityValue: z.number().optional(),
      bitrate: z.string().optional(),
      minRate: z.string().optional(),
      maxRate: z.string().optional(),
      bufferSize: z.string().optional(),
      additionalValues: z.record(z.unknown()),
    }).optional(),
    preset: z.union([z.string(), z.number()]).optional(),
    profile: z.string().optional(),
    tune: z.string().optional(),
    pixelFormat: z.string().optional(),
  }),
  f: z.object({
    resolution: z.discriminatedUnion('mode', [
      z.object({ mode: z.literal('source') }),
      z.object({ mode: z.literal('size'), width: z.number(), height: z.number(), keepAspect: z.boolean() }),
      z.object({ mode: z.literal('width'), width: z.number() }),
      z.object({ mode: z.literal('height'), height: z.number() }),
    ]),
    frameRate: z.discriminatedUnion('mode', [
      z.object({ mode: z.literal('source') }),
      z.object({ mode: z.literal('value'), value: z.number() }),
    ]),
  }),
  a: z.object({
    mode: z.enum(['encode', 'copy', 'disabled']),
    encoderId: z.string().optional(),
    bitrate: z.string().optional(),
    channelLayout: z.string().optional(),
    sampleRate: z.number().optional(),
  }),
  s: z.object({
    tracks: z.array(z.object({
      id: z.string(),
      source: z.enum(['input', 'external']),
      mainStreamRelIndex: z.number().optional(),
      codecMode: z.enum(['copy', 'transcode']),
      codec: z.string().optional(),
      sourceCodecKnown: z.boolean(),
      language: z.string().optional(),
      title: z.string().optional(),
      disposition: z.object({
        default: z.boolean().optional(),
        forced: z.boolean().optional(),
        hearingImpaired: z.boolean().optional(),
      }),
    })),
    burn: z.object({
      enabled: z.boolean(),
      source: z.enum(['internal', 'external']),
      filterKind: z.enum(['subtitles', 'ass']),
    }),
  }),
  o: z.object({
    containerId: z.string(),
    overwrite: z.boolean(),
  }),
})

export type ShareableProjectConfig = z.infer<typeof shareableConfigSchema>
