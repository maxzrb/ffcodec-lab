import type {
  AudioConfig,
  AudioEncodingSnapshot,
  FrameConfig,
  ProjectConfig,
  StreamMapEntry,
  VideoConfig,
  VideoEncodingSnapshot,
} from '../config/project-config'

export type StreamPlanSource = 'global' | 'snapshot' | 'legacy-override'

export interface EffectiveVideoStreamPlan {
  inputIndex: number
  outputIndex: number
  codecMode: 'encode' | 'copy'
  source: StreamPlanSource
  video: VideoConfig
  frame: FrameConfig
  customVideoFilters: string[]
}

export interface EffectiveAudioStreamPlan {
  inputIndex: number
  outputIndex: number
  codecMode: 'encode' | 'copy'
  source: StreamPlanSource
  audio: AudioConfig
  customAudioFilters: string[]
}

export function createVideoEncodingSnapshot(config: ProjectConfig): VideoEncodingSnapshot {
  const { mode: _mode, ...video } = structuredClone(config.video)
  return {
    snapshotVersion: 1,
    video,
    frame: structuredClone(config.frame),
    customVideoFilters: structuredClone(config.customArgs.videoFilters ?? []),
  }
}

export function createAudioEncodingSnapshot(config: ProjectConfig): AudioEncodingSnapshot {
  const { mode: _mode, ...audio } = structuredClone(config.audio)
  return {
    snapshotVersion: 1,
    audio,
    customAudioFilters: structuredClone(config.customArgs.audioFilters ?? []),
  }
}

/** 把当前全局视频模板冻结到一个或多个显式流，并退出 preserve-all。 */
export function applyVideoSnapshotToStreams(config: ProjectConfig, inputIndices: number[]): ProjectConfig {
  const next = structuredClone(config)
  const snapshot = createVideoEncodingSnapshot(config)
  next.streams.preserveAllVideoStreams = false
  next.streams.videoStreams = applySnapshot(next.streams.videoStreams, inputIndices, 'videoSnapshot', snapshot)
  return next
}

/** 把当前全局音频模板冻结到一个或多个显式流，并退出 preserve-all。 */
export function applyAudioSnapshotToStreams(config: ProjectConfig, inputIndices: number[]): ProjectConfig {
  const next = structuredClone(config)
  const snapshot = createAudioEncodingSnapshot(config)
  next.streams.preserveAllAudioStreams = false
  next.streams.audioStreams = applySnapshot(next.streams.audioStreams, inputIndices, 'audioSnapshot', snapshot)
  return next
}

export function restoreVideoStreamInheritance(config: ProjectConfig, inputIndex: number): ProjectConfig {
  return updateEntry(config, 'videoStreams', inputIndex, (entry) => {
    const { videoSnapshot: _snapshot, video: _legacy, ...rest } = entry
    return rest
  })
}

export function restoreAudioStreamInheritance(config: ProjectConfig, inputIndex: number): ProjectConfig {
  return updateEntry(config, 'audioStreams', inputIndex, (entry) => {
    const { audioSnapshot: _snapshot, audio: _legacy, ...rest } = entry
    return rest
  })
}

export function copyVideoStreamSnapshot(config: ProjectConfig, fromInputIndex: number, toInputIndices: number[]): ProjectConfig {
  const source = config.streams.videoStreams.find((entry) => entry.index === fromInputIndex)?.videoSnapshot
  if (!source) return config
  const next = structuredClone(config)
  next.streams.preserveAllVideoStreams = false
  next.streams.videoStreams = applySnapshot(next.streams.videoStreams, toInputIndices, 'videoSnapshot', source)
  return next
}

export function copyAudioStreamSnapshot(config: ProjectConfig, fromInputIndex: number, toInputIndices: number[]): ProjectConfig {
  const source = config.streams.audioStreams.find((entry) => entry.index === fromInputIndex)?.audioSnapshot
  if (!source) return config
  const next = structuredClone(config)
  next.streams.preserveAllAudioStreams = false
  next.streams.audioStreams = applySnapshot(next.streams.audioStreams, toInputIndices, 'audioSnapshot', source)
  return next
}

/** 将快照载入全局视频工作台；原流快照保持不变，重新应用后才覆盖。 */
export function loadVideoSnapshotIntoTemplate(config: ProjectConfig, inputIndex: number): ProjectConfig {
  const snapshot = config.streams.videoStreams.find((entry) => entry.index === inputIndex)?.videoSnapshot
  if (!snapshot) return config
  const next = structuredClone(config)
  next.video = { mode: 'encode', ...structuredClone(snapshot.video) }
  next.frame = structuredClone(snapshot.frame)
  next.customArgs.videoFilters = structuredClone(snapshot.customVideoFilters)
  return next
}

/** 将快照载入全局音频工作台；原流快照保持不变。 */
export function loadAudioSnapshotIntoTemplate(config: ProjectConfig, inputIndex: number): ProjectConfig {
  const snapshot = config.streams.audioStreams.find((entry) => entry.index === inputIndex)?.audioSnapshot
  if (!snapshot) return config
  const next = structuredClone(config)
  next.audio = { mode: 'encode', ...structuredClone(snapshot.audio) }
  next.customArgs.audioFilters = structuredClone(snapshot.customAudioFilters)
  return next
}

export function resolveEffectiveVideoStreamPlans(config: ProjectConfig): EffectiveVideoStreamPlan[] {
  if (config.video.mode === 'disabled') return []
  if (config.streams.preserveAllVideoStreams) return [{
    inputIndex: -1,
    outputIndex: -1,
    codecMode: config.video.mode === 'copy' ? 'copy' : 'encode',
    source: 'global',
    video: structuredClone(config.video),
    frame: structuredClone(config.frame),
    customVideoFilters: structuredClone(config.customArgs.videoFilters ?? []),
  }]
  return config.streams.videoStreams.map((entry, outputIndex) => resolveVideoEntry(config, entry, outputIndex))
}

