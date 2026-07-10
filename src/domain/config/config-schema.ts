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

const rateControlSchema = z.object({
  mode: z.enum(['crf', 'vbr', 'cqp', 'cbr', 'twoPass']),
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

const subtitleMuxSchema = z.object({
  enabled: z.boolean(),
  source: z.enum(['internal', 'external']),
  streamSelector: z.string().optional(),
  externalPath: z.string().optional(),
  codecMode: z.enum(['auto', 'copy', 'mov_text', 'webvtt', 'srt', 'ass', 'ssa']),
  preserveOtherStreams: z.boolean(),
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

// -- top-level schema -----------------------------------------

export const projectConfigSchema = z.object({
  schemaVersion: z.literal(1),
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
  }),
  streams: z.object({
    videoStreamIndex: z.number().int().nonnegative().optional(),
    audioStreamIndex: z.number().int().nonnegative().optional(),
    subtitleStreamIndex: z.number().int().nonnegative().optional(),
    preserveOtherVideoStreams: z.boolean(),
    preserveOtherAudioStreams: z.boolean(),
    preserveOtherSubtitleStreams: z.boolean(),
  }),
  video: videoConfigSchema,
  frame: z.object({
    resolution: resolutionSchema,
    frameRate: frameRateSchema,
  }),
  audio: audioConfigSchema,
  subtitle: z.object({
    mux: subtitleMuxSchema,
    burn: subtitleBurnSchema,
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
