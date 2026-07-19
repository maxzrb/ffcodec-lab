import { z } from 'zod'

// -- helpers --------------------------------------------------

const resolutionSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('source') }),
  z.object({
    mode: z.literal('size'),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    keepAspect: z.boolean(),
  }),
  z.object({ mode: z.literal('width'), width: z.number().int().positive() }),
  z.object({ mode: z.literal('height'), height: z.number().int().positive() }),
])

const frameRateSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('source') }),
  z.object({ mode: z.literal('value'), value: z.number().positive() }),
])

const advancedVideoFiltersSchema = z.object({
  crop: z.object({
    enabled: z.boolean(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
  }),
  transform: z.object({
    rotate: z.enum(['none', 'clockwise', 'counterclockwise', '180']),
    horizontalFlip: z.boolean(),
    verticalFlip: z.boolean(),
  }),
  adjustment: z.object({
    enabled: z.boolean(),
    brightness: z.number().min(-1).max(1),
    contrast: z.number().min(-2).max(2),
    saturation: z.number().min(0).max(3),
    gamma: z.number().min(0.1).max(10),
  }),
  deinterlace: z.object({
    enabled: z.boolean(),
    mode: z.enum(['send_frame', 'send_field']),
    parity: z.enum(['auto', 'tff', 'bff']),
  }),
  sharpen: z.object({
    enabled: z.boolean(),
    amount: z.number().min(-2).max(5),
  }),
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
})

const rateControlSchema = z.object({
  mode: z.enum([
    'crf', 'vbr', 'cqp', 'cbr', 'twoPass', 'nvenc-cq',
    'qsv-cqp', 'qsv-icq', 'qsv-la-icq', 'qsv-vbr', 'qsv-cbr', 'qsv-la-vbr',
  ]),
  qualityValue: z.number().optional(),
  bitrate: z.string().optional(),
  minRate: z.string().optional(),
  maxRate: z.string().optional(),
  bufferSize: z.string().optional(),
  additionalValues: z.record(z.unknown()),
})

const subtitleStyleSchema = z.object({
  fontName: z.string().optional(),
  fontSize: z.number().optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  strikeOut: z.boolean().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  outlineColor: z.string().optional(),
  backColor: z.string().optional(),
  borderStyle: z.union([z.literal(1), z.literal(3)]).optional(),
  outline: z.number().optional(),
  shadow: z.number().optional(),
  alignment: z.union([
    z.literal(1), z.literal(2), z.literal(3),
    z.literal(4), z.literal(5), z.literal(6),
    z.literal(7), z.literal(8), z.literal(9),
  ]).optional(),
  marginL: z.number().optional(),
  marginR: z.number().optional(),
  marginV: z.number().optional(),
  spacing: z.number().optional(),
})

const subtitleBurnSchema = z.object({
  enabled: z.boolean(),
  source: z.enum(['internal', 'external']),
  streamIndex: z.number().int().nonnegative().optional(),
  externalPath: z.string().optional(),
  filterKind: z.enum(['subtitles', 'ass']),
  style: subtitleStyleSchema,
  customForceStyle: z.string().optional(),
  customFilter: z.string().optional(),
})

const subtitleTrackSchema = z.object({
  id: z.string().min(1),
  source: z.enum(['input', 'external']),
  mainStreamRelIndex: z.number().int().nonnegative().optional(),
  path: z.string().optional(),
  externalStreamIndex: z.number().int().nonnegative().optional(),
  codecMode: z.enum(['copy', 'transcode']),
  codec: z.string().optional(),
  sourceCodec: z.string().optional(),
  sourceCodecKnown: z.boolean(),
  language: z.string().optional(),
  title: z.string().optional(),
  disposition: z.object({
    default: z.boolean().optional(),
    forced: z.boolean().optional(),
    hearingImpaired: z.boolean().optional(),
  }),
  preserveOtherStreams: z.boolean().optional(),
})

const videoConfigSchema = z.object({
  mode: z.enum(['encode', 'copy', 'disabled']),
  encoderId: z.string().optional(),
  rateControl: rateControlSchema.optional(),
  preset: z.union([z.string(), z.number()]).optional(),
  profile: z.string().optional(),
  tune: z.string().optional(),
  pixelFormat: z.string().optional(),
  gpuIndex: z.number().int().nonnegative().optional(),
  threads: z.number().int().positive().optional(),
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
    desaturation: z.number().min(0).max(10).optional(),
    nominalPeak: z.number().positive().max(10000).optional(),
  }).default({}),
  specialParameters: z.record(z.unknown()),
})