export function resolveEffectiveAudioStreamPlans(config: ProjectConfig): EffectiveAudioStreamPlan[] {
  if (config.audio.mode === 'disabled') return []
  if (config.streams.preserveAllAudioStreams) return [{
    inputIndex: -1,
    outputIndex: -1,
    codecMode: config.audio.mode === 'copy' ? 'copy' : 'encode',
    source: 'global',
    audio: structuredClone(config.audio),
    customAudioFilters: structuredClone(config.customArgs.audioFilters ?? []),
  }]
  return config.streams.audioStreams.map((entry, outputIndex) => resolveAudioEntry(config, entry, outputIndex))
}

/** 生成仅替换视频局部设置的临时配置，供命令、诊断与能力解析复用。 */
export function projectConfigForVideoStream(config: ProjectConfig, plan: EffectiveVideoStreamPlan): ProjectConfig {
  const next = structuredClone(config)
  next.video = structuredClone(plan.video)
  next.frame = structuredClone(plan.frame)
  next.customArgs.videoFilters = structuredClone(plan.customVideoFilters)
  return next
}

/** 生成仅替换音频局部设置的临时配置。 */
export function projectConfigForAudioStream(config: ProjectConfig, plan: EffectiveAudioStreamPlan): ProjectConfig {
  const next = structuredClone(config)
  next.audio = structuredClone(plan.audio)
  next.customArgs.audioFilters = structuredClone(plan.customAudioFilters)
  return next
}

function resolveVideoEntry(config: ProjectConfig, entry: StreamMapEntry, outputIndex: number): EffectiveVideoStreamPlan {
  if (entry.videoSnapshot) return {
    inputIndex: entry.index,
    outputIndex,
    codecMode: entry.codecMode,
    source: 'snapshot',
    video: { mode: 'encode', ...structuredClone(entry.videoSnapshot.video) },
    frame: structuredClone(entry.videoSnapshot.frame),
    customVideoFilters: structuredClone(entry.videoSnapshot.customVideoFilters),
  }
  const video = structuredClone(config.video)
  if (entry.video) {
    video.encoderId = entry.video.encoderId ?? video.encoderId
    video.preset = entry.video.preset ?? video.preset
    video.profile = entry.video.profile ?? video.profile
    video.tune = entry.video.tune ?? video.tune
    video.pixelFormat = entry.video.pixelFormat ?? video.pixelFormat
    if (entry.video.crf !== undefined && video.rateControl) video.rateControl.qualityValue = entry.video.crf
    if (entry.video.bitrate !== undefined && video.rateControl) video.rateControl.bitrate = entry.video.bitrate
  }
  return {
    inputIndex: entry.index,
    outputIndex,
    codecMode: entry.codecMode,
    source: entry.video ? 'legacy-override' : 'global',
    video,
    frame: structuredClone(config.frame),
    customVideoFilters: structuredClone(config.customArgs.videoFilters ?? []),
  }
}

function resolveAudioEntry(config: ProjectConfig, entry: StreamMapEntry, outputIndex: number): EffectiveAudioStreamPlan {
  if (entry.audioSnapshot) return {
    inputIndex: entry.index,
    outputIndex,
    codecMode: entry.codecMode,
    source: 'snapshot',
    audio: { mode: 'encode', ...structuredClone(entry.audioSnapshot.audio) },
    customAudioFilters: structuredClone(entry.audioSnapshot.customAudioFilters),
  }
  const audio = structuredClone(config.audio)
  if (entry.audio) {
    audio.encoderId = entry.audio.encoderId ?? audio.encoderId
    audio.bitrate = entry.audio.bitrate ?? audio.bitrate
    audio.channelLayout = entry.audio.channelLayout ?? audio.channelLayout
    audio.sampleRate = entry.audio.sampleRate ?? audio.sampleRate
  }
  return {
    inputIndex: entry.index,
    outputIndex,
    codecMode: entry.codecMode,
    source: entry.audio ? 'legacy-override' : 'global',
    audio,
    customAudioFilters: structuredClone(config.customArgs.audioFilters ?? []),
  }
}

function applySnapshot<T extends VideoEncodingSnapshot | AudioEncodingSnapshot>(
  entries: StreamMapEntry[],
  inputIndices: number[],
  key: 'videoSnapshot' | 'audioSnapshot',
  snapshot: T,
): StreamMapEntry[] {
  const targets = new Set(inputIndices)
  const result = entries.map((entry) => {
    if (!targets.has(entry.index)) return entry
    const cleared = key === 'videoSnapshot'
      ? { ...entry, video: undefined }
      : { ...entry, audio: undefined }
    return { ...cleared, codecMode: 'encode' as const, [key]: structuredClone(snapshot) }
  })
  for (const index of targets) {
    if (!result.some((entry) => entry.index === index)) {
      result.push({ index, codecMode: 'encode', [key]: structuredClone(snapshot) })
    }
  }
  return result.sort((a, b) => a.index - b.index)
}

function updateEntry(
  config: ProjectConfig,
  key: 'videoStreams' | 'audioStreams',
  inputIndex: number,
  update: (entry: StreamMapEntry) => StreamMapEntry,
): ProjectConfig {
  const next = structuredClone(config)
  next.streams[key] = next.streams[key].map((entry) => entry.index === inputIndex ? update(entry) : entry)
  return next
}
