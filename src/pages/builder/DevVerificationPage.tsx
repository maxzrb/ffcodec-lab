import { useBuilderStore } from '../../store'
import { usePipeline } from '../../store/pipeline'
import { loadCatalog } from '../../domain/catalog/catalog-loader'
import { CatalogIndex } from '../../domain/catalog/catalog-index'
import type { ShellKind } from '../../domain/config/project-config'
import type { RateControlConfig } from '../../domain/config/project-config'

const catalog = loadCatalog()
const catalogIndex = new CatalogIndex(catalog)

export function DevVerificationPage() {
  const config = useBuilderStore((s) => s.config)
  const setConfigValue = useBuilderStore((s) => s.setConfigValue)
  const selectedExplanationId = useBuilderStore((s) => s.selectedExplanationId)
  const selectExplanation = useBuilderStore((s) => s.selectExplanation)

  const pipeline = usePipeline(config, catalog)

  // Get current encoder for displaying capabilities
  const videoEncoder = config.video.encoderId
    ? catalogIndex.getVideoEncoder(config.video.encoderId)
    : undefined
  const _audioEncoder = config.audio.encoderId
    ? catalogIndex.getAudioEncoder(config.audio.encoderId)
    : undefined
  void _audioEncoder
  const _container = catalogIndex.getContainer(config.output.containerId)
  void _container

  const selectedExplanation = selectedExplanationId
    ? catalogIndex.getExplanation(selectedExplanationId)
    : undefined

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>
        FFmpeg 命令生成器 — 开发验证页面
      </h1>
      <p style={{ color: 'var(--text-dim)', marginBottom: 24, fontSize: 14 }}>
        此页面用于验证 Domain Layer 各模块是否正确工作。不是最终产品 UI。
      </p>

      {/* STATUS BAR */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <StatusBadge
          label="错误"
          count={pipeline.evaluationResult.messages.filter((m) => m.severity === 'error').length}
          color="var(--error)"
        />
        <StatusBadge
          label="警告"
          count={pipeline.evaluationResult.messages.filter((m) => m.severity === 'warning').length}
          color="var(--warning)"
        />
        <StatusBadge
          label="建议"
          count={pipeline.evaluationResult.messages.filter((m) => m.severity === 'info').length}
          color="var(--info)"
        />
        <StatusBadge
          label="规范化通知"
          count={pipeline.evaluationResult.normalizationNotices.length}
          color="var(--text-dim)"
        />
      </div>

      {/* CONTROLS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Shell */}
        <ControlGroup label="Shell 类型">
          <select
            value={config.shell}
            onChange={(e) => setConfigValue('shell', e.target.value as ShellKind)}
          >
            <option value="bash">Bash / Zsh</option>
            <option value="powershell">PowerShell</option>
            <option value="cmd">Windows CMD</option>
          </select>
        </ControlGroup>

        {/* Container */}
        <ControlGroup label="输出容器">
          <select
            value={config.output.containerId}
            onChange={(e) => setConfigValue('output.containerId', e.target.value)}
          >
            {catalogIndex.getContainerIds().map((id) => (
              <option key={id} value={id}>
                {catalog.containers[id]?.label ?? id}
              </option>
            ))}
          </select>
        </ControlGroup>

        {/* Video mode */}
        <ControlGroup label="视频处理">
          <select
            value={config.video.mode}
            onChange={(e) =>
              setConfigValue('video.mode', e.target.value as 'encode' | 'copy' | 'disabled')
            }
          >
            <option value="encode">重新编码</option>
            <option value="copy">复制视频流 (copy)</option>
            <option value="disabled">不输出视频 (-vn)</option>
          </select>
        </ControlGroup>

        {/* Video encoder */}
        {config.video.mode === 'encode' && (
          <ControlGroup label="视频编码器">
            <select
              value={config.video.encoderId ?? ''}
              onChange={(e) => setConfigValue('video.encoderId', e.target.value)}
            >
              {catalogIndex.getVideoEncoderIds().map((id) => (
                <option key={id} value={id}>
                  {catalog.encoders.video[id]?.label ?? id}
                </option>
              ))}
            </select>
          </ControlGroup>
        )}

        {/* Quality mode */}
        {config.video.mode === 'encode' && videoEncoder && (
          <ControlGroup label="质量控制模式">
            <select
              value={config.video.rateControl?.mode ?? 'crf'}
              onChange={(e) => {
                const mode = e.target.value as RateControlConfig['mode']
                const qMode = videoEncoder.qualityModes.find((m) => m.id === mode)
                const defaultQc = qMode?.controls[0]
                setConfigValue('video.rateControl', {
                  mode,
                  qualityValue: defaultQc?.defaultValue,
                  additionalValues: {},
                })
              }}
            >
              {videoEncoder.qualityModes.map((qm) => (
                <option key={qm.id} value={qm.id}>
                  {qm.label}
                </option>
              ))}
            </select>
          </ControlGroup>
        )}

        {/* Quality value */}
        {config.video.mode === 'encode' && config.video.rateControl && videoEncoder && (
          <ControlGroup label={`质量值 (${config.video.rateControl.mode.toUpperCase()})`}>
            <input
              type="number"
              value={config.video.rateControl.qualityValue ?? ''}
              onChange={(e) =>
                setConfigValue('video.rateControl.qualityValue', parseFloat(e.target.value) || 0)
              }
              step="0.1"
              style={{ width: 120 }}
            />
          </ControlGroup>
        )}

        {/* Audio mode */}
        <ControlGroup label="音频处理">
          <select
            value={config.audio.mode}
            onChange={(e) =>
              setConfigValue('audio.mode', e.target.value as 'encode' | 'copy' | 'disabled')
            }
          >
            <option value="encode">重新编码</option>
            <option value="copy">复制音频流 (copy)</option>
            <option value="disabled">不输出音频 (-an)</option>
          </select>
        </ControlGroup>

        {/* Audio encoder */}
        {config.audio.mode === 'encode' && (
          <ControlGroup label="音频编码器">
            <select
              value={config.audio.encoderId ?? ''}
              onChange={(e) => setConfigValue('audio.encoderId', e.target.value)}
            >
              {catalogIndex.getAudioEncoderIds().map((id) => (
                <option key={id} value={id}>
                  {catalog.encoders.audio[id]?.label ?? id}
                </option>
              ))}
            </select>
          </ControlGroup>
        )}

        {/* Audio bitrate */}
        {config.audio.mode === 'encode' && (
          <ControlGroup label="音频码率">
            <select
              value={config.audio.bitrate ?? '192k'}
              onChange={(e) => setConfigValue('audio.bitrate', e.target.value)}
            >
              {['96k', '128k', '160k', '192k', '256k', '320k'].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </ControlGroup>
        )}
      </div>

      {/* ENCODER CAPABILITIES PANEL */}
      {videoEncoder && (
        <SectionBox title={`编码器能力: ${videoEncoder.label}`}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 13 }}>
            <CapRow label="ID" value={videoEncoder.id} />
            <CapRow label="FFmpeg 名称" value={videoEncoder.ffmpegName} />
            <CapRow label="家族" value={videoEncoder.family} />
            <CapRow label="实现" value={videoEncoder.implementation} />
            <CapRow label="二遍编码" value={videoEncoder.capabilities.supportsTwoPass ? '✓' : '✗'} />
            <CapRow label="无损" value={videoEncoder.capabilities.supportsLossless ? '✓' : '✗'} />
            <CapRow label="Preset" value={videoEncoder.preset?.options?.map((o) => String(o.value)).join(', ') ?? '—'} />
            <CapRow label="Profile" value={videoEncoder.profile?.options?.map((o) => String(o.value)).join(', ') ?? '—'} />
            <CapRow label="Tune" value={videoEncoder.tune?.options?.map((o) => String(o.value)).join(', ') ?? '—'} />
            <CapRow
              label="质量模式"
              value={videoEncoder.qualityModes.map((m) => m.label).join(', ')}
            />
            <CapRow label="Pixel 格式" value={(() => { const opts = videoEncoder.pixelFormat?.options?.map((o) => String(o.value)).slice(0, 4).join(', '); return opts ? opts + '…' : '—'; })()} />
            <CapRow label="来源状态" value={videoEncoder.status} />
          </div>
          {videoEncoder.availabilityNote && (
            <div style={{ marginTop: 12, padding: 8, background: 'var(--bg-input)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-dim)' }}>
              ℹ {videoEncoder.availabilityNote}
            </div>
          )}
        </SectionBox>
      )}

      {/* NORMALIZATION NOTICES */}
      {pipeline.evaluationResult.normalizationNotices.length > 0 && (
        <SectionBox title="规范化通知">
          <ul style={{ fontSize: 13, paddingLeft: 20 }}>
            {pipeline.evaluationResult.normalizationNotices.map((n, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                <code>{n.fieldId}</code>: {String(n.from)} → {String(n.to)}
                <br />
                <span style={{ color: 'var(--text-dim)' }}>{n.reason}</span>
              </li>
            ))}
          </ul>
        </SectionBox>
      )}

      {/* MESSAGES */}
      {pipeline.evaluationResult.messages.length > 0 && (
        <SectionBox title="规则消息与兼容性检查">
          {pipeline.evaluationResult.messages.map((msg, i) => (
            <div
              key={i}
              style={{
                padding: '6px 12px',
                marginBottom: 4,
                borderLeft: `3px solid ${
                  msg.severity === 'error'
                    ? 'var(--error)'
                    : msg.severity === 'warning'
                    ? 'var(--warning)'
                    : 'var(--info)'
                }`,
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius)',
                fontSize: 13,
              }}
            >
              <strong style={{ textTransform: 'uppercase', fontSize: 11 }}>
                {msg.severity}
              </strong>{' '}
              {msg.code}
              {msg.originIds.length > 0 && (
                <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>
                  {' '}
                  [{msg.originIds.join(', ')}]
                </span>
              )}
            </div>
          ))}
        </SectionBox>
      )}

      {/* COMMAND AST */}
      <SectionBox title="Command AST（结构化命令）">
        <pre style={{ fontSize: 11, maxHeight: 300, overflowY: 'auto' }}>
          {JSON.stringify(
            pipeline.commandPlan.invocations.map((inv) => ({
              executable: inv.executable,
              purpose: inv.purpose,
              globalArgs: inv.globalArgs.map((a) => ({ id: a.id, tokens: a.tokens, originId: a.originId })),
              outputArgs: [
                ...inv.output.codecArgs,
                ...inv.output.qualityArgs,
                ...inv.output.filterArgs,
                ...inv.output.audioArgs,
                ...inv.output.subtitleArgs,
              ].map((a) => ({ id: a.id, tokens: a.tokens, originId: a.originId })),
              outputPath: inv.output.path,
            })),
            null,
            2
          )}
        </pre>
      </SectionBox>

      {/* RENDERED COMMAND */}
      <SectionBox title={`渲染命令 (${config.shell.toUpperCase()})`}>
        <pre
          style={{
            fontSize: 13,
            padding: 16,
            background: '#0d1117',
            borderRadius: 'var(--radius)',
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          {pipeline.renderedCommand.text}
        </pre>
        {pipeline.hasErrors && (
          <div
            style={{
              marginTop: 8,
              padding: 8,
              background: 'rgba(255,107,107,0.15)',
              border: '1px solid var(--error)',
              borderRadius: 'var(--radius)',
              fontSize: 12,
              color: 'var(--error)',
            }}
          >
            ⚠ 命令包含错误，不保证可执行。仅用于调试理解冲突来源。
          </div>
        )}
      </SectionBox>

      {/* EXPLANATION */}
      {selectedExplanation && (
        <SectionBox title={`参数解释: ${selectedExplanation.title}`}>
          <p style={{ fontSize: 13 }}>{selectedExplanation.short}</p>
          {selectedExplanation.detail && (
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>
              {selectedExplanation.detail}
            </p>
          )}
          {selectedExplanation.effects && (
            <div style={{ marginTop: 8, fontSize: 12, display: 'flex', gap: 16 }}>
              <EffectBar label="画质" value={selectedExplanation.effects.quality ?? 0} />
              <EffectBar label="文件大小" value={selectedExplanation.effects.fileSize ?? 0} />
              <EffectBar label="速度" value={selectedExplanation.effects.speed ?? 0} />
              <EffectBar label="兼容性" value={selectedExplanation.effects.compatibility ?? 0} />
            </div>
          )}
        </SectionBox>
      )}

      {/* DEBUG: Field States */}
      <SectionBox title="字段状态 (fieldStates)">
        <pre style={{ fontSize: 11, maxHeight: 200, overflowY: 'auto' }}>
          {JSON.stringify(pipeline.evaluationResult.fieldStates, null, 2)}
        </pre>
      </SectionBox>

      {/* CATALOG ENTRY LINKS */}
      <SectionBox title="目录条目解释链接">
        <div style={{ fontSize: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {Object.keys(catalog.explanations)
            .slice(0, 30)
            .map((id) => (
              <button
                key={id}
                onClick={() => selectExplanation(id)}
                style={{
                  fontSize: 11,
                  padding: '3px 8px',
                  background: selectedExplanationId === id ? 'var(--accent)' : 'var(--bg-input)',
                }}
              >
                {id.replace('expl.', '')}
              </button>
            ))}
          <span style={{ color: 'var(--text-dim)' }}>
            … 共 {Object.keys(catalog.explanations).length} 条解释
          </span>
        </div>
      </SectionBox>
    </div>
  )
}

// -- helpers --------------------------------------------------

function SectionBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 16,
        marginBottom: 16,
      }}
    >
      <h3 style={{ fontSize: 14, marginBottom: 12, color: 'var(--accent)' }}>{title}</h3>
      {children}
    </div>
  )
}

function ControlGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      {label}
      {children}
    </label>
  )
}

function StatusBadge({
  label,
  count,
  color,
}: {
  label: string
  count: number
  color: string
}) {
  return (
    <span
      style={{
        padding: '4px 12px',
        background: `${color}15`,
        border: `1px solid ${color}44`,
        borderRadius: 'var(--radius)',
        fontSize: 12,
        color,
        fontWeight: 600,
      }}
    >
      {label}: {count}
    </span>
  )
}

function CapRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ color: 'var(--text-dim)' }}>{label}: </span>
      <span>{value}</span>
    </div>
  )
}

function EffectBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{label}</div>
      <div
        style={{
          width: 60,
          height: 6,
          background: 'var(--bg-input)',
          borderRadius: 3,
          marginTop: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${(value / 5) * 100}%`,
            height: '100%',
            background: value >= 4 ? 'var(--info)' : value >= 3 ? 'var(--warning)' : 'var(--text-dim)',
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  )
}