const audioConfigSchema = z.object({
  mode: z.enum(['encode', 'copy', 'disabled']),
  encoderId: z.string().optional(),
  bitrate: z.string().optional(),
  channelLayout: z.string().optional(),
  sampleRate: z.number().optional(),
  sampleFormat: z.string().optional(),
  qualityValues: z.record(z.unknown()),
})

const metadataConfigSchema = z.object({
  globalRaw: z.string().default(''),
  streamRaw: z.string().default(''),
})

// -- top-level schema -----------------------------------------

export const projectConfigSchema = z.object({
  schemaVersion: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  shell: z.enum(['bash', 'powershell', 'cmd']),
  input: z.object({
    path: z.string(),
    additionalInputs: z.array(
      z.object({
        path: z.string(),
        label: z.string().optional(),
        purpose: z.enum(['subtitle', 'attachment', 'concat', 'other']),
      })
    ),
  }),
  output: z.object({
    path: z.string(),
    containerId: z.string(),
    overwrite: z.boolean(),
    metadata: metadataConfigSchema.default({ globalRaw: '', streamRaw: '' }),
  }),
  streams: z.object({
    videoStreamIndexes: z.array(z.number().int().nonnegative()).default([]),
    audioStreamIndexes: z.array(z.number().int().nonnegative()).default([]),
    videoStreamIndex: z.number().int().nonnegative().optional(),
    audioStreamIndex: z.number().int().nonnegative().optional(),
    subtitleStreamIndexes: z.array(z.number().int().nonnegative()).default([]),
    subtitleStreamIndex: z.number().int().nonnegative().optional(),
    preserveOtherVideoStreams: z.boolean(),
    preserveOtherAudioStreams: z.boolean(),
    preserveOtherSubtitleStreams: z.boolean(),
  }),
  video: videoConfigSchema,
  frame: z.object({
    resolution: resolutionSchema,
    frameRate: frameRateSchema,
    filters: advancedVideoFiltersSchema.default({
      crop: { enabled: false, width: 1920, height: 1080, x: 0, y: 0 },
      transform: { rotate: 'none', horizontalFlip: false, verticalFlip: false },
      adjustment: { enabled: false, brightness: 0, contrast: 1, saturation: 1, gamma: 1 },
      deinterlace: { enabled: false, mode: 'send_frame', parity: 'auto' },
      sharpen: { enabled: false, amount: 1 },
      denoise: { enabled: false, values: {} },
      deband: { enabled: false, values: {} },
    }),
  }),
  audio: audioConfigSchema,
  subtitle: z.object({
    tracks: z.array(subtitleTrackSchema),
    burn: subtitleBurnSchema,
  }),
  tools: z.object({
    targetSize: z.object({
      enabled: z.boolean(),
      targetMiB: z.number().positive().max(1048576),
      durationMinutes: z.number().positive().max(100000),
      overheadPercent: z.number().min(0).max(20),
      manualAudioBitrateKbps: z.number().positive().max(1000000).optional(),
    }),
  }).default({
    targetSize: {
      enabled: false,
      targetMiB: 700,
      durationMinutes: 90,
      overheadPercent: 3,
    },
  }),
  customArgs: z.object({
    globalArgs: z.array(z.string()),
    preInputArgs: z.array(z.string()),
    videoArgs: z.array(z.string()),
    audioArgs: z.array(z.string()),
    preOutputArgs: z.array(z.string()),
    tailArgs: z.array(z.string()),
  }),
})

export type ValidatedProjectConfig = z.infer<typeof projectConfigSchema>
