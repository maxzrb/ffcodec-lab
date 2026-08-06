export { validateConfig, validateCompatibility } from './validate-config'
export {
  collectConfiguredVideoEncoderOptions,
  collectConfiguredVideoEncoderOptionGroups,
  collectRequiredVideoEncoders,
  collectVideoEncoderControlOptions,
  normalizeEncoderOptionName,
} from './runtime-ffmpeg-capabilities'
export type {
  RequiredVideoEncoder,
  VideoEncoderOptionGroup,
  VideoEncoderOptionRequirement,
} from './runtime-ffmpeg-capabilities'
