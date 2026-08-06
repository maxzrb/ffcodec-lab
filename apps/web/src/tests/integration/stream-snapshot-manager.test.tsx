import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createDefaultProjectConfig } from '@ffcodec/domain/config/defaults'
import { AppDialogProvider } from '@ffcodec/workbench'
import { StreamSnapshotManager } from '@ffcodec/workbench/components/StreamSnapshotManager'
import { EncodingOverview } from '@ffcodec/workbench/components/EncodingOverview'
import { applyVideoSnapshotToStreams } from '@ffcodec/domain/streams'
import { loadCatalog } from '@ffcodec/catalog/catalog-loader'

const catalog = loadCatalog()

describe('StreamSnapshotManager', () => {
  it('applies the current video template as a frozen stream snapshot', async () => {
    const config = createDefaultProjectConfig()
    config.streams.videoStreams = [
      { index: 0, codecMode: 'encode' },
      { index: 1, codecMode: 'encode' },
    ]
    config.video.encoderId = 'h264_nvenc'
    const onChange = vi.fn()

    render(
      <AppDialogProvider>
        <StreamSnapshotManager config={config} onChange={onChange} onOpenPanel={() => undefined} />
      </AppDialogProvider>,
    )
    await userEvent.click(screen.getAllByRole('button', { name: '应用当前视频方案' })[1])

    const next = onChange.mock.calls[0][0]
    expect(next.streams.preserveAllVideoStreams).toBe(false)
    expect(next.streams.videoStreams[1].videoSnapshot.video.encoderId).toBe('h264_nvenc')
    expect(config.streams.videoStreams[1].videoSnapshot).toBeUndefined()
  })

  it('loads a frozen snapshot back into the global media workbench', async () => {
    const config = createDefaultProjectConfig()
    config.streams.preserveAllAudioStreams = false
    config.streams.audioStreams[0].audioSnapshot = {
      snapshotVersion: 1,
      audio: {
        encoderId: 'libopus',
        bitrate: '320k',
        channelLayout: '5.1',
        sampleRate: 48000,
        qualityValues: {},
        loudnessNormalization: config.audio.loudnessNormalization,
      },
      customAudioFilters: ['volume=0.9'],
    }
    const onChange = vi.fn()
    const onOpenPanel = vi.fn()

    render(
      <AppDialogProvider>
        <StreamSnapshotManager config={config} onChange={onChange} onOpenPanel={onOpenPanel} />
      </AppDialogProvider>,
    )
    const loadButtons = screen.getAllByRole('button', { name: '载入工作台' })
    await userEvent.click(loadButtons[loadButtons.length - 1])

    expect(onChange.mock.calls[0][0].audio.encoderId).toBe('libopus')
    expect(onOpenPanel).toHaveBeenCalledWith('audio')
  })

  it('shows each effective stream plan in the encoding overview', () => {
    const config = createDefaultProjectConfig()
    config.video.encoderId = 'h264_nvenc'
    const applied = applyVideoSnapshotToStreams(config, [0])
    applied.video.encoderId = 'libx264'

    render(<EncodingOverview config={applied} catalog={catalog} locale="zh-CN" invocationCount={1} />)

    expect(screen.getByText('逐流编码方案')).toBeInTheDocument()
    expect(screen.getByText('v:0')).toBeInTheDocument()
    expect(screen.getByText('独立快照')).toBeInTheDocument()
    expect(screen.getByText(/h264_nvenc/)).toBeInTheDocument()
  })
})
