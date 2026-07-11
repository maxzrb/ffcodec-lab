// ============================================================
// ShareableProjectConfig — a privacy-safe subset of ProjectConfig
// for URL hash sharing. Strips local paths by default.
// ============================================================

import { z } from 'zod'

export const SHARE_PAYLOAD_VERSION = 2

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
    specialParameters: z.record(z.unknown()).default({}),
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
    filters: z.object({
      crop: z.object({ enabled: z.boolean(), width: z.number(), height: z.number(), x: z.number(), y: z.number() }),
      transform: z.object({
        rotate: z.enum(['none', 'clockwise', 'counterclockwise', '180']),
        horizontalFlip: z.boolean(),
        verticalFlip: z.boolean(),
      }),
      adjustment: z.object({
        enabled: z.boolean(), brightness: z.number(), contrast: z.number(), saturation: z.number(), gamma: z.number(),
      }),
      deinterlace: z.object({ enabled: z.boolean(), mode: z.enum(['send_frame', 'send_field']), parity: z.enum(['auto', 'tff', 'bff']) }),
      sharpen: z.object({ enabled: z.boolean(), amount: z.number() }),
    }).optional(),
  }),
  a: z.object({
    mode: z.enum(['encode', 'copy', 'disabled']),
    encoderId: z.string().optional(),
    bitrate: z.string().optional(),
    channelLayout: z.string().optional(),
    sampleRate: z.number().optional(),
    qualityValues: z.record(z.unknown()).default({}),
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
  m: z.object({
    videoStreamIndexes: z.array(z.number().int().nonnegative()),
    audioStreamIndexes: z.array(z.number().int().nonnegative()),
    subtitleStreamIndexes: z.array(z.number().int().nonnegative()),
    preserveOtherVideoStreams: z.boolean(),
    preserveOtherAudioStreams: z.boolean(),
    preserveOtherSubtitleStreams: z.boolean(),
  }).optional(),
})

export type ShareableProjectConfig = z.infer<typeof shareableConfigSchema>
