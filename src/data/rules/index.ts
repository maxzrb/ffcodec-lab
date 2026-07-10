import type { RuleDefinition } from '../../domain/rules/rule-types'

/**
 * Built-in rule set covering the first-version required rules (R01–R17).
 * Each rule has a source reference tracing back to the FFmpegFreeUI document.
 */
export const builtinRules: RuleDefinition[] = [
  // R01: video copy → disable quality, preset, profile, tune, pix_fmt, resolution, framerate, burn
  {
    id: 'R01.video.copy.disable',
    priority: 100,
    when: { op: 'eq', path: 'video.mode', value: 'copy' },
    effects: [
      { type: 'hide', target: 'section.video.quality', reasonId: 'reason.video.copy' },
      { type: 'hide', target: 'section.video.preset', reasonId: 'reason.video.copy' },
      { type: 'hide', target: 'section.video.profile', reasonId: 'reason.video.copy' },
      { type: 'hide', target: 'section.video.tune', reasonId: 'reason.video.copy' },
      { type: 'hide', target: 'section.video.pixfmt', reasonId: 'reason.video.copy' },
      { type: 'hide', target: 'section.frame', reasonId: 'reason.video.copy' },
      { type: 'hide', target: 'section.subtitle.burn', reasonId: 'reason.video.copy' },
    ],
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'FFmpegFreeUI_参数树与网页首版裁剪方案.md',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // R02: video disabled → hide all video params and burn
  {
    id: 'R02.video.disabled.hide',
    priority: 100,
    when: { op: 'eq', path: 'video.mode', value: 'disabled' },
    effects: [
      { type: 'hide', target: 'section.video', reasonId: 'reason.video.disabled' },
      { type: 'hide', target: 'section.subtitle.burn', reasonId: 'reason.video.disabled' },
    ],
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'FFmpegFreeUI_参数树与网页首版裁剪方案.md',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // R03: audio copy → disable quality params
  {
    id: 'R03.audio.copy.disable',
    priority: 100,
    when: { op: 'eq', path: 'audio.mode', value: 'copy' },
    effects: [
      { type: 'hide', target: 'section.audio.quality', reasonId: 'reason.audio.copy' },
      { type: 'hide', target: 'section.audio.channel', reasonId: 'reason.audio.copy' },
      { type: 'hide', target: 'section.audio.samplerate', reasonId: 'reason.audio.copy' },
    ],
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'FFmpegFreeUI_参数树与网页首版裁剪方案.md',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // R04: audio disabled → hide all audio
  {
    id: 'R04.audio.disabled.hide',
    priority: 100,
    when: { op: 'eq', path: 'audio.mode', value: 'disabled' },
    effects: [
      { type: 'hide', target: 'section.audio', reasonId: 'reason.audio.disabled' },
    ],
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'FFmpegFreeUI_参数树与网页首版裁剪方案.md',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // R07: modifying resolution with copy → conflict
  {
    id: 'R07.resolution.vs.copy',
    priority: 90,
    when: {
      op: 'all',
      rules: [
        { op: 'eq', path: 'video.mode', value: 'copy' },
        {
          op: 'any',
          rules: [
            { op: 'neq', path: 'frame.resolution.mode', value: 'source' },
            { op: 'neq', path: 'frame.frameRate.mode', value: 'source' },
          ],
        },
      ],
    },
    effects: [
      {
        type: 'error',
        messageId: 'error.resolution.requires.encode',
        targets: ['frame.resolution', 'video.mode'],
      },
    ],
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'FFmpegFreeUI_参数树与网页首版裁剪方案.md',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // R08: subtitle burn with copy → conflict
  {
    id: 'R08.burn.vs.copy',
    priority: 90,
    when: {
      op: 'all',
      rules: [
        { op: 'eq', path: 'video.mode', value: 'copy' },
        { op: 'eq', path: 'subtitle.burn.enabled', value: true },
      ],
    },
    effects: [
      {
        type: 'error',
        messageId: 'error.burn.requires.encode',
        targets: ['subtitle.burn', 'video.mode'],
      },
    ],
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'FFmpegFreeUI_参数树与网页首版裁剪方案.md',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // R12: mp4/mov → auto subtitle → mov_text
  {
    id: 'R12.mp4.subtitle.movtext',
    priority: 50,
    when: {
      op: 'in',
      path: 'output.containerId',
      values: ['mp4', 'mov'],
    },
    effects: [
      {
        type: 'resolveAuto',
        target: 'subtitle.mux.codecMode',
        resolverId: 'resolver.subtitle.mp4',
      },
      {
        type: 'suggest',
        messageId: 'suggest.subtitle.movtext',
      },
    ],
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'FFmpegFreeUI_参数树与网页首版裁剪方案.md',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // R13: webm → auto subtitle → webvtt
  {
    id: 'R13.webm.subtitle.webvtt',
    priority: 50,
    when: { op: 'eq', path: 'output.containerId', value: 'webm' },
    effects: [
      { type: 'resolveAuto', target: 'subtitle.mux.codecMode', resolverId: 'resolver.subtitle.webm' },
      { type: 'suggest', messageId: 'suggest.subtitle.webvtt' },
    ],
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'FFmpegFreeUI_参数树与网页首版裁剪方案.md',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // R05: encoder change → clear invalid
  {
    id: 'R05.encoder.change.clear',
    priority: 80,
    when: { op: 'exists', path: 'video.encoderId' },
    effects: [
      { type: 'clearInvalid', target: 'video.preset', reasonId: 'reason.encoder.changed' },
      { type: 'clearInvalid', target: 'video.profile', reasonId: 'reason.encoder.changed' },
      { type: 'clearInvalid', target: 'video.tune', reasonId: 'reason.encoder.changed' },
      { type: 'clearInvalid', target: 'video.pixelFormat', reasonId: 'reason.encoder.changed' },
    ],
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'FFmpegFreeUI_参数树与网页首版裁剪方案.md',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // R06: quality mode change → hide other modes' controls
  {
    id: 'R06.quality.mode.exclusive',
    priority: 80,
    when: { op: 'exists', path: 'video.rateControl.mode' },
    effects: [
      { type: 'clearInvalid', target: 'video.rateControl', reasonId: 'reason.quality.mode.changed' },
    ],
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'FFmpegFreeUI_参数树与网页首版裁剪方案.md',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // R15: explicit incompatible combo → error
  {
    id: 'R15.incompatible.combo',
    priority: 70,
    when: {
      op: 'all',
      rules: [
        { op: 'eq', path: 'output.containerId', value: 'webm' },
        { op: 'in', path: 'video.encoderId', values: ['libx264', 'libx265'] },
      ],
    },
    effects: [
      {
        type: 'error',
        messageId: 'error.webm.video.incompatible',
        targets: ['output.containerId', 'video.encoderId'],
      },
    ],
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'FFmpegFreeUI_参数树与网页首版裁剪方案.md',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },

  // WebM + AAC = unsupported combo
  {
    id: 'R15b.webm.aac.incompatible',
    priority: 70,
    when: {
      op: 'all',
      rules: [
        { op: 'eq', path: 'output.containerId', value: 'webm' },
        { op: 'eq', path: 'audio.encoderId', value: 'aac' },
        { op: 'eq', path: 'audio.mode', value: 'encode' },
      ],
    },
    effects: [
      {
        type: 'error',
        messageId: 'error.webm.audio.incompatible',
        targets: ['output.containerId', 'audio.encoderId'],
      },
    ],
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'FFmpegFreeUI_参数树与网页首版裁剪方案.md',
        sourceType: 'ffmpegfreeui',
      },
    ],
  },
]
