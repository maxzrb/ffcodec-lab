import type { ProjectConfig, StreamMapEntry } from '@ffcodec/domain/config/project-config'
import { useState, type ReactNode } from 'react'
import {
  applyAudioSnapshotToStreams,
  applyVideoSnapshotToStreams,
  copyAudioStreamSnapshot,
  copyVideoStreamSnapshot,
  loadAudioSnapshotIntoTemplate,
  loadVideoSnapshotIntoTemplate,
  restoreAudioStreamInheritance,
  restoreVideoStreamInheritance,
} from '@ffcodec/domain/streams'
import { useAppDialog } from '../features/dialog/AppDialogProvider'
import { useI18n } from '../features/i18n/i18n'
import { CollapsibleSection } from './CollapsibleSection'

interface StreamSnapshotManagerProps {
  config: ProjectConfig
  onChange: (config: ProjectConfig) => void
  onOpenPanel: (panelId: string) => void
}

export function StreamSnapshotManager({ config, onChange, onOpenPanel }: StreamSnapshotManagerProps) {
  const { locale } = useI18n()
  const dialog = useAppDialog()
  const zh = locale === 'zh-CN'
  const [expanded, setExpanded] = useState(true)

  const copyVideoToOthers = async (entry: StreamMapEntry) => {
    const targets = config.streams.videoStreams.filter((candidate) => candidate.index !== entry.index).map((candidate) => candidate.index)
    if (targets.length === 0 || !entry.videoSnapshot) return
    const confirmed = await dialog.confirm({
      title: zh ? `复制 v:${entry.index} 快照？` : `Copy v:${entry.index} snapshot?`,
      message: zh ? `将覆盖其他 ${targets.length} 条视频流已有的独立快照。` : `This replaces snapshots on ${targets.length} other video stream(s).`,
      confirmLabel: zh ? '复制到其他流' : 'Copy to other streams',
      cancelLabel: zh ? '取消' : 'Cancel',
      tone: 'warning',
    })
    if (confirmed) onChange(copyVideoStreamSnapshot(config, entry.index, targets))
  }

  const copyAudioToOthers = async (entry: StreamMapEntry) => {
    const targets = config.streams.audioStreams.filter((candidate) => candidate.index !== entry.index).map((candidate) => candidate.index)
    if (targets.length === 0 || !entry.audioSnapshot) return
    const confirmed = await dialog.confirm({
      title: zh ? `复制 a:${entry.index} 快照？` : `Copy a:${entry.index} snapshot?`,
      message: zh ? `将覆盖其他 ${targets.length} 条音频流已有的独立快照。` : `This replaces snapshots on ${targets.length} other audio stream(s).`,
      confirmLabel: zh ? '复制到其他流' : 'Copy to other streams',
      cancelLabel: zh ? '取消' : 'Cancel',
      tone: 'warning',
    })
    if (confirmed) onChange(copyAudioStreamSnapshot(config, entry.index, targets))
  }

  return (
    <CollapsibleSection
      title={zh ? '快照式流管理' : 'Snapshot stream management'}
      expanded={expanded}
      onToggle={() => setExpanded((value) => !value)}
      className="stream-snapshot-section"
    >
      <div className="stream-snapshot-manager" aria-label={zh ? '逐流参数快照' : 'Per-stream parameter snapshots'}>
        <SnapshotGroup
          title={zh ? '视频流' : 'Video streams'}
          accent="video"
          empty={zh ? '没有可管理的视频流；请先探测输入或手动选择视频流。' : 'No manageable video streams. Probe or select streams first.'}
          entries={config.streams.videoStreams}
          render={(entry) => {
            const snapshot = entry.videoSnapshot
            return (
              <SnapshotCard
                key={`video-${entry.index}`}
                streamLabel={`v:${entry.index}`}
                mode={entry.codecMode}
                status={snapshot ? (zh ? '独立快照' : 'Snapshot') : (zh ? '继承全局' : 'Inherits global')}
                summary={snapshot
                  ? [snapshot.video.encoderId, snapshot.video.rateControl?.mode, snapshot.video.preset].filter(Boolean).join(' · ')
                  : [config.video.encoderId, config.video.rateControl?.mode, config.video.preset].filter(Boolean).join(' · ')}
                primaryLabel={snapshot ? (zh ? '从全局重新应用' : 'Reapply global') : (zh ? '应用当前视频方案' : 'Apply video template')}
                onPrimary={() => onChange(applyVideoSnapshotToStreams(config, [entry.index]))}
                actions={snapshot ? [
                  { label: zh ? '载入工作台' : 'Load into workbench', onClick: () => { onChange(loadVideoSnapshotIntoTemplate(config, entry.index)); onOpenPanel('video') } },
                  { label: zh ? '复制到其他流' : 'Copy to others', onClick: () => { void copyVideoToOthers(entry) } },
                  { label: zh ? '恢复继承' : 'Restore inheritance', onClick: () => onChange(restoreVideoStreamInheritance(config, entry.index)) },
                ] : []}
              />
            )
          }}
        />

        <SnapshotGroup
          title={zh ? '音频流' : 'Audio streams'}
          accent="audio"
          empty={zh ? '没有可管理的音频流；请先探测输入或手动选择音频流。' : 'No manageable audio streams. Probe or select streams first.'}
          entries={config.streams.audioStreams}
          render={(entry) => {
            const snapshot = entry.audioSnapshot
            return (
              <SnapshotCard
                key={`audio-${entry.index}`}
                streamLabel={`a:${entry.index}`}
                mode={entry.codecMode}
                status={snapshot ? (zh ? '独立快照' : 'Snapshot') : (zh ? '继承全局' : 'Inherits global')}
                summary={snapshot
                  ? [snapshot.audio.encoderId, snapshot.audio.bitrate, snapshot.audio.channelLayout].filter(Boolean).join(' · ')
                  : [config.audio.encoderId, config.audio.bitrate, config.audio.channelLayout].filter(Boolean).join(' · ')}
                primaryLabel={snapshot ? (zh ? '从全局重新应用' : 'Reapply global') : (zh ? '应用当前音频方案' : 'Apply audio template')}
                onPrimary={() => onChange(applyAudioSnapshotToStreams(config, [entry.index]))}
                actions={snapshot ? [
                  { label: zh ? '载入工作台' : 'Load into workbench', onClick: () => { onChange(loadAudioSnapshotIntoTemplate(config, entry.index)); onOpenPanel('audio') } },
                  { label: zh ? '复制到其他流' : 'Copy to others', onClick: () => { void copyAudioToOthers(entry) } },
                  { label: zh ? '恢复继承' : 'Restore inheritance', onClick: () => onChange(restoreAudioStreamInheritance(config, entry.index)) },
                ] : []}
              />
            )
          }}
        />
      </div>
    </CollapsibleSection>
  )
}

