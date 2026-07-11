import type { ProjectConfig } from './project-config'

/** 添加一条可立即编辑的内嵌字幕轨道。 */
export function addSubtitleTrack(config: ProjectConfig): ProjectConfig {
  const next = structuredClone(config)
  let sequence = next.subtitle.tracks.length + 1
  let id = `track-${sequence}`
  while (next.subtitle.tracks.some((track) => track.id === id)) {
    sequence += 1
    id = `track-${sequence}`
  }
  next.subtitle.tracks.push({
    id,
    source: 'input',
    mainStreamRelIndex: 0,
    codecMode: 'copy',
    sourceCodecKnown: false,
    disposition: {},
  })
  return next
}

/** 按稳定 ID 删除字幕轨道。 */
export function removeSubtitleTrack(config: ProjectConfig, trackId: string): ProjectConfig {
  const next = structuredClone(config)
  next.subtitle.tracks = next.subtitle.tracks.filter((track) => track.id !== trackId)
  return next
}
