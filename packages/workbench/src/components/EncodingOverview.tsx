import type { Catalog, EncoderDefinition } from '@ffcodec/domain/catalog/catalog-types'
import type { ProjectConfig } from '@ffcodec/domain/config/project-config'
import type { Locale } from '../features/i18n/i18n'
import { translateText } from '../features/i18n/i18n'
import {
  resolveEffectiveAudioStreamPlans,
  resolveEffectiveVideoStreamPlans,
} from '@ffcodec/domain/streams'

interface EncodingOverviewProps {
  config: ProjectConfig
  catalog: Catalog
  locale: Locale
  invocationCount: number
}

export function EncodingOverview({ config, catalog, locale, invocationCount }: EncodingOverviewProps) {
  const isZh = locale === 'zh-CN'
  const videoEncoder = config.video.encoderId ? catalog.encoders.video[config.video.encoderId] : undefined
  const audioEncoder = config.audio.encoderId ? catalog.encoders.audio[config.audio.encoderId] : undefined
  const container = catalog.containers[config.output.containerId]
  const rcMode = videoEncoder?.qualityModes.find((mode) => mode.id === config.video.rateControl?.mode)
  const outputName = displayPath(config.output.path)
  const inputName = displayPath(config.input.path)
  const videoPlans = resolveEffectiveVideoStreamPlans(config)
  const audioPlans = resolveEffectiveAudioStreamPlans(config)

  return (
    <div className="encoding-overview" aria-label={isZh ? '编码总览' : 'Encoding overview'}>
      <div className="encoding-overview__intro">
        <strong>{isZh ? '当前编码方案' : 'Current encoding plan'}</strong>
        <span>{invocationCount > 1
          ? (isZh ? `${invocationCount} 条命令，将按顺序执行` : `${invocationCount} commands run in sequence`)
          : (isZh ? '单条命令' : 'Single command')}</span>
      </div>

      <OverviewSection title={isZh ? '输入与输出' : 'Input and output'} rows={[
        [isZh ? '输入' : 'Input', inputName],
        [isZh ? '输出' : 'Output', outputName],
        [isZh ? '容器' : 'Container', container ? `${translateText(container.label, locale)} (.${container.extension})` : (config.output.containerId !== '__custom__' ? `.${config.output.containerId}` : '—')],
        [isZh ? '覆盖' : 'Overwrite', config.output.overwrite ? (isZh ? '是' : 'Yes') : (isZh ? '否' : 'No')],
        [isZh ? '隐藏横幅' : 'Hide banner', config.output.hideBanner ? (isZh ? '是' : 'Yes') : (isZh ? '否' : 'No')],
      ]} />

      <OverviewSection title={isZh ? '视频编码' : 'Video encoding'} rows={[
        [isZh ? '模式' : 'Mode', modeLabel(config.video.mode, isZh, 'video')],
        ...(config.video.mode === 'encode' ? [
          [isZh ? '编码器' : 'Encoder', describeEncoder(videoEncoder, config.video.encoderId, locale)],
          [isZh ? '质量控制' : 'Rate control', describeRateControl(config, rcMode, locale)],
          [isZh ? '预设' : 'Preset', valueOrUnset(config.video.preset, isZh)],
          [isZh ? 'Profile' : 'Profile', valueOrUnset(config.video.profile, isZh)],
          [isZh ? '像素格式' : 'Pixel format', valueOrUnset(config.video.pixelFormat, isZh)],
        ] as [string, string][] : []),
      ]} />

      <OverviewSection title={isZh ? '画面与滤镜' : 'Picture and filters'} rows={[
        [isZh ? '分辨率' : 'Resolution', formatResolution(config, isZh)],
        [isZh ? '帧率' : 'Frame rate', config.frame.frameRate.mode === 'value' ? `${config.frame.frameRate.value} fps` : (isZh ? '跟随源视频' : 'Source')],
        [isZh ? '滤镜处理格式' : 'Filter processing format', formatFilterProcessing(config, isZh)],
        [isZh ? '滤镜' : 'Filters', formatFilters(config, isZh)],
      ]} />

      <OverviewSection title={isZh ? '音频编码' : 'Audio encoding'} rows={[
        [isZh ? '模式' : 'Mode', modeLabel(config.audio.mode, isZh, 'audio')],
        ...(config.audio.mode === 'encode' ? [
          [isZh ? '编码器' : 'Encoder', describeEncoder(audioEncoder, config.audio.encoderId, locale)],
          [isZh ? '码率' : 'Bitrate', valueOrUnset(config.audio.bitrate, isZh)],
          [isZh ? '声道布局' : 'Channel layout', valueOrUnset(config.audio.channelLayout, isZh)],
          [isZh ? '采样率' : 'Sample rate', config.audio.sampleRate ? `${config.audio.sampleRate} Hz` : (isZh ? '未设置' : 'Unset')],
        ] as [string, string][] : []),
      ]} />

      <section className="encoding-overview__section encoding-overview__stream-plans">
        <h3>{isZh ? '逐流编码方案' : 'Per-stream encoding plans'}</h3>
        <div className="encoding-overview__stream-list">
          {videoPlans.map((plan) => {
            const encoder = plan.video.encoderId ? catalog.encoders.video[plan.video.encoderId] : undefined
            const mode = encoder?.qualityModes.find((candidate) => candidate.id === plan.video.rateControl?.mode)
            return (
              <OverviewStreamCard
                key={`v-${plan.inputIndex}`}
                label={plan.inputIndex < 0 ? 'v:*' : `v:${plan.inputIndex}`}
                kind="video"
                status={streamPlanStatus(plan.source, plan.codecMode, isZh)}
                rows={plan.codecMode === 'copy' ? [] : [
                  [isZh ? '编码器' : 'Encoder', describeEncoder(encoder, plan.video.encoderId, locale)],
                  [isZh ? '质量' : 'Quality', describeVideoRateControl(plan.video, mode, locale)],
                  [isZh ? '预设' : 'Preset', valueOrUnset(plan.video.preset, isZh)],
                  [isZh ? '像素格式' : 'Pixel format', valueOrUnset(plan.video.pixelFormat, isZh)],
                  [isZh ? '分辨率' : 'Resolution', formatResolutionParts(plan.frame.resolution, isZh)],
                  [isZh ? '滤镜' : 'Filters', formatVideoPlanFilters(plan.frame, plan.customVideoFilters, isZh)],
                ]}
              />
            )
          })}
          {audioPlans.map((plan) => {
            const encoder = plan.audio.encoderId ? catalog.encoders.audio[plan.audio.encoderId] : undefined
            return (
              <OverviewStreamCard
                key={`a-${plan.inputIndex}`}
                label={plan.inputIndex < 0 ? 'a:*' : `a:${plan.inputIndex}`}
                kind="audio"
                status={streamPlanStatus(plan.source, plan.codecMode, isZh)}
                rows={plan.codecMode === 'copy' ? [] : [
                  [isZh ? '编码器' : 'Encoder', describeEncoder(encoder, plan.audio.encoderId, locale)],
                  [isZh ? '码率' : 'Bitrate', valueOrUnset(plan.audio.bitrate, isZh)],
                  [isZh ? '声道' : 'Channels', valueOrUnset(plan.audio.channelLayout, isZh)],
                  [isZh ? '采样率' : 'Sample rate', plan.audio.sampleRate ? `${plan.audio.sampleRate} Hz` : '—'],
                  [isZh ? '处理' : 'Processing', formatAudioPlanProcessing(plan.audio, plan.customAudioFilters, isZh)],
                ]}
              />
            )
          })}
        </div>
      </section>

      <OverviewSection title={isZh ? '流与工具' : 'Streams and tools'} rows={[
        [isZh ? '视频流' : 'Video streams', streamSummary(config.streams.videoStreams.length, config.streams.preserveAllVideoStreams, isZh)],
        [isZh ? '音频流' : 'Audio streams', streamSummary(config.streams.audioStreams.length, config.streams.preserveAllAudioStreams, isZh)],
        [isZh ? '字幕' : 'Subtitles', config.subtitle.burn.enabled ? (isZh ? '烧录字幕' : 'Burn-in') : `${config.subtitle.tracks.length} ${isZh ? '条轨道' : 'track(s)'}`],
        [isZh ? '目标大小' : 'Target size', config.tools.targetSize.enabled
          ? `${config.tools.targetSize.targetMiB} MiB / ${config.tools.targetSize.durationMinutes} min`
          : (isZh ? '未启用' : 'Disabled')],
      ]} />
    </div>
  )
}