function SnapshotGroup({
  title,
  accent,
  entries,
  empty,
  render,
}: {
  title: string
  accent: 'video' | 'audio'
  entries: StreamMapEntry[]
  empty: string
  render: (entry: StreamMapEntry) => ReactNode
}) {
  return (
    <div className={`stream-snapshot-group stream-snapshot-group--${accent}`}>
      <h4>{title}<span>{entries.length}</span></h4>
      {entries.length > 0 ? <div className="stream-snapshot-group__grid">{entries.map(render)}</div> : <p>{empty}</p>}
    </div>
  )
}

function SnapshotCard({
  streamLabel,
  mode,
  status,
  summary,
  primaryLabel,
  onPrimary,
  actions,
}: {
  streamLabel: string
  mode: 'encode' | 'copy'
  status: string
  summary: string
  primaryLabel: string
  onPrimary: () => void
  actions: Array<{ label: string; onClick: () => void }>
}) {
  return (
    <article className="stream-snapshot-card">
      <div className="stream-snapshot-card__title">
        <strong>{streamLabel}</strong>
        <span>{mode === 'copy' ? 'COPY' : status}</span>
      </div>
      <p>{mode === 'copy' ? 'Stream copy' : (summary || '—')}</p>
      <div className="stream-snapshot-card__actions">
        <button type="button" className="button button--primary stream-snapshot-card__primary" onClick={onPrimary}>{primaryLabel}</button>
        {actions.map((action) => <button key={action.label} type="button" className="button" onClick={action.onClick}>{action.label}</button>)}
      </div>
    </article>
  )
}
