import type { ParameterDefinition } from '../../domain/catalog/catalog-types'

/**
 * Parameter registry — shared parameters visible across config sections.
 * Encoder-specific controls live inside encoder definitions.
 */
export const parameters: Record<string, ParameterDefinition> = {
  // -- shell type ------------------------------------------------
  'param.shell': {
    id: 'param.shell',
    label: '命令环境',
    group: 'output',
    control: 'select',
    optionsSource: {
      type: 'static',
      options: [
        { value: 'bash', label: 'Bash / Zsh' },
        { value: 'powershell', label: 'PowerShell' },
        { value: 'cmd', label: 'Windows CMD' },
      ],
    },
    defaultValue: 'bash',
    explanationId: 'expl.param.shell',
    sourceRefs: [
      {
        repository: 'manual-note',
        snapshotDate: '2026-07-10',
        file: 'docs/Codex_FFmpeg命令生成器_项目指令集.md',
        sourceType: 'manual-note',
        note: '本项目新增参数，FFmpegFreeUI 无此功能',
      },
    ],
    sourceAuthority: 'unknown',
    verificationLevel: 'project-derived',
    needsCrossVerification: false,
    status: 'verified',
  },

  // -- container ------------------------------------------------
  'param.container': {
    id: 'param.container',
    label: '输出容器',
    group: 'output',
    control: 'select',
    optionsSource: {
      type: 'dynamic',
      resolverId: 'resolver.containerList',
    },
    defaultValue: 'mp4',
    explanationId: 'expl.param.container',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/panels/output-settings.js',
        symbol: 'containerSelect',
        sourceType: 'ffmpegfreeui',
      },
    ],
    sourceAuthority: 'ffmpegfreeui',
    verificationLevel: 'project-derived',
    needsCrossVerification: true,
    status: 'verified',
  },

  // -- overwrite ------------------------------------------------
  'param.overwrite': {
    id: 'param.overwrite',
    label: '覆盖已有文件 (-y)',
    group: 'output',
    control: 'switch',
    commandBinding: {
      argName: '-y',
      prefix: '-y',
      compact: true,
      phase: 'GLOBAL',
    },
    defaultValue: false,
    explanationId: 'expl.param.overwrite',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/panels/output-settings.js',
        symbol: 'overwrite',
        sourceType: 'ffmpegfreeui',
      },
    ],
    sourceAuthority: 'ffmpegfreeui',
    verificationLevel: 'project-derived',
    needsCrossVerification: true,
    status: 'verified',
  },

  // -- video mode -----------------------------------------------
  'param.video.mode': {
    id: 'param.video.mode',
    label: '视频处理方式',
    group: 'video',
    control: 'select',
    optionsSource: {
      type: 'static',
      options: [
        { value: 'encode', label: '重新编码' },
        { value: 'copy', label: '复制视频流 (copy)' },
        { value: 'disabled', label: '不输出视频 (-vn)' },
      ],
    },
    defaultValue: 'encode',
    explanationId: 'expl.param.video.mode',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/panels/video-encoder.js',
        symbol: 'videoMode',
        sourceType: 'ffmpegfreeui',
      },
    ],
    sourceAuthority: 'ffmpegfreeui',
    verificationLevel: 'project-derived',
    needsCrossVerification: true,
    status: 'verified',
  },

  // -- video encoder selector -----------------------------------
  'param.video.encoder': {
    id: 'param.video.encoder',
    label: '视频编码器',
    group: 'video',
    control: 'select',
    optionsSource: {
      type: 'dynamic',
      resolverId: 'resolver.videoEncoderList',
    },
    explanationId: 'expl.param.video.encoder',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/panels/video-encoder.js',
        symbol: 'encoderSelect',
        sourceType: 'ffmpegfreeui',
      },
    ],
    sourceAuthority: 'ffmpegfreeui',
    verificationLevel: 'project-derived',
    needsCrossVerification: true,
    status: 'verified',
  },

  // -- audio mode -----------------------------------------------
  'param.audio.mode': {
    id: 'param.audio.mode',
    label: '音频处理方式',
    group: 'audio',
    control: 'select',
    optionsSource: {
      type: 'static',
      options: [
        { value: 'encode', label: '重新编码' },
        { value: 'copy', label: '复制音频流 (copy)' },
        { value: 'disabled', label: '不输出音频 (-an)' },
      ],
    },
    defaultValue: 'encode',
    explanationId: 'expl.param.audio.mode',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/panels/audio-encoder.js',
        symbol: 'audioMode',
        sourceType: 'ffmpegfreeui',
      },
    ],
    sourceAuthority: 'ffmpegfreeui',
    verificationLevel: 'project-derived',
    needsCrossVerification: true,
    status: 'verified',
  },

  // -- audio encoder selector -----------------------------------
  'param.audio.encoder': {
    id: 'param.audio.encoder',
    label: '音频编码器',
    group: 'audio',
    control: 'select',
    optionsSource: {
      type: 'dynamic',
      resolverId: 'resolver.audioEncoderList',
    },
    explanationId: 'expl.param.audio.encoder',
    sourceRefs: [
      {
        repository: 'Lake1059/FFmpegFreeUI',
        branch: 'main',
        snapshotDate: '2026-07-10',
        file: 'src/panels/audio-encoder.js',
        symbol: 'audioEncoderSelect',
        sourceType: 'ffmpegfreeui',
      },
    ],
    sourceAuthority: 'ffmpegfreeui',
    verificationLevel: 'project-derived',
    needsCrossVerification: true,
    status: 'verified',
  },
}