function OverviewStreamCard({
  label,
  kind,
  status,
  rows,
}: {
  label: string
  kind: 'video' | 'audio'
  status: string
  rows: [string, string][]
}) {
  return (
    <article className={`encoding-overview__stream-card encoding-overview__stream-card--${kind}`}>
      <div><strong>{label}</strong><span>{status}</span></div>
      {rows.length > 0 ? (
        <dl>{rows.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
      ) : <p>Stream copy</p>}
    </article>
  )
}

function OverviewSection({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <section className="encoding-overview__section">
      <h3>{title}</h3>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label} className="encoding-overview__row">
            <dt>{label}</dt>
            <dd title={value}>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function describeEncoder(encoder: EncoderDefinition | undefined, fallback: string | undefined, locale: Locale) {
  if (!encoder) return fallback ?? (locale === 'zh-CN' ? '未选择' : 'Not selected')
  return `${translateText(encoder.label, locale)} (${encoder.ffmpegName})`
}

function describeRateControl(config: ProjectConfig, mode: { label: string } | undefined, locale: Locale) {
  const rc = config.video.rateControl
  if (!rc) return locale === 'zh-CN' ? '未设置' : 'Unset'
  const label = mode ? translateText(mode.label, locale) : rc.mode
  const value = rc.qualityValue ?? rc.bitrate
  return value === undefined ? label : `${label} ${value}`
}

function describeVideoRateControl(video: ProjectConfig['video'], mode: { label: string } | undefined, locale: Locale) {
  const rc = video.rateControl
  if (!rc) return locale === 'zh-CN' ? '未设置' : 'Unset'
  const label = mode ? translateText(mode.label, locale) : rc.mode
  const value = rc.qualityValue ?? rc.bitrate
  return value === undefined ? label : `${label} ${value}`
}

function formatResolution(config: ProjectConfig, isZh: boolean) {
  return formatResolutionParts(config.frame.resolution, isZh)
}

function formatResolutionParts(resolution: ProjectConfig['frame']['resolution'], isZh: boolean) {
  const automatic = isZh ? '自动偶数' : 'Auto even'
  if (resolution.mode === 'source') return isZh ? '跟随源视频' : 'Source'
  if (resolution.mode === 'size') {
    return `${resolution.width ?? automatic} x ${resolution.height ?? automatic}${resolution.keepAspect ? (isZh ? '（保持比例）' : ' (aspect)') : ''}`
  }
  if (resolution.mode === 'width') return `${isZh ? '宽度' : 'Width'} ${resolution.width ?? automatic}`
  return `${isZh ? '高度' : 'Height'} ${resolution.height ?? automatic}`
}

function formatVideoPlanFilters(frame: ProjectConfig['frame'], customFilters: string[], isZh: boolean) {
  const controlled = formatFrameFilters(frame, isZh)
  const custom = customFilters.length > 0 ? `${customFilters.length} ${isZh ? '条自定义' : 'custom'}` : ''
  return [controlled === (isZh ? '无' : 'None') ? '' : controlled, custom].filter(Boolean).join(isZh ? '、' : ', ') || (isZh ? '无' : 'None')
}

function formatAudioPlanProcessing(audio: ProjectConfig['audio'], customFilters: string[], isZh: boolean) {
  const loudness = Object.entries(audio.loudnessNormalization).some(([key, value]) => key.endsWith('Enabled') && value === true)
  const parts = [
    loudness ? (isZh ? '响度标准化' : 'Loudness normalization') : '',
    customFilters.length > 0 ? `${customFilters.length} ${isZh ? '条自定义滤镜' : 'custom filter(s)'}` : '',
  ].filter(Boolean)
  return parts.join(isZh ? '、' : ', ') || (isZh ? '无' : 'None')
}

function streamPlanStatus(source: 'global' | 'snapshot' | 'legacy-override', mode: 'encode' | 'copy', isZh: boolean) {
  if (mode === 'copy') return isZh ? '复制' : 'Copy'
  if (source === 'snapshot') return isZh ? '独立快照' : 'Snapshot'
  if (source === 'legacy-override') return isZh ? '已迁移覆写' : 'Migrated override'
  return isZh ? '继承全局' : 'Inherits global'
}

function formatFilters(config: ProjectConfig, isZh: boolean) {
  return formatFrameFilters(config.frame, isZh)
}

function formatFrameFilters(frame: ProjectConfig['frame'], isZh: boolean) {
  const filters = frame.filters
  if (!filters) return isZh ? '无' : 'None'
  const active: string[] = []
  if (filters.crop.enabled) active.push(isZh ? '裁剪' : 'Crop')
  if (filters.transform.rotate !== 'none' || filters.transform.horizontalFlip || filters.transform.verticalFlip) active.push(isZh ? '变换' : 'Transform')
  if (filters.adjustment.enabled) active.push(isZh ? '画面调整' : 'Adjust')
  if (filters.deinterlace.enabled) active.push(isZh ? '去隔行' : 'Deinterlace')
  if (filters.sharpen.enabled) active.push(isZh ? '锐化' : 'Sharpen')
  if (filters.denoise.enabled) active.push(isZh ? '降噪' : 'Denoise')
  if (filters.deband.enabled) active.push(isZh ? '去色带' : 'Deband')
  return active.length > 0 ? active.join(isZh ? '、' : ', ') : (isZh ? '无' : 'None')
}

function formatFilterProcessing(config: ProjectConfig, isZh: boolean) {
  const processing = config.frame.filters?.processing
  if (!processing || processing.mode === 'compatible') {
    return isZh ? '兼容自动协商' : 'Compatible negotiation'
  }
  if (processing.mode === 'high-precision') {
    return isZh ? '自动高精度（至少 10-bit）' : 'Automatic high precision (10-bit minimum)'
  }
  const depth = processing.bitDepth === 'preserve'
    ? (isZh ? '保持位深' : 'Preserve depth')
    : processing.bitDepth === 'float'
      ? '32-bit float'
      : `${processing.bitDepth}-bit`
  const chroma = processing.chroma === 'preserve' ? (isZh ? '保持采样' : 'Preserve chroma') : `4:${processing.chroma[1]}:${processing.chroma[2]}`
  return `${depth} / ${chroma} / ${processing.colorFamily.toUpperCase()}`
}

function modeLabel(mode: ProjectConfig['video']['mode'], isZh: boolean, media: 'video' | 'audio') {
  if (mode === 'encode') return isZh ? '编码' : 'Encode'
  if (mode === 'copy') return isZh ? `${media === 'video' ? '视频' : '音频'}流复制` : `${media === 'video' ? 'Video' : 'Audio'} copy`
  return isZh ? '禁用' : 'Disabled'
}

function streamSummary(count: number, preserveAll: boolean | undefined, isZh: boolean) {
  if (preserveAll) return isZh ? '全部流' : 'All streams'
  return `${count} ${isZh ? '条' : 'stream(s)'}`
}

function valueOrUnset(value: unknown, isZh: boolean) {
  return value === undefined || value === '' || value === 'auto' ? (isZh ? '自动/未设置' : 'Auto / unset') : String(value)
}

function displayPath(value: string) {
  if (!value) return '-'
  return value.split(/[\\/]/).filter(Boolean).pop() ?? value
}
