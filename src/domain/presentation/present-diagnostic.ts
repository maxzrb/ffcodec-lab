import type { Diagnostic } from '../rules/rule-types'
import type { Locale } from '../../features/i18n/i18n'

export interface PresentedDiagnostic {
  level: string
  title: string
  explanation: string
  guidance: string
}

type Copy = Omit<PresentedDiagnostic, 'level'>

const COPY: Record<string, { 'zh-CN': Copy; en: Copy }> = {
  'error.resolution.requires.encode': {
    'zh-CN': {
      title: '复制视频流时不能修改画面',
      explanation: '分辨率、帧率、裁剪、旋转、调色、去隔行或锐化都需要解码并重新编码视频。',
      guidance: '切换为重新编码，或把全部画面处理恢复为跟随输入。',
    },
    en: {
      title: 'Picture changes require video encoding',
      explanation: 'Resolution, frame rate, crop, rotation, adjustment, deinterlacing, and sharpening cannot be applied while copying the compressed video stream.',
      guidance: 'Switch video handling to Encode, or reset all picture processing to the source values.',
    },
  },
  'error.burn.requires.encode': {
    'zh-CN': {
      title: '字幕烧录需要重新编码视频',
      explanation: '烧录会把字幕像素写入每一帧，无法在视频流 copy 模式下完成。',
      guidance: '切换为重新编码，或关闭字幕烧录并改用可切换的字幕轨道。',
    },
    en: {
      title: 'Subtitle burn-in requires video encoding',
      explanation: 'Burn-in writes subtitle pixels into every frame and therefore cannot work with video stream copy.',
      guidance: 'Switch video handling to Encode, or disable burn-in and use a selectable subtitle track.',
    },
  },
  'warn.subtitle.copy.unknown.sourcecodec': {
    'zh-CN': {
      title: '无法确认字幕复制后的容器兼容性',
      explanation: '至少一条选择 copy 的字幕轨道没有已知源编码；命令可以生成，但目标容器可能拒绝该字幕格式。',
      guidance: '先用 ffprobe 确认字幕编码，或把该轨道改为转码并选择目标容器支持的字幕编码。',
    },
    en: {
      title: 'Subtitle copy compatibility cannot be confirmed',
      explanation: 'At least one copied subtitle track has an unknown source codec. The command can run, but the target container may reject that subtitle format.',
      guidance: 'Inspect the source with ffprobe, or transcode the track to a subtitle codec supported by the target container.',
    },
  },
  'error.webm.video.incompatible': {
    'zh-CN': {
      title: 'WebM 不支持当前视频编码器',
      explanation: '当前选择会生成 WebM 容器无法封装的视频编码，FFmpeg 通常会直接报错。',
      guidance: '改用 AV1 等 WebM 支持的编码器，或切换到 MP4/MKV 等兼容容器。',
    },
    en: {
      title: 'WebM does not support the selected video encoder',
      explanation: 'The selected codec cannot be muxed into WebM and FFmpeg will normally reject the output.',
      guidance: 'Use a WebM-compatible encoder such as AV1, or switch to a compatible container such as MP4 or MKV.',
    },
  },
  'error.webm.audio.incompatible': {
    'zh-CN': {
      title: 'WebM 不支持当前音频编码器',
      explanation: '当前音频编码无法封装进 WebM，命令通常会在输出阶段失败。',
      guidance: 'WebM 建议使用 Opus，或改用支持当前音频编码的容器。',
    },
    en: {
      title: 'WebM does not support the selected audio encoder',
      explanation: 'The selected audio codec cannot be muxed into WebM and the command will normally fail during output.',
      guidance: 'Use Opus for WebM, or choose a container that supports the selected audio codec.',
    },
  },
  'error.compat.unsupported': {
    'zh-CN': {
      title: '编码器与输出容器不兼容',
      explanation: '所选容器不支持封装当前编码器的输出，命令很可能失败。',
      guidance: '切换到诊断建议中的兼容容器，或更换编码器。',
    },
    en: {
      title: 'Encoder and output container are incompatible',
      explanation: 'The selected container cannot mux this encoder output, so the command is likely to fail.',
      guidance: 'Switch to one of the suggested compatible containers, or choose another encoder.',
    },
  },
  'warn.compat.caveat': {
    'zh-CN': {
      title: '当前组合存在兼容性限制',
      explanation: '该容器可以尝试封装当前编码，但部分播放器、编辑器或平台可能无法正确识别。',
      guidance: '如果需要广泛分发，优先采用建议的完全兼容容器；否则请在目标设备上实测。',
    },
    en: {
      title: 'This combination has compatibility limitations',
      explanation: 'The container may accept the codec, but some players, editors, or services may not handle it correctly.',
      guidance: 'For broad distribution, prefer a fully supported container from the suggestions; otherwise test on the target devices.',
    },
  },
  'warn.compat.unknown': {
    'zh-CN': {
      title: '当前组合的兼容性未知',
      explanation: '目录中没有足够信息确认该容器能否可靠封装当前编码。',
      guidance: '优先切换到已确认支持的容器，或先用短样片验证 FFmpeg 与目标播放器。',
    },
    en: {
      title: 'Compatibility is unknown',
      explanation: 'The catalog does not have enough information to confirm reliable muxing for this codec and container.',
      guidance: 'Prefer a confirmed container, or test a short sample with FFmpeg and the target player first.',
    },
  },
  'info.compat.transcode': {
    'zh-CN': {
      title: '建议转码以提高兼容性',
      explanation: '当前组合可能工作，但转为目标容器常用的编码更稳妥。',
      guidance: '面向公开分发或长期存档时建议更换编码；仅在已验证的工作流中保留当前组合。',
    },
    en: {
      title: 'Transcoding is recommended for compatibility',
      explanation: 'The combination may work, but a codec commonly used by the target container is safer.',
      guidance: 'Change the codec for public distribution or long-term storage; keep this combination only in a tested workflow.',
    },
  },
  'error.unknown.container': {
    'zh-CN': {
      title: '无法识别输出容器',
      explanation: '配置引用了目录中不存在的容器，无法可靠生成输出参数。',
      guidance: '重新选择输出容器，或恢复默认配置。',
    },
    en: {
      title: 'Unknown output container',
      explanation: 'The configuration references a container that is not present in the catalog, so output arguments cannot be generated reliably.',
      guidance: 'Select an output container again, or restore the default configuration.',
    },
  },
}

export function presentDiagnostic(diagnostic: Diagnostic, locale: Locale): PresentedDiagnostic {
  const level = locale === 'zh-CN'
    ? diagnostic.severity === 'error' ? '错误' : diagnostic.severity === 'warning' ? '警告' : '提示'
    : diagnostic.severity === 'error' ? 'Error' : diagnostic.severity === 'warning' ? 'Warning' : 'Info'
  const copy = COPY[diagnostic.code]?.[locale]
  if (copy) return { level, ...copy }

  return locale === 'zh-CN'
    ? {
        level,
        title: '配置诊断',
        explanation: diagnostic.message || diagnostic.code,
        guidance: '请检查受影响参数；若问题持续存在，可恢复默认值后重新配置。',
      }
    : {
        level,
        title: 'Configuration diagnostic',
        explanation: diagnostic.message || diagnostic.code,
        guidance: 'Review the affected fields. If the issue persists, reset them to defaults and configure again.',
      }
}
