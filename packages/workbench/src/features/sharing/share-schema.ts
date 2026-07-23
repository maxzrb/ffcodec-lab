// ============================================================
// ShareableProjectConfig — a privacy-safe subset of ProjectConfig
// for URL hash sharing. Strips local paths by default.
// ============================================================

import { z } from 'zod'

export const SHARE_PAYLOAD_VERSION = 6

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
    color: z.object({
      range: z.enum(['tv', 'pc']).optional(),
      space: z.string().optional(),
      primaries: z.string().optional(),
      transfer: z.string().optional(),
      operation: z.enum(['metadata-only', 'convert-and-tag', 'convert-only']).optional(),
      filter: z.enum(['zscale', 'libplacebo']).optional(),
      preFormat: z.string().optional(),
      toneMap: z.enum([
        'none', 'auto', 'clip', 'st2094-40', 'st2094-10', 'bt.2390', 'bt.2446a',
        'spline', 'reinhard', 'mobius', 'hable', 'gamma', 'linear',
      ]).optional(),
      desaturation: z.number().optional(),
      nominalPeak: z.number().optional(),
    }).optional(),
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
      denoise: z.object({
        enabled: z.boolean(),
        algorithm: z.enum(['hqdn3d', 'nlmeans', 'atadenoise', 'bm3d']).optional(),
        values: z.record(z.number()),
      }).default({ enabled: false, values: {} }),
      deband: z.object({
        enabled: z.boolean(),
        algorithm: z.enum(['deband', 'gradfun']).optional(),
        values: z.record(z.union([z.number(), z.boolean()])),
      }).default({ enabled: false, values: {} }),
    }).optional(),
  }),
  a: z.object({
    mode: z.enum(['encode', 'copy', 'disabled']),
    encoderId: z.string().optional(),
    bitrate: z.string().optional(),
    channelLayout: z.string().optional(),
    sampleRate: z.number().optional(),
    qualityValues: z.record(z.unknown()).default({}),
    ln: z.object({
      ei: z.boolean(), i: z.number().min(-70).max(-5),
      el: z.boolean(), l: z.number().min(1).max(50),
      et: z.boolean(), t: z.number().min(-9).max(0),
      dm: z.boolean(),
    }).optional(),
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
    meta: z.object({
      globalRaw: z.string().default(''),
      streamRaw: z.string().default(''),
    }).default({ globalRaw: '', streamRaw: '' }),
  }),
  m: z.object({
    videoStreams: z.array(z.object({
      index: z.number().int().nonnegative(),
      codecMode: z.enum(['encode', 'copy']),
    })).optional(),
    audioStreams: z.array(z.object({
      index: z.number().int().nonnegative(),
      codecMode: z.enum(['encode', 'copy']),
    })).optional(),
    subtitleStreams: z.array(z.object({
      index: z.number().int().nonnegative(),
      codecMode: z.enum(['encode', 'copy']),
    })).optional(),
    pav: z.boolean().optional(),
    paa: z.boolean().optional(),
    pas: z.boolean().optional(),
  }).optional(),
  u: z.object({
    targetSize: z.object({
      enabled: z.boolean(),
      targetMiB: z.number().positive(),
      durationMinutes: z.number().positive(),
      overheadPercent: z.number().min(0).max(20),
      manualAudioBitrateKbps: z.number().positive().optional(),
    }),
  }).default({
    targetSize: {
      enabled: false,
      targetMiB: 700,
      durationMinutes: 90,
      overheadPercent: 3,
    },
  }),
})

export type ShareableProjectConfig = z.infer<typeof shareableConfigSchema>
